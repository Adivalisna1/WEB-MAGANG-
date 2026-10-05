'use client';

import toast from 'react-hot-toast';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { getSession } from '@/lib/auth';
import {
  FileText, CheckCircle, XCircle, Clock,
  Loader2, RefreshCw, AlertCircle, Eye, ExternalLink, Trash2, Download,
  Send, X, Search, FileCheck, FileSpreadsheet,
  ChevronLeft, ChevronRight, Minimize2, Maximize2, Printer
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

export default function PimpinanDokumenPage() {
  const [dokumenList, setDokumenList] = useState<Dokumen[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [processing,  setProcessing]  = useState<number | null>(null);
  
  const [selectedDok, setSelectedDok] = useState<Dokumen | null>(null);
  const [catatan,     setCatatan]     = useState('');
  const [editNilaiRek, setEditNilaiRek] = useState('');
  const [editNilaiExcel, setEditNilaiExcel] = useState('');
  
  const [previewUrl,  setPreviewUrl]  = useState<string | null>(null);
  const [previewProgress, setPreviewProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [previewError,    setPreviewError]    = useState('');
  const [pageNumber, setPageNumber] = useState(1);

  const isPdf   = selectedDok ? /\.pdf$/i.test(selectedDok.file_nama) : false;
  const isExcel = selectedDok ? /\.(xls|xlsx)$/i.test(selectedDok.file_nama) : false;
  const isPreviewable = isPdf || (!isExcel); 

  useEffect(() => {
    if (!selectedDok) {
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
      setPreviewProgress(null);
      setPreviewError('');
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const session = getSession();

    if (isExcel) {
      setPreviewProgress(null);
      setPreviewError('');
      return;
    }

    async function loadPreview() {
      setPreviewProgress({ loaded: 0, total: 0 });
      setPreviewError('');
      try {
        const res = await fetch(`${API}/dokumen/${selectedDok!.id}/preview`, {
          headers: { Authorization: `Bearer ${session?.token}` },
          signal: controller.signal,
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          if (!cancelled) setPreviewError(`Gagal memuat: ${res.status} ${res.statusText} ${errText ? '- ' + errText : ''}`);
          return;
        }

        const reader = res.body?.getReader();
        const contentLength = +(res.headers.get('Content-Length') || 0);
        let loaded = 0;
        const chunks: Uint8Array[] = [];

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              loaded += value.length;
              if (!cancelled) setPreviewProgress({ loaded, total: contentLength });
            }
          }
        }
        
        const finalBlob = new Blob(chunks as unknown as BlobPart[], { type: res.headers.get('Content-Type') || 'application/pdf' });
        if (!cancelled) {
          setPreviewProgress({ loaded, total: contentLength || loaded });
          setTimeout(() => {
            if (!cancelled) {
              setPreviewUrl(prev => {
                if (prev) URL.revokeObjectURL(prev);
                return URL.createObjectURL(finalBlob);
              });
              setPreviewProgress(null);
            }
          }, 500);
        }
      } catch (err: any) {
        if (!cancelled && !controller.signal.aborted) setPreviewError(`Error koneksi: ${err.message}`);
      }
    }
    loadPreview();
    return () => { cancelled = true; controller.abort(); };
  }, [selectedDok]); 

  const handleDownload = () => {
    if (!selectedDok) return;
    const session = getSession();
    window.open(`${API}/dokumen/${selectedDok.id}/download?token=${session?.token}`, '_blank');
  };

  const fetchDokumen = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const session = getSession();
      // Hanya ambil dokumen yang berstatus menunggu_verifikasi
      const res = await fetch(`${API}/dokumen/all?status=menunggu_verifikasi&limit=100`, {
        headers: { Authorization: `Bearer ${session?.token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal memuat data');
      setDokumenList(json.data);
      if (json.data.length > 0 && !selectedDok) {
        handleSelect(json.data[0]);
      } else if (json.data.length === 0) {
        setSelectedDok(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDok]);

  useEffect(() => { fetchDokumen(); }, []); 

  const filteredDocs = useMemo(() => {
    if (!search) return dokumenList;
    return dokumenList.filter(d => 
      d.judul.toLowerCase().includes(search.toLowerCase()) || 
      d.kategori.toLowerCase().includes(search.toLowerCase()) ||
      d.file_nama.toLowerCase().includes(search.toLowerCase())
    );
  }, [dokumenList, search]);

  const handleSelect = (dok: Dokumen) => {
    setSelectedDok(dok);
    setCatatan('');
    setEditNilaiRek(dok.nilai_rekening_koran != null ? Number(dok.nilai_rekening_koran).toLocaleString('id-ID') : '');
    setEditNilaiExcel(dok.nilai_excel != null ? Number(dok.nilai_excel).toLocaleString('id-ID') : '');
  };

  const handleVerifikasi = async (id: number, action: 'lolos' | 'reject') => {
    if (action === 'reject' && !catatan.trim()) {
      toast.error('Catatan wajib diisi jika revisi');
      return;
    }

    setProcessing(id);
    try {
      const session = getSession();
      const numRek = editNilaiRek ? Number(editNilaiRek.replace(/\./g, '').replace(/,/g, '.')) : null;
      const numExcel = editNilaiExcel ? Number(editNilaiExcel.replace(/\./g, '').replace(/,/g, '.')) : null;

      const bodyData: any = {
        aksi: action, 
        catatan,
        nilai_rekening_koran: isNaN(numRek as any) ? null : numRek,
        nilai_excel: isNaN(numExcel as any) ? null : numExcel,
      };

      const res = await fetch(`${API}/dokumen/${id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`
        },
        body: JSON.stringify(bodyData)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      
      toast.success(action === 'lolos' ? 'Berhasil lolos ke Eselon 1' : 'Dikembalikan ke Staff untuk direvisi');
      setSelectedDok(null);
      fetchDokumen();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
      
      {/* Header Halaman */}
      <div className="flex justify-between items-end mb-6 shrink-0 mt-2">
        <div>
          <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-1">Workspace Validasi</p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verifikasi Dokumen</h1>
          <p className="text-slate-500 mt-1">Tinjau pengajuan dokumen dari Staff sebelum diteruskan ke Eselon 1.</p>
        </div>
        <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-full font-medium text-sm border border-amber-200 flex items-center gap-2 shadow-sm">
          <Clock className="w-4 h-4" />
          {dokumenList.length} dokumen menunggu
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Panel Kiri: List Dokumen */}
        <div className="w-[380px] bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm shrink-0">
          <div className="p-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                Antrean Staff
                <span className="bg-primary-100 text-primary-700 text-xs py-0.5 px-2 rounded-full">{filteredDocs.length}</span>
              </h2>
              <button className="text-slate-400 hover:text-slate-700 p-1">
                <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} onClick={fetchDokumen} />
              </button>
            </div>
            
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari dokumen..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
            ) : filteredDocs.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">Tidak ada dokumen menunggu verifikasi</div>
            ) : (
              filteredDocs.map(dok => {
                const isActive = selectedDok?.id === dok.id;
                return (
                  <button
                    key={dok.id}
                    onClick={() => handleSelect(dok)}
                    className={clsx(
                      "w-full text-left p-4 rounded-xl border-2 transition-all flex flex-col gap-2 relative overflow-hidden",
                      isActive 
                        ? "border-primary-200 bg-primary-50 shadow-sm" 
                        : "border-transparent hover:bg-slate-50 hover:border-slate-100"
                    )}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600"></div>}
                    <div className="flex justify-between items-start w-full">
                      <p className={clsx("font-bold truncate pr-2 text-sm", isActive ? "text-primary-900" : "text-slate-700")}>
                        {dok.judul}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded flex items-center shrink-0">
                        Menunggu
                      </span>
                    </div>
                    <div className="flex justify-between items-center w-full text-xs">
                      <p className="text-slate-500 truncate">{dok.kategori}</p>
                      <div className="flex items-center gap-1 text-slate-400 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(dok.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Panel Kanan: Preview & Form (Hanya render jika ada selectedDok) */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent rounded-2xl gap-4 overflow-y-auto pb-4 pr-1">
          
          {selectedDok ? (
            <>
              {/* Box Preview */}
              <div className="flex-1 min-h-[400px] bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm relative">
                
                {/* Header Preview */}
                <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Live Preview</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[300px]">
                        {selectedDok.file_nama} &bull; {(selectedDok.file_size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-2 mr-2">
                      <button className="hover:text-slate-700"><ChevronLeft className="w-4 h-4" /></button>
                      <span className="text-xs font-medium">1 / 1</span>
                      <button className="hover:text-slate-700"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <button className="hover:text-slate-700"><Search className="w-4 h-4" /></button>
                    <span className="text-xs font-medium">100%</span>
                    <button onClick={handleDownload} className="hover:text-slate-700" title="Unduh">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="hover:text-slate-700"><Printer className="w-4 h-4" /></button>
                    <button onClick={() => previewUrl && window.open(previewUrl, '_blank')} className="hover:text-slate-700" title="Perbesar / Tab Baru"><Maximize2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Konten Preview */}
                <div className="flex-1 bg-slate-100/50 relative overflow-hidden flex items-center justify-center p-6">
                  {isExcel ? (
                     <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-white p-8 rounded-xl border border-slate-200 shadow-sm w-full max-w-md text-center">
                       <FileSpreadsheet className="w-16 h-16 mb-4 text-emerald-400" />
                       <p className="font-bold text-slate-700 text-lg">Format Excel Tidak Mendukung Live Preview</p>
                       <p className="text-sm text-slate-500 mt-2 mb-6">Silakan unduh file untuk melihat data di dalamnya.</p>
                       <button
                         onClick={handleDownload}
                         className="flex items-center gap-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 font-medium px-6 py-3 rounded-xl transition-colors shadow-sm mx-auto"
                       >
                         <Download className="w-4 h-4" /> Unduh File Excel
                       </button>
                     </div>
                  ) : previewUrl ? (
                    <object data={previewUrl} type="application/pdf" className="w-full h-full bg-white shadow-sm border border-slate-200 rounded-sm">
                      <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <FileText className="w-12 h-12 mb-2 text-slate-300" />
                        <button onClick={() => window.open(previewUrl, '_blank')} className="mt-2 text-sm text-primary-600 hover:underline font-medium">
                          Buka di Tab Baru
                        </button>
                      </div>
                    </object>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
                      {previewError ? (
                        <>
                          <AlertCircle className="w-8 h-8 text-rose-400" />
                          <p className="text-sm font-medium text-slate-700">{previewError}</p>
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                          <p className="text-sm font-medium">
                            {previewProgress?.total
                              ? `Memuat preview... ${(previewProgress.loaded / 1048576).toFixed(1)} / ${(previewProgress.total / 1048576).toFixed(1)} MB`
                              : 'Memuat preview...'}
                          </p>
                          {previewProgress?.total ? (
                            <div className="w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                              <div
                                className="h-full bg-primary-500 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (previewProgress.loaded / previewProgress.total) * 100)}%` }}
                              />
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Box Form Evaluasi */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shrink-0">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-primary-600" /> Evaluation
                  </h3>
                  <span className="text-xs text-slate-400">Confirm figures against the attached report</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Approved Budget Nominal
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-slate-500 font-medium">Rp</span>
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
                        placeholder="0"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-semibold rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-left"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Reported Realization Nominal
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-slate-500 font-medium">Rp</span>
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
                        placeholder="0"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-semibold rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-left"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-bold text-slate-700">Revision Notes</label>
                    <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Required when rejecting</span>
                  </div>
                  <textarea
                    value={catatan}
                    onChange={e => setCatatan(e.target.value)}
                    rows={2}
                    placeholder="Tambahkan catatan revisi yang jelas untuk Staff, sebutkan halaman atau perbedaan nominal..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleVerifikasi(selectedDok.id, 'reject')}
                    disabled={processing === selectedDok.id || !catatan.trim()}
                    className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-rose-200"
                  >
                    {processing === selectedDok.id
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <X className="w-5 h-5" />}
                    Tolak & Kembalikan
                  </button>
                  <button
                    onClick={() => handleVerifikasi(selectedDok.id, 'lolos')}
                    disabled={processing === selectedDok.id}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    {processing === selectedDok.id
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <CheckCircle className="w-5 h-5" />}
                    Setujui & Kirim ke Eselon 1
                  </button>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 bg-slate-50/50 border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-400 p-6">
              <FileCheck className="w-16 h-16 mb-4 text-slate-300" />
              <p className="font-bold text-slate-600 text-lg">Tidak Ada Dokumen yang Dipilih</p>
              <p className="text-sm mt-1 max-w-sm text-center">Pilih dokumen dari antrean di sebelah kiri untuk melihat preview dan mengevaluasi data.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}