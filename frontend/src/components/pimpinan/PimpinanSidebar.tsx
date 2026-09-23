'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, FileCheck, Users,
  Activity, LogOut, ChevronRight, ShieldCheck, Home, Tag, User, FileSpreadsheet, Calculator, X, ChevronLeft
} from 'lucide-react';
import clsx from 'clsx';

const PimpinanMenu = [
  { href: '/pimpinan',              icon: LayoutDashboard, label: 'Dashboard',          exact: true },
  { href: '/pimpinan/dokumen',      icon: FileCheck,       label: 'Verifikasi Dokumen' },
  { href: '/pimpinan/kertas-kerja', icon: FileSpreadsheet,  label: 'Rekening Koran' },
  { href: '/pimpinan/akuntansi',    icon: Calculator,      label: 'Pencatatan' },
  { href: '/pimpinan/users',        icon: Users,           label: 'Manajemen User' },
  { href: '/pimpinan/logs',         icon: Activity,        label: 'Log Aktivitas' },
  { href: '/pimpinan/profil',       icon: User,            label: 'Profil' },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function PimpinanSidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, logoutFn } = useAuth();

  const menu = PimpinanMenu;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-[#0f172a]/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed left-0 top-0 md:relative h-screen bg-[#0f172a] text-slate-300 flex flex-col shrink-0 z-50 transition-all duration-300
        ${isMobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-[260px]'}
      `}>
        {/* Padding top for alignment with header */}
        <div className="h-20 flex items-center justify-between px-4 md:px-6 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded bg-[#10b981]/20 flex items-center justify-center ${isCollapsed ? 'mx-auto' : ''}`}>
              <ShieldCheck className="w-5 h-5 text-[#10b981] shrink-0" />
            </div>
            {!isCollapsed && (
              <span className="font-bold tracking-widest text-sm text-[#10b981] uppercase">Pimpinan</span>
            )}
          </div>
          {/* Close button (Mobile only) */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menu.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center px-4 py-3 rounded-xl font-medium transition-all group',
                active
                  ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#1e293b]',
                isCollapsed ? 'justify-center' : 'gap-3 w-full'
              )}
              title={isCollapsed ? label : undefined}
            >
              <Icon className={clsx("w-5 h-5 shrink-0", active ? "text-white" : "group-hover:text-white")} />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1e293b] flex flex-col gap-2">
        <Link
          href="/pimpinan/profil"
          className={clsx(
            "flex items-center mb-2 cursor-pointer hover:bg-[#1e293b] p-2 rounded-xl transition-colors",
            isCollapsed ? 'justify-center' : 'gap-3'
          )}
          title={isCollapsed ? "Profil" : undefined}
        >
          <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center font-bold text-white shadow-inner shrink-0">
            {user?.nama?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.nama ?? '-'}</p>
              <p className="text-xs text-[#10b981] truncate capitalize">
                {user?.role?.replace('_', ' ') ?? 'Ketua Pimpinan'}
              </p>
            </div>
          )}
        </Link>
        <button
          onClick={logoutFn}
          className={clsx(
            "py-2.5 px-4 rounded-xl border border-[#334155] text-slate-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all font-medium text-sm flex items-center group",
            isCollapsed ? 'justify-center' : 'justify-center gap-2 w-full'
          )}
          title={isCollapsed ? "Keluar" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0 group-hover:text-white" />
          {!isCollapsed && <span>Keluar</span>}
        </button>

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center p-2 mt-2 text-slate-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors border border-[#1e293b]"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
    </>
  );
}

