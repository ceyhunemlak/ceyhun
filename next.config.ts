import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
    minimumCacheTTL: 60, // 1 dakika önbelleğe alma
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true, // Vercel'de resim optimizasyonunu devre dışı bırak
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
  async headers() {
    return [
      {
        // Tüm rotalar için
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Tüm domainlere izin ver
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          }
        ]
      }
    ];
  }
};

export default nextConfig;
