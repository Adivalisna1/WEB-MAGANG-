'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, LayoutDashboard, Users, Tags, Activity } from 'lucide-react';

const MENU_ITEMS = [
  { href: '/admin-it', label: 'System Overview', icon: LayoutDashboard },
  { href: '/admin-it/users', label: 'User Management', icon: Users },
  { href: '/admin-it/kategori', label: 'Kategori Dokumen', icon: Tags },
  { href: '/admin-it/logs', label: 'Real-Time Logs', icon: Activity },
];

export default function AdminITSidebar() {
  const pathname = usePathname();
  const { user, logoutFn } = useAuth();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 text-gray-800 font-['Inter',sans-serif] z-50 shadow-sm">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white mr-3">
          IT
        </div>
        <div>
          <h1 className="font-bold text-gray-900 tracking-tight leading-none text-[15px]">CoreSphere IT</h1>
          <p className="text-[11px] text-gray-500 font-medium">Administration</p>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            {user?.nama?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.nama}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logoutFn}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
