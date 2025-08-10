"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { 
  Award, 
  Users, 
  Building, 
  Clock, 
  CheckCircle, 
  Star, 
  Globe, 
  Target,
  Heart,
  Shield,
  Zap,
  TrendingUp
} from "lucide-react";

export default function Hakkimizda() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <div 
        className="w-full h-auto min-h-[70vh] pt-16 sm:pt-20 pb-16 sm:pb-20 bg-cover bg-center md:bg-fixed relative overflow-hidden flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/images/ce2.png')`
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-center items-center px-3 sm:px-6 md:px-8 lg:px-12">
          <div className="w-full max-w-6xl mx-auto text-center">
            <div className="animate-slide-up">
              <h1 className="font-headings text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8">
                <span className="text-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl">20 Yılı Aşkın</span> Deneyimle
              </h1>
              <h2 className="font-headings text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white/90 mb-8 sm:mb-12">
                Ceyhun Gayrimenkul Emlak
              </h2>
              <p className="text-white/80 text-lg sm:text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed">
                Hızlı, Kolay, Bol, Dijital ve Deneyimli hizmet anlayışımızla Tokat'ın güvenilir emlak partneri
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Stats Section */}
        <div className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-headings text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Rakamlarla <span className="text-primary text-2xl sm:text-3xl md:text-4xl font-bold">Ceyhun Gayrimenkul</span>
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Yılların verdiği deneyim ve güvenle sektörde lider konumdayız
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 text-center border-b-4 border-primary">
                <div className="size-16 sm:size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Clock className="text-primary" size={32} />
                </div>
                <h3 className="font-headings font-bold text-2xl sm:text-3xl md:text-4xl text-primary mb-2">20+</h3>
                <p className="text-muted-foreground font-medium">Yıllık Deneyim</p>
              </div>
              
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 text-center border-b-4 border-primary">
                <div className="size-16 sm:size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Globe className="text-primary" size={32} />
                </div>
                <h3 className="font-headings font-bold text-2xl sm:text-3xl md:text-4xl text-primary mb-2">4</h3>
                <p className="text-muted-foreground font-medium">İnternet Mağazası</p>
              </div>
              
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 text-center border-b-4 border-primary">
                <div className="size-16 sm:size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Building className="text-primary" size={32} />
                </div>
                <h3 className="font-headings font-bold text-2xl sm:text-3xl md:text-4xl text-primary mb-2">200+</h3>
                <p className="text-muted-foreground font-medium">Mülk Portföyü</p>
              </div>
              
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 text-center border-b-4 border-primary">
                <div className="size-16 sm:size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <TrendingUp className="text-primary" size={32} />
                </div>
                <h3 className="font-headings font-bold text-2xl sm:text-3xl md:text-4xl text-primary mb-2">125K+</h3>
                <p className="text-muted-foreground font-medium">Aylık Görüntülenme</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-headings text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Neden <span className="text-primary text-2xl sm:text-3xl md:text-4xl font-bold">Ceyhun Gayrimenkul</span>?
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                6 temel değerimizle sektörde fark yaratıyoruz
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              <div className="text-center group">
                <div className="size-20 sm:size-24 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="text-white" size={40} />
                </div>
                <h3 className="font-headings font-bold text-xl sm:text-2xl mb-4 group-hover:text-primary transition-colors">Hızlı</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Zamanınızın değerli olduğunu biliyoruz. En kısa sürede ihtiyacınıza uygun çözümler sunuyoruz.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="size-20 sm:size-24 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="text-white" size={40} />
                </div>
                <h3 className="font-headings font-bold text-xl sm:text-2xl mb-4 group-hover:text-primary transition-colors">Kolay</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Karmaşık süreçleri basitleştiriyor, emlak alım-satım işlemlerinizi kolaylaştırıyoruz.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="size-20 sm:size-24 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="text-white" size={40} />
                </div>
                <h3 className="font-headings font-bold text-xl sm:text-2xl mb-4 group-hover:text-primary transition-colors">Bol</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Geniş mülk portföyümüz ve fiyat yelpazemizdeki çeşitlilikle herkesin bütçesine uygun seçenekler.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="size-20 sm:size-24 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="text-white" size={40} />
                </div>
                <h3 className="font-headings font-bold text-xl sm:text-2xl mb-4 group-hover:text-primary transition-colors">Dijital</h3>
                <p className="text-muted-foreground leading-relaxed">
                  4 ayrı internet mağazamızla dijital platformlarda güçlü varlığımızla 7/24 hizmetinizdeyiz.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="size-20 sm:size-24 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Award className="text-white" size={40} />
                </div>
                <h3 className="font-headings font-bold text-xl sm:text-2xl mb-4 group-hover:text-primary transition-colors">Deneyimli</h3>
                <p className="text-muted-foreground leading-relaxed">
                  20 yılı aşkın sektör deneyimimizle her türlü emlak ihtiyacınızda uzman desteği sağlıyoruz.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="size-20 sm:size-24 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="text-white" size={40} />
                </div>
                <h3 className="font-headings font-bold text-xl sm:text-2xl mb-4 group-hover:text-primary transition-colors">Güvenilir</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Şeffaf ve dürüst çalışma prensibimizle müşterilerimizin güvenini kazanıyor, uzun vadeli ilişkiler kuruyoruz.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About Content Section */}
        <div className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="font-headings text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
                  Hikayemiz ve <span className="text-primary text-2xl sm:text-3xl md:text-4xl font-bold">Vizyonumuz</span>
                </h2>
                <div className="space-y-6 text-muted-foreground text-base sm:text-lg leading-relaxed">
                  <p>
                    20 yılı aşkın bir süredir Tokat'ta emlak sektöründe faaliyet gösteren Ceyhun Gayrimenkul, 
                    müşteri memnuniyetini ön planda tutarak güvenilir hizmet anlayışıyla sektörde öncü konumda yer almaktadır.
                  </p>
                  <p>
                    Konut, ticari, arsa ve otomotiv kategorilerinde geniş bir yelpazede hizmet veren firmamız, 
                    modern teknoloji ile geleneksel değerleri harmanlayarak müşterilerine en iyi deneyimi sunmaktadır.
                  </p>
                  <p>
                    4 ayrı internet mağazamız ve 200'ün üzerinde mülk bulunan zengin portföyümüzle, 
                    her bütçeye uygun seçenekler sunarak hayalinizdeki mülkü bulmanızda size yardımcı oluyoruz.
                  </p>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <Image
                    src="/images/ce1.png"
                    alt="Ceyhun Gayrimenkul Ofis"
                    width={600}
                    height={400}
                    className="rounded-2xl shadow-2xl w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-headings text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                <span className="text-primary text-2xl sm:text-3xl md:text-4xl font-bold">Değerlerimiz</span>
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                İş yapış şeklimizi belirleyen temel prensiplerimiz
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="size-16 sm:size-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="text-white" size={32} />
                </div>
                <h3 className="font-headings font-bold text-xl sm:text-2xl mb-4 text-blue-700">Güvenilirlik</h3>
                <p className="text-blue-600 leading-relaxed">
                  Şeffaf ve dürüst çalışma prensibimizle müşterilerimizin güvenini kazanıyor, 
                  uzun vadeli ilişkiler kuruyoruz.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="size-16 sm:size-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="text-white" size={32} />
                </div>
                <h3 className="font-headings font-bold text-xl sm:text-2xl mb-4 text-green-700">Müşteri Odaklılık</h3>
                <p className="text-green-600 leading-relaxed">
                  Her müşterimizin ihtiyaçlarını dinliyor, kişiye özel çözümler üreterek 
                  en uygun seçenekleri sunuyoruz.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="size-16 sm:size-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="text-white" size={32} />
                </div>
                <h3 className="font-headings font-bold text-xl sm:text-2xl mb-4 text-purple-700">Mükemmellik</h3>
                <p className="text-purple-600 leading-relaxed">
                  Sürekli gelişim ve yenilik anlayışımızla hizmet kalitemizi artırıyor, 
                  sektörde öncü olmaya devam ediyoruz.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div 
          className="relative py-16 sm:py-20 overflow-hidden"
          style={{
            background: "linear-gradient(to right, #1a1c2a, #2d2d3a)"
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <Image 
              src="/images/logo_white.png" 
              alt="Background Pattern" 
              fill 
              className="object-cover opacity-20"
            />
          </div>
          
          <div className="container relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-headings font-bold text-white mb-6 sm:mb-8">
              Hayalinizdeki Mülkü <span className="text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Birlikte</span> Bulalım
            </h2>
            <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              20 yılı aşkın deneyimimiz ve geniş portföyümüzle size en uygun seçenekleri sunmaya hazırız. 
              Bugün bizimle iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/ilanlar" 
                className="inline-block bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Tüm İlanları Görüntüle
              </a>
              <a 
                href="tel:+905323850420" 
                className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Hemen Ara: 0532 385 04 20
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
