'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import toast from 'react-hot-toast';
import {
  FileText, FileCheck, Clock, Clock4, Users, Download, Wifi,
  ArrowRight, Loader2, RefreshCw, CheckCircle, CheckCircle2,
  Building2, Search, Filter, Eye, Send, AlertCircle, AlertTriangle,
  MessageSquareWarning, Info, BookOpen, ChevronRight, X, ExternalLink
} from 'lucide-react';
import clsx from 'clsx';
import ActivityTimeline from '@/components/ActivityTimeline';
import '@/app/staff/staff.css';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

interface Stats {
  totalDokumen: number;
  terverifikasi: number;
  menunggu: number;
  lolosAdmin: number;
  revisi: number;
  totalUser: number;
  totalDownload: number;
  onlineNow: number;
}

interface OnlineUser {
  id: number;
  nama: string;
  username: string;
  role: string;
  last_active_at: string;
  login_at: string;
}

interface Dokumen {
  id: number;
  judul: string;
  tahun: number;
  bulan?: number | null;
  semester?: number | null;
  nomor_laporan?: string | null;
  status: string;
  kategori: string;
  file_nama: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  catatan: string | null;
  nilai_rekening_koran?: number | null;
  nilai_excel?: number | null;
}

interface Kategori {
  id: number;
  nama: string;
  slug: string;
}

