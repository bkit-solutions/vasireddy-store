import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.product.basePrice * item.quantity,
    0
  );

  // ✅ Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: totalAmount,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  // ✅ Save order in DB
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      totalAmount,
      status: "PENDING",
      razorpayOrderId: razorpayOrder.id,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.basePrice,
        })),
      },
    },
  });

  return NextResponse.json({
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    dbOrderId: order.id,
  });
}