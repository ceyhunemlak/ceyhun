"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Check, X, Loader2, ChevronRight as ChevronRightIcon } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import dynamic from "next/dynamic";
import Image from "next/image";
import { handleEnumField } from '@/lib/utils';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Helper function to get display name for categories
const getCategoryDisplayName = (category: string): string => {
  const categoryDisplayMap: Record<string, string> = {
    konut: 'Konut',
    ticari: 'Ticari',
    arsa: 'Arsa',
    vasita: 'Vasıta'
  };

  return categoryDisplayMap[category] || category;
};

// Helper function to get display name for listing status
const getListingStatusDisplayName = (status: string): string => {
  const statusDisplayMap: Record<string, string> = {
    satilik: 'Satılık',
    kiralik: 'Kiralık'
  };

  return statusDisplayMap[status] || status;
};

// Helper function to get display name for property types
const getTypeDisplayName = (category: string, type: string): string => {
  const typeDisplayMap: Record<string, Record<string, string>> = {
    konut: {
      daire: 'Daire',
      villa: 'Villa',
      mustakil_ev: 'Müstakil Ev',
      bina: 'Bina'
    },
    ticari: {
      dukkan: 'Dükkan',
      depo: 'Depo',
      villa: 'Villa',
      fabrika: 'Fabrika',
      atolye: 'Atölye',
      plaza: 'Plaza',
      bina: 'Bina',
      ofis: 'Ofis',
      cafe: 'Cafe',
      bufe: 'Büfe',
      otobus_hatti: 'Otobüs Hattı',
      taksi_hatti: 'Taksi Hattı'
    },
    arsa: {
      tarla: 'Tarla',
      bahce: 'Bahçe',
      konut_imarli: 'Konut İmarlı',
      ticari_imarli: 'Ticari İmarlı'
    },
    vasita: {
      otomobil: 'Otomobil',
      suv: 'SUV',
      atv: 'ATV',
      utv: 'UTV',
      van: 'Van',
      motosiklet: 'Motosiklet',
      bisiklet: 'Bisiklet',
      ticari: 'Ticari'
    }
  };

  return typeDisplayMap[category]?.[type] || type;
};

// Dynamically import the form components to avoid loading them all at once
const KonutForm = dynamic(() => import("./components/KonutForm"), { ssr: false });
const TicariForm = dynamic(() => import("./components/TicariForm"), { ssr: false });
const ArsaForm = dynamic(() => import("./components/ArsaForm"), { ssr: false });
const VasitaForm = dynamic(() => import("./components/VasitaForm"), { ssr: false });
const AddressForm = dynamic(() => import("./components/AddressForm"), { ssr: false });
const PhotoUpload = dynamic(() => import("./components/PhotoUpload"), { ssr: false });
const ListingDetailPreview = dynamic(() => import("./components/ListingDetailPreview"), { ssr: false });

