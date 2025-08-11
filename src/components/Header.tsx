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
  
  // Desktop dropdown states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Mobile dropdown states
  const [expandedEmlak, setExpandedEmlak] = useState(false);
  const [expandedVasita, setExpandedVasita] = useState(false);
  const [expandedKurumsal, setExpandedKurumsal] = useState(false);
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

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

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
    setActiveDropdown(null);
    setActiveSubDropdown(null);
    setExpandedEmlak(false);
    setExpandedVasita(false);
    setExpandedKurumsal(false);
    setExpandedKonut(false);
    setExpandedTicari(false);
    setExpandedArsa(false);
    
    // Clear hover timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  // Handle mouse enter/leave for desktop dropdowns with delays
  
  const handleMouseEnter = (dropdown: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveDropdown(dropdown);
    setActiveSubDropdown(null);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
      setActiveSubDropdown(null);
    }, 150); // 150ms delay before closing
    setHoverTimeout(timeout);
  };

  const handleSubMouseEnter = (subDropdown: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveSubDropdown(subDropdown);
  };

  const handleDropdownMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleDropdownMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
      setActiveSubDropdown(null);
    }, 150); // 150ms delay before closing
    setHoverTimeout(timeout);
  };

  return (
    <header 
      className={`fixed w-full z-50 bg-white py-2 sm:py-5 transition-all duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Desktop Navigation - Left Side */}
        <nav className="hidden md:flex items-center space-x-8 relative">
          {/* Ana Sayfa */}
          <Link href="/" className="font-headings text-lg font-medium transition-colors hover:text-primary">
            Ana Sayfa
          </Link>
          
          {/* İlanlar Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => handleMouseEnter('ilanlar')}
            onMouseLeave={handleMouseLeave}
          >
            <button className="font-headings text-lg font-medium transition-colors hover:text-primary flex items-center gap-1">
              İlanlar
              <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'ilanlar' ? 'rotate-180' : ''}`} />
            </button>
            
            {/* İlanlar Dropdown Menu */}
            {activeDropdown === 'ilanlar' && (
              <div 
                className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                {/* Emlak */}
                <div 
                  className="relative group/sub"
                  onMouseEnter={() => handleSubMouseEnter('emlak')}
                >
                  <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                    <span className="text-gray-700 hover:text-primary transition-colors">Emlak</span>
                    <ChevronRight size={14} />
                  </div>
                  
                  {/* Emlak Sub-dropdown */}
                  {activeSubDropdown === 'emlak' && (
                    <div 
                      className="absolute top-0 left-full ml-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      {/* Konut */}
                      <div className="relative group/subsub">
                        <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                          <span className="text-gray-600 hover:text-primary transition-colors">Konut</span>
                          <ChevronRight size={12} />
                        </div>
                        
                        {/* Konut Sub-sub-dropdown */}
                        <div className="absolute top-0 left-full ml-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 opacity-0 invisible group-hover/subsub:opacity-100 group-hover/subsub:visible transition-all duration-200">
                          <Link href="/ilanlar/konut?konutType=daire" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Daire
                          </Link>
                          <Link href="/ilanlar/konut?konutType=villa" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Villa
                          </Link>
                          <Link href="/ilanlar/konut?konutType=mustakil" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Müstakil Ev
                          </Link>
                          <Link href="/ilanlar/konut?konutType=bina" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Bina
                          </Link>
                        </div>
                      </div>
                      
                      {/* Arsa */}
                      <div className="relative group/subsub">
                        <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                          <span className="text-gray-600 hover:text-primary transition-colors">Arsa</span>
                          <ChevronRight size={12} />
                        </div>
                        
                        {/* Arsa Sub-sub-dropdown */}
                        <div className="absolute top-0 left-full ml-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 opacity-0 invisible group-hover/subsub:opacity-100 group-hover/subsub:visible transition-all duration-200">
                          <Link href="/ilanlar/arsa?arsaType=tarla" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Tarla
                          </Link>
                          <Link href="/ilanlar/arsa?arsaType=bahce" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Bahçe
                          </Link>
                          <Link href="/ilanlar/arsa?arsaType=konut-imarli" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Konut İmarlı
                          </Link>
                          <Link href="/ilanlar/arsa?arsaType=ticari-imarli" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Ticari İmarlı
                          </Link>
                        </div>
                      </div>
                      
                      {/* İş Yeri */}
                      <div className="relative group/subsub">
                        <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                          <span className="text-gray-600 hover:text-primary transition-colors">İş Yeri</span>
                          <ChevronRight size={12} />
                        </div>
                        
                        {/* İş Yeri Sub-sub-dropdown */}
                        <div className="absolute top-0 left-full ml-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 opacity-0 invisible group-hover/subsub:opacity-100 group-hover/subsub:visible transition-all duration-200">
                          <Link href="/ilanlar/ticari?ticariType=dukkan" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Dükkan
                          </Link>
                          <Link href="/ilanlar/ticari?ticariType=ofis" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Ofis
                          </Link>
                          <Link href="/ilanlar/ticari?ticariType=depo" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Depo
                          </Link>
                          <Link href="/ilanlar/ticari?ticariType=fabrika" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Fabrika
                          </Link>
                          <Link href="/ilanlar/ticari?ticariType=atolye" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Atölye
                          </Link>
                          <Link href="/ilanlar/ticari?ticariType=plaza" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Plaza
                          </Link>
                          <Link href="/ilanlar/ticari?ticariType=cafe" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                            Cafe
                          </Link>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <Link href="/ilanlar/emlak" className="block px-4 py-2 text-primary hover:bg-gray-50 transition-colors font-medium">
                          Tüm Emlak İlanları
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Vasıta */}
                <Link href="/ilanlar/vasita" className="block px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors">
                  Vasıta
                </Link>
              </div>
            )}
          </div>
          
          {/* Kurumsal Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => handleMouseEnter('kurumsal')}
            onMouseLeave={handleMouseLeave}
          >
            <button className="font-headings text-lg font-medium transition-colors hover:text-primary flex items-center gap-1">
              Kurumsal
              <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'kurumsal' ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Kurumsal Dropdown Menu */}
            {activeDropdown === 'kurumsal' && (
              <div 
                className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <Link href="/hakkimizda" className="block px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors">
                  Hakkımızda
                </Link>
                <Link href="/iletisim" className="block px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors">
                  İletişim
                </Link>
              </div>
            )}
          </div>
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
            
            {/* İlanlar Dropdown */}
            <div className="border-b border-gray-100">
              <button
                className="w-full flex items-center justify-between font-headings text-lg font-medium transition-colors hover:text-primary py-3"
                onClick={() => setExpandedEmlak(!expandedEmlak)}
              >
                İlanlar
                <ChevronDown className={`transition-transform duration-200 ${expandedEmlak ? 'rotate-180' : ''}`} size={20} />
              </button>
              
              {expandedEmlak && (
                <div className="pl-4 pb-3 space-y-2">
                  {/* Emlak Alt Kategorisi */}
                  <div>
                    <button
                      className="w-full flex items-center justify-between font-medium text-gray-700 hover:text-primary py-2"
                      onClick={() => setExpandedVasita(!expandedVasita)}
                    >
                      Emlak
                      <ChevronRight className={`transition-transform duration-200 ${expandedVasita ? 'rotate-90' : ''}`} size={16} />
                    </button>
                    {expandedVasita && (
                      <div className="pl-4 space-y-2">
                        {/* Konut Alt Kategorisi */}
                        <div>
                          <button
                            className="w-full flex items-center justify-between font-medium text-gray-600 hover:text-primary py-2 text-sm"
                            onClick={() => setExpandedKonut(!expandedKonut)}
                          >
                            Konut
                            <ChevronRight className={`transition-transform duration-200 ${expandedKonut ? 'rotate-90' : ''}`} size={14} />
                          </button>
                          {expandedKonut && (
                            <div className="pl-4 space-y-1">
                              <Link 
                                href="/ilanlar/konut?konutType=daire" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Daire
                              </Link>
                              <Link 
                                href="/ilanlar/konut?konutType=villa" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Villa
                              </Link>
                              <Link 
                                href="/ilanlar/konut?konutType=mustakil" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Müstakil Ev
                              </Link>
                              <Link 
                                href="/ilanlar/konut?konutType=bina" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Bina
                              </Link>
                            </div>
                          )}
                        </div>
                        
                        {/* Arsa Alt Kategorisi */}
                        <div>
                          <button
                            className="w-full flex items-center justify-between font-medium text-gray-600 hover:text-primary py-2 text-sm"
                            onClick={() => setExpandedArsa(!expandedArsa)}
                          >
                            Arsa
                            <ChevronRight className={`transition-transform duration-200 ${expandedArsa ? 'rotate-90' : ''}`} size={14} />
                          </button>
                          {expandedArsa && (
                            <div className="pl-4 space-y-1">
                              <Link 
                                href="/ilanlar/arsa?arsaType=tarla" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Tarla
                              </Link>
                              <Link 
                                href="/ilanlar/arsa?arsaType=bahce" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Bahçe
                              </Link>
                              <Link 
                                href="/ilanlar/arsa?arsaType=konut-imarli" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Konut İmarlı
                              </Link>
                              <Link 
                                href="/ilanlar/arsa?arsaType=ticari-imarli" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Ticari İmarlı
                              </Link>
                            </div>
                          )}
                        </div>
                        
                        {/* İş Yeri Alt Kategorisi */}
                        <div>
                          <button
                            className="w-full flex items-center justify-between font-medium text-gray-600 hover:text-primary py-2 text-sm"
                            onClick={() => setExpandedTicari(!expandedTicari)}
                          >
                            İş Yeri
                            <ChevronRight className={`transition-transform duration-200 ${expandedTicari ? 'rotate-90' : ''}`} size={14} />
                          </button>
                          {expandedTicari && (
                            <div className="pl-4 space-y-1">
                              <Link 
                                href="/ilanlar/ticari?ticariType=dukkan" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Dükkan
                              </Link>
                              <Link 
                                href="/ilanlar/ticari?ticariType=ofis" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Ofis
                              </Link>
                              <Link 
                                href="/ilanlar/ticari?ticariType=depo" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Depo
                              </Link>
                              <Link 
                                href="/ilanlar/ticari?ticariType=fabrika" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Fabrika
                              </Link>
                              <Link 
                                href="/ilanlar/ticari?ticariType=atolye" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Atölye
                              </Link>
                              <Link 
                                href="/ilanlar/ticari?ticariType=plaza" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Plaza
                              </Link>
                              <Link 
                                href="/ilanlar/ticari?ticariType=cafe" 
                                className="block text-gray-500 hover:text-primary py-1 text-xs"
                                onClick={closeMenu}
                              >
                                Cafe
                              </Link>
                            </div>
                          )}
                        </div>
                        
                        {/* Tüm Emlak İlanları */}
                        <Link 
                          href="/ilanlar/emlak" 
                          className="block font-medium text-primary hover:text-primary/80 py-2 text-sm"
                          onClick={closeMenu}
                        >
                          Tüm Emlak İlanları
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  {/* Vasıta */}
                  <Link 
                    href="/ilanlar/vasita" 
                    className="block font-medium text-gray-700 hover:text-primary py-2"
                    onClick={closeMenu}
                  >
                    Vasıta
                  </Link>
                </div>
              )}
            </div>
            
            {/* Kurumsal Dropdown */}
            <div className="border-b border-gray-100">
              <button
                className="w-full flex items-center justify-between font-headings text-lg font-medium transition-colors hover:text-primary py-3"
                onClick={() => setExpandedKurumsal(!expandedKurumsal)}
              >
                Kurumsal
                <ChevronDown className={`transition-transform duration-200 ${expandedKurumsal ? 'rotate-180' : ''}`} size={20} />
              </button>
              
              {expandedKurumsal && (
                <div className="pl-4 pb-3 space-y-2">
                  <Link 
                    href="/hakkimizda" 
                    className="block font-medium text-gray-700 hover:text-primary py-2"
                    onClick={closeMenu}
                  >
                    Hakkımızda
                  </Link>
                  <Link 
                    href="/iletisim" 
                    className="block font-medium text-gray-700 hover:text-primary py-2"
                    onClick={closeMenu}
                  >
                    İletişim
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 