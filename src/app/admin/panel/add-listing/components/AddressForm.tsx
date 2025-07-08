"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import neighborhoodsByDistrict from "@/lib/neighborhoods";

interface AddressFormProps {
  formData: {
    district?: string;
    neighborhood?: string;
    [key: string]: any;
  };
  updateFormData: (data: Record<string, string>) => void;
}

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

export default function AddressForm({ formData, updateFormData }: AddressFormProps) {
  // Initialize form with default values or existing values
  const [form, setForm] = useState({
    province: "Tokat", // Tokat is fixed
    district: formData.district || "",
    neighborhood: formData.neighborhood || "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({
    district: !!formData.district,
    neighborhood: !!formData.neighborhood,
  });

  // Tokat districts data
  const districts = [
    { value: "merkez", label: "Merkez" },
    { value: "almus", label: "Almus" },
    { value: "artova", label: "Artova" },
    { value: "basciftlik", label: "Başçiftlik" },
    { value: "erbaa", label: "Erbaa" },
    { value: "niksar", label: "Niksar" },
    { value: "pazar", label: "Pazar" },
    { value: "resadiye", label: "Reşadiye" },
    { value: "sulusaray", label: "Sulusaray" },
    { value: "turhal", label: "Turhal" },
    { value: "yesilyurt", label: "Yeşilyurt" },
    { value: "zile", label: "Zile" },
  ];

  // Handle form field changes
  const handleChange = (field: string, value: string) => {
    let updatedForm;
    
    if (field === "district") {
      // Reset neighborhood when district changes
      updatedForm = { ...form, [field]: value, neighborhood: "" };
      setTouched({ ...touched, [field]: true, neighborhood: false });
    } else {
      updatedForm = { ...form, [field]: value };
      setTouched({ ...touched, [field]: true });
    }
    
    setForm(updatedForm);
    updateFormData(updatedForm);
  };

  // Set default district if none is selected
  useEffect(() => {
    if (!form.district && districts.length > 0) {
      const defaultDistrict = districts[0].value;
      handleChange("district", defaultDistrict);
    }
  }, [form.district, districts]);

  // Check if field is invalid
  const isFieldInvalid = (field: string): boolean => {
    if (!touched[field]) return false;
    
    switch (field) {
      case "district":
        return !form.district;
      case "neighborhood":
        return !form.neighborhood;
      default:
        return false;
    }
  };

  // Get neighborhoods for selected district
  const getNeighborhoods = (district: string): DistrictData => {
    if (!district) return { mahalle: [], koy: [] };
    
    // Type assertion to make TypeScript happy
    const districtData = (neighborhoodsByDistrict as Record<string, DistrictData>)[district.toLowerCase()];
    return districtData || { mahalle: [], koy: [] };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg p-6 shadow-md"
    >
      <h2 className="text-xl font-semibold mb-4">Adres Bilgileri</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="province" className="text-base font-medium flex items-center">
            İl <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select value={form.province} disabled>
            <SelectTrigger id="province" className="mt-1">
              <SelectValue placeholder="İl seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tokat">Tokat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="district" className="text-base font-medium flex items-center">
            İlçe <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={form.district}
            onValueChange={(value) => handleChange("district", value)}
            onOpenChange={() => setTouched({ ...touched, district: true })}
          >
            <SelectTrigger 
              id="district" 
              className={`mt-1 ${isFieldInvalid("district") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            >
              <SelectValue placeholder="İlçe seçin" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.value} value={district.value}>
                  {district.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFieldInvalid("district") && (
            <p className="text-red-500 text-sm mt-1">İlçe seçimi zorunludur</p>
          )}
        </div>

        <div>
          <Label htmlFor="neighborhood" className="text-base font-medium flex items-center">
            Mahalle-Köy <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={form.neighborhood}
            onValueChange={(value) => handleChange("neighborhood", value)}
            onOpenChange={() => form.district && setTouched({ ...touched, neighborhood: true })}
            disabled={!form.district}
          >
            <SelectTrigger 
              id="neighborhood" 
              className={`mt-1 truncate ${isFieldInvalid("neighborhood") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            >
              <SelectValue placeholder={form.district ? "Mahalle-Köy seçin" : "Önce ilçe seçin"} />
            </SelectTrigger>
            <SelectContent>
              {form.district && (
                <>
                  {getNeighborhoods(form.district).mahalle.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-sm font-semibold bg-yellow-100 text-yellow-800">Mahalleler</div>
                      {getNeighborhoods(form.district).mahalle.map((neighborhood: Neighborhood) => (
                        <SelectItem key={neighborhood.value} value={neighborhood.value}>
                          {neighborhood.label}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  
                  {getNeighborhoods(form.district).koy.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-sm font-semibold bg-yellow-100 text-yellow-800 mt-1">Köyler</div>
                      {getNeighborhoods(form.district).koy.map((koy: Neighborhood) => (
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
          {isFieldInvalid("neighborhood") && (
            <p className="text-red-500 text-sm mt-1">Mahalle-Köy seçimi zorunludur</p>
          )}
        </div>
      </div>
    </motion.div>
  );
} 