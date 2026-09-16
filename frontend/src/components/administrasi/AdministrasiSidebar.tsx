'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, LogOut, Tags, ShieldCheck, User, Send, FileText, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

const Menu = [
  { href: '/administrasi',                  icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/administrasi/dokumen',          icon: FileText,        label: 'Manajemen Dokumen' },
  { href: '/administrasi/kategori',         icon: Tags,            label: 'Master Kategori' },
  { href: '/administrasi/kirim-notifikasi', icon: Send,            label: 'Kirim Notifikasi' },
  { href: '/administrasi/profil',           icon: User,            label: 'Profil Pengguna' },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function AdministrasiSidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, logoutFn } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-[#0A192F]/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:relative left-0 top-0 h-screen bg-[#0A192F] text-slate-300 flex flex-col shrink-0 transition-all duration-300 shadow-xl z-50
        ${isMobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-[260px]'}
      `}>
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-4 md:px-6 border-b border-white/10 bg-[#0A192F]">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded bg-blue-600/20 flex items-center justify-center border border-blue-500/30 ${isCollapsed ? 'mx-auto' : ''}`}>
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold tracking-wider text-sm text-blue-400 uppercase leading-none">Administrasi</span>
                <span className="text-[10px] text-slate-500 tracking-wide mt-1">Sistem Terpadu v2</span>
              </div>
            )}
          </div>
          {/* Close button (Mobile only) */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {Menu.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center px-4 py-2.5 rounded-lg font-medium transition-all group border',
                active
                  ? 'bg-blue-600/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/10',
                isCollapsed ? 'justify-center' : 'gap-3 w-full'
              )}
              title={isCollapsed ? label : undefined}
            >
              <Icon className={clsx("w-5 h-5 shrink-0", active ? "text-blue-400" : "group-hover:text-blue-300 transition-colors")} />
              {!isCollapsed && <span className="text-sm tracking-wide truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 bg-[#061121] flex flex-col gap-2">
        <div className={clsx("flex items-center gap-3 p-3 rounded-lg bg-[#0A192F] border border-white/5", isCollapsed ? 'justify-center' : 'mb-2')}>
          <div className="w-9 h-9 rounded bg-blue-900/50 flex items-center justify-center font-bold text-blue-200 border border-blue-500/20 shrink-0">
            {user?.nama?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.nama ?? '-'}</p>
              <p className="text-[11px] text-blue-400 truncate uppercase tracking-wider mt-0.5">
                {user?.role?.replace('_', ' ') ?? 'Staf Admin'}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={logoutFn}
          className={clsx(
            "py-2.5 px-4 rounded-lg border border-rose-900/50 bg-rose-950/20 text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-500 transition-all font-medium text-sm flex items-center group",
            isCollapsed ? 'justify-center' : 'justify-center gap-2 w-full'
          )}
          title={isCollapsed ? "Log Out" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:text-white" />
          {!isCollapsed && <span>Log Out</span>}
        </button>

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center p-2 mt-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-white/5"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
    </>
  );
}
