import { NextResponse } from "next/server";
import { getCategoriesWithStats } from "@/lib/store-data";

export async function GET() {
  try {
    const categories = await getCategoriesWithStats();
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("API Categories Stats Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category statistics" },
      { status: 500 }
    );
  }
}
