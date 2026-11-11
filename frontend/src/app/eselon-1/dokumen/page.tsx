'use client';
import toast from 'react-hot-toast';


import { useEffect, useState, useCallback } from 'react';
import { getSession } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import UploadModal from '@/components/Staff/UploadModal';
import {
  FileSearch, Loader2, RefreshCw, AlertCircle,
  CheckCircle, Undo2, Stamp, Hash, Eye, ExternalLink,
  FileText, Download, X, Plus
} from 'lucide-react';
import clsx from 'clsx';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

interface Dokumen {
  id: number;
  judul: string;
  tahun: number;
  bulan: number | null;
  semester: number | null;
  nomor_laporan: string | null;
  status: string;
  kategori: string;
  kategori_slug?: string;
  nama_bank?: string;
  nomor_rekening?: string;
  tanggal_surat?: string;
  nama_rekening?: string;
  nama_debitur?: string | null;
  dasar_temuan?: string | null;
  tenggat_waktu?: string | null;
  status_piutang?: 'belum_lunas' | 'proses_cicilan' | 'lunas' | string;
  sisa_hari_piutang?: number | null;
  aging_status?: 'lancar' | 'mendekati_jatuh_tempo' | 'lewat_jatuh_tempo' | 'lunas' | null;
  catatan: string | null;
  uploaded_by: string;
  uploaded_username?: string;
  no_satker?: number | string | null;
  satker_nama?: string | null;
  created_at: string;
  file_nama?: string;
  nilai_rekening_koran?: number | null;
  nilai_excel?: number | null;
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
  const { user } = useAuth();
  const isOperator = user?.role === 'operator' || user?.is_operator;

