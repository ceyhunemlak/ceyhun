"use client";

import React, { useEffect, useState, useRef } from "react";
import { Phone, Car, ChevronDown } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { usePathname } from "next/navigation";

interface FloatingContactProps {
  defaultPhone?: string;
}

interface ContactOption {
  number: string;
  name: string;
}

export default function FloatingContact({ defaultPhone }: FloatingContactProps) {
  const pathname = usePathname();
  const [showPhoneOptions, setShowPhoneOptions] = useState(false);
  const [showWhatsAppOptions, setShowWhatsAppOptions] = useState(false);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);
  const whatsappDropdownRef = useRef<HTMLDivElement>(null);
  
  const phoneOptions: ContactOption[] = [
    { number: "5323850420", name: "Ceyhun Çiftçi" },
    { number: "5530036031", name: "Cenk Çiftçi" },
    { number: "3562280444", name: "Ceyhun Emlak" }
  ];
  
  const whatsappOptions: ContactOption[] = [
    { number: "5323850420", name: "Ceyhun Çiftçi" },
    { number: "5366067071", name: "Berk Çiftçi" }
  ];
  
  const taxiNumber = "05433850420";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        phoneDropdownRef.current && 
        !phoneDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPhoneOptions(false);
      }
      
      if (
        whatsappDropdownRef.current && 
        !whatsappDropdownRef.current.contains(event.target as Node)
      ) {
        setShowWhatsAppOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePhoneClick = (number: string) => {
    window.location.href = `tel:+90${number}`;
    setShowPhoneOptions(false);
  };

  const handleWhatsAppClick = (number: string) => {
    window.location.href = `https://wa.me/90${number}`;
    setShowWhatsAppOptions(false);
  };

  const handleTaxiClick = () => {
    window.location.href = `tel:+90${taxiNumber}`;
  };

  return (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 flex flex-row gap-2 z-50">
      <div className="relative" ref={phoneDropdownRef}>
        <button
          onClick={() => setShowPhoneOptions(!showPhoneOptions)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transform transition-transform hover:scale-110 flex items-center"
          title="Ara"
          aria-label="Telefon ile ara"
        >
          <Phone size={18} strokeWidth={2} />
          <ChevronDown size={14} className={`ml-1 transition-transform ${showPhoneOptions ? 'rotate-180' : ''}`} />
        </button>
        
        {showPhoneOptions && (
          <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg p-2 min-w-[200px]">
            <div className="font-medium text-gray-700 mb-1 px-2">Telefon</div>
            {phoneOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handlePhoneClick(option.number)}
                className="flex items-center w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded-md"
              >
                <Phone size={14} className="mr-2 text-blue-600" />
                <div>
                  <div className="text-sm">
                    {option.number.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "0 ($1) $2 $3 $4")}
                  </div>
                  <div className="text-xs text-gray-500">{option.name}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="relative" ref={whatsappDropdownRef}>
        <button
          onClick={() => setShowWhatsAppOptions(!showWhatsAppOptions)}
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg transform transition-transform hover:scale-110 flex items-center"
          title="WhatsApp"
          aria-label="WhatsApp ile mesaj gönder"
        >
          <FaWhatsapp size={18} />
          <ChevronDown size={14} className={`ml-1 transition-transform ${showWhatsAppOptions ? 'rotate-180' : ''}`} />
        </button>
        
        {showWhatsAppOptions && (
          <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg p-2 min-w-[200px]">
            <div className="font-medium text-gray-700 mb-1 px-2">WhatsApp</div>
            {whatsappOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleWhatsAppClick(option.number)}
                className="flex items-center w-full text-left px-2 py-1.5 hover:bg-gray-100 rounded-md"
              >
                <FaWhatsapp size={14} className="mr-2 text-green-500" />
                <div>
                  <div className="text-sm">
                    {option.number.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "0 ($1) $2 $3 $4")}
                  </div>
                  <div className="text-xs text-gray-500">{option.name}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <button
        onClick={handleTaxiClick}
        className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg transform transition-transform hover:scale-110 flex items-center"
        title="Taksi Çağır"
        aria-label="Taksi çağır"
      >
        <Car size={18} strokeWidth={2} />
      </button>
    </div>
  );
} 