import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { 
    couponCode?: string | null,
    addressId?: string | null,
    shippingDetails: {
      name: string;
      phone: string;
      street: string;
      city: string;
      state: string;
      pincode: string;
    }
  };
  
  const couponCode = body.couponCode?.trim().toUpperCase() ?? null;
  const { shippingDetails } = body;

  // 🛡️ Server-side guard: Mandatory Address Check
  if (
    !shippingDetails ||
    !shippingDetails.name ||
    !shippingDetails.phone ||
    !shippingDetails.street ||
    !shippingDetails.city ||
    !shippingDetails.state ||
    !shippingDetails.pincode
  ) {
    return NextResponse.json(
      { error: "Shipping details are mandatory for delivery" },
      { status: 400 }
    );
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

  let finalAmount = totalAmount;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (!coupon || !coupon.active || (coupon.expiresAt && coupon.expiresAt <= new Date())) {
      return NextResponse.json(
        { error: "Coupon not found, expired, or inactive" },
        { status: 400 }
      );
    }

    finalAmount = Math.round((totalAmount * (100 - coupon.discountPercent)) / 100);
  }

  // ✅ Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: finalAmount,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  // ✅ Save order in DB with shipping details
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      totalAmount: finalAmount,
      status: "PENDING",
      razorpayOrderId: razorpayOrder.id,
      
      // Shipping Details Snapshot
      shippingName: shippingDetails.name,
      shippingPhone: shippingDetails.phone,
      shippingAddress: shippingDetails.street,
      shippingCity: shippingDetails.city,
      shippingState: shippingDetails.state,
      shippingPincode: shippingDetails.pincode,

      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.basePrice,
        })),
      },
    },
  });

  // ✅ Save NEW address in User profile if it wasn't selected from existing ones
  if (!body.addressId) {
    try {
      // Check if an identical address already exists for this user to avoid duplicates
      const existing = await prisma.address.findFirst({
        where: {
          userId: session.user.id,
          name: shippingDetails.name,
          phone: shippingDetails.phone,
          street: shippingDetails.street,
          city: shippingDetails.city,
          state: shippingDetails.state,
          pincode: shippingDetails.pincode,
        },
      });

      if (!existing) {
        await prisma.address.create({
          data: {
            userId: session.user.id,
            name: shippingDetails.name,
            phone: shippingDetails.phone,
            street: shippingDetails.street,
            city: shippingDetails.city,
            state: shippingDetails.state,
            pincode: shippingDetails.pincode,
            // If they have no addresses, make this one the default
            isDefault: (await prisma.address.count({ where: { userId: session.user.id } })) === 0,
          },
        });
      }
    } catch (error) {
      console.error("Failed to auto-save address to profile", error);
    }
  }

  return NextResponse.json({
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    dbOrderId: order.id,
  });
}