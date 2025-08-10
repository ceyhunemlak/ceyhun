"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Linkedin, Globe } from "lucide-react";

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
            Tokat'ın güvenilir emlak ofisi. Satılık-kiralık ev, daire, arsa ve iş yeri ilanları.   
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a 
                href="https://www.facebook.com/CeyhunGayrimenkulEmlak" 
                className="bg-accent hover:bg-accent/80 transition-colors p-2 rounded-full"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#1877F2" className="sm:size-[18px]">
                  <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/ceyhungayrimenkul/" 
                className="bg-accent hover:bg-accent/80 transition-colors p-2 rounded-full"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="sm:size-[18px]">
                  <radialGradient id="instagram-gradient" cx="30%" cy="107%" r="150%">
                    <stop offset="0%" stopColor="#fdf497" />
                    <stop offset="5%" stopColor="#fdf497" />
                    <stop offset="45%" stopColor="#fd5949" />
                    <stop offset="60%" stopColor="#d6249f" />
                    <stop offset="90%" stopColor="#285AEB" />
                  </radialGradient>
                  <path fill="url(#instagram-gradient)" d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2ZM12 7C10.6739 7 9.40215 7.52678 8.46447 8.46447C7.52678 9.40215 7 10.6739 7 12C7 13.3261 7.52678 14.5979 8.46447 15.5355C9.40215 16.4732 10.6739 17 12 17C13.3261 17 14.5979 16.4732 15.5355 15.5355C16.4732 14.5979 17 13.3261 17 12C17 10.6739 16.4732 9.40215 15.5355 8.46447C14.5979 7.52678 13.3261 7 12 7ZM18.5 6.75C18.5 6.41848 18.3683 6.10054 18.1339 5.86612C17.8995 5.6317 17.5815 5.5 17.25 5.5C16.9185 5.5 16.6005 5.6317 16.3661 5.86612C16.1317 6.10054 16 6.41848 16 6.75C16 7.08152 16.1317 7.39946 16.3661 7.63388C16.6005 7.8683 16.9185 8 17.25 8C17.5815 8 17.8995 7.8683 18.1339 7.63388C18.3683 7.39946 18.5 7.08152 18.5 6.75ZM12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9Z" />
                </svg>
              </a>
              <a 
                href="https://ceyhun.sahibinden.com/" 
                className="bg-accent hover:bg-accent/80 transition-colors p-2 rounded-full"
                aria-label="Sahibinden"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image src="/images/logos/sahibinden.png" width={16} height={16} alt="Sahibinden" className="sm:size-[18px]" />
              </a>
              <a 
                href="https://www.hepsiemlak.com/emlak-ofisi/ceyhun-emlak-tokat-70414" 
                className="bg-accent hover:bg-accent/80 transition-colors p-2 rounded-full"
                aria-label="Hepsiemlak"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image src="/images/logos/hepsiemlak.png" width={16} height={16} alt="Hepsiemlak" className="sm:size-[18px]" />
              </a>
              <a 
                href="https://www.emlakjet.com/emlak-ofisleri-detay/ceyhun-emlak-tokat-366865/" 
                className="bg-accent hover:bg-accent/80 transition-colors p-2 rounded-full"
                aria-label="Emlakjet"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image src="/images/logos/emlakjet.png" width={16} height={16} alt="Emlakjet" className="sm:size-[18px]" />
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
                <Link href="/iletisim?subject=satilik#contact-form" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
                  Emlak Satış
                </Link>
              </li>
              <li>
                <Link href="/iletisim?subject=kiralik#contact-form" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
                  Emlak Kiralama
                </Link>
              </li>
              <li>
                <Link href="/iletisim?subject=degerlendirme#contact-form" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
                  Gayrimenkul Değerleme
                </Link>
              </li>
              <li>
                <Link href="/iletisim?subject=danismanlik#contact-form" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
                  Emlak Danışmanlığı
                </Link>
              </li>
              <li>
                <Link href="/iletisim?subject=otomotiv#contact-form" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base block py-1">
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
                <MapPin size={20} className="mr-2 mt-1 text-primary sm:size-[50px]" />
                <span className="text-muted-foreground text-sm sm:text-base">
                  Çarşı Ofis: Alipaşa Mah. Gazipaşa Cad. No:3/A Ceysuit Tokat/Merkez<br /><br />
                  Karşıyaka Ofis: Altıyüzevler Mah. Vali Ayhan Çevik Bulv. Yunus Emre Sit. A Blok Tokat/Merkez
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2 text-primary sm:size-[18px]" />
                <div className="text-muted-foreground text-sm sm:text-base">
                  <a href="tel:+905323850420" className="hover:text-primary transition-colors block py-1">
                    Cep: 0 (532) 385 04 20
                  </a>
                  <a href="tel:+903562280444" className="hover:text-primary transition-colors block py-1">
                    Sabit: 0 (356) 228 0 444
                  </a>
                </div>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2 text-primary sm:size-[18px]" />
                <a href="mailto:ceyhunemlak@hotmail.com" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base py-1">
                  ceyhunemlak@hotmail.com
                </a>
              </li>
              <li className="flex items-center">
                <Clock size={16} className="mr-2 text-primary sm:size-[18px]" />
                <span className="text-muted-foreground text-sm sm:text-base">
                  Pazartesi - Cumartesi: 09:00 - 19:00
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