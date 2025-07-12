import { Metadata, ResolvingMetadata } from 'next/types';
import { supabase } from '@/lib/supabase';
import { createSlug, createSocialImageUrl, createWhatsAppImageUrl } from '@/lib/utils';

// Define the base URL for the site
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'ceyhun-emlak.com';

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.id as string;
  
  // Check if the ID is a UUID or a slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  let listing;
  
  try {
    if (isUUID) {
      // Fetch by ID
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          images(*),
          addresses(*)
        `)
        .eq('id', slug)
        .single();
      
      if (error || !data) {
        throw error || new Error('Listing not found');
      }
      
      listing = data;
    } else {
      // Fetch all listings and find the one with a matching slug
      const { data: listings, error } = await supabase
        .from('listings')
        .select(`
          *,
          images(*),
          addresses(*)
        `)
        .eq('is_active', true);
      
      if (error || !listings) {
        throw error || new Error('Failed to fetch listings');
      }
      
      listing = listings.find(item => {
        if (!item.title) return false;
        const itemSlug = createSlug(item.title);
        return itemSlug === slug;
      });
      
      if (!listing) {
        throw new Error('Listing not found');
      }
    }
    
    // Get the cover image or the first image
    const coverImage = listing.images?.find((img: any) => img.is_cover) || listing.images?.[0];
    const imageUrl = coverImage?.url || listing.thumbnail_url || '';
    
    // Get location information
    let locationText = '';
    if (listing.addresses && listing.addresses.length > 0) {
      const address = listing.addresses[0];
      locationText = `${address.province}/${address.district}${address.neighborhood ? `/${address.neighborhood}` : ''}`;
    } else if (listing.location) {
      locationText = listing.location;
    }
    
    // Format price
    const formattedPrice = new Intl.NumberFormat('tr-TR').format(listing.price) + ' ₺';
    
    // Format property type and listing status
    const propertyTypeMap: Record<string, string> = {
      'konut': 'Konut',
      'ticari': 'Ticari',
      'arsa': 'Arsa',
      'vasita': 'Vasıta'
    };
    const propertyType = propertyTypeMap[listing.property_type] || listing.property_type;
    const listingStatus = listing.listing_status === 'satilik' ? 'Satılık' : 'Kiralık';
    
    // Create a description that includes property details
    const description = `${listingStatus} ${propertyType} ${locationText ? `- ${locationText}` : ''} - ${formattedPrice}${listing.description ? ` - ${listing.description.substring(0, 100)}...` : ''}`;
    
    // WhatsApp için en optimize boyutta görsel URL'si oluştur
    const whatsappImageUrl = createWhatsAppImageUrl(imageUrl, {
      siteUrl,
      fallbackUrl: `https://${siteUrl}/images/ce.png`
    });
    
    console.log('Generated WhatsApp image URL:', whatsappImageUrl);
    
    // Generate canonical URL for the listing
    const listingSlug = createSlug(listing.title);
    const canonicalUrl = `https://${siteUrl}/ilan/${listingSlug}`;
    
    // Kesin WhatsApp uyumlu görsel boyutları ve formatı için resmi belgelere göre oluşturulmuş metadata
    return {
      title: listing.title,
      description: description,
      openGraph: {
        title: `${listing.title} - Ceyhun Emlak`,
        description: description,
        url: canonicalUrl,
        siteName: 'Ceyhun Emlak',
        images: [
          {
            url: whatsappImageUrl,
            width: 300,
            height: 300,
            alt: listing.title,
          }
        ],
        locale: 'tr_TR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: listing.title,
        description: description,
        images: [whatsappImageUrl],
      },
      alternates: {
        canonical: canonicalUrl,
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    // Fallback metadata if there's an error
    return {
      title: 'İlan Detayı - Ceyhun Emlak',
      description: 'Ceyhun Emlak - Kaliteli ve güvenilir gayrimenkul hizmetleri',
    };
  }
}

export default function IlanDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 