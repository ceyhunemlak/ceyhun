"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface KonutFormProps {
  formData: any;
  updateFormData: (data: any) => void;
  listingType: string; // "satilik" or "kiralik"
  propertyType?: string; // "daire", "villa", "mustakil_ev", "bina"
}

export default function KonutForm({ formData, updateFormData, listingType, propertyType }: KonutFormProps) {
  const [form, setForm] = useState({
    title: formData.title || "",
    description: formData.description || "",
    price: formData.price || "",
    grossArea: formData.grossArea || "",
    netArea: formData.netArea || "",
    roomCount: formData.roomCount || "",
    buildingAge: formData.buildingAge || "",
    floor: formData.floor || "0", // Varsayılan değer olarak "0" ekle
    totalFloors: formData.totalFloors || "",
    heating: formData.heating || null, // null olarak ayarla
    hasBalcony: formData.hasBalcony || false,
    hasElevator: formData.hasElevator || false,
    isFurnished: formData.isFurnished || false,
    isExchangeable: formData.isExchangeable || false,
    isSuitableForCredit: formData.isSuitableForCredit || false,
    inSite: formData.inSite || false, // Site içerisinde özelliği eklendi
    apartmentsPerFloor: formData.apartmentsPerFloor || "", // Bir kattaki daire sayısı
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [displayPrice, setDisplayPrice] = useState(form.price ? formatPrice(form.price) : "");

  // Set floor to "zemin" for villa or müstakil ev
  useEffect(() => {
    if (propertyType === "villa" || propertyType === "mustakil_ev") {
      if (form.floor !== "zemin") {
        const updatedForm = { ...form, floor: "zemin" };
        setForm(updatedForm);
        updateFormData(updatedForm);
      }
    }
  }, [propertyType]); // Only run when propertyType changes

  const handleChange = (field: string, value: any) => {
    // Convert title to uppercase when it's being entered
    const processedValue = field === "title" ? value.toUpperCase() : value;
    const updatedForm = { ...form, [field]: processedValue };
    
    // Update display price when price changes
    if (field === "price") {
      setDisplayPrice(value ? formatPrice(value) : "");
    }
    
    setForm(updatedForm);
    setTouched({ ...touched, [field]: true });
    updateFormData(updatedForm);
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const isFieldInvalid = (field: string): boolean => {
    if (!touched[field]) return false;
    
    // For Prefabrik, only validate title, description and price
if (propertyType === "Prefabrik") {
      switch (field) {
        case "title":
          return !form.title;
        case "description":
          return !form.description;
        case "price":
          return !form.price;
        default:
          return false;
      }
    }
    
    // For other property types, validate all required fields
    switch (field) {
      case "title":
        return !form.title;
      case "description":
        return !form.description;
      case "price":
        return !form.price;
      case "grossArea":
        return !form.grossArea;
      case "netArea":
        return !form.netArea;
      case "roomCount":
        // Don't validate room count if property type is bina
        if (propertyType === "bina") {
          return false;
        }
        return !form.roomCount;
      case "buildingAge":
        return !form.buildingAge;
      case "floor":
        // Don't validate floor if property type is villa, mustakil_ev, or bina
        if (propertyType === "villa" || propertyType === "mustakil_ev" || propertyType === "bina") {
          return false;
        }
        return !form.floor;
      case "totalFloors":
        return !form.totalFloors;
      case "apartmentsPerFloor":
        // Only validate apartments per floor if property type is bina
        if (propertyType === "bina") {
          return !form.apartmentsPerFloor;
        }
        return false;
      default:
        return false;
    }
  };

  const roomOptions = [
    { value: "1+0", label: "1+0" },
    { value: "1+1", label: "1+1" },
    { value: "1+1.5", label: "1+1.5" },
    { value: "2+1", label: "2+1" },
    { value: "3+1", label: "3+1" },
    { value: "4+1", label: "4+1" },
    { value: "5+1", label: "5+1" },
    { value: "5+2", label: "5+2" },
    { value: "6+1", label: "6+1" },
    { value: "6+2", label: "6+2" },
    { value: "7+1", label: "7+1" },
    { value: "7+2", label: "7+2" },
    { value: "8+1", label: "8+1" },
  ];

  const buildingAgeOptions = [
    { value: "0", label: "0 (Yeni)" },
    { value: "1-5", label: "1-5 yaş" },
    { value: "5-10", label: "5-10 yaş" },
    { value: "10-15", label: "10-15 yaş" },
    { value: "15-20", label: "15-20 yaş" },
    { value: "20-30", label: "20-30 yaş" },
    { value: "30+", label: "30+ yaş" },
  ];

  const floorOptions = [
    { value: "bodrum", label: "Bodrum Kat" },
    { value: "zemin", label: "Zemin Kat" },
    { value: "bahçe", label: "Bahçe Katı" },
    { value: "yüksek-giriş", label: "Yüksek Giriş" },
    { value: "çatı-katı", label: "Çatı Katı" },
    ...Array.from({ length: 30 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}. Kat` })),
  ];

  const totalFloorsOptions = Array.from({ length: 50 }, (_, i) => ({ 
    value: `${i + 1}`, 
    label: `${i + 1} Kat` 
  }));

  const heatingOptions = [
    { value: "none", label: "Seçilmedi" },
    { value: "dogalgaz", label: "Doğalgaz" },
    { value: "soba", label: "Soba" },
    { value: "merkezi", label: "Merkezi" },
    { value: "klima", label: "Klima" },
    { value: "yok", label: "Isıtma Yok" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Title and Description */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-base font-medium flex items-center">
            İlan Başlığı <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("title", e.target.value)}
            onBlur={() => handleBlur("title")}
            placeholder="İlan başlığını girin (max 100 karakter)"
            maxLength={100}
            className={`mt-1 ${isFieldInvalid("title") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            required
          />
          {isFieldInvalid("title") && (
            <p className="text-red-500 text-sm mt-1">İlan başlığı zorunludur</p>
          )}
        </div>

        <div>
          <Label htmlFor="description" className="text-base font-medium flex items-center">
            Açıklama <span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("description", e.target.value)}
            onBlur={() => handleBlur("description")}
            placeholder="İlan açıklamasını girin"
            className={`mt-1 min-h-32 ${isFieldInvalid("description") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            required
          />
          {isFieldInvalid("description") && (
            <p className="text-red-500 text-sm mt-1">Açıklama zorunludur</p>
          )}
        </div>
      </div>

      {/* Price */}
      <div className={propertyType === "Prefabrik" ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-3 gap-4"}>
        <div>
          <Label htmlFor="price" className="text-base font-medium flex items-center">
            Fiyat (₺) <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="price"
            type="text"
            inputMode="numeric"
            value={displayPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              // Remove all non-numeric characters for storing the actual value
              const numericValue = e.target.value.replace(/\D/g, '');
              handleChange("price", numericValue);
            }}
            onBlur={() => handleBlur("price")}
            placeholder="Fiyat"
            className={`mt-1 ${isFieldInvalid("price") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            required
          />
          {isFieldInvalid("price") && (
            <p className="text-red-500 text-sm mt-1">Fiyat zorunludur</p>
          )}
        </div>

        {propertyType !== "Prefabrik" && (
          <>
            <div>
              <Label htmlFor="grossArea" className="text-base font-medium flex items-center">
                m² (Brüt) <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="grossArea"
                type="number"
                value={form.grossArea}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("grossArea", e.target.value)}
                onBlur={() => handleBlur("grossArea")}
                placeholder="Brüt Alan"
                className={`mt-1 ${isFieldInvalid("grossArea") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                required
              />
              {isFieldInvalid("grossArea") && (
                <p className="text-red-500 text-sm mt-1">Brüt alan zorunludur</p>
              )}
            </div>

            <div>
              <Label htmlFor="netArea" className="text-base font-medium flex items-center">
                m² (Net) <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="netArea"
                type="number"
                value={form.netArea}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("netArea", e.target.value)}
                onBlur={() => handleBlur("netArea")}
                placeholder="Net Alan"
                className={`mt-1 ${isFieldInvalid("netArea") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                required
              />
              {isFieldInvalid("netArea") && (
                <p className="text-red-500 text-sm mt-1">Net alan zorunludur</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Only show these fields if not Prefabrik */}
      {propertyType !== "Prefabrik" && (
        <>
          {/* Room Count, Building Age, Floor */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {propertyType !== "bina" && (
              <div>
                <Label htmlFor="roomCount" className="text-base font-medium flex items-center">
                  Oda Sayısı <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={form.roomCount}
                  onValueChange={(value) => handleChange("roomCount", value)}
                  onOpenChange={() => !form.roomCount && handleBlur("roomCount")}
                >
                  <SelectTrigger 
                    id="roomCount" 
                    className={`mt-1 ${isFieldInvalid("roomCount") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Oda sayısı seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isFieldInvalid("roomCount") && (
                  <p className="text-red-500 text-sm mt-1">Oda sayısı zorunludur</p>
                )}
              </div>
            )}

            {propertyType === "bina" && (
              <div>
                <Label htmlFor="apartmentsPerFloor" className="text-base font-medium flex items-center">
                  Bir Kattaki Daire Sayısı <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="apartmentsPerFloor"
                  type="number"
                  value={form.apartmentsPerFloor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("apartmentsPerFloor", e.target.value)}
                  onBlur={() => handleBlur("apartmentsPerFloor")}
                  placeholder="Bir kattaki daire sayısı"
                  className={`mt-1 ${isFieldInvalid("apartmentsPerFloor") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  required
                />
                {isFieldInvalid("apartmentsPerFloor") && (
                  <p className="text-red-500 text-sm mt-1">Bir kattaki daire sayısı zorunludur</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="buildingAge" className="text-base font-medium flex items-center">
                Bina Yaşı <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={form.buildingAge}
                onValueChange={(value) => handleChange("buildingAge", value)}
                onOpenChange={() => !form.buildingAge && handleBlur("buildingAge")}
              >
                <SelectTrigger 
                  id="buildingAge" 
                  className={`mt-1 ${isFieldInvalid("buildingAge") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                >
                  <SelectValue placeholder="Bina yaşı seçin" />
                </SelectTrigger>
                <SelectContent>
                  {buildingAgeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isFieldInvalid("buildingAge") && (
                <p className="text-red-500 text-sm mt-1">Bina yaşı zorunludur</p>
              )}
            </div>

            {propertyType !== "villa" && propertyType !== "mustakil_ev" && propertyType !== "bina" && (
              <div>
                <Label htmlFor="floor" className="text-base font-medium flex items-center">
                  Bulunduğu Kat <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={form.floor}
                  onValueChange={(value) => handleChange("floor", value)}
                  onOpenChange={() => !form.floor && handleBlur("floor")}
                >
                  <SelectTrigger 
                    id="floor" 
                    className={`mt-1 ${isFieldInvalid("floor") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Kat seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {floorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isFieldInvalid("floor") && (
                  <p className="text-red-500 text-sm mt-1">Bulunduğu kat zorunludur</p>
                )}
              </div>
            )}
          </div>

          {/* Total Floors and Heating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalFloors" className="text-base font-medium flex items-center">
                Kat Sayısı <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={form.totalFloors}
                onValueChange={(value) => handleChange("totalFloors", value)}
                onOpenChange={() => !form.totalFloors && handleBlur("totalFloors")}
              >
                <SelectTrigger 
                  id="totalFloors" 
                  className={`mt-1 ${isFieldInvalid("totalFloors") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                >
                  <SelectValue placeholder="Kat sayısı seçin" />
                </SelectTrigger>
                <SelectContent>
                  {totalFloorsOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isFieldInvalid("totalFloors") && (
                <p className="text-red-500 text-sm mt-1">Kat sayısı zorunludur</p>
              )}
            </div>

            <div>
              <Label htmlFor="heating" className="text-base font-medium">
                Isıtma
              </Label>
              <Select
                value={form.heating}
                onValueChange={(value) => handleChange("heating", value)}
              >
                <SelectTrigger id="heating" className="mt-1">
                  <SelectValue placeholder="Isıtma tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {heatingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Features */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">Ek Özellikler</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                   onClick={() => handleChange("hasBalcony", !form.hasBalcony)}>
                <div className="flex items-center justify-center">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.hasBalcony ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                    {form.hasBalcony && <Check className="h-3 w-3 text-white stroke-[3]" />}
                  </div>
                </div>
                <Label 
                  htmlFor="hasBalcony" 
                  className="font-medium cursor-pointer flex-1"
                >
                  Balkonlu
                </Label>
              </div>

              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                   onClick={() => handleChange("hasElevator", !form.hasElevator)}>
                <div className="flex items-center justify-center">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.hasElevator ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                    {form.hasElevator && <Check className="h-3 w-3 text-white stroke-[3]" />}
                  </div>
                </div>
                <Label 
                  htmlFor="hasElevator" 
                  className="font-medium cursor-pointer flex-1"
                >
                  Asansörlü
                </Label>
              </div>

              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                   onClick={() => handleChange("isFurnished", !form.isFurnished)}>
                <div className="flex items-center justify-center">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.isFurnished ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                    {form.isFurnished && <Check className="h-3 w-3 text-white stroke-[3]" />}
                  </div>
                </div>
                <Label 
                  htmlFor="isFurnished" 
                  className="font-medium cursor-pointer flex-1"
                >
                  Eşyalı
                </Label>
              </div>

              {listingType !== "kiralik" && (
                <>
                  <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleChange("isExchangeable", !form.isExchangeable)}>
                    <div className="flex items-center justify-center">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.isExchangeable ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                        {form.isExchangeable && <Check className="h-3 w-3 text-white stroke-[3]" />}
                      </div>
                    </div>
                    <Label 
                      htmlFor="isExchangeable" 
                      className="font-medium cursor-pointer flex-1"
                    >
                      Takas Yapılabilir
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleChange("isSuitableForCredit", !form.isSuitableForCredit)}>
                    <div className="flex items-center justify-center">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.isSuitableForCredit ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                        {form.isSuitableForCredit && <Check className="h-3 w-3 text-white stroke-[3]" />}
                      </div>
                    </div>
                    <Label 
                      htmlFor="isSuitableForCredit" 
                      className="font-medium cursor-pointer flex-1"
                    >
                      Krediye Uygun
                    </Label>
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                   onClick={() => handleChange("inSite", !form.inSite)}>
                <div className="flex items-center justify-center">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.inSite ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                    {form.inSite && <Check className="h-3 w-3 text-white stroke-[3]" />}
                  </div>
                </div>
                <Label 
                  htmlFor="inSite" 
                  className="font-medium cursor-pointer flex-1"
                >
                  Site İçerisinde
                </Label>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
} 