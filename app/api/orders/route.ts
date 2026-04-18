import { NextResponse } from "next/server";
import { stripe } from "@/lib/razorpay";

type CheckoutItem = {
  name: string;
  amount: number;
  quantity: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { items?: CheckoutItem[] };

    if (!body.items?.length) {
      return NextResponse.json({ error: "No checkout items provided" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: body.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "inr",
          unit_amount: item.amount,
          product_data: { name: item.name },
        },
      })),
      success_url: `${process.env.NEXTAUTH_URL}/account?checkout=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart?checkout=cancelled`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to create Stripe checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
