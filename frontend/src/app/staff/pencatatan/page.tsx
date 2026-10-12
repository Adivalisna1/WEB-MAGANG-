'use client';
import toast from 'react-hot-toast';


import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Plus, Edit, Download, Paperclip, Search, DollarSign, 
  TrendingUp, Building2, Clock, X, Loader2, CheckCircle2, 
  AlertCircle, Sparkles, Landmark 
} from 'lucide-react';
import clsx from 'clsx';
import * as XLSX from 'xlsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Daftar Bank BUMN di Indonesia
const BANK_BUMN_LIST = [
  'Bank Mandiri',
  'Bank BRI',
  'Bank BNI',
  'Bank BTN',
  'Bank BSI (Bank Syariah Indonesia)',
  'Bank Lainnya',
];

// Helper urutkan kategori sesuai ID di database, dengan 'Lainnya' selalu paling bawah
const sortKategoriDokumen = (cats: any[]) => {
  return [...cats].sort((a, b) => {
    const aIsLainnya = a.nama_kategori?.toLowerCase().includes('lainnya') || Number(a.id) === 999;
    const bIsLainnya = b.nama_kategori?.toLowerCase().includes('lainnya') || Number(b.id) === 999;
    if (aIsLainnya && !bIsLainnya) return 1;
    if (!aIsLainnya && bIsLainnya) return -1;
    return Number(a.id) - Number(b.id);
  });
};

// Helper buka file: PDF/DOCX → preview tab baru, Excel → auto download
const openFile = async (bukti_file: string, token: string) => {
  const url = bukti_file.startsWith('http')
    ? bukti_file
    : `${API}${bukti_file.startsWith('/api') ? bukti_file.replace('/api', '') : bukti_file}`;

  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
  const isExcel = ['xlsx', 'xls', 'csv'].includes(ext);

  if (isExcel) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = url.split('/').pop()?.split('?')[0] || 'file.xlsx';
    a.click();
    URL.revokeObjectURL(a.href);
  } else {
    window.open(`${url}?token=${token}`, '_blank');
  }
};


