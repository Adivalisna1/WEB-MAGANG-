'use client';

import Link from 'next/link';
import { FileText, Menu, X, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LaporanLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutFn, loading } = useAuth();
  const router = useRouter();
  const [open,         setOpen]         = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

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
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const dashboardHref = user.role === 'admin'
    ? '/admin'
    : user.role === 'ketua_tim'
      ? '/ketua'
      : '/staff/dokumen';

  const roleLabels: Record<string, string> = { ketua_tim: 'Ketua Tim' };
  const roleLabel = roleLabels[user.role] ?? user.role.replace('_', ' ');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="bg-primary-800 text-white shadow-lg sticky top-0 z-50 border-b border-primary-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/laporan" className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity">
              <FileText className="w-6 h-6 text-blue-300" />
              <span>Dashboard Laporan</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link href="/laporan" className="hover:text-blue-200 transition-colors px-2 py-1">Beranda</Link>

              {/* User dropdown */}
              <div className="relative ml-2" ref={dropRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-primary-700 hover:bg-primary-600 px-3 py-1.5 rounded-lg transition-colors border border-white/10"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold text-white">
                    {user.nama.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.nama}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 text-gray-700 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900 truncate">{user.nama}</p>
                      <p className="text-xs text-gray-400 capitalize">{roleLabel}</p>
                    </div>
                    <Link
                      href={dashboardHref}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      Dashboard Saya
                    </Link>
                    <button
                      onClick={() => { setDropdownOpen(false); logoutFn(); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <button
                className="p-2 rounded-md hover:bg-primary-700 transition-colors"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {open && (
            <nav className="md:hidden pb-4 flex flex-col gap-2 text-sm font-medium border-t border-primary-700/50 pt-3 animate-in fade-in duration-150">
              <Link href="/laporan" className="hover:text-blue-200 py-1" onClick={() => setOpen(false)}>Beranda</Link>
              <div className="flex items-center gap-2 py-1 border-t border-primary-700/50 pt-2">
                <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold">
                  {user.nama.charAt(0).toUpperCase()}
                </div>
                <span className="text-blue-200 text-xs">{user.nama} · {roleLabel}</span>
              </div>
              <Link href={dashboardHref} className="flex items-center gap-2 hover:text-blue-200 py-1" onClick={() => setOpen(false)}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard Saya
              </Link>
              <button
                onClick={() => { setOpen(false); logoutFn(); }}
                className="flex items-center gap-2 text-red-300 hover:text-red-200 py-1 w-fit"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary-900 text-gray-300 mt-auto border-t border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-white">Dashboard Laporan</span>
            </div>
            <p className="text-sm text-center">Platform dokumen laporan instansi — akses internal.</p>
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Sistem Informasi Laporan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default function LaporanLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutFn, loading } = useAuth();
  const router = useRouter();
  const [open,         setOpen]         = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Guard: wajib login untuk akses halaman laporan
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
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const dashboardHref = user.role === 'admin'
    ? '/admin'
    : user.role === 'ketua_tim'
      ? '/ketua'
      : '/staff/dokumen';

  const roleLabels: Record<string, string> = { ketua_tim: 'Ketua Tim' };
  const roleLabel = roleLabels[user.role] ?? user.role.replace('_', ' ');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 transition-colors duration-200">
      {/* Navbar */}
      <header className="bg-primary-800 text-white shadow-lg sticky top-0 z-50 border-b border-primary-700/50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/laporan" className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity">
              <FileText className="w-6 h-6 text-blue-300" />
              <span>Dashboard Laporan</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link href="/laporan" className="hover:text-blue-200 transition-colors px-2 py-1">Beranda</Link>

              {/* Dark Mode Toggle */}
              <DarkModeToggle />

              {/* User dropdown */}
              <div className="relative ml-2" ref={dropRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-primary-700 hover:bg-primary-600:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-white/10"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold text-white">
                    {user.nama.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.nama}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 text-gray-700 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900 truncate">{user.nama}</p>
                      <p className="text-xs text-gray-400 capitalize">{roleLabel}</p>
                    </div>
                    <Link
                      href={dashboardHref}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50:bg-slate-800 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      Dashboard Saya
                    </Link>
                    <button
                      onClick={() => { setDropdownOpen(false); logoutFn(); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50:bg-red-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <DarkModeToggle />
              <button
                className="p-2 rounded-md hover:bg-primary-700:bg-slate-800 transition-colors"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {open && (
            <nav className="md:hidden pb-4 flex flex-col gap-2 text-sm font-medium border-t border-primary-700/50 pt-3 animate-in fade-in duration-150">
              <Link href="/laporan" className="hover:text-blue-200 py-1" onClick={() => setOpen(false)}>Beranda</Link>
              <div className="flex items-center gap-2 py-1 border-t border-primary-700/50 pt-2">
                <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold">
                  {user.nama.charAt(0).toUpperCase()}
                </div>
                <span className="text-blue-200 text-xs">{user.nama} · {roleLabel}</span>
              </div>
              <Link href={dashboardHref} className="flex items-center gap-2 hover:text-blue-200 py-1" onClick={() => setOpen(false)}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard Saya
              </Link>
              <button
                onClick={() => { setOpen(false); logoutFn(); }}
                className="flex items-center gap-2 text-red-300 hover:text-red-200 py-1 w-fit"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary-900 text-gray-300 mt-auto border-t border-primary-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-white">Dashboard Laporan</span>
            </div>
            <p className="text-sm text-center">Platform dokumen laporan instansi — akses internal.</p>
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Sistem Informasi Laporan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

