import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CartClient } from "@/components/store/CartClient";

export default async function CartPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <section className="section-shell py-12">
        <h1 className="text-4xl font-semibold text-studio-primary">Your Cart</h1>
        <p className="mt-3 text-studio-ink/75">Please login to access your cart and continue checkout.</p>
        <Link
          href="/login?callbackUrl=%2Fcart"
          className="mt-6 inline-flex rounded-full bg-studio-primary px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-studio-accent"
        >
          Login to Access Cart
        </Link>
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

  return (
    <section className="section-shell py-12">
      <h1 className="text-4xl font-semibold text-studio-primary">Your Cart</h1>
      <p className="mt-3 text-studio-ink/75">Items added to cart will appear here before checkout.</p>
      <CartClient initialItems={items} />
    </section>
  );
}
