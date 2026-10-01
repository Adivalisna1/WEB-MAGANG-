'use client';
import toast from 'react-hot-toast';


import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import {
  FileText, Upload, Clock, CheckCircle,
  Archive, Send, Pencil, Loader2,
  RefreshCw, AlertCircle, MessageSquareWarning, Bell, Info, CloudUpload
} from 'lucide-react';
import clsx from 'clsx';
import UploadModal from '@/components/Staff/UploadModal';
import { SearchContext } from '@/context/SearchContext';
import React from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Dokumen {
  id: number;
  judul: string;
  tahun: number;
  status: 'draft' | 'menunggu_verifikasi' | 'lolos_pimpinan' | 'terverifikasi' | 'revisi' | 'diarsipkan';
  kategori: string;
  file_nama: string;
  file_size: number;
  download_count: number;
  created_at: string;
  catatan: string | null;
  catatan_oleh: string | null;
}

const CATATAN_LABEL: Record<string, string> = {
  Pimpinan: 'pimpinan_satker',
  ketua_tim: 'Eselon 1',
};

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  menunggu_verifikasi: { label: 'Menunggu Pimpinan', color: 'bg-indigo-100 text-indigo-700', icon: Clock },
  lolos_pimpinan: { label: 'Menunggu Eselon 1', color: 'bg-blue-100 text-blue-700', icon: Clock },
  terverifikasi: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  revisi: { label: 'Perlu Perbaikan', color: 'bg-amber-100 text-amber-700', icon: MessageSquareWarning },
  diarsipkan: { label: 'Diarsipkan', color: 'bg-purple-100 text-purple-700', icon: Archive },
};

