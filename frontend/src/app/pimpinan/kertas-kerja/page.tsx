'use client';
import toast from 'react-hot-toast';


import { useEffect, useState, useRef } from 'react';
import { getSession } from '@/lib/auth';
import { FileSpreadsheet, Upload, Download, ArrowLeft, Search, Loader2, Table2, Save, Trash2, Edit, Plus, X } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface KertasKerja {
  id: number;
  satker_id: number | null;
  tanggal: string;
  uraian: string;
  kategori: string;
  no_rek: string | null;
  judul_laporan: string | null;
  akun: string | null;
  nominal: number;
  created_at: string;
}

interface Satker {
  id: number;
  nama: string;
}

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
  const [filterTahun, setFilterTahun] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [filterSatker, setFilterSatker] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterAkun, setFilterAkun] = useState('');
  const [satkerList, setSatkerList] = useState<Satker[]>([]);
  
  const [userRole, setUserRole] = useState('');

  // Edit State
  const [editingData, setEditingData] = useState<KertasKerja | null>(null);
  // Inline Edit State
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState({ tanggal: '', uraian: '', kategori: '', no_rek: '', judul_laporan: '', akun: '', nominal: 0 });
  const [isSavingRow, setIsSavingRow] = useState<number | 'new' | null>(null);

  // New Row State
  const [newRow, setNewRow] = useState({ tanggal: '', uraian: '', kategori: '', no_rek: '', judul_laporan: '', akun: '', nominal: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const session = getSession();
      setUserRole(session?.user?.role || '');
      
      const res = await fetch(`${API}/kertas-kerja`, {
        headers: session ? { Authorization: `Bearer ${session.token}` } : {},
      });
      if (res.ok) {
        const d = await res.json();
        setDataList(d.data ?? []);
      }

      // Fetch satker list if role needs it
      if (['eselon_1', 'pimpinan', 'admin_it'].includes(session?.user?.role || '')) {
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

  // ── Import Excel ──
  const handleExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(ws, { defval: '' });
      
      if (jsonData.length > 0) {
        setExcelHeaders(Object.keys(jsonData[0]));
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
      Tanggal: '2026-09-15', 
      Uraian: 'Contoh Kegiatan', 
      Kategori: 'Operasional', 
      'No Rekening': '1234567890', 
      'Judul Laporan': 'Laporan Q3', 
      Akun: '521111', 
      Nominal: 1500000 
    }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Rekening Koran');
    XLSX.writeFile(wb, 'Template_Kertas_Kerja.xlsx');
  };

  const saveToDatabase = async () => {
    if (excelData.length === 0) return;
    setIsSaving(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/kertas-kerja/bulk`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}` 
        },
        body: JSON.stringify({ data: excelData })
      });
      
      const result = await res.json();
      if (result.success) {
        toast.success('Data berhasil disimpan ke database!');
        setExcelData([]);
        setExcelFileName('');
        setActiveTab('history');
        fetchData();
      } else {
        toast.error('Gagal menyimpan: ' + result.message);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan server saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus riwayat transaksi ini?')) return;
    try {
      const session = getSession();
      const res = await fetch(`${API}/kertas-kerja/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Data berhasil dihapus');
        fetchData();
      } else {
        toast.error('Gagal menghapus: ' + result.message);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan server saat menghapus.');
    }
  };

  const saveNewRow = async () => {
    if (!newRow.tanggal || !newRow.uraian || !newRow.kategori) {
      toast.success('Isi semua kolom (Tanggal, Uraian, Kategori) untuk baris baru!');
      return;
    }
    setIsSavingRow('new');
    try {
      const session = getSession();
      const res = await fetch(`${API}/kertas-kerja`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.token}` },
        body: JSON.stringify(newRow)
      });
      const result = await res.json();
      if (result.success) {
        setNewRow({ tanggal: '', uraian: '', kategori: '', no_rek: '', judul_laporan: '', akun: '', nominal: 0 });
        fetchData();
      } else {
        toast.error('Gagal menambahkan: ' + result.message);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan server saat menambahkan data.');
    } finally {
      setIsSavingRow(null);
    }
  };

  const startEdit = (d: KertasKerja) => {
    setEditingRowId(d.id);
    setEditRowData({
      tanggal: new Date(d.tanggal).toISOString().split('T')[0],
      uraian: d.uraian,
      kategori: d.kategori,
      no_rek: d.no_rek || '',
      judul_laporan: d.judul_laporan || '',
      akun: d.akun || '',
      nominal: d.nominal || 0
    });
  };

  const saveInlineEdit = async (id: number) => {
    if (!editRowData.tanggal || !editRowData.uraian || !editRowData.kategori) {
      toast.error('Kolom Tanggal, Uraian, dan Kategori tidak boleh kosong!');
      return;
    }
    setIsSavingRow(id);
    try {
      const session = getSession();
      const res = await fetch(`${API}/kertas-kerja/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.token}` },
        body: JSON.stringify(editRowData)
      });
      const result = await res.json();
      if (result.success) {
        setEditingRowId(null);
        fetchData();
      } else {
        toast.error('Gagal mengupdate: ' + result.message);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan server saat mengupdate.');
    } finally {
      setIsSavingRow(null);
    }
  };

  // Export
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Rekening Koran');
    XLSX.writeFile(wb, `Laporan_Kertas_Kerja_${filterTahun || 'Semua'}.xlsx`);
  };

  // ── Filter Data ──
  const filteredData = dataList.filter(d => {
    const matchSearch = !searchQ || d.uraian?.toLowerCase().includes(searchQ.toLowerCase());
    const year = d.tanggal ? new Date(d.tanggal).getFullYear().toString() : '';
    const month = d.tanggal ? (new Date(d.tanggal).getMonth() + 1).toString().padStart(2, '0') : '';
    const matchTahun = !filterTahun || year === filterTahun;
    const matchBulan = !filterBulan || month === filterBulan;
    const matchSatker = !filterSatker || d.satker_id === Number(filterSatker);
    const matchKategori = !filterKategori || d.kategori?.toLowerCase() === filterKategori.toLowerCase();
    const matchAkun = !filterAkun || d.akun?.toLowerCase() === filterAkun.toLowerCase();
    
    return matchSearch && matchTahun && matchBulan && matchSatker && matchKategori && matchAkun;
  });

  const uniqueTahun = Array.from(new Set(dataList.map(d => d.tanggal ? new Date(d.tanggal).getFullYear().toString() : ''))).filter(Boolean).sort((a, b) => b.localeCompare(a));
  const uniqueKategori = Array.from(new Set(dataList.map(d => d.kategori))).filter(Boolean).sort();
  const uniqueAkun = Array.from(new Set(dataList.map(d => d.akun))).filter(Boolean).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/pimpinan" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
            Rekening Koran
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dan impor history transaksi Rekening Koran via Excel.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-max">
        <button onClick={() => setActiveTab('excel')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'excel' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          <Upload className="w-4 h-4" /> Import Excel
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          <Table2 className="w-4 h-4" /> Riwayat Rekening Koran
        </button>
      </div>

      {/* TAB: Import Excel */}
      {activeTab === 'excel' && (
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
              <p className="text-sm text-gray-400 mt-1 mb-4">Gunakan template yang disediakan (Tanggal | Uraian | Kategori | No Rekening | Judul Laporan | Akun | Nominal)</p>
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
                <div className="flex gap-2">
                  <button onClick={() => setExcelData([])} className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg">Batal</button>
                  <button onClick={saveToDatabase} disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan ke Database
                  </button>
                </div>
              </div>
              
              <div className="overflow-auto max-h-[400px] border rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {excelHeaders.map(h => <th key={h} className="px-4 py-3 font-medium text-gray-500">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {excelData.slice(0, 100).map((row, i) => (
                      <tr key={i}>
                        {excelHeaders.map(h => <td key={h} className="px-4 py-2">{String(row[h] || '')}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => e.target.files?.[0] && handleExcelFile(e.target.files[0])} />
        </div>
      )}

      {/* TAB: Riwayat (Data Database) */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 text-gray-400" />
                <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Cari uraian..." className="flex-1 text-sm outline-none" />
              </div>
              {/* Dropdown Tahun & Bulan */}
              <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                <option value="">Semua Tahun</option>
                {uniqueTahun.map(t => <option key={t} value={t}>Tahun {t}</option>)}
              </select>
              <select value={filterBulan} onChange={e => setFilterBulan(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                <option value="">Semua Bulan</option>
                {Array.from({length: 12}, (_, i) => {
                  const m = (i + 1).toString().padStart(2, '0');
                  return <option key={m} value={m}>Bulan {m}</option>
                })}
              </select>

              {/* Dropdown Kategori */}
              <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                <option value="">Semua Kategori</option>
                {uniqueKategori.map(k => <option key={k} value={k}>{k}</option>)}
              </select>

              {/* Dropdown Akun */}
              <select value={filterAkun} onChange={e => setFilterAkun(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white max-w-[150px] truncate">
                <option value="">Semua Akun</option>
                {uniqueAkun.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            
            {/* Eselon 1 export only (but this is pimpinan page so removed) */}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">Tanggal</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">Uraian</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">Kategori</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">No Rekening</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">Judul Laporan</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">Akun</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs text-right">Nominal</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? <tr><td colSpan={8} className="text-center py-8 text-gray-500">Memuat data riwayat...</td></tr> :
                  filteredData.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">Belum ada data riwayat transaksi.</td></tr> :
                  filteredData.map(d => {
                    const isEditing = editingRowId === d.id;
                    return (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors group">
                        {isEditing ? (
                          <>
                            <td className="px-2 py-2"><input type="date" value={editRowData.tanggal} onChange={e => setEditRowData({...editRowData, tanggal: e.target.value})} className="w-full text-sm border border-blue-300 px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></td>
                            <td className="px-2 py-2"><input type="text" value={editRowData.uraian} onChange={e => setEditRowData({...editRowData, uraian: e.target.value})} className="w-full text-sm border border-blue-300 px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></td>
                            <td className="px-2 py-2"><input type="text" value={editRowData.kategori} onChange={e => setEditRowData({...editRowData, kategori: e.target.value})} className="w-full text-sm border border-blue-300 px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></td>
                            <td className="px-2 py-2"><input type="text" value={editRowData.no_rek} onChange={e => setEditRowData({...editRowData, no_rek: e.target.value})} className="w-full text-sm border border-blue-300 px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></td>
                            <td className="px-2 py-2"><input type="text" value={editRowData.judul_laporan} onChange={e => setEditRowData({...editRowData, judul_laporan: e.target.value})} className="w-full text-sm border border-blue-300 px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></td>
                            <td className="px-2 py-2"><input type="text" value={editRowData.akun} onChange={e => setEditRowData({...editRowData, akun: e.target.value})} className="w-full text-sm border border-blue-300 px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></td>
                            <td className="px-2 py-2"><input type="number" min="0" step="any" value={editRowData.nominal} onChange={e => setEditRowData({...editRowData, nominal: parseFloat(e.target.value) || 0})} className="w-full text-sm border border-blue-300 px-2 py-1.5 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500/20"/></td>
                            <td className="px-2 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => saveInlineEdit(d.id)} disabled={isSavingRow === d.id} className="p-1.5 text-white bg-green-500 hover:bg-green-600 rounded transition-colors disabled:opacity-50" title="Simpan">
                                  {isSavingRow === d.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                                </button>
                                <button onClick={() => setEditingRowId(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-colors" title="Batal"><X className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td onDoubleClick={() => startEdit(d)} className="px-4 py-3 text-gray-600 cursor-pointer">{new Date(d.tanggal).toLocaleDateString('id-ID')}</td>
                            <td onDoubleClick={() => startEdit(d)} className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate cursor-pointer" title={d.uraian}>{d.uraian}</td>
                            <td onDoubleClick={() => startEdit(d)} className="px-4 py-3 text-gray-600 cursor-pointer">
                              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">{d.kategori}</span>
                            </td>
                            <td onDoubleClick={() => startEdit(d)} className="px-4 py-3 text-gray-600 cursor-pointer">{d.no_rek || '-'}</td>
                            <td onDoubleClick={() => startEdit(d)} className="px-4 py-3 text-gray-600 cursor-pointer max-w-[150px] truncate" title={d.judul_laporan || ''}>{d.judul_laporan || '-'}</td>
                            <td onDoubleClick={() => startEdit(d)} className="px-4 py-3 text-gray-600 cursor-pointer">{d.akun || '-'}</td>
                            <td onDoubleClick={() => startEdit(d)} className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap cursor-pointer">
                              Rp {Number(d.nominal || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(d)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Data"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(d.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Hapus Data"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                }
                  
                  {/* NEW ROW */}
                  <tr className="bg-emerald-50/50 border-t-2 border-emerald-100">
                    <td className="px-2 py-2"><input type="date" value={newRow.tanggal} onChange={e => setNewRow({...newRow, tanggal: e.target.value})} className="w-full text-sm border border-emerald-200 px-2 py-1.5 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"/></td>
                    <td className="px-2 py-2"><input type="text" placeholder="Uraian kegiatan..." value={newRow.uraian} onChange={e => setNewRow({...newRow, uraian: e.target.value})} className="w-full text-sm border border-emerald-200 px-2 py-1.5 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"/></td>
                    <td className="px-2 py-2"><input type="text" placeholder="Kategori..." value={newRow.kategori} onChange={e => setNewRow({...newRow, kategori: e.target.value})} className="w-full text-sm border border-emerald-200 px-2 py-1.5 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"/></td>
                    <td className="px-2 py-2"><input type="text" placeholder="No Rekening..." value={newRow.no_rek} onChange={e => setNewRow({...newRow, no_rek: e.target.value})} className="w-full text-sm border border-emerald-200 px-2 py-1.5 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"/></td>
                    <td className="px-2 py-2"><input type="text" placeholder="Judul Laporan..." value={newRow.judul_laporan} onChange={e => setNewRow({...newRow, judul_laporan: e.target.value})} className="w-full text-sm border border-emerald-200 px-2 py-1.5 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"/></td>
                    <td className="px-2 py-2"><input type="text" placeholder="Akun..." value={newRow.akun} onChange={e => setNewRow({...newRow, akun: e.target.value})} className="w-full text-sm border border-emerald-200 px-2 py-1.5 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"/></td>
                    <td className="px-2 py-2"><input type="number" min="0" step="any" placeholder="0" value={newRow.nominal} onChange={e => setNewRow({...newRow, nominal: parseFloat(e.target.value) || 0})} className="w-full text-sm border border-emerald-200 px-2 py-1.5 rounded bg-white text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/20"/></td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={saveNewRow} disabled={isSavingRow === 'new'} className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors ml-auto disabled:opacity-50">
                        {isSavingRow === 'new' ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Plus className="w-3.5 h-3.5" />} Tambah
                      </button>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
