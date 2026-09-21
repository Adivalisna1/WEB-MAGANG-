'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSession } from '@/lib/auth';
import { FileText, Edit, Search, Loader2, Save, X, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Kategori {
  id: number;
  nama: string;
}

interface DokumenLaporan {
  id: number;
  judul: string;
  tahun: number;
  kategori: string;
  kategori_id: number;
  status: string;
  file_nama: string;
}

const TAHUN_LIST = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

export default function AdministrasiDokumenPage() {
  const [dokumenList, setDokumenList] = useState<DokumenLaporan[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQ, setSearchQ] = useState('');

  // Modal Edit State
  const [modalOpen, setModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');

  // Edit Form State
  const [editId, setEditId] = useState<number | null>(null);
  const [editJudul, setEditJudul] = useState('');
  const [editTahun, setEditTahun] = useState('');
  const [editKategoriId, setEditKategoriId] = useState('');

  const fetchKategori = useCallback(async () => {
    try {
      const res = await fetch(`${API}/dokumen/kategori`);
      const data = await res.json();
      if (data.success) setKategoriList(data.data);
    } catch (err) {
      console.error('Gagal fetch kategori', err);
    }
  }, []);

  const fetchDokumen = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/all?limit=9999`, {
        headers: session ? { Authorization: `Bearer ${session.token}` } : {},
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const d = await res.json();
      setDokumenList(d.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data dokumen');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKategori();
    fetchDokumen();
  }, [fetchKategori, fetchDokumen]);

  const filteredDokumen = dokumenList.filter(d =>
    d.judul.toLowerCase().includes(searchQ.toLowerCase()) ||
    d.kategori.toLowerCase().includes(searchQ.toLowerCase()) ||
    d.tahun.toString().includes(searchQ)
  );

  const openEditModal = (dok: DokumenLaporan) => {
    setEditId(dok.id);
    setEditJudul(dok.judul);
    setEditTahun(dok.tahun.toString());
    setEditKategoriId(dok.kategori_id.toString());
    setEditError('');
    setEditSuccess('');
    setModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/${editId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          judul: editJudul,
          tahun: Number(editTahun),
          kategori_id: Number(editKategoriId),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengedit dokumen');

      setEditSuccess('Dokumen berhasil diubah');
      fetchDokumen();
      setTimeout(() => {
        setModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setEditError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Manajemen Dokumen
        </h1>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Ketik untuk mencari berdasarkan judul, kategori, atau tahun..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
            <p>Memuat data...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Judul Dokumen</th>
                  <th className="px-6 py-4 font-semibold">Kategori</th>
                  <th className="px-6 py-4 font-semibold">Tahun</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDokumen.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada dokumen yang sesuai pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredDokumen.map(dok => {
                    const canEdit = dok.status === 'terverifikasi' || dok.status === 'diarsipkan';
                    return (
                      <tr key={dok.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 truncate max-w-[300px]">{dok.judul}</div>
                          <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[300px]">{dok.file_nama}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{dok.kategori}</td>
                        <td className="px-6 py-4 text-gray-600">{dok.tahun}</td>
                        <td className="px-6 py-4">
                          <span className={clsx(
                            'inline-flex px-2.5 py-1 rounded-full text-xs font-medium',
                            canEdit ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                          )}>
                            {dok.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {canEdit ? (
                            <button
                              onClick={() => openEditModal(dok)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Terkunci</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                Edit Metadata Dokumen
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                  {editError}
                </div>
              )}
              {editSuccess && (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {editSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul Dokumen</label>
                <input
                  type="text"
                  required
                  value={editJudul}
                  onChange={e => setEditJudul(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
                <select
                  required
                  value={editKategoriId}
                  onChange={e => setEditKategoriId(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {kategoriList.map(k => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tahun</label>
                <select
                  required
                  value={editTahun}
                  onChange={e => setEditTahun(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {TAHUN_LIST.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
