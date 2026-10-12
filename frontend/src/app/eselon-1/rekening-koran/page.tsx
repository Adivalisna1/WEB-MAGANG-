'use client';
import toast from 'react-hot-toast';

import { useEffect, useState, useRef } from 'react';
import { getSession } from '@/lib/auth';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';
import { FileSpreadsheet, Upload, Download, ArrowLeft, Search, Loader2, Table2, Save, Trash2, Edit, Plus, X } from 'lucide-react';
import * as XLSX from 'xlsx';


const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  
  // Excel state
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Filter state
  const [activeTab, setActiveTab] = useState<'excel' | 'history'>('history');
  const [searchQ, setSearchQ] = useState('');
  const [filterSatker, setFilterSatker] = useState('');
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

  // Selected Satker for Excel Upload
  const [selectedUploadSatker, setSelectedUploadSatker] = useState<string>('');

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

  const handleExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(ws, { defval: '' });
      
      if (jsonData.length > 0) {
        setExcelHeaders(Object.keys(jsonData[0] as object));
        setExcelData(jsonData);
        setExcelFileName(file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleExcelFile(file);
  };

  const downloadTemplate = () => {
    const templateData = [{ 
      'Kode Satker': '191',
      'Nama Satker': 'BPS Provinsi Jawa Tengah',
      'Nama Bank': 'BRI',
      'Nomor Rekening Bank': '0123456789',
      'Nama Rekening': 'BPS JATENG',
      'Nomor Pembukaan Rekening': 'SK-123/2026',
      'Tanggal Pembukaan Rekening': '2026-01-01',
      'SALDO PER AKHIR BULAN': 1000000,
      'SALDO PER AKHIR BULAN (RK)': 500000,
      'LAPORAN SALDO PER AKHIR BULAN (SALDO REKENING)': 1500000,
      'SALDO PER AKHIR BULAN (RPL/LPJ)': 0,
      'KETERANGAN': 'Aman'
    }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Rekening Koran');
    XLSX.writeFile(wb, 'Template_Rekening_Koran.xlsx');
  };

  const saveToDatabase = async () => {
    if (excelData.length === 0) return;
    setIsSaving(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/rekening-koran/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.token}` },
        body: JSON.stringify({ data: excelData, satker_id: selectedUploadSatker ? parseInt(selectedUploadSatker) : null })
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Data berhasil disimpan ke database!');
        setExcelData([]); setExcelFileName(''); setActiveTab('history'); fetchData();
      } else {
        toast.error('Gagal menyimpan: ' + result.message);
      }
    } catch (err) { toast.error('Terjadi kesalahan server saat menyimpan.'); } 
    finally { setIsSaving(false); }
  };

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

  const exportToExcel = async () => {
    try {
      const session = getSession();
      const params = new URLSearchParams();
      if (filterSatker) params.set('satker', filterSatker);
      const res = await fetch(`${API}/export/rekening-koran?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || errData?.message || 'Gagal export Excel');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rekening_Koran_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.message || 'Gagal export Excel. Coba lagi.');
    }
  };

  const exportAllSatker = async () => {
    try {
      const toastId = toast.loading('Generating Excel semua satker...');
      const session = getSession();
      const res = await fetch(`${API}/export/rekening-koran/all-satker`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      if (!res.ok) throw new Error('Gagal export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rekening_Koran_AllSatker_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export berhasil!', { id: toastId });
    } catch (err) {
      toast.error('Gagal export Excel semua satker.');
    }
  };

  const filteredData = dataList.filter(d => {
    const matchSearch = !searchQ || d.nama_bank?.toLowerCase().includes(searchQ.toLowerCase()) || d.nomor_rekening_bank?.includes(searchQ) || d.nama_rekening?.toLowerCase().includes(searchQ.toLowerCase());
    const matchSatker = !filterSatker || d.satker_id === Number(filterSatker);
    return matchSearch && matchSatker;
  });

  const isEselon1 = true;
  const isPimpinan = userRole === 'manajemen' || userRole === 'pimpinan';

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (isPimpinan && activeTab === 'excel') setActiveTab('history');
  }, [isPimpinan, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
            Rekening Koran
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isPimpinan ? 'Laporan Riwayat Rekening Koran Satker Binaan' : 'Kelola dan impor Rekening Koran Satker Binaan via Excel.'}
          </p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-max">
        {!isPimpinan && (
          <button onClick={() => setActiveTab('excel')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'excel' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            <Upload className="w-4 h-4" /> Import Excel
          </button>
        )}
        <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          <Table2 className="w-4 h-4" /> Data Rekening Koran
        </button>
      </div>

      {activeTab === 'excel' && !isPimpinan && (
        <div className="space-y-4">
          {excelData.length === 0 ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              <FileSpreadsheet className={`w-14 h-14 mx-auto mb-3 ${dragging ? 'text-emerald-500' : 'text-gray-300'}`} />
              <p className="text-lg font-semibold text-gray-700">Drag & drop file Excel di sini</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">Gunakan format kolom yang sesuai dengan template (Bank, No Rekening, Saldo, dll).</p>
              <button onClick={(e) => { e.stopPropagation(); downloadTemplate(); }} className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors mx-auto">
                <Download className="w-4 h-4" /> Download Template Excel
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{excelFileName}</p>
                    <p className="text-xs text-gray-500">{excelData.length} baris siap disimpan</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {['admin_it', 'pimpinan_satker'].includes(userRole) && satkerList.length > 0 && (
                    <select value={selectedUploadSatker} onChange={e => setSelectedUploadSatker(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white">
                      <option value="">-- Otomatis dari Excel (atau pilih) --</option>
                      {satkerList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                    </select>
                  )}
                  <button onClick={() => setExcelData([])} className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg">Batal</button>
                  <button onClick={saveToDatabase} disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan ke Database
                  </button>
                </div>
              </div>
              <div className="overflow-auto max-h-[400px] border rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>{excelHeaders.map(h => <th key={h} className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {excelData.slice(0, 50).map((row, i) => (
                      <tr key={i}>{excelHeaders.map(h => <td key={h} className="px-4 py-2 whitespace-nowrap text-gray-700">{String(row[h] || '')}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => e.target.files?.[0] && handleExcelFile(e.target.files[0])} />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 text-gray-400" />
                <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Cari Bank / No Rek..." className="flex-1 text-sm outline-none" />
              </div>
              
              {['eselon_1', 'pimpinan_satker', 'admin_it'].includes(userRole) && (
                <select value={filterSatker} onChange={e => setFilterSatker(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white min-w-[150px]">
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
                    // Because it's a direct file download, we can use window.open or an anchor click.
                    const session = getSession();
                    // Need to pass token if the API needs authentication, but typically file downloads via GET 
                    // either use query params for token, or rely on cookies. Wait, our API uses Bearer token.
                    // If we can't send Bearer via window.location.href, we have to fetch as blob.
                    downloadZip();
                  }} 
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Download className="w-4 h-4" /> Export ZIP Bukti
                </button>
              )}
              <button onClick={exportToExcel} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                <Download className="w-4 h-4" /> Export Excel
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-sm text-left min-w-[1400px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs w-[100px]">Satker</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs w-[150px]">Bank</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs w-[150px]">No Rekening</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs w-[180px]">Nama Rekening</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs w-[100px]">Tgl Buka</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs text-right">Saldo Akhir</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">Keterangan</th>
                  {!isPimpinan && <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs text-right w-[100px]">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? <tr><td colSpan={7} className="text-center py-8 text-gray-500">Memuat data...</td></tr> :
                  paginatedData.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">Belum ada data.</td></tr> :
                  paginatedData.map(d => {
                    const isEditing = editingRowId === d.id;
                    return (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors group">
                        {isEditing ? (
                          <>
                            <td className="px-2 py-2 truncate max-w-[100px]">{d.kode_satker || '-'}</td>
                            <td className="px-1 py-1"><input type="text" value={editRowData.nama_bank} onChange={e => setEditRowData({...editRowData, nama_bank: e.target.value})} className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded focus:ring-1 focus:ring-blue-500 outline-none"/></td>
                            <td className="px-1 py-1"><input type="text" value={editRowData.nomor_rekening_bank} onChange={e => setEditRowData({...editRowData, nomor_rekening_bank: e.target.value})} className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded focus:ring-1 focus:ring-blue-500 outline-none"/></td>
                            <td className="px-1 py-1"><input type="text" value={editRowData.nama_rekening} onChange={e => setEditRowData({...editRowData, nama_rekening: e.target.value})} className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded focus:ring-1 focus:ring-blue-500 outline-none"/></td>
                            <td className="px-1 py-1"><input type="date" value={editRowData.tanggal_pembukaan_rekening} onChange={e => setEditRowData({...editRowData, tanggal_pembukaan_rekening: e.target.value})} className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded focus:ring-1 focus:ring-blue-500 outline-none"/></td>
                            <td className="px-1 py-1"><input type="number" step="any" value={editRowData.saldo_akhir_bulan} onChange={e => setEditRowData({...editRowData, saldo_akhir_bulan: parseFloat(e.target.value) || 0})} className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded text-right focus:ring-1 focus:ring-blue-500 outline-none"/></td>
                            <td className="px-1 py-1"><input type="text" value={editRowData.keterangan} onChange={e => setEditRowData({...editRowData, keterangan: e.target.value})} className="w-full text-xs border border-blue-300 px-2 py-1.5 rounded focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Keterangan..."/></td>
                            <td className="px-2 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => saveInlineEdit(d.id)} disabled={isSavingRow === d.id} className="p-1 text-white bg-green-500 hover:bg-green-600 rounded">
                                  {isSavingRow === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Save className="w-3.5 h-3.5" />}
                                </button>
                                <button onClick={() => setEditingRowId(null)} className="p-1 text-gray-500 hover:bg-gray-200 rounded"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-gray-600 truncate max-w-[100px]" title={d.nama_satker || ''}>{d.kode_satker || '-'}</td>
                            <td onDoubleClick={() => !isPimpinan && startEdit(d)} className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer">{d.nama_bank || '-'}</td>
                            <td onDoubleClick={() => !isPimpinan && startEdit(d)} className="px-4 py-3 text-gray-600 font-mono text-xs cursor-pointer">{d.nomor_rekening_bank || '-'}</td>
                            <td onDoubleClick={() => !isPimpinan && startEdit(d)} className="px-4 py-3 text-gray-600 max-w-[180px] truncate cursor-pointer" title={d.nama_rekening || ''}>{d.nama_rekening || '-'}</td>
                            <td onDoubleClick={() => !isPimpinan && startEdit(d)} className="px-4 py-3 text-gray-600 whitespace-nowrap cursor-pointer">{d.tanggal_pembukaan_rekening ? new Date(d.tanggal_pembukaan_rekening).toLocaleDateString('id-ID') : '-'}</td>
                            <td onDoubleClick={() => !isPimpinan && startEdit(d)} className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap cursor-pointer">Rp {Number(d.saldo_akhir_bulan || 0).toLocaleString('id-ID')}</td>
                            <td onDoubleClick={() => !isPimpinan && startEdit(d)} className="px-4 py-3 text-gray-600 text-xs cursor-pointer">{d.keterangan || '-'}</td>
                          </>
                        )}
                      </tr>
                    );
                  })
                }
                  
                  {!isPimpinan && (
                    <tr className="bg-emerald-50/30 border-t border-emerald-100">
                      <td className="px-2 py-2 text-[10px] text-emerald-600 font-bold uppercase tracking-wider text-center bg-emerald-100/50">Data Baru</td>
                      <td className="px-1 py-1"><input type="text" placeholder="Bank..." value={newRow.nama_bank} onChange={e => setNewRow({...newRow, nama_bank: e.target.value})} className="w-full text-xs border border-emerald-200 px-2 py-1.5 rounded focus:ring-1 focus:ring-emerald-500 outline-none"/></td>
                      <td className="px-1 py-1"><input type="text" placeholder="No Rek..." value={newRow.nomor_rekening_bank} onChange={e => setNewRow({...newRow, nomor_rekening_bank: e.target.value})} className="w-full text-xs border border-emerald-200 px-2 py-1.5 rounded focus:ring-1 focus:ring-emerald-500 outline-none"/></td>
                      <td className="px-1 py-1"><input type="text" placeholder="Nama Rek..." value={newRow.nama_rekening} onChange={e => setNewRow({...newRow, nama_rekening: e.target.value})} className="w-full text-xs border border-emerald-200 px-2 py-1.5 rounded focus:ring-1 focus:ring-emerald-500 outline-none"/></td>
                      <td className="px-1 py-1"><input type="date" value={newRow.tanggal_pembukaan_rekening} onChange={e => setNewRow({...newRow, tanggal_pembukaan_rekening: e.target.value})} className="w-full text-xs border border-emerald-200 px-2 py-1.5 rounded focus:ring-1 focus:ring-emerald-500 outline-none"/></td>
                      <td className="px-1 py-1"><input type="number" step="any" placeholder="0" value={newRow.saldo_akhir_bulan} onChange={e => setNewRow({...newRow, saldo_akhir_bulan: parseFloat(e.target.value) || 0})} className="w-full text-xs border border-emerald-200 px-2 py-1.5 rounded text-right focus:ring-1 focus:ring-emerald-500 outline-none"/></td>
                      <td className="px-1 py-1"><input type="text" placeholder="Keterangan..." value={newRow.keterangan} onChange={e => setNewRow({...newRow, keterangan: e.target.value})} className="w-full text-xs border border-emerald-200 px-2 py-1.5 rounded focus:ring-1 focus:ring-emerald-500 outline-none"/></td>
                      <td className="px-2 py-2 text-right">
                        <button onClick={saveNewRow} disabled={isSavingRow === 'new'} className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1.5 rounded text-xs ml-auto disabled:opacity-50 transition-colors">
                          {isSavingRow === 'new' ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Plus className="w-3.5 h-3.5" />} <span>Tambah</span>
                        </button>
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/eselon-1/rekening-koran" />
        </div>
      )}
    </div>
  );
}
