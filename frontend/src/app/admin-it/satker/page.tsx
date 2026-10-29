'use client';
import toast from 'react-hot-toast';


import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Edit, Building2, Download, Upload } from 'lucide-react';
import { useRef } from 'react';
import * as XLSX from 'xlsx';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

export default function SatkerManagementPage() {
  const { token } = useAuth();
  const [satkers, setSatkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ NO_Satker: '', nama: '' });

  const fetchSatkers = async () => {
    try {
      const res = await fetch(`${API}/satker`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const j = await res.json();
      if (j.success) setSatkers(j.data);
    } catch (err) {
      toast.error('Failed to load satker');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSatkers();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && editId) {
        const res = await fetch(`${API}/satker/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData)
        });
        const j = await res.json();
        if (j.success) toast.success('Satker updated');
        else toast.error(j.message || 'Failed');
      } else {
        const res = await fetch(`${API}/satker`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData)
        });
        const j = await res.json();
        if (j.success) toast.success('Satker created');
        else toast.error(j.message || 'Failed');
      }
      setShowForm(false);
      setFormData({ NO_Satker: '', nama: '' });
      fetchSatkers();
    } catch (err: any) {
      toast.error('Failed to save satker');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this satker?')) return;
    try {
      const res = await fetch(`${API}/satker/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const j = await res.json();
      if (j.success) {
        toast.success('Satker deleted');
        fetchSatkers();
      } else {
        toast.error(j.message || 'Failed to delete satker');
      }
    } catch (err: any) {
      toast.error('Failed to delete satker');
    }
  };

  const handleEditClick = (k: any) => {
    setIsEdit(true);
    setEditId(k.id);
    setFormData({ NO_Satker: k.NO_Satker || '', nama: k.nama });
    setShowForm(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
          
          const satkerData = jsonData.map(row => ({
            NO_Satker: row['Kode Satker'] || row.Kode || row.NO_Satker,
            nama: row.Satker || row['Nama Satker']
          })).filter(s => s.NO_Satker && s.nama);
          
          if (satkerData.length === 0) {
            toast.error('Tidak ada data yang valid. Pastikan header kolom "Kode Satker" dan "Nama Satker" terisi.');
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
          }

          const res = await fetch(`${API}/satker/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ satkers: satkerData })
          });
          const result = await res.json();
          if (result.success) {
            toast.success(result.message || 'Import berhasil');
            fetchSatkers();
          } else {
            toast.error(result.message || 'Import gagal');
          }
        } catch (err) {
          console.error(err);
          toast.error('Gagal membaca file Excel');
        } finally {
          setImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        toast.error('Gagal membaca file');
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      toast.error('Terjadi kesalahan saat import');
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 'Kode Satker': 191, 'Nama Satker': 'Contoh Satker IT' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Satker");
    XLSX.writeFile(wb, "Template_Import_Satker.xlsx");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Satker</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Importing...' : 'Import'}
          </button>

          <button
            onClick={() => { setShowForm(!showForm); setIsEdit(false); setFormData({ NO_Satker: '', nama: '' }); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Satker
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{isEdit ? 'Edit Satker' : 'Buat Satker Baru'}</h2>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="w-1/4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Satker</label>
              <input type="number" required value={formData.NO_Satker} onChange={e => setFormData({ ...formData, NO_Satker: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Misal: 191" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Satker</label>
              <input type="text" required value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Satker IT" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">{isEdit ? 'Simpan' : 'Buat Satker'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-24">Kode</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama Satker</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tgl Dibuat</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Loading satker...</td></tr>
              ) : satkers.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Belum ada data satker.</td></tr>
              ) : (
                satkers.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {k.NO_Satker || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900">{k.nama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(k.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(k)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(k.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
