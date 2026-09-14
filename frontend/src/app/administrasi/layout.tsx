'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { logout, clearSession } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import AdministrasiSidebar from '@/components/administrasi/AdministrasiSidebar';
import NotificationBell from '@/components/ui/NotificationBell';
import SessionTimeoutModal from '@/components/ui/SessionTimeoutModal';
import { Loader2 } from 'lucide-react';

export default function AdministrasiLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useRequireAuth(['administrasi']);
  const { user } = useAuth();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);

  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem('token') || '';
    try { await logout(token); } catch { /* silent */ }
    clearSession();
    router.push('/login');
  }, [router]);

  const handleStay = useCallback(() => {
    setShowWarning(false);
  }, []);

  useIdleTimeout(
    () => setShowWarning(true),
    handleLogout
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-800 antialiased overflow-hidden selection:bg-blue-200">
      <AdministrasiSidebar />
      
      <div className="flex-1 flex flex-col h-screen relative bg-[#F8FAFC]">
        <header className="h-20 bg-white/80 backdrop-blur-md shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border-b border-slate-200 flex justify-between items-center px-10 z-20 sticky top-0 w-full">
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
              Portal Administrasi & Data
            </h1>
            <p className="text-[13px] text-slate-500 font-medium mt-1">
              Selamat datang, {user?.nama || 'Admin'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-xs text-slate-600 font-semibold bg-slate-100/80 px-4 py-2 rounded-md border border-slate-200 shadow-sm">
              {currentDate}
            </div>
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 scroll-smooth" id="main-content">
          <div className="max-w-[1400px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <SessionTimeoutModal open={showWarning} onStay={handleStay} />
    </div>
  );
}
