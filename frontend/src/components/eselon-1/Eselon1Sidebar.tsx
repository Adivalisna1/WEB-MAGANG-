'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, FileSearch, Users,
  Activity, LogOut, ChevronRight, Home, Send, User
} from 'lucide-react';
import clsx from 'clsx';

const ketuaMenu = [
  { href: '/eselon-1',                icon: LayoutDashboard, label: 'Dashboard',        exact: true },
  { href: '/eselon-1/dokumen',        icon: FileSearch,      label: 'Monitor Dokumen' },
  { href: '/eselon-1/kertas-kerja',   icon: FileSearch,      label: 'Kertas Kerja' },
  { href: '/eselon-1/users',          icon: Users,           label: 'Manajemen User' },
  { href: '/eselon-1/logs',           icon: Activity,        label: 'Log Aktivitas' },
  { href: '/eselon-1/kirim-notifikasi', icon: Send,          label: 'Kirim Notifikasi' },
  { href: '/eselon-1/profil',         icon: User,            label: 'Profil' },
];

export default function KetuaSidebar() {
  const pathname = usePathname();
  const { user, logoutFn } = useAuth();

  return (
    <aside className="w-60 min-h-screen bg-indigo-950 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-indigo-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">Dashboard Eselon 1</span>
        </div>
      </div>

      {/* User info — clickable ke profil */}
      <Link
        href="/eselon-1/profil"
        className="block px-5 py-4 border-b border-indigo-800 hover:bg-indigo-900 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm text-white shrink-0">
            {user?.nama?.charAt(0).toUpperCase() ?? 'K'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.nama ?? '-'}</p>
            <p className="text-xs text-indigo-300">Eselon 1</p>
          </div>
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-500 text-white'
                  : 'text-indigo-200 hover:bg-indigo-900 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Kembali ke Beranda */}
      <div className="px-3 py-2 border-t border-indigo-800">
        <Link
          href="/laporan"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-200 hover:bg-indigo-900 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
          Dashboard Laporan
        </Link>
      </div>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-indigo-800">
        <button
          onClick={logoutFn}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}

