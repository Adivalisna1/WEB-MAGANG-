'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import toast from 'react-hot-toast';
import {
  Upload, FileText, X, CheckCircle,
  Loader2, AlertCircle, ArrowLeft, CloudUpload, DollarSign, Sparkles, Brain, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

interface Kategori { id: number; nama: string; slug: string; perlu_nominal: number; }

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
  const [jenisPeriode, setJenisPeriode] = useState<'bulan' | 'semester'>('bulan');
  const [bulan,       setBulan]       = useState('');
  const [semester,    setSemester]    = useState('');
  const [kategoriId,  setKategoriId]  = useState('');
  const [deskripsi,   setDeskripsi]   = useState('');
  const [namaBank,    setNamaBank]    = useState('');
  const [nomorRekening, setNomorRekening] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState('');
  const [namaRekening, setNamaRekening] = useState('');
  const [file,        setFile]        = useState<File | null>(null);
  const [dragging,    setDragging]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);

  // AI Autofill state
  const [aiScanning,  setAiScanning]  = useState(false);
  const [aiResult,    setAiResult]    = useState<{judul?:string; tahun?:number; kategori?:string; semester?:number|null; nominal?:number|null; deskripsi?:string; confidence?:string} | null>(null);
  const [aiError,     setAiError]     = useState('');
  const [aiFilledFields, setAiFilledFields] = useState<string[]>([]);

  // Saldo Akhir (opsional, hanya untuk kategori perlu_nominal)
  const [totalSaldo, setTotalSaldo] = useState('');
  const [nilaiExcel, setNilaiExcel] = useState('');

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
      const u = session?.user as any;
      const isAdminRole = Boolean(u && (['administrasi', 'manajemen', 'pimpinan_satker', 'it', 'admin_it'].includes(u.role || '') || [2, 3].includes(Number(u.role_id)) || u.is_manajemen || u.is_it));
      const list: Kategori[] = (d.data ?? []).filter((k: Kategori) => isAdminRole || k.slug !== 'sk-piutang-satker');
      if (list.length === 0) {
        setKategoriError('Belum ada kategori. Minta Pimpinan untuk menambahkan kategori terlebih dahulu.');
      }
      setKategoriList(list);
    } catch (err: any) {
      setKategoriError(err.message || 'Gagal memuat kategori. Pastikan backend berjalan di localhost:5000.');
    } finally {
      setKategoriLoading(false);
    }
  };

  useEffect(() => { fetchKategori(); }, []);

  // ── AI Autofill: kirim file ke n8n webhook ──
  const scanWithAI = async (fileToScan: File) => {
    setAiScanning(true);
    setAiError('');
    setAiResult(null);
    setAiFilledFields([]);
    try {
      const fd = new FormData();
      fd.append('data', fileToScan, fileToScan.name);

      const res = await fetch('/api/ai-scan', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) throw new Error(`AI gagal (${res.status})`);
      const result = await res.json();
      setAiResult(result);

      // Auto-fill form fields dari hasil AI
      const filled: string[] = [];
      if (result.judul) {
        setJudul(result.judul);
        filled.push('judul');
      }
      if (result.tahun) {
        setTahun(String(result.tahun));
        filled.push('tahun');
      }
      if (result.kategori && kategoriList.length > 0) {
        const match = kategoriList.find(k =>
          k.nama.toLowerCase().includes(result.kategori.toLowerCase()) ||
          result.kategori.toLowerCase().includes(k.nama.toLowerCase())
        );
        if (match) {
          setKategoriId(String(match.id));
          filled.push('kategori');
        }
      }
      if (result.semester) {
        setJenisPeriode('semester');
        setSemester(String(result.semester));
        filled.push('semester');
      }
      if (result.nominal !== undefined && result.nominal !== null) {
        const formatted = Number(result.nominal).toLocaleString('id-ID');
        setTotalSaldo(formatted);
        filled.push('nominal');
      }
      if ((result as any).bank) {
        setNamaBank((result as any).bank);
        filled.push('nama_bank');
      }
      if ((result as any).nomor_rekening) {
        setNomorRekening((result as any).nomor_rekening);
        filled.push('nomor_rekening');
      }
      if ((result as any).tanggal_surat) {
        setTanggalSurat((result as any).tanggal_surat);
        filled.push('tanggal_surat');
      }
      if (result.nama_rekening) {
        setNamaRekening(result.nama_rekening);
        filled.push('nama_rekening');
      }
      if (result.deskripsi) {
        setDeskripsi(result.deskripsi);
        filled.push('deskripsi');
      }
      setAiFilledFields(filled);

      // Jika dokumen berupa scan/gambar (JPG/PNG) atau tidak ada data yang terbaca
      if (result.is_scanned_image || result.warning || (filled.length === 0 && !result.nominal && !result.bank)) {
        const warnText = result.warning || 'Web tidak dapat membaca teks dari dokumen ini (berupa hasil scan/gambar JPG/PNG). Mohon lengkapi formulir secara manual.';
        setAiError(warnText);
        toast.error('Web tidak bisa membaca dokumen scan/gambar. Mohon isi form secara manual.', { duration: 5000 });
      }
    } catch (err: any) {
      setAiError(err.message || 'AI tidak bisa membaca file ini');
    } finally {
      setAiScanning(false);
    }
  };

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
    if (picked.size > 50 * 1024 * 1024) {
      setError('Ukuran file melebihi 50MB.');
      return;
    }
    setError('');
    setFile(picked);

    // Otomatis scan pake AI begitu file dipilih
    scanWithAI(picked);
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
      // Periode: pilih salah satu — bulan ATAU semester
      if (jenisPeriode === 'bulan' && bulan) fd.append('bulan', bulan);
      if (jenisPeriode === 'semester' && semester) fd.append('semester', semester);
      fd.append('kategori_id', kategoriId);
      if (deskripsi) fd.append('deskripsi', deskripsi);
      if (namaRekening) fd.append('nama_rekening', namaRekening);
      if (namaBank) fd.append('nama_bank', namaBank);
      if (nomorRekening) fd.append('nomor_rekening', nomorRekening);
      if (tanggalSurat) fd.append('tanggal_surat', tanggalSurat);

      // Nominal (opsional, tergantung kategori)
      const selKat = kategoriList.find(k => String(k.id) === kategoriId);
      if (selKat?.perlu_nominal) {
        if (totalSaldo) fd.append('nilai_rekening_koran', totalSaldo.replace(/\./g, '').replace(',', '.'));
        if (nilaiExcel) fd.append('nilai_excel', nilaiExcel.replace(/\./g, '').replace(',', '.'));
      }

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

  const selectedKat = kategoriList.find(k => String(k.id) === kategoriId);
  const isSuratPembukaan = selectedKat?.slug === 'surat-pembukaan-rekening-koran';
  const isSuratPenutupan = selectedKat?.slug === 'surat-penutupan-rekening-koran';
  const isSuratRekening = isSuratPembukaan || isSuratPenutupan;

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
        {/* AI Scanning Indicator */}
        {aiScanning && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl px-5 py-4 animate-pulse">
            <Brain className="w-5 h-5 animate-spin" />
            <div>
              <p className="font-semibold">🤖 AI sedang membaca dokumen...</p>
              <p className="text-xs text-blue-500 mt-0.5">Menganalisis isi file untuk mengisi form otomatis</p>
            </div>
          </div>
        )}

        {/* AI Success */}
        {aiFilledFields.length > 0 && !aiScanning && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-5 py-4">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="font-semibold">✨ AI berhasil mengisi {aiFilledFields.length} field otomatis!</p>
              <p className="text-xs text-emerald-500 mt-0.5">
                Field terisi: {aiFilledFields.join(', ')}. Silakan periksa dan koreksi jika perlu.
              </p>
            </div>
          </div>
        )}

        {/* AI Error */}
        {aiError && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-medium">AI tidak bisa membaca file ini</p>
              <p className="text-xs mt-0.5">{aiError}. Silakan isi form secara manual.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Judul */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Judul Dokumen <span className="text-red-500">*</span>
            {aiFilledFields.includes('judul') && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600 font-normal bg-emerald-50 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> Terisi oleh AI
              </span>
            )}
          </label>
          <input
            type="text"
            value={judul}
            onChange={e => setJudul(e.target.value)}
            placeholder="Contoh: LKjIP Tahun 2024"
            required
            className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              aiFilledFields.includes('judul') ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-300'
            }`}
          />
        </div>

        {/* Nama Rekening Koran (Hanya tampil jika bukan surat pembukaan/penutupan) */}
        {!isSuratRekening && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama Rekening Koran (Atas Nama) <span className="text-gray-400 font-normal">(opsional)</span>
              {aiFilledFields.includes('nama_rekening') && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-600 font-normal bg-emerald-50 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> Terisi oleh AI
                </span>
              )}
            </label>
            <input
              type="text"
              value={namaRekening}
              onChange={e => setNamaRekening(e.target.value)}
              placeholder="Contoh: RPL 029 DITJEN DIKTI UGM OPR"
              className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                aiFilledFields.includes('nama_rekening') ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-300'
              }`}
            />
          </div>
        )}

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
              ) : (
                <select
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  className="w-full mt-2 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="">Semua</option>
                  <option value="1">Semester 1 (Jan–Jun)</option>
                  <option value="2">Semester 2 (Jul–Des)</option>
                </select>
              )}
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

        {/* Khusus Surat Pembukaan & Surat Penutupan Rekening Koran: Form Detail & Info Verifikasi Eselon 1 (Tanpa Saldo) */}
        {isSuratRekening && (
          <div className="bg-gradient-to-br from-blue-50/80 to-blue-50/80 border border-blue-200 rounded-xl p-5 space-y-3.5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl text-white shrink-0 ${isSuratPembukaan ? 'bg-blue-600' : 'bg-amber-600'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  {isSuratPembukaan ? 'Pengajuan Surat Pembukaan Rekening Koran' : 'Pengajuan Surat Penutupan Rekening Koran'}
                </h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {isSuratPembukaan
                    ? 'Dokumen akan diajukan ke Admin Eselon 1 untuk diverifikasi. Setelah disetujui, nomor rekening ini otomatis terdaftar dan aktif di Rekening Koran.'
                    : 'Dokumen akan diajukan ke Admin Eselon 1 untuk diverifikasi. Setelah disetujui, nomor rekening ini otomatis dinonaktifkan dari Rekening Koran.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Bank <span className="text-red-500">*</span>
                  {aiFilledFields.includes('nama_bank') && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5" /> Auto-filled
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={namaBank}
                  onChange={e => setNamaBank(e.target.value)}
                  placeholder="Contoh: Bank BNI / Bank Mandiri"
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nomor Rekening <span className="text-red-500">*</span>
                  {aiFilledFields.includes('nomor_rekening') && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5" /> Auto-filled
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={nomorRekening}
                  onChange={e => setNomorRekening(e.target.value)}
                  placeholder="Contoh: 9892496933191002"
                  required
                  className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isSuratPembukaan ? 'Tanggal Pembukaan Rekening' : 'Tanggal Penutupan Rekening'} <span className="text-red-500">*</span>
                  {aiFilledFields.includes('tanggal_surat') && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5" /> Auto-filled
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  value={tanggalSurat}
                  onChange={e => setTanggalSurat(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Rekening (Atas Nama)
                  {aiFilledFields.includes('nama_rekening') && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5" /> Auto-filled
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={namaRekening}
                  onChange={e => setNamaRekening(e.target.value)}
                  placeholder="Contoh: BPP 088 ITJEN KEMDIKTISAINTEK"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Saldo Akhir (hanya muncul jika kategori butuh nominal) */}
        {kategoriList.find(k => String(k.id) === kategoriId)?.perlu_nominal ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Saldo Akhir
            </h3>
            <p className="text-xs text-emerald-700">
              Masukkan Saldo Akhir sesuai dokumen yang diupload.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Saldo Akhir (Rp) <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">Rp</span>
                <input
                  type="text"
                  value={totalSaldo}
                  onChange={e => {
                    // Izinkan angka, titik (pemisah ribuan), dan koma (desimal)
                    const val = e.target.value.replace(/[^0-9,]/g, '');
                    // Pastikan koma hanya muncul sekali
                    const parts = val.split(',');
                    if (parts.length > 2) return;
                    // Format bagian ribuan (sebelum koma)
                    const ribuan = parts[0].replace(/\./g, '');
                    const formatted = ribuan ? Number(ribuan).toLocaleString('id-ID') : '';
                    // Gabung dengan desimal kalau ada
                    setTotalSaldo(parts.length === 2 ? `${formatted},${parts[1]}` : formatted);
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
              {(() => {
                const parsed = totalSaldo ? Number(totalSaldo.replace(/\./g, '').replace(',', '.')) : null;
                if (aiResult?.nominal != null && parsed !== null && !isNaN(parsed) && Math.abs(parsed - Number(aiResult.nominal)) > 0.01) {
                  return (
                    <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Peringatan Dini:</span> Nilai Saldo Akhir input (Rp {parsed.toLocaleString('id-ID')}) berbeda dari saldo hasil baca berkas (Rp {Number(aiResult.nominal).toLocaleString('id-ID')}). Mohon periksa kembali bukti fisik sebelum mengunggah.
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 mt-4">
                Nilai Excel (Rp) <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">Rp</span>
                <input
                  type="text"
                  value={nilaiExcel}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9,]/g, '');
                    const parts = val.split(',');
                    if (parts.length > 2) return;
                    const ribuan = parts[0].replace(/\./g, '');
                    const formatted = ribuan ? Number(ribuan).toLocaleString('id-ID') : '';
                    setNilaiExcel(parts.length === 2 ? `${formatted},${parts[1]}` : formatted);
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {nilaiExcel && (
                <p className="text-xs text-emerald-700 mt-1.5 font-medium">
                  Rp {nilaiExcel}
                </p>
              )}
            </div>
          </div>
        ) : null}

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
              {aiScanning && (
                <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full animate-pulse">
                  <Brain className="w-3.5 h-3.5 animate-spin" /> Scanning...
                </span>
              )}
              {!aiScanning && aiFilledFields.length > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> AI Done
                </span>
              )}
              <button type="button" onClick={() => { setFile(null); setAiResult(null); setAiFilledFields([]); setAiError(''); }} className="text-gray-400 hover:text-red-500 transition-colors">
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
              <div className="flex items-center justify-center gap-2 mt-3">
                <p className="text-xs text-gray-400">PDF, DOC, DOCX, XLS, XLSX • Maks 50MB</p>
                <span className="inline-flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> AI Autofill
                </span>
              </div>
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

