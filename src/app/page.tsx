"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import FilterArea from "@/components/FilterArea";
import ListingsGrid from "@/components/ListingsGrid";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Home as HomeIcon, Building2, Map, Car } from "lucide-react";
import { Loading } from "@/components/ui/loading";

export default function Home() {
  const [categoryCountData, setCategoryCountData] = useState({
    konut: 0,
    ticari: 0,
    arsa: 0,
    vasita: 0,
    total: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Fetch listing counts from API
  useEffect(() => {
    const fetchListingCounts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/listings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        
        // Count listings by category
        const counts = {
          konut: data.filter((listing: any) => listing.property_type === 'konut').length,
          ticari: data.filter((listing: any) => listing.property_type === 'ticari').length,
          arsa: data.filter((listing: any) => listing.property_type === 'arsa').length,
          vasita: data.filter((listing: any) => listing.property_type === 'vasita').length,
          total: data.length
        };
        
        setCategoryCountData(counts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching listing counts:', error);
        setIsLoading(false);
      }
    };
    
    fetchListingCounts();
  }, []);

  // Category data with counts
  const categories = [
    {
      id: "konut",
      title: "Konut",
      description: "Daire, villa, müstakil ev, bina ve daha fazlası",
      image: "/images/ce.png",
      icon: <HomeIcon className="text-primary" size={28} />,
      count: categoryCountData.konut
    },
    {
      id: "ticari",
      title: "İş Yeri",
      description: "Ofis, mağaza, depo, fabrika ve daha fazlası",
      image: "/images/ce1.png",
      icon: <Building2 className="text-primary" size={28} />,
      count: categoryCountData.ticari
    },
    {
      id: "arsa",
      title: "Arsa",
      description: "Arsa, arazi, tarla, bahçe ve daha fazlası",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80",
      icon: <Map className="text-primary" size={28} />,
      count: categoryCountData.arsa
    },
    {
      id: "vasita",
      title: "Otomotiv",
      description: "Otomobil, motosiklet, ticari araç ve daha fazlası",
      image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80",
      icon: <Car className="text-primary" size={28} />,
      count: categoryCountData.vasita
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section with Parallax Effect */}
      <div 
        className="w-full h-auto min-h-[100vh] pt-16 sm:pt-20 pb-16 sm:pb-20 bg-cover bg-center relative overflow-hidden flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/ce.png')`,
          backgroundAttachment: "fixed"
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-center items-center px-3 sm:px-6 md:px-8 lg:px-12">
          <div className="w-full max-w-7xl mx-auto text-center mt-6 sm:mt-0">
          
          {/* Filter Area */}
            <div className="w-full max-w-7xl mx-auto animate-slide-up">
            <FilterArea />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className="flex-grow mt-10">
        {/* Categories Section */}
        <div className="py-10 sm:py-16 bg-gradient-to-b from-gray-900/10 to-white">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-12">
              <div className="relative">
                <h2 className="font-headings text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">Kategoriler</h2>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl">
                  İhtiyacınıza uygun kategoride arama yapın
                </p>
                <div className="absolute -left-3 sm:-left-4 top-0 w-1.5 sm:w-2 h-8 sm:h-12 bg-primary rounded-full"></div>
              </div>
              
              {!isLoading && (
                <div className="text-sm sm:text-base text-gray-600 font-medium">
                  Toplam: <span className="font-semibold">{categoryCountData.total}</span> ilan
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {categories.map((category) => (
                <Link key={category.id} href={`/ilanlar/${category.id}`} className="block">
                  <div className="category-card bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 group">
                    {/* Image container */}
                    <div className="relative h-36 sm:h-48 w-full overflow-hidden rounded-t-xl sm:rounded-t-2xl transform-gpu">
                      <Image
                        src={category.image}
                        alt={category.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Count badge */}
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md z-10">
                        {isLoading ? <Loading size="small" className="flex-row gap-1" text="Yükleniyor..." /> : `${category.count} ilan`}
                      </div>
                    </div>
                    
                    {/* Content container */}
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center mb-3 sm:mb-4">
                        {category.icon}
                      </div>
                      <h3 className="font-headings text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{category.title}</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">{category.description}</p>
                      <div className="flex items-center text-primary font-medium text-sm sm:text-base">
                        Tümünü Gör →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="py-10 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
        <ListingsGrid />
        </div>
        
        {/* Trust Banner */}
        <div className="bg-gradient-to-r from-gray-100 to-white py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-headings font-bold mb-4 sm:mb-6">
                Neden <span className="text-primary text-2xl sm:text-3xl md:text-4xl">Bizi</span> Tercih Etmelisiniz?
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl">
                Ceyhun Gayrimenkul Emlak olarak müşteri memnuniyetini en üst seviyede tutarak, 
                profesyonel hizmet anlayışımızla sektörde fark yaratıyoruz.
              </p>
            </div>
              
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
              <div className="bg-white p-6 sm:p-8 rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 border-b-4 border-primary">
                <div className="size-16 sm:size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="m3 11 18-5-5 18-4-4-3 3-3-10 10-3-4-4Z" />
                    </svg>
                  </div>
                <h3 className="font-headings font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-center">Hızlı Çözüm</h3>
                <p className="text-muted-foreground text-center text-sm sm:text-base">Zamanınızın değerli olduğunu biliyoruz. En kısa sürede çözüm sunuyoruz.</p>
                </div>
                
              <div className="bg-white p-6 sm:p-8 rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 border-b-4 border-primary">
                <div className="size-16 sm:size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                <h3 className="font-headings font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-center">Güvenilir Hizmet</h3>
                <p className="text-muted-foreground text-center text-sm sm:text-base">Şeffaf ve dürüst çalışma prensibimizle güven inşa ediyoruz.</p>
                </div>
                
              <div className="bg-white p-6 sm:p-8 rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 border-b-4 border-primary">
                <div className="size-16 sm:size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                <h3 className="font-headings font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-center">Uzman Ekip</h3>
                <p className="text-muted-foreground text-center text-sm sm:text-base">Deneyimli ve uzman kadromuzla profesyonel destek sunuyoruz.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div 
          className="relative py-12 sm:py-20 overflow-hidden"
          style={{
            background: "linear-gradient(to right, #1a1c2a, #2d2d3a)"
          }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <Image 
              src="/images/logo_white.png" 
              alt="Background Pattern" 
              fill 
              className="object-cover opacity-20"
            />
          </div>
          
          <div className="container relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-headings font-bold text-white mb-4 sm:mb-6">
              Gayrimenkul Yolculuğunuza <span className="text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Bugün</span> Başlayın
            </h2>
            <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10">
              Hayalinizdeki evi veya aracı bulmak için bizimle iletişime geçin. Size özel çözümler sunalım.
            </p>
            <Link 
              href="/ilanlar" 
              className="inline-block bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Tüm İlanları Görüntüle
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
