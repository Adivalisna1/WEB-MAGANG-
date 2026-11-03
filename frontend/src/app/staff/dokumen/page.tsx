'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import {
  FileText, Upload, Clock, CheckCircle,
  Archive, Send, Pencil, Loader2,
  RefreshCw, AlertCircle, MessageSquareWarning, Bell, Info, CloudUpload,
  Eye, Download, BookOpen, AlertTriangle, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import clsx from 'clsx';
import UploadModal from '@/components/Staff/UploadModal';
import { SearchContext } from '@/context/SearchContext';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

interface Dokumen {
  id: number;
  judul: string;
  tahun: number;
  status: 'draft' | 'menunggu_verifikasi' | 'lolos_pimpinan' | 'lolos_admin' | 'terverifikasi' | 'revisi' | 'diarsipkan';
  kategori: string;
  file_nama: string;
  file_size: number;
  download_count: number;
  created_at: string;
  catatan: string | null;
  catatan_oleh: string | null;
  periode?: string;
}

const statusConfig: Record<string, { label: string; badgeClass: string; step: number }> = {
  draft: { label: 'Draft', badgeClass: 'staff-badge-draft', step: 1 },
  menunggu_verifikasi: { label: 'Menunggu Pimpinan', badgeClass: 'staff-badge-pimpinan', step: 2 },
  lolos_pimpinan: { label: 'Menunggu Eselon 1', badgeClass: 'staff-badge-eselon', step: 3 },
  lolos_admin: { label: 'Menunggu Eselon 1', badgeClass: 'staff-badge-eselon', step: 3 },
  terverifikasi: { label: 'Selesai', badgeClass: 'staff-badge-selesai', step: 4 },
  revisi: { label: 'Perlu Perbaikan', badgeClass: 'staff-badge-revisi', step: 2 },
  diarsipkan: { label: 'Diarsipkan', badgeClass: 'staff-badge-arsip', step: 4 },
};