export default function StaffpencatatanPage() {
  const { token, user } = useAuth();
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [kategori, setKategori] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filterKategori, setFilterKategori] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterTahun, setFilterTahun] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    tanggal: '',
    uraian: '',
    jenis: 'debit',
    id_kategori: '',
    nominal: '',
    catatan_audit: '',
    nomor_rekening_bank: '',
    nama_rekening: '',
    nama_bank: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [customBank, setCustomBank] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // AI Auto Analysis State
  const [aiScanning, setAiScanning] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTx, resCat] = await Promise.all([
        fetch(`${API}/pencatatan`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/pencatatan/kategori`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const jTx = await resTx.json();
      const jCat = await resCat.json();
      if (jTx.success) setTransaksi(jTx.data);
      if (jCat.success) setKategori(jCat.data);
    } catch (err) {
      toast.error('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // Urutkan kategori sesuai spesifikasi: urut ID, 'Lainnya' di paling bawah
  const sortedKategori = sortKategoriDokumen(kategori);

  // Handle otomatis scan berkas ketika user memilih file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setAiResult(null);
    setAiError('');

    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (['pdf', 'xlsx', 'xls'].includes(ext || '')) {
      setAiScanning(true);
      try {
        const fd = new FormData();
        fd.append('data', selectedFile, selectedFile.name);
        const res = await fetch('/api/ai-scan', {
          method: 'POST',
          body: fd,
        });
        if (res.ok) {
          const result = await res.json();
          setAiResult(result);

          // Cek apakah dokumen ini rekening koran
          const isRekeningKoran =
            (result.kategori && result.kategori.toLowerCase().includes('rekening')) ||
            Boolean(result.bank) ||
            Boolean(result.nomor_rekening) ||
            selectedFile.name.toLowerCase().includes('rekening') ||
            selectedFile.name.toLowerCase().includes('rk') ||
            selectedFile.name.toLowerCase().includes('koran');

          setFormData(prev => {
            const updated = { ...prev };

            // 1. Auto pilih Kategori Dokumen = Rekening Koran
            if (isRekeningKoran) {
              const rkCat = sortedKategori.find(k =>
                k.nama_kategori?.toLowerCase().includes('rekening koran') ||
                k.nama_kategori?.toLowerCase().includes('rekening_koran')
              );
              if (rkCat) {
                updated.id_kategori = String(rkCat.id);
              }
            }

            // 2. Auto deteksi nama Bank dari berkas
            if (result.bank) {
              const bName = result.bank.toLowerCase();
              let matchedBank = BANK_BUMN_LIST.find(b => {
                const cleanB = b.toLowerCase().replace('bank ', '').trim();
                return bName.includes(cleanB) || cleanB.includes(bName);
              });
              if (!matchedBank) {
                // Jika bank swasta atau daerah (misal Danamon/BCA), masukkan namanya
                matchedBank = result.bank || '';
              }
              updated.nama_bank = matchedBank || '';
            }

            // 3. Auto isi nominal saldo jika terdeteksi dan belum diisi manual
            if (result.nominal !== undefined && result.nominal !== null && !prev.nominal) {
              updated.nominal = String(result.nominal);
            }

            // 4. Auto isi nomor rekening jika terdeteksi
            if (result.nomor_rekening && !prev.nomor_rekening_bank) {
              updated.nomor_rekening_bank = String(result.nomor_rekening);
            }

            // 5. Auto isi uraian jika masih kosong
            if (!prev.uraian) {
              if (result.bank) {
                updated.uraian = `Pencatatan Rekening Koran ${result.bank}`;
              } else if (result.judul) {
                updated.uraian = `Pencatatan ${result.judul}`;
              }
            }

            return updated;
          });

          if (result.bank) {
            toast.success(`AI: Berkas terbaca dari ${result.bank}!`);
          } else {
            toast.success('AI: Analisis berkas selesai!');
          }
        }
      } catch (err: any) {
        console.error('AI Scan error:', err);
        setAiError('Gagal menganalisis otomatis berkas.');
      } finally {
        setAiScanning(false);
      }
    }
  };

  // Filtered data
  const filteredData = transaksi.filter(t => {
    const matchKategori = !filterKategori || String(t.id_kategori) === filterKategori;
    const matchJenis = !filterJenis || t.jenis === filterJenis;
    const year = t.tanggal ? new Date(t.tanggal).getFullYear().toString() : '';
    const matchTahun = !filterTahun || year === filterTahun;
    return matchKategori && matchJenis && matchTahun;
  });

  const uniqueTahun = Array.from(new Set(transaksi.map(t => t.tanggal ? new Date(t.tanggal).getFullYear().toString() : ''))).filter(Boolean).sort((a, b) => b.localeCompare(a));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const finalBank = formData.nama_bank === 'Bank Lainnya' && customBank.trim()
        ? customBank.trim()
        : formData.nama_bank;

      const data = new FormData();
      data.append('tanggal', formData.tanggal);
      data.append('uraian', formData.uraian);
      data.append('jenis', formData.jenis);
      data.append('id_kategori', formData.id_kategori);
      data.append('nominal', formData.nominal);
      data.append('catatan_audit', formData.catatan_audit);
      data.append('nomor_rekening_bank', formData.nomor_rekening_bank);
      data.append('nama_rekening', formData.nama_rekening);
      data.append('nama_bank', finalBank);
      if (file) data.append('file', file);

      const url = `${API}/pencatatan`;
      const method = 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });
      const j = await res.json();
      if (j.success) {
        toast.success('Data berhasil ditambahkan');
        setShowForm(false);
        resetForm();
        fetchData();
      } else {
        toast.success(j.message);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan');
    } finally {
      setSubmitLoading(false);
    }
  };


  const resetForm = () => {
    setFormData({ tanggal: '', uraian: '', jenis: 'debit', id_kategori: '', nominal: '', catatan_audit: '', nomor_rekening_bank: '', nama_rekening: '', nama_bank: '' });
    setFile(null);
    setAiResult(null);
    setAiError('');
    setCustomBank('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const exportToExcel = () => {
    const wsData = filteredData.map((t, index) => ({
      'No': index + 1,
      'Tanggal': new Date(t.tanggal).toLocaleDateString('id-ID'),
      'Uraian': t.uraian,
      'Jenis': t.jenis === 'debit' ? 'PEMASUKAN' : 'PENGELUARAN',
      'Kategori Dokumen': t.nama_kategori,
      'Bank': t.nama_bank || '-',
      'No. Rekening': t.nomor_rekening || '-',
      'Nominal': Number(t.nominal),
      'Catatan': t.catatan_audit || '-',
      'Dibuat Oleh': t.pembuat || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Pencatatan');

    const katStr = filterKategori ? `_${kategori.find(k => String(k.id) === filterKategori)?.nama_kategori || ''}` : '';
    const jenisStr = filterJenis ? `_${filterJenis === 'debit' ? 'Pemasukan' : 'Pengeluaran'}` : '';
    const thnStr = filterTahun ? `_${filterTahun}` : '';
    const fileName = `Pencatatan${thnStr}${jenisStr}${katStr}.xlsx`.replace(/\s+/g, '_');

    XLSX.writeFile(wb, fileName);
  };

  const totalDebit = transaksi.filter(t => t.jenis === 'debit').reduce((acc, t) => acc + (Number(t.nominal) || 0), 0);
  const totalKredit = transaksi.filter(t => t.jenis === 'kredit').reduce((acc, t) => acc + (Number(t.nominal) || 0), 0);
  const saldoKas = totalDebit - totalKredit;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pencatatan</h1>
          <p className="text-sm text-gray-500 mt-1">Pencatatan transaksi dan pelaporan keuangan.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Tambah Data
          </button>
        </div>
      </div>

      {/* Stats Summary Strip (Prototype Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="staff-mini-card">
          <div className="staff-mini-label">
            <span>Total Transaksi Tercatat</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className="staff-mini-val text-blue-600">
            Rp {(totalDebit + totalKredit).toLocaleString('id-ID')}
          </div>
          <span className="text-xs font-semibold text-emerald-600">+{transaksi.length} Transaksi Tercatat</span>
        </div>

        <div className="staff-mini-card">
          <div className="staff-mini-label">
            <span>Realisasi Belanja</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="staff-mini-val text-emerald-600">
            Rp {totalKredit.toLocaleString('id-ID')}
          </div>
          <span className="text-xs text-slate-500">Pengeluaran terdata</span>
        </div>

        <div className="staff-mini-card">
          <div className="staff-mini-label">
            <span>Saldo Kas Berjalan</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="staff-mini-val text-slate-900">
            Rp {saldoKas.toLocaleString('id-ID')}
          </div>
          <span className="text-xs text-blue-600 font-medium">Buku Kas Pembantu</span>
        </div>

        <div className="staff-mini-card">
          <div className="staff-mini-label">
            <span>Pemasukan / Setoran</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="staff-mini-val text-indigo-600">
            Rp {totalDebit.toLocaleString('id-ID')}
          </div>
          <span className="text-xs text-indigo-600 font-medium">Total Debet Masuk</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
          <option value="">Semua Tahun</option>
          {uniqueTahun.map(t => <option key={t} value={t}>Tahun {t}</option>)}
        </select>
        <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
          <option value="">Semua Jenis</option>
          <option value="debit">Pemasukan</option>
          <option value="kredit">Pengeluaran</option>
        </select>
        <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
          <option value="">Semua Kategori Dokumen</option>
          {sortedKategori.map(k => <option key={k.id} value={String(k.id)}>{k.nama_kategori}</option>)}
        </select>
        {(filterTahun || filterJenis || filterKategori) && (
          <button onClick={() => { setFilterTahun(''); setFilterJenis(''); setFilterKategori(''); }} className="text-sm text-red-500 hover:text-red-700 px-2 py-1 transition-colors">
            Reset Filter
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">{filteredData.length} dari {transaksi.length} data</span>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-8 border border-gray-100 transition-all">
            <div className="px-6 py-4 md:px-8 md:py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span>Tambah Transaksi</span>
                  {aiScanning && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Analisis AI...
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Entri data pencatatan transaksi kas dan pembukuan satker</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              {/* Banner Hasil Analisis Otomatis AI */}
              {aiScanning && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-3 animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold">Sedang Menganalisis Berkas Otomatis...</p>
                    <p className="text-blue-600 mt-0.5">Membaca isi berkas, mendeteksi nama bank, nomor rekening, dan saldo akhir.</p>
                  </div>
                </div>
              )}

              {aiResult && !aiScanning && (aiResult.bank || aiResult.nominal || aiResult.nomor_rekening) && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-emerald-800 flex items-center gap-2 flex-wrap">
                      <span>✨ Analisis Berkas Berhasil:</span>
                      {aiResult.bank && (
                        <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {aiResult.bank}
                        </span>
                      )}
                      {aiResult.kategori && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {aiResult.kategori}
                        </span>
                      )}
                    </div>
                    <p className="text-emerald-700">
                      {aiResult.bank && <span>Bank <strong>{aiResult.bank}</strong> berhasil dideteksi. </span>}
                      {aiResult.nominal != null && <span>Saldo: <strong>Rp {Number(aiResult.nominal).toLocaleString('id-ID')}</strong>. </span>}
                      {aiResult.nomor_rekening && <span>No Rekening: <strong>{aiResult.nomor_rekening}</strong>. </span>}
                      Form otomatis disesuaikan!
                    </p>
                  </div>
                </div>
              )}

              {aiError && !aiScanning && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Row 1: Tanggal Transaksi & Jenis Transaksi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={e => setFormData({...formData, tanggal: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenis Transaksi</label>
                  <select
                    required
                    value={formData.jenis}
                    onChange={e => setFormData({...formData, jenis: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white shadow-sm"
                  >
                    <option value="debit">Pemasukan (Debit)</option>
                    <option value="kredit">Pengeluaran (Kredit)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Kategori Dokumen & Bank (Dropdown Bank BUMN) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori Dokumen</label>
                  <select
                    required
                    value={formData.id_kategori}
                    onChange={e => setFormData({...formData, id_kategori: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white shadow-sm"
                  >
                    <option value="">Pilih Kategori Dokumen...</option>
                    {sortedKategori.map(k => (
                      <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>Bank</span>
                    <span className="text-[11px] font-normal text-gray-400">Bank BUMN / Persepsi</span>
                  </label>
                  <div className="space-y-2">
                    <select
                      value={
                        BANK_BUMN_LIST.includes(formData.nama_bank)
                          ? formData.nama_bank
                          : (formData.nama_bank ? formData.nama_bank : '')
                      }
                      onChange={e => {
                        const val = e.target.value;
                        setFormData({...formData, nama_bank: val});
                        if (val !== 'Bank Lainnya') setCustomBank('');
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white shadow-sm"
                    >
                      <option value="">Pilih Bank...</option>
                      {/* Tampilkan bank yang terdeteksi AI jika di luar daftar default */}
                      {formData.nama_bank && !BANK_BUMN_LIST.includes(formData.nama_bank) && (
                        <option value={formData.nama_bank}>{formData.nama_bank} (Hasil Baca AI)</option>
                      )}
                      {BANK_BUMN_LIST.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>

                    {formData.nama_bank === 'Bank Lainnya' && (
                      <input
                        type="text"
                        value={customBank}
                        onChange={e => setCustomBank(e.target.value)}
                        placeholder="Ketikkan nama bank..."
                        className="w-full px-3.5 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-blue-50/30"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-panel Rekening Bank (Tampil jika Kategori = Rekening Koran atau Bank terisi) */}
              {(kategori.find(k => String(k.id) === formData.id_kategori)?.nama_kategori?.toLowerCase().includes('rekening') || formData.nama_bank) && (
                <div className="p-5 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5" />
                    <span>Informasi Rekening Bank</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor Rekening Bank</label>
                      <input
                        type="text"
                        value={formData.nomor_rekening_bank}
                        onChange={e => setFormData({...formData, nomor_rekening_bank: e.target.value})}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm"
                        placeholder="Contoh: 1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Rekening / Pemilik</label>
                      <input
                        type="text"
                        value={formData.nama_rekening}
                        onChange={e => setFormData({...formData, nama_rekening: e.target.value})}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm"
                        placeholder="Contoh: RPL 123 Satker"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Row 3: Nominal & Bukti File */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nominal (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.nominal}
                    onChange={e => setFormData({...formData, nominal: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                    placeholder="Contoh: 1500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>Bukti File (Wajib)</span>
                    <span className="text-[11px] font-normal text-blue-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Auto-Deteksi AI
                    </span>
                  </label>
                  <div className="border border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-3 bg-gray-50/50 transition-colors">
                    <input
                      type="file"
                      required
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                    <p className="text-[11px] text-gray-400 mt-2">
                      {aiScanning ? 'Sedang memindai...' : 'PDF / Excel Rekening Koran akan dibaca otomatis'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 4: Uraian & Catatan Tambahan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Uraian / Deskripsi</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.uraian}
                    onChange={e => setFormData({...formData, uraian: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                    placeholder="Contoh: Pembayaran tagihan listrik bulan Agustus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catatan Tambahan (Opsional)</label>
                  <textarea
                    rows={2}
                    value={formData.catatan_audit}
                    onChange={e => setFormData({...formData, catatan_audit: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                    placeholder="Catatan verifikasi atau keterangan referensi audit..."
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || aiScanning}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {submitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-32">Tanggal</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Uraian</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-24">Jenis</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori Dokumen</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Bank</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Nominal</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? <tr><td colSpan={8} className="p-8 text-center text-gray-500">Memuat data...</td></tr> : 
                filteredData.length === 0 ? <tr><td colSpan={8} className="p-8 text-center text-gray-500">Belum ada data transaksi.</td></tr> :
                filteredData.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-600 font-medium">{new Date(t.tanggal).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 line-clamp-2">{t.uraian}</p>
                    {t.catatan_audit && <p className="text-xs text-gray-500 mt-1 italic">Note: {t.catatan_audit}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx("px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider", t.jenis === 'debit' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                      {t.jenis === 'debit' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.nama_kategori}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.nama_bank ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md text-xs">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        {t.nama_bank}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                    Rp {Number(t.nominal).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {t.bukti_file ? (
                      <button
                        onClick={() => openFile(t.bukti_file, token || '')}
                        className="inline-flex items-center justify-center p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Lihat Bukti"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
