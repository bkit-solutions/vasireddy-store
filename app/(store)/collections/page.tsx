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

  const featuredByCategory = categories
    .slice(0, 4)
    .map((categoryItem) => ({
      category: categoryItem,
      items: products.filter((product) => product.categorySlug === categoryItem.slug).slice(0, 3),
    }))
    .filter((entry) => entry.items.length > 0);

  return (
    <section className="section-shell py-12">
      <div className="animate-reveal-up rounded-3xl border border-studio-primary/10 bg-white/90 p-6 shadow-[0_20px_42px_-30px_rgba(32,29,26,0.3)] backdrop-blur md:p-8">
        <h1 className="text-4xl font-semibold text-studio-primary md:text-5xl">Collections</h1>
        <p className="mt-3 max-w-2xl text-studio-ink/75">
          Browse curated edits by category. Collections are style-first experiences, while Products remains your detailed searchable catalog.
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          <Link
            href="/collections"
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
              !category
                ? "border-studio-primary bg-studio-primary text-white"
                : "border-studio-primary/20 bg-white text-studio-primary hover:border-studio-accent hover:text-studio-accent"
            }`}
          >
            All Collections
          </Link>
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/collections?category=${item.slug}`}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                category === item.slug
                  ? "border-studio-primary bg-studio-primary text-white"
                  : "border-studio-primary/20 bg-white text-studio-primary hover:border-studio-accent hover:text-studio-accent"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-studio-ink/65">
          <span className="rounded-full bg-studio-light px-3 py-1 font-semibold text-studio-primary">
            {products.length} curated pick{products.length === 1 ? "" : "s"}
          </span>
          {category ? <span>Collection: {categories.find((c) => c.slug === category)?.title ?? category}</span> : null}
        </div>
      </div>

      {!category ? (
        <div className="mt-8 space-y-10">
          {featuredByCategory.map((entry) => (
            <section key={entry.category.id} className="animate-reveal-up">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-studio-accent">Collection Edit</p>
                  <h2 className="mt-1 text-2xl font-semibold text-studio-primary">{entry.category.title}</h2>
                </div>
                <Link
                  href={`/collections?category=${entry.category.slug}`}
                  className="rounded-full border border-studio-primary/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-studio-primary transition hover:border-studio-accent hover:text-studio-accent"
                >
                  View Full Collection
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {entry.items.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : products.length ? (
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
