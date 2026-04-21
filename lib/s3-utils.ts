import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * Utility functions for S3 operations
 * These helpers can be used throughout the application for common S3 tasks
 */

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";
const CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL || "";

/**
 * Get all images for a product
 */
export async function getProductImages(productId: string): Promise<Array<{ key: string; url: string }>> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `products/${productId}/`,
    });

    const response = await s3Client.send(command);
    const images: Array<{ key: string; url: string }> = [];

    if (response.Contents) {
      for (const content of response.Contents) {
        if (!content.Key) continue;

        const url = CLOUDFRONT_URL
          ? `${CLOUDFRONT_URL}/${content.Key}`
          : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${content.Key}`;

        images.push({
          key: content.Key,
          url,
        });
      }
    }

    return images;
  } catch (error) {
    console.error("Error getting product images:", error);
    return [];
  }
}

/**
 * Delete all images for a product (when deleting product)
 */
export async function deleteProductImages(productId: string): Promise<void> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `products/${productId}/`,
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      return;
    }

    // Delete all objects in the product folder
    for (const content of response.Contents) {
      if (!content.Key) continue;

      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: content.Key,
      });

      await s3Client.send(deleteCommand);
    }

    console.log(`Deleted all images for product ${productId}`);
  } catch (error) {
    console.error("Error deleting product images:", error);
    // Don't throw error - continue with product deletion even if image deletion fails
  }
}

/**
 * Get S3 URL from key
 */
export function getS3Url(s3Key: string): string {
  if (CLOUDFRONT_URL) {
    return `${CLOUDFRONT_URL}/${s3Key}`;
  }

  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${s3Key}`;
}

/**
 * Extract product ID from S3 key
 */
export function extractProductIdFromS3Key(s3Key: string): string | null {
  const match = s3Key.match(/products\/([^/]+)\//);
  return match ? match[1] : null;
}

/**
 * Validate S3 configuration
 */
export function validateS3Configuration(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.AWS_REGION) {
    errors.push("AWS_REGION is not set");
  }

  if (!process.env.AWS_ACCESS_KEY_ID) {
    errors.push("AWS_ACCESS_KEY_ID is not set");
  }

  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    errors.push("AWS_SECRET_ACCESS_KEY is not set");
  }

  if (!process.env.AWS_S3_BUCKET_NAME) {
    errors.push("AWS_S3_BUCKET_NAME is not set");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
