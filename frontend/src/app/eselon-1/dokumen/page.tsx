'use client';
import toast from 'react-hot-toast';


import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth';
import {
  FileSearch, Loader2, RefreshCw, AlertCircle,
  CheckCircle, Undo2, Stamp, Hash, Eye, ExternalLink,
  FileText, Download
} from 'lucide-react';
import clsx from 'clsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Dokumen {
  id: number;
  judul: string;
  tahun: number;
  bulan: number | null;
  semester: number | null;
  nomor_laporan: string | null;
  status: string;
  kategori: string;
  catatan: string | null;
  uploaded_by: string;
  created_at: string;
  file_nama?: string;
  nilai_rekening_koran?: number | null;
}

const STATUS_BADGE: Record<string, string> = {
  terverifikasi:       'bg-green-100 text-green-700',
  menunggu_verifikasi: 'bg-amber-100 text-amber-700',
  lolos_admin:         'bg-blue-100 text-blue-700',
  revisi:              'bg-orange-100 text-orange-700',
  draft:               'bg-gray-100 text-gray-600',
};
const STATUS_LABEL: Record<string, string> = {
  terverifikasi:       'Terverifikasi',
  menunggu_verifikasi: 'Menunggu Verifikasi',
  lolos_admin:         'Menunggu Eselon 1',
  revisi:              'Revisi',
  draft:               'Draft',
};

const NAMA_BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function periodeLabel(dok: Dokumen): string {
  if (dok.semester) return `Semester ${dok.semester} ${dok.tahun}`;
  if (dok.bulan) return `${NAMA_BULAN[dok.bulan - 1]} ${dok.tahun}`;
  return String(dok.tahun);
}

function formatRupiah(val: number | null | undefined): string {
  if (val == null) return '—';
  const rounded = Math.round(val * 100) / 100;
  const [int, dec] = rounded.toString().split('.');
  const ribuan = Number(int).toLocaleString('id-ID');
  return dec && dec !== '00' ? `Rp ${ribuan},${dec.padEnd(2, '0')}` : `Rp ${ribuan}`;
}

