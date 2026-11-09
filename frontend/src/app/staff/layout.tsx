'use client';

import { useState, useCallback, createContext } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { useSidebarState } from '@/hooks/useSidebarState';
import { logout, clearSession, getSession } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import StaffSidebar from '@/components/Staff/StaffSidebar';
import PimpinanSidebar from '@/components/pimpinan/PimpinanSidebar';
import Eselon1Sidebar from '@/components/eselon-1/Eselon1Sidebar';
import AdminITSidebar from '@/components/admin-it/AdminITSidebar';
import NotificationBell from '@/components/ui/NotificationBell';
import SessionTimeoutModal from '@/components/ui/SessionTimeoutModal';
import { Loader2, Search, X, FileText, ChevronRight, Menu, Plus, LogOut } from 'lucide-react';
import { SearchContext } from '@/context/SearchContext';
import './staff.css';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useRequireAuth([
    'staff',
    'staff_satker',
    'operator',
    'pimpinan',
    'pimpinan_satker',
    'manajemen',
    'administrasi',
    'eselon_1',
    'admin_it',
    'it',
    'kl',
  ]);
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebarState();

  // Quick fetch for search dropdown
  const handleSearchChange = async (val: string) => {
    setSearchTerm(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/all`, {
        headers: { Authorization: `Bearer ${session?.token}` }
      });
      if (res.ok) {
        const d = await res.json();
        const list = d.data || [];
        const q = val.toLowerCase();
        const filtered = list.filter((dok: any) =>
          (dok.judul || '').toLowerCase().includes(q) ||
          (dok.kategori || '').toLowerCase().includes(q)
        ).slice(0, 5); // Ambil 5 teratas
        setSearchResults(filtered);
      }
    } catch {
      // silent
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem('token') || '';
    try { await logout(token); } catch { /* silent */ }
    clearSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    } else {
      router.push('/login');
    }
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const renderSidebar = () => {
    const r = user?.role;
    const t = user?.tingkat;
    if (user?.is_it || r === 'admin_it' || r === 'it') {
      return (
        <AdminITSidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      );
    }
    if (t === 'eselon_1' || r === 'eselon_1' || t === 'kl') {
      return (
        <Eselon1Sidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      );
    }
    if (r === 'pimpinan_satker' || (t === 'satker' && (r === 'manajemen' || r === 'administrasi'))) {
      return (
        <PimpinanSidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      );
    }
    return (
      <StaffSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
    );
  };

  const getRoleHeaderTitle = () => {
    const r = user?.role;
    const t = user?.tingkat;
    if (user?.is_it || r === 'admin_it' || r === 'it') return 'Portal Admin IT';
    if (t === 'eselon_1' || r === 'eselon_1' || t === 'kl') return 'Dashboard Eselon 1';
    if (r === 'pimpinan_satker' || (t === 'satker' && (r === 'manajemen' || r === 'administrasi'))) return 'Dashboard Pimpinan';
    return 'Dashboard Staff';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased overflow-hidden relative">
      {renderSidebar()}
      <div className="flex-1 flex flex-col h-screen relative min-w-0">
        <header className="h-20 bg-white shadow-sm border-b border-slate-200 flex justify-between items-center px-4 md:px-8 z-20 sticky top-0 w-full">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Search Bar */}
            <div className="relative w-full max-w-[200px] md:max-w-none md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Cari dokumen, kategori, atau tahun..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm shadow-sm"
            />
            {searchTerm && (
              <button onClick={() => handleSearchChange('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-rose-500 transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Dropdown Popup / Slide Show */}
            {searchTerm && isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-slide-up origin-top">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 flex justify-between items-center">
                  <span>Hasil Pencarian Cepat</span>
                  {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />}
                </div>

                {searchResults.length > 0 ? (
                  <ul className="max-h-80 overflow-y-auto">
                    {searchResults.map((res: any) => (
                      <li key={res.id}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 group/item">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate group-hover/item:text-blue-600 transition-colors">{res.judul}</p>
                            <p className="text-xs text-slate-500 flex gap-2 mt-0.5">
                              <span>{res.kategori}</span>
                              <span className="text-slate-300">•</span>
                              <span>Tahun {res.tahun}</span>
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover/item:text-blue-500 transition-colors" />
                        </div>
                      </li>
                    ))}
                    <li className="px-4 py-3 bg-slate-50 text-center border-t border-slate-100">
                      <p className="text-xs font-medium text-blue-600">Tekan Enter untuk melihat semua di tabel bawah</p>
                    </li>
                  </ul>
                ) : (
                  <div className="px-4 py-8 text-center">
                    {!isSearching && (
                      <>
                        <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-600">Tidak ada dokumen yang cocok</p>
                        <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <div className="text-right flex items-center gap-2">
              <span className="font-bold text-slate-800 tracking-tight hidden lg:inline">{getRoleHeaderTitle()}</span>
              <span className="text-slate-300 hidden lg:inline">|</span>
              <span className="text-slate-600 font-medium">Selamat Datang, {user?.nama || 'Pengguna'}</span>
            </div>
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

        <main className="flex-1 overflow-y-auto p-8" id="main-content">
          <SearchContext.Provider value={searchTerm}>
            <div className="animate-fade-in h-full">
              {children}
            </div>
          </SearchContext.Provider>
        </main>
      </div>
      <SessionTimeoutModal open={showWarning} onStay={handleStay} />
    </div>
  );
}


