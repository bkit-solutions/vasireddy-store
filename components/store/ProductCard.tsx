import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { WishlistButton } from "@/components/store/WishlistButton";

type ProductCardProps = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  category: string;
  price: number;
};

export function ProductCard({ id, name, slug, imageUrl, category, price }: ProductCardProps) {
  return (
    <article className="animate-reveal-up rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(32,29,26,0.24)] transition hover:-translate-y-1">
      <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-studio-light flex items-center justify-center">
        {imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-contain" /> : null}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-studio-accent">{category}</p>
          <h3 className="mt-1 text-lg font-semibold text-studio-primary">{name}</h3>
          <p className="mt-2 text-sm font-medium text-studio-ink/90">{formatCurrency(price)}</p>
        </div>
        <WishlistButton productId={id} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <AddToCartButton productId={id} compact />
        <Link
          href={`/products/${slug}`}
          className="inline-flex rounded-full bg-studio-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-studio-accent"
        >
          View Product
        </Link>
      </div>
    </article>
  );
}
