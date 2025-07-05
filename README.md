# Ceyhun Gayrimenkul Emlak

Tokat Merkez'de faaliyet gösteren emlak ağırlıklı gayrimenkul şirketi için geliştirilen web sitesi.

## Kurulum

1. Projeyi klonlayın:
```bash
git clone <repo-url>
cd ceyhun-emlak
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Ortam değişkenlerini ayarlayın:
```bash
npm run setup-env
```
Bu komut, `.env.local` dosyasını oluşturacak ve varsayılan değerleri ayarlayacaktır.

> Not: Varsayılan admin şifresi `admin123`'tür. Güvenlik için bu şifreyi `.env.local` dosyasında değiştirmeniz önerilir.

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## Kullanım

- **Admin Girişi**: `/admin` yolunu kullanarak admin paneline erişebilirsiniz.
  - Kullanıcı adı: `admin`
  - Şifre: `.env.local` dosyasındaki `KULLANICI_SIFRE` değeri (varsayılan: `admin123`)

- **Admin Paneli**: `/admin/panel` yolunu kullanarak ilanları yönetebilirsiniz.

- **İlan Ekleme**: `/admin/panel/add-listing` yolunu kullanarak yeni ilan ekleyebilirsiniz.

## Özellikler

- Modern ve responsive tasarım
- Emlak ve vasıta ilanları yönetimi
- Gelişmiş filtreleme seçenekleri
- Fotoğraf galerisi
- Admin paneli

## Teknolojiler

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase
- Cloudinary

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
