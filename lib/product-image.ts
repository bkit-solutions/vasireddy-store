import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "@/lib/cloudinary";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

function getFileExtension(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

async function uploadImageToLocalStorage(file: File) {
  const extension = getFileExtension(file.type);
  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  const uploadsDirectory = path.join(process.cwd(), "public", "uploads", "products");
  const filePath = path.join(uploadsDirectory, filename);

  await mkdir(uploadsDirectory, { recursive: true });
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  return `/uploads/products/${filename}`;
}

export async function uploadProductImage(file: File) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Upload JPG, PNG, WEBP, GIF, or AVIF images.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image size must be 8MB or smaller.");
  }

  if (isCloudinaryConfigured()) {
    return uploadImageToCloudinary(file);
  }

  return uploadImageToLocalStorage(file);
}
