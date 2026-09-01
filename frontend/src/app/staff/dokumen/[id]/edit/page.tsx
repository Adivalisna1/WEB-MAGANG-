'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSession } from '@/lib/auth';
import {
  Save, ArrowLeft, Loader2, AlertCircle,
  CheckCircle, CloudUpload, FileText, X, RefreshCw, DollarSign
} from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Kategori { id: number; nama: string; perlu_nominal: number; }
interface Dokumen {
  id: number; judul: string; tahun: number; bulan: number | null;
  semester: number | null; nomor_laporan: string | null;
  kategori_id?: number; deskripsi: string | null;
  status: string; file_nama: string; file_size: number;
  catatan: string | null;
  catatan_oleh: string | null;
  nilai_rekening_koran: number | null;
  nilai_excel: number | null;
}

const TAHUN_LIST = Array.from(
  { length: new Date().getFullYear() - 2014 },
  (_, i) => new Date().getFullYear() - i
);

const formatSize = (b: number) => b < 1024 * 1024
  ? `${(b / 1024).toFixed(1)} KB`
  : `${(b / (1024 * 1024)).toFixed(1)} MB`;

export default function EditDokumenPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [dokumen,      setDokumen]      = useState<Dokumen | null>(null);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);

  // State metadata
  const [judul,      setJudul]      = useState('');
  const [tahun,      setTahun]      = useState('');
  const [jenisPeriode, setJenisPeriode] = useState<'bulan' | 'semester'>('bulan');
  const [bulan,      setBulan]      = useState('');
  const [semester,   setSemester]   = useState('');
  const [kategoriId, setKategoriId] = useState('');
  const [deskripsi,  setDeskripsi]  = useState('');

  // Total Saldo (opsional, hanya untuk kategori perlu_nominal)
  const [totalSaldo, setTotalSaldo] = useState('');

  // State ganti file
  const [fileBaruPicked, setFileBaruPicked] = useState<File | null>(null);
  const [dragging,       setDragging]       = useState(false);
  const [gantiLoading,   setGantiLoading]   = useState(false);
  const [gantiSuccess,   setGantiSuccess]   = useState('');
  const [gantiError,     setGantiError]     = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // State form metadata
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);

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
        setJenisPeriode(found.semester ? 'semester' : 'bulan');
        setBulan(found.bulan != null ? String(found.bulan) : '');
        setSemester(found.semester != null ? String(found.semester) : '');
        setDeskripsi(found.deskripsi ?? '');
        setKategoriList(katRes.data ?? []);
        // Load total saldo
        if (found.nilai_rekening_koran != null) setTotalSaldo(Number(found.nilai_rekening_koran).toLocaleString('id-ID'));
      })
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setLoading(false));
  }, [id, router]);

  // Handler pilih file baru
  const handleFilePick = (picked: File | null) => {
    if (!picked) return;
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowed.includes(picked.type)) {
      setGantiError('Format tidak didukung. Gunakan PDF, DOC, DOCX, XLS, XLSX.');
      return;
    }
    if (picked.size > 50 * 1024 * 1024) {
      setGantiError('Ukuran file melebihi 50MB.');
      return;
    }
    setGantiError('');
    setGantiSuccess('');
    setFileBaruPicked(picked);
  };

  // Submit ganti file
  const handleGantiFile = async () => {
    if (!fileBaruPicked) return;
    setGantiLoading(true); setGantiError(''); setGantiSuccess('');
    try {
      const session = getSession();
      const fd = new FormData();
      fd.append('file', fileBaruPicked);
      const res = await fetch(`${API}/dokumen/${id}/file`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session?.token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengganti file');
      setGantiSuccess(`File berhasil diganti menjadi: ${data.data.file_nama}`);
      setFileBaruPicked(null);
      // Update nama file di state dokumen
      setDokumen(prev => prev ? { ...prev, file_nama: data.data.file_nama, file_size: fileBaruPicked.size } : prev);
    } catch (err: any) {
      setGantiError(err.message || 'Gagal mengganti file');
    } finally {
      setGantiLoading(false);
    }
  };

  // Submit metadata
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
          // Periode: pilih salah satu — bulan ATAU semester
          bulan: bulan ? Number(bulan) : null,
          semester: semester ? Number(semester) : null,
          kategori_id: kategoriId ? Number(kategoriId) : undefined,
          deskripsi: deskripsi || undefined,
          nilai_rekening_koran: totalSaldo ? Number(totalSaldo.replace(/\./g, '')) : null,
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

  const canReplaceFile = dokumen?.status === 'revisi' || dokumen?.status === 'draft';

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
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">
              File saat ini: <span className="font-medium text-gray-700">{dokumen.file_nama}</span>
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              dokumen.status === 'revisi' ? 'bg-orange-100 text-orange-700' :
              dokumen.status === 'draft'  ? 'bg-gray-100 text-gray-600' :
              'bg-blue-100 text-blue-700'
            }`}>
              {dokumen.status.replace(/_/g, ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Catatan revisi dari reviewer (Admin / Ketua Tim) */}
      {dokumen?.catatan && dokumen.status === 'revisi' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-orange-700 mb-1">
            Catatan Revisi dari {dokumen.catatan_oleh === 'ketua_tim' ? 'Ketua Tim' : 'Admin'}:
          </p>
          <p className="text-sm text-orange-800">{dokumen.catatan}</p>
        </div>
      )}

      {/* Section Ganti File */}
      {canReplaceFile && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Ganti File Dokumen</h2>
            <span className="text-xs text-gray-400">(opsional)</span>
          </div>

          {gantiError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {gantiError}
            </div>
          )}
          {gantiSuccess && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              <CheckCircle className="w-4 h-4 shrink-0" /> {gantiSuccess}
            </div>
          )}

          {/* File lama */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
            <FileText className="w-5 h-5 text-gray-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">File saat ini</p>
              <p className="text-sm font-medium text-gray-700 truncate">{dokumen?.file_nama}</p>
              {dokumen?.file_size && <p className="text-xs text-gray-400">{formatSize(dokumen.file_size)}</p>}
            </div>
          </div>

          {/* Dropzone file baru */}
          {fileBaruPicked ? (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <FileText className="w-8 h-8 text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-500">File baru dipilih</p>
                <p className="text-sm font-medium text-gray-900 truncate">{fileBaruPicked.name}</p>
                <p className="text-xs text-gray-500">{formatSize(fileBaruPicked.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setFileBaruPicked(null)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFilePick(e.dataTransfer.files[0] ?? null); }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              <CloudUpload className={`w-8 h-8 mx-auto mb-2 ${dragging ? 'text-primary-500' : 'text-gray-300'}`} />
              <p className="text-sm font-medium text-gray-700">Drag & drop file pengganti</p>
              <p className="text-xs text-gray-400 mt-1">atau klik untuk pilih file</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, XLS, XLSX • Maks 50MB</p>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            className="hidden"
            onChange={e => handleFilePick(e.target.files?.[0] ?? null)}
          />

          <button
            type="button"
            onClick={handleGantiFile}
            disabled={!fileBaruPicked || gantiLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {gantiLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengganti File...</>
              : <><RefreshCw className="w-4 h-4" /> Ganti File Sekarang</>
            }
          </button>
        </div>
      )}

      {/* Form metadata */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <Save className="w-4 h-4 text-primary-600" />
          Edit Metadata Dokumen
        </h2>

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

        {/* Kategori */}
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

        {/* Bulan & Tahun */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Periode <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs">
              <button type="button" onClick={() => setJenisPeriode('bulan')}
                className={`flex-1 py-2 font-medium transition-colors ${jenisPeriode === 'bulan' ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                Bulan
              </button>
              <button type="button" onClick={() => setJenisPeriode('semester')}
                className={`flex-1 py-2 font-medium transition-colors ${jenisPeriode === 'semester' ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                Semester
              </button>
            </div>
            {jenisPeriode === 'bulan' ? (
              <select
                value={bulan}
                onChange={e => setBulan(e.target.value)}
                className="w-full mt-2 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">Tanpa bulan</option>
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
            ) : (
              <select
                value={semester}
                onChange={e => setSemester(e.target.value)}
                className="w-full mt-2 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">Tanpa semester</option>
                <option value="1">Semester 1 (Jan–Jun)</option>
                <option value="2">Semester 2 (Jul–Des)</option>
              </select>
            )}
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

        {/* Total Saldo (hanya muncul jika kategori butuh nominal) */}
        {(() => {
          const katId = kategoriId || (dokumen?.kategori_id ? String(dokumen.kategori_id) : '');
          const selKat = kategoriList.find(k => String(k.id) === katId);
          if (!selKat?.perlu_nominal) return null;
          return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Total Saldo
              </h3>
              <p className="text-xs text-emerald-700">
                Masukkan total saldo sesuai dokumen yang diupload.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Total Saldo (Rp) <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">Rp</span>
                  <input
                    type="text"
                    value={totalSaldo}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setTotalSaldo(raw ? Number(raw).toLocaleString('id-ID') : '');
                    }}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {totalSaldo && (
                  <p className="text-xs text-emerald-700 mt-1.5 font-medium">
                    Rp {totalSaldo}
                  </p>
                )}
              </div>
            </div>
          );
        })()}
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
