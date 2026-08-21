import Link from 'next/link';
import { FileX, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <FileX className="w-20 h-20 text-gray-300 mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-gray-500 mb-6 max-w-sm">
        Halaman atau dokumen yang kamu cari tidak ditemukan atau sudah tidak tersedia.
      </p>
      <div className="flex gap-3">
        <Link href="/laporan" className="btn-primary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Dashboard Laporan
        </Link>
        <Link href="/" className="btn-secondary flex items-center gap-2 text-sm">
          Beranda
        </Link>
      </div>
    </div>
  );
}
