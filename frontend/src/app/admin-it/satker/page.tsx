'use client';
import toast from 'react-hot-toast';


import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Edit, Building2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SatkerManagementPage() {
  const { token } = useAuth();
  const [satkers, setSatkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nama: '' });

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
      setFormData({ nama: '' });
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
    setFormData({ nama: k.nama });
    setShowForm(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Satker</h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setIsEdit(false); setFormData({ nama: '' }); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Satker
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{isEdit ? 'Edit Satker' : 'Buat Satker Baru'}</h2>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
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
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama Satker</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tgl Dibuat</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr><td colSpan={3} className="p-4 text-center text-gray-500">Loading satker...</td></tr>
              ) : satkers.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-gray-500">Belum ada data satker.</td></tr>
              ) : (
                satkers.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50/50">
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
