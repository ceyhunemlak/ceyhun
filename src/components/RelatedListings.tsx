"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Expand, Car, Calendar } from "lucide-react";
import { createSlug } from "@/lib/utils";
import { Loading } from "@/components/ui/loading";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import 'swiper/css';

interface RelatedListingItem {
  id: string;
  title: string;
  price: number;
  property_type: string;
  listing_status: string;
  is_featured: boolean;
  thumbnail_url: string | null;
  created_at: string;
  location?: string;
  rooms?: string;
  area?: number;
  model?: string;
  year?: number;
  subcategory?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR').format(price) + ' ₺';
}

function formatListingStatus(status: string): string {
  return status === 'satilik' ? 'Satılık' : 'Kiralık';
}

function formatSubcategoryName(raw?: string): string {
  if (!raw) return '';
  const map: Record<string, string> = {
    'mustakil_ev': 'Müstakil Ev',
    'konut_imarli': 'Konut İmarlı',
    'ticari_imarli': 'Ticari İmarlı',
    'otobus_hatti': 'Otobüs Hattı',
    'taksi_hatti': 'Taksi Hattı',
  };
  const lowered = raw.toLowerCase();
  if (map[lowered]) return map[lowered];
  return raw
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function capitalizeWordTR(word: string): string {
  if (!word) return word;
  return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1);
}

function formatLocationDisplay(loc?: string): string {
  if (!loc) return '';
  return loc
    .split('/')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => part
      .split(' ')
      .map(token => token
        .split('-')
        .map(seg => capitalizeWordTR(seg))
        .join('-')
      )
      .join(' ')
    )
    .join('/');
}

type Props = {
  baseId?: string;
  baseSlug?: string;
};

export default function RelatedListings({ baseId, baseSlug }: Props) {
  const [items, setItems] = useState<RelatedListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const qs = baseId ? `id=${encodeURIComponent(baseId)}` : `slug=${encodeURIComponent(baseSlug || '')}`;
        const res = await fetch(`/api/listings/related?${qs}`);
        if (!res.ok) throw new Error('Önerilen ilanlar yüklenemedi');
        const data = await res.json();
        setItems(data.results || []);
      } catch (e: any) {
        setError(e?.message || 'Bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    if (baseId || baseSlug) load();
  }, [baseId, baseSlug]);

  if (isLoading) {
    return (
      <div className="py-12">
        <Loading size="large" text="Önerilen ilanlar yükleniyor..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="relative">
            <h2 className="font-headings text-2xl md:text-3xl font-bold mb-2">Önerilen İlanlar</h2>
            <p className="text-muted-foreground text-sm md:text-base">Bu ilana benzeyen diğer ilanlar</p>
            <div className="absolute -left-4 top-0 w-2 h-10 bg-primary rounded-full"></div>
          </div>
        </div>

        <div className="relative w-full mb-6 overflow-hidden">
          <Swiper
            slidesPerView={1}
            spaceBetween={24}
            centeredSlides={false}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            speed={800}
            loop={items.length > 3}
            modules={[Autoplay]}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 32 },
              1280: { slidesPerView: 3, spaceBetween: 36 },
            }}
            className="!py-2 !px-1"
          >
            {items.map((listing) => (
              <SwiperSlide key={listing.id} className="!h-auto !flex !flex-col">
                <Link href={`/ilan/${createSlug(listing.title)}`} className="block w-full h-full">
                  <div className="listing-card bg-white overflow-hidden transition-all duration-500 h-full flex flex-col rounded-2xl card-hover">
                    <div className="relative h-60 w-full overflow-hidden flex-shrink-0 group rounded-t-2xl transform-gpu">
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-pulse w-8 h-8 rounded-full bg-gray-300"></div>
                      </div>
                      <Image
                        src={listing.thumbnail_url || "/images/ce.png"}
                        alt={listing.title}
                        className="object-cover transition-transform duration-700 md:group-hover:scale-110"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/images/ce.png"; }}
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <div className="bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md z-10">
                          {formatListingStatus(listing.listing_status)}
                        </div>
                        {listing.subcategory && (
                          <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-md z-10">
                            {formatSubcategoryName(listing.subcategory)}
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                        <div className="w-full bg-gray-900/30 backdrop-blur-sm px-4 py-1.5 rounded-lg">
                          <p className="text-white text-base md:text-lg font-bold">{formatPrice(listing.price)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col flex-grow p-4">
                      <div className="flex-grow">
                        <h3 className="font-headings text-base md:text-lg font-semibold line-clamp-2 mb-1.5 text-left md:group-hover:text-primary transition-colors duration-300 break-words hyphens-auto">{listing.title}</h3>
                        {listing.location && (
                          <div className="flex items-start text-muted-foreground text-xs mb-3 text-left">
                            <MapPin size={14} className="mr-1 flex-shrink-0 text-primary mt-0.5" />
                            <span className="truncate break-words">{formatLocationDisplay(listing.location)}</span>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-gray-100 pt-4 mt-auto">
                        <div className="flex flex-wrap gap-4 text-sm">
                          {listing.rooms && listing.rooms !== 'Belirtilmemiş' && listing.rooms !== '0' && (
                            <div className="flex items-center">
                              <Bed size={15} className="mr-1.5 flex-shrink-0 text-gray-500" />
                              <span>{listing.rooms} Oda</span>
                            </div>
                          )}
                          {listing.area && (
                            <div className="flex items-center">
                              <Expand size={15} className="mr-1.5 flex-shrink-0 text-gray-500" />
                              <span>{listing.area} m²</span>
                            </div>
                          )}
                          {listing.model && (
                            <div className="flex items-center">
                              <Car size={15} className="mr-1.5 flex-shrink-0 text-gray-500" />
                              <span>{listing.model}</span>
                            </div>
                          )}
                          {listing.year && !isNaN(Number(listing.year)) && (
                            <div className="flex items-center">
                              <Calendar size={15} className="mr-1.5 flex-shrink-0 text-gray-500" />
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
      </div>
    </div>
  );
}


