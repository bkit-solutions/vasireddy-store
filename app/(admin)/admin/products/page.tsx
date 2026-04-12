import Link from "next/link";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendOfferAnnouncementEmail } from "@/lib/mailer";
import { uploadProductImage } from "@/lib/product-image";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 6;

async function notifyCustomersAboutProductUpdate(input: { subject: string; heading: string; message: string }) {
  try {
    const recipients = await prisma.user.findMany({
      where: { role: UserRole.CUSTOMER },
      select: { email: true },
    });

    const recipientEmails = recipients.map((user) => user.email).filter(Boolean);
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

async function resolveProductImageUrl(formData: FormData) {
  const inputUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageFile = formData.get("imageFile");

  if (imageFile instanceof File && imageFile.size > 0) {
    return uploadProductImage(imageFile);
  }

  return inputUrl || null;
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
  const imageUrl = await resolveProductImageUrl(formData);

  if (!name || !slug || !description || !sku || !categoryId || !Number.isFinite(priceInRupees) || priceInRupees <= 0) {
    return;
  }

  await prisma.product.create({
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

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
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
  const imageUrl = await resolveProductImageUrl(formData);

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
    return;
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      slug,
      description,
      sku,
      basePrice: Math.round(priceInRupees * 100),
      stock: Number.isFinite(stock) ? Math.max(0, Math.round(stock)) : 0,
      categoryId,
      imageUrl,
    },
  });

  await notifyCustomersAboutProductUpdate({
    subject: `Updated Product: ${name}`,
    heading: "Product details updated",
    message: `${name} has fresh updates in pricing, stock, or details. Check it out in our store.`,
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

async function toggleProductStatus(formData: FormData) {
  "use server";

  const productId = String(formData.get("productId") ?? "");
  const nextValue = String(formData.get("nextValue") ?? "") === "true";
  if (!productId) return;

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: { isActive: nextValue },
    select: {
      name: true,
    },
  });

  await notifyCustomersAboutProductUpdate({
    subject: nextValue ? `Back in Store: ${updatedProduct.name}` : `Product Update: ${updatedProduct.name}`,
    heading: nextValue ? "Product is now available" : "Product availability updated",
    message: nextValue
      ? `${updatedProduct.name} is active again and ready to shop.`
      : `${updatedProduct.name} is currently unavailable. Stay tuned for upcoming offers and restocks.`,
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

async function deleteProduct(formData: FormData) {
  "use server";

  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;

  const deletedProduct = await prisma.product.delete({
    where: { id: productId },
    select: {
      name: true,
    },
  });

  await notifyCustomersAboutProductUpdate({
    subject: `Catalog Update from Vasireddy Designer Studio`,
    heading: "Catalog changes are live",
    message: `${deletedProduct.name} has been removed from the active catalog. Explore our latest arrivals and offers for alternatives.`,
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(resolvedSearchParams.page ?? "1") || 1);
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

  const [categories, products, totalCount] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function buildPageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `/admin/products?${query}` : "/admin/products";
  }

  return (
    <section className="py-2 sm:py-4">
      <h1 className="text-3xl font-semibold text-studio-primary sm:text-4xl">Product Management</h1>
      <p className="mt-3 text-studio-ink/75">Create, edit, and archive products with inventory tracking.</p>

      <form action="/admin/products" className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, SKU, slug, or category"
          className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm sm:max-w-md"
        />
        <button type="submit" className="rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent sm:w-auto">
          Search
        </button>
        {q ? (
          <Link href="/admin/products" className="rounded-full border border-studio-primary/20 px-4 py-2 text-xs font-semibold text-studio-primary sm:w-auto">
            Clear
          </Link>
        ) : null}
      </form>

      <details className="mt-6 overflow-hidden rounded-2xl border border-studio-primary/10 bg-white shadow-[0_20px_40px_-30px_rgba(63,52,143,0.55)]" open>
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-studio-primary">Create New Product</summary>
        <form action={createProduct} className="grid gap-3 border-t border-studio-primary/10 p-4 sm:p-5 md:grid-cols-2">
          <input name="name" required placeholder="Product name" className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm" />
          <input name="slug" required placeholder="product-slug" className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm" />
          <input name="sku" required placeholder="SKU" className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm" />
          <input
            name="price"
            type="number"
            min="1"
            required
            placeholder="Price (INR)"
            className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm"
          />
          <input name="stock" type="number" min="0" placeholder="Stock" className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm" />
          <select name="categoryId" required className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm">
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input name="imageUrl" placeholder="Image URL (optional)" className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm md:col-span-2" />
          <input name="imageFile" type="file" accept="image/*" className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm md:col-span-2" />
          <textarea
            name="description"
            required
            placeholder="Product description"
            className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm md:col-span-2"
            rows={3}
          />
          <button type="submit" className="w-full rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent md:col-span-2 md:w-fit">
            Create Product
          </button>
        </form>
      </details>

      {!products.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-studio-primary/20 bg-white p-6 text-sm text-studio-ink/70">
          No products found for the current filter.
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {products.map((product) => (
          <article key={product.id} className="rounded-2xl border border-studio-primary/10 bg-white p-3 shadow-[0_16px_30px_-24px_rgba(63,52,143,0.55)] sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-studio-primary/10 bg-studio-light">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-studio-ink/55">No image</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.12em] text-studio-accent">{product.category.name}</p>
                  <h3 className="mt-1 break-words text-base font-semibold text-studio-primary sm:text-lg">{product.name}</h3>
                  <p className="mt-1 text-sm text-studio-ink/75">
                    {product.sku} · Stock {product.stock} · {formatCurrency(Math.round(product.basePrice / 100))}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                <form action={toggleProductStatus}>
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="nextValue" value={String(!product.isActive)} />
                  <button
                    type="submit"
                    className={`w-full rounded-full px-4 py-2 text-xs font-semibold ${
                      product.isActive
                        ? "border border-red-200 text-red-700"
                        : "border border-green-200 text-green-700"
                    }`}
                  >
                    {product.isActive ? "Deactivate" : "Activate"}
                  </button>
                </form>
                <form action={deleteProduct}>
                  <input type="hidden" name="productId" value={product.id} />
                  <button type="submit" className="w-full rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700">
                    Delete
                  </button>
                </form>
              </div>
            </div>

            <details className="mt-4 rounded-xl border border-studio-primary/10 bg-studio-light/35 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-studio-primary">Edit Product</summary>
              <form action={updateProduct} className="mt-3 grid gap-3 md:grid-cols-2">
                <input type="hidden" name="productId" value={product.id} />
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-studio-ink/60">
                  Name
                  <input name="name" required defaultValue={product.name} className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm font-normal normal-case tracking-normal" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-studio-ink/60">
                  Slug
                  <input name="slug" required defaultValue={product.slug} className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm font-normal normal-case tracking-normal" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-studio-ink/60">
                  SKU
                  <input name="sku" required defaultValue={product.sku} className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm font-normal normal-case tracking-normal" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-studio-ink/60">
                  Price (INR)
                  <input
                    name="price"
                    required
                    type="number"
                    min="1"
                    defaultValue={Math.round(product.basePrice / 100)}
                    className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm font-normal normal-case tracking-normal"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-studio-ink/60">
                  Stock
                  <input name="stock" type="number" min="0" defaultValue={product.stock} className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm font-normal normal-case tracking-normal" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-studio-ink/60">
                  Category
                  <select name="categoryId" required defaultValue={product.categoryId} className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm font-normal normal-case tracking-normal">
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-studio-ink/60 md:col-span-2">
                  Image URL
                  <input
                    name="imageUrl"
                    defaultValue={product.imageUrl ?? ""}
                    placeholder="Image URL"
                    className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm font-normal normal-case tracking-normal"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-studio-ink/60 md:col-span-2">
                  Upload Image
                  <input name="imageFile" type="file" accept="image/*" className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm font-normal normal-case tracking-normal" />
                </label>
                <textarea
                  name="description"
                  required
                  defaultValue={product.description}
                  rows={3}
                  className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm md:col-span-2"
                />
                <button type="submit" className="w-full rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent md:w-fit">
                  Save Changes
                </button>
              </form>
            </details>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-studio-primary/10 bg-white px-4 py-3 shadow-[0_16px_30px_-26px_rgba(63,52,143,0.45)]">
        <p className="text-sm text-studio-ink/70">
          Showing {(page - 1) * PAGE_SIZE + (products.length ? 1 : 0)}-{(page - 1) * PAGE_SIZE + products.length} of {totalCount}
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={buildPageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              page <= 1 ? "cursor-not-allowed border border-studio-primary/10 text-studio-ink/35" : "border border-studio-primary/20 text-studio-primary"
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
              page >= totalPages ? "cursor-not-allowed border border-studio-primary/10 text-studio-ink/35" : "border border-studio-primary/20 text-studio-primary"
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </section>
  );
}
