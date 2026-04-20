import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as { code?: string };
  const code = String(body.code ?? "").trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code },
  });

  if (!coupon || !coupon.active || (coupon.expiresAt && coupon.expiresAt <= new Date())) {
    return NextResponse.json(
      { error: "Coupon not found, expired, or inactive" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    code: coupon.code,
    discountPercent: coupon.discountPercent,
    description: coupon.description,
  });
}
