'use client';

import Link from 'next/link';
import { 
  Landmark, 
  Bell, 
  ChevronDown, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

export default function LaporanLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutFn, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-[#1D64EC] rounded-full animate-spin" />
      </div>
    );
  }

  const isIt = Boolean(
    user.is_it ||
    user.role === 'admin_it' ||
    user.role === 'it' ||
    (user.tingkat === 'kl' && (user.permissions?.can_manage_users || ['it_admin', 'naufal'].includes(user.username)))
  );

  const dashboardHref = isIt
    ? '/admin-it'
    : (user.role === 'eselon_1' || user.tingkat === 'eselon_1' || user.tingkat === 'kl')
      ? '/eselon-1'
      : (user.role === 'pimpinan_satker' || (user.tingkat === 'satker' && (user.role === 'manajemen' || user.role === 'administrasi')))
        ? '/pimpinan'
        : '/staff/dokumen';

  const getRoleLabel = () => {
    if (isIt) return 'IT Administrator';
    const isManajemen = user.role === 'manajemen' || user.role === 'administrasi';
    if (user.tingkat === 'eselon_1') return isManajemen ? 'Pimpinan Eselon 1 (Manajemen)' : 'Operator Eselon 1';
    if (user.tingkat === 'kl') return isManajemen ? 'Pimpinan K/L (Manajemen)' : 'Operator K/L';
    if (user.tingkat === 'satker') return isManajemen ? 'Pimpinan Satker (Manajemen)' : 'Operator Satker';
    return user.role.replace('_', ' ');
  };
  const roleLabel = getRoleLabel();

  // Get user initials (e.g., "Ahmad Rizky" -> "AR")
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Modern White Navbar (Figma 1:1) */}
      <header className="bg-white border-b border-gray-100 shadow-xs sticky top-0 z-50">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-18">
            
            {/* Left: Brand & Institution */}
            <div className="flex items-center gap-3.5">
              <Link href="/laporan" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-[#1D64EC] text-white flex items-center justify-center shadow-sm group-hover:bg-[#1552C6] transition-colors">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-base sm:text-lg tracking-tight block leading-tight">
                    Dashboard Laporan
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium block">
                    Kementerian Pendidikan Tinggi
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Controls & Profile */}
            <div className="hidden md:flex items-center gap-5">
              
              {/* Link Langsung ke Dashboard Akun */}
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#1D64EC] font-semibold text-xs rounded-xl transition-colors border border-blue-200/60"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard {roleLabel}</span>
              </Link>

              {/* Notification Bell with indicator */}
              <button 
                type="button"
                className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              {/* User Profile Pill */}
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-[#1D64EC] flex items-center justify-center text-xs font-bold shrink-0">
                    {getInitials(user.nama)}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[140px]">
                      {user.nama}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate max-w-[140px]">
                      {user.satker_nama || roleLabel}
                    </p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 text-gray-700 animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{user.nama}</p>
                      <p className="text-[11px] text-[#1D64EC] font-medium">{roleLabel}</p>
                      {user.satker_nama && (
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.satker_nama}</p>
                      )}
                    </div>
                    
                    <Link
                      href={dashboardHref}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      Dashboard Internal
                    </Link>

                    <button
                      onClick={() => { setDropdownOpen(false); logoutFn(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <button
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav Drawer */}
          {open && (
            <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-[#1D64EC] flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(user.nama)}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{user.nama}</p>
                  <p className="text-[11px] text-gray-500">{user.satker_nama || roleLabel}</p>
                </div>
              </div>
              <Link 
                href={dashboardHref} 
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4 text-[#1D64EC]" />
                Ke Dashboard Internal ({roleLabel})
              </Link>
              <button
                onClick={() => { setOpen(false); logoutFn(); }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 mt-12">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Portal Rekonsiliasi & Dokumen Laporan Satker</p>
          <p className="text-[11px] text-gray-400">Kementerian Pendidikan Tinggi, Riset, dan Teknologi</p>
        </div>
      </footer>
    </div>
  );
}
