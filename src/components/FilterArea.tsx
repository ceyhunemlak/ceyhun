"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, HomeIcon, Building2, Car, MapPin, ArrowRight, Map } from "lucide-react";
import Link from "next/link";

const FilterArea = () => {
  const [konutType, setKonutType] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [roomCount, setRoomCount] = useState("all");
  const [saleStatus, setSaleStatus] = useState("sale");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  
  // Neighborhoods by district data from admin panel
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
  
  // Function to get neighborhoods for selected district
  const getNeighborhoods = (district: string) => {
    if (!district) return [];
    return neighborhoodsByDistrict[district.toLowerCase()] || [];
  };
  
  // Handle district change
  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedNeighborhood(""); // Reset neighborhood when district changes
  };
  
  // Add effect to prevent text selection in filter area
  useEffect(() => {
    const filterArea = document.querySelector('.filter-area');
    if (filterArea) {
      // Prevent text selection on all elements in filter area
      filterArea.querySelectorAll('*').forEach((el: Element) => {
        if (el instanceof HTMLElement) {
          el.style.userSelect = 'none';
          el.style.webkitUserSelect = 'none';
          // @ts-ignore - These properties exist but TypeScript doesn't recognize them
          el.style.msUserSelect = 'none';
          // @ts-ignore
          el.style.mozUserSelect = 'none';
          
          // Prevent blue highlight on mobile
          // @ts-ignore - This property exists but TypeScript doesn't recognize it
          el.style.webkitTapHighlightColor = 'transparent';
          
          // Prevent default on double click
          el.addEventListener('mousedown', (e: MouseEvent) => {
            if (e.detail > 1) {
              e.preventDefault();
            }
          });
        }
      });
    }
  }, []);
  
  const formatLabel = (label: string) => {
    return label
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  return (
    <div 
      className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-5 md:py-8 glass-effect rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover-shadow no-select filter-area border border-white/30 max-h-[70vh] sm:max-h-none overflow-y-auto touch-pan-y" 
      style={{
        userSelect: 'none', 
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      } as React.CSSProperties}
    >
      <Tabs defaultValue="konut" className="w-full">
        <TabsList className="grid grid-cols-4 mb-3 sm:mb-6 md:mb-10 w-full h-auto p-1 sm:p-1.5 md:p-2 bg-gray-100/80 rounded-md sm:rounded-lg md:rounded-xl">
          <TabsTrigger 
            value="konut" 
            className="font-headings flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-1.5 sm:py-2.5 md:py-4 text-xs sm:text-sm md:text-base font-medium rounded-md transition-all duration-300 data-[state=active]:shadow-md"
          >
            <HomeIcon size={14} className="sm:size-[18px] md:size-[22px]" />
            <span>Konut</span>
          </TabsTrigger>
          <TabsTrigger 
            value="ticari" 
            className="font-headings flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-1.5 sm:py-2.5 md:py-4 text-xs sm:text-sm md:text-base font-medium rounded-md transition-all duration-300 data-[state=active]:shadow-md"
          >
            <Building2 size={14} className="sm:size-[18px] md:size-[22px]" />
            <span>Ticari</span>
          </TabsTrigger>
          <TabsTrigger 
            value="arsa" 
            className="font-headings flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-1.5 sm:py-2.5 md:py-4 text-xs sm:text-sm md:text-base font-medium rounded-md transition-all duration-300 data-[state=active]:shadow-md"
          >
            <Map size={14} className="sm:size-[18px] md:size-[22px]" />
            <span>Arsa</span>
          </TabsTrigger>
          <TabsTrigger value="vasita" asChild>
            <Link 
              href="/ilanlar/vasita" 
              className="font-headings flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 py-1.5 sm:py-2.5 md:py-4 text-xs sm:text-sm md:text-base font-medium w-full rounded-md hover:bg-gray-200/50 transition-all duration-300"
            >
              <Car size={14} className="sm:size-[18px] md:size-[22px]" />
              <span>Vasıta</span>
            </Link>
          </TabsTrigger>
        </TabsList>

        {/* Konut Content */}
        <TabsContent value="konut" className="space-y-3 sm:space-y-5 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-8">
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">İlan Durumu</Label>
                <Select value={saleStatus} onValueChange={setSaleStatus}>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="İlan Durumu Seçin">
                      {saleStatus === "sale" ? "Satılık" : "Kiralık"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="sale">Satılık</SelectItem>
                    <SelectItem value="rent">Kiralık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Konut Tipi</Label>
                <Select value={konutType} onValueChange={setKonutType}>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="Konut Tipi Seçin" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="daire">Daire</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="mustakil">Müstakil Ev</SelectItem>
                    <SelectItem value="bina">Bina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div>
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Fiyat Aralığı</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="Min TL" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                    />
                  </div>
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="Max TL" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Alan (m²)</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="Min m²" 
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                    />
                  </div>
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="Max m²" 
                      value={maxArea}
                      onChange={(e) => setMaxArea(e.target.value)}
                      className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Oda Sayısı</Label>
                <Select value={roomCount} onValueChange={setRoomCount}>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="Oda Sayısı Seçin" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="1+0">1+0</SelectItem>
                    <SelectItem value="1+1">1+1</SelectItem>
                    <SelectItem value="2+1">2+1</SelectItem>
                    <SelectItem value="3+1">3+1</SelectItem>
                    <SelectItem value="4+1">4+1</SelectItem>
                    <SelectItem value="5+1">5+1 ve üzeri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">İl/İlçe/Mahalle</Label>
                <div className="grid grid-cols-3 gap-1 sm:gap-1 md:gap-2">
                  <Select defaultValue="tokat">
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                      <SelectItem value="tokat">Tokat</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue placeholder="İlçe" />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
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
                  <Select 
                    value={selectedNeighborhood} 
                    onValueChange={setSelectedNeighborhood}
                    disabled={!selectedDistrict}
                  >
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue placeholder={selectedDistrict ? "Mahalle" : "İlçe Seçin"} />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200 max-h-[200px] sm:max-h-[250px] md:max-h-[300px]">
                      {getNeighborhoods(selectedDistrict).map((neighborhood) => (
                        <SelectItem key={neighborhood.value} value={neighborhood.value}>
                          {formatLabel(neighborhood.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-2 sm:mt-5 md:mt-10">
            <Button 
              size="sm"
              className="font-headings px-4 sm:px-6 md:px-10 py-2 sm:py-4 md:py-7 text-sm sm:text-base md:text-lg font-medium rounded-md sm:rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 bg-primary hover:bg-primary/90 group"
            >
              <Search className="mr-1.5 sm:mr-2 md:mr-3 group-hover:scale-110 transition-transform duration-300" size={14} />
              Ara
              <ArrowRight className="ml-1.5 sm:ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" size={12} />
            </Button>
          </div>
        </TabsContent>

        {/* Ticari Content - Apply similar responsive changes */}
        <TabsContent value="ticari" className="space-y-3 sm:space-y-5 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-8">
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">İlan Durumu</Label>
                <Select value={saleStatus} onValueChange={setSaleStatus}>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="İlan Durumu Seçin">
                      {saleStatus === "sale" ? "Satılık" : "Kiralık"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="sale">Satılık</SelectItem>
                    <SelectItem value="rent">Kiralık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">İş Yeri Tipi</Label>
                <Select>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="İş Yeri Tipi Seçin" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="dukkan">Dükkan</SelectItem>
                    <SelectItem value="depo">Depo</SelectItem>
                    <SelectItem value="fabrika">Fabrika</SelectItem>
                    <SelectItem value="atolye">Atölye</SelectItem>
                    <SelectItem value="plaza">Plaza</SelectItem>
                    <SelectItem value="ofis">Ofis</SelectItem>
                    <SelectItem value="cafe">Cafe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div>
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Fiyat Aralığı</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  <Input 
                    type="text" 
                    placeholder="Min TL" 
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                  <Input 
                    type="text" 
                    placeholder="Max TL" 
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                </div>
              </div>
              
              <div>
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Alan (m²)</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  <Input 
                    type="text" 
                    placeholder="Min m²" 
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                  <Input 
                    type="text" 
                    placeholder="Max m²" 
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Oda Sayısı</Label>
                <Select>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="Oda Sayısı Seçin" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">İl/İlçe/Mahalle</Label>
                <div className="grid grid-cols-3 gap-1 sm:gap-1 md:gap-2">
                  <Select defaultValue="tokat">
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                      <SelectItem value="tokat">Tokat</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue placeholder="İlçe Seçin" />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
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
                  <Select 
                    value={selectedNeighborhood} 
                    onValueChange={setSelectedNeighborhood}
                    disabled={!selectedDistrict}
                  >
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue placeholder={selectedDistrict ? "Mahalle" : "İlçe Seçin"} />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200 max-h-[200px] sm:max-h-[250px] md:max-h-[300px]">
                      {getNeighborhoods(selectedDistrict).map((neighborhood) => (
                        <SelectItem key={neighborhood.value} value={neighborhood.value}>
                          {formatLabel(neighborhood.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-2 sm:mt-5 md:mt-10">
            <Button 
              size="sm"
              className="font-headings px-4 sm:px-6 md:px-10 py-2 sm:py-4 md:py-7 text-sm sm:text-base md:text-lg font-medium rounded-md sm:rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 bg-primary hover:bg-primary/90 group"
            >
              <Search className="mr-1.5 sm:mr-2 md:mr-3 group-hover:scale-110 transition-transform duration-300" size={14} />
              Ara
              <ArrowRight className="ml-1.5 sm:ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" size={12} />
            </Button>
          </div>
        </TabsContent>

        {/* Arsa Content - Apply similar responsive changes */}
        <TabsContent value="arsa" className="space-y-3 sm:space-y-5 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-8">
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">İlan Durumu</Label>
                <Select value={saleStatus} onValueChange={setSaleStatus}>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="İlan Durumu Seçin">
                      {saleStatus === "sale" ? "Satılık" : "Kiralık"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="sale">Satılık</SelectItem>
                    <SelectItem value="rent">Kiralık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Arsa Tipi</Label>
                <Select>
                  <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                    <SelectValue placeholder="Arsa Tipi Seçin" />
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="tarla">Tarla</SelectItem>
                    <SelectItem value="bahce">Bahçe</SelectItem>
                    <SelectItem value="konut-imarli">Konut İmarlı</SelectItem>
                    <SelectItem value="ticari-imarli">Ticari İmarlı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div>
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Fiyat Aralığı</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  <Input 
                    type="text" 
                    placeholder="Min TL" 
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                  <Input 
                    type="text" 
                    placeholder="Max TL" 
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                </div>
              </div>
              
              <div>
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">Alan (m²)</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-4">
                  <Input 
                    type="text" 
                    placeholder="Min m²" 
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                  <Input 
                    type="text" 
                    placeholder="Max m²" 
                    className="py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all pl-2 sm:pl-3 md:pl-4 text-xs sm:text-sm md:text-base"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-4 md:space-y-6">
              <div className="relative">
                <Label className="font-headings mb-1 sm:mb-2 md:mb-3 block text-xs sm:text-sm md:text-base font-medium">İl/İlçe/Mahalle</Label>
                <div className="grid grid-cols-3 gap-1 sm:gap-1 md:gap-2">
                  <Select defaultValue="tokat">
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
                      <SelectItem value="tokat">Tokat</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue placeholder="İlçe Seçin" />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200">
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
                  <Select 
                    value={selectedNeighborhood} 
                    onValueChange={setSelectedNeighborhood}
                    disabled={!selectedDistrict}
                  >
                    <SelectTrigger className="w-full py-1.5 sm:py-3 md:py-6 rounded-md sm:rounded-lg md:rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 transition-all truncate text-xs sm:text-sm md:text-base">
                      <SelectValue placeholder={selectedDistrict ? "Mahalle" : "İlçe Seçin"} />
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className="rounded-xl border border-gray-200 max-h-[200px] sm:max-h-[250px] md:max-h-[300px]">
                      {getNeighborhoods(selectedDistrict).map((neighborhood) => (
                        <SelectItem key={neighborhood.value} value={neighborhood.value}>
                          {formatLabel(neighborhood.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-center h-full mt-6">
                <div className="bg-primary/10 rounded-xl p-4 flex items-center">
                  <MapPin className="text-primary mr-3" />
                  <p className="text-sm text-gray-600">Haritada Göster</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-2 sm:mt-5 md:mt-10">
            <Button 
              size="sm"
              className="font-headings px-4 sm:px-6 md:px-10 py-2 sm:py-4 md:py-7 text-sm sm:text-base md:text-lg font-medium rounded-md sm:rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 bg-primary hover:bg-primary/90 group"
            >
              <Search className="mr-1.5 sm:mr-2 md:mr-3 group-hover:scale-110 transition-transform duration-300" size={14} />
              Ara
              <ArrowRight className="ml-1.5 sm:ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" size={12} />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FilterArea; 