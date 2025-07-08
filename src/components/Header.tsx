"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle scroll event to change header style when scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      // Redirect to the all listings page with search query
      router.push(`/ilanlar?search=${encodeURIComponent(searchQuery)}`);
      
      // Close mobile menu if open
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
  };

  return (
    <header 
      className={`fixed w-full z-50 bg-white py-2 sm:py-5 transition-all duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Desktop Navigation - Left Side */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="font-headings text-lg font-medium transition-colors hover:text-primary">
            Ana Sayfa
          </Link>
          <Link href="/ilanlar/emlak" className="font-headings text-lg font-medium transition-colors hover:text-primary">
            Emlak
          </Link>
          <Link href="/ilanlar/vasita" className="font-headings text-lg font-medium transition-colors hover:text-primary">
            Vasıta
          </Link>
        </nav>

        {/* Logo - Center */}
        <div className="flex justify-center">
          <Link href="/" className="hover-scale">
            <Image
              src="/images/logo_black.png"
              alt="Ceyhun Emlak Logo"
              width={120}
              height={40}
              className="transition-all duration-300 w-[120px] sm:w-[150px] h-auto"
              priority
            />
          </Link>
        </div>
        
        {/* Search button - Right Side */}
        <div className="hidden md:flex items-center">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="İlan Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white text-base"
            />
            <button 
              type="submit" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Ara"
            >
              <Search size={18} />
            </button>
          </form>
        </div>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-accent/50 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </div>
      
      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20 pb-6 px-6 overflow-y-auto fade-in">
          {/* Kapatma butonu - mobil menü içinde sabit pozisyonda */}
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-50"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className="font-headings text-lg font-medium transition-colors hover:text-primary py-3 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Ana Sayfa
            </Link>
            <Link 
              href="/ilanlar/emlak" 
              className="font-headings text-lg font-medium transition-colors hover:text-primary py-3 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Emlak
            </Link>
            <Link 
              href="/ilanlar/vasita" 
              className="font-headings text-lg font-medium transition-colors hover:text-primary py-3 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Vasıta
            </Link>
            <form onSubmit={handleSearch} className="relative mt-4">
              <input
                type="text"
                placeholder="İlan Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white text-base"
              />
              <button 
                type="submit" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Ara"
              >
                <Search size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 