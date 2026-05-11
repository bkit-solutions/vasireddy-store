import { prisma } from "./prisma";

export async function getActiveBanners() {
  try {
    return await prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch banners", error);
    return [];
  }
}
