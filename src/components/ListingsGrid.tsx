"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Square, Car, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/pagination';

// Define listing type
interface Listing {
  id: string;
  title: string;
  price: number;
  property_type: string;
  listing_status: string;
  is_featured: boolean;
  thumbnail_url: string;
  created_at: string;
  // Additional fields from details tables
  location?: string; // For display purposes
  rooms?: string;
  area?: number;
  model?: string;
  year?: number;
}

// Define address type
interface Address {
  province: string;
  district: string;
  neighborhood: string;
  full_address?: string;
}

// Define detail types
interface KonutDetails {
  room_count: string;
  gross_sqm: number;
  net_sqm: number;
}

interface TicariDetails {
  room_count: number;
  gross_sqm: number;
}

interface ArsaDetails {
  sqm: number;
}

interface VasitaDetails {
  brand: string;
  model: string;
  year?: number;
}

const ListingsGrid = () => {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/listings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        // Filter featured listings
        const featured = data.filter((listing: Listing) => listing.is_featured);
        
        // Fetch additional details for each featured listing
        const enhancedListings = await Promise.all(
          featured.map(async (listing: Listing) => {
            try {
              // Fetch detailed listing info
              const detailResponse = await fetch(`/api/listings?id=${listing.id}`);
              if (!detailResponse.ok) throw new Error(`Failed to fetch details for listing ${listing.id}`);
              
              const detailData = await detailResponse.json();
              let enhancedListing = { ...listing };
              
              // Extract location from addresses if available
              if (detailData.addresses && detailData.addresses.length > 0) {
                const address = detailData.addresses[0] as Address;
                enhancedListing.location = `${address.district}, ${address.province}`;
              }
              
              // Extract property-specific details
              if (listing.property_type === 'konut' && detailData.konut_details) {
                const konutDetails = detailData.konut_details[0] as KonutDetails;
                enhancedListing.rooms = konutDetails.room_count;
                enhancedListing.area = konutDetails.gross_sqm;
              } else if (listing.property_type === 'ticari' && detailData.ticari_details) {
                const ticariDetails = detailData.ticari_details[0] as TicariDetails;
                enhancedListing.rooms = ticariDetails.room_count.toString();
                enhancedListing.area = ticariDetails.gross_sqm;
              } else if (listing.property_type === 'arsa' && detailData.arsa_details) {
                const arsaDetails = detailData.arsa_details[0] as ArsaDetails;
                enhancedListing.area = arsaDetails.sqm;
              } else if (listing.property_type === 'vasita' && detailData.vasita_details) {
                const vasitaDetails = detailData.vasita_details[0] as VasitaDetails;
                enhancedListing.model = `${vasitaDetails.brand} ${vasitaDetails.model}`;
                enhancedListing.year = parseInt(vasitaDetails.year as unknown as string);
              }
              
              return enhancedListing;
            } catch (error) {
              console.error(`Error fetching details for listing ${listing.id}:`, error);
              return listing; // Return original listing if detail fetch fails
            }
          })
        );
        
        setFeaturedListings(enhancedListings);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('İlanları yüklerken bir hata oluştu');
        setIsLoading(false);
      }
    };
    
    fetchListings();
  }, []);

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

  return (
    <div className="w-full">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="relative">
            <h2 className="font-headings text-3xl md:text-4xl font-bold mb-3">Öne Çıkan İlanlar</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl">
              Size özel seçtiğimiz gayrimenkul ve vasıta ilanları
            </p>
            <div className="absolute -left-4 top-0 w-2 h-12 bg-primary rounded-full"></div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-gray-500">Yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : featuredListings.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-gray-500">Henüz öne çıkarılan ilan bulunmamaktadır.</p>
          </div>
        ) : (
          // Improved carousel container
          <div className="relative w-full mb-12 overflow-hidden">
            <Swiper
              slidesPerView={1}
              spaceBetween={24}
              centeredSlides={false}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              speed={800}
              loop={true}
              modules={[Autoplay, Pagination, Navigation]}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 32,
                },
                1280: {
                  slidesPerView: 3,
                  spaceBetween: 36,
                },
              }}
              className="!py-10 !px-1"
            >
              {featuredListings.map((listing) => (
                <SwiperSlide key={listing.id} className="!h-auto !flex !flex-col">
                  <Link href={`/ilan/${listing.id}`} className="block w-full h-full">
                    <div className="listing-card bg-white overflow-hidden transition-all duration-500 h-full flex flex-col rounded-2xl card-hover">
                      {/* Image container */}
                      <div className="relative h-64 w-full overflow-hidden flex-shrink-0 group rounded-t-2xl transform-gpu">
                        <Image
                          src={listing.thumbnail_url || "/images/ce.png"}
                          alt={listing.title}
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                        
                        {/* Type tag (top left) */}
                        <div className="absolute top-4 left-4 bg-primary text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-md z-10 transition-transform duration-300 group-hover:-translate-y-1">
                          {formatListingStatus(listing.listing_status)}
                        </div>
                        
                        {/* Category tag (top right) */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-medium px-4 py-1.5 rounded-full shadow-md z-10 transition-transform duration-300 group-hover:-translate-y-1">
                          {formatPropertyType(listing.property_type)}
                        </div>
                        
                        {/* Featured badge */}
                        <div className="absolute top-16 left-0 bg-black/80 text-primary text-xs font-bold px-4 py-1 rounded-r-full shadow-md z-10">
                          ÖNE ÇIKAN
                        </div>
                        
                        {/* Price tag */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                          <div className="w-full bg-gray-800/60 px-6 py-2 rounded-lg">
                            <p className="text-white text-xl font-bold">{formatPrice(listing.price)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Content container - flex grow to fill remaining space */}
                      <div className="flex flex-col flex-grow p-5">
                        {/* Listing title and location */}
                        <div className="flex-grow">
                          <h3 className="font-headings text-lg md:text-xl font-semibold line-clamp-2 mb-2 text-left group-hover:text-primary transition-colors duration-300">{listing.title}</h3>
                          
                          {listing.location && (
                            <div className="flex items-center text-muted-foreground text-sm mb-4 text-left">
                              <MapPin size={15} className="mr-1.5 flex-shrink-0 text-primary" />
                              <span className="truncate">{listing.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Property details at bottom */}
                        <div className="border-t border-gray-100 pt-4 mt-auto">
                          <div className="flex flex-wrap gap-4 text-sm">
                            {listing.rooms && (
                              <div className="flex items-center">
                                <Bed size={15} className="mr-1.5 flex-shrink-0 text-gray-500" />
                                <span>{listing.rooms} Oda</span>
                              </div>
                            )}
                            
                            {listing.area && (
                              <div className="flex items-center">
                                <Square size={15} className="mr-1.5 flex-shrink-0 text-gray-500" />
                                <span>{listing.area} m²</span>
                              </div>
                            )}
                            
                            {listing.model && (
                              <div className="flex items-center">
                                <Car size={15} className="mr-1.5 flex-shrink-0 text-gray-500" />
                                <span>{listing.model}</span>
                              </div>
                            )}
                            
                            {listing.year && (
                              <div className="flex items-center">
                                <span>{listing.year}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
        
        <div className="flex justify-center mt-8">
          <Link 
            href="/ilanlar/emlak" 
            className="group flex items-center font-headings bg-white hover:bg-primary/5 text-gray-800 font-medium px-8 py-4 rounded-xl transition-all duration-300 border border-gray-200 hover:border-primary/30 shadow-sm hover:shadow-md"
          >
            Tüm İlanları Gör
            <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingsGrid;