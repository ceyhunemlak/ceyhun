"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo and About */}
          <div>
            <div className="mb-3 sm:mb-4">
              <Image
                src="/images/logo_black.png"
                alt="Ceyhun Emlak Logo"
                width={130}
                height={45}
                className="dark:hidden w-[130px] sm:w-[150px] h-auto"
              />
              <Image
                src="/images/logo_white.png"
                alt="Ceyhun Emlak Logo"
                width={130}
                height={45}
                className="hidden dark:block w-[130px] sm:w-[150px] h-auto"
              />
            </div>
            <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
              Tokat Merkez'de faaliyet gösteren emlak ağırlıklı gayrimenkul şirketi. 
              Güvenilir hizmet anlayışıyla sektörün öncü firmalarındandır.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a 
                href="#" 
                className="bg-accent hover:bg-accent/80 transition-colors p-2 rounded-full"
                aria-label="Facebook"
              >
                <Facebook size={16} className="sm:size-[18px]" />
              </a>
              <a 
                href="#" 
                className="bg-accent hover:bg-accent/80 transition-colors p-2 rounded-full"
                aria-label="Instagram"
              >
                <Instagram size={16} className="sm:size-[18px]" />
              </a>
              <a 
                href="#" 
                className="bg-accent hover:bg-accent/80 transition-colors p-2 rounded-full"
                aria-label="Twitter"
              >
                <Twitter size={16} className="sm:size-[18px]" />
              </a>
              <a 
                href="#" 
                className="bg-accent hover:bg-accent/80 transition-colors p-2 rounded-full"
                aria-label="Linkedin"
              >
                <Linkedin size={16} className="sm:size-[18px]" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="mt-6 sm:mt-0">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/ilanlar/emlak" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
                  Emlak İlanları
                </Link>
              </li>
              <li>
                <Link href="/ilanlar/vasita" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
                  Vasıta İlanları
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div className="mt-6 sm:mt-0">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Hizmetlerimiz</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/hizmetler/satis" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
                  Emlak Satış
                </Link>
              </li>
              <li>
                <Link href="/hizmetler/kiralama" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
                  Emlak Kiralama
                </Link>
              </li>
              <li>
                <Link href="/hizmetler/degerleme" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
                  Gayrimenkul Değerleme
                </Link>
              </li>
              <li>
                <Link href="/hizmetler/danismanlik" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
                  Emlak Danışmanlığı
                </Link>
              </li>
              <li>
                <Link href="/hizmetler/vasita" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
                  Vasıta Alım Satım
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="mt-6 sm:mt-0">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">İletişim</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start">
                <MapPin size={16} className="mr-2 mt-1 text-primary sm:size-[18px]" />
                <span className="text-muted-foreground text-sm sm:text-base">
                  Gazi Osman Paşa Bulvarı No: 123 Merkez / Tokat
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2 text-primary sm:size-[18px]" />
                <a href="tel:+905001234567" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base py-1">
                  0500 123 45 67
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2 text-primary sm:size-[18px]" />
                <a href="mailto:info@ceyhungroup.com" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base py-1">
                  info@ceyhungroup.com
                </a>
              </li>
              <li className="flex items-center">
                <Clock size={16} className="mr-2 text-primary sm:size-[18px]" />
                <span className="text-muted-foreground text-sm sm:text-base">
                  Pazartesi - Cumartesi: 09:00 - 18:00
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="border-t py-4 sm:py-6">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-muted-foreground text-xs sm:text-sm text-center sm:text-left">
            © {new Date().getFullYear()} Ceyhun Gayrimenkul Emlak. Tüm hakları saklıdır.
          </p>
          <div className="mt-3 sm:mt-0">
            <ul className="flex flex-wrap justify-center sm:justify-start space-x-3 sm:space-x-4 text-xs sm:text-sm">
              <li>
                <Link href="/gizlilik" className="text-muted-foreground hover:text-primary transition-colors py-1 block">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/kullanim-kosullari" className="text-muted-foreground hover:text-primary transition-colors py-1 block">
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link href="/kvkk" className="text-muted-foreground hover:text-primary transition-colors py-1 block">
                  KVKK
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 