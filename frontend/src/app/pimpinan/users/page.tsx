'use client';
import toast from 'react-hot-toast';


import { useEffect, useState, useCallback, FormEvent } from 'react';
import { getSession } from '@/lib/auth';
import {
  Users, UserPlus, UserCheck, UserX, Trash2,
  Loader2, RefreshCw, AlertCircle, Wifi, WifiOff, X, KeyRound
} from 'lucide-react';
import { formatDateTime } from '@/lib/dateUtils';
import clsx from 'clsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  const [toggling,   setToggling]   = useState<number | null>(null);
  const [deleting,   setDeleting]   = useState<number | null>(null);

  // Reset password modal
  const [resetModal, setResetModal] = useState<{id: number; nama: string} | null>(null);
  const [resetPass,  setResetPass]  = useState('');
  const [resetting,  setResetting]  = useState(false);
  const [resetErr,   setResetErr]   = useState('');
  const [resetOk,    setResetOk]    = useState('');

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

  const toggleActive = async (id: number) => {
    setToggling(id);
    try {
      const session = getSession();
      const res = await fetch(`${API}/pimpinan/users/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message);
      await fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Gagal mengubah status user');
    } finally {
      setToggling(null);
    }
  };


  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetModal) return;
    setResetErr(''); setResetOk(''); setResetting(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/pimpinan/users/${resetModal.id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ password_baru: resetPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message);
      setResetOk(data.message || 'Password berhasil direset');
      setResetPass('');
      setTimeout(() => setResetModal(null), 1500);
    } catch (e: any) {
      setResetErr(e.message || 'Gagal mereset password');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola akun Staff</p>
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50:bg-slate-800/50 transition-colors">
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleActive(u.id)}
                          disabled={toggling === u.id}
                          className={clsx(
                            'inline-flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50',
                            u.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                          )}
                        >
                          {toggling === u.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : u.is_active
                              ? <><UserX className="w-3.5 h-3.5" /> Nonaktifkan</>
                              : <><UserCheck className="w-3.5 h-3.5" /> Aktifkan</>
                          }
                        </button>
                        <button
                          onClick={() => {
                            setResetPass(''); setResetErr(''); setResetOk('');
                            setResetModal({id: u.id, nama: u.nama});
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-yellow-600 transition-colors"
                          title="Reset password"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Reset PW
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Modal reset password */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Reset Password</h3>
              <button onClick={() => setResetModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Reset password untuk <strong>{resetModal.nama}</strong></p>
              {resetErr && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {resetErr}
                </div>
              )}
              {resetOk && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
                  {resetOk}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
                <input
                  type="password"
                  value={resetPass}
                  onChange={e => setResetPass(e.target.value)}
                  placeholder="Min. 6 karakter"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={resetting || resetPass.length < 6}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {resetting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Reset Password
                </button>
                <button type="button" onClick={() => setResetModal(null)} className="flex-1 btn-secondary py-2.5">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

