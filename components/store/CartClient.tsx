"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type CartItem = {
  id: string;
  quantity: number;
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

type CartClientProps = {
  initialItems: CartItem[];
};

export function CartClient({ initialItems }: CartClientProps) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Math.round(item.product.basePrice / 100) * item.quantity, 0),
    [items],
  );

  async function updateQuantity(itemId: string, quantity: number) {
    setLoadingItemId(itemId);
    const response = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });

    const result = (await response.json()) as { data?: CartItem[] };
    setLoadingItemId(null);

    if (response.ok && result.data) {
      setItems(result.data);
      toast.success(quantity <= 0 ? "Item removed from cart" : "Cart updated");
      return;
    }

    toast.error("Could not update cart item");
  }

  async function removeItem(itemId: string) {
    setLoadingItemId(itemId);
    const response = await fetch(`/api/cart?itemId=${itemId}`, {
      method: "DELETE",
    });

    const result = (await response.json()) as { data?: CartItem[] };
    setLoadingItemId(null);

    if (response.ok && result.data) {
      setItems(result.data);
      toast.success("Item removed from cart");
      return;
    }

    toast.error("Could not remove item");
  }

  async function placeOrder() {
    if (!items.length || placingOrder) return;

    setPlacingOrder(true);
    const response = await fetch("/api/orders/create", {
      method: "POST",
    });

    setPlacingOrder(false);
    if (response.ok) {
      setItems([]);
      toast.success("Order placed successfully");
      router.push("/account");
      router.refresh();
      return;
    }

    toast.error("Could not place order. Please try again.");
  }

  if (!items.length) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-studio-primary/20 bg-white p-8 text-sm text-studio-ink/70">
        Your cart is empty. Add a product to continue checkout.
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow-[0_16px_28px_-24px_rgba(63,52,143,0.55)]">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-studio-light">
                {item.product.imageUrl ? <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" /> : null}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-studio-accent">{item.product.category.name}</p>
                <h3 className="mt-1 text-lg font-semibold text-studio-primary">{item.product.name}</h3>
                <p className="mt-2 text-sm text-studio-ink/80">{formatCurrency(Math.round(item.product.basePrice / 100))}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={loadingItemId === item.id}
                className="rounded-full border border-studio-primary/20 px-3 py-1 text-sm text-studio-primary disabled:opacity-60"
              >
                -
              </button>
              <span className="min-w-8 text-center text-sm font-semibold text-studio-ink">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={loadingItemId === item.id}
                className="rounded-full border border-studio-primary/20 px-3 py-1 text-sm text-studio-primary disabled:opacity-60"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                disabled={loadingItemId === item.id}
                className="ml-3 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-2xl border border-studio-primary/10 bg-white p-5 shadow-[0_20px_38px_-30px_rgba(63,52,143,0.7)]">
        <h2 className="text-lg font-semibold text-studio-primary">Order Summary</h2>
        <div className="mt-4 flex items-center justify-between text-sm text-studio-ink/80">
          <span>Subtotal</span>
          <span className="font-semibold text-studio-ink">{formatCurrency(total)}</span>
        </div>
        <p className="mt-4 text-xs text-studio-ink/60">Use Place Test Order for local E2E testing, or integrate Stripe checkout for live payments.</p>
        <button
          type="button"
          onClick={placeOrder}
          disabled={placingOrder || !items.length}
          className="mt-4 w-full rounded-full bg-studio-primary px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-studio-accent disabled:cursor-not-allowed disabled:opacity-70"
        >
          {placingOrder ? "Placing Order..." : "Place Test Order"}
        </button>
      </aside>
    </div>
  );
}
