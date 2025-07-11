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

interface TicariFormProps {
  formData: any;
  updateFormData: (data: any) => void;
  listingType: string; // "satilik" or "kiralik"
  propertyType?: string; // Add propertyType prop
}

export default function TicariForm({ formData, updateFormData, listingType, propertyType }: TicariFormProps) {
  const [form, setForm] = useState({
    title: formData.title || "",
    description: formData.description || "",
    price: formData.price || "",
    grossArea: formData.grossArea || "",
    netArea: formData.netArea || "",
    roomCount: formData.roomCount || "",
    buildingAge: formData.buildingAge || "",
    floor: formData.floor || "",
    totalFloors: formData.totalFloors || "",
    heating: formData.heating || null,
    isExchangeable: formData.isExchangeable || false,
    isEligibleForCredit: formData.isEligibleForCredit || false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [displayPrice, setDisplayPrice] = useState(form.price ? formatPrice(form.price) : "");

  // Set floor to null for villa, fabrika, plaza, or bina
  useEffect(() => {
    if (propertyType === "villa" || propertyType === "fabrika" || propertyType === "plaza" || propertyType === "bina") {
      if (form.floor !== null) {
        const updatedForm = { ...form, floor: null };
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
    
    switch (field) {
      case "title":
        return !form.title;
      case "description":
        return !form.description;
      case "price":
        return !form.price;
      case "grossArea":
        // Don't validate grossArea for otobüs hattı or taksi hattı
        if (propertyType === "otobus_hatti" || propertyType === "taksi_hatti") {
          return false;
        }
        return !form.grossArea;
      case "buildingAge":
        // Don't validate buildingAge for otobüs hattı or taksi hattı
        if (propertyType === "otobus_hatti" || propertyType === "taksi_hatti") {
          return false;
        }
        return !form.buildingAge;
      case "floor":
        // Don't validate floor for villa, fabrika, plaza, or bina
        if (propertyType === "villa" || propertyType === "fabrika" || propertyType === "plaza" || propertyType === "bina" ||
            propertyType === "otobus_hatti" || propertyType === "taksi_hatti") {
          return false;
        }
        return !form.floor;
      default:
        return false;
    }
  };

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

      {/* Price and Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Only show additional fields if not otobüs hattı or taksi hattı */}
        {propertyType !== "otobus_hatti" && propertyType !== "taksi_hatti" && (
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
              <Label htmlFor="netArea" className="text-base font-medium">
                m² (Net)
              </Label>
              <Input
                id="netArea"
                type="number"
                value={form.netArea}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("netArea", e.target.value)}
                placeholder="Net Alan"
                className="mt-1"
              />
            </div>
          </>
        )}
      </div>

      {/* Only show these fields if not otobüs hattı or taksi hattı */}
      {propertyType !== "otobus_hatti" && propertyType !== "taksi_hatti" && (
        <>
          {/* Room Count, Building Age, Floor */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="roomCount" className="text-base font-medium">
                Oda Sayısı
              </Label>
              <Input
                id="roomCount"
                type="number"
                value={form.roomCount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("roomCount", e.target.value)}
                placeholder="Oda sayısı"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="buildingAge" className="text-base font-medium flex items-center">
                Bina Yaşı <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={form.buildingAge}
                onValueChange={(value) => handleChange("buildingAge", value)}
                onOpenChange={() => handleBlur("buildingAge")}
              >
                <SelectTrigger id="buildingAge" className={`mt-1 ${isFieldInvalid("buildingAge") ? "border-red-500 focus-visible:ring-red-500" : ""}`}>
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

            {/* Only show floor field for property types that are not villa, fabrika, plaza, or bina */}
            {propertyType !== "villa" && propertyType !== "fabrika" && propertyType !== "plaza" && propertyType !== "bina" && (
              <div>
                <Label htmlFor="floor" className="text-base font-medium">
                  Bulunduğu Kat
                </Label>
                <Select
                  value={form.floor}
                  onValueChange={(value) => handleChange("floor", value)}
                >
                  <SelectTrigger id="floor" className="mt-1">
                    <SelectValue placeholder="Bulunduğu kat seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {floorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Total Floors and Heating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalFloors" className="text-base font-medium flex items-center">
                Kat Sayısı
              </Label>
              <Select
                value={form.totalFloors}
                onValueChange={(value) => handleChange("totalFloors", value)}
              >
                <SelectTrigger id="totalFloors" className="mt-1">
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
            </div>

            <div>
              <Label htmlFor="heating" className="text-base font-medium flex items-center">
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
        </>
      )}

      {/* Additional Features */}
      <div className="space-y-4">
        <h3 className="text-base font-medium">Ek Özellikler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listingType !== "kiralik" && propertyType !== "otobus_hatti" && propertyType !== "taksi_hatti" && (
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
                onClick={() => handleChange("isEligibleForCredit", !form.isEligibleForCredit)}>
                <div className="flex items-center justify-center">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.isEligibleForCredit ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                    {form.isEligibleForCredit && <Check className="h-3 w-3 text-white stroke-[3]" />}
                  </div>
                </div>
                <Label 
                  htmlFor="isEligibleForCredit" 
                  className="font-medium cursor-pointer flex-1"
                >
                  Krediye Uygun
                </Label>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
} 