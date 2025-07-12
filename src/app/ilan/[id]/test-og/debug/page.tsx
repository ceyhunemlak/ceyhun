import React from 'react';
import { supabase } from '@/lib/supabase';
import { createSlug, createSocialImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DebugImagePage({ params }: { params: { id: string } }) {
  const slug = params.id as string;
  
  // Check if the ID is a UUID or a slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  let listing: any = null;
  let error: any = null;
  
  try {
    if (isUUID) {
      // Fetch by ID
      const { data, error: fetchError } = await supabase
        .from('listings')
        .select(`
          *,
          images(*),
          addresses(*)
        `)
        .eq('id', slug)
        .single();
      
      if (fetchError || !data) {
        throw fetchError || new Error('Listing not found');
      }
      
      listing = data;
    } else {
      // Fetch all listings and find the one with a matching slug
      const { data: listings, error: fetchError } = await supabase
        .from('listings')
        .select(`
          *,
          images(*),
          addresses(*)
        `)
        .eq('is_active', true);
      
      if (fetchError || !listings) {
        throw fetchError || new Error('Failed to fetch listings');
      }
      
      listing = listings.find((item: any) => {
        if (!item.title) return false;
        const itemSlug = createSlug(item.title);
        return itemSlug === slug;
      });
      
      if (!listing) {
        throw new Error('Listing not found');
      }
    }
  } catch (e) {
    error = e;
    console.error('Error fetching listing:', e);
  }
  
  if (error) {
    return (
      <div className="container mx-auto my-8 p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Hata Oluştu</h1>
        <p>{error.message || 'Bilinmeyen bir hata oluştu'}</p>
      </div>
    );
  }
  
  if (!listing) {
    return (
      <div className="container mx-auto my-8 p-4">
        <h1 className="text-2xl font-bold mb-4">İlan bulunamadı</h1>
      </div>
    );
  }
  
  // Get the cover image or the first image
  const coverImage = listing.images?.find((img: any) => img.is_cover) || listing.images?.[0];
  const imageUrl = coverImage?.url || listing.thumbnail_url || '';
  
  // Make different versions of the image URL to test
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'ceyhun-emlak.com';
  
  // Generate various URL formats for testing
  const originalUrl = imageUrl;
  const standardAbsoluteUrl = createSocialImageUrl(imageUrl, { siteUrl });
  const optimizedUrl = createSocialImageUrl(imageUrl, { siteUrl, optimize: true });
  
  // Test different variations
  const imageVariations = [
    { name: 'Orijinal URL', url: originalUrl },
    { name: 'Standart Mutlak URL', url: standardAbsoluteUrl },
    { name: 'Optimize Edilmiş URL (WhatsApp için)', url: optimizedUrl },
    // Add a static test image that is definitely accessible
    { name: 'Kontrol Görseli', url: `https://${siteUrl}/images/logo_black.png` }
  ];
  
  return (
    <div className="container mx-auto my-8 p-4">
      <h1 className="text-3xl font-bold mb-6">Görsel URL Hata Ayıklama</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">İlan Bilgileri</h2>
        <Card className="p-4">
          <p><strong>ID:</strong> {listing.id}</p>
          <p><strong>Başlık:</strong> {listing.title}</p>
          <p><strong>Slug:</strong> {createSlug(listing.title)}</p>
          <p><strong>WhatsApp Paylaşım URL'i:</strong> {`https://${siteUrl}/ilan/${createSlug(listing.title)}`}</p>
        </Card>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Meta Tag Görsel URL'leri</h2>
        <Card className="p-4">
          <p><strong>Kullanılan og:image URL'i:</strong> {optimizedUrl}</p>
          <p className="mt-2 text-sm text-gray-500">
            WhatsApp, Facebook gibi platformlar tarafından kullanılacak URL.
            Bu URL'nin doğrudan tarayıcınızda açılabilmesi ve herkes tarafından 
            erişilebilir olması gerekir.
          </p>
        </Card>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Görsel URL Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {imageVariations.map((variation, index) => (
            <Card key={index} className="p-4">
              <h3 className="font-medium mb-2">{variation.name}</h3>
              <p className="text-xs break-all mb-4">{variation.url}</p>
              <div className="relative h-48 border rounded overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={variation.url}
                    alt={`${variation.name} test`}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
              <div className="mt-3">
                <a 
                  href={variation.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  URL'i yeni sekmede aç
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">WhatsApp'ta Test Etme Adımları</h2>
        <Card className="p-4">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Bu ilanın detay sayfasına gidin: <span className="text-blue-600">{`/ilan/${createSlug(listing.title)}`}</span></li>
            <li>Bu URL'i WhatsApp'ta birisiyle paylaşın</li>
            <li>Eğer hala görsel görünmüyorsa:</li>
            <ul className="list-disc pl-5 mt-1">
              <li>Görsel URL'lerinin erişilebilir olduğundan emin olun</li>
              <li>Cloudinary URL'i yerine doğrudan dosya sisteminden bir görsel kullanmayı deneyin</li>
              <li>Görsel boyutlarının 300KB'dan küçük olduğunu kontrol edin</li>
            </ul>
          </ol>
        </Card>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Görsel Bilgileri</h2>
        {listing.images && listing.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listing.images.map((img: any) => (
              <Card key={img.id} className="p-4">
                <p><strong>ID:</strong> {img.id}</p>
                <p><strong>URL:</strong> <span className="text-xs break-all">{img.url}</span></p>
                <p><strong>Kapak Görseli:</strong> {img.is_cover ? 'Evet' : 'Hayır'}</p>
                <p><strong>Sıra:</strong> {img.order_index}</p>
                <div className="relative h-40 mt-3 border rounded overflow-hidden">
                  <Image
                    src={img.url}
                    alt={`İlan görseli ${img.id}`}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p>Bu ilan için görsel bulunamadı.</p>
        )}
      </div>
    </div>
  );
} 