export default function KetuaDokumenPage() {
  const [list,     setList]     = useState<Dokumen[]>([]);
  const [menunggu, setMenunggu] = useState<Dokumen[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState('lolos_admin');

  // Modal keputusan approve / reject
  const [target,   setTarget]   = useState<{ dok: Dokumen; aksi: 'approve' | 'reject' } | null>(null);
  const [catatan,  setCatatan]  = useState('');
  const [sending,  setSending]  = useState(false);

  // Modal tinjau file (preview PDF / download non-PDF)
  const [modalDok,   setModalDok]   = useState<Dokumen | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewProgress, setPreviewProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [previewError,    setPreviewError]    = useState('');

  // Backend konversi Word → PDF via LibreOffice. Excel tetap download (layout sering berantakan).
  const isPdf   = modalDok ? /\.pdf$/i.test(modalDok.file_nama || '') : false;
  const isExcel = modalDok ? /\.(xls|xlsx)$/i.test(modalDok.file_nama || '') : false;

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
    a.download = modalDok.file_nama || 'file';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const fetchDokumen = useCallback(async () => {
    try {
      const session = getSession();
      const res = await fetch(`${API}/eselon-1/dokumen?status=${filter}&limit=200`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setList(json.data);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Gagal memuat dokumen');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchMenunggu = useCallback(async () => {
    try {
      const session = getSession();
      const res = await fetch(`${API}/eselon-1/dokumen/menunggu`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (res.ok) setMenunggu(json.data ?? []);
    } catch {
      // Antrian persetujuan tidak fatal kalau gagal dimuat
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchDokumen(), fetchMenunggu()]);
  }, [fetchDokumen, fetchMenunggu]);

  useEffect(() => { refresh(); }, [refresh]);

  const kirimKeputusan = async () => {
    if (!target) return;
    if (target.aksi === 'reject' && !catatan.trim()) {
      toast.error('Catatan wajib diisi saat mengembalikan untuk revisi');
      return;
    }
    setSending(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/${target.dok.id}/eselon-1-verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ aksi: target.aksi, catatan: catatan.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setTarget(null);
      setModalDok(null);
      setCatatan('');
      await refresh();
    } catch (e: any) {
      toast.error(e.message || 'Gagal memproses keputusan');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitor Dokumen</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau status verifikasi semua dokumen dan setujui dokumen yang sudah lolos Pimpinan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => { setLoading(true); setFilter(e.target.value); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Semua Status</option>
            <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
            <option value="lolos_admin">Menunggu Eselon 1</option>
            <option value="terverifikasi">Terverifikasi</option>
            <option value="revisi">Revisi</option>
            <option value="draft">Draft</option>
          </select>
          <button
            onClick={() => { setLoading(true); refresh(); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* ── Antrian persetujuan final (lolos_Pimpinan) ── */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
        <div className="px-5 py-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Stamp className="w-4 h-4 text-blue-600" /> Menunggu Persetujuan Saya
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Dokumen yang sudah lolos penyaringan Pimpinan — persetujuan final ada di Eselon 1
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
            {menunggu.length}
          </span>
        </div>
        {!menunggu.length ? (
          <p className="py-8 text-center text-sm text-gray-400">
            Tidak ada dokumen yang menunggu persetujuan
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {menunggu.map((dok) => (
              <div key={dok.id} className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{dok.judul}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {dok.kategori} · {periodeLabel(dok)} · oleh {dok.uploaded_by}
                    {dok.nomor_laporan && (
                      <span className="inline-flex items-center gap-1 ml-2 text-indigo-600">
                        <Hash className="w-3 h-3" />{dok.nomor_laporan}
                      </span>
                    )}
                  </p>
                  {dok.catatan && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-1.5 inline-block">
                      Catatan Pimpinan: {dok.catatan}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setModalDok(dok)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Tinjau
                  </button>
                  <button
                    onClick={() => { setTarget({ dok, aksi: 'approve' }); setCatatan(''); }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Setujui & Publish
                  </button>
                  <button
                    onClick={() => { setTarget({ dok, aksi: 'reject' }); setCatatan(''); }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
                  >
                    <Undo2 className="w-3.5 h-3.5" /> Kembalikan Revisi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabel semua dokumen ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <th className="px-5 py-3">Judul</th>
                  <th className="px-5 py-3">Kode</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Periode</th>
                  <th className="px-5 py-3">Diupload Oleh</th>
                  <th className="px-5 py-3">Nilai</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Tanggal Upload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((dok) => (
                  <tr key={dok.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900 max-w-xs truncate">{dok.judul}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {dok.nomor_laporan ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{dok.kategori}</td>
                    <td className="px-5 py-3 text-gray-600">{periodeLabel(dok)}</td>
                    <td className="px-5 py-3 text-gray-600">{dok.uploaded_by}</td>
                    <td className="px-5 py-3 text-xs font-medium whitespace-nowrap">
                      {dok.nilai_rekening_koran != null
                        ? <span className="text-emerald-700 font-semibold">{formatRupiah(dok.nilai_rekening_koran)}</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-5 py-3">
                      <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium', STATUS_BADGE[dok.status] || 'bg-gray-100')}>
                        {STATUS_LABEL[dok.status] ?? dok.status}
                      </span>
                      {dok.catatan && (dok.status === 'revisi' || dok.status === 'lolos_Pimpinan') && (
                        <p className="text-xs text-gray-400 mt-1 max-w-[16rem] truncate" title={dok.catatan}>
                          {dok.catatan}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(dok.created_at).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length && (
              <div className="py-16 text-center text-gray-400">
                <FileSearch className="w-10 h-10 mx-auto mb-2 opacity-40" />
                Tidak ada dokumen
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal tinjau file ── */}
      {modalDok && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header modal — shrink-0 */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-lg">Tinjau Dokumen</h3>
                <p className="text-sm text-gray-500 mt-0.5 truncate">{modalDok.judul}</p>
                {modalDok.nomor_laporan && (
                  <p className="text-xs text-gray-400 font-mono mt-0.5">#{modalDok.nomor_laporan}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {previewUrl && (
                  <button
                    onClick={() => window.open(previewUrl, '_blank')}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Tab Baru
                  </button>
                )}
                <button
                  onClick={() => setModalDok(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2"
                  aria-label="Tutup"
                >
                  ×
                </button>
              </div>
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
                    className="mt-4 flex items-center gap-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 font-medium px-5 py-2.5 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download File Excel
                  </button>
                </div>
              ) : previewUrl ? (
                <object data={previewUrl} type="application/pdf" className="w-full h-full">
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p>Browser tidak bisa menampilkan PDF.</p>
                    <button onClick={handleDownload} className="mt-3 text-indigo-600 underline">Download file</button>
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
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
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

            {/* Info + aksi keputusan dari modal tinjau */}
            <div className="px-6 py-4 space-y-3 shrink-0 overflow-y-auto max-h-[280px]">
              {/* Info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Kategori</p>
                  <p className="font-medium mt-0.5">{modalDok.kategori}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Periode</p>
                  <p className="font-medium mt-0.5">{periodeLabel(modalDok)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Diupload oleh</p>
                  <p className="font-medium mt-0.5">{modalDok.uploaded_by}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">File</p>
                  <p className="font-medium mt-0.5 truncate">{modalDok.file_nama ?? '—'}</p>
                </div>
                {modalDok.nilai_rekening_koran != null && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 col-span-2 sm:col-span-4">
                    <p className="text-xs text-emerald-600 font-medium">Saldo Akhir</p>
                    <p className="font-bold text-emerald-800 mt-0.5 text-base">{formatRupiah(modalDok.nilai_rekening_koran)}</p>
                  </div>
                )}
              </div>

              {/* Catatan Pimpinan */}
              {modalDok.catatan && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  Catatan Pimpinan: {modalDok.catatan}
                </p>
              )}

              {/* Tombol aksi */}
              <div className="flex items-center justify-end gap-2 flex-wrap pt-1">
                <button
                  onClick={() => { setTarget({ dok: modalDok, aksi: 'reject' }); setCatatan(''); }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
                >
                  <Undo2 className="w-4 h-4" /> Kembalikan Revisi
                </button>
                <button
                  onClick={() => { setTarget({ dok: modalDok, aksi: 'approve' }); setCatatan(''); }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Setujui & Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal keputusan ── */}
      {target && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900">
              {target.aksi === 'approve' ? 'Setujui & Publish Dokumen' : 'Kembalikan untuk Revisi'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {target.dok.judul} — oleh {target.dok.uploaded_by}
            </p>
            {target.aksi === 'approve' ? (
              <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mt-3">
                Dokumen akan berstatus <b>Terverifikasi</b> dan langsung tampil di portal publik.
              </p>
            ) : (
              <p className="text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 mt-3">
                Dokumen dikembalikan ke Satker untuk diperbaiki. Catatan di bawah akan dilihat Satker.
              </p>
            )}
            <label className="block text-xs font-medium text-gray-600 mt-4 mb-1">
              Catatan {target.aksi === 'approve' ? '(opsional)' : '(wajib)'}
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder={target.aksi === 'approve' ? 'Tambahkan catatan jika perlu...' : 'Jelaskan apa yang perlu direvisi...'}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setTarget(null)}
                disabled={sending}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={kirimKeputusan}
                disabled={sending}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50',
                  target.aksi === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'
                )}
              >
                {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                {target.aksi === 'approve' ? 'Setujui & Publish' : 'Kembalikan Revisi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

