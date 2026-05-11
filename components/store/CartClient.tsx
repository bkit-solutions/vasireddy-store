"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShoppingBag, Truck, Lock as LockIcon, CheckCircle2, Plus } from "lucide-react";

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

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Fetch saved addresses on mount
  useState(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAddresses(data);
          const def = data.find((a: any) => a.isDefault);
          if (def) {
            setSelectedAddressId(def.id);
            setShippingAddress({
              name: def.name,
              phone: def.phone,
              street: def.street,
              city: def.city,
              state: def.state,
              pincode: def.pincode,
            });
          } else if (data.length > 0) {
            setIsNewAddress(false);
          } else {
            setIsNewAddress(true);
          }
        }
      })
      .finally(() => setLoadingAddresses(false));
  });

  const isAddressComplete =
    shippingAddress.name &&
    shippingAddress.phone &&
    shippingAddress.street &&
    shippingAddress.city &&
    shippingAddress.state &&
    shippingAddress.pincode;

  function handleAddressSelect(addr: any) {
    setSelectedAddressId(addr.id);
    setIsNewAddress(false);
    setShippingAddress({
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
  }

  // 🔥 NEW RAZORPAY FUNCTION
  async function placeOrder() {
    if (!items.length || placingOrder || !isAddressComplete) {
      if (!isAddressComplete) toast.error("Please complete your shipping address");
      return;
    }

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
            shippingDetails: shippingAddress,
            addressId: selectedAddressId,
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
            name: shippingAddress.name,
            email: "", // Will be filled from session on backend
            contact: shippingAddress.phone,
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
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {/* Cart Items */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-studio-ink/40">Your Bag ({items.length})</h2>
          {items.map((item) => (
            <article
              key={item.id}
              className="group relative overflow-hidden rounded-[1.5rem] border border-studio-primary/10 bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-studio-light">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-studio-primary/5">
                      <ShoppingBag className="text-studio-primary/20" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-studio-accent">
                    {item.product.category.name}
                  </p>
                  <h3 className="truncate font-serif text-lg font-semibold text-studio-primary">
                    {item.product.name}
                  </h3>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="font-semibold text-studio-primary">
                      {formatCurrency(Math.round(item.product.basePrice / 100))}
                    </p>
                    <div className="flex items-center rounded-full border border-studio-primary/10 bg-studio-light/30 p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-white hover:text-studio-accent disabled:opacity-30"
                        disabled={loadingItemId === item.id}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-white hover:text-studio-accent disabled:opacity-30"
                        disabled={loadingItemId === item.id}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="ml-2 text-studio-ink/30 transition hover:text-red-500"
                  disabled={loadingItemId === item.id}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* Shipping Address Section */}
        <section className="rounded-[2rem] border border-studio-primary/10 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-studio-accent text-white">
              <Truck size={16} />
            </div>
            <h2 className="font-serif text-xl font-semibold text-studio-primary">Delivery Address</h2>
          </div>

          {/* Saved Addresses Cards */}
          {!loadingAddresses && addresses.length > 0 && (
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleAddressSelect(addr)}
                  className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                    selectedAddressId === addr.id && !isNewAddress
                      ? "border-studio-accent bg-studio-accent/[0.03] ring-1 ring-studio-accent/20"
                      : "border-studio-primary/10 hover:border-studio-primary/30"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-bold text-studio-primary">{addr.name}</span>
                    {selectedAddressId === addr.id && !isNewAddress && (
                      <CheckCircle2 size={14} className="text-studio-accent" />
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-studio-ink/65">
                    {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="mt-2 text-[11px] font-bold text-studio-primary flex items-center gap-1.5">
                     <span className="text-studio-accent">📞</span> {addr.phone}
                  </p>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsNewAddress(true);
                  setSelectedAddressId(null);
                  setShippingAddress({ name: "", phone: "", street: "", city: "", state: "", pincode: "" });
                }}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 transition-all ${
                  isNewAddress
                    ? "border-studio-accent bg-studio-accent/[0.03]"
                    : "border-studio-primary/10 hover:border-studio-primary/30"
                }`}
              >
                <Plus size={18} className="text-studio-ink/40" />
                <span className="text-xs font-bold uppercase tracking-wider text-studio-ink/60">New Address</span>
              </button>
            </div>
          )}

          {/* Address Form (only if new or no addresses) */}
          {(isNewAddress || addresses.length === 0) && (
            <div className="grid gap-4 sm:grid-cols-2 animate-reveal-up">
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-studio-ink/40">Recipient Name</label>
                <input
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-studio-primary/15 bg-studio-light/20 px-4 py-2.5 text-sm focus:border-studio-accent focus:outline-none"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-studio-ink/40">Phone Number</label>
                <input
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-xl border border-studio-primary/15 bg-studio-light/20 px-4 py-2.5 text-sm focus:border-studio-accent focus:outline-none"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-studio-ink/40">Street Address</label>
                <input
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  placeholder="House No, Building, Area"
                  className="w-full rounded-xl border border-studio-primary/15 bg-studio-light/20 px-4 py-2.5 text-sm focus:border-studio-accent focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-studio-ink/40">City</label>
                <input
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  placeholder="City"
                  className="w-full rounded-xl border border-studio-primary/15 bg-studio-light/20 px-4 py-2.5 text-sm focus:border-studio-accent focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-studio-ink/40">State</label>
                <input
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  placeholder="State"
                  className="w-full rounded-xl border border-studio-primary/15 bg-studio-light/20 px-4 py-2.5 text-sm focus:border-studio-accent focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-studio-ink/40">Pincode</label>
                <input
                  value={shippingAddress.pincode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                  placeholder="6-digit Pincode"
                  className="w-full rounded-xl border border-studio-primary/15 bg-studio-light/20 px-4 py-2.5 text-sm focus:border-studio-accent focus:outline-none"
                />
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="sticky top-24 self-start">
        <div className="rounded-[2rem] border border-studio-primary/10 bg-white p-6 shadow-xl md:p-8">
          <h2 className="font-serif text-2xl font-semibold text-studio-primary">Order Summary</h2>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-studio-ink/60">Subtotal</span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-studio-ink/60">Discount</span>
              <span className="font-semibold text-emerald-600">-{formatCurrency(discount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-studio-ink/60">Shipping</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="mt-4 flex justify-between border-t border-studio-primary/10 pt-4 font-serif text-xl font-bold text-studio-primary">
              <span>Total</span>
              <span>{formatCurrency(totalAfterDiscount)}</span>
            </div>
          </div>

          <div className="mt-8">
            <label htmlFor="couponCode" className="text-[10px] font-bold uppercase tracking-wider text-studio-ink/40">
              Coupon Code
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="couponCode"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="SAVE10"
                className="w-full rounded-xl border border-studio-primary/15 bg-studio-light/30 px-4 py-2 text-sm focus:border-studio-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="rounded-full bg-studio-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {appliedCoupon && (
              <p className="mt-2 text-[11px] font-medium text-emerald-600">
                Applied: {appliedCoupon.code} ({appliedCoupon.discountPercent}% off)
                <button onClick={() => setAppliedCoupon(null)} className="ml-2 text-studio-ink/40 underline">Remove</button>
              </p>
            )}
          </div>

          <button
            onClick={placeOrder}
            disabled={placingOrder}
            className={`mt-8 w-full rounded-full py-4 text-xs font-bold uppercase tracking-[0.2em] shadow-lg transition-all ${
              isAddressComplete 
                ? "bg-studio-primary text-white hover:bg-studio-accent hover:-translate-y-0.5" 
                : "bg-studio-ink/10 text-studio-ink/40 cursor-not-allowed"
            }`}
          >
            {placingOrder ? "Processing..." : "Secure Payment"}
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-studio-ink/40 uppercase tracking-widest font-bold">
            <LockIcon size={10} />
            Secure Razorpay Gateway
          </div>
        </div>
      </aside>
    </div>
  );
}