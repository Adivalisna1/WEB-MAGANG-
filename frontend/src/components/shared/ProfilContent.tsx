'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import { User, Lock, Loader2, AlertCircle, CheckCircle, Mail, AtSign, Clock } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProfilContent() {
  const { user } = useAuth();

  const [passLama,    setPassLama]    = useState('');
  const [passBaru,    setPassBaru]    = useState('');
  const [passKonfirm, setPassKonfirm] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');

  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    staff: 'Staff',
    ketua_tim: 'Ketua Tim',
  };

  const handleGantiPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (passBaru !== passKonfirm) return setError('Konfirmasi password tidak sesuai');
    if (passBaru.length < 6)      return setError('Password baru minimal 6 karakter');
    setError(''); setSuccess(''); setLoading(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/user/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ password_lama: passLama, password_baru: passBaru }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Password berhasil diubah. Silakan login ulang.');
      setPassLama(''); setPassBaru(''); setPassKonfirm('');
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Profil Saya</h1>

      {/* Info akun */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center font-bold text-white text-xl shadow-md">
            {user?.nama?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{user?.nama}</p>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 mt-0.5">
              {roleLabels[user?.role || ''] || user?.role}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <AtSign className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-gray-400 text-xs">Username</p>
              <p className="font-medium mt-0.5">{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-gray-400 text-xs">Email</p>
              <p className="font-medium mt-0.5 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ganti password */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Ganti Password
        </h2>
        <form onSubmit={handleGantiPassword} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              <CheckCircle className="w-4 h-4 shrink-0" /> {success}
            </div>
          )}
          {[
            { label: 'Password Lama',      val: passLama,    set: setPassLama },
            { label: 'Password Baru',      val: passBaru,    set: setPassBaru },
            { label: 'Konfirmasi Password', val: passKonfirm, set: setPassKonfirm },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                type="password"
                value={val}
                onChange={e => set(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Simpan Password
          </button>
        </form>
      </div>
    </div>
  );
}
