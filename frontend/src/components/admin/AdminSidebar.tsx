'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, FileCheck, Users,
  Activity, LogOut, ChevronRight, ShieldCheck, Home, Tag, User, FileSpreadsheet
} from 'lucide-react';
import clsx from 'clsx';

const adminMenu = [
  { href: '/admin',              icon: LayoutDashboard, label: 'Dashboard',          exact: true },
  { href: '/admin/dokumen',      icon: FileCheck,       label: 'Verifikasi Dokumen' },
  { href: '/admin/kertas-kerja', icon: FileSpreadsheet,  label: 'Kertas Kerja' },
  { href: '/admin/kategori',     icon: Tag,             label: 'Kelola Kategori' },
  { href: '/admin/users',        icon: Users,           label: 'Manajemen User' },
  { href: '/admin/logs',         icon: Activity,        label: 'Log Aktivitas' },
  { href: '/admin/profil',       icon: User,            label: 'Profil' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logoutFn } = useAuth();

  const menu = adminMenu;

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-yellow-400" />
          <span className="font-bold text-sm">Dashboard Admin</span>
        </div>
      </div>

      {/* User info — clickable ke profil */}
      <Link
        href="/admin/profil"
        className="block px-5 py-4 border-b border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-sm text-gray-900 shrink-0">
            {user?.nama?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.nama ?? '-'}</p>
            <p className="text-xs text-yellow-400 capitalize">
              {user?.role ?? 'admin'}
            </p>
          </div>
        </div>
      </Link>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menu.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-yellow-500 text-gray-900'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Kembali ke Dashboard Laporan */}
      <div className="px-3 py-2 border-t border-gray-700">
        <Link
          href="/laporan"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
          Dashboard Laporan
        </Link>
      </div>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-700">
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
