"use client";

import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  text?: string;
  className?: string;
}

export function Loading({ size = "medium", text, className = "" }: LoadingProps) {
  const sizeMap = {
    small: "h-6 w-6",
    medium: "h-10 w-10",
    large: "h-12 w-12"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`text-[#FFB000] animate-spin ${sizeMap[size]}`} />
      {text && <p className="mt-3 text-gray-600">{text}</p>}
    </div>
  );
} 