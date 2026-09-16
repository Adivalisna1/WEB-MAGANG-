'use client';
import toast from 'react-hot-toast';


import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit, Download, Paperclip } from 'lucide-react';
import clsx from 'clsx';
import * as XLSX from 'xlsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PimpinanAkuntansiPage() {
  const { token, user } = useAuth();
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [kategori, setKategori] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    tanggal: '',
    uraian: '',
    jenis: 'debit',
    id_kategori: '',
    nominal: '',
    catatan_audit: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

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
      toast.error('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append('tanggal', formData.tanggal);
      data.append('uraian', formData.uraian);
      data.append('jenis', formData.jenis);
      data.append('id_kategori', formData.id_kategori);
      data.append('nominal', formData.nominal);
      data.append('catatan_audit', formData.catatan_audit);
      if (file) data.append('file', file);

      const url = isEdit ? `${API}/akuntansi/${editId}` : `${API}/akuntansi`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });
      const j = await res.json();
      if (j.success) {
        toast.success(`Data berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}`);
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

  const handleEditClick = (t: any) => {
    setFormData({
      tanggal: new Date(t.tanggal).toISOString().split('T')[0],
      uraian: t.uraian,
      jenis: t.jenis,
      id_kategori: String(t.id_kategori),
      nominal: t.nominal,
      catatan_audit: t.catatan_audit || ''
    });
    setFile(null);
    setEditId(t.id);
    setIsEdit(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ tanggal: '', uraian: '', jenis: 'debit', id_kategori: '', nominal: '', catatan_audit: '' });
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsEdit(false);
    setEditId(null);
  };

  const exportToExcel = () => {
    const wsData = transaksi.map((t, index) => ({
      'No': index + 1,
      'Tanggal': new Date(t.tanggal).toLocaleDateString('id-ID'),
      'Uraian': t.uraian,
      'Jenis': t.jenis.toUpperCase(),
      'Kategori': t.nama_kategori,
      'Nominal': Number(t.nominal),
      'Catatan Audit': t.catatan_audit || '-',
      'Dibuat Oleh': t.pembuat || '-',
      'Diedit Oleh': t.pengedit || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Akuntansi');
    XLSX.writeFile(wb, `Data_Akuntansi_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Akuntansi & Audit</h1>
          <p className="text-sm text-gray-500 mt-1">Pemantauan dan pengelolaan transaksi akuntansi seluruh satker.</p>
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input type="date" required value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
                  <select required value={formData.jenis} onChange={e => setFormData({...formData, jenis: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="debit">Pemasukan (Debit)</option>
                    <option value="kredit">Pengeluaran (Kredit)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Akun</label>
                <select required value={formData.id_kategori} onChange={e => setFormData({...formData, id_kategori: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Pilih Kategori...</option>
                  {kategori.map(k => (
                    <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uraian / Deskripsi</label>
                <textarea rows={2} required value={formData.uraian} onChange={e => setFormData({...formData, uraian: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Contoh: Pembayaran tagihan listrik bulan Agustus"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                  <input type="number" min="0" required value={formData.nominal} onChange={e => setFormData({...formData, nominal: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Contoh: 1500000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bukti File (Opsional)</label>
                  <input type="file" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Audit (Opsional)</label>
                <textarea rows={2} value={formData.catatan_audit} onChange={e => setFormData({...formData, catatan_audit: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Catatan khusus dari Pimpinan..."></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
                <button type="submit" disabled={submitLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
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
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Nominal</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">File</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? <tr><td colSpan={7} className="p-8 text-center text-gray-500">Memuat data...</td></tr> : 
                transaksi.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-gray-500">Belum ada data transaksi.</td></tr> :
                transaksi.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-600 font-medium">{new Date(t.tanggal).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 line-clamp-2">{t.uraian}</p>
                    <p className="text-xs text-gray-400 mt-1">Oleh: {t.pembuat}</p>
                    {t.catatan_audit && <p className="text-xs text-amber-600 mt-1 italic font-medium">Audit: {t.catatan_audit}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx("px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider", t.jenis === 'debit' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                      {t.jenis}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.nama_kategori}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                    Rp {Number(t.nominal).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {t.bukti_file ? (
                      <a href={t.bukti_file} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Lihat Bukti">
                        <Paperclip className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEditClick(t)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit Data & Audit">
                      <Edit className="w-4 h-4" />
                    </button>
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
