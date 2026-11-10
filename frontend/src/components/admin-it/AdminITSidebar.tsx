"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LogOut,
  LayoutDashboard,
  Users,
  Tags,
  Activity,
  Building2,
  FileUp,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileSpreadsheet,
  Wallet,
  ClipboardList,
  FileCheck2,
  FileText,
  ClipboardCheck,
  BookMarked,
  Landmark,
  Receipt,
  AlertOctagon,
  FileSignature,
  CheckCheck,
  Scale,
} from "lucide-react";
import clsx from "clsx";

const TOP_MENU_ITEMS = [
  { href: "/admin-it", label: "System Overview", icon: LayoutDashboard },
  { href: "/admin-it/satker", label: "Manajemen Satker", icon: Building2 },
  { href: "/admin-it/users", label: "User Management", icon: Users },
  { href: "/admin-it/kategori", label: "Kategori Dokumen", icon: Tags },
  { href: "/admin-it/rumus", label: "Rumus Kertas Kerja", icon: Scale },
];

const KAS_SUB_MENU = [
  {
    href: "/admin-it/rekening-koran",
    label: "Rekening Koran",
    icon: FileSpreadsheet,
  },
  {
    href: "/staff/kas/bap-kas",
    label: "BAP Kas",
    icon: ClipboardCheck,
  },
  {
    href: "/staff/kas/lpj-bendahara",
    label: "LPJ Bendahara",
    icon: BookMarked,
  },
  {
    href: "/staff/kas/konfirmasi-bank",
    label: "Konfirmasi Saldo Bank",
    icon: Landmark,
  },
];

const SK_PIUTANG_SUB_MENU = [
  {
    href: "/staff/laporan/sk-piutang/penetapan",
    label: "1. SK Penetapan / Kurang Bayar",
    icon: AlertOctagon,
  },
  {
    href: "/staff/laporan/sk-piutang/pembebanan",
    label: "2. SK Pembebanan / SKTJM",
    icon: FileSignature,
  },
  {
    href: "/staff/laporan/sk-piutang/penghapusan",
    label: "3. SK Penghapusan Piutang",
    icon: CheckCheck,
  },
];

const LAPORAN_LAIN_SUB_MENU = [
  {
    href: "/staff/laporan/surat-rekening",
    label: "Surat Penutup/Pembukaan Rekening",
    icon: FileText,
  },
  {
    href: "/staff/laporan/bukti-setor-up",
    label: "Bukti Setor Sisa UP (NTPN)",
    icon: Receipt,
  },
];

