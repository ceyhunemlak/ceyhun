"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, HomeIcon, Building2, Car, MapPin, ArrowRight, Map } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import neighborhoodsByDistrict from "@/lib/neighborhoods";

// Define the neighborhood type
interface Neighborhood {
  value: string;
  label: string;
}

// Define the district data structure
interface DistrictData {
  mahalle: Neighborhood[];
  koy: Neighborhood[];
}

const FilterArea = () => {
  const router = useRouter();
  const [konutType, setKonutType] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [roomCount, setRoomCount] = useState("all");
  const [saleStatus, setSaleStatus] = useState("sale");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const [activeTab, setActiveTab] = useState("konut");
  
  // Format price with dot separators (123.123)
  const formatPrice = (value: string): string => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format with dot separators
    if (digits) {
      return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    return '';
  };
  
  // Handle price input changes
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorPosition = input.selectionStart || 0;
    const previousValue = minPrice;
    const formattedValue = formatPrice(input.value);
    
    setMinPrice(formattedValue);
    
    // Calculate new cursor position
    setTimeout(() => {
      // Count dots before cursor in the previous value
      const previousDots = (previousValue.substring(0, cursorPosition).match(/\./g) || []).length;
      // Count dots before cursor in the new value
      const newDots = (formattedValue.substring(0, cursorPosition).match(/\./g) || []).length;
      // Adjust cursor position based on the difference in dots
      const newPosition = cursorPosition + (newDots - previousDots);
      input.setSelectionRange(newPosition, newPosition);
    }, 0);
  };
  
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorPosition = input.selectionStart || 0;
    const previousValue = maxPrice;
    const formattedValue = formatPrice(input.value);
    
    setMaxPrice(formattedValue);
    
    // Calculate new cursor position
    setTimeout(() => {
      // Count dots before cursor in the previous value
      const previousDots = (previousValue.substring(0, cursorPosition).match(/\./g) || []).length;
      // Count dots before cursor in the new value
      const newDots = (formattedValue.substring(0, cursorPosition).match(/\./g) || []).length;
      // Adjust cursor position based on the difference in dots
      const newPosition = cursorPosition + (newDots - previousDots);
      input.setSelectionRange(newPosition, newPosition);
    }, 0);
  };
  
  // Remove formatting for submission
  const getUnformattedPrice = (price: string): string => {
    return price.replace(/\./g, '');
  };
  
  // Function to get neighborhoods for selected district
  const getNeighborhoods = (district: string): DistrictData => {
    if (!district) return { mahalle: [], koy: [] };
    
    // Type assertion to make TypeScript happy
    const districtData = (neighborhoodsByDistrict as Record<string, DistrictData>)[district.toLowerCase()];
    return districtData || { mahalle: [], koy: [] };
  };
  
  // Handle district change
  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedNeighborhood(""); // Reset neighborhood when district changes
  };
  
  // Add effect to prevent text selection in filter area
  useEffect(() => {
    const filterArea = document.querySelector('.filter-area');
    if (filterArea) {
      // Prevent text selection on all elements in filter area
      filterArea.querySelectorAll('*').forEach((el: Element) => {
        if (el instanceof HTMLElement) {
          el.style.userSelect = 'none';
          el.style.webkitUserSelect = 'none';
          // @ts-ignore - These properties exist but TypeScript doesn't recognize them
          el.style.msUserSelect = 'none';
          // @ts-ignore
          el.style.mozUserSelect = 'none';
          
          // Prevent blue highlight on mobile
          // @ts-ignore - This property exists but TypeScript doesn't recognize it
          el.style.webkitTapHighlightColor = 'transparent';
          
          // Prevent default on double click
          el.addEventListener('mousedown', (e: MouseEvent) => {
            if (e.detail > 1) {
              e.preventDefault();
            }
          });
        }
      });
    }
  }, []);
  
  const formatLabel = (label: string) => {
    return label
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  return (
    <div 
      className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-5 md:py-8 glass-effect rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover-shadow no-select filter-area border border-white/30 max-h-[70vh] sm:max-h-none overflow-y-auto touch-pan-y" 
      style={{
        userSelect: 'none', 
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      } as React.CSSProperties}
    >
      <Tabs defaultValue="konut" className="w-full" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid grid-cols-4 mb-3 sm:mb-6 md:mb-10 w-full h-auto p-1 sm:p-1.5 md:p-2 bg-gray-100/80 rounded-md sm:rounded-lg md:rounded-xl">
          <TabsTrigger 
            value="konut" 
            className="font-headings flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-1.5 sm:py-2.5 md:py-4 text-xs sm:text-sm md:text-base font-medium rounded-md transition-all duration-300 data-[state=active]:shadow-md"
          >
            <HomeIcon size={14} className="sm:size-[18px] md:size-[22px]" />
            <span>Konut</span>
          </TabsTrigger>
          <TabsTrigger 
            value="ticari" 
            className="font-headings flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-1.5 sm:py-2.5 md:py-4 text-xs sm:text-sm md:text-base font-medium rounded-md transition-all duration-300 data-[state=active]:shadow-md"
          >
            <Building2 size={14} className="sm:size-[18px] md:size-[22px]" />
            <span>Ticari</span>
          </TabsTrigger>
          <TabsTrigger 
            value="arsa" 
            className="font-headings flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-1.5 sm:py-2.5 md:py-4 text-xs sm:text-sm md:text-base font-medium rounded-md transition-all duration-300 data-[state=active]:shadow-md"
          >
            <Map size={14} className="sm:size-[18px] md:size-[22px]" />
            <span>Arsa</span>
          </TabsTrigger>
          <Link 
            href="/ilanlar/vasita" 
            className="font-headings flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 py-1.5 sm:py-2.5 md:py-4 text-xs sm:text-sm md:text-base font-medium w-full rounded-md bg-gray-100/80 text-gray-900"
          >
            <Car size={14} className="sm:size-[18px] md:size-[22px]" />
            <span>Vasıta</span>
          </Link>
        </TabsList>

        {/* Konut Content */}
        <TabsContent value="konut" className="space-y-3 sm:space-y-5 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-8">
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">İlan Durumu</Label>
                <Select value={saleStatus} onValueChange={setSaleStatus}>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="İlan Durumu Seçin">
                      {saleStatus === "sale" ? "Satılık" : "Kiralık"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="sale">Satılık</SelectItem>
                    <SelectItem value="rent">Kiralık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Konut Tipi</Label>
                <Select value={konutType} onValueChange={setKonutType}>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="Konut Tipi Seçin" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="daire">Daire</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="mustakil">Müstakil Ev</SelectItem>
                    <SelectItem value="bina">Bina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div>
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Fiyat Aralığı</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="Min TL" 
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                    />
                  </div>
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="Max TL" 
                      value={maxPrice}
                      onChange={handleMaxPriceChange}
                      className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Alan (m²)</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="Min m²" 
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                    />
                  </div>
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="Max m²" 
                      value={maxArea}
                      onChange={(e) => setMaxArea(e.target.value)}
                      className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Oda Sayısı</Label>
                <Select value={roomCount} onValueChange={setRoomCount}>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="Oda Sayısı Seçin" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="1+0">1+0</SelectItem>
                    <SelectItem value="1+1">1+1</SelectItem>
                    <SelectItem value="2+1">2+1</SelectItem>
                    <SelectItem value="3+1">3+1</SelectItem>
                    <SelectItem value="4+1">4+1</SelectItem>
                    <SelectItem value="5+1">5+1 ve üzeri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">İl/İlçe/Mahalle-Köy</Label>
                <div className="grid grid-cols-3 gap-1 sm:gap-1 md:gap-2">
                  <Select defaultValue="tokat">
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                      <SelectItem value="tokat">Tokat</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue placeholder="İlçe" />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                      <SelectItem value="merkez">Merkez</SelectItem>
                      <SelectItem value="almus">Almus</SelectItem>
                      <SelectItem value="artova">Artova</SelectItem>
                      <SelectItem value="basciftlik">Başçiftlik</SelectItem>
                      <SelectItem value="erbaa">Erbaa</SelectItem>
                      <SelectItem value="niksar">Niksar</SelectItem>
                      <SelectItem value="pazar">Pazar</SelectItem>
                      <SelectItem value="resadiye">Reşadiye</SelectItem>
                      <SelectItem value="sulusaray">Sulusaray</SelectItem>
                      <SelectItem value="turhal">Turhal</SelectItem>
                      <SelectItem value="yesilyurt">Yeşilyurt</SelectItem>
                      <SelectItem value="zile">Zile</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={selectedNeighborhood} 
                    onValueChange={setSelectedNeighborhood}
                    disabled={!selectedDistrict}
                  >
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue placeholder={selectedDistrict ? "Mahalle/Köy" : "İlçe Seçin"} />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200 max-h-[200px] sm:max-h-[250px] md:max-h-[300px]">
                      {selectedDistrict && (
                        <>
                          {getNeighborhoods(selectedDistrict).mahalle && getNeighborhoods(selectedDistrict).mahalle.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-sm font-semibold bg-yellow-100 text-yellow-800">Mahalleler</div>
                              {getNeighborhoods(selectedDistrict).mahalle.map((neighborhood: Neighborhood) => (
                                <SelectItem key={neighborhood.value} value={neighborhood.value}>
                                  {neighborhood.label}
                                </SelectItem>
                              ))}
                            </>
                          )}
                          
                          {getNeighborhoods(selectedDistrict).koy && getNeighborhoods(selectedDistrict).koy.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-sm font-semibold bg-yellow-100 text-yellow-800 mt-1">Köyler</div>
                              {getNeighborhoods(selectedDistrict).koy.map((koy: Neighborhood) => (
                                <SelectItem key={koy.value} value={koy.value}>
                                  {koy.label}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-2 sm:mt-5 md:mt-10">
            <Button 
              size="sm"
              className="font-headings px-4 sm:px-6 md:px-10 py-2 sm:py-4 md:py-7 text-sm sm:text-base md:text-lg font-medium rounded-md sm:rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 bg-primary hover:bg-primary/90 group"
              onClick={() => {
                const params = new URLSearchParams();
                
                if (minPrice) params.append('minPrice', getUnformattedPrice(minPrice));
                if (maxPrice) params.append('maxPrice', getUnformattedPrice(maxPrice));
                if (minArea) params.append('minArea', minArea);
                if (maxArea) params.append('maxArea', maxArea);
                if (roomCount && roomCount !== 'all') params.append('roomCount', roomCount);
                if (konutType && konutType !== 'all') params.append('konutType', konutType);
                if (saleStatus) params.append('listingStatus', saleStatus === 'sale' ? 'satilik' : 'kiralik');
                if (selectedDistrict) params.append('district', selectedDistrict);
                if (selectedNeighborhood) params.append('neighborhood', selectedNeighborhood);
                
                router.push(`/ilanlar/konut?${params.toString()}`);
              }}
            >
              <Search className="mr-1.5 sm:mr-2 md:mr-3 group-hover:scale-110 transition-transform duration-300" size={14} />
              Ara
              <ArrowRight className="ml-1.5 sm:ml-2 opacity-100 sm:opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" size={12} />
            </Button>
          </div>
        </TabsContent>

        {/* Ticari Content */}
        <TabsContent value="ticari" className="space-y-3 sm:space-y-5 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-8">
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">İlan Durumu</Label>
                <Select value={saleStatus} onValueChange={setSaleStatus}>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="İlan Durumu Seçin">
                      {saleStatus === "sale" ? "Satılık" : "Kiralık"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="sale">Satılık</SelectItem>
                    <SelectItem value="rent">Kiralık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">İş Yeri Tipi</Label>
                <Select>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="İş Yeri Tipi Seçin" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="dukkan">Dükkan</SelectItem>
                    <SelectItem value="depo">Depo</SelectItem>
                    <SelectItem value="fabrika">Fabrika</SelectItem>
                    <SelectItem value="atolye">Atölye</SelectItem>
                    <SelectItem value="plaza">Plaza</SelectItem>
                    <SelectItem value="ofis">Ofis</SelectItem>
                    <SelectItem value="cafe">Cafe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div>
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Fiyat Aralığı</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  <Input 
                    type="text" 
                    placeholder="Min TL" 
                    onChange={handleMinPriceChange}
                    value={minPrice}
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                  <Input 
                    type="text" 
                    placeholder="Max TL" 
                    onChange={handleMaxPriceChange}
                    value={maxPrice}
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                </div>
              </div>
              
              <div>
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Alan (m²)</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  <Input 
                    type="text" 
                    placeholder="Min m²" 
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                  <Input 
                    type="text" 
                    placeholder="Max m²" 
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Oda Sayısı</Label>
                <Select>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="Oda Sayısı Seçin" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">İl/İlçe/Mahalle-Köy</Label>
                <div className="grid grid-cols-3 gap-1 sm:gap-1 md:gap-2">
                  <Select defaultValue="tokat">
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                      <SelectItem value="tokat">Tokat</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue placeholder="İlçe Seçin" />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                      <SelectItem value="merkez">Merkez</SelectItem>
                      <SelectItem value="almus">Almus</SelectItem>
                      <SelectItem value="artova">Artova</SelectItem>
                      <SelectItem value="basciftlik">Başçiftlik</SelectItem>
                      <SelectItem value="erbaa">Erbaa</SelectItem>
                      <SelectItem value="niksar">Niksar</SelectItem>
                      <SelectItem value="pazar">Pazar</SelectItem>
                      <SelectItem value="resadiye">Reşadiye</SelectItem>
                      <SelectItem value="sulusaray">Sulusaray</SelectItem>
                      <SelectItem value="turhal">Turhal</SelectItem>
                      <SelectItem value="yesilyurt">Yeşilyurt</SelectItem>
                      <SelectItem value="zile">Zile</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={selectedNeighborhood} 
                    onValueChange={setSelectedNeighborhood}
                    disabled={!selectedDistrict}
                  >
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue placeholder={selectedDistrict ? "Mahalle/Köy" : "İlçe Seçin"} />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200 max-h-[200px] sm:max-h-[250px] md:max-h-[300px]">
                      {selectedDistrict && (
                        <>
                          {getNeighborhoods(selectedDistrict).mahalle && getNeighborhoods(selectedDistrict).mahalle.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-sm font-semibold bg-yellow-100 text-yellow-800">Mahalleler</div>
                              {getNeighborhoods(selectedDistrict).mahalle.map((neighborhood: Neighborhood) => (
                                <SelectItem key={neighborhood.value} value={neighborhood.value}>
                                  {neighborhood.label}
                                </SelectItem>
                              ))}
                            </>
                          )}
                          
                          {getNeighborhoods(selectedDistrict).koy && getNeighborhoods(selectedDistrict).koy.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-sm font-semibold bg-yellow-100 text-yellow-800 mt-1">Köyler</div>
                              {getNeighborhoods(selectedDistrict).koy.map((koy: Neighborhood) => (
                                <SelectItem key={koy.value} value={koy.value}>
                                  {koy.label}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-2 sm:mt-5 md:mt-10">
            <Button 
              size="sm"
              className="font-headings px-4 sm:px-6 md:px-10 py-2 sm:py-4 md:py-7 text-sm sm:text-base md:text-lg font-medium rounded-md sm:rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 bg-primary hover:bg-primary/90 group"
              onClick={() => {
                const params = new URLSearchParams();
                
                if (minPrice) params.append('minPrice', getUnformattedPrice(minPrice));
                if (maxPrice) params.append('maxPrice', getUnformattedPrice(maxPrice));
                if (minArea) params.append('minArea', minArea);
                if (maxArea) params.append('maxArea', maxArea);
                if (saleStatus) params.append('listingStatus', saleStatus === 'sale' ? 'satilik' : 'kiralik');
                if (selectedDistrict) params.append('district', selectedDistrict);
                if (selectedNeighborhood) params.append('neighborhood', selectedNeighborhood);
                
                router.push(`/ilanlar/ticari?${params.toString()}`);
              }}
            >
              <Search className="mr-1.5 sm:mr-2 md:mr-3 group-hover:scale-110 transition-transform duration-300" size={14} />
              Ara
              <ArrowRight className="ml-1.5 sm:ml-2 opacity-100 sm:opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" size={12} />
            </Button>
          </div>
        </TabsContent>

        {/* Arsa Content */}
        <TabsContent value="arsa" className="space-y-3 sm:space-y-5 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-8">
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">İlan Durumu</Label>
                <Select value={saleStatus} onValueChange={setSaleStatus}>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="İlan Durumu Seçin">
                      {saleStatus === "sale" ? "Satılık" : "Kiralık"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="sale">Satılık</SelectItem>
                    <SelectItem value="rent">Kiralık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Arsa Tipi</Label>
                <Select>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="Arsa Tipi Seçin" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="tarla">Tarla</SelectItem>
                    <SelectItem value="bahce">Bahçe</SelectItem>
                    <SelectItem value="konut-imarli">Konut İmarlı</SelectItem>
                    <SelectItem value="ticari-imarli">Ticari İmarlı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div>
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Fiyat Aralığı</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  <Input 
                    type="text" 
                    placeholder="Min TL" 
                    onChange={handleMinPriceChange}
                    value={minPrice}
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                  <Input 
                    type="text" 
                    placeholder="Max TL" 
                    onChange={handleMaxPriceChange}
                    value={maxPrice}
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                </div>
              </div>
              
              <div>
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Alan (m²)</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  <Input 
                    type="text" 
                    placeholder="Min m²" 
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                  <Input 
                    type="text" 
                    placeholder="Max m²" 
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">İl/İlçe/Mahalle-Köy</Label>
                <div className="grid grid-cols-3 gap-1 sm:gap-1 md:gap-2">
                  <Select defaultValue="tokat">
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                      <SelectItem value="tokat">Tokat</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue placeholder="İlçe Seçin" />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                      <SelectItem value="merkez">Merkez</SelectItem>
                      <SelectItem value="almus">Almus</SelectItem>
                      <SelectItem value="artova">Artova</SelectItem>
                      <SelectItem value="basciftlik">Başçiftlik</SelectItem>
                      <SelectItem value="erbaa">Erbaa</SelectItem>
                      <SelectItem value="niksar">Niksar</SelectItem>
                      <SelectItem value="pazar">Pazar</SelectItem>
                      <SelectItem value="resadiye">Reşadiye</SelectItem>
                      <SelectItem value="sulusaray">Sulusaray</SelectItem>
                      <SelectItem value="turhal">Turhal</SelectItem>
                      <SelectItem value="yesilyurt">Yeşilyurt</SelectItem>
                      <SelectItem value="zile">Zile</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={selectedNeighborhood} 
                    onValueChange={setSelectedNeighborhood}
                    disabled={!selectedDistrict}
                  >
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue placeholder={selectedDistrict ? "Mahalle/Köy" : "İlçe Seçin"} />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200 max-h-[200px] sm:max-h-[250px] md:max-h-[300px]">
                      {selectedDistrict && (
                        <>
                          {getNeighborhoods(selectedDistrict).mahalle && getNeighborhoods(selectedDistrict).mahalle.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-sm font-semibold bg-yellow-100 text-yellow-800">Mahalleler</div>
                              {getNeighborhoods(selectedDistrict).mahalle.map((neighborhood: Neighborhood) => (
                                <SelectItem key={neighborhood.value} value={neighborhood.value}>
                                  {neighborhood.label}
                                </SelectItem>
                              ))}
                            </>
                          )}
                          
                          {getNeighborhoods(selectedDistrict).koy && getNeighborhoods(selectedDistrict).koy.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-sm font-semibold bg-yellow-100 text-yellow-800 mt-1">Köyler</div>
                              {getNeighborhoods(selectedDistrict).koy.map((koy: Neighborhood) => (
                                <SelectItem key={koy.value} value={koy.value}>
                                  {koy.label}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-2 sm:mt-5 md:mt-10">
            <Button 
              size="sm"
              className="font-headings px-4 sm:px-6 md:px-10 py-2 sm:py-4 md:py-7 text-sm sm:text-base md:text-lg font-medium rounded-md sm:rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 bg-primary hover:bg-primary/90 group"
              onClick={() => {
                const params = new URLSearchParams();
                
                if (minPrice) params.append('minPrice', getUnformattedPrice(minPrice));
                if (maxPrice) params.append('maxPrice', getUnformattedPrice(maxPrice));
                if (minArea) params.append('minArea', minArea);
                if (maxArea) params.append('maxArea', maxArea);
                if (saleStatus) params.append('listingStatus', saleStatus === 'sale' ? 'satilik' : 'kiralik');
                if (selectedDistrict) params.append('district', selectedDistrict);
                if (selectedNeighborhood) params.append('neighborhood', selectedNeighborhood);
                
                router.push(`/ilanlar/arsa?${params.toString()}`);
              }}
            >
              <Search className="mr-1.5 sm:mr-2 md:mr-3 group-hover:scale-110 transition-transform duration-300" size={14} />
              Ara
              <ArrowRight className="ml-1.5 sm:ml-2 opacity-100 sm:opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" size={12} />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FilterArea; 