  const [list,     setList]     = useState<Dokumen[]>([]);
  const [menunggu, setMenunggu] = useState<Dokumen[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState(isOperator ? '' : 'lolos_admin');
  const [auditingId, setAuditingId] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

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
      if (!res.ok) throw new Error(json.detail || json.message);
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

  const handleAuditUlang = async (id: number) => {
    setAuditingId(id);
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/${id}/rescan`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Gagal audit ulang berkas');
      
      if (data.is_cocok === false || (data.selisih != null && data.selisih > 0)) {
        toast.error(
          data.message || `Audit total saldo akhir berbeda: terdapat selisih Rp ${Number(data.selisih).toLocaleString('id-ID')}`,
          { duration: 6000 }
        );
      } else {
        toast.success(data.message || 'Audit total saldo akhir sudah sesuai', {
          duration: 4000,
        });
      }
      await refresh();
      if (modalDok && modalDok.id === id) {
        setModalDok(prev => prev ? {
          ...prev,
          nilai_rekening_koran: data.data?.nilai_rekening_koran ?? prev.nilai_rekening_koran,
          nilai_excel: data.data?.nilai_excel ?? prev.nilai_excel
        } : null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat audit ulang');
    } finally {
      setAuditingId(null);
    }
  };

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
      if (!res.ok) throw new Error(json.detail || json.message);
      toast.success(
        target.aksi === 'approve'
          ? 'Dokumen berhasil disetujui & notifikasi telah dikirim ke Admin Satker!'
          : 'Dokumen dikembalikan untuk revisi & notifikasi telah dikirim ke Admin Satker'
      );
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isOperator ? 'Dokumen Satker Binaan' : 'Pengawasan & Audit Dokumen Satker'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isOperator
              ? 'Kelola, unggah berkas, dan pantau status dokumen dari seluruh Satker binaan'
              : 'Pantau dokumen satker binaan, verifikasi saldo akhir rekening bank, dan lakukan audit kepatuhan non-blocking'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filter}
            onChange={(e) => { setLoading(true); setFilter(e.target.value); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          {isOperator && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Unggah Dokumen
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* ── Antrian persetujuan final (Khusus Pimpinan Eselon 1) ── */}
      {!isOperator && (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="px-5 py-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Stamp className="w-4 h-4 text-blue-600" /> Pengawasan & Tinjauan Audit Dokumen Satker
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Dokumen yang telah disahkan Satker — Eselon 1 memantau kepatuhan saldo dan dapat meminta klarifikasi jika diperlukan
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
              {menunggu.map((dok) => {
                const valRek = dok.nilai_rekening_koran != null ? Number(dok.nilai_rekening_koran) : null;
                const valExc = dok.nilai_excel != null ? Number(dok.nilai_excel) : null;
                const hasBoth = valRek !== null && valExc !== null;
                const selisih = hasBoth ? Math.round(Math.abs(valRek - valExc) * 100) / 100 : null;
                const isCocok = hasBoth && selisih === 0;

                return (
                  <div key={dok.id} className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 truncate">{dok.judul}</p>
                        {dok.kategori_slug === 'surat-pembukaan-rekening-koran' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            Pengajuan Pembukaan Rekening
                          </span>
                        ) : dok.kategori_slug === 'surat-penutupan-rekening-koran' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Pengajuan Penutupan Rekening
                          </span>
                        ) : dok.kategori_slug === 'sk-piutang-satker' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            Pengajuan SK Piutang Satker (Bundel BPK)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            Disahkan Satker
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                        <span>{dok.kategori} · {periodeLabel(dok)}</span>
                        <span>·</span>
                        <span className="font-bold text-gray-800">{dok.satker_nama || 'Satker'}</span>
                        <span className="text-gray-400">({dok.uploaded_by})</span>
                        {dok.nomor_laporan && (
                          <span className="inline-flex items-center gap-1 ml-1 text-blue-600 font-mono">
                            <Hash className="w-3 h-3" />{dok.nomor_laporan}
                          </span>
                        )}
                      </p>
                      {(dok.nama_debitur || dok.dasar_temuan) && (
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-blue-900 flex-wrap">
                          <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-md font-medium">
                            Debitur: <strong>{dok.nama_debitur || '-'}</strong> • Dasar Temuan BPK/SKTJM: <strong className="font-mono">{dok.dasar_temuan || '-'}</strong>
                          </span>
                        </div>
                      )}
                      {dok.tenggat_waktu && (
                        <div className="flex items-center gap-2 mt-1.5 text-xs flex-wrap">
                          <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-md font-medium">
                            Jatuh Tempo: <strong>{new Date(dok.tenggat_waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                          </span>
                          {dok.status_piutang === 'lunas' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              ✓ Lunas
                            </span>
                          ) : dok.aging_status === 'lewat_jatuh_tempo' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                              ⚠ Lewat Jatuh Tempo ({Math.abs(dok.sisa_hari_piutang || 0)} hari)
                            </span>
                          ) : dok.aging_status === 'mendekati_jatuh_tempo' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              ⏱ Sisa {dok.sisa_hari_piutang} hari lagi
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ● Lancar (Sisa {dok.sisa_hari_piutang} hari)
                            </span>
                          )}
                        </div>
                      )}
                      {(dok.nama_bank || dok.nomor_rekening) && (
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-700 flex-wrap">
                          <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-md font-medium">
                            Bank: <strong>{dok.nama_bank || '-'}</strong> • No. Rek: <strong className="font-mono">{dok.nomor_rekening || '-'}</strong>
                          </span>
                          {dok.tanggal_surat && (
                            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
                              Tgl: {new Date(dok.tanggal_surat).toLocaleDateString('id-ID')}
                            </span>
                          )}
                        </div>
                      )}
                      {(valRek != null || valExc != null) && (
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 flex-wrap">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-md font-medium">
                            {dok.kategori_slug === 'sk-piutang-satker' ? 'Nominal Pokok Piutang:' : 'Saldo Bank:'} <strong className="text-emerald-950 font-bold">{formatRupiah(valRek || valExc)}</strong>
                          </span>
                        </div>
                      )}
                      {dok.catatan && (
                        <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-1.5 inline-block">
                          Catatan Pimpinan: {dok.catatan}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => handleAuditUlang(dok.id)}
                        disabled={auditingId === dok.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
                        title="Audit ulang berkas rekonsiliasi"
                      >
                        <RefreshCw className={clsx("w-3.5 h-3.5", auditingId === dok.id && "animate-spin")} />
                        {auditingId === dok.id ? 'Audit...' : 'Audit Ulang'}
                      </button>
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
                        <CheckCircle className="w-3.5 h-3.5" /> {dok.kategori_slug === 'sk-piutang-satker' ? 'Setujui SK Piutang' : 'Konfirmasi Audit'}
                      </button>
                      <button
                        onClick={() => { setTarget({ dok, aksi: 'reject' }); setCatatan(''); }}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
                      >
                        <Undo2 className="w-3.5 h-3.5" /> Minta Klarifikasi / Revisi
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tabel semua dokumen ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
                  <th className="px-5 py-3">Satker / Pengunggah</th>
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
                    <td className="px-5 py-3 text-gray-600">
                      <div>{dok.kategori}</div>
                      {dok.tenggat_waktu && (
                        <div className="mt-1">
                          {dok.status_piutang === 'lunas' ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              ✓ Lunas
                            </span>
                          ) : dok.aging_status === 'lewat_jatuh_tempo' ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse" title={`Jatuh tempo: ${dok.tenggat_waktu}`}>
                              ⚠ Lewat ({Math.abs(dok.sisa_hari_piutang || 0)} hr)
                            </span>
                          ) : dok.aging_status === 'mendekati_jatuh_tempo' ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200" title={`Jatuh tempo: ${dok.tenggat_waktu}`}>
                              ⏱ Sisa {dok.sisa_hari_piutang} hr
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200" title={`Jatuh tempo: ${dok.tenggat_waktu}`}>
                              ● Lancar ({dok.sisa_hari_piutang} hr)
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{periodeLabel(dok)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-xs truncate max-w-[220px]" title={dok.satker_nama || 'Satker'}>
                          {dok.satker_nama || (dok.no_satker ? `Satker ${dok.no_satker}` : '—')}
                        </span>
                        <span className="text-[11px] text-gray-500 mt-0.5">
                          {dok.uploaded_by || dok.uploaded_username || 'Staff'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs whitespace-nowrap">
                      {dok.nilai_rekening_koran != null || dok.nilai_excel != null ? (
                        <div className="space-y-1">
                          {dok.nilai_rekening_koran != null && (
                            <div className="text-emerald-700 font-semibold flex items-center gap-1">
                              <span className="text-[10px] text-gray-400 font-normal">Rek:</span> {formatRupiah(dok.nilai_rekening_koran)}
                            </div>
                          )}
                          {dok.nilai_excel != null && (
                            <div className="text-slate-600 flex items-center gap-1">
                              <span className="text-[10px] text-gray-400 font-normal">LPJ:</span> {formatRupiah(dok.nilai_excel)}
                            </div>
                          )}
                          {dok.nilai_rekening_koran != null && dok.nilai_excel != null && (
                            Math.abs(Number(dok.nilai_rekening_koran) - Number(dok.nilai_excel)) === 0 ? (
                              <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded">✓ Cocok</span>
                            ) : (
                              <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold text-rose-800 bg-rose-100 rounded">
                                ⚠ Selisih Rp {Math.abs(Number(dok.nilai_rekening_koran) - Number(dok.nilai_excel)).toLocaleString('id-ID')}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
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

      {/* ── Modal tinjau file (DIPERBESAR & LEBAR MAKSIMAL) ── */}
      {modalDok && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[92vh] max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header modal */}
            <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0 bg-white">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-extrabold text-slate-900 text-lg">Tinjau Dokumen</h3>
                  {modalDok.nomor_laporan && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
                      #{modalDok.nomor_laporan}
                    </span>
                  )}
                  <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", STATUS_BADGE[modalDok.status] || "bg-slate-100 text-slate-600")}>
                    {STATUS_LABEL[modalDok.status] || modalDok.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xl font-medium">
                  {modalDok.judul}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors border border-slate-200"
                  title="Unduh Berkas Asli"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh
                </button>
                {previewUrl && (
                  <button
                    onClick={() => window.open(previewUrl, '_blank')}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors border border-blue-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Tab Baru
                  </button>
                )}
                <button
                  onClick={() => setModalDok(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body modal: 2 Kolom (Kiri: Preview PDF Luas, Kanan: Hasil Rekonsiliasi & Aksi) */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
              {/* Kolom Kiri: Preview File Gede & Luas */}
              <div className="w-full lg:w-[65%] xl:w-[68%] h-full bg-slate-100 relative overflow-hidden flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200">
                {isExcel ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center bg-white m-6 rounded-2xl border border-slate-200 shadow-xs">
                    <FileText className="w-16 h-16 mb-3 text-emerald-400" />
                    <p className="font-bold text-slate-800 text-lg">Format Spreadsheet Excel</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      File spreadsheet tidak dapat ditampilkan via in-browser PDF reader. Silakan unduh untuk menelaah data rincian secara lengkap.
                    </p>
                    <button
                      onClick={handleDownload}
                      className="mt-5 flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                    >
                      <Download className="w-4 h-4" /> Download File Excel
                    </button>
                  </div>
                ) : previewUrl ? (
                  <object data={previewUrl} type="application/pdf" className="w-full h-full bg-slate-100">
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 p-6">
                      <p className="text-sm">Browser tidak mendukung preview PDF langsung.</p>
                      <button onClick={handleDownload} className="text-xs text-blue-600 underline font-bold">
                        Download file untuk membaca
                      </button>
                    </div>
                  </object>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 p-6">
                    {previewError ? (
                      <>
                        <AlertCircle className="w-8 h-8 text-rose-500" />
                        <p className="text-xs text-slate-700 font-medium text-center">{previewError}</p>
                        <button onClick={handleDownload} className="mt-2 text-xs font-bold text-blue-600 underline">
                          Unduh Dokumen Secara Manual
                        </button>
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-xs font-medium text-slate-600">
                          {previewProgress?.total
                            ? `Memuat berkas preview... ${(previewProgress.loaded / 1048576).toFixed(1)} / ${(previewProgress.total / 1048576).toFixed(1)} MB`
                            : 'Memuat berkas dokumen...'}
                        </p>
                        {previewProgress?.total ? (
                          <div className="w-56 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all"
                              style={{ width: `${Math.min(100, (previewProgress.loaded / previewProgress.total) * 100)}%` }}
                            />
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Kolom Kanan: Evaluasi, Rekonsiliasi & Keputusan */}
              <div className="w-full lg:w-[35%] xl:w-[32%] flex flex-col justify-between bg-white overflow-y-auto p-5 custom-scrollbar">
                <div className="space-y-4">
                  {/* Grid Metadata Dokumen */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Kategori</p>
                      <p className="font-bold text-slate-800 mt-0.5 truncate">{modalDok.kategori}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Periode</p>
                      <p className="font-bold text-slate-800 mt-0.5 truncate">{periodeLabel(modalDok)}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Nama Satker</p>
                      <p className="font-bold text-slate-800 mt-0.5 truncate text-xs" title={modalDok.satker_nama || 'Satker'}>
                        {modalDok.satker_nama || (modalDok.no_satker ? `Satker ${modalDok.no_satker}` : '—')}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Pengunggah: {modalDok.uploaded_by}
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Berkas</p>
                      <p className="font-bold text-slate-800 mt-0.5 truncate">{modalDok.file_nama ?? '—'}</p>
                    </div>
                  </div>

                  {/* Box Rekonsiliasi Otomatis */}
                  {(() => {
                    const valRek = modalDok.nilai_rekening_koran != null ? Number(modalDok.nilai_rekening_koran) : null;
                    const valExc = modalDok.nilai_excel != null ? Number(modalDok.nilai_excel) : null;
                    const hasBoth = valRek !== null && valExc !== null;
                    const selisih = hasBoth ? Math.round(Math.abs(valRek - valExc) * 100) / 100 : null;
                    const isCocok = hasBoth && selisih === 0;

                    return (
                      <div className={clsx(
                        "rounded-xl border p-4 shadow-xs",
                        hasBoth && isCocok ? "bg-emerald-50/70 border-emerald-200" : "bg-amber-50/70 border-amber-200"
                      )}>
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <Stamp className="w-4 h-4 text-blue-600" /> Hasil Rekonsiliasi
                          </span>
                          {hasBoth && (
                            isCocok ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle className="w-3 h-3 text-emerald-600" /> Cocok (Rp 0)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <AlertCircle className="w-3 h-3 text-rose-600" /> Selisih Rp {selisih?.toLocaleString('id-ID')}
                              </span>
                            )
                          )}
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Nilai Rekening Koran:</span>
                            <span className="font-extrabold text-slate-900">{formatRupiah(valRek)}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Realisasi LPJ / Excel:</span>
                            <span className="font-extrabold text-slate-900">{formatRupiah(valExc)}</span>
                          </div>
                          <div className={clsx(
                            "p-2.5 rounded-lg border flex justify-between items-center font-bold",
                            selisih === 0 ? "bg-emerald-100/60 border-emerald-200 text-emerald-900" : "bg-rose-100/60 border-rose-200 text-rose-900"
                          )}>
                            <span>Selisih Nominal:</span>
                            <span>{selisih !== null ? `Rp ${selisih.toLocaleString('id-ID')}` : '—'}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAuditUlang(modalDok.id)}
                          disabled={auditingId === modalDok.id}
                          className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
                        >
                          <RefreshCw className={clsx("w-3.5 h-3.5", auditingId === modalDok.id && "animate-spin")} />
                          {auditingId === modalDok.id ? 'Memindai Ulang...' : 'Audit Ulang Berkas (Re-check)'}
                        </button>
                      </div>
                    );
                  })()}

                  {/* Catatan Pimpinan Satker */}
                  {modalDok.catatan && (
                    <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="font-bold text-amber-900 mb-0.5">Catatan Pimpinan Satker:</p>
                      <p className="leading-relaxed whitespace-pre-wrap">{modalDok.catatan}</p>
                    </div>
                  )}
                </div>

                {/* Tombol Keputusan Pinned di Bawah (Hanya untuk Pimpinan Eselon 1) */}
                {!isOperator && modalDok.status === 'lolos_admin' && (
                  <div className="border-t border-slate-200 pt-4 mt-4 space-y-2 shrink-0">
                    <button
                      onClick={() => { setTarget({ dok: modalDok, aksi: 'approve' }); setCatatan(''); }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle className="w-4 h-4" /> Setujui & Publish Dokumen
                    </button>

                    <button
                      onClick={() => { setTarget({ dok: modalDok, aksi: 'reject' }); setCatatan(''); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
                    >
                      <Undo2 className="w-4 h-4" /> Kembalikan untuk Revisi
                    </button>
                  </div>
                )}
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
              target.dok.kategori_slug === 'surat-pembukaan-rekening-koran' ? (
                <div className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3 space-y-1">
                  <p className="font-bold">✨ Dampak Persetujuan Pembukaan Rekening:</p>
                  <p>Nomor rekening <b>{target.dok.nomor_rekening || '-'}</b> ({target.dok.nama_bank || 'Bank'}) akan <b>resmi terdaftar dan aktif</b> di Rekening Koran Satker {target.dok.satker_nama || ''}.</p>
                </div>
              ) : target.dok.kategori_slug === 'surat-penutupan-rekening-koran' ? (
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 space-y-1">
                  <p className="font-bold">⚠️ Dampak Persetujuan Penutupan Rekening:</p>
                  <p>Nomor rekening <b>{target.dok.nomor_rekening || '-'}</b> ({target.dok.nama_bank || 'Bank'}) akan <b>dinonaktifkan (Nonaktif)</b> dan dikeluarkan dari Total Saldo Aktif Bank Satker.</p>
                </div>
              ) : (
                <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mt-3">
                  Dokumen akan berstatus <b>Terverifikasi</b> dan langsung tampil di portal publik.
                </p>
              )
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
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Modal Upload Dokumen untuk Staff Eselon 1 */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          setShowUploadModal(false);
          refresh();
        }}
      />
    </div>
  );
}

