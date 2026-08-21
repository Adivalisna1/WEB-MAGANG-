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
    <header className="bg-primary-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/laporan" className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity">
            <FileText className="w-6 h-6 text-blue-300" />
            <span>Dashboard Laporan</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/laporan" className="hover:text-blue-300 transition-colors">Beranda</Link>
            <Link href="/laporan?kategori=lkjip" className="hover:text-blue-300 transition-colors">LKjIP</Link>
            <Link href="/laporan?kategori=renstra" className="hover:text-blue-300 transition-colors">Renstra</Link>
            <Link href="/laporan?kategori=renja" className="hover:text-blue-300 transition-colors">Renja</Link>

            {user ? (
              /* Sudah login — tampilkan nama + dropdown */
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-primary-700 hover:bg-primary-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold text-white">
                    {user.nama.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.nama}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 text-gray-700">
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
                      Dashboard
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
            ) : (
              /* Belum login — tampilkan tombol Login */
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg transition-colors"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-primary-700 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {open && (
          <nav className="md:hidden pb-4 flex flex-col gap-2 text-sm font-medium border-t border-primary-700 pt-3">
            <Link href="/laporan" className="hover:text-blue-300 py-1" onClick={() => setOpen(false)}>Beranda</Link>
            <Link href="/laporan?kategori=lkjip" className="hover:text-blue-300 py-1" onClick={() => setOpen(false)}>LKjIP</Link>
            <Link href="/laporan?kategori=renstra" className="hover:text-blue-300 py-1" onClick={() => setOpen(false)}>Renstra</Link>
            <Link href="/laporan?kategori=renja" className="hover:text-blue-300 py-1" onClick={() => setOpen(false)}>Renja</Link>

            {user ? (
              <>
                <div className="flex items-center gap-2 py-1 border-t border-primary-700 pt-2">
                  <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold">
                    {user.nama.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-blue-200 text-xs">{user.nama} · {roleLabel}</span>
                </div>
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2 hover:text-blue-300 py-1"
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button
                  onClick={() => { setOpen(false); logoutFn(); }}
                  className="flex items-center gap-2 text-red-300 hover:text-red-200 py-1 w-fit"
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
