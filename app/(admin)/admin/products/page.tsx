import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOfferAnnouncementEmail } from "@/lib/mailer";
import { uploadProductImage } from "@/lib/product-image";
import { deleteProductImages } from "@/lib/s3-utils";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 6;

type ActionState = {
  type: "success" | "error";
  message: string;
};

async function notifyCustomersAboutProductUpdate(input: {
  subject: string;
  heading: string;
  message: string;
}) {
  try {
    const recipients = await prisma.user.findMany({
      where: { role: UserRole.CUSTOMER },
      select: { email: true },
    });

    const recipientEmails = recipients.map((u) => u.email).filter(Boolean);
    if (recipientEmails.length === 0) return;

    await sendOfferAnnouncementEmail({
      recipients: recipientEmails,
      subject: input.subject,
      heading: input.heading,
      message: input.message,
    });
  } catch (error) {
    console.error("Failed to send product update notifications", error);
  }
}

/**
 * Resolve product image URL from either uploaded file or input URL
 * @param formData - Form data containing imageUrl or imageFile
 * @param productId - Product ID for S3 folder organization (required for S3)
 * @returns Image URL or null
 */
async function resolveProductImageUrl(formData: FormData, productId?: string): Promise<string | null> {
  const inputUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageFile = formData.get("imageFile");

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      // Generate a temporary ID if not provided (for new products)
      const uploadId = productId || randomUUID();
      return await uploadProductImage(imageFile, uploadId);
    } catch (error) {
      console.error("Image upload failed", error);
      throw new Error("Failed to upload product image.");
    }
  }

  return inputUrl || null;
}

function buildRedirect(params: {
  q?: string;
  page?: number;
  status?: "success" | "error";
  message?: string;
}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  if (params.status) sp.set("status", params.status);
  if (params.message) sp.set("message", params.message);
  const qs = sp.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

async function createProduct(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const priceInRupees = Number(formData.get("price") ?? 0);
  const stock = Number(formData.get("stock") ?? 0);
  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (
    !name ||
    !slug ||
    !description ||
    !sku ||
    !categoryId ||
    !Number.isFinite(priceInRupees) ||
    priceInRupees <= 0
  ) {
    redirect(buildRedirect({ status: "error", message: "Please fill all required fields correctly." }));
  }

  try {
    // Generate a temporary ID for image upload (will be used for S3 folder)
    const tempProductId = randomUUID();
    const imageUrl = await resolveProductImageUrl(formData, tempProductId);

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        sku,
        basePrice: Math.round(priceInRupees * 100),
        stock: Number.isFinite(stock) ? Math.max(0, Math.round(stock)) : 0,
        categoryId,
        imageUrl,
        isActive: true,
      },
    });

    await notifyCustomersAboutProductUpdate({
      subject: `New Arrival: ${name}`,
      heading: "A new product has arrived",
      message: `${name} is now live in our store. Explore the latest collection and grab your favorite look.`,
    });
  } catch (error) {
    console.error("Create product failed", error);
    const msg =
      error instanceof Error && error.message.includes("Unique")
        ? "Slug or SKU already exists."
        : "Could not create product. Please try again.";
    redirect(buildRedirect({ status: "error", message: msg }));
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect(buildRedirect({ status: "success", message: `${name} created successfully.` }));
}

