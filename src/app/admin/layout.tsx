"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loading } from "@/components/ui/loading";

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

  return <div data-path={pathname}>{children}</div>;
} 