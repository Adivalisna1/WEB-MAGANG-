'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { getSession } from '@/lib/auth';
import {
  Building2, Plus, Pencil, Trash2, Loader2,
  RefreshCw, AlertCircle, CheckCircle, X,
  ToggleLeft, ToggleRight, FileText, Users
} from 'lucide-react';
import clsx from 'clsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Divisi {
  id: number;
  nama: string;
  slug: string;
  urutan: number;
  is_active: number;
  jumlah_dokumen: number;
  jumlah_user: number;
}

type ModalMode = 'tambah' | 'edit' | null;

export default function AdminDivisiPage() {
  const [list,      setList]      = useState<Divisi[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [deleting,  setDeleting]  = useState<number | null>(null);
  const [toggling,  setToggling]  = useState<number | null>(null);

  // Modal state
  const [modalMode,  setModalMode]  = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Divisi | null>(null);
  const [nama,       setNama]       = useState('');
  const [urutan,     setUrutan]     = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState('');
  const [formOk,     setFormOk]     = useState('');

  const fetchDivisi = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const session = getSession();
      const res = await fetch(`${API}/admin/divisi`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setList(data.data ?? []);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat divisi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDivisi(); }, [fetchDivisi]);

  // Buka modal tambah
  const openTambah = () => {
    setNama(''); setUrutan('0');
    setFormError(''); setFormOk('');
    setEditTarget(null);
    setModalMode('tambah');
  };

  // Buka modal edit
  const openEdit = (d: Divisi) => {
    setNama(d.nama);
    setUrutan(String(d.urutan));
    setFormError(''); setFormOk('');
    setEditTarget(d);
    setModalMode('edit');
  };

  const closeModal = () => { setModalMode(null); setEditTarget(null); };

  // Submit tambah / edit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(''); setFormOk(''); setSubmitting(true);
    try {
      const session = getSession();
      const isEdit  = modalMode === 'edit' && editTarget;
      const url     = isEdit ? `${API}/admin/divisi/${editTarget.id}` : `${API}/admin/divisi`;
      const method  = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ nama, urutan: Number(urutan) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFormOk(isEdit ? 'Divisi berhasil diupdate' : 'Divisi berhasil ditambahkan');
      await fetchDivisi();
      setTimeout(() => closeModal(), 1200);
    } catch (e: any) {
      setFormError(e.message || 'Gagal menyimpan divisi');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle aktif/nonaktif
  const toggleAktif = async (d: Divisi) => {
    setToggling(d.id);
    try {
      const session = getSession();
      const res = await fetch(`${API}/admin/divisi/${d.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ is_active: d.is_active ? 0 : 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchDivisi();
    } catch (e: any) {
      alert(e.message || 'Gagal mengubah status');
    } finally {
      setToggling(null);
    }
  };

  // Hapus divisi
  const handleDelete = async (d: Divisi) => {
    if (d.jumlah_dokumen > 0 || d.jumlah_user > 0) {
      alert(`Divisi "${d.nama}" tidak bisa dihapus karena masih digunakan oleh ${d.jumlah_dokumen} dokumen dan ${d.jumlah_user} user.`);
      return;
    }
    if (!confirm(`Hapus divisi "${d.nama}"?`)) return;
    setDeleting(d.id);
    try {
      const session = getSession();
      const res = await fetch(`${API}/admin/divisi/${d.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchDivisi();
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus divisi');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kelola Divisi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tambah, edit, dan hapus divisi/departemen</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchDivisi} className="btn-secondary p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openTambah}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Divisi
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">Belum ada divisi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Divisi</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Slug</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Urutan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dokumen</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-cyan-600 shrink-0" />
                        <p className="font-medium text-gray-900">{d.nama}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{d.slug}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-center">{d.urutan}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        {d.jumlah_dokumen}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {d.jumlah_user}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAktif(d)}
                        disabled={toggling === d.id}
                        className={clsx(
                          'flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50',
                          d.is_active ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'
                        )}
                      >
                        {toggling === d.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : d.is_active
                            ? <><ToggleRight className="w-4 h-4" /> Aktif</>
                            : <><ToggleLeft className="w-4 h-4" /> Nonaktif</>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(d)}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(d)}
                          disabled={deleting === d.id || d.jumlah_dokumen > 0 || d.jumlah_user > 0}
                          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title={(d.jumlah_dokumen > 0 || d.jumlah_user > 0) ? 'Tidak bisa dihapus (masih dipakai)' : 'Hapus'}
                        >
                          {deleting === d.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            {/* Header modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">
                {modalMode === 'tambah' ? 'Tambah Divisi' : `Edit: ${editTarget?.nama}`}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                </div>
              )}
              {formOk && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
                  <CheckCircle className="w-4 h-4 shrink-0" /> {formOk}
                </div>
              )}

              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Divisi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Contoh: Keuangan"
                  required
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                {nama && (
                  <p className="text-xs text-gray-400 mt-1">
                    Slug: <code className="bg-gray-100 px-1 rounded">
                      {nama.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}
                    </code>
                  </p>
                )}
              </div>

              {/* Urutan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Urutan Tampil
                </label>
                <input
                  type="number"
                  value={urutan}
                  onChange={e => setUrutan(e.target.value)}
                  min={0}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <p className="text-xs text-gray-400 mt-1">Angka lebih kecil tampil lebih dulu</p>
              </div>

              {/* Tombol */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !nama}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modalMode === 'tambah' ? 'Tambah' : 'Simpan'}
                </button>
                <button type="button" onClick={closeModal} className="flex-1 btn-secondary py-2.5">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
