import { ProductCard } from "@/components/store/ProductCard";
import Link from "next/link";
import { getActiveProducts, getStoreCategories } from "@/lib/store-data";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q?.trim();
  const category = resolvedSearchParams.category?.trim();
  const [products, categories] = await Promise.all([
    getActiveProducts({ q, category }),
    getStoreCategories(),
  ]);

  return (
    <section className="section-shell py-12">
      <div className="animate-reveal-up rounded-3xl border border-studio-primary/10 bg-white/90 p-6 shadow-[0_20px_42px_-30px_rgba(32,29,26,0.3)] backdrop-blur md:p-8">
        <h1 className="text-4xl font-semibold text-studio-primary md:text-5xl">All Products</h1>
        <p className="mt-3 text-studio-ink/75">
          Search, filter, and shop individual products. For style-first browsing, use the Collections page.
        </p>

        <form action="/products" className="mt-7 grid gap-3 md:grid-cols-[1fr_240px_auto] md:items-end">
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-studio-ink/65">
            Search Products
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Try: bridal, cotton, maggam blouse..."
              className="mt-1.5 w-full rounded-xl border border-studio-primary/15 bg-white px-3 py-2.5 text-sm text-studio-ink outline-none transition focus:border-studio-accent"
            />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-studio-ink/65">
            Category
            <select
              name="category"
              defaultValue={category ?? ""}
              className="mt-1.5 w-full rounded-xl border border-studio-primary/15 bg-white px-3 py-2.5 text-sm text-studio-ink outline-none transition focus:border-studio-accent"
            >
              <option value="">All Categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2 md:justify-end">
            <button type="submit" className="rounded-full bg-studio-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-studio-accent">
              Apply
            </button>
            {(q || category) ? (
              <Link
                href="/products"
                className="rounded-full border border-studio-primary/20 bg-white px-5 py-2.5 text-sm font-semibold text-studio-primary transition hover:border-studio-accent hover:text-studio-accent"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-studio-ink/65">
          <span className="rounded-full bg-studio-light px-3 py-1 font-semibold text-studio-primary">
            {products.length} product{products.length === 1 ? "" : "s"}
          </span>
          {q ? <span>Keyword: &quot;{q}&quot;</span> : null}
          {category ? <span>Category: {categories.find((c) => c.slug === category)?.title ?? category}</span> : null}
        </div>
      </div>

      {products.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-studio-primary/25 bg-white p-8 text-sm text-studio-ink/70">
          No matching products found. Try another keyword or choose a different category.
        </div>
      )}
    </section>
  );
}
