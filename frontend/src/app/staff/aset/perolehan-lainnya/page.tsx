'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import {
  FileText, Loader2, RefreshCw, AlertCircle,
  Download, ChevronRight,
  PackagePlus, Plus, Search, Eye
} from 'lucide-react';
import clsx from 'clsx';
import UploadModal from '@/components/Staff/UploadModal';

const API = typeof window !== "undefined" && window.location.hostname 
  ? `${window.location.protocol}//${window.location.hostname}:5000/api` 
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

interface Dokumen {
  id: number;
  judul: string;
  tahun: number;
  status: 'draft' | 'menunggu_verifikasi' | 'lolos_pimpinan' | 'lolos_admin' | 'terverifikasi' | 'revisi' | 'diarsipkan';
  kategori: string;
  kategori_slug?: string;
  file_nama: string;
  file_size: number;
  download_count: number;
  created_at: string;
  catatan: string | null;
  catatan_oleh: string | null;
}

const statusConfig: Record<string, { label: string; badgeClass: string }> = {
  draft: { label: 'Draft', badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200' },
  menunggu_verifikasi: { label: 'Menunggu Pimpinan', badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200' },
  lolos_pimpinan: { label: 'Menunggu Eselon 1', badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200' },
  lolos_admin: { label: 'Menunggu Eselon 1', badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200' },
  terverifikasi: { label: 'Selesai', badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  revisi: { label: 'Perlu Perbaikan', badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200' },
  diarsipkan: { label: 'Diarsipkan', badgeClass: 'bg-gray-100 text-gray-700 border border-gray-200' },
};

export default function PerolehanLainnyaPage() {
  const { user } = useAuth();
  const [dokumenList, setDokumenList] = useState<Dokumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDokumen = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/all?limit=100`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat dokumen');
      
      const all: Dokumen[] = data.data || [];
      const asetDocs = all.filter(d => 
        (d.kategori_slug && (d.kategori_slug.includes('perolehan') || d.kategori_slug.includes('aset'))) ||
        (d.kategori && (d.kategori.toLowerCase().includes('perolehan') || d.kategori.toLowerCase().includes('aset'))) ||
        (d.judul && (d.judul.toLowerCase().includes('perolehan') || d.judul.toLowerCase().includes('aset')))
      );
      setDokumenList(asetDocs);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat dokumen');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDokumen();
  }, [fetchDokumen]);

  const filteredDocs = dokumenList.filter(d => 
    (d.judul || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.file_nama || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Aset</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Perolehan Lainnya</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <PackagePlus className="w-7 h-7 text-[#1E90FF]" />
            Dokumen Perolehan Aset Lainnya
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pengelolaan dan pengarsipan berkas Berita Acara / SK Perolehan Barang Milik Negara (BMN) dari sumber perolehan lainnya (hibah, transfer, sitaan, dll).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-xs transition-colors text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Dokumen Perolehan</span>
        </button>
      </div>

      {/* Konten & Tabel Dokumen */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Toolbar Pencarian */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari dokumen perolehan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={fetchDokumen}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", loading && "animate-spin")} />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Status Error */}
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Judul Dokumen</th>
                <th className="py-3 px-4">Tahun</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Ukuran</th>
                <th className="py-3 px-4">Status Verifikasi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Memuat data dokumen perolehan aset...</span>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <PackagePlus className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Belum Ada Dokumen Perolehan Aset</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Silakan klik tombol &quot;Upload Dokumen Perolehan&quot; di atas untuk mengunggah dokumen baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const conf = statusConfig[doc.status] || {
                    label: doc.status,
                    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
                  };

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{doc.judul}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{doc.file_nama}</div>
                        {doc.catatan && (
                          <div className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 border border-amber-200 w-fit">
                            Catatan: {doc.catatan}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">{doc.tahun}</td>
                      <td className="py-3 px-4 text-slate-600">{doc.kategori || 'Perolehan Lainnya'}</td>
                      <td className="py-3 px-4 text-slate-500">{formatFileSize(doc.file_size)}</td>
                      <td className="py-3 px-4">
                        <span className={clsx("px-2.5 py-1 rounded-full text-[10px] font-bold", conf.badgeClass)}>
                          {conf.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`${API}/dokumen/download/${doc.id}`}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Unduh Berkas"
                          >
                            <Download className="w-4 h-4" />
                          </a>
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

      {/* Modal Upload */}
      <UploadModal
        isOpen={isModalOpen}
        defaultKategoriSlug="perolehan-lainnya"
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchDokumen();
        }}
      />
    </div>
  );
}
