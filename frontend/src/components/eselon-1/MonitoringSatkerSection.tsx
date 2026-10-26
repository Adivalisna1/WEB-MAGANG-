'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getSession } from '@/lib/auth';
import toast from 'react-hot-toast';
import {
  Building2, CheckCircle2, AlertCircle, Clock, Search,
  Calendar, RefreshCw, FileText, ExternalLink, Download,
  Send, X, ChevronLeft, ChevronRight, Copy, Check,
  AlertTriangle, ShieldCheck, Mail, User, Eye, ArrowUpDown
} from 'lucide-react';
import clsx from 'clsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface KontakUser {
  nama?: string | null;
  username?: string | null;
  email?: string | null;
}

interface DokumenItem {
  id: number;
  judul: string;
  status: string;
  tahun: number;
  bulan: number | null;
  nomor_laporan: string | null;
  file_nama: string;
  file_path: string;
  file_size: number | null;
  file_mime: string | null;
  nilai_excel: number;
  nilai_rekening_koran: number;
  kategori: string;
  created_at: string | null;
}

interface SatkerMonitoringItem {
  id: number;
  no_satker: number | string;
  nama: string;
  eselon_1_id: number;
  eselon_nama?: string;
  eselon_singkatan?: string;
  status: 'sudah' | 'belum';
  total_dokumen: number;
  terakhir_upload: string | null;
  dokumen_terakhir_judul?: string | null;
  dokumen_list: DokumenItem[];
  global_last_upload?: string | null;
  kontak: KontakUser;
}

interface MonitoringSummary {
  total_satker: number;
  sudah_melampirkan: number;
  belum_mengumpulkan: number;
  persentase_kepatuhan: number;
  periode_aktif: string;
  available_periods: string[];
}

const STATUS_BADGE: Record<string, string> = {
  terverifikasi:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  menunggu_verifikasi: 'bg-amber-50 text-amber-700 border-amber-200',
  lolos_admin:         'bg-blue-50 text-blue-700 border-blue-200',
  revisi:              'bg-rose-50 text-rose-700 border-rose-200',
  draft:               'bg-slate-50 text-slate-600 border-slate-200',
};

const STATUS_LABEL: Record<string, string> = {
  terverifikasi:       'Terverifikasi',
  menunggu_verifikasi: 'Menunggu Verifikasi',
  lolos_admin:         'Menunggu Eselon 1',
  revisi:              'Perlu Revisi',
  draft:               'Draft Pengajuan',
};

function formatRupiah(val: number | null | undefined): string {
  if (val == null || val === 0) return '—';
  const ribuan = Math.round(val).toLocaleString('id-ID');
  return `Rp ${ribuan}`;
}

function formatDate(isoStr: string | null | undefined): string {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoStr;
  }
}

