'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth';
import {
  FileText, CheckCircle, XCircle, Clock,
  Loader2, RefreshCw, AlertCircle, Eye, ExternalLink, Trash2, Download
} from 'lucide-react';
import clsx from 'clsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Dokumen {
  id: number;
  judul: string;
  tahun: number;
  status: string;
  kategori: string;
  divisi: string | null;
  file_nama: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  catatan: string | null;
}

interface Divisi { id: number; nama: string; slug: string; }

export default function AdminDokumenPage() {
  const [dokumenList, setDokumenList] = useState<Dokumen[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [filter,      setFilter]      = useState('menunggu_verifikasi');
  const [divisiList,  setDivisiList]  = useState<Divisi[]>([]);
  const [filterDivisi, setFilterDivisi] = useState('');
  const [processing,  setProcessing]  = useState<number | null>(null);
  const [deleting,    setDeleting]    = useState<number | null>(null);
  const [modalDok,    setModalDok]    = useState<Dokumen | null>(null);
  const [catatan,     setCatatan]     = useState('');
  const [previewUrl,  setPreviewUrl]  = useState<string | null>(null);

  // Info sesi: hanya admin global yang boleh ganti divisi dokumen
  const session = getSession();
  const isAdminGlobal = session?.user?.role === 'admin';

  // Dropdown divisi di modal edit (admin global saja)
  const [editDivisiId,  setEditDivisiId]  = useState('');
  const [savingDivisi,  setSavingDivisi]  = useState(false);

  // Daftar divisi aktif untuk filter & dropdown edit
  useEffect(() => {
    fetch(`${API}/dokumen/divisi`)
      .then(r => r.json())
      .then(d => setDivisiList(d.data ?? []))
      .catch(() => {});
  }, []);

  // Cek apakah file PDF (hanya PDF yang bisa di-preview di browser)
  const isPdf = modalDok ? /\.pdf$/i.test(modalDok.file_nama) : false;

  // Fetch file preview sebagai blob (token tidak pernah masuk URL)
  useEffect(() => {
    if (!modalDok) {
      // Cleanup blob URL saat modal ditutup
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    let cancelled = false;
    const session = getSession();

    async function loadPreview() {
      try {
        const res = await fetch(`${API}/dokumen/${modalDok.id}/preview`, {
          headers: { Authorization: `Bearer ${session?.token}` },
        });
        if (!res.ok) return;
        const blob = await res.blob();
        // PDF: paksa type application/pdf agar browser render, bukan download
        // Non-PDF: pertahankan type asli agar hasil download valid
        const finalBlob = isPdf ? new Blob([blob], { type: 'application/pdf' }) : blob;
        if (!cancelled) {
          setPreviewUrl(URL.createObjectURL(finalBlob));
        }
      } catch { /* silent */ }
    }

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [modalDok]); // eslint-disable-line react-hooks/exhaustive-deps

  // Download file via blob URL — atribut `download` memaksa browser save file
  const handleDownload = () => {
    if (!previewUrl || !modalDok) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = modalDok.file_nama;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const fetchDokumen = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const session = getSession();
      const divisiParam = filterDivisi ? `&divisi=${filterDivisi}` : '';
      const res = await fetch(`${API}/dokumen/all?status=${filter}&limit=50${divisiParam}`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDokumenList(data.data ?? []);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat dokumen');
    } finally {
      setLoading(false);
    }
  }, [filter, filterDivisi]);

  useEffect(() => { fetchDokumen(); }, [fetchDokumen]);

  const handleVerifikasi = async (id: number, aksi: 'approve' | 'reject') => {
    setProcessing(id);
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/${id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ aksi, catatan: catatan || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setModalDok(null);
      setCatatan('');
      await fetchDokumen();
    } catch (e: any) {
      alert(e.message || 'Gagal memproses verifikasi');
    } finally {
      setProcessing(null);
    }
  };

  // Simpan perubahan divisi dokumen (admin global saja)
  const handleSimpanDivisi = async () => {
    if (!modalDok || !editDivisiId) return;
    setSavingDivisi(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/${modalDok.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ divisi_id: Number(editDivisiId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setModalDok(prev => prev
        ? { ...prev, divisi: divisiList.find(d => d.id === Number(editDivisiId))?.nama ?? prev.divisi }
        : prev);
      await fetchDokumen();
    } catch (e: any) {
      alert(e.message || 'Gagal mengubah divisi');
    } finally {
      setSavingDivisi(false);
    }
  };

  const handleDelete = async (id: number, judul: string) => {
    if (!confirm(`Hapus dokumen "${judul}"? File akan dihapus permanen.`)) return;
    setDeleting(id);
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchDokumen();
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus dokumen');
    } finally {
      setDeleting(null);
    }
  };

  const formatSize = (b: number) => b < 1024 * 1024
    ? `${(b / 1024).toFixed(1)} KB`
    : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  const filterTabs = [
    { value: 'menunggu_verifikasi', label: 'Menunggu',      color: 'text-yellow-600' },
    { value: 'terverifikasi',       label: 'Terverifikasi', color: 'text-green-600' },
    { value: 'revisi',              label: 'Revisi',        color: 'text-orange-600' },
    { value: '',                    label: 'Semua',         color: 'text-gray-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Verifikasi Dokumen</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tinjau dan setujui dokumen yang diajukan staff</p>
        </div>
        <button onClick={fetchDokumen} className="btn-secondary p-2" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={clsx(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === tab.value
                  ? 'bg-gray-900 text-white'
                  : `${tab.color} hover:bg-gray-50`
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={filterDivisi}
          onChange={e => setFilterDivisi(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
        >
          <option value="">Semua Divisi</option>
          {divisiList.map(d => (
            <option key={d.id} value={d.slug}>{d.nama}</option>
          ))}
        </select>
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
        ) : dokumenList.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">Tidak ada dokumen</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dokumen</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Divisi</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tahun</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Diupload oleh</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ukuran</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dokumenList.map(dok => (
                  <tr key={dok.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{dok.judul}</p>
                          <p className="text-xs text-gray-400">{dok.file_nama}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{dok.kategori}</td>
                    <td className="px-4 py-3">
                      {dok.divisi
                        ? <span className="badge bg-cyan-100 text-cyan-800">{dok.divisi}</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-600">{dok.tahun}</td>
                    <td className="px-4 py-3 text-gray-600">{dok.uploaded_by}</td>
                    <td className="px-4 py-3 text-gray-500">{formatSize(dok.file_size)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {dok.status === 'menunggu_verifikasi' ? (
                          <button
                            onClick={() => {
                              setModalDok(dok);
                              setCatatan('');
                              setEditDivisiId(divisiList.find(d => d.nama === dok.divisi)?.id ? String(divisiList.find(d => d.nama === dok.divisi)!.id) : '');
                            }}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" /> Tinjau
                          </button>
                        ) : (
                          <span className={clsx(
                            'text-xs font-medium',
                            dok.status === 'terverifikasi' ? 'text-green-600' : 'text-orange-600'
                          )}>
                            {dok.status === 'terverifikasi' ? '✓ Disetujui' : '↩ Revisi'}
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(dok.id, dok.judul)}
                          disabled={deleting === dok.id}
                          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Hapus dokumen"
                        >
                          {deleting === dok.id
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

      {/* Modal verifikasi */}
      {modalDok && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Tinjau Dokumen</h3>
                <p className="text-sm text-gray-500 mt-0.5">{modalDok.judul}</p>
              </div>
              {previewUrl && (
                <button
                  onClick={() => window.open(previewUrl, '_blank')}
                  className="shrink-0 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Tab Baru
                </button>
              )}
            </div>

            {/* Preview PDF */}
            <div className="bg-gray-100 border-b border-gray-200" style={{ height: '420px' }}>
              {!isPdf ? (
                // File non-PDF (Word/Excel) tidak bisa di-preview di browser
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FileText className="w-14 h-14 mb-3 text-gray-300" />
                  <p className="font-medium text-gray-700">Preview hanya tersedia untuk file PDF</p>
                  <p className="text-sm text-gray-400 mt-1">File ini berformat Word/Excel</p>
                  {previewUrl && (
                    <button
                      onClick={handleDownload}
                      className="mt-4 flex items-center gap-1.5 text-sm text-white bg-primary-600 hover:bg-primary-700 font-medium px-5 py-2.5 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download File
                    </button>
                  )}
                </div>
              ) : previewUrl ? (
                <object
                  data={previewUrl}
                  type="application/pdf"
                  className="w-full h-full"
                  style={{ height: '420px', minHeight: '420px' }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FileText className="w-12 h-12 mb-2 text-gray-300" />
                    <p className="text-sm">Preview tidak tersedia untuk file ini</p>
                    <button
                      onClick={() => window.open(previewUrl, '_blank')}
                      className="mt-2 text-sm text-primary-600 hover:underline"
                    >
                      Buka di Tab Baru
                    </button>
                  </div>
                </object>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              )}
            </div>

            {/* Info grid */}
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Kategori</p>
                  <p className="font-medium mt-0.5">{modalDok.kategori}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Tahun</p>
                  <p className="font-medium mt-0.5">{modalDok.tahun}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Divisi</p>
                  <p className="font-medium mt-0.5">{modalDok.divisi ?? '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Diupload oleh</p>
                  <p className="font-medium mt-0.5">{modalDok.uploaded_by}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">File</p>
                  <p className="font-medium mt-0.5 truncate">{modalDok.file_nama}</p>
                </div>
              </div>

              {/* Ganti divisi — hanya admin global */}
              {isAdminGlobal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Divisi Dokumen <span className="text-gray-400 font-normal">(ubah divisi)</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={editDivisiId}
                      onChange={e => setEditDivisiId(e.target.value)}
                      className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                    >
                      <option value="">Pilih divisi...</option>
                      {divisiList.map(d => (
                        <option key={d.id} value={d.id}>{d.nama}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleSimpanDivisi}
                      disabled={savingDivisi || !editDivisiId}
                      className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingDivisi && <Loader2 className="w-4 h-4 animate-spin" />}
                      Simpan
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Catatan <span className="text-gray-400 font-normal">(wajib diisi jika menolak)</span>
                </label>
                <textarea
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  rows={2}
                  placeholder="Catatan untuk staff..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleVerifikasi(modalDok.id, 'approve')}
                  disabled={processing === modalDok.id}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {processing === modalDok.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle className="w-4 h-4" />}
                  Setujui
                </button>
                <button
                  onClick={() => handleVerifikasi(modalDok.id, 'reject')}
                  disabled={processing === modalDok.id || !catatan.trim()}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {processing === modalDok.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <XCircle className="w-4 h-4" />}
                  Revisi
                </button>
                <button
                  onClick={() => setModalDok(null)}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
