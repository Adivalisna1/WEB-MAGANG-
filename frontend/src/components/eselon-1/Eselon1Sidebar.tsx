'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, FileSearch, Users,
  Activity, LogOut, ChevronRight, Home, Send, User, X, ChevronLeft
} from 'lucide-react';
import clsx from 'clsx';

const ketuaMenu = [
  { href: '/eselon-1', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/eselon-1/dokumen', icon: FileSearch, label: 'Monitor Dokumen' },
  { href: '/eselon-1/rekening-koran', icon: FileSearch, label: 'Rekening Koran' },
  { href: '/eselon-1/users', icon: Users, label: 'Manajemen User' },
  { href: '/eselon-1/logs', icon: Activity, label: 'Log Aktivitas' },
  { href: '/eselon-1/profil', icon: User, label: 'Profil' },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function KetuaSidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, logoutFn } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-white border-r border-slate-200/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed left-0 top-0 md:sticky md:top-0 h-screen bg-white border-r border-slate-200 text-slate-600 flex flex-col shrink-0 z-50 transition-all duration-300
        ${isMobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-[260px]'}
      `}>
        <div className="h-20 flex items-center justify-between px-4 md:px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-[#1E90FF] rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
              <span className="text-sm">FS</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="font-bold text-slate-900 tracking-tight leading-none text-[15px] m-0">FinSight</h1>
                <p className="text-[10px] text-[#1E90FF] font-bold tracking-wider mt-0.5 m-0">REPORTING SUITE</p>
              </div>
            )}
          </div>
          {/* Close button (Mobile only) */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info — clickable ke profil */}
        <Link
          href="/eselon-1/profil"
          className={`block py-4 border-b border-slate-200 hover:bg-slate-900 transition-colors cursor-pointer ${isCollapsed ? 'px-2 flex justify-center' : 'px-5'}`}
          title={isCollapsed ? "Profil" : undefined}
        >
          <div className={clsx("flex items-center", isCollapsed ? 'justify-center' : 'gap-3')}>
            <div className="w-9 h-9 rounded-full bg-[#1E90FF] flex items-center justify-center font-bold text-sm text-white shrink-0">
              {user?.nama?.charAt(0).toUpperCase() ?? 'K'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user?.nama ?? '-'}</p>
                <p className="text-xs text-slate-400">Eselon 1</p>
              </div>
            )}
          </div>
        </Link>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {ketuaMenu.map(({ href, icon: Icon, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#1E90FF] text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-white',
                  isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                )}
                title={isCollapsed ? label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && label}
                {!isCollapsed && active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Kembali ke Beranda */}
        <div className="px-3 py-2 border-t border-slate-200 mt-auto">
          <Link
            href="/laporan"
            className={clsx(
              "flex items-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-white transition-colors",
              isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5 w-full'
            )}
            title={isCollapsed ? "Dashboard Laporan" : undefined}
          >
            <Home className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Dashboard Laporan</span>}
          </Link>
        </div>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-slate-200 flex flex-col gap-2">
          <button
            onClick={logoutFn}
            className={clsx(
              "flex items-center rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors",
              isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5 w-full'
            )}
            title={isCollapsed ? "Keluar" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Keluar</span>}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center p-2 mt-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors border border-slate-700"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}

