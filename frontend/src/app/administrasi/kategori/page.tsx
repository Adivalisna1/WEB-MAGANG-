'use client';
import toast from 'react-hot-toast';


import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit, Trash2, Loader2, RefreshCw, AlertCircle, X, Tag } from 'lucide-react';
import clsx from 'clsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Kategori {
  id: number;
  nama: string;
  slug: string;
  deskripsi: string | null;
  urutan: number;
  is_active: number;
  perlu_nominal: number;
  jumlah_dokumen: number;
}

export default function KategoriManagementPage() {
  const { token } = useAuth();
  const [list, setList] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Kategori | null>(null);

  // Form
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [urutan, setUrutan] = useState(0);
  const [perluNominal, setPerluNominal] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [formErr, setFormErr] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchKategori = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/administrasi/kategori`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setList(data.data ?? []);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchKategori();
  }, [fetchKategori]);

  const openAdd = () => {
    setEditTarget(null);
    setNama('');
    setDeskripsi('');
    setUrutan(list.length + 1);
    setPerluNominal(false);
    setIsActive(true);
    setFormErr('');
    setShowModal(true);
  };

  const openEdit = (k: Kategori) => {
    setEditTarget(k);
    setNama(k.nama);
    setDeskripsi(k.deskripsi || '');
    setUrutan(k.urutan);
    setPerluNominal(k.perlu_nominal === 1);
    setIsActive(k.is_active === 1);
    setFormErr('');
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErr('');
    setFormLoading(true);

    const isEdit = !!editTarget;
    const url = isEdit ? `${API}/administrasi/kategori/${editTarget.id}` : `${API}/administrasi/kategori`;
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nama,
          deskripsi,
          urutan: Number(urutan),
          perlu_nominal: perluNominal ? 1 : 0,
          is_active: isActive ? 1 : 0
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setShowModal(false);
      fetchKategori();
    } catch (e: any) {
      setFormErr(e.message || 'Gagal menyimpan kategori');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (k: Kategori) => {
    if (k.jumlah_dokumen > 0) {
      toast.success(`Tidak bisa menghapus kategori ini karena masih memiliki ${k.jumlah_dokumen} dokumen terkait.`);
      return;
    }
    if (!confirm(`Hapus kategori "${k.nama}"?`)) return;

    try {
      const res = await fetch(`${API}/administrasi/kategori/${k.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchKategori();
    } catch (e: any) {
      toast.error(e.message || 'Gagal menghapus kategori');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Master Kategori Dokumen</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchKategori} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tambah Kategori
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-gray-900 uppercase text-xs tracking-wider">Urutan</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-900 uppercase text-xs tracking-wider">Kategori</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900 uppercase text-xs tracking-wider">Perlu Nominal</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900 uppercase text-xs tracking-wider">Dokumen</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900 uppercase text-xs tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-900 uppercase text-xs tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      Belum ada kategori dokumen.
                    </td>
                  </tr>
                ) : (
                  list.map(k => (
                    <tr key={k.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 font-mono">{k.urutan}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <Tag className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{k.nama}</p>
                            <p className="text-xs text-gray-500 max-w-xs truncate">{k.deskripsi || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={clsx("inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full", k.perlu_nominal ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500")}>
                          {k.perlu_nominal ? "Ya" : "Tidak"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-gray-700">{k.jumlah_dokumen}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={clsx("inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full", k.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500")}>
                          {k.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(k)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(k)}
                            disabled={k.jumlah_dokumen > 0}
                            className={clsx("p-1.5 rounded-md transition-colors", k.jumlah_dokumen > 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-red-600 hover:bg-red-50")}
                            title={k.jumlah_dokumen > 0 ? "Tidak bisa dihapus (ada dokumen)" : "Hapus"}
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
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">{editTarget ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formErr && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {formErr}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Kategori <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Contoh: LKjIP"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Singkat</label>
                <textarea
                  value={deskripsi}
                  onChange={e => setDeskripsi(e.target.value)}
                  placeholder="Keterangan opsional"
                  rows={2}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Urutan Tampil</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={urutan}
                    onChange={e => setUrutan(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {editTarget && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                    <select
                      value={isActive ? '1' : '0'}
                      onChange={e => setIsActive(e.target.value === '1')}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="1">Aktif</option>
                      <option value="0">Nonaktif</option>
                    </select>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={perluNominal}
                  onChange={e => setPerluNominal(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Perlu Nominal Laporan?</p>
                  <p className="text-xs text-gray-500 mt-0.5">Centang jika dokumen dari kategori ini butuh input isian nominal selisih (contoh: LAKIP/Keuangan).</p>
                </div>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
