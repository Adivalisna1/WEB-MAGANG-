'use client';
import toast from 'react-hot-toast';


import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth';
import {
  FileText, CheckCircle, XCircle, Clock,
  Loader2, RefreshCw, AlertCircle, Eye, ExternalLink, Trash2, Download,
  Send, Edit
} from 'lucide-react';
import clsx from 'clsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Dokumen {
  id: number;
  judul: string;
  tahun: number;
  bulan?: number | null;
  semester?: number | null;
  nomor_laporan?: string | null;
  status: string;
  kategori: string;
  file_nama: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  catatan: string | null;
  nilai_rekening_koran?: number | null;
  nilai_excel?: number | null;
}

const NAMA_BULAN = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function periodLabel(dok: Dokumen) {
  if (dok.semester) return `Sem ${dok.semester} ${dok.tahun}`;
  if (dok.bulan) return `${NAMA_BULAN[dok.bulan]} ${dok.tahun}`;
  return String(dok.tahun);
}

function formatRupiah(val: number | null | undefined): string {
  if (val == null) return '—';
  // Tampilkan desimal hanya kalau ada (bukan .00)
  const rounded = Math.round(val * 100) / 100;
  const [int, dec] = rounded.toString().split('.');
  const ribuan = Number(int).toLocaleString('id-ID');
  return dec && dec !== '00' ? `Rp ${ribuan},${dec.padEnd(2, '0')}` : `Rp ${ribuan}`;
}

