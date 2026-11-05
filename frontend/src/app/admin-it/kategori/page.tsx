'use client';
import toast from 'react-hot-toast';


import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Edit, Tags } from 'lucide-react';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

export default function KategoriManagementPage() {
  const { token } = useAuth();
  const [kategoris, setKategoris] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nama: '', slug: '', deskripsi: '' });

  const fetchKategori = async () => {
    try {
      const res = await fetch(`${API}/admin-it/kategori`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const j = await res.json();
      if (j.success) setKategoris(j.data);
    } catch (err) {
      toast.error('Failed to load kategori');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchKategori();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && editId) {
        const res = await fetch(`${API}/admin-it/kategori/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData)
        });
        const j = await res.json();
        if (j.success) toast.success('Kategori updated');
        else toast.error(j.message || 'Failed');
      } else {
        const res = await fetch(`${API}/admin-it/kategori`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(formData)
        });
        const j = await res.json();
        if (j.success) toast.success('Kategori created');
        else toast.error(j.message || 'Failed');
      }
      setShowForm(false);
      setFormData({ nama: '', slug: '', deskripsi: '' });
      fetchKategori();
    } catch (err: any) {
      toast.error('Failed to save kategori');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this kategori?')) return;
    try {
      const res = await fetch(`${API}/admin-it/kategori/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const j = await res.json();
      if (j.success) {
        toast.success('Kategori deleted');
        fetchKategori();
      } else {
        toast.error(j.message || 'Failed to delete kategori');
      }
    } catch (err: any) {
      toast.error('Failed to delete kategori');
    }
  };

  const handleEditClick = (k: any) => {
    setIsEdit(true);
    setEditId(k.id);
    setFormData({ nama: k.nama, slug: k.slug, deskripsi: k.deskripsi || '' });
    setShowForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kategori Dokumen</h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setIsEdit(false); setFormData({ nama: '', slug: '', deskripsi: '' }); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Kategori
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{isEdit ? 'Edit Kategori' : 'Create New Kategori'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
              <input type="text" required value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input type="text" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea rows={3} value={formData.deskripsi} onChange={e => setFormData({ ...formData, deskripsi: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">{isEdit ? 'Save Changes' : 'Create Kategori'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Slug</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Deskripsi</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Loading kategori...</td></tr>
              ) : (
                kategoris.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          <Tags className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900">{k.nama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{k.slug}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[300px]">{k.deskripsi || '-'}</td>
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
