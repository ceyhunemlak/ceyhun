"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Loading } from "@/components/ui/loading";

// Define types for listings and stats
interface Listing {
  id: string;
  title: string;
  property_type: string;
  listing_status: string;
  price: number;
  is_active: boolean;
  is_featured: boolean;
  views_count: number;
  contact_count: number;
  created_at: string;
  thumbnail_url?: string; // Vitrin fotoğrafı URL'si
  sub_category?: string; // Alt kategori
}

interface Stats {
  totalViews: number;
  contactClicks: number;
  activeListings: number;
  topPerforming: Array<{
    id: string;
    title: string;
    views: number;
    contacts: number;
  }>;
}

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // New state variables for filtering, sorting and search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedListingStatus, setSelectedListingStatus] = useState<string | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("all"); // "all", "active", "passive"
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'ascending' | 'descending' | null;
  }>({ key: 'created_at', direction: 'descending' });
  const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]);

  const [stats, setStats] = useState<Stats>({
    totalViews: 0,
    contactClicks: 0,
    activeListings: 0,
    topPerforming: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch listings from API
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/listings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        setListings(data);
        setFilteredListings(data);
        
        // Calculate stats from the listings
        const activeListings = data.filter((listing: Listing) => listing.is_active).length;
        const totalViews = data.reduce((sum: number, listing: Listing) => sum + (listing.views_count || 0), 0);
        const contactClicks = data.reduce((sum: number, listing: Listing) => sum + (listing.contact_count || 0), 0);
        
        // Get top performing listings
        const topPerforming = [...data]
          .sort((a: Listing, b: Listing) => (b.views_count || 0) - (a.views_count || 0))
          .slice(0, 3)
          .map((listing: Listing) => ({
            id: listing.id,
            title: listing.title,
            views: listing.views_count || 0,
            contacts: listing.contact_count || 0
          }));
        
        setStats({
          totalViews,
          contactClicks,
          activeListings,
          topPerforming
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('İlanları yüklerken bir hata oluştu');
        setIsLoading(false);
      }
    };
    
    fetchListings();
  }, []);

  // Filter listings when category changes
  useEffect(() => {
    if (selectedCategory === 'emlak') {
      const emlakListings = listings.filter(listing => 
        ['konut', 'ticari', 'arsa'].includes(listing.property_type.toLowerCase())
      );
      
      // Update available subcategories for this category
      const subCategories = [...new Set(emlakListings.map(listing => getSubCategory(listing)))];
      setAvailableSubCategories(subCategories);
      
      // Reset subcategory selection when changing main category
      setSelectedSubCategory(null);
      
      applyFiltersAndSort(emlakListings);
    } else if (selectedCategory === 'vasita') {
      const vasitaListings = listings.filter(listing => 
        listing.property_type.toLowerCase() === 'vasita'
      );
      
      // Update available subcategories for this category
      const subCategories = [...new Set(vasitaListings.map(listing => getSubCategory(listing)))];
      setAvailableSubCategories(subCategories);
      
      // Reset subcategory selection when changing main category
      setSelectedSubCategory(null);
      
      applyFiltersAndSort(vasitaListings);
    } else {
      // All listings
      const subCategories = [...new Set(listings.map(listing => getSubCategory(listing)))];
      setAvailableSubCategories(subCategories);
      
      applyFiltersAndSort(listings);
    }
  }, [selectedCategory, listings, selectedSubCategory, selectedListingStatus, searchQuery, sortConfig, showFeaturedOnly, activeStatusFilter]);
  
  // Function to apply all filters, search, and sorting
  const applyFiltersAndSort = (baseListings: Listing[]) => {
    let result = [...baseListings];
    
    // Apply subcategory filter if selected
    if (selectedSubCategory) {
      result = result.filter(listing => getSubCategory(listing) === selectedSubCategory);
    }
    
    // Apply listing status filter if selected
    if (selectedListingStatus) {
      result = result.filter(listing => listing.listing_status === selectedListingStatus);
    }
    
    // Apply active/passive filter
    if (activeStatusFilter !== "all") {
      const isActive = activeStatusFilter === "active";
      result = result.filter(listing => listing.is_active === isActive);
    }
    
    // Apply featured filter if enabled
    if (showFeaturedOnly) {
      result = result.filter(listing => listing.is_featured);
    }
    
    // Apply search query if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(listing => 
        listing.title.toLowerCase().includes(query) ||
        getSubCategory(listing).toLowerCase().includes(query) ||
        formatPropertyType(listing.property_type).toLowerCase().includes(query) ||
        formatListingStatus(listing.listing_status).toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        // Handle different data types for sorting
        let aValue, bValue;
        
        switch(sortConfig.key) {
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'listing_status':
            aValue = formatListingStatus(a.listing_status);
            bValue = formatListingStatus(b.listing_status);
            break;
          case 'property_type':
            aValue = formatPropertyType(a.property_type);
            bValue = formatPropertyType(b.property_type);
            break;
          case 'sub_category':
            aValue = getSubCategory(a);
            bValue = getSubCategory(b);
            break;
          case 'is_active':
            aValue = a.is_active ? 1 : 0;
            bValue = b.is_active ? 1 : 0;
            break;
          case 'created_at':
          default:
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
        }
        
        // Perform the comparison
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredListings(result);
  };
  
  // Function to handle column header click for sorting
  const handleSort = (key: string) => {
    // Don't sort by thumbnail column
    if (key === 'thumbnail') return;
    
    let direction: 'ascending' | 'descending' | null = 'ascending';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        // Reset to default sort (by created_at descending)
        key = 'created_at';
        direction = 'descending';
      }
    }
    
    setSortConfig({ key, direction });
  };
  
  // Function to get sort icon for column header
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown className="ml-1 h-4 w-4 inline" />;
    }
    
    return sortConfig.direction === 'ascending' 
      ? <ChevronUp className="ml-1 h-4 w-4 inline text-[#FFB000]" />
      : <ChevronDown className="ml-1 h-4 w-4 inline text-[#FFB000]" />;
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    router.push("/admin");
  };

  const handleAddListing = () => {
    router.push("/admin/panel/add-listing");
  };

  // Function to delete a listing
  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Bu ilanı silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/listings?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      
      // Remove the listing from state
      setListings(listings.filter(listing => listing.id !== id));
      
      // Update stats
      const deletedListing = listings.find(listing => listing.id === id);
      if (deletedListing) {
        setStats(prev => ({
          ...prev,
          totalViews: prev.totalViews - (deletedListing.views_count || 0),
          contactClicks: prev.contactClicks - (deletedListing.contact_count || 0),
          activeListings: deletedListing.is_active ? prev.activeListings - 1 : prev.activeListings,
          topPerforming: prev.topPerforming.filter(item => item.id !== id)
        }));
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('İlan silinirken bir hata oluştu');
    }
  };

  // Function to toggle listing active status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/listings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          is_active: !currentStatus
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update active status');
      }
      
      // Update the listing in state
      setListings(listings.map(listing => 
        listing.id === id ? { ...listing, is_active: !currentStatus } : listing
      ));
      
      // Update active listings count in stats
      setStats(prev => ({
        ...prev,
        activeListings: currentStatus 
          ? prev.activeListings - 1 
          : prev.activeListings + 1
      }));
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('İlan aktiflik durumu güncellenirken bir hata oluştu');
    }
  };

  // Function to toggle featured status
  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/listings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          is_featured: !currentStatus
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update featured status');
      }
      
      // Update the listing in state
      setListings(listings.map(listing => 
        listing.id === id ? { ...listing, is_featured: !currentStatus } : listing
      ));
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert('İlan öne çıkarma durumu güncellenirken bir hata oluştu');
    }
  };

  // Function to duplicate a listing
  const handleDuplicateListing = async (listing: Listing) => {
    try {
      // Generate a new title with suffix
      const newTitle = findNextAvailableDuplicateTitle(listing.title, listings);
      
      // Call the new duplicate API endpoint
      const response = await fetch('/api/listings/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id,
          newTitle: newTitle
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Duplication API error:', errorData);
        throw new Error('Failed to duplicate listing');
      }
      
      const responseData = await response.json();
      const newListing = responseData.listing;
      
      // Add the new listing to state
      setListings([newListing, ...listings]);
      
      // Update filtered listings if needed
      if (!selectedCategory || 
          (selectedCategory === 'emlak' && ['konut', 'ticari', 'arsa'].includes(newListing.property_type.toLowerCase())) ||
          (selectedCategory === 'vasita' && newListing.property_type.toLowerCase() === 'vasita')) {
        setFilteredListings([newListing, ...filteredListings]);
      }
      
      alert('İlan başarıyla çoğaltıldı');
    } catch (error) {
      console.error('Error duplicating listing:', error);
      alert('İlan çoğaltılırken bir hata oluştu');
    }
  };

  // Helper function to find the next available duplicate title
  const findNextAvailableDuplicateTitle = (originalTitle: string, allListings: Listing[]) => {
    // Check if title already ends with a duplicate suffix pattern like "-1", "-2", etc.
    const suffixMatch = originalTitle.match(/-(\d+)$/);
    
    let baseTitle = originalTitle;
    let startNumber = 1;
    
    if (suffixMatch) {
      // If it already has a suffix, remove it and increment the number
      baseTitle = originalTitle.replace(/-\d+$/, '');
      startNumber = parseInt(suffixMatch[1], 10) + 1;
    }
    
    let newTitle = `${baseTitle}-${startNumber}`;
    let counter = startNumber;
    
    // Keep incrementing until we find a unique title
    while (allListings.some(listing => listing.title === newTitle)) {
      counter++;
      newTitle = `${baseTitle}-${counter}`;
    }
    
    return newTitle;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  // Helper function to format property type
  const formatPropertyType = (type: string) => {
    const typeMap: Record<string, string> = {
      'konut': 'Konut',
      'ticari': 'Ticari',
      'arsa': 'Arsa',
      'vasita': 'Vasıta'
    };
    
    return typeMap[type] || type;
  };

  // Helper function to determine subcategory based on property type and other data
  const getSubCategory = (listing: Listing) => {
    // If the listing already has a sub_category field, use it
    if (listing.sub_category) {
      return listing.sub_category;
    }
    
    // Otherwise, determine subcategory based on property type and other data
    switch (listing.property_type.toLowerCase()) {
      case 'vasita':
        // For vehicles, we might determine by brand/model or vehicle type
        if (listing.title.toLowerCase().includes('mazda')) {
          return 'Otomobil';
        } else if (listing.title.toLowerCase().includes('otomobil')) {
          return 'Otomobil';
        } else if (listing.title.toLowerCase().includes('motosiklet')) {
          return 'Motosiklet';
        } else if (listing.title.toLowerCase().includes('ticari araç')) {
          return 'Ticari Araç';
        } else {
          // Default for vehicles
          return 'Otomobil';
        }
      
      case 'konut':
        // For residential properties
        if (listing.title.toLowerCase().includes('daire')) {
          return 'Daire';
        } else if (listing.title.toLowerCase().includes('villa')) {
          return 'Villa';
        } else if (listing.title.toLowerCase().includes('müstakil')) {
          return 'Müstakil Ev';
        } else if (listing.title.toLowerCase().includes('karşıyaka')) {
          return 'Villa';
        } else {
          return 'Daire';
        }
      
      case 'ticari':
        // For commercial properties
        if (listing.title.toLowerCase().includes('ofis')) {
          return 'Ofis';
        } else if (listing.title.toLowerCase().includes('dükkan')) {
          return 'Dükkan';
        } else if (listing.title.toLowerCase().includes('mağaza')) {
          return 'Mağaza';
        } else {
          return 'İşyeri';
        }
      
      case 'arsa':
        // For land
        if (listing.title.toLowerCase().includes('tarla')) {
          return 'Tarla';
        } else if (listing.title.toLowerCase().includes('bağ')) {
          return 'Bağ';
        } else if (listing.title.toLowerCase().includes('elektrikli')) {
          return 'İmarlı Arsa';
        } else {
          return 'İmarlı Arsa';
        }
      
      default:
        return '-';
    }
  };

  // Helper function to format listing status
  const formatListingStatus = (status: string) => {
    return status === 'satilik' ? 'Satılık' : 'Kiralık';
  };

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR').format(price) + ' ₺';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Panel</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-red-500 text-red-500 hover:bg-red-50 text-sm sm:text-base py-1 sm:py-2 px-2 sm:px-4"
          >
            Çıkış Yap
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-6 sm:mb-8">
            <TabsTrigger 
              value="dashboard" 
              className="text-sm sm:text-base data-[state=active]:bg-[#FFB000] data-[state=active]:text-black"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="listings" 
              className="text-sm sm:text-base data-[state=active]:bg-[#FFB000] data-[state=active]:text-black"
            >
              İlan Yönetimi
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.1 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Add listing button for Dashboard */}
              <motion.div 
                variants={itemVariants}
                transition={{ type: "spring", stiffness: 100 }}
                className="flex justify-end"
              >
                <Button 
                  onClick={handleAddListing}
                  className="bg-[#FFB000] hover:bg-[#FFB000]/80 text-black text-sm sm:text-base"
                >
                  Yeni İlan Ekle
                </Button>
              </motion.div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                <motion.div 
                  variants={itemVariants}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                      <CardTitle className="text-base sm:text-lg">Toplam Görüntülenme</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Son 30 gün</CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                      <p className="text-xl sm:text-3xl font-bold text-[#FFB000]">{stats.totalViews}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                      <CardTitle className="text-base sm:text-lg">İletişim Tıklamaları</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Son 30 gün</CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                      <p className="text-xl sm:text-3xl font-bold text-[#FFB000]">{stats.contactClicks}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("listings")}>
                    <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                      <CardTitle className="text-base sm:text-lg">Aktif İlanlar</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Toplam</CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                      <p className="text-xl sm:text-3xl font-bold text-[#FFB000]">{stats.activeListings}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                      <CardTitle className="text-base sm:text-lg">Dönüşüm Oranı</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Görüntülenme/İletişim</CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                      <p className="text-xl sm:text-3xl font-bold text-[#FFB000]">
                        {stats.totalViews > 0 
                          ? ((stats.contactClicks / stats.totalViews) * 100).toFixed(1) 
                          : '0.0'}%
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Top Performing Listings */}
              <motion.div 
                variants={itemVariants}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">En Çok İlgi Gören İlanlar</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Son 30 gün içindeki en popüler ilanlar</CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <Loading size="medium" text="Yükleniyor..." />
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-500">{error}</div>
                    ) : stats.topPerforming.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">Henüz ilan bulunmamaktadır</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">İlan Başlığı</th>
                              <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Görüntülenme</th>
                              <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">İletişim</th>
                              <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Dönüşüm Oranı</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.topPerforming.map((listing) => (
                              <tr key={listing.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{listing.title}</td>
                                <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{listing.views}</td>
                                <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{listing.contacts}</td>
                                <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                                  {listing.views > 0 
                                    ? ((listing.contacts / listing.views) * 100).toFixed(1) 
                                    : '0.0'}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Listings Management Tab */}
          <TabsContent value="listings">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.1 }}
              className="space-y-4 sm:space-y-6"
            >
              <motion.div 
                variants={itemVariants}
                transition={{ type: "spring", stiffness: 100 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0"
              >
                <h2 className="text-xl sm:text-2xl font-bold">İlan Yönetimi</h2>
                <Button 
                  onClick={handleAddListing}
                  className="bg-[#FFB000] hover:bg-[#FFB000]/80 text-black text-sm sm:text-base w-full sm:w-auto"
                >
                  Yeni İlan Ekle
                </Button>
              </motion.div>

              {/* Category Filter Buttons */}
              <motion.div 
                variants={itemVariants}
                transition={{ type: "spring", stiffness: 100 }}
                className="grid grid-cols-2 w-full max-w-md gap-3"
              >
                <Button
                  onClick={() => setSelectedCategory(selectedCategory === 'emlak' ? null : 'emlak')}
                  className={`text-sm sm:text-base py-2 sm:py-3 ${
                    selectedCategory === 'emlak' 
                      ? "bg-[#FFB000] hover:bg-[#FFB000]/80 text-black" 
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Emlak
                </Button>
                <Button
                  onClick={() => setSelectedCategory(selectedCategory === 'vasita' ? null : 'vasita')}
                  className={`text-sm sm:text-base py-2 sm:py-3 ${
                    selectedCategory === 'vasita' 
                      ? "bg-[#FFB000] hover:bg-[#FFB000]/80 text-black" 
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Vasıta
                </Button>
              </motion.div>

              {/* Search and Advanced Filters */}
              <motion.div 
                variants={itemVariants}
                transition={{ type: "spring", stiffness: 100 }}
                className="space-y-3"
              >
                {/* Search Input */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="İlan başlığı, kategori, alt kategori ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-3 pr-10 py-2 w-full border border-gray-300 rounded-md"
                  />
                </div>

                {/* Advanced Filters */}
                <div className="flex flex-wrap gap-3">
                  {/* Alt Kategori Filter */}
                  <div className="w-full sm:w-auto">
                    <Select 
                      value={selectedSubCategory || "all"} 
                      onValueChange={(value) => setSelectedSubCategory(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Alt Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        {availableSubCategories.map((subCategory) => (
                          <SelectItem key={subCategory} value={subCategory}>
                            {subCategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Satılık/Kiralık Filter */}
                  <div className="w-full sm:w-auto">
                    <Select 
                      value={selectedListingStatus || "all"} 
                      onValueChange={(value) => setSelectedListingStatus(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Satılık/Kiralık" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="satilik">Satılık</SelectItem>
                        <SelectItem value="kiralik">Kiralık</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Öne Çıkanlar Butonu */}
                  <div className="w-full sm:w-auto">
                    <Button
                      variant={showFeaturedOnly ? "default" : "outline"}
                      onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                      className={`w-full sm:w-auto ${
                        showFeaturedOnly 
                          ? "bg-[#FFB000] hover:bg-[#FFB000]/80 text-black" 
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {showFeaturedOnly ? "Tüm İlanlar" : "Öne Çıkanlar"}
                    </Button>
                  </div>

                  {/* Aktif/Pasif Filtresi */}
                  <div className="w-full sm:w-auto">
                    <Select 
                      value={activeStatusFilter} 
                      onValueChange={(value) => setActiveStatusFilter(value)}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Aktif/Pasif" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="passive">Pasif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <Card>
                  <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">
                      Mevcut İlanlar {selectedCategory && `- ${selectedCategory === 'emlak' ? 'Emlak' : 'Vasıta'}`}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Tüm ilanları görüntüleyin, düzenleyin veya silin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <Loading size="medium" text="Yükleniyor..." />
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-500">{error}</div>
                    ) : filteredListings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {selectedCategory 
                          ? `${selectedCategory === 'emlak' ? 'Emlak' : 'Vasıta'} kategorisinde ilan bulunmamaktadır` 
                          : 'Henüz ilan bulunmamaktadır'}
                      </div>
                    ) : (
                      <div className="overflow-x-auto -mx-3 sm:mx-0">
                        <table className="w-full min-w-[700px]">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Vitrin</th>
                              <th 
                                className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm cursor-pointer"
                                onClick={() => handleSort('title')}
                              >
                                İlan Başlığı {getSortIcon('title')}
                              </th>
                              <th 
                                className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm cursor-pointer"
                                onClick={() => handleSort('listing_status')}
                              >
                                Satılık/Kiralık {getSortIcon('listing_status')}
                              </th>
                              <th 
                                className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm cursor-pointer"
                                onClick={() => handleSort('property_type')}
                              >
                                Kategori {getSortIcon('property_type')}
                              </th>
                              <th 
                                className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm cursor-pointer"
                                onClick={() => handleSort('sub_category')}
                              >
                                Alt Kategori {getSortIcon('sub_category')}
                              </th>
                              <th 
                                className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm cursor-pointer"
                                onClick={() => handleSort('price')}
                              >
                                Fiyat {getSortIcon('price')}
                              </th>
                              <th 
                                className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm cursor-pointer"
                                onClick={() => handleSort('is_active')}
                              >
                                Durum {getSortIcon('is_active')}
                              </th>
                              <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredListings.map((listing) => {
                              // Extract property type and subcategory
                              const propertyType = formatPropertyType(listing.property_type);
                              // Subcategory would come from the listing data
                              // This is a placeholder - you'll need to adjust based on your data structure
                              const subCategory = getSubCategory(listing);
                              
                              return (
                                <tr key={listing.id} className="border-b hover:bg-gray-50">
                                  <td className="py-2 sm:py-3 px-2 sm:px-4 w-16 sm:w-28">
                                    <div className="w-14 h-14 sm:w-24 sm:h-24 relative rounded-md overflow-hidden border border-gray-200">
                                      {listing.thumbnail_url ? (
                                        <img 
                                          src={listing.thumbnail_url} 
                                          alt={listing.title} 
                                          className="object-cover w-full h-full"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                                          Resim Yok
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{listing.title}</td>
                                  <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                                    {formatListingStatus(listing.listing_status)}
                                  </td>
                                  <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                                    {propertyType}
                                  </td>
                                  <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                                    {subCategory}
                                  </td>
                                  <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                                    {formatPrice(listing.price)}
                                  </td>
                                  <td className="text-center py-2 sm:py-3 px-2 sm:px-4">
                                    <span className={`inline-block px-2 py-0.5 sm:py-1 rounded-full text-xs ${
                                      listing.is_active 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-gray-100 text-gray-800"
                                    }`}>
                                      {listing.is_active ? 'Aktif' : 'Pasif'}
                                    </span>
                                  </td>
                                  <td className="text-center py-2 sm:py-3 px-2 sm:px-4">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="h-6 sm:h-8 px-1 sm:px-2 text-xs sm:text-sm"
                                        >
                                          İşlemler
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem 
                                          onClick={() => router.push(`/admin/panel/add-listing?id=${listing.id}`)}
                                        >
                                          Düzenle
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleDuplicateListing(listing)}
                                        >
                                          İlan Çoğaltma
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleToggleStatus(listing.id, listing.is_active)}
                                        >
                                          {listing.is_active ? "Pasif Yap" : "Aktif Yap"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleToggleFeatured(listing.id, listing.is_featured)}
                                        >
                                          {listing.is_featured ? "Öne Çıkarma" : "Öne Çıkar"}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={() => handleDeleteListing(listing.id)}
                                          className="text-red-500"
                                        >
                                          Sil
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 