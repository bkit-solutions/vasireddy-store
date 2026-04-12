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
  // Ensure slug uniqueness by appending timestamp if needed
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
  // Reassign products to parent or null before deleting
  const category = await prisma.category.findUnique({
    where: { id },
    include: { children: true },
  });
  if (!category) return;
  // Cannot delete if it has products assigned
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0 || category.children.length > 0) return; // silently block
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
    children: allCategories.filter((category) => category.parentId === parent.id),
  }));
  const categoriesWithProducts = allCategories.filter((category) => category._count.products > 0).length;
  const totalSubcategories = allCategories.filter((category) => category.parentId).length;

  return (
    <section className="py-2 sm:py-4">
      <h1 className="text-3xl font-semibold text-studio-primary sm:text-4xl">Categories</h1>
      <p className="mt-3 text-studio-ink/75">
        Organize the storefront with clear parent categories and sub-categories so admins can see
        structure, product coverage, and available actions at a glance.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(63,52,143,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-accent">Total Categories</p>
          <p className="mt-2 text-3xl font-semibold text-studio-primary">{allCategories.length}</p>
          <p className="mt-1 text-xs text-studio-ink/55">All parent and child categories combined.</p>
        </div>
        <div className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(63,52,143,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-accent">Top-Level Groups</p>
          <p className="mt-2 text-3xl font-semibold text-studio-primary">{parents.length}</p>
          <p className="mt-1 text-xs text-studio-ink/55">Main navigation and product buckets.</p>
        </div>
        <div className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(63,52,143,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-accent">Sub-Categories</p>
          <p className="mt-2 text-3xl font-semibold text-studio-primary">{totalSubcategories}</p>
          <p className="mt-1 text-xs text-studio-ink/55">Nested labels used for finer product placement.</p>
        </div>
        <div className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(63,52,143,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-accent">In Use</p>
          <p className="mt-2 text-3xl font-semibold text-studio-primary">{categoriesWithProducts}</p>
          <p className="mt-1 text-xs text-studio-ink/55">Categories currently assigned to products.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_320px]">
        <div className="overflow-hidden rounded-2xl border border-studio-primary/10 bg-white shadow-[0_20px_40px_-30px_rgba(63,52,143,0.55)]">
          <div className="border-b border-studio-primary/10 px-4 py-4 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-accent">Create Category</p>
            <h2 className="mt-1 text-lg font-semibold text-studio-primary">Add New Category or Sub-Category</h2>
            <p className="mt-1 text-sm text-studio-ink/65">
              Create a parent category for major product groups, or assign a parent to create a sub-category.
            </p>
          </div>
          <form action={createCategory} className="grid gap-3 p-4 sm:p-5 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-studio-ink/60">
              Category Name
              <input
                name="name"
                required
                placeholder="Example: Bridal Sarees"
                className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm font-normal normal-case tracking-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-studio-ink/60">
              Parent Category
              <select
                name="parentId"
                className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm font-normal normal-case tracking-normal"
              >
                <option value="">No parent, create top-level category</option>
                {parents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-2xl border border-studio-primary/10 bg-studio-light/30 px-4 py-3 text-xs text-studio-ink/65 md:col-span-2">
              Top-level categories shape the main storefront structure. Sub-categories help admins and customers narrow products more precisely.
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-studio-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-studio-accent md:col-span-2 md:w-fit"
            >
              Create Category
            </button>
          </form>
        </div>

        <aside className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_20px_40px_-30px_rgba(63,52,143,0.55)] sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-accent">Admin Guidance</p>
          <h2 className="mt-1 text-lg font-semibold text-studio-primary">How to read this page</h2>
          <div className="mt-4 space-y-3 text-sm text-studio-ink/70">
            <div className="rounded-xl border border-studio-primary/10 bg-studio-light/25 px-3 py-3">
              A parent card represents a top-level storefront group.
            </div>
            <div className="rounded-xl border border-studio-primary/10 bg-studio-light/25 px-3 py-3">
              Sub-category rows underneath show finer classification and product count.
            </div>
            <div className="rounded-xl border border-studio-primary/10 bg-studio-light/25 px-3 py-3">
              Delete is only available when a category has no products and no child categories.
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6 space-y-4">
        {categoryGroups.map(({ parent, children }) => {
          return (
            <div
              key={parent.id}
              className="overflow-hidden rounded-2xl border border-studio-primary/10 bg-white shadow-[0_16px_30px_-24px_rgba(63,52,143,0.45)]"
            >
              <div className="border-b border-studio-primary/10 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-studio-light px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-studio-primary">
                      Top-Level Category
                    </span>
                    <p className="mt-3 text-xl font-semibold text-studio-primary">{parent.name}</p>
                    <p className="mt-2 text-sm text-studio-ink/65">
                      {children.length} sub-categor{children.length === 1 ? "y" : "ies"} · {parent._count.products} direct product{parent._count.products === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[360px]">
                    <div className="rounded-xl border border-studio-primary/10 bg-studio-light/25 px-3 py-3 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-studio-ink/55">Children</p>
                      <p className="mt-1 text-lg font-semibold text-studio-primary">{children.length}</p>
                    </div>
                    <div className="rounded-xl border border-studio-primary/10 bg-studio-light/25 px-3 py-3 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-studio-ink/55">Direct Products</p>
                      <p className="mt-1 text-lg font-semibold text-studio-primary">{parent._count.products}</p>
                    </div>
                    <div className="rounded-xl border border-studio-primary/10 bg-studio-light/25 px-3 py-3 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-studio-ink/55">Status</p>
                      <p className="mt-1 text-sm font-semibold text-studio-primary">
                        {parent._count.products === 0 && children.length === 0 ? "Can delete" : "Protected"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <form action={renameCategory} className="flex flex-col gap-2 sm:flex-row">
                    <input type="hidden" name="id" value={parent.id} />
                    <input
                      name="name"
                      required
                      defaultValue={parent.name}
                      className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm sm:w-64"
                    />
                    <button
                      type="submit"
                      className="rounded-full border border-studio-primary/20 px-4 py-2 text-xs font-semibold text-studio-primary transition hover:bg-studio-light"
                    >
                      Save Parent Name
                    </button>
                  </form>
                  {parent._count.products === 0 && children.length === 0 ? (
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={parent.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        Delete Parent Category
                      </button>
                    </form>
                  ) : (
                    <span className="rounded-full border border-studio-primary/10 px-4 py-2 text-xs text-studio-ink/45">
                      Cannot delete while products or child categories exist
                    </span>
                  )}
                </div>
              </div>

              {children.length === 0 ? (
                <div className="px-4 py-5 text-sm text-studio-ink/50 sm:px-5">
                  No sub-categories yet. Create one above and assign this parent category to organize products more precisely.
                </div>
              ) : (
                <div className="divide-y divide-studio-primary/5">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                    >
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-studio-ink/45">Sub-Category</span>
                        <p className="mt-1 text-base font-semibold text-studio-ink">{child.name}</p>
                        <p className="mt-1 text-xs text-studio-ink/50">
                          {child._count.products} assigned product{child._count.products === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
                        <form action={renameCategory} className="flex flex-col gap-2 sm:flex-row">
                          <input type="hidden" name="id" value={child.id} />
                          <input
                            name="name"
                            required
                            defaultValue={child.name}
                            className="w-full rounded-xl border border-studio-primary/15 px-3 py-2 text-sm sm:w-56"
                          />
                          <button
                            type="submit"
                            className="rounded-full border border-studio-primary/20 px-4 py-2 text-xs font-semibold text-studio-primary transition hover:bg-studio-light"
                          >
                            Save
                          </button>
                        </form>
                        {child._count.products === 0 ? (
                          <form action={deleteCategory}>
                            <input type="hidden" name="id" value={child.id} />
                            <button
                              type="submit"
                              className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </form>
                        ) : (
                          <span className="rounded-full border border-studio-primary/10 px-4 py-2 text-xs text-studio-ink/45">
                            Protected because products are assigned
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {parents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-studio-primary/20 bg-white p-6 text-sm text-studio-ink/60">
            No categories yet. Create your first category using the form above.
          </div>
        ) : null}
      </div>
    </section>
  );
}
