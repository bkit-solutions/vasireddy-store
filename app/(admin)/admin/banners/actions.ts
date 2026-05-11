"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadProductImage } from "@/lib/product-image";
import { randomUUID } from "crypto";

async function resolveBannerImageUrl(formData: FormData, bannerId?: string): Promise<string | null> {
  const inputUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageFile = formData.get("imageFile");

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      // Use "banners" as a prefix or just follow product pattern
      const uploadId = bannerId || `banner-${randomUUID()}`;
      return await uploadProductImage(imageFile, uploadId);
    } catch (error) {
      console.error("Banner image upload failed", error);
      throw new Error("Failed to upload banner image.");
    }
  }

  return inputUrl || null;
}

export async function createBanner(formData: FormData) {
  const altText = String(formData.get("altText") ?? "");
  const tag = String(formData.get("tag") ?? "");
  const link = String(formData.get("link") ?? "");
  const order = parseInt(String(formData.get("order") ?? "0"));

  try {
    const bannerId = randomUUID();
    const imageUrl = await resolveBannerImageUrl(formData, bannerId);

    if (!imageUrl || !altText) {
      return;
    }

    await prisma.banner.create({
      data: {
        id: bannerId,
        imageUrl,
        altText,
        tag,
        link,
        order,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/banners");
  } catch (error) {
    console.error("Create banner failed", error);
  }

  redirect("/admin/banners?status=success&message=Banner created");
}

export async function updateBanner(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const altText = String(formData.get("altText") ?? "");
  const tag = String(formData.get("tag") ?? "");
  const link = String(formData.get("link") ?? "");
  const order = parseInt(String(formData.get("order") ?? "0"));

  try {
    const imageUrl = await resolveBannerImageUrl(formData, id);

    if (!id || !altText) {
      return;
    }

    const updateData: any = {
      altText,
      tag,
      link,
      order,
    };

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    await prisma.banner.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/");
    revalidatePath("/admin/banners");
  } catch (error) {
    console.error("Update banner failed", error);
  }

  redirect("/admin/banners?status=success&message=Banner updated");
}

export async function deleteBanner(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  try {
    await prisma.banner.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/banners");
  } catch (error) {
    console.error("Delete banner failed", error);
  }

  redirect("/admin/banners?status=success&message=Banner deleted");
}

export async function toggleBannerStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.banner.update({
      where: { id },
      data: { active: !currentStatus },
    });

    revalidatePath("/");
    revalidatePath("/admin/banners");
  } catch (error) {
    console.error("Toggle banner status failed", error);
  }
}
