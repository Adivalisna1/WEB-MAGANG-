'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth';
import {
  Users, Loader2, RefreshCw, AlertCircle, Wifi, WifiOff
} from 'lucide-react';
import { formatDateTime } from '@/lib/dateUtils';
import clsx from 'clsx';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

interface User {
  id: number;
  nama: string;
  username: string;
  email: string;
  role: string;
  is_active: number;
  is_online: number | null;
  last_login: string | null;
  created_at: string;
}

export default function PimpinanUsersPage() {
  const [users,      setUsers]      = useState<User[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const session = getSession();
      const res = await fetch(`${API}/pimpinan/users`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message);
      setUsers(data.data ?? []);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pemantauan Pengguna Satker</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Memantau status dan riwayat login pengguna Satker. Pengelolaan akun (reset password & status) dikelola oleh Staff IT.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchUsers} className="btn-secondary p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-colors duration-200">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Online</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center font-semibold text-primary-700 text-sm shrink-0">
                          {u.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.nama}</p>
                          <p className="text-xs text-gray-400">@{u.username} · {u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-blue-100 text-blue-800 capitalize">
                        {u.role === 'operator' ? 'Operator' : (u.role === 'staff_satker' ? 'Operator' : u.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge', u.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                      )}>
                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_online
                        ? <span className="flex items-center gap-1 text-xs text-green-600"><Wifi className="w-3.5 h-3.5" /> Online</span>
                        : <span className="flex items-center gap-1 text-xs text-gray-400"><WifiOff className="w-3.5 h-3.5" /> Offline</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDateTime(u.last_login)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
