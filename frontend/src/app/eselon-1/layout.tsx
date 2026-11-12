'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { useSidebarState } from '@/hooks/useSidebarState';
import { logout, clearSession } from '@/lib/auth';
import Eselon1Sidebar from '@/components/eselon-1/Eselon1Sidebar';
import NotificationBell from '@/components/ui/NotificationBell';
import SessionTimeoutModal from '@/components/ui/SessionTimeoutModal';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Menu, LogOut } from 'lucide-react';

export default function KetuaLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useRequireAuth('eselon_1');
  const { user } = useAuth();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebarState();

  const isOperator = user?.role === 'operator' || user?.is_operator;

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased overflow-hidden relative print:bg-white print:overflow-visible print:block print:min-h-0 print:h-auto">
      <div className="print:hidden">
        <Eselon1Sidebar 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen} 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
      </div>
      <div className="flex-1 flex flex-col h-screen relative bg-slate-50 min-w-0 print:bg-white print:h-auto print:overflow-visible print:block">
        <header className="h-20 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-b border-slate-200 flex justify-between items-center px-4 md:px-10 z-20 sticky top-0 w-full print:hidden">
          <div className="flex items-center gap-4 h-full pt-1">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col justify-center">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight leading-none truncate max-w-[200px] md:max-w-none">
                {isOperator ? 'Staff Eselon 1' : 'Pimpinan Eselon 1'} &bull; {user?.eselon_1_singkatan || 'Ditjen Pembina'}
              </h1>
              <p className="text-[11px] md:text-sm text-slate-500 font-medium mt-1 truncate max-w-[200px] md:max-w-none">
                {isOperator 
                  ? 'Portal Operasional, Upload & Monitoring Rekening Koran Satker Binaan'
                  : 'Sistem Informasi Manajemen, Verifikasi & Pengesahan Dokumen Satker'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200/60"
              title="Keluar / Ganti Akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8 print:p-0 print:m-0 print:overflow-visible print:h-auto" id="main-content">
          <div className="max-w-[1400px] mx-auto animate-fade-in print:max-w-none print:m-0 print:p-0">
            {children}
          </div>
        </main>
      </div>
      <SessionTimeoutModal open={showWarning} onStay={handleStay} />
    </div>
  );
}

