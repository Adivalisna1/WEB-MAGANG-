'use client';

import Link from 'next/link';
import { FileText, Menu, X, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [open,        setOpen]        = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logoutFn } = useAuth();
  const pathname  = usePathname();
  const dropRef   = useRef<HTMLDivElement>(null);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Sembunyikan navbar publik di halaman dashboard (staff/admin/ketua)
  const isDashboard = pathname.startsWith('/staff') || pathname.startsWith('/admin') || pathname.startsWith('/ketua');
  if (isDashboard) return null;

  const dashboardHref = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'ketua_tim'
      ? '/ketua'
      : '/staff/dokumen';

  // Format role untuk tampilan: ketua_tim → Ketua Tim
  const roleLabels: Record<string, string> = {
    ketua_tim: 'Ketua Tim',
  };
  const roleLabel = user?.role ? (roleLabels[user.role] ?? user.role.replace('_', ' ')) : '';

  return (
    <header className="bg-primary-800 dark:bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-primary-700/50 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/laporan" className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity">
            <FileText className="w-6 h-6 text-blue-300 dark:text-blue-400" />
            <span>Dashboard Laporan</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="hover:text-blue-200 transition-colors px-2 py-1">Dashboard Publik</Link>

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {user ? (
              /* Sudah login — tampilkan nama + dropdown */
              <div className="relative ml-2" ref={dropRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-primary-700 hover:bg-primary-600 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-white/10 dark:border-slate-700"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-400 dark:bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.nama.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.nama}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 py-1.5 text-gray-700 dark:text-slate-200 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.nama}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-400 capitalize">{roleLabel}</p>
                    </div>
                    <Link
                      href={dashboardHref}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { setDropdownOpen(false); logoutFn(); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Belum login — tampilkan tombol Login */
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg transition-colors shadow-sm ml-2"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <DarkModeToggle />
            <button
              className="p-2 rounded-md hover:bg-primary-700 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {open && (
          <nav className="md:hidden pb-4 flex flex-col gap-2 text-sm font-medium border-t border-primary-700/50 dark:border-slate-800 pt-3 animate-in fade-in duration-150">
            <Link href="/" className="hover:text-blue-200 py-1" onClick={() => setOpen(false)}>Dashboard Publik</Link>

            {user ? (
              <>
                <div className="flex items-center gap-2 py-1 border-t border-primary-700/50 dark:border-slate-800 pt-2">
                  <div className="w-6 h-6 rounded-full bg-blue-400 dark:bg-blue-600 flex items-center justify-center text-xs font-bold">
                    {user.nama.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-blue-200 dark:text-slate-300 text-xs">{user.nama} · {roleLabel}</span>
                </div>
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2 hover:text-blue-200 py-1"
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button
                  onClick={() => { setOpen(false); logoutFn(); }}
                  className="flex items-center gap-2 text-red-300 dark:text-red-400 hover:text-red-200 py-1 w-fit"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg w-fit"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
