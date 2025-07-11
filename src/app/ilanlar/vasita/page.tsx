"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Car, Calendar, ArrowRight, Filter, X, ChevronLeft, ChevronRight, Gauge, Fuel, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { createSlug } from "@/lib/utils";
import CategoryFilter from "@/components/CategoryFilter";

// Image Gallery Component
const ImageGallery = ({ 
  images, 
  title 
}: { 
  images: Array<{id: string, url: string}>, 
  title: string 
}) => {
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
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
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
        src={images[currentImageIndex]?.url ? addCacheBuster(images[currentImageIndex].url) : "/images/ce.png"}
        alt={title}
        className={`object-cover rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        fill
        unoptimized={true}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 33vw"
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          console.error(`Failed to load image: ${images[currentImageIndex]?.url}`);
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

type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'year_asc' | 'year_desc';

interface Listing {
  id: string;
  title: string;
  price: number;
  location?: string;
  thumbnail_url?: string;
  images?: Array<{id: string, url: string}>;
  property_type?: string;
  listing_status?: string;
  brand?: string;
  model?: string;
  year?: string;
  fuel_type?: string;
  transmission?: string;
  kilometer?: number;
  color?: string;
  has_video?: boolean;
  district?: string;
  province?: string;
  neighborhood?: string;
  created_at?: string;
  is_featured?: boolean;
  addresses?: Array<{province: string; district: string; neighborhood: string}>;
  has_warranty?: boolean;
  has_damage_record?: boolean;
  allows_trade?: boolean;
}

// Main component with Suspense boundary
function VasitaListingsContent() {
  const searchParams = useSearchParams();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  // Filter states from URL parameters
  const minPrice = searchParams.get('minPrice') || "";
  const maxPrice = searchParams.get('maxPrice') || "";
  const brand = searchParams.get('brand') || "";
  const model = searchParams.get('model') || "";
  const minYear = searchParams.get('minYear') || "";
  const maxYear = searchParams.get('maxYear') || "";
  const fuelType = searchParams.get('fuelType') || "";
  const transmission = searchParams.get('transmission') || "";
  const minKm = searchParams.get('minKm') || "";
  const maxKm = searchParams.get('maxKm') || "";
  const color = searchParams.get('color') || "";
  const hasWarranty = searchParams.get('hasWarranty') || "";
  const hasDamageRecord = searchParams.get('hasDamageRecord') || "";
  const allowsTrade = searchParams.get('allowsTrade') || "";
  const district = searchParams.get('district') || "";
  const neighborhood = searchParams.get('neighborhood') || "";
  const searchQuery = searchParams.get('search') || "";
  
  // Sorting states
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  
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
      const address = listing.addresses[0];
      // Capitalize first letter of each part
      const province = address.province.charAt(0).toUpperCase() + address.province.slice(1);
      const district = address.district.charAt(0).toUpperCase() + address.district.slice(1);
      const neighborhood = address.neighborhood 
        ? '/' + (address.neighborhood.charAt(0).toUpperCase() + address.neighborhood.slice(1)) 
        : '';
      return `${province}/${district}${neighborhood}`;
    }
    // If using location string directly, capitalize each part
    if (listing.location) {
      return listing.location.split('/').map(
        (part: string) => part.charAt(0).toUpperCase() + part.slice(1)
      ).join('/');
    }
    return '';
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
        
        // Filter only vasita listings
        const vasitaListings = data.filter((listing: Listing) => listing.property_type === 'vasita');
        
        // Fetch additional details for each listing
        const enhancedListings = await Promise.all(
          vasitaListings.map(async (listing: Listing) => {
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
                const province = address.province.charAt(0).toUpperCase() + address.province.slice(1);
                const district = address.district.charAt(0).toUpperCase() + address.district.slice(1);
                const neighborhood = address.neighborhood 
                  ? '/' + (address.neighborhood.charAt(0).toUpperCase() + address.neighborhood.slice(1)) 
                  : '';
                enhancedListing.location = `${province}/${district}${neighborhood}`;
                enhancedListing.district = address.district;
                enhancedListing.neighborhood = address.neighborhood;
                enhancedListing.province = address.province;
              }
              
              // Extract vasita-specific details
              if (detailData.vasita_details && detailData.vasita_details.length > 0) {
                const vasitaDetails = detailData.vasita_details[0];
                if (vasitaDetails) {
                  enhancedListing.brand = vasitaDetails.brand || '';
                  enhancedListing.model = vasitaDetails.model || '';
                  enhancedListing.year = vasitaDetails.year || '';
                  enhancedListing.fuel_type = vasitaDetails.fuel_type || '';
                  enhancedListing.transmission = vasitaDetails.transmission || '';
                  enhancedListing.kilometer = vasitaDetails.kilometer || 0;
                  enhancedListing.color = vasitaDetails.color || '';
                  enhancedListing.has_warranty = vasitaDetails.has_warranty || false;
                  enhancedListing.has_damage_record = vasitaDetails.has_damage_record || false;
                  enhancedListing.allows_trade = vasitaDetails.allows_trade || false;
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
          
          // Filter only vasita listings
          const vasitaResults = data.results.filter((listing: Listing) => listing.property_type === 'vasita');
          
          setFilteredListings(vasitaResults);
          setIsLoading(false);
        } catch (error) {
          console.error('Error searching listings:', error);
          
          // Fallback to client-side filtering if API search fails
          const normalizedQuery = searchQuery.toLowerCase().trim();
          
          filtered = filtered.filter(listing => 
            listing.title?.toLowerCase().includes(normalizedQuery) ||
            listing.brand?.toLowerCase().includes(normalizedQuery) ||
            listing.model?.toLowerCase().includes(normalizedQuery) ||
            listing.location?.toLowerCase().includes(normalizedQuery)
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
  }, [listings, minPrice, maxPrice, brand, model, minYear, maxYear, fuelType, transmission, minKm, maxKm, color, hasWarranty, hasDamageRecord, allowsTrade, district, neighborhood, sortOption, searchQuery]);
  
  // Helper function to apply the remaining filters
  const applyRemainingFilters = (filtered: Listing[]) => {
    // Filter by price
    if (minPrice) {
      filtered = filtered.filter(listing => listing.price >= parseInt(minPrice));
    }
    
    if (maxPrice) {
      filtered = filtered.filter(listing => listing.price <= parseInt(maxPrice));
    }
    
    // Filter by brand
    if (brand) {
      filtered = filtered.filter(listing => 
        listing.brand && listing.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }
    
    // Filter by model
    if (model) {
      filtered = filtered.filter(listing => 
        listing.model && listing.model.toLowerCase().includes(model.toLowerCase())
      );
    }
    
    // Filter by year
    if (minYear) {
      filtered = filtered.filter(listing => 
        listing.year && parseInt(listing.year) >= parseInt(minYear)
      );
    }
    
    if (maxYear) {
      filtered = filtered.filter(listing => 
        listing.year && parseInt(listing.year) <= parseInt(maxYear)
      );
    }
    
    // Filter by fuel type
    if (fuelType && fuelType !== 'all') {
      filtered = filtered.filter(listing => 
        listing.fuel_type && listing.fuel_type.toLowerCase() === fuelType.toLowerCase()
      );
    }
    
    // Filter by transmission
    if (transmission && transmission !== 'all') {
      filtered = filtered.filter(listing => 
        listing.transmission && listing.transmission.toLowerCase() === transmission.toLowerCase()
      );
    }
    
    // Filter by kilometer
    if (minKm) {
      filtered = filtered.filter(listing => 
        listing.kilometer && listing.kilometer >= parseInt(minKm)
      );
    }
    
    if (maxKm) {
      filtered = filtered.filter(listing => 
        listing.kilometer && listing.kilometer <= parseInt(maxKm)
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
    
    // Filter by color
    if (color && color !== 'all') {
      filtered = filtered.filter(listing => 
        listing.color && listing.color.toLowerCase() === color.toLowerCase()
      );
    }
    
    // Filter by warranty
    if (hasWarranty && hasWarranty !== 'all') {
      const hasWarrantyBool = hasWarranty === 'true';
      filtered = filtered.filter(listing => listing.has_warranty === hasWarrantyBool);
    }
    
    // Filter by damage record
    if (hasDamageRecord && hasDamageRecord !== 'all') {
      const hasDamageRecordBool = hasDamageRecord === 'true';
      filtered = filtered.filter(listing => listing.has_damage_record === hasDamageRecordBool);
    }
    
    // Filter by trade
    if (allowsTrade && allowsTrade !== 'all') {
      const allowsTradeBool = allowsTrade === 'true';
      filtered = filtered.filter(listing => listing.allows_trade === allowsTradeBool);
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
      case 'year_asc':
        filtered.sort((a, b) => {
          const yearA = a.year ? parseInt(a.year) : 0;
          const yearB = b.year ? parseInt(b.year) : 0;
          return yearA - yearB;
        });
        break;
      case 'year_desc':
        filtered.sort((a, b) => {
          const yearA = a.year ? parseInt(a.year) : 0;
          const yearB = b.year ? parseInt(b.year) : 0;
          return yearB - yearA;
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
  
  // Initial filter values for CategoryFilter component
  const initialFilters = {
    minPrice,
    maxPrice,
    brand,
    model,
    minYear,
    maxYear,
    fuelType,
    transmission,
    minKm,
    maxKm,
    color,
    hasWarranty,
    hasDamageRecord,
    allowsTrade,
    district,
    neighborhood
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
                  Vasıta İlanları
                </h1>
                <p className="text-gray-100 mt-2">
                  {filteredListings.length} ilan listeleniyor
                </p>
              </div>
              
              {/* Category Switch Buttons - Removed */}
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
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Filter - Desktop */}
            <div className={`md:w-1/4 lg:w-1/5 md:block ${showMobileFilter ? 'block' : 'hidden'}`}>
              <CategoryFilter category="vasita" initialFilters={initialFilters} />
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
                    <option value="year_asc">Yıl (Artan)</option>
                    <option value="year_desc">Yıl (Azalan)</option>
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
                              {listing.brand && listing.brand.charAt(0).toUpperCase() + listing.brand.slice(1)}
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
                              {listing.model && (
                                <div className="flex items-center">
                                  <Car size={14} className="mr-1.5 flex-shrink-0 text-primary" />
                                  <span>{listing.brand} {listing.model}</span>
                                </div>
                              )}
                              
                              {listing.year && (
                                <div className="flex items-center">
                                  <Calendar size={14} className="mr-1.5 flex-shrink-0 text-primary" />
                                  <span>{listing.year}</span>
                                </div>
                              )}
                              
                              {listing.kilometer && listing.kilometer > 0 && (
                                <div className="flex items-center">
                                  <Gauge size={14} className="mr-1.5 flex-shrink-0 text-primary" />
                                  <span>{new Intl.NumberFormat('tr-TR').format(listing.kilometer)} Km</span>
                                </div>
                              )}
                              
                              {listing.fuel_type && (
                                <div className="flex items-center">
                                  <Fuel size={14} className="mr-1.5 flex-shrink-0 text-primary" />
                                  <span>{listing.fuel_type.charAt(0).toUpperCase() + listing.fuel_type.slice(1)}</span>
                                </div>
                              )}
                              
                              {listing.transmission && (
                                <div className="flex items-center">
                                  <Zap size={14} className="mr-1.5 flex-shrink-0 text-primary" />
                                  <span>{listing.transmission.charAt(0).toUpperCase() + listing.transmission.slice(1)}</span>
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
export default function VasitaListings() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading size="large" text="Yükleniyor..." /></div>}>
      <VasitaListingsContent />
    </Suspense>
  );
} 