import type { Metadata } from "next";
import Script from 'next/script';
import ListingDetailClient from './client';

// Define listing type
interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  listing_status: string;
  is_featured: boolean;
  thumbnail_url: string;
  created_at: string;
  // Additional fields from details tables
  location?: string;
  province?: string;
  district?: string;
  neighborhood?: string;
  full_address?: string;
  rooms?: string;
  area?: number;
  model?: string;
  year?: number;
  images?: {
    id: string;
    url: string;
    is_cover: boolean;
    order_index: number;
  }[];
  addresses?: {
    id: string;
    listing_id: string;
    province: string;
    district: string;
    neighborhood: string;
    full_address?: string;
  }[];
  konut_details?: any;
  ticari_details?: any;
  arsa_details?: any;
  vasita_details?: any;
}

// Generate metadata for the listing page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const slug = params.id;
  
  try {
    // Check if the ID is a UUID or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    // Determine the API URL based on whether we have a UUID or slug
    const apiUrl = isUUID 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/listings?id=${slug}`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/api/listings/by-slug?slug=${slug}`;
    
    // Fetch the listing data
    const response = await fetch(apiUrl, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      return {
        title: "İlan Bulunamadı | Ceyhun Gayrimenkul",
        description: "Aradığınız ilan bulunamadı veya kaldırılmış olabilir.",
      };
    }
    
    const listing: Listing = await response.json();
    
    // Format property type and status
    const formatPropertyType = (type: string) => {
      const typeMap: Record<string, string> = {
        'konut': 'Konut',
        'ticari': 'Ticari',
        'arsa': 'Arsa',
        'vasita': 'Vasıta'
      };
      return typeMap[type] || type;
    };
    
    const formatListingStatus = (status: string) => {
      return status === 'satilik' ? 'Satılık' : 'Kiralık';
    };
    
    // Get location string
    const getLocation = () => {
      if (listing.addresses && listing.addresses.length > 0) {
        const address = listing.addresses[0];
        const province = address.province.charAt(0).toUpperCase() + address.province.slice(1);
        const district = address.district.charAt(0).toUpperCase() + address.district.slice(1);
        const neighborhood = address.neighborhood 
          ? '/' + (address.neighborhood.charAt(0).toUpperCase() + address.neighborhood.slice(1)) 
          : '';
        return `${province}/${district}${neighborhood}`;
      }
      
      if (listing.location) {
        return listing.location.split('/').map(
          (part: string) => part.charAt(0).toUpperCase() + part.slice(1)
        ).join('/');
      }
      
      return '';
    };
    
    // Get the first image URL for OpenGraph
    const coverImage = listing.images && listing.images.length > 0
      ? listing.images.find(img => img.is_cover)?.url || listing.images[0].url
      : listing.thumbnail_url || "/images/ce.png";
    
    // Format price
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('tr-TR').format(price) + ' ₺';
    };
    
    // Create property details for description
    let details = "";
    if (listing.property_type === 'konut' && listing.konut_details && listing.konut_details.length > 0) {
      const konut = listing.konut_details[0];
      if (konut.room_count) details += `${konut.room_count}, `;
      if (konut.gross_sqm) details += `${konut.gross_sqm}m², `;
    } else if (listing.property_type === 'arsa' && listing.arsa_details && listing.arsa_details.length > 0) {
      const arsa = listing.arsa_details[0];
      if (arsa.sqm) details += `${arsa.sqm}m², `;
    } else if (listing.area) {
      details += `${listing.area}m², `;
    }
    
    // Create title and description
    const propertyType = formatPropertyType(listing.property_type);
    const listingStatus = formatListingStatus(listing.listing_status);
    const location = getLocation();
    const price = formatPrice(listing.price);
    
    const title = `${listingStatus} ${propertyType} - ${listing.title} | Ceyhun Gayrimenkul`;
    
    // Create a description with key details
    let description = `${listingStatus} ${propertyType}. ${details}${location}. ${price}. `;
    // Add a portion of the listing description, but limit it
    if (listing.description) {
      const shortDescription = listing.description.substring(0, 150).trim();
      description += shortDescription + (listing.description.length > 150 ? '...' : '');
    }
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: coverImage,
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
        title,
        description,
        images: [coverImage],
      },
      // Add structured data for rich results
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/ilan/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "İlan Detayı | Ceyhun Gayrimenkul",
      description: "Ceyhun Gayrimenkul'de satılık ve kiralık emlak ilanları.",
    };
  }
}

