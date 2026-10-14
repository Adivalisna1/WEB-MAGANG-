import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
export const metadata: Metadata = {
  title: 'Sistem Informasi Pelaporan',
  description: 'Platform pengelolaan dan pengarsipan dokumen laporan instansi secara digital, aman, dan terstruktur.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 transition-colors duration-200">
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
