import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fiyat değerlerini binlik ayraçlarla formatlayan fonksiyon.
 * Örnek: 1000000 -> 1.000.000
 */
export function formatPrice(price: string | number): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numericPrice)) return '';
  
  return numericPrice.toLocaleString('tr-TR');
}

/**
 * Enum alanları için yardımcı fonksiyon.
 * Boş string, "none" veya undefined değerleri null olarak döndürür.
 * Bu fonksiyon, Supabase'deki enum alanlarına boş değer gönderilmesini önler.
 */
export function handleEnumField(value: string | null | undefined) {
  if (value === "" || value === "none" || value === undefined) return null;
  return value;
}

// Create a slug from a title
export function createSlug(title: string | null | undefined): string {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
    .trim();
}

/**
 * WhatsApp ve sosyal medya platformlarında çalışacak mutlak URL'ler oluşturur
 * Görsellerin doğru şekilde gösterilmesini sağlar
 */
export function createSocialImageUrl(imageUrl: string | null | undefined, options?: {
  fallbackUrl?: string;
  siteUrl?: string;
  optimize?: boolean;
}): string {
  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'ceyhun-emlak.com';
  
  // No image URL provided, use fallback
  if (!imageUrl) {
    return options?.fallbackUrl || `https://${siteUrl}/images/logo_black.png`;
  }
  
  let absoluteUrl = '';
  
  // Check if it's already an absolute URL
  if (imageUrl.startsWith('http')) {
    absoluteUrl = imageUrl;
  } 
  // Check if it's a relative URL starting with /
  else if (imageUrl.startsWith('/')) {
    absoluteUrl = `https://${siteUrl}${imageUrl}`;
  }
  // Otherwise, assume it's a relative URL without leading /
  else {
    absoluteUrl = `https://${siteUrl}/${imageUrl}`;
  }
  
  // Always use HTTPS for security and compatibility
  if (absoluteUrl.startsWith('http:')) {
    absoluteUrl = absoluteUrl.replace('http:', 'https:');
  }
  
  // Optimize Cloudinary URLs if requested
  if (options?.optimize && absoluteUrl.includes('res.cloudinary.com')) {
    // Add optimization parameters for Cloudinary URLs
    // Format: https://res.cloudinary.com/cloud_name/image/upload/...
    
    // Parse existing URL to maintain transformations
    const urlParts = absoluteUrl.split('/upload/');
    
    if (urlParts.length === 2) {
      // Add optimization parameters
      // w_1200 - width: 1200px
      // c_limit - scale down if larger, maintain aspect ratio
      // q_auto:good - good quality auto compression
      // f_auto - automatic format selection (webp when supported)
      const optimizationParams = 'w_1200,c_limit,q_auto:good,f_auto/';
      absoluteUrl = `${urlParts[0]}/upload/${optimizationParams}${urlParts[1]}`;
    }
  }
  
  return absoluteUrl;
}
