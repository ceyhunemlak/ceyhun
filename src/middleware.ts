import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSlug } from './lib/utils';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  
  // Check if the path is an ID-based listing URL
  if (pathname.startsWith('/ilan/')) {
    const id = pathname.split('/')[2];
    
    // Check if the ID is a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUUID) {
      try {
        // Fetch the listing data to get the title
        const response = await fetch(`${url.origin}/api/listings?id=${id}`);
        
        if (response.ok) {
          const listing = await response.json();
          const slug = createSlug(listing.title);
          
          // Create the new URL with the slug
          const newUrl = new URL(`/ilan/${slug}`, url.origin);
          
          // Preserve any query parameters
          newUrl.search = url.search;
          
          // Return a 301 (permanent) redirect
          return NextResponse.redirect(newUrl, 301);
        }
      } catch (error) {
        console.error('Error in middleware:', error);
      }
    }
  }
  
  return NextResponse.next();
}

// Only run the middleware on listing pages and exclude API routes
export const config = {
  matcher: [
    '/ilan/:path*',
    {
      source: '/((?!api/upload|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}; 