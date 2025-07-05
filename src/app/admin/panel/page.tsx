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
import { motion } from "framer-motion";

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
    // This would be implemented in a real app with an API call
    // For now, we'll just update the state
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
              className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6"
            >
              {/* Stats Cards */}
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

              {/* Top Performing Listings */}
              <motion.div 
                variants={itemVariants}
                transition={{ type: "spring", stiffness: 100 }}
                className="col-span-2 md:col-span-4"
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">En Çok İlgi Gören İlanlar</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Son 30 gün içindeki en popüler ilanlar</CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    {isLoading ? (
                      <div className="text-center py-8">Yükleniyor...</div>
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

              <motion.div 
                variants={itemVariants}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <Card>
                  <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Mevcut İlanlar</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Tüm ilanları görüntüleyin, düzenleyin veya silin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    {isLoading ? (
                      <div className="text-center py-8">Yükleniyor...</div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-500">{error}</div>
                    ) : listings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">Henüz ilan bulunmamaktadır</div>
                    ) : (
                      <div className="overflow-x-auto -mx-3 sm:mx-0">
                        <table className="w-full min-w-[700px]">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Vitrin</th>
                              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">İlan Başlığı</th>
                              <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Kategori</th>
                              <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Durum</th>
                              <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Fiyat</th>
                              <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {listings.map((listing) => (
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
                                  {formatPropertyType(listing.property_type)}
                                  {listing.listing_status && ` (${formatListingStatus(listing.listing_status)})`}
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
                                <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{formatPrice(listing.price)}</td>
                                <td className="text-center py-2 sm:py-3 px-2 sm:px-4">
                                  <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-6 sm:h-8 px-1 sm:px-2 text-xs sm:text-sm"
                                      onClick={() => router.push(`/admin/panel/add-listing?id=${listing.id}`)}
                                    >
                                      Düzenle
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-6 sm:h-8 px-1 sm:px-2 border-red-500 text-red-500 hover:bg-red-50 text-xs sm:text-sm"
                                      onClick={() => handleDeleteListing(listing.id)}
                                    >
                                      Sil
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className={`h-6 sm:h-8 px-1 sm:px-2 text-xs sm:text-sm ${
                                        listing.is_active
                                          ? "border-amber-500 text-amber-500 hover:bg-amber-50"
                                          : "border-green-500 text-green-500 hover:bg-green-50"
                                      }`}
                                      onClick={() => handleToggleStatus(listing.id, listing.is_active)}
                                    >
                                      {listing.is_active ? "Pasif Yap" : "Aktif Yap"}
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className={`h-6 sm:h-8 px-1 sm:px-2 text-xs sm:text-sm ${
                                        listing.is_featured
                                          ? "border-purple-500 text-purple-500 hover:bg-purple-50"
                                          : "border-blue-500 text-blue-500 hover:bg-blue-50"
                                      }`}
                                      onClick={() => handleToggleFeatured(listing.id, listing.is_featured)}
                                    >
                                      {listing.is_featured ? "Öne Çıkarma" : "Öne Çıkar"}
                                    </Button>
                                  </div>
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
        </Tabs>
      </main>
    </div>
  );
} 