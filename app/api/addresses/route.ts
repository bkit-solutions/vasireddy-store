import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, phone, street, city, state, pincode } = body;

  if (!name || !phone || !street || !city || !state || !pincode) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // Check if this is the first address
  const existingCount = await prisma.address.count({
    where: { userId: session.user.id }
  });

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      name,
      phone,
      street,
      city,
      state,
      pincode,
      isDefault: existingCount === 0,
    }
  });

  return NextResponse.json(address);
}
