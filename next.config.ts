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
    serverActions: {
      bodySizeLimit: '20mb', // Fotoğraf yükleme limiti 10MB için 20MB'lık buffer
    },
    inlineCss: true, // CSS'i HTML içine yerleştir
    optimizeCss: true, // Kritik CSS'i otomatik olarak ayırır
  },
};

export default nextConfig;
