'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FileText, Upload, LayoutDashboard,
  LogOut, User, ChevronRight, Home
} from 'lucide-react';
import clsx from 'clsx';

const staffMenu = [
  { href: '/staff/dokumen',        icon: LayoutDashboard, label: 'Dokumen Saya' },
  { href: '/staff/dokumen/upload', icon: Upload,          label: 'Upload Dokumen' },
  { href: '/staff/profil',         icon: User,            label: 'Profil' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logoutFn } = useAuth();

  return (
    <aside className="w-60 min-h-screen bg-primary-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-primary-700">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-300" />
          <span className="font-bold text-sm">Dashboard Staff</span>
        </div>
      </div>

      {/* User info — clickable ke profil */}
      <Link
        href="/staff/profil"
        className="block px-5 py-4 border-b border-primary-700 hover:bg-primary-800 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center font-bold text-sm shrink-0">
            {user?.nama?.charAt(0).toUpperCase() ?? 'S'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.nama ?? '-'}</p>
            <p className="text-xs text-blue-300 capitalize">{user?.role ?? 'staff'}</p>
          </div>
        </div>
      </Link>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {staffMenu.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/staff/dokumen' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-600 text-white'
                  : 'text-blue-200 hover:bg-primary-800 hover:text-white'
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
      <div className="px-3 py-2 border-t border-primary-700">
        <Link
          href="/laporan"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-primary-800 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
          Dashboard Laporan
        </Link>
      </div>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-primary-700">
        <button
          onClick={logoutFn}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
