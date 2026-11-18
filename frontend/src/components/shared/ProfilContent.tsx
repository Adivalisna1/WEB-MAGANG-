'use client';

import { useState, useRef, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSession, getProfilePhotoUrl } from '@/lib/auth';
import toast from 'react-hot-toast';
import { User, Lock, Loader2, AlertCircle, CheckCircle, Mail, AtSign, Eye, EyeOff, Camera, Trash2 } from 'lucide-react';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

export default function ProfilContent() {
  const { user, updateUserLocal } = useAuth();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [passLama,    setPassLama]    = useState('');
  const [passBaru,    setPassBaru]    = useState('');
  const [passKonfirm, setPassKonfirm] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const roleLabels: Record<string, string> = {
    pimpinan: 'Pimpinan',
    staff: 'Staff',
    ketua_tim: 'Eselon 1',
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

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 2 MB');
      return;
    }
    setPhotoUploading(true);
    try {
      const session = getSession();
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/user/profile-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.token}` },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || json.message || 'Gagal mengunggah foto profil');
      updateUserLocal({ foto_profil: json.data?.foto_profil || null });
      toast.success('Foto profil berhasil diperbarui!');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengunggah foto profil');
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    setPhotoUploading(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/user/profile-photo`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      if (!res.ok) throw new Error('Gagal menghapus foto profil');
      updateUserLocal({ foto_profil: null });
      toast.success('Foto profil dikembalikan ke default');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus foto profil');
    } finally {
      setPhotoUploading(false);
    }
  };

  const photoUrl = getProfilePhotoUrl(user?.foto_profil);

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Profil Saya</h1>

      {/* Info akun */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={user?.nama || 'Foto Profil'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center font-bold text-white text-xl shadow-md">
                  {user?.nama?.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                disabled={photoUploading}
                onClick={() => photoInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Ubah Foto Profil"
              >
                {photoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleUploadPhoto}
              />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{user?.nama}</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 mt-0.5">
                {roleLabels[user?.role || ''] || user?.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={photoUploading}
              onClick={() => photoInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              Ubah Foto
            </button>
            {photoUrl && (
              <button
                type="button"
                disabled={photoUploading}
                onClick={handleDeletePhoto}
                className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                title="Hapus Foto Profil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={val}
                  onChange={e => set(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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

