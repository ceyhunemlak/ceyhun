"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEmlak, setExpandedEmlak] = useState(false);
  const [expandedKonut, setExpandedKonut] = useState(false);
  const [expandedTicari, setExpandedTicari] = useState(false);
  const [expandedArsa, setExpandedArsa] = useState(false);

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
        closeMenu();
      }
    }
  };

  // Close menu and reset all dropdowns
  const closeMenu = () => {
    setIsMenuOpen(false);
    setExpandedEmlak(false);
    setExpandedKonut(false);
    setExpandedTicari(false);
    setExpandedArsa(false);
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
              width={160}
              height={50}
              className="transition-all duration-300 w-[150px] sm:w-[200px] h-auto"
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
          onClick={() => isMenuOpen ? closeMenu() : setIsMenuOpen(true)}
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
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col space-y-4">
            {/* Arama çubuğu - en üstte */}
            <form onSubmit={handleSearch} className="relative">
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
            
            <Link 
              href="/" 
              className="font-headings text-lg font-medium transition-colors hover:text-primary py-3 border-b border-gray-100"
              onClick={closeMenu}
            >
              Ana Sayfa
            </Link>
            
            {/* Emlak Dropdown */}
            <div className="border-b border-gray-100">
              <button
                className="w-full flex items-center justify-between font-headings text-lg font-medium transition-colors hover:text-primary py-3"
                onClick={() => setExpandedEmlak(!expandedEmlak)}
              >
                Emlak
                <ChevronDown className={`transition-transform duration-200 ${expandedEmlak ? 'rotate-180' : ''}`} size={20} />
              </button>
              
              {expandedEmlak && (
                <div className="pl-4 pb-3 space-y-2">
                  {/* Konut Alt Kategorisi */}
                  <div>
                    <button
                      className="w-full flex items-center justify-between font-medium text-gray-700 hover:text-primary py-2"
                      onClick={() => setExpandedKonut(!expandedKonut)}
                    >
                      Konut
                      <ChevronRight className={`transition-transform duration-200 ${expandedKonut ? 'rotate-90' : ''}`} size={16} />
                    </button>
                    {expandedKonut && (
                      <div className="pl-4 space-y-1">
                        <Link 
                          href="/ilanlar/konut?konutType=daire" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Daire
                        </Link>
                        <Link 
                          href="/ilanlar/konut?konutType=villa" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Villa
                        </Link>
                        <Link 
                          href="/ilanlar/konut?konutType=mustakil" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Müstakil Ev
                        </Link>
                        <Link 
                          href="/ilanlar/konut?konutType=bina" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Bina
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  {/* Ticari Alt Kategorisi */}
                  <div>
                    <button
                      className="w-full flex items-center justify-between font-medium text-gray-700 hover:text-primary py-2"
                      onClick={() => setExpandedTicari(!expandedTicari)}
                    >
                      Ticari
                      <ChevronRight className={`transition-transform duration-200 ${expandedTicari ? 'rotate-90' : ''}`} size={16} />
                    </button>
                    {expandedTicari && (
                      <div className="pl-4 space-y-1">
                        <Link 
                          href="/ilanlar/ticari?ticariType=dukkan" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Dükkan
                        </Link>
                        <Link 
                          href="/ilanlar/ticari?ticariType=ofis" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Ofis
                        </Link>
                        <Link 
                          href="/ilanlar/ticari?ticariType=depo" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Depo
                        </Link>
                        <Link 
                          href="/ilanlar/ticari?ticariType=fabrika" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Fabrika
                        </Link>
                        <Link 
                          href="/ilanlar/ticari?ticariType=atolye" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Atölye
                        </Link>
                        <Link 
                          href="/ilanlar/ticari?ticariType=plaza" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Plaza
                        </Link>
                        <Link 
                          href="/ilanlar/ticari?ticariType=cafe" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Cafe
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  {/* Arsa Alt Kategorisi */}
                  <div>
                    <button
                      className="w-full flex items-center justify-between font-medium text-gray-700 hover:text-primary py-2"
                      onClick={() => setExpandedArsa(!expandedArsa)}
                    >
                      Arsa
                      <ChevronRight className={`transition-transform duration-200 ${expandedArsa ? 'rotate-90' : ''}`} size={16} />
                    </button>
                    {expandedArsa && (
                      <div className="pl-4 space-y-1">
                        <Link 
                          href="/ilanlar/arsa?arsaType=tarla" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Tarla
                        </Link>
                        <Link 
                          href="/ilanlar/arsa?arsaType=bahce" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Bahçe
                        </Link>
                        <Link 
                          href="/ilanlar/arsa?arsaType=konut-imarli" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Konut İmarlı
                        </Link>
                        <Link 
                          href="/ilanlar/arsa?arsaType=ticari-imarli" 
                          className="block text-gray-600 hover:text-primary py-1 text-sm"
                          onClick={closeMenu}
                        >
                          Ticari İmarlı
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  {/* Tüm Emlak İlanları */}
                  <Link 
                    href="/ilanlar/emlak" 
                    className="block font-medium text-primary hover:text-primary/80 py-2"
                    onClick={closeMenu}
                  >
                    Tüm Emlak İlanları
                  </Link>
                </div>
              )}
            </div>
            
            <Link 
              href="/ilanlar/vasita" 
              className="font-headings text-lg font-medium transition-colors hover:text-primary py-3 border-b border-gray-100"
              onClick={closeMenu}
            >
              Vasıta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 