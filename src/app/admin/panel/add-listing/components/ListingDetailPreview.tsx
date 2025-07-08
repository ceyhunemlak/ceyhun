"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Bed, Expand, Car, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';

interface ListingDetailPreviewProps {
  formData: any;
  selectedCategory: string;
  selectedType: string;
  listingStatus: string;
}

// Define an interface for the image type
interface ImageType {
  id: string;
  url: string;
  is_cover?: boolean;
  order_index?: number;
}

export default function ListingDetailPreview({ 
  formData, 
  selectedCategory, 
  selectedType, 
  listingStatus 
}: ListingDetailPreviewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Helper functions from the actual listing detail page
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

  const formatPrice = (price: number | string) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('tr-TR').format(numericPrice || 0) + ' ₺';
  };

  // Get formatted property type display name
  const getPropertyTypeDisplayName = (category: string, type: string): string => {
    const typeDisplayMap: Record<string, Record<string, string>> = {
      konut: {
        daire: 'Daire',
        villa: 'Villa',
        mustakil_ev: 'Müstakil Ev',
        bina: 'Bina'
      },
      ticari: {
        dukkan: 'Dükkan',
        depo: 'Depo',
        villa: 'Villa',
        fabrika: 'Fabrika',
        atolye: 'Atölye',
        plaza: 'Plaza',
        bina: 'Bina',
        ofis: 'Ofis',
        cafe: 'Cafe',
        bufe: 'Büfe'
      },
      arsa: {
        tarla: 'Tarla',
        bahce: 'Bahçe',
        konut_imarli: 'Konut İmarlı',
        ticari_imarli: 'Ticari İmarlı'
      },
      vasita: {
        otomobil: 'Otomobil',
        suv: 'SUV',
        atv: 'ATV',
        utv: 'UTV',
        van: 'Van',
        motosiklet: 'Motosiklet',
        bisiklet: 'Bisiklet',
        ticari: 'Ticari'
      }
    };
  
    return typeDisplayMap[category]?.[type] || type;
  };

  // Get location information
  const getLocation = () => {
    const province = formData.province || 'Tokat';
    const district = formData.district || 'Merkez';
    const neighborhood = formData.neighborhood || '';
    
    return `${province}/${district}${neighborhood ? '/' + neighborhood : ''}`;
  };

  // Get images
  const getImages = () => {
    if (!formData.photos || formData.photos.length === 0) {
      return [];
    }
    
    return formData.photos.map((photo: any, index: number) => ({
      id: photo.id || `temp-${index}`,
      url: photo.preview || photo.url,
      is_cover: index === 0,
      order_index: index
    }));
  };

  // Navigation functions
  const goToPrevImage = () => {
    setActiveImageIndex((prev) => 
      prev === 0 ? getImages().length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setActiveImageIndex((prev) => 
      prev === getImages().length - 1 ? 0 : prev + 1
    );
  };

  // Get property details based on property type
  const getPropertyDetails = () => {
    const details = [];
    
    try {
      // Create organized groups of details
      const locationDetails = [];
      const propertyTypeDetails = [];
      const areaDetails = [];
      const roomDetails = [];
      const buildingDetails = [];
      const featuresDetails = [];
      const vehicleDetails = [];
      const financialDetails = [];
      
      // Add location information first
      if (formData.province || formData.district || formData.neighborhood) {
        locationDetails.push({ label: 'İl', value: formData.province || 'Tokat' });
        locationDetails.push({ label: 'İlçe', value: formData.district || 'Merkez' });
        if (formData.neighborhood) {
          locationDetails.push({ label: 'Mahalle', value: formData.neighborhood });
        }
        if (formData.fullAddress) {
          locationDetails.push({ label: 'Tam Adres', value: formData.fullAddress });
        }
      }
      
      // Property type details
      propertyTypeDetails.push({ 
        label: 'Emlak Tipi', 
        value: `${formatPropertyType(selectedCategory)} / ${getPropertyTypeDisplayName(selectedCategory, selectedType)}` 
      });
      
      if (selectedCategory === 'konut') {
        // Area details
        if (formData.grossArea) areaDetails.push({ label: 'Brüt Alan', value: `${formData.grossArea} m²` });
        if (formData.netArea) areaDetails.push({ label: 'Net Alan', value: `${formData.netArea} m²` });
        
        // Room details
        if (formData.roomCount) roomDetails.push({ label: 'Oda Sayısı', value: formData.roomCount });
        
        // Building details
        if (formData.buildingAge) buildingDetails.push({ label: 'Bina Yaşı', value: formData.buildingAge });
        if (formData.floor) buildingDetails.push({ label: 'Bulunduğu Kat', value: formData.floor });
        if (formData.totalFloors) buildingDetails.push({ label: 'Toplam Kat', value: formData.totalFloors });
        
        if (formData.heating) {
          const heatingMap: Record<string, string> = {
            'dogalgaz': 'Doğalgaz',
            'soba': 'Soba',
            'merkezi': 'Merkezi',
            'yok': 'Yok'
          };
          buildingDetails.push({ label: 'Isıtma', value: heatingMap[formData.heating] || formData.heating });
        }
        
        // Features
        if (formData.hasBalcony) featuresDetails.push({ label: 'Balkon', value: 'Var' });
        if (formData.hasElevator) featuresDetails.push({ label: 'Asansör', value: 'Var' });
        if (formData.isFurnished) featuresDetails.push({ label: 'Eşyalı', value: 'Evet' });
        if (formData.inSite) featuresDetails.push({ label: 'Site İçerisinde', value: 'Evet' });
        
        // Financial details
        if (formData.isExchangeable || formData.allowsTrade) financialDetails.push({ label: 'Takas', value: 'Evet' });
        if (formData.isSuitableForCredit || formData.isEligibleForCredit) financialDetails.push({ label: 'Krediye Uygun', value: 'Evet' });
      } else if (selectedCategory === 'ticari') {
        // Area details
        if (formData.grossArea) areaDetails.push({ label: 'Brüt Alan', value: `${formData.grossArea} m²` });
        if (formData.netArea) areaDetails.push({ label: 'Net Alan', value: `${formData.netArea} m²` });
        
        // Building details
        if (formData.buildingAge) buildingDetails.push({ label: 'Bina Yaşı', value: formData.buildingAge });
        if (formData.floor) buildingDetails.push({ label: 'Bulunduğu Kat', value: formData.floor });
        if (formData.totalFloors) buildingDetails.push({ label: 'Toplam Kat', value: formData.totalFloors });
        
        // Financial details
        if (formData.isExchangeable || formData.allowsTrade) financialDetails.push({ label: 'Takas', value: 'Evet' });
        if (formData.isSuitableForCredit || formData.isEligibleForCredit) financialDetails.push({ label: 'Krediye Uygun', value: 'Evet' });
      } else if (selectedCategory === 'arsa') {
        // Area details
        if (formData.sqm) areaDetails.push({ label: 'Alan', value: `${formData.sqm} m²` });
        if (formData.kaks) areaDetails.push({ label: 'KAKS/Emsal', value: formData.kaks });
        
        // Financial details
        if (formData.isExchangeable || formData.allowsTrade) financialDetails.push({ label: 'Takas', value: 'Evet' });
        if (formData.isSuitableForCredit || formData.isEligibleForCredit) financialDetails.push({ label: 'Krediye Uygun', value: 'Evet' });
      } else if (selectedCategory === 'vasita') {
        // Vehicle details
        if (formData.brand) vehicleDetails.push({ label: 'Marka', value: formData.brand });
        if (formData.model) vehicleDetails.push({ label: 'Model', value: formData.model });
        if (formData.subModel) vehicleDetails.push({ label: 'Alt Model', value: formData.subModel });
        if (formData.kilometer) vehicleDetails.push({ label: 'Kilometre', value: formData.kilometer });
        if (formData.fuelType) {
          const fuelTypeMap: Record<string, string> = {
            'benzin': 'Benzin',
            'dizel': 'Dizel',
            'lpg': 'LPG',
            'elektrik': 'Elektrik',
            'hibrit': 'Hibrit'
          };
          vehicleDetails.push({ label: 'Yakıt Tipi', value: fuelTypeMap[formData.fuelType] || formData.fuelType });
        }
        if (formData.transmission) {
          const transmissionMap: Record<string, string> = {
            'manuel': 'Manuel',
            'otomatik': 'Otomatik',
            'yarı_otomatik': 'Yarı Otomatik'
          };
          vehicleDetails.push({ label: 'Vites', value: transmissionMap[formData.transmission] || formData.transmission });
        }
        if (formData.color) vehicleDetails.push({ label: 'Renk', value: formData.color });
        
        // Features
        if (formData.hasWarranty) featuresDetails.push({ label: 'Garanti', value: 'Var' });
        if (formData.hasDamageRecord) featuresDetails.push({ label: 'Hasar Kaydı', value: 'Var' });
        
        // Financial details
        if (formData.allowsTrade) financialDetails.push({ label: 'Takas', value: 'Evet' });
      }
      
      // Add all detail groups to the main details array
      if (locationDetails.length > 0) details.push({ group: 'Konum', items: locationDetails });
      if (propertyTypeDetails.length > 0) details.push({ group: 'Emlak Tipi', items: propertyTypeDetails });
      if (areaDetails.length > 0) details.push({ group: 'Alan Bilgileri', items: areaDetails });
      if (roomDetails.length > 0) details.push({ group: 'Oda Bilgileri', items: roomDetails });
      if (buildingDetails.length > 0) details.push({ group: 'Bina Bilgileri', items: buildingDetails });
      if (vehicleDetails.length > 0) details.push({ group: 'Araç Bilgileri', items: vehicleDetails });
      if (featuresDetails.length > 0) details.push({ group: 'Özellikler', items: featuresDetails });
      if (financialDetails.length > 0) details.push({ group: 'Finansal Bilgiler', items: financialDetails });
    } catch (error) {
      console.error('Error generating property details:', error);
    }
    
    return details;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden max-w-full mx-auto scale-[0.9] origin-top">
      {/* Header Banner */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-primary text-xs font-medium rounded-md text-black">
                  {formatPropertyType(selectedCategory)}
                </span>
                <span className="px-2 py-1 bg-gray-700 text-xs font-medium rounded-md">
                  {formatListingStatus(listingStatus)}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight break-words hyphens-auto">
                {formData.title || "İlan Başlığı"}
              </h1>
              {getLocation() && (
                <div className="flex items-start text-gray-300 mt-1">
                  <MapPin size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm break-words">{getLocation()}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-0 md:flex-shrink-0">
              <p className="text-xl sm:text-2xl font-bold text-primary whitespace-nowrap">
                {formatPrice(formData.price || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Listing Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Gallery and Description */}
          <div className="lg:w-2/3 space-y-6">
            {/* Gallery */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Main Image */}
              <div className="relative h-64 w-full">
                {getImages().length > 0 ? (
                  <>
                    <Image
                      src={getImages()[activeImageIndex].url}
                      alt={formData.title || "İlan Fotoğrafı"}
                      fill
                      className="object-cover"
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
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <p className="text-gray-400">Fotoğraf Eklenmedi</p>
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {getImages().length > 1 && (
                <div className="p-3">
                  <Swiper
                    slidesPerView="auto"
                    spaceBetween={8}
                    freeMode={true}
                    modules={[FreeMode, Navigation]}
                    className="cursor-grab"
                  >
                    {getImages().map((image: ImageType, index: number) => (
                      <SwiperSlide 
                        key={image.id} 
                        className="!w-20"
                      >
                        <div 
                          className={`relative h-14 w-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer transition-all ${index === activeImageIndex ? 'ring-2 ring-primary' : 'hover:opacity-80'}`}
                          onClick={() => setActiveImageIndex(index)}
                        >
                          <Image
                            src={image.url}
                            alt={`Fotoğraf ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}
            </div>
            
            {/* Description */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h2 className="text-lg font-semibold mb-3">Açıklama</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line text-sm leading-relaxed break-words">
                  {formData.description || 'Bu ilan için açıklama bulunmamaktadır.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h2 className="text-lg font-semibold mb-3">İlan Özellikleri</h2>
              <div className="space-y-4">
                {getPropertyDetails().map((detailGroup, groupIndex) => (
                  <div key={groupIndex} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{detailGroup.group}</h3>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      {detailGroup.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex justify-between">
                          <span className="text-sm text-gray-500">{item.label}:</span>
                          <span className="text-sm font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h2 className="text-lg font-semibold mb-3">İletişim</h2>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xs font-medium">CE</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Ceyhun Emlak</p>
                  <p className="text-xs text-gray-500">Emlak Danışmanı</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <button className="bg-primary text-black text-sm py-2 px-4 rounded-md font-medium">
                  Ara
                </button>
                <button className="border border-gray-200 text-gray-700 text-sm py-2 px-4 rounded-md font-medium">
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 