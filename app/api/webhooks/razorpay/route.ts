import { headers } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.text();

    const headerList = await headers();
    const signature = headerList.get("x-razorpay-signature");

    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expected) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      const order = await prisma.order.findUnique({
        where: { razorpayOrderId: payment.order_id },
        include: { items: true }, // ✅ IMPORTANT FIX
      });

      if (!order) {
        return new Response("Order not found", { status: 404 });
      }

      // ✅ Prevent duplicate processing
      if (order.paymentCaptured) {
        return new Response("Already processed", { status: 200 });
      }

      // ✅ Update order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          razorpayPaymentId: payment.id,
          paymentCaptured: true,
        },
      });

      // ✅ Reduce stock
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // ✅ Clear cart
      const cart = await prisma.cart.findUnique({
        where: { userId: order.userId },
      });

      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Internal error", { status: 500 });
  }
}