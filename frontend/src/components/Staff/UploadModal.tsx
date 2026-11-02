import { useEffect, useState, useRef, FormEvent } from 'react';
import { getSession } from '@/lib/auth';
import {
  Upload, FileText, X, CheckCircle,
  Loader2, AlertCircle, CloudUpload, DollarSign, Sparkles, Brain, CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

interface Kategori { id: number; nama: string; slug: string; perlu_nominal: number; }

const TAHUN_LIST = Array.from(
  { length: new Date().getFullYear() - 2014 },
  (_, i) => new Date().getFullYear() - i
);

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialFile?: File | null;
}

export default function UploadModal({ isOpen, onClose, onSuccess, initialFile }: UploadModalProps) {
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
  const [aiResult,    setAiResult]    = useState<{judul?:string; tahun?:number; kategori?:string; semester?:number|null; nominal?:number|null; deskripsi?:string; confidence?:string; bank?:string} | null>(null);
  const [aiError,     setAiError]     = useState('');
  const [aiFilledFields, setAiFilledFields] = useState<string[]>([]);

  // Saldo Akhir
  const [totalSaldo, setTotalSaldo] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch categories once
  useEffect(() => {
    fetchKategori();
  }, []);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError('');
      setAiError('');
      setAiScanning(false);
      setAiResult(null);
      setAiFilledFields([]);
      setJudul('');
      setKategoriId('');
      setDeskripsi('');
      setNamaBank('');
      setNomorRekening('');
      setTanggalSurat('');
      setNamaRekening('');
      setTotalSaldo('');
      
      if (initialFile) {
        handleFilePick(initialFile);
      } else {
        setFile(null);
      }
    }
  }, [isOpen, initialFile]);

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
        setKategoriError('Belum ada kategori.');
      }
      setKategoriList(list);
    } catch (err: any) {
      setKategoriError(err.message || 'Gagal memuat kategori.');
    } finally {
      setKategoriLoading(false);
    }
  };

  const scanWithAI = async (fileToScan: File, cats: Kategori[]) => {
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

      const filled: string[] = [];
      if (result.judul) {
        setJudul(result.judul);
        filled.push('judul');
      }
      if (result.tahun) {
        setTahun(String(result.tahun));
        filled.push('tahun');
      }
      if (result.kategori && cats.length > 0) {
        const match = cats.find(k =>
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
      if (result.bank) {
        setNamaBank(result.bank);
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
        const warnText = result.warning || 'Web tidak dapat membaca teks dari dokumen ini (berupa hasil scan/gambar JPG/PNG). Mohon isi formulir secara manual.';
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

    // Kategori list maybe not fetched yet if initialFile passed immediately?
    // We pass it to the state directly, we'll scanWithAI and if categories aren't loaded, it might fail the category match, but we can fix that later.
    scanWithAI(picked, kategoriList);
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
      if (jenisPeriode === 'bulan' && bulan) fd.append('bulan', bulan);
      if (jenisPeriode === 'semester' && semester) fd.append('semester', semester);
      fd.append('kategori_id', kategoriId);
      if (deskripsi) fd.append('deskripsi', deskripsi);
      if (namaRekening) fd.append('nama_rekening', namaRekening);
      if (namaBank) fd.append('nama_bank', namaBank);
      if (nomorRekening) fd.append('nomor_rekening', nomorRekening);
      if (tanggalSurat) fd.append('tanggal_surat', tanggalSurat);

      const selKat = kategoriList.find(k => String(k.id) === kategoriId);
      const isSuratRek = selKat?.slug === 'surat-pembukaan-rekening-koran' || selKat?.slug === 'surat-penutupan-rekening-koran';
      if (!isSuratRek && totalSaldo) {
        const cleanNom = totalSaldo.replace(/\./g, '').replace(',', '.');
        fd.append('nilai_rekening_koran', cleanNom);
        fd.append('nilai_excel', cleanNom);
      }

      const res = await fetch(`${API}/dokumen/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload gagal');
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Upload gagal, coba lagi');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSize = (b: number) => b < 1024 * 1024
    ? `${(b / 1024).toFixed(1)} KB`
    : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  if (!isOpen) return null;

  const selectedKat = kategoriList.find(k => String(k.id) === kategoriId);
  const isSuratPembukaan = selectedKat?.slug === 'surat-pembukaan-rekening-koran';
  const isSuratPenutupan = selectedKat?.slug === 'surat-penutupan-rekening-koran';
  const isSuratRekening = isSuratPembukaan || isSuratPenutupan;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Unggah Dokumen</h2>
            <p className="text-sm text-slate-500">Lengkapi detail pengajuan dokumen</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounce" />
              <h2 className="text-xl font-bold text-slate-800">Upload Berhasil!</h2>
              <p className="text-slate-500 text-sm">Dokumen telah masuk ke antrean draft/verifikasi.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* File Info / Dropzone */}
              <div>
                {file ? (
                  <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
                    <FileText className="w-8 h-8 text-indigo-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
                    </div>
                    {aiScanning && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-100 px-3 py-1.5 rounded-full animate-pulse">
                        <Brain className="w-3.5 h-3.5 animate-spin" /> Menganalisis...
                      </span>
                    )}
                    {!aiScanning && aiFilledFields.length > 0 && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terdeteksi AI
                      </span>
                    )}
                    <button type="button" onClick={() => { setFile(null); setAiResult(null); setAiFilledFields([]); setAiError(''); }} className="text-slate-400 hover:text-rose-500 transition-colors p-2">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={clsx(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                      dragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                    )}
                  >
                    <CloudUpload className={clsx("w-10 h-10 mx-auto mb-3", dragging ? "text-indigo-500" : "text-slate-400")} />
                    <p className="text-sm font-semibold text-slate-700">Tarik & lepas dokumen ke sini</p>
                    <p className="text-xs text-slate-500 mt-1">atau klik untuk memilih file dari komputer</p>
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-md">PDF, DOCX, XLSX (Max 50MB)</span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-md">
                        <Sparkles className="w-3 h-3" /> Mendukung AI
                      </span>
                    </div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={e => handleFilePick(e.target.files?.[0] ?? null)} />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              {aiError && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {aiError}
                </div>
              )}

              {/* Auto-Detected Recognition Banner */}
              {aiResult && !aiScanning && (aiResult.nominal || aiResult.bank || aiResult.judul) && (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 text-xs text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-900">
                        Ekstraksi Berkas Otomatis Selesai
                      </div>
                      <div className="text-emerald-700 mt-0.5">
                        {aiResult.bank && <span>Bank: <strong>{aiResult.bank}</strong> • </span>}
                        {aiResult.nominal != null ? (
                          <span>Saldo Terdeteksi: <strong>Rp {Number(aiResult.nominal).toLocaleString('id-ID')}</strong></span>
                        ) : (
                          <span>Data judul dan kategori berhasil diekstrak</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="bg-emerald-200/80 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase shrink-0">
                    Auto-Extracted
                  </span>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Judul Dokumen <span className="text-rose-500">*</span>
                    {aiFilledFields.includes('judul') && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" /> Auto-filled
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={judul}
                    onChange={e => setJudul(e.target.value)}
                    placeholder="Contoh: Laporan Keuangan Q3"
                    required
                    className={clsx(
                      "w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors",
                      aiFilledFields.includes('judul') ? "border-emerald-300 bg-emerald-50/50" : "border-slate-300 bg-white"
                    )}
                  />
                </div>

                {/* Khusus Surat Pembukaan & Surat Penutupan Rekening Koran: Form Detail & Info Verifikasi Eselon 1 (Tanpa Saldo) */}
                {isSuratRekening ? (
                  <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-2xl p-4 space-y-3 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl text-white shrink-0 ${isSuratPembukaan ? 'bg-blue-600' : 'bg-amber-600'}`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          {isSuratPembukaan ? 'Pengajuan Surat Pembukaan Rekening Koran' : 'Pengajuan Surat Penutupan Rekening Koran'}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {isSuratPembukaan
                            ? 'Dokumen akan dikirim ke Admin Eselon 1. Setelah disetujui, nomor rekening ini otomatis terdaftar dan aktif di Rekening Koran.'
                            : 'Dokumen akan dikirim ke Admin Eselon 1. Setelah disetujui, nomor rekening ini otomatis dinonaktifkan dari Rekening Koran.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nama Bank <span className="text-rose-500">*</span>
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
                          placeholder="Contoh: Bank BNI / Mandiri"
                          required
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nomor Rekening <span className="text-rose-500">*</span>
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
                          className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {isSuratPembukaan ? 'Tanggal Pembukaan Rekening' : 'Tanggal Penutupan Rekening'} <span className="text-rose-500">*</span>
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
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
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
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Nama Rekening Koran (Atas Nama)
                      {aiFilledFields.includes('nama_rekening') && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" /> Auto-filled
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={namaRekening}
                      onChange={e => setNamaRekening(e.target.value)}
                      placeholder="Contoh: RPL 029 DITJEN DIKTI UGM OPR"
                      className={clsx(
                        "w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors",
                        aiFilledFields.includes('nama_rekening') ? "border-emerald-300 bg-emerald-50/50" : "border-slate-300 bg-white"
                      )}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Kategori <span className="text-rose-500">*</span></label>
                    <select
                      value={kategoriId}
                      onChange={e => setKategoriId(e.target.value)}
                      required
                      disabled={kategoriLoading}
                      className={clsx(
                        "w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors",
                        aiFilledFields.includes('kategori') ? "border-emerald-300 bg-emerald-50/50" : "border-slate-300 bg-white"
                      )}
                    >
                      <option value="">{kategoriLoading ? 'Memuat kategori...' : 'Pilih kategori'}</option>
                      {kategoriList.map(k => (
                        <option key={k.id} value={k.id}>{k.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Tahun <span className="text-rose-500">*</span></label>
                    <select
                      value={tahun}
                      onChange={e => setTahun(e.target.value)}
                      required
                      className={clsx(
                        "w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors",
                        aiFilledFields.includes('tahun') ? "border-emerald-300 bg-emerald-50/50" : "border-slate-300 bg-white"
                      )}
                    >
                      {TAHUN_LIST.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {kategoriList.find(k => String(k.id) === kategoriId)?.perlu_nominal ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Saldo Akhir (Rp)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">Rp</span>
                      <input
                        type="text"
                        value={totalSaldo}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9,]/g, '');
                          const parts = val.split(',');
                          if (parts.length > 2) return;
                          const ribuan = parts[0].replace(/\./g, '');
                          const formatted = ribuan ? Number(ribuan).toLocaleString('id-ID') : '';
                          setTotalSaldo(parts.length === 2 ? `${formatted},${parts[1]}` : formatted);
                        }}
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {(() => {
                      const parsed = totalSaldo ? Number(totalSaldo.replace(/\./g, '').replace(',', '.')) : null;
                      if (aiResult?.nominal != null && parsed !== null && !isNaN(parsed) && Math.abs(parsed - Number(aiResult.nominal)) > 0.01) {
                        return (
                          <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-300/80 text-amber-900 text-xs rounded-xl p-3 shadow-xs">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-amber-950">Peringatan Dini:</span> Nilai input (Rp {parsed.toLocaleString('id-ID')}) berbeda dari saldo fisik berkas (Rp {Number(aiResult.nominal).toLocaleString('id-ID')}). Mohon periksa kembali bukti fisik sebelum mengajukan.
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                ) : null}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Catatan Tambahan</label>
                  <textarea
                    value={deskripsi}
                    onChange={e => setDeskripsi(e.target.value)}
                    rows={2}
                    placeholder="Opsional..."
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white"
                  />
                </div>
              </div>

            </form>
          )}
        </div>

        {/* Modal Footer */}
        {!success && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !file || !judul || !kategoriId}
              className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {submitting ? 'Menyimpan...' : 'Unggah Sekarang'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
