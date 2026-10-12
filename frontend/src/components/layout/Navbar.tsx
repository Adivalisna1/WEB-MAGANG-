'use client';

import Link from 'next/link';
import { FileText, Menu, X, LayoutDashboard, LogOut, ChevronDown, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

export default function Navbar() {
  const [open,        setOpen]        = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logoutFn } = useAuth();
  const pathname  = usePathname();
  const dropRef   = useRef<HTMLDivElement>(null);
  const router    = useRouter();
  const searchParams = useSearchParams();

  // Search State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state with URL params
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  // Live Search Effect
  useEffect(() => {
    if (mounted && pathname === '/laporan') {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearchTerm) {
        params.set('q', debouncedSearchTerm);
      } else {
        params.delete('q');
      }
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearchTerm]);

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

  // Sembunyikan navbar publik di halaman dashboard (Satker/pimpinan/eselon-1/admin-it)
  const isDashboard = pathname.startsWith('/staff') || pathname.startsWith('/pimpinan') || pathname.startsWith('/eselon-1') || pathname.startsWith('/admin-it');
  if (isDashboard) return null;

  const isIt = Boolean(
    user?.is_it ||
    user?.role === 'admin_it' ||
    user?.role === 'it' ||
    (user?.tingkat === 'kl' && (user?.permissions?.can_manage_users || ['it_admin', 'naufal'].includes(user?.username || '')))
  );

  const dashboardHref = isIt
    ? '/admin-it'
    : (user?.role === 'eselon_1' || user?.tingkat === 'eselon_1' || user?.tingkat === 'kl')
      ? '/eselon-1'
      : (user?.role === 'pimpinan_satker' || (user?.tingkat === 'satker' && (user?.role === 'manajemen' || user?.role === 'administrasi')))
        ? '/pimpinan'
        : '/staff/dokumen';

  const getRoleLabel = () => {
    if (!user) return '';
    if (isIt) return 'IT Administrator';
    const isManajemen = user.role === 'manajemen' || user.role === 'administrasi';
    if (user.tingkat === 'eselon_1') return isManajemen ? 'Pimpinan Eselon 1 (Manajemen)' : 'Operator Eselon 1';
    if (user.tingkat === 'kl') return isManajemen ? 'Pimpinan K/L (Manajemen)' : 'Operator K/L';
    if (user.tingkat === 'satker') return isManajemen ? 'Pimpinan Satker (Manajemen)' : 'Operator Satker';
    return user.role.replace('_', ' ');
  };
  const roleLabel = getRoleLabel();

  return (
    <header className="bg-primary-800 text-white shadow-lg sticky top-0 z-50 border-b border-primary-700/50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/laporan" className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity">
            <FileText className="w-6 h-6 text-blue-300" />
            <span className="hidden sm:inline">Dashboard Laporan</span>
          </Link>

          {/* Search Bar - Desktop & Tablet */}
          {pathname === '/laporan' && (
            <div className="relative mx-4 flex-1 max-w-lg hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-primary-200" />
              </div>
              <input
                type="text"
                placeholder="Live Search: Cari judul atau kode laporan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-primary-600 rounded-lg leading-5 bg-primary-900/40 text-white placeholder-primary-200 focus:outline-none focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
              />
            </div>
          )}

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="hover:text-blue-200 transition-colors px-2 py-1">Dashboard Publik</Link>



            {user ? (
              /* Sudah login — tampilkan nama + dropdown */
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
                      Dashboard
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
            {/* Mobile Search Bar */}
            {pathname === '/laporan' && (
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-primary-200" />
                </div>
                <input
                  type="text"
                  placeholder="Cari laporan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-primary-600 rounded-lg leading-5 bg-primary-900/40 text-white placeholder-primary-200 focus:outline-none focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            )}
            
            <Link href="/" className="hover:text-blue-200 py-1" onClick={() => setOpen(false)}>Dashboard Publik</Link>

            {user ? (
              <>
                <div className="flex items-center gap-2 py-1 border-t border-primary-700/50 pt-2">
                  <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold">
                    {user.nama.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-blue-200 text-xs">{user.nama} · {roleLabel}</span>
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

