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

// Add DELETE method support
export async function DELETE(req: NextRequest) {
  try {
    // Get image ID from query params
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('id');
    
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