export default function MonitoringSatkerSection() {
  const [data, setData] = useState<SatkerMonitoringItem[]>([]);
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Controls
  const [selectedPeriode, setSelectedPeriode] = useState<string>('');
  const [tabFilter, setTabFilter] = useState<'all' | 'sudah' | 'belum'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [selectedSatker, setSelectedSatker] = useState<SatkerMonitoringItem | null>(null);
  const [isReminding, setIsReminding] = useState(false);
  const [remindSuccessMessage, setRemindSuccessMessage] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchMonitoring = useCallback(async (periodeOverride?: string) => {
    try {
      setLoading(true);
      const session = getSession();
      const periodeParam = periodeOverride !== undefined ? periodeOverride : selectedPeriode;
      const url = new URL(`${API}/eselon-1/monitoring-satker`);
      if (periodeParam) url.searchParams.set('periode', periodeParam);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal memuat monitoring dokumen satker');

      setData(json.data || []);
      setSummary(json.summary || null);
      if (!selectedPeriode && json.summary?.periode_aktif) {
        setSelectedPeriode(json.summary.periode_aktif);
      }
      setError('');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
      toast.error(err.message || 'Gagal memuat monitoring satker');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriode]);

  useEffect(() => {
    fetchMonitoring();
  }, [fetchMonitoring]);

  const handlePeriodeChange = (newPeriode: string) => {
    setSelectedPeriode(newPeriode);
    setCurrentPage(1);
    fetchMonitoring(newPeriode);
  };

  const handleCopyCode = (code: string | number) => {
    const text = String(code);
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success(`Kode Satker ${text} disalin`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered Satker List (Tab + Search)
  const filteredSatkers = useMemo(() => {
    return data.filter((s) => {
      // 1. Tab filter (sudah / belum)
      if (tabFilter !== 'all' && s.status !== tabFilter) {
        return false;
      }
      // 2. Search query (NO_Satker or Nama)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = String(s.no_satker).toLowerCase().includes(q);
        const matchName = s.nama.toLowerCase().includes(q);
        if (!matchCode && !matchName) return false;
      }
      return true;
    });
  }, [data, tabFilter, searchQuery]);

  // Pagination calculation
  const totalItems = filteredSatkers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedSatkers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSatkers.slice(start, start + pageSize);
  }, [filteredSatkers, currentPage, pageSize]);

  // Send Reminder to Satker
  const handleSendReminder = async (satkerId: number) => {
    try {
      setIsReminding(true);
      const session = getSession();
      const periodeTarget = summary?.periode_aktif || selectedPeriode || 'periode aktif';
      const res = await fetch(`${API}/eselon-1/monitoring-satker/remind/${satkerId}?periode=${encodeURIComponent(periodeTarget)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.token}`,
          'Content-Type': 'application/json'
        }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || json.message || 'Gagal mengirim pengingat');

      setRemindSuccessMessage(json.message || 'Pengingat berhasil dikirim ke Satker');
      toast.success('Pengingat berhasil dikirim ke akun Satker!');
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat mengirim pengingat');
    } finally {
      setIsReminding(false);
    }
  };

  // Open Document file
  const handleOpenFile = (filePath: string, fileNama: string, docId?: number) => {
    const session = getSession();
    if (docId) {
      const url = `${API}/dokumen/${docId}/preview?token=${session?.token}`;
      window.open(url, '_blank');
    } else if (filePath.startsWith('/api/')) {
      window.open(filePath, '_blank');
    } else {
      window.open(`${API}/pencatatan/file/${filePath.replace('akuntansi/', '')}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden transition-all duration-200">
      {/* ── SECTION HEADER ── */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <Building2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold tracking-wider uppercase text-blue-700">
                Fitur Monitoring Dokumen Satker
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Monitoring Kepatuhan Dokumen Satker Binaan
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Pantau kelengkapan, riwayat pengumpulan, serta status belum melampirkan berkas per periode.
            </p>
          </div>

          {/* Filter Periode Picker & Refresh */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <label htmlFor="periode-select" className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0">
                Periode:
              </label>
              <select
                id="periode-select"
                value={selectedPeriode}
                onChange={(e) => handlePeriodeChange(e.target.value)}
                className="text-xs font-semibold text-slate-900 bg-transparent border-none focus:outline-hidden focus:ring-0 cursor-pointer pr-4"
              >
                {summary?.available_periods && summary.available_periods.length > 0 ? (
                  summary.available_periods.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))
                ) : (
                  <option value={selectedPeriode || 'Oktober 2026'}>
                    {selectedPeriode || 'Oktober 2026'}
                  </option>
                )}
              </select>
            </div>

            <button
              onClick={() => fetchMonitoring()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-xl border border-slate-200 transition-colors shadow-xs disabled:opacity-50"
              title="Perbarui Data Monitoring"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin text-blue-600')} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ── 4 KPI SUMMARY CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
          {/* Card 1: Total Satker */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Satker Binaan
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {summary?.total_satker ?? data.length}
              </span>
              <span className="text-xs font-semibold text-slate-400">Satker</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Dinaungi oleh unit Eselon 1</p>
          </div>

          {/* Card 2: Sudah Melampirkan Dokumen (Fitur 2) */}
          <div 
            onClick={() => { setTabFilter('sudah'); setCurrentPage(1); }}
            className={clsx(
              "p-4 rounded-xl border transition-all cursor-pointer shadow-2xs",
              tabFilter === 'sudah' 
                ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20" 
                : "bg-white border-slate-200/90 hover:border-emerald-200 hover:bg-emerald-50/30"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Sudah Melampirkan
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-extrabold text-emerald-700 tracking-tight">
                {summary?.sudah_melampirkan ?? 0}
              </span>
              <span className="text-xs font-semibold text-emerald-600">Satker</span>
            </div>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium">
              Periode {summary?.periode_aktif || selectedPeriode}
            </p>
          </div>

          {/* Card 3: Belum Mengumpulkan Dokumen (Fitur 3) */}
          <div 
            onClick={() => { setTabFilter('belum'); setCurrentPage(1); }}
            className={clsx(
              "p-4 rounded-xl border transition-all cursor-pointer shadow-2xs",
              tabFilter === 'belum' 
                ? "bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20" 
                : "bg-white border-slate-200/90 hover:border-rose-200 hover:bg-rose-50/30"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                Belum Mengumpulkan
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-extrabold text-rose-700 tracking-tight">
                {summary?.belum_mengumpulkan ?? 0}
              </span>
              <span className="text-xs font-semibold text-rose-600">Satker</span>
            </div>
            <p className="text-[11px] text-rose-600 mt-1 font-medium">Perlu ditindaklanjuti Eselon 1</p>
          </div>

          {/* Card 4: Tingkat Kepatuhan */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Tingkat Kepatuhan
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-extrabold text-blue-600 tracking-tight">
                {summary?.persentase_kepatuhan ?? 0}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary?.persentase_kepatuhan || 0)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR: TABS FILTER & SEARCH ── */}
      <div className="p-4 md:px-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Quick Filter Tabs */}
        <div className="inline-flex p-1 bg-slate-200/70 rounded-xl shrink-0">
          <button
            onClick={() => { setTabFilter('all'); setCurrentPage(1); }}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              tabFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <span>Semua Satker</span>
            <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-[10px] text-slate-700 font-bold">
              {summary?.total_satker ?? data.length}
            </span>
          </button>

          <button
            onClick={() => { setTabFilter('sudah'); setCurrentPage(1); }}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              tabFilter === 'sudah'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sudah Melampirkan</span>
            <span className={clsx(
              "px-1.5 py-0.2 rounded-md text-[10px] font-bold",
              tabFilter === 'sudah' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
            )}>
              {summary?.sudah_melampirkan ?? 0}
            </span>
          </button>

          <button
            onClick={() => { setTabFilter('belum'); setCurrentPage(1); }}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              tabFilter === 'belum'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-700'
            )}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Belum Mengumpulkan</span>
            <span className={clsx(
              "px-1.5 py-0.2 rounded-md text-[10px] font-bold",
              tabFilter === 'belum' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
            )}>
              {summary?.belum_mengumpulkan ?? 0}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Cari Kode atau Nama Satker..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium">Memuat data monitoring satker...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl text-sm font-medium">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          </div>
        ) : paginatedSatkers.length === 0 ? (
          <div className="text-center py-20 px-4">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Tidak Ada Data Satker yang Cocok</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tidak ditemukan satker dengan filter atau kata kunci pencarian &quot;{searchQuery}&quot;.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 text-center w-12">No</th>
                <th className="py-3 px-4 w-36">Kode Satker</th>
                <th className="py-3 px-4">Nama Satker Binaan</th>
                <th className="py-3 px-4 w-44">Status Dokumen</th>
                <th className="py-3 px-4 w-52">Terakhir Upload</th>
                <th className="py-3 px-4 text-right w-48">Aksi Monitoring</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedSatkers.map((satker, idx) => {
                const rowNo = (currentPage - 1) * pageSize + idx + 1;
                const isSudah = satker.status === 'sudah';

                return (
                  <tr
                    key={satker.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* No */}
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                      {rowNo}
                    </td>

                    {/* Kode Satker */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors">
                        <span className="font-mono font-bold text-slate-800 tracking-wider">
                          {satker.no_satker}
                        </span>
                        <button
                          onClick={() => handleCopyCode(satker.no_satker)}
                          className="text-slate-400 hover:text-slate-700 transition-colors"
                          title="Salin Kode Satker"
                        >
                          {copiedCode === String(satker.no_satker) ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Nama Satker */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {satker.nama}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        {satker.kontak?.nama && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {satker.kontak.nama}
                          </span>
                        )}
                        {satker.eselon_singkatan && (
                          <span>&bull; {satker.eselon_singkatan}</span>
                        )}
                      </div>
                    </td>

                    {/* Status Dokumen */}
                    <td className="py-3.5 px-4">
                      {isSudah ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Sudah ({satker.total_dokumen} Berkas)</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Belum Mengumpulkan</span>
                        </div>
                      )}
                    </td>

                    {/* Terakhir Upload */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {isSudah ? (
                        <div>
                          <p className="font-semibold text-slate-800 text-[11px]">
                            {formatDate(satker.terakhir_upload)}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]" title={satker.dokumen_terakhir_judul || undefined}>
                            {satker.dokumen_terakhir_judul || 'Bukti Dokumen'}
                          </p>
                        </div>
                      ) : (
                        <div>
                          {satker.global_last_upload ? (
                            <span className="text-[11px] text-slate-500" title="Pernah upload di periode lain">
                              Pernah upload: {formatDate(satker.global_last_upload).split(',')[0]}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Belum pernah upload
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Tombol Aksi Monitoring di Samping Nama Satker */}
                    <td className="py-3.5 px-4 text-right">
                      {isSudah ? (
                        <button
                          onClick={() => { setSelectedSatker(satker); setRemindSuccessMessage(''); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all shadow-2xs hover:shadow-xs active:scale-95"
                          title="Lihat rincian dokumen yang dilampirkan satker"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Lihat Dokumen</span>
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                            {satker.total_dokumen}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => { setSelectedSatker(satker); setRemindSuccessMessage(''); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all shadow-2xs hover:shadow-xs active:scale-95"
                          title="Cek status satker yang belum mengumpulkan dokumen"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Cek Status</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── PAGINATION & FOOTER ── */}
      {!loading && filteredSatkers.length > 0 && (
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Menampilkan <strong>{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</strong> -{' '}
              <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> dari{' '}
              <strong>{totalItems}</strong> Satker
            </span>
            <div className="flex items-center gap-1.5">
              <span>Per halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Halaman Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================================================================
           MODAL DETAIL MONITORING SATKER (KETIKA TOMBOL DIKLIK)
           Menangani Kasus 2 (Sudah Melampirkan) & Kasus 3 (Belum Mengumpulkan)
           ================================================================ */}
      {selectedSatker && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedSatker(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={clsx(
              "p-5 md:p-6 border-b flex items-center justify-between",
              selectedSatker.status === 'sudah'
                ? "bg-gradient-to-r from-emerald-50 via-white to-blue-50 border-emerald-100"
                : "bg-gradient-to-r from-amber-50 via-white to-rose-50 border-amber-100"
            )}>
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs",
                  selectedSatker.status === 'sudah' ? "bg-emerald-600" : "bg-amber-600"
                )}>
                  {selectedSatker.status === 'sudah' ? (
                    <FileText className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                      Satker {selectedSatker.no_satker}
                    </span>
                    <span className={clsx(
                      "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                      selectedSatker.status === 'sudah'
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-rose-100 text-rose-800 border-rose-300"
                    )}>
                      {selectedSatker.status === 'sudah' ? 'Sudah Melampirkan' : 'Belum Mengumpulkan'}
                    </span>
                  </div>
                  <h3 className="text-base md:text-lg font-extrabold text-slate-900 mt-1 leading-snug">
                    {selectedSatker.nama}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Periode Monitoring: <strong>{summary?.periode_aktif || selectedPeriode}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSatker(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* KASUS 1: SATKER SUDAH MELAMPIRKAN DOKUMEN (FITUR #2) */}
              {selectedSatker.status === 'sudah' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Daftar Dokumen Dilampirkan ({selectedSatker.dokumen_list.length})
                      </h4>
                      <p className="text-xs text-slate-500">
                        Berkas laporan dan rekening koran yang telah diunggah untuk periode ini.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Status Lengkap
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedSatker.dokumen_list.map((doc, dIdx) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/20 transition-all shadow-2xs"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {doc.judul}
                              </span>
                              <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-bold border', STATUS_BADGE[doc.status] || 'bg-slate-100 text-slate-700')}>
                                {STATUS_LABEL[doc.status] || doc.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-slate-700">Kategori: {doc.kategori}</span>
                              <span>&bull;</span>
                              <span>Diunggah: {formatDate(doc.created_at)}</span>
                              {doc.nomor_laporan && (
                                <>
                                  <span>&bull;</span>
                                  <span className="font-mono text-indigo-600 font-semibold">
                                    No: {doc.nomor_laporan}
                                  </span>
                                </>
                              )}
                            </p>

                            {(doc.nilai_rekening_koran > 0 || doc.nilai_excel > 0) && (
                              <div className="flex items-center gap-3 pt-1 text-xs">
                                {doc.nilai_rekening_koran > 0 && (
                                  <span className="text-slate-600">
                                    Saldo Bank: <strong>{formatRupiah(doc.nilai_rekening_koran)}</strong>
                                  </span>
                                )}
                                {doc.nilai_excel > 0 && (
                                  <span className="text-slate-600">
                                    LPJ/Bukti Kas: <strong>{formatRupiah(doc.nilai_excel)}</strong>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Tombol Preview / Buka File */}
                          <div className="shrink-0 flex items-center gap-2">
                            <button
                              onClick={() => handleOpenFile(doc.file_path, doc.file_nama, doc.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-2xs"
                              title="Buka atau lihat berkas dokumen"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat File</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* KASUS 2: SATKER BELUM MENGUMPULKAN DOKUMEN (FITUR #3) */
                <div className="space-y-5">
                  {/* Banner Peringatan */}
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">
                        Satker Belum Melampirkan Dokumen
                      </h4>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        Hingga saat ini Satker <strong>{selectedSatker.nama}</strong> belum mengunggah berkas dokumen atau rekening koran untuk periode <strong>{summary?.periode_aktif || selectedPeriode}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Informasi Kontak & Identitas Satker */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Informasi Pengelola & Riwayat Satker
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Unit Pembina Eselon 1</span>
                        <p className="font-bold text-slate-800 mt-0.5">
                          {selectedSatker.eselon_nama || selectedSatker.eselon_singkatan || 'Ditjen Pembina'}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Kode Satker</span>
                        <p className="font-mono font-bold text-slate-800 mt-0.5">
                          {selectedSatker.no_satker}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Akun Pengelola / PIC</span>
                        <p className="font-semibold text-slate-800 mt-0.5">
                          {selectedSatker.kontak?.nama || 'Operator Satker'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Username: {selectedSatker.kontak?.username || '—'}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Riwayat Terakhir di Sistem</span>
                        <p className="font-semibold text-slate-800 mt-0.5">
                          {selectedSatker.global_last_upload
                            ? formatDate(selectedSatker.global_last_upload)
                            : 'Belum pernah ada riwayat unggahan'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Notifikasi */}
                  {remindSuccessMessage && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{remindSuccessMessage}</span>
                    </div>
                  )}

                  {/* Tindakan: Kirim Pengingat */}
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold text-blue-900">
                        Ingatkan Satker untuk Segera Melampirkan Dokumen
                      </h5>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        Kirim notifikasi pengingat resmi langsung ke lonceng notifikasi dan akun pengelola satker ini.
                      </p>
                    </div>

                    <button
                      onClick={() => handleSendReminder(selectedSatker.id)}
                      disabled={isReminding}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 shrink-0"
                    >
                      {isReminding ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengirim Pengingat...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Pengingat ke Satker</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedSatker(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
