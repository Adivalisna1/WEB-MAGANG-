'use client';
import toast from 'react-hot-toast';


import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth';
import {
  Users, Loader2, RefreshCw, AlertCircle, KeyRound,
  Power, Copy, CheckCircle, X, Search
} from 'lucide-react';
import clsx from 'clsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

interface ResetResult {
  nama: string;
  username: string;
  password_baru: string;
}

const ROLE_BADGE: Record<string, string> = {
  Pimpinan:     'bg-yellow-100 text-yellow-700',
  Satker:     'bg-blue-100 text-blue-700',
  ketua_tim: 'bg-indigo-100 text-indigo-700',
};
const ROLE_LABEL: Record<string, string> = {
  Pimpinan: 'pimpinan', satker: 'Satker', ketua_tim: 'Eselon 1',
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
  const [processing, setProcessing] = useState<number | null>(null);
  const [resetting,  setResetting]  = useState<number | null>(null);
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);
  const [copied,     setCopied]     = useState(false);
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
      if (!res.ok) throw new Error(json.message);
      setUsers(json.data);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Gagal memuat daftar user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggle = async (user: UserRow) => {
    const aksi = user.is_active ? 'menonaktifkan' : 'mengaktifkan';
    if (!confirm(`Yakin ingin ${aksi} user "${user.nama}"?`)) return;

    setProcessing(user.id);
    try {
      const session = getSession();
      const res = await fetch(`${API}/eselon-1/users/${user.id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      await fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Gagal mengubah status user');
    } finally {
      setProcessing(null);
    }
  };

  const handleReset = async (user: UserRow) => {
    if (!confirm(`Reset password untuk "${user.nama}"? Password lama langsung tidak berlaku.`)) return;

    setResetting(user.id);
    try {
      const session = getSession();
      const res = await fetch(`${API}/eselon-1/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setResetResult(json.data);
      setCopied(false);
      await fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Gagal reset password');
    } finally {
      setResetting(null);
    }
  };

  const copyPassword = async () => {
    if (!resetResult) return;
    try {
      await navigator.clipboard.writeText(resetResult.password_baru);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard tidak tersedia */ }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola status akun dan reset password Pimpinan & Satker
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
                  <th className="px-5 py-3 text-right">Aksi</th>
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
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReset(user)}
                          disabled={resetting === user.id}
                          title="Reset password"
                          className="p-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50"
                        >
                          {resetting === user.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <KeyRound className="w-4 h-4" />}
                        </button>
                        {/* Eselon 1 HANYA bisa mengubah Pimpinan */}
                        {user.role === 'pimpinan' && (
                          <button
                            onClick={() => handleToggle(user)}
                            disabled={processing === user.id}
                            title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            className={clsx(
                              'p-2 rounded-lg transition-colors disabled:opacity-50',
                              user.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                            )}
                          >
                            {processing === user.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Power className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
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
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-white disabled:opacity-50 transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(p => p + 1)} 
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-white disabled:opacity-50 transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal hasil reset password — tampil SEKALI */}
      {resetResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Password Berhasil Direset</h3>
              <button
                onClick={() => setResetResult(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p>
                  Password baru untuk <strong>{resetResult.nama}</strong> (@{resetResult.username}).
                  Notifikasi juga sudah dikirim ke user tersebut.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Password baru:</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-lg font-bold text-gray-900 tracking-wide">
                    {resetResult.password_baru}
                  </code>
                  <button
                    onClick={copyPassword}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm text-orange-700 bg-orange-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  <strong>Catat sekarang!</strong> Password ini hanya ditampilkan sekali dan tidak
                  bisa dilihat lagi. Sampaikan ke user melalui jalur yang aman.
                </p>
              </div>
              <button
                onClick={() => setResetResult(null)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

