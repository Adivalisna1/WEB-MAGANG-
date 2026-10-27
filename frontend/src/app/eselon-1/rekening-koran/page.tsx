'use client';
import toast from 'react-hot-toast';

import { useEffect, useState, useRef, useMemo } from 'react';
import { getSession } from '@/lib/auth';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';
import { FileSpreadsheet, Upload, Download, ArrowLeft, Search, Loader2, Table2, Save, Trash2, Edit, Plus, X, Building2, CreditCard, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';


const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const BULAN_OPTIONS = [
  { val: '1', label: 'Januari' },
  { val: '2', label: 'Februari' },
  { val: '3', label: 'Maret' },
  { val: '4', label: 'April' },
  { val: '5', label: 'Mei' },
  { val: '6', label: 'Juni' },
  { val: '7', label: 'Juli' },
  { val: '8', label: 'Agustus' },
  { val: '9', label: 'September' },
  { val: '10', label: 'Oktober' },
  { val: '11', label: 'November' },
  { val: '12', label: 'Desember' },
];

const TRIWULAN_OPTIONS = [
  { val: 'TW1', label: 'Triwulan I (Jan - Mar)', months: [1, 2, 3] },
  { val: 'TW2', label: 'Triwulan II (Apr - Jun)', months: [4, 5, 6] },
  { val: 'TW3', label: 'Triwulan III (Jul - Sep)', months: [7, 8, 9] },
  { val: 'TW4', label: 'Triwulan IV (Okt - Des)', months: [10, 11, 12] },
];

const TAHUN_OPTIONS = ['2026', '2025', '2024'];

const BULAN_NAMES = [
  'januari', 'februari', 'maret', 'april', 'mei', 'juni',
  'juli', 'agustus', 'september', 'oktober', 'november', 'desember'
];

function getRecordMonth(periode?: string | number, created_at?: string): number | null {
  if (periode != null) {
    const s = String(periode).trim().toLowerCase();
    const asNum = parseInt(s, 10);
    if (!isNaN(asNum) && asNum >= 1 && asNum <= 12) return asNum;
    for (let i = 0; i < BULAN_NAMES.length; i++) {
      if (s.includes(BULAN_NAMES[i])) return i + 1;
    }
  }
  if (created_at) {
    const d = new Date(created_at);
    if (!isNaN(d.getTime())) return d.getMonth() + 1;
  }
  return null;
}

function getRecordYear(tahun?: number | string, periode?: string | number, created_at?: string): number {
  if (tahun) {
    const y = parseInt(String(tahun), 10);
    if (!isNaN(y) && y > 2000) return y;
  }
  if (periode) {
    const match = String(periode).match(/\b(202[0-9])\b/);
    if (match) return parseInt(match[1], 10);
  }
  if (created_at) {
    const d = new Date(created_at);
    if (!isNaN(d.getTime())) return d.getFullYear();
  }
  return 2026;
}

const formatPeriodeDisplay = (periode?: string | number, tahun?: number) => {
  if (!periode && !tahun) return '-';
  const pStr = String(periode || '').trim();
  const found = BULAN_OPTIONS.find(b => b.val === pStr || b.label.toLowerCase() === pStr.toLowerCase());
  const namaBulan = found ? found.label : pStr;
  if (!namaBulan && tahun) return `${tahun}`;
  if (tahun && !namaBulan.includes(String(tahun))) {
    return `${namaBulan} ${tahun}`;
  }
  return namaBulan || '-';
};

interface KertasKerja {
  id: number;
  satker_id: number | null;
  nama_satker?: string;
  kode_satker?: string;
  nama_bank: string | null;
  nomor_rekening_bank: string | null;
  nama_rekening: string | null;
  nomor_pembukaan_rekening: string | null;
  tanggal_pembukaan_rekening: string | null;
  saldo_akhir_bulan: number;
  saldo_rk: number;
  saldo_rekening: number;
  saldo_rpl_lpj: number;
  keterangan: string | null;
  periode?: string;
  tahun?: number;
  created_at: string;
}

interface Satker {
  id: number;
  nama: string;
  NO_Satker?: string;
}

const initialRowState = {
  nama_bank: '', nomor_rekening_bank: '', nama_rekening: '', nomor_pembukaan_rekening: '', 
  tanggal_pembukaan_rekening: '', saldo_akhir_bulan: 0, saldo_rk: 0, saldo_rekening: 0, 
  saldo_rpl_lpj: 0, keterangan: ''
};

export default function KertasKerjaPage() {
  const [dataList, setDataList] = useState<KertasKerja[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [searchQ, setSearchQ] = useState('');
  const [filterSatker, setFilterSatker] = useState('');
  const [filterBank, setFilterBank] = useState('');
  const [modeFilter, setModeFilter] = useState<'bulan' | 'triwulan' | 'tahun'>('bulan');
  const [filterBulan, setFilterBulan] = useState<string>('all');
  const [filterTriwulan, setFilterTriwulan] = useState<string>('TW1');
  const [filterTahun, setFilterTahun] = useState<string>('2026');
  const [satkerList, setSatkerList] = useState<Satker[]>([]);

  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1') || 1;
  const itemsPerPage = 40;

  const [userRole, setUserRole] = useState('');

  // Edit State
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState(initialRowState);
  const [isSavingRow, setIsSavingRow] = useState<number | 'new' | null>(null);

  // New Row State
  const [newRow, setNewRow] = useState(initialRowState);

  const fetchData = async () => {
    setLoading(true);
    try {
      const session = getSession();
      const currentUser = session?.user;
      setUserRole(currentUser?.role || '');
      
      const res = await fetch(`${API}/rekening-koran`, {
        headers: session ? { Authorization: `Bearer ${session.token}` } : {},
      });
      if (res.ok) {
        const d = await res.json();
        setDataList(d.data ?? []);
      }

      if (['eselon_1', 'pimpinan_satker', 'admin_it', 'it', 'manajemen', 'administrasi', 'operator'].includes(currentUser?.role || '') || ['eselon_1', 'kl'].includes(currentUser?.tingkat || '')) {
        const resSatker = await fetch(`${API}/satker`, {
          headers: session ? { Authorization: `Bearer ${session.token}` } : {},
        });
        if (resSatker.ok) {
          const s = await resSatker.json();
          const allSat = s.data ?? [];
          const userE1 = currentUser?.eselon_1_id;
          const filteredSat = userE1 ? allSat.filter((item: any) => Number(item.eselon_1_id) === Number(userE1)) : allSat;
          setSatkerList(filteredSat);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);



  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      const session = getSession();
      const res = await fetch(`${API}/rekening-koran/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const result = await res.json();
      if (result.success) { toast.success('Data berhasil dihapus'); fetchData(); } 
      else { toast.error('Gagal menghapus: ' + result.message); }
    } catch (err) { toast.error('Terjadi kesalahan server saat menghapus.'); }
  };

  const saveNewRow = async () => {
    if (!newRow.nama_bank || !newRow.nomor_rekening_bank) {
      toast.error('Isi minimal Nama Bank dan Nomor Rekening!');
      return;
    }
    setIsSavingRow('new');
    try {
      const session = getSession();
      const res = await fetch(`${API}/rekening-koran`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.token}` },
        body: JSON.stringify(newRow)
      });
      const result = await res.json();
      if (result.success) { setNewRow(initialRowState); fetchData(); } 
      else { toast.error('Gagal menambahkan: ' + result.message); }
    } catch (err) { toast.error('Terjadi kesalahan server.'); } 
    finally { setIsSavingRow(null); }
  };

  const startEdit = (d: KertasKerja) => {
    setEditingRowId(d.id);
    setEditRowData({
      nama_bank: d.nama_bank || '',
      nomor_rekening_bank: d.nomor_rekening_bank || '',
      nama_rekening: d.nama_rekening || '',
      nomor_pembukaan_rekening: d.nomor_pembukaan_rekening || '',
      tanggal_pembukaan_rekening: d.tanggal_pembukaan_rekening ? new Date(d.tanggal_pembukaan_rekening).toISOString().split('T')[0] : '',
      saldo_akhir_bulan: d.saldo_akhir_bulan || 0,
      saldo_rk: d.saldo_rk || 0,
      saldo_rekening: d.saldo_rekening || 0,
      saldo_rpl_lpj: d.saldo_rpl_lpj || 0,
      keterangan: d.keterangan || ''
    });
  };

  const saveInlineEdit = async (id: number) => {
    if (!editRowData.nama_bank || !editRowData.nomor_rekening_bank) {
      toast.error('Nama Bank dan No Rekening tidak boleh kosong!'); return;
    }
    setIsSavingRow(id);
    try {
      const session = getSession();
      const res = await fetch(`${API}/rekening-koran/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.token}` },
        body: JSON.stringify(editRowData)
      });
      const result = await res.json();
      if (result.success) { setEditingRowId(null); fetchData(); } 
      else { toast.error('Gagal mengupdate: ' + result.message); }
    } catch (err) { toast.error('Terjadi kesalahan server.'); } 
    finally { setIsSavingRow(null); }
  };

  const downloadZip = async () => {
    try {
      const toastId = toast.loading('Memproses file ZIP, mohon tunggu...');
      const session = getSession();
      const res = await fetch(`${API}/eselon-1/dokumen/export-zip?satker_id=${filterSatker}`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.detail || errorData.message || 'Gagal mendownload ZIP', { id: toastId });
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Ambil nama satker terpilih
      const satkerName = satkerList.find(s => s.id === Number(filterSatker))?.nama || 'Satker';
      a.download = `Rekening_Koran_${satkerName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('File ZIP berhasil didownload', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Gagal memproses ZIP');
    }
  };

  const exportToExcel = () => {
    try {
      let filterLabel = '';
      if (modeFilter === 'bulan') {
        const bLabel = filterBulan !== 'all' ? (BULAN_OPTIONS.find(b => b.val === filterBulan)?.label || filterBulan) : 'Semua_Bulan';
        filterLabel = `${bLabel}_${filterTahun || '2026'}`;
      } else if (modeFilter === 'triwulan') {
        const tw = TRIWULAN_OPTIONS.find(t => t.val === filterTriwulan);
        filterLabel = `${tw?.val || filterTriwulan}_${filterTahun || '2026'}`;
      } else {
        filterLabel = `Tahunan_${filterTahun || '2026'}`;
      }

      const filename = `Rekap_Saldo_Bank_${filterLabel}.xlsx`;

      const rows = filteredData.map((d, idx) => ({
        'No': idx + 1,
        'Satker': d.nama_satker || '-',
        'Kode Satker': d.kode_satker || '-',
        'Mitra Bank': d.nama_bank || '-',
        'Nomor Rekening': d.nomor_rekening_bank || '-',
        'Nama Rekening': d.nama_rekening || '-',
        'Periode': formatPeriodeDisplay(d.periode, d.tahun),
        'Total Saldo Kas Bank (Rp)': Number(d.saldo_akhir_bulan || 0),
        'Keterangan': d.keterangan || '-'
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rekening_Koran");
      XLSX.writeFile(wb, filename);
      toast.success(`Berhasil mengunduh ${filename}`);
    } catch (err) {
      toast.error('Gagal export Excel. Coba lagi.');
    }
  };

  const filteredData = useMemo(() => {
    return dataList.filter(d => {
      const matchSearch = !searchQ || 
        d.nama_bank?.toLowerCase().includes(searchQ.toLowerCase()) || 
        d.nomor_rekening_bank?.includes(searchQ) || 
        d.nama_rekening?.toLowerCase().includes(searchQ.toLowerCase());
      const matchSatker = !filterSatker || d.satker_id === Number(filterSatker);
      const matchBank = !filterBank || (d.nama_bank || '').trim().toLowerCase() === filterBank.trim().toLowerCase();

      const recMonth = getRecordMonth(d.periode, d.created_at);
      const recYear = getRecordYear(d.tahun, d.periode, d.created_at);

      let matchWaktu = true;
      if (modeFilter === 'bulan') {
        const matchTahun = !filterTahun || filterTahun === 'all' || recYear === Number(filterTahun);
        const matchBulan = !filterBulan || filterBulan === 'all' || recMonth === Number(filterBulan);
        matchWaktu = matchTahun && matchBulan;
      } else if (modeFilter === 'triwulan') {
        const tw = TRIWULAN_OPTIONS.find(t => t.val === filterTriwulan);
        const matchTahun = !filterTahun || filterTahun === 'all' || recYear === Number(filterTahun);
        const matchBulan = tw ? (recMonth !== null && tw.months.includes(recMonth)) : true;
        matchWaktu = matchTahun && matchBulan;
      } else if (modeFilter === 'tahun') {
        matchWaktu = !filterTahun || filterTahun === 'all' || recYear === Number(filterTahun);
      }

      return matchSearch && matchSatker && matchBank && matchWaktu;
    });
  }, [dataList, searchQ, filterSatker, filterBank, modeFilter, filterBulan, filterTriwulan, filterTahun]);

  // Agregasi per Bank: 1. Nama per Bank, 2. No Rek per Bank, 3. Saldo per Rek, 4. Total Saldo per Bank
  const bankSummary = useMemo(() => {
    const map: Record<string, {
      nama_bank: string;
      total_saldo: number;
      rekening_list: Array<{ id: number; no_rek: string; nama_rek: string; saldo: number }>;
    }> = {};

    filteredData.forEach(item => {
      const bName = (item.nama_bank || 'Bank Lainnya').trim();
      const bKey = bName.toUpperCase();
      if (!map[bKey]) {
        map[bKey] = {
          nama_bank: bName,
          total_saldo: 0,
          rekening_list: []
        };
      }
      const saldo = Number(item.saldo_akhir_bulan || 0);
      map[bKey].total_saldo += saldo;
      map[bKey].rekening_list.push({
        id: item.id,
        no_rek: item.nomor_rekening_bank || '-',
        nama_rek: item.nama_rekening || '-',
        saldo: saldo
      });
    });

    return Object.values(map);
  }, [filteredData]);

  const bankTotalMap = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(item => {
      const b = (item.nama_bank || 'Bank Lainnya').trim().toUpperCase();
      map[b] = (map[b] || 0) + Number(item.saldo_akhir_bulan || 0);
    });
    return map;
  }, [filteredData]);

  const totalSaldoSemuaBank = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + Number(curr.saldo_akhir_bulan || 0), 0);
  }, [filteredData]);

  const uniqueBanks = useMemo(() => {
    return Array.from(new Set(dataList.map(d => (d.nama_bank || 'Bank Lainnya').trim()))).filter(Boolean).sort();
  }, [dataList]);

  const isEselon1 = true;
  const isPimpinan = userRole === 'manajemen' || userRole === 'pimpinan';

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
            Rekening Koran
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Rekapitulasi Saldo Bank dan Laporan Riwayat Rekening Koran Satker Binaan.
          </p>
        </div>
      </div>

      {/* Ringkasan Saldo Per Bank: 1. Nama per Bank, 2. No Rek per Bank, 3. Saldo per Rek, 4. Total Saldo per Bank */}
      <div className="space-y-4">
        {/* Ringkasan Akumulasi Total */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide uppercase text-blue-100">Total Seluruh Saldo Bank</span>
              <div className="p-2 bg-white/10 rounded-xl">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-black mt-2">
              Rp {totalSaldoSemuaBank.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-blue-100/80 mt-1">
              Akumulasi dari {filteredData.length} rekening terdaftar
            </p>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase">Jumlah Mitra Bank</span>
              <div className="text-2xl font-black text-gray-900 mt-0.5">{bankSummary.length} Bank</div>
              <p className="text-xs text-gray-500">Terdistribusi di Satker Binaan</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase">Total Rekening Aktif</span>
              <div className="text-2xl font-black text-gray-900 mt-0.5">{filteredData.length} Rekening</div>
              <p className="text-xs text-gray-500">Sesuai filter terpilih</p>
            </div>
          </div>
        </div>

        {/* Kartu Rincian Per Bank */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Ringkasan Saldo Per Bank
            </h2>
            {filterBank && (
              <button 
                onClick={() => setFilterBank('')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Reset Filter Bank
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankSummary.map((b) => (
              <div 
                key={b.nama_bank} 
                onClick={() => setFilterBank(filterBank === b.nama_bank ? '' : b.nama_bank)}
                className={`bg-white border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                  filterBank.toLowerCase() === b.nama_bank.toLowerCase() ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10' : 'border-gray-200/90'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        {/* 1. Nama per Bank */}
                        <h3 className="font-bold text-gray-900 text-sm">{b.nama_bank}</h3>
                        <span className="text-[11px] text-gray-500 font-medium">{b.rekening_list.length} Rekening</span>
                      </div>
                    </div>
                    {/* 4. Total Saldo per Bank */}
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Saldo Bank</span>
                      <span className="text-sm font-black text-blue-600">
                        Rp {b.total_saldo.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* 2. No Rek per Bank & 3. Saldo per Rek */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {b.rekening_list.map((rek, idx) => (
                      <div key={rek.id || idx} className="bg-gray-50/80 hover:bg-gray-100/70 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between text-xs transition-colors">
                        <div className="min-w-0 pr-2">
                          <div className="font-mono font-bold text-gray-800 text-xs truncate">
                            {rek.no_rek}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate" title={rek.nama_rek}>
                            {rek.nama_rek}
                          </div>
                        </div>
                        <div className="text-right font-extrabold text-gray-900 whitespace-nowrap">
                          Rp {rek.saldo.toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Total Akumulasi:</span>
                  <span className="font-bold text-gray-800">Rp {b.total_saldo.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Rentang Waktu 3 Mode (Per Bulan, Per 3 Bulan / Triwulan, 1 Tahun Penuh) */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setModeFilter('bulan')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                modeFilter === 'bulan'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Per Bulan (1 Bulan)</span>
            </button>

            <button
              type="button"
              onClick={() => setModeFilter('triwulan')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                modeFilter === 'triwulan'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Per 3 Bulan (Triwulan)</span>
            </button>

            <button
              type="button"
              onClick={() => setModeFilter('tahun')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                modeFilter === 'tahun'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>1 Tahun Penuh</span>
            </button>
          </div>

          {/* Current Active Filter Indicator */}
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span>Filter Aktif:</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              {modeFilter === 'bulan' && (filterBulan === 'all' ? `Semua Bulan ${filterTahun}` : `${BULAN_OPTIONS.find(b => b.val === filterBulan)?.label} ${filterTahun}`)}
              {modeFilter === 'triwulan' && `${TRIWULAN_OPTIONS.find(t => t.val === filterTriwulan)?.label} ${filterTahun}`}
              {modeFilter === 'tahun' && `Tahun ${filterTahun}`}
            </span>
          </div>
        </div>

        {/* Controls Dropdown based on active Mode */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
          {modeFilter === 'bulan' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Bulan:</span>
              <select
                value={filterBulan}
                onChange={e => setFilterBulan(e.target.value)}
                className="text-xs font-semibold border border-gray-300 rounded-xl px-3 py-1.5 bg-white shadow-xs focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">Semua Bulan (12 Bulan)</option>
                {BULAN_OPTIONS.map(b => (
                  <option key={b.val} value={b.val}>{b.label}</option>
                ))}
              </select>
            </div>
          )}

          {modeFilter === 'triwulan' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Triwulan:</span>
              <select
                value={filterTriwulan}
                onChange={e => setFilterTriwulan(e.target.value)}
                className="text-xs font-semibold border border-gray-300 rounded-xl px-3 py-1.5 bg-white shadow-xs focus:ring-2 focus:ring-blue-500/20"
              >
                {TRIWULAN_OPTIONS.map(tw => (
                  <option key={tw.val} value={tw.val}>{tw.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tahun selector (available across modes) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Tahun:</span>
            <select
              value={filterTahun}
              onChange={e => setFilterTahun(e.target.value)}
              className="text-xs font-semibold border border-gray-300 rounded-xl px-3 py-1.5 bg-white shadow-xs focus:ring-2 focus:ring-blue-500/20"
            >
              {TAHUN_OPTIONS.map(th => (
                <option key={th} value={th}>{th}</option>
              ))}
              {modeFilter === 'bulan' && <option value="all">Semua Tahun</option>}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-[200px] max-w-sm shadow-xs">
              <Search className="w-4 h-4 text-gray-400" />
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Cari Bank / No Rek / Nama Rek..." className="flex-1 text-sm outline-none" />
            </div>

            <select
              value={filterBank}
              onChange={e => setFilterBank(e.target.value)}
              className="text-xs font-medium border border-gray-300 rounded-xl px-3 py-2 bg-white shadow-xs focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Semua Bank ({uniqueBanks.length})</option>
              {uniqueBanks.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            
            {['eselon_1', 'pimpinan_satker', 'admin_it'].includes(userRole) && (
              <select value={filterSatker} onChange={e => setFilterSatker(e.target.value)} className="text-xs font-medium border border-gray-300 rounded-xl px-3 py-2 bg-white shadow-xs focus:ring-2 focus:ring-blue-500/20">
                <option value="">Semua Satker</option>
                {satkerList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEselon1 && (
              <button 
                onClick={() => {
                  if (!filterSatker) return toast.error('Pilih Satker terlebih dahulu untuk mendownload ZIP Bukti File Rekening Koran.');
                  downloadZip();
                }} 
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shadow-xs"
              >
                <Download className="w-4 h-4" /> Export ZIP Bukti
              </button>
            )}
            <button onClick={exportToExcel} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shadow-xs">
              <Download className="w-4 h-4" /> Export Excel ({filteredData.length})
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200/90 rounded-2xl overflow-x-auto shadow-xs">
          <table className="w-full text-xs text-left min-w-[1100px]">
            <thead className="bg-gray-50/90 border-b border-gray-200 text-gray-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-[120px]">Periode</th>
                <th className="px-4 py-3.5 w-[100px]">Satker</th>
                <th className="px-4 py-3.5 w-[180px]">Mitra Bank</th>
                <th className="px-4 py-3.5 w-[160px]">No. Rekening</th>
                <th className="px-4 py-3.5">Nama Rekening</th>
                <th className="px-4 py-3.5 text-right w-[180px] text-blue-700 font-extrabold">Total Saldo Bank</th>
                <th className="px-4 py-3.5 w-[160px]">Keterangan</th>
                {!isPimpinan && <th className="px-4 py-3.5 text-right w-[80px]">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={!isPimpinan ? 8 : 7} className="text-center py-8 text-gray-500">Memuat data...</td></tr> :
                paginatedData.length === 0 ? <tr><td colSpan={!isPimpinan ? 8 : 7} className="text-center py-8 text-gray-400">Belum ada data.</td></tr> :
                paginatedData.map(d => {
                  const isEditing = editingRowId === d.id;
                  const bankKey = (d.nama_bank || '').trim().toUpperCase();
                  const totalBankSaldo = bankTotalMap[bankKey] || 0;
                  return (
                    <tr key={d.id} className="hover:bg-blue-50/30 transition-colors group">
                        {isEditing ? (
                          <>
                            <td className="px-3 py-2 text-gray-700 font-semibold">{formatPeriodeDisplay(d.periode, d.tahun)}</td>
                            <td className="px-3 py-2 text-gray-500 truncate max-w-[100px]">{d.kode_satker || '-'}</td>
                            <td className="px-1.5 py-2"><input type="text" value={editRowData.nama_bank} onChange={e => setEditRowData({...editRowData, nama_bank: e.target.value})} className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-semibold"/></td>
                            <td className="px-1.5 py-2"><input type="text" value={editRowData.nomor_rekening_bank} onChange={e => setEditRowData({...editRowData, nomor_rekening_bank: e.target.value})} className="w-full text-xs font-mono border border-blue-300 px-2 py-1.5 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"/></td>
                            <td className="px-1.5 py-2"><input type="text" value={editRowData.nama_rekening} onChange={e => setEditRowData({...editRowData, nama_rekening: e.target.value})} className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"/></td>
                            <td className="px-1.5 py-2"><input type="text" placeholder="Rp 0" value={editRowData.saldo_akhir_bulan ? Number(editRowData.saldo_akhir_bulan).toLocaleString('id-ID') : ''} onChange={e => { const raw = e.target.value.replace(/\D/g, ''); setEditRowData({...editRowData, saldo_akhir_bulan: raw ? parseInt(raw, 10) : 0}); }} className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded-lg text-right font-bold focus:ring-1 focus:ring-blue-500 outline-none" title="Pemisah ribuan titik otomatis"/></td>
                            <td className="px-1.5 py-2"><input type="text" value={editRowData.keterangan} onChange={e => setEditRowData({...editRowData, keterangan: e.target.value})} className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Keterangan..."/></td>
                            <td className="px-2 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => saveInlineEdit(d.id)} disabled={isSavingRow === d.id} className="p-1.5 text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-xs transition-colors">
                                  {isSavingRow === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Save className="w-3.5 h-3.5" />}
                                </button>
                                <button onClick={() => setEditingRowId(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-gray-700 font-semibold">{formatPeriodeDisplay(d.periode, d.tahun)}</td>
                            <td className="px-4 py-3 text-gray-600 truncate max-w-[100px]" title={d.nama_satker || ''}>{d.kode_satker || '-'}</td>
                            {/* 1. Nama per Bank */}
                            <td onDoubleClick={() => !isPimpinan && startEdit(d)} className="px-4 py-3 text-gray-900 font-semibold cursor-pointer">
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <span className="truncate">{d.nama_bank || '-'}</span>
                              </div>
                            </td>
                            {/* 2. No Rek per Bank */}
                            <td onDoubleClick={() => !isPimpinan && startEdit(d)} className="px-4 py-3 text-gray-800 font-mono font-medium text-xs cursor-pointer">
                              {d.nomor_rekening_bank || '-'}
                            </td>
                            <td onDoubleClick={() => !isPimpinan && startEdit(d)} className="px-4 py-3 text-gray-600 max-w-[180px] truncate cursor-pointer" title={d.nama_rekening || ''}>
                              {d.nama_rekening || '-'}
                            </td>
                            {/* Total Saldo Bank */}
                            <td onDoubleClick={() => !isPimpinan && startEdit(d)} className="px-4 py-3 text-right font-black text-blue-700 bg-blue-50/40 whitespace-nowrap cursor-pointer">
                              Rp {Number(d.saldo_akhir_bulan || 0).toLocaleString('id-ID')}
                            </td>
                            <td onDoubleClick={() => !isPimpinan && startEdit(d)} className="px-4 py-3 text-gray-600 text-xs truncate max-w-[160px] cursor-pointer" title={d.keterangan || ''}>
                              {d.keterangan || '-'}
                            </td>
                            {!isPimpinan && (
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => startEdit(d)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center" title="Edit Baris">
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </>
                        )}
                      </tr>
                    );
                  })
                }
                  
                {!isPimpinan && (
                  <tr className="bg-emerald-50/30 border-t-2 border-emerald-100">
                    <td className="px-3 py-2 text-[10px] text-emerald-700 font-bold uppercase tracking-wider text-center bg-emerald-100/50 rounded-l">Data Baru</td>
                    <td className="px-1.5 py-2"><input type="text" placeholder="1. Nama Bank..." value={newRow.nama_bank} onChange={e => setNewRow({...newRow, nama_bank: e.target.value})} className="w-full text-xs font-semibold border border-emerald-200 px-2 py-1.5 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"/></td>
                    <td className="px-1.5 py-2"><input type="text" placeholder="2. No Rekening..." value={newRow.nomor_rekening_bank} onChange={e => setNewRow({...newRow, nomor_rekening_bank: e.target.value})} className="w-full text-xs font-mono border border-emerald-200 px-2 py-1.5 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"/></td>
                    <td className="px-1.5 py-2"><input type="text" placeholder="Nama Rekening..." value={newRow.nama_rekening} onChange={e => setNewRow({...newRow, nama_rekening: e.target.value})} className="w-full text-xs border border-emerald-200 px-2 py-1.5 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"/></td>
                    <td className="px-1.5 py-2"><input type="text" placeholder="Saldo Bank (Rp)..." value={newRow.saldo_akhir_bulan ? Number(newRow.saldo_akhir_bulan).toLocaleString('id-ID') : ''} onChange={e => { const raw = e.target.value.replace(/\D/g, ''); setNewRow({...newRow, saldo_akhir_bulan: raw ? parseInt(raw, 10) : 0}); }} className="w-full text-xs font-bold border border-emerald-200 px-2 py-1.5 rounded-lg text-right focus:ring-1 focus:ring-emerald-500 outline-none" title="Pemisah ribuan titik otomatis"/></td>
                    <td className="px-1.5 py-2"><input type="text" placeholder="Keterangan..." value={newRow.keterangan} onChange={e => setNewRow({...newRow, keterangan: e.target.value})} className="w-full text-xs border border-emerald-200 px-2 py-1.5 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"/></td>
                    <td className="px-2 py-2 text-right">
                      <button onClick={saveNewRow} disabled={isSavingRow === 'new'} className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium ml-auto disabled:opacity-50 transition-colors shadow-xs">
                        {isSavingRow === 'new' ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Plus className="w-3.5 h-3.5" />} <span>Tambah</span>
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold text-gray-800">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right uppercase tracking-wider text-xs text-gray-600">
                    Total Keseluruhan Saldo ({filteredData.length} Rekening):
                  </td>
                  <td className="px-4 py-3 text-right font-black text-blue-700 text-sm whitespace-nowrap bg-blue-50/50">
                    Rp {totalSaldoSemuaBank.toLocaleString('id-ID')}
                  </td>
                  <td colSpan={!isPimpinan ? 2 : 1}></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/eselon-1/rekening-koran" />
        </div>
    </div>
  );
}
