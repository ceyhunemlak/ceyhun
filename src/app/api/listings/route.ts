import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { handleEnumField } from '@/lib/utils';
import { deleteCloudinaryFolder, deleteCloudinaryImage, renameCloudinaryFolder } from '@/lib/cloudinary';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
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
    if (!title || !description || !price || !property_type) {
      console.error('Missing required fields:', { title, description, price, property_type });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a UUID for the listing
    const listingId = data.id || uuidv4();

    console.log('Creating listing with data:', { 
      id: listingId,
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
                // For new listings, we'll update the photos array directly
                // since we haven't inserted the images into the database yet
                if (photos) {
                  const photoIndex = photos.findIndex((photo: any) => photo.id === resource.oldId);
                  if (photoIndex !== -1) {
                    photos[photoIndex].id = resource.newId;
                    photos[photoIndex].url = resource.newUrl;
                  }
                }
              } catch (updateError) {
                console.error(`Error updating image data for ${resource.oldId}:`, updateError);
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

    // 1. Insert into main listings table
    const { error: listingError } = await supabase
      .from('listings')
      .insert({
        id: listingId,
        title,
        description,
        price,
        property_type,
        listing_status: handleEnumField(listing_status) || 'satilik', // Ensure listing_status is never empty
        is_active: true
      });

    if (listingError) {
      console.error('Error inserting listing:', listingError);
      return NextResponse.json(
        { error: 'Failed to create listing', details: listingError },
        { status: 500 }
      );
    }

    // 2. Insert into the appropriate details table based on property_type
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
        is_eligible_for_credit,
        inSite
      } = details;

      // Check required enum fields
      if (!konut_type) {
        console.error('Error: konut_type is required');
        return NextResponse.json(
          { error: 'Konut tipi seçilmeden ilan eklenemez.' },
          { status: 400 }
        );
      }

      if (!room_count) {
        console.error('Error: room_count is required');
        return NextResponse.json(
          { error: 'Oda sayısı seçilmeden ilan eklenemez.' },
          { status: 400 }
        );
      }

      // Log konut details for debugging
      console.log('Inserting konut details:', {
        konut_type: handleEnumField(konut_type),
        room_count: handleEnumField(room_count),
        heating: handleEnumField(heating)
      });

      const { error } = await supabase
        .from('konut_details')
        .insert({
          listing_id: listingId,
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
          is_eligible_for_credit,
          in_site: inSite || false
        });
      
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
          { error: 'Ticari mülk tipi seçilmeden ilan eklenemez.' },
          { status: 400 }
        );
      }

      // Log ticari details for debugging
      console.log('Inserting ticari details:', {
        ticari_type: handleEnumField(ticari_type),
        heating: handleEnumField(heating)
      });

      const { error } = await supabase
        .from('ticari_details')
        .insert({
          listing_id: listingId,
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
        });
      
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
          { error: 'Arsa tipi seçilmeden ilan eklenemez.' },
          { status: 400 }
        );
      }

      // Log arsa details for debugging
      console.log('Inserting arsa details:', {
        arsa_type: handleEnumField(arsa_type)
      });

      const { error } = await supabase
        .from('arsa_details')
        .insert({
          listing_id: listingId,
          arsa_type: handleEnumField(arsa_type),
          sqm,
          kaks,
          allows_trade,
          is_eligible_for_credit
        });
      
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
          { error: 'Vasıta tipi seçilmeden ilan eklenemez.' },
          { status: 400 }
        );
      }

      // Log vasita details for debugging
      console.log('Inserting vasita details:', {
        vasita_type: handleEnumField(vasita_type),
        fuel_type: handleEnumField(fuel_type),
        transmission: handleEnumField(transmission)
      });

      // Ensure fuel_type is not null (it's required in the schema)
      if (!fuel_type) {
        console.error('Error: fuel_type is required for vasita');
        return NextResponse.json(
          { error: 'Yakıt tipi seçilmeden vasıta ilanı eklenemez.' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('vasita_details')
        .insert({
          listing_id: listingId,
          vasita_type: handleEnumField(vasita_type),
          brand,
          model,
          sub_model: sub_model || '', // Make sub_model optional
          kilometer,
          fuel_type: handleEnumField(fuel_type),
          transmission: handleEnumField(transmission),
          color,
          has_warranty,
          has_damage_record,
          allows_trade
        });
      
      detailsError = error;
    }

    if (detailsError) {
      console.error('Error inserting details:', detailsError);
      console.error('Failed details data:', property_type, details);
      // Rollback the listing insert by deleting it
      await supabase.from('listings').delete().eq('id', listingId);
      
      return NextResponse.json(
        { error: 'Failed to create listing details', details: detailsError },
        { status: 500 }
      );
    }

    // 3. Insert address if applicable (not for vasita)
    if (property_type !== 'vasita' && details.address) {
      const {
        province,
        district,
        neighborhood,
        full_address
      } = details.address;

      const { error: addressError } = await supabase
        .from('addresses')
        .insert({
          listing_id: listingId,
          province: province || 'Tokat',
          district: district || 'Merkez',
          neighborhood,
          full_address
        });

      if (addressError) {
        console.error('Error inserting address:', addressError);
        // Don't rollback here, address is optional
        // But we should log the error for debugging
      }
    }

    // 4. Insert images if provided
    if (photos && photos.length > 0) {
      const imageInserts = photos.map((photo: any, index: number) => ({
        listing_id: listingId,
        cloudinary_id: photo.id,
        url: photo.url,
        order_index: index,
        is_cover: index === 0
      }));

      const { error: imagesError } = await supabase
        .from('images')
        .insert(imageInserts);

      if (imagesError) {
        console.error('Error inserting images:', imagesError);
        // Don't rollback here, we'll still have the listing
        // But we should log the error for debugging
      }
    }

    return NextResponse.json({ 
      success: true, 
      listingId 
    });
  } catch (error) {
    console.error('Error in listings route:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    
    console.log('GET /api/listings - Parameters:', { id, slug });
    
    if (id) {
      // Get a specific listing with all its related details by ID
      console.log('Fetching listing by ID:', id);
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          images(*),
          konut_details(*),
          ticari_details(*),
          arsa_details(*),
          vasita_details(*),
          addresses(*)
        `)
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Supabase error when fetching by ID:', error);
        return NextResponse.json(
          { error: 'Listing not found', details: error },
          { status: 404 }
        );
      }
      
      // Check if the data is valid
      if (!data) {
        console.error('No data returned for ID:', id);
        return NextResponse.json(
          { error: 'Listing data is empty' },
          { status: 404 }
        );
      }
      
      console.log('Listing found by ID:', { 
        id: data.id, 
        title: data.title,
        has_images: data.images?.length > 0,
        has_konut_details: data.konut_details?.length > 0,
        has_ticari_details: data.ticari_details?.length > 0,
        has_arsa_details: data.arsa_details?.length > 0,
        has_vasita_details: data.vasita_details?.length > 0,
        has_addresses: data.addresses?.length > 0
      });
      
      return NextResponse.json(data);
    } else if (slug) {
      // Get a specific listing with all its related details by slug
      // Convert the slug to a title by replacing hyphens with spaces
      const titleFromSlug = slug.replace(/-/g, ' ');
      
      console.log('Fetching listing by slug, converted to title:', titleFromSlug);
      
      // Search for listings with a similar title (case insensitive)
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          images(*),
          konut_details(*),
          ticari_details(*),
          arsa_details(*),
          vasita_details(*),
          addresses(*)
        `)
        .ilike('title', `%${titleFromSlug}%`)
        .limit(1)
        .single();
        
      if (error) {
        console.error('Supabase error when fetching by slug:', error);
        return NextResponse.json(
          { error: 'Listing not found', details: error },
          { status: 404 }
        );
      }
      
      // Check if the data is valid
      if (!data) {
        console.error('No data returned for slug:', slug);
        return NextResponse.json(
          { error: 'Listing data is empty' },
          { status: 404 }
        );
      }
      
      console.log('Listing found by slug:', { 
        id: data.id, 
        title: data.title,
        has_images: data.images?.length > 0,
        has_konut_details: data.konut_details?.length > 0,
        has_ticari_details: data.ticari_details?.length > 0,
        has_arsa_details: data.arsa_details?.length > 0,
        has_vasita_details: data.vasita_details?.length > 0,
        has_addresses: data.addresses?.length > 0
      });
      
      return NextResponse.json(data);
    } else {
      // Get all listings with their cover images
      console.log('Fetching all listings');
      
      // URL parametrelerini kontrol et, admin panelden geliyorsa tüm ilanları göster
      const isAdminRequest = request.headers.get('referer')?.includes('/admin');
      let query = supabase
        .from('listings')
        .select(`
          *,
          images(url, is_cover),
          konut_details(konut_type),
          ticari_details(ticari_type),
          arsa_details(arsa_type),
          vasita_details(vasita_type)
        `);
        
      // Admin panelinden yapılan isteklerde tüm ilanları göster
      // Diğer sayfalarda (client) sadece aktif ilanları göster
      if (!isAdminRequest) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
        
      if (error) {
        console.error('Supabase error when fetching all listings:', error);
        return NextResponse.json(
          { error: 'Failed to fetch listings', details: error },
          { status: 500 }
        );
      }
      
      // Transform data to include thumbnail_url
      const transformedData = data.map(listing => {
        // Find cover image if it exists
        const coverImage = listing.images?.find((img: { is_cover: boolean }) => img.is_cover === true);
        // Or use the first image if no cover is marked
        const firstImage = listing.images?.[0];
        
        // Get subcategory based on property type
        let sub_category = null;
        if (listing.property_type === 'konut' && listing.konut_details?.length > 0) {
          sub_category = listing.konut_details[0].konut_type;
        } else if (listing.property_type === 'ticari' && listing.ticari_details?.length > 0) {
          sub_category = listing.ticari_details[0].ticari_type;
        } else if (listing.property_type === 'arsa' && listing.arsa_details?.length > 0) {
          sub_category = listing.arsa_details[0].arsa_type;
        } else if (listing.property_type === 'vasita' && listing.vasita_details?.length > 0) {
          sub_category = listing.vasita_details[0].vasita_type;
        }
        
        // Format subcategory for display
        let formatted_sub_category = null;
        if (sub_category) {
          // Capitalize and replace underscores with spaces
          formatted_sub_category = sub_category.charAt(0).toUpperCase() + 
            sub_category.slice(1).replace(/_/g, ' ');
          
          // Special case handling
          if (sub_category === 'mustakil_ev') formatted_sub_category = 'Müstakil Ev';
          if (sub_category === 'konut_imarli') formatted_sub_category = 'Konut İmarlı';
          if (sub_category === 'ticari_imarli') formatted_sub_category = 'Ticari İmarlı';
          if (sub_category === 'otobus_hatti') formatted_sub_category = 'Otobüs Hattı';
          if (sub_category === 'taksi_hatti') formatted_sub_category = 'Taksi Hattı';
        }
        
        return {
          ...listing,
          thumbnail_url: coverImage?.url || firstImage?.url || null,
          sub_category: formatted_sub_category,
          images: undefined, // Remove the images array to keep response clean
          konut_details: undefined, // Remove details to keep response clean
          ticari_details: undefined,
          arsa_details: undefined,
          vasita_details: undefined
        };
      });
      
      console.log(`Fetched ${transformedData.length} listings`);
      return NextResponse.json(transformedData);
    }
  } catch (error) {
    console.error('Error in listings route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings', details: error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Attempting to delete listing with ID: ${id}`);
    
    // First, get the listing details to determine property type and get cloudinary IDs
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .select('*, images(*)')
      .eq('id', id)
      .single();
    
    if (listingError) {
      console.error('Error fetching listing for deletion:', listingError);
      return NextResponse.json(
        { error: 'Failed to fetch listing for deletion' },
        { status: 500 }
      );
    }
    
    // Extract property type and cloudinary folder info
    const propertyType = listingData.property_type;
    let cloudinaryFolderDeleted = false;
    let cloudinaryFolderPath = null;
    const deletedFolderPaths = [];
    
    // If there are images, try to delete the Cloudinary folder
    if (listingData.images && listingData.images.length > 0) {
      try {
        // Step 1: Delete all images individually first
        console.log(`Deleting ${listingData.images.length} images individually`);
        const folderPaths = new Set<string>();
        
        for (const image of listingData.images) {
          const imageId = image.cloudinary_id;
          if (imageId && typeof imageId === 'string') {
            try {
              // Get the folder path
              const parts = imageId.split('/');
              parts.pop(); // Remove the last part (image_X)
              const folderPath = parts.join('/');
              folderPaths.add(folderPath);
              
              // Delete the individual image
              console.log(`Deleting individual image: ${imageId}`);
              await deleteCloudinaryImage(imageId);
            } catch (imageError) {
              console.error(`Error deleting image ${imageId}:`, imageError);
              // Continue with other images
            }
          }
        }
        
        // Step 2: Try to delete each unique folder found
        console.log(`Found ${folderPaths.size} unique folder paths to delete`);
        for (const folderPath of folderPaths) {
          cloudinaryFolderPath = folderPath;
          console.log(`Attempting to delete Cloudinary folder: ${folderPath}`);
          
          try {
            // Delete the Cloudinary folder
            const folderDeleted = await deleteCloudinaryFolder(folderPath);
            
            if (folderDeleted) {
              console.log(`Successfully deleted Cloudinary folder: ${folderPath}`);
              cloudinaryFolderDeleted = true;
              deletedFolderPaths.push(folderPath);
            } else {
              console.error(`Failed to delete Cloudinary folder: ${folderPath}`);
              
              // Try alternative deletion methods for the folder
              try {
                console.log(`Trying alternative deletion method for folder: ${folderPath}`);
                // First delete all resources by prefix
                await cloudinary.api.delete_resources_by_prefix(folderPath);
                // Then try to delete the empty folder
                await cloudinary.api.delete_folder(folderPath);
                console.log(`Successfully deleted folder ${folderPath} using alternative method`);
                cloudinaryFolderDeleted = true;
                deletedFolderPaths.push(folderPath);
              } catch (altError) {
                console.error(`Alternative deletion method failed for folder ${folderPath}:`, altError);
              }
            }
          } catch (folderError) {
            console.error(`Error deleting folder ${folderPath}:`, folderError);
          }
        }
      } catch (error) {
        console.error('Error deleting Cloudinary folder:', error);
        // Continue with the listing deletion even if Cloudinary deletion fails
      }
    } else {
      console.log('No images found for this listing, skipping Cloudinary folder deletion');
    }
    
    // Delete the listing (cascade will handle related records)
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting listing from database:', error);
      return NextResponse.json(
        { error: 'Failed to delete listing from database' },
        { status: 500 }
      );
    }
    
    console.log(`Successfully deleted listing with ID: ${id} from database`);
    
    return NextResponse.json({ 
      success: true,
      id,
      cloudinaryFolderDeleted,
      cloudinaryFolderPath,
      deletedFolderPaths
    });
  } catch (error) {
    console.error('Error in listings DELETE route:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, is_featured, is_active } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }
    
    // Create an update object with the fields that are provided
    const updateData: { is_featured?: boolean; is_active?: boolean } = {};
    
    // Only include fields that are provided in the request
    if (is_featured !== undefined) {
      updateData.is_featured = is_featured;
    }
    
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }
    
    // Update the listing
    const { error } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', id);
      
    if (error) {
      console.error('Error updating listing:', error);
      return NextResponse.json(
        { error: 'Failed to update listing' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      ...updateData
    });
  } catch (error) {
    console.error('Error in listings route:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
} 