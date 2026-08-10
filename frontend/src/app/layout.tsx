import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Dashboard Laporan',
  description: 'Portal dokumen perencanaan dan laporan kinerja instansi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
