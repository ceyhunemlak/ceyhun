import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
  },
  typescript: {
    ignoreBuildErrors: true, // Geliştirme sırasında typescript hatalarını görmezden gel
  },
  swcMinify: true,
};

export default nextConfig;
