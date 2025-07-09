import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import "swiper/css";
import "swiper/css/autoplay";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Ceyhun Gayrimenkul Emlak",
  description: "Tokat Merkez'de faaliyet gösteren emlak ağırlıklı gayrimenkul şirketi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${poppins.variable} ${inter.variable} no-scrollbar`}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased no-scrollbar mobile-scroll-fix">
        {children}
        
        {/* Script to load stylesheets asynchronously */}
        <Script id="load-stylesheets" strategy="afterInteractive">
          {`
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/swiper/swiper.min.css';
            link.media = 'print';
            link.onload = function() { this.media = 'all'; };
            document.head.appendChild(link);
          `}
        </Script>
        
        {/* Script to prevent text selection */}
        <Script id="prevent-text-selection" strategy="afterInteractive">
          {`
            document.addEventListener('mousedown', function(e) {
              if (e.detail > 1) {
                e.preventDefault();
              }
            }, false);
            
            // Only prevent default for specific elements, not all touch events
            document.addEventListener('touchstart', function() {
              const selectables = document.querySelectorAll('select, button, a, [role="button"], [role="tab"], [role="listbox"], [role="option"], .select-trigger, .select-content, .tabs-trigger, .tabs-list, .tabs-content, label');
              selectables.forEach(el => {
                el.addEventListener('touchstart', function(e) {
                  // Don't prevent default on all touch events to allow scrolling
                  if (e.target.classList.contains('no-touch-default')) {
                  e.preventDefault();
                  }
                }, { passive: true });
              });
            }, {once: true});
          `}
        </Script>
        
        {/* Schema.org structured data for Real Estate Agent */}
        <Script id="schema-real-estate-agent" type="application/ld+json">
          {`
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Ceyhun Gayrimenkul",
  "url": "https://www.ceyhundan.com",
  "logo": "https://www.ceyhundan.com/images/logo_black.png",
  "image": "https://www.ceyhundan.com/images/ce.png",
  "description": "Tokat'ın güvenilir emlak ofisi. Satılık-kiralık ev, daire, arsa ve iş yeri ilanları.",
  "telephone": "+9005323850420",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Tokat",
    "addressRegion": "Tokat",
    "addressCountry": "TR"
  },
  "openingHours": "Mo,Tu,We,Th,Fr 09:00-18:00",
  "priceRange": "$$",
  "sameAs": [
    "https://www.facebook.com/CeyhunGayrimenkulEmlak",
    "https://www.instagram.com/ceyhungayrimenkul"
  ]
}
          `}
        </Script>
        
        {/* Script to fix mobile viewport height and scrolling issues */}
        <Script id="fix-viewport-height" strategy="afterInteractive">
          {`
            // Fix for mobile 100vh issue
            function setVH() {
              let vh = window.innerHeight * 0.01;
              document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
            }
            
            // Set the value on page load
            setVH();
            
            // Update the value on resize and orientation change
            window.addEventListener('resize', setVH);
            window.addEventListener('orientationchange', setVH);
            
            // Fix for iOS Safari overscroll behavior - only prevent body touchmove
            document.body.addEventListener('touchmove', function(e) {
              if (e.target === document.body) {
                e.preventDefault();
              }
            }, { passive: false });
            
            // Improve scrolling for all elements
            document.addEventListener('DOMContentLoaded', function() {
              // Add mobile-scroll-fix class to scrollable containers
              const scrollableElements = document.querySelectorAll('.filter-area, .swiper-container, .listing-card, .category-card');
              scrollableElements.forEach(el => {
                el.classList.add('allow-scroll');
              });
              
              // Fix for category cards and listings to allow scrolling
              const touchTargets = document.querySelectorAll('.category-card, .listing-card, .swiper-slide');
              touchTargets.forEach(el => {
                el.addEventListener('touchmove', function(e) {
                  e.stopPropagation();
                }, { passive: true });
              });
            });
            
            // Fix for iOS momentum scrolling
            document.addEventListener('touchmove', function() {}, { passive: true });
          `}
        </Script>
      </body>
    </html>
  );
}
