import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
  },
  typescript: {
    ignoreBuildErrors: true, // Geliştirme sırasında typescript hatalarını görmezden gel
  },
  eslint: {
    ignoreDuringBuilds: true, // Derleme sırasında eslint hatalarını görmezden gel
  },
};

export default nextConfig;
