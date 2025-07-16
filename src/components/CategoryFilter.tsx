"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowRight, Check } from "lucide-react";
import neighborhoodsByDistrict from "@/lib/neighborhoods";

// Define the neighborhood type
interface Neighborhood {
  value: string;
  label: string;
}

// Define locations data structure
interface LocationsData {
  [province: string]: {
    [district: string]: string[];
  };
}

// Define filter props type
interface CategoryFilterProps {
  category: string;
  initialFilters?: {
    minPrice?: string;
    maxPrice?: string;
    minArea?: string;
    maxArea?: string;
    listingStatus?: string;
    province?: string;
    district?: string;
    neighborhood?: string;
    roomCount?: string;
    konutType?: string;
    vasitaType?: string;
    ticariType?: string;
    brand?: string;
    model?: string;
    minYear?: string;
    maxYear?: string;
    fuelType?: string;
    transmission?: string;
    minKm?: string;
    maxKm?: string;
    heatingType?: string;
    hasBalcony?: string;
    hasElevator?: string;
    isFurnished?: string;
    allowsTrade?: string;
    isEligibleForCredit?: string;
    arsaType?: string;
    kaks?: string;
    color?: string;
    hasWarranty?: string;
    hasDamageRecord?: string;
    mainCategory?: string;
  };
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ category, initialFilters = {} }) => {
  const router = useRouter();
  
  // Common filter states
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || "");
  const [minArea, setMinArea] = useState(initialFilters.minArea || "");
  const [maxArea, setMaxArea] = useState(initialFilters.maxArea || "");
  const [saleStatus, setSaleStatus] = useState(initialFilters.listingStatus ? (initialFilters.listingStatus === "kiralik" ? "rent" : "sale") : "");
  
  // Location states
  // Province state now defaults to 'all' which represents 'Tümü'
  const [selectedProvince, setSelectedProvince] = useState(initialFilters.province || "all");
  const [selectedDistrict, setSelectedDistrict] = useState(initialFilters.district || "");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(initialFilters.neighborhood || "");
  const [provinces, setProvinces] = useState<string[]>(['tokat']);
  const [districts, setDistricts] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [locationsData, setLocationsData] = useState<LocationsData | null>(null);
  
  const [mainCategory, setMainCategory] = useState(initialFilters.mainCategory || "all");
  
  // For dynamic filter display in emlak category
  const [selectedSubCategory, setSelectedSubCategory] = useState(initialFilters.mainCategory || "all");
  // Detect if we are on the generic “emlak” listings page. In that case we need to
  // show *all* sub-category filters together and skip the sub-category selector.
  const isEmlak = category === "emlak";
  
  // Konut specific filters
  const [roomCount, setRoomCount] = useState(initialFilters.roomCount || "all");
  const [konutType, setKonutType] = useState(initialFilters.konutType || "all");
  const [heatingType, setHeatingType] = useState(initialFilters.heatingType || "all");
  const [hasBalcony, setHasBalcony] = useState(initialFilters.hasBalcony || "all");
  const [hasElevator, setHasElevator] = useState(initialFilters.hasElevator || "all");
  const [isFurnished, setIsFurnished] = useState(initialFilters.isFurnished || "all");
  const [allowsTrade, setAllowsTrade] = useState(initialFilters.allowsTrade || "all");
  const [isEligibleForCredit, setIsEligibleForCredit] = useState(initialFilters.isEligibleForCredit || "all");
  
  // Ticari specific filters
  // Reusing roomCount, heatingType, allowsTrade, isEligibleForCredit from konut
  const [ticariType, setTicariType] = useState(initialFilters.ticariType || "all");
  
  // Arsa specific filters
  const [arsaType, setArsaType] = useState(initialFilters.arsaType || "all");
  const [kaks, setKaks] = useState(initialFilters.kaks || "");
  // Reusing allowsTrade, isEligibleForCredit from konut
  
  // Vasita specific filters
  const [brand, setBrand] = useState(initialFilters.brand || "");
  const [model, setModel] = useState(initialFilters.model || "");
  const [minYear, setMinYear] = useState(initialFilters.minYear || "");
  const [maxYear, setMaxYear] = useState(initialFilters.maxYear || "");
  const [fuelType, setFuelType] = useState(initialFilters.fuelType || "all");
  const [transmission, setTransmission] = useState(initialFilters.transmission || "all");
  const [minKm, setMinKm] = useState(initialFilters.minKm || "");
  const [maxKm, setMaxKm] = useState(initialFilters.maxKm || "");
  const [color, setColor] = useState(initialFilters.color || "");
  const [hasWarranty, setHasWarranty] = useState(initialFilters.hasWarranty || "all");
  const [hasDamageRecord, setHasDamageRecord] = useState(initialFilters.hasDamageRecord || "all");
  // Reusing allowsTrade from konut
  
  // Add debounce timer for input fields
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(initialFilters.minPrice || "");
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(initialFilters.maxPrice || "");
  const [debouncedMinArea, setDebouncedMinArea] = useState(initialFilters.minArea || "");
  const [debouncedMaxArea, setDebouncedMaxArea] = useState(initialFilters.maxArea || "");
  const [debouncedKaks, setDebouncedKaks] = useState(initialFilters.kaks || "");
  const [debouncedBrand, setDebouncedBrand] = useState(initialFilters.brand || "");
  const [debouncedModel, setDebouncedModel] = useState(initialFilters.model || "");

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
    if (!locationsData || !selectedProvince || selectedProvince === 'all') {
      setDistricts([]);
      return;
    }
    
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
    if (!initialFilters.district) {
      setSelectedDistrict("");
      setSelectedNeighborhood("");
    }
  }, [selectedProvince, locationsData, initialFilters.district]);

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
      // Neighborhoods are rendered directly in the component from neighborhoodsByDistrict
    } else if (locationsData && locationsData[province] && locationsData[province][district]) {
      // For other provinces, use the dynamic data
      setNeighborhoods(locationsData[province][district]);
    } else {
      setNeighborhoods([]);
    }
  }, [selectedProvince, selectedDistrict, locationsData]);
  
  // Update neighborhoods based on selected district (for Tokat)
  useEffect(() => {
    if (selectedProvince === 'tokat' && selectedDistrict) {
      // TypeScript için neighborhoodsByDistrict tipini belirtiyoruz
      const neighborhoods = neighborhoodsByDistrict as Record<string, { mahalle: Neighborhood[], koy: Neighborhood[] }>;
      
      // Mahalle ve köy dizilerini birleştiriyoruz
      const districtData = neighborhoods[selectedDistrict.toLowerCase()];
      const combinedNeighborhoods = districtData ? [...districtData.mahalle, ...districtData.koy] : [];
      
      // Reset neighborhood if not in the new list
      if (selectedNeighborhood && !combinedNeighborhoods.some((n: Neighborhood) => n.value === selectedNeighborhood)) {
        setSelectedNeighborhood('');
      }
    }
  }, [selectedDistrict, selectedNeighborhood, selectedProvince]);

  // Format price with dot separators (123.456 -> 123.456)
  const formatPrice = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
  };

  // Remove dot separators for API calls
  const getUnformattedPrice = (price: string): string => {
    return price.replace(/\./g, '');
  };

  // Apply debounce for price inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
    }, 500);
    return () => clearTimeout(timer);
  }, [minPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMaxPrice(maxPrice);
    }, 500);
    return () => clearTimeout(timer);
  }, [maxPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinArea(minArea);
    }, 500);
    return () => clearTimeout(timer);
  }, [minArea]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMaxArea(maxArea);
    }, 500);
    return () => clearTimeout(timer);
  }, [maxArea]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKaks(kaks);
    }, 500);
    return () => clearTimeout(timer);
  }, [kaks]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBrand(brand);
    }, 500);
    return () => clearTimeout(timer);
  }, [brand]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedModel(model);
    }, 500);
    return () => clearTimeout(timer);
  }, [model]);
  
  // Handle province change
  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
  };

  // Format label to capitalize first letter of each word
  const formatLabel = (label: string) => {
    return label
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    // Common filters
    if (minPrice) params.append('minPrice', getUnformattedPrice(minPrice));
    if (maxPrice) params.append('maxPrice', getUnformattedPrice(maxPrice));
    if (minArea) params.append('minArea', minArea);
    if (maxArea) params.append('maxArea', maxArea);
    if (saleStatus) params.append('listingStatus', saleStatus === 'sale' ? 'satilik' : 'kiralik');
    if (selectedProvince && selectedProvince !== 'all') params.append('province', selectedProvince);
    if (selectedDistrict && selectedDistrict !== 'all') params.append('district', selectedDistrict);
    if (selectedNeighborhood && selectedNeighborhood !== 'all') params.append('neighborhood', selectedNeighborhood);
    
    // Ana kategori filtresi (emlak sayfası için)
    if (category === 'emlak' && selectedSubCategory && selectedSubCategory !== 'all') {
      params.append('mainCategory', selectedSubCategory);
    }

    // When on the generic emlak page include every sub-category filter that has a value.
    if (isEmlak) {
      // 1) Alt kategoriye ait filtre parametrelerini ekle
      if (roomCount && roomCount !== 'all') params.append('roomCount', roomCount);
      if (konutType && konutType !== 'all') params.append('konutType', konutType);
      if (heatingType && heatingType !== 'all') params.append('heatingType', heatingType);
      if (hasBalcony === 'true') params.append('hasBalcony', hasBalcony);
      if (hasElevator === 'true') params.append('hasElevator', hasElevator);
      if (isFurnished === 'true') params.append('isFurnished', isFurnished);

      if (ticariType && ticariType !== 'all') params.append('ticariType', ticariType);

      if (arsaType && arsaType !== 'all') params.append('arsaType', arsaType);
      if (kaks) params.append('kaks', kaks);

      if (allowsTrade === 'true') params.append('allowsTrade', allowsTrade);
      if (isEligibleForCredit === 'true') params.append('isEligibleForCredit', isEligibleForCredit);

      // 2) Seçilen filtrelere göre hangi ana kategoriye odaklanıldığını tespit et
      let detectedCategory: 'konut' | 'ticari' | 'arsa' | 'all' = 'all';

      // Konut ile ilgili herhangi bir değer seçiliyse
      if (
        (roomCount && roomCount !== 'all') ||
        (konutType && konutType !== 'all') ||
        (heatingType && heatingType !== 'all') ||
        hasBalcony === 'true' ||
        hasElevator === 'true' ||
        isFurnished === 'true'
      ) {
        detectedCategory = 'konut';
      }

      // Ticari filtreleri konuttan sonra kontrol et (ticariType en belirgin kriter)
      if (detectedCategory === 'all' && ticariType && ticariType !== 'all') {
        detectedCategory = 'ticari';
      }

      // Arsa filtreleri
      if (
        detectedCategory === 'all' &&
        ((arsaType && arsaType !== 'all') || kaks)
      ) {
        detectedCategory = 'arsa';
      }

      // Belirlenen kategori "all" değilse parametreye ekle
      if (detectedCategory !== 'all') {
        params.append('mainCategory', detectedCategory);
      }
    }

    // Konut specific filters
    if ((category === 'konut' || selectedSubCategory === 'konut') && roomCount && roomCount !== 'all') {
      params.append('roomCount', roomCount);
    }

    if ((category === 'konut' || selectedSubCategory === 'konut') && konutType && konutType !== 'all') {
      params.append('konutType', konutType);
    }

    if ((category === 'konut' || selectedSubCategory === 'konut') && heatingType && heatingType !== 'all') {
      params.append('heatingType', heatingType);
    }

    if ((category === 'konut' || selectedSubCategory === 'konut') && hasBalcony === 'true') {
      params.append('hasBalcony', hasBalcony);
    }

    if ((category === 'konut' || selectedSubCategory === 'konut') && hasElevator === 'true') {
      params.append('hasElevator', hasElevator);
    }

    if ((category === 'konut' || selectedSubCategory === 'konut') && isFurnished === 'true') {
      params.append('isFurnished', isFurnished);
    }

    if ((category === 'konut' || selectedSubCategory === 'konut') && allowsTrade === 'true') {
      params.append('allowsTrade', allowsTrade);
    }

    if ((category === 'konut' || selectedSubCategory === 'konut') && isEligibleForCredit === 'true') {
      params.append('isEligibleForCredit', isEligibleForCredit);
    }

    // Ticari specific filters
    if ((category === 'ticari' || selectedSubCategory === 'ticari') && roomCount && roomCount !== 'all') {
      params.append('roomCount', roomCount);
    }

    if ((category === 'ticari' || selectedSubCategory === 'ticari') && ticariType && ticariType !== 'all') {
      params.append('ticariType', ticariType);
    }

    if ((category === 'ticari' || selectedSubCategory === 'ticari') && heatingType && heatingType !== 'all') {
      params.append('heatingType', heatingType);
    }

    if ((category === 'ticari' || selectedSubCategory === 'ticari') && allowsTrade === 'true') {
      params.append('allowsTrade', allowsTrade);
    }

    if ((category === 'ticari' || selectedSubCategory === 'ticari') && isEligibleForCredit === 'true') {
      params.append('isEligibleForCredit', isEligibleForCredit);
    }

    // Arsa specific filters
    if ((category === 'arsa' || selectedSubCategory === 'arsa') && arsaType && arsaType !== 'all') {
      params.append('arsaType', arsaType);
    }

    if ((category === 'arsa' || selectedSubCategory === 'arsa') && kaks) {
      params.append('kaks', kaks);
    }

    if ((category === 'arsa' || selectedSubCategory === 'arsa') && allowsTrade === 'true') {
      params.append('allowsTrade', allowsTrade);
    }

    if ((category === 'arsa' || selectedSubCategory === 'arsa') && isEligibleForCredit === 'true') {
      params.append('isEligibleForCredit', isEligibleForCredit);
    }

    // Vasita specific filters
    if (category === 'vasita' && brand) {
      params.append('brand', brand);
    }

    if (category === 'vasita' && model) {
      params.append('model', model);
    }

    if (category === 'vasita' && minYear) {
      params.append('minYear', minYear);
    }

    if (category === 'vasita' && maxYear) {
      params.append('maxYear', maxYear);
    }

    if (category === 'vasita' && fuelType && fuelType !== 'all') {
      params.append('fuelType', fuelType);
    }

    if (category === 'vasita' && transmission && transmission !== 'all') {
      params.append('transmission', transmission);
    }

    if (category === 'vasita' && minKm) {
      params.append('minKm', minKm);
    }

    if (category === 'vasita' && maxKm) {
      params.append('maxKm', maxKm);
    }

    if (category === 'vasita' && color) {
      params.append('color', color);
    }

    if (category === 'vasita' && hasWarranty === 'true') {
      params.append('hasWarranty', hasWarranty);
    }

    if (category === 'vasita' && hasDamageRecord === 'true') {
      params.append('hasDamageRecord', hasDamageRecord);
    }

    if (category === 'vasita' && allowsTrade === 'true') {
      params.append('allowsTrade', allowsTrade);
    }

    // Convert current page to category page with filters
    let path = '';
    
    if (category === 'emlak') {
      if (selectedSubCategory && selectedSubCategory !== 'all') {
        path = `/ilanlar/${selectedSubCategory}`;
      } else {
        path = '/ilanlar/emlak';
      }
    } else {
      path = `/ilanlar/${category}`;
    }
    
    router.push(`${path}?${params.toString()}`);
  };

  // Handle input change for price with formatting
  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const input = e.target;
    const cursorPos = input.selectionStart || 0;
    const prevValue = input.value;
    
    // Format value
    const formatted = formatPrice(input.value);
    setter(formatted);
    
    // Restore cursor position
    setTimeout(() => {
      const prevDots = (prevValue.substring(0, cursorPos).match(/\./g) || []).length;
      const newDots = (formatted.substring(0, cursorPos).match(/\./g) || []).length;
      input.setSelectionRange(cursorPos + (newDots - prevDots), cursorPos + (newDots - prevDots));
    }, 0);
  };

  // Auto-apply filters when select values change
  useEffect(() => {
    // Don't apply filters on initial render
    const isInitialRender = 
      (saleStatus === (initialFilters.listingStatus ? (initialFilters.listingStatus === "kiralik" ? "rent" : "sale") : "")) &&
      (selectedProvince === (initialFilters.province || "all")) &&
      (selectedDistrict === (initialFilters.district || "")) &&
      (selectedNeighborhood === (initialFilters.neighborhood || "")) &&
      (mainCategory === (initialFilters.mainCategory || "all")) &&
      (selectedSubCategory === (initialFilters.mainCategory || "all")) &&
      (roomCount === (initialFilters.roomCount || "all")) &&
      (konutType === (initialFilters.konutType || "all")) &&
      (heatingType === (initialFilters.heatingType || "all")) &&
      (hasBalcony === (initialFilters.hasBalcony || "all")) &&
      (hasElevator === (initialFilters.hasElevator || "all")) &&
      (isFurnished === (initialFilters.isFurnished || "all")) &&
      (allowsTrade === (initialFilters.allowsTrade || "all")) &&
      (isEligibleForCredit === (initialFilters.isEligibleForCredit || "all")) &&
      (ticariType === (initialFilters.ticariType || "all")) &&
      (arsaType === (initialFilters.arsaType || "all")) &&
      (fuelType === (initialFilters.fuelType || "all")) &&
      (transmission === (initialFilters.transmission || "all")) &&
      (hasWarranty === (initialFilters.hasWarranty || "all")) &&
      (hasDamageRecord === (initialFilters.hasDamageRecord || "all"));
    
    if (!isInitialRender) {
      applyFilters();
    }
  }, [
    saleStatus,
    selectedProvince,
    selectedDistrict, 
    selectedNeighborhood, 
    mainCategory, 
    selectedSubCategory,
    roomCount,
    konutType,
    heatingType,
    hasBalcony,
    hasElevator,
    isFurnished,
    allowsTrade,
    isEligibleForCredit,
    ticariType,
    arsaType,
    fuelType,
    transmission,
    hasWarranty,
    hasDamageRecord
  ]);

  // Auto-apply filters when debounced values change
  useEffect(() => {
    // Don't apply on initial render
    const isInitialRender =
      (debouncedMinPrice === (initialFilters.minPrice || "")) &&
      (debouncedMaxPrice === (initialFilters.maxPrice || "")) &&
      (debouncedMinArea === (initialFilters.minArea || "")) &&
      (debouncedMaxArea === (initialFilters.maxArea || "")) &&
      (debouncedKaks === (initialFilters.kaks || "")) &&
      (debouncedBrand === (initialFilters.brand || "")) &&
      (debouncedModel === (initialFilters.model || ""));
    
    if (!isInitialRender) {
      applyFilters();
    }
  }, [
    debouncedMinPrice,
    debouncedMaxPrice,
    debouncedMinArea,
    debouncedMaxArea,
    debouncedKaks,
    debouncedBrand,
    debouncedModel
  ]);
  
  // Reset filters
  const resetFilters = () => {
    // Tüm filtre alanlarını sıfırlıyoruz
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
    setSaleStatus("");
    setSelectedProvince("all"); // Reset province to 'Tümü'
    setSelectedDistrict("");
    setSelectedNeighborhood("");
    setMainCategory("all");
    setSelectedSubCategory("all");
    setRoomCount("all");
    setKonutType("all");
    setHeatingType("all");
    setHasBalcony("all");
    setHasElevator("all");
    setIsFurnished("all");
    setAllowsTrade("all");
    setIsEligibleForCredit("all");
    setTicariType("all");
    setArsaType("all");
    setKaks("");
    setBrand("");
    setModel("");
    setMinYear("");
    setMaxYear("");
    setFuelType("all");
    setTransmission("all");
    setMinKm("");
    setMaxKm("");
    setColor("");
    setHasWarranty("all");
    setHasDamageRecord("all");
    
    // Reset debounced values
    setDebouncedMinPrice("");
    setDebouncedMaxPrice("");
    setDebouncedMinArea("");
    setDebouncedMaxArea("");
    setDebouncedKaks("");
    setDebouncedBrand("");
    setDebouncedModel("");
    
    // Sayfayı yeniliyoruz
    router.push(`/ilanlar/${category}`);
  };
  
  return (
    <div className="sticky top-24 bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <h3 className="font-headings text-lg font-semibold mb-5 border-b pb-3">Filtrele</h3>
      
      <div className="space-y-5">
        {/* Location Filters – moved to top */}
        <div>
          <Label className="text-sm font-medium block mb-2">İl</Label>
          <Select value={selectedProvince} onValueChange={handleProvinceChange}>
            <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
              <SelectValue placeholder="İl" />
            </SelectTrigger>
            <SelectContent sideOffset={4} className="rounded-xl border border-gray-200 max-h-[200px] overflow-y-auto">
              <SelectItem value="all">Tümü</SelectItem>
              {provinces.map((province) => (
                <SelectItem key={province.toLowerCase()} value={province.toLowerCase()}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProvince && (
          <div>
            <Label className="text-sm font-medium block mb-2">İlçe</Label>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="İlçe Seçin" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="all">Tümü</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district.toLowerCase()} value={district.toLowerCase()}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedDistrict && selectedDistrict !== 'all' && (
          <div>
            <Label className="text-sm font-medium block mb-2">Mahalle/Köy</Label>
            <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
              <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Mahalle/Köy Seçin" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] sm:max-h-[250px] md:max-h-[300px]">
                <SelectItem value="all">Tümü</SelectItem>
                {selectedProvince === 'tokat' ? (
                  (() => {
                    const neighborhoods = neighborhoodsByDistrict as Record<string, { mahalle: Neighborhood[]; koy: Neighborhood[] }>;
                    const districtData = neighborhoods[selectedDistrict.toLowerCase()];
                    return (
                      <> 
                        {districtData?.mahalle && districtData.mahalle.length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-sm font-semibold bg-yellow-100 text-yellow-800">Mahalleler</div>
                            {districtData.mahalle.map((neighborhood: Neighborhood) => (
                              <SelectItem key={neighborhood.value} value={neighborhood.value}>
                                {formatLabel(neighborhood.label)}
                              </SelectItem>
                            ))}
                          </>
                        )}
                        {districtData?.koy && districtData.koy.length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-sm font-semibold bg-yellow-100 text-yellow-800 mt-1">Köyler</div>
                            {districtData.koy.map((koy: Neighborhood) => (
                              <SelectItem key={koy.value} value={koy.value}>
                                {formatLabel(koy.label)}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </>
                    );
                  })()
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
        )}
        
        {/* Ana Kategori – hidden on the main Emlak page (all filters will be shown together) */}
        {false && (
          <div>
            <Label className="text-sm font-medium block mb-2">Kategori</Label>
            <Select 
              value={selectedSubCategory} 
              onValueChange={(value) => {
                setSelectedSubCategory(value);
                setMainCategory(value);
              }}
            >
              <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="konut">Konut</SelectItem>
                <SelectItem value="ticari">Ticari</SelectItem>
                <SelectItem value="arsa">Arsa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium block mb-2">Fiyat Aralığı</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Min TL" 
                value={minPrice}
                onChange={(e) => handlePriceInput(e, setMinPrice)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Max TL" 
                value={maxPrice}
                onChange={(e) => handlePriceInput(e, setMaxPrice)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
        
        {/* Area Range - Not for Vasita */}
        {category !== 'vasita' && (
          <div>
            <Label className="text-sm font-medium block mb-2">Alan (m²)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Min m²" 
                  value={minArea}
                  onChange={(e) => setMinArea(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Max m²" 
                  value={maxArea}
                  onChange={(e) => setMaxArea(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Listing Status - Not for Vasita */}
        {category !== 'vasita' && (
          <div>
            <Label className="text-sm font-medium block mb-2">İlan Durumu</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSaleStatus('sale')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${saleStatus === 'sale' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Satılık
              </button>
              <button
                onClick={() => setSaleStatus('rent')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${saleStatus === 'rent' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Kiralık
              </button>
            </div>
          </div>
        )}
        
        {/* Room Count - Only for Konut and Ticari */}
        {(category === 'konut' || category === 'ticari' || isEmlak) && (
          <div>
            <Label className="text-sm font-medium block mb-2">Oda Sayısı</Label>
            <Select value={roomCount} onValueChange={setRoomCount}>
              <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {(category === 'konut' || isEmlak) ? (
                  <>
                    <SelectItem value="1+0">1+0</SelectItem>
                    <SelectItem value="1+1">1+1</SelectItem>
                    <SelectItem value="1+1.5">1+1.5</SelectItem>
                    <SelectItem value="2+1">2+1</SelectItem>
                    <SelectItem value="3+1">3+1</SelectItem>
                    <SelectItem value="4+1">4+1</SelectItem>
                    <SelectItem value="5+1">5+1</SelectItem>
                    <SelectItem value="5+2">5+2</SelectItem>
                    <SelectItem value="6+1">6+1</SelectItem>
                    <SelectItem value="6+2">6+2</SelectItem>
                    <SelectItem value="7+1">7+1</SelectItem>
                    <SelectItem value="7+2">7+2</SelectItem>
                    <SelectItem value="8+1">8+1</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="9">9</SelectItem>
                    <SelectItem value="10+">10+</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Konut Type - Only for Konut */}
        {(category === 'konut' || isEmlak) && (
          <div>
            <Label className="text-sm font-medium block mb-2">Konut Tipi</Label>
            <Select value={konutType} onValueChange={setKonutType}>
              <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="daire">Daire</SelectItem>
                <SelectItem value="mustakil_ev">Müstakil Ev</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="bina">Bina</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Heating Type - For Konut and Ticari */}
        {(category === 'konut' || category === 'ticari' || isEmlak) && (
          <div>
            <Label className="text-sm font-medium block mb-2">Isıtma Tipi</Label>
            <Select value={heatingType} onValueChange={setHeatingType}>
              <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="dogalgaz">Doğalgaz</SelectItem>
                <SelectItem value="soba">Soba</SelectItem>
                <SelectItem value="merkezi">Merkezi</SelectItem>
                <SelectItem value="klima">Klima</SelectItem>
                <SelectItem value="yok">Isıtma Yok</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Ticari Type - Only for Ticari */}
        {(category === 'ticari' || isEmlak) && (
          <div>
            <Label className="text-sm font-medium block mb-2">İşyeri Tipi</Label>
            <Select value={ticariType} onValueChange={setTicariType}>
              <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="dukkan">Dükkan</SelectItem>
                <SelectItem value="depo">Depo</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="fabrika">Fabrika</SelectItem>
                <SelectItem value="atolye">Atölye</SelectItem>
                <SelectItem value="plaza">Plaza</SelectItem>
                <SelectItem value="bina">Bina</SelectItem>
                <SelectItem value="ofis">Ofis</SelectItem>
                <SelectItem value="cafe">Cafe</SelectItem>
                <SelectItem value="bufe">Büfe</SelectItem>
                <SelectItem value="otobus_hatti">Otobüs Hattı</SelectItem>
                <SelectItem value="taksi_hatti">Taksi Hattı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Arsa Type - Only for Arsa */}
        {(category === 'arsa' || isEmlak) && (
          <>
            <div>
              <Label className="text-sm font-medium block mb-2">Arsa Tipi</Label>
              <Select value={arsaType} onValueChange={setArsaType}>
                <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="tarla">Tarla</SelectItem>
                  <SelectItem value="bahce">Bahçe</SelectItem>
                  <SelectItem value="konut_imarli">Konut İmarlı</SelectItem>
                  <SelectItem value="ticari_imarli">Ticari İmarlı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium block mb-2">KAKS/Emsal</Label>
              <Input 
                type="text" 
                placeholder="KAKS/Emsal Değeri" 
                value={kaks}
                onChange={(e) => setKaks(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </>
        )}
        
        {/* Additional Vasita Features */}
        {category === 'vasita' && (
          <>
            {/* Brand */}
            <div>
              <Label className="text-sm font-medium block mb-2">Marka</Label>
              <Input 
                type="text" 
                placeholder="Marka" 
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            
            {/* Model */}
            <div>
              <Label className="text-sm font-medium block mb-2">Model</Label>
              <Input 
                type="text" 
                placeholder="Model" 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            
            {/* Year Range */}
            <div>
              <Label className="text-sm font-medium block mb-2">Model Yılı</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  type="text" 
                  placeholder="Min Yıl" 
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <Input 
                  type="text" 
                  placeholder="Max Yıl" 
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            
            {/* Kilometer Range */}
            <div>
              <Label className="text-sm font-medium block mb-2">Kilometre</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  type="text" 
                  placeholder="Min KM" 
                  value={minKm}
                  onChange={(e) => setMinKm(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <Input 
                  type="text" 
                  placeholder="Max KM" 
                  value={maxKm}
                  onChange={(e) => setMaxKm(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            
            {/* Fuel Type */}
            <div>
              <Label className="text-sm font-medium block mb-2">Yakıt Tipi</Label>
              <Select value={fuelType} onValueChange={setFuelType}>
                <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="benzin">Benzin</SelectItem>
                  <SelectItem value="dizel">Dizel</SelectItem>
                  <SelectItem value="lpg">LPG</SelectItem>
                  <SelectItem value="hibrit">Hibrit</SelectItem>
                  <SelectItem value="elektrik">Elektrik</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Transmission */}
            <div>
              <Label className="text-sm font-medium block mb-2">Vites</Label>
              <Select value={transmission} onValueChange={setTransmission}>
                <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="manuel">Manuel</SelectItem>
                  <SelectItem value="otomatik">Otomatik</SelectItem>
                  <SelectItem value="yarı otomatik">Yarı Otomatik</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Color */}
            <div>
              <Label className="text-sm font-medium block mb-2">Renk</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Renk Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="beyaz">Beyaz</SelectItem>
                  <SelectItem value="siyah">Siyah</SelectItem>
                  <SelectItem value="gri">Gri</SelectItem>
                  <SelectItem value="gümüş">Gümüş</SelectItem>
                  <SelectItem value="kırmızı">Kırmızı</SelectItem>
                  <SelectItem value="mavi">Mavi</SelectItem>
                  <SelectItem value="yeşil">Yeşil</SelectItem>
                  <SelectItem value="sarı">Sarı</SelectItem>
                  <SelectItem value="turuncu">Turuncu</SelectItem>
                  <SelectItem value="kahverengi">Kahverengi</SelectItem>
                  <SelectItem value="bordo">Bordo</SelectItem>
                  <SelectItem value="lacivert">Lacivert</SelectItem>
                  <SelectItem value="mor">Mor</SelectItem>
                  <SelectItem value="bej">Bej</SelectItem>
                  <SelectItem value="altın">Altın</SelectItem>
                  <SelectItem value="diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium block mb-2">Özellikler</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                     onClick={() => setHasWarranty(hasWarranty === 'true' ? 'all' : 'true')}>
                  <div className="flex items-center justify-center">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${hasWarranty === 'true' ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                      {hasWarranty === 'true' && <Check className="h-3 w-3 text-white stroke-[3]" />}
                    </div>
                  </div>
                  <Label className="font-medium cursor-pointer flex-1">
                    Garanti
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                     onClick={() => setHasDamageRecord(hasDamageRecord === 'true' ? 'all' : 'true')}>
                  <div className="flex items-center justify-center">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${hasDamageRecord === 'true' ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                      {hasDamageRecord === 'true' && <Check className="h-3 w-3 text-white stroke-[3]" />}
                    </div>
                  </div>
                  <Label className="font-medium cursor-pointer flex-1">
                    Hasar Kaydı
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                     onClick={() => setAllowsTrade(allowsTrade === 'true' ? 'all' : 'true')}>
                  <div className="flex items-center justify-center">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${allowsTrade === 'true' ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                      {allowsTrade === 'true' && <Check className="h-3 w-3 text-white stroke-[3]" />}
                    </div>
                  </div>
                  <Label className="font-medium cursor-pointer flex-1">
                    Takas
                  </Label>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Additional Konut Features – moved here */}
        {(category === 'konut' || isEmlak) && (
          <div>
            <Label className="text-sm font-medium block mb-2">Özellikler</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                   onClick={() => setHasBalcony(hasBalcony === 'true' ? 'false' : 'true')}>
                <div className="flex items-center justify-center">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${hasBalcony === 'true' ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                    {hasBalcony === 'true' && <Check className="h-3 w-3 text-white stroke-[3]" />}
                  </div>
                </div>
                <Label className="font-medium cursor-pointer flex-1">
                  Balkon
                </Label>
              </div>

              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                   onClick={() => setHasElevator(hasElevator === 'true' ? 'false' : 'true')}>
                <div className="flex items-center justify-center">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${hasElevator === 'true' ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                    {hasElevator === 'true' && <Check className="h-3 w-3 text-white stroke-[3]" />}
                  </div>
                </div>
                <Label className="font-medium cursor-pointer flex-1">
                  Asansör
                </Label>
              </div>

              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                   onClick={() => setIsFurnished(isFurnished === 'true' ? 'false' : 'true')}>
                <div className="flex items-center justify-center">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${isFurnished === 'true' ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                    {isFurnished === 'true' && <Check className="h-3 w-3 text-white stroke-[3]" />}
                  </div>
                </div>
                <Label className="font-medium cursor-pointer flex-1">
                  Eşyalı
                </Label>
              </div>
            </div>
          </div>
        )}
        
        {/* Common Features for Konut, Ticari, Arsa */}
        {(category === 'konut' || category === 'ticari' || category === 'arsa' || isEmlak) && (
          <div>
            <Label className="text-sm font-medium block mb-2">Diğer Özellikler</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                   onClick={() => setAllowsTrade(allowsTrade === 'true' ? 'all' : 'true')}>
                <div className="flex items-center justify-center">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${allowsTrade === 'true' ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                    {allowsTrade === 'true' && <Check className="h-3 w-3 text-white stroke-[3]" />}
                  </div>
                </div>
                <Label className="font-medium cursor-pointer flex-1">
                  Takas
                </Label>
              </div>
              
              {(category === 'konut' || category === 'ticari' || category === 'arsa' || isEmlak) && (
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                     onClick={() => setIsEligibleForCredit(isEligibleForCredit === 'true' ? 'false' : 'true')}>
                  <div className="flex items-center justify-center">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isEligibleForCredit === 'true' ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                      {isEligibleForCredit === 'true' && <Check className="h-3 w-3 text-white stroke-[3]" />}
                    </div>
                  </div>
                  <Label className="font-medium cursor-pointer flex-1">
                    Krediye Uygun
                  </Label>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Filter Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Button 
            variant="outline" 
            onClick={resetFilters}
            className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            Filtreleri Temizle
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter; 