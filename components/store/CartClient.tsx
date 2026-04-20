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
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<
    | {
        code: string;
        discountPercent: number;
      }
    | null
  >(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Math.round(item.product.basePrice / 100) * item.quantity,
        0
      ),
    [items]
  );

  const discount = appliedCoupon
    ? Math.round((total * appliedCoupon.discountPercent) / 100)
    : 0;

  const totalAfterDiscount = total - discount;

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

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code || couponLoading) return;

    setCouponLoading(true);

    try {
      const response = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Coupon not valid");
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon({
        code: result.code,
        discountPercent: result.discountPercent,
      });
      toast.success(`Coupon ${result.code} applied!`);
    } catch (error) {
      toast.error("Coupon validation failed");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            couponCode: appliedCoupon?.code ?? null,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Failed to initiate payment");
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

        <div className="mt-4">
          <label htmlFor="couponCode" className="text-sm font-medium text-studio-ink/80">
            Coupon code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="couponCode"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              placeholder="Enter coupon"
              className="w-full rounded-xl border border-studio-primary/15 bg-studio-light/50 px-3 py-2 text-sm focus:border-studio-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={couponLoading || !couponCode.trim()}
              className="rounded-full bg-studio-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {couponLoading ? "Applying..." : "Apply"}
            </button>
          </div>
          {appliedCoupon ? (
            <p className="mt-3 text-sm text-emerald-600">
              Coupon "{appliedCoupon.code}" applied — {appliedCoupon.discountPercent}% off.
              <button
                type="button"
                onClick={() => {
                  setAppliedCoupon(null);
                  setCouponCode("");
                }}
                className="ml-2 underline"
              >
                Remove
              </button>
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex justify-between">
          <span>Discount</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
        <div className="mt-4 flex justify-between border-t border-studio-primary/10 pt-4 text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(totalAfterDiscount)}</span>
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