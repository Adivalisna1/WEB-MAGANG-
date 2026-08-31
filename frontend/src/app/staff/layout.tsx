'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { logout, clearSession } from '@/lib/auth';
import Sidebar from '@/components/staff/Sidebar';
import NotificationBell from '@/components/ui/NotificationBell';
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import SessionTimeoutModal from '@/components/ui/SessionTimeoutModal';
import { Loader2 } from 'lucide-react';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useRequireAuth('staff');
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
    // Hook otomatis reset timer karena ada aktivitas klik tombol
  }, []);

  useIdleTimeout(
    () => setShowWarning(true),
    handleLogout
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-950 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-end gap-3 px-6 py-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors duration-200">
          <DarkModeToggle className="!text-gray-700 dark:!text-amber-400 !bg-gray-100 hover:!bg-gray-200 dark:!bg-slate-800 dark:hover:!bg-slate-700 !border-gray-200 dark:!border-slate-700" />
          <NotificationBell />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      <SessionTimeoutModal open={showWarning} onStay={handleStay} />
    </div>
  );
}
