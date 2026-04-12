"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

type AddToCartButtonProps = {
  productId: string;
  compact?: boolean;
};

export function AddToCartButton({ productId, compact = false }: AddToCartButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);

    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    if (response.status === 401) {
      toast.error("Please login to add items to cart");
      const callbackUrl = encodeURIComponent(pathname || "/products");
      setLoading(false);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    if (!response.ok) {
      setLoading(false);
      toast.error("Could not add item to cart");
      return;
    }

    setLoading(false);
    toast.success("Added to cart", {
      action: {
        label: "View Cart",
        onClick: () => router.push("/cart"),
      },
    });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={
        compact
          ? "rounded-full border border-studio-primary/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-studio-primary transition hover:border-studio-accent hover:text-studio-accent disabled:cursor-not-allowed disabled:opacity-70"
          : "rounded-full bg-studio-primary px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-studio-accent disabled:cursor-not-allowed disabled:opacity-70"
      }
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
