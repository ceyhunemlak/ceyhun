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
  serverActions: {
    bodySizeLimit: '20mb', // Fotoğraf yükleme limiti 10MB için 20MB'lık buffer
  },
  api: {
    bodyParser: {
      sizeLimit: '20mb', // API rotaları için dosya boyutu limiti
    },
    responseLimit: false,
  },
};

export default nextConfig;
