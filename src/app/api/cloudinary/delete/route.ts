import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function DELETE(request: NextRequest) {
  try {
    // Get image ID from query params
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');
    
    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Attempting to delete image from Cloudinary with ID: ${imageId}`);
    
    // Try multiple deletion methods to ensure the image is deleted
    let success = false;
    const errors = [];
    
    // Method 1: Standard destroy
    try {
      console.log(`Method 1: Standard destroy for ${imageId}`);
      const result = await cloudinary.uploader.destroy(imageId);
      console.log(`Method 1 result:`, result);
      
      if (result.result === 'ok' || result.result === 'not found') {
        success = true;
        console.log(`Successfully deleted image ${imageId} using standard destroy`);
      } else {
        errors.push(`Standard destroy failed: ${result.result}`);
      }
    } catch (error) {
      console.error(`Error in Method 1 (standard destroy) for ${imageId}:`, error);
      errors.push(`Standard destroy error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Method 2: Destroy with explicit resource type
    if (!success) {
      try {
        console.log(`Method 2: Explicit resource type destroy for ${imageId}`);
        const result = await cloudinary.uploader.destroy(imageId, { resource_type: 'image' });
        console.log(`Method 2 result:`, result);
        
        if (result.result === 'ok' || result.result === 'not found') {
          success = true;
          console.log(`Successfully deleted image ${imageId} using explicit resource type`);
        } else {
          errors.push(`Explicit resource type destroy failed: ${result.result}`);
        }
      } catch (error) {
        console.error(`Error in Method 2 (explicit resource type) for ${imageId}:`, error);
        errors.push(`Explicit resource type error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Method 3: Admin API delete_resources
    if (!success) {
      try {
        console.log(`Method 3: Admin API delete_resources for ${imageId}`);
        const result = await cloudinary.api.delete_resources([imageId], { resource_type: 'image' });
        console.log(`Method 3 result:`, result);
        
        // Check if the deletion was successful by examining the result
        if (result && result.deleted && result.deleted[imageId] === 'deleted') {
          success = true;
          console.log(`Successfully deleted image ${imageId} using admin API`);
        } else {
          errors.push(`Admin API delete_resources failed`);
        }
      } catch (error) {
        console.error(`Error in Method 3 (admin API) for ${imageId}:`, error);
        errors.push(`Admin API error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Method 4: Try with raw resource type
    if (!success) {
      try {
        console.log(`Method 4: Raw resource type for ${imageId}`);
        const result = await cloudinary.uploader.destroy(imageId, { resource_type: 'raw' });
        console.log(`Method 4 result:`, result);
        
        if (result.result === 'ok' || result.result === 'not found') {
          success = true;
          console.log(`Successfully deleted ${imageId} using raw resource type`);
        } else {
          errors.push(`Raw resource type failed: ${result.result}`);
        }
      } catch (error) {
        console.error(`Error in Method 4 (raw resource type) for ${imageId}:`, error);
        errors.push(`Raw resource type error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Method 5: Try with video resource type
    if (!success) {
      try {
        console.log(`Method 5: Video resource type for ${imageId}`);
        const result = await cloudinary.uploader.destroy(imageId, { resource_type: 'video' });
        console.log(`Method 5 result:`, result);
        
        if (result.result === 'ok' || result.result === 'not found') {
          success = true;
          console.log(`Successfully deleted ${imageId} using video resource type`);
        } else {
          errors.push(`Video resource type failed: ${result.result}`);
        }
      } catch (error) {
        console.error(`Error in Method 5 (video resource type) for ${imageId}:`, error);
        errors.push(`Video resource type error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return NextResponse.json({ 
      success,
      id: imageId,
      errors: errors.length > 0 ? errors : undefined,
      message: success 
        ? `Image ${imageId} successfully deleted from Cloudinary` 
        : `Failed to delete image ${imageId} from Cloudinary`
    });
  } catch (error) {
    console.error('Error in cloudinary delete route:', error);
    return NextResponse.json(
      { error: 'Failed to delete image from Cloudinary', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 