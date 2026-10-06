'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, LayoutDashboard, Users, Tags, Activity, Building2, Calculator, X, ChevronLeft, ChevronRight, Database, FileSpreadsheet, Home } from 'lucide-react';

const MENU_ITEMS = [
  { href: '/admin-it', label: 'System Overview', icon: LayoutDashboard },
  { href: '/admin-it/satker', label: 'Manajemen Satker', icon: Building2 },
  { href: '/admin-it/users', label: 'User Management', icon: Users },
  { href: '/admin-it/kategori', label: 'Kategori Dokumen', icon: Tags },
  { href: '/admin-it/pencatatan', label: 'Pencatatan', icon: Calculator },
  { href: '/admin-it/rekening-koran', label: 'Rekening Koran', icon: FileSpreadsheet },

  { href: '/admin-it/logs', label: 'Real-Time Logs', icon: Activity },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function AdminITSidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, logoutFn } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col font-['Inter',sans-serif] shadow-sm transition-all duration-300
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
      `}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-4 md:px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-[#1E90FF] rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${!isCollapsed ? '' : 'mx-auto'}`}>
              <span className="text-sm">IT</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="font-bold text-slate-900 tracking-tight leading-none text-[15px] m-0">Admin IT</h1>
                <p className="text-[10px] text-[#1E90FF] font-bold tracking-wider mt-0.5 m-0">ADMINISTRASI</p>
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

        {/* Profile Section */}
        <div className={`p-4 border-b border-slate-200 bg-white ${isCollapsed ? 'hidden md:flex justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E90FF] flex flex-shrink-0 items-center justify-center text-slate-900 font-bold">
              {user?.nama?.charAt(0) || 'A'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.nama}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </div>
            )}
          </div>
        </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#1E90FF] text-white shadow-lg shadow-[#1E90FF]/30'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              } ${isCollapsed ? 'justify-center' : 'gap-3'}`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-200 flex flex-col gap-2">
        <button
          onClick={logoutFn}
          className={`flex items-center px-3 py-2.5 text-left rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors ${isCollapsed ? 'justify-center' : 'gap-3 w-full'}`}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center p-2 mt-2 text-slate-400 hover:text-slate-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
    </>
  );
}
