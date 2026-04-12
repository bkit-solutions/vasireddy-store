import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

async function getCurrentUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

async function getOrCreateUserCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await getOrCreateUserCart(userId);
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

  return NextResponse.json({ data: items });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { productId?: string; quantity?: number };
  const quantity = body.quantity ?? 1;

  if (!body.productId || quantity < 1) {
    return NextResponse.json({ error: "Invalid cart payload" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const cart = await getOrCreateUserCart(userId);

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: body.productId,
      },
    },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: body.productId,
        quantity,
      },
    });
  }

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

  return NextResponse.json({ data: items }, { status: 201 });
}

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { itemId?: string; quantity?: number };
  if (!body.itemId || typeof body.quantity !== "number") {
    return NextResponse.json({ error: "Invalid cart payload" }, { status: 400 });
  }

  const cart = await getOrCreateUserCart(userId);
  const existing = await prisma.cartItem.findFirst({
    where: { id: body.itemId, cartId: cart.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  if (body.quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: body.itemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: body.itemId },
      data: { quantity: body.quantity },
    });
  }

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

  return NextResponse.json({ data: items });
}

export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
  }

  const cart = await getOrCreateUserCart(userId);
  const existing = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

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

  return NextResponse.json({ data: items });
}
