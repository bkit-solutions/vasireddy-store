import Link from "next/link";

type Category = {
  title: string;
  slug: string;
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/collections?category=${category.slug}`}
          className="group rounded-2xl border border-studio-primary/10 bg-white p-5 shadow-[0_16px_28px_-24px_rgba(63,52,143,0.55)] transition hover:-translate-y-1 hover:border-studio-accent/40"
        >
          <div className="h-28 rounded-xl bg-studio-light" />
          <h3 className="mt-4 text-lg font-semibold text-studio-primary">{category.title}</h3>
          <p className="text-sm text-studio-ink/70">Browse curated picks</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-studio-accent">Explore now</p>
        </Link>
      ))}
    </div>
  );
}
