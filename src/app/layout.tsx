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
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
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
      <body className="antialiased no-scrollbar mobile-scroll-fix">
        {children}
        
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
