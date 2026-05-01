import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { isS3Configured, uploadToS3 } from "@/lib/s3-uploader";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB - aligned with Next.js bodySizeLimit
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getFileExtension(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
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

/**
 * Upload product image to S3 or fallback to local storage
 * @param file - The image file to upload
 * @param productId - The product ID for S3 folder organization
 * @returns The image URL
 */
export async function uploadProductImage(file: File, productId?: string) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Only JPG, PNG, and WebP are allowed.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`Image size must be ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB or smaller.`);
  }

  // Use S3 if configured
  if (isS3Configured() && productId) {
    try {
      const response = await uploadToS3(file, productId);
      return response.url;
    } catch (error) {
      console.error("S3 upload failed, falling back to local storage:", error);
      // Fallback to local storage if S3 fails
      return uploadImageToLocalStorage(file);
    }
  }

  // Fallback to local storage
  return uploadImageToLocalStorage(file);
}