async function updateProduct(formData: FormData) {
  "use server";

  const productId = String(formData.get("productId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const priceInRupees = Number(formData.get("price") ?? 0);
  const stock = Number(formData.get("stock") ?? 0);
  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (
    !productId ||
    !name ||
    !slug ||
    !description ||
    !sku ||
    !categoryId ||
    !Number.isFinite(priceInRupees) ||
    priceInRupees <= 0
  ) {
    redirect(buildRedirect({ status: "error", message: "Please fill all required fields correctly." }));
  }

  try {
    // Pass productId for S3 folder organization
    const imageUrl = await resolveProductImageUrl(formData, productId);

    const updateData: any = {
      name,
      slug,
      description,
      sku,
      basePrice: Math.round(priceInRupees * 100),
      stock: Number.isFinite(stock) ? Math.max(0, Math.round(stock)) : 0,
      categoryId,
    };

    // Only update image if a new one is provided
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    await notifyCustomersAboutProductUpdate({
      subject: `Updated Product: ${name}`,
      heading: "Product details updated",
      message: `${name} has fresh updates in pricing, stock, or details. Check it out in our store.`,
    });
  } catch (error) {
    console.error("Update product failed", error);
    redirect(buildRedirect({ status: "error", message: "Could not update product." }));
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect(buildRedirect({ status: "success", message: `${name} updated successfully.` }));
}

async function toggleProductStatus(formData: FormData) {
  "use server";

  const productId = String(formData.get("productId") ?? "");
  const nextValue = String(formData.get("nextValue") ?? "") === "true";
  if (!productId) return;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isActive: nextValue },
      select: { name: true },
    });

    await notifyCustomersAboutProductUpdate({
      subject: nextValue
        ? `Back in Store: ${updatedProduct.name}`
        : `Product Update: ${updatedProduct.name}`,
      heading: nextValue ? "Product is now available" : "Product availability updated",
      message: nextValue
        ? `${updatedProduct.name} is active again and ready to shop.`
        : `${updatedProduct.name} is currently unavailable. Stay tuned for upcoming offers and restocks.`,
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    redirect(
      buildRedirect({
        status: "success",
        message: nextValue ? "Product activated." : "Product deactivated.",
      })
    );
  } catch (error) {
    if ((error as { digest?: string })?.digest?.startsWith?.("NEXT_REDIRECT")) throw error;
    console.error("Toggle failed", error);
    redirect(buildRedirect({ status: "error", message: "Could not change status." }));
  }
}

async function deleteProduct(formData: FormData) {
  "use server";

  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;

  try {
    // Check if product is referenced by any orders
    const ordersWithProduct = await prisma.orderItem.findMany({
      where: { productId },
      include: {
        order: {
          select: {
            id: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      take: 5,
    });

    if (ordersWithProduct.length > 0) {
      const orderCount = await prisma.orderItem.count({
        where: { productId },
      });
      const orderIds = ordersWithProduct.map((oi) => oi.order.id);
      const orderInfo = ordersWithProduct
        .map((oi) => `#${oi.order.id.slice(-8).toUpperCase()} (${oi.order.user.name})`)
        .join(", ");

      const message =
        orderCount > 5
          ? `Product is referenced by ${orderCount} orders (including: ${orderInfo}...). Delete all associated orders first from the Orders page.`
          : `Product is referenced by ${orderCount} order${orderCount > 1 ? "s" : ""}: ${orderInfo}. Delete these orders first from the Orders page.`;

      redirect(buildRedirect({ status: "error", message }));
    }

    // Delete S3 images first
    await deleteProductImages(productId);

    const deletedProduct = await prisma.product.delete({
      where: { id: productId },
      select: { name: true },
    });

    await notifyCustomersAboutProductUpdate({
      subject: `Catalog Update from Vasireddy Designer Studio`,
      heading: "Catalog changes are live",
      message: `${deletedProduct.name} has been removed from the active catalog. Explore our latest arrivals and offers for alternatives.`,
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    redirect(buildRedirect({ status: "success", message: `${deletedProduct.name} deleted.` }));
  } catch (error) {
    if ((error as { digest?: string })?.digest?.startsWith?.("NEXT_REDIRECT")) throw error;
    console.error("Delete failed", error);
    redirect(
      buildRedirect({
        status: "error",
        message: "Could not delete product. It may be referenced by existing orders. Delete those orders first from the Orders page.",
      })
    );
  }
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    status?: string;
    message?: string;
  }>;
}) {
  const resolved = await searchParams;
  const q = resolved.q?.trim() ?? "";
  const page = Math.max(1, Number(resolved.page ?? "1") || 1);

  const actionState: ActionState | null =
    resolved.status === "success" || resolved.status === "error"
      ? { type: resolved.status, message: resolved.message ?? "" }
      : null;

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { sku: { contains: q } },
          { category: { name: { contains: q } } },
        ],
      }
    : {};

  const [categories, products, totalCount, aggregates] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.product.aggregate({
      _count: { _all: true },
      _sum: { stock: true },
    }),
  ]);

  const activeCount = await prisma.product.count({ where: { isActive: true } });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const startIndex = products.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endIndex = (page - 1) * PAGE_SIZE + products.length;

  function buildPageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `/admin/products?${query}` : "/admin/products";
  }

  return (
    <section className="py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-studio-primary sm:text-4xl">
            Product Management
          </h1>
          <p className="mt-2 text-studio-ink/75">
            Create, edit, and archive products with inventory tracking.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full border border-studio-primary/15 bg-white px-3 py-1.5 text-studio-primary">
            Total: {aggregates._count._all}
          </span>
          <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-green-700">
            Active: {activeCount}
          </span>
          <span className="rounded-full border border-studio-primary/15 bg-white px-3 py-1.5 text-studio-ink/70">
            Stock units: {aggregates._sum.stock ?? 0}
          </span>
        </div>
      </div>

      {/* Flash message */}
      {actionState && actionState.message ? (
        <div
          role="status"
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            actionState.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {actionState.message}
        </div>
      ) : null}

      {/* Search */}
      <form
        action="/admin/products"
        className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, SKU, slug, or category"
          className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm sm:max-w-md"
        />
        <button
          type="submit"
          className="rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent sm:w-auto"
        >
          Search
        </button>
        {q ? (
          <Link
            href="/admin/products"
            className="rounded-full border border-studio-primary/20 px-4 py-2 text-xs font-semibold text-studio-primary sm:w-auto"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {/* Create form */}
      <details
        className="mt-6 overflow-hidden rounded-2xl border border-studio-primary/10 bg-white shadow-[0_20px_40px_-30px_rgba(63,52,143,0.55)]"
      >
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-studio-primary">
          <span>Create New Product</span>
          <span className="text-xs text-studio-ink/55">Click to expand</span>
        </summary>
        <form
          action={createProduct}
          encType="multipart/form-data"
          className="grid gap-3 border-t border-studio-primary/10 p-4 sm:p-5 md:grid-cols-2"
        >
          <Field label="Name" required>
            <input
              name="name"
              required
              placeholder="Product name"
              className="input-base"
            />
          </Field>
          <Field label="Slug" required>
            <input
              name="slug"
              required
              placeholder="product-slug"
              pattern="[a-z0-9\\-]+"
              title="Lowercase letters, numbers, and hyphens only"
              className="input-base"
            />
          </Field>
          <Field label="SKU" required>
            <input name="sku" required placeholder="SKU" className="input-base" />
          </Field>
          <Field label="Price (INR)" required>
            <input
              name="price"
              type="number"
              min="1"
              step="1"
              required
              placeholder="Price (INR)"
              className="input-base"
            />
          </Field>
          <Field label="Stock">
            <input
              name="stock"
              type="number"
              min="0"
              defaultValue={0}
              placeholder="Stock"
              className="input-base"
            />
          </Field>
          <Field label="Category" required>
            <select name="categoryId" required className="input-base">
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Image URL (optional)" className="md:col-span-2">
            <input
              name="imageUrl"
              placeholder="https://…"
              className="input-base"
            />
          </Field>
          <Field label="Upload Image" className="md:col-span-2">
            <input
              name="imageFile"
              type="file"
              accept="image/*"
              className="input-base"
            />
          </Field>
          <Field label="Description" required className="md:col-span-2">
            <textarea
              name="description"
              required
              placeholder="Product description"
              className="input-base"
              rows={3}
            />
          </Field>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent md:w-fit"
            >
              Create Product
            </button>
          </div>
        </form>
      </details>

      {/* Empty state */}
      {!products.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-studio-primary/20 bg-white p-6 text-sm text-studio-ink/70">
          {q
            ? `No products found matching "${q}". Try a different search.`
            : "No products yet. Create your first product above."}
        </div>
      ) : null}

      {/* Product list */}
      <div className="mt-6 space-y-3">
        {products.map((product) => {
          const priceRupees = Math.round(product.basePrice / 100);
          const lowStock = product.stock > 0 && product.stock <= 5;
          const outOfStock = product.stock === 0;

          return (
            <article
              key={product.id}
              className="rounded-2xl border border-studio-primary/10 bg-white p-3 shadow-[0_16px_30px_-24px_rgba(63,52,143,0.55)] sm:p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-studio-primary/10 bg-studio-light">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-studio-ink/55">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs uppercase tracking-[0.12em] text-studio-accent">
                        {product.category.name}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          product.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                      {outOfStock ? (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                          Out of stock
                        </span>
                      ) : lowStock ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          Low stock
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-1 break-words text-base font-semibold text-studio-primary sm:text-lg">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-studio-ink/75">
                      {product.sku} · Stock {product.stock} ·{" "}
                      {formatCurrency(priceRupees)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                  <form action={toggleProductStatus}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input
                      type="hidden"
                      name="nextValue"
                      value={String(!product.isActive)}
                    />
                    <button
                      type="submit"
                      className={`w-full rounded-full px-4 py-2 text-xs font-semibold transition ${
                        product.isActive
                          ? "border border-red-200 text-red-700 hover:bg-red-50"
                          : "border border-green-200 text-green-700 hover:bg-green-50"
                      }`}
                    >
                      {product.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                  <form action={deleteProduct}>
                    <input type="hidden" name="productId" value={product.id} />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>

              {/* Edit */}
              <details className="mt-4 rounded-xl border border-studio-primary/10 bg-studio-light/35 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-studio-primary">
                  Edit Product
                </summary>
                <form
                  action={updateProduct}
                  encType="multipart/form-data"
                  className="mt-3 grid gap-3 md:grid-cols-2"
                >
                  <input type="hidden" name="productId" value={product.id} />
                  <Field label="Name">
                    <input
                      name="name"
                      required
                      defaultValue={product.name}
                      className="input-base"
                    />
                  </Field>
                  <Field label="Slug">
                    <input
                      name="slug"
                      required
                      defaultValue={product.slug}
                      pattern="[a-z0-9\\-]+"
                      className="input-base"
                    />
                  </Field>
                  <Field label="SKU">
                    <input
                      name="sku"
                      required
                      defaultValue={product.sku}
                      className="input-base"
                    />
                  </Field>
                  <Field label="Price (INR)">
                    <input
                      name="price"
                      required
                      type="number"
                      min="1"
                      defaultValue={priceRupees}
                      className="input-base"
                    />
                  </Field>
                  <Field label="Stock">
                    <input
                      name="stock"
                      type="number"
                      min="0"
                      defaultValue={product.stock}
                      className="input-base"
                    />
                  </Field>
                  <Field label="Category">
                    <select
                      name="categoryId"
                      required
                      defaultValue={product.categoryId}
                      className="input-base"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Image URL" className="md:col-span-2">
                    <input
                      name="imageUrl"
                      defaultValue={product.imageUrl ?? ""}
                      placeholder="Image URL"
                      className="input-base"
                    />
                  </Field>
                  <Field label="Upload Image" className="md:col-span-2">
                    <input
                      name="imageFile"
                      type="file"
                      accept="image/*"
                      className="input-base"
                    />
                  </Field>
                  <Field label="Description" className="md:col-span-2">
                    <textarea
                      name="description"
                      required
                      defaultValue={product.description}
                      rows={3}
                      className="input-base"
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent md:w-fit"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </details>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-studio-primary/10 bg-white px-4 py-3 shadow-[0_16px_30px_-26px_rgba(63,52,143,0.45)]">
        <p className="text-sm text-studio-ink/70">
          Showing {startIndex}-{endIndex} of {totalCount}
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={buildPageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              page <= 1
                ? "pointer-events-none cursor-not-allowed border border-studio-primary/10 text-studio-ink/35"
                : "border border-studio-primary/20 text-studio-primary hover:bg-studio-primary/5"
            }`}
          >
            Prev
          </Link>
          <span className="text-xs font-semibold text-studio-ink/65">
            Page {page} / {totalPages}
          </span>
          <Link
            href={buildPageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              page >= totalPages
                ? "pointer-events-none cursor-not-allowed border border-studio-primary/10 text-studio-ink/35"
                : "border border-studio-primary/20 text-studio-primary hover:bg-studio-primary/5"
            }`}
          >
            Next
          </Link>
        </div>
      </div>

      {/* Shared styles for form inputs */}
      <style>{`
        .input-base {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(63, 52, 143, 0.15);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          background: #fff;
        }
        .input-base:focus {
          outline: none;
          border-color: rgba(63, 52, 143, 0.45);
          box-shadow: 0 0 0 3px rgba(63, 52, 143, 0.12);
        }
      `}</style>
    </section>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-studio-ink/60 ${
        className ?? ""
      }`}
    >
      <span>
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </span>
      <span className="font-normal normal-case tracking-normal">{children}</span>
    </label>
  );
}