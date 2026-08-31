import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Dashboard Laporan',
  description: 'Platform pengelolaan dan pengarsipan dokumen laporan instansi secara digital, aman, dan terstruktur.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
