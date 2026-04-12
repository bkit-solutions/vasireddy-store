import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { products as sampleProducts } from "@/lib/sample-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim().toLowerCase();

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { description: { contains: q } },
                { sku: { contains: q } },
                {
                  category: {
                    name: { contains: q },
                  },
                },
                {
                  category: {
                    slug: { contains: q.toLowerCase() },
                  },
                },
              ],
            }
          : {}),
        ...(category
          ? {
              category: {
                slug: category,
              },
            }
          : {}),
      },
      include: { category: true, variants: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: products });
  } catch {
    return NextResponse.json({ data: sampleProducts, source: "sample" });
  }
}
