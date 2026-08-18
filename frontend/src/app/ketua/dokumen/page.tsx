'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth';
import { FileSearch, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Dokumen {
  id: number;
  judul: string;
  tahun: number;
  status: string;
  kategori: string;
  divisi: string | null;
  uploaded_by: string;
  created_at: string;
}

interface Divisi { id: number; nama: string; slug: string; }

const STATUS_BADGE: Record<string, string> = {
  terverifikasi:       'bg-green-100 text-green-700',
  menunggu_verifikasi: 'bg-amber-100 text-amber-700',
  revisi:              'bg-orange-100 text-orange-700',
  draft:               'bg-gray-100 text-gray-600',
};
const STATUS_LABEL: Record<string, string> = {
  terverifikasi:       'Terverifikasi',
  menunggu_verifikasi: 'Menunggu',
  revisi:              'Revisi',
  draft:               'Draft',
};

export default function KetuaDokumenPage() {
  const [list,     setList]     = useState<Dokumen[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState('');

  // Drill-down per divisi (default: semua)
  const [divisiList,   setDivisiList]   = useState<Divisi[]>([]);
  const [filterDivisi, setFilterDivisi] = useState('');

  // Muat daftar divisi dari endpoint publik
  useEffect(() => {
    fetch(`${API}/dokumen/divisi`)
      .then(r => r.json())
      .then(d => setDivisiList(d.data ?? []))
      .catch(() => {});
  }, []);

  const fetchDokumen = useCallback(async () => {
    try {
      const session = getSession();
      const divisiParam = filterDivisi ? `&divisi=${filterDivisi}` : '';
      const res = await fetch(`${API}/ketua/dokumen?status=${filter}&limit=200${divisiParam}`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setList(json.data);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Gagal memuat dokumen');
    } finally {
      setLoading(false);
    }
  }, [filter, filterDivisi]);

  useEffect(() => { fetchDokumen(); }, [fetchDokumen]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitor Dokumen</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau siapa yang upload dan status verifikasi setiap dokumen (read-only)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterDivisi}
            onChange={(e) => { setLoading(true); setFilterDivisi(e.target.value); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Semua Divisi</option>
            {divisiList.map(d => (
              <option key={d.id} value={d.slug}>{d.nama}</option>
            ))}
          </select>
          <select
            value={filter}
            onChange={(e) => { setLoading(true); setFilter(e.target.value); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Semua Status</option>
            <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
            <option value="terverifikasi">Terverifikasi</option>
            <option value="revisi">Revisi</option>
            <option value="draft">Draft</option>
          </select>
          <button
            onClick={() => { setLoading(true); fetchDokumen(); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <th className="px-5 py-3">Judul</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Divisi</th>
                  <th className="px-5 py-3">Tahun</th>
                  <th className="px-5 py-3">Diupload Oleh</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Tanggal Upload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((dok) => (
                  <tr key={dok.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900 max-w-xs truncate">{dok.judul}</td>
                    <td className="px-5 py-3 text-gray-600">{dok.kategori}</td>
                    <td className="px-5 py-3">
                      {dok.divisi
                        ? <span className="badge bg-cyan-100 text-cyan-800">{dok.divisi}</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-5 py-3 text-gray-600">{dok.tahun}</td>
                    <td className="px-5 py-3 text-gray-600">{dok.uploaded_by}</td>
                    <td className="px-5 py-3">
                      <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium', STATUS_BADGE[dok.status] || 'bg-gray-100')}>
                        {STATUS_LABEL[dok.status] ?? dok.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(dok.created_at).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length && (
              <div className="py-16 text-center text-gray-400">
                <FileSearch className="w-10 h-10 mx-auto mb-2 opacity-40" />
                Tidak ada dokumen
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
