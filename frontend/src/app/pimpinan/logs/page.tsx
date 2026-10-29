'use client';
import toast from 'react-hot-toast';


import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth';
import { Activity, Loader2, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { formatDateTime } from '@/lib/dateUtils';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

interface Log {
  id: number;
  aksi: string;
  entitas: string | null;
  entitas_id: number | null;
  detail: any;
  ip_address: string | null;
  created_at: string;
  user_nama: string | null;
  username: string | null;
}

const aksiColor: Record<string, string> = {
  login:              'bg-blue-100 text-blue-700',
  upload:             'bg-green-100 text-green-700',
  edit:               'bg-yellow-100 text-yellow-700',
  verifikasi:         'bg-purple-100 text-purple-700',
  submit_verifikasi:  'bg-orange-100 text-orange-700',
  hapus:              'bg-red-100 text-red-700',
  buat_user:          'bg-teal-100 text-teal-700',
  toggle_user:        'bg-gray-100 text-gray-700',
};

export default function PimpinanLogsPage() {
  const [logs,    setLogs]    = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [clearing, setClearing] = useState(false);
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const session = getSession();
      const res = await fetch(`${API}/pimpinan/logs?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setLogs(data.data ?? []);
      setTotal(data.meta?.total ?? 0);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat log');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  const clearLogs = async (days: number) => {
    const label = days === 0 ? 'semua riwayat' : `riwayat lebih dari ${days} hari`;
    if (!confirm(`Hapus ${label}? Aksi ini tidak bisa dibatalkan.`)) return;
    setClearing(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/pimpinan/logs?before_days=${days}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPage(1);
      await fetchLogs();
    } catch (e: any) {
      toast.error(e.message || 'Gagal menghapus riwayat');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Log Aktivitas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Riwayat semua aktivitas di sistem</p>
        </div>
        <div className="flex gap-2">
          {/* Dropdown hapus riwayat */}
          <div className="relative group">
            <button
              disabled={clearing}
              className="btn-secondary flex items-center gap-1.5 text-sm text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-60"
            >
              {clearing
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Trash2 className="w-4 h-4" />
              }
              Hapus Riwayat
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 hidden group-hover:block z-10">
              <button onClick={() => clearLogs(30)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Lebih dari 30 hari
              </button>
              <button onClick={() => clearLogs(90)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Lebih dari 90 hari
              </button>
              <button onClick={() => clearLogs(0)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                Hapus semua
              </button>
            </div>
          </div>
          <button onClick={fetchLogs} className="btn-secondary p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">Belum ada log aktivitas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Waktu</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Entitas</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {log.user_nama
                        ? <div><p className="font-medium text-gray-900 text-xs">{log.user_nama}</p>
                            <p className="text-xs text-gray-400">@{log.username}</p></div>
                        : <span className="text-xs text-gray-400">Sistem</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${aksiColor[log.aksi] ?? 'bg-gray-100 text-gray-600'}`}>
                        {log.aksi.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {log.entitas ? `${log.entitas}${log.entitas_id ? ` #${log.entitas_id}` : ''}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{log.ip_address ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">Total {total} log</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span className="px-3 py-1.5 text-xs text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

