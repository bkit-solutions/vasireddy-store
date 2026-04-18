import Link from "next/link";
import { getServerSession } from "next-auth";
import { Heart, Lock, Sparkles, ArrowRight } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WishlistClient } from "@/components/store/WishlistClient";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <section className="section-shell py-16 md:py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-pulse rounded-full bg-studio-primary/10" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-studio-primary/20 to-studio-accent/20 backdrop-blur-sm">
              <Heart className="h-10 w-10 text-studio-primary" fill="currentColor" />
            </div>
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-studio-primary/5 px-4 py-1.5 text-xs font-medium text-studio-primary">
            <Lock className="h-3.5 w-3.5" />
            Sign in required
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-studio-primary md:text-4xl">
            Your Wishlist Awaits
          </h1>
          <p className="mt-3 text-base leading-relaxed text-studio-ink/70">
            Sign in to save your favorite pieces and revisit them anytime. Curate your dream collection.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login?callbackUrl=%2Fwishlist"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-studio-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-studio-primary/20 transition-all hover:-translate-y-0.5 hover:bg-studio-accent hover:shadow-xl hover:shadow-studio-primary/30 sm:w-auto"
            >
              Sign In to Continue
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/products"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-studio-ink/15 bg-white px-7 py-3.5 text-sm font-semibold text-studio-ink transition-all hover:border-studio-primary hover:text-studio-primary sm:w-auto"
            >
              Browse Collection
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const itemCount = items.length;

  return (
    <section className="section-shell py-10 md:py-14">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 border-b border-studio-ink/10 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-studio-primary/10 to-studio-accent/10 px-3.5 py-1.5 text-xs font-medium text-studio-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Your Curated Collection
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-studio-primary md:text-5xl">
            Wishlist
          </h1>
          <p className="mt-3 max-w-xl text-studio-ink/70">
            {itemCount > 0
              ? `You have ${itemCount} ${itemCount === 1 ? "piece" : "pieces"} saved for later.`
              : "Save your favorite looks and revisit them anytime."}
          </p>
        </div>

        {itemCount > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-studio-ink/10 bg-white px-5 py-3">
            <Heart className="h-5 w-5 text-studio-primary" fill="currentColor" />
            <div>
              <p className="text-xs text-studio-ink/60">Saved items</p>
              <p className="text-lg font-semibold text-studio-primary">{itemCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {itemCount === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-studio-ink/15 bg-gradient-to-br from-studio-primary/[0.02] to-studio-accent/[0.02] px-6 py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
            <Heart className="h-10 w-10 text-studio-primary/40" />
          </div>
          <h2 className="text-2xl font-semibold text-studio-primary">Your wishlist is empty</h2>
          <p className="mt-2 max-w-sm text-sm text-studio-ink/60">
            Start exploring our collection and tap the heart icon to save pieces you love.
          </p>
          <Link
            href="/products"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-studio-primary px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-studio-accent hover:shadow-lg"
          >
            Explore Collection
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <WishlistClient initialItems={items} />
      )}
    </section>
  );
}