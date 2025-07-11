"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import neighborhoodsByDistrict from "@/lib/neighborhoods";

interface AddressFormProps {
  formData: {
    district?: string;
    neighborhood?: string;
    province?: string;
    [key: string]: any;
  };
  updateFormData: (data: Record<string, string>) => void;
}

// Define the neighborhood type
interface Neighborhood {
  value: string;
  label: string;
}

// Define the district data type
interface DistrictData {
  mahalle: Neighborhood[];
  koy: Neighborhood[];
}

export default function AddressForm({ formData, updateFormData }: AddressFormProps) {
  // Initialize form with default values or existing values
  const [form, setForm] = useState({
    province: formData.province || "Tokat", // Default to Tokat
    district: formData.district || "",
    neighborhood: formData.neighborhood || "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({
    province: !!formData.province,
    district: !!formData.district,
    neighborhood: !!formData.neighborhood,
  });

  // State for manual entry mode
  const [addressMode, setAddressMode] = useState<"tokat" | "manual">(
    formData.province && formData.province !== "Tokat" ? "manual" : "tokat"
  );

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
    
    if (field === "district" && addressMode === "tokat") {
      // Reset neighborhood when district changes in Tokat mode
      updatedForm = { ...form, [field]: value, neighborhood: "" };
      setTouched({ ...touched, [field]: true, neighborhood: false });
    } else {
      updatedForm = { ...form, [field]: value };
      setTouched({ ...touched, [field]: true });
    }
    
    setForm(updatedForm);
    updateFormData(updatedForm);
  };

  // Set default district if none is selected in Tokat mode
  useEffect(() => {
    if (addressMode === "tokat" && !form.district && districts.length > 0) {
      const defaultDistrict = districts[0].value;
      handleChange("district", defaultDistrict);
    }
  }, [form.district, districts, addressMode]);

  // Check if field is invalid
  const isFieldInvalid = (field: string): boolean => {
    if (!touched[field]) return false;
    
    switch (field) {
      case "province":
        return !form.province;
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

  // Handle mode change
  const handleModeChange = (mode: "tokat" | "manual") => {
    setAddressMode(mode);
    
    // Reset form values when changing modes
    if (mode === "tokat") {
      const updatedForm = {
        province: "Tokat",
        district: districts.length > 0 ? districts[0].value : "",
        neighborhood: "",
      };
      setForm(updatedForm);
      updateFormData(updatedForm);
      setTouched({
        province: true,
        district: true,
        neighborhood: false,
      });
    } else {
      const updatedForm = {
        province: "",
        district: "",
        neighborhood: "",
      };
      setForm(updatedForm);
      updateFormData(updatedForm);
      setTouched({
        province: false,
        district: false,
        neighborhood: false,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg p-6 shadow-md"
    >
      <h2 className="text-xl font-semibold mb-4">Adres Bilgileri</h2>
      
      {/* Address Mode Selection */}
      <div className="mb-6">
        <Tabs 
          defaultValue={addressMode} 
          onValueChange={(value) => handleModeChange(value as "tokat" | "manual")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-2">
            <TabsTrigger 
              value="tokat" 
              className="data-[state=active]:bg-[#FFB000] data-[state=active]:text-black"
            >
              Tokat İçi
            </TabsTrigger>
            <TabsTrigger 
              value="manual" 
              className="data-[state=active]:bg-[#FFB000] data-[state=active]:text-black"
            >
              Diğer Şehirler
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tokat">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="province-tokat" className="text-base font-medium flex items-center">
                  İl <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select value={form.province} disabled>
                  <SelectTrigger id="province-tokat" className="mt-1">
                    <SelectValue placeholder="İl seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tokat">Tokat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="district-tokat" className="text-base font-medium flex items-center">
                  İlçe <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={form.district}
                  onValueChange={(value) => handleChange("district", value)}
                  onOpenChange={() => setTouched({ ...touched, district: true })}
                >
                  <SelectTrigger 
                    id="district-tokat" 
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
                <Label htmlFor="neighborhood-tokat" className="text-base font-medium flex items-center">
                  Mahalle-Köy <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={form.neighborhood}
                  onValueChange={(value) => handleChange("neighborhood", value)}
                  onOpenChange={() => form.district && setTouched({ ...touched, neighborhood: true })}
                  disabled={!form.district}
                >
                  <SelectTrigger 
                    id="neighborhood-tokat" 
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
          </TabsContent>
          
          <TabsContent value="manual">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="province-manual" className="text-base font-medium flex items-center">
                  İl <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="province-manual"
                  value={form.province}
                  onChange={(e) => handleChange("province", e.target.value)}
                  onBlur={() => setTouched({ ...touched, province: true })}
                  placeholder="İl giriniz"
                  className={`mt-1 ${isFieldInvalid("province") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {isFieldInvalid("province") && (
                  <p className="text-red-500 text-sm mt-1">İl girişi zorunludur</p>
                )}
              </div>

              <div>
                <Label htmlFor="district-manual" className="text-base font-medium flex items-center">
                  İlçe <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="district-manual"
                  value={form.district}
                  onChange={(e) => handleChange("district", e.target.value)}
                  onBlur={() => setTouched({ ...touched, district: true })}
                  placeholder="İlçe giriniz"
                  className={`mt-1 ${isFieldInvalid("district") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {isFieldInvalid("district") && (
                  <p className="text-red-500 text-sm mt-1">İlçe girişi zorunludur</p>
                )}
              </div>

              <div>
                <Label htmlFor="neighborhood-manual" className="text-base font-medium flex items-center">
                  Mahalle-Köy <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="neighborhood-manual"
                  value={form.neighborhood}
                  onChange={(e) => handleChange("neighborhood", e.target.value)}
                  onBlur={() => setTouched({ ...touched, neighborhood: true })}
                  placeholder="Mahalle veya Köy giriniz"
                  className={`mt-1 ${isFieldInvalid("neighborhood") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {isFieldInvalid("neighborhood") && (
                  <p className="text-red-500 text-sm mt-1">Mahalle-Köy girişi zorunludur</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
} 