const BOTTOM_MENU_ITEMS = [
  { href: "/admin-it/logs", label: "Real-Time Logs", icon: Activity },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function AdminITSidebar({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logoutFn } = useAuth();

  const isKasActive =
    pathname === "/staff/kas" ||
    pathname.startsWith("/staff/kas") ||
    pathname === "/admin-it/rekening-koran" ||
    pathname.startsWith("/admin-it/rekening-koran") ||
    pathname.includes("/kas/");

  const isBuktiActive =
    pathname === "/admin-it/pencatatan" ||
    pathname.startsWith("/admin-it/pencatatan");

  const isLaporanActive =
    pathname.includes("/laporan/");

  const isPiutangActive =
    pathname.includes("/sk-piutang");

  const [isKasOpen, setIsKasOpen] = useState(isKasActive);
  const [isLaporanOpen, setIsLaporanOpen] = useState(isLaporanActive);
  const [isPiutangOpen, setIsPiutangOpen] = useState(isPiutangActive);

  useEffect(() => {
    if (isKasActive) setIsKasOpen(true);
  }, [isKasActive]);

  useEffect(() => {
    if (isLaporanActive) setIsLaporanOpen(true);
    if (isPiutangActive) setIsPiutangOpen(true);
  }, [isLaporanActive, isPiutangActive]);

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
      <aside
        className={`
        fixed left-0 top-0 md:relative h-screen bg-white border-r border-slate-200 z-50 flex flex-col shrink-0 font-['Inter',sans-serif] shadow-sm transition-all duration-300
        ${isMobileOpen ? "translate-x-0 w-[270px]" : "-translate-x-full md:translate-x-0"}
        ${isCollapsed ? "md:w-20" : "md:w-[270px]"}
      `}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-4 md:px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 bg-[#1E90FF] rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${!isCollapsed ? "" : "mx-auto"}`}
            >
              <span className="text-sm">IT</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="font-bold text-slate-900 tracking-tight leading-none text-[15px] m-0">
                  Admin IT
                </h1>
                <p className="text-[10px] text-[#1E90FF] font-bold tracking-wider mt-0.5 m-0">
                  ADMINISTRASI
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

        {/* Profile Section */}
        <div
          className={`p-4 border-b border-slate-200 bg-white ${isCollapsed ? "hidden md:flex justify-center" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E90FF] flex flex-shrink-0 items-center justify-center text-white font-bold text-sm">
              {user?.nama?.charAt(0) || "A"}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.nama}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.role === "it"
                    ? "IT Administrator"
                    : user?.role || "Admin IT"}
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* Top Menu Items */}
          {TOP_MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#1E90FF] text-white shadow-lg shadow-[#1E90FF]/30"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                } ${isCollapsed ? "justify-center" : "gap-3"}`}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}

          {/* Kas Parent Link + Accordion */}
          <div>
            <div
              className={clsx(
                "w-full flex items-center rounded-lg text-sm font-medium transition-all group",
                isKasActive
                  ? "bg-blue-50/70 text-slate-900 font-semibold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Link
                href="/staff/kas"
                onClick={() => {
                  if (isCollapsed) setIsCollapsed(false);
                  setIsKasOpen(true);
                }}
                className={clsx(
                  "flex items-center flex-1 px-3 py-2.5",
                  isCollapsed ? "justify-center" : "gap-3"
                )}
                title={isCollapsed ? "Kas" : undefined}
              >
                <Wallet
                  className={clsx(
                    "w-5 h-5 flex-shrink-0",
                    isKasActive ? "text-[#1E90FF]" : "text-slate-400 group-hover:text-slate-700"
                  )}
                />
                {!isCollapsed && <span className="truncate">Kas</span>}
              </Link>

              {!isCollapsed && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsKasOpen(!isKasOpen);
                  }}
                  className="p-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <ChevronDown
                    className={clsx(
                      "w-4 h-4 transition-transform duration-200 shrink-0",
                      isKasOpen && "rotate-180"
                    )}
                  />
                </button>
              )}
            </div>

            {/* Submenu Kas */}
            {!isCollapsed && isKasOpen && (
              <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-200 space-y-1">
                {KAS_SUB_MENU.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                        isActive
                          ? "bg-[#1E90FF] text-white shadow-md shadow-[#1E90FF]/25 font-semibold"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <item.icon
                        className={clsx(
                          "w-4 h-4 flex-shrink-0",
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Master Bukti & Transaksi (Standalone Menu) */}
          <Link
            href="/admin-it/pencatatan"
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isBuktiActive
                ? "bg-[#1E90FF] text-white shadow-lg shadow-[#1E90FF]/30"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            } ${isCollapsed ? "justify-center" : "gap-3"}`}
            title={isCollapsed ? "Master Bukti & Transaksi" : undefined}
          >
            <FileUp
              className={`w-5 h-5 flex-shrink-0 ${isBuktiActive ? "text-white" : "text-slate-400"}`}
            />
            {!isCollapsed && <span className="truncate">Master Bukti & Transaksi</span>}
          </Link>

          {/* Laporan Accordion Menu */}
          <div>
            <div
              className={clsx(
                "w-full flex items-center rounded-lg text-sm font-medium transition-all group",
                isLaporanActive
                  ? "bg-blue-50/70 text-slate-900 font-semibold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Link
                href="/staff/laporan/sk-piutang"
                onClick={() => {
                  if (isCollapsed) setIsCollapsed(false);
                  setIsLaporanOpen(true);
                }}
                className={clsx(
                  "flex items-center flex-1 px-3 py-2.5",
                  isCollapsed ? "justify-center" : "gap-3"
                )}
                title={isCollapsed ? "Laporan" : undefined}
              >
                <ClipboardList
                  className={clsx(
                    "w-5 h-5 flex-shrink-0",
                    isLaporanActive ? "text-[#1E90FF]" : "text-slate-400 group-hover:text-slate-700"
                  )}
                />
                {!isCollapsed && <span className="truncate">Laporan</span>}
              </Link>

              {!isCollapsed && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsLaporanOpen(!isLaporanOpen);
                  }}
                  className="p-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <ChevronDown
                    className={clsx(
                      "w-4 h-4 transition-transform duration-200 shrink-0",
                      isLaporanOpen && "rotate-180"
                    )}
                  />
                </button>
              )}
            </div>

            {/* Submenu Laporan (Dengan Nested Accordion SK Piutang) */}
            {!isCollapsed && isLaporanOpen && (
              <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-200 space-y-1">
                {/* 1. Sub-Accordion SK Piutang */}
                <div>
                  <div
                    className={clsx(
                      "w-full flex items-center justify-between rounded-lg font-medium text-xs transition-all group",
                      isPiutangActive
                        ? "bg-blue-50/70 text-slate-900 font-semibold"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <Link
                      href="/staff/laporan/sk-piutang"
                      onClick={() => setIsPiutangOpen(true)}
                      className="flex items-center gap-2.5 flex-1 px-3 py-2"
                      title="Ringkasan SK Piutang"
                    >
                      <Scale
                        className={clsx(
                          "w-4 h-4 flex-shrink-0",
                          isPiutangActive
                            ? "text-[#1E90FF]"
                            : "text-slate-400 group-hover:text-slate-700"
                        )}
                      />
                      <span className="truncate">SK Piutang</span>
                    </Link>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsPiutangOpen(!isPiutangOpen);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-700 transition-colors"
                      title={isPiutangOpen ? "Ciutkan sub-menu piutang" : "Buka sub-menu piutang"}
                    >
                      <ChevronDown
                        className={clsx(
                          "w-3.5 h-3.5 transition-transform duration-200",
                          isPiutangOpen && "rotate-180"
                        )}
                      />
                    </button>
                  </div>

                  {/* 3 Sub-menu SK Piutang (Nested Level 2) */}
                  {isPiutangOpen && (
                    <div className="mt-1 ml-3 pl-2.5 border-l-2 border-blue-200/60 space-y-1 py-0.5">
                      {SK_PIUTANG_SUB_MENU.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                              "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all group",
                              isActive
                                ? "bg-[#1E90FF] text-white shadow-xs font-semibold"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                          >
                            <item.icon
                              className={clsx(
                                "w-3.5 h-3.5 flex-shrink-0",
                                isActive
                                  ? "text-white"
                                  : "text-slate-400 group-hover:text-slate-700"
                              )}
                            />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Sibling Menu Laporan Lainnya */}
                {LAPORAN_LAIN_SUB_MENU.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                        isActive
                          ? "bg-[#1E90FF] text-white shadow-md shadow-[#1E90FF]/25 font-semibold"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <item.icon
                        className={clsx(
                          "w-4 h-4 flex-shrink-0",
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-700"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Menu Items */}
          {BOTTOM_MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#1E90FF] text-white shadow-lg shadow-[#1E90FF]/30"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                } ${isCollapsed ? "justify-center" : "gap-3"}`}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-200 flex flex-col gap-2">
          <button
            onClick={logoutFn}
            className={`flex items-center px-3 py-2.5 text-left rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors ${isCollapsed ? "justify-center" : "gap-3 w-full"}`}
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
