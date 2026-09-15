'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit, Download, Tags, FileText } from 'lucide-react';
import clsx from 'clsx';
import * as XLSX from 'xlsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminAkuntansiPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'transaksi' | 'kategori'>('transaksi');
  
  // Data State
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [kategori, setKategori] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State Kategori
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState('');

  // Form State Edit Transaksi (Kategori aja)
  const [editTxId, setEditTxId] = useState<number | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<number | ''>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTx, resCat] = await Promise.all([
        fetch(`${API}/akuntansi`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/akuntansi/kategori`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const jTx = await resTx.json();
      const jCat = await resCat.json();
      if (jTx.success) setTransaksi(jTx.data);
      if (jCat.success) setKategori(jCat.data);
    } catch (err) {
      alert('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // Handle Tambah Kategori
  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/akuntansi/kategori`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nama_kategori: catName })
      });
      const j = await res.json();
      if (j.success) {
        alert('Kategori berhasil ditambahkan');
        setShowCatForm(false);
        setCatName('');
        fetchData();
      } else {
        alert(j.message);
      }
    } catch (err) {
      alert('Gagal menambah kategori');
    }
  };

  // Handle Edit Transaksi (Kategori)
  const handleEditTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/akuntansi/${editTxId}/kategori`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id_kategori: Number(selectedCatId) })
      });
      const j = await res.json();
      if (j.success) {
        alert('Kategori transaksi berhasil diubah');
        setEditTxId(null);
        fetchData();
      } else {
        alert(j.message);
      }
    } catch (err) {
      alert('Gagal mengubah kategori transaksi');
    }
  };

  // Export Excel
  const exportToExcel = () => {
    const wsData = transaksi.map((t, index) => ({
      'No': index + 1,
      'Tanggal': new Date(t.tanggal).toLocaleDateString('id-ID'),
      'Uraian': t.uraian,
      'Jenis': t.jenis.toUpperCase(),
      'Kategori': t.nama_kategori,
      'Nominal': Number(t.nominal),
      'Catatan Audit': t.catatan_audit || '-',
      'Dibuat Oleh': t.pembuat || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Akuntansi');
    XLSX.writeFile(wb, `Data_Akuntansi_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="w-full px-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Akuntansi</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data transaksi dan master kategori akun.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'transaksi' && (
            <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Export Excel
            </button>
          )}
          {activeTab === 'kategori' && (
            <button onClick={() => setShowCatForm(!showCatForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Tambah Kategori
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-max mb-6">
        <button
          onClick={() => setActiveTab('transaksi')}
          className={clsx(
            "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
            activeTab === 'transaksi' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
          )}
        >
          <FileText className="w-4 h-4" /> Data Transaksi
        </button>
        <button
          onClick={() => setActiveTab('kategori')}
          className={clsx(
            "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
            activeTab === 'kategori' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
          )}
        >
          <Tags className="w-4 h-4" /> Master Kategori
        </button>
      </div>

      {/* Form Tambah Kategori */}
      {activeTab === 'kategori' && showCatForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Tambah Kategori Baru</h2>
          <form onSubmit={handleCatSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
              <input type="text" required value={catName} onChange={e => setCatName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Contoh: Gaji & Tunjangan" />
            </div>
            <button type="submit" className="px-4 py-2 h-[38px] text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Simpan</button>
            <button type="button" onClick={() => setShowCatForm(false)} className="px-4 py-2 h-[38px] text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
          </form>
        </div>
      )}

      {/* Tab Kategori Content */}
      {activeTab === 'kategori' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama Kategori</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? <tr><td colSpan={2} className="p-4 text-center text-gray-500">Loading...</td></tr> : kategori.map(k => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">#{k.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{k.nama_kategori}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Transaksi Content */}
      {activeTab === 'transaksi' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Uraian</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Jenis</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nominal</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {loading ? <tr><td colSpan={6} className="p-4 text-center text-gray-500">Loading...</td></tr> : transaksi.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{new Date(t.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={t.uraian}>{t.uraian}</td>
                    <td className="px-4 py-3">
                      <span className={clsx("px-2 py-1 text-xs font-medium rounded-full", t.jenis === 'debit' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                        {t.jenis.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {editTxId === t.id ? (
                        <select value={selectedCatId} onChange={e => setSelectedCatId(Number(e.target.value))} className="w-full px-2 py-1 text-xs border border-gray-300 rounded">
                          <option value="">Pilih...</option>
                          {kategori.map(k => (
                            <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-900">{t.nama_kategori}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      Rp {Number(t.nominal).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editTxId === t.id ? (
                        <div className="flex gap-2 justify-end">
                          <button onClick={handleEditTxSubmit} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Simpan</button>
                          <button onClick={() => setEditTxId(null)} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300">Batal</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditTxId(t.id); setSelectedCatId(t.id_kategori); }} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded" title="Edit Kategori">
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
