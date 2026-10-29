'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth';
import {
  Users, Loader2, RefreshCw, AlertCircle, Search
} from 'lucide-react';
import clsx from 'clsx';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

interface UserRow {
  id: number;
  nama: string;
  username: string;
  email: string;
  role: string;
  is_active: number;
  is_online: number | null;
  last_login: string | null;
  password_reset_at: string | null;
  satker_nama: string | null;
}

const ROLE_BADGE: Record<string, string> = {
  operator: 'bg-blue-100 text-blue-700',
  manajemen: 'bg-yellow-100 text-yellow-700',
  administrasi: 'bg-yellow-100 text-yellow-700',
  it: 'bg-purple-100 text-purple-700',
  pimpinan_satker: 'bg-yellow-100 text-yellow-700',
  staff_satker: 'bg-blue-100 text-blue-700',
  Pimpinan: 'bg-yellow-100 text-yellow-700',
  Satker: 'bg-blue-100 text-blue-700',
  ketua_tim: 'bg-indigo-100 text-indigo-700',
};
const ROLE_LABEL: Record<string, string> = {
  operator: 'Operator',
  manajemen: 'Manajemen',
  administrasi: 'Manajemen',
  it: 'IT Admin',
  pimpinan_satker: 'Manajemen Satker',
  staff_satker: 'Operator Satker',
  ketua_tim: 'Eselon 1',
  satker: 'Satker',
};

function formatTanggal(dt: string | null): string {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function KetuaUsersPage() {
  const [users,      setUsers]      = useState<UserRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchUsers = useCallback(async () => {
    try {
      const session = getSession();
      const res = await fetch(`${API}/eselon-1/users`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || json.message);
      setUsers(json.data);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Gagal memuat daftar user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredUsers = users.filter(user =>
    user.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.satker_nama?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pemantauan Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">
            Memantau status dan riwayat login pengguna Satker & Unit binaan. Pengelolaan akun (reset password & aktivasi) dikelola oleh Staff IT.
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchUsers(); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm max-w-md">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Cari nama atau pengguna atau satker..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
        />
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
                  <th className="px-5 py-3">Pengguna</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Satker</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Login Terakhir</th>
                  <th className="px-5 py-3">Reset Password Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                            {user.nama.charAt(0).toUpperCase()}
                          </div>
                          {user.is_online === 1 && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.nama}</p>
                          <p className="text-xs text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium', ROLE_BADGE[user.role] || 'bg-gray-100')}>
                        {ROLE_LABEL[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 font-medium">
                      {user.satker_nama || '-'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={clsx(
                        'px-2.5 py-1 rounded-full text-xs font-medium',
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      )}>
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{formatTanggal(user.last_login)}</td>
                    <td className="px-5 py-3 text-gray-600">{formatTanggal(user.password_reset_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredUsers.length && (
              <div className="py-16 text-center text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                Belum ada pengguna
              </div>
            )}
            
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                <div className="text-sm text-gray-500">
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} dari {filteredUsers.length}
                </div>
                <div className="flex gap-2">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => p - 1)} 
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-xs text-gray-500 self-center">
                    Hal {currentPage} dari {Math.max(1, totalPages)}
                  </span>
                  <button 
                    disabled={currentPage >= totalPages} 
                    onClick={() => setCurrentPage(p => p + 1)} 
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
