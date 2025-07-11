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

export default function ListingDetail() {
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
        if (konutDetails.building_age !== undefined) buildingDetails.push({ label: 'Bina Yaşı', value: konutDetails.building_age });
        if (konutDetails.floor !== undefined) buildingDetails.push({ label: 'Bulunduğu Kat', value: konutDetails.floor });
        if (konutDetails.total_floors !== undefined) buildingDetails.push({ label: 'Toplam Kat', value: konutDetails.total_floors });
        
        if (konutDetails.heating) {
          const heatingMap: Record<string, string> = {
            'dogalgaz': 'Doğalgaz',
            'soba': 'Soba',
            'merkezi': 'Merkezi',
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
      } else if (listing.property_type === 'ticari' && listing.ticari_details && listing.ticari_details.length > 0) {
        const ticariDetails = listing.ticari_details[0];
        
        // Property type details
        if (ticariDetails.ticari_type) {
          const ticariTypeMap: Record<string, string> = {
            'dukkan': 'Dükkan',
            'depo': 'Depo',
            'villa': 'Villa',
            'fabrika': 'Fabrika',
            'atolye': 'Atölye',
            'plaza': 'Plaza',
            'bina': 'Bina',
            'ofis': 'Ofis',
            'cafe': 'Cafe',
            'bufe': 'Büfe'
          };
          propertyTypeDetails.push({ label: 'Ticari Mülk Tipi', value: ticariTypeMap[ticariDetails.ticari_type] || ticariDetails.ticari_type });
        }
        
        // Area details
        if (ticariDetails.gross_sqm) areaDetails.push({ label: 'Brüt Alan', value: `${ticariDetails.gross_sqm} m²` });
        if (ticariDetails.net_sqm) areaDetails.push({ label: 'Net Alan', value: `${ticariDetails.net_sqm} m²` });
        
        // Room details
        if (ticariDetails.room_count !== undefined) roomDetails.push({ label: 'Oda Sayısı', value: ticariDetails.room_count });
        
        // Building details
        if (ticariDetails.building_age !== undefined) buildingDetails.push({ label: 'Bina Yaşı', value: ticariDetails.building_age });
        if (ticariDetails.floor !== undefined) buildingDetails.push({ label: 'Bulunduğu Kat', value: ticariDetails.floor });
        if (ticariDetails.total_floors !== undefined) buildingDetails.push({ label: 'Toplam Kat', value: ticariDetails.total_floors });
        
        if (ticariDetails.heating) {
          const heatingMap: Record<string, string> = {
            'dogalgaz': 'Doğalgaz',
            'soba': 'Soba',
            'merkezi': 'Merkezi',
            'yok': 'Yok'
          };
          buildingDetails.push({ label: 'Isıtma', value: heatingMap[ticariDetails.heating] || ticariDetails.heating });
        }
        
        // Financial details
        if (ticariDetails.allows_trade) financialDetails.push({ label: 'Takas', value: 'Evet' });
        if (ticariDetails.is_eligible_for_credit) financialDetails.push({ label: 'Krediye Uygun', value: 'Evet' });
      } else if (listing.property_type === 'arsa' && listing.arsa_details && listing.arsa_details.length > 0) {
        const arsaDetails = listing.arsa_details[0];
        
        // Property type details
        if (arsaDetails.arsa_type) {
          const arsaTypeMap: Record<string, string> = {
            'tarla': 'Tarla',
            'bahce': 'Bahçe',
            'konut_imarli': 'Konut İmarlı',
            'ticari_imarli': 'Ticari İmarlı'
          };
          propertyTypeDetails.push({ label: 'Arsa Tipi', value: arsaTypeMap[arsaDetails.arsa_type] || arsaDetails.arsa_type });
        }
        
        // Area details
        if (arsaDetails.sqm) areaDetails.push({ label: 'Alan', value: `${arsaDetails.sqm} m²` });
        if (arsaDetails.kaks) areaDetails.push({ label: 'KAKS', value: arsaDetails.kaks });
        
        // Financial details
        if (arsaDetails.allows_trade) financialDetails.push({ label: 'Takas', value: 'Evet' });
        if (arsaDetails.is_eligible_for_credit) financialDetails.push({ label: 'Krediye Uygun', value: 'Evet' });
      } else if (listing.property_type === 'vasita' && listing.vasita_details && listing.vasita_details.length > 0) {
        const vasitaDetails = listing.vasita_details[0];
        
        // Vehicle type details
        if (vasitaDetails.vasita_type) {
          const vasitaTypeMap: Record<string, string> = {
            'otomobil': 'Otomobil',
            'suv': 'SUV',
            'atv': 'ATV',
            'utv': 'UTV',
            'van': 'Van',
            'motosiklet': 'Motosiklet',
            'bisiklet': 'Bisiklet',
            'ticari': 'Ticari'
          };
          propertyTypeDetails.push({ label: 'Vasıta Tipi', value: vasitaTypeMap[vasitaDetails.vasita_type] || vasitaDetails.vasita_type });
        }
        
        // Vehicle details
        if (vasitaDetails.brand) vehicleDetails.push({ label: 'Marka', value: vasitaDetails.brand });
        if (vasitaDetails.model) vehicleDetails.push({ label: 'Model', value: vasitaDetails.model });
        if (vasitaDetails.sub_model) vehicleDetails.push({ label: 'Alt Model', value: vasitaDetails.sub_model });
        if (vasitaDetails.year) vehicleDetails.push({ label: 'Yıl', value: vasitaDetails.year });
        if (vasitaDetails.kilometer !== undefined) vehicleDetails.push({ label: 'KM', value: vasitaDetails.kilometer.toLocaleString() });
        
        if (vasitaDetails.fuel_type) {
          const fuelTypeMap: Record<string, string> = {
            'benzin': 'Benzin',
            'dizel': 'Dizel',
            'lpg': 'LPG',
            'elektrik': 'Elektrik',
            'hibrit': 'Hibrit'
          };
          vehicleDetails.push({ label: 'Yakıt', value: fuelTypeMap[vasitaDetails.fuel_type] || vasitaDetails.fuel_type });
        }
        
        if (vasitaDetails.transmission) {
          const transmissionMap: Record<string, string> = {
            'manuel': 'Manuel',
            'otomatik': 'Otomatik',
            'yarı_otomatik': 'Yarı Otomatik'
          };
          vehicleDetails.push({ label: 'Vites', value: transmissionMap[vasitaDetails.transmission] || vasitaDetails.transmission });
        }
        
        if (vasitaDetails.color) vehicleDetails.push({ label: 'Renk', value: vasitaDetails.color });
        
        // Features
        if (vasitaDetails.has_warranty) featuresDetails.push({ label: 'Garanti', value: 'Var' });
        if (vasitaDetails.has_damage_record) featuresDetails.push({ label: 'Hasar Kaydı', value: 'Var' });
        
        // Financial details
        if (vasitaDetails.allows_trade) financialDetails.push({ label: 'Takas', value: 'Evet' });
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
      
      // Eğer hiç detay yoksa, ana listingden bilgileri ekleyelim
      if (details.length === 0) {
        if (listing.area) details.push({ label: 'Alan', value: `${listing.area} m²` });
        if (listing.rooms) details.push({ label: 'Oda Sayısı', value: listing.rooms });
      }
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
            
            {/* Listing Content */}
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Gallery and Description */}
                <div className="lg:w-2/3 space-y-8">
                  {/* Gallery */}
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Main Image */}
                    <div className="relative h-72 sm:h-96 md:h-[500px] w-full">
                      {getImages().length > 0 ? (
                        <>
                          {!mainImageLoaded && !mainImageError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <div className="animate-pulse w-12 h-12 rounded-full bg-gray-300"></div>
                            </div>
                          )}
                          
                          {mainImageError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <div className="text-sm text-gray-500">Resim yüklenemedi</div>
                            </div>
                          )}
                          
                          <Image
                            src={addCacheBuster(getImages()[activeImageIndex].url)}
                            alt={listing.title}
                            fill
                            className={`object-cover transition-opacity duration-300 ${mainImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw"
                            onLoad={() => setMainImageLoaded(true)}
                            onError={() => {
                              console.error(`Failed to load image: ${getImages()[activeImageIndex].url}`);
                              setMainImageError(true);
                            }}
                            priority={true}
                          />
                          
                          {/* Navigation Arrows */}
                          <button 
                            onClick={goToPrevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-2 shadow-md transition-all duration-300 hover:scale-110 z-10"
                            aria-label="Previous image"
                          >
                            <ChevronLeft size={24} className="text-yellow-500" />
                          </button>
                          
                          <button 
                            onClick={goToNextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-2 shadow-md transition-all duration-300 hover:scale-110 z-10"
                            aria-label="Next image"
                          >
                            <ChevronRight size={24} className="text-yellow-500" />
                          </button>
                        </>
                      ) : (
                        <Image
                          src="/images/ce.png"
                          alt={listing.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw"
                        />
                      )}
                    </div>
                    
                    {/* Thumbnails with Swiper */}
                    {getImages().length > 1 && (
                      <div className="p-3">
                        <Swiper
                          slidesPerView="auto"
                          spaceBetween={12}
                          freeMode={true}
                          modules={[FreeMode, Navigation]}
                          className="cursor-grab"
                        >
                          {getImages().map((image, index) => (
                            <SwiperSlide 
                              key={image.id} 
                              className="!w-28"
                            >
                              <div 
                                className={`relative h-20 w-28 flex-shrink-0 rounded-md overflow-hidden cursor-pointer transition-all ${index === activeImageIndex ? 'ring-2 ring-primary' : 'hover:opacity-80'}`}
                                onClick={() => setActiveImageIndex(index)}
                              >
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                  <div className="animate-pulse w-5 h-5 rounded-full bg-gray-300"></div>
                                </div>
                                <Image
                                  src={addCacheBuster(image.url)}
                                  alt={`${listing.title} - ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  sizes="112px"
                                  onError={(e) => {
                                    console.error(`Failed to load thumbnail: ${image.url}`);
                                    // Fallback to default image
                                    (e.target as HTMLImageElement).src = "/images/ce.png";
                                  }}
                                />
                              </div>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
                    <h2 className="text-xl font-semibold mb-5">Açıklama</h2>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-line text-base leading-relaxed break-words">{listing.description || 'Bu ilan için açıklama bulunmamaktadır.'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Sidebar */}
                <div className="lg:w-1/3 space-y-8">
                  {/* Contact Info */}
                  <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
                    <h2 className="text-xl font-semibold mb-5">İletişim</h2>
                    <div className="flex items-center mb-6">
                      <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                        <Image
                          src="/images/logo_black.png"
                          alt="Ceyhun Emlak"
                          width={32}
                          height={32}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-base">Ceyhun Emlak</p>
                        <p className="text-sm text-gray-500 mt-1">Emlak Danışmanı</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="relative" ref={phoneDropdownRef}>
                        <Button 
                          className="w-full flex items-center justify-center gap-2 py-3 text-base"
                          onClick={() => setShowPhoneNumbers(!showPhoneNumbers)}
                        >
                          <Phone size={18} />
                          <span>Ara</span>
                          <ChevronDown size={16} className={`ml-1 transition-transform ${showPhoneNumbers ? 'rotate-180' : ''}`} />
                        </Button>
                        
                        {showPhoneNumbers && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-2">
                            <a 
                              href="tel:+905323850420" 
                              className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                            >
                              <Phone size={16} className="mr-2 text-primary" />
                              <div>
                                <p className="font-medium">0 (532) 385 04 20</p>
                                <p className="text-xs text-gray-500">Ceyhun Çiftçi</p>
                              </div>
                            </a>
                            <a 
                              href="tel:+905530036031" 
                              className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                            >
                              <Phone size={16} className="mr-2 text-primary" />
                              <div>
                                <p className="font-medium">0 (553) 003 60 31</p>
                                <p className="text-xs text-gray-500">Cenk Çiftçi</p>
                              </div>
                            </a>
                            <a 
                              href="tel:+903562280444" 
                              className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                            >
                              <Phone size={16} className="mr-2 text-primary" />
                              <div>
                                <p className="font-medium">0 (356) 228 0 444</p>
                                <p className="text-xs text-gray-500">Ceyhun Emlak</p>
                              </div>
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="relative" ref={whatsappDropdownRef}>
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-2 py-3 text-base"
                          onClick={() => setShowWhatsAppNumbers(!showWhatsAppNumbers)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#25D366" className="mr-1">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          <span>WhatsApp</span>
                          <ChevronDown size={16} className={`ml-1 transition-transform ${showWhatsAppNumbers ? 'rotate-180' : ''}`} />
                        </Button>
                        
                        {showWhatsAppNumbers && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-2">
                            <a 
                              href="https://wa.me/905323850420" 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#25D366" className="mr-2">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              <div>
                                <p className="font-medium">0 (532) 385 04 20</p>
                                <p className="text-xs text-gray-500">Ceyhun Çiftçi</p>
                              </div>
                            </a>
                            <a 
                              href="https://wa.me/905366067071" 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#25D366" className="mr-2">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              <div>
                                <p className="font-medium">0 (536) 606 70 71</p>
                                <p className="text-xs text-gray-500">Berk Çiftçi</p>
                              </div>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Property Details */}
                  <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
                    <h2 className="text-xl font-semibold mb-5">İlan Özellikleri</h2>
                    {getPropertyDetails().length > 0 ? (
                      <div className="space-y-6">
                        {/* Group properties by categories */}
                        {/* Location Details section is removed since it's already displayed at the top left of the page */}

                        {/* Property Type Details */}
                        {getPropertyDetails().some(detail => 
                          ['Konut Tipi', 'Ticari Mülk Tipi', 'Arsa Tipi', 'Vasıta Tipi'].includes(detail.label)
                        ) && (
                          <div>
                            <div className="border-b pb-2 mb-3"></div>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                              {getPropertyDetails()
                                .filter(detail => 
                                  ['Konut Tipi', 'Ticari Mülk Tipi', 'Arsa Tipi', 'Vasıta Tipi'].includes(detail.label)
                                )
                                .map((detail, index) => (
                                  <div key={`type-${index}`} className="flex flex-col">
                                    <span className="text-sm text-gray-500 mb-1">{detail.label}</span>
                                    <span className="font-medium text-base break-words">
                                      {typeof detail.value === 'string' 
                                        ? detail.value.charAt(0).toUpperCase() + detail.value.slice(1) 
                                        : detail.value}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Area Details */}
                        {getPropertyDetails().some(detail => 
                          ['Alan', 'Brüt Alan', 'Net Alan', 'KAKS'].includes(detail.label)
                        ) && (
                          <div>
                            <div className="border-b pb-2 mb-3"></div>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                              {getPropertyDetails()
                                .filter(detail => ['Alan', 'Brüt Alan', 'Net Alan', 'KAKS'].includes(detail.label))
                                .map((detail, index) => (
                                  <div key={`area-${index}`} className="flex flex-col">
                                    <span className="text-sm text-gray-500 mb-1">{detail.label}</span>
                                    <span className="font-medium text-base break-words">
                                      {typeof detail.value === 'string' 
                                        ? detail.value.charAt(0).toUpperCase() + detail.value.slice(1) 
                                        : detail.value}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Room Details */}
                        {getPropertyDetails().some(detail => detail.label === 'Oda Sayısı') && (
                          <div>
                            <div className="border-b pb-2 mb-3"></div>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                              {getPropertyDetails()
                                .filter(detail => detail.label === 'Oda Sayısı')
                                .map((detail, index) => (
                                  <div key={`room-${index}`} className="flex flex-col">
                                    <span className="text-sm text-gray-500 mb-1">{detail.label}</span>
                                    <span className="font-medium text-base break-words">
                                      {typeof detail.value === 'string' 
                                        ? detail.value.charAt(0).toUpperCase() + detail.value.slice(1) 
                                        : detail.value}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Building Details */}
                        {getPropertyDetails().some(detail => 
                          ['Bina Yaşı', 'Bulunduğu Kat', 'Toplam Kat', 'Isıtma'].includes(detail.label)
                        ) && (
                          <div>
                            <div className="border-b pb-2 mb-3"></div>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                              {getPropertyDetails()
                                .filter(detail => 
                                  ['Bina Yaşı', 'Bulunduğu Kat', 'Toplam Kat', 'Isıtma'].includes(detail.label)
                                )
                                .map((detail, index) => (
                                  <div key={`building-${index}`} className="flex flex-col">
                                    <span className="text-sm text-gray-500 mb-1">{detail.label}</span>
                                    <span className="font-medium text-base break-words">
                                      {typeof detail.value === 'string' 
                                        ? detail.value.charAt(0).toUpperCase() + detail.value.slice(1) 
                                        : detail.value}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Vehicle Details */}
                        {listing.property_type === 'vasita' && getPropertyDetails().some(detail => 
                          ['Marka', 'Model', 'Alt Model', 'Yıl', 'KM', 'Yakıt', 'Vites', 'Renk'].includes(detail.label)
                        ) && (
                          <div>
                            <div className="border-b pb-2 mb-3"></div>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                              {getPropertyDetails()
                                .filter(detail => 
                                  ['Marka', 'Model', 'Alt Model', 'Yıl', 'KM', 'Yakıt', 'Vites', 'Renk'].includes(detail.label)
                                )
                                .map((detail, index) => (
                                  <div key={`vehicle-${index}`} className="flex flex-col">
                                    <span className="text-sm text-gray-500 mb-1">{detail.label}</span>
                                    <span className="font-medium text-base break-words">
                                      {typeof detail.value === 'string' 
                                        ? detail.value.charAt(0).toUpperCase() + detail.value.slice(1) 
                                        : detail.value}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Features */}
                        {getPropertyDetails().some(detail => 
                          ['Balkon', 'Asansör', 'Eşyalı', 'Garanti', 'Hasar Kaydı'].includes(detail.label)
                        ) && (
                          <div>
                            <div className="border-b pb-2 mb-3"></div>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                              {getPropertyDetails()
                                .filter(detail => 
                                  ['Balkon', 'Asansör', 'Eşyalı', 'Garanti', 'Hasar Kaydı'].includes(detail.label)
                                )
                                .map((detail, index) => (
                                  <div key={`feature-${index}`} className="flex flex-col">
                                    <span className="text-sm text-gray-500 mb-1">{detail.label}</span>
                                    <span className="font-medium text-base break-words">
                                      {typeof detail.value === 'string' 
                                        ? detail.value.charAt(0).toUpperCase() + detail.value.slice(1) 
                                        : detail.value}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Financial Details */}
                        {getPropertyDetails().some(detail => 
                          ['Takas', 'Krediye Uygun'].includes(detail.label)
                        ) && (
                          <div>
                            <div className="border-b pb-2 mb-3"></div>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                              {getPropertyDetails()
                                .filter(detail => ['Takas', 'Krediye Uygun'].includes(detail.label))
                                .map((detail, index) => (
                                  <div key={`financial-${index}`} className="flex flex-col">
                                    <span className="text-sm text-gray-500 mb-1">{detail.label}</span>
                                    <span className="font-medium text-base break-words">
                                      {typeof detail.value === 'string' 
                                        ? detail.value.charAt(0).toUpperCase() + detail.value.slice(1) 
                                        : detail.value}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-base text-gray-500">Bu ilan için detaylı özellik bilgisi bulunmamaktadır.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 