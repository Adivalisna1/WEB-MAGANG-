'use client';
import toast from 'react-hot-toast';

import { useEffect, useState, useRef } from 'react';
import { getSession } from '@/lib/auth';
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
  
  // Filter state
  const [searchQ, setSearchQ] = useState('');
  const [filterSatker, setFilterSatker] = useState('');
  const [satkerList, setSatkerList] = useState<Satker[]>([]);
  
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

  const exportToExcel = async () => {
    try {
      const session = getSession();
      const params = new URLSearchParams();
      if (filterSatker) params.set('satker', filterSatker);
      const res = await fetch(`${API}/export/rekening-koran?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      if (!res.ok) throw new Error('Gagal export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rekening_Koran_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Gagal export Excel. Coba lagi.');
    }
  };


  const filteredData = dataList.filter(d => {
    const matchSearch = !searchQ || d.nama_bank?.toLowerCase().includes(searchQ.toLowerCase()) || d.nomor_rekening_bank?.includes(searchQ) || d.nama_rekening?.toLowerCase().includes(searchQ.toLowerCase());
    const matchSatker = !filterSatker || d.satker_id === Number(filterSatker);
    return matchSearch && matchSatker;
  });

  const isEselon1 = userRole === 'eselon_1';



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
            Rekening Koran
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Laporan dan Riwayat Rekening Koran Satker.
          </p>
        </div>
      </div>

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
            
            <button onClick={exportToExcel} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
              <Download className="w-4 h-4" /> Export Excel
            </button>
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
                  {!isEselon1 && <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs text-right w-[100px]">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? <tr><td colSpan={8} className="text-center py-8 text-gray-500">Memuat data...</td></tr> :
                  filteredData.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">Belum ada data.</td></tr> :
                  filteredData.map(d => {
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
                            <td onDoubleClick={() => !isEselon1 && startEdit(d)} className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer">{d.nama_bank || '-'}</td>
                            <td onDoubleClick={() => !isEselon1 && startEdit(d)} className="px-4 py-3 text-gray-600 font-mono text-xs cursor-pointer">{d.nomor_rekening_bank || '-'}</td>
                            <td onDoubleClick={() => !isEselon1 && startEdit(d)} className="px-4 py-3 text-gray-600 max-w-[180px] truncate cursor-pointer" title={d.nama_rekening || ''}>{d.nama_rekening || '-'}</td>
                            <td onDoubleClick={() => !isEselon1 && startEdit(d)} className="px-4 py-3 text-gray-600 whitespace-nowrap cursor-pointer">{d.tanggal_pembukaan_rekening ? new Date(d.tanggal_pembukaan_rekening).toLocaleDateString('id-ID') : '-'}</td>
                            <td onDoubleClick={() => !isEselon1 && startEdit(d)} className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap cursor-pointer">Rp {Number(d.saldo_akhir_bulan || 0).toLocaleString('id-ID')}</td>
                            <td onDoubleClick={() => !isEselon1 && startEdit(d)} className="px-4 py-3 text-gray-600 text-xs cursor-pointer">{d.keterangan || '-'}</td>
                          </>
                        )}
                      </tr>
                    );
                  })
                }
                  
                  {!isEselon1 && (
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
        </div>
    </div>
  );
}
