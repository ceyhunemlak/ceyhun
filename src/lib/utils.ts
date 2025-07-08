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
