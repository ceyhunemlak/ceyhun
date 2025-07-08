import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl font-bold mb-4">Sayfa Bulunamadı</h1>
        <p className="text-lg mb-8 max-w-md">
          Aradığınız sayfa bulunamadı veya taşınmış olabilir.
        </p>
        <Link href="/" passHref>
          <Button variant="default" size="lg">
            Ana Sayfaya Dön
          </Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
} 