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
        fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50 flex flex-col font-['Inter',sans-serif] shadow-sm transition-all duration-300
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
      `}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className={`w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white ${!isCollapsed ? 'mr-3' : 'mx-auto'}`}>
              IT
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-gray-900 tracking-tight leading-none text-[15px]">CoreSphere IT</h1>
                <p className="text-[11px] text-gray-500 font-medium">Administration</p>
              </div>
            )}
          </div>
          {/* Close button (Mobile only) */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Section */}
        <div className={`p-4 border-b border-gray-100 bg-gray-50/50 ${isCollapsed ? 'hidden md:flex justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex flex-shrink-0 items-center justify-center text-blue-700 font-bold">
              {user?.nama?.charAt(0) || 'A'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.nama}</p>
                <p className="text-xs text-gray-500 truncate">{user?.role}</p>
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
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } ${isCollapsed ? 'justify-center' : 'gap-3'}`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
        <button
          onClick={logoutFn}
          className={`flex items-center px-3 py-2.5 text-left rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : 'gap-3 w-full'}`}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center p-2 mt-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
    </>
  );
}
