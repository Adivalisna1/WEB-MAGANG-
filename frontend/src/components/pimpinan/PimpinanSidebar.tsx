'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, FileCheck, Users,
  Activity, LogOut, ChevronRight, ShieldCheck, Home, Tag, User, FileSpreadsheet
} from 'lucide-react';
import clsx from 'clsx';

const PimpinanMenu = [
  { href: '/pimpinan',              icon: LayoutDashboard, label: 'Dashboard',          exact: true },
  { href: '/pimpinan/dokumen',      icon: FileCheck,       label: 'Verifikasi Dokumen' },
  { href: '/pimpinan/kertas-kerja', icon: FileSpreadsheet,  label: 'Kertas Kerja' },
  { href: '/pimpinan/users',        icon: Users,           label: 'Manajemen User' },
  { href: '/pimpinan/logs',         icon: Activity,        label: 'Log Aktivitas' },
  { href: '/pimpinan/profil',       icon: User,            label: 'Profil' },
];

export default function PimpinanSidebar() {
  const pathname = usePathname();
  const { user, logoutFn } = useAuth();

  const menu = PimpinanMenu;

  return (
    <aside className="w-[260px] bg-[#0f172a] text-slate-300 flex flex-col shrink-0 transition-all duration-300">
      {/* Padding top for alignment with header */}
      <div className="h-20 flex items-center px-6 border-b border-[#1e293b]">
        <div className="flex items-center gap-3 w-full">
          <div className="w-8 h-8 rounded bg-[#10b981]/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#10b981]" />
          </div>
          <span className="font-bold tracking-widest text-sm text-[#10b981] uppercase">Pimpinan</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menu.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group',
                active
                  ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#1e293b]'
              )}
            >
              <Icon className={clsx("w-5 h-5", active ? "text-white" : "group-hover:text-white")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1e293b]">
        <Link
          href="/pimpinan/profil"
          className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-[#1e293b] p-2 rounded-xl transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center font-bold text-white shadow-inner shrink-0">
            {user?.nama?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.nama ?? '-'}</p>
            <p className="text-xs text-[#10b981] truncate capitalize">
              {user?.role?.replace('_', ' ') ?? 'Ketua Pimpinan'}
            </p>
          </div>
        </Link>
        <button
          onClick={logoutFn}
          className="w-full py-2.5 px-4 rounded-xl border border-[#334155] text-slate-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all font-medium text-sm flex items-center justify-center gap-2 group"
        >
          <LogOut className="w-4 h-4 group-hover:text-white" />
          Keluar
        </button>
      </div>
    </aside>
  );
}

