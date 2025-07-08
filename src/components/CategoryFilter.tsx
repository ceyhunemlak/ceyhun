"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowRight } from "lucide-react";
import neighborhoodsByDistrict from "@/lib/neighborhoods";

// Define the neighborhood type
interface Neighborhood {
  value: string;
  label: string;
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
    district?: string;
    neighborhood?: string;
    roomCount?: string;
    konutType?: string;
    vasitaType?: string;
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
  const [selectedDistrict, setSelectedDistrict] = useState(initialFilters.district || "");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(initialFilters.neighborhood || "");
  const [mainCategory, setMainCategory] = useState(initialFilters.mainCategory || "all");
  
  // For dynamic filter display in emlak category
  const [selectedSubCategory, setSelectedSubCategory] = useState(initialFilters.mainCategory || "all");
  
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
  const [ticariType, setTicariType] = useState(initialFilters.konutType || "all");
  
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
  
  // Available neighborhoods based on selected district
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  
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
  
  // Handle max price input changes
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorPosition = input.selectionStart || 0;
    const previousValue = maxPrice;
    const formattedValue = formatPrice(input.value);
    
    setMaxPrice(formattedValue);
    
    // Calculate new cursor position
    setTimeout(() => {
      const previousDots = (previousValue.substring(0, cursorPosition).match(/\./g) || []).length;
      const newDots = (formattedValue.substring(0, cursorPosition).match(/\./g) || []).length;
      const newPosition = cursorPosition + (newDots - previousDots);
      input.setSelectionRange(newPosition, newPosition);
    }, 0);
  };
  
  // Get unformatted price (remove dots)
  const getUnformattedPrice = (price: string): string => {
    return price.replace(/\./g, '');
  };
  
  // Update neighborhoods when district changes
  useEffect(() => {
    if (selectedDistrict) {
      // TypeScript için neighborhoodsByDistrict tipini belirtiyoruz
      const neighborhoods = neighborhoodsByDistrict as Record<string, { mahalle: Neighborhood[], koy: Neighborhood[] }>;
      
      // Mahalle ve köy dizilerini birleştiriyoruz
      const districtData = neighborhoods[selectedDistrict];
      const combinedNeighborhoods = districtData ? [...districtData.mahalle, ...districtData.koy] : [];
      
      setNeighborhoods(combinedNeighborhoods);
      
      // Reset neighborhood if not in the new list
      if (selectedNeighborhood && !combinedNeighborhoods.some((n: Neighborhood) => n.value === selectedNeighborhood)) {
        setSelectedNeighborhood('');
      }
    } else {
      setNeighborhoods([]);
      setSelectedNeighborhood('');
    }
  }, [selectedDistrict]);
  
  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    // Common filters
    if (minPrice) params.append('minPrice', getUnformattedPrice(minPrice));
    if (maxPrice) params.append('maxPrice', getUnformattedPrice(maxPrice));
    if (minArea) params.append('minArea', minArea);
    if (maxArea) params.append('maxArea', maxArea);
    if (saleStatus) params.append('listingStatus', saleStatus === 'sale' ? 'satilik' : 'kiralik');
    if (selectedDistrict && selectedDistrict !== 'all') params.append('district', selectedDistrict);
    if (selectedNeighborhood && selectedNeighborhood !== 'all') params.append('neighborhood', selectedNeighborhood);
    
    // Ana kategori filtresi (emlak sayfası için)
    if (category === 'emlak' && selectedSubCategory && selectedSubCategory !== 'all') {
      params.append('mainCategory', selectedSubCategory);
    }
    
    // Category specific filters
    if (category === 'konut' || (category === 'emlak' && selectedSubCategory === 'konut')) {
      if (roomCount && roomCount !== 'all') params.append('roomCount', roomCount);
      if (konutType && konutType !== 'all') params.append('konutType', konutType);
      if (heatingType && heatingType !== 'all') params.append('heatingType', heatingType);
      if (hasBalcony && hasBalcony !== 'all') params.append('hasBalcony', hasBalcony);
      if (hasElevator && hasElevator !== 'all') params.append('hasElevator', hasElevator);
      if (isFurnished && isFurnished !== 'all') params.append('isFurnished', isFurnished);
      if (allowsTrade && allowsTrade !== 'all') params.append('allowsTrade', allowsTrade);
      if (isEligibleForCredit && isEligibleForCredit !== 'all') params.append('isEligibleForCredit', isEligibleForCredit);
    } else if (category === 'ticari' || (category === 'emlak' && selectedSubCategory === 'ticari')) {
      if (roomCount && roomCount !== 'all') params.append('roomCount', roomCount);
      if (ticariType && ticariType !== 'all') params.append('ticariType', ticariType);
      if (heatingType && heatingType !== 'all') params.append('heatingType', heatingType);
      if (allowsTrade && allowsTrade !== 'all') params.append('allowsTrade', allowsTrade);
      if (isEligibleForCredit && isEligibleForCredit !== 'all') params.append('isEligibleForCredit', isEligibleForCredit);
    } else if (category === 'arsa' || (category === 'emlak' && selectedSubCategory === 'arsa')) {
      if (arsaType && arsaType !== 'all') params.append('arsaType', arsaType);
      if (kaks) params.append('kaks', kaks);
      if (allowsTrade && allowsTrade !== 'all') params.append('allowsTrade', allowsTrade);
      if (isEligibleForCredit && isEligibleForCredit !== 'all') params.append('isEligibleForCredit', isEligibleForCredit);
    } else if (category === 'vasita') {
      if (brand) params.append('brand', brand);
      if (model) params.append('model', model);
      if (minYear) params.append('minYear', minYear);
      if (maxYear) params.append('maxYear', maxYear);
      if (fuelType && fuelType !== 'all') params.append('fuelType', fuelType);
      if (transmission && transmission !== 'all') params.append('transmission', transmission);
      if (minKm) params.append('minKm', minKm);
      if (maxKm) params.append('maxKm', maxKm);
      if (color) params.append('color', color);
      if (hasWarranty && hasWarranty !== 'all') params.append('hasWarranty', hasWarranty);
      if (hasDamageRecord && hasDamageRecord !== 'all') params.append('hasDamageRecord', hasDamageRecord);
      if (allowsTrade && allowsTrade !== 'all') params.append('allowsTrade', allowsTrade);
    }
    
    router.push(`/ilanlar/${category}?${params.toString()}`);
  };
  
  // Reset filters
  const resetFilters = () => {
    // Tüm filtre alanlarını sıfırlıyoruz
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
    setSaleStatus("");
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
    
    // Sayfayı yeniliyoruz
    router.push(`/ilanlar/${category}`);
  };
  
  // Format label text with first letter capitalized
  const formatLabel = (label: string) => {
    return label
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  return (
    <div className="sticky top-24 bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <h3 className="font-headings text-lg font-semibold mb-5 border-b pb-3">Filtrele</h3>
      
      <div className="space-y-5">
        {/* Ana Kategori - Only for Emlak */}
        {category === 'emlak' && (
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
                onChange={handleMinPriceChange}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Max TL" 
                value={maxPrice}
                onChange={handleMaxPriceChange}
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
        {(category === 'konut' || category === 'ticari' || (category === 'emlak' && (selectedSubCategory === 'konut' || selectedSubCategory === 'ticari'))) && (
          <div>
            <Label className="text-sm font-medium block mb-2">Oda Sayısı</Label>
            <Select value={roomCount} onValueChange={setRoomCount}>
              <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {(category === 'konut' || (category === 'emlak' && selectedSubCategory === 'konut')) ? (
                  <>
                    <SelectItem value="1+0">1+0</SelectItem>
                    <SelectItem value="1+1">1+1</SelectItem>
                    <SelectItem value="2+1">2+1</SelectItem>
                    <SelectItem value="3+1">3+1</SelectItem>
                    <SelectItem value="4+1">4+1</SelectItem>
                    <SelectItem value="5+1">5+1</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Konut Type - Only for Konut */}
        {(category === 'konut' || (category === 'emlak' && selectedSubCategory === 'konut')) && (
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
        {(category === 'konut' || category === 'ticari' || (category === 'emlak' && (selectedSubCategory === 'konut' || selectedSubCategory === 'ticari'))) && (
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
                <SelectItem value="yok">Isıtma Yok</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Additional Konut Features */}
        {(category === 'konut' || (category === 'emlak' && selectedSubCategory === 'konut')) && (
          <>
            <div>
              <Label className="text-sm font-medium block mb-2">Özellikler</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Balkon</span>
                  <Select value={hasBalcony} onValueChange={setHasBalcony}>
                    <SelectTrigger className="w-24 px-2 py-1 border border-gray-200 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Farketmez</SelectItem>
                      <SelectItem value="true">Var</SelectItem>
                      <SelectItem value="false">Yok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Asansör</span>
                  <Select value={hasElevator} onValueChange={setHasElevator}>
                    <SelectTrigger className="w-24 px-2 py-1 border border-gray-200 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Farketmez</SelectItem>
                      <SelectItem value="true">Var</SelectItem>
                      <SelectItem value="false">Yok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Eşyalı</span>
                  <Select value={isFurnished} onValueChange={setIsFurnished}>
                    <SelectTrigger className="w-24 px-2 py-1 border border-gray-200 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Farketmez</SelectItem>
                      <SelectItem value="true">Evet</SelectItem>
                      <SelectItem value="false">Hayır</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Ticari Type - Only for Ticari */}
        {(category === 'ticari' || (category === 'emlak' && selectedSubCategory === 'ticari')) && (
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
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Arsa Type - Only for Arsa */}
        {(category === 'arsa' || (category === 'emlak' && selectedSubCategory === 'arsa')) && (
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
                <div className="flex items-center justify-between">
                  <span className="text-sm">Garanti</span>
                  <Select value={hasWarranty} onValueChange={setHasWarranty}>
                    <SelectTrigger className="w-24 px-2 py-1 border border-gray-200 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Farketmez</SelectItem>
                      <SelectItem value="true">Var</SelectItem>
                      <SelectItem value="false">Yok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hasar Kaydı</span>
                  <Select value={hasDamageRecord} onValueChange={setHasDamageRecord}>
                    <SelectTrigger className="w-24 px-2 py-1 border border-gray-200 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Farketmez</SelectItem>
                      <SelectItem value="true">Var</SelectItem>
                      <SelectItem value="false">Yok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Takas</span>
                  <Select value={allowsTrade} onValueChange={setAllowsTrade}>
                    <SelectTrigger className="w-24 px-2 py-1 border border-gray-200 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Farketmez</SelectItem>
                      <SelectItem value="true">Var</SelectItem>
                      <SelectItem value="false">Yok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Common Features for Konut, Ticari, Arsa */}
        {(category === 'konut' || category === 'ticari' || category === 'arsa' || 
          (category === 'emlak' && (selectedSubCategory === 'konut' || selectedSubCategory === 'ticari' || selectedSubCategory === 'arsa'))) && (
          <div>
            <Label className="text-sm font-medium block mb-2">Diğer Özellikler</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Takas</span>
                <Select value={allowsTrade} onValueChange={setAllowsTrade}>
                  <SelectTrigger className="w-24 px-2 py-1 border border-gray-200 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Farketmez</SelectItem>
                    <SelectItem value="true">Var</SelectItem>
                    <SelectItem value="false">Yok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(category === 'konut' || category === 'ticari' || category === 'arsa' || 
                (category === 'emlak' && (selectedSubCategory === 'konut' || selectedSubCategory === 'ticari' || selectedSubCategory === 'arsa'))) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Krediye Uygun</span>
                  <Select value={isEligibleForCredit} onValueChange={setIsEligibleForCredit}>
                    <SelectTrigger className="w-24 px-2 py-1 border border-gray-200 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Farketmez</SelectItem>
                      <SelectItem value="true">Evet</SelectItem>
                      <SelectItem value="false">Hayır</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* District and Neighborhood */}
        <div>
          <Label className="text-sm font-medium block mb-2">İlçe</Label>
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
              <SelectValue placeholder="İlçe Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
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
        
        {selectedDistrict && selectedDistrict !== 'all' && (
          <div>
            <Label className="text-sm font-medium block mb-2">Mahalle/Köy</Label>
            <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
              <SelectTrigger className="px-3 py-2 border border-gray-200 rounded-md text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Mahalle/Köy Seçin" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] sm:max-h-[250px] md:max-h-[300px]">
                <SelectItem value="all">Tümü</SelectItem>
                {selectedDistrict && (
                  <>
                    {/* Mahalle başlığı ve listesi */}
                    {(() => {
                      // TypeScript için neighborhoodsByDistrict tipini belirtiyoruz
                      const neighborhoods = neighborhoodsByDistrict as Record<string, { mahalle: Neighborhood[], koy: Neighborhood[] }>;
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
                          
                          {/* Köy başlığı ve listesi */}
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
                    })()}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Filter Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Button 
            onClick={applyFilters}
            className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2 font-medium"
          >
            <Search size={16} />
            Uygula
          </Button>
          
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