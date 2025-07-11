"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Expand, Car, ArrowRight, Filter, X, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
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
    if (!url.includes('cloudinary')) return url;
    
    // Add a cache-busting parameter
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}cb=${Date.now()}`;
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
        src={addCacheBuster(images[currentImageIndex]?.url || "/images/ce.png")}
        alt={title}
        className={`object-cover rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        fill
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

type Category = 'konut' | 'ticari' | 'arsa' | 'vasita';

type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc';

interface Listing {
  id: string;
  title: string;
  price: number;
  location?: string;
  thumbnail_url?: string;
  images?: Array<{id: string, url: string}>;
  property_type?: string;
  listing_status?: string;
  rooms?: string;
  area?: number;
  model?: string;
  year?: string;
  neighborhood?: string;
  konut_type?: string;
  has_video?: boolean;
  district?: string;
  province?: string;
  created_at?: string;
  is_featured?: boolean;
  subcategory?: string;
  addresses?: Array<{province: string; district: string; neighborhood: string}>;
  konut_details?: Array<{
    konut_type: string;
    gross_sqm: number;
    net_sqm: number;
    room_count: string;
    building_age: number;
    floor: number;
    total_floors: number;
    heating: string;
    has_balcony: boolean;
    has_elevator: boolean;
    is_furnished: boolean;
    allows_trade: boolean;
    is_eligible_for_credit: boolean;
  }>;
  ticari_details?: Array<{
    ticari_type: string;
    gross_sqm: number;
    net_sqm?: number;
    room_count: number;
    building_age: number;
    floor?: number;
    total_floors?: number;
    heating: string;
    allows_trade: boolean;
    is_eligible_for_credit: boolean;
  }>;
  arsa_details?: Array<{
    arsa_type: string;
    sqm: number;
    kaks?: number;
    allows_trade: boolean;
    is_eligible_for_credit: boolean;
  }>;
  vasita_details?: Array<{
    vasita_type: string;
    brand: string;
    model: string;
    sub_model: string;
    kilometer: number;
    year?: number;
    fuel_type: string;
    transmission: string;
    color: string;
    has_warranty: boolean;
    has_damage_record: boolean;
    allows_trade: boolean;
  }>;
}

