'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSession } from '@/lib/auth';
import {
  Save, ArrowLeft, Loader2,
  AlertCircle, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Kategori { id: number; nama: string; }
interface Dokumen {
  id: number; judul: string; tahun: number;
  kategori_id?: number; deskripsi: string | null;
  status: string; file_nama: string;
}

const TAHUN_LIST = Array.from(
  { length: new Date().getFullYear() - 2014 },
  (_, i) => new Date().getFullYear() - i
);

export default function EditDokumenPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [dokumen,     setDokumen]     = useState<Dokumen | null>(null);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [judul,       setJudul]       = useState('');
  const [tahun,       setTahun]       = useState('');
  const [kategoriId,  setKategoriId]  = useState('');
  const [deskripsi,   setDeskripsi]   = useState('');
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);

  useEffect(() => {
    const session = getSession();

    Promise.all([
      fetch(`${API}/dokumen/all`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      }).then(r => r.json()),
      fetch(`${API}/dokumen/kategori`).then(r => r.json()),
    ])
      .then(([dokRes, katRes]) => {
        const found = (dokRes.data as Dokumen[]).find(d => String(d.id) === id);
        if (!found) { router.replace('/staff/dokumen'); return; }
        setDokumen(found);
        setJudul(found.judul);
        setTahun(String(found.tahun));
        setDeskripsi(found.deskripsi ?? '');
        setKategoriList(katRes.data ?? []);
      })
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          judul,
          tahun: Number(tahun),
          kategori_id: kategoriId ? Number(kategoriId) : undefined,
          deskripsi: deskripsi || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan');
      setSuccess(true);
      setTimeout(() => router.push('/staff/dokumen'), 1500);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h2 className="text-xl font-bold text-gray-800">Perubahan Tersimpan!</h2>
        <p className="text-gray-500 text-sm">Mengalihkan ke daftar dokumen...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/staff/dokumen" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Edit Dokumen</h1>
        {dokumen && (
          <p className="text-sm text-gray-500 mt-0.5">
            File: <span className="font-medium">{dokumen.file_nama}</span>
            {' · '}
            <span className={`capitalize ${dokumen.status === 'ditolak' ? 'text-red-600' : 'text-gray-500'}`}>
              {dokumen.status.replace('_', ' ')}
            </span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Judul */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Judul Dokumen <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={judul}
            onChange={e => setJudul(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Kategori & Tahun */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
            <select
              value={kategoriId}
              onChange={e => setKategoriId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">Tidak diubah</option>
              {kategoriList.map(k => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tahun</label>
            <select
              value={tahun}
              onChange={e => setTahun(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {TAHUN_LIST.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <textarea
            value={deskripsi}
            onChange={e => setDeskripsi(e.target.value)}
            rows={3}
            placeholder="Deskripsi singkat dokumen..."
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Info file tidak bisa diubah */}
        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-3">
          File tidak dapat diubah. Untuk mengganti file, hapus dokumen ini dan upload ulang.
        </p>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !judul}
            className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <Link href="/staff/dokumen" className="btn-secondary">Batal</Link>
        </div>
      </form>
    </div>
  );
}
