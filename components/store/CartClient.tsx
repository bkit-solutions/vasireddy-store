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
    () =>
      items.reduce(
        (sum, item) =>
          sum + Math.round(item.product.basePrice / 100) * item.quantity,
        0
      ),
    [items]
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
      toast.success(quantity <= 0 ? "Item removed" : "Cart updated");
      return;
    }

    toast.error("Update failed");
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
      toast.success("Item removed");
      return;
    }

    toast.error("Remove failed");
  }

  // 🔥 NEW RAZORPAY FUNCTION
  async function placeOrder() {
    if (!items.length || placingOrder) return;

    setPlacingOrder(true);

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = async () => {
      try {
        // 1️⃣ Create order (DB + Razorpay)
        const res = await fetch("/api/orders/create", {
          method: "POST",
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error("Failed to initiate payment");
          setPlacingOrder(false);
          return;
        }

        // 2️⃣ Razorpay options
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: "INR",
          name: "VasiReddy Store",
          description: "Order Payment",
          order_id: data.orderId,

          handler: async function (response: any) {
            // 3️⃣ Verify payment
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                dbOrderId: data.dbOrderId,
              }),
            });

            if (verifyRes.ok) {
              toast.success("Payment Successful 🎉");

              // ✅ Clear UI
              setItems([]);

              // ✅ Clear DB cart
              await fetch("/api/cart/clear", { method: "POST" });

              router.push("/account");
              router.refresh();
            } else {
              toast.error("Payment verification failed");
            }
          },

          prefill: {
            name: "Test User",
            email: "test@test.com",
            contact: "9999999999",
          },

          theme: {
            color: "#6366f1",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      } finally {
        setPlacingOrder(false);
      }
    };
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
          <article
            key={item.id}
            className="rounded-2xl border border-studio-primary/10 bg-white p-4 shadow"
          >
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 overflow-hidden rounded-xl bg-studio-light">
                {item.product.imageUrl && (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="text-xs text-studio-accent">
                  {item.product.category.name}
                </p>
                <h3 className="text-lg font-semibold text-studio-primary">
                  {item.product.name}
                </h3>
                <p className="text-sm">
                  {formatCurrency(
                    Math.round(item.product.basePrice / 100)
                  )}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                -
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                +
              </button>
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          </article>
        ))}
      </div>

      <aside className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Order Summary</h2>

        <div className="mt-4 flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <button
          onClick={placeOrder}
          disabled={placingOrder}
          className="mt-4 w-full rounded-full bg-studio-primary py-2 text-white"
        >
          {placingOrder ? "Processing..." : "Pay with Razorpay"}
        </button>
      </aside>
    </div>
  );
}