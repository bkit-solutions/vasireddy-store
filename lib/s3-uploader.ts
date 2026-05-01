import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { randomBytes } from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";
const CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL || "";
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB - aligned with Next.js bodySizeLimit
const MAX_IMAGES_PER_PRODUCT = 5;
const ALLOWED_FORMATS = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface S3UploadResponse {
  url: string;
  key: string;
  fileName: string;
}

/**
 * Validate S3 configuration
 */
export function isS3Configured(): boolean {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME &&
    process.env.AWS_REGION
  );
}

/**
 * Compress and resize image to standard dimensions
 * - Max width: 1200px for web
 * - Quality: 80% for JPEG
 * - Convert WebP to JPEG for better compatibility
 */
export async function compressImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; format: string }> {
  let pipeline = sharp(buffer);

  // Resize to max width of 1200px while maintaining aspect ratio
  const metadata = await pipeline.metadata();
  if (metadata.width && metadata.width > 1200) {
    pipeline = pipeline.resize(1200, 1200, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Convert to JPEG with quality 80
  pipeline = pipeline.jpeg({ quality: 80, progressive: true });

  const compressed = await pipeline.toBuffer();
  return { buffer: compressed, format: "jpg" };
}

/**
 * Generate a unique filename for the image
 * Format: {timestamp}-{random}.{ext}
 */
function generateFileName(format: string): string {
  const timestamp = Date.now();
  const random = randomBytes(8).toString("hex");
  return `${timestamp}-${random}.${format}`;
}

/**
 * Get the number of images already uploaded for a product
 */
export async function getProductImageCount(productId: string): Promise<number> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `products/${productId}/`,
    });

    const response = await s3Client.send(command);
    return response.Contents?.length || 0;
  } catch (error) {
    console.error("Error getting image count:", error);
    return 0;
  }
}

/**
 * Upload image to S3
 * - Stores under /products/{productId}/
 * - Automatically compresses and resizes
 * - Limits 5 images per product
 */
export async function uploadToS3(
  file: File,
  productId: string
): Promise<S3UploadResponse> {
  // Validate S3 configuration
  if (!isS3Configured()) {
    throw new Error(
      "S3 is not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME, and AWS_REGION."
    );
  }

  // Validate file type
  if (!ALLOWED_FORMATS.has(file.type)) {
    throw new Error("Unsupported file type. Only JPG, PNG, and WebP are allowed.");
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Image size must be ${MAX_FILE_SIZE / (1024 * 1024)}MB or smaller.`);
  }

  // Check image count
  const imageCount = await getProductImageCount(productId);
  if (imageCount >= MAX_IMAGES_PER_PRODUCT) {
    throw new Error(`Maximum ${MAX_IMAGES_PER_PRODUCT} images per product allowed.`);
  }

  try {
    // Read and compress image
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { buffer: compressedBuffer, format } = await compressImage(fileBuffer, file.type);

    // Generate unique filename
    const fileName = generateFileName(format);
    const key = `products/${productId}/${fileName}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: compressedBuffer,
      ContentType: "image/jpeg",
      ContentDisposition: "inline",
      CacheControl: "public, max-age=31536000", // 1 year cache
      Metadata: {
        "original-name": file.name,
        "upload-date": new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    // Generate URL
    const url = CLOUDFRONT_URL
      ? `${CLOUDFRONT_URL}/${key}`
      : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

    return {
      url,
      key,
      fileName,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`S3 upload failed: ${error.message}`);
    }
    throw new Error("S3 upload failed");
  }
}

/**
 * Delete an image from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  if (!isS3Configured()) {
    throw new Error("S3 is not configured.");
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error("Failed to delete image from S3");
  }
}

/**
 * Generate a signed URL for temporary access (useful for private images)
 * Valid for 24 hours by default
 */
export async function generateSignedUrl(key: string, expiresIn: number = 86400): Promise<string> {
  if (!isS3Configured()) {
    throw new Error("S3 is not configured.");
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL");
  }
}

// Import for signed URL generation
import { GetObjectCommand } from "@aws-sdk/client-s3";
