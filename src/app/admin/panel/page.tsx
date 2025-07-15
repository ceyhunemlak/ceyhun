"use client";

import { useState, useEffect, useRef } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, ChevronsUpDown, Check, X } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import Script from "next/script";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedListings, setPaginatedListings] = useState<Listing[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const [stats, setStats] = useState<Stats>({
    totalViews: 0,
    contactClicks: 0,
    activeListings: 0,
    topPerforming: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Price edit state
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [selectedListingForPrice, setSelectedListingForPrice] = useState<Listing | null>(null);
  const [formattedPrice, setFormattedPrice] = useState<string>("");
  const priceInputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number>(0);
  
  // Title edit state
  const [isTitleDialogOpen, setIsTitleDialogOpen] = useState(false);
  const [selectedListingForTitle, setSelectedListingForTitle] = useState<Listing | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Toast notification state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success"
  });

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

  // Price form schema
  const priceFormSchema = z.object({
    price: z.coerce.number().positive({ message: "Fiyat pozitif bir değer olmalıdır" })
  });

  // Price form
  const priceForm = useForm<z.infer<typeof priceFormSchema>>({
    resolver: zodResolver(priceFormSchema),
    defaultValues: {
      price: 0
    }
  });
  
  // Title form schema
  const titleFormSchema = z.object({
    title: z.string().min(1, { message: "Başlık boş olamaz" })
  });

  // Title form
  const titleForm = useForm<z.infer<typeof titleFormSchema>>({
    resolver: zodResolver(titleFormSchema),
    defaultValues: {
      title: ""
    }
  });

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
        
        // Check URL parameters for filter settings
        const urlParams = new URLSearchParams(window.location.search);
        const filterParam = urlParams.get('filter');
        
        // If filter=all is in the URL, show all listings
        if (filterParam === 'all') {
          setActiveStatusFilter('all');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('İlanları yüklerken bir hata oluştu');
        setIsLoading(false);
      }
    };
    
    fetchListings();
  }, []);

  // Reset to page 1 only when filter or sort settings change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubCategory, selectedListingStatus, searchQuery, sortConfig, showFeaturedOnly, activeStatusFilter]);
  
  // Apply filters when category, search, or sort changes
  useEffect(() => {
    if (selectedCategory === 'emlak') {
      const emlakListings = listings.filter(listing => 
        ['konut', 'ticari', 'arsa'].includes(listing.property_type.toLowerCase())
      );
      
      applyFiltersAndSort(emlakListings);
    } else if (selectedCategory === 'vasita') {
      const vasitaListings = listings.filter(listing => 
        listing.property_type.toLowerCase() === 'vasita'
      );
      
      applyFiltersAndSort(vasitaListings);
    } else {
      // All listings
      applyFiltersAndSort(listings);
    }
    // Reset to first page ONLY when filter or sort settings change, not when just the listings content changes
  }, [selectedCategory, selectedSubCategory, selectedListingStatus, searchQuery, sortConfig, showFeaturedOnly, activeStatusFilter]);
  
  // Apply listings changes separately without affecting pagination
  useEffect(() => {
    if (selectedCategory === 'emlak') {
      const emlakListings = listings.filter(listing => 
        ['konut', 'ticari', 'arsa'].includes(listing.property_type.toLowerCase())
      );
      
      applyFiltersAndSort(emlakListings);
    } else if (selectedCategory === 'vasita') {
      const vasitaListings = listings.filter(listing => 
        listing.property_type.toLowerCase() === 'vasita'
      );
      
      applyFiltersAndSort(vasitaListings);
    } else {
      // All listings
      applyFiltersAndSort(listings);
    }
  }, [listings, selectedCategory]);

  // Apply pagination when filtered listings or pagination settings change
  useEffect(() => {
    const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
    setTotalPages(totalPages || 1); // Ensure at least 1 page
    
    // Adjust current page if it exceeds the new total
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
    
    // Calculate paginated listings
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    setPaginatedListings(filteredListings.slice(startIdx, endIdx));
  }, [filteredListings, currentPage, itemsPerPage]);

  // Function to apply all filters, search, and sorting
  const applyFiltersAndSort = (baseListings: Listing[]) => {
    let result = [...baseListings];
    
    // Apply property type filter if selected
    if (selectedSubCategory) {
      result = result.filter(listing => listing.property_type.toLowerCase() === selectedSubCategory.toLowerCase());
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
  
  // Function to handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Function to handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Function to get pagination range (for displaying page numbers)
  const getPaginationRange = () => {
    const range: number[] = [];
    const maxButtons = 5; // Max number of page buttons to show
    
    if (totalPages <= maxButtons) {
      // Show all pages if total is less than max buttons
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // Calculate range with current page in the middle when possible
      const halfButtons = Math.floor(maxButtons / 2);
      
      let startPage = Math.max(1, currentPage - halfButtons);
      let endPage = Math.min(totalPages, startPage + maxButtons - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        range.push(i);
      }
    }
    
    return range;
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
      return <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />;
    }
    
    return sortConfig.direction === 'ascending' 
      ? <ChevronUp className="ml-2 h-4 w-4 text-[#FFB000]" />
      : <ChevronDown className="ml-2 h-4 w-4 text-[#FFB000]" />;
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    router.push("/admin");
  };

  // Function to handle adding a new listing
  const handleAddListing = () => {
    router.push('/admin/panel/add-listing');
  };

  // Function to handle editing a listing (open in new tab)
  const handleEditListing = (id: string) => {
    window.open(`/admin/panel/add-listing?id=${id}`, '_blank');
  };

  // Function to delete a listing
  const handleDeleteListing = async (id: string) => {
    // Open the delete confirmation dialog
    setListingToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Function to confirm deletion
  const confirmDelete = async () => {
    if (!listingToDelete) return;
    
    try {
      // Use the correct API endpoint with query parameter
      const response = await fetch(`/api/listings?id=${listingToDelete}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      
      // Remove listing from state
      setListings(listings.filter(listing => listing.id !== listingToDelete));
      
      // Update stats if the listing was active
      const deletedListing = listings.find(listing => listing.id === listingToDelete);
      if (deletedListing?.is_active) {
        setStats(prev => ({
          ...prev,
          activeListings: prev.activeListings - 1
        }));
      }
      
      // Show success toast
      showToast('İlan başarıyla silindi', 'success');
    } catch (error) {
      console.error('Error deleting listing:', error);
      showToast('İlan silinirken bir hata oluştu', 'error');
    } finally {
      // Close the dialog and reset the listing to delete
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setListingToDelete(null);
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
      const updatedListings = listings.map(listing => 
        listing.id === id ? { ...listing, is_active: !currentStatus } : listing
      );
      setListings(updatedListings);
      
      // Update active listings count in stats
      setStats(prev => ({
        ...prev,
        activeListings: currentStatus 
          ? prev.activeListings - 1 
          : prev.activeListings + 1
      }));
      
      // Show success toast
      showToast(
        currentStatus ? 'İlan pasif duruma getirildi' : 'İlan aktif duruma getirildi', 
        'success'
      );
    } catch (error) {
      console.error('Error toggling active status:', error);
      showToast('İlan aktiflik durumu güncellenirken bir hata oluştu', 'error');
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
      const updatedListings = listings.map(listing => 
        listing.id === id ? { ...listing, is_featured: !currentStatus } : listing
      );
      setListings(updatedListings);
      
      // Show success toast
      showToast(
        currentStatus ? 'İlan öne çıkarma kaldırıldı' : 'İlan öne çıkarıldı', 
        'success'
      );
    } catch (error) {
      console.error('Error toggling featured status:', error);
      showToast('İlan öne çıkarma durumu güncellenirken bir hata oluştu', 'error');
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
      
      // Show success toast
      showToast('İlan başarıyla çoğaltıldı', 'success');
      
      // Open the duplicated listing in a new tab for editing
      window.open(`/admin/panel/add-listing?id=${newListing.id}`, '_blank');
    } catch (error) {
      console.error('Error duplicating listing:', error);
      showToast('İlan çoğaltılırken bir hata oluştu', 'error');
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

  // Function to handle price update
  const handlePriceEdit = async (id: string, listing: Listing) => {
    setSelectedListingForPrice(listing);
    priceForm.setValue("price", listing.price);
    setFormattedPrice(formatNumberWithDots(listing.price.toString()));
    setIsPriceDialogOpen(true);
    
    // Focus and select the input after dialog opens
    setTimeout(() => {
      if (priceInputRef.current) {
        priceInputRef.current.focus();
        priceInputRef.current.select();
      }
    }, 100);
  };

  // Function to format number with dots
  const formatNumberWithDots = (value: string): string => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format with dots
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Function to handle price input change
  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const selectionStart = input.selectionStart || 0;
    const oldValue = formattedPrice;
    const oldValueWithoutDots = oldValue.replace(/\./g, '');
    const newValueWithoutDots = input.value.replace(/\./g, '');
    
    // Calculate cursor position adjustment
    let cursorAdjustment = 0;
    for (let i = 0; i < selectionStart; i++) {
      if (input.value[i] === '.') {
        cursorAdjustment++;
      }
    }
    
    // Store the cursor position relative to the unformatted value
    const cursorPositionInUnformatted = selectionStart - cursorAdjustment;
    cursorPositionRef.current = cursorPositionInUnformatted;
    
    // Format the new value
    const formattedNewValue = formatNumberWithDots(input.value);
    setFormattedPrice(formattedNewValue);
    
    // Update the form value with the numeric value
    priceForm.setValue("price", parseInt(newValueWithoutDots) || 0);
  };

  // Effect to restore cursor position after formatting
  useEffect(() => {
    if (priceInputRef.current) {
      const input = priceInputRef.current;
      const unformattedValue = formattedPrice.replace(/\./g, '');
      
      // Calculate the new cursor position in the formatted value
      let newCursorPosition = cursorPositionRef.current;
      let dotsBeforeCursor = 0;
      
      // Count dots that appear before the cursor position
      const valueBeforeCursor = unformattedValue.substring(0, cursorPositionRef.current);
      const formattedValueBeforeCursor = formatNumberWithDots(valueBeforeCursor);
      dotsBeforeCursor = formattedValueBeforeCursor.length - valueBeforeCursor.length;
      
      newCursorPosition += dotsBeforeCursor;
      
      // Make sure the new position is within bounds
      newCursorPosition = Math.min(newCursorPosition, formattedPrice.length);
      
      // Set the cursor position
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    }
  }, [formattedPrice]);

  // Function to show toast
  const showToast = (message: string, type: "success" | "error") => {
    setToast({
      visible: true,
      message,
      type
    });
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Function to handle price update
  const handlePriceSubmit = async (values: z.infer<typeof priceFormSchema>) => {
    if (!selectedListingForPrice) return;
    
    try {
      const response = await fetch('/api/listings/update/price', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedListingForPrice.id,
          price: values.price
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update price');
      }
      
      // Update the listing in state
      const updatedListings = listings.map(listing => 
        listing.id === selectedListingForPrice.id ? { ...listing, price: values.price } : listing
      );
      setListings(updatedListings);
      
      // Close dialog
      setIsPriceDialogOpen(false);
      setSelectedListingForPrice(null);
      
      // Show success toast
      showToast('Fiyat başarıyla güncellendi', 'success');
    } catch (error) {
      console.error('Error updating price:', error);
      showToast('Fiyat güncellenirken bir hata oluştu', 'error');
    }
  };
  
  // Function to handle title edit
  const handleTitleEdit = async (id: string, listing: Listing) => {
    setSelectedListingForTitle(listing);
    titleForm.setValue("title", listing.title);
    setIsTitleDialogOpen(true);
    
    // Focus and select the input after dialog opens
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
        titleInputRef.current.select();
      }
    }, 100);
  };
  
  // Function to handle title update
  const handleTitleSubmit = async (values: z.infer<typeof titleFormSchema>) => {
    if (!selectedListingForTitle) return;
    
    try {
      const response = await fetch('/api/listings/update/title', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedListingForTitle.id,
          title: values.title
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update title');
      }
      
      // Update the listing in state
      const updatedListings = listings.map(listing => 
        listing.id === selectedListingForTitle.id ? { ...listing, title: values.title } : listing
      );
      setListings(updatedListings);
      
      // Close dialog
      setIsTitleDialogOpen(false);
      setSelectedListingForTitle(null);
      
      // Show success toast
      showToast('Başlık başarıyla güncellendi', 'success');
    } catch (error) {
      console.error('Error updating title:', error);
      showToast('Başlık güncellenirken bir hata oluştu', 'error');
    }
  };

  // Function to navigate to listing detail page
  const navigateToListingPage = (listing: Listing) => {
    // Open in a new tab
    window.open(`/ilan/${listing.id}`, '_blank');
  };

  // Pagination Component
  const PaginationControls = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-6 mt-4 mb-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Sayfa başına:</span>
        <Select 
          value={itemsPerPage.toString()} 
          onValueChange={handleItemsPerPageChange}
        >
          <SelectTrigger className="w-24 h-10 min-w-[96px]">
            <SelectValue placeholder={itemsPerPage.toString()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="h-10 w-10 p-0 flex items-center justify-center border border-gray-300"
        >
          <span className="sr-only">İlk Sayfa</span>
          <span>«</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-10 w-10 p-0 flex items-center justify-center border border-gray-300"
        >
          <span className="sr-only">Önceki Sayfa</span>
          <span>‹</span>
        </Button>
        
        {getPaginationRange().map(page => (
          <Button 
            key={page}
            variant={currentPage === page ? "default" : "outline"} 
            size="sm" 
            onClick={() => handlePageChange(page)}
            className={`h-10 w-10 p-0 flex items-center justify-center border ${
              currentPage === page 
                ? "bg-[#FFB000] hover:bg-[#FFB000]/80 text-black border-[#FFB000]" 
                : "border-gray-300"
            }`}
          >
            {page}
          </Button>
        ))}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-10 w-10 p-0 flex items-center justify-center border border-gray-300"
        >
          <span className="sr-only">Sonraki Sayfa</span>
          <span>›</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-10 w-10 p-0 flex items-center justify-center border border-gray-300"
        >
          <span className="sr-only">Son Sayfa</span>
          <span>»</span>
        </Button>
      </div>
      
      <div className="text-sm text-gray-500">
        Toplam: <span className="font-medium">{filteredListings.length}</span> ilan
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex-1 flex justify-center">
            <a href="/" className="flex items-center">
              <Image 
                src="/images/logo_black.png" 
                alt="Ceyhun Gayrimenkul Logo" 
                width={120}
                height={40}
                className="h-10 w-auto object-contain" 
              />
            </a>
          </div>
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

                {/* Filter Controls - Consistent UI */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Property Type Filter */}
                  <div className="flex flex-col gap-1">
                    <Select 
                      value={selectedSubCategory || "all"} 
                      onValueChange={(value) => setSelectedSubCategory(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="konut">Konut</SelectItem>
                        <SelectItem value="ticari">Ticari</SelectItem>
                        <SelectItem value="arsa">Arsa</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-gray-500 px-1">Ana kategori</span>
                  </div>

                  {/* Satılık/Kiralık Filter */}
                  <div className="flex flex-col gap-1">
                    <Select 
                      value={selectedListingStatus || "all"} 
                      onValueChange={(value) => setSelectedListingStatus(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Satılık/Kiralık" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="satilik">Satılık</SelectItem>
                        <SelectItem value="kiralik">Kiralık</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-gray-500 px-1">İlan durumu</span>
                  </div>

                  {/* Aktif/Pasif Filtresi */}
                  <div className="flex flex-col gap-1">
                    <Select 
                      value={activeStatusFilter} 
                      onValueChange={(value) => setActiveStatusFilter(value)}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Durum" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="passive">Pasif</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-gray-500 px-1">Yayında/Yayında değil</span>
                  </div>

                  {/* Öne Çıkanlar Filtresi */}
                  <div className="flex flex-col gap-1">
                    <Select 
                      value={showFeaturedOnly ? "featured" : "all"} 
                      onValueChange={(value) => setShowFeaturedOnly(value === "featured")}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Öne Çıkanlar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm İlanlar</SelectItem>
                        <SelectItem value="featured">Öne Çıkanlar</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-gray-500 px-1">Vitrin ilanları</span>
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
                      {selectedSubCategory && ` - ${formatPropertyType(selectedSubCategory)}`}
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
                      <>
                        {/* Top Pagination Controls */}
                        <PaginationControls />
                        
                        <div className="overflow-x-auto -mx-3 sm:mx-0">
                          <table className="w-full min-w-[700px]">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Vitrin</th>
                                <th 
                                  className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:text-[#FFB000] transition-colors"
                                  onClick={() => handleSort('title')}
                                >
                                  <div className="flex items-center">
                                    İlan Başlığı
                                    {getSortIcon('title')}
                                  </div>
                                </th>
                                <th 
                                  className="text-center py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:text-[#FFB000] transition-colors"
                                  onClick={() => handleSort('listing_status')}
                                >
                                  <div className="flex items-center justify-center">
                                    Satılık/Kiralık
                                    {getSortIcon('listing_status')}
                                  </div>
                                </th>
                                <th 
                                  className="text-center py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:text-[#FFB000] transition-colors"
                                  onClick={() => handleSort('property_type')}
                                >
                                  <div className="flex items-center justify-center">
                                    Kategori
                                    {getSortIcon('property_type')}
                                  </div>
                                </th>
                                <th 
                                  className="text-center py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:text-[#FFB000] transition-colors"
                                  onClick={() => handleSort('sub_category')}
                                >
                                  <div className="flex items-center justify-center">
                                    Alt Kategori
                                    {getSortIcon('sub_category')}
                                  </div>
                                </th>
                                <th 
                                  className="text-center py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:text-[#FFB000] transition-colors"
                                  onClick={() => handleSort('price')}
                                >
                                  <div className="flex items-center justify-center">
                                    Fiyat
                                    {getSortIcon('price')}
                                  </div>
                                </th>
                                <th 
                                  className="text-center py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:text-[#FFB000] transition-colors"
                                  onClick={() => handleSort('is_active')}
                                >
                                  <div className="flex items-center justify-center">
                                    Durum
                                    {getSortIcon('is_active')}
                                  </div>
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">İşlemler</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedListings.map((listing) => {
                                // Extract property type and subcategory
                                const propertyType = formatPropertyType(listing.property_type);
                                // Subcategory would come from the listing data
                                // This is a placeholder - you'll need to adjust based on your data structure
                                const subCategory = getSubCategory(listing);
                                
                                return (
                                  <tr key={listing.id} className="border-b hover:bg-gray-50">
                                    <td className="py-2 sm:py-3 px-2 sm:px-4 w-16 sm:w-28">
                                      <div 
                                        className="w-14 h-14 sm:w-24 sm:h-24 relative rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => navigateToListingPage(listing)}
                                      >
                                        {listing.thumbnail_url ? (
                                          <Image 
                                            src={listing.thumbnail_url} 
                                            alt={listing.title} 
                                            fill
                                            className="object-cover w-full h-full"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                                            Resim Yok
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td 
                                      className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm cursor-pointer hover:text-[#FFB000] transition-colors"
                                      onDoubleClick={() => handleTitleEdit(listing.id, listing)}
                                    >
                                      {listing.title}
                                    </td>
                                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                                      {formatListingStatus(listing.listing_status)}
                                    </td>
                                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                                      {propertyType}
                                    </td>
                                    <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                                      {subCategory}
                                    </td>
                                    <td 
                                      className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm cursor-pointer hover:text-[#FFB000] transition-colors"
                                      onDoubleClick={() => handlePriceEdit(listing.id, listing)}
                                    >
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
                                            onClick={() => handleEditListing(listing.id)}
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
                                          <DropdownMenuItem 
                                            onClick={() => {
                                              handlePriceEdit(listing.id, listing);
                                            }}
                                          >
                                            Fiyat Düzenle
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => {
                                              handleTitleEdit(listing.id, listing);
                                            }}
                                          >
                                            Başlık Düzenle
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
                        
                        {/* Bottom Pagination Controls */}
                        <PaginationControls />
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-md shadow-lg ${
              toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className={`p-1 rounded-full ${
              toast.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
            </div>
            <span className={`text-sm font-medium ${
              toast.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {toast.message}
            </span>
            <button 
              onClick={() => setToast(prev => ({ ...prev, visible: false }))}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Price Edit Dialog */}
      <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
        <DialogContent className="max-w-[90vw] w-[400px] bg-white rounded-lg border-0 shadow-lg p-4">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold text-black">Fiyat Düzenle</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm break-words">
              {selectedListingForPrice?.title} için yeni fiyat giriniz
            </DialogDescription>
          </DialogHeader>
          <Form {...priceForm}>
            <form onSubmit={priceForm.handleSubmit(handlePriceSubmit)} className="space-y-4 pt-3">
              <FormField
                control={priceForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Fiyat</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="text" 
                          value={formattedPrice}
                          onChange={handlePriceInputChange}
                          placeholder="Fiyat giriniz"
                          className="pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FFB000] focus:border-[#FFB000] text-lg font-medium"
                          ref={priceInputRef}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                          ₺
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex gap-2 pt-3 mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPriceDialogOpen(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700"
                >
                  İptal
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-[#FFB000] hover:bg-[#FFB000]/90 text-black font-medium"
                >
                  Kaydet
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Title Edit Dialog */}
      <Dialog open={isTitleDialogOpen} onOpenChange={setIsTitleDialogOpen}>
        <DialogContent className="max-w-[90vw] w-[400px] bg-white rounded-lg border-0 shadow-lg p-4">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold text-black">Başlık Düzenle</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm break-words">
              {selectedListingForTitle?.property_type && formatPropertyType(selectedListingForTitle.property_type)} ilanı için yeni başlık giriniz
            </DialogDescription>
          </DialogHeader>
          <Form {...titleForm}>
            <form onSubmit={titleForm.handleSubmit(handleTitleSubmit)} className="space-y-4 pt-3">
              <FormField
                control={titleForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Başlık</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        {...field}
                        placeholder="Başlık giriniz"
                        className="pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FFB000] focus:border-[#FFB000] text-lg font-medium"
                        ref={titleInputRef}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex gap-2 pt-3 mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsTitleDialogOpen(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700"
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-[#FFB000] hover:bg-[#FFB000]/90 text-black font-medium"
                >
                  Kaydet
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

             {/* Delete Confirmation Dialog */}
       <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
         <DialogContent className="max-w-[90vw] w-[400px] bg-white rounded-lg border-0 shadow-lg p-4">
           <DialogHeader className="border-b pb-3">
             <DialogTitle className="text-lg font-bold text-black">İlanı Sil</DialogTitle>
             <DialogDescription className="text-gray-600 text-sm break-words">
               {listingToDelete ? `Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.` : ''}
             </DialogDescription>
           </DialogHeader>
           <DialogFooter className="flex gap-2 pt-3 mt-2">
             <Button 
               type="button" 
               variant="outline" 
               onClick={cancelDelete}
               className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700"
             >
               İptal
             </Button>
             <Button 
               type="button" 
               variant="destructive" 
               onClick={confirmDelete}
               className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium"
             >
               Sil
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
      
      <Script id="enable-scrollbars" strategy="afterInteractive">
        {`
          document.documentElement.style.overflow = 'auto';
          document.body.style.overflow = 'auto';
        `}
      </Script>
    </div>
  );
} 