'use client';

import { FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/staff')
    || pathname.startsWith('/pimpinan')
    || pathname.startsWith('/eselon-1')
    || pathname.startsWith('/laporan');
  if (isDashboard) return null;

  return (
    <footer className="bg-primary-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-white">Dashboard Laporan</span>
          </div>
          <p className="text-sm text-center">
            Platform dokumen laporan instansi — akses wajib login.
          </p>
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Sistem Informasi Laporan
          </p>
        </div>
      </div>
    </footer>
  );
}
