'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { getSession } from '@/lib/auth';
import {
  Upload, FileText, X, CheckCircle,
  Loader2, AlertCircle, CloudUpload, Sparkles, Brain, CheckCircle2,
  Folder, Archive, Trash2, Edit3, Building2, Layers
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
  defaultKategoriSlug?: string;
}

interface BatchItem {
  temp_id: number;
  temp_filename: string;
  file_nama: string;
  judul: string;
  tahun: number;
  bulan: number | null;
  kategori_id: number;
  nama_bank: string;
  nomor_rekening: string;
  nama_rekening: string;
  nominal: number | string | null;
  tanggal_surat: string;
  deskripsi: string;
  is_scanned_image: boolean;
  warning?: string | null;
  file_size: number;
}

export default function UploadModal({ isOpen, onClose, onSuccess, initialFile, defaultKategoriSlug }: UploadModalProps) {
  // Mode: single (1 file) atau batch (folder / zip)
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  const [kategoriList,      setKategoriList]      = useState<Kategori[]>([]);
  const [kategoriLoading,   setKategoriLoading]   = useState(true);
  const [kategoriError,     setKategoriError]     = useState('');
  
  // Single upload form state
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
  const [namaDebitur,  setNamaDebitur]  = useState('');
  const [dasarTemuan,  setDasarTemuan]  = useState('');
  const [file,        setFile]        = useState<File | null>(null);
  const [totalSaldo,  setTotalSaldo]  = useState('');
  
  const [dragging,    setDragging]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);

  // AI Autofill state (Single)
  const [aiScanning,  setAiScanning]  = useState(false);
  const [aiResult,    setAiResult]    = useState<{judul?:string; tahun?:number; kategori?:string; semester?:number|null; nominal?:number|null; deskripsi?:string; confidence?:string; bank?:string} | null>(null);
  const [aiError,     setAiError]     = useState('');
  const [aiFilledFields, setAiFilledFields] = useState<string[]>([]);

  // Batch upload state
  const [batchId,        setBatchId]        = useState<string | null>(null);
  const [batchItems,     setBatchItems]     = useState<BatchItem[]>([]);
  const [batchScanning,  setBatchScanning]  = useState(false);
  const [batchSaving,    setBatchSaving]    = useState(false);
  const [batchError,     setBatchError]     = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

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
      setDeskripsi('');
      setNamaBank('');
      setNomorRekening('');
      setTanggalSurat('');
      setNamaRekening('');
      setNamaDebitur('');
      setDasarTemuan('');
      setTotalSaldo('');
      if (defaultKategoriSlug && kategoriList.length > 0) {
        const defKat = kategoriList.find(k => k.slug === defaultKategoriSlug);
        setKategoriId(defKat ? String(defKat.id) : '');
      } else {
        setKategoriId('');
      }
      
      // Reset batch state
      setBatchId(null);
      setBatchItems([]);
      setBatchScanning(false);
      setBatchSaving(false);
      setBatchError('');

      if (initialFile) {
        if (initialFile.name.endsWith('.zip')) {
          setActiveTab('batch');
          handleBatchZip(initialFile);
        } else {
          setActiveTab('single');
          handleFilePick(initialFile);
        }
      } else {
        setFile(null);
      }
    }
  }, [isOpen, initialFile, defaultKategoriSlug, kategoriList]);

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
      let list: Kategori[] = d.data ?? [];
      const u = session?.user as any;
      const isAdminSatker = Boolean(
        u && (u.tingkat === 'satker' || !u.tingkat) && (
          ['administrasi', 'manajemen', 'pimpinan_satker'].includes(u.role || '') ||
          Number(u.role_id) === 2 ||
          u.is_manajemen
        )
      );
      if (isAdminSatker || defaultKategoriSlug === 'sk-piutang-satker') {
        // Admin Satker KHUSUS & HANYA bisa upload SK Piutang Satker
        list = list.filter(k => k.slug === 'sk-piutang-satker');
        if (list.length > 0) {
          setKategoriId(String(list[0].id));
        }
      } else {
        const isAdminRole = Boolean(
          u && (
            ['administrasi', 'manajemen', 'pimpinan_satker', 'it', 'admin_it'].includes(u.role || '') ||
            [2, 3].includes(Number(u.role_id)) ||
            u.is_manajemen ||
            u.is_it
          )
        );
        if (!isAdminRole) {
          list = list.filter(k => k.slug !== 'sk-piutang-satker');
        }
      }
      if (list.length === 0) {
        setKategoriError('Belum ada kategori yang sesuai wewenang akun Anda.');
      }
      setKategoriList(list);
    } catch (err: any) {
      setKategoriError(err.message || 'Gagal memuat kategori.');
    } finally {
      setKategoriLoading(false);
    }
  };

  // --- SINGLE FILE HANDLERS ---
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
      if ((result as any).nama_debitur) {
        setNamaDebitur((result as any).nama_debitur);
        filled.push('nama_debitur');
      }
      if ((result as any).dasar_temuan) {
        setDasarTemuan((result as any).dasar_temuan);
        filled.push('dasar_temuan');
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
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    if (!allowed.includes(picked.type) && !picked.name.match(/\.(pdf|docx?|xlsx?|jpe?g|png)$/i)) {
      return setError('Format file tidak didukung. Gunakan PDF, Word, Excel, atau JPG/PNG.');
    }
    if (picked.size > 50 * 1024 * 1024) {
      return setError('Ukuran file maksimal 50 MB.');
    }
    setError('');
    setFile(picked);
    scanWithAI(picked, kategoriList);
  };

  const handleSingleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return setError('File wajib dipilih');

    let activeKatId = kategoriId;
    if (!activeKatId) {
      const skCat = kategoriList.find(k => k.slug === 'sk-piutang-satker');
      if (skCat && (defaultKategoriSlug === 'sk-piutang-satker' || isSkPiutang)) {
        activeKatId = String(skCat.id);
      }
    }
    if (!activeKatId) return setError('Kategori wajib dipilih');

    const selKat = kategoriList.find(k => String(k.id) === activeKatId);
    const isSkPiutangActive = selKat?.slug === 'sk-piutang-satker' || defaultKategoriSlug === 'sk-piutang-satker';
    if (isSkPiutangActive) {
      if (!namaDebitur.trim()) return setError('Nama Debitur / Pihak Tertagih wajib diisi untuk SK Piutang');
      if (!dasarTemuan.trim()) return setError('Nomor Dasar Temuan BPK / SKTJM wajib diisi untuk SK Piutang');
      if (!totalSaldo.trim()) return setError('Nominal Pokok Piutang wajib diisi');
    }
    setError(''); setSubmitting(true);

    try {
      const session = getSession();
      const fd = new FormData();
      fd.append('file',        file);
      fd.append('judul',       judul);
      fd.append('tahun',       tahun);
      if (jenisPeriode === 'bulan' && bulan) fd.append('bulan', bulan);
      if (jenisPeriode === 'semester' && semester) fd.append('semester', semester);
      fd.append('kategori_id', activeKatId);
      if (deskripsi) fd.append('deskripsi', deskripsi);
      if (namaRekening) fd.append('nama_rekening', namaRekening);
      if (namaBank) fd.append('nama_bank', namaBank);
      if (nomorRekening) fd.append('nomor_rekening', nomorRekening);
      if (tanggalSurat) fd.append('tanggal_surat', tanggalSurat);
      if (namaDebitur) fd.append('nama_debitur', namaDebitur);
      if (dasarTemuan) fd.append('dasar_temuan', dasarTemuan);

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
      if (!res.ok) throw new Error(data.detail || data.message || 'Upload gagal');
      
      setSuccess(true);
      toast.success(isSkPiutang ? 'SK Piutang berhasil diunggah & dikirim langsung ke Admin Eselon 1!' : 'Dokumen berhasil diunggah!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Upload gagal, coba lagi');
    } finally {
      setSubmitting(false);
    }
  };

  // --- BATCH (FOLDER / ZIP) HANDLERS ---
  const handleBatchZip = async (zipFile: File) => {
    if (!zipFile.name.toLowerCase().endsWith('.zip')) {
      return setBatchError('Harap pilih file kompresi berekstensi .zip');
    }
    await executeBatchScan({ zip_file: zipFile });
  };

  const handleFolderSelect = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const filesArray = Array.from(filesList).filter(f => 
      f.name.match(/\.(pdf|xlsx?|jpe?g|png)$/i) && !f.name.startsWith('.')
    );
    if (filesArray.length === 0) {
      return setBatchError('Tidak ada file dokumen yang didukung di dalam folder (.pdf, .xlsx, .jpg, .png)');
    }
    await executeBatchScan({ files: filesArray });
  };

  const executeBatchScan = async (payload: { zip_file?: File; files?: File[] }) => {
    setBatchScanning(true);
    setBatchError('');
    setBatchItems([]);
    setBatchId(null);

    try {
      const session = getSession();
      const fd = new FormData();
      if (payload.zip_file) {
        fd.append('zip_file', payload.zip_file, payload.zip_file.name);
      } else if (payload.files) {
        payload.files.forEach(f => fd.append('files', f, f.name));
      }

      const res = await fetch(`${API}/dokumen/batch-scan`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Gagal memindai folder/ZIP');

      setBatchId(data.batch_id);
      setBatchItems(data.items || []);
      toast.success(`Berhasil menganalisis ${data.total_files} berkas sekaligus!`);
    } catch (err: any) {
      setBatchError(err.message || 'Terjadi kesalahan saat memproses folder/ZIP');
      toast.error(err.message || 'Gagal memproses batch');
    } finally {
      setBatchScanning(false);
    }
  };

  const updateBatchItem = (index: number, field: keyof BatchItem, value: any) => {
    setBatchItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeBatchItem = (index: number) => {
    setBatchItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleBatchSaveSubmit = async () => {
    if (!batchId || batchItems.length === 0) {
      return setBatchError('Tidak ada berkas untuk disimpan');
    }
    setBatchSaving(true);
    setBatchError('');

    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/batch-save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          batch_id: batchId,
          items: batchItems
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Gagal menyimpan berkas batch');

      setSuccess(true);
      toast.success(data.message || `Berhasil menyimpan ${data.saved_count} dokumen sekaligus!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setBatchError(err.message || 'Gagal menyimpan berkas batch');
    } finally {
      setBatchSaving(false);
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
  const isSkPiutang = selectedKat?.slug === 'sk-piutang-satker' || defaultKategoriSlug === 'sk-piutang-satker';

  // Akumulasi saldo batch yang terdeteksi
  const totalNominalBatch = batchItems.reduce((acc, it) => acc + (Number(it.nominal) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className={clsx(
        "bg-white rounded-2xl shadow-2xl w-full max-h-[92vh] overflow-hidden flex flex-col animate-slide-up transition-all duration-300",
        activeTab === 'batch' && batchItems.length > 0 ? "max-w-5xl" : "max-w-2xl"
      )}>
        {/* Header Modal with Tabs */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-800">
                {isSkPiutang ? 'Unggah SK Piutang Satker' : 'Unggah Dokumen'}
              </h2>
              <span className={clsx(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                isSkPiutang ? "bg-indigo-100 text-indigo-800" : "bg-blue-100 text-blue-800"
              )}>
                {isSkPiutang ? 'Kewenangan Khusus Admin Satker' : 'Cerdas Otomatis'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSkPiutang
                ? 'Unggah berkas resmi SK Piutang beserta lampiran bukti dasar temuan BPK / SKTJM'
                : 'Unggah satuan atau 1 folder / file ZIP langsung'}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mode Switcher Tabs - Sembunyikan untuk SK Piutang karena wajib berkas bundel satuan */}
            {!isSkPiutang && (
              <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setActiveTab('single'); setError(''); }}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                    activeTab === 'single' ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Berkas Satuan</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('batch'); setBatchError(''); }}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                    activeTab === 'batch' ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <Folder className="w-3.5 h-3.5 text-amber-500" />
                  <span>1 Folder / ZIP Masal</span>
                </button>
              </div>
            )}

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounce" />
              <h2 className="text-xl font-bold text-slate-800">Proses Berhasil!</h2>
              <p className="text-slate-500 text-sm">Dokumen telah tersimpan dan terverifikasi di sistem.</p>
            </div>
          ) : activeTab === 'single' ? (
            // ==================== MODE SATUAN ====================
            <form onSubmit={handleSingleSubmit} className="space-y-5">
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
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terdeteksi Otomatis
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
                    onDrop={e => { e.preventDefault(); setDragging(false); handleFilePick(e.dataTransfer.files[0] ?? null); }}
                    onClick={() => fileRef.current?.click()}
                    className={clsx(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                      dragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                    )}
                  >
                    <CloudUpload className={clsx("w-10 h-10 mx-auto mb-3", dragging ? "text-indigo-500" : "text-slate-400")} />
                    <p className="text-sm font-semibold text-slate-700">
                      {isSkPiutang ? 'Tarik & lepas berkas PDF bundel SK Piutang' : 'Tarik & lepas berkas ke sini'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {isSkPiutang ? 'atau klik untuk memilih file PDF dari komputer' : 'atau klik untuk memilih file dari komputer'}
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
                        {isSkPiutang ? 'Format PDF Bundel (Max 50MB)' : 'PDF, XLSX, JPG, PNG (Max 50MB)'}
                      </span>
                      {!isSkPiutang && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-md">
                          <Sparkles className="w-3 h-3" /> Ekstraksi Cerdas
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept={isSkPiutang ? ".pdf,.docx,.doc" : ".pdf,.docx,.doc,.xlsx,.xls,.jpg,.jpeg,.png"}
                  className="hidden"
                  onChange={e => handleFilePick(e.target.files?.[0] ?? null)}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              {aiError && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> {aiError}
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
                      <div className="font-bold text-emerald-900">Ekstraksi Dokumen Selesai</div>
                      <div className="text-emerald-700 mt-0.5">
                        {aiResult.bank && <span>Bank: <strong>{aiResult.bank}</strong> • </span>}
                        {aiResult.nominal != null ? (
                          <span>Saldo Terdeteksi: <strong>Rp {Number(aiResult.nominal).toLocaleString('id-ID')}</strong></span>
                        ) : (
                          <span>Identitas rekening dan judul berhasil terbaca</span>
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
                        <Sparkles className="w-3 h-3" /> Terisi Otomatis
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={judul}
                    onChange={e => setJudul(e.target.value)}
                    placeholder={
                      isSkPiutang
                        ? "Contoh: SK Penetapan Piutang T.A. 2026 - PT Maju Jaya"
                        : "Contoh: Laporan Rekening Koran September 2026"
                    }
                    required
                    className={clsx(
                      "w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors",
                      aiFilledFields.includes('judul') ? "border-emerald-300 bg-emerald-50/50" : "border-slate-300 bg-white"
                    )}
                  />
                </div>

                {/* Surat Pembukaan / Penutupan Fields */}
                {isSuratRekening && (
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Detail Rekening Koran ({isSuratPembukaan ? 'Pembukaan' : 'Penutupan'})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bank Mitra</label>
                        <input
                          type="text"
                          value={namaBank}
                          onChange={e => setNamaBank(e.target.value)}
                          placeholder="Contoh: Bank BNI"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Rekening Satker</label>
                        <input
                          type="text"
                          value={nomorRekening}
                          onChange={e => setNomorRekening(e.target.value)}
                          placeholder="Nomor rekening satker..."
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Rekening</label>
                        <input
                          type="text"
                          value={namaRekening}
                          onChange={e => setNamaRekening(e.target.value)}
                          placeholder="Contoh: BPP 088 ITJEN"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Surat / Transaksi</label>
                        <input
                          type="date"
                          value={tanggalSurat}
                          onChange={e => setTanggalSurat(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SK Piutang Satker Fields (Khusus Administrasi - Bundel 1 PDF dengan Dasar BPK/SKTJM) */}
                {isSkPiutang && (
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        Detail SK Piutang & Lampiran Dasar Hukum (Bundel 1 PDF)
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                        Langsung ke Eselon 1
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-700 leading-relaxed">
                      Pastikan berkas PDF yang diunggah menyatukan lembar <strong>SK Piutang</strong> beserta lampiran bukti <strong>Temuan BPK / SKTJM</strong>. Dokumen akan langsung dikirim ke Admin Eselon 1.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nama Debitur / Pihak Tertagih <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={namaDebitur}
                          onChange={e => setNamaDebitur(e.target.value)}
                          placeholder="Contoh: PT Maju Jaya / Nama Pegawai"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nomor Dasar Temuan BPK / SKTJM <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={dasarTemuan}
                          onChange={e => setDasarTemuan(e.target.value)}
                          placeholder="Contoh: LHP-BPK/No.12/2026"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Penetapan SK</label>
                        <input
                          type="date"
                          value={tanggalSurat}
                          onChange={e => setTanggalSurat(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Kategori Dokumen <span className="text-rose-500">*</span>
                    </label>
                    {isSkPiutang ? (
                      <div className="w-full px-4 py-2.5 text-sm border border-indigo-200 rounded-xl bg-indigo-50/70 font-bold text-indigo-900 flex items-center justify-between shadow-2xs">
                        <span>SK Piutang Satker</span>
                        <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Terkunci
                        </span>
                      </div>
                    ) : (
                      <select
                        value={kategoriId}
                        onChange={e => setKategoriId(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">-- Pilih Kategori --</option>
                        {kategoriList.map(k => (
                          <option key={k.id} value={k.id}>{k.nama}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Tahun <span className="text-rose-500">*</span></label>
                    <select
                      value={tahun}
                      onChange={e => setTahun(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      {TAHUN_LIST.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!isSuratRekening && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      {isSkPiutang ? 'Nominal Pokok Piutang (Rp) *' : 'Saldo Akhir Bulan (Rp)'}
                    </label>
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
                        className="w-full pl-12 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Catatan Tambahan</label>
                  <textarea
                    value={deskripsi}
                    onChange={e => setDeskripsi(e.target.value)}
                    rows={2}
                    placeholder="Keterangan opsional..."
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white"
                  />
                </div>
              </div>
            </form>
          ) : (
            // ==================== MODE BATCH (FOLDER / ZIP) ====================
            <div className="space-y-5">
              {batchScanning ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                  <p className="font-bold text-slate-800 text-sm">Sedang Mengekstrak & Memindai Berkas...</p>
                  <p className="text-xs text-slate-500 max-w-sm text-center">
                    Sistem sedang membaca nomor rekening satker, nama bank, dan menghitung saldo akhir tiap berkas secara mandiri.
                  </p>
                </div>
              ) : batchItems.length === 0 ? (
                <div>
                  {/* Dropzone untuk ZIP atau Folder */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => {
                      e.preventDefault(); setDragging(false);
                      const files = e.dataTransfer.files;
                      if (!files || files.length === 0) return;
                      if (files.length === 1 && files[0].name.toLowerCase().endsWith('.zip')) {
                        handleBatchZip(files[0]);
                      } else {
                        handleFolderSelect(files);
                      }
                    }}
                    className={clsx(
                      "border-2 border-dashed rounded-2xl p-8 text-center transition-all",
                      dragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 bg-slate-50/50"
                    )}
                  >
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                        <Folder className="w-8 h-8" />
                      </div>
                      <span className="text-slate-400 font-bold text-sm">+</span>
                      <div className="p-3 bg-violet-100 text-violet-700 rounded-2xl">
                        <Archive className="w-8 h-8" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Tarik & Lepas File .ZIP atau Berkas Folder ke Sini</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Unggah seluruh dokumen Rekening Koran sekaligus dalam 1 folder atau arsip ZIP.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                      <button
                        type="button"
                        onClick={() => folderInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <Folder className="w-4 h-4 text-amber-300" />
                        <span>Pilih 1 Folder Langsung</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => zipInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <Archive className="w-4 h-4 text-violet-200" />
                        <span>Pilih File .ZIP</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-slate-400">
                      <span>Mendukung PDF, Excel, JPG, PNG di dalam folder</span>
                    </div>
                  </div>

                  {/* Hidden folder input (HTML5 webkitdirectory) */}
                  <input
                    ref={folderInputRef}
                    type="file"
                    {...({ webkitdirectory: "", directory: "", multiple: true } as any)}
                    className="hidden"
                    onChange={e => handleFolderSelect(e.target.files)}
                  />

                  {/* Hidden zip input */}
                  <input
                    ref={zipInputRef}
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleBatchZip(e.target.files[0])}
                  />

                  {batchError && (
                    <div className="mt-4 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {batchError}
                    </div>
                  )}
                </div>
              ) : (
                // REVIEW TABLE BATCH
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-600 text-white rounded-lg">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-indigo-950">
                          {batchItems.length} Dokumen Berhasil Diekstrak
                        </div>
                        <div className="text-[11px] text-indigo-700 mt-0.5">
                          Periksa kembali rincian di bawah sebelum disimpan ke sistem.
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Total Akumulasi Saldo</div>
                      <div className="text-sm font-black text-indigo-900">Rp {totalNominalBatch.toLocaleString('id-ID')}</div>
                    </div>
                  </div>

                  {batchError && (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {batchError}
                    </div>
                  )}

                  {/* Tabel Hasil Ekstraksi */}
                  <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[46vh] shadow-2xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5 w-[200px]">Berkas & Judul</th>
                          <th className="px-3 py-2.5 w-[140px]">Bank Mitra</th>
                          <th className="px-3 py-2.5 w-[150px]">No. Rekening</th>
                          <th className="px-3 py-2.5 text-right w-[150px]">Saldo Akhir (Rp)</th>
                          <th className="px-3 py-2.5 text-center w-[110px]">Status</th>
                          <th className="px-2 py-2.5 text-center w-[50px]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {batchItems.map((item, idx) => (
                          <tr key={item.temp_id || idx} className="hover:bg-slate-50 transition-colors">
                            {/* 1. Berkas & Judul */}
                            <td className="px-3 py-2">
                              <div className="font-semibold text-slate-800 truncate max-w-[200px]" title={item.file_nama}>
                                {item.file_nama}
                              </div>
                              <input
                                type="text"
                                value={item.judul}
                                onChange={e => updateBatchItem(idx, 'judul', e.target.value)}
                                className="w-full text-[11px] border border-slate-200 px-2 py-1 rounded bg-white text-slate-600 mt-1"
                                placeholder="Judul Dokumen..."
                              />
                            </td>

                            {/* 2. Bank */}
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.nama_bank}
                                onChange={e => updateBatchItem(idx, 'nama_bank', e.target.value)}
                                className="w-full text-xs border border-slate-200 px-2 py-1 rounded bg-white font-semibold text-slate-800"
                                placeholder="Nama Bank..."
                              />
                            </td>

                            {/* 3. No Rekening */}
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.nomor_rekening}
                                onChange={e => updateBatchItem(idx, 'nomor_rekening', e.target.value)}
                                className="w-full text-xs font-mono border border-slate-200 px-2 py-1 rounded bg-white text-slate-700"
                                placeholder="No Rekening..."
                              />
                            </td>

                            {/* 4. Saldo Akhir */}
                            <td className="px-3 py-2 text-right">
                              <input
                                type="text"
                                value={item.nominal != null ? Number(item.nominal).toLocaleString('id-ID') : ''}
                                onChange={e => {
                                  const raw = e.target.value.replace(/\D/g, '');
                                  updateBatchItem(idx, 'nominal', raw ? parseInt(raw, 10) : 0);
                                }}
                                className="w-full text-xs text-right font-bold border border-slate-200 px-2 py-1 rounded bg-white text-blue-700"
                                placeholder="0"
                              />
                            </td>

                            {/* 5. Status Scan */}
                            <td className="px-3 py-2 text-center whitespace-nowrap">
                              {item.is_scanned_image ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800" title={item.warning || 'Format scan gambar'}>
                                  Scan Gambar
                                </span>
                              ) : item.nominal != null ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  Terbaca
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  Manual
                                </span>
                              )}
                            </td>

                            {/* 6. Hapus */}
                            <td className="px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeBatchItem(idx)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                title="Hapus dari daftar unggah"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!success && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
            {activeTab === 'batch' && batchItems.length > 0 ? (
              <button
                type="button"
                onClick={() => { setBatchItems([]); setBatchId(null); }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Pilih Berkas Lain
              </button>
            ) : <div />}

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>

              {activeTab === 'single' ? (
                <button
                  onClick={handleSingleSubmit}
                  disabled={submitting || !file || !judul || !kategoriId}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {submitting ? 'Menyimpan...' : 'Unggah Sekarang'}
                </button>
              ) : (
                <button
                  onClick={handleBatchSaveSubmit}
                  disabled={batchSaving || batchItems.length === 0}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
                >
                  {batchSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {batchSaving ? 'Menyimpan Semua...' : `Simpan Semua (${batchItems.length} Berkas)`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
