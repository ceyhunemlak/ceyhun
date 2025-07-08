import { NextRequest, NextResponse } from "next/server";
import { deleteCloudinaryImage } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const { publicId } = await req.json();
    
    if (!publicId) {
      return NextResponse.json({ error: "Public ID is required" }, { status: 400 });
    }

    const result = await deleteCloudinaryImage(publicId);
    
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
} 