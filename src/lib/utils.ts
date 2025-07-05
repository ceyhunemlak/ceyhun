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
