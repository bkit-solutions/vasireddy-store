import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Reset all other addresses
  await prisma.address.updateMany({
    where: { userId: session.user.id },
    data: { isDefault: false }
  });

  // Set new default
  const address = await prisma.address.update({
    where: { id, userId: session.user.id },
    data: { isDefault: true }
  });

  return NextResponse.json(address);
}
