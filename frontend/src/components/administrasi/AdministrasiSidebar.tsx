'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, LogOut, Tags, ShieldCheck, User, Send, FileText
} from 'lucide-react';
import clsx from 'clsx';

const Menu = [
  { href: '/administrasi',                  icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/administrasi/dokumen',          icon: FileText,        label: 'Manajemen Dokumen' },
  { href: '/administrasi/kategori',         icon: Tags,            label: 'Master Kategori' },
  { href: '/administrasi/kirim-notifikasi', icon: Send,            label: 'Kirim Notifikasi' },
  { href: '/administrasi/profil',           icon: User,            label: 'Profil Pengguna' },
];

export default function AdministrasiSidebar() {
  const pathname = usePathname();
  const { user, logoutFn } = useAuth();

  return (
    <aside className="w-[260px] bg-[#0A192F] text-slate-300 flex flex-col shrink-0 transition-all duration-300 shadow-xl z-30">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/10 bg-[#0A192F]">
        <div className="flex items-center gap-3 w-full">
          <div className="w-8 h-8 rounded bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-sm text-blue-400 uppercase leading-none">Administrasi</span>
            <span className="text-[10px] text-slate-500 tracking-wide mt-1">Sistem Terpadu v2</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {Menu.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all group border',
                active
                  ? 'bg-blue-600/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/10'
              )}
            >
              <Icon className={clsx("w-4 h-4", active ? "text-blue-400" : "group-hover:text-blue-300 transition-colors")} />
              <span className="text-sm tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 bg-[#061121]">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-[#0A192F] border border-white/5">
          <div className="w-9 h-9 rounded bg-blue-900/50 flex items-center justify-center font-bold text-blue-200 border border-blue-500/20 shrink-0">
            {user?.nama?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.nama ?? '-'}</p>
            <p className="text-[11px] text-blue-400 truncate uppercase tracking-wider mt-0.5">
              {user?.role?.replace('_', ' ') ?? 'Staf Admin'}
            </p>
          </div>
        </div>
        <button
          onClick={logoutFn}
          className="w-full py-2.5 px-4 rounded-lg border border-rose-900/50 bg-rose-950/20 text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-500 transition-all font-medium text-sm flex items-center justify-center gap-2 group"
        >
          <LogOut className="w-4 h-4 group-hover:text-white" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
