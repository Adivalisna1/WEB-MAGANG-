'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import {
  FileText, Loader2, RefreshCw, AlertCircle,
  Download, ChevronRight, Plus, Search,
  FileSignature
} from 'lucide-react';
import clsx from 'clsx';
import UploadModal from '@/components/Staff/UploadModal';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

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

export default function SkPembebananPage() {
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
      const res = await fetch(`${API}/dokumen/all`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat dokumen');
      
      const all: Dokumen[] = data.data || [];
      const filtered = all.filter(d => 
        (d.kategori_slug && (d.kategori_slug.includes('pembebanan') || d.kategori_slug.includes('skp2k') || d.kategori_slug.includes('sktjm'))) ||
        (d.judul && (d.judul.toLowerCase().includes('pembebanan') || d.judul.toLowerCase().includes('skp2k') || d.judul.toLowerCase().includes('sktjm') || d.judul.toLowerCase().includes('tanggung jawab mutlak')))
      );
      setDokumenList(filtered);
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

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Link href="/staff/laporan/sk-piutang" className="hover:underline">SK Piutang Satker</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Tahap 2: Penagihan & Pembebanan</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSignature className="w-7 h-7 text-[#1E90FF]" />
            SK Pembebanan / SKP2K / SKTJM
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Surat Keterangan Tanggung Jawab Mutlak (SKTJM) dan Surat Keputusan Pembebanan Penggantian Kerugian Negara.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDokumen}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Refresh Data"
          >
            <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1E90FF] hover:bg-blue-600 text-white font-semibold text-sm rounded-xl transition-all shadow-xs hover:shadow"
          >
            <Plus className="w-4 h-4" />
            Unggah SK Pembebanan
          </button>
        </div>
      </div>

      {/* Navigasi Tab SK Piutang */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Link
          href="/staff/laporan/sk-piutang/penetapan"
          className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          1. SK Penetapan / Kurang Bayar
        </Link>
        <Link
          href="/staff/laporan/sk-piutang/pembebanan"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E90FF] text-white shadow-xs"
        >
          2. SK Pembebanan / SKP2K / SKTJM
        </Link>
        <Link
          href="/staff/laporan/sk-piutang/penghapusan"
          className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          3. SK Penghapusan Piutang
        </Link>
      </div>

      {/* Filter & Search */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul SK atau nama file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E90FF]"
          />
        </div>
      </div>

      {/* Tabel Dokumen */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E90FF]" />
            <p className="text-sm font-medium">Memuat berkas SK Pembebanan...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1E90FF] flex items-center justify-center mb-4">
              <FileSignature className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Belum Ada SK Pembebanan / SKTJM</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6">
              Belum ada berkas SK Pembebanan, SKP2K, atau SKTJM yang diunggah.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E90FF] hover:bg-blue-600 text-white font-semibold text-xs rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Unggah Dokumen Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Dokumen</th>
                  <th className="px-6 py-3.5">Tahun</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Waktu Unggah</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const stat = statusConfig[doc.status] || {
                    label: doc.status,
                    badgeClass: 'bg-slate-100 text-slate-700',
                  };
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E90FF] flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">{doc.judul}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{doc.file_nama}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{doc.tahun}</td>
                      <td className="px-6 py-4">
                        <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stat.badgeClass)}>
                          {stat.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(doc.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`${API}/dokumen/${doc.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Unduh
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <UploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchDokumen();
          }}
          defaultKategoriSlug="sk-piutang-satker"
        />
      )}
    </div>
  );
}

