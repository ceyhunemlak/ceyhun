"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TestOpenGraphPage() {
  const [ogTags, setOgTags] = useState<Record<string, string>>({});
  const [twitterTags, setTwitterTags] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Get all meta tags when component mounts
    const metaTags = document.querySelectorAll('meta');
    
    // Extract OpenGraph tags
    const ogTagsFound: Record<string, string> = {};
    metaTags.forEach(tag => {
      const property = tag.getAttribute('property');
      if (property && property.startsWith('og:')) {
        ogTagsFound[property] = tag.getAttribute('content') || '';
      }
    });
    setOgTags(ogTagsFound);
    
    // Extract Twitter Card tags
    const twitterTagsFound: Record<string, string> = {};
    metaTags.forEach(tag => {
      const name = tag.getAttribute('name');
      if (name && name.startsWith('twitter:')) {
        twitterTagsFound[name] = tag.getAttribute('content') || '';
      }
    });
    setTwitterTags(twitterTagsFound);
  }, []);
  
  return (
    <div className="container mx-auto my-8 px-4">
      <h1 className="text-3xl font-bold mb-6">OpenGraph Test Page</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">OpenGraph Meta Tags</h2>
          {Object.keys(ogTags).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(ogTags).map(([tag, content]) => (
                <div key={tag} className="border-b pb-2">
                  <p className="font-medium text-blue-600">{tag}</p>
                  <p className="text-gray-600 break-words">{content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-yellow-600">No OpenGraph tags found.</p>
          )}
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Twitter Card Meta Tags</h2>
          {Object.keys(twitterTags).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(twitterTags).map(([tag, content]) => (
                <div key={tag} className="border-b pb-2">
                  <p className="font-medium text-blue-600">{tag}</p>
                  <p className="text-gray-600 break-words">{content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-yellow-600">No Twitter Card tags found.</p>
          )}
        </Card>
      </div>
      
      {ogTags['og:image'] && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">OpenGraph Image Preview</h2>
          <div className="relative w-full h-80">
            <Image 
              src={ogTags['og:image']} 
              alt="OpenGraph preview image"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </Card>
      )}
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Rich Link Preview Examples</h2>
        <p className="text-gray-600">
          This is how your listing will appear when shared on messaging apps like WhatsApp, Telegram, or social media platforms like Facebook, Twitter, etc.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Preview */}
          <Card className="overflow-hidden">
            <div className="bg-[#075e54] text-white p-3">
              <p className="font-medium">WhatsApp Preview</p>
            </div>
            <div className="p-3 border-b">
              <p className="text-blue-600 font-medium mb-1">{ogTags['og:title'] || 'İlan Başlığı'}</p>
              <p className="text-gray-600 text-sm line-clamp-2">{ogTags['og:description'] || 'İlan açıklaması burada görünecek...'}</p>
            </div>
            {ogTags['og:image'] && (
              <div className="relative w-full h-40">
                <Image 
                  src={ogTags['og:image']} 
                  alt="WhatsApp preview" 
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
          </Card>
          
          {/* Twitter Preview */}
          <Card className="overflow-hidden">
            <div className="bg-[#1DA1F2] text-white p-3">
              <p className="font-medium">Twitter Preview</p>
            </div>
            <div className="border border-gray-200 rounded m-3 overflow-hidden">
              {ogTags['og:image'] && (
                <div className="relative w-full h-40">
                  <Image 
                    src={ogTags['og:image']} 
                    alt="Twitter preview" 
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
              <div className="p-3">
                <p className="font-bold mb-1">{ogTags['og:title'] || 'İlan Başlığı'}</p>
                <p className="text-gray-600 text-sm line-clamp-2">{ogTags['og:description'] || 'İlan açıklaması burada görünecek...'}</p>
                <p className="text-gray-500 text-xs mt-2">{ogTags['og:url'] || 'ceyhun-emlak.com'}</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="flex justify-center mt-8">
          <Button asChild>
            <Link href="/">Ana Sayfaya Dön</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 