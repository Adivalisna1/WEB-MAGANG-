'use client';
import toast from 'react-hot-toast';

import { useEffect, useState, useMemo } from 'react';
import { getSession } from '@/lib/auth';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';
import {
  FileSpreadsheet,
  Download,
  Search,
  Loader2,
  Table2,
  Save,
  Edit,
  Plus,
  X,
  Building2,
  CreditCard,
  Calendar,
  Layers,
  ChevronRight,
  FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

const BANK_CODE_MAP: Record<string, string> = {
  'bank mandiri': '008',
  mandiri: '008',
  'bank bri': '002',
  bri: '002',
  'bank rakyat indonesia': '002',
  'bank bni': '009',
  bni: '009',
  'bank negara indonesia': '009',
  'bank btn': '200',
  btn: '200',
  'bank tabungan negara': '200',
  'bank bsi (bank syariah indonesia)': '451',
  'bank bsi': '451',
  bsi: '451',
  'bank syariah indonesia': '451',
  'bank bca': '014',
  bca: '014',
  'bank central asia': '014',
};

const getKodeBank = (namaBank?: string | null, kodeBankDb?: string | null) => {
  if (kodeBankDb && kodeBankDb.trim() && kodeBankDb !== '000' && kodeBankDb !== '999') {
    return kodeBankDb.trim();
  }
  if (!namaBank) return '-';
  const lower = namaBank.toLowerCase().trim();
  for (const [k, v] of Object.entries(BANK_CODE_MAP)) {
    if (lower.includes(k)) return v;
  }
  return '999';
};

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

const openFileBukti = async (bukti_file: string) => {
  const session = getSession();
  const token = session?.token || '';
  const url = bukti_file.startsWith('http')
    ? bukti_file
    : `${API}${bukti_file.startsWith('/api') ? bukti_file.replace('/api', '') : bukti_file}`;

  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
  const isExcel = ['xlsx', 'xls', 'csv'].includes(ext);

  if (isExcel) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
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

interface KertasKerja {
  id: number;
  satker_id: number | null;
  nama_satker?: string;
  kode_satker?: string;
  kode_bank?: string | null;
  nama_bank: string | null;
  nomor_rekening_bank: string | null;
  nama_rekening: string | null;
  nomor_pembukaan_rekening: string | null;
  tanggal_pembukaan_rekening: string | null;
  tanggal_transaksi?: string | null;
  saldo_akhir_bulan: number;
  saldo_rk: number;
  saldo_rekening: number;
  saldo_rpl_lpj: number;
  keterangan: string | null;
  periode?: string;
  tahun?: number;
  is_active?: number;
  bukti_file?: string | null;
  nama_file_bukti?: string | null;
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
  saldo_rpl_lpj: 0, keterangan: '', tahun: 2026, periode: '1'
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

  // Slide-over Bar / Drawer state untuk Bukti Rekening Koran per Bank
  const [selectedBankDrawer, setSelectedBankDrawer] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  
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
      setUserRole(session?.user?.role || '');
      
      const res = await fetch(`${API}/rekening-koran`, {
        headers: session ? { Authorization: `Bearer ${session.token}` } : {},
      });
      if (res.ok) {
        const d = await res.json();
        setDataList(d.data ?? []);
      }

      if (['eselon_1', 'pimpinan_satker', 'admin_it', 'it', 'manajemen', 'administrasi'].includes(session?.user?.role || '') || ['eselon_1', 'kl'].includes(session?.user?.tingkat || '')) {
        const resSatker = await fetch(`${API}/satker`, {
          headers: session ? { Authorization: `Bearer ${session.token}` } : {},
        });
        if (resSatker.ok) {
          const s = await resSatker.json();
          setSatkerList(s.data ?? []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Toggle Status Bukti Rekening Koran (Aktif / Nonaktif) -> Berakibat langsung pada Total Saldo Bank
  const handleToggleStatus = async (item: KertasKerja) => {
    const currentActive = item.is_active !== 0;
    const nextActive = currentActive ? 0 : 1;
    setTogglingId(item.id);

    // Optimistic update agar total saldo bank langsung berubah real-time
    setDataList(prev =>
      prev.map(r => (r.id === item.id ? { ...r, is_active: nextActive } : r))
    );

    try {
      const session = getSession();
      const res = await fetch(`${API}/rekening-koran/${item.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ is_active: nextActive }),
      });
      const j = await res.json();
      if (j.success) {
        toast.success(
          nextActive === 1
            ? `Bukti diaktifkan â€” Saldo dimasukkan ke Total Saldo ${item.nama_bank || 'Bank'}`
            : `Bukti dinonaktifkan â€” Saldo dikecualikan dari Total Saldo ${item.nama_bank || 'Bank'}`
        );
      } else {
        setDataList(prev =>
          prev.map(r => (r.id === item.id ? { ...r, is_active: currentActive ? 1 : 0 } : r))
        );
        toast.error(j.message || 'Gagal mengubah status bukti');
      }
    } catch {
      setDataList(prev =>
        prev.map(r => (r.id === item.id ? { ...r, is_active: currentActive ? 1 : 0 } : r))
      );
      toast.error('Gagal menghubungi server');
    } finally {
      setTogglingId(null);
    }
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
      keterangan: d.keterangan || '',
      tahun: d.tahun || 2026,
      periode: d.periode || '1'
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
        'Kode Bank': getKodeBank(d.nama_bank, d.kode_bank),
        'Mitra Bank': d.nama_bank || '-',
        'Nomor Rekening': d.nomor_rekening_bank || '-',
        'Nama Rekening': d.nama_rekening || '-',
        'Periode': formatPeriodeDisplay(d.periode, d.tahun),
        'Total Saldo Kas Bank (Rp)': Number(d.saldo_akhir_bulan || 0),
        'Status Bukti': d.is_active === 0 ? 'Nonaktif' : 'Aktif',
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
      const matchBank = !filterBank || (d.nama_bank || 'Bank Lainnya').toLowerCase() === filterBank.toLowerCase();

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

  // Grouping: Hanya muncul 1 nomor rekening saja di tabel, dengan Total Saldo Bank adalah akumulasi (jumlah) seluruh data yang memiliki no rek yang sama
  const groupedData = useMemo(() => {
    const map: Record<string, any> = {};

    filteredData.forEach(item => {
      const rawNoRek = (item.nomor_rekening_bank || '-').trim();
      const noRekKey = rawNoRek.replace(/\s+/g, '');
      const bankKey = (item.nama_bank || 'Bank Lainnya').trim().toUpperCase();
      const groupKey = noRekKey !== '-' ? `${bankKey}_${noRekKey}` : `UNKNOWN_${item.id}`;

      if (!map[groupKey]) {
        map[groupKey] = {
          ...item,
          saldo_akhir_bulan: 0,
          raw_items: [],
          bukti_count: 0,
          has_active: false,
        };
      }

      map[groupKey].raw_items.push(item);
      map[groupKey].bukti_count += 1;
      
      const isActive = item.is_active !== 0;
      if (isActive) {
        map[groupKey].has_active = true;
        map[groupKey].saldo_akhir_bulan += Number(item.saldo_akhir_bulan || 0);
      }

      if (!map[groupKey].nama_rekening && item.nama_rekening) {
        map[groupKey].nama_rekening = item.nama_rekening;
      }
      if (item.keterangan && (!map[groupKey].keterangan || map[groupKey].keterangan === '-')) {
        map[groupKey].keterangan = item.keterangan;
      }
    });

    return Object.values(map).map(g => ({
      ...g,
      is_active: g.has_active ? 1 : 0,
      saldo_akhir_bulan: g.has_active 
        ? g.saldo_akhir_bulan 
        : g.raw_items.reduce((acc: number, curr: any) => acc + Number(curr.saldo_akhir_bulan || 0), 0)
    }));
  }, [filteredData]);

  // Agregasi per Bank (Hanya menjumlahkan saldo dari rekening yang statusnya AKTIF)
  const bankSummary = useMemo(() => {
    const groups: Record<string, {
      kode_bank: string;
      nama_bank: string;
      total_saldo: number;
      active_count: number;
      items: KertasKerja[];
      rekening_list: { no_rek: string; nama_rek: string; saldo: number; id: number; is_active: boolean }[];
    }> = {};

    groupedData.forEach(item => {
      const bankName = (item.nama_bank || 'Bank Lainnya').trim();
      const bKey = bankName.toUpperCase();
      if (!groups[bKey]) {
        groups[bKey] = {
          kode_bank: getKodeBank(bankName, item.kode_bank),
          nama_bank: bankName,
          total_saldo: 0,
          active_count: 0,
          items: [],
          rekening_list: []
        };
      }
      const isActive = item.is_active !== 0;
      const saldo = Number(item.saldo_akhir_bulan || 0);
      if (isActive) {
        groups[bKey].total_saldo += saldo;
        groups[bKey].active_count += 1;
      }
      groups[bKey].items.push(...(item.raw_items || [item]));
      groups[bKey].rekening_list.push({
        id: item.id,
        no_rek: item.nomor_rekening_bank || '-',
        nama_rek: item.nama_rekening || '-',
        saldo: saldo,
        is_active: isActive
      });
    });

    return Object.values(groups).sort((a, b) => b.total_saldo - a.total_saldo);
  }, [groupedData]);

  // Lookup map total saldo aktif per bank
  const bankTotalMap = useMemo(() => {
    const map: Record<string, number> = {};
    groupedData.forEach(item => {
      if (item.is_active === 0) return;
      const b = (item.nama_bank || 'Bank Lainnya').trim().toUpperCase();
      map[b] = (map[b] || 0) + Number(item.saldo_akhir_bulan || 0);
    });
    return map;
  }, [groupedData]);

  const totalSaldoSemuaBank = useMemo(() => {
    return groupedData
      .filter(curr => curr.is_active !== 0)
      .reduce((acc, curr) => acc + Number(curr.saldo_akhir_bulan || 0), 0);
  }, [groupedData]);

  const uniqueBanks = useMemo(() => {
    return Array.from(new Set(dataList.map(d => (d.nama_bank || 'Bank Lainnya').trim()))).filter(Boolean).sort();
  }, [dataList]);

  const selectedBankDrawerData = useMemo(() => {
    if (!selectedBankDrawer) return null;
    const key = selectedBankDrawer.trim().toUpperCase();
    return bankSummary.find(b => b.nama_bank.trim().toUpperCase() === key) || null;
  }, [selectedBankDrawer, bankSummary]);

  const isEselon1 = userRole === 'eselon_1';

  const totalPages = Math.ceil(groupedData.length / itemsPerPage);
  const paginatedData = groupedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
            Rekening Koran
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Rekapitulasi Relasi Kode Bank, Nama Bank, Nomor Rekening, dan Total Saldo Aktif.
          </p>
        </div>
      </div>

      {/* Ringkasan Saldo Per Bank */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Total Saldo Aktif Seluruh Bank</span>
              <Building2 className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-2xl font-black mt-2">
              Rp {totalSaldoSemuaBank.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-blue-100 mt-1">
              Akumulasi dari {filteredData.filter(d => d.is_active !== 0).length} bukti aktif di {bankSummary.length} bank mitra
            </p>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Jumlah Bank Terdaftar</span>
              <div className="text-2xl font-bold text-gray-900 mt-1">{bankSummary.length} Bank</div>
              <p className="text-xs text-gray-400 mt-0.5">Mitra perbankan aktif</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Bukti Rekening</span>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {filteredData.filter(d => d.is_active !== 0).length} Aktif / {filteredData.length} Total
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Klik tombol Bukti pada Bank untuk kelola status</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Kartu Ringkasan Per Bank */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Ringkasan Rekening & Total Saldo Per Bank
            </h2>
            {filterBank && (
              <button 
                onClick={() => setFilterBank('')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Reset Filter Bank (Tampilkan Semua)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankSummary.map((b) => (
              <div 
                key={b.nama_bank} 
                className={`bg-white border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  filterBank.toLowerCase() === b.nama_bank.toLowerCase() ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10' : 'border-gray-200/90'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 rounded">
                            #{b.kode_bank}
                          </span>
                          <h3 className="font-bold text-gray-900 text-sm truncate">{b.nama_bank}</h3>
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {b.active_count} Aktif dari {b.rekening_list.length} Bukti
                        </span>
                      </div>
                    </div>

                    {/* Tombol di ujung Nama Bank untuk membuka Bar Daftar Bukti Rekening Koran */}
                    <button
                      type="button"
                      onClick={() => setSelectedBankDrawer(b.nama_bank)}
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      title={`Buka daftar seluruh bukti rekening koran ${b.nama_bank}`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Bukti ({b.items.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Daftar Rekening */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {b.rekening_list.map((rek, idx) => (
                      <div key={rek.id || idx} className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${rek.is_active ? 'bg-gray-50/80 border-gray-100' : 'bg-gray-50/40 border-gray-100 opacity-60'}`}>
                        <div className="min-w-0 pr-2">
                          <div className="font-mono font-bold text-gray-800 text-xs truncate">
                            {rek.no_rek}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate" title={rek.nama_rek}>
                            {rek.nama_rek}
                          </div>
                        </div>
                        <div className={`text-right font-extrabold whitespace-nowrap ${rek.is_active ? 'text-gray-900' : 'line-through text-gray-400'}`}>
                          Rp {rek.saldo.toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-semibold">Total Saldo Aktif Bank:</span>
                  <span className="font-black text-blue-700 text-sm">Rp {b.total_saldo.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Rentang Waktu */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setModeFilter('bulan')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                modeFilter === 'bulan' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Per Bulan (1 Bulan)</span>
            </button>
            <button
              type="button"
              onClick={() => setModeFilter('triwulan')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                modeFilter === 'triwulan' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Per 3 Bulan (Triwulan)</span>
            </button>
            <button
              type="button"
              onClick={() => setModeFilter('tahun')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                modeFilter === 'tahun' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>1 Tahun Penuh</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span>Filter Aktif:</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              {modeFilter === 'bulan' && (filterBulan === 'all' ? `Semua Bulan ${filterTahun}` : `${BULAN_OPTIONS.find(b => b.val === filterBulan)?.label} ${filterTahun}`)}
              {modeFilter === 'triwulan' && `${TRIWULAN_OPTIONS.find(t => t.val === filterTriwulan)?.label} ${filterTahun}`}
              {modeFilter === 'tahun' && `Tahun ${filterTahun}`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
          {modeFilter === 'bulan' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Bulan:</span>
              <select
                value={filterBulan}
                onChange={e => setFilterBulan(e.target.value)}
                className="text-xs font-semibold border border-gray-300 rounded-xl px-3 py-1.5 bg-white shadow-xs"
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
                className="text-xs font-semibold border border-gray-300 rounded-xl px-3 py-1.5 bg-white shadow-xs"
              >
                {TRIWULAN_OPTIONS.map(tw => (
                  <option key={tw.val} value={tw.val}>{tw.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Tahun:</span>
            <select
              value={filterTahun}
              onChange={e => setFilterTahun(e.target.value)}
              className="text-xs font-semibold border border-gray-300 rounded-xl px-3 py-1.5 bg-white shadow-xs"
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
              className="text-xs font-medium border border-gray-300 rounded-xl px-3 py-2 bg-white shadow-xs"
            >
              <option value="">Semua Bank ({uniqueBanks.length})</option>
              {uniqueBanks.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            
            {['eselon_1', 'pimpinan_satker', 'admin_it'].includes(userRole) && (
              <select value={filterSatker} onChange={e => setFilterSatker(e.target.value)} className="text-xs font-medium border border-gray-300 rounded-xl px-3 py-2 bg-white shadow-xs">
                <option value="">Semua Satker</option>
                {satkerList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
            )}
          </div>
          
          <button onClick={exportToExcel} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shadow-xs">
            <Download className="w-4 h-4" /> Export Excel ({filteredData.length})
          </button>
        </div>

        <div className="bg-white border border-gray-200/90 rounded-2xl overflow-x-auto shadow-xs">
          <table className="w-full text-xs text-left min-w-[1150px]">
            <thead className="bg-gray-50/90 border-b border-gray-200 text-gray-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-[130px]">Bulan / Periode</th>
                <th className="px-4 py-3.5 w-[280px]">Mitra Bank (Kode & Daftar Bukti)</th>
                <th className="px-4 py-3.5 w-[160px]">No. Rekening</th>
                <th className="px-4 py-3.5">Nama Rekening</th>
                <th className="px-4 py-3.5 text-right w-[180px] text-blue-700 font-extrabold">Total Saldo Bank</th>
                <th className="px-4 py-3.5 text-center w-[110px]">Status</th>
                <th className="px-4 py-3.5 w-[150px]">Keterangan</th>
                {!isEselon1 && <th className="px-4 py-3.5 text-right w-[70px]">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={!isEselon1 ? 8 : 7} className="text-center py-8 text-gray-500">Memuat data...</td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={!isEselon1 ? 8 : 7} className="text-center py-8 text-gray-400">Belum ada data.</td></tr>
              ) : (
                paginatedData.map(d => {
                  const isEditing = editingRowId === d.id;
                  const isActive = d.is_active !== 0;
                  const bankKey = (d.nama_bank || 'Bank Lainnya').trim().toUpperCase();
                  const bankGroup = bankSummary.find(b => b.nama_bank.trim().toUpperCase() === bankKey);
                  const kodeBank = getKodeBank(d.nama_bank, d.kode_bank);

                  return (
                    <tr key={d.id} className={`transition-colors group ${isActive ? 'hover:bg-blue-50/30' : 'bg-gray-50/60 opacity-70'}`}>
                      {isEditing ? (
                        <>
                          <td className="px-1.5 py-2">
                            <select
                              value={editRowData.periode || '1'}
                              onChange={e => setEditRowData({...editRowData, periode: e.target.value})}
                              className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded-lg bg-white"
                            >
                              {BULAN_OPTIONS.map(b => (
                                <option key={b.val} value={b.val}>{b.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-1.5 py-2"><input type="text" value={editRowData.nama_bank} onChange={e => setEditRowData({...editRowData, nama_bank: e.target.value})} className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded-lg font-semibold"/></td>
                          <td className="px-1.5 py-2"><input type="text" value={editRowData.nomor_rekening_bank} onChange={e => setEditRowData({...editRowData, nomor_rekening_bank: e.target.value})} className="w-full text-xs font-mono border border-blue-300 px-2 py-1.5 rounded-lg"/></td>
                          <td className="px-1.5 py-2"><input type="text" value={editRowData.nama_rekening} onChange={e => setEditRowData({...editRowData, nama_rekening: e.target.value})} className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded-lg"/></td>
                          <td className="px-1.5 py-2"><input type="text" placeholder="Rp 0" value={editRowData.saldo_akhir_bulan ? Number(editRowData.saldo_akhir_bulan).toLocaleString('id-ID') : ''} onChange={e => { const raw = e.target.value.replace(/\D/g, ''); setEditRowData({...editRowData, saldo_akhir_bulan: raw ? parseInt(raw, 10) : 0}); }} className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded-lg text-right font-bold"/></td>
                          <td className="px-1.5 py-2 text-center">-</td>
                          <td className="px-1.5 py-2"><input type="text" value={editRowData.keterangan} onChange={e => setEditRowData({...editRowData, keterangan: e.target.value})} className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded-lg"/></td>
                          <td className="px-2 py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => saveInlineEdit(d.id)} disabled={isSavingRow === d.id} className="p-1.5 text-white bg-green-600 hover:bg-green-700 rounded-lg">
                                {isSavingRow === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Save className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => setEditingRowId(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td onDoubleClick={() => !isEselon1 && startEdit(d)} className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap cursor-pointer">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{formatPeriodeDisplay(d.periode, d.tahun)}</span>
                            </div>
                          </td>

                          {/* 1. Nama per Bank + Kode Bank + Tombol di ujung Nama Bank */}
                          <td className="px-4 py-3 text-gray-900 font-semibold">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 rounded shrink-0">
                                  #{kodeBank}
                                </span>
                                <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <span className="truncate">{d.nama_bank || '-'}</span>
                              </div>
                              {d.nama_bank && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedBankDrawer(d.nama_bank)}
                                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                                  title={`Buka daftar seluruh bukti rekening koran ${d.nama_bank}`}
                                >
                                  <Layers className="w-3 h-3" />
                                  <span>Bukti ({bankGroup ? bankGroup.items.length : 1})</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* 2. No Rek per Bank */}
                          <td onDoubleClick={() => !isEselon1 && startEdit(d)} className="px-4 py-3 text-gray-800 font-mono font-medium text-xs cursor-pointer">
                            {d.nomor_rekening_bank || '-'}
                          </td>
                          <td onDoubleClick={() => !isEselon1 && startEdit(d)} className="px-4 py-3 text-gray-600 max-w-[180px] truncate cursor-pointer" title={d.nama_rekening || ''}>
                            {d.nama_rekening || '-'}
                          </td>
                          {/* Total Saldo Bank */}
                          <td onDoubleClick={() => !isEselon1 && startEdit(d)} className={`px-4 py-3 text-right font-black bg-blue-50/40 whitespace-nowrap cursor-pointer ${isActive ? 'text-blue-700' : 'line-through text-gray-400'}`}>
                            Rp {Number(d.saldo_akhir_bulan || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              disabled={togglingId === d.id}
                              onClick={() => handleToggleStatus(d)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-colors ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                              {isActive ? 'Aktif' : 'Nonaktif'}
                            </button>
                          </td>
                          <td onDoubleClick={() => !isEselon1 && startEdit(d)} className="px-4 py-3 text-gray-600 text-xs truncate max-w-[150px] cursor-pointer" title={d.keterangan || ''}>
                            {d.keterangan || '-'}
                          </td>
                          {!isEselon1 && (
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
              )}
                
              {!isEselon1 && (
                <tr className="bg-emerald-50/30 border-t-2 border-emerald-100">
                  <td className="px-1.5 py-2">
                    <select
                      value={newRow.periode || '1'}
                      onChange={e => setNewRow({...newRow, periode: e.target.value})}
                      className="w-full text-xs font-semibold border border-emerald-200 px-2 py-1.5 rounded-lg bg-white text-emerald-800"
                    >
                      {BULAN_OPTIONS.map(b => (
                        <option key={b.val} value={b.val}>{b.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-1.5 py-2"><input type="text" placeholder="1. Nama Bank..." value={newRow.nama_bank} onChange={e => setNewRow({...newRow, nama_bank: e.target.value})} className="w-full text-xs font-semibold border border-emerald-200 px-2 py-1.5 rounded-lg"/></td>
                  <td className="px-1.5 py-2"><input type="text" placeholder="2. No Rekening..." value={newRow.nomor_rekening_bank} onChange={e => setNewRow({...newRow, nomor_rekening_bank: e.target.value})} className="w-full text-xs font-mono border border-emerald-200 px-2 py-1.5 rounded-lg"/></td>
                  <td className="px-1.5 py-2"><input type="text" placeholder="Nama Rekening..." value={newRow.nama_rekening} onChange={e => setNewRow({...newRow, nama_rekening: e.target.value})} className="w-full text-xs border border-emerald-200 px-2 py-1.5 rounded-lg"/></td>
                  <td className="px-1.5 py-2"><input type="text" placeholder="Saldo Bank (Rp)..." value={newRow.saldo_akhir_bulan ? Number(newRow.saldo_akhir_bulan).toLocaleString('id-ID') : ''} onChange={e => { const raw = e.target.value.replace(/\D/g, ''); setNewRow({...newRow, saldo_akhir_bulan: raw ? parseInt(raw, 10) : 0}); }} className="w-full text-xs font-bold border border-emerald-200 px-2 py-1.5 rounded-lg text-right"/></td>
                  <td className="px-1.5 py-2 text-center text-[11px] text-emerald-700 font-bold">Aktif</td>
                  <td className="px-1.5 py-2"><input type="text" placeholder="Keterangan..." value={newRow.keterangan} onChange={e => setNewRow({...newRow, keterangan: e.target.value})} className="w-full text-xs border border-emerald-200 px-2 py-1.5 rounded-lg"/></td>
                  <td className="px-2 py-2 text-right">
                    <button onClick={saveNewRow} disabled={isSavingRow === 'new'} className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium ml-auto disabled:opacity-50">
                      {isSavingRow === 'new' ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Plus className="w-3.5 h-3.5" />} <span>Tambah</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold text-gray-800">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right uppercase tracking-wider text-xs text-gray-600">
                  Total Keseluruhan Saldo Aktif ({groupedData.filter(d => d.is_active !== 0).length} Rekening Aktif):
                </td>
                <td className="px-4 py-3 text-right font-black text-blue-700 text-sm whitespace-nowrap bg-blue-50/50">
                  Rp {totalSaldoSemuaBank.toLocaleString('id-ID')}
                </td>
                <td colSpan={!isEselon1 ? 3 : 2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/admin-it/rekening-koran" />
      </div>

      {/* SLIDE-OVER BAR / DRAWER: DAFTAR SELURUH BUKTI REKENING KORAN ATAS NAMA BANK TERSEBUT */}
      {selectedBankDrawer && selectedBankDrawerData && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setSelectedBankDrawer(null)} />
          <div className="relative z-10 w-full max-w-xl bg-white h-full shadow-2xl border-l border-gray-200 flex flex-col overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-500/30 border border-blue-300/30 text-xs font-mono font-bold text-blue-100">
                    KODE BANK: #{selectedBankDrawerData.kode_bank}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-300/30 text-xs font-semibold text-emerald-200">
                    {selectedBankDrawerData.active_count} Aktif / {selectedBankDrawerData.items.length} Total Bukti
                  </span>
                </div>
                <h3 className="text-xl font-extrabold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-300" />
                  <span>{selectedBankDrawerData.nama_bank}</span>
                </h3>
                <p className="text-xs text-blue-200 font-mono">
                  Daftar Seluruh Bukti Rekening Koran & Pengaturan Status Saldo
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBankDrawer(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 bg-blue-50/80 border-b border-blue-100">
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                Total Saldo Aktif ({selectedBankDrawerData.nama_bank})
              </p>
              <p className="text-2xl font-black text-blue-700 mt-0.5">
                Rp {selectedBankDrawerData.total_saldo.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-blue-600 mt-0.5">
                Geser tombol status di bawah untuk mengaktifkan atau menonaktifkan bukti dari perhitungan total saldo bank ini.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50/50">
              {selectedBankDrawerData.items.map((item, idx) => {
                const isActive = item.is_active !== 0;
                const saldoVal = Number(item.saldo_akhir_bulan || 0);
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 bg-white shadow-xs transition-all ${
                      isActive ? 'border-gray-200' : 'border-gray-200/70 bg-gray-50 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">
                            <Calendar className="w-3 h-3" />
                            {formatPeriodeDisplay(item.periode, item.tahun)}
                          </span>
                          {item.tanggal_transaksi && (
                            <span className="text-[11px] text-gray-500 font-mono">
                              Tgl: {String(item.tanggal_transaksi).split('T')[0]}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-gray-700 pt-0.5">
                          No. Rek: <strong>{item.nomor_rekening_bank || '-'}</strong> â€¢ Kode Bank: <strong>#{getKodeBank(item.nama_bank, item.kode_bank)}</strong>
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.keterangan || item.nama_rekening || 'Laporan Rekening Koran'}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={togglingId === item.id}
                          onClick={() => handleToggleStatus(item)}
                          className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                            isActive ? 'bg-emerald-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition ${
                              isActive ? 'translate-x-7' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-[11px] font-bold ${isActive ? 'text-emerald-700' : 'text-gray-500'}`}>
                          {isActive ? 'Status: Aktif' : 'Status: Nonaktif'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] text-gray-400 block">Saldo Akhir Bukti:</span>
                        <span className={`text-base font-extrabold ${isActive ? 'text-gray-900' : 'line-through text-gray-400'}`}>
                          Rp {saldoVal.toLocaleString('id-ID')}
                        </span>
                      </div>
                      {item.bukti_file && (
                        <button
                          type="button"
                          onClick={() => openFileBukti(item.bukti_file!)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Lihat Berkas Bukti</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Total Saldo Aktif: <strong className="text-gray-900">Rp {selectedBankDrawerData.total_saldo.toLocaleString('id-ID')}</strong>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBankDrawer(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl"
              >
                Tutup Bar Bukti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


