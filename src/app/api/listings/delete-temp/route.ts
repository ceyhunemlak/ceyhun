import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { deleteCloudinaryFolder } from '@/lib/cloudinary';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const folderPath = searchParams.get('folderPath');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Attempting to delete temporary listing with ID: ${id}`);
    
    // Delete any images from the database
    if (id) {
      try {
        const { error: imagesError } = await supabase
          .from('images')
          .delete()
          .eq('listing_id', id);
        
        if (imagesError) {
          console.error('Error deleting images:', imagesError);
        } else {
          console.log(`Successfully deleted images for listing ID: ${id}`);
        }
      } catch (error) {
        console.error('Error deleting images:', error);
      }
    }
    
    // Delete any address records
    try {
      const { error: addressError } = await supabase
        .from('addresses')
        .delete()
        .eq('listing_id', id);
      
      if (addressError) {
        console.error('Error deleting address:', addressError);
      } else {
        console.log(`Successfully deleted address for listing ID: ${id}`);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
    
    // Delete any property-specific details
    const detailsTables = ['konut_details', 'ticari_details', 'arsa_details', 'vasita_details'];
    
    for (const table of detailsTables) {
      try {
        const { error: detailsError } = await supabase
          .from(table)
          .delete()
          .eq('listing_id', id);
        
        if (detailsError) {
          console.error(`Error deleting ${table}:`, detailsError);
        } else {
          console.log(`Successfully deleted ${table} for listing ID: ${id}`);
        }
      } catch (error) {
        console.error(`Error deleting ${table}:`, error);
      }
    }
    
    // Delete the listing itself
    const { error: listingError } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);
    
    if (listingError) {
      console.error('Error deleting listing:', listingError);
      return NextResponse.json(
        { error: 'Failed to delete listing' },
        { status: 500 }
      );
    }
    
    console.log(`Successfully deleted listing with ID: ${id} from database`);
    
    // Delete the Cloudinary folder if a path is provided
    let cloudinaryFolderDeleted = false;
    
    if (folderPath) {
      try {
        console.log(`Attempting to delete Cloudinary folder: ${folderPath}`);
        cloudinaryFolderDeleted = await deleteCloudinaryFolder(folderPath);
        
        if (cloudinaryFolderDeleted) {
          console.log(`Successfully deleted Cloudinary folder: ${folderPath}`);
        } else {
          console.error(`Failed to delete Cloudinary folder: ${folderPath}`);
        }
      } catch (error) {
        console.error('Error deleting Cloudinary folder:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      id,
      cloudinaryFolderDeleted,
      folderPath
    });
  } catch (error) {
    console.error('Error in listings delete-temp route:', error);
    return NextResponse.json(
      { error: 'Failed to delete temporary listing' },
      { status: 500 }
    );
  }
} 