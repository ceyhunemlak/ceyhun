"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Expand, Car, Phone, MessageCircle, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';

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

export default function ListingDetailClient() {
  const params = useParams();
  const slug = params.id as string; // We're still using the 'id' param name, but treating it as a slug
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPhoneNumbers, setShowPhoneNumbers] = useState(false);
  const [showWhatsAppNumbers, setShowWhatsAppNumbers] = useState(false);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);
  const whatsappDropdownRef = useRef<HTMLDivElement>(null);
  
  // Helper function to format property type
  const formatPropertyType = (type: string) => {
    const typeMap: Record<string, string> = {
      'konut': 'Konut',
      'ticari': 'Ticari',
      'arsa': 'Arsa',
      'vasita': 'Vasıta'
    };
    
    return typeMap[type] || type;
  };

  // Helper function to format listing status
  const formatListingStatus = (status: string) => {
    return status === 'satilik' ? 'Satılık' : 'Kiralık';
  };

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR').format(price) + ' ₺';
  };
  
  // Fetch listing details
  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        setIsLoading(true);
        
        // Check if the ID is a UUID or a slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        
        let response;
        let apiUrl;
        
        if (isUUID) {
          // If it's a UUID, use the regular endpoint
          apiUrl = `/api/listings?id=${slug}`;
        } else {
          // If it's not a UUID, treat it as a slug
          apiUrl = `/api/listings/by-slug?slug=${slug}`;
        }
        
        console.log('Fetching listing details from:', apiUrl);
        response = await fetch(apiUrl);
        
        if (!response.ok) {
          console.error('API response not OK:', response.status, response.statusText);
          
          // Try the alternative endpoint if the first one fails
          if (!isUUID) {
            console.log('Trying to fetch by ID as fallback...');
            const fallbackUrl = `/api/listings?id=${slug}`;
            const fallbackResponse = await fetch(fallbackUrl);
            
            if (fallbackResponse.ok) {
              response = fallbackResponse;
            } else {
              throw new Error(`İlan detayları yüklenirken bir hata oluştu (${response.status})`);
            }
          } else {
            throw new Error(`İlan detayları yüklenirken bir hata oluştu (${response.status})`);
          }
        }
        
        const data = await response.json();
        console.log('Listing data received:', data);
        
        // Check if essential data is present
        if (!data || !data.id) {
          console.error('Essential listing data missing:', data);
          throw new Error('İlan bilgileri eksik veya hatalı');
        }
        
        setListing(data);
        setIsLoading(false);

        // Generate JSON-LD structured data after loading the listing
        if (data) {
          generateJsonLd(data, slug);
        }
      } catch (error) {
        console.error('Error fetching listing details:', error);
        setError(error instanceof Error ? error.message : 'İlan detayları yüklenirken bir hata oluştu');
        setIsLoading(false);
      }
    };
    
    if (slug) {
      fetchListingDetails();
    }
  }, [slug]);

  // Generate JSON-LD structured data
  const generateJsonLd = (listing: Listing, slug: string) => {
    try {
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

      // Add the JSON-LD script to the document head
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error generating structured data:', error);
    }
  };
  
  // Extract location information
  const getLocation = () => {
    if (!listing) return '';
    
    if (listing.addresses && listing.addresses.length > 0) {
      const address = listing.addresses[0];
      // Capitalize first letter of each part
      const province = address.province.charAt(0).toUpperCase() + address.province.slice(1);
      const district = address.district.charAt(0).toUpperCase() + address.district.slice(1);
      const neighborhood = address.neighborhood 
        ? '/' + (address.neighborhood.charAt(0).toUpperCase() + address.neighborhood.slice(1)) 
        : '';
      return `${province}/${district}${neighborhood}`;
    }
    
    // Fallback to location field if available
    if (listing.location) {
      // Capitalize each part of the location
      return listing.location.split('/').map(
        (part: string) => part.charAt(0).toUpperCase() + part.slice(1)
      ).join('/');
    }
    
    return '';
  };
  
  // Get property details based on property type
  const getPropertyDetails = () => {
    if (!listing) return [];
    
    const details: { label: string; value: string | number }[] = [];
    
    try {
      // Create organized groups of details
      const locationDetails: { label: string; value: string | number }[] = [];
      const propertyTypeDetails: { label: string; value: string | number }[] = [];
      const areaDetails: { label: string; value: string | number }[] = [];
      const roomDetails: { label: string; value: string | number }[] = [];
      const buildingDetails: { label: string; value: string | number }[] = [];
      const featuresDetails: { label: string; value: string | number }[] = [];
      const vehicleDetails: { label: string; value: string | number }[] = [];
      const financialDetails: { label: string; value: string | number }[] = [];
      
      // Address information is removed from here since it's already displayed at the top left of the page
      
      if (listing.property_type === 'konut' && listing.konut_details && listing.konut_details.length > 0) {
        const konutDetails = listing.konut_details[0];
        
        // Property type details
        if (konutDetails.konut_type) {
          const konutTypeMap: Record<string, string> = {
            'daire': 'Daire',
            'villa': 'Villa',
            'mustakil_ev': 'Müstakil Ev',
            'bina': 'Bina'
          };
          propertyTypeDetails.push({ label: 'Konut Tipi', value: konutTypeMap[konutDetails.konut_type] || konutDetails.konut_type });
        }
        
        // Area details
        if (konutDetails.gross_sqm) areaDetails.push({ label: 'Brüt Alan', value: `${konutDetails.gross_sqm} m²` });
        if (konutDetails.net_sqm) areaDetails.push({ label: 'Net Alan', value: `${konutDetails.net_sqm} m²` });
        
        // Room details
        if (konutDetails.room_count) roomDetails.push({ label: 'Oda Sayısı', value: konutDetails.room_count });
        
        // Building details
        if (konutDetails.building_age !== undefined && konutDetails.building_age !== null && konutDetails.building_age !== '') 
          buildingDetails.push({ label: 'Bina Yaşı', value: konutDetails.building_age });
        
        if (konutDetails.floor !== undefined && konutDetails.floor !== null && konutDetails.floor !== '') 
          buildingDetails.push({ label: 'Bulunduğu Kat', value: konutDetails.floor });
        
        if (konutDetails.total_floors !== undefined && konutDetails.total_floors !== null && konutDetails.total_floors !== '') 
          buildingDetails.push({ label: 'Toplam Kat', value: konutDetails.total_floors });
        
        if (konutDetails.heating) {
          const heatingMap: Record<string, string> = {
            'dogalgaz': 'Doğalgaz',
            'soba': 'Soba',
            'merkezi': 'Merkezi',
            'klima': 'Klima',
            'yok': 'Yok'
          };
          buildingDetails.push({ label: 'Isıtma', value: heatingMap[konutDetails.heating] || konutDetails.heating });
        }
        
        // Features
        if (konutDetails.has_balcony) featuresDetails.push({ label: 'Balkon', value: 'Var' });
        if (konutDetails.has_elevator) featuresDetails.push({ label: 'Asansör', value: 'Var' });
        if (konutDetails.is_furnished) featuresDetails.push({ label: 'Eşyalı', value: 'Evet' });
        
        // Financial details
        if (konutDetails.allows_trade) financialDetails.push({ label: 'Takas', value: 'Evet' });
        if (konutDetails.is_eligible_for_credit) financialDetails.push({ label: 'Krediye Uygun', value: 'Evet' });
      }
      
      // Merge all detail groups in a logical order
      details.push(...locationDetails);
      details.push(...propertyTypeDetails);
      details.push(...areaDetails);
      details.push(...roomDetails);
      details.push(...buildingDetails);
      details.push(...vehicleDetails);
      details.push(...featuresDetails);
      details.push(...financialDetails);
      
    } catch (error) {
      console.error('Error getting property details:', error);
      // Hata durumunda en azından bazı temel bilgileri gösterelim
      if (listing.area) details.push({ label: 'Alan', value: `${listing.area} m²` });
      if (listing.rooms) details.push({ label: 'Oda Sayısı', value: listing.rooms });
      
      // If we don't have address information yet, try to add it
      if (!details.some(d => d.label === 'İl') && listing.province) {
        details.push({ label: 'İl', value: listing.province });
      }
      if (!details.some(d => d.label === 'İlçe') && listing.district) {
        details.push({ label: 'İlçe', value: listing.district });
      }
      if (!details.some(d => d.label === 'Mahalle') && listing.neighborhood) {
        details.push({ label: 'Mahalle', value: listing.neighborhood });
      }
    }
    
    // Ensure all values have their first letter capitalized
    return details.map(detail => {
      // Skip if value is a number or already capitalized
      if (typeof detail.value === 'number' || typeof detail.value !== 'string') {
        return detail;
      }
      
      // Capitalize first letter of value if it's a string
      const value = detail.value.charAt(0).toUpperCase() + detail.value.slice(1);
      return { ...detail, value };
    });
  };
  
  // Get images
  const getImages = () => {
    if (!listing) return [];
    
    try {
      if (listing.images && listing.images.length > 0) {
        // Sort by order_index
        return [...listing.images].sort((a, b) => a.order_index - b.order_index);
      }
    } catch (error) {
      console.error('Error getting images:', error);
    }
    
    return [];
  };
  
  // Add cache-busting for Cloudinary URLs
  const addCacheBuster = (url: string) => {
    if (!url) return "/images/ce.png";
    if (!url.includes('cloudinary')) return url;
    
    // Add a cache-busting parameter
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}cb=${Date.now()}`;
  };
  
  // Function to navigate to the previous image
  const goToPrevImage = () => {
    if (listing && getImages().length > 0) {
      setActiveImageIndex((prevIndex) => 
        prevIndex === 0 ? getImages().length - 1 : prevIndex - 1
      );
    }
  };

  // Function to navigate to the next image
  const goToNextImage = () => {
    if (listing && getImages().length > 0) {
      setActiveImageIndex((prevIndex) => 
        prevIndex === getImages().length - 1 ? 0 : prevIndex + 1
      );
    }
  };
  
  // Image loading state
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);
  
  // Reset loading state when active image changes
  useEffect(() => {
    setMainImageLoaded(false);
    setMainImageError(false);
  }, [activeImageIndex]);

  // Close phone dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target as Node)) {
        setShowPhoneNumbers(false);
      }
      if (whatsappDropdownRef.current && !whatsappDropdownRef.current.contains(event.target as Node)) {
        setShowWhatsAppNumbers(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-16 sm:pt-20">
        {isLoading ? (
          <div className="py-20">
            <Loading size="large" />
          </div>
        ) : error || !listing ? (
          <div className="flex flex-col justify-center items-center py-20">
            <p className="text-lg text-red-500 mb-4">{error || 'İlan bulunamadı'}</p>
            <p className="text-gray-500 mb-6">İstediğiniz ilan mevcut değil veya bir hata oluştu.</p>
            <Button asChild>
              <Link href="/">Ana Sayfaya Dön</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Listing Header */}
            <div className="bg-gradient-to-r from-gray-800 to-black py-7 sm:py-8">
              <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-3 max-w-full md:max-w-[70%] w-full flex flex-col justify-center h-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-primary text-white text-xs px-3 py-1 rounded-full">
                        {formatListingStatus(listing.listing_status || 'satilik')}
                      </span>
                      <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs px-3 py-1 rounded-full">
                        {formatPropertyType(listing.property_type || 'konut')}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-headings font-bold text-white leading-tight break-words hyphens-auto listing-title">
                      {listing.title}
                    </h1>
                    {getLocation() && (
                      <div className="flex items-start text-gray-300 mt-1">
                        <MapPin size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm break-words">{getLocation()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:flex-shrink-0">
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary whitespace-nowrap">
                      {formatPrice(listing.price || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Rest of the component */}
            {/* ... */}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 