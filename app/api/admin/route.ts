import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [products, orders, customers, coupons] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.coupon.count(),
    ]);

    return NextResponse.json({
      data: {
        products,
        orders,
        customers,
        coupons,
      },
    });
  } catch {
    return NextResponse.json({
      data: {
        products: 0,
        orders: 0,
        customers: 0,
        coupons: 0,
      },
    });
  }
}