const statusConfig: Record<string, { label: string; badgeClass: string; color: string }> = {
  draft: { label: 'Draft', badgeClass: 'staff-badge-draft', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  menunggu_verifikasi: { label: 'Menunggu Pimpinan', badgeClass: 'staff-badge-pimpinan', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  lolos_pimpinan: { label: 'Menunggu Eselon 1', badgeClass: 'staff-badge-eselon', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  lolos_admin: { label: 'Menunggu Eselon 1', badgeClass: 'staff-badge-eselon', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  terverifikasi: { label: 'Selesai', badgeClass: 'staff-badge-selesai', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  revisi: { label: 'Perlu Perbaikan', badgeClass: 'staff-badge-revisi', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  diarsipkan: { label: 'Diarsipkan', badgeClass: 'staff-badge-arsip', color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

function formatRupiah(val: number | null | undefined): string {
  if (val == null) return '—';
  const rounded = Math.round(val * 100) / 100;
  const [int, dec] = rounded.toString().split('.');
  const ribuan = Number(int).toLocaleString('id-ID');
  return dec && dec !== '00' ? `Rp ${ribuan},${dec.padEnd(2, '0')}` : `Rp ${ribuan}`;
}

export default function PimpinanDashboardPage() {
  const router = useRouter();

  // Data States
  const [stats, setStats] = useState<Stats | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [dokumenList, setDokumenList] = useState<Dokumen[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [logMeta, setLogMeta] = useState<any>(null);
  const [logPage, setLogPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [activeTab, setActiveTab] = useState<'all' | 'menunggu' | 'lolos' | 'selesai' | 'revisi'>('all');
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const session = getSession();
      const headers = { Authorization: `Bearer ${session?.token}` };

      const [statsRes, onlineRes, logsRes, docsRes, katRes] = await Promise.all([
        fetch(`${API}/pimpinan/stats`, { headers }).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${API}/pimpinan/users/online`, { headers }).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${API}/pimpinan/logs?page=${logPage}&limit=10`, { headers }).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${API}/dokumen/all?limit=100`, { headers }).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${API}/dokumen/kategori`, { headers }).then(r => r.json()).catch(() => ({ success: false })),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (onlineRes.success) setOnlineUsers(onlineRes.data ?? []);
      if (logsRes.success) {
        setLogs(logsRes.data ?? []);
        setLogMeta(logsRes.meta);
      }
      if (docsRes.success) setDokumenList(docsRes.data ?? []);
      if (katRes.success) setKategoriList(katRes.data ?? []);
    } catch (e) {
      console.error('Error fetching dashboard pimpinan data:', e);
    } finally {
      setLoading(false);
    }
  }, [logPage]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s auto polling
    return () => clearInterval(interval);
  }, [fetchData]);

  // List of documents awaiting Pimpinan approval
  const waitingDocuments = useMemo(() => {
    return dokumenList.filter(d => d.status === 'menunggu_verifikasi');
  }, [dokumenList]);

  // Top pending document for spotlight card
  const topPendingDoc = waitingDocuments[0] || null;

  // Filtered documents for the main table
  const filteredDocuments = useMemo(() => {
    return dokumenList.filter(d => {
      // 1. Tab filter
      if (activeTab === 'menunggu' && d.status !== 'menunggu_verifikasi') return false;
      if (activeTab === 'lolos' && d.status !== 'lolos_admin' && d.status !== 'lolos_pimpinan') return false;
      if (activeTab === 'selesai' && d.status !== 'terverifikasi') return false;
      if (activeTab === 'revisi' && d.status !== 'revisi') return false;

      // 2. Kategori filter
      if (selectedKategori !== 'all' && d.kategori !== selectedKategori) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (d.judul || '').toLowerCase().includes(q);
        const matchNomor = (d.nomor_laporan || '').toLowerCase().includes(q);
        const matchStaff = (d.uploaded_by || '').toLowerCase().includes(q);
        const matchKategori = (d.kategori || '').toLowerCase().includes(q);
        if (!matchTitle && !matchNomor && !matchStaff && !matchKategori) return false;
      }

      return true;
    });
  }, [dokumenList, activeTab, selectedKategori, searchQuery]);

  const calculatePercent = (val: number, total: number) => {
    if (!total || total === 0) return 0;
    return Math.min(100, Math.round((val / total) * 100));
  };

  const totalAllDocs = stats?.totalDokumen || dokumenList.length || 0;
  const countMenunggu = stats?.menunggu ?? waitingDocuments.length;
  const countLolos = stats?.lolosAdmin ?? dokumenList.filter(d => d.status === 'lolos_admin' || d.status === 'lolos_pimpinan').length;
  const countSelesai = stats?.terverifikasi ?? dokumenList.filter(d => d.status === 'terverifikasi').length;
  const countRevisi = stats?.revisi ?? dokumenList.filter(d => d.status === 'revisi').length;

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500">Memuat data Dashboard Pimpinan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* ====================================================================
          1. ALERT / SPOTLIGHT NOTICE BANNER (MIRRORS STAFF BANNER AESTHETIC)
          ==================================================================== */}
      {countMenunggu > 0 ? (
        <section className="alert-banner-amber flex-wrap sm:flex-nowrap gap-4 shadow-sm border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-50 to-indigo-50/40">
          <div className="alert-banner-left">
            <div className="alert-icon-circle bg-amber-500 text-white shrink-0 shadow-xs">
              <Clock4 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="alert-banner-title text-amber-950 font-extrabold flex items-center gap-2">
                <span className="alert-banner-badge bg-amber-600 text-white font-black px-2.5 py-0.5 rounded-full text-xs">
                  {countMenunggu}
                </span>
                Dokumen Laporan Menunggu Verifikasi & Persetujuan Anda
              </h3>
              <p className="alert-banner-desc text-amber-900/90 text-xs sm:text-sm mt-1">
                Staff Satker telah mengajukan berkas pertanggungjawaban yang memerlukan pemeriksaan kesesuaian fisik dokumen dan rekonsiliasi saldo sebelum diloloskan ke Eselon 1.
              </p>
            </div>
          </div>
          <Link
            href="/pimpinan/dokumen"
            className="btn btn-sm text-white bg-amber-600 hover:bg-amber-700 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 shadow-sm transition-all transform hover:scale-[1.02]"
          >
            <span>Tinjau Antrean Sekarang</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      ) : (
        <section className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-emerald-950 font-bold text-sm sm:text-base">
                Seluruh Berkas Telah Terverifikasi
              </h3>
              <p className="text-emerald-800 text-xs mt-0.5">
                Tidak ada dokumen yang tertunda di meja verifikasi Anda. Semua pengajuan telah diteruskan ke Eselon 1 atau selesai.
              </p>
            </div>
          </div>
          <Link
            href="/pimpinan/dokumen"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Kelola Dokumen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      )}

      {/* ====================================================================
          2. METRIC HERO CARDS (AUTHORITATIVE 4-CARD METRIC GRID)
          ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Card 1: Menunggu Approval Pimpinan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] border-l-4 border-l-amber-500 hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-md">
                Menunggu Pimpinan
              </span>
              <h3 className="text-3xl font-black text-slate-800 mt-2 tracking-tight">
                {countMenunggu}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Perlu ditinjau & diverifikasi</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shadow-xs">
              <Clock4 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2: Menunggu Eselon 1 (Lolos Pimpinan) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] border-l-4 border-l-blue-500 hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                Menunggu Eselon 1
              </span>
              <h3 className="text-3xl font-black text-slate-800 mt-2 tracking-tight">
                {countLolos}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Lolos seleksi pimpinan</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-xs">
              <Send className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Terverifikasi / Selesai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] border-l-4 border-l-emerald-500 hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                Terverifikasi Selesai
              </span>
              <h3 className="text-3xl font-black text-slate-800 mt-2 tracking-tight">
                {countSelesai}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Sah & dipublikasikan</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 4: Perlu Revisi Staff */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] border-l-4 border-l-rose-500 hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-md">
                Dalam Proses Revisi
              </span>
              <h3 className="text-3xl font-black text-slate-800 mt-2 tracking-tight">
                {countRevisi}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Dikembalikan ke Staff</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform shadow-xs">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
          </div>
        </div>

      </div>

      {/* ====================================================================
          3. MAIN SECTION: 2-COLUMN GRID (DASHBOARD-GRID LIKE STAFF)
          ==================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* --- KOLOM KIRI (2 SPAN): SPOTLIGHT ANTREAN & TABEL DOKUMEN --- */}
        <div className="xl:col-span-2 space-y-6">

          {/* Quick Review Spotlight Card (Jika ada antrean menunggu) */}
          {topPendingDoc && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5" /> Antrean Teratas Memerlukan Tindakan
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {topPendingDoc.nomor_laporan ? `#${topPendingDoc.nomor_laporan}` : 'Laporan Baru'}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-white tracking-tight line-clamp-1 mb-1">
                {topPendingDoc.judul}
              </h2>
              <p className="text-xs text-slate-300 mb-4">
                Kategori: <strong className="text-white">{topPendingDoc.kategori}</strong> • Tahun {topPendingDoc.tahun} • Diajukan oleh <strong className="text-white">{topPendingDoc.uploaded_by}</strong>
              </p>

              {/* Rekonsiliasi Nominal Strip */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-3 mb-5">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nilai Rekening Koran:</span>
                    <strong className="text-white font-semibold text-sm">
                      {formatRupiah(topPendingDoc.nilai_rekening_koran)}
                    </strong>
                  </div>
                  <div className="h-7 w-px bg-slate-700" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nilai Realisasi LPJ:</span>
                    <strong className="text-white font-semibold text-sm">
                      {formatRupiah(topPendingDoc.nilai_excel)}
                    </strong>
                  </div>
                </div>

                {topPendingDoc.nilai_rekening_koran != null && topPendingDoc.nilai_excel != null && (
                  Math.abs(Number(topPendingDoc.nilai_rekening_koran) - Number(topPendingDoc.nilai_excel)) === 0 ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Rekonsiliasi Cocok (Rp 0)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Selisih Rp {Math.abs(Number(topPendingDoc.nilai_rekening_koran) - Number(topPendingDoc.nilai_excel)).toLocaleString('id-ID')}
                    </span>
                  )
                )}
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-slate-400">
                  Format berkas: <strong>{topPendingDoc.file_nama?.split('.').pop()?.toUpperCase()}</strong> • {(topPendingDoc.file_size / (1024 * 1024)).toFixed(1)} MB
                </span>
                <Link
                  href="/pimpinan/dokumen"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all transform hover:scale-[1.02]"
                >
                  <Eye className="w-4 h-4" />
                  <span>Tinjau Dokumen Ini di Panel Verifikasi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* TABEL DAFTAR DOKUMEN & ANTREAN VERIFIKASI (STAFF CARD STYLE) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">

            {/* Header & Filter Controls */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Antrean & Pengajuan Dokumen Satker</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Pantau status berkas, rekonsiliasi nominal, dan persetujuan bertingkat.</p>
                </div>
                <Link
                  href="/pimpinan/dokumen"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Buka Layar Verifikasi Lengkap</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Status Tab Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 mb-4 scrollbar-none">
                <button
                  onClick={() => setActiveTab('all')}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                    activeTab === 'all' ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  Semua ({dokumenList.length})
                </button>
                <button
                  onClick={() => setActiveTab('menunggu')}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
                    activeTab === 'menunggu' ? "bg-amber-600 text-white shadow-xs" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                  )}
                >
                  <span>Menunggu Pimpinan</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-black">{countMenunggu}</span>
                </button>
                <button
                  onClick={() => setActiveTab('lolos')}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
                    activeTab === 'lolos' ? "bg-blue-600 text-white shadow-xs" : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                  )}
                >
                  <span>Menunggu Eselon 1</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-black">{countLolos}</span>
                </button>
                <button
                  onClick={() => setActiveTab('selesai')}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                    activeTab === 'selesai' ? "bg-emerald-600 text-white shadow-xs" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  )}
                >
                  Terverifikasi Selesai ({countSelesai})
                </button>
                <button
                  onClick={() => setActiveTab('revisi')}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                    activeTab === 'revisi' ? "bg-rose-600 text-white shadow-xs" : "bg-rose-50 text-rose-800 hover:bg-rose-100"
                  )}
                >
                  Perlu Revisi ({countRevisi})
                </button>
              </div>

              {/* Search & Kategori Toolbar */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari judul dokumen, nomor, atau staff..."
                    className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedKategori}
                    onChange={e => setSelectedKategori(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Semua Kategori</option>
                    {kategoriList.map(k => (
                      <option key={k.id} value={k.nama}>{k.nama}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabel Konten */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[11px]">
                    <th className="px-6 py-3.5">Dokumen & Tracking</th>
                    <th className="px-4 py-3.5">Kategori / Periode</th>
                    <th className="px-4 py-3.5">Staff Pengaju</th>
                    <th className="px-4 py-3.5">Nilai Rekonsiliasi</th>
                    <th className="px-4 py-3.5">Status Alur</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="font-semibold text-slate-600">Tidak ada dokumen yang sesuai kriteria</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau tab filter di atas.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDocuments.map(dok => {
                      const cfg = statusConfig[dok.status] || {
                        label: dok.status,
                        badgeClass: 'staff-badge-draft',
                        color: 'bg-slate-100 text-slate-700 border-slate-300'
                      };

                      const hasBoth = dok.nilai_rekening_koran != null && dok.nilai_excel != null;
                      const selisih = hasBoth ? Math.round(Math.abs(Number(dok.nilai_rekening_koran) - Number(dok.nilai_excel)) * 100) / 100 : null;
                      const isCocok = hasBoth && selisih === 0;

                      return (
                        <tr key={dok.id} className="hover:bg-slate-50/60 transition-colors group">
                          {/* Dokumen & Tracking */}
                          <td className="px-6 py-4 max-w-[280px]">
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1" title={dok.judul}>
                              {dok.judul}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              {dok.nomor_laporan ? (
                                <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  #{dok.nomor_laporan}
                                </span>
                              ) : null}
                              <span>{dok.file_nama}</span>
                              <span>•</span>
                              <span>{(dok.file_size / (1024 * 1024)).toFixed(1)} MB</span>
                            </div>
                          </td>

                          {/* Kategori & Periode */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-700 block">{dok.kategori}</span>
                            <span className="text-[11px] text-slate-400">Tahun {dok.tahun}</span>
                          </td>

                          {/* Staff Pengaju */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-[10px] border border-slate-200">
                                {(dok.uploaded_by || 'U').substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-700">{dok.uploaded_by}</span>
                            </div>
                          </td>

                          {/* Nilai Rekonsiliasi */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            {dok.nilai_rekening_koran != null || dok.nilai_excel != null ? (
                              <div className="space-y-0.5">
                                {dok.nilai_rekening_koran != null && (
                                  <div className="text-[11px] text-emerald-800 font-bold">
                                    <span className="text-slate-400 font-normal">Rek:</span> {formatRupiah(dok.nilai_rekening_koran)}
                                  </div>
                                )}
                                {hasBoth && (
                                  isCocok ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                      ✓ Cocok
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                                      ⚠ Selisih Rp {selisih?.toLocaleString('id-ID')}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* Status Workflow */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={clsx('staff-status-badge', cfg.badgeClass)}>
                              <span className="dot" />
                              <span>{cfg.label}</span>
                            </span>
                          </td>

                          {/* Aksi */}
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <Link
                                href="/pimpinan/dokumen"
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                                title="Tinjau & Verifikasi Dokumen"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Tinjau</span>
                              </Link>
                              {dok.file_nama && (
                                <a
                                  href={`${API}/dokumen/${dok.id}/download`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                                  title="Download Berkas"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Tabel */}
            <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan {filteredDocuments.length} dari {dokumenList.length} total pengajuan</span>
              <div className="flex items-center gap-2">
                <Link
                  href="/pimpinan/dokumen"
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                >
                  <span>Buka Semua Dokumen</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* --- KOLOM KANAN (1 SPAN): RINGKASAN STATUS, USER ONLINE & TIMELINE --- */}
        <div className="space-y-6">

          {/* KARTU RINGKASAN STATUS DOKUMEN (STAFF CARD STYLE) */}
          <div className="staff-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)]">
            <div className="staff-card-header mb-4 flex items-center justify-between">
              <div>
                <h3 className="staff-card-title text-base font-bold text-slate-900">Ringkasan Dokumen Satker</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Distribusi status verifikasi tahun berjalan</p>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                T.A. 2026
              </span>
            </div>

            {/* Stat Hero Counter Box */}
            <div className="staff-stat-hero bg-slate-50/80 p-4 rounded-xl border border-slate-200/60 mb-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Berkas Laporan
                </span>
                <div className="staff-stat-hero-number text-2xl font-black text-slate-900 mt-0.5">
                  {totalAllDocs}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            {/* Progress Bars Breakdown */}
            <div className="space-y-4">
              {/* Selesai / Terverifikasi */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Terverifikasi (Selesai)
                  </span>
                  <span className="font-extrabold text-slate-800">{countSelesai}</span>
                </div>
                <div className="staff-progress-bg bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="staff-progress-fill bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${calculatePercent(countSelesai, totalAllDocs)}%` }}
                  />
                </div>
              </div>

              {/* Menunggu Verifikasi Pimpinan */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Menunggu Pimpinan
                  </span>
                  <span className="font-extrabold text-amber-700">{countMenunggu}</span>
                </div>
                <div className="staff-progress-bg bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="staff-progress-fill bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${calculatePercent(countMenunggu, totalAllDocs)}%` }}
                  />
                </div>
              </div>

              {/* Menunggu Eselon 1 */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Menunggu Eselon 1
                  </span>
                  <span className="font-extrabold text-blue-700">{countLolos}</span>
                </div>
                <div className="staff-progress-bg bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="staff-progress-fill bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${calculatePercent(countLolos, totalAllDocs)}%` }}
                  />
                </div>
              </div>

              {/* Perlu Perbaikan (Revisi) */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Dalam Proses Revisi
                  </span>
                  <span className="font-extrabold text-rose-700">{countRevisi}</span>
                </div>
                <div className="staff-progress-bg bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="staff-progress-fill bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${calculatePercent(countRevisi, totalAllDocs)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* KARTU PENGGUNA ONLINE SATKER */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Staff Satker Aktif</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {onlineUsers.length} Online
              </span>
            </div>

            {onlineUsers.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Tidak ada staff online saat ini.</p>
            ) : (
              <div className="space-y-3">
                {onlineUsers.slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] border border-slate-200">
                          {u.nama.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border border-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-1">{u.nama}</p>
                        <p className="text-[10px] text-slate-400">@{u.username}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">
                      {u.last_active_at ? new Date(u.last_active_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Aktif'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KARTU PANDUAN PIMPINAN (STYLE MATCHING STAFF GUIDE CARD) */}
          <div className="staff-card staff-guide-card rounded-2xl p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border border-slate-700/80 shadow-md">
            <div className="staff-guide-card-icon w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">Pedoman Verifikasi v2.4</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Panduan standar operasional verifikasi dokumen keuangan, validasi bukti fisik rekonsiliasi bank, dan tata kelola persetujuan satker.
            </p>
            <button
              onClick={() => toast.success('Memulai unduh Pedoman Verifikasi Pimpinan (PDF)...')}
              className="staff-btn staff-btn-sm staff-btn-primary w-full bg-white/15 hover:bg-white/25 text-white border-white/20 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Dokumen Panduan (PDF)</span>
            </button>
          </div>

          {/* KARTU RIWAYAT AKTIVITAS TERKINI (ACTIVITY TIMELINE) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Riwayat Aktivitas Terkini</h3>
              <button onClick={fetchData} className="text-slate-400 hover:text-slate-600 p-1" title="Muat Ulang">
                <RefreshCw className={clsx("w-3.5 h-3.5", loading && "animate-spin")} />
              </button>
            </div>
            <div className="max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
              <ActivityTimeline logs={logs} meta={logMeta} onPageChange={setLogPage} loading={loading} />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
