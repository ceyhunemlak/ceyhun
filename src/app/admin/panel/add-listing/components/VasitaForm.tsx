"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface VasitaFormProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function VasitaForm({ formData, updateFormData }: VasitaFormProps) {
  const [form, setForm] = useState({
    title: formData.title || "",
    description: formData.description || "",
    price: formData.price || "",
    brand: formData.brand || "",
    model: formData.model || "",
    subModel: formData.subModel || "",
    kilometer: formData.kilometer || "",
    fuelType: formData.fuelType || null,
    transmission: formData.transmission || null,
    color: formData.color || "",
    hasWarranty: formData.hasWarranty || false,
    hasDamageRecord: formData.hasDamageRecord || false,
    isExchangeable: formData.isExchangeable || false,
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
      case "brand":
        return !form.brand;
      case "model":
        return !form.model;
      case "kilometer":
        return !form.kilometer;
      case "fuelType":
        return !form.fuelType;
      default:
        return false;
    }
  };

  const fuelTypeOptions = [
    { value: "benzin", label: "Benzin" },
    { value: "dizel", label: "Dizel" },
    { value: "lpg", label: "LPG" },
    { value: "elektrik", label: "Elektrik" },
    { value: "hibrit", label: "Hibrit" },
  ];

  const transmissionTypeOptions = [
    { value: "none", label: "Seçilmedi" },
    { value: "manuel", label: "Manuel" },
    { value: "otomatik", label: "Otomatik" },
    { value: "yarı_otomatik", label: "Yarı Otomatik" },
  ];

  const colorOptions = [
    { value: "beyaz", label: "Beyaz" },
    { value: "siyah", label: "Siyah" },
    { value: "gri", label: "Gri" },
    { value: "kırmızı", label: "Kırmızı" },
    { value: "mavi", label: "Mavi" },
    { value: "yeşil", label: "Yeşil" },
    { value: "sarı", label: "Sarı" },
    { value: "kahverengi", label: "Kahverengi" },
    { value: "turuncu", label: "Turuncu" },
    { value: "mor", label: "Mor" },
    { value: "bordo", label: "Bordo" },
    { value: "diğer", label: "Diğer" },
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

      {/* Brand, Model, Sub-model */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="brand" className="text-base font-medium flex items-center">
            Marka <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="brand"
            value={form.brand}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("brand", e.target.value)}
            onBlur={() => handleBlur("brand")}
            placeholder="Marka"
            className={`mt-1 ${isFieldInvalid("brand") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            required
          />
          {isFieldInvalid("brand") && (
            <p className="text-red-500 text-sm mt-1">Marka zorunludur</p>
          )}
        </div>

        <div>
          <Label htmlFor="model" className="text-base font-medium flex items-center">
            Model <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="model"
            value={form.model}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("model", e.target.value)}
            onBlur={() => handleBlur("model")}
            placeholder="Model"
            className={`mt-1 ${isFieldInvalid("model") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            required
          />
          {isFieldInvalid("model") && (
            <p className="text-red-500 text-sm mt-1">Model zorunludur</p>
          )}
        </div>

        <div>
          <Label htmlFor="subModel" className="text-base font-medium">
            Alt Model
          </Label>
          <Input
            id="subModel"
            value={form.subModel}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("subModel", e.target.value)}
            placeholder="Alt Model"
            className="mt-1"
          />
        </div>
      </div>

      {/* Kilometer */}
      <div>
        <Label htmlFor="kilometer" className="text-base font-medium flex items-center">
          Kilometre <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="kilometer"
          type="number"
          value={form.kilometer}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("kilometer", e.target.value)}
          onBlur={() => handleBlur("kilometer")}
          placeholder="Kilometre"
          className={`mt-1 ${isFieldInvalid("kilometer") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          required
        />
        {isFieldInvalid("kilometer") && (
          <p className="text-red-500 text-sm mt-1">Kilometre zorunludur</p>
        )}
      </div>

      {/* Fuel Type, Transmission, Color */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="fuelType" className="text-base font-medium flex items-center">
            Yakıt Tipi <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={form.fuelType}
            onValueChange={(value) => handleChange("fuelType", value)}
            onOpenChange={() => handleBlur("fuelType")}
          >
            <SelectTrigger id="fuelType" className={`mt-1 ${isFieldInvalid("fuelType") ? "border-red-500 focus-visible:ring-red-500" : ""}`}>
              <SelectValue placeholder="Yakıt tipi seçin" />
            </SelectTrigger>
            <SelectContent>
              {fuelTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFieldInvalid("fuelType") && (
            <p className="text-red-500 text-sm mt-1">Yakıt tipi zorunludur</p>
          )}
        </div>

        <div>
          <Label htmlFor="transmission" className="text-base font-medium flex items-center">
            Vites
          </Label>
          <Select
            value={form.transmission}
            onValueChange={(value) => handleChange("transmission", value)}
          >
            <SelectTrigger id="transmission" className="mt-1">
              <SelectValue placeholder="Vites tipi seçin" />
            </SelectTrigger>
            <SelectContent>
              {transmissionTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="color" className="text-base font-medium flex items-center">
            Renk
          </Label>
          <Select
            value={form.color}
            onValueChange={(value) => handleChange("color", value)}
          >
            <SelectTrigger id="color" className="mt-1">
              <SelectValue placeholder="Renk seçin" />
            </SelectTrigger>
            <SelectContent>
              {colorOptions.map((option) => (
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
               onClick={() => handleChange("hasWarranty", !form.hasWarranty)}>
            <div className="flex items-center justify-center">
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.hasWarranty ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                {form.hasWarranty && <Check className="h-3 w-3 text-white stroke-[3]" />}
              </div>
            </div>
            <Label 
              htmlFor="hasWarranty" 
              className="font-medium cursor-pointer flex-1"
            >
              Garantisi Var
            </Label>
          </div>

          <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
               onClick={() => handleChange("hasDamageRecord", !form.hasDamageRecord)}>
            <div className="flex items-center justify-center">
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.hasDamageRecord ? 'bg-[#FFB000] border-[#FFB000]' : 'border-gray-300'}`}>
                {form.hasDamageRecord && <Check className="h-3 w-3 text-white stroke-[3]" />}
              </div>
            </div>
            <Label 
              htmlFor="hasDamageRecord" 
              className="font-medium cursor-pointer flex-1"
            >
              Hasar Kaydı Var
            </Label>
          </div>

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
        </div>
      </div>
    </motion.div>
  );
} 