// Server component to generate JSON-LD structured data
export default async function ListingPage({ params }: { params: { id: string } }) {
  const slug = params.id;
  
  try {
    // Check if the ID is a UUID or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    // Determine the API URL based on whether we have a UUID or slug
    const apiUrl = isUUID 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/listings?id=${slug}`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/api/listings/by-slug?slug=${slug}`;
    
    // Fetch the listing data
    const response = await fetch(apiUrl, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      return (
        <div>
          <ListingDetailClient />
        </div>
      );
    }
    
    const listing: Listing = await response.json();
    
    // Get the first image URL for structured data
    const images = listing.images && listing.images.length > 0
      ? listing.images.map(img => img.url)
      : listing.thumbnail_url ? [listing.thumbnail_url] : ["/images/ce.png"];
      
    // Get location for structured data
    let addressObject: any = {};
    if (listing.addresses && listing.addresses.length > 0) {
      const address = listing.addresses[0];
      addressObject = {
        "@type": "PostalAddress",
        "addressLocality": address.district,
        "addressRegion": address.province,
        "addressCountry": "TR"
      };
      if (address.neighborhood) {
        addressObject.streetAddress = address.neighborhood;
      }
    }
    
    // Determine property type for structured data
    let propertyType = "House";
    if (listing.property_type === 'konut') {
      if (listing.konut_details && listing.konut_details.length > 0) {
        const konutType = listing.konut_details[0].konut_type;
        if (konutType === 'daire') propertyType = "Apartment";
        else if (konutType === 'villa') propertyType = "House";
        else if (konutType === 'mustakil_ev') propertyType = "SingleFamilyResidence";
        else if (konutType === 'bina') propertyType = "Residence";
      }
    } else if (listing.property_type === 'ticari') {
      propertyType = "CommercialProperty";
    } else if (listing.property_type === 'arsa') {
      propertyType = "LandLot";
    }
    
    // Generate structured data based on listing type
    let structuredData: any = {};
    
    if (listing.property_type === 'vasita') {
      // Vehicle listing
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Vehicle",
        "name": listing.title,
        "description": listing.description,
        "image": images,
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/ilan/${slug}`,
        "offers": {
          "@type": "Offer",
          "price": listing.price,
          "priceCurrency": "TRY",
          "availability": "https://schema.org/InStock"
        }
      };
      
      if (listing.vasita_details && listing.vasita_details.length > 0) {
        const vasita = listing.vasita_details[0];
        if (vasita.brand) structuredData.brand = vasita.brand;
        if (vasita.model) structuredData.model = vasita.model;
        if (vasita.year) structuredData.modelDate = vasita.year;
        if (vasita.kilometer) structuredData.mileageFromOdometer = {
          "@type": "QuantitativeValue",
          "value": vasita.kilometer,
          "unitCode": "KMT"
        };
      }
    } else {
      // Real estate listing
      structuredData = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": listing.title,
        "description": listing.description,
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/ilan/${slug}`,
        "datePosted": listing.created_at,
        "image": images,
        "offers": {
          "@type": "Offer",
          "price": listing.price,
          "priceCurrency": "TRY",
          "availability": "https://schema.org/InStock"
        },
        "realtorName": "Ceyhun Gayrimenkul",
        "realtorLogo": `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo_black.png`,
        "realtorTelephone": "+905323850420",
        "realtorUrl": `${process.env.NEXT_PUBLIC_SITE_URL}`,
        "containsPlace": {
          "@type": propertyType,
          "address": addressObject
        }
      };
      
      // Add property details
      if (listing.property_type === 'konut' && listing.konut_details && listing.konut_details.length > 0) {
        const konut = listing.konut_details[0];
        if (konut.room_count) structuredData.containsPlace.numberOfRooms = konut.room_count;
        if (konut.gross_sqm) structuredData.containsPlace.floorSize = {
          "@type": "QuantitativeValue",
          "value": konut.gross_sqm,
          "unitCode": "MTK"
        };
      } else if (listing.property_type === 'arsa' && listing.arsa_details && listing.arsa_details.length > 0) {
        const arsa = listing.arsa_details[0];
        if (arsa.sqm) structuredData.containsPlace.floorSize = {
          "@type": "QuantitativeValue",
          "value": arsa.sqm,
          "unitCode": "MTK"
        };
      }
    }
    
    const jsonLd = JSON.stringify(structuredData);
    
    return (
      <div>
        <Script id="listing-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
        <ListingDetailClient />
      </div>
    );
  } catch (error) {
    console.error('Error generating structured data:', error);
    return (
      <div>
        <ListingDetailClient />
      </div>
    );
  }
} 