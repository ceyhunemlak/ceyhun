import { ImageResponse } from 'next/og';
import { supabase } from '@/lib/supabase';
import { createSlug } from '@/lib/utils';
 
export const runtime = 'edge';
export const alt = 'Ceyhun Gayrimenkul - İlan Detayı';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
 
export default async function Image({ params }: { params: { id: string } }) {
  try {
    const slug = params.id;
    let listing;
    
    // Check if the ID is a UUID or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    if (isUUID) {
      // If it's a UUID, fetch directly by ID
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          images(*),
          addresses(*)
        `)
        .eq('id', slug)
        .eq('is_active', true)
        .single();
      
      if (error || !data) {
        throw new Error('Listing not found');
      }
      
      listing = data;
    } else {
      // If it's a slug, fetch all listings and find by slug
      const { data: listings, error: fetchError } = await supabase
        .from('listings')
        .select(`
          *,
          images(*),
          addresses(*)
        `)
        .eq('is_active', true);
      
      if (fetchError || !listings) {
        throw new Error('Failed to fetch listings');
      }
      
      // Find the listing with a matching slug
      listing = listings.find(item => {
        if (!item.title) return false;
        const itemSlug = createSlug(item.title);
        return itemSlug === slug;
      });
      
      if (!listing) {
        throw new Error('Listing not found');
      }
    }
    
    // Get the first image URL or use default
    const imageUrl = listing.images && listing.images.length > 0 
      ? listing.images.find((img: any) => img.is_cover)?.url || listing.images[0].url
      : 'https://www.ceyhundan.com/images/ce.png';
    
    // Format price
    const price = new Intl.NumberFormat('tr-TR').format(listing.price || 0) + ' ₺';
    
    // Get location
    let location = '';
    if (listing.addresses && listing.addresses.length > 0) {
      const address = listing.addresses[0];
      const province = address.province.charAt(0).toUpperCase() + address.province.slice(1);
      const district = address.district.charAt(0).toUpperCase() + address.district.slice(1);
      const neighborhood = address.neighborhood 
        ? '/' + (address.neighborhood.charAt(0).toUpperCase() + address.neighborhood.slice(1)) 
        : '';
      location = `${province}/${district}${neighborhood}`;
    } else if (listing.location) {
      location = listing.location.split('/').map(
        (part: string) => part.charAt(0).toUpperCase() + part.slice(1)
      ).join('/');
    }
    
    // Format listing status
    const listingStatus = listing.listing_status === 'satilik' ? 'Satılık' : 'Kiralık';
    
    // Format property type
    const propertyTypeMap: Record<string, string> = {
      'konut': 'Konut',
      'ticari': 'Ticari',
      'arsa': 'Arsa',
      'vasita': 'Vasıta'
    };
    const propertyType = propertyTypeMap[listing.property_type] || listing.property_type;
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            position: 'relative',
          }}
        >
          {/* Background Image with Overlay */}
          <div style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)',
          }} />
          
          {/* Content Container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            width: '100%',
            height: '100%',
            padding: '40px',
            position: 'relative',
            background: 'linear-gradient(transparent 30%, rgba(0,0,0,0.8) 100%)',
          }}>
            {/* Logo */}
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src="https://www.ceyhundan.com/images/logo_black.png"
                alt="Ceyhun Gayrimenkul"
                width={180}
                height={40}
                style={{ objectFit: 'contain' }}
              />
            </div>
            
            {/* Status and Type Tags */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '12px',
              marginBottom: '16px',
            }}>
              <div style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '18px',
                fontWeight: 'bold',
              }}>
                {listingStatus}
              </div>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#1f2937',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '18px',
                fontWeight: 'bold',
              }}>
                {propertyType}
              </div>
            </div>
            
            {/* Title */}
            <div style={{
              color: 'white',
              fontSize: '40px',
              fontWeight: 'bold',
              marginBottom: '16px',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              maxWidth: '90%',
            }}>
              {listing.title}
            </div>
            
            {/* Location */}
            {location && (
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '24px',
                marginBottom: '16px',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ marginLeft: '8px' }}>{location}</span>
              </div>
            )}
            
            {/* Price */}
            <div style={{
              color: '#f59e0b',
              fontSize: '36px',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}>
              {price}
            </div>
          </div>
        </div>
      ),
      { ...size }
    );
  } catch (error) {
    // Return a default image on error
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#f8fafc',
            padding: '40px',
          }}
        >
          <img
            src="https://www.ceyhundan.com/images/logo_black.png"
            alt="Ceyhun Gayrimenkul"
            width={300}
            height={80}
            style={{ objectFit: 'contain', marginBottom: '40px' }}
          />
          <div
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1f2937',
              textAlign: 'center',
            }}
          >
            Ceyhun Gayrimenkul - Tokat'ın Güvenilir Emlak Ofisi
          </div>
        </div>
      ),
      { ...size }
    );
  }
} 