import { prisma } from "@/lib/prisma";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  category: string;
  categorySlug: string;
  price: number;
  description: string;
  stock: number;
  isActive: boolean;
};

export type CategoryWithStats = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  description?: string;
};

export async function getStoreCategories() {
  const categories = await prisma.category.findMany({
    where: {
      products: {
        some: {
          isActive: true,
        },
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
    },
  });

  return categories.map((category) => ({
    id: category.id,
    title: category.name,
    slug: category.slug,
    imageUrl: category.imageUrl,
  }));
}

export async function getCategoriesWithStats() {
  const categories = await prisma.category.findMany({
    where: {
      products: {
        some: {
          isActive: true,
        },
      },
    },
    include: {
      products: {
        where: { isActive: true },
        take: 1,
        select: { imageUrl: true },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          products: {
            where: {
              isActive: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    productCount: category._count.products,
    // Fallback: Use category image, then first product image, then null
    imageUrl: category.imageUrl || category.products[0]?.imageUrl || null,
  }));
}

export async function getTrendingProducts(take: number = 3) {
  return getActiveProducts({ take, isTrending: true });
}

export async function getActiveProducts(options?: { q?: string; category?: string; take?: number; isTrending?: boolean }) {
  const q = options?.q?.trim().toLowerCase();
  const category = options?.category?.trim();
  const isTrending = options?.isTrending;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(isTrending !== undefined ? { isTrending } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
              { sku: { contains: q } },
              {
                category: {
                  OR: [
                    { name: { contains: q } },
                    { slug: { contains: q } },
                  ],
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
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    ...(options?.take ? { take: options.take } : {}),
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: product.imageUrl,
    category: product.category.name,
    categorySlug: product.category.slug,
    price: Math.round(product.basePrice / 100),
    description: product.description,
    stock: product.stock,
    isActive: product.isActive,
  } satisfies StoreProduct));
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!product || !product.isActive) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: product.imageUrl,
    category: product.category.name,
    categorySlug: product.category.slug,
    price: Math.round(product.basePrice / 100),
    description: product.description,
    stock: product.stock,
    isActive: product.isActive,
  } satisfies StoreProduct;
}

export async function getProductsByCategory(categorySlug: string, options?: { limit?: number; offset?: number }) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        slug: categorySlug,
      },
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    ...(options?.limit ? { take: options.limit } : {}),
    ...(options?.offset ? { skip: options.offset } : {}),
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: product.imageUrl,
    category: product.category.name,
    categorySlug: product.category.slug,
    price: Math.round(product.basePrice / 100),
    description: product.description,
    stock: product.stock,
    isActive: product.isActive,
  } satisfies StoreProduct));
}

export async function searchProducts(query: string, options?: { limit?: number; categorySlug?: string }) {
  const q = query.trim();
  if (!q) return [];

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(options?.categorySlug
        ? {
            category: {
              slug: options.categorySlug,
            },
          }
        : {}),
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
        {
          category: {
            name: { contains: q },
          },
        },
      ],
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    ...(options?.limit ? { take: options.limit } : { take: 50 }),
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: product.imageUrl,
    category: product.category.name,
    categorySlug: product.category.slug,
    price: Math.round(product.basePrice / 100),
    description: product.description,
    stock: product.stock,
    isActive: product.isActive,
  } satisfies StoreProduct));
}
