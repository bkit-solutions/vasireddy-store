import { ProductCard } from "@/components/store/ProductCard";
import Link from "next/link";
import { getActiveProducts, getStoreCategories } from "@/lib/store-data";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category?.trim();
  const [categories, products] = await Promise.all([
    getStoreCategories(),
    getActiveProducts({ category }),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);

  const featuredByCategory = categories
    .slice(0, 4)
    .map((categoryItem) => ({
      category: categoryItem,
      items: products.filter((product) => product.categorySlug === categoryItem.slug).slice(0, 3),
    }))
    .filter((entry) => entry.items.length > 0);

  return (
    <section className="section-shell py-12">
      {/* ───────── HERO HEADER ───────── */}
      <div className="animate-reveal-up relative overflow-hidden rounded-[2rem] border border-studio-primary/10 bg-gradient-to-br from-white via-studio-light/40 to-white p-8 shadow-[0_30px_60px_-40px_rgba(32,29,26,0.4)] backdrop-blur md:p-12">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-studio-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-studio-primary/5 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="h-px w-10 bg-studio-accent" />
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-studio-accent">
              Curated Edits
            </p>
          </div>

          <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight tracking-tight text-studio-primary md:text-6xl lg:text-7xl">
            {activeCategory ? activeCategory.title : "Collections"}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-studio-ink/70 md:text-lg">
            {activeCategory
              ? `Discover our handpicked ${activeCategory.title.toLowerCase()} collection — designed with intention, styled for you.`
              : "Browse curated edits by category. Style-first experiences, thoughtfully arranged for inspiration and discovery."}
          </p>

          {/* Stats badge row */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-studio-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-studio-accent" />
              {products.length} Curated Pick{products.length === 1 ? "" : "s"}
            </div>
            {activeCategory && (
              <Link
                href="/collections"
                className="inline-flex items-center gap-1.5 rounded-full border border-studio-primary/20 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-studio-primary transition hover:border-studio-accent hover:text-studio-accent"
              >
                ← Back to All
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ───────── CATEGORY FILTER PILLS ───────── */}
      <div className="mt-8 animate-reveal-up">
        <div className="flex items-center justify-between gap-4 border-b border-studio-primary/10 pb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-ink/50">
            Filter by Category
          </p>
          <span className="text-xs text-studio-ink/40">
            {categories.length} collections
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/collections"
            className={`group relative overflow-hidden rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
              !category
                ? "border-studio-primary bg-studio-primary text-white shadow-md"
                : "border-studio-primary/15 bg-white text-studio-primary hover:-translate-y-0.5 hover:border-studio-accent hover:text-studio-accent hover:shadow-sm"
            }`}
          >
            All Collections
          </Link>
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/collections?category=${item.slug}`}
              className={`group relative overflow-hidden rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
                category === item.slug
                  ? "border-studio-primary bg-studio-primary text-white shadow-md"
                  : "border-studio-primary/15 bg-white text-studio-primary hover:-translate-y-0.5 hover:border-studio-accent hover:text-studio-accent hover:shadow-sm"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      {/* ───────── CONTENT ───────── */}
      {!category ? (
        <div className="mt-12 space-y-16">
          {featuredByCategory.map((entry, index) => (
            <section
              key={entry.category.id}
              className="animate-reveal-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Collection header */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="h-px w-8 bg-studio-accent" />
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-studio-accent">
                      Collection {String(index + 1).padStart(2, "0")}
                    </p>
                  </div>
                  <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-studio-primary md:text-4xl">
                    {entry.category.title}
                  </h2>
                  
                </div>
                <Link
                  href={`/collections?category=${entry.category.slug}`}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-studio-primary/20 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-studio-primary transition-all hover:border-studio-primary hover:bg-studio-primary hover:text-white"
                >
                  View Full Collection
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>

              {/* Product grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {entry.items.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : products.length ? (
        <div className="mt-10 grid animate-reveal-up gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        // ───────── EMPTY STATE ─────────
        <div className="mt-12 animate-reveal-up">
          <div className="rounded-3xl border border-dashed border-studio-primary/25 bg-gradient-to-br from-white to-studio-light/30 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-studio-light">
              <svg
                className="h-8 w-8 text-studio-primary/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="mt-4 font-serif text-2xl font-semibold text-studio-primary">
              No pieces found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-studio-ink/65">
              We couldn't find any items in this collection yet. Explore other curated edits or browse our full catalog.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/collections"
                className="rounded-full bg-studio-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-studio-primary/90"
              >
                View All Collections
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-studio-primary/20 bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-studio-primary transition hover:border-studio-accent hover:text-studio-accent"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}