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

// Define the locations data structure
interface LocationsData {
  [province: string]: {
    [district: string]: string[];
  };
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
  // Additional types for other tabs
  const [ticariType, setTicariType] = useState("all");
  const [arsaType, setArsaType] = useState("all");
  // Address is handled with selects using selectedProvince/selectedDistrict/selectedNeighborhood
  
  // Location states (kept for legacy select-based flows used elsewhere)
  const [selectedProvince, setSelectedProvince] = useState("tokat");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const [provinces, setProvinces] = useState<string[]>(['tokat']);
  const [districts, setDistricts] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  
  // State to store all locations data
  const [locationsData, setLocationsData] = useState<LocationsData | null>(null);
  
  const [activeTab, setActiveTab] = useState("konut");
  
  // Fetch all locations data on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations/all');
        if (!response.ok) throw new Error('Failed to fetch locations');
        
        const data = await response.json();
        setLocationsData(data);
        
        // Get all provinces
        const allProvinces = Object.keys(data).map(p => p.charAt(0).toUpperCase() + p.slice(1));
        setProvinces(['Tokat', ...allProvinces.filter(p => p.toLowerCase() !== 'tokat')]);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    
    fetchLocations();
  }, []);

  // Update districts when province changes
  useEffect(() => {
    if (!locationsData || !selectedProvince) return;
    
    const province = selectedProvince.toLowerCase();
    
    if (province === 'tokat') {
      // For Tokat, use the static data
      const tokatDistricts = Object.keys(neighborhoodsByDistrict).map(
        d => d.charAt(0).toUpperCase() + d.slice(1)
      );
      setDistricts(tokatDistricts);
    } else if (locationsData[province]) {
      // For other provinces, use the dynamic data
      const provinceDistricts = Object.keys(locationsData[province]).map(
        d => d.charAt(0).toUpperCase() + d.slice(1)
      );
      setDistricts(provinceDistricts);
    } else {
      setDistricts([]);
    }
    
    // Reset district and neighborhood when province changes
    setSelectedDistrict("");
    setSelectedNeighborhood("");
  }, [selectedProvince, locationsData]);

  // Update neighborhoods when district changes
  useEffect(() => {
    if (!selectedProvince || !selectedDistrict) {
      setNeighborhoods([]);
      return;
    }
    
    const province = selectedProvince.toLowerCase();
    const district = selectedDistrict.toLowerCase();
    
    if (province === 'tokat') {
      // For Tokat, use the static data and retain the mahalle/köy separation
      setNeighborhoods([]);
      // Neighborhoods are rendered directly in the component from neighborhoodsByDistrict
    } else if (locationsData && locationsData[province] && locationsData[province][district]) {
      // For other provinces, use the dynamic data
      setNeighborhoods(locationsData[province][district]);
    } else {
      setNeighborhoods([]);
    }
  }, [selectedProvince, selectedDistrict, locationsData]);
  
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
  
  // Add effect to prevent layout shift when dropdown opens
  useEffect(() => {
    // Get the original body width
    const originalBodyWidth = document.body.clientWidth;
    
    // Function to handle dropdown state changes
    const handleDropdownStateChange = () => {
      // Check if any dropdown is open
      const isDropdownOpen = document.querySelector('[data-state="open"][data-slot="dropdown-menu-content"], [data-state="open"][data-slot="select-content"]');
      
      if (isDropdownOpen) {
        // Calculate scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        // Apply fixed width to body to prevent layout shift
        if (scrollbarWidth > 0) {
          document.body.style.width = `${originalBodyWidth}px`;
          document.body.style.overflow = 'hidden auto';
        }
      } else {
        // Reset body styles when all dropdowns are closed
        document.body.style.width = '';
        document.body.style.overflow = '';
      }
    };
    
    // Create a MutationObserver to watch for dropdown state changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (
          mutation.type === 'attributes' && 
          mutation.attributeName === 'data-state' && 
          (mutation.target as Element).hasAttribute('data-slot')
        ) {
          handleDropdownStateChange();
        }
      });
    });
    
    // Start observing the document
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state']
    });
    
    // Clean up observer on component unmount
    return () => {
      observer.disconnect();
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, []);
  
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
  
  // Function to get neighborhoods for selected district (for Tokat)
  const getNeighborhoods = (district: string): DistrictData => {
    if (!district) return { mahalle: [], koy: [] };
    
    // Type assertion to make TypeScript happy
    const districtData = (neighborhoodsByDistrict as Record<string, DistrictData>)[district.toLowerCase()];
    return districtData || { mahalle: [], koy: [] };
  };
  
  // Handle province change
  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
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
  
  // Format label to capitalize first letter of each word
  const formatLabel = (label: string) => {
    return label
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  return (
    <div 
      className="w-full max-w-6xl mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-5 glass-effect rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover-shadow no-select filter-area border border-white/30" 
      style={{
        userSelect: 'none', 
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      } as React.CSSProperties}
    >
      <Tabs defaultValue="konut" className="w-full" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid grid-cols-4 mb-2 sm:mb-4 md:mb-6 w-full h-auto p-0.5 sm:p-1 md:p-1.5 bg-gray-100/80 rounded-md sm:rounded-lg">
          <TabsTrigger 
            value="konut" 
            className="font-headings flex items-center justify-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm md:text-base font-medium rounded-md transition-all duration-300 data-[state=active]:shadow-sm"
          >
            <HomeIcon size={12} className="sm:size-[14px] md:size-[16px]" />
            <span>Konut</span>
          </TabsTrigger>
          <TabsTrigger 
            value="ticari" 
            className="font-headings flex items-center justify-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm md:text-base font-medium rounded-md transition-all duration-300 data-[state=active]:shadow-sm"
          >
            <Building2 size={12} className="sm:size-[14px] md:size-[16px]" />
            <span>Ticari</span>
          </TabsTrigger>
          <TabsTrigger 
            value="arsa" 
            className="font-headings flex items-center justify-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm md:text-base font-medium rounded-md transition-all duration-300 data-[state=active]:shadow-sm"
          >
            <Map size={12} className="sm:size-[14px] md:size-[16px]" />
            <span>Arsa</span>
          </TabsTrigger>
          <Link 
            href="/ilanlar/vasita" 
            className="font-headings flex items-center justify-center gap-1 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm md:text-base font-medium w-full rounded-md bg-gray-100/80 text-gray-900"
          >
            <Car size={12} className="sm:size-[14px] md:size-[16px]" />
            <span>Vasıta</span>
          </Link>
        </TabsList>

        {/* Konut Content */}
        <TabsContent value="konut" className="space-y-2 sm:space-y-3 md:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 md:gap-4">
            {/* Col 1 - Address */}
            <div className="space-y-1">
              <div>
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">Adres</Label>
                <div className="flex flex-col gap-1">
                  <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                    <SelectTrigger className="w-full py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                      <SelectValue placeholder="İl" />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-lg border border-gray-200 max-h-[200px] overflow-y-auto">
                      {provinces.map((province) => (
                        <SelectItem key={province.toLowerCase()} value={province.toLowerCase()}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={selectedDistrict} 
                    onValueChange={handleDistrictChange}
                    disabled={!selectedProvince}
                  >
                    <SelectTrigger className="w-full py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                      <SelectValue placeholder="İlçe" />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-lg border border-gray-200 max-h-[200px] overflow-y-auto">
                      {districts.map((district) => (
                        <SelectItem key={district.toLowerCase()} value={district.toLowerCase()}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={selectedNeighborhood} 
                    onValueChange={setSelectedNeighborhood}
                    disabled={!selectedDistrict}
                  >
                    <SelectTrigger className="w-full py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                      <SelectValue placeholder={selectedDistrict ? "Mahalle/Köy" : "İlçe Seçin"} />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-lg border border-gray-200 max-h-[200px] sm:max-h-[250px] md:max-h-[300px]">
                      {selectedProvince === 'tokat' && selectedDistrict ? (
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
                      ) : (
                        neighborhoods.map((neighborhood) => (
                          <SelectItem key={neighborhood} value={neighborhood}>
                            {formatLabel(neighborhood)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {/* Col 2 - Price and Area (horizontal groups) */}
            <div className="space-y-5">
              <div>
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">Fiyat Aralığı</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2">
                  <Input type="text" inputMode="numeric" enterKeyHint="search" placeholder="Min TL" value={minPrice} onChange={handleMinPriceChange} className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 pl-2 text-xs sm:text-sm" />
                  <Input type="text" inputMode="numeric" enterKeyHint="search" placeholder="Max TL" value={maxPrice} onChange={handleMaxPriceChange} className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 pl-2 text-xs sm:text-sm" />
                </div>
              </div>
              <div>
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">Alan (m²)</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2">
                  <Input type="number" inputMode="numeric" enterKeyHint="search" placeholder="Min" value={minArea} onChange={(e) => setMinArea(e.target.value)} className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 pl-2 text-xs sm:text-sm" />
                  <Input type="number" inputMode="numeric" enterKeyHint="search" placeholder="Max" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 pl-2 text-xs sm:text-sm" />
                </div>
              </div>
            </div>
            {/* Col 3 - Selects + Search */}
            <div className="grid grid-cols-2 gap-2">
              {/* Konut Tipi */}
              <div className="relative">
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">Konut Tipi</Label>
                <Select value={konutType} onValueChange={setKonutType}>
                  <SelectTrigger className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                    <SelectValue placeholder="Konut Tipi" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-lg border border-gray-200">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="daire">Daire</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="mustakil">Müstakil Ev</SelectItem>
                    <SelectItem value="bina">Bina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* İlan Durumu */}
              <div className="relative">
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">İlan Durumu</Label>
                <Select value={saleStatus} onValueChange={setSaleStatus}>
                  <SelectTrigger className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-lg border border-gray-200">
                    <SelectItem value="sale">Satılık</SelectItem>
                    <SelectItem value="rent">Kiralık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Oda Sayısı */}
              <div className="relative mt-3">
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">Oda Sayısı</Label>
                <Select value={roomCount} onValueChange={setRoomCount}>
                  <SelectTrigger className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                    <SelectValue placeholder="Oda Sayısı" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-lg border border-gray-200">
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
              {/* Ara butonu */}
              <div className="relative mt-3">
                <Label className="invisible mb-0.5 block text-xs sm:text-sm">Ara</Label>
                <Button size="sm" className="w-full h-9 font-headings px-3 text-xs sm:text-sm font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-300 bg-primary hover:bg-primary/90 group" onClick={() => {
                  const params = new URLSearchParams();
                  if (minPrice) params.append('minPrice', getUnformattedPrice(minPrice));
                  if (maxPrice) params.append('maxPrice', getUnformattedPrice(maxPrice));
                  if (minArea) params.append('minArea', minArea);
                  if (maxArea) params.append('maxArea', maxArea);
                  if (roomCount && roomCount !== 'all') params.append('roomCount', roomCount);
                  if (konutType && konutType !== 'all') params.append('konutType', konutType);
                  if (saleStatus) params.append('listingStatus', saleStatus === 'sale' ? 'satilik' : 'kiralik');
                  if (selectedProvince) params.append('province', selectedProvince);
                  if (selectedDistrict) params.append('district', selectedDistrict);
                  if (selectedNeighborhood) params.append('neighborhood', selectedNeighborhood);
                  router.push(`/ilanlar/konut?${params.toString()}`);
                }}>
                  <Search className="mr-1 group-hover:scale-110 transition-transform duration-300" size={12} /> Ara
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Ticari Content */}
        <TabsContent value="ticari" className="space-y-2 sm:space-y-3 md:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 md:gap-4">
            {/* Col 1 - Address */}
            <div className="space-y-1">
              <div>
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">Adres</Label>
                <div className="flex flex-col gap-1">
                  <Select defaultValue="tokat">
                    <SelectTrigger className="w-full py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-lg border border-gray-200">
                      <SelectItem value="tokat">Tokat</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                    <SelectTrigger className="w-full py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                      <SelectValue placeholder="İlçe Seçin" />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-lg border border-gray-200">
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
                </div>
              </div>
              <div>
                <Select 
                  value={selectedNeighborhood} 
                  onValueChange={setSelectedNeighborhood}
                  disabled={!selectedDistrict}
                >
                  <SelectTrigger className="w-full py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                    <SelectValue placeholder={selectedDistrict ? "Mahalle/Köy" : "İlçe Seçin"} />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-lg border border-gray-200 max-h-[200px]">
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
            {/* Col 2 - Price + Area */}
            <div className="space-y-5">
              <div>
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">Fiyat Aralığı</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2">
                  <Input type="text" placeholder="Min TL" onChange={handleMinPriceChange} value={minPrice} className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 pl-2 text-xs sm:text-sm" />
                  <Input type="text" placeholder="Max TL" onChange={handleMaxPriceChange} value={maxPrice} className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 pl-2 text-xs sm:text-sm" />
                </div>
              </div>
              <div>
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">Alan (m²)</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2">
                  <Input type="number" placeholder="Min" value={minArea} onChange={(e) => setMinArea(e.target.value)} className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 pl-2 text-xs sm:text-sm" />
                  <Input type="number" placeholder="Max" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 pl-2 text-xs sm:text-sm" />
                </div>
              </div>
            </div>
            {/* Col 3 - Selects + Search */}
            <div className="grid grid-cols-2 gap-2">
              {/* İş Yeri Tipi */}
              <div className="relative">
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">İş Yeri Tipi</Label>
                <Select value={ticariType} onValueChange={setTicariType}>
                  <SelectTrigger className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                    <SelectValue placeholder="İş Yeri Tipi" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-lg border border-gray-200">
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
              {/* İlan Durumu */}
              <div className="relative">
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">İlan Durumu</Label>
                <Select value={saleStatus} onValueChange={setSaleStatus}>
                  <SelectTrigger className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-lg border border-gray-200">
                    <SelectItem value="sale">Satılık</SelectItem>
                    <SelectItem value="rent">Kiralık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Oda Sayısı */}
              <div className="relative mt-3">
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">Oda Sayısı</Label>
                <Select value={roomCount} onValueChange={setRoomCount}>
                  <SelectTrigger className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                    <SelectValue placeholder="Oda Sayısı" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-lg border border-gray-200">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Ara butonu */}
              <div className="relative mt-3">
                <Label className="invisible mb-0.5 block text-xs sm:text-sm">Ara</Label>
                <Button size="sm" className="w-full h-9 font-headings px-3 text-xs sm:text-sm font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-300 bg-primary hover:bg-primary/90 group" onClick={() => {
                  const params = new URLSearchParams();
                  if (minPrice) params.append('minPrice', getUnformattedPrice(minPrice));
                  if (maxPrice) params.append('maxPrice', getUnformattedPrice(maxPrice));
                  if (minArea) params.append('minArea', minArea);
                  if (maxArea) params.append('maxArea', maxArea);
                  if (saleStatus) params.append('listingStatus', saleStatus === 'sale' ? 'satilik' : 'kiralik');
                  if (roomCount && roomCount !== 'all') params.append('roomCount', roomCount);
                  if (ticariType && ticariType !== 'all') params.append('ticariType', ticariType);
                  if (selectedDistrict) params.append('district', selectedDistrict);
                  if (selectedNeighborhood) params.append('neighborhood', selectedNeighborhood);
                  router.push(`/ilanlar/ticari?${params.toString()}`);
                }}>
                  <Search className="mr-1 group-hover:scale-110 transition-transform duration-300" size={12} /> Ara
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Arsa Content */}
        <TabsContent value="arsa" className="space-y-2 sm:space-y-3 md:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 md:gap-4">
            {/* Col 1 - Address */}
            <div className="space-y-1">
              <div>
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">Adres</Label>
                <div className="flex flex-col gap-1">
                  <Select defaultValue="tokat">
                    <SelectTrigger className="w-full py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-lg border border-gray-200">
                      <SelectItem value="tokat">Tokat</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                    <SelectTrigger className="w-full py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                      <SelectValue placeholder="İlçe Seçin" />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-lg border border-gray-200">
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
                </div>
              </div>
              <div>
                <Select 
                  value={selectedNeighborhood} 
                  onValueChange={setSelectedNeighborhood}
                  disabled={!selectedDistrict}
                >
                  <SelectTrigger className="w-full py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                    <SelectValue placeholder={selectedDistrict ? "Mahalle/Köy" : "İlçe Seçin"} />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-lg border border-gray-200 max-h-[200px]">
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
            {/* Col 2 - Price + Area */}
            <div className="space-y-5">
              <div>
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">Fiyat Aralığı</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2">
                  <Input type="text" placeholder="Min TL" onChange={handleMinPriceChange} value={minPrice} className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 pl-2 text-xs sm:text-sm" />
                  <Input type="text" placeholder="Max TL" onChange={handleMaxPriceChange} value={maxPrice} className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 pl-2 text-xs sm:text-sm" />
                </div>
              </div>
              <div>
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">Alan (m²)</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2">
                  <Input type="number" placeholder="Min" value={minArea} onChange={(e) => setMinArea(e.target.value)} className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 pl-2 text-xs sm:text-sm" />
                  <Input type="number" placeholder="Max" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 pl-2 text-xs sm:text-sm" />
                </div>
              </div>
            </div>
            {/* Col 3 - Selects + Search */}
            <div className="grid grid-cols-2 gap-2">
              {/* Arsa Tipi + İlan Durumu */}
              <div className="relative">
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">Arsa Tipi</Label>
                <Select value={arsaType} onValueChange={setArsaType}>
                  <SelectTrigger className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                    <SelectValue placeholder="Arsa Tipi" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-lg border border-gray-200">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="tarla">Tarla</SelectItem>
                    <SelectItem value="bahce">Bahçe</SelectItem>
                    <SelectItem value="konut-imarli">Konut İmarlı</SelectItem>
                    <SelectItem value="ticari-imarli">Ticari İmarlı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Label className="font-headings mb-0.5 sm:mb-1 block text-xs sm:text-sm font-medium">İlan Durumu</Label>
                <Select value={saleStatus} onValueChange={setSaleStatus}>
                  <SelectTrigger className="py-1 sm:py-1.5 md:py-2 rounded-md bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-lg border border-gray-200">
                    <SelectItem value="sale">Satılık</SelectItem>
                    <SelectItem value="rent">Kiralık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Ara butonu 2. satırın tamamını kaplar */}
              <div className="col-span-2 mt-3">
                <Label className="invisible mb-0.5 block text-xs sm:text-sm">Ara</Label>
                <Button size="sm" className="w-full h-9 font-headings px-3 text-xs sm:text-sm font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-300 bg-primary hover:bg-primary/90 group" onClick={() => {
                  const params = new URLSearchParams();
                  if (minPrice) params.append('minPrice', getUnformattedPrice(minPrice));
                  if (maxPrice) params.append('maxPrice', getUnformattedPrice(maxPrice));
                  if (minArea) params.append('minArea', minArea);
                  if (maxArea) params.append('maxArea', maxArea);
                  if (saleStatus) params.append('listingStatus', saleStatus === 'sale' ? 'satilik' : 'kiralik');
                  if (arsaType && arsaType !== 'all') params.append('arsaType', arsaType);
                  if (selectedDistrict) params.append('district', selectedDistrict);
                  if (selectedNeighborhood) params.append('neighborhood', selectedNeighborhood);
                  router.push(`/ilanlar/arsa?${params.toString()}`);
                }}>
                  <Search className="mr-1 group-hover:scale-110 transition-transform duration-300" size={12} /> Ara
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FilterArea; 