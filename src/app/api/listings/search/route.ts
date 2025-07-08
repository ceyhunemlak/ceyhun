import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    console.log('Searching listings with query:', query);
    
    // Normalize the query for better matching
    const normalizedQuery = query.toLowerCase().trim();
    
    // Create a case-insensitive regex pattern for more flexible matching
    const queryRegex = new RegExp(normalizedQuery, 'i');
    
    // Fetch all listings with their related details
    const { data: allListings, error } = await supabase
      .from('listings')
      .select(`
        *,
        images(url, is_cover),
        konut_details(*),
        ticari_details(*),
        arsa_details(*),
        vasita_details(*),
        addresses(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Supabase error when fetching listings for search:', error);
      return NextResponse.json(
        { error: 'Failed to search listings', details: error },
        { status: 500 }
      );
    }
    
    // Filter listings based on the search query
    const filteredListings = allListings.filter(listing => {
      // Check title and description
      if (
        listing.title && queryRegex.test(listing.title) ||
        listing.description && queryRegex.test(listing.description)
      ) {
        return true;
      }
      
      // Check property type
      if (listing.property_type && queryRegex.test(listing.property_type)) {
        return true;
      }
      
      // Check listing status (satılık/kiralık)
      if (
        (listing.listing_status === 'satilik' && normalizedQuery.includes('satil')) ||
        (listing.listing_status === 'kiralik' && normalizedQuery.includes('kiral'))
      ) {
        return true;
      }
      
      // Check address information
      if (listing.addresses && listing.addresses.length > 0) {
        const address = listing.addresses[0];
        if (
          (address.province && queryRegex.test(address.province)) ||
          (address.district && queryRegex.test(address.district)) ||
          (address.neighborhood && queryRegex.test(address.neighborhood)) ||
          (address.full_address && queryRegex.test(address.full_address))
        ) {
          return true;
        }
      }
      
      // Check property-specific details
      if (listing.property_type === 'konut' && listing.konut_details && listing.konut_details.length > 0) {
        const konutDetails = listing.konut_details[0];
        if (
          (konutDetails.konut_type && queryRegex.test(konutDetails.konut_type)) ||
          (konutDetails.room_count && queryRegex.test(konutDetails.room_count))
        ) {
          return true;
        }
      } else if (listing.property_type === 'ticari' && listing.ticari_details && listing.ticari_details.length > 0) {
        const ticariDetails = listing.ticari_details[0];
        if (ticariDetails.ticari_type && queryRegex.test(ticariDetails.ticari_type)) {
          return true;
        }
      } else if (listing.property_type === 'arsa' && listing.arsa_details && listing.arsa_details.length > 0) {
        const arsaDetails = listing.arsa_details[0];
        if (arsaDetails.arsa_type && queryRegex.test(arsaDetails.arsa_type)) {
          return true;
        }
      } else if (listing.property_type === 'vasita' && listing.vasita_details && listing.vasita_details.length > 0) {
        const vasitaDetails = listing.vasita_details[0];
        if (
          (vasitaDetails.vasita_type && queryRegex.test(vasitaDetails.vasita_type)) ||
          (vasitaDetails.brand && queryRegex.test(vasitaDetails.brand)) ||
          (vasitaDetails.model && queryRegex.test(vasitaDetails.model)) ||
          (vasitaDetails.sub_model && queryRegex.test(vasitaDetails.sub_model)) ||
          (vasitaDetails.fuel_type && queryRegex.test(vasitaDetails.fuel_type)) ||
          (vasitaDetails.transmission && queryRegex.test(vasitaDetails.transmission)) ||
          (vasitaDetails.color && queryRegex.test(vasitaDetails.color))
        ) {
          return true;
        }
      }
      
      return false;
    });
    
    // Transform data to include thumbnail_url and remove unnecessary details
    const transformedData = filteredListings.map(listing => {
      // Find cover image if it exists
      const coverImage = listing.images?.find((img: { is_cover: boolean }) => img.is_cover === true);
      // Or use the first image if no cover is marked
      const firstImage = listing.images?.[0];
      
      // Extract location information
      let location = '';
      if (listing.addresses && listing.addresses.length > 0) {
        const address = listing.addresses[0];
        location = `${address.province}/${address.district}${address.neighborhood ? '/' + address.neighborhood : ''}`;
      }
      
      // Extract property-specific details
      let rooms, area, konut_type, model, year;
      
      if (listing.property_type === 'konut' && listing.konut_details && listing.konut_details.length > 0) {
        const konutDetails = listing.konut_details[0];
        rooms = konutDetails.room_count || 'Belirtilmemiş';
        area = konutDetails.gross_sqm || konutDetails.net_sqm;
        konut_type = konutDetails.konut_type;
      } else if (listing.property_type === 'ticari' && listing.ticari_details && listing.ticari_details.length > 0) {
        const ticariDetails = listing.ticari_details[0];
        rooms = ticariDetails.room_count ? ticariDetails.room_count.toString() : 'Belirtilmemiş';
        area = ticariDetails.gross_sqm || ticariDetails.net_sqm;
      } else if (listing.property_type === 'arsa' && listing.arsa_details && listing.arsa_details.length > 0) {
        const arsaDetails = listing.arsa_details[0];
        area = arsaDetails.sqm;
      } else if (listing.property_type === 'vasita' && listing.vasita_details && listing.vasita_details.length > 0) {
        const vasitaDetails = listing.vasita_details[0];
        model = vasitaDetails.model;
        year = vasitaDetails.year;
      }
      
      // Return the transformed listing with only necessary information
      return {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        property_type: listing.property_type,
        listing_status: listing.listing_status,
        thumbnail_url: coverImage?.url || firstImage?.url || null,
        created_at: listing.created_at,
        location,
        area,
        rooms,
        konut_type,
        model,
        year,
        is_featured: listing.is_featured,
        // Include address components for filtering
        district: listing.addresses?.[0]?.district,
        province: listing.addresses?.[0]?.province,
        neighborhood: listing.addresses?.[0]?.neighborhood
      };
    });
    
    console.log(`Search found ${transformedData.length} results for query: ${query}`);
    return NextResponse.json({
      results: transformedData,
      query
    });
  } catch (error) {
    console.error('Error in listings search route:', error);
    return NextResponse.json(
      { error: 'Failed to search listings', details: error },
      { status: 500 }
    );
  }
} 