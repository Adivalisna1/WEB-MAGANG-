import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar minimal */}
      <header className="bg-primary-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity">
            <FileText className="w-6 h-6 text-blue-300" />
            <span>Dashboard Laporan</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-primary-900 text-gray-500 py-4 text-center text-xs">
        © {new Date().getFullYear()} Sistem Informasi Laporan
      </footer>
    </div>
  );
}
