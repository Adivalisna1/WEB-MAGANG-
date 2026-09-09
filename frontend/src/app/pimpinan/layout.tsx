'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { logout, clearSession } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import PimpinanSidebar from '@/components/pimpinan/PimpinanSidebar';
import NotificationBell from '@/components/ui/NotificationBell';
import SessionTimeoutModal from '@/components/ui/SessionTimeoutModal';
import { Loader2 } from 'lucide-react';

export default function PimpinanLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useRequireAuth(['pimpinan']);
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
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
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased overflow-hidden">
      <PimpinanSidebar />
      
      <div className="flex-1 flex flex-col h-screen relative bg-slate-50">
        <header className="h-20 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-b border-slate-200 flex justify-between items-center px-10 z-20 sticky top-0 w-full">
          <div className="flex flex-col justify-center h-full pt-1">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">
              Welcome Back, {user?.nama || 'Pimpinan'}!
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Sistem Informasi Manajemen Dokumen Terpadu
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-slate-500 font-semibold bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
              {currentDate}
            </div>
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10" id="main-content">
          <div className="max-w-[1400px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <SessionTimeoutModal open={showWarning} onStay={handleStay} />
    </div>
  );
}


