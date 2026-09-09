'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth';
import {
  Send, Loader2, AlertCircle, CheckCircle, Users, UserRound
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface UserOption {
  id: number;
  nama: string;
  username: string;
  role: string;
}

export default function KirimNotifikasiPage() {
  const [users,    setUsers]    = useState<UserOption[]>([]);
  const [target,   setTarget]   = useState<string>('all');
  const [judul,    setJudul]    = useState('');
  const [pesan,    setPesan]    = useState('');
  const [sending,  setSending]  = useState(false);
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');

  // Daftar user untuk dropdown target
  const fetchUsers = useCallback(async () => {
    try {
      const session = getSession();
      const res = await fetch(`${API}/eselon-1/users`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setUsers(json.data);
    } catch { /* dropdown target tetap bisa dipakai dengan opsi 'all' */ }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleKirim = async () => {
    if (!pesan.trim()) {
      setError('Pesan wajib diisi');
      return;
    }

    let labelTarget: string;
    if (target === 'all') {
      labelTarget = 'semua user';
    } else {
      labelTarget = users.find((u: UserOption) => String(u.id) === target)?.nama ?? 'user terpilih';
    }
    if (!confirm(`Kirim notifikasi ke ${labelTarget}?`)) return;

    setSending(true);
    setSuccess('');
    setError('');
    try {
      const session = getSession();
      const res = await fetch(`${API}/eselon-1/notifikasi/kirim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          target,
          pesan: pesan.trim(),
          judul: judul.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setSuccess(json.message);
      setPesan('');
      setJudul('');
    } catch (e: any) {
      setError(e.message || 'Gagal mengirim notifikasi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kirim Notifikasi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kirim pengumuman ke semua user atau pesan ke satu user tertentu
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-4 rounded-lg">
          <CheckCircle className="w-5 h-5 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* Target */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tujuan Notifikasi
          </label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              type="button"
              onClick={() => setTarget('all')}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
                target === 'all'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" /> Semua User
            </button>
            <button
              type="button"
              onClick={() => setTarget('')}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
                target !== 'all'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <UserRound className="w-4 h-4" /> Satu User
            </button>
          </div>
          {target !== 'all' && (
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">— Pilih user —</option>
              {users.map((u: UserOption) => (
                <option key={u.id} value={u.id}>
                  {u.nama} (@{u.username}) — {u.role.replace('_', ' ')}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Judul */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Judul <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <input
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Contoh: Pengumuman Rapat"
            maxLength={255}
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Pesan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Pesan <span className="text-red-500">*</span>
          </label>
          <textarea
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            rows={5}
            placeholder="Tulis pesan atau pengumuman di sini..."
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <button
          onClick={handleKirim}
          disabled={sending || !pesan.trim() || (target !== 'all' && !target)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {sending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className="w-4 h-4" />}
          {sending ? 'Mengirim...' : 'Kirim Notifikasi'}
        </button>
      </div>
    </div>
  );
}
