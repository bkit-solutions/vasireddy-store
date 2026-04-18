import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// ── Server Actions ────────────────────────────────────────────────────────────

async function createCategory(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  if (!name) return;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const existing = await prisma.category.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  await prisma.category.create({ data: { name, slug: finalSlug, parentId } });
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/collections");
}

async function renameCategory(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  await prisma.category.update({ where: { id }, data: { name } });
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/collections");
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
        <form action={createCategory} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            name="name"
            required
            placeholder="Category name"
            className="rounded-xl border border-studio-primary/15 px-3 py-2 text-sm focus:border-studio-primary focus:outline-none"
          />
          <select
            name="parentId"
            className="rounded-xl border border-studio-primary/15 px-3 py-2 text-sm focus:border-studio-primary focus:outline-none"
          >
            <option value="">— No parent (top-level) —</option>
            {parents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-studio-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-studio-accent"
          >
            Add
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

                <div className="flex flex-wrap items-center gap-2">
                  <form action={renameCategory} className="flex gap-2">
                    <input type="hidden" name="id" value={parent.id} />
                    <input
                      name="name"
                      required
                      defaultValue={parent.name}
                      className="w-44 rounded-lg border border-studio-primary/15 px-2 py-1.5 text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded-lg border border-studio-primary/20 px-3 py-1.5 text-xs font-semibold text-studio-primary hover:bg-studio-light"
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
                        <div className="flex flex-wrap items-center gap-2">
                          <form action={renameCategory} className="flex gap-2">
                            <input type="hidden" name="id" value={child.id} />
                            <input
                              name="name"
                              required
                              defaultValue={child.name}
                              className="w-40 rounded-lg border border-studio-primary/15 px-2 py-1.5 text-sm"
                            />
                            <button
                              type="submit"
                              className="rounded-lg border border-studio-primary/20 px-3 py-1.5 text-xs font-semibold text-studio-primary hover:bg-studio-light"
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