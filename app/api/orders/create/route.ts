import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || !cart.items.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const totalAmount = cart.items.reduce((sum, item) => sum + item.product.basePrice * item.quantity, 0);

  const order = await prisma.order.create({
    data: {
      userId,
      status: "PENDING",
      totalAmount,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.basePrice,
        })),
      },
    },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return NextResponse.json({ data: { id: order.id } }, { status: 201 });
}
