import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WishlistClient } from "@/components/store/WishlistClient";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <section className="section-shell py-12">
        <h1 className="text-4xl font-semibold text-studio-primary">Wishlist</h1>
        <p className="mt-3 text-studio-ink/75">Please login to view and manage your wishlist.</p>
        <Link
          href="/login?callbackUrl=%2Fwishlist"
          className="mt-6 inline-flex rounded-full bg-studio-primary px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-studio-accent"
        >
          Login to Access Wishlist
        </Link>
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

  return (
    <section className="section-shell py-12">
      <h1 className="text-4xl font-semibold text-studio-primary">Wishlist</h1>
      <p className="mt-3 text-studio-ink/75">Save your favorite looks for later.</p>
      <WishlistClient initialItems={items} />
    </section>
  );
}
