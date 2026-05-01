import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        products: {
          some: {
            isActive: true,
          },
        },
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
              },
            },
          },
        },
        products: {
          where: {
            isActive: true,
          },
          take: 3,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const categoriesWithStats = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: category._count.products,
      preview: category.products.slice(0, 3),
    }));

    return NextResponse.json({ data: categoriesWithStats });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