// Step 1: Category Selection
const CategorySelection = ({ 
  selectedCategory, 
  setSelectedCategory, 
  selectedType, 
  setSelectedType, 
  listingStatus,
  setListingStatus,
  onNext 
}: { 
  selectedCategory: string; 
  setSelectedCategory: (category: string) => void; 
  selectedType: string; 
  setSelectedType: (type: string) => void;
  listingStatus: string;
  setListingStatus: (status: string) => void;
  onNext: () => void;
}) => {
  // Main categories and their subcategories based on schema.sql
  const propertyTypes = {
    konut: [
      { id: "daire", name: "Daire" },
      { id: "villa", name: "Villa" },
      { id: "mustakil_ev", name: "Müstakil Ev" },
      { id: "bina", name: "Bina" },
      { id: "prefabrik", name: "Prefabrik" }
    ],
    ticari: [
      { id: "dukkan", name: "Dükkan" },
      { id: "depo", name: "Depo" },
      { id: "villa", name: "Villa" },
      { id: "fabrika", name: "Fabrika" },
      { id: "atolye", name: "Atölye" },
      { id: "plaza", name: "Plaza" },
      { id: "bina", name: "Bina" },
      { id: "ofis", name: "Ofis" },
      { id: "cafe", name: "Cafe" },
      { id: "bufe", name: "Büfe" },
      { id: "otobus_hatti", name: "Otobüs Hattı" },
      { id: "taksi_hatti", name: "Taksi Hattı" }
    ],
    arsa: [
      { id: "tarla", name: "Tarla" },
      { id: "bahce", name: "Bahçe" },
      { id: "konut_imarli", name: "Konut İmarlı" },
      { id: "ticari_imarli", name: "Ticari İmarlı" }
    ],
    vasita: [
      { id: "otomobil", name: "Otomobil" },
      { id: "suv", name: "SUV" },
      { id: "atv", name: "ATV" },
      { id: "utv", name: "UTV" },
      { id: "van", name: "Van" },
      { id: "motosiklet", name: "Motosiklet" },
      { id: "bisiklet", name: "Bisiklet" },
      { id: "ticari", name: "Ticari" }
    ]
  };

  const isNextDisabled = !selectedCategory || !selectedType || (selectedCategory !== "vasita" && !listingStatus);

  return (
    <Card className="border-2 border-[#FFB000]/20 shadow-xl">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-bold">Adım 1: Kategori Seçimi</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-8">
          {/* Main Category Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ana Kategori</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Button
                type="button"
                variant={selectedCategory === "konut" ? "default" : "outline"}
                className={`h-24 flex flex-col items-center justify-center gap-2 ${
                  selectedCategory === "konut" 
                    ? "bg-[#FFB000] hover:bg-[#FFB000]/90 text-black" 
                    : "hover:border-[#FFB000]/50"
                }`}
                onClick={() => {
                  setSelectedCategory(selectedCategory === "konut" ? "" : "konut");
                  setSelectedType("");
                  setListingStatus("");
                }}
              >
                <span className="text-lg font-medium">Konut</span>
              </Button>
              <Button
                type="button"
                variant={selectedCategory === "ticari" ? "default" : "outline"}
                className={`h-24 flex flex-col items-center justify-center gap-2 ${
                  selectedCategory === "ticari" 
                    ? "bg-[#FFB000] hover:bg-[#FFB000]/90 text-black" 
                    : "hover:border-[#FFB000]/50"
                }`}
                onClick={() => {
                  setSelectedCategory(selectedCategory === "ticari" ? "" : "ticari");
                  setSelectedType("");
                  setListingStatus("");
                }}
              >
                <span className="text-lg font-medium">Ticari</span>
              </Button>
              <Button
                type="button"
                variant={selectedCategory === "arsa" ? "default" : "outline"}
                className={`h-24 flex flex-col items-center justify-center gap-2 ${
                  selectedCategory === "arsa" 
                    ? "bg-[#FFB000] hover:bg-[#FFB000]/90 text-black" 
                    : "hover:border-[#FFB000]/50"
                }`}
                onClick={() => {
                  setSelectedCategory(selectedCategory === "arsa" ? "" : "arsa");
                  setSelectedType("");
                  setListingStatus("");
                }}
              >
                <span className="text-lg font-medium">Arsa</span>
              </Button>
              <Button
                type="button"
                variant={selectedCategory === "vasita" ? "default" : "outline"}
                className={`h-24 flex flex-col items-center justify-center gap-2 ${
                  selectedCategory === "vasita" 
                    ? "bg-[#FFB000] hover:bg-[#FFB000]/90 text-black" 
                    : "hover:border-[#FFB000]/50"
                }`}
                onClick={() => {
                  setSelectedCategory(selectedCategory === "vasita" ? "" : "vasita");
                  setSelectedType("");
                  setListingStatus("");
                }}
              >
                <span className="text-lg font-medium">Vasıta</span>
              </Button>
            </div>
          </div>

          {/* Sub Category Selection - When a main category is selected */}
          <AnimatePresence mode="wait">
            {selectedCategory && (
              <motion.div
                key="subcategory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium">Alt Kategori</h3>
                
                {/* Property Type Selection */}
                {selectedCategory && propertyTypes[selectedCategory as keyof typeof propertyTypes] && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {propertyTypes[selectedCategory as keyof typeof propertyTypes].map((type) => (
                      <Button
                        key={type.id}
                        type="button"
                        variant={selectedType === type.id ? "default" : "outline"}
                        className={`h-16 ${
                          selectedType === type.id 
                            ? "bg-[#FFB000] hover:bg-[#FFB000]/90 text-black" 
                            : "hover:border-[#FFB000]/50"
                        }`}
                        onClick={() => setSelectedType(type.id)}
                      >
                        {type.name}
                      </Button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Listing Status (Only for property types except vasita) */}
          <AnimatePresence>
            {selectedCategory && selectedCategory !== "vasita" && selectedType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium">İlan Durumu</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={listingStatus === "satilik" ? "default" : "outline"}
                    className={`h-16 ${
                      listingStatus === "satilik" 
                        ? "bg-[#FFB000] hover:bg-[#FFB000]/90 text-black" 
                        : "hover:border-[#FFB000]/50"
                    }`}
                    onClick={() => setListingStatus("satilik")}
                  >
                    Satılık
                  </Button>
                  <Button
                    type="button"
                    variant={listingStatus === "kiralik" ? "default" : "outline"}
                    className={`h-16 ${
                      listingStatus === "kiralik" 
                        ? "bg-[#FFB000] hover:bg-[#FFB000]/90 text-black" 
                        : "hover:border-[#FFB000]/50"
                    }`}
                    onClick={() => setListingStatus("kiralik")}
                  >
                    Kiralık
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          <div className="pt-4 flex justify-end">
            <Button
              onClick={onNext}
              disabled={isNextDisabled}
              className="bg-[#FFB000] hover:bg-[#FFB000]/80 text-black font-medium"
            >
              Devam Et <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Preview Component for Step 5
const ListingPreview = ({ 
  formData, 
  selectedCategory, 
  selectedType, 
  listingStatus 
}: { 
  formData: any; 
  selectedCategory: string; 
  selectedType: string; 
  listingStatus: string;
}) => {
  const getDisplayValue = (key: string, value: any) => {
    if (key === "photos") {
      return `${value.length} fotoğraf`;
    }
    return value;
  };

  // Get proper display name for property type
  const getPropertyTypeDisplayName = () => {
    return getTypeDisplayName(selectedCategory, selectedType);
  };

  // Format the form data for display
  const formatData = () => {
    const result = [];
    
    // Main category
    const categoryLabels: Record<string, string> = {
      konut: "Konut",
      ticari: "Ticari",
      arsa: "Arsa",
      vasita: "Vasıta"
    };

    // Add category information
    result.push({ label: "Kategori", value: categoryLabels[selectedCategory] || selectedCategory });
    
    // Add property type
    if (selectedType) {
      result.push({ label: "Alt Kategori", value: getPropertyTypeDisplayName() });
    }
    
    // Add listing status
    if (listingStatus) {
      result.push({ label: "İlan Durumu", value: getListingStatusDisplayName(listingStatus) });
    }
    
    // Other form fields
    for (const [key, value] of Object.entries(formData)) {
      // Skip certain fields that we handle specially
      if (value && key !== "photos" && key !== "inSite") {
        // Format the key for display
        const label = key
          .replace(/([A-Z])/g, ' $1') // Insert a space before all capital letters
          .replace(/^./, str => str.toUpperCase()); // Capitalize the first letter
        
        result.push({ label, value });
      }
    }
    
    // Add special fields with custom labels
    if (selectedCategory === 'konut' && formData.inSite !== undefined) {
      result.push({ 
        label: "Site İçerisinde", 
        value: formData.inSite ? "Evet" : "Hayır" 
      });
    }
    
    // Photos count
    if (formData.photos && formData.photos.length > 0) {
      result.push({ label: "Fotoğraflar", value: `${formData.photos.length} adet` });
    }
    
    return result;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{formData.title || "İlan Başlığı"}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main info */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">İlan Bilgileri</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {formatData().map((item, index) => (
                <div key={index} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">{item.label}:</span>
                  <span className="font-medium">{String(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Photos preview */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Fotoğraflar</h3>
            {formData.photos && formData.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {formData.photos.slice(0, 4).map((photo: any, index: number) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                    <Image
                      src={photo.preview}
                      alt={`Önizleme ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute top-0 left-0 bg-[#FFB000] text-black text-xs px-2 py-1">
                        Vitrin
                      </div>
                    )}
                  </div>
                ))}
                {formData.photos.length > 4 && (
                  <div className="col-span-2 text-center text-sm text-gray-500 mt-2">
                    + {formData.photos.length - 4} daha fazla fotoğraf
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">Fotoğraf eklenmedi</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Açıklama</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="whitespace-pre-wrap">{formData.description || "Açıklama eklenmedi."}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main component
export default function AddListing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('id');
  const isEditMode = !!listingId;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [listingStatus, setListingStatus] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tempListingId, setTempListingId] = useState<string | null>(null);
  const [cloudinaryFolder, setCloudinaryFolder] = useState<string | null>(null);
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);

  // Generate a temporary listing ID on component mount
  useEffect(() => {
    if (!isEditMode) {
      let newListingId;
      try {
        // Try to use the standard crypto.randomUUID method
        newListingId = crypto.randomUUID();
      } catch (error) {
        // Fallback method to generate a UUID if randomUUID is not available
        newListingId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
      setTempListingId(newListingId);
      console.log(`Generated temporary listing ID: ${newListingId}`);
    }
  }, [isEditMode]);

  useEffect(() => {
    // If we're in edit mode, fetch the existing listing data
    if (isEditMode && listingId) {
      fetchListingData();
    }

    // Add event listener for beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Clean up temporary listing if not submitted
      cleanupTemporaryListing();
    };
  }, [isEditMode, listingId]);

  // Function to clean up temporary listing and Cloudinary folder
  const cleanupTemporaryListing = async () => {
    if (!isEditMode && tempListingId && !isSubmitting) {
      console.log(`Cleaning up temporary listing: ${tempListingId}`);
      
      try {
        // Delete the temporary listing from Supabase and Cloudinary
        const response = await fetch(`/api/listings/delete-temp?id=${tempListingId}${cloudinaryFolder ? `&folderPath=${encodeURIComponent(cloudinaryFolder)}` : ''}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          console.log(`Successfully cleaned up temporary listing: ${tempListingId}`);
        } else {
          console.error(`Failed to clean up temporary listing: ${tempListingId}`);
        }
      } catch (error) {
        console.error(`Error cleaning up temporary listing: ${tempListingId}`, error);
      }
    }
  };

  // Fetch listing data if in edit mode
  const fetchListingData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/listings?id=${listingId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listing');
      }
      
      const data = await response.json();
      
      // Set main category
      setSelectedCategory(data.property_type);
      
      // Set listing status
      setListingStatus(data.listing_status);
      
      // Set sub-category based on property type
      if (data.property_type === 'konut' && data.konut_details?.[0]) {
        setSelectedType(data.konut_details[0].konut_type);
      } else if (data.property_type === 'ticari' && data.ticari_details?.[0]) {
        setSelectedType(data.ticari_details[0].ticari_type);
      } else if (data.property_type === 'arsa' && data.arsa_details?.[0]) {
        setSelectedType(data.arsa_details[0].arsa_type);
      } else if (data.property_type === 'vasita' && data.vasita_details?.[0]) {
        setSelectedType(data.vasita_details[0].vasita_type);
      }
      
      // Prepare form data based on property type
      const formDataObj: Record<string, any> = {
        id: data.id, // Düzenleme modunda id'yi formData'da saklama - kritik!
        title: data.title,
        description: data.description,
        price: data.price
      };
      
      // Add property-specific fields
      if (data.property_type === 'konut' && data.konut_details?.[0]) {
        const konutDetails = data.konut_details[0];
        Object.assign(formDataObj, {
          grossArea: konutDetails.gross_sqm,
          netArea: konutDetails.net_sqm,
          roomCount: konutDetails.room_count,
          buildingAge: konutDetails.building_age,
          floor: konutDetails.floor,
          totalFloors: konutDetails.total_floors,
          heating: konutDetails.heating,
          hasBalcony: konutDetails.has_balcony,
          hasElevator: konutDetails.has_elevator,
          isFurnished: konutDetails.is_furnished,
          allowsTrade: konutDetails.allows_trade,
          isEligibleForCredit: konutDetails.is_eligible_for_credit
        });
      } else if (data.property_type === 'ticari' && data.ticari_details?.[0]) {
        const ticariDetails = data.ticari_details[0];
        Object.assign(formDataObj, {
          grossArea: ticariDetails.gross_sqm,
          netArea: ticariDetails.net_sqm,
          roomCount: ticariDetails.room_count,
          buildingAge: ticariDetails.building_age,
          floor: ticariDetails.floor,
          totalFloors: ticariDetails.total_floors,
          heating: ticariDetails.heating,
          isExchangeable: ticariDetails.allows_trade,
          isEligibleForCredit: ticariDetails.is_eligible_for_credit
        });
      } else if (data.property_type === 'arsa' && data.arsa_details?.[0]) {
        const arsaDetails = data.arsa_details[0];
        Object.assign(formDataObj, {
          sqm: arsaDetails.sqm,
          kaks: arsaDetails.kaks,
          isExchangeable: arsaDetails.allows_trade,
          isEligibleForCredit: arsaDetails.is_eligible_for_credit
        });
      } else if (data.property_type === 'vasita' && data.vasita_details?.[0]) {
        const vasitaDetails = data.vasita_details[0];
        Object.assign(formDataObj, {
          brand: vasitaDetails.brand,
          model: vasitaDetails.model,
          subModel: vasitaDetails.sub_model,
          kilometer: vasitaDetails.kilometer,
          fuelType: vasitaDetails.fuel_type,
          transmission: vasitaDetails.transmission,
          color: vasitaDetails.color,
          hasWarranty: vasitaDetails.has_warranty,
          hasDamageRecord: vasitaDetails.has_damage_record,
          allowsTrade: vasitaDetails.allows_trade
        });
      }
      
      // Add address data if available
      if (data.addresses && data.addresses[0]) {
        const address = data.addresses[0];
        Object.assign(formDataObj, {
          province: address.province,
          district: address.district,
          neighborhood: address.neighborhood,
          fullAddress: address.full_address
        });
      }
      
      // Add images if available
      if (data.images && data.images.length > 0) {
        // Convert Cloudinary images to the format expected by the form
        const existingPhotos = data.images.map((img: any) => ({
          id: img.cloudinary_id,
          url: img.url,
          preview: img.url,
          isExisting: true
        }));
        
        formDataObj.photos = existingPhotos;
      }
      
      setFormData(formDataObj);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching listing:', error);
      alert('İlan bilgileri yüklenirken bir hata oluştu.');
      router.push('/admin/panel');
    }
  };

  // Calculate total steps based on property type
  const getTotalSteps = useCallback(() => {
    if (selectedCategory === "vasita") {
      return 5; // Category > Details > Photos > Preview > Confirm
    }
    return 6; // Category > Details > Address > Photos > Preview > Confirm
  }, [selectedCategory]);

  // Step titles based on property type
  const stepTitles = useMemo(() => {
    return selectedCategory === "vasita" 
      ? ["Kategori Seçimi", "Bilgi Girişi", "Fotoğraf Yükleme", "Önizleme", "Onay"] 
      : ["Kategori Seçimi", "Bilgi Girişi", "Adres Bilgileri", "Fotoğraf Yükleme", "Önizleme", "Onay"];
  }, [selectedCategory]);

  // Visual step number for the progress bar
  const getVisualStepNumber = (actualStep: number) => {
    if (selectedCategory === "vasita") {
      // Skip address step for vehicles
      return actualStep;
    }
    return actualStep;
  };

  // Calculate progress percentage for the progress bar
  const calculateProgressPercentage = () => {
    // For the last step, always show 100%
    if (currentStep === getTotalSteps()) {
      return 100;
    } else {
      // Normal calculation for other steps
      return ((currentStep - 1) / (getTotalSteps() - 1)) * 100;
    }
  };

  // Validation function to check if the current step is valid
  const validateCurrentStep = useCallback(() => {
    if (currentStep === 1) {
      // Step 1: Category Selection
      if (selectedCategory === "vasita") {
        // For vasita, we don't need listing status
        return !!(selectedCategory && selectedType);
      }
      return !!(selectedCategory && selectedType && listingStatus);
    }

    if (currentStep === 2) {
      // Check required fields based on the selected category
      if (selectedCategory === "konut") {
        // For prefabrik, only validate title, description and price
        if (selectedType === "prefabrik") {
          return !!(
            formData.title && 
            formData.description && 
            formData.price
          );
        }
        
        // For other konut types, validate all required fields
        return !!(
          formData.title && 
          formData.description && 
          formData.price && 
          formData.grossArea && 
          formData.netArea && 
          formData.roomCount && 
          formData.buildingAge && 
          formData.floor && 
          formData.totalFloors
        );
      }
      
      if (selectedCategory === "ticari") {
        // Special validation for taksi_hatti and otobus_hatti
        if (selectedType === "otobus_hatti" || selectedType === "taksi_hatti") {
          return !!(
            formData.title && 
            formData.description && 
            formData.price
          );
        }
        
        // Normal validation for other ticari types
        return !!(
          formData.title && 
          formData.description && 
          formData.price && 
          formData.grossArea && 
          formData.buildingAge
        );
      }
      
      if (selectedCategory === "arsa") {
        return !!(
          formData.title && 
          formData.description && 
          formData.price && 
          formData.sqm
        );
      }
      
      if (selectedCategory === "vasita") {
        return !!(
          formData.title && 
          formData.description && 
          formData.price && 
          formData.brand && 
          formData.model &&
          formData.kilometer &&
          formData.fuelType
        );
      }
      
      return false;
    }

    if (currentStep === 3) {
      // Address form validation - only required for non-vasita listings
      if (selectedCategory === "vasita") {
        return true; // Skip address validation for vasita
      }
      return !!(formData.district && formData.neighborhood);
    }

    if (currentStep === 4) {
      // Photo upload validation (no required fields, can proceed without photos)
      return true;
    }

    return true;
  }, [currentStep, selectedCategory, selectedType, formData, listingStatus, getTotalSteps]);

  // Update validation state whenever relevant states change
  useEffect(() => {
    const isValid = validateCurrentStep();
    setIsCurrentStepValid(isValid);
  }, [formData, currentStep, selectedCategory, selectedType, listingStatus, validateCurrentStep, getTotalSteps]);

  const handleNext = () => {
    if (currentStep < getTotalSteps() - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === getTotalSteps() - 1) {
      // On the preview step, go to the final confirmation step
      setCurrentStep(getTotalSteps());
    } else {
      // On the confirmation step, submit the form
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    // For vasita, skip address step when going back
    if (currentStep === 4 && selectedCategory === "vasita") {
      setCurrentStep(2); // Go back to details (step 2)
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = async () => {
    setShowCancelDialog(false);
    
    // Clean up temporary listing before navigating away
    await cleanupTemporaryListing();
    
    router.push("/admin/panel");
  };

  const closeCancelDialog = () => {
    setShowCancelDialog(false);
  };

  const updateFormData = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  const openConfirmDialog = () => {
    setShowConfirmDialog(true);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
  };

  const handleSubmit = async () => {
    // Final validation before submission
    if (selectedCategory !== 'vasita' && !listingStatus) {
      alert("İlan durumu (satılık/kiralık) seçilmeden ilan eklenemez.");
      return;
    }
    
    setIsSubmitting(true);
    closeConfirmDialog();
    
    try {
      // Common data for both create and update
      const listingData: any = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        property_type: selectedCategory,
        listing_status: selectedCategory === 'vasita' ? 'satilik' : handleEnumField(listingStatus),
      };
      
      // If editing, add the ID
      if (isEditMode) {
        listingData.id = listingId;
      } else {
        // Use the temporary listing ID we created at the beginning
        listingData.id = tempListingId;
      }
      
      // Handle photos
      let uploadedPhotos = [];
      if (formData.photos && formData.photos.length > 0) {
        // Check if we're in edit mode and title has changed
        let shouldRenameFolder = false;
        let oldFolderPath = null;
        
        if (isEditMode) {
          // Find the first existing photo to get the folder path
          const existingPhoto = formData.photos.find((photo: any) => photo.isExisting);
          if (existingPhoto && existingPhoto.id) {
            // Extract folder path from the photo ID
            const parts = existingPhoto.id.split('/');
            parts.pop(); // Remove the last part (image_X)
            oldFolderPath = parts.join('/');
            
            // Always try to rename the folder when in edit mode
            shouldRenameFolder = true;
          }
        }
        
        // Filter out existing photos that don't need to be re-uploaded
        const newPhotos = formData.photos.filter((photo: any) => !photo.isExisting);
        const existingPhotos = formData.photos.filter((photo: any) => photo.isExisting);
        
        console.log(`Processing photos: ${newPhotos.length} new, ${existingPhotos.length} existing`);
        
        // Check if photos have already been uploaded during the form process
        // If they have status 'uploaded' or have an id but aren't marked as existing, they've already been uploaded
        const alreadyUploadedPhotos = newPhotos.filter((photo: any) => photo.status === 'uploaded' || (photo.id && !photo.isExisting));
        const photosNeedingUpload = newPhotos.filter((photo: any) => photo.status !== 'uploaded' && !photo.id);
        
        console.log(`Photos already uploaded: ${alreadyUploadedPhotos.length}, Photos needing upload: ${photosNeedingUpload.length}`);
        
        // Use already uploaded photos directly
        const alreadyUploadedPhotoData = alreadyUploadedPhotos.map((photo: any) => ({
          id: photo.id,
          url: photo.url || '',
          preview: photo.preview,
          isExisting: false
        }));
        
        // Upload new photos if there are any and if we have the upload function
        if (photosNeedingUpload.length > 0 && formData.uploadPhotosToCloudinary) {
          console.log(`Yeni fotoğraflar yükleniyor (${photosNeedingUpload.length} adet), edit mode: ${isEditMode ? 'evet' : 'hayır'}, listing ID: ${listingData.id}`);
          
          // Make sure title is available for folder naming
          const defaultTitle = `${selectedCategory}-${selectedType}${listingStatus ? `-${listingStatus}` : ''}`;
          listingData.title = listingData.title || defaultTitle || `listing-${listingData.id}`;
          
          try {
            console.log('uploadPhotosToCloudinary çağrılıyor, mevcut klasör korunmalı...');
            uploadedPhotos = await formData.uploadPhotosToCloudinary(selectedCategory, listingData.id);
            console.log(`Başarıyla ${uploadedPhotos.length} fotoğraf yüklendi, ID'ler:`, uploadedPhotos.map((p: any) => p.id));
          } catch (error) {
            console.error('Fotoğraf yükleme hatası:', error);
            alert('Fotoğraflar yüklenirken bir hata oluştu. Lütfen tekrar deneyiniz.');
            setIsSubmitting(false);
            return;
          }
        } else {
          console.log('Yeni fotoğraf yok veya tüm fotoğraflar zaten yüklenmiş.');
          // Use the already uploaded photos
          uploadedPhotos = alreadyUploadedPhotoData;
        }
        
        // Include existing photos in the final photos array
        const existingPhotoData = existingPhotos.map((photo: any) => ({
          id: photo.id,
          url: photo.url,
          isExisting: true
        }));
        
        // Ensure we don't have duplicates in existingPhotoData
        const uniqueExistingPhotos = [];
        const seenIds = new Set<string>();
        
        for (const photo of existingPhotoData) {
          if (!seenIds.has(photo.id)) {
            seenIds.add(photo.id);
            uniqueExistingPhotos.push(photo);
          } else {
            console.log(`Skipping duplicate existing photo: ${photo.id}`);
          }
        }
        
        // Combine existing, already uploaded, and newly uploaded photos
        listingData.photos = [...uniqueExistingPhotos, ...uploadedPhotos];
        
        console.log(`Final photos count: ${listingData.photos.length}`);
        console.log('Final photos:', listingData.photos.map((p: any) => p.id));
        
        // Add photos to delete if any - ONLY include photos that were explicitly removed by the user
        if (formData.photosToDelete && formData.photosToDelete.length > 0) {
          listingData.photosToDelete = formData.photosToDelete;
          console.log(`Photos to delete (explicitly removed by user): ${listingData.photosToDelete.length}`);
          console.log('Photos to delete IDs:', listingData.photosToDelete);
        } else {
          // Ensure photosToDelete is always defined in the request, even if empty
          listingData.photosToDelete = [];
          console.log('No photos to delete');
        }
        
        // If we need to rename the folder, add this information
        if (shouldRenameFolder && oldFolderPath) {
          // Create the new folder path with the updated title
          const parts = oldFolderPath.split('/');
          const baseFolder = parts.slice(0, -1).join('/'); // Get the base folder path
          const sanitizedTitle = listingData.title.toLowerCase()
            .replace(/[çğıöşü]/g, (c: string) => ({ 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' })[c as keyof { 'ç': string; 'ğ': string; 'ı': string; 'ö': string; 'ş': string; 'ü': string; }] || c)
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .substring(0, 50);
          
          const newFolderPath = `${baseFolder}/${sanitizedTitle}`;
          
          // Always add folder rename info in edit mode, even if paths are the same
          // This ensures the backend will process the rename operation and update database records
          console.log(`Will rename folder from ${oldFolderPath} to ${newFolderPath}`);
          listingData.folderRename = {
            oldPath: oldFolderPath,
            newPath: newFolderPath
          };
        } else if (!isEditMode && cloudinaryFolder) {
          // For new listings, rename the temporary ID folder to title-based folder
          const baseFolder = `ceyhun-emlak/${selectedCategory}`;
          const sanitizedTitle = listingData.title.toLowerCase()
            .replace(/[çğıöşü]/g, (c: string) => ({ 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' })[c as keyof { 'ç': string; 'ğ': string; 'ı': string; 'ö': string; 'ş': string; 'ü': string; }] || c)
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .substring(0, 50);
          
          const newFolderPath = `${baseFolder}/${sanitizedTitle}`;
          
          console.log(`Will rename folder from ${cloudinaryFolder} to ${newFolderPath}`);
          listingData.folderRename = {
            oldPath: cloudinaryFolder,
            newPath: newFolderPath
          };
        }
      }
      
      // Add category-specific fields
      if (selectedCategory === 'konut') {
        listingData.konut_type = handleEnumField(selectedType);
        
        // For prefabrik, only use title, description, and price
        if (selectedType === 'prefabrik') {
          // Set default values for required fields in the database
          listingData.gross_sqm = 0;
          listingData.net_sqm = 0;
          listingData.room_count = handleEnumField('1+0');
          listingData.building_age = 0;
          listingData.floor = 0;
          listingData.total_floors = 1;
          listingData.heating = null;
          listingData.has_balcony = false;
          listingData.has_elevator = false;
          listingData.is_furnished = false;
          listingData.allows_trade = false;
          listingData.is_eligible_for_credit = false;
        } else {
          // For other konut types, use all form data
          listingData.gross_sqm = parseFloat(formData.grossArea);
          listingData.net_sqm = parseFloat(formData.netArea);
          
          // Set room_count based on property type
          if (selectedType === 'bina') {
            // For buildings, set a default room count
            listingData.room_count = handleEnumField('1+0');
            // Add apartments per floor field
            listingData.apartments_per_floor = parseInt(formData.apartmentsPerFloor);
          } else {
            listingData.room_count = handleEnumField(formData.roomCount);
          }
          
          listingData.building_age = parseInt(formData.buildingAge);
          
          // Set floor based on property type
          if (selectedType === 'villa' || selectedType === 'mustakil_ev' || selectedType === 'bina') {
            // For villas, detached houses, and buildings, set a default floor
            listingData.floor = 0;
          } else {
            listingData.floor = parseInt(formData.floor || "0");
          }
          
          listingData.total_floors = parseInt(formData.totalFloors);
          listingData.heating = handleEnumField(formData.heating);
          listingData.has_balcony = formData.hasBalcony || false;
          listingData.has_elevator = formData.hasElevator || false;
          listingData.is_furnished = formData.isFurnished || false;
          listingData.allows_trade = formData.allowsTrade || false;
          listingData.is_eligible_for_credit = formData.isEligibleForCredit || false;
        }
      } else if (selectedCategory === 'ticari') {
        listingData.ticari_type = handleEnumField(selectedType);
        
        // For otobüs hattı and taksi hattı, set default values for required fields
        if (selectedType === 'otobus_hatti' || selectedType === 'taksi_hatti') {
          listingData.gross_sqm = 0; // Set a default value for required field
          listingData.room_count = 0; // Set a default value for required field
          listingData.building_age = 0; // Set a default value for required field
          listingData.floor = null;
          listingData.total_floors = null;
          listingData.heating = null;
          listingData.allows_trade = false;
          listingData.is_eligible_for_credit = false;
        } else {
          // For other ticari types, use the form data
          listingData.gross_sqm = parseFloat(formData.grossArea);
          listingData.net_sqm = formData.netArea ? parseFloat(formData.netArea) : null;
          listingData.room_count = formData.roomCount ? parseInt(formData.roomCount) : null;
          listingData.building_age = parseInt(formData.buildingAge);
          
          // For villa, fabrika, plaza, and bina, set floor to null
          if (selectedType === 'villa' || selectedType === 'fabrika' || selectedType === 'plaza' || selectedType === 'bina') {
            listingData.floor = null;
          } else {
            listingData.floor = formData.floor ? parseInt(formData.floor) : null;
          }
          
          listingData.total_floors = formData.totalFloors ? parseInt(formData.totalFloors) : null;
          listingData.heating = handleEnumField(formData.heating);
          listingData.allows_trade = formData.isExchangeable || false;
          listingData.is_eligible_for_credit = formData.isEligibleForCredit || false;
        }
      } else if (selectedCategory === 'arsa') {
        listingData.arsa_type = handleEnumField(selectedType);
        listingData.sqm = parseFloat(formData.sqm);
        listingData.kaks = formData.kaks ? parseFloat(formData.kaks) : null;
        listingData.tapu_durumu = formData.tapuDurumu ? handleEnumField(formData.tapuDurumu) : null;
        listingData.allows_trade = formData.isExchangeable || false;
        listingData.is_eligible_for_credit = formData.isEligibleForCredit || false;
      } else if (selectedCategory === 'vasita') {
        listingData.vasita_type = handleEnumField(selectedType);
        listingData.brand = formData.brand;
        listingData.model = formData.model;
        listingData.sub_model = formData.subModel || '';
        listingData.kilometer = parseInt(formData.kilometer);
        listingData.fuel_type = handleEnumField(formData.fuelType);
        listingData.transmission = handleEnumField(formData.transmission);
        listingData.color = formData.color;
        listingData.has_warranty = formData.hasWarranty || false;
        listingData.has_damage_record = formData.hasDamageRecord || false;
        listingData.allows_trade = formData.allowsTrade || false;
      }
      
      // Add address data if applicable
      if (selectedCategory !== "vasita") {
        listingData.address = {
          province: formData.province || 'Tokat',
          district: formData.district || 'Merkez',
          neighborhood: formData.neighborhood,
          full_address: formData.fullAddress
        };
      }
      
      // 4. Send the data to the appropriate API endpoint
      const endpoint = isEditMode ? '/api/listings/update' : '/api/listings';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} listing`);
      }
      
      // 5. Redirect to admin panel after successful submission with query parameter to show all listings
      router.push("/admin/panel?filter=all");
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'submitting'} listing:`, error);
      alert(`İlan ${isEditMode ? 'güncellenirken' : 'kaydedilirken'} bir hata oluştu. Lütfen tekrar deneyiniz.`);
      setIsSubmitting(false);
    }
  };

  const renderStep2Content = () => {
    if (selectedCategory === "konut") {
      return <KonutForm formData={formData} updateFormData={updateFormData} listingType={listingStatus} propertyType={selectedType} />;
    }
    
    if (selectedCategory === "ticari") {
      return <TicariForm formData={formData} updateFormData={updateFormData} listingType={listingStatus} propertyType={selectedType} />;
    }
    
    if (selectedCategory === "arsa") {
      return <ArsaForm formData={formData} updateFormData={updateFormData} listingType={listingStatus} />;
    }
    
    if (selectedCategory === "vasita") {
      return <VasitaForm formData={formData} updateFormData={updateFormData} />;
    }
    
    // Default placeholder
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">
          Lütfen bir kategori seçin.
        </p>
      </div>
    );
  };

  const renderStep3Content = () => {
    if (selectedCategory === "vasita") {
      return (
        <PhotoUpload 
          formData={formData} 
          updateFormData={updateFormData} 
          selectedCategory={selectedCategory} 
          tempListingId={tempListingId} 
          setCloudinaryFolder={setCloudinaryFolder}
        />
      );
    }
    return <AddressForm formData={formData} updateFormData={updateFormData} />;
  };

  const renderStep4Content = () => {
    if (selectedCategory === "vasita") {
      return <ListingDetailPreview formData={formData} selectedCategory={selectedCategory} selectedType={selectedType} listingStatus="satilik" />;
    }
    return (
      <PhotoUpload 
        formData={formData} 
        updateFormData={updateFormData} 
        selectedCategory={selectedCategory} 
        tempListingId={tempListingId} 
        setCloudinaryFolder={setCloudinaryFolder}
      />
    );
  };

  const renderStep5Content = () => {
    return (
      <ListingDetailPreview 
        formData={formData} 
        selectedCategory={selectedCategory} 
        selectedType={selectedType} 
        listingStatus={selectedCategory === 'vasita' ? 'satilik' : listingStatus} 
      />
    );
  };

  // Add event listener for beforeunload
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (currentStep > 1 && !isSubmitting) {
      // Standard text for beforeunload dialog
      const message = 'İlan ekleme işleminiz tamamlanmadı. Çıkmak istediğinize emin misiniz?';
      e.preventDefault();
      e.returnValue = message;
      return message;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'İlan Düzenle' : 'Yeni İlan Ekle'}</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              <X className="mr-2 h-4 w-4" /> İptal
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/admin/panel")}
            >
              Panele Dön
            </Button>
          </div>
        </div>
      </header>

      {/* Loading State */}
      {isLoading ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Loading size="large" text="İlan bilgileri yükleniyor..." />
        </div>
      ) : (
        // Main Content
        <DndProvider backend={HTML5Backend}>
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Progress Bar */}
            <div className="mb-8 relative">
              <div className="hidden md:flex justify-between mb-2">
                {stepTitles.map((step, index) => (
                  <div key={index} className="flex flex-col items-center relative" style={{ width: `${100 / stepTitles.length}%` }}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        getVisualStepNumber(currentStep) > index + 1
                          ? "bg-[#FFB000] text-black"
                          : getVisualStepNumber(currentStep) === index + 1
                          ? "bg-[#FFB000] text-black"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {getVisualStepNumber(currentStep) > index + 1 ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <span className="text-xs mt-1 text-center max-w-[100px]">{step}</span>
                  </div>
                ))}
              </div>
              
              {/* Mobile view - only show current step title */}
              <div className="md:hidden flex justify-between mb-2">
                <div className="flex items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-[#FFB000] text-black mr-2"
                  >
                    {getVisualStepNumber(currentStep)}
                  </div>
                  <span className="text-sm font-medium">{stepTitles[getVisualStepNumber(currentStep) - 1]}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {getVisualStepNumber(currentStep)}/{stepTitles.length}
                </div>
              </div>
              
              <div className="h-2 bg-gray-200 rounded-full relative">
                <div
                  className="absolute top-0 left-0 h-full bg-[#FFB000] transition-all duration-300 rounded-full"
                  style={{ 
                    width: `${calculateProgressPercentage()}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Category Breadcrumb Navigation */}
            {selectedCategory && (
              <div className="mb-4 flex items-center text-sm bg-gray-50 p-3 rounded-md overflow-x-auto border border-gray-100 shadow-sm">
                <span className="font-medium text-[#FFB000]">Kategori:</span>
                <div className="flex items-center ml-2">
                  <span className="font-medium text-gray-800">{getCategoryDisplayName(selectedCategory)}</span>
                  
                  {selectedType && (
                    <>
                      <ChevronRightIcon className="h-4 w-4 mx-1 text-gray-400" />
                      <span className="font-medium text-gray-800">
                        {getTypeDisplayName(selectedCategory, selectedType)}
                      </span>
                    </>
                  )}
                  
                  {selectedCategory !== 'vasita' && listingStatus && (
                    <>
                      <ChevronRightIcon className="h-4 w-4 mx-1 text-gray-400" />
                      <span className="font-medium text-gray-800">{getListingStatusDisplayName(listingStatus)}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Main content area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {currentStep === 1 && (
                  <CategorySelection 
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    listingStatus={listingStatus}
                    setListingStatus={setListingStatus}
                    onNext={handleNext}
                  />
                )}
                
                {currentStep === 2 && (
                  <Card className="border-2 border-[#FFB000]/20 shadow-xl">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-xl font-bold">
                        Adım 2: Bilgi Girişi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {/* Top navigation buttons */}
                      <div className="flex justify-between mb-6">
                        <Button
                          onClick={handlePrevious}
                          variant="outline"
                          className="border-[#FFB000] text-[#FFB000] hover:bg-[#FFB000]/5"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Geri
                        </Button>
                        
                        <Button
                          onClick={handleNext}
                          disabled={!isCurrentStepValid}
                          className="bg-[#FFB000] hover:bg-[#FFB000]/80 text-black font-medium"
                        >
                          Devam Et <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      {renderStep2Content()}
                      
                      <div className="pt-8 flex justify-between">
                        <Button
                          onClick={handlePrevious}
                          variant="outline"
                          className="border-[#FFB000] text-[#FFB000] hover:bg-[#FFB000]/5"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Geri
                        </Button>
                        
                        <Button
                          onClick={handleNext}
                          disabled={!isCurrentStepValid}
                          className="bg-[#FFB000] hover:bg-[#FFB000]/80 text-black font-medium"
                        >
                          Devam Et <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Address Form (Step 3 for Emlak) */}
                {currentStep === 3 && selectedCategory !== "vasita" && (
                  <Card className="border-2 border-[#FFB000]/20 shadow-xl">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-xl font-bold">Adım 3: Adres Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {/* Top navigation buttons */}
                      <div className="flex justify-between mb-6">
                        <Button
                          onClick={handlePrevious}
                          variant="outline"
                          className="border-[#FFB000] text-[#FFB000] hover:bg-[#FFB000]/5"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Geri
                        </Button>
                        
                        <Button
                          onClick={handleNext}
                          disabled={!isCurrentStepValid}
                          className="bg-[#FFB000] hover:bg-[#FFB000]/80 text-black font-medium"
                        >
                          Devam Et <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      <AddressForm formData={formData} updateFormData={updateFormData} />
                      
                      <div className="pt-8 flex justify-between">
                        <Button
                          onClick={handlePrevious}
                          variant="outline"
                          className="border-[#FFB000] text-[#FFB000] hover:bg-[#FFB000]/5"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Geri
                        </Button>
                        
                        <Button
                          onClick={handleNext}
                          disabled={!isCurrentStepValid}
                          className="bg-[#FFB000] hover:bg-[#FFB000]/80 text-black font-medium"
                        >
                          Devam Et <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Skip to Photo Upload for Vasita */}
                {currentStep === 3 && selectedCategory === "vasita" && (
                  <Card className="border-2 border-[#FFB000]/20 shadow-xl">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-xl font-bold">Adım 3: Fotoğraf Yükleme</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {/* Top navigation buttons */}
                      <div className="flex justify-between mb-6">
                        <Button
                          onClick={handlePrevious}
                          variant="outline"
                          className="border-[#FFB000] text-[#FFB000] hover:bg-[#FFB000]/5"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Geri
                        </Button>
                        
                        <Button
                          onClick={handleNext}
                          disabled={!isCurrentStepValid}
                          className="bg-[#FFB000] hover:bg-[#FFB000]/80 text-black font-medium"
                        >
                          Devam Et <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      <PhotoUpload 
                        formData={formData} 
                        updateFormData={updateFormData} 
                        selectedCategory={selectedCategory} 
                        tempListingId={tempListingId} 
                        setCloudinaryFolder={setCloudinaryFolder}
                      />
                      
                      <div className="pt-8 flex justify-between">
                        <Button
                          onClick={handlePrevious}
                          variant="outline"
                          className="border-[#FFB000] text-[#FFB000] hover:bg-[#FFB000]/5"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Geri
                        </Button>
                        
                        <Button
                          onClick={handleNext}
                          disabled={!isCurrentStepValid}
                          className="bg-[#FFB000] hover:bg-[#FFB000]/80 text-black font-medium"
                        >
                          Devam Et <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Photo Upload (Step 4 for Emlak) */}
                {currentStep === 4 && selectedCategory !== "vasita" && (
                  <Card className="border-2 border-[#FFB000]/20 shadow-xl">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-xl font-bold">
                        Adım 4: Fotoğraf Yükleme
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {/* Top navigation buttons */}
                      <div className="flex justify-between mb-6">
                        <Button
                          onClick={handlePrevious}
                          variant="outline"
                          className="border-[#FFB000] text-[#FFB000] hover:bg-[#FFB000]/5"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Geri
                        </Button>
                        
                        <Button
                          onClick={handleNext}
                          disabled={!isCurrentStepValid}
                          className="bg-[#FFB000] hover:bg-[#FFB000]/80 text-black font-medium"
                        >
                          Devam Et <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      <PhotoUpload 
                        formData={formData} 
                        updateFormData={updateFormData} 
                        selectedCategory={selectedCategory} 
                        tempListingId={tempListingId} 
                        setCloudinaryFolder={setCloudinaryFolder}
                      />
                      
                      <div className="pt-8 flex justify-between">
                        <Button
                          onClick={handlePrevious}
                          variant="outline"
                          className="border-[#FFB000] text-[#FFB000] hover:bg-[#FFB000]/5"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Geri
                        </Button>
                        
                        <Button
                          onClick={handleNext}
                          disabled={!isCurrentStepValid}
                          className="bg-[#FFB000] hover:bg-[#FFB000]/80 text-black font-medium"
                        >
                          Devam Et <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Preview (Step 4 for Vasita, Step 5 for Emlak) */}
                {((currentStep === 4 && selectedCategory === "vasita") || (currentStep === 5 && selectedCategory !== "vasita")) && (
                  <Card className="border-2 border-[#FFB000]/20 shadow-xl">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-xl font-bold">
                        Adım {selectedCategory === "vasita" ? "4" : "5"}: Önizleme
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {/* Top navigation buttons */}
                      <div className="flex justify-between mb-6">
                        <Button
                          onClick={handlePrevious}
                          variant="outline"
                          className="border-[#FFB000] text-[#FFB000] hover:bg-[#FFB000]/5"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Geri
                        </Button>
                        
                        <Button
                          onClick={handleNext}
                          className="bg-[#FFB000] hover:bg-[#FFB000]/80 text-black font-medium"
                        >
                          Devam Et <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      <ListingDetailPreview 
                        formData={formData} 
                        selectedCategory={selectedCategory} 
                        selectedType={selectedType} 
                        listingStatus={selectedCategory === 'vasita' ? 'satilik' : listingStatus} 
                      />
                      
                      <div className="pt-8 flex justify-between">
                        <Button
                          onClick={handlePrevious}
                          variant="outline"
                          className="border-[#FFB000] text-[#FFB000] hover:bg-[#FFB000]/5"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Geri
                        </Button>
                        
                        <Button
                          onClick={handleNext}
                          className="bg-[#FFB000] hover:bg-[#FFB000]/80 text-black font-medium"
                        >
                          Devam Et <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Final Confirmation Step */}
                {((currentStep === 5 && selectedCategory === "vasita") || (currentStep === 6 && selectedCategory !== "vasita")) && (
                  <Card className="border-2 border-[#FFB000]/20 shadow-xl">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-xl font-bold">
                        Adım {selectedCategory === "vasita" ? "5" : "6"}: İlan Onayı
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-center">
                          <Check className="h-16 w-16 text-green-500 mb-4" />
                        </div>
                        <h3 className="text-xl font-bold text-center">İlanınız Hazır!</h3>
                        <p className="text-gray-600 text-center">
                          İlanınız başarıyla hazırlandı. Onaylamak için aşağıdaki butona tıklayınız.
                        </p>
                        
                        <div className="pt-6 flex flex-col space-y-4">
                          <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-[#FFB000] hover:bg-[#FFB000]/80 text-black w-full flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                İlan {isEditMode ? 'Güncelleniyor' : 'Kaydediliyor'}...
                              </>
                            ) : (
                              <>
                                {isEditMode ? 'İlanı Güncelle' : 'İlanı Tamamla'}
                                <Check className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" /> Geri Dön
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </DndProvider>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-[90vw] w-[400px] bg-white rounded-lg border-0 shadow-lg p-4">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold text-black">İlanı {isEditMode ? 'Güncelle' : 'Tamamla'}</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm break-words">
              {isEditMode 
                ? "İlan bilgilerini güncellemek istediğinize emin misiniz?" 
                : "İlanı yayınlamak istediğinize emin misiniz?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeConfirmDialog}
              className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700"
            >
              İptal
            </Button>
            <Button
              type="button"
              className="flex-1 bg-[#FFB000] hover:bg-[#FFB000]/80 text-black font-medium"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> İşleniyor...
                </>
              ) : (
                <>
                  Onaylıyorum
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-[90vw] w-[400px] bg-white rounded-lg border-0 shadow-lg p-4">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold text-black">İşlemi İptal Et</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm break-words">
              İlan {isEditMode ? 'düzenleme' : 'ekleme'} işlemini iptal etmek istediğinize emin misiniz? Girdiğiniz tüm bilgiler kaybolacaktır.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeCancelDialog}
              className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700"
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmCancel}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium"
            >
              İptal Et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 