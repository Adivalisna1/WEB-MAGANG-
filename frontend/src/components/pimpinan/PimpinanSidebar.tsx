"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Users,
  Activity,
  LogOut,
  ChevronRight,
  ChevronDown,
  User,
  FileSpreadsheet,
  FileCheck2,
  X,
  ChevronLeft,
  Wallet,
  ClipboardList,
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

const TOP_MENU = [
  { href: "/pimpinan", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/pimpinan/dokumen", icon: FileText, label: "Dokumen" },
  { href: "/pimpinan/kertas-kerja", icon: FileSpreadsheet, label: "Kertas Kerja" },
];

const KAS_SUB_MENU = [
  {
    href: "/pimpinan/rekening-koran",
    icon: FileSpreadsheet,
    label: "Rekening Koran",
  },
  {
    href: "/staff/kas/bap-kas",
    icon: ClipboardCheck,
    label: "BAP Kas",
  },
  {
    href: "/staff/kas/lpj-bendahara",
    icon: BookMarked,
    label: "LPJ Bendahara",
  },
  {
    href: "/staff/kas/konfirmasi-bank",
    icon: Landmark,
    label: "Konfirmasi Saldo Bank",
  },
];

const SK_PIUTANG_SUB_MENU = [
  {
    href: "/staff/laporan/sk-piutang/penetapan",
    icon: AlertOctagon,
    label: "1. SK Penetapan / Kurang Bayar",
  },
  {
    href: "/staff/laporan/sk-piutang/pembebanan",
    icon: FileSignature,
    label: "2. SK Pembebanan / SKTJM",
  },
  {
    href: "/staff/laporan/sk-piutang/penghapusan",
    icon: CheckCheck,
    label: "3. SK Penghapusan Piutang",
  },
];

const LAPORAN_LAIN_SUB_MENU = [
  {
    href: "/staff/laporan/surat-rekening",
    icon: FileText,
    label: "Surat Penutup/Pembukaan Rekening",
  },
  {
    href: "/staff/laporan/bukti-setor-up",
    icon: Receipt,
    label: "Bukti Setor Sisa UP (NTPN)",
  },
];

const BOTTOM_MENU = [
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

  const isKasActive =
    pathname === "/staff/kas" ||
    pathname.startsWith("/staff/kas") ||
    pathname === "/pimpinan/rekening-koran" ||
    pathname.startsWith("/pimpinan/rekening-koran") ||
    pathname.includes("/kas/");

  const isBuktiActive =
    pathname === "/pimpinan/pencatatan" ||
    pathname.startsWith("/pimpinan/pencatatan");

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
          className="fixed inset-0 bg-white/80 border-r border-slate-200/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
        fixed left-0 top-0 md:relative h-screen bg-white border-r border-slate-200 text-slate-600 flex flex-col shrink-0 z-50 transition-all duration-300
        ${isMobileOpen ? "translate-x-0 w-[270px]" : "-translate-x-full md:translate-x-0"}
        ${isCollapsed ? "md:w-20" : "md:w-[270px]"}
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
          {/* Top Menu Items */}
          {TOP_MENU.map(({ href, icon: Icon, label, exact }) => {
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
                  isCollapsed ? "justify-center" : "gap-3 w-full"
                )}
                title={isCollapsed ? label : undefined}
              >
                <Icon
                  className={clsx(
                    "w-5 h-5 shrink-0",
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white"
                  )}
                />
                {!isCollapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}

          {/* Kas Parent Link + Accordion */}
          <div>
            <div
              className={clsx(
                "w-full flex items-center rounded-xl font-medium transition-all group",
                isKasActive
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#475569]/50"
              )}
            >
              <Link
                href="/staff/kas"
                onClick={() => {
                  if (isCollapsed) setIsCollapsed(false);
                  setIsKasOpen(true);
                }}
                className={clsx(
                  "flex items-center flex-1 px-4 py-3",
                  isCollapsed ? "justify-center" : "gap-3"
                )}
                title={isCollapsed ? "Kas" : undefined}
              >
                <Wallet
                  className={clsx(
                    "w-5 h-5 shrink-0",
                    isKasActive
                      ? "text-[#1E90FF]"
                      : "text-slate-400 group-hover:text-white"
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
                  className="p-3 text-slate-400 hover:text-white transition-colors"
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
              <div className="mt-1 ml-5 pl-3 border-l-2 border-slate-200 space-y-1">
                {KAS_SUB_MENU.map(({ href, icon: SubIcon, label }) => {
                  const active = pathname === href || pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={clsx(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group",
                        active
                          ? "bg-[#475569] text-white shadow-sm font-semibold"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
                      )}
                    >
                      <SubIcon
                        className={clsx(
                          "w-4 h-4 shrink-0",
                          active
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-700"
                        )}
                      />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Verifikasi Bukti Kas (Standalone Menu) */}
          <Link
            href="/pimpinan/pencatatan"
            className={clsx(
              "flex items-center px-4 py-3 rounded-xl font-medium transition-all group",
              isBuktiActive
                ? "bg-[#475569] text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-[#475569]/50",
              isCollapsed ? "justify-center" : "gap-3 w-full"
            )}
            title={isCollapsed ? "Verifikasi Bukti Kas" : undefined}
          >
            <FileCheck2
              className={clsx(
                "w-5 h-5 shrink-0",
                isBuktiActive
                  ? "text-white"
                  : "text-slate-400 group-hover:text-white"
              )}
            />
            {!isCollapsed && <span className="truncate">Verifikasi Bukti Kas</span>}
          </Link>

          {/* Laporan Accordion Menu */}
          <div>
            <div
              className={clsx(
                "w-full flex items-center rounded-xl font-medium transition-all group",
                isLaporanActive
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#475569]/50"
              )}
            >
              <Link
                href="/staff/laporan/sk-piutang"
                onClick={() => {
                  if (isCollapsed) setIsCollapsed(false);
                  setIsLaporanOpen(true);
                }}
                className={clsx(
                  "flex items-center flex-1 px-4 py-3",
                  isCollapsed ? "justify-center" : "gap-3"
                )}
                title={isCollapsed ? "Laporan" : undefined}
              >
                <ClipboardList
                  className={clsx(
                    "w-5 h-5 shrink-0",
                    isLaporanActive
                      ? "text-[#1E90FF]"
                      : "text-slate-400 group-hover:text-white"
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
                  className="p-3 text-slate-400 hover:text-white transition-colors"
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
              <div className="mt-1 ml-5 pl-3 border-l-2 border-slate-200 space-y-1">
                {/* 1. Sub-Accordion SK Piutang */}
                <div>
                  <div
                    className={clsx(
                      "w-full flex items-center justify-between rounded-lg font-medium text-xs transition-all group",
                      isPiutangActive
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
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
                          "w-4 h-4 shrink-0",
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
                      {SK_PIUTANG_SUB_MENU.map(({ href, icon: SubIcon, label }) => {
                        const active = pathname === href || pathname.startsWith(href);
                        return (
                          <Link
                            key={href}
                            href={href}
                            className={clsx(
                              "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all group",
                              active
                                ? "bg-[#475569] text-white shadow-xs font-semibold"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
                            )}
                          >
                            <SubIcon
                              className={clsx(
                                "w-3.5 h-3.5 shrink-0",
                                active
                                  ? "text-white"
                                  : "text-slate-400 group-hover:text-slate-700"
                              )}
                            />
                            <span className="truncate">{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Sibling Menu Laporan Lainnya */}
                {LAPORAN_LAIN_SUB_MENU.map(({ href, icon: SubIcon, label }) => {
                  const active = pathname === href || pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={clsx(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group",
                        active
                          ? "bg-[#475569] text-white shadow-sm font-semibold"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
                      )}
                    >
                      <SubIcon
                        className={clsx(
                          "w-4 h-4 shrink-0",
                          active
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-700"
                        )}
                      />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Menu Items */}
          {BOTTOM_MENU.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center px-4 py-3 rounded-xl font-medium transition-all group",
                  active
                    ? "bg-[#475569] text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-[#475569]/50",
                  isCollapsed ? "justify-center" : "gap-3 w-full"
                )}
                title={isCollapsed ? label : undefined}
              >
                <Icon
                  className={clsx(
                    "w-5 h-5 shrink-0",
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white"
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
              isCollapsed ? "justify-center" : "justify-between gap-2"
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
                    {user?.nama || "Pimpinan Satker"}
                  </span>
                  <span
                    className="text-[10px] text-blue-600 font-semibold tracking-wide truncate max-w-[140px]"
                    title={user?.satker_nama || undefined}
                  >
                    {user?.satker_nama || "PORTAL SATKER"}
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
