"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilterArea from "@/components/FilterArea";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Expand, Car, ArrowRight, Filter, X, Grid, List, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { createSlug, formatLocationFromAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import CategoryFilter from "@/components/CategoryFilter";

// Image Gallery Component
const ImageGallery = ({ 
  images, 
  title 
}: { 
  images: Array<{id: string, url: string, order_index?: number, is_cover?: boolean}>, 
  title: string 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Sort images by order_index and/or is_cover flag
  const sortedImages = React.useMemo(() => {
    // Create a copy of the array to avoid mutating props
    return [...images].sort((a, b) => {
      // First check if order_index exists and use it for sorting
      if (typeof a.order_index === 'number' && typeof b.order_index === 'number') {
        return a.order_index - b.order_index;
      }
      
      // If order_index doesn't exist, prioritize cover image
      if (a.is_cover) return -1;
      if (b.is_cover) return 1;
      
      return 0;
    });
  }, [images]);
  
  // Reset loading state when image changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [currentImageIndex]);
  
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % sortedImages.length);
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  };
  
  // Add cache-busting for Cloudinary URLs
  const addCacheBuster = (url: string) => {
    if (!url) return "/images/ce.png";
    
    // Doğrudan URL'yi döndür, optimizasyon devre dışı bırakıldı
    return url;
  };
  
  return (
    <>
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse w-8 h-8 rounded-full bg-gray-300"></div>
        </div>
      )}
      
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-sm text-gray-500">Resim yüklenemedi</div>
        </div>
      )}
      
      <Image
        src={sortedImages[currentImageIndex]?.url ? addCacheBuster(sortedImages[currentImageIndex].url) : "/images/ce.png"}
        alt={title}
        className={`object-cover rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        fill
        unoptimized={true}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 33vw"
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          console.error(`Failed to load image: ${sortedImages[currentImageIndex]?.url}`);
          setImageError(true);
        }}
        priority={currentImageIndex === 0} // Prioritize loading the first image
      />
      
      {images.length > 1 && (
        <>
          {/* Left arrow */}
          <button 
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-white/80 hover:bg-white text-gray-800 rounded-full p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md"
            aria-label="Previous image"
          >
            <ChevronLeft size={16} className="text-primary" />
          </button>
          
          {/* Right arrow */}
          <button 
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-white/80 hover:bg-white text-gray-800 rounded-full p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md"
            aria-label="Next image"
          >
            <ChevronRight size={16} className="text-primary" />
          </button>
          
          {/* Image counter */}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {currentImageIndex + 1}/{images.length}
          </div>
        </>
      )}
    </>
  );
};

type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc';

interface Listing {
  id: string;
  title: string;
  price: number;
  property_type: string;
  listing_status: string;
  thumbnail_url: string;
  created_at: string;
  location?: string;
  area?: number;
  rooms?: string;
  is_featured?: boolean;
  subcategory?: string;
  addresses?: Array<{province: string; district: string; neighborhood?: string}>;
  images?: Array<{id: string, url: string}>;
  model?: string;
  year?: string;
  district?: string;
  province?: string;
  neighborhood?: string;
  konut_type?: string;
  ticari_type?: string;
  arsa_type?: string;
  heating_type?: string;
  has_balcony?: boolean;
  has_elevator?: boolean;
  is_furnished?: boolean;
  allows_trade?: boolean;
  is_eligible_for_credit?: boolean;
  has_video?: boolean;
}

// Main component with Suspense boundary
function EmlakListingsContent() {
  const searchParams = useSearchParams();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  // Filter states from URL parameters
  const minPrice = searchParams.get('minPrice') || "";
  const maxPrice = searchParams.get('maxPrice') || "";
  const minArea = searchParams.get('minArea') || "";
  const maxArea = searchParams.get('maxArea') || "";
  const listingStatus = searchParams.get('listingStatus') || "";
  const district = searchParams.get('district') || "";
  const neighborhood = searchParams.get('neighborhood') || "";
  const roomCount = searchParams.get('roomCount') || "";
  const konutType = searchParams.get('konutType') || "";
  const ticariType = searchParams.get('ticariType') || "";
  const arsaType = searchParams.get('arsaType') || "";
  const kaks = searchParams.get('kaks') || "";
  const heatingType = searchParams.get('heatingType') || "";
  const hasBalcony = searchParams.get('hasBalcony') || "";
  const hasElevator = searchParams.get('hasElevator') || "";
  const isFurnished = searchParams.get('isFurnished') || "";
  const allowsTrade = searchParams.get('allowsTrade') || "";
  const isEligibleForCredit = searchParams.get('isEligibleForCredit') || "";
  const propertyType = searchParams.get('propertyType') || "";
  const searchQuery = searchParams.get('search') || "";
  const mainCategory = searchParams.get('mainCategory') || "all"; // Ana kategori filtresi
  
  // Add province to the filter states
  const province = searchParams.get('province') || "";

  // Sorting states
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  
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

  // Helper to prettify subcategory names
  const formatSubcategoryName = (raw: string) => {
    const map: Record<string, string> = {
      'mustakil_ev': 'Müstaki Ev',
      'otobus_hatti': 'Otobüs Hattı',
      'taksi_hatti': 'Taksi Hattı',
    };
    if (!raw) return '';
    const lowered = raw.toLowerCase();
    if (map[lowered]) return map[lowered];
    return raw.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Helper function to format listing status
  const formatListingStatus = (status: string) => {
    return status === 'satilik' ? 'Satılık' : 'Kiralık';
  };

  // Helper function to format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('tr-TR').format(price) + ' ₺';
  };
  
  // Function to format location
  const formatLocation = (listing: any) => {
    if (listing.addresses && listing.addresses.length > 0) {
      return formatLocationFromAddress(listing.addresses[0]);
    }
    return listing.location || '';
  };
  
  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/listings');
        
        if (!response.ok) {
          throw new Error('İlanlar yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        
        // Filter out "vasita" listings
        const emlakListings = data.filter((listing: Listing) => listing.property_type !== 'vasita');
        
        // Filter by property type if provided
        const filteredByType = propertyType 
          ? emlakListings.filter((listing: Listing) => listing.property_type === propertyType)
          : emlakListings;
        
        // Fetch additional details for each listing
        const enhancedListings = await Promise.all(
          filteredByType.map(async (listing: Listing) => {
            try {
              // Fetch detailed listing info
              const detailResponse = await fetch(`/api/listings?id=${listing.id}`);
              if (!detailResponse.ok) throw new Error(`Failed to fetch details for listing ${listing.id}`);
              
              const detailData = await detailResponse.json();
              let enhancedListing = { ...listing };
              
              // Extract images if available
              if (detailData.images && detailData.images.length > 0) {
                enhancedListing.images = detailData.images;
              } else {
                // Create a default image array using the thumbnail
                enhancedListing.images = [{
                  id: 'thumbnail',
                  url: listing.thumbnail_url || "/images/ce.png"
                }];
              }
              
              // Extract location from addresses if available
              if (detailData.addresses && detailData.addresses.length > 0) {
                const address = detailData.addresses[0];
                // Capitalize first letter of each part
                enhancedListing.location = formatLocationFromAddress(address);
                enhancedListing.district = address.district;
                enhancedListing.neighborhood = address.neighborhood;
                enhancedListing.province = address.province;
              }
              
              // Extract property-specific details
              if (listing.property_type === 'konut' && detailData.konut_details && detailData.konut_details.length > 0) {
                const konutDetails = detailData.konut_details[0];
                if (konutDetails) {
                  const isPrefabrik = (konutDetails.konut_type ?? '').toLowerCase() === 'prefabrik';
                  if (!isPrefabrik) {
                    enhancedListing.rooms = konutDetails.room_count || 'Belirtilmemiş';
                    enhancedListing.area = konutDetails.gross_sqm || konutDetails.net_sqm || undefined;
                  }
                  // Keep original konut_type for filtering and display
                  enhancedListing.konut_type = konutDetails.konut_type || 'Belirtilmemiş';
                  enhancedListing.subcategory = konutDetails.konut_type || 'Daire';
                  // Map additional attributes for filtering
                  enhancedListing.heating_type = konutDetails.heating;
                  enhancedListing.has_balcony = konutDetails.has_balcony;
                  enhancedListing.has_elevator = konutDetails.has_elevator;
                  enhancedListing.is_furnished = konutDetails.is_furnished;
                  enhancedListing.allows_trade = konutDetails.allows_trade;
                  enhancedListing.is_eligible_for_credit = konutDetails.is_eligible_for_credit;
                }
              } else if (listing.property_type === 'ticari' && detailData.ticari_details && detailData.ticari_details.length > 0) {
                const ticariDetails = detailData.ticari_details[0];
                if (ticariDetails) {
                  enhancedListing.rooms = ticariDetails.room_count ? ticariDetails.room_count.toString() : 'Belirtilmemiş';
                  enhancedListing.area = ticariDetails.gross_sqm || ticariDetails.net_sqm || undefined;
                  // Map additional attributes for filtering
                  enhancedListing.heating_type = ticariDetails.heating;
                  enhancedListing.allows_trade = ticariDetails.allows_trade;
                  enhancedListing.is_eligible_for_credit = ticariDetails.is_eligible_for_credit;
                  enhancedListing.ticari_type = ticariDetails.ticari_type;
                }
              } else if (listing.property_type === 'arsa' && detailData.arsa_details && detailData.arsa_details.length > 0) {
                const arsaDetails = detailData.arsa_details[0];
                if (arsaDetails) {
                  enhancedListing.area = arsaDetails.sqm || undefined;
                  // Map additional attributes for filtering
                  enhancedListing.arsa_type = arsaDetails.arsa_type;
                  enhancedListing.allows_trade = arsaDetails.allows_trade;
                  enhancedListing.is_eligible_for_credit = arsaDetails.is_eligible_for_credit;
                }
              }

              // Attach detail arrays for later filters (konut, ticari, arsa)
              // @ts-ignore – extend listing with detail arrays for filtering needs
              enhancedListing.konut_details = detailData.konut_details;
              // @ts-ignore
              enhancedListing.ticari_details = detailData.ticari_details;
              // @ts-ignore
              enhancedListing.arsa_details = detailData.arsa_details;
              
              return enhancedListing;
            } catch (error) {
              console.error(`Error fetching details for listing ${listing.id}:`, error);
              return listing; // Return original listing if detail fetch fails
            }
          })
        );
        
        setListings(enhancedListings);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('İlanları yüklerken bir hata oluştu');
        setIsLoading(false);
      }
    };
    
    fetchListings();
  }, [propertyType]);
  
  // Apply filters and sorting
  const applyFiltersAndSort = useCallback(() => {
    if (!listings.length) return;
    
    let filtered = [...listings];
    
    // Handle search query if present
    if (searchQuery) {
      // First try to fetch search results from API
      const fetchSearchResults = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/listings/search?q=${encodeURIComponent(searchQuery)}`);
          
          if (!response.ok) {
            throw new Error('Search failed');
          }
          
          const data = await response.json();
          
          // Filter out vasita listings since we're on the emlak page
          const emlakResults = data.results.filter((listing: Listing) => listing.property_type !== 'vasita');
          
          setFilteredListings(emlakResults);
          setIsLoading(false);
        } catch (error) {
          console.error('Error searching listings:', error);
          
          // Fallback to client-side filtering if API search fails
          const normalizedQuery = searchQuery.toLowerCase().trim();
          
          filtered = filtered.filter(listing => 
            listing.title?.toLowerCase().includes(normalizedQuery) ||
            listing.property_type?.toLowerCase().includes(normalizedQuery) ||
            listing.location?.toLowerCase().includes(normalizedQuery) ||
            listing.rooms?.toLowerCase().includes(normalizedQuery) ||
            (listing.konut_type && listing.konut_type.toLowerCase().includes(normalizedQuery))
          );
          
          applyRemainingFilters(filtered);
          setIsLoading(false);
        }
      };
      
      fetchSearchResults();
      return;
    }
    
    // Apply remaining filters if no search query
    applyRemainingFilters(filtered);
  }, [listings, minPrice, maxPrice, minArea, maxArea, listingStatus, province, district, neighborhood, roomCount, konutType, ticariType, arsaType, kaks, heatingType, hasBalcony, hasElevator, isFurnished, allowsTrade, isEligibleForCredit, propertyType, mainCategory, sortOption, searchQuery]);
  
  // Helper function to apply the remaining filters
  const applyRemainingFilters = (filtered: Listing[]) => {
    // Filter by main category (property_type)
    if (mainCategory && mainCategory !== 'all') {
      filtered = filtered.filter(listing => listing.property_type === mainCategory);
    }
    
    // Filter by price
    if (minPrice) {
      filtered = filtered.filter(listing => listing.price >= parseInt(minPrice));
    }
    
    if (maxPrice) {
      filtered = filtered.filter(listing => listing.price <= parseInt(maxPrice));
    }
    
    // Filter by area
    if (minArea) {
      filtered = filtered.filter(listing => listing.area && listing.area >= parseInt(minArea));
    }
    
    if (maxArea) {
      filtered = filtered.filter(listing => listing.area && listing.area <= parseInt(maxArea));
    }
    
    // Filter by listing status
    if (listingStatus) {
      filtered = filtered.filter(listing => listing.listing_status === listingStatus);
    }
    
    // Filter by district
    if (district) {
      filtered = filtered.filter(listing => 
        listing.district && listing.district.toLowerCase() === district.toLowerCase()
      );
    }
    
    // Filter by neighborhood
    if (neighborhood) {
      filtered = filtered.filter(listing => 
        listing.neighborhood && listing.neighborhood.toLowerCase() === neighborhood.toLowerCase()
      );
    }
    
    // Filter by room count (for konut/ticari or when mainCategory is konut/ticari)
    if (roomCount && roomCount !== 'all' && (propertyType === 'konut' || mainCategory === 'konut' || propertyType === 'ticari' || mainCategory === 'ticari')) {
      filtered = filtered.filter(listing => 
        listing.rooms && listing.rooms !== 'undefined' && listing.rooms === roomCount
      );
    }
    
    // Filter by konut type (for konut or when mainCategory is konut)
    if (konutType && konutType !== 'all' && (propertyType === 'konut' || mainCategory === 'konut')) {
      filtered = filtered.filter(listing => 
        listing.konut_type && listing.konut_type !== 'undefined' && listing.konut_type === konutType
      );
    }
    
    // Filter by ticari type (for ticari or when mainCategory is ticari)
    if (ticariType && ticariType !== 'all' && (propertyType === 'ticari' || mainCategory === 'ticari')) {
      filtered = filtered.filter(listing => 
        listing.ticari_type && listing.ticari_type !== 'undefined' && listing.ticari_type === ticariType
      );
    }
    
    // Filter by arsa type (for arsa or when mainCategory is arsa)
    if (arsaType && arsaType !== 'all' && (propertyType === 'arsa' || mainCategory === 'arsa')) {
      filtered = filtered.filter(listing => 
        listing.arsa_type && listing.arsa_type !== 'undefined' && listing.arsa_type === arsaType
      );
    }
    
    // Filter by heating type
    if (heatingType && heatingType !== 'all' && (propertyType === 'konut' || mainCategory === 'konut' || propertyType === 'ticari' || mainCategory === 'ticari')) {
      filtered = filtered.filter(listing => 
        listing.heating_type && listing.heating_type !== 'undefined' && listing.heating_type === heatingType
      );
    }
    
    // Filter by balcony
    if (hasBalcony && hasBalcony !== 'all' && (propertyType === 'konut' || mainCategory === 'konut')) {
      const hasBalconyBool = hasBalcony === 'true';
      filtered = filtered.filter(listing => listing.has_balcony === hasBalconyBool);
    }
    
    // Filter by elevator
    if (hasElevator && hasElevator !== 'all' && (propertyType === 'konut' || mainCategory === 'konut')) {
      const hasElevatorBool = hasElevator === 'true';
      filtered = filtered.filter(listing => listing.has_elevator === hasElevatorBool);
    }
    
    // Filter by furnished
    if (isFurnished && isFurnished !== 'all' && (propertyType === 'konut' || mainCategory === 'konut')) {
      const isFurnishedBool = isFurnished === 'true';
      filtered = filtered.filter(listing => listing.is_furnished === isFurnishedBool);
    }
    
    // Filter by trade
    if (allowsTrade && allowsTrade !== 'all') {
      const allowsTradeBool = allowsTrade === 'true';
      filtered = filtered.filter(listing => listing.allows_trade === allowsTradeBool);
    }
    
    // Filter by credit eligibility
    if (isEligibleForCredit && isEligibleForCredit !== 'all') {
      const isEligibleForCreditBool = isEligibleForCredit === 'true';
      filtered = filtered.filter(listing => listing.is_eligible_for_credit === isEligibleForCreditBool);
    }
    
    // Filter by province
    if (province) {
      filtered = filtered.filter(listing => 
        listing.province && listing.province.toLowerCase() === province.toLowerCase()
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => {
          if (!a.created_at || !b.created_at) return 0;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
      case 'oldest':
        filtered.sort((a, b) => {
          if (!a.created_at || !b.created_at) return 0;
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'area_asc':
        filtered.sort((a, b) => {
          const areaA = a.area || 0;
          const areaB = b.area || 0;
          return areaA - areaB;
        });
        break;
      case 'area_desc':
        filtered.sort((a, b) => {
          const areaA = a.area || 0;
          const areaB = b.area || 0;
          return areaB - areaA;
        });
        break;
    }
    
    setFilteredListings(filtered);
  };
  
  // Apply filters when filter states change or listings change
  useEffect(() => {
    applyFiltersAndSort();
  }, [listings, applyFiltersAndSort]);
  
  // Reapply sorting when sort option changes
  useEffect(() => {
    applyFiltersAndSort();
  }, [sortOption]);
  
  // Handle category switch
  const getCategoryLink = (cat: string) => {
    return cat === propertyType ? '#' : `/ilanlar/${cat}`;
  };
  
  // Update initialFilters to include province parameter
  const initialFilters = {
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    listingStatus,
    province,
    district,
    neighborhood,
    roomCount,
    konutType,
    ticariType,
    arsaType,
    kaks,
    heatingType,
    hasBalcony,
    hasElevator,
    isFurnished,
    allowsTrade,
    isEligibleForCredit,
    mainCategory
  };
  
  // Always use 'emlak' as the category for this page
  const filterCategory = 'emlak';
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-16 sm:pt-20">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-gray-800 to-black py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex flex-col justify-center h-full">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-headings font-bold text-white">
                  Emlak İlanları
                </h1>
                <p className="text-gray-100 mt-2">
                  {filteredListings.length} ilan listeleniyor
                </p>
              </div>
              
              {/* Category Switch Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <Link href={getCategoryLink('konut')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${propertyType === 'konut' ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  Konut
                </Link>
                <Link href={getCategoryLink('ticari')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${propertyType === 'ticari' ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  Ticari
                </Link>
                <Link href={getCategoryLink('arsa')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${propertyType === 'arsa' ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  Arsa
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden sticky top-16 z-20 bg-white shadow-md">
          <div className="container mx-auto px-4 py-3">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50"
              onClick={() => setShowMobileFilter(!showMobileFilter)}
            >
              {showMobileFilter ? (
                <>
                  <X size={18} className="text-primary" />
                  <span>Filtreleri Kapat</span>
                </>
              ) : (
                <>
                  <Filter size={18} className="text-primary" />
                  <span>Filtreleme Seçenekleri</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Search Results Indicator */}
          {searchQuery && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <Search size={18} className="text-primary mr-2" />
                <span className="text-sm">
                  <strong>"{searchQuery}"</strong> için arama sonuçları ({filteredListings.length} ilan bulundu)
                </span>
              </div>
              <Link 
                href="/ilanlar/emlak"
                className="flex items-center text-xs bg-gray-100 hover:bg-gray-200 transition-colors px-3 py-1 rounded-full"
              >
                <X size={14} className="mr-1" />
                Aramayı Temizle
              </Link>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Filter - Desktop */}
            <div className={`md:w-1/4 lg:w-1/5 md:block ${showMobileFilter ? 'block' : 'hidden'}`}>
              <CategoryFilter category={filterCategory} initialFilters={initialFilters} />
            </div>
            
            {/* Listings Grid */}
            <div className="md:w-3/4 lg:w-4/5">
              {/* Sorting and View Options */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sırala:</span>
                  <select 
                    className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                  >
                    <option value="newest">En Yeni</option>
                    <option value="oldest">En Eski</option>
                    <option value="price_asc">Fiyat (Artan)</option>
                    <option value="price_desc">Fiyat (Azalan)</option>
                        <option value="area_asc">Alan (Artan)</option>
                        <option value="area_desc">Alan (Azalan)</option>
                  </select>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <span>Toplam: <strong>{filteredListings.length}</strong> ilan</span>
                </div>
              </div>
              
              {/* Listings */}
              {isLoading ? (
                <div className="py-20">
                  <Loading size="large" />
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-20">
                  <h3 className="text-xl font-semibold mb-2">İlan Bulunamadı</h3>
                  <p className="text-gray-500">Arama kriterlerinize uygun ilan bulunamadı. Lütfen filtrelerinizi değiştirin.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {filteredListings.map((listing) => (
                    <Link key={listing.id} href={`/ilan/${createSlug(listing.title)}`} className="block h-full">
                      <Card className="listing-card h-full flex flex-col md:flex-row overflow-hidden transition-all duration-300 hover:shadow-lg transform-gpu hover:-translate-y-1 border border-gray-100 p-4">
                        {/* Image container - Left side */}
                        <div className="relative aspect-[4/3] h-32 md:h-auto md:w-1/4 w-full overflow-hidden flex-shrink-0 group rounded-lg m-2">
                          <ImageGallery 
                            images={listing.images || [{id: 'default', url: listing.thumbnail_url || "/images/ce.png"}]} 
                            title={listing.title}
                          />
                          
                          {/* Type tag (top left) */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            <div className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-full shadow-md z-10">
                              {formatListingStatus(listing.listing_status || '')}
                            </div>
                            <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1 rounded-full shadow-md z-10">
                              {listing.property_type === 'vasita' && listing.model ?
                                listing.model.split(' ')[0].charAt(0).toUpperCase() + listing.model.split(' ')[0].slice(1) :
                                formatSubcategoryName(listing.konut_type || listing.subcategory || formatPropertyType(listing.property_type || ''))}
                            </div>
                          </div>
                          
                          {/* Video badge if available */}
                          {listing.has_video && (
                            <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md z-10 flex items-center">
                              <span className="mr-1">VİDEOLU</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Content container - Right side */}
                        <div className="flex flex-col flex-grow p-2 md:p-3 justify-between">
                          <div>
                            {/* Price tag */}
                            <div className="mb-1.5">
                              <p className="text-primary text-lg md:text-xl font-bold">{formatPrice(listing.price)}</p>
                            </div>
                            
                            {/* Listing title */}
                            <h3 className="text-base md:text-lg font-semibold line-clamp-2 mb-2 break-words hyphens-auto">{listing.title}</h3>
                            
                            {/* Location */}
                            {(listing.location || (listing.addresses && listing.addresses.length > 0)) && (
                              <div className="flex items-start text-muted-foreground text-xs mb-3">
                                <MapPin size={14} className="mr-1 flex-shrink-0 text-primary mt-0.5" />
                                <span className="truncate break-words">{formatLocation(listing)}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Property details at bottom */}
                          <div className="border-t border-gray-100 pt-3 mt-auto">
                            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                              {listing.rooms && listing.rooms !== 'undefined' && listing.rooms !== 'Belirtilmemiş' && listing.rooms !== '0' && (
                                <div className="flex items-center">
                                  <Bed size={14} className="mr-1.5 flex-shrink-0 text-primary" />
                                  <span>{listing.rooms}</span>
                                </div>
                              )}
                              
                              {listing.area && listing.area > 0 && (
                                <div className="flex items-center">
                                  <Expand size={14} className="mr-1.5 flex-shrink-0 text-primary" />
                                  <span>{listing.area} m²</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Export the component with Suspense
export default function EmlakListings() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading size="large" text="Yükleniyor..." /></div>}>
      <EmlakListingsContent />
    </Suspense>
  );
} 