import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("productId" in body) ||
    !("rating" in body)
  ) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { productId, rating, comment } = body as {
    productId: string;
    rating: number;
    comment?: string;
  };

  if (
    typeof productId !== "string" ||
    !productId ||
    typeof rating !== "number" ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const safeComment =
    typeof comment === "string" ? comment.trim().slice(0, 1000) : null;

  const review = await prisma.review.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: { rating: Math.round(rating), comment: safeComment },
    create: {
      userId: session.user.id,
      productId,
      rating: Math.round(rating),
      comment: safeComment,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
