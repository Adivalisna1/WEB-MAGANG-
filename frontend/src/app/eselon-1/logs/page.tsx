'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth';
import {
  Activity, Loader2, RefreshCw, AlertCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface LogRow {
  id: number;
  aksi: string;
  entitas: string;
  detail: any;
  ip_address: string | null;
  created_at: string;
  user_nama: string | null;
  username: string | null;
}

interface Meta { total: number; page: number; limit: number; totalPages: number; }

export default function KetuaLogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      const session = getSession();
      const res = await fetch(`${API}/eselon-1/logs?page=${page}&limit=50`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setLogs(json.data);
      setMeta(json.meta);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Gagal memuat log');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const formatAksi = (aksi: string): string => {
    const kamus: Record<string, string> = {
      upload_rekening_koran: 'Upload Rekening Koran',
      upload_kertas_kerja: 'Upload Kertas Kerja',
      update_kertas_kerja: 'Update Kertas Kerja',
      delete_kertas_kerja: 'Hapus Kertas Kerja',
      create_kategori_akuntansi: 'Buat Kategori',
      create: 'Tambah Data',
      edit: 'Ubah Data',
      update_user: 'Update User',
      buat_user_bulk: 'Buat User (Banyak)',
      hapus_user: 'Hapus User',
      buat_user: 'Buat User',
      edit_kategori: 'Edit Kategori',
      reset_password_manual: 'Reset Password',
      kirim_notifikasi: 'Kirim Notifikasi',
    };
    return kamus[aksi] || aksi.replace(/_/g, ' ');
  };

  const formatDetail = (detail: any, aksi: string): string => {
    if (!detail) return '-';
    try {
      const obj = typeof detail === 'string' ? JSON.parse(detail) : detail;
      
      // Bahasa biasa berdasarkan tipe aksi
      if (aksi === 'upload_rekening_koran' || aksi === 'upload_kertas_kerja') {
        return `Mengunggah file dengan total ${obj.jumlah_baris || 0} baris data${obj.location ? ` dari ${obj.location}` : ''}.`;
      }
      if (aksi === 'update_user') {
        return `Memperbarui profil / hak akses untuk user "${obj.username || '?'}" (Role ID: ${obj.role_id || '?'}).`;
      }
      if (aksi === 'buat_user' || aksi === 'buat_user_bulk') {
        return `Mendaftarkan user baru "${obj.username || obj.file_name || '?'}".`;
      }
      if (aksi === 'reset_password_manual') {
        return `Melakukan reset password secara manual.`;
      }
      if (aksi === 'create' || aksi === 'edit') {
        if (obj.judul) return `Menyimpan data dengan judul "${obj.judul}".`;
        return `Melakukan perubahan atau penambahan data pada sistem.`;
      }
      if (aksi === 'hapus_user') {
        return `Menghapus akun user "${obj.username || '?'}" secara permanen.`;
      }
      if (aksi === 'kirim_notifikasi') {
        return `Mengirim notifikasi sistem berjudul "${obj.judul || '?'}".`;
      }
      
      return Object.entries(obj)
        .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(', ');
    } catch {
      return String(detail);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log Aktivitas</h1>
        </div>
        <button
          onClick={() => { setLoading(true); fetchLogs(); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
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
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                    <th className="px-5 py-3">Waktu</th>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Aksi</th>
                    <th className="px-5 py-3">Detail</th>
                    <th className="px-5 py-3">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-3 text-gray-800">{log.user_nama ?? 'System'}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 capitalize">
                          {formatAksi(log.aksi)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs max-w-md truncate">
                        {formatDetail(log.detail, log.aksi)}
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{log.ip_address ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!logs.length && (
                <div className="py-16 text-center text-gray-400">
                  <Activity className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  Belum ada log aktivitas
                </div>
              )}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Total {meta.total} log — halaman {meta.page}/{meta.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    disabled={page >= meta.totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
