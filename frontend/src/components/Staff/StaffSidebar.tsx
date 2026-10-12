'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FileText, Upload, LayoutDashboard,
  LogOut, User, ChevronRight, Home, Settings, Bell, FileSpreadsheet, Calculator, X, ChevronLeft
} from 'lucide-react';
import clsx from 'clsx';

const StaffMenu = [
  { href: '/staff/dokumen',        icon: LayoutDashboard, label: 'Dokumen' },
  { href: '/staff/rekening-koran', icon: FileSpreadsheet, label: 'Rekening Koran' },
  { href: '/staff/pencatatan',      icon: Calculator,      label: 'Pencatatan' },
  { href: '/staff/profil',         icon: User,            label: 'Profil' },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
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
        fixed left-0 top-0 md:relative h-screen bg-white border-r border-slate-200 text-slate-600 flex flex-col shrink-0 z-50 transition-all duration-300
        ${isMobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-[260px]'}
      `}>
        <div className="h-20 flex items-center justify-between px-4 md:px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-[#1E90FF] rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
              <span className="text-sm">OP</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="font-bold text-slate-900 tracking-tight leading-none text-[15px] m-0">Operator</h1>
                <p className="text-[10px] text-[#1E90FF] font-bold tracking-wider mt-0.5 m-0 uppercase truncate max-w-[170px]" title={user?.satker_nama || undefined}>
                  {user?.satker_nama || 'PORTAL SATKER'}
                </p>
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

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {StaffMenu.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center px-4 py-3 rounded-xl font-medium transition-all group',
                active
                  ? 'bg-[#475569] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#475569]/50',
                isCollapsed ? 'justify-center' : 'gap-3 w-full'
              )}
              title={isCollapsed ? label : undefined}
            >
              <Icon className={clsx("w-5 h-5 shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100 flex flex-col gap-2 bg-slate-50/50">
        <Link
          href="/laporan"
          className={clsx(
            "flex items-center text-slate-600 hover:text-white bg-white hover:bg-[#1E90FF] rounded-xl font-medium transition-all group border border-slate-200/80 shadow-xs",
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2 text-xs w-full'
          )}
          title={isCollapsed ? "Dashboard Laporan" : undefined}
        >
          <Home className="w-4 h-4 text-slate-500 shrink-0 group-hover:text-white" />
          {!isCollapsed && <span>Dashboard Laporan Publik</span>}
        </Link>

        {/* User Profile Card */}
        <div className={clsx(
          "flex items-center bg-white border border-slate-200/80 rounded-xl p-2 transition-all shadow-xs",
          isCollapsed ? "justify-center" : "justify-between gap-2"
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-bold text-xs flex items-center justify-center">
                {(user?.nama || 'ST').substring(0, 2).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {user?.nama || 'Operator Satker'}
                </span>
                <span className="text-[10px] text-blue-600 font-semibold tracking-wide truncate max-w-[130px]" title={user?.satker_nama || undefined}>
                  {user?.satker_nama || 'OPERATOR SATKER'}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={logoutFn}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              title="Keluar dari Sistem"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          title={isCollapsed ? "Lebarkan Sidebar" : "Ciutkan Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
    </>
  );
}

