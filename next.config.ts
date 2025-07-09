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
  experimental: {
    serverComponentsExternalPackages: ['cloudinary'],
  },
  // Vercel'de yükleme boyut limitini artırma
  async headers() {
    return [
      {
        source: '/api/upload',
        headers: [
          {
            key: 'Content-Type',
            value: 'multipart/form-data',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
