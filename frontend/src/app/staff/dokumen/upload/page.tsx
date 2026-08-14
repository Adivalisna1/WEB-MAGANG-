'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import {
  Upload, FileText, X, CheckCircle,
  Loader2, AlertCircle, ArrowLeft, CloudUpload
} from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Kategori { id: number; nama: string; slug: string; }

const TAHUN_LIST = Array.from(
  { length: new Date().getFullYear() - 2014 },
  (_, i) => new Date().getFullYear() - i
);

export default function UploadPage() {
  const router = useRouter();

  const [kategoriList,      setKategoriList]      = useState<Kategori[]>([]);
  const [kategoriLoading,   setKategoriLoading]   = useState(true);
  const [kategoriError,     setKategoriError]     = useState('');
  const [judul,       setJudul]       = useState('');
  const [tahun,       setTahun]       = useState(String(new Date().getFullYear()));
  const [bulan,       setBulan]       = useState('');
  const [kategoriId,  setKategoriId]  = useState('');
  const [deskripsi,   setDeskripsi]   = useState('');
  const [file,        setFile]        = useState<File | null>(null);
  const [dragging,    setDragging]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const fetchKategori = async () => {
    setKategoriLoading(true);
    setKategoriError('');
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/kategori`, {
        headers: session ? { Authorization: `Bearer ${session.token}` } : {},
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const d = await res.json();
      const list: Kategori[] = d.data ?? [];
      if (list.length === 0) {
        setKategoriError('Belum ada kategori. Minta admin untuk menambahkan kategori terlebih dahulu.');
      }
      setKategoriList(list);
    } catch (err: any) {
      setKategoriError(err.message || 'Gagal memuat kategori. Pastikan backend berjalan di localhost:5000.');
    } finally {
      setKategoriLoading(false);
    }
  };

  useEffect(() => { fetchKategori(); }, []);

  const handleFilePick = (picked: File | null) => {
    if (!picked) return;
    const allowed = ['application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowed.includes(picked.type)) {
      setError('Format tidak didukung. Gunakan PDF, DOC, DOCX, XLS, atau XLSX.');
      return;
    }
    if (picked.size > 500 * 1024 * 1024) {
      setError('Ukuran file melebihi 500MB.');
      return;
    }
    setError('');
    setFile(picked);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    handleFilePick(e.dataTransfer.files[0] ?? null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file)       return setError('File wajib dipilih');
    if (!kategoriId) return setError('Kategori wajib dipilih');
    setError(''); setSubmitting(true);

    try {
      const session = getSession();
      const fd = new FormData();
      fd.append('file',        file);
      fd.append('judul',       judul);
      fd.append('tahun',       tahun);
      if (bulan) fd.append('bulan', bulan);
      fd.append('kategori_id', kategoriId);
      if (deskripsi) fd.append('deskripsi', deskripsi);

      const res = await fetch(`${API}/dokumen/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload gagal');
      setSuccess(true);
      setTimeout(() => router.push('/staff/dokumen'), 1500);
    } catch (err: any) {
      setError(err.message || 'Upload gagal, coba lagi');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSize = (b: number) => b < 1024 * 1024
    ? `${(b / 1024).toFixed(1)} KB`
    : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h2 className="text-xl font-bold text-gray-800">Upload Berhasil!</h2>
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
        <h1 className="text-xl font-bold text-gray-900">Upload Dokumen</h1>
        <p className="text-sm text-gray-500 mt-0.5">Dokumen akan tersimpan sebagai draft, lalu kamu bisa submit untuk diverifikasi.</p>
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
            placeholder="Contoh: LKjIP Tahun 2024"
            required
            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Kategori, Bulan & Tahun */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Kategori <span className="text-red-500">*</span>
            </label>
            {kategoriError ? (
              <div className="flex items-center justify-between gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
                <span>{kategoriError}</span>
                <button type="button" onClick={fetchKategori} className="shrink-0 underline font-medium hover:text-red-900">Coba Lagi</button>
              </div>
            ) : (
              <select
                value={kategoriId}
                onChange={e => setKategoriId(e.target.value)}
                required
                disabled={kategoriLoading}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">{kategoriLoading ? 'Memuat kategori...' : 'Pilih kategori'}</option>
                {kategoriList.map(k => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bulan <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <select
                value={bulan}
                onChange={e => setBulan(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">Semua</option>
                <option value="1">Januari</option>
                <option value="2">Februari</option>
                <option value="3">Maret</option>
                <option value="4">April</option>
                <option value="5">Mei</option>
                <option value="6">Juni</option>
                <option value="7">Juli</option>
                <option value="8">Agustus</option>
                <option value="9">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tahun <span className="text-red-500">*</span>
              </label>
              <select
                value={tahun}
                onChange={e => setTahun(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {TAHUN_LIST.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
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

        {/* Dropzone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            File <span className="text-red-500">*</span>
          </label>
          {file ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <FileText className="w-8 h-8 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
              </div>
              <button type="button" onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              <CloudUpload className={`w-10 h-10 mx-auto mb-2 ${dragging ? 'text-primary-500' : 'text-gray-300'}`} />
              <p className="text-sm font-medium text-gray-700">Drag & drop file di sini</p>
              <p className="text-xs text-gray-400 mt-1">atau klik untuk pilih file</p>
              <p className="text-xs text-gray-400 mt-2">PDF, DOC, DOCX, XLS, XLSX • Maks 500MB</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            className="hidden"
            onChange={e => handleFilePick(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !file || !judul || !kategoriId || !!kategoriError}
            className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {submitting ? 'Mengupload...' : 'Upload Dokumen'}
          </button>
          <Link href="/staff/dokumen" className="btn-secondary">Batal</Link>
        </div>
      </form>
    </div>
  );
}
