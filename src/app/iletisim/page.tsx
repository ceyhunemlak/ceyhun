"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  User,
  MessageSquare,
  Building,
  Smartphone
} from "lucide-react";

export default function Iletisim() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  // URL parametrelerini okuyarak konu seçimini yap ve forma scroll et
  useEffect(() => {
    const handleFormNavigation = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const subjectParam = urlParams.get('subject');
      const hash = window.location.hash;
      
      console.log('URL:', window.location.href);
      console.log('Subject param:', subjectParam);
      console.log('Hash:', hash);
      
      if (subjectParam) {
        console.log('Setting subject to:', subjectParam);
        setFormData(prev => ({
          ...prev,
          subject: subjectParam
        }));
      }
      
      // Hash varsa veya subject parametresi varsa forma scroll et
      if (hash === '#contact-form' || subjectParam) {
        console.log('Scrolling to form...');
        setTimeout(() => {
          const contactForm = document.getElementById('contact-form');
          if (contactForm) {
            console.log('Form element found, scrolling...');
            contactForm.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          } else {
            console.log('Form element not found!');
          }
        }, 500);
      }
    };

    // Sayfa yüklendiğinde çalıştır
    handleFormNavigation();

    // Hash değişikliklerini dinle
    const handleHashChange = () => {
      handleFormNavigation();
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form gönderme işlemi burada yapılacak
    console.log("Form gönderildi:", formData);
    // Başarı mesajı gösterilebilir
    alert("Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.");
    // Formu temizle
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <div 
        className="w-full h-auto min-h-[50vh] bg-gradient-to-r from-gray-800 to-black relative overflow-hidden flex items-center justify-center"
      >
        <div className="w-full py-16 sm:py-20 flex flex-col justify-center items-center px-3 sm:px-6 md:px-8 lg:px-12">
          <div className="w-full max-w-4xl mx-auto text-center">
            <div className="animate-slide-up">
              <h1 className="font-headings text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8">
                <span className="text-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">İletişim</span>
              </h1>
              <p className="text-white/80 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                Size nasıl yardımcı olabiliriz? Bizimle iletişime geçin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Contact Info Section */}
        <div className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-headings text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                <span className="text-primary text-2xl sm:text-3xl md:text-4xl font-bold">İletişim</span> Bilgilerimiz
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                7/24 size hizmet vermek için buradayız
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {/* Adres */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 text-center border-b-4 border-primary">
                <div className="size-16 sm:size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="text-primary" size={32} />
                </div>
                <h3 className="font-headings font-bold text-xl sm:text-2xl mb-6">Adreslerimiz</h3>
                <div className="space-y-3">
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Building className="text-primary" size={16} />
                      <span className="text-sm font-medium text-primary">Çarşı Ofis</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Alipaşa Mah. Gazipaşa Cad.<br />
                      No:3/A Ceysuit Tokat/Merkez
                    </p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Building className="text-primary" size={16} />
                      <span className="text-sm font-medium text-primary">Karşıyaka Ofis</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Altıyüzevler Mah. Vali Ayhan Çevik Bulv.<br />
                      Yunus Emre Sit. A Blok Tokat/Merkez
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 text-center border-b-4 border-primary">
                <div className="size-16 sm:size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="text-primary" size={32} />
                </div>
                <h3 className="font-headings font-bold text-xl sm:text-2xl mb-6">E-posta</h3>
                <div className="space-y-3">
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Building className="text-primary" size={16} />
                      <span className="text-sm font-medium text-primary">Ofis</span>
                    </div>
                    <a href="mailto:ceyhunemlak@hotmail.com" className="text-sm text-gray-700 hover:text-primary transition-colors block">
                      ceyhunemlak@hotmail.com
                    </a>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <User className="text-primary" size={16} />
                      <span className="text-sm font-medium text-primary">Ceyhun Çiftçi</span>
                    </div>
                    <a href="mailto:ceyhunbil@hotmail.com" className="text-sm text-gray-700 hover:text-primary transition-colors block">
                      ceyhunbil@hotmail.com
                    </a>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <User className="text-primary" size={16} />
                      <span className="text-sm font-medium text-primary">Berk Çiftçi</span>
                    </div>
                    <a href="mailto:bc250506@gmail.com" className="text-sm text-gray-700 hover:text-primary transition-colors block">
                      bc250506@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Telefon */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 text-center border-b-4 border-primary">
                <div className="size-16 sm:size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="text-primary" size={32} />
                </div>
                <h3 className="font-headings font-bold text-xl sm:text-2xl mb-6">Telefon</h3>
                <div className="space-y-2">
                  <div className="bg-primary/5 p-2 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Building className="text-primary" size={14} />
                      <span className="text-xs font-medium text-primary">Ofis</span>
                    </div>
                    <a href="tel:+903562280444" className="text-xs text-gray-700 hover:text-primary transition-colors block font-medium">
                      0 (356) 228 0 444
                    </a>
                  </div>
                  <div className="bg-primary/5 p-2 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <User className="text-primary" size={14} />
                      <span className="text-xs font-medium text-primary">Ceyhun</span>
                    </div>
                    <a href="tel:+905323850420" className="text-xs text-gray-700 hover:text-primary transition-colors block font-medium">
                      0 (532) 385 04 20
                    </a>
                  </div>
                  <div className="bg-primary/5 p-2 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <User className="text-primary" size={14} />
                      <span className="text-xs font-medium text-primary">Berk</span>
                    </div>
                    <a href="tel:+905366067071" className="text-xs text-gray-700 hover:text-primary transition-colors block font-medium">
                      0 (536) 606 70 71
                    </a>
                  </div>
                  <div className="bg-primary/5 p-2 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <User className="text-primary" size={14} />
                      <span className="text-xs font-medium text-primary">Cenk</span>
                    </div>
                    <a href="tel:+905530036031" className="text-xs text-gray-700 hover:text-primary transition-colors block font-medium">
                      0 (553) 003 60 31
                    </a>
                  </div>
                  <div className="bg-primary/5 p-2 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Smartphone className="text-primary" size={14} />
                      <span className="text-xs font-medium text-primary">KKTC</span>
                    </div>
                    <a href="tel:+905428823560" className="text-xs text-gray-700 hover:text-primary transition-colors block font-medium">
                      0 (542) 882 35 60
                    </a>
                  </div>
                  <div className="bg-primary/5 p-2 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Phone className="text-primary" size={14} />
                      <span className="text-xs font-medium text-primary">Taksi</span>
                    </div>
                    <a href="tel:+905433850420" className="text-xs text-gray-700 hover:text-primary transition-colors block font-medium">
                      0 (543) 385 04 20
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>





        {/* Contact Form & Map Section */}
        <div className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Contact Form */}
              <div>
                <h2 id="contact-form" className="font-headings text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
                  Bize <span className="text-primary text-2xl sm:text-3xl md:text-4xl font-bold">Mesaj</span> Gönderin
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg mb-8">
                  Sorularınız, önerileriniz veya emlak ihtiyaçlarınız için bizimle iletişime geçin.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="Adınız ve soyadınız"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="Telefon numaranız"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      placeholder="E-posta adresiniz"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Konu
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    >
                      <option value="">Konu seçiniz</option>
                      <option value="satilik">Emlak Satış</option>
                      <option value="kiralik">Emlak Kiralama</option>
                      <option value="degerlendirme">Gayrimenkul Değerleme</option>
                      <option value="danismanlik">Emlak Danışmanlığı</option>
                      <option value="otomotiv">Vasıta Alım Satım</option>
                      <option value="genel">Genel Bilgi</option>
                      <option value="diger">Diğer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mesajınız *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                      placeholder="Mesajınızı buraya yazın..."
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Send size={20} />
                    <span>Mesaj Gönder</span>
                  </button>
                </form>
              </div>

              {/* Map */}
              <div>
                <h2 className="font-headings text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
                  <span className="text-primary text-2xl sm:text-3xl md:text-4xl font-bold">Konum</span>
                </h2>
                <div className="bg-gray-200 rounded-2xl overflow-hidden shadow-lg relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12223.293889!2d36.5544444!3d40.3166667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x408a7c8b8b8b8b8b%3A0x123456789abcdef!2zQWxpcGHFn2EgTWFoLiwgR2F6aXBhxZ9hIENhZC4gTm86My9BIENleXN1aXQgVG9rYXQvTWVya2V6!5e0!3m2!1str!2str!4v1234567890123!5m2!1str!2str"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-96 sm:h-[400px]"
                  ></iframe>
                  
                  {/* Map Legend */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
                    <h4 className="font-semibold text-sm mb-2 text-gray-800">Ofislerimiz</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-gray-700">Çarşı Ofis</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700">Karşıyaka Ofis</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Links */}
                  <div className="absolute bottom-4 right-4 space-y-2">
                    <a 
                      href="https://maps.google.com/?q=Alipaşa+Mahallesi,+Gazipaşa+Caddesi+3/A,+Tokat" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded-lg transition-colors shadow-lg"
                    >
                      Çarşı Ofis Yol Tarifi
                    </a>
                    <a 
                      href="https://maps.google.com/?q=Altıyüzevler+Mahallesi,+Vali+Ayhan+Çevik+Bulvarı,+Yunus+Emre+Sitesi+A+Blok,+Tokat" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-2 rounded-lg transition-colors shadow-lg"
                    >
                      Karşıyaka Ofis Yol Tarifi
                    </a>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                    <div className="flex items-start space-x-4">
                      <div className="size-12 bg-red-500/20 rounded-full flex items-center justify-center mt-1">
                        <MapPin className="text-red-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                          Çarşı Ofis
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          Alipaşa Mah. Gazipaşa Cad.<br />
                          No:3/A Ceysuit Tokat/Merkez<br />
                          <span className="text-red-600 font-medium">60100 Tokat</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="flex items-start space-x-4">
                      <div className="size-12 bg-blue-500/20 rounded-full flex items-center justify-center mt-1">
                        <MapPin className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                          Karşıyaka Ofis
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          Altıyüzevler Mah. Vali Ayhan Çevik Bulv.<br />
                          Yunus Emre Sit. A Blok Tokat/Merkez<br />
                          <span className="text-blue-600 font-medium">60100 Tokat</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-headings font-bold text-white mb-6 sm:mb-8">
              Hemen <span className="text-primary text-2xl sm:text-3xl md:text-4xl font-bold">Arayın</span>
            </h2>
            <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10">
              Emlak ihtiyaçlarınız için hemen bizimle iletişime geçin. Uzman ekibimiz size yardımcı olmaya hazır.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="tel:+905323850420" 
                className="inline-block bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                0 (532) 385 04 20
              </a>
              <a 
                href="tel:+903562280444" 
                className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                0 (356) 228 0 444
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
