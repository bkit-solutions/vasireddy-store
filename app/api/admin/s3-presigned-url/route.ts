import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getProductImageCount, isS3Configured } from "@/lib/s3-uploader";
import { auth } from "@/lib/auth";

const MAX_IMAGES_PER_PRODUCT = 5;
const ALLOWED_FORMATS = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * POST /api/admin/s3-presigned-url
 * Generate a presigned URL for client-side S3 uploads
 * 
 * Request body:
 * {
 *   productId: string;
 *   fileName: string;
 *   contentType: string;
 * }
 * 
 * Response:
 * {
 *   presignedUrl: string;
 *   s3Key: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check S3 configuration
    if (!isS3Configured()) {
      return NextResponse.json(
        { error: "S3 is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { productId, fileName, contentType } = body;

    // Validate input
    if (!productId || !fileName || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields: productId, fileName, contentType" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FORMATS.has(contentType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Check image count
    const imageCount = await getProductImageCount(productId);
    if (imageCount >= MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES_PER_PRODUCT} images per product allowed.` },
        { status: 400 }
      );
    }

    // Generate S3 key
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = contentType.split("/")[1];
    const s3Key = `products/${productId}/${timestamp}-${random}.${extension}`;

    // Create S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    // Generate presigned URL (valid for 1 hour)
    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || "",
      Key: s3Key,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000", // 1 year cache
    });

    const presignedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 3600, // 1 hour
    });

    // Generate public URL
    const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL;
    const publicUrl = cloudFrontUrl
      ? `${cloudFrontUrl}/${s3Key}`
      : `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${s3Key}`;

    return NextResponse.json({
      presignedUrl,
      s3Key,
      publicUrl,
    });
  } catch (error) {
    console.error("Presigned URL generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
