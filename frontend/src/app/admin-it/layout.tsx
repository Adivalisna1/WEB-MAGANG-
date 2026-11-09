'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useState, useEffect } from 'react';
import { useSidebarState } from '@/hooks/useSidebarState';
import AdminITSidebar from '@/components/admin-it/AdminITSidebar';
import { Menu } from 'lucide-react';

export default function AdminITLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth('admin_it');
  const [mounted, setMounted] = useState(false);
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebarState();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter',sans-serif] flex relative overflow-x-hidden">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 h-16 px-4 fixed top-0 w-full z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
            IT
          </div>
          <h1 className="font-bold text-gray-900 tracking-tight leading-none text-sm">CoreSphere IT</h1>
        </div>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -mr-2 text-gray-500 hover:bg-gray-50 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <AdminITSidebar 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0 pt-16 md:pt-0">
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
