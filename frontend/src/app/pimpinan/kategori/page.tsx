'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { getSession } from '@/lib/auth';
import {
  Tag, Plus, Pencil, Trash2, Loader2,
  RefreshCw, AlertCircle, CheckCircle, X,
  ToggleLeft, ToggleRight, FileText, DollarSign
} from 'lucide-react';
import clsx from 'clsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Kategori {
  id: number;
  nama: string;
  slug: string;
  deskripsi: string | null;
  urutan: number;
  is_active: number;
  jumlah_dokumen: number;
  perlu_nominal: number;
}

type ModalMode = 'tambah' | 'edit' | null;

export default function PimpinanKategoriPage() {
  const [list,      setList]      = useState<Kategori[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [deleting,  setDeleting]  = useState<number | null>(null);
  const [toggling,  setToggling]  = useState<number | null>(null);

  // Modal state
  const [modalMode,  setModalMode]  = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Kategori | null>(null);
  const [nama,       setNama]       = useState('');
  const [deskripsi,  setDeskripsi]  = useState('');
  const [urutan,     setUrutan]     = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState('');
  const [formOk,     setFormOk]     = useState('');
  const [perluNominal, setPerluNominal] = useState(false);

  const fetchKategori = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const session = getSession();
      const res = await fetch(`${API}/pimpinan/kategori`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setList(data.data ?? []);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKategori(); }, [fetchKategori]);

  // Buka modal tambah
  const openTambah = () => {
    setNama(''); setDeskripsi(''); setUrutan('0'); setPerluNominal(false);
    setFormError(''); setFormOk('');
    setEditTarget(null);
    setModalMode('tambah');
  };

  // Buka modal edit
  const openEdit = (k: Kategori) => {
    setNama(k.nama);
    setDeskripsi(k.deskripsi ?? '');
    setUrutan(String(k.urutan));
    setPerluNominal(!!k.perlu_nominal);
    setFormError(''); setFormOk('');
    setEditTarget(k);
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
      const url     = isEdit ? `${API}/pimpinan/kategori/${editTarget.id}` : `${API}/pimpinan/kategori`;
      const method  = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ nama, deskripsi: deskripsi || undefined, urutan: Number(urutan), perlu_nominal: perluNominal ? 1 : 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFormOk(isEdit ? 'Kategori berhasil diupdate' : 'Kategori berhasil ditambahkan');
      await fetchKategori();
      setTimeout(() => closeModal(), 1200);
    } catch (e: any) {
      setFormError(e.message || 'Gagal menyimpan kategori');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle aktif/nonaktif
  const toggleAktif = async (k: Kategori) => {
    setToggling(k.id);
    try {
      const session = getSession();
      const res = await fetch(`${API}/pimpinan/kategori/${k.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ is_active: k.is_active ? 0 : 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchKategori();
    } catch (e: any) {
      alert(e.message || 'Gagal mengubah status');
    } finally {
      setToggling(null);
    }
  };

  // Hapus kategori
  const handleDelete = async (k: Kategori) => {
    if (k.jumlah_dokumen > 0) {
      alert(`Kategori "${k.nama}" tidak bisa dihapus karena masih digunakan oleh ${k.jumlah_dokumen} dokumen.`);
      return;
    }
    if (!confirm(`Hapus kategori "${k.nama}"?`)) return;
    setDeleting(k.id);
    try {
      const session = getSession();
      const res = await fetch(`${API}/pimpinan/kategori/${k.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchKategori();
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus kategori');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kelola Kategori</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tambah, edit, dan hapus kategori dokumen</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchKategori} className="btn-secondary p-2" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openTambah}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Kategori
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
            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">Belum ada kategori</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Slug</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Urutan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dokumen</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-yellow-500 shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-gray-900">{k.nama}</p>
                            {!!k.perlu_nominal && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700" title="Butuh perbandingan nominal">
                                <DollarSign className="w-3 h-3" /> Nominal
                              </span>
                            )}
                          </div>
                          {k.deskripsi && <p className="text-xs text-gray-400 line-clamp-1">{k.deskripsi}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{k.slug}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-center">{k.urutan}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        {k.jumlah_dokumen}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAktif(k)}
                        disabled={toggling === k.id}
                        className={clsx(
                          'flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50',
                          k.is_active ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'
                        )}
                      >
                        {toggling === k.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : k.is_active
                            ? <><ToggleRight className="w-4 h-4" /> Aktif</>
                            : <><ToggleLeft className="w-4 h-4" /> Nonaktif</>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(k)}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(k)}
                          disabled={deleting === k.id || k.jumlah_dokumen > 0}
                          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title={k.jumlah_dokumen > 0 ? `Tidak bisa dihapus (${k.jumlah_dokumen} dokumen)` : 'Hapus'}
                        >
                          {deleting === k.id
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
                {modalMode === 'tambah' ? 'Tambah Kategori' : `Edit: ${editTarget?.nama}`}
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
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Contoh: LKjIP"
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

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  value={deskripsi}
                  onChange={e => setDeskripsi(e.target.value)}
                  rows={2}
                  placeholder="Deskripsi singkat kategori..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                />
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

              {/* Toggle Perlu Nominal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Butuh Perbandingan Nominal?
                </label>
                <button
                  type="button"
                  onClick={() => setPerluNominal(!perluNominal)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors w-full',
                    perluNominal
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-gray-50 border-gray-300 text-gray-500'
                  )}
                >
                  {perluNominal
                    ? <><ToggleRight className="w-5 h-5 text-emerald-600" /> Aktif — input nominal Rek. Koran vs Excel</>
                    : <><ToggleLeft className="w-5 h-5 text-gray-400" /> Nonaktif — tanpa input nominal</>
                  }
                </button>
                <p className="text-xs text-gray-400 mt-1">Aktifkan jika dokumen di kategori ini perlu input nilai rekening koran dan Excel</p>
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

