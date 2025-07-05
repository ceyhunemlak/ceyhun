"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

interface AddressFormProps {
  formData: any;
  updateFormData: (data: any) => void;
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

  // Neighborhoods by district - updated with real data
  const neighborhoodsByDistrict: Record<string, Array<{ value: string; label: string }>> = {
    merkez: [
      { value: "akdegirmen", label: "AKDEĞİRMEN" },
      { value: "alipasa", label: "ALİPAŞA" },
      { value: "altiyuzevler", label: "ALTIYÜZEVLER" },
      { value: "bahcelievler", label: "BAHÇELİEVLER" },
      { value: "bedestenlioglu", label: "BEDESTENLİOĞLU" },
      { value: "buyukbeybagi", label: "BÜYÜKBEYBAĞI" },
      { value: "camiikebir", label: "CAMİİKEBİR" },
      { value: "cemalettin", label: "CEMALETTİN" },
      { value: "cay", label: "ÇAY" },
      { value: "derbent", label: "DERBENT" },
      { value: "devegormez", label: "DEVEGÖRMEZ" },
      { value: "dogancibagları", label: "DOĞANCIBAĞLARI" },
      { value: "dogukent", label: "DOĞUKENT" },
      { value: "erenler", label: "ERENLER" },
      { value: "esentepe", label: "ESENTEPE" },
      { value: "geyras", label: "GEYRAS" },
      { value: "gezirlik", label: "GEZİRLİK" },
      { value: "gulbaharhatun", label: "GÜLBAHARHATUN" },
      { value: "gunesli", label: "GÜNEŞLİ" },
      { value: "hocaahmet", label: "HOCAAHMET" },
      { value: "kabeimescit", label: "KABE-İMESCİT" },
      { value: "kaleardi", label: "KALEARDI" },
      { value: "karsiyaka", label: "KARŞIYAKA" },
      { value: "kasikcibagları", label: "KAŞIKÇIBAĞLARI" },
      { value: "kemer", label: "KEMER" },
      { value: "kucukbeybagi", label: "KÜÇÜKBEYBAĞI" },
      { value: "kumbet", label: "KÜMBET" },
      { value: "mahmutpasa", label: "MAHMUTPAŞA" },
      { value: "mehmetpasa", label: "MEHMETPAŞA" },
      { value: "ogulbey", label: "OĞULBEY" },
      { value: "ortmelionu", label: "ÖRTMELİÖNÜ" },
      { value: "perakende", label: "PERAKENDE" },
      { value: "semerkant", label: "SEMERKANT" },
      { value: "seyitnecmettin", label: "SEYİTNECMETTİN" },
      { value: "sogukpinar", label: "SOĞUKPINAR" },
      { value: "topcam", label: "TOPÇAM" },
      { value: "topcubagi", label: "TOPÇUBAĞI" },
      { value: "yarahmet", label: "YARAHMET" },
      { value: "yeni", label: "YENİ" },
      { value: "yeniyurt", label: "YENİYURT" },
      { value: "yesilirmak", label: "YEŞİLIRMAK" },
      { value: "yesilova", label: "YEŞİLOVA" }
    ],
    almus: [
      { value: "almus-merkez", label: "Almus Merkez" },
      { value: "armutalan", label: "Armutalan" },
      { value: "cambulak", label: "Çambulak" },
      { value: "kuruseki", label: "Kuruseki" },
      { value: "sagirlar", label: "Sağırlar" },
      { value: "salkavak", label: "Salkavak" },
      { value: "yuvakoy", label: "Yuvaköy" }
    ],
    artova: [
      { value: "alpaslan", label: "ALPASLAN" },
      { value: "altinova", label: "ALTINOVA" },
      { value: "celikli", label: "ÇELİKLİ" },
      { value: "gaziosmanpasa", label: "GAZİOSMANPAŞA" },
      { value: "igdir", label: "İĞDİR" },
      { value: "istasyon", label: "İSTASYON" },
      { value: "kizilca", label: "KIZILCA" }
    ],
    basciftlik: [
      { value: "cumhuriyet", label: "CUMHURİYET" },
      { value: "fatih", label: "FATİH" },
      { value: "gencosman", label: "GENÇOSMAN" },
      { value: "karacaoren-alibaba", label: "KARACAÖREN ALİBABA" },
      { value: "karacaoren-asiroglu", label: "KARACAÖREN AŞIROĞLU" },
      { value: "karacaoren-gaziosmanpasa", label: "KARACAÖREN GAZİOSMANPAŞA" },
      { value: "sinanpasa", label: "SİNANPAŞA" }
    ],
    erbaa: [
      { value: "ziya-gokalp", label: "ZİYA GÖKALP" },
      { value: "yunus-emre", label: "YUNUS EMRE" },
      { value: "yildirim-beyazit", label: "YILDIRIM BEYAZIT" },
      { value: "yesilyurt", label: "YEŞİLYURT" },
      { value: "yeni", label: "YENİ" },
      { value: "yavuz-sultan-selim", label: "YAVUZ SULTAN SELİM" },
      { value: "osman-gazi", label: "OSMAN GAZİ" },
      { value: "mimar-sinan", label: "MİMAR SİNAN" },
      { value: "mevlana", label: "MEVLANA" },
      { value: "mehmet-akif", label: "MEHMET AKİF" },
      { value: "kurucay", label: "KURUÇAY" },
      { value: "kelkit", label: "KELKİT" },
      { value: "karsiyaka", label: "KARŞIYAKA" },
      { value: "ismet-pasa", label: "İSMET PAŞA" },
      { value: "gundogdu", label: "GÜNDOĞDU" },
      { value: "gazi-pasa", label: "GAZİ PAŞA" },
      { value: "gazi-osman-pasa", label: "GAZİ OSMAN PAŞA" },
      { value: "fevzipasa", label: "FEVZİPAŞA" },
      { value: "fatih-sultan-mehmet", label: "FATİH SULTAN MEHMET" },
      { value: "evyaba", label: "EVYABA" },
      { value: "ertugrulgazi", label: "ERTUĞRULGAZİ" },
      { value: "erek", label: "EREK" },
      { value: "cumhuriyet", label: "CUMHURİYET" },
      { value: "alacabal", label: "ALACABAL" },
      { value: "ahmet-yesevi", label: "AHMET YESEVİ" }
    ],
    niksar: [
      { value: "cengelli", label: "ÇENGELLİ" },
      { value: "hamidiye", label: "HAMİDİYE" },
      { value: "kumciftlik", label: "KUMÇİFTLİK" },
      { value: "cedit", label: "CEDİT" },
      { value: "gaziosmanpasa", label: "GAZİOSMANPAŞA" },
      { value: "haydarbey", label: "HAYDARBEY" },
      { value: "kultur", label: "KÜLTÜR" },
      { value: "baglar", label: "BAĞLAR" },
      { value: "sair-emrah", label: "ŞAİR EMRAH" },
      { value: "fatih", label: "FATİH" },
      { value: "kilicarslan", label: "KILIÇARSLAN" },
      { value: "donekse", label: "DÖNEKSE" },
      { value: "akpinar", label: "AKPINAR" },
      { value: "bengiler", label: "BENGİLER" },
      { value: "gaziahmet", label: "GAZİAHMET" },
      { value: "ayvaz", label: "AYVAZ" },
      { value: "ismet-pasa", label: "İSMET PAŞA" },
      { value: "cepnibey", label: "CEPNİBEY" },
      { value: "elli-yil", label: "50. YIL" },
      { value: "kirkkizlar", label: "KIRKKIZLAR" },
      { value: "bahcelievler", label: "BAHÇELİEVLER" },
      { value: "melikgazi", label: "MELİKGAZİ" },
      { value: "yusufshah", label: "YUSUFŞAH" },
      { value: "aydinlikevler", label: "AYDINLIKEVLER" },
      { value: "kayapasa", label: "KAYAPAŞA" }
    ],
    pazar: [
      { value: "erkilet", label: "ERKİLET" },
      { value: "esentepe", label: "ESENTEPE" },
      { value: "fatih", label: "FATİH" },
      { value: "gazi-osman-pasa", label: "GAZİ OSMAN PAŞA" },
      { value: "kazova", label: "KAZOVA" },
      { value: "mehmet-akif-ersoy", label: "MEHMET AKİF ERSOY" },
      { value: "merkez", label: "MERKEZ" },
      { value: "mrs-fevzi-cakmak", label: "MRŞ.FEVZİ ÇAKMAK" },
      { value: "seyitali", label: "SEYİTALİ" },
      { value: "sinanpasa", label: "SİNANPAŞA" },
      { value: "tekke", label: "TEKKE" },
      { value: "yesildere", label: "YEŞİLDERE" }
    ],
    resadiye: [
      { value: "resadiye-merkez", label: "Reşadiye Merkez" },
      { value: "baydarli", label: "Baydarlı" },
      { value: "bereketli", label: "Bereketli" },
      { value: "bozcali", label: "Bozçalı" }
    ],
    sulusaray: [
      { value: "fatih", label: "FATİH" },
      { value: "gaziosmanpasa", label: "GAZİOSMANPAŞA" },
      { value: "malum-seyit-tekke", label: "MALUM SEYİT TEKKE" },
      { value: "menderes", label: "MENDERES" }
    ],
    turhal: [
      { value: "asarcik", label: "ASARCIK" },
      { value: "bahar", label: "BAHAR" },
      { value: "borsa", label: "BORSA" },
      { value: "boyacilar", label: "BOYACILAR" },
      { value: "camikebir", label: "CAMİKEBİR" },
      { value: "celal", label: "CELAL" },
      { value: "cumhuriyet", label: "CUMHURİYET" },
      { value: "cevlikler", label: "ÇEVLİKLER" },
      { value: "emek", label: "EMEK" },
      { value: "fatih", label: "FATİH" },
      { value: "gazi-osman-pasa", label: "GAZİ OSMAN PAŞA" },
      { value: "gundogdu", label: "GÜNDOĞDU" },
      { value: "gunes", label: "GÜNEŞ" },
      { value: "gursel", label: "GÜRSEL" },
      { value: "hacilar", label: "HACILAR" },
      { value: "hamam", label: "HAMAM" },
      { value: "karaevli", label: "KARAEVLİ" },
      { value: "kayacik", label: "KAYACIK" },
      { value: "kazim-karabekir", label: "KAZIM KARABEKİR" },
      { value: "kova", label: "KOVA" },
      { value: "marasal-fevzi-cakmak", label: "MARAŞAL FEVZİ ÇAKMAK" },
      { value: "mevlana", label: "MEVLANA" },
      { value: "meydan", label: "MEYDAN" },
      { value: "mimar-sinan", label: "MİMAR SİNAN" },
      { value: "muftu", label: "MÜFTÜ" },
      { value: "nurkavak", label: "NURKAVAK" },
      { value: "ortakoy", label: "ORTAKÖY" },
      { value: "osmangazi", label: "OSMANGAZİ" },
      { value: "pazar", label: "PAZAR" },
      { value: "ray", label: "RAY" },
      { value: "ucgozen", label: "ÜÇGÖZEN" },
      { value: "varvara", label: "VARVARA" },
      { value: "yavuz-selim", label: "YAVUZ SELİM" },
      { value: "yesilirmak", label: "YEŞİLIRMAK" },
      { value: "yunus-emre", label: "YUNUS EMRE" }
    ],
    yesilyurt: [
      { value: "yuz-yil", label: "100. YIL" },
      { value: "cikrik", label: "ÇIKRIK" },
      { value: "cirdak", label: "ÇIRDAK" },
      { value: "gaziosmanpasa", label: "GAZİOSMANPAŞA" },
      { value: "kuscu", label: "KUŞÇU" },
      { value: "sehitler", label: "ŞEHİTLER" },
      { value: "turkmenler", label: "TÜRKMENLER" }
    ],
    zile: [
      { value: "alacamescitzir", label: "ALACAMESCİTZİR" },
      { value: "alamescirbala", label: "ALAMESCİTBALA" },
      { value: "alikadi", label: "ALİKADI" },
      { value: "bahcelievler", label: "BAHÇELİEVLER" },
      { value: "cedit", label: "CEDİT" },
      { value: "dincerler", label: "DİNÇERLER" },
      { value: "dutlupinar", label: "DUTLUPINAR" },
      { value: "hacimehmet", label: "HACIMEHMET" },
      { value: "istasyon", label: "İSTASYON" },
      { value: "kahya", label: "KAHYA" },
      { value: "kislik", label: "KİSLİK" },
      { value: "minareikebir", label: "MİNAREİKEBİR" },
      { value: "minareisagir", label: "MİNAREİSAĞIR" },
      { value: "nakkas", label: "NAKKAŞ" },
      { value: "orta", label: "ORTA" },
      { value: "seyhali", label: "ŞEYHALİ" },
      { value: "seyhkolu", label: "ŞEYHKOLU" },
      { value: "yunusemre", label: "YUNUSEMRE" },
      { value: "zincirli-ulya", label: "ZİNCİRLİ ÜLYA" },
      { value: "zincirli-sufla", label: "ZİNCİRLİSÜFLA" }
    ],
  };

  // Set default district if none is selected
  useEffect(() => {
    if (!form.district && districts.length > 0) {
      const defaultDistrict = districts[0].value;
      handleChange("district", defaultDistrict);
    }
  }, []);

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
  const getNeighborhoods = (district: string) => {
    if (!district) return [];
    return neighborhoodsByDistrict[district.toLowerCase()] || [];
  };

  const formatLabel = (label: string) => {
    return label
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
            Mahalle <span className="text-red-500 ml-1">*</span>
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
              <SelectValue placeholder={form.district ? "Mahalle seçin" : "Önce ilçe seçin"} />
            </SelectTrigger>
            <SelectContent>
              {getNeighborhoods(form.district).map((neighborhood) => (
                <SelectItem key={neighborhood.value} value={neighborhood.value}>
                  {formatLabel(neighborhood.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isFieldInvalid("neighborhood") && (
            <p className="text-red-500 text-sm mt-1">Mahalle seçimi zorunludur</p>
          )}
        </div>
      </div>
    </motion.div>
  );
} 