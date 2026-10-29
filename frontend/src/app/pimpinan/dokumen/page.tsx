'use client';

import React, { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { getSession } from '@/lib/auth';
import {
  FileText, CheckCircle, XCircle, Clock,
  Loader2, RefreshCw, AlertCircle, Eye, ExternalLink, Download,
  Send, X, Search, FileCheck, FileSpreadsheet,
  ChevronLeft, ChevronRight, Maximize2, Printer,
  Filter, Check, AlertTriangle, ShieldCheck, UserCheck, Layers
} from 'lucide-react';
import clsx from 'clsx';
import '@/app/staff/staff.css';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

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
  catatan_oleh?: string | null;
  nilai_rekening_koran?: number | null;
  nilai_excel?: number | null;
}

interface Kategori {
  id: number;
  nama: string;
  slug: string;
}

const NAMA_BULAN = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function periodLabel(dok: Dokumen) {
  if (dok.semester) return `Sem ${dok.semester} ${dok.tahun}`;
  if (dok.bulan) return `${NAMA_BULAN[dok.bulan]} ${dok.tahun}`;
  return String(dok.tahun);
}

const statusConfig: Record<string, { label: string; badgeClass: string; dot: string; bg: string; text: string }> = {
  menunggu_verifikasi: { label: 'Menunggu Pimpinan', badgeClass: 'staff-badge-pimpinan', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-800' },
  lolos_pimpinan: { label: 'Menunggu Eselon 1', badgeClass: 'staff-badge-eselon', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-800' },
  lolos_admin: { label: 'Menunggu Eselon 1', badgeClass: 'staff-badge-eselon', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-800' },
  terverifikasi: { label: 'Terverifikasi (Selesai)', badgeClass: 'staff-badge-selesai', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-800' },
  revisi: { label: 'Perlu Revisi', badgeClass: 'staff-badge-revisi', dot: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-800' },
  draft: { label: 'Draft Staff', badgeClass: 'staff-badge-draft', dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-700' },
};

function DokumenContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const [dokumenList, setDokumenList] = useState<Dokumen[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'menunggu' | 'eselon' | 'selesai' | 'revisi'>('all');
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  const [processing, setProcessing] = useState<number | null>(null);

  const [selectedDok, setSelectedDok] = useState<Dokumen | null>(null);
  const [catatan, setCatatan] = useState('');
  const [editNilaiRek, setEditNilaiRek] = useState('');
  const [editNilaiExcel, setEditNilaiExcel] = useState('');
  const [rescanning, setRescanning] = useState(false);

  // Preview States
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewProgress, setPreviewProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [previewError, setPreviewError] = useState('');
  const [showBarModal, setShowBarModal] = useState(false);

  const isPdf = selectedDok ? /\.pdf$/i.test(selectedDok.file_nama) : false;
  const isExcel = selectedDok ? /\.(xls|xlsx)$/i.test(selectedDok.file_nama) : false;

  // Load Kategori options
  useEffect(() => {
    async function loadKategori() {
      try {
        const res = await fetch(`${API}/dokumen/kategori`);
        const data = await res.json();
        if (data.success && data.data) {
          setKategoriList(data.data);
        }
      } catch {
        // silent fallback
      }
    }
    loadKategori();
  }, []);

  // PDF Preview streaming loader
  useEffect(() => {
    if (!selectedDok) {
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
      setPreviewProgress(null);
      setPreviewError('');
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const session = getSession();

    if (isExcel) {
      setPreviewProgress(null);
      setPreviewError('');
      return;
    }

    async function loadPreview() {
      setPreviewProgress({ loaded: 0, total: 0 });
      setPreviewError('');
      try {
        const res = await fetch(`${API}/dokumen/${selectedDok!.id}/preview`, {
          headers: { Authorization: `Bearer ${session?.token}` },
          signal: controller.signal,
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          if (!cancelled) setPreviewError(`Gagal memuat: ${res.status} ${res.statusText} ${errText ? '- ' + errText : ''}`);
          return;
        }

        const reader = res.body?.getReader();
        const contentLength = +(res.headers.get('Content-Length') || 0);
        let loaded = 0;
        const chunks: Uint8Array[] = [];

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              loaded += value.length;
              if (!cancelled) setPreviewProgress({ loaded, total: contentLength });
            }
          }
        }

        const finalBlob = new Blob(chunks as unknown as BlobPart[], { type: res.headers.get('Content-Type') || 'application/pdf' });
        if (!cancelled) {
          setPreviewProgress({ loaded, total: contentLength || loaded });
          setTimeout(() => {
            if (!cancelled) {
              setPreviewUrl(prev => {
                if (prev) URL.revokeObjectURL(prev);
                return URL.createObjectURL(finalBlob);
              });
              setPreviewProgress(null);
            }
          }, 400);
        }
      } catch (err: any) {
        if (!cancelled && !controller.signal.aborted) setPreviewError(`Error koneksi: ${err.message}`);
      }
    }
    loadPreview();
    return () => { cancelled = true; controller.abort(); };
  }, [selectedDok, isExcel]);

  const handleDownload = () => {
    if (!selectedDok) return;
    const session = getSession();
    window.open(`${API}/dokumen/${selectedDok.id}/download?token=${session?.token}`, '_blank');
  };

  const handleSelect = useCallback((dok: Dokumen) => {
    setSelectedDok(dok);
    setCatatan(dok.catatan || '');
    const valRek = dok.nilai_rekening_koran != null ? dok.nilai_rekening_koran : dok.nilai_excel;
    setEditNilaiRek(valRek != null ? Number(valRek).toLocaleString('id-ID') : '');
    setEditNilaiExcel(dok.nilai_excel != null ? Number(dok.nilai_excel).toLocaleString('id-ID') : '');
  }, []);

  const fetchDokumen = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const session = getSession();
      // Mengambil SELURUH dokumen milik satker pimpinan
      const res = await fetch(`${API}/dokumen/all?limit=250`, {
        headers: { Authorization: `Bearer ${session?.token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal memuat dokumen');

      const docs: Dokumen[] = json.data || [];
      setDokumenList(docs);

      // Auto-select logic
      if (docs.length > 0) {
        if (initialId) {
          const targeted = docs.find(d => String(d.id) === String(initialId));
          if (targeted) {
            handleSelect(targeted);
            return;
          }
        }
        // Prioritaskan pilih dokumen yang sedang menunggu verifikasi jika ada
        const pendingDoc = docs.find(d => d.status === 'menunggu_verifikasi');
        if (pendingDoc) {
          handleSelect(pendingDoc);
        } else {
          handleSelect(docs[0]);
        }
      } else {
        setSelectedDok(null);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat mengambil data');
    } finally {
      setLoading(false);
    }
  }, [initialId, handleSelect]);

  useEffect(() => {
    fetchDokumen();
  }, [fetchDokumen]);

  // Status Counters
  const countMenunggu = useMemo(() => dokumenList.filter(d => d.status === 'menunggu_verifikasi').length, [dokumenList]);
  const countLolos = useMemo(() => dokumenList.filter(d => d.status === 'lolos_pimpinan' || d.status === 'lolos_admin').length, [dokumenList]);
  const countSelesai = useMemo(() => dokumenList.filter(d => d.status === 'terverifikasi').length, [dokumenList]);
  const countRevisi = useMemo(() => dokumenList.filter(d => d.status === 'revisi').length, [dokumenList]);

  // Filtered List
  const filteredDocs = useMemo(() => {
    return dokumenList.filter(d => {
      // Filter Status Tab
      if (activeTab === 'menunggu' && d.status !== 'menunggu_verifikasi') return false;
      if (activeTab === 'eselon' && d.status !== 'lolos_pimpinan' && d.status !== 'lolos_admin') return false;
      if (activeTab === 'selesai' && d.status !== 'terverifikasi') return false;
      if (activeTab === 'revisi' && d.status !== 'revisi') return false;

      // Filter Kategori
      if (selectedKategori !== 'all' && d.kategori !== selectedKategori) return false;

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = d.judul.toLowerCase().includes(q);
        const matchKategori = d.kategori?.toLowerCase().includes(q);
        const matchFile = d.file_nama?.toLowerCase().includes(q);
        const matchUploader = d.uploaded_by?.toLowerCase().includes(q);
        const matchNomor = d.nomor_laporan?.toLowerCase().includes(q);
        if (!matchTitle && !matchKategori && !matchFile && !matchUploader && !matchNomor) return false;
      }

      return true;
    });
  }, [dokumenList, activeTab, selectedKategori, search]);

  const handleRescan = async (id: number) => {
    setRescanning(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/${id}/rescan`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Gagal audit ulang berkas');

      if (data.data?.scan?.nominal != null) {
        const nomFormatted = Number(data.data.scan.nominal).toLocaleString('id-ID');
        if (!editNilaiRek) setEditNilaiRek(nomFormatted);
        if (!editNilaiExcel) setEditNilaiExcel(nomFormatted);
      }
      toast.success(data.message || 'Audit ulang berkas rekonsiliasi selesai');
      fetchDokumen();
    } catch (err: any) {
      toast.error(err.message || 'Gagal audit ulang berkas');
    } finally {
      setRescanning(false);
    }
  };

  const handleVerifikasi = async (id: number, action: 'lolos' | 'reject') => {
    if (action === 'reject' && !catatan.trim()) {
      toast.error('Catatan wajib diisi jika dokumen dikembalikan untuk revisi');
      return;
    }

    setProcessing(id);
    try {
      const session = getSession();
      const numRek = editNilaiRek ? Number(editNilaiRek.replace(/\./g, '').replace(/,/g, '.')) : null;
      const numExcel = editNilaiExcel ? Number(editNilaiExcel.replace(/\./g, '').replace(/,/g, '.')) : null;

      const bodyData: any = {
        aksi: action,
        catatan,
        nilai_rekening_koran: isNaN(numRek as any) ? null : numRek,
        nilai_excel: isNaN(numExcel as any) ? null : numExcel,
      };

      const res = await fetch(`${API}/dokumen/${id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`
        },
        body: JSON.stringify(bodyData)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal memproses verifikasi');

      toast.success(action === 'lolos' ? 'Dokumen berhasil disahkan & berstatus Terverifikasi' : 'Dokumen dikembalikan ke Staff untuk direvisi');
      await fetchDokumen();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] overflow-hidden">

      {/* HEADER UTAMA HALAMAN */}
      <div className="flex flex-wrap justify-between items-center mb-5 shrink-0 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#1E90FF]" />
            Dokumen Satker
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Kelola seluruh arsip dokumen satker, pantau status penelaahan, dan validasi pengajuan staf.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-xs">
            {dokumenList.length} Total Berkas
          </span>

          {countMenunggu > 0 ? (
            <span className="staff-status-badge staff-badge-pimpinan shadow-xs">
              <span className="dot" />
              {countMenunggu} Menunggu Verifikasi
            </span>
          ) : (
            <span className="staff-status-badge staff-badge-selesai shadow-xs">
              <span className="dot" />
              Semua Berkas Selesai Ditelaah
            </span>
          )}

          <button
            onClick={fetchDokumen}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Muat Ulang Data"
          >
            <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* WORKSPACE 2 KOLOM (KIRI: LIST ARSIP DOKUMEN, KANAN: PREVIEW & DETAIL/EVALUASI) */}
      <div className="flex flex-1 gap-5 min-h-0">

        {/* ========================================================= */}
        {/* PANEL KIRI: DAFTAR DOKUMEN & FILTER MULTI-STATUS */}
        {/* ========================================================= */}
        <div className="w-[410px] bg-white border border-slate-200/90 rounded-2xl flex flex-col shadow-xs shrink-0 overflow-hidden">
          
          {/* Header Panel Kiri: Tabs Status */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 shrink-0 space-y-2.5">
            {/* Tab Pill Selector */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
              <button
                onClick={() => setActiveTab('all')}
                className={clsx(
                  "px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1.5",
                  activeTab === 'all'
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Semua
                <span className={clsx("text-[10px] px-1.5 py-0.2 rounded-full", activeTab === 'all' ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700")}>
                  {dokumenList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('menunggu')}
                className={clsx(
                  "px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1.5",
                  activeTab === 'menunggu'
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-amber-800 hover:bg-amber-100/70 bg-amber-50"
                )}
              >
                Menunggu
                {countMenunggu > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
                <span className={clsx("text-[10px] px-1.5 py-0.2 rounded-full", activeTab === 'menunggu' ? "bg-white/20 text-white" : "bg-amber-200/80 text-amber-900")}>
                  {countMenunggu}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('eselon')}
                className={clsx(
                  "px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1.5",
                  activeTab === 'eselon'
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Di Eselon 1
                <span className={clsx("text-[10px] px-1.5 py-0.2 rounded-full", activeTab === 'eselon' ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700")}>
                  {countLolos}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('selesai')}
                className={clsx(
                  "px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1.5",
                  activeTab === 'selesai'
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Selesai
                <span className={clsx("text-[10px] px-1.5 py-0.2 rounded-full", activeTab === 'selesai' ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700")}>
                  {countSelesai}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('revisi')}
                className={clsx(
                  "px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 flex items-center gap-1.5",
                  activeTab === 'revisi'
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Revisi
                <span className={clsx("text-[10px] px-1.5 py-0.2 rounded-full", activeTab === 'revisi' ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700")}>
                  {countRevisi}
                </span>
              </button>
            </div>

            {/* Kotak Pencarian & Filter Kategori */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari judul, nomor, file..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                />
              </div>

              {kategoriList.length > 0 && (
                <select
                  value={selectedKategori}
                  onChange={e => setSelectedKategori(e.target.value)}
                  className="bg-white border border-slate-200 text-xs rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium max-w-[125px] shadow-2xs"
                >
                  <option value="all">Semua Jenis</option>
                  {kategoriList.map(k => (
                    <option key={k.id} value={k.nama}>{k.nama}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* List Kartu Dokumen */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar bg-slate-50/30">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xs text-slate-400 font-medium">Memuat dokumen satker...</span>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">Tidak ada dokumen ditemukan</p>
                <p className="text-xs text-slate-400 mt-1">
                  {search ? 'Coba kata kunci pencarian yang lain.' : 'Belum ada dokumen pada kategori atau tab ini.'}
                </p>
              </div>
            ) : (
              filteredDocs.map(dok => {
                const isActive = selectedDok?.id === dok.id;
                const cfg = statusConfig[dok.status] || statusConfig.draft;
                const isPending = dok.status === 'menunggu_verifikasi';

                // Rekonsiliasi badge preview
                const hasNomRek = dok.nilai_rekening_koran != null;
                const hasNomExc = dok.nilai_excel != null;
                const isMatch = hasNomRek && hasNomExc && Math.abs(Number(dok.nilai_rekening_koran) - Number(dok.nilai_excel)) === 0;
                const hasDiff = hasNomRek && hasNomExc && Math.abs(Number(dok.nilai_rekening_koran) - Number(dok.nilai_excel)) > 0;

                return (
                  <button
                    key={dok.id}
                    onClick={() => handleSelect(dok)}
                    className={clsx(
                      "w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2 relative overflow-hidden group",
                      isActive
                        ? "border-[#1E90FF] bg-blue-50/70 shadow-sm"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1E90FF]" />
                    )}

                    {/* Judul & Status Badge */}
                    <div className="flex justify-between items-start gap-2 w-full">
                      <p className={clsx(
                        "font-bold text-xs leading-snug line-clamp-2",
                        isActive ? "text-blue-950 font-extrabold" : "text-slate-800 group-hover:text-slate-900"
                      )}>
                        {dok.judul}
                      </p>

                      <span className={clsx(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 uppercase tracking-wider",
                        cfg.bg, cfg.text
                      )}>
                        <span className={clsx("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
                        {cfg.label.replace(' (Selesai)', '')}
                      </span>
                    </div>

                    {/* Metadata Kategori & Periode */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-600 truncate max-w-[190px]">
                        {dok.kategori} &bull; {periodLabel(dok)}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(dok.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    {/* Rekonsiliasi Pill & Pengunggah */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                      <span className="text-slate-400 truncate max-w-[170px]">
                        Oleh: <strong className="text-slate-600 font-medium">{dok.uploaded_by || 'Staff'}</strong>
                      </span>

                      {dok.nilai_rekening_koran != null || dok.nilai_excel != null ? (
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] border border-emerald-200/80">
                          Saldo Bank: Rp {Number(dok.nilai_rekening_koran || dok.nilai_excel).toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {dok.nomor_laporan || '-'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* PANEL KANAN: PREVIEW DOKUMEN & KONTROL TINJAUAN */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent rounded-2xl gap-4 overflow-y-auto pb-4 pr-1 custom-scrollbar">

          {selectedDok ? (
            <>
              {/* BOX PREVIEW DOKUMEN */}
              <div className="min-h-[460px] flex-1 bg-white border border-slate-200/90 rounded-2xl flex flex-col overflow-hidden shadow-xs relative">

                {/* Toolbar Preview */}
                <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={clsx(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      isExcel ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {isExcel ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[280px] md:max-w-md">
                        {selectedDok.file_nama}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {(selectedDok.file_size / 1024 / 1024).toFixed(2)} MB &bull; Diunggah oleh {selectedDok.uploaded_by}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs"
                      title="Unduh Berkas Asli"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Unduh</span>
                    </button>

                    {previewUrl && (
                      <button
                        onClick={() => window.open(previewUrl, '_blank')}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
                        title="Buka di Tab Baru"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Container Tampilan Preview */}
                <div className="flex-1 bg-slate-100/50 relative overflow-hidden flex items-center justify-center p-4">
                  {isExcel ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm w-full max-w-md text-center">
                      <FileSpreadsheet className="w-16 h-16 mb-4 text-emerald-500" />
                      <p className="font-bold text-slate-800 text-base">Format Spreadsheet (Excel)</p>
                      <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
                        Dokumen LPJ / Rekap dalam format Excel dapat langsung diunduh dan dibuka dengan aplikasi spreadsheet lokal.
                      </p>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl transition-all shadow-sm"
                      >
                        <Download className="w-4 h-4" /> Unduh File Excel Sekarang
                      </button>
                    </div>
                  ) : previewUrl ? (
                    <object
                      data={previewUrl}
                      type="application/pdf"
                      className="w-full h-full bg-white shadow-xs border border-slate-200 rounded-lg min-h-[380px]"
                    >
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                        <FileText className="w-10 h-10 text-slate-300" />
                        <p className="text-xs">Browser tidak dapat menampilkan embedded PDF langsung.</p>
                        <button
                          onClick={() => window.open(previewUrl, '_blank')}
                          className="text-xs text-blue-600 hover:underline font-bold"
                        >
                          Buka di Tab Baru
                        </button>
                      </div>
                    </object>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
                      {previewError ? (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center max-w-sm">
                          <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-1.5" />
                          <p className="text-xs font-bold text-rose-800">Preview Gagal Dimuat</p>
                          <p className="text-[11px] text-rose-600 mt-0.5">{previewError}</p>
                          <button
                            onClick={handleDownload}
                            className="mt-3 text-xs font-bold text-white bg-rose-600 px-3 py-1.5 rounded-lg"
                          >
                            Unduh File
                          </button>
                        </div>
                      ) : (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                          <p className="text-xs font-medium text-slate-600">
                            {previewProgress?.total
                              ? `Memuat preview... ${(previewProgress.loaded / 1048576).toFixed(1)} / ${(previewProgress.total / 1048576).toFixed(1)} MB`
                              : 'Menyiapkan berkas preview...'}
                          </p>
                          {previewProgress?.total ? (
                            <div className="w-56 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (previewProgress.loaded / previewProgress.total) * 100)}%` }}
                              />
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ========================================================= */}
              {/* BOX KONTROL: FORM EVALUASI (JIKA MENUNGGU) / INFO STATUS */}
              {/* ========================================================= */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs shrink-0">

                {selectedDok.status === 'menunggu_verifikasi' ? (
                  /* ======================================= */
                  /* MODE 1: VERIFIKASI PIMPINAN (AKTIF)     */
                  /* ======================================= */
                  <>
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 leading-none">
                            Formulir Penelaahan & Verifikasi Pimpinan
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Lakukan validasi data nominal dan tentukan persetujuan sebelum diteruskan ke Eselon 1.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRescan(selectedDok.id)}
                        disabled={rescanning}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/90 rounded-xl transition-all disabled:opacity-50 shadow-2xs"
                        title="Audit ulang berkas rekonsiliasi otomatis"
                      >
                        <RefreshCw className={clsx("w-3.5 h-3.5", rescanning && "animate-spin")} />
                        {rescanning ? 'Memindai...' : 'Audit Ulang Berkas'}
                      </button>
                    </div>

                    {/* Data Saldo Tunggal & Bukti Berkas Sah */}
                    <div className="space-y-4 mb-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                          <span>Total Saldo Akhir Rekening Bank (Rp)</span>
                          <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            ✓ Berkas Bukti Sah Terlampir
                          </span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-xs text-slate-400 font-bold">Rp</span>
                          <input
                            type="text"
                            value={editNilaiRek}
                            onChange={e => {
                              const val = e.target.value.replace(/[^0-9,]/g, '');
                              const parts = val.split(',');
                              if (parts.length > 2) return;
                              const ribuan = parts[0].replace(/\./g, '');
                              const formatted = ribuan ? Number(ribuan).toLocaleString('id-ID') : '';
                              setEditNilaiRek(parts.length === 2 ? `${formatted},${parts[1]}` : formatted);
                            }}
                            placeholder="0"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Nominal saldo kas riil pada rekening bank satker per penutupan periode pelaporan.
                        </p>
                      </div>

                      <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                        <FileCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-blue-950">Verifikasi Bukti Fisik Rekening Koran</p>
                          <p className="mt-0.5 text-blue-800 leading-relaxed text-[11px]">
                            Berkas dokumen <strong>{selectedDok.file_nama}</strong> bertindak sebagai bukti voucher fisik resmi. Pengesahan pimpinan langsung menetapkan status dokumen menjadi <strong>Terverifikasi</strong>.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Input Catatan */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-slate-700">Catatan Pimpinan</label>
                        <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                          Wajib diisi jika dikembalikan untuk revisi
                        </span>
                      </div>
                      <textarea
                        value={catatan}
                        onChange={e => setCatatan(e.target.value)}
                        rows={2}
                        placeholder="Tuliskan arahan persetujuan atau poin catatan perbaikan untuk staff satker..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVerifikasi(selectedDok.id, 'reject')}
                        disabled={processing === selectedDok.id || !catatan.trim()}
                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-rose-200 text-xs"
                      >
                        {processing === selectedDok.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        Tolak & Kembalikan (Revisi)
                      </button>

                      <button
                        onClick={() => handleVerifikasi(selectedDok.id, 'lolos')}
                        disabled={processing === selectedDok.id}
                        className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 text-xs shadow-sm shadow-emerald-600/20"
                      >
                        {processing === selectedDok.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Sahkan & Terbitkan Dokumen (Sah)
                      </button>
                    </div>
                  </>
                ) : (
                  /* ======================================= */
                  /* MODE 2: ARSIP / STATUS DOKUMEN LAINNYA */
                  /* ======================================= */
                  <>
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={clsx(
                          "w-7 h-7 rounded-lg flex items-center justify-center",
                          statusConfig[selectedDok.status]?.bg || "bg-slate-100",
                          statusConfig[selectedDok.status]?.text || "text-slate-700"
                        )}>
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 leading-none">
                            Status & Informasi Riwayat Dokumen
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Dokumen ini telah selesai diproses di tahap pimpinan.
                          </p>
                        </div>
                      </div>

                      <span className={clsx(
                        "staff-status-badge text-xs font-bold",
                        statusConfig[selectedDok.status]?.badgeClass || "staff-badge-draft"
                      )}>
                        <span className="dot" />
                        {statusConfig[selectedDok.status]?.label || selectedDok.status}
                      </span>
                    </div>

                    {/* Alert Penjelasan Status */}
                    {selectedDok.status === 'terverifikasi' && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5 mb-4">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-emerald-950">Dokumen Telah Disahkan Sepenuhnya (Terverifikasi)</p>
                          <p className="mt-0.5 text-emerald-700">
                            Pengajuan berkas telah diverifikasi dan disahkan oleh Pimpinan Satker. Berkas sah secara hukum dan tersimpan sebagai arsip aktif.
                          </p>
                        </div>
                      </div>
                    )}

                    {(selectedDok.status === 'lolos_pimpinan' || selectedDok.status === 'lolos_admin') && (
                      <div className="p-3.5 bg-blue-50 border border-blue-200/90 rounded-xl text-xs text-blue-800 flex items-start gap-2.5 mb-4">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-blue-950">Disahkan Satker / Siap Ditinjau Eselon 1</p>
                          <p className="mt-0.5 text-blue-700">
                            Dokumen telah disahkan oleh Satker dan siap ditinjau dalam pengawasan kepatuhan oleh unit Eselon 1.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedDok.status === 'revisi' && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200/90 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 mb-4">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-rose-950">Dalam Tahap Perbaikan (Revisi) oleh Staff</p>
                          <p className="mt-0.5 text-rose-700">
                            Dokumen ini dikembalikan ke Staff Satker untuk dilengkapi atau disesuaikan nominalnya sesuai catatan evaluasi.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Ringkasan Saldo Akhir Kas Bank & Bukti Voucher */}
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Total Saldo Akhir Rekening Bank
                        </span>
                        <span className="text-lg font-black text-slate-900 mt-1 block">
                          {(selectedDok.nilai_rekening_koran != null || selectedDok.nilai_excel != null)
                            ? `Rp ${Number(selectedDok.nilai_rekening_koran || selectedDok.nilai_excel).toLocaleString('id-ID')}`
                            : '-'}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Saldo kas riil per akhir periode berdasarkan mutasi bank
                        </p>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Bukti Fisik Rekening Koran
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-3 py-1 rounded-lg mt-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Bukti Sah Terverifikasi
                        </span>
                      </div>
                    </div>

                    {/* Catatan Riwayat jika ada */}
                    {selectedDok.catatan && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs mb-4">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                          <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>Catatan Riwayat Verifikasi:</span>
                        </div>
                        <p className="text-amber-800 font-medium whitespace-pre-wrap leading-relaxed">
                          "{selectedDok.catatan}"
                        </p>
                        {selectedDok.catatan_oleh && (
                          <span className="text-[10px] text-amber-600 mt-1.5 block font-semibold">
                            &mdash; Oleh: {selectedDok.catatan_oleh}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Aksi Tambahan */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setShowBarModal(true)}
                        className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                        title="Cetak Berita Acara Rekonsiliasi Resmi untuk Arsip Audit BPK/Itjen"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-700" />
                        Cetak Berita Acara (BAR)
                      </button>

                      <button
                        onClick={handleDownload}
                        className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Unduh Berkas
                      </button>

                      <button
                        onClick={() => handleRescan(selectedDok.id)}
                        disabled={rescanning}
                        className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className={clsx("w-3.5 h-3.5", rescanning && "animate-spin")} />
                        {rescanning ? 'Memindai...' : 'Audit Ulang Rekonsiliasi'}
                      </button>
                    </div>
                  </>
                )}

              </div>
            </>
          ) : (
            /* EMPTY STATE JIKA TIDAK ADA DOKUMEN */
            <div className="flex-1 bg-white border border-slate-200/90 border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-400 p-8 min-h-[450px]">
              <FileCheck className="w-16 h-16 mb-4 text-slate-300" />
              <p className="font-extrabold text-slate-700 text-lg">Pilih Dokumen dari Daftar</p>
              <p className="text-xs text-slate-500 mt-1.5 max-w-sm text-center leading-relaxed">
                Pilih salah satu berkas dokumen satker di sebelah kiri untuk melihat preview dokumen PDF, memvalidasi bukti transaksi, dan mengevaluasi status pengajuan.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* MODAL CETAK BERITA ACARA REKONSILIASI (BAR) RESMI PEMERINTAH */}
      {showBarModal && selectedDok && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 border border-slate-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-800">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-800">Pratinjau Berita Acara Rekonsiliasi (BAR)</h3>
              </div>
              <button
                onClick={() => setShowBarModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMULIR RESMI BAR */}
            <div id="printable-bar" className="my-5 p-6 border border-slate-300 rounded-xl bg-white text-slate-900 font-serif">
              {/* Kop Instansi */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 leading-snug">
                  KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
                </h2>
                <h3 className="text-sm font-extrabold uppercase mt-1 tracking-wider">
                  BERITA ACARA REKONSILIASI SALDO KAS & BANK
                </h3>
                <p className="text-[11px] text-slate-600 font-sans mt-1">
                  Nomor: {selectedDok.nomor_laporan || `BAR/${selectedDok.tahun}/${String(selectedDok.id).padStart(3, '0')}`}
                </p>
              </div>

              <div className="text-xs font-sans space-y-3 leading-relaxed">
                <p>
                  Pada hari ini, tanggal <strong>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>, telah dilakukan pencocokan dan rekonsiliasi data mutasi keuangan berkas <strong>{selectedDok.judul}</strong> untuk periode <strong>{periodLabel(selectedDok)}</strong> dengan rincian sebagai berikut:
                </p>

                <table className="w-full border-collapse border border-slate-300 my-4 text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 text-left font-bold">
                      <th className="border border-slate-300 p-2.5">Uraian Pembukuan</th>
                      <th className="border border-slate-300 p-2.5 text-right">Saldo Terverifikasi (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 p-2.5">1. Saldo Menurut Bank (Rekening Koran)</td>
                      <td className="border border-slate-300 p-2.5 text-right font-mono font-bold">
                        {selectedDok.nilai_rekening_koran != null ? `Rp ${Number(selectedDok.nilai_rekening_koran).toLocaleString('id-ID')}` : 'Rp 0'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2.5">2. Saldo Menurut Buku / LPJ Satker</td>
                      <td className="border border-slate-300 p-2.5 text-right font-mono font-bold">
                        {selectedDok.nilai_excel != null ? `Rp ${Number(selectedDok.nilai_excel).toLocaleString('id-ID')}` : 'Rp 0'}
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td className="border border-slate-300 p-2.5">3. Selisih Rekonsiliasi Kas</td>
                      <td className="border border-slate-300 p-2.5 text-right font-mono text-emerald-800">
                        Rp {Math.abs(Number(selectedDok.nilai_rekening_koran || 0) - Number(selectedDok.nilai_excel || 0)).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold block text-[10px] uppercase text-slate-500 mb-0.5">Kesimpulan Audit:</span>
                  <span className="font-semibold text-slate-800">
                    {Math.abs(Number(selectedDok.nilai_rekening_koran || 0) - Number(selectedDok.nilai_excel || 0)) === 0
                      ? 'Dinyatakan NIHIL SELISIH (BALANCE). Seluruh mutasi kas telah klir dan terverifikasi sesuai standar akuntansi pemerintah.'
                      : `Terdapat selisih pembukuan kas sebesar Rp ${Math.abs(Number(selectedDok.nilai_rekening_koran || 0) - Number(selectedDok.nilai_excel || 0)).toLocaleString('id-ID')} yang memerlukan penjelasan rincian mutasi bank.`}
                  </span>
                </div>

                {/* Kolom Tanda Tangan */}
                <div className="grid grid-cols-2 gap-8 pt-6 text-center font-sans">
                  <div>
                    <p className="text-[11px] text-slate-500">Pihak Pengunggah / Bendahara:</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-slate-300 italic text-[11px]">[Tanda Tangan & Cap]</span>
                    </div>
                    <p className="font-bold underline text-xs">{selectedDok.uploaded_by || 'Bendahara Pengeluaran'}</p>
                    <p className="text-[10px] text-slate-500">Satuan Kerja Pengaju</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Pejabat Verifikator / Pimpinan Satker:</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-slate-300 italic text-[11px]">[Tanda Tangan & Cap]</span>
                    </div>
                    <p className="font-bold underline text-xs">Pimpinan Satker Terkait</p>
                    <p className="text-[10px] text-slate-500">NIP. Pejabat Berwenang</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowBarModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Printer className="w-4 h-4" />
                Cetak Lembar BAR (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function PimpinanDokumenPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <DokumenContent />
    </Suspense>
  );
}