import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { createSlug } from '@/lib/utils';

// Generate dynamic metadata for each listing
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
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
        return {
          title: 'İlan Bulunamadı | Ceyhun Gayrimenkul',
          description: 'Aradığınız ilan bulunamadı veya kaldırılmış olabilir.'
        };
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
        return {
          title: 'İlan Yüklenemedi | Ceyhun Gayrimenkul',
          description: 'İlan bilgileri yüklenirken bir hata oluştu.'
        };
      }
      
      // Find the listing with a matching slug
      listing = listings.find(item => {
        if (!item.title) return false;
        const itemSlug = createSlug(item.title);
        return itemSlug === slug;
      });
      
      if (!listing) {
        return {
          title: 'İlan Bulunamadı | Ceyhun Gayrimenkul',
          description: 'Aradığınız ilan bulunamadı veya kaldırılmış olabilir.'
        };
      }
    }
    
    // Get the first image URL or use default
    const imageUrl = listing.images && listing.images.length > 0 
      ? listing.images.find((img: any) => img.is_cover)?.url || listing.images[0].url
      : 'https://www.ceyhundan.com/images/ce.png';
    
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
    
    // Create description from listing details
    const price = new Intl.NumberFormat('tr-TR').format(listing.price || 0) + ' ₺';
    let description = `${listingStatus} ${propertyType}`;
    
    if (location) {
      description += ` - ${location}`;
    }
    
    if (listing.description) {
      // Add a portion of the description, limited to ~160 characters
      const shortDesc = listing.description.substring(0, 100).trim();
      description += ` - ${shortDesc}${listing.description.length > 100 ? '...' : ''}`;
    }
    
    // Add price to description
    description += ` - ${price}`;
    
    // Create metadata
    return {
      title: `${listing.title} | Ceyhun Gayrimenkul`,
      description,
      openGraph: {
        title: listing.title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: listing.title,
          }
        ],
        locale: 'tr_TR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: listing.title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `https://www.ceyhundan.com/ilan/${slug}`,
      },
      other: {
        'og:price:amount': String(listing.price),
        'og:price:currency': 'TRY',
        'og:availability': listing.is_active ? 'instock' : 'oos',
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'İlan Detayı | Ceyhun Gayrimenkul',
      description: 'Ceyhun Gayrimenkul - Tokat\'ın güvenilir emlak ofisi.'
    };
  }
}

export default function ListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 