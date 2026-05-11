import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { uploadProductImage } from "@/lib/product-image";
import { randomUUID } from "crypto";

// ── Server Actions ────────────────────────────────────────────────────────────

async function createCategory(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  const imageFile = formData.get("imageFile");
  if (!name) return;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const existing = await prisma.category.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  let imageUrl = null;
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imageUrl = await uploadProductImage(imageFile, `cat-${randomUUID()}`);
    } catch (e) {
      console.error("Category image upload failed", e);
    }
  }

  await prisma.category.create({ data: { name, slug: finalSlug, parentId, imageUrl } });
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/collections");
  revalidatePath("/");
}

async function updateCategory(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const imageFile = formData.get("imageFile");
  if (!id || !name) return;

  const updateData: any = { name };

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      updateData.imageUrl = await uploadProductImage(imageFile, id);
    } catch (e) {
      console.error("Category image update failed", e);
    }
  }

  await prisma.category.update({ where: { id }, data: updateData });
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/collections");
  revalidatePath("/");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const category = await prisma.category.findUnique({
    where: { id },
    include: { children: true },
  });
  if (!category) return;

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0 || category.children.length > 0) return;

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/collections");
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminCategoriesPage() {
  const allCategories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true, children: true } },
    },
  });

  const parents = allCategories.filter((c) => !c.parentId);
  const categoryGroups = parents.map((parent) => ({
    parent,
    children: allCategories.filter((c) => c.parentId === parent.id),
  }));

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-studio-primary sm:text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-studio-ink/70">
            Manage parent categories and sub-categories for your storefront.
          </p>
        </div>
        <div className="text-xs text-studio-ink/60">
          <span className="font-semibold text-studio-primary">{parents.length}</span> parents ·{" "}
          <span className="font-semibold text-studio-primary">
            {allCategories.length - parents.length}
          </span>{" "}
          sub-categories
        </div>
      </div>

      {/* Create Form */}
      <div className="mt-6 rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-studio-primary">Add Category</h2>
        <p className="mt-1 text-xs text-studio-ink/60">
          Leave parent empty to create a top-level category.
        </p>
        <form action={createCategory} className="mt-4 grid gap-6 md:grid-cols-[1fr_1fr_1.5fr_auto] items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-studio-ink/40">Category Name</label>
            <input
              name="name"
              required
              placeholder="e.g. Bridal Wear"
              className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm focus:border-studio-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-studio-ink/40">Parent Category</label>
            <select
              name="parentId"
              className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm focus:border-studio-primary focus:outline-none"
            >
              <option value="">— No parent —</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-studio-ink/40">Cover Image</label>
            <input
              type="file"
              name="imageFile"
              accept="image/*"
              className="w-full text-xs text-studio-ink/50 file:mr-3 file:rounded-full file:border-0 file:bg-studio-primary/10 file:px-3 file:py-1.5 file:text-[10px] file:font-bold file:uppercase file:text-studio-primary"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-studio-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-studio-accent"
          >
            Create
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="mt-6 space-y-3">
        {categoryGroups.map(({ parent, children }) => {
          const canDeleteParent = parent._count.products === 0 && children.length === 0;

          return (
            <div
              key={parent.id}
              className="overflow-hidden rounded-2xl border border-studio-primary/10 bg-white shadow-sm"
            >
              {/* Parent Row */}
              <div className="flex flex-col gap-3 border-b border-studio-primary/10 bg-studio-light/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-studio-primary/10 text-studio-primary">
                    📁
                  </span>
                  <div>
                    <p className="text-base font-semibold text-studio-primary">{parent.name}</p>
                    <p className="text-xs text-studio-ink/55">
                      {children.length} sub · {parent._count.products} products
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <form action={updateCategory} className="flex flex-wrap items-center gap-4">
                    <input type="hidden" name="id" value={parent.id} />
                    <input
                      name="name"
                      required
                      defaultValue={parent.name}
                      className="w-40 rounded-lg border border-studio-primary/15 px-2 py-1.5 text-sm"
                    />
                    <input
                      type="file"
                      name="imageFile"
                      accept="image/*"
                      className="w-48 text-[10px] text-studio-ink/40 file:mr-2 file:rounded file:border-0 file:bg-studio-primary/5 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-studio-primary"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-studio-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-studio-accent"
                    >
                      Save
                    </button>
                  </form>
                  {canDeleteParent ? (
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={parent.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </form>
                  ) : (
                    <span
                      title="Remove sub-categories and products first"
                      className="rounded-lg border border-studio-ink/10 px-3 py-1.5 text-xs text-studio-ink/40"
                    >
                      Locked
                    </span>
                  )}
                </div>
              </div>

              {/* Children Rows */}
              {children.length === 0 ? (
                <div className="px-4 py-4 text-xs text-studio-ink/45 sm:px-5">
                  No sub-categories yet.
                </div>
              ) : (
                <ul className="divide-y divide-studio-primary/5">
                  {children.map((child) => {
                    const canDeleteChild = child._count.products === 0;
                    return (
                      <li
                        key={child.id}
                        className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-studio-ink/30">└─</span>
                          <div>
                            <p className="text-sm font-medium text-studio-ink">{child.name}</p>
                            <p className="text-xs text-studio-ink/50">
                              {child._count.products} product
                              {child._count.products === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <form action={updateCategory} className="flex flex-wrap items-center gap-4">
                            <input type="hidden" name="id" value={child.id} />
                            <input
                              name="name"
                              required
                              defaultValue={child.name}
                              className="w-36 rounded-lg border border-studio-primary/15 px-2 py-1.5 text-sm"
                            />
                            <input
                              type="file"
                              name="imageFile"
                              accept="image/*"
                              className="w-44 text-[10px] text-studio-ink/40 file:mr-2 file:rounded file:border-0 file:bg-studio-primary/5 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-studio-primary"
                            />
                            <button
                              type="submit"
                              className="rounded-lg bg-studio-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-studio-accent"
                            >
                              Save
                            </button>
                          </form>
                          {canDeleteChild ? (
                            <form action={deleteCategory}>
                              <input type="hidden" name="id" value={child.id} />
                              <button
                                type="submit"
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </form>
                          ) : (
                            <span
                              title="Reassign products first"
                              className="rounded-lg border border-studio-ink/10 px-3 py-1.5 text-xs text-studio-ink/40"
                            >
                              Locked
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {parents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-studio-primary/20 bg-white p-8 text-center text-sm text-studio-ink/60">
            No categories yet. Create your first one above.
          </div>
        ) : null}
      </div>
    </section>
  );
}