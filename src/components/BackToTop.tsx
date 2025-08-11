"use client";

import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 md:bottom-6 right-4 md:right-6 bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-full shadow-lg transform transition-transform hover:scale-110 z-50"
          title="Yukarı Çık"
          aria-label="Sayfanın en üstüne çık"
        >
          <ChevronUp size={24} strokeWidth={2.5} />
        </button>
      )}
    </>
  );
}
