"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

type WishlistItem = {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    basePrice: number;
    category: {
      name: string;
    };
  };
};

type WishlistClientProps = {
  initialItems: WishlistItem[];
};

export function WishlistClient({ initialItems }: WishlistClientProps) {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  async function remove(productId: string) {
    setLoadingProductId(productId);
    const response = await fetch(`/api/wishlist?productId=${productId}`, {
      method: "DELETE",
    });

    const result = (await response.json()) as { data?: WishlistItem[] };
    setLoadingProductId(null);

    if (response.ok && result.data) {
      setItems(result.data);
    }
  }

  if (!items.length) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-studio-primary/20 bg-white p-8 text-sm text-studio-ink/70">
        Your wishlist is empty. Tap the heart icon on any product to save it here.
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(63,52,143,0.55)]">
          <div className="relative h-48 overflow-hidden rounded-xl bg-studio-light">
            {item.product.imageUrl ? <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" /> : null}
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.14em] text-studio-accent">{item.product.category.name}</p>
          <h3 className="mt-1 text-lg font-semibold text-studio-primary">{item.product.name}</h3>
          <p className="mt-2 text-sm font-medium text-studio-ink/90">{formatCurrency(Math.round(item.product.basePrice / 100))}</p>
          <div className="mt-4 flex items-center gap-2">
            <Link
              href={`/products/${item.product.slug}`}
              className="rounded-full bg-studio-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-studio-accent"
            >
              View Product
            </Link>
            <button
              type="button"
              onClick={() => remove(item.product.id)}
              disabled={loadingProductId === item.product.id}
              className="rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              Remove
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
