import { ProductCard } from "@/components/store/ProductCard";
import Link from "next/link";
import { getActiveProducts, getStoreCategories } from "@/lib/store-data";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q?.trim();
  const category = resolvedSearchParams.category?.trim();
  const sort = resolvedSearchParams.sort?.trim() ?? "newest";

  const [products, categories] = await Promise.all([
    getActiveProducts({ q, category }),
    getStoreCategories(),
  ]);

  // Apply sorting client-side on the server response (adjust if your data layer supports it)
  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "price-asc") return (a.price ?? 0) - (b.price ?? 0);
    if (sort === "price-desc") return (b.price ?? 0) - (a.price ?? 0);
    
    return 0; // default: newest / original order
  });

  const activeCategoryTitle = categories.find((c) => c.slug === category)?.title;
  const hasFilters = Boolean(q || category);

  return (
    <section className="section-shell py-10 md:py-14">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs font-medium text-studio-ink/60">
        <Link href="/" className="transition hover:text-studio-accent">
          Home
        </Link>
        <span aria-hidden>/</span>
        <span className="text-studio-primary">Products</span>
      </nav>

      {/* Header Card */}
      <div className="animate-reveal-up rounded-3xl border border-studio-primary/10 bg-white/90 p-6 shadow-[0_20px_42px_-30px_rgba(32,29,26,0.3)] backdrop-blur md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold leading-tight text-studio-primary md:text-5xl">
            Shop All Products
          </h1>
          <p className="max-w-2xl text-sm text-studio-ink/70 md:text-base">
            Find what you're looking for with powerful search and sorting. Prefer curated browsing? <Link href="/collections" className="font-semibold text-studio-accent hover:text-studio-primary transition">Visit Collections</Link>.
          </p>
        </div>

        {/* Filter Form */}
        <form
          action="/products"
          className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end"
        >
          {/* Search */}
          <div className="md:col-span-5">
            <label
              htmlFor="search"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-studio-ink/65"
            >
              Search Products
            </label>
            <input
              id="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Try: bridal, cotton, maggam blouse..."
              className="h-11 w-full rounded-xl border border-studio-primary/15 bg-white px-3.5 text-sm text-studio-ink outline-none transition focus:border-studio-accent focus:ring-2 focus:ring-studio-accent/20"
            />
          </div>

          {/* Category */}
          <div className="md:col-span-3">
            <label
              htmlFor="category"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-studio-ink/65"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={category ?? ""}
              className="h-11 w-full rounded-xl border border-studio-primary/15 bg-white px-3 text-sm text-studio-ink outline-none transition focus:border-studio-accent focus:ring-2 focus:ring-studio-accent/20"
            >
              <option value="">All Categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="md:col-span-2">
            <label
              htmlFor="sort"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-studio-ink/65"
            >
              Sort By
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="h-11 w-full rounded-xl border border-studio-primary/15 bg-white px-3 text-sm text-studio-ink outline-none transition focus:border-studio-accent focus:ring-2 focus:ring-studio-accent/20"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A–Z</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:col-span-2 md:justify-end">
            <button
              type="submit"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-studio-primary px-5 text-sm font-semibold text-white transition hover:bg-studio-accent md:flex-none"
            >
              Apply
            </button>
            {hasFilters ? (
              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center rounded-full border border-studio-primary/20 bg-white px-5 text-sm font-semibold text-studio-primary transition hover:border-studio-accent hover:text-studio-accent"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>

        {/* Active Filter Chips */}
        {hasFilters ? (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-studio-ink/55">
              Active:
            </span>
            {q ? (
              <Link
                href={`/products${category ? `?category=${category}` : ""}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-studio-primary/15 bg-studio-light/60 px-3 py-1 text-xs font-medium text-studio-primary transition hover:border-studio-accent hover:bg-studio-light"
              >
                <span>Keyword: “{q}”</span>
                <span className="text-studio-ink/50 transition group-hover:text-studio-accent">×</span>
              </Link>
            ) : null}
            {category ? (
              <Link
                href={`/products${q ? `?q=${q}` : ""}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-studio-primary/15 bg-studio-light/60 px-3 py-1 text-xs font-medium text-studio-primary transition hover:border-studio-accent hover:bg-studio-light"
              >
                <span>{activeCategoryTitle ?? category}</span>
                <span className="text-studio-ink/50 transition group-hover:text-studio-accent">×</span>
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Result Count Bar */}
      <div className="mt-6 flex items-center justify-between border-b border-studio-primary/10 pb-3">
        <p className="text-sm text-studio-ink/70">
          Showing{" "}
          <span className="font-semibold text-studio-primary">
            {sortedProducts.length}
          </span>{" "}
          {sortedProducts.length === 1 ? "product" : "products"}
        </p>
      </div>

      {/* Product Grid */}
      {sortedProducts.length ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-studio-primary/25 bg-white px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-studio-light text-2xl">
            🔍
          </div>
          <h3 className="text-lg font-semibold text-studio-primary">
            No matching products
          </h3>
          <p className="max-w-sm text-sm text-studio-ink/65">
            We couldn’t find any products matching your filters. Try a different keyword or browse all categories.
          </p>
          <Link
            href="/products"
            className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-studio-primary px-5 text-sm font-semibold text-white transition hover:bg-studio-accent"
          >
            Reset Filters
          </Link>
        </div>
      )}
    </section>
  );
}