'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FileText, Upload, LayoutDashboard,
  LogOut, User, ChevronRight, Home, Settings, Bell
} from 'lucide-react';
import clsx from 'clsx';

const SatkerMenu = [
  { href: '/satker/dokumen',        icon: LayoutDashboard, label: 'Dokumen Saya' },
  { href: '/satker/dokumen/upload', icon: Upload,          label: 'Upload Dokumen' },
  { href: '/satker/profil',         icon: User,            label: 'Profil' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logoutFn } = useAuth();

  return (
    <aside className="w-[260px] bg-[#334155] text-slate-300 flex flex-col shrink-0 transition-all duration-300">
      {/* Padding top for alignment with header */}
      <div className="h-20 border-b border-[#475569]/30 flex items-center px-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-400" />
          <span className="font-bold text-sm tracking-wide text-white">SATKER DASHBOARD</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {SatkerMenu.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/satker/dokumen' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group',
                active
                  ? 'bg-[#475569] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#475569]/50'
              )}
            >
              <Icon className={clsx("w-5 h-5", active ? "text-white" : "group-hover:text-white")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 mb-4">
        <Link
          href="/laporan"
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white bg-[#1e293b]/50 hover:bg-[#475569]/80 rounded-xl font-medium transition-all"
        >
          <Home className="w-5 h-5 text-indigo-400" />
          Dashboard Laporan
        </Link>
        <button
          onClick={logoutFn}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white bg-[#1e293b]/50 hover:bg-rose-500 rounded-xl font-medium transition-all"
        >
          <LogOut className="w-5 h-5 text-rose-400" />
          Logout
        </button>
      </div>
    </aside>
  );
}

