import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createSlug } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    console.log('GET /api/listings/by-slug - Parameters:', { slug });
    
    if (!slug) {
      console.error('Slug parameter is missing');
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }
    
    // Fetch all listings and find the one with a matching slug
    // URL parametrelerini kontrol et, admin panelden geliyorsa tüm ilanları göster
    const isAdminRequest = request.headers.get('referer')?.includes('/admin');
    
    let query = supabase
      .from('listings')
      .select(`
        *,
        images(*),
        konut_details(*),
        ticari_details(*),
        arsa_details(*),
        vasita_details(*),
        addresses(*)
      `);
    
    // Admin panelinden yapılan isteklerde tüm ilanları göster
    // Diğer sayfalarda (client) sadece aktif ilanları göster
    if (!isAdminRequest) {
      query = query.eq('is_active', true);
    }
    
    const { data: listings, error: fetchError } = await query;
      
    if (fetchError) {
      console.error('Supabase error when fetching listings:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch listings', details: fetchError },
        { status: 500 }
      );
    }
    
    // Find the listing with a matching slug
    const listing = listings?.find(item => {
      if (!item.title) return false;
      const itemSlug = createSlug(item.title);
      return itemSlug === slug;
    });
    
    if (!listing) {
      console.error('No listing found with slug:', slug);
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    console.log('Listing found by slug:', { 
      id: listing.id, 
      title: listing.title,
      has_images: listing.images?.length > 0,
      has_konut_details: listing.konut_details?.length > 0,
      has_ticari_details: listing.ticari_details?.length > 0,
      has_arsa_details: listing.arsa_details?.length > 0,
      has_vasita_details: listing.vasita_details?.length > 0,
      has_addresses: listing.addresses?.length > 0
    });
    
    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error in listings/by-slug route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing', details: error },
      { status: 500 }
    );
  }
} 