'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth';
import {
  Send, Loader2, AlertCircle, CheckCircle
} from 'lucide-react';
import UserCombobox from '@/components/shared/UserCombobox';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface UserOption {
  id: number;
  nama: string;
  username: string;
  role: string;
}

export default function KirimNotifikasiPage() {
  const [users,    setUsers]    = useState<UserOption[]>([]);
  const [target,   setTarget]   = useState<string>(''); // Default empty
  const [judul,    setJudul]    = useState('');
  const [pesan,    setPesan]    = useState('');
  const [sending,  setSending]  = useState(false);
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');

  // Daftar user untuk dropdown target
  const fetchUsers = useCallback(async () => {
    try {
      const session = getSession();
      const res = await fetch(`${API}/administrasi/users`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setUsers(json.data);
    } catch { /* ignore error, just keep users empty */ }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleKirim = async () => {
    if (!target) {
      setError('Silakan pilih tujuan notifikasi');
      return;
    }
    if (!pesan.trim()) {
      setError('Pesan wajib diisi');
      return;
    }

    let labelTarget: string;
    if (target === 'all') {
      labelTarget = 'Semua User';
    } else if (target === 'satker') {
      labelTarget = 'Seluruh Satker';
    } else {
      labelTarget = users.find((u: UserOption) => String(u.id) === target)?.nama ?? 'user terpilih';
    }
    if (!confirm(`Kirim notifikasi ke ${labelTarget}?`)) return;

    setSending(true);
    setSuccess('');
    setError('');
    try {
      const session = getSession();
      const res = await fetch(`${API}/administrasi/notifikasi/kirim`, {
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
      setTarget('');
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
          Kirim pengumuman ke user yang relevan
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
          <UserCombobox 
            users={users} 
            value={target} 
            onChange={setTarget} 
          />
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
          disabled={sending || !pesan.trim() || !target}
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
