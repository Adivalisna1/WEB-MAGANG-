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
  { href: '/staff/dokumen',        icon: LayoutDashboard, label: 'Dokumen Saya' },
  { href: '/staff/dokumen/upload', icon: Upload,          label: 'Upload Dokumen' },
  { href: '/staff/kertas-kerja',   icon: FileSpreadsheet, label: 'Kertas Kerja' },
  { href: '/staff/akuntansi',      icon: Calculator,      label: 'Pencatatan' },
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
          className="fixed inset-0 bg-[#334155]/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed left-0 top-0 md:relative h-screen bg-[#334155] text-slate-300 flex flex-col shrink-0 z-50 transition-all duration-300
        ${isMobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-[260px]'}
      `}>
        {/* Padding top for alignment with header */}
        <div className="h-20 border-b border-[#475569]/30 flex items-center justify-between px-4 md:px-6">
          <div className={`flex items-center ${isCollapsed ? 'mx-auto' : 'gap-2'}`}>
            <FileText className="w-6 h-6 text-indigo-400 shrink-0" />
            {!isCollapsed && <span className="font-bold text-sm tracking-wide text-white">STAFF DASHBOARD</span>}
          </div>
          {/* Close button (Mobile only) */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {StaffMenu.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/staff/dokumen' && pathname.startsWith(href));
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
              <Icon className={clsx("w-5 h-5 shrink-0", active ? "text-white" : "group-hover:text-white")} />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 mb-4 flex flex-col gap-1">
        <Link
          href="/laporan"
          className={clsx(
            "flex items-center text-slate-300 hover:text-white bg-[#1e293b]/50 hover:bg-[#475569]/80 rounded-xl font-medium transition-all",
            isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3 w-full'
          )}
          title={isCollapsed ? "Dashboard Laporan" : undefined}
        >
          <Home className="w-5 h-5 text-indigo-400 shrink-0" />
          {!isCollapsed && <span>Dashboard Laporan</span>}
        </Link>
        <button
          onClick={logoutFn}
          className={clsx(
            "flex items-center text-slate-300 hover:text-white bg-[#1e293b]/50 hover:bg-rose-500 rounded-xl font-medium transition-all group",
            isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3 w-full'
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 text-rose-400 group-hover:text-white shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center p-2 mt-2 text-slate-400 hover:text-white hover:bg-[#475569]/50 rounded-lg transition-colors border border-[#475569]/30"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
    </>
  );
}