export default function StaffDokumenPage() {
  const { user } = useAuth();
  const [dokumenList, setDokumenList] = useState<Dokumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState<number | null>(null);

  // Filter States
  const [filterKategori, setFilterKategori] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [tableSearch, setTableSearch] = useState('');

  // Dropzone & Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Stepper / Detail Modal State
  const [detailModalDoc, setDetailModalDoc] = useState<Dokumen | null>(null);

  const fetchDokumen = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/all`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat dokumen');
      setDokumenList(data.data || []);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat dokumen');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDokumen();
  }, [fetchDokumen]);

  const submitVerifikasi = async (id: number) => {
    setSubmitting(id);
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/${id}/submit`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal submit verifikasi');
      toast.success('Pengajuan dokumen berhasil dikirim ke Pimpinan untuk verifikasi');
      await fetchDokumen();
    } catch (e: any) {
      toast.error(e.message || 'Gagal submit verifikasi');
    } finally {
      setSubmitting(null);
    }
  };

  // Dropzone Handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleOpenUploadWithFile = () => {
    setIsModalOpen(true);
  };

  const cancelSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  // Dokumen revisi (banner)
  const dokumenRevisiList = dokumenList.filter(d => d.status === 'revisi');

  // Stats Counters
  const stats = {
    total: dokumenList.length,
    draft: dokumenList.filter(d => d.status === 'draft').length,
    menunggu: dokumenList.filter(d => d.status === 'menunggu_verifikasi' || d.status === 'lolos_pimpinan' || d.status === 'lolos_admin').length,
    verified: dokumenList.filter(d => d.status === 'terverifikasi').length,
    revisi: dokumenRevisiList.length,
  };

  const calculatePercent = (val: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((val / total) * 100);
  };

  // Global Context Search
  const globalSearchTerm = React.useContext(SearchContext) || '';

  // Filtered List
  const filteredDokumenList = dokumenList.filter(dok => {
    // 1. Filter Kategori
    if (filterKategori !== 'all' && dok.kategori?.toLowerCase() !== filterKategori.toLowerCase()) {
      return false;
    }
    // 2. Filter Status
    if (filterStatus !== 'all') {
      if (filterStatus === 'pimpinan' && dok.status !== 'menunggu_verifikasi') return false;
      else if (filterStatus === 'eselon' && !(dok.status === 'lolos_pimpinan' || dok.status === 'lolos_admin')) return false;
      else if (filterStatus !== 'pimpinan' && filterStatus !== 'eselon' && dok.status !== filterStatus) return false;
    }
    // 3. Search (table or global)
    const term = (tableSearch || globalSearchTerm).toLowerCase().trim();
    if (term) {
      const matchJudul = (dok.judul || '').toLowerCase().includes(term);
      const matchKategori = (dok.kategori || '').toLowerCase().includes(term);
      const matchTahun = String(dok.tahun || '').includes(term);
      const matchCatatan = (dok.catatan || '').toLowerCase().includes(term);
      if (!matchJudul && !matchKategori && !matchTahun && !matchCatatan) return false;
    }
    return true;
  });

  // Helper file icons & sizes
  const getFileBadge = (file_nama: string = '') => {
    const ext = file_nama.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return { label: 'PDF', cls: 'pdf' };
    if (ext === 'xlsx' || ext === 'xls') return { label: 'XLS', cls: 'xls' };
    if (ext === 'doc' || ext === 'docx') return { label: 'DOC', cls: 'doc' };
    return { label: 'FILE', cls: 'pdf' };
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ================================================================
           1. BANNER PERINGATAN AMBER (DOKUMEN PERLU REVISI)
           ================================================================ */}
      {dokumenRevisiList.length > 0 && (
        <section className="staff-alert-banner">
          <div className="staff-alert-left">
            <div className="staff-alert-icon-circle">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="staff-alert-title flex items-center">
                <span className="staff-alert-badge">{dokumenRevisiList.length}</span>
                Dokumen Laporan Memerlukan Perbaikan / Revisi
              </h3>
              <p className="staff-alert-desc">
                Pimpinan dan Eselon 1 telah memberikan catatan koreksi pada pengajuan dokumen Anda. Segera lakukan penyesuaian berkas agar dapat diproses ke tahap persetujuan berikutnya.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterStatus('revisi')}
            className="staff-btn staff-btn-sm staff-btn-primary shrink-0 bg-amber-600 hover:bg-amber-700 border-amber-600"
          >
            Lihat Dokumen Revisi
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </section>
      )}

      {/* ================================================================
           2. GRID DASHBOARD UTAMA (KOLOM KIRI & KOLOM KANAN)
           ================================================================ */}
      <div className="staff-dashboard-grid">

        {/* --- KOLOM KIRI: DROPZONE CEPAT & TABEL PENGAJUAN --- */}
        <div className="staff-main-col">

          {/* KARTU UNGGAH DOKUMEN BARU */}
          <div className="staff-card">
            <div className="staff-card-header">
              <div className="staff-card-title-group">
                <h2 className="staff-card-title">Unggah Dokumen Baru</h2>
                <span className="staff-card-subtitle">
                  Lampirkan berkas laporan keuangan satuan kerja untuk diverifikasi oleh pimpinan
                </span>
              </div>
              <button
                onClick={() => { setSelectedFile(null); setIsModalOpen(true); }}
                className="staff-btn staff-btn-secondary staff-btn-sm"
              >
                <Upload className="w-4 h-4" />
                Buka Form Upload Lengkap
              </button>
            </div>

            {/* Dropzone Drag & Drop Area */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={clsx('staff-dropzone', dragging && 'drag-over')}
            >
              <input
                type="file"
                ref={fileRef}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect}
              />
              <div className="staff-dropzone-icon">
                <CloudUpload className="w-7 h-7" />
              </div>
              <div className="staff-dropzone-title">
                Tarik & lepaskan berkas ke sini, atau <span>Pilih Berkas</span>
              </div>
              <div className="staff-dropzone-specs">
                <span>Format didukung:</span>
                <span className="badge-filetype">PDF</span>
                <span className="badge-filetype">DOC</span>
                <span className="badge-filetype">DOCX</span>
                <span className="badge-filetype">XLS</span>
                <span className="badge-filetype">XLSX</span>
                <span>• Ukuran maksimum 10MB per berkas</span>
              </div>

              {/* Strip Berkas Terpilih */}
              {selectedFile && (
                <div
                  className="staff-preview-strip"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                      FILE
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-800">{selectedFile.name}</div>
                      <div className="text-xs text-slate-400">{formatFileSize(selectedFile.size)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenUploadWithFile}
                      className="staff-btn staff-btn-sm staff-btn-primary"
                    >
                      Lanjutkan Form
                    </button>
                    <button
                      type="button"
                      onClick={cancelSelectedFile}
                      className="staff-btn staff-btn-sm staff-btn-ghost text-slate-400 hover:text-red-600"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TABEL DAFTAR PENGAJUAN TERBARU */}
          <div className="staff-card staff-table-card">
            {/* Toolbar Tabel */}
            <div className="staff-table-toolbar">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="staff-card-title mb-0">Daftar Pengajuan Terbaru</h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Search Box Tabel */}
                <div className="staff-table-search">
                  <TableSearchIcon className="w-4 h-4" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={e => setTableSearch(e.target.value)}
                    placeholder="Cari dalam tabel..."
                  />
                </div>

                {/* Filter Kategori */}
                <select
                  className="staff-filter-select"
                  value={filterKategori}
                  onChange={e => setFilterKategori(e.target.value)}
                >
                  <option value="all">Semua Kategori</option>
                  <option value="LKjIP">LKjIP</option>
                  <option value="Renstra">Renstra</option>
                  <option value="Renja">Renja</option>
                  <option value="LAKIP">LAKIP</option>
                  <option value="PK">PK (Perjanjian Kinerja)</option>
                  <option value="RKT">RKT</option>
                  <option value="IKU">IKU</option>
                </select>

                {/* Filter Status Workflow */}
                <select
                  className="staff-filter-select"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="draft">Draft (Abu)</option>
                  <option value="pimpinan">Menunggu Pimpinan (Indigo)</option>
                  <option value="eselon">Menunggu Eselon 1 (Biru)</option>
                  <option value="terverifikasi">Selesai (Hijau)</option>
                  <option value="revisi">Perlu Perbaikan (Amber)</option>
                  <option value="diarsipkan">Diarsipkan (Ungu)</option>
                </select>

                <button
                  onClick={fetchDokumen}
                  className="staff-action-icon text-slate-400 hover:text-blue-600"
                  title="Muat Ulang Data"
                >
                  <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
                </button>
              </div>
            </div>

            {/* Area Tabel */}
            <div className="overflow-x-auto">
              <table className="staff-data-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: '280px' }}>Judul Dokumen & Tracking</th>
                    <th>Kategori</th>
                    <th>Tahun / Periode</th>
                    <th>Status Dokumen</th>
                    <th>Tanggal Diajukan</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {/* SKELETON STATE SAAT LOADING */}
                  {loading && (
                    <>
                      {[1, 2, 3, 4].map(idx => (
                        <tr key={`skel-${idx}`} className="animate-pulse">
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-slate-200 rounded-lg"></div>
                              <div className="space-y-1.5 flex-1">
                                <div className="h-3.5 bg-slate-200 rounded w-24"></div>
                                <div className="h-4 bg-slate-200 rounded w-48"></div>
                              </div>
                            </div>
                          </td>
                          <td><div className="h-6 bg-slate-200 rounded w-16"></div></td>
                          <td><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                          <td><div className="h-6 bg-slate-200 rounded-full w-28"></div></td>
                          <td><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                          <td className="text-right"><div className="h-8 bg-slate-200 rounded w-20 ml-auto"></div></td>
                        </tr>
                      ))}
                    </>
                  )}

                  {/* EMPTY STATE */}
                  {!loading && filteredDokumenList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <h4 className="font-bold text-slate-700 text-base">Tidak Ada Dokumen Ditemukan</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                          Belum ada dokumen pengajuan atau kata kunci pencarian tidak cocok.
                        </p>
                      </td>
                    </tr>
                  )}

                  {!loading && filteredDokumenList.map(dok => {
                    const fileBadge = getFileBadge(dok.file_nama);
                    const cfg = statusConfig[dok.status] || {
                      label: dok.status,
                      badgeClass: 'staff-badge-draft',
                      step: 1
                    };
                    const canEdit = dok.status === 'draft' || dok.status === 'revisi';
                    const canSubmit = dok.status === 'draft' || dok.status === 'revisi';
                    const trackingCode = `${dok.kategori || 'DOC'}/${dok.tahun}/${String(dok.id).padStart(3, '0')}`;

                    return (
                      <tr key={dok.id} className="hover:bg-slate-50/70 transition-colors">
                        <td>
                          <div className="staff-doc-cell">
                            <div className={clsx('staff-doc-icon', fileBadge.cls)}>
                              <span className="font-bold text-[10.5px]">{fileBadge.label}</span>
                            </div>
                            <div>
                              <span className="staff-doc-code-pill">{trackingCode}</span>
                              <div className="staff-doc-title text-slate-900 font-semibold">{dok.judul}</div>
                              {dok.status === 'revisi' && dok.catatan && (
                                <div className="staff-revisi-note-pill">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                  <span className="truncate max-w-[280px]">Revisi: {dok.catatan}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="staff-category-pill">{dok.kategori || '-'}</span>
                        </td>
                        <td>
                          <div className="text-sm font-medium text-slate-700">{dok.tahun}</div>
                          <div className="text-xs text-slate-400">{dok.periode || 'Tahunan'}</div>
                        </td>
                        <td>
                          <span className={clsx('staff-status-badge', cfg.badgeClass)}>
                            <span className="dot" />
                            <span>{cfg.label}</span>
                          </span>
                        </td>
                        <td>
                          <div className="text-xs font-medium text-slate-600">
                            {dok.created_at ? new Date(dok.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            }) : '-'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="inline-flex items-center gap-1 justify-end">
                            {/* Tombol Lihat Detail / Alur Stepper */}
                            <button
                              onClick={() => setDetailModalDoc(dok)}
                              className="staff-action-icon primary hover:text-blue-600"
                              title="Lihat Alur Verifikasi & Catatan"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Tombol Edit / Revisi */}
                            {canEdit && (
                              <Link
                                href={`/staff/dokumen/${dok.id}/edit`}
                                className="staff-action-icon warning hover:text-amber-600"
                                title="Perbaiki & Edit Dokumen"
                              >
                                <Pencil className="w-4 h-4" />
                              </Link>
                            )}

                            {/* Tombol Kirim / Submit Verifikasi */}
                            {canSubmit && (
                              <button
                                onClick={() => submitVerifikasi(dok.id)}
                                disabled={submitting === dok.id}
                                className="staff-action-icon hover:text-indigo-600 disabled:opacity-40"
                                title="Kirim untuk Verifikasi Pimpinan"
                              >
                                {submitting === dok.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                              </button>
                            )}

                            {/* Tombol Unduh Berkas */}
                            {dok.file_nama && (
                              <a
                                href={`${API}/dokumen/${dok.id}/download`}
                                target="_blank"
                                rel="noreferrer"
                                className="staff-action-icon hover:text-slate-800"
                                title="Unduh Berkas Lampiran"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Tabel */}
            <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan {filteredDokumenList.length} dari {dokumenList.length} dokumen</span>
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed">
                  &laquo;
                </button>
                <button className="px-2.5 py-1 rounded border border-blue-600 bg-blue-600 text-white font-semibold">
                  1
                </button>
                <button className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed">
                  &raquo;
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* --- KOLOM KANAN: RINGKASAN PENGAJUAN, PENGUMUMAN & PANDUAN --- */}
        <div className="staff-side-col">

          {/* KARTU RINGKASAN PENGAJUAN */}
          <div className="staff-card">
            <div className="staff-card-header mb-3">
              <h3 className="staff-card-title text-base">Ringkasan Pengajuan</h3>
              <Info className="w-4 h-4 text-slate-400" />
            </div>

            {/* Hero Counter Total */}
            <div className="staff-stat-hero">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Permohonan
                </span>
                <div className="staff-stat-hero-number mt-0.5">{stats.total}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            {/* Progress Bars Breakdown */}
            <div className="space-y-4">
              {/* Selesai / Terverifikasi */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Terverifikasi (Selesai)
                  </span>
                  <span className="font-bold text-slate-800">{stats.verified}</span>
                </div>
                <div className="staff-progress-bg">
                  <div
                    className="staff-progress-fill bg-emerald-500"
                    style={{ width: `${calculatePercent(stats.verified, stats.total)}%` }}
                  />
                </div>
              </div>

              {/* Perlu Revisi */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Perlu Revisi
                  </span>
                  <span className="font-bold text-slate-800">{stats.revisi}</span>
                </div>
                <div className="staff-progress-bg">
                  <div
                    className="staff-progress-fill bg-amber-500"
                    style={{ width: `${calculatePercent(stats.revisi, stats.total)}%` }}
                  />
                </div>
              </div>

              {/* Menunggu Verifikasi */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Menunggu Verifikasi
                  </span>
                  <span className="font-bold text-slate-800">{stats.menunggu}</span>
                </div>
                <div className="staff-progress-bg">
                  <div
                    className="staff-progress-fill bg-indigo-500"
                    style={{ width: `${calculatePercent(stats.menunggu, stats.total)}%` }}
                  />
                </div>
              </div>

              {/* Draft */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Draft Belum Dikirim
                  </span>
                  <span className="font-bold text-slate-800">{stats.draft}</span>
                </div>
                <div className="staff-progress-bg">
                  <div
                    className="staff-progress-fill bg-slate-400"
                    style={{ width: `${calculatePercent(stats.draft, stats.total)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* KARTU PENGUMUMAN INSTANSI */}
          <div className="staff-card staff-announcement-card">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Pengumuman Batas Akhir</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Batas pengunggahan <strong>Laporan Capaian Kinerja Triwulan III Tahun 2026</strong> ditutup pada tanggal <strong>15 Oktober 2026 pukul 23:59 WIB</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* KARTU BUKU PANDUAN STAFF */}
          <div className="staff-card staff-guide-card">
            <div className="staff-guide-card-icon">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">Buku Panduan Staff v2.4</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Pelajari tata cara penyusunan LKjIP, pengunggahan lampiran matriks IKU, dan penanganan revisi pimpinan.
            </p>
            <button
              onClick={() => toast.success('Memulai pengunduhan Buku Panduan Staff v2.4 (PDF)...')}
              className="staff-btn staff-btn-sm staff-btn-primary w-full bg-white/20 hover:bg-white/30 text-white border-white/25"
            >
              <Download className="w-4 h-4" />
              Unduh Panduan PDF (3.2 MB)
            </button>
          </div>

        </div>

      </div>

      {/* ================================================================
           3. MODAL DETAIL DOKUMEN & STEPPER / TIMELINE ALUR VERIFIKASI
           ================================================================ */}
      {detailModalDoc && (
        <div className="staff-modal-backdrop" onClick={() => setDetailModalDoc(null)}>
          <div
            className="staff-modal-window"
            style={{ maxWidth: '680px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="staff-modal-header">
              <div>
                <span className="staff-doc-code-pill font-mono">
                  {detailModalDoc.kategori}/{detailModalDoc.tahun}/{String(detailModalDoc.id).padStart(3, '0')}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{detailModalDoc.judul}</h3>
              </div>
              <button
                onClick={() => setDetailModalDoc(null)}
                className="staff-action-icon text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="staff-modal-body">
              {/* Meta strip */}
              <div className="text-xs text-slate-500 pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <span>
                  Kategori: <strong>{detailModalDoc.kategori}</strong> • Tahun <strong>{detailModalDoc.tahun}</strong>
                </span>
                <span>
                  Berkas:{" "}
                  {detailModalDoc.file_nama ? (
                    <a
                      href={`${API}/dokumen/${detailModalDoc.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                      title="Klik untuk membuka/mengunduh berkas"
                    >
                      <span>{detailModalDoc.file_nama}</span>
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <strong>Tidak ada</strong>
                  )}
                </span>
              </div>

              {/* Stepper Alur Dokumen 4 Tahap */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">
                  Alur Verifikasi Dokumen
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <div className="staff-stepper">
                    <div className="staff-stepper-line" />

                    {/* Step 1: Staff Upload */}
                    <div className="staff-stepper-item completed">
                      <div className="staff-stepper-node">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="staff-stepper-title">Staff Upload</span>
                      <span className="staff-stepper-desc">Pengajuan Awal</span>
                    </div>

                    {/* Step 2: Pimpinan */}
                    <div className={clsx(
                      'staff-stepper-item',
                      detailModalDoc.status === 'revisi' ? 'rejected' :
                      ['lolos_pimpinan', 'lolos_admin', 'terverifikasi'].includes(detailModalDoc.status) ? 'completed' :
                      detailModalDoc.status === 'menunggu_verifikasi' ? 'current' : ''
                    )}>
                      <div className="staff-stepper-node">
                        {detailModalDoc.status === 'revisi' ? '!' :
                         ['lolos_pimpinan', 'lolos_admin', 'terverifikasi'].includes(detailModalDoc.status) ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                      </div>
                      <span className="staff-stepper-title">Pimpinan</span>
                      <span className="staff-stepper-desc">
                        {detailModalDoc.status === 'revisi' ? 'Perlu Perbaikan' : 'Penyaring 1'}
                      </span>
                    </div>

                    {/* Step 3: Eselon 1 */}
                    <div className={clsx(
                      'staff-stepper-item',
                      detailModalDoc.status === 'terverifikasi' ? 'completed' :
                      ['lolos_pimpinan', 'lolos_admin'].includes(detailModalDoc.status) ? 'current' : ''
                    )}>
                      <div className="staff-stepper-node">
                        {detailModalDoc.status === 'terverifikasi' ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                      </div>
                      <span className="staff-stepper-title">Eselon 1</span>
                      <span className="staff-stepper-desc">Persetujuan Final</span>
                    </div>

                    {/* Step 4: Selesai */}
                    <div className={clsx(
                      'staff-stepper-item',
                      detailModalDoc.status === 'terverifikasi' ? 'completed' : ''
                    )}>
                      <div className="staff-stepper-node">
                        {detailModalDoc.status === 'terverifikasi' ? <CheckCircle2 className="w-4 h-4" /> : '4'}
                      </div>
                      <span className="staff-stepper-title">Selesai</span>
                      <span className="staff-stepper-desc">Publikasi Portal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Riwayat Catatan Verifikator */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">
                  Riwayat Catatan & Tindakan Verifikator
                </h4>
                <div className="staff-timeline">
                  {/* Timeline Event 1: Pengajuan */}
                  <div className="staff-timeline-event success">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">Dokumen Diajukan oleh Staff</span>
                      <span className="text-slate-400">
                        {detailModalDoc.created_at ? new Date(detailModalDoc.created_at).toLocaleDateString('id-ID') : '-'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Berkas laporan berhasil diunggah ke sistem dan siap diverifikasi.
                    </p>
                  </div>

                  {/* Timeline Event 2: Status & Catatan Verifikasi Terkini */}
                  {detailModalDoc.status === 'terverifikasi' ? (
                    <div className="staff-timeline-event success">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-800">
                          {detailModalDoc.kategori?.toLowerCase().includes("rekening")
                            ? "Tercatat & Terverifikasi Otomatis"
                            : "Dokumen Telah Terverifikasi Penuh"}
                        </span>
                        <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                          Selesai (Publikasi)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {detailModalDoc.kategori?.toLowerCase().includes("rekening")
                          ? "Berkas bukti rekening koran telah dicocokkan dan diverifikasi aktif dalam sistem."
                          : "Dokumen telah melalui seluruh tahapan verifikasi hingga persetujuan final Eselon 1."}
                      </p>
                      {detailModalDoc.catatan && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 mt-2">
                          <strong>Catatan Verifikator:</strong> &ldquo;{detailModalDoc.catatan}&rdquo;
                        </div>
                      )}
                    </div>
                  ) : detailModalDoc.status === 'lolos_pimpinan' || detailModalDoc.status === 'lolos_admin' ? (
                    <div className="staff-timeline-event info">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-blue-800">Lolos Verifikasi Pimpinan</span>
                        <span className="text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-full">
                          Menunggu Eselon 1
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Telah disetujui Pimpinan Satker dan sedang menunggu persetujuan final dari Eselon 1.
                      </p>
                      {detailModalDoc.catatan && (
                        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 mt-2">
                          <strong>Catatan Pimpinan:</strong> &ldquo;{detailModalDoc.catatan}&rdquo;
                        </div>
                      )}
                    </div>
                  ) : detailModalDoc.status === 'revisi' ? (
                    <div className="staff-timeline-event warning">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-amber-800">Perlu Perbaikan / Revisi</span>
                        <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                          Revisi
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Verifikator meminta dokumen ini diperbaiki sebelum dapat disetujui.
                      </p>
                      {detailModalDoc.catatan && (
                        <div className="p-2.5 bg-amber-50/90 border border-amber-200 rounded-lg text-xs text-amber-900 mt-2">
                          <strong>Catatan dari {detailModalDoc.catatan_oleh || 'Verifikator'}:</strong> &ldquo;{detailModalDoc.catatan}&rdquo;
                        </div>
                      )}
                    </div>
                  ) : detailModalDoc.status === 'draft' ? (
                    <div className="staff-timeline-event default">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">Dokumen Masih Draft</span>
                        <span className="text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                          Draft
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dokumen belum diajukan untuk verifikasi. Klik tombol Kirim untuk mengajukan ke Pimpinan.
                      </p>
                    </div>
                  ) : (
                    <div className="staff-timeline-event info">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">Status Saat Ini</span>
                        <span className="text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                          Sedang Diproses
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Menunggu tindakan verifikasi dari pejabat berwenang.
                      </p>
                      {detailModalDoc.catatan && (
                        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 mt-2">
                          <strong>Catatan:</strong> &ldquo;{detailModalDoc.catatan}&rdquo;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="staff-modal-footer flex items-center justify-between">
              <div>
                {detailModalDoc.file_nama && (
                  <a
                    href={`${API}/dokumen/${detailModalDoc.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="staff-btn staff-btn-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 inline-flex items-center gap-1.5 font-bold"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Buka / Unduh Berkas</span>
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailModalDoc(null)}
                  className="staff-btn staff-btn-md staff-btn-secondary"
                >
                  Tutup
                </button>
                {(detailModalDoc.status === 'draft' || detailModalDoc.status === 'revisi') && (
                  <Link
                    href={`/staff/dokumen/${detailModalDoc.id}/edit`}
                    className="staff-btn staff-btn-md staff-btn-primary"
                  >
                    <Pencil className="w-4 h-4" />
                    Perbaiki Dokumen
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
           4. UPLOAD MODAL
           ================================================================ */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          setSelectedFile(null);
          fetchDokumen();
        }}
        initialFile={selectedFile}
      />

    </div>
  );
}

function TableSearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
