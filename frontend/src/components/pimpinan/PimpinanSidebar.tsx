"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileCheck,
  FileText,
  Users,
  Activity,
  LogOut,
  ChevronRight,
  Home,
  User,
  FileSpreadsheet,
  FileCheck2,
  X,
  ChevronLeft,
} from "lucide-react";
import clsx from "clsx";

const PimpinanMenu = [
  { href: "/pimpinan", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/pimpinan/dokumen", icon: FileText, label: "Dokumen" },
  {
    href: "/pimpinan/rekening-koran",
    icon: FileSpreadsheet,
    label: "Rekening Koran",
  },
  {
    href: "/pimpinan/pencatatan",
    icon: FileCheck2,
    label: "Verifikasi Bukti Kas",
  },
  { href: "/pimpinan/users", icon: Users, label: "Manajemen User" },
  { href: "/pimpinan/logs", icon: Activity, label: "Log Aktivitas" },
  { href: "/pimpinan/profil", icon: User, label: "Profil" },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function PimpinanSidebar({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logoutFn } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-white/80 border-r border-slate-200/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
        fixed left-0 top-0 md:relative h-screen bg-white border-r border-slate-200 text-slate-600 flex flex-col shrink-0 z-50 transition-all duration-300
        ${isMobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full md:translate-x-0"}
        ${isCollapsed ? "md:w-20" : "md:w-[260px]"}
      `}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-4 md:px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 bg-[#1E90FF] rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${isCollapsed ? "mx-auto" : ""}`}
            >
              <span className="text-sm">MN</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="font-bold text-slate-900 tracking-tight leading-none text-[15px] m-0">
                  Manajemen
                </h1>
                <p
                  className="text-[10px] text-[#1E90FF] font-bold tracking-wider mt-0.5 m-0 uppercase truncate max-w-[170px]"
                  title={user?.satker_nama || undefined}
                >
                  {user?.satker_nama || "PORTAL SATKER"}
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
          {PimpinanMenu.map(({ href, icon: Icon, label, exact }) => {
            const active = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center px-4 py-3 rounded-xl font-medium transition-all group",
                  active
                    ? "bg-[#475569] text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-[#475569]/50",
                  isCollapsed ? "justify-center" : "gap-3 w-full",
                )}
                title={isCollapsed ? label : undefined}
              >
                <Icon
                  className={clsx(
                    "w-5 h-5 shrink-0",
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white",
                  )}
                />
                {!isCollapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer / User Profile & Actions */}
        <div className="p-3 border-t border-slate-100 flex flex-col gap-2 bg-slate-50/50">
          {/* User Profile Card */}
          <div
            className={clsx(
              "flex items-center bg-white border border-slate-200/80 rounded-xl p-2 transition-all shadow-xs",
              isCollapsed ? "justify-center" : "justify-between gap-2",
            )}
          >
            <Link
              href="/pimpinan/profil"
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
              title="Lihat Profil"
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-bold text-xs flex items-center justify-center">
                  {(user?.nama || "PM").substring(0, 2).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-bold text-slate-800 truncate leading-tight">
                    {user?.nama || "Manajemen Satker"}
                  </span>
                  <span
                    className="text-[10px] text-blue-600 font-semibold tracking-wide truncate max-w-[130px]"
                    title={user?.satker_nama || undefined}
                  >
                    {user?.satker_nama || "MANAJEMEN SATKER"}
                  </span>
                </div>
              )}
            </Link>
            {isCollapsed ? (
              <button
                onClick={logoutFn}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mx-auto mt-1"
                title="Keluar dari Sistem"
              >
                <LogOut className="w-4 h-4 text-red-500" />
              </button>
            ) : (
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
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
