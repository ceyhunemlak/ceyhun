"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loading } from "@/components/ui/loading";
import Script from "next/script";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add admin-body class to body element
    document.body.classList.add('admin-body');
    
    // Fix for dropdown layout shift
    const fixAdminDropdowns = () => {
      // Store original width
      const originalWidth = document.documentElement.clientWidth;
      
      // Create a MutationObserver to watch for dropdown/select menu openings
      const observer = new MutationObserver((mutations) => {
        // Check if any dropdown or select menu is open
        const isDropdownOpen = document.querySelector('[data-state="open"][data-slot="dropdown-menu-content"], [data-state="open"][data-slot="select-content"], [data-state="open"][data-slot="dialog-content"]');
        
        if (isDropdownOpen) {
          // When dropdown is open, set a fixed width to prevent layout shift
          document.body.style.width = originalWidth + 'px';
          document.body.style.overflowX = 'hidden';
          document.documentElement.style.width = originalWidth + 'px';
          document.documentElement.style.overflowX = 'hidden';
        } else {
          // When all dropdowns are closed, restore normal body width
          document.body.style.width = '';
          document.documentElement.style.width = '';
        }
      });
      
      // Start observing the document with the configured parameters
      observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['data-state']
      });
      
      return () => observer.disconnect();
    };
    
    fixAdminDropdowns();
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-body');
    };
  }, []);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
      
      // If not authenticated and trying to access panel, redirect to login
      if (!isAuthenticated && pathname !== "/admin") {
        router.replace("/admin");
      }
      
      // If authenticated and on login page, redirect to panel
      if (isAuthenticated && pathname === "/admin") {
        router.replace("/admin/panel");
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <>
      <div data-path={pathname}>{children}</div>
      <Script id="admin-dropdown-fix" strategy="afterInteractive">
        {`
          // Fix for dropdown layout shift in admin panel
          document.addEventListener('DOMContentLoaded', () => {
            const originalWidth = document.documentElement.clientWidth;
            
            // Function to handle dropdown state changes
            const handleDropdownStateChange = (mutations) => {
              for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
                  const isDropdownOpen = document.querySelector('[data-state="open"][data-slot="dropdown-menu-content"], [data-state="open"][data-slot="select-content"], [data-state="open"][data-slot="dialog-content"]');
                  
                  if (isDropdownOpen) {
                    // When dropdown is open, prevent layout shift
                    document.body.style.width = originalWidth + 'px';
                    document.body.style.overflowX = 'hidden';
                    document.documentElement.style.width = originalWidth + 'px';
                    document.documentElement.style.overflowX = 'hidden';
                  } else {
                    // When all dropdowns are closed, restore normal body width
                    document.body.style.width = '';
                    document.documentElement.style.width = '';
                  }
                }
              }
            };
            
            // Create and start the observer
            const observer = new MutationObserver(handleDropdownStateChange);
            observer.observe(document.body, {
              subtree: true,
              attributes: true,
              attributeFilter: ['data-state']
            });
          });
        `}
      </Script>
    </>
  );
} 