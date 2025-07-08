import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { listingId, newTitle } = await request.json();
    
    if (!listingId || !newTitle) {
      return NextResponse.json(
        { error: 'Listing ID and new title are required' },
        { status: 400 }
      );
    }
    
    console.log(`Duplicating listing ${listingId} with new title: ${newTitle}`);
    
    // 1. Fetch the original listing with all its details
    const { data: originalListing, error: fetchError } = await supabase
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
      .eq('id', listingId)
      .single();
      
    if (fetchError || !originalListing) {
      console.error('Error fetching original listing:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch original listing', details: fetchError },
        { status: 500 }
      );
    }
    
    // 2. Generate a new UUID for the duplicated listing
    const newListingId = uuidv4();
    
    // 3. Create a new listing record
    const { error: listingError } = await supabase
      .from('listings')
      .insert({
        id: newListingId,
        title: newTitle,
        description: originalListing.description,
        price: originalListing.price,
        property_type: originalListing.property_type,
        listing_status: originalListing.listing_status,
        is_active: false, // Start as inactive
        is_featured: false, // Start as not featured
        views_count: 0,
        contact_count: 0
      });

    if (listingError) {
      console.error('Error creating duplicated listing:', listingError);
      return NextResponse.json(
        { error: 'Failed to create duplicated listing', details: listingError },
        { status: 500 }
      );
    }
    
    // 4. Copy details based on property type
    let detailsError = null;
    
    if (originalListing.property_type === 'konut' && originalListing.konut_details?.[0]) {
      const konutDetails = originalListing.konut_details[0];
      const { error } = await supabase
        .from('konut_details')
        .insert({
          listing_id: newListingId,
          konut_type: konutDetails.konut_type,
          gross_sqm: konutDetails.gross_sqm,
          net_sqm: konutDetails.net_sqm,
          room_count: konutDetails.room_count,
          building_age: konutDetails.building_age,
          floor: konutDetails.floor,
          total_floors: konutDetails.total_floors,
          heating: konutDetails.heating,
          has_balcony: konutDetails.has_balcony,
          has_elevator: konutDetails.has_elevator,
          is_furnished: konutDetails.is_furnished,
          allows_trade: konutDetails.allows_trade,
          is_eligible_for_credit: konutDetails.is_eligible_for_credit,
          in_site: konutDetails.in_site
        });
      
      detailsError = error;
    } else if (originalListing.property_type === 'ticari' && originalListing.ticari_details?.[0]) {
      const ticariDetails = originalListing.ticari_details[0];
      const { error } = await supabase
        .from('ticari_details')
        .insert({
          listing_id: newListingId,
          ticari_type: ticariDetails.ticari_type,
          gross_sqm: ticariDetails.gross_sqm,
          net_sqm: ticariDetails.net_sqm,
          room_count: ticariDetails.room_count,
          building_age: ticariDetails.building_age,
          floor: ticariDetails.floor,
          total_floors: ticariDetails.total_floors,
          heating: ticariDetails.heating,
          allows_trade: ticariDetails.allows_trade,
          is_eligible_for_credit: ticariDetails.is_eligible_for_credit
        });
      
      detailsError = error;
    } else if (originalListing.property_type === 'arsa' && originalListing.arsa_details?.[0]) {
      const arsaDetails = originalListing.arsa_details[0];
      const { error } = await supabase
        .from('arsa_details')
        .insert({
          listing_id: newListingId,
          arsa_type: arsaDetails.arsa_type,
          sqm: arsaDetails.sqm,
          kaks: arsaDetails.kaks,
          allows_trade: arsaDetails.allows_trade,
          is_eligible_for_credit: arsaDetails.is_eligible_for_credit
        });
      
      detailsError = error;
    } else if (originalListing.property_type === 'vasita' && originalListing.vasita_details?.[0]) {
      const vasitaDetails = originalListing.vasita_details[0];
      const { error } = await supabase
        .from('vasita_details')
        .insert({
          listing_id: newListingId,
          vasita_type: vasitaDetails.vasita_type,
          brand: vasitaDetails.brand,
          model: vasitaDetails.model,
          sub_model: vasitaDetails.sub_model,
          kilometer: vasitaDetails.kilometer,
          fuel_type: vasitaDetails.fuel_type,
          transmission: vasitaDetails.transmission,
          color: vasitaDetails.color,
          has_warranty: vasitaDetails.has_warranty,
          has_damage_record: vasitaDetails.has_damage_record,
          allows_trade: vasitaDetails.allows_trade
        });
      
      detailsError = error;
    }

    if (detailsError) {
      console.error('Error copying listing details:', detailsError);
      // Rollback the listing insert by deleting it
      await supabase.from('listings').delete().eq('id', newListingId);
      
      return NextResponse.json(
        { error: 'Failed to copy listing details', details: detailsError },
        { status: 500 }
      );
    }
    
    // 5. Copy address if applicable (not for vasita)
    if (originalListing.property_type !== 'vasita' && originalListing.addresses?.[0]) {
      const address = originalListing.addresses[0];
      const { error: addressError } = await supabase
        .from('addresses')
        .insert({
          listing_id: newListingId,
          province: address.province,
          district: address.district,
          neighborhood: address.neighborhood,
          full_address: address.full_address
        });

      if (addressError) {
        console.error('Error copying address:', addressError);
        // Don't rollback here, address is optional
      }
    }
    
    // 6. Copy images if they exist
    if (originalListing.images && originalListing.images.length > 0) {
      const newImages = [];
      
      for (const image of originalListing.images) {
        try {
          // Extract folder path and file name from original public_id
          const publicIdParts = image.cloudinary_id.split('/');
          const fileName = publicIdParts.pop();
          const folderPath = publicIdParts.join('/');
          
          // Create a new folder path with the new listing ID
          const newFolderPath = `ceyhun-emlak/${originalListing.property_type}/${newListingId}`;
          
          // Copy the image to the new folder in Cloudinary
          // First download the image URL, then upload it to the new location
          const response = await fetch(image.url);
          const imageBuffer = Buffer.from(await response.arrayBuffer());
          
          const result = await cloudinary.uploader.upload(
            `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
            { 
              folder: newFolderPath, 
              public_id: fileName,
              resource_type: 'auto'
            }
          );
          
          // Add to the new images array
          newImages.push({
            listing_id: newListingId,
            cloudinary_id: result.public_id,
            url: result.secure_url,
            order_index: image.order_index,
            is_cover: image.is_cover
          });
        } catch (imageError) {
          console.error('Error copying image:', imageError);
          // Continue with other images
        }
      }
      
      // Insert all new images at once
      if (newImages.length > 0) {
        const { error: imagesError } = await supabase
          .from('images')
          .insert(newImages);

        if (imagesError) {
          console.error('Error inserting copied images:', imagesError);
          // Don't rollback here, we'll still have the listing
        }
      }
    }
    
    // 7. Fetch the newly created listing with all its details
    const { data: newListing, error: newFetchError } = await supabase
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
      .eq('id', newListingId)
      .single();
      
    if (newFetchError) {
      console.error('Error fetching new listing:', newFetchError);
      // We'll still return success even if fetching the new listing fails
    }
    
         return NextResponse.json({ 
       success: true, 
       listingId: newListingId,
       listing: newListing || { 
         id: newListingId, 
         title: newTitle,
         property_type: originalListing.property_type,
         listing_status: originalListing.listing_status,
         price: originalListing.price,
         is_active: false,
         is_featured: false,
         views_count: 0,
         contact_count: 0,
         created_at: new Date().toISOString(),
         thumbnail_url: originalListing.images?.[0]?.url
       }
     });
  } catch (error) {
    console.error('Error in duplicate listing route:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate listing', details: error },
      { status: 500 }
    );
  }
} 