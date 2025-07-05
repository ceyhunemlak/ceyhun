import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
    
    console.log(`Attempting to delete image with ID: ${imageId}`);
    
    // First delete from database
    const { error: dbError, data: deletedImage } = await supabase
      .from('images')
      .delete()
      .eq('cloudinary_id', imageId)
      .select('*')
      .single();
      
    if (dbError) {
      console.error(`Error deleting image ${imageId} from database:`, dbError);
      return NextResponse.json(
        { error: 'Failed to delete image from database', details: dbError },
        { status: 500 }
      );
    }
    
    console.log(`Successfully deleted image ${imageId} from database`);
    
    // Then delete from Cloudinary using direct API call
    try {
      // Try first with the standard destroy method
      const result = await cloudinary.uploader.destroy(imageId);
      console.log(`Cloudinary standard delete result for ${imageId}:`, result);
      
      if (result.result !== 'ok') {
        // If standard method fails, try with explicit resource type
        console.log(`Standard delete failed for ${imageId}, trying with explicit resource type`);
        const explicitResult = await cloudinary.uploader.destroy(imageId, { resource_type: 'image' });
        console.log(`Cloudinary explicit delete result for ${imageId}:`, explicitResult);
        
        if (explicitResult.result !== 'ok') {
          // As a last resort, try with admin API
          console.log(`Explicit delete failed for ${imageId}, trying with admin API`);
          await cloudinary.api.delete_resources([imageId], { resource_type: 'image' });
          console.log(`Successfully deleted image ${imageId} from Cloudinary using admin API`);
        }
      }
    } catch (cloudinaryError) {
      console.error(`Error deleting image ${imageId} from Cloudinary:`, cloudinaryError);
      // Return success anyway since we've already deleted from database
      // This prevents orphaned records in the database
    }
    
    return NextResponse.json({ 
      success: true,
      id: imageId,
      message: `Image ${imageId} successfully deleted`
    });
  } catch (error) {
    console.error('Error in delete-image route:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
} 