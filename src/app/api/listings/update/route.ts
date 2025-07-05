import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { handleEnumField } from '@/lib/utils';
import { deleteCloudinaryImage, renameCloudinaryFolder } from '@/lib/cloudinary';
import { cloudinary } from '@/lib/cloudinary';

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      id,
      title,
      description,
      price,
      property_type,
      listing_status,
      photos,
      photosToDelete,
      folderRename,
      ...details
    } = data;

    // Validate required fields
    if (!id || !title || !description || !price || !property_type) {
      console.error('Missing required fields:', { id, title, description, price, property_type });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Updating listing with data:', { 
      id,
      title,
      description,
      price,
      property_type,
      listing_status: listing_status || 'satilik'
    });

    // Handle folder rename if requested
    if (folderRename && folderRename.oldPath && folderRename.newPath) {
      console.log(`Renaming folder from ${folderRename.oldPath} to ${folderRename.newPath}`);
      
      try {
        const renameResult = await renameCloudinaryFolder(folderRename.oldPath, folderRename.newPath);
        
        if (renameResult.success) {
          console.log(`Successfully renamed folder from ${folderRename.oldPath} to ${folderRename.newPath}`);
          
          // Update image records in the database if resources were moved
          if (renameResult.movedResources && renameResult.movedResources.length > 0) {
            console.log(`Updating ${renameResult.movedResources.length} image records with new paths`);
            
            for (const resource of renameResult.movedResources) {
              try {
                // Update the image record in the database
                const { error } = await supabase
                  .from('images')
                  .update({
                    cloudinary_id: resource.newId,
                    url: resource.newUrl
                  })
                  .eq('cloudinary_id', resource.oldId);
                
                if (error) {
                  console.error(`Error updating image record for ${resource.oldId} -> ${resource.newId}:`, error);
                }
              } catch (updateError) {
                console.error(`Error updating image record for ${resource.oldId}:`, updateError);
              }
            }
          }
        } else {
          console.error(`Failed to rename folder from ${folderRename.oldPath} to ${folderRename.newPath}`);
        }
      } catch (error) {
        console.error(`Error renaming folder: ${error instanceof Error ? error.message : String(error)}`);
        // Continue with the update even if folder rename fails
      }
    }

    // Delete photos if requested
    if (photosToDelete && photosToDelete.length > 0) {
      console.log(`Deleting ${photosToDelete.length} photos from Cloudinary and database`);
      
      for (const photoId of photosToDelete) {
        try {
          // First delete from database to ensure we don't have orphaned records
          const { error: dbDeleteError, data: deletedImage } = await supabase
            .from('images')
            .delete()
            .eq('cloudinary_id', photoId)
            .select('*')
            .single();
            
          if (dbDeleteError) {
            console.error(`Error deleting photo ${photoId} from database:`, dbDeleteError);
          } else {
            console.log(`Successfully deleted photo ${photoId} from database`);
          }
          
          // Then delete from Cloudinary using enhanced method
          const deleteResult = await deleteCloudinaryImage(photoId);
          console.log(`Deleted photo ${photoId} from Cloudinary: ${deleteResult ? 'success' : 'failed'}`);
          
          // If the standard deletion failed, try a direct API call as a backup
          if (!deleteResult) {
            console.log(`Standard deletion failed for ${photoId}, trying direct API call`);
            try {
              // Try with admin API as a last resort
              await cloudinary.api.delete_resources([photoId], { resource_type: 'image' });
              console.log(`Successfully deleted photo ${photoId} using admin API`);
            } catch (cloudinaryError) {
              console.error(`Error deleting photo ${photoId} with admin API:`, cloudinaryError);
            }
          }
        } catch (error) {
          console.error(`Error deleting photo ${photoId}:`, error);
          // Continue with other deletions even if one fails
        }
      }
    } else {
      console.log('No photos explicitly marked for deletion');
    }

    // 1. Update main listings table
    const { error: listingError } = await supabase
      .from('listings')
      .update({
        title,
        description,
        price,
        property_type,
        listing_status: handleEnumField(listing_status) || 'satilik', // Ensure listing_status is never empty
      })
      .eq('id', id);

    if (listingError) {
      console.error('Error updating listing:', listingError);
      return NextResponse.json(
        { error: 'Failed to update listing', details: listingError },
        { status: 500 }
      );
    }

    // 2. Update the appropriate details table based on property_type
    let detailsError = null;

    if (property_type === 'konut') {
      const {
        konut_type,
        gross_sqm,
        net_sqm,
        room_count,
        building_age,
        floor,
        total_floors,
        heating,
        has_balcony,
        has_elevator,
        is_furnished,
        allows_trade,
        is_eligible_for_credit
      } = details;

      // Check required enum fields
      if (!konut_type) {
        console.error('Error: konut_type is required');
        return NextResponse.json(
          { error: 'Konut tipi seçilmeden ilan güncellenemez.' },
          { status: 400 }
        );
      }

      if (!room_count) {
        console.error('Error: room_count is required');
        return NextResponse.json(
          { error: 'Oda sayısı seçilmeden ilan güncellenemez.' },
          { status: 400 }
        );
      }

      // Log konut details for debugging
      console.log('Updating konut details:', {
        konut_type: handleEnumField(konut_type),
        room_count: handleEnumField(room_count),
        heating: handleEnumField(heating)
      });

      const { error } = await supabase
        .from('konut_details')
        .update({
          konut_type: handleEnumField(konut_type),
          gross_sqm,
          net_sqm,
          room_count: handleEnumField(room_count),
          building_age,
          floor: floor || 0, // Ensure floor is never null
          total_floors,
          heating: handleEnumField(heating),
          has_balcony,
          has_elevator,
          is_furnished,
          allows_trade,
          is_eligible_for_credit
        })
        .eq('listing_id', id);
      
      detailsError = error;
    } else if (property_type === 'ticari') {
      const {
        ticari_type,
        gross_sqm,
        net_sqm,
        room_count,
        building_age,
        floor,
        total_floors,
        heating,
        allows_trade,
        is_eligible_for_credit
      } = details;

      // Check required enum fields
      if (!ticari_type) {
        console.error('Error: ticari_type is required');
        return NextResponse.json(
          { error: 'Ticari mülk tipi seçilmeden ilan güncellenemez.' },
          { status: 400 }
        );
      }

      // Log ticari details for debugging
      console.log('Updating ticari details:', {
        ticari_type: handleEnumField(ticari_type),
        heating: handleEnumField(heating)
      });

      const { error } = await supabase
        .from('ticari_details')
        .update({
          ticari_type: handleEnumField(ticari_type),
          gross_sqm,
          net_sqm,
          room_count,
          building_age,
          floor,
          total_floors,
          heating: handleEnumField(heating),
          allows_trade,
          is_eligible_for_credit
        })
        .eq('listing_id', id);
      
      detailsError = error;
    } else if (property_type === 'arsa') {
      const {
        arsa_type,
        sqm,
        kaks,
        allows_trade,
        is_eligible_for_credit
      } = details;

      // Check required enum fields
      if (!arsa_type) {
        console.error('Error: arsa_type is required');
        return NextResponse.json(
          { error: 'Arsa tipi seçilmeden ilan güncellenemez.' },
          { status: 400 }
        );
      }

      // Log arsa details for debugging
      console.log('Updating arsa details:', {
        arsa_type: handleEnumField(arsa_type)
      });

      const { error } = await supabase
        .from('arsa_details')
        .update({
          arsa_type: handleEnumField(arsa_type),
          sqm,
          kaks,
          allows_trade,
          is_eligible_for_credit
        })
        .eq('listing_id', id);
      
      detailsError = error;
    } else if (property_type === 'vasita') {
      const {
        vasita_type,
        brand,
        model,
        sub_model,
        kilometer,
        fuel_type,
        transmission,
        color,
        has_warranty,
        has_damage_record,
        allows_trade
      } = details;

      // Check required enum fields
      if (!vasita_type) {
        console.error('Error: vasita_type is required');
        return NextResponse.json(
          { error: 'Vasıta tipi seçilmeden ilan güncellenemez.' },
          { status: 400 }
        );
      }

      // Log vasita details for debugging
      console.log('Updating vasita details:', {
        vasita_type: handleEnumField(vasita_type),
        fuel_type: handleEnumField(fuel_type),
        transmission: handleEnumField(transmission)
      });

      // Ensure fuel_type is not null (it's required in the schema)
      if (!fuel_type) {
        console.error('Error: fuel_type is required for vasita');
        return NextResponse.json(
          { error: 'Yakıt tipi seçilmeden vasıta ilanı güncellenemez.' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('vasita_details')
        .update({
          vasita_type: handleEnumField(vasita_type),
          brand,
          model,
          sub_model,
          kilometer,
          fuel_type: handleEnumField(fuel_type),
          transmission: handleEnumField(transmission),
          color,
          has_warranty,
          has_damage_record,
          allows_trade
        })
        .eq('listing_id', id);
      
      detailsError = error;
    }

    // Check for errors in details update
    if (detailsError) {
      console.error(`Error updating ${property_type}_details:`, detailsError);
      return NextResponse.json(
        { error: `Failed to update ${property_type} details`, details: detailsError },
        { status: 500 }
      );
    }

    // 3. Update address if applicable
    if (property_type !== "vasita" && details.address) {
      const { province, district, neighborhood, full_address } = details.address;
      
      const { error: addressError } = await supabase
        .from('addresses')
        .update({
          province: province || 'Tokat',
          district: district || 'Merkez',
          neighborhood,
          full_address
        })
        .eq('listing_id', id);
        
      if (addressError) {
        console.error('Error updating address:', addressError);
        return NextResponse.json(
          { error: 'Failed to update address', details: addressError },
          { status: 500 }
        );
      }
    }

    // 4. Update photos if there are any new ones
    if (photos && photos.length > 0) {
      // First, get current photos to compare
      const { data: currentPhotos } = await supabase
        .from('images')
        .select('cloudinary_id, order_index, is_cover, url')
        .eq('listing_id', id);
      
      // Get list of existing photo IDs from the update request
      const existingPhotoIds = photos
        .filter((photo: any) => photo.isExisting)
        .map((photo: any) => photo.id);
      
      console.log(`Processing photos update: ${photos.length} total photos, ${existingPhotoIds.length} existing photos`);
      
      // Log current photos from database for debugging
      console.log('Current photos in database:', currentPhotos?.map(p => p.cloudinary_id) || []);
      console.log('Existing photo IDs from request:', existingPhotoIds);
      
      // Create a map of current photos in database for quick lookup
      const currentPhotoMap = new Map();
      if (currentPhotos) {
        currentPhotos.forEach(photo => {
          currentPhotoMap.set(photo.cloudinary_id, photo);
        });
      }
      
      // Check for database photos that aren't in the request and weren't explicitly deleted
      // This handles cases where photos might have been removed in the UI but not properly tracked in photosToDelete
      if (currentPhotos && currentPhotos.length > 0) {
        const currentPhotoIds = currentPhotos.map(p => p.cloudinary_id);
        const missingPhotoIds = currentPhotoIds.filter(id => 
          !existingPhotoIds.includes(id) && 
          (!photosToDelete || !photosToDelete.includes(id))
        );
        
        if (missingPhotoIds.length > 0) {
          console.log(`Found ${missingPhotoIds.length} photos in database that aren't in the request and weren't explicitly marked for deletion`);
          console.log('Missing photo IDs:', missingPhotoIds);
          
          // Delete these photos from both database and Cloudinary
          for (const photoId of missingPhotoIds) {
            try {
              // Delete from database
              const { error: dbDeleteError } = await supabase
                .from('images')
                .delete()
                .eq('cloudinary_id', photoId);
                
              if (dbDeleteError) {
                console.error(`Error deleting missing photo ${photoId} from database:`, dbDeleteError);
              } else {
                console.log(`Successfully deleted missing photo ${photoId} from database`);
              }
              
              // Delete from Cloudinary using enhanced method
              const deleteResult = await deleteCloudinaryImage(photoId);
              console.log(`Deleted missing photo ${photoId} from Cloudinary: ${deleteResult ? 'success' : 'failed'}`);
              
              // If the standard deletion failed, try a direct API call as a backup
              if (!deleteResult) {
                console.log(`Standard deletion failed for missing photo ${photoId}, trying direct API call`);
                try {
                  // Try with admin API as a last resort
                  await cloudinary.api.delete_resources([photoId], { resource_type: 'image' });
                  console.log(`Successfully deleted missing photo ${photoId} using admin API`);
                } catch (cloudinaryError) {
                  console.error(`Error deleting missing photo ${photoId} with admin API:`, cloudinaryError);
                }
              }
            } catch (error) {
              console.error(`Error deleting missing photo ${photoId}:`, error);
            }
          }
        }
      }
      
      // Insert new photos only (skip existing ones)
      const newPhotos = photos.filter((photo: any) => !photo.isExisting);
      
      if (newPhotos.length > 0) {
        console.log(`Adding ${newPhotos.length} new photos to the database`);
        
        const imageInserts = newPhotos.map((photo: any, index: number) => ({
          listing_id: id,
          cloudinary_id: photo.id,
          url: photo.url,
          order_index: existingPhotoIds.length + index,
          is_cover: existingPhotoIds.length === 0 && index === 0 // Only set as cover if it's the first photo and there are no existing photos
        }));
        
        const { error: imagesError } = await supabase
          .from('images')
          .insert(imageInserts);
        
        if (imagesError) {
          console.error('Error inserting new images:', imagesError);
          return NextResponse.json(
            { error: 'Failed to insert new images', details: imagesError },
            { status: 500 }
          );
        }
      }
      
      // Update order of all photos in a single batch operation if possible
      const allPhotoIds = [...existingPhotoIds, ...newPhotos.map((p: any) => p.id)];
      
      console.log(`Updating order for ${allPhotoIds.length} photos`);
      
      try {
        // First, check which photos need order updates
        const photoUpdates = [];
        
        for (let i = 0; i < allPhotoIds.length; i++) {
          const photoId = allPhotoIds[i];
          const currentPhoto = currentPhotoMap.get(photoId);
          const isCover = i === 0; // First photo is always the cover
          
          // Only update if the order has changed or cover status has changed
          if (!currentPhoto || 
              currentPhoto.order_index !== i || 
              currentPhoto.is_cover !== isCover) {
            
            photoUpdates.push({
              cloudinary_id: photoId,
              order_index: i,
              is_cover: isCover
            });
          }
        }
        
        // Only perform updates if needed
        if (photoUpdates.length > 0) {
          console.log(`Performing ${photoUpdates.length} photo order updates`);
          
          // Update each photo that needs updating
          for (const update of photoUpdates) {
            const { error: updateError } = await supabase
              .from('images')
              .update({
                order_index: update.order_index,
                is_cover: update.is_cover
              })
              .eq('cloudinary_id', update.cloudinary_id)
              .eq('listing_id', id); // Ensure we only update photos for this listing
            
            if (updateError) {
              console.error(`Error updating photo ${update.cloudinary_id} order:`, updateError);
            }
          }
        } else {
          console.log('No photo order updates needed');
        }
      } catch (orderUpdateError) {
        console.error('Error updating photo order:', orderUpdateError);
        // Continue with the update even if photo order update fails
      }
    }

    return NextResponse.json({ 
      success: true,
      id
    });
  } catch (error) {
    console.error('Error in listings update route:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
} 