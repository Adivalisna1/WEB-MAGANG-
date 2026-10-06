'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-5 shadow-xs">
        <AlertCircle className="w-10 h-10 stroke-[2.2]" />
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
        Terjadi Kesalahan pada Server
      </h2>
      <p className="text-slate-500 text-sm mb-6 max-w-md leading-relaxed">
        Sistem tidak dapat memproses permintaan saat ini {error?.digest ? `(ID Kesalahan: ${error.digest})` : '(Kode: ERR_HTTP_500_INTERNAL_SERVER_ERROR)'}. Tim IT telah menerima laporan untuk penanganan.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Muat Ulang Halaman
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
