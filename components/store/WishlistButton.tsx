"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";

type WishlistButtonProps = {
  productId: string;
  compact?: boolean;
};

export function WishlistButton({ productId, compact = true }: WishlistButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);

    const response = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    if (response.status === 401) {
      toast.error("Please login to use wishlist");
      const callbackUrl = encodeURIComponent(pathname || "/products");
      setLoading(false);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    if (!response.ok) {
      setLoading(false);
      toast.error("Could not update wishlist");
      return;
    }

    setLoading(false);
    toast.success("Added to wishlist");
    router.refresh();
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label="Add to wishlist"
        className="rounded-full p-2 text-studio-primary transition hover:bg-studio-light disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Heart size={18} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-full border border-studio-primary/20 bg-white px-6 py-3 text-sm font-semibold text-studio-primary transition hover:-translate-y-0.5 hover:border-studio-accent hover:text-studio-accent disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? "Adding..." : "Add to Wishlist"}
    </button>
  );
}
