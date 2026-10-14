'use client';
import toast from 'react-hot-toast';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Plus, Edit, Download, Paperclip, Search, DollarSign, 
  TrendingUp, Building2, Clock, X, Loader2, CheckCircle2, 
  AlertCircle, Sparkles, Landmark, Filter, Eye, FileText
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

// Helper tampilkan periode (fallback otomatis dari tanggal jika kolom periode kosong)
const getDisplayPeriode = (periode?: string, tanggal?: string) => {
  if (periode && periode.trim() && periode !== '-' && periode !== 'None') return periode;
  if (tanggal) {
    try {
      const d = new Date(tanggal);
      if (!isNaN(d.getTime())) {
        const m = d.toLocaleDateString('id-ID', { month: 'long' });
        const y = d.getFullYear();
        return `${m.charAt(0).toUpperCase() + m.slice(1)} ${y}`;
      }
    } catch {}
  }
  return '-';
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

export default function Eselon1PencatatanPage() {
  const { token, user } = useAuth();
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [kategori, setKategori] = useState<any[]>([]);
  const [satkerList, setSatkerList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isOperator = user?.role === 'operator' || user?.is_operator;

  // Filter State
  const [filterSatker, setFilterSatker] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterPeriode, setFilterPeriode] = useState('');
  const [searchUraian, setSearchUraian] = useState('');

  // Form State
  const currentMonthName = new Date().toLocaleDateString('id-ID', { month: 'long' });
  const currentYear = new Date().getFullYear();
  const defaultPeriode = `${currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)} ${currentYear}`;
  const todayDate = new Date().toISOString().split('T')[0];

  const [showForm, setShowForm] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    tanggal: todayDate,
    periode: defaultPeriode,
    satker_id: '',
    uraian: '',
    jenis: 'debit',
    id_kategori: '',
    nominal: '',
    saldo_akhir: '',
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
      const [resTx, resCat, resSat] = await Promise.all([
        fetch(`${API}/pencatatan`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/pencatatan/kategori`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/satker`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const jTx = await resTx.json();
      const jCat = await resCat.json();
      const jSat = await resSat.json();
      if (jTx.success) setTransaksi(jTx.data);
      if (jCat.success) setKategori(jCat.data);
      if (jSat.success && Array.isArray(jSat.data)) {
        const binaan = user?.eselon_1_id
          ? jSat.data.filter((s: any) => Number(s.eselon_1_id) === Number(user.eselon_1_id))
          : jSat.data;
        setSatkerList(binaan);
      }
    } catch {
      toast.error('Gagal mengambil data pencatatan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const sortedKategori = sortKategoriDokumen(kategori);

  // Handle otomatis scan berkas ketika user memilih file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setAiResult(null);
    setAiError('');

    if (!selectedFile) return;

    // Tanggal otomatis diset ke tanggal saat berkas diimport
    const nowIso = new Date().toISOString().split('T')[0];

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

          const isRekeningKoran = 
            result.kategori?.toLowerCase().includes('rekening') ||
            result.kategori?.toLowerCase().includes('koran') ||
            selectedFile.name.toLowerCase().includes('rk') ||
            selectedFile.name.toLowerCase().includes('koran');

          setFormData(prev => {
            const updated = { ...prev };
            updated.tanggal = nowIso;

            if (isRekeningKoran) {
              const rkCat = sortedKategori.find(k =>
                k.nama_kategori?.toLowerCase().includes('rekening koran') ||
                k.nama_kategori?.toLowerCase().includes('rekening_koran')
              );
              if (rkCat) {
                updated.id_kategori = String(rkCat.id);
              }
            }

            if (result.bank) {
              const bName = result.bank.toLowerCase().trim();
              let matchedBank = BANK_BUMN_LIST.find(b => {
                const cleanB = b.toLowerCase().replace('bank ', '').trim();
                return bName.includes(cleanB) || cleanB.includes(bName) || (bName.includes('bsi') && b.toLowerCase().includes('bsi'));
              });
              if (!matchedBank) {
                matchedBank = result.bank || '';
              }
              updated.nama_bank = matchedBank || '';
            }

            if (result.nominal !== undefined && result.nominal !== null) {
              updated.nominal = String(result.nominal);
              updated.saldo_akhir = String(result.nominal);
            }

            if (result.nomor_rekening && !prev.nomor_rekening_bank) {
              updated.nomor_rekening_bank = String(result.nomor_rekening);
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
        setAiError('Gagal menganalisis otomatis berkas.');
      } finally {
        setAiScanning(false);
      }
    }
  };

  // Filtered data
  const filteredData = transaksi.filter(t => {
    const matchSatker = !filterSatker || t.satker_nama === filterSatker;
    const matchKategori = !filterKategori || String(t.id_kategori) === filterKategori;
    const matchJenis = !filterJenis || t.jenis === filterJenis;
    const tPeriode = getDisplayPeriode(t.periode, t.tanggal);
    const matchPeriode = !filterPeriode || tPeriode.toLowerCase() === filterPeriode.toLowerCase();
    const matchUraian = !searchUraian || t.uraian?.toLowerCase().includes(searchUraian.toLowerCase());
    return matchSatker && matchKategori && matchJenis && matchPeriode && matchUraian;
  });

  const uniqueSatker = Array.from(new Set(transaksi.map(t => t.satker_nama).filter(Boolean))).sort();
  const uniquePeriode = Array.from(
    new Set(transaksi.map(t => getDisplayPeriode(t.periode, t.tanggal)).filter(p => p !== '-'))
  ).sort();

  const totalDebit = filteredData.filter(t => t.jenis === 'debit').reduce((acc, t) => acc + Number(t.nominal || 0), 0);
  const totalKredit = filteredData.filter(t => t.jenis === 'kredit').reduce((acc, t) => acc + Number(t.nominal || 0), 0);
  const saldoNetto = totalDebit - totalKredit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    const katName = sortedKategori.find(k => String(k.id) === formData.id_kategori)?.nama_kategori || 'Dokumen';
    const finalBank = formData.nama_bank === 'Bank Lainnya' && customBank.trim()
      ? customBank.trim()
      : formData.nama_bank;
    const finalUraian = formData.uraian?.trim() || `Pencatatan ${katName} - ${finalBank || 'Bank'} (${formData.periode})`;
    const finalTanggal = formData.tanggal || todayDate;
    const finalNominal = formData.saldo_akhir || formData.nominal || '0';

    try {
      const data = new FormData();
      data.append('tanggal', finalTanggal);
      data.append('periode', formData.periode);
      if (formData.satker_id) data.append('satker_id', formData.satker_id);
      data.append('uraian', finalUraian);
      data.append('jenis', 'debit');
      data.append('id_kategori', formData.id_kategori);
      data.append('nominal', finalNominal);
      data.append('saldo_akhir', finalNominal);
      data.append('catatan_audit', formData.catatan_audit);
      data.append('nomor_rekening_bank', formData.nomor_rekening_bank);
      data.append('nama_rekening', formData.nama_rekening);
      data.append('nama_bank', finalBank);
      if (file) data.append('file', file);

      const url = `${API}/pencatatan`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });
      const j = await res.json();
      if (j.success) {
        toast.success('Pencatatan berhasil ditambahkan');
        setShowForm(false);
        setFormData({
          tanggal: todayDate,
          periode: defaultPeriode,
          satker_id: '',
          uraian: '',
          jenis: 'debit',
          id_kategori: '',
          nominal: '',
          saldo_akhir: '',
          catatan_audit: '',
          nomor_rekening_bank: '',
          nama_rekening: '',
          nama_bank: ''
        });
        setCustomBank('');
        setFile(null);
        setAiResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchData();
      } else {
        toast.error(j.message || 'Gagal menyimpan data');
      }
    } catch {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setSubmitLoading(false);
    }
  };

  const exportExcel = () => {
    const rows = filteredData.map((t, idx) => ({
      No: idx + 1,
      Tanggal: t.tanggal ? new Date(t.tanggal).toLocaleDateString('id-ID') : '',
      'Satker Binaan': t.satker_nama || 'Pusat',
      'Kategori Dokumen': t.nama_kategori || '',
      Bank: t.nama_bank || '',
      'Nomor Rekening': t.nomor_rekening || '',
      'Nama Rekening': t.nama_rekening || '',
      Uraian: t.uraian,
      Jenis: t.jenis === 'debit' ? 'Penerimaan (Debit)' : 'Pengeluaran (Kredit)',
      Nominal: Number(t.nominal || 0),
      Pembuat: t.pembuat || '',
      'Catatan Audit': t.catatan_audit || ''
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pencatatan Eselon 1');
    XLSX.writeFile(wb, `Pencatatan_Kas_${user?.eselon_1_singkatan || 'Eselon1'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {isOperator ? 'Pencatatan Kas Satker Binaan' : 'Rekap Pencatatan Kas Satker'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Data transaksi kas, penerimaan, dan mutasi perbankan dari seluruh Satker binaan {user?.eselon_1_singkatan || 'Ditjen Pembina'}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-xs"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          {isOperator && (
            <button
              onClick={() => {
                setShowForm(true);
                setFormData({
                  tanggal: todayDate,
                  periode: defaultPeriode,
                  satker_id: '',
                  uraian: '',
                  jenis: 'debit',
                  id_kategori: '',
                  nominal: '',
                  saldo_akhir: '',
                  catatan_audit: '',
                  nomor_rekening_bank: '',
                  nama_rekening: '',
                  nama_bank: ''
                });
                setCustomBank('');
                setFile(null);
                setAiResult(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Tambah Pencatatan
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Transaksi</div>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">{filteredData.length} Data</div>
          <div className="text-xs text-slate-500 mt-1">Dari {uniqueSatker.length} Satker Binaan</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Penerimaan (Debit)</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2">Rp {totalDebit.toLocaleString('id-ID')}</div>
          <div className="text-xs text-emerald-600 mt-1">Uang Masuk / Mutasi Tambah</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs bg-gradient-to-br from-white to-rose-50/30">
          <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">Total Pengeluaran (Kredit)</div>
          <div className="text-2xl font-extrabold text-rose-700 mt-2">Rp {totalKredit.toLocaleString('id-ID')}</div>
          <div className="text-xs text-rose-600 mt-1">Belanja / Mutasi Kurang</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-xs bg-gradient-to-br from-white to-blue-50/30">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Saldo Netto Kas</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-2">Rp {saldoNetto.toLocaleString('id-ID')}</div>
          <div className="text-xs text-blue-600 mt-1">Penerimaan - Pengeluaran</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari uraian pencatatan..."
            value={searchUraian}
            onChange={e => setSearchUraian(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
          />
        </div>

        <select
          value={filterSatker}
          onChange={e => setFilterSatker(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
        >
          <option value="">Semua Satker Binaan ({satkerList.length > 0 ? satkerList.length : uniqueSatker.length})</option>
          {satkerList.length > 0 ? (
            satkerList.map(s => (
              <option key={s.id} value={s.nama}>
                {s.NO_Satker ? `[${s.NO_Satker}] ` : ''}{s.nama}
              </option>
            ))
          ) : (
            uniqueSatker.map(s => (
              <option key={s} value={s}>{s}</option>
            ))
          )}
        </select>

        <select
          value={filterKategori}
          onChange={e => setFilterKategori(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Semua Kategori Dokumen</option>
          {sortedKategori.map(k => (
            <option key={k.id} value={k.id}>{k.nama_kategori}</option>
          ))}
        </select>

        <select
          value={filterJenis}
          onChange={e => setFilterJenis(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Semua Jenis</option>
          <option value="debit">Penerimaan (Debit)</option>
          <option value="kredit">Pengeluaran (Kredit)</option>
        </select>

        <select
          value={filterPeriode}
          onChange={e => setFilterPeriode(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Semua Periode</option>
          {uniquePeriode.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {(filterSatker || filterKategori || filterJenis || filterPeriode || searchUraian) && (
          <button
            onClick={() => {
              setFilterSatker('');
              setFilterKategori('');
              setFilterJenis('');
              setFilterPeriode('');
              setSearchUraian('');
            }}
            className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Tidak ada data pencatatan yang sesuai filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Periode</th>
                  <th className="px-5 py-3.5">Satker Binaan</th>
                  <th className="px-5 py-3.5">Kategori Dokumen</th>
                  <th className="px-5 py-3.5">Bank</th>
                  <th className="px-5 py-3.5 text-right">Saldo Akhir</th>
                  <th className="px-5 py-3.5">Keterangan</th>
                  <th className="px-5 py-3.5 text-center">Bukti</th>
                  <th className="px-5 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded text-[11px]">
                        {getDisplayPeriode(row.periode, row.tanggal)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-800 max-w-[180px] truncate" title={row.satker_nama || 'Satker'}>
                        {row.satker_nama || '—'}
                      </div>
                      {row.pembuat && (
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]" title={`Diinput oleh: ${row.pembuat}`}>
                          Oleh: {row.pembuat}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
                        {row.nama_kategori || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {row.nama_bank ? (
                        <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded">
                          {row.nama_bank}
                        </span>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      Rp {Number(row.saldo_akhir || row.nominal || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-3.5 text-slate-800 max-w-[200px] truncate" title={row.uraian}>
                      {row.uraian || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      {row.bukti_file ? (
                        <button
                          onClick={() => openFile(row.bukti_file, token || '')}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Paperclip className="w-3.5 h-3.5" /> Lihat
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedDetail(row)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                        title="Lihat Detail Transaksi"
                      >
                        <Eye className="w-3.5 h-3.5" /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Pencatatan (Untuk Staff Eselon 1) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Tambah Pencatatan Kas Baru</h2>
                <p className="text-xs text-slate-500">Lengkapi formulir transaksi kas Satker binaan</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Berkas Upload with AI Scanner */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Upload Bukti Berkas / Import PDF Rekening Koran *
                  </label>
                  {aiScanning && (
                    <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memindai berkas...
                    </span>
                  )}
                </div>
                <input
                  required
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.xlsx,.xls,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                />
                <p className="text-[11px] text-slate-500">
                  Format PDF atau Excel akan dipindai otomatis oleh AI untuk mendeteksi Bank, Saldo Akhir, dan Nomor Rekening.
                </p>
              </div>

              {/* AI Auto Extraction Result Banner */}
              {aiResult && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-emerald-800 flex items-center gap-2">
                      <span>AI Berhasil Mengekstrak Data Berkas</span>
                      {aiResult.confidence && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                          Akurasi: {aiResult.confidence}
                        </span>
                      )}
                    </div>
                    <div className="text-emerald-700 leading-relaxed">
                      {aiResult.bank && <span>Bank: <strong>{aiResult.bank}</strong>. </span>}
                      {aiResult.nominal != null && <span>Saldo Akhir: <strong>Rp {Number(aiResult.nominal).toLocaleString('id-ID')}</strong>. </span>}
                      {aiResult.nomor_rekening && <span>No Rekening: <strong>{aiResult.nomor_rekening}</strong>. </span>}
                    </div>
                  </div>
                </div>
              )}

              {aiError && !aiScanning && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Satker Binaan Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Satker Binaan *</label>
                <select
                  required
                  value={formData.satker_id}
                  onChange={e => setFormData({ ...formData, satker_id: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold text-slate-800"
                >
                  <option value="">-- Pilih Satker Binaan ({satkerList.length} Satker) --</option>
                  {satkerList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.NO_Satker ? `[${s.NO_Satker}] ` : ''}{s.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Periode Pengatur Waktu Transaksi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Periode *</label>
                <select
                  required
                  value={formData.periode}
                  onChange={e => setFormData({ ...formData, periode: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold"
                >
                  <option value="">Pilih Periode Bulan...</option>
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                    <option key={m} value={`${m} ${new Date().getFullYear()}`}>
                      {m} {new Date().getFullYear()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row: Kategori Dokumen & Bank (Tetap & Tidak Perlu Diganti) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Dokumen *</label>
                  <select
                    required
                    value={formData.id_kategori}
                    onChange={e => setFormData({ ...formData, id_kategori: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold"
                  >
                    <option value="">Pilih Kategori Dokumen</option>
                    {sortedKategori.map(k => (
                      <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank *</label>
                  <select
                    required
                    value={
                      BANK_BUMN_LIST.includes(formData.nama_bank)
                        ? formData.nama_bank
                        : (formData.nama_bank ? formData.nama_bank : '')
                    }
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({ ...formData, nama_bank: val });
                      if (val !== 'Bank Lainnya') setCustomBank('');
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold"
                  >
                    <option value="">Pilih Bank Persepsi</option>
                    {formData.nama_bank && !BANK_BUMN_LIST.includes(formData.nama_bank) && (
                      <option value={formData.nama_bank}>{formData.nama_bank}</option>
                    )}
                    {BANK_BUMN_LIST.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  {formData.nama_bank === 'Bank Lainnya' && (
                    <input
                      type="text"
                      required
                      placeholder="Ketikkan nama bank..."
                      value={customBank}
                      onChange={e => setCustomBank(e.target.value)}
                      className="mt-2 w-full p-2 border border-slate-200 rounded-lg"
                    />
                  )}
                </div>
              </div>

              {/* Row: Saldo Akhir (Menggantikan Nominal) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Saldo Akhir (Rp) *</span>
                  <span className="text-[11px] font-normal text-slate-400">Nominal saldo akhir kas/rekening</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    placeholder="Contoh: 50000000"
                    value={formData.saldo_akhir || formData.nominal}
                    onChange={e => setFormData({ ...formData, saldo_akhir: e.target.value, nominal: e.target.value })}
                    className="w-full pl-10 pr-3 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || aiScanning}
                  className="flex items-center gap-2 px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitLoading ? 'Menyimpan...' : 'Simpan Pencatatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Pencatatan (History Satker Binaan) */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-800">Detail Pencatatan Kas</h2>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 font-medium">Satker Binaan</span>
                  <span className="font-bold text-slate-900 text-right max-w-[280px]">{selectedDetail.satker_nama || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Kategori Dokumen</span>
                  <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedDetail.nama_kategori || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Periode Laporan</span>
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {getDisplayPeriode(selectedDetail.periode, selectedDetail.tanggal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Tanggal Transaksi</span>
                  <span className="font-mono text-slate-800 font-medium">
                    {selectedDetail.tanggal ? new Date(selectedDetail.tanggal).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium">Saldo Akhir</span>
                  <span className="text-base font-extrabold text-slate-900">
                    Rp {Number(selectedDetail.saldo_akhir || selectedDetail.nominal || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-slate-400 font-semibold mb-1">Uraian Transaksi</div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-800 leading-relaxed font-medium">
                    {selectedDetail.uraian || '—'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-slate-400 font-semibold mb-1">Bank Persepsi</div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-800 font-semibold">
                      {selectedDetail.nama_bank || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-1">Nomor Rekening</div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-800 font-mono">
                      {selectedDetail.nomor_rekening || '—'}
                    </div>
                  </div>
                </div>

                {selectedDetail.catatan_audit && (
                  <div>
                    <div className="text-slate-400 font-semibold mb-1">Catatan Audit</div>
                    <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-amber-900">
                      {selectedDetail.catatan_audit}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Diinput oleh: <strong className="text-slate-600">{selectedDetail.pembuat || '—'}</strong></span>
                  {selectedDetail.created_at && (
                    <span>{new Date(selectedDetail.created_at).toLocaleDateString('id-ID')}</span>
                  )}
                </div>
              </div>

              {selectedDetail.bukti_file && (
                <div className="pt-2">
                  <button
                    onClick={() => openFile(selectedDetail.bukti_file, token || '')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
                  >
                    <Paperclip className="w-4 h-4" /> Buka Bukti Berkas
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
