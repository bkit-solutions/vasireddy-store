import { NextRequest, NextResponse } from "next/server";
import { deleteFromS3, isS3Configured } from "@/lib/s3-uploader";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  try {
    // ✅ Correct authentication
    const session = await getServerSession(authOptions);

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
    const { s3Key } = body;

    // Validate input
    if (!s3Key) {
      return NextResponse.json(
        { error: "Missing required field: s3Key" },
        { status: 400 }
      );
    }

    // Delete from S3
    await deleteFromS3(s3Key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("S3 deletion failed:", error);
    return NextResponse.json(
      { error: "Failed to delete image from S3" },
      { status: 500 }
    );
  }
}