export default function StaffDokumenPage() {
  const { user } = useAuth();
  const [dokumenList, setDokumenList] = useState<Dokumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState<number | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialFile, setInitialFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDokumen = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/all`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDokumenList(data.data);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat dokumen');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDokumen(); }, [fetchDokumen]);

  const submitVerifikasi = async (id: number) => {
    setSubmitting(id);
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/${id}/submit`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchDokumen();
    } catch (e: any) {
      toast.error(e.message || 'Gagal submit verifikasi');
    } finally {
      setSubmitting(null);
    }
  };

  // Dropzone Handlers for Dashboard
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setInitialFile(file);
      setIsModalOpen(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInitialFile(file);
      setIsModalOpen(true);
    }
    // reset input so the same file can be selected again
    if (fileRef.current) fileRef.current.value = '';
  };

  const openEmptyModal = () => {
    setInitialFile(null);
    setIsModalOpen(true);
  };

  const dokumenRevisi = dokumenList.filter(d => d.status === 'revisi' && d.catatan);

  const stats = {
    total: dokumenList.length,
    draft: dokumenList.filter(d => d.status === 'draft').length,
    menunggu: dokumenList.filter(d => d.status === 'menunggu_verifikasi').length,
    verified: dokumenList.filter(d => d.status === 'terverifikasi').length,
    revisi: dokumenRevisi.length,
  };

  const calculatePercent = (val: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((val / total) * 100);
  };

  // Consume SearchContext for global searching
  const searchTerm = React.useContext(SearchContext) || '';
  const filteredDokumenList = dokumenList.filter(dok => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (dok.judul || '').toLowerCase().includes(q) ||
      (dok.kategori || '').toLowerCase().includes(q) ||
      String(dok.tahun || '').includes(q)
    );
  });

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
        {/* Left Column (Upload & Table) */}
        <div className="xl:col-span-2 space-y-6">

          {/* Upload Card */}
          <div className="bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-2xl p-6 border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Unggah Dokumen Baru</h2>
                <p className="text-slate-500 text-sm mt-1 mb-5">Pilih jenis dokumen dan unggah file (.pdf, .docx, max 10MB)</p>
              </div>
              <button onClick={openEmptyModal} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Buka Form Upload
              </button>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={clsx(
                "border-2 border-dashed rounded-xl bg-slate-50 p-8 flex flex-col items-center justify-center cursor-pointer transition-all group",
                dragging ? "border-indigo-500 bg-indigo-50 scale-[1.02]" : "border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-300"
              )}
            >
              <div className="w-12 h-12 bg-slate-200 group-hover:bg-indigo-100 rounded-full flex items-center justify-center mb-3 transition-colors pointer-events-none">
                <CloudUpload className="w-6 h-6 text-slate-500 group-hover:text-indigo-600 transition-colors" />
              </div>
              <p className="text-slate-600 font-medium group-hover:text-indigo-700 transition-colors pointer-events-none">
                {dragging ? "Lepaskan file di sini" : "Klik atau seret file ke area ini untuk upload cepat"}
              </p>
            </div>
            <input type="file" ref={fileRef} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileSelect} />
          </div>

          {/* Daftar Dokumen */}
          <div className="bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-2xl p-6 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                  D
                </div>
                <h2 className="text-lg font-bold text-slate-800">Daftar Dokumen</h2>
              </div>
              <button onClick={fetchDokumen} className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="Refresh Data">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-4">Daftar Pengajuan Terbaru</h3>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* NOTIFIKASI REVISI */}
            {dokumenRevisi.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="font-semibold text-amber-800 text-sm">
                    Ada {dokumenRevisi.length} dokumen yang perlu direvisi
                  </p>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-sm border-b border-slate-200">
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Judul Dokumen</th>
                    <th className="px-4 py-3 font-semibold">Kategori</th>
                    <th className="px-4 py-3 font-semibold">Tahun</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredDokumenList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        {searchTerm ? 'Pencarian tidak menemukan hasil.' : 'Belum ada pengajuan dokumen.'}
                      </td>
                    </tr>
                  ) : (
                    filteredDokumenList.map((dok) => {
                      const cfg = statusConfig[dok.status];
                      const canEdit = dok.status === 'draft' || dok.status === 'revisi';
                      const canSubmit = dok.status === 'draft' || dok.status === 'revisi';

                      return (
                        <tr key={dok.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 font-medium text-slate-800 max-w-xs truncate">
                            {dok.judul}
                            {dok.catatan && dok.status === 'revisi' && (
                              <p className="text-xs text-amber-600 mt-1 truncate">Catatan: {dok.catatan}</p>
                            )}
                          </td>
                          <td className="px-4 py-4 text-slate-600">{dok.kategori}</td>
                          <td className="px-4 py-4 text-slate-600">{dok.tahun}</td>
                          <td className="px-4 py-4">
                            <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap', cfg.color)}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2 text-slate-400">
                              {canEdit && (
                                <Link href={`/staff/dokumen/${dok.id}/edit`} className="hover:text-amber-500 transition-colors" title="Edit/Revisi">
                                  <Pencil className="w-5 h-5" />
                                </Link>
                              )}
                              {canSubmit && (
                                <button
                                  onClick={() => submitVerifikasi(dok.id)}
                                  disabled={submitting === dok.id}
                                  className="hover:text-indigo-600 transition-colors disabled:opacity-50"
                                  title="Submit Verifikasi"
                                >
                                  {submitting === dok.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
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
          </div>
        </div>

        {/* Right Column (Stats & News) */}
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-2xl p-6 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Ringkasan Pengajuan</h3>
              <button className="text-slate-400 hover:text-slate-600">
                <Info className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600 font-medium">Total Permohonan</span>
                  <span className="font-bold text-slate-800">{stats.total}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600 font-medium">Terverifikasi (Selesai)</span>
                  <span className="font-bold text-slate-800">{stats.verified}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${calculatePercent(stats.verified, stats.total)}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600 font-medium">Perlu Revisi</span>
                  <span className="font-bold text-slate-800">{stats.revisi}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${calculatePercent(stats.revisi, stats.total)}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600 font-medium">Menunggu Verifikasi</span>
                  <span className="font-bold text-slate-800">{stats.menunggu}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${calculatePercent(stats.menunggu, stats.total)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* News & Updates */}
          <div className="bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-2xl p-6 border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-white rounded-bl-full opacity-50 z-0"></div>
            <div className="relative z-10">
              <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-3">PENGUMUMAN</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">Batas Akhir Pelaporan Triwulan Q3</h3>
              <p className="text-sm text-slate-600 mb-4">Harap segera menyelesaikan laporan triwulan ketiga sebelum akhir bulan ini.</p>
              <button className="text-sm font-semibold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                Baca Selengkapnya <span className="transform translate-y-[1px]">&rarr;</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 text-white relative overflow-hidden shadow-lg shadow-slate-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Panduan Sistem Baru</h3>
              <p className="text-sm text-slate-300 mb-4 opacity-90">Pelajari fitur-fitur baru di update sistem versi 2.0 untuk mempercepat alur kerjamu.</p>
              <a href="/panduan_sistem_baru.pdf" target="_blank" rel="noopener noreferrer" className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-colors backdrop-blur-sm border border-white/10 flex items-center justify-center gap-2">
                Unduh Panduan (PDF)
              </a>
            </div>
          </div>
        </div>
      </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInitialFile(null);
        }}
        onSuccess={fetchDokumen}
        initialFile={initialFile}
      />
    </>
  );
}