export default function PimpinanDokumenPage() {
  const [dokumenList, setDokumenList] = useState<Dokumen[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [filter,      setFilter]      = useState('menunggu_verifikasi');
  const [processing,  setProcessing]  = useState<number | null>(null);
  const [deleting,    setDeleting]    = useState<number | null>(null);
  const [modalDok,    setModalDok]    = useState<Dokumen | null>(null);
  const [catatan,     setCatatan]     = useState('');
  const [editNilaiRek, setEditNilaiRek] = useState('');
  const [editNilaiExcel, setEditNilaiExcel] = useState('');
  const [previewUrl,  setPreviewUrl]  = useState<string | null>(null);
  const [previewProgress, setPreviewProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [previewError,    setPreviewError]    = useState('');

  // Edit Metadata State
  const [kategoriList, setKategoriList] = useState<{id: number, nama: string}[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editJudul, setEditJudul] = useState('');
  const [editTahun, setEditTahun] = useState('');
  const [editKategoriId, setEditKategoriId] = useState('');

  // Backend konversi Word → PDF via LibreOffice. Excel tetap download (layout sering berantakan).
  const isPdf   = modalDok ? /\.pdf$/i.test(modalDok.file_nama) : false;
  const isExcel = modalDok ? /\.(xls|xlsx)$/i.test(modalDok.file_nama) : false;
  const isPreviewable = isPdf || (!isExcel); // PDF + Word bisa preview, Excel tidak

  // Fetch preview file as blob (streaming + progress bar)
  useEffect(() => {
    if (!modalDok) {
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
      setPreviewProgress(null);
      setPreviewError('');
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const session = getSession();

    // Excel tidak di-preview — tampilkan UI download langsung
    if (isExcel) {
      setPreviewProgress(null);
      setPreviewError('');
      return;
    }

    async function loadPreview() {
      setPreviewProgress({ loaded: 0, total: 0 });
      setPreviewError('');
      try {
        const res = await fetch(`${API}/dokumen/${modalDok!.id}/preview`, {
          headers: { Authorization: `Bearer ${session?.token}` },
          signal: controller.signal,
        });
        if (!res.ok) {
          if (!cancelled) setPreviewError('Gagal memuat file preview');
          return;
        }
        const total = Number(res.headers.get('Content-Length')) || 0;
        const chunks: BlobPart[] = [];
        let loaded = 0;
        if (res.body && res.body.getReader) {
          const reader = res.body.getReader();
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              loaded += value.length;
              if (!cancelled) setPreviewProgress({ loaded, total });
            }
          }
        } else {
          const blob = await res.blob();
          chunks.push(blob);
          loaded = blob.size;
          if (!cancelled) setPreviewProgress({ loaded, total: total || loaded });
        }
        // Backend selalu return PDF (file asli PDF atau hasil konversi Word → PDF)
        const finalBlob = new Blob(chunks, { type: 'application/pdf' });
        if (!cancelled) {
          setPreviewUrl(URL.createObjectURL(finalBlob));
          setPreviewProgress(null);
        }
      } catch {
        if (!cancelled && !controller.signal.aborted) setPreviewError('Gagal memuat file preview');
      }
    }
    loadPreview();
    return () => { cancelled = true; controller.abort(); };
  }, [modalDok]); // eslint-disable-line react-hooks/exhaustive-deps

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
      const statusParam = filter ? `status=${filter}&` : '';
      const res = await fetch(`${API}/dokumen/all?${statusParam}limit=50`, {
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
  }, [filter]);

  useEffect(() => { fetchDokumen(); }, [fetchDokumen]);

  const fetchKategori = useCallback(async () => {
    try {
      const res = await fetch(`${API}/dokumen/kategori`);
      const data = await res.json();
      if (data.success) setKategoriList(data.data);
    } catch (err) {
      console.error('Gagal fetch kategori', err);
    }
  }, []);

  useEffect(() => { fetchKategori(); }, [fetchKategori]);

  const openEditModal = (dok: Dokumen) => {
    setEditId(dok.id);
    setEditJudul(dok.judul);
    setEditTahun(dok.tahun.toString());
    const cat = kategoriList.find(k => k.nama === dok.kategori);
    setEditKategoriId(cat ? cat.id.toString() : '');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setEditLoading(true);
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
      toast.success('Dokumen berhasil diubah');
      fetchDokumen();
      setEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengedit dokumen');
    } finally {
      setEditLoading(false);
    }
  };

  // Pimpinan: loloskan ke Eselon 1 ATAU kembalikan untuk revisi
  const handleVerifikasi = async (id: number, aksi: 'lolos' | 'reject') => {
    if (aksi === 'reject' && !catatan.trim()) {
      toast.error('Catatan wajib diisi jika mengembalikan untuk revisi');
      return;
    }
    setProcessing(id);
    try {
      const session = getSession();
      const payload: any = { aksi, catatan: catatan || undefined };
      if (editNilaiRek) payload.nilai_rekening_koran = Number(editNilaiRek.replace(/\./g, '').replace(',', '.'));
      if (editNilaiExcel) payload.nilai_excel = Number(editNilaiExcel.replace(/\./g, '').replace(',', '.'));

      const res = await fetch(`${API}/dokumen/${id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setModalDok(null);
      setCatatan('');
      await fetchDokumen();
    } catch (e: any) {
      toast.error(e.message || 'Gagal memproses verifikasi');
    } finally {
      setProcessing(null);
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
      toast.error(e.message || 'Gagal menghapus dokumen');
    } finally {
      setDeleting(null);
    }
  };

  const formatSize = (b: number) => b < 1024 * 1024
    ? `${(b / 1024).toFixed(1)} KB`
    : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      menunggu_verifikasi: { label: 'Menunggu', cls: 'bg-yellow-100 text-yellow-800' },
      lolos_Pimpinan:         { label: 'Menunggu Ketua', cls: 'bg-blue-100 text-blue-800' },
      terverifikasi:       { label: 'Disetujui', cls: 'bg-green-100 text-green-800' },
      revisi:              { label: 'Revisi', cls: 'bg-orange-100 text-orange-800' },
      draft:               { label: 'Draft', cls: 'bg-gray-100 text-gray-600' },
    };
    const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
  };

  const filterTabs = [
    { value: 'menunggu_verifikasi', label: 'Menunggu Tinjauan', icon: Clock },
    { value: 'lolos_Pimpinan',         label: 'Menunggu Ketua',    icon: Send },
    { value: 'terverifikasi',       label: 'Disetujui',         icon: CheckCircle },
    { value: 'revisi',              label: 'Revisi',            icon: XCircle },
    { value: '',                    label: 'Semua',             icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tinjauan Dokumen</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Sebagai penyaring pertama — loloskan dokumen layak ke Eselon 1 untuk persetujuan akhir
          </p>
        </div>
        <button onClick={fetchDokumen} className="btn-secondary p-2" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit flex-wrap">
        {filterTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === tab.value
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">No. Laporan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dokumen</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Periode</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Uploader</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nilai</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dokumenList.map(dok => (
                  <tr key={dok.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {dok.nomor_laporan ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{dok.judul}</p>
                        <p className="text-xs text-gray-400">{dok.file_nama}</p>
                        {dok.catatan && (
                          <p className="text-xs text-orange-600 mt-0.5 italic line-clamp-1">📝 {dok.catatan}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{dok.kategori}</td>
                    <td className="px-4 py-3 text-gray-600">{periodLabel(dok)}</td>
                    <td className="px-4 py-3 text-gray-600">{dok.uploaded_by}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs font-medium whitespace-nowrap">
                      {dok.nilai_rekening_koran != null
                        ? <span className="text-emerald-700 font-semibold">{formatRupiah(dok.nilai_rekening_koran)}</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">{statusBadge(dok.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(dok)}
                          className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-700 font-medium"
                          title="Edit Metadata"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        {dok.status === 'menunggu_verifikasi' ? (
                          <button
                            onClick={() => { 
                              setModalDok(dok); 
                              setCatatan(''); 
                              setEditNilaiRek(dok.nilai_rekening_koran != null ? Number(dok.nilai_rekening_koran).toLocaleString('id-ID') : '');
                              setEditNilaiExcel(dok.nilai_excel != null ? Number(dok.nilai_excel).toLocaleString('id-ID') : '');
                            }}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" /> Tinjau
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
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

      {/* Modal tinjauan Pimpinan */}
      {modalDok && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Tinjau Dokumen</h3>
                <p className="text-sm text-gray-500 mt-0.5">{modalDok.judul}</p>
                {modalDok.nomor_laporan && (
                  <p className="text-xs text-gray-400 font-mono mt-0.5">#{modalDok.nomor_laporan}</p>
                )}
              </div>
              {previewUrl && (
                <button
                  onClick={() => window.open(previewUrl, '_blank')}
                  className="shrink-0 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Tab Baru
                </button>
              )}
            </div>

            {/* Preview — flex-1 agar isi ruang sisa, min-h-0 agar bisa menyusut */}
            <div className="bg-gray-100 border-b border-gray-200 flex-1 min-h-0 overflow-hidden">
              {isExcel ? (
                // Excel: langsung tampilkan tombol download — tidak di-preview
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FileText className="w-14 h-14 mb-3 text-gray-300" />
                  <p className="font-medium text-gray-700">Preview tidak tersedia untuk Excel</p>
                  <p className="text-sm text-gray-400 mt-1">Format spreadsheet harus diunduh untuk dilihat</p>
                  <button
                    onClick={handleDownload}
                    className="mt-4 flex items-center gap-1.5 text-sm text-white bg-primary-600 hover:bg-primary-700 font-medium px-5 py-2.5 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download File Excel
                  </button>
                </div>
              ) : previewUrl ? (
                <object data={previewUrl} type="application/pdf" className="w-full h-full">
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FileText className="w-12 h-12 mb-2 text-gray-300" />
                    <button onClick={() => window.open(previewUrl, '_blank')} className="mt-2 text-sm text-primary-600 hover:underline">
                      Buka di Tab Baru
                    </button>
                  </div>
                </object>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
                  {previewError ? (
                    <>
                      <AlertCircle className="w-8 h-8 text-red-400" />
                      <p className="text-sm">{previewError}</p>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      <p className="text-sm">
                        {previewProgress?.total
                          ? `Mengunduh preview... ${(previewProgress.loaded / 1048576).toFixed(1)} / ${(previewProgress.total / 1048576).toFixed(1)} MB`
                          : 'Mengunduh preview...'}
                      </p>
                      {previewProgress?.total ? (
                        <div className="w-56 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (previewProgress.loaded / previewProgress.total) * 100)}%` }}
                          />
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Info + action — shrink-0 + scroll sendiri */}
            <div className="p-5 space-y-4 overflow-y-auto shrink-0 max-h-[280px]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Kategori</p>
                  <p className="font-medium mt-0.5">{modalDok.kategori}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Periode</p>
                  <p className="font-medium mt-0.5">{periodLabel(modalDok)}</p>
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

              {/* Edit Nilai Rekening Koran */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-emerald-800">Evaluasi Rekening Koran</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">
                      Saldo Akhir Rekening Koran (Rp)
                    </label>
                    <input
                      type="text"
                      value={editNilaiRek}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9,]/g, '');
                        const parts = val.split(',');
                        if (parts.length > 2) return;
                        const ribuan = parts[0].replace(/\./g, '');
                        const formatted = ribuan ? Number(ribuan).toLocaleString('id-ID') : '';
                        setEditNilaiRek(parts.length === 2 ? `${formatted},${parts[1]}` : formatted);
                      }}
                      placeholder="Kosong"
                      className="w-full px-3 py-2 text-sm border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">
                      Nilai Rekening Koran Excel (Rp)
                    </label>
                    <input
                      type="text"
                      value={editNilaiExcel}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9,]/g, '');
                        const parts = val.split(',');
                        if (parts.length > 2) return;
                        const ribuan = parts[0].replace(/\./g, '');
                        const formatted = ribuan ? Number(ribuan).toLocaleString('id-ID') : '';
                        setEditNilaiExcel(parts.length === 2 ? `${formatted},${parts[1]}` : formatted);
                      }}
                      placeholder="Kosong"
                      className="w-full px-3 py-2 text-sm border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Catatan sebelumnya */}
              {modalDok.catatan && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                  <p className="font-medium text-xs mb-1">Catatan sebelumnya:</p>
                  {modalDok.catatan}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Catatan <span className="text-red-500 font-normal text-xs">(wajib diisi jika mengembalikan revisi)</span>
                </label>
                <textarea
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  rows={2}
                  placeholder="Catatan untuk Satker (apa yang perlu diperbaiki)..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                {/* Tombol utama Pimpinan: Loloskan ke Eselon 1 */}
                <button
                  onClick={() => handleVerifikasi(modalDok.id, 'lolos')}
                  disabled={processing === modalDok.id}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {processing === modalDok.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />}
                  Loloskan ke Eselon 1
                </button>
                {/* Kembalikan revisi */}
                <button
                  onClick={() => handleVerifikasi(modalDok.id, 'reject')}
                  disabled={processing === modalDok.id || !catatan.trim()}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {processing === modalDok.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <XCircle className="w-4 h-4" />}
                  Kembalikan Revisi
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
      {/* Modal Edit Metadata */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Edit Metadata Dokumen</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Dokumen</label>
                <input
                  type="text"
                  required
                  value={editJudul}
                  onChange={e => setEditJudul(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  required
                  value={editKategoriId}
                  onChange={e => setEditKategoriId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Pilih Kategori...</option>
                  {kategoriList.map(k => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                <select
                  required
                  value={editTahun}
                  onChange={e => setEditTahun(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Pilih Tahun...</option>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Batal
                </button>
                <button type="submit" disabled={editLoading} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

