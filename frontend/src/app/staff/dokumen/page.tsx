'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import {
  FileText, Upload, Clock, CheckCircle,
  Archive, Send, Pencil, Loader2,
  RefreshCw, AlertCircle, MessageSquareWarning, Bell
} from 'lucide-react';
import clsx from 'clsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Dokumen {
  id: number;
  judul: string;
  tahun: number;
  status: 'draft' | 'menunggu_verifikasi' | 'lolos_admin' | 'terverifikasi' | 'revisi' | 'diarsipkan';
  kategori: string;
  file_nama: string;
  file_size: number;
  download_count: number;
  created_at: string;
  catatan: string | null;
  catatan_oleh: string | null;
}

// Label role pemberi catatan revisi
const CATATAN_LABEL: Record<string, string> = {
  admin: 'Admin',
  ketua_tim: 'Ketua Tim',
};

const statusConfig = {
  draft:                { label: 'Draft',               color: 'bg-gray-100 text-gray-700',     icon: FileText },
  menunggu_verifikasi:  { label: 'Menunggu Admin',      color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  lolos_admin:          { label: 'Menunggu Ketua Tim',  color: 'bg-blue-100 text-blue-700',     icon: Clock },
  terverifikasi:        { label: 'Terverifikasi',       color: 'bg-green-100 text-green-700',   icon: CheckCircle },
  revisi:               { label: 'Perlu Revisi',        color: 'bg-orange-100 text-orange-700', icon: MessageSquareWarning },
  diarsipkan:           { label: 'Diarsipkan',          color: 'bg-purple-100 text-purple-700', icon: Archive },
};

export default function StaffDokumenPage() {
  const { user } = useAuth();
  const [dokumenList, setDokumenList] = useState<Dokumen[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [submitting,  setSubmitting]  = useState<number | null>(null);

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
      alert(e.message || 'Gagal submit verifikasi');
    } finally {
      setSubmitting(null);
    }
  };

  // Dokumen yang perlu direvisi
  const dokumenRevisi = dokumenList.filter(d => d.status === 'revisi' && d.catatan);

  const stats = {
    total:    dokumenList.length,
    draft:    dokumenList.filter(d => d.status === 'draft').length,
    menunggu: dokumenList.filter(d => d.status === 'menunggu_verifikasi').length,
    verified: dokumenList.filter(d => d.status === 'terverifikasi').length,
    revisi:   dokumenRevisi.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dokumen Saya</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola dan pantau status dokumen yang kamu upload</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchDokumen} className="btn-secondary p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/staff/dokumen/upload" className="btn-primary flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" />
            Upload Dokumen
          </Link>
        </div>
      </div>

      {/* ── NOTIFIKASI REVISI ── tampil kalau ada dokumen perlu direvisi */}
      {dokumenRevisi.length > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600 shrink-0" />
            <p className="font-semibold text-orange-800 text-sm">
              {dokumenRevisi.length === 1
                ? 'Ada 1 dokumen yang perlu direvisi'
                : `Ada ${dokumenRevisi.length} dokumen yang perlu direvisi`}
            </p>
          </div>
          <div className="space-y-2">
            {dokumenRevisi.map(dok => (
              <div key={dok.id} className="bg-white border border-orange-200 rounded-lg px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{dok.judul}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{dok.kategori} · {dok.tahun}</p>
                    <div className="flex items-start gap-1.5 mt-2">
                      <MessageSquareWarning className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-orange-700 font-medium">
                        Catatan {CATATAN_LABEL[dok.catatan_oleh ?? ''] ?? 'reviewer'}: <span className="font-normal text-gray-700">{dok.catatan}</span>
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/staff/dokumen/${dok.id}/edit`}
                    className="shrink-0 text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" /> Revisi
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total',         value: stats.total,    color: 'text-gray-700' },
          { label: 'Draft',         value: stats.draft,    color: 'text-gray-500' },
          { label: 'Menunggu',      value: stats.menunggu, color: 'text-yellow-600' },
          { label: 'Terverifikasi', value: stats.verified, color: 'text-green-600' },
          { label: 'Perlu Revisi',  value: stats.revisi,   color: 'text-orange-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : dokumenList.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">Belum ada dokumen</p>
            <p className="text-sm mt-1">Mulai dengan upload dokumen pertamamu</p>
            <Link href="/staff/dokumen/upload" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
              <Upload className="w-4 h-4" /> Upload Sekarang
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dokumen</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tahun</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dokumenList.map(dok => {
                  const cfg = statusConfig[dok.status];
                  const Icon = cfg.icon;
                  const canEdit   = dok.status === 'draft' || dok.status === 'revisi';
                  const canSubmit = dok.status === 'draft' || dok.status === 'revisi';
                  const isRevisi  = dok.status === 'revisi';

                  return (
                    <tr
                      key={dok.id}
                      className={clsx(
                        'transition-colors',
                        isRevisi ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-gray-50'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className={clsx('w-4 h-4 shrink-0', isRevisi ? 'text-orange-400' : 'text-gray-400')} />
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{dok.judul}</p>
                            <p className="text-xs text-gray-400">{dok.file_nama}</p>
                          </div>
                        </div>
                        {/* Catatan revisi inline di baris */}
                        {dok.catatan && isRevisi && (
                          <div className="mt-2 flex items-start gap-1.5 bg-orange-100 border border-orange-200 rounded-lg px-3 py-2">
                            <MessageSquareWarning className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-orange-700">Catatan {CATATAN_LABEL[dok.catatan_oleh ?? ''] ?? 'reviewer'}:</p>
                              <p className="text-xs text-gray-700 mt-0.5">{dok.catatan}</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{dok.kategori}</td>
                      <td className="px-4 py-3 text-gray-600">{dok.tahun}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('badge flex items-center gap-1 w-fit', cfg.color)}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <Link
                              href={`/staff/dokumen/${dok.id}/edit`}
                              className={clsx(
                                'inline-flex items-center gap-1 text-xs font-medium',
                                isRevisi
                                  ? 'text-orange-600 hover:text-orange-800'
                                  : 'text-blue-600 hover:text-blue-800'
                              )}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              {isRevisi ? 'Revisi' : 'Edit'}
                            </Link>
                          )}
                          {canSubmit && (
                            <button
                              onClick={() => submitVerifikasi(dok.id)}
                              disabled={submitting === dok.id}
                              className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                            >
                              {submitting === dok.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Send className="w-3.5 h-3.5" />
                              }
                              Submit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
