import Link from "next/link";
import { getServerSession } from "next-auth";
import { ShoppingBag, Lock, ArrowRight, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CartClient } from "@/components/store/CartClient";

export default async function CartPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <section className="section-shell py-16 md:py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-pulse rounded-full bg-studio-primary/10" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-studio-primary/20 to-studio-accent/20 backdrop-blur-sm">
              <ShoppingBag className="h-10 w-10 text-studio-primary" />
            </div>
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-studio-primary/5 px-4 py-1.5 text-xs font-medium text-studio-primary">
            <Lock className="h-3.5 w-3.5" />
            Sign in required
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-studio-primary md:text-4xl">
            Your Shopping Bag
          </h1>
          <p className="mt-3 text-base leading-relaxed text-studio-ink/70">
            Sign in to view your cart, save items, and complete your purchase seamlessly.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login?callbackUrl=%2Fcart"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-studio-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-studio-primary/20 transition-all hover:-translate-y-0.5 hover:bg-studio-accent hover:shadow-xl sm:w-auto"
            >
              Sign In to Continue
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/products"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-studio-ink/15 bg-white px-7 py-3.5 text-sm font-semibold text-studio-ink transition-all hover:border-studio-primary hover:text-studio-primary sm:w-auto"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-studio-ink/10 pt-8">
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-studio-primary/70" />
              <span className="text-xs text-studio-ink/60">Secure checkout</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Truck className="h-5 w-5 text-studio-primary/70" />
              <span className="text-xs text-studio-ink/60">Fast delivery</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const cart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const itemCount = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);

  return (
    <section className="section-shell py-10 md:py-14">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 border-b border-studio-ink/10 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-studio-ink/60">
            <Link href="/" className="hover:text-studio-primary">
              Home
            </Link>
            <span>/</span>
            <span className="text-studio-primary">Cart</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-studio-primary md:text-5xl">
            Shopping Bag
          </h1>
          <p className="mt-3 max-w-xl text-studio-ink/70">
            {itemCount > 0
              ? `Review your ${itemCount} ${itemCount === 1 ? "item" : "items"} before heading to checkout.`
              : "Items added to your cart will appear here."}
          </p>
        </div>

        {itemCount > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-studio-ink/10 bg-white px-5 py-3">
            <ShoppingBag className="h-5 w-5 text-studio-primary" />
            <div>
              <p className="text-xs text-studio-ink/60">Items in bag</p>
              <p className="text-lg font-semibold text-studio-primary">{itemCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Empty Cart State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-studio-ink/15 bg-gradient-to-br from-studio-primary/[0.02] to-studio-accent/[0.02] px-6 py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
            <ShoppingBag className="h-10 w-10 text-studio-primary/40" />
          </div>
          <h2 className="text-2xl font-semibold text-studio-primary">Your bag is empty</h2>
          <p className="mt-2 max-w-sm text-sm text-studio-ink/60">
            Looks like you haven&apos;t added anything yet. Discover our latest pieces and start shopping.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-studio-primary px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-studio-accent hover:shadow-lg"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/wishlist"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-studio-ink/15 bg-white px-7 py-3.5 text-sm font-semibold text-studio-ink transition-all hover:border-studio-primary hover:text-studio-primary"
            >
              View Wishlist
            </Link>
          </div>
        </div>
      ) : (
        <>
          <CartClient initialItems={items} />

          {/* Trust indicators */}
          <div className="mt-12 grid grid-cols-1 gap-4 border-t border-studio-ink/10 pt-8 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl bg-studio-primary/[0.03] px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <ShieldCheck className="h-5 w-5 text-studio-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-studio-primary">Secure Checkout</p>
                <p className="text-xs text-studio-ink/60">SSL encrypted payment</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-studio-primary/[0.03] px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <Truck className="h-5 w-5 text-studio-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-studio-primary">Free Shipping</p>
                <p className="text-xs text-studio-ink/60">On orders over $100</p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}