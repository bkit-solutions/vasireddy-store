import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = body;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: dbOrderId },
    data: {
      status: "PAID",
      razorpayPaymentId: razorpay_payment_id,
    },
  });

  return NextResponse.json({ success: true });
}