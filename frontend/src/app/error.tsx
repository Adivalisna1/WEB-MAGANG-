'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <AlertTriangle className="w-20 h-20 text-yellow-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
      <p className="text-gray-500 mb-6 max-w-sm">
        Gagal memuat data. Pastikan koneksi internet stabil dan coba lagi.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary">
          Coba Lagi
        </button>
        <Link href="/" className="btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Beranda
        </Link>
      </div>
    </div>
  );
}
