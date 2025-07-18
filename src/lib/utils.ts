import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import neighborhoodsByDistrict from "@/lib/neighborhoods";

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

/**
 * WhatsApp için özel olarak optimize edilmiş görsel URL'si oluşturur
 * WhatsApp platformunun katı gereksinimlerine göre görsel URL'sini düzenler
 * 
 * WhatsApp Gereksinimleri:
 * - Görsel en az 200x200px olmalı
 * - Görsel boyutu 300KB'tan küçük olmalı
 * - Görsel formatı: JPG, PNG veya WEBP olmalı
 * - En iyi görüntüleme için 1:1 (kare) veya 1.91:1 (Facebook standartı) oranı önerilir
 * - Ayrıca 16:9 oranı da kabul edilir
 */
export function createWhatsAppImageUrl(imageUrl: string | null | undefined, options?: {
  fallbackUrl?: string;
  siteUrl?: string;
}): string {
  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'ceyhun-emlak.com';
  
  // Fallback görseli
  if (!imageUrl) {
    return options?.fallbackUrl || `https://${siteUrl}/images/ce.png`;
  }
  
  let absoluteUrl = '';
  
  // Mutlak URL oluştur
  if (imageUrl.startsWith('http')) {
    absoluteUrl = imageUrl;
  } else if (imageUrl.startsWith('/')) {
    absoluteUrl = `https://${siteUrl}${imageUrl}`;
  } else {
    absoluteUrl = `https://${siteUrl}/${imageUrl}`;
  }
  
  // HTTPS kullan
  if (absoluteUrl.startsWith('http:')) {
    absoluteUrl = absoluteUrl.replace('http:', 'https:');
  }
  
  // Cloudinary URL'si ise, WhatsApp için optimize et
  if (absoluteUrl.includes('res.cloudinary.com')) {
    const urlParts = absoluteUrl.split('/upload/');
    
    if (urlParts.length === 2) {
      // WhatsApp için özel optimizasyon parametreleri:
      // w_300 - genişlik: 300px (WhatsApp'ın minimum gereksinimidir)
      // h_300 - yükseklik: 300px (kare oran için)
      // c_fill - resmi kare oranında kırp (en iyi sonuç için)
      // q_auto:good - iyi kalitede otomatik sıkıştırma
      // f_auto - otomatik format seçimi
      const whatsAppParams = 'w_300,h_300,c_fill,q_auto:good,f_auto/';
      absoluteUrl = `${urlParts[0]}/upload/${whatsAppParams}${urlParts[1]}`;
    }
  }
  
  return absoluteUrl;
}

// Helper to get neighborhood label with suffix (Mah. / Köyü) using neighborhoods data

interface AddressParts {
  province: string;
  district: string;
  neighborhood?: string;
}

// Capitalize first letter (simple fallback when diacritics are already correct)
function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts an address slug object coming from database into a human-readable
 * Turkish string like `Tokat/Merkez/Devegörmez Mah.`.
 * - Restores Turkish characters for neighbourhood / village using the
 *   `neighborhoods` dataset so we get e.g. `Devegörmez` instead of
 *   `Devegormez`.
 * - Appends the proper suffix: `Mah.` for mahalle and `Köyü` for köy.
 */
export function formatLocationFromAddress({ province, district, neighborhood }: AddressParts): string {
  const provinceLabel = capitalize(province);
  const districtLabel = capitalize(district);

  let neighborhoodLabel = "";

  if (neighborhood) {
    const districtKey = district.toLowerCase();
    const rawSlug = neighborhood.toLowerCase();

    // Try direct match first
    const districtData: any = (neighborhoodsByDistrict as any)[districtKey];
    if (districtData) {
      const mahItem = districtData.mahalle?.find((n: any) => n.value === rawSlug);
      if (mahItem) {
        neighborhoodLabel = `${mahItem.label} Mah.`;
      } else {
        const koyItem = districtData.koy?.find((n: any) => n.value === rawSlug);
        if (koyItem) {
          neighborhoodLabel = `${koyItem.label} Köyü`;
        }
      }
    }

    // If not matched, try again after stripping common suffixes from slug
    if (!neighborhoodLabel) {
      const strippedSlug = rawSlug.replace(/-(mahallesi|mahalle|mah|mh|koyu|köy|koy)$/i, "");
      if (districtData) {
        const mahItem = districtData.mahalle?.find((n: any) => n.value === strippedSlug);
        if (mahItem) {
          neighborhoodLabel = `${mahItem.label} Mah.`;
        } else {
          const koyItem = districtData.koy?.find((n: any) => n.value === strippedSlug);
          if (koyItem) {
            neighborhoodLabel = `${koyItem.label} Köyü`;
          }
        }
      }

      // Still not matched – build label from slug parts
      if (!neighborhoodLabel) {
        // Determine if it's village by checking keywords in original slug
        const isVillage = /(koy|köy|koyu)/.test(rawSlug);
        const pretty = capitalize(strippedSlug.replace(/-/g, " "));
        neighborhoodLabel = `${pretty} ${isVillage ? "Köyü" : "Mah."}`;
      }
    }
  }

  return neighborhoodLabel
    ? `${provinceLabel}/${districtLabel}/${neighborhoodLabel}`
    : `${provinceLabel}/${districtLabel}`;
}
