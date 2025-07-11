"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Check, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ArsaFormProps {
  formData: any;
  updateFormData: (data: any) => void;
  listingType: string; // "satilik" or "kiralik"
}

export default function ArsaForm({ formData, updateFormData, listingType }: ArsaFormProps) {
  const [form, setForm] = useState({
    title: formData.title || "",
    description: formData.description || "",
    price: formData.price || "",
    sqm: formData.sqm || "",
    kaks: formData.kaks || "",
    isExchangeable: formData.isExchangeable || false,
    isEligibleForCredit: formData.isEligibleForCredit || false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [displayPrice, setDisplayPrice] = useState(form.price ? formatPrice(form.price) : "");

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
      case "sqm":
        return !form.sqm;
      default:
        return false;
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div>
          <Label htmlFor="sqm" className="text-base font-medium flex items-center">
            m² (Alan) <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="sqm"
            type="number"
            value={form.sqm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("sqm", e.target.value)}
            onBlur={() => handleBlur("sqm")}
            placeholder="Alan (m²)"
            className={`mt-1 ${isFieldInvalid("sqm") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            required
          />
          {isFieldInvalid("sqm") && (
            <p className="text-red-500 text-sm mt-1">Alan zorunludur</p>
          )}
        </div>
      </div>

      {/* KAKS */}
      <div>
        <Label htmlFor="kaks" className="text-base font-medium flex items-center">
          KAKS (Emsal)
        </Label>
        <Input
          id="kaks"
          type="number"
          step="0.01"
          value={form.kaks}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("kaks", e.target.value)}
          placeholder="KAKS (Emsal) değeri"
          className="mt-1"
        />
      </div>

      {/* Additional Features */}
      <div className="space-y-4">
        <h3 className="text-base font-medium">Ek Özellikler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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