// Main component with Suspense boundary
function CategoryListingsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const category = params.category as string;
  
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
  const brand = searchParams.get('brand') || "";
  const model = searchParams.get('model') || "";
  const minYear = searchParams.get('minYear') || "";
  const maxYear = searchParams.get('maxYear') || "";
  const fuelType = searchParams.get('fuelType') || "";
  const transmission = searchParams.get('transmission') || "";
  const minKm = searchParams.get('minKm') || "";
  const maxKm = searchParams.get('maxKm') || "";
  
  // Yeni eklenen filtreler
  const heatingType = searchParams.get('heatingType') || "";
  const hasBalcony = searchParams.get('hasBalcony') || "";
  const hasElevator = searchParams.get('hasElevator') || "";
  const isFurnished = searchParams.get('isFurnished') || "";
  const allowsTrade = searchParams.get('allowsTrade') || "";
  const isEligibleForCredit = searchParams.get('isEligibleForCredit') || "";
  const ticariType = searchParams.get('ticariType') || "";
  const arsaType = searchParams.get('arsaType') || "";
  const kaks = searchParams.get('kaks') || "";
  const color = searchParams.get('color') || "";
  const hasWarranty = searchParams.get('hasWarranty') || "";
  const hasDamageRecord = searchParams.get('hasDamageRecord') || "";
  
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

  // Helper function to format listing status
  const formatListingStatus = (status: string) => {
    return status === 'satilik' ? 'Satılık' : 'Kiralık';
  };

  // Helper function to format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('tr-TR').format(price) + ' ₺';
  };
  
  // Get category title
  const getCategoryTitle = () => {
    switch(category) {
      case 'konut':
        return 'Konut İlanları';
      case 'ticari':
        return 'Ticari İlanlar';
      case 'arsa':
        return 'Arsa İlanları';
      case 'vasita':
        return 'Vasıta İlanları';
      default:
        return 'İlanlar';
    }
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
        
        // Filter by category if provided
        const categoryListings = category 
          ? data.filter((listing: Listing) => listing.property_type === category)
          : data;
        
        // Fetch additional details for each listing
        const enhancedListings = await Promise.all(
          categoryListings.map(async (listing: Listing) => {
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
              
              // Extract property-specific details
              if (listing.property_type === 'konut' && detailData.konut_details && detailData.konut_details.length > 0) {
                const konutDetails = detailData.konut_details[0];
                if (konutDetails) {
                  enhancedListing.rooms = konutDetails.room_count || 'Belirtilmemiş';
                  enhancedListing.area = konutDetails.gross_sqm || konutDetails.net_sqm || undefined;
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
                  enhancedListing.model = vasitaDetails.brand && vasitaDetails.model ? 
                    `${vasitaDetails.brand} ${vasitaDetails.model}` : 'Belirtilmemiş';
                  enhancedListing.year = vasitaDetails.year ? vasitaDetails.year.toString() : 'Belirtilmemiş';
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
  }, [category]);
  
  // Apply filters and sorting
  const applyFiltersAndSort = useCallback(() => {
    if (!listings.length) return;
    
    let filtered = [...listings];
    
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
    
    // Filter by room count (only for konut and ticari)
    if (roomCount && (category === 'konut' || category === 'ticari')) {
      filtered = filtered.filter(listing => 
        listing.rooms && listing.rooms !== 'undefined' && listing.rooms === roomCount
      );
    }
    
    // Filter by konut type (only for konut)
    if (konutType && category === 'konut') {
      filtered = filtered.filter(listing => 
        listing.konut_type && listing.konut_type !== 'undefined' && listing.konut_type === konutType
      );
    }
    
    // Konut ve ticari için ısıtma tipi filtresi
    if (heatingType && (category === 'konut' || category === 'ticari')) {
      filtered = filtered.filter(listing => {
        if (category === 'konut' && listing.konut_details && listing.konut_details.length > 0) {
          return listing.konut_details[0]?.heating === heatingType;
        } else if (category === 'ticari' && listing.ticari_details && listing.ticari_details.length > 0) {
          return listing.ticari_details[0]?.heating === heatingType;
        }
        return false;
      });
    }
    
    // Konut için balkon, asansör, eşyalı filtreleri
    if (category === 'konut') {
      if (hasBalcony) {
        filtered = filtered.filter(listing => {
          if (listing.konut_details && listing.konut_details.length > 0) {
            return hasBalcony === 'true' ? listing.konut_details[0]?.has_balcony : !listing.konut_details[0]?.has_balcony;
          }
          return false;
        });
      }
      
      if (hasElevator) {
        filtered = filtered.filter(listing => {
          if (listing.konut_details && listing.konut_details.length > 0) {
            return hasElevator === 'true' ? listing.konut_details[0]?.has_elevator : !listing.konut_details[0]?.has_elevator;
          }
          return false;
        });
      }
      
      if (isFurnished) {
        filtered = filtered.filter(listing => {
          if (listing.konut_details && listing.konut_details.length > 0) {
            return isFurnished === 'true' ? listing.konut_details[0]?.is_furnished : !listing.konut_details[0]?.is_furnished;
          }
          return false;
        });
      }
    }
    
    // Ticari için işyeri tipi filtresi
    if (ticariType && category === 'ticari') {
      filtered = filtered.filter(listing => {
        if (listing.ticari_details && listing.ticari_details.length > 0) {
          return listing.ticari_details[0]?.ticari_type === ticariType;
        }
        return false;
      });
    }
    
    // Arsa için arsa tipi ve kaks filtresi
    if (category === 'arsa') {
      if (arsaType) {
        filtered = filtered.filter(listing => {
          if (listing.arsa_details && listing.arsa_details.length > 0) {
            return listing.arsa_details[0]?.arsa_type === arsaType;
          }
          return false;
        });
      }
      
      if (kaks) {
        filtered = filtered.filter(listing => {
          if (listing.arsa_details && listing.arsa_details.length > 0 && listing.arsa_details[0]?.kaks !== undefined) {
            return listing.arsa_details[0].kaks >= parseFloat(kaks);
          }
          return false;
        });
      }
    }
    
    // Vasıta için marka, model, yıl, yakıt tipi, vites, kilometre, renk, garanti, hasar kaydı filtreleri
    if (category === 'vasita') {
      if (brand) {
        filtered = filtered.filter(listing => {
          if (listing.vasita_details && listing.vasita_details.length > 0) {
            return listing.vasita_details[0]?.brand.toLowerCase().includes(brand.toLowerCase());
          }
          return false;
        });
      }
      
      if (model) {
        filtered = filtered.filter(listing => {
          if (listing.vasita_details && listing.vasita_details.length > 0) {
            return listing.vasita_details[0]?.model.toLowerCase().includes(model.toLowerCase());
          }
          return false;
        });
      }
      
      if (minYear) {
        filtered = filtered.filter(listing => {
          if (listing.vasita_details && listing.vasita_details.length > 0 && listing.vasita_details[0]?.year !== undefined) {
            return listing.vasita_details[0].year >= parseInt(minYear);
          }
          return false;
        });
      }
      
      if (maxYear) {
        filtered = filtered.filter(listing => {
          if (listing.vasita_details && listing.vasita_details.length > 0 && listing.vasita_details[0]?.year !== undefined) {
            return listing.vasita_details[0].year <= parseInt(maxYear);
          }
          return false;
        });
      }
      
      if (fuelType) {
        filtered = filtered.filter(listing => {
          if (listing.vasita_details && listing.vasita_details.length > 0) {
            return listing.vasita_details[0]?.fuel_type === fuelType;
          }
          return false;
        });
      }
      
      if (transmission) {
        filtered = filtered.filter(listing => {
          if (listing.vasita_details && listing.vasita_details.length > 0) {
            return listing.vasita_details[0]?.transmission === transmission;
          }
          return false;
        });
      }
      
      if (minKm) {
        filtered = filtered.filter(listing => {
          if (listing.vasita_details && listing.vasita_details.length > 0) {
            return listing.vasita_details[0]?.kilometer >= parseInt(minKm);
          }
          return false;
        });
      }
      
      if (maxKm) {
        filtered = filtered.filter(listing => {
          if (listing.vasita_details && listing.vasita_details.length > 0) {
            return listing.vasita_details[0]?.kilometer <= parseInt(maxKm);
          }
          return false;
        });
      }
      
      if (color) {
        filtered = filtered.filter(listing => {
          if (listing.vasita_details && listing.vasita_details.length > 0) {
            return listing.vasita_details[0]?.color.toLowerCase().includes(color.toLowerCase());
          }
          return false;
        });
      }
      
      if (hasWarranty) {
        filtered = filtered.filter(listing => {
          if (listing.vasita_details && listing.vasita_details.length > 0) {
            return hasWarranty === 'true' ? listing.vasita_details[0]?.has_warranty : !listing.vasita_details[0]?.has_warranty;
          }
          return false;
        });
      }
      
      if (hasDamageRecord) {
        filtered = filtered.filter(listing => {
          if (listing.vasita_details && listing.vasita_details.length > 0) {
            return hasDamageRecord === 'true' ? listing.vasita_details[0]?.has_damage_record : !listing.vasita_details[0]?.has_damage_record;
          }
          return false;
        });
      }
    }
    
    // Konut, ticari, arsa için takas ve krediye uygun filtreleri
    if (category === 'konut' || category === 'ticari' || category === 'arsa') {
      if (allowsTrade) {
        filtered = filtered.filter(listing => {
          if (category === 'konut' && listing.konut_details && listing.konut_details.length > 0) {
            return allowsTrade === 'true' ? listing.konut_details[0]?.allows_trade : !listing.konut_details[0]?.allows_trade;
          } else if (category === 'ticari' && listing.ticari_details && listing.ticari_details.length > 0) {
            return allowsTrade === 'true' ? listing.ticari_details[0]?.allows_trade : !listing.ticari_details[0]?.allows_trade;
          } else if (category === 'arsa' && listing.arsa_details && listing.arsa_details.length > 0) {
            return allowsTrade === 'true' ? listing.arsa_details[0]?.allows_trade : !listing.arsa_details[0]?.allows_trade;
          }
          return false;
        });
      }
      
      if (isEligibleForCredit) {
        filtered = filtered.filter(listing => {
          if (category === 'konut' && listing.konut_details && listing.konut_details.length > 0) {
            return isEligibleForCredit === 'true' ? listing.konut_details[0]?.is_eligible_for_credit : !listing.konut_details[0]?.is_eligible_for_credit;
          } else if (category === 'ticari' && listing.ticari_details && listing.ticari_details.length > 0) {
            return isEligibleForCredit === 'true' ? listing.ticari_details[0]?.is_eligible_for_credit : !listing.ticari_details[0]?.is_eligible_for_credit;
          } else if (category === 'arsa' && listing.arsa_details && listing.arsa_details.length > 0) {
            return isEligibleForCredit === 'true' ? listing.arsa_details[0]?.is_eligible_for_credit : !listing.arsa_details[0]?.is_eligible_for_credit;
          }
          return false;
        });
      }
    }
    
    // Vasıta için takas filtresi
    if (category === 'vasita' && allowsTrade) {
      filtered = filtered.filter(listing => {
        if (listing.vasita_details && listing.vasita_details.length > 0) {
          return allowsTrade === 'true' ? listing.vasita_details[0]?.allows_trade : !listing.vasita_details[0]?.allows_trade;
        }
        return false;
      });
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
  }, [listings, minPrice, maxPrice, minArea, maxArea, listingStatus, district, neighborhood, roomCount, konutType, category, sortOption, brand, model, minYear, maxYear, fuelType, transmission, minKm, maxKm, heatingType, hasBalcony, hasElevator, isFurnished, allowsTrade, isEligibleForCredit, ticariType, arsaType, kaks, color, hasWarranty, hasDamageRecord]);
  
  // Apply filters when filter states change or listings change
  useEffect(() => {
    applyFiltersAndSort();
  }, [listings, applyFiltersAndSort]);
  
  // Reapply sorting when sort option changes
  useEffect(() => {
    applyFiltersAndSort();
  }, [sortOption]);
  
  // Reset sorting option if needed when category changes
  useEffect(() => {
    if (category !== 'ticari' && category !== 'arsa' && 
        (sortOption === 'area_asc' || sortOption === 'area_desc')) {
      setSortOption('newest');
    }
  }, [category]);
  
  // Handle category switch
  const getCategoryLink = (cat: string) => {
    return cat === category ? '#' : `/ilanlar/${cat}`;
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
  
  // Initial filter values for CategoryFilter component
  const initialFilters = {
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    listingStatus,
    district,
    neighborhood,
    roomCount,
    konutType,
    brand,
    model,
    minYear,
    maxYear,
    fuelType,
    transmission,
    minKm,
    maxKm,
    heatingType,
    hasBalcony,
    hasElevator,
    isFurnished,
    allowsTrade,
    isEligibleForCredit,
    ticariType,
    arsaType,
    kaks,
    color,
    hasWarranty,
    hasDamageRecord
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
                  {getCategoryTitle()}
                </h1>
                <p className="text-gray-100 mt-2">
                  {filteredListings.length} ilan listeleniyor
                </p>
              </div>
              
              {/* Category Switch Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <Link href={getCategoryLink('konut')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${category === 'konut' ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  Konut
                </Link>
                <Link href={getCategoryLink('ticari')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${category === 'ticari' ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  Ticari
                </Link>
                <Link href={getCategoryLink('arsa')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${category === 'arsa' ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  Arsa
                </Link>
                {category === 'vasita' && (
                  <Link href={getCategoryLink('vasita')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${category === 'vasita' ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    Vasıta
                  </Link>
                )}
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
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Filter - Desktop */}
            <div className={`md:w-1/4 lg:w-1/5 md:block ${showMobileFilter ? 'block' : 'hidden'}`}>
              <CategoryFilter category={category} initialFilters={initialFilters} />
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
                    {(category === 'ticari' || category === 'arsa') && (
                      <>
                        <option value="area_asc">Alan (Artan)</option>
                        <option value="area_desc">Alan (Azalan)</option>
                      </>
                    )}
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
                                (listing.konut_type || listing.subcategory || formatPropertyType(listing.property_type || '')).charAt(0).toUpperCase() + (listing.konut_type || listing.subcategory || formatPropertyType(listing.property_type || '')).slice(1)}
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
                              {listing.rooms && listing.rooms !== 'undefined' && (
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
                              
                              {listing.model && listing.model !== 'undefined' && listing.model !== 'Belirtilmemiş' && (
                                <div className="flex items-center">
                                  <Car size={14} className="mr-1.5 flex-shrink-0 text-primary" />
                                  <span>{listing.model}</span>
                                </div>
                              )}
                              
                              {listing.year && listing.year !== 'undefined' && listing.year !== 'Belirtilmemiş' && (
                                <div className="flex items-center">
                                  <span className="text-gray-600">{listing.year}</span>
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
export default function CategoryListings() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading size="large" text="Yükleniyor..." /></div>}>
      <CategoryListingsContent />
    </Suspense>
  );
} 