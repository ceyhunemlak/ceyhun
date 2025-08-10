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

// Image Gallery Component
const ImageGallery = ({ 
  images, 
  title 
}: { 
  images: Array<{id: string, url: string, order_index?: number, is_cover?: boolean}>, 
  title: string 
}) => {
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

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
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
  has_video?: boolean;
  brand?: string;
  fuel_type?: string;
  transmission?: string;
  kilometer?: number;
  color?: string;
}

// Main component with Suspense boundary
function AllListingsContent() {
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
  const searchQuery = searchParams.get('search') || "";
  // Add province to the filter states
  const province = searchParams.get('province') || "";
  
  // Sorting states
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  
  // Redirect to /ilanlar/emlak if no search query
  useEffect(() => {
    if (!searchQuery) {
      window.location.href = '/ilanlar/emlak';
    }
  }, [searchQuery]);
  
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

  // Helper to prettify subcategory / konut_type values
  const formatSubcategoryName = (raw: string) => {
    const map: Record<string, string> = {
      'mustakil_ev': 'Müstaki Ev',
      'otobus_hatti': 'Otobüs Hattı',
      'taksi_hatti': 'Taksi Hattı',
    };
    if (!raw) return '';
    const lowered = raw.toLowerCase();
    if (map[lowered]) return map[lowered];
    return raw
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
        
        // Fetch additional details for each listing
        const enhancedListings = await Promise.all(
          data.map(async (listing: Listing) => {
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
                  enhancedListing.konut_type = konutDetails.konut_type || 'Belirtilmemiş';
                }
              } else if (listing.property_type === 'ticari' && detailData.ticari_details && detailData.ticari_details.length > 0) {
                const ticariDetails = detailData.ticari_details[0];
                if (ticariDetails) {
                  enhancedListing.rooms = ticariDetails.room_count ? ticariDetails.room_count.toString() : 'Belirtilmemiş';
                  enhancedListing.area = ticariDetails.gross_sqm || ticariDetails.net_sqm || undefined;
                }
              } else if (listing.property_type === 'arsa' && detailData.arsa_details && detailData.arsa_details.length > 0) {
                const arsaDetails = detailData.arsa_details[0];
                if (arsaDetails) {
                  enhancedListing.area = arsaDetails.sqm || undefined;
                }
              } else if (listing.property_type === 'vasita' && detailData.vasita_details && detailData.vasita_details.length > 0) {
                const vasitaDetails = detailData.vasita_details[0];
                if (vasitaDetails) {
                  enhancedListing.brand = vasitaDetails.brand || '';
                  enhancedListing.model = vasitaDetails.model || '';
                  enhancedListing.year = vasitaDetails.year || '';
                  enhancedListing.fuel_type = vasitaDetails.fuel_type || '';
                  enhancedListing.transmission = vasitaDetails.transmission || '';
                  enhancedListing.kilometer = vasitaDetails.kilometer || 0;
                  enhancedListing.color = vasitaDetails.color || '';
                }
              }
              
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
  }, []);
  
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
          
          setFilteredListings(data.results);
          setIsLoading(false);
        } catch (error) {
          console.error('Error searching listings:', error);
          
          // Fallback to client-side filtering if API search fails
          const normalizedQuery = searchQuery.toLowerCase().trim();
          const queryRegex = new RegExp(normalizedQuery, 'i');
          
          filtered = filtered.filter(listing => 
            (listing.title && queryRegex.test(listing.title)) ||
            (listing.property_type && queryRegex.test(listing.property_type)) ||
            (listing.location && queryRegex.test(listing.location)) ||
            (listing.rooms && queryRegex.test(listing.rooms)) ||
            (listing.konut_type && queryRegex.test(listing.konut_type)) ||
            (listing.brand && queryRegex.test(listing.brand)) ||
            (listing.model && queryRegex.test(listing.model)) ||
            (listing.fuel_type && queryRegex.test(listing.fuel_type))
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
  }, [listings, minPrice, maxPrice, minArea, maxArea, listingStatus, district, neighborhood, province, sortOption, searchQuery]);
  
  // Helper function to apply remaining filters
  const applyRemainingFilters = (filtered: Listing[]) => {
    // Filter by price
    if (minPrice) {
      filtered = filtered.filter(listing => listing.price >= parseInt(minPrice));
    }
    
    if (maxPrice) {
      filtered = filtered.filter(listing => listing.price <= parseInt(maxPrice));
    }
    
    // Filter by area (only for emlak listings)
    if (minArea) {
      filtered = filtered.filter(listing => 
        (listing.property_type !== 'vasita') && 
        listing.area && 
        listing.area >= parseInt(minArea)
      );
    }
    
    if (maxArea) {
      filtered = filtered.filter(listing => 
        (listing.property_type !== 'vasita') && 
        listing.area && 
        listing.area <= parseInt(maxArea)
      );
    }
    
    // Filter by listing status
    if (listingStatus) {
      filtered = filtered.filter(listing => listing.listing_status === listingStatus);
    }
    
    // Filter by province
    if (province) {
      filtered = filtered.filter(listing => 
        listing.province && listing.province.toLowerCase() === province.toLowerCase()
      );
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
  
  // Render property-specific details based on property type
  const renderPropertyDetails = (listing: Listing) => {
    if (listing.property_type === 'vasita') {
      return (
        <div className="grid grid-cols-2 gap-2 my-3">
          {listing.brand && (
            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
              <span className="font-medium">Marka:</span> {listing.brand}
            </div>
          )}
          {listing.model && (
            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
              <span className="font-medium">Model:</span> {listing.model}
            </div>
          )}
          {listing.year && (
            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
              <span className="font-medium">Yıl:</span> {listing.year}
            </div>
          )}
          {listing.fuel_type && (
            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
              <span className="font-medium">Yakıt:</span> {listing.fuel_type}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-2 gap-2 my-3">
          {listing.rooms && (
            <div className="flex items-center text-sm">
              <Bed size={14} className="mr-1 flex-shrink-0" />
              <span>{listing.rooms}</span>
            </div>
          )}
          {listing.area && (
            <div className="flex items-center text-sm">
              <Expand size={14} className="mr-1 flex-shrink-0" />
              <span>{listing.area} m²</span>
            </div>
          )}
        </div>
      );
    }
  };
  
  // Get property type icon
  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'vasita':
        return <Car size={16} className="mr-1" />;
      default:
        return null;
    }
  };
  
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
                  Tüm İlanlar
                </h1>
                <p className="text-gray-100 mt-2">
                  {filteredListings.length} ilan listeleniyor
                </p>
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
                href="/ilanlar"
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
              <div className="sticky top-24 bg-white rounded-xl shadow-md p-5 border border-gray-100">
                <h3 className="font-headings text-lg font-semibold mb-5 border-b pb-3">Filtrele</h3>
                
                <div className="space-y-5">
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium block mb-2">Fiyat Aralığı</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Min TL"
                        className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary"
                        inputMode="numeric"
                        enterKeyHint="search"
                        defaultValue={minPrice}
                      />
                      <input
                        type="text"
                        placeholder="Max TL"
                        className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary"
                        inputMode="numeric"
                        enterKeyHint="search"
                        defaultValue={maxPrice}
                      />
                    </div>
                  </div>
                  
                  {/* Listing Status */}
                  <div>
                    <label className="text-sm font-medium block mb-2">İlan Durumu</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${listingStatus === 'satilik' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        Satılık
                      </button>
                      <button
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${listingStatus === 'kiralik' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        Kiralık
                      </button>
                    </div>
                  </div>
                  
                  {/* Sort Options */}
                  <div>
                    <label className="text-sm font-medium block mb-2">Sıralama</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary"
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
                </div>
              </div>
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
                        <div className="relative aspect-[16/9] md:aspect-[4/3] md:h-auto md:w-1/4 w-full overflow-hidden flex-shrink-0 group rounded-lg m-2">
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
                              {listing.property_type === 'vasita' ? (
                                <>
                                  {listing.brand && (
                                    <div className="flex items-center">
                                      <Car size={14} className="mr-1.5 flex-shrink-0 text-primary" />
                                      <span>{listing.brand} {listing.model}</span>
                                    </div>
                                  )}
                                  {listing.year && (
                                    <div className="flex items-center">
                                      <span className="font-medium">Yıl:</span> {listing.year}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
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
                                </>
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
export default function AllListings() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading size="large" text="Yükleniyor..." /></div>}>
      <AllListingsContent />
    </Suspense>
  );
} 