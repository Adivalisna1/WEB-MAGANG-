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
              <span className="text-sm">ST</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="font-bold text-slate-900 tracking-tight leading-none text-[15px] m-0">Staff</h1>
                <p className="text-[10px] text-[#1E90FF] font-bold tracking-wider mt-0.5 m-0">PORTAL SATKER</p>
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
              <Icon className={clsx("w-5 h-5 shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 mb-4 flex flex-col gap-1">
        <Link
          href="/laporan"
          className={clsx(
            "flex items-center text-slate-600 hover:text-white bg-slate-100 hover:bg-[#1E90FF] rounded-xl font-medium transition-all group",
            isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3 w-full'
          )}
          title={isCollapsed ? "Dashboard Laporan" : undefined}
        >
          <Home className="w-5 h-5 text-slate-500 shrink-0 group-hover:text-white" />
          {!isCollapsed && <span>Dashboard Laporan</span>}
        </Link>
        <button
          onClick={logoutFn}
          className={clsx(
            "flex items-center text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl font-medium transition-all group",
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

