'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import {
  X,
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { getSession } from '@/lib/auth';

const API = typeof window !== 'undefined' && window.location.hostname
  ? `${window.location.protocol}//${window.location.hostname}:5000/api`
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');

interface UploadSkPiutangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadSkPiutangModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadSkPiutangModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [keterangan, setKeterangan] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [kategoriId, setKategoriId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ambil ID kategori sk-piutang-satker saat modal dibuka
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setKeterangan('');
      setError('');
      setSuccess(false);
      return;
    }

    async function fetchKategoriSk() {
      try {
        const session = getSession();
        const res = await fetch(`${API}/dokumen/kategori`, {
          headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const skKat = json.data.find((k: any) => k.slug === 'sk-piutang-satker');
          if (skKat) {
            setKategoriId(skKat.id);
          }
        }
      } catch (e) {
        console.error('Gagal mengambil kategori SK Piutang:', e);
      }
    }

    fetchKategoriSk();
  }, [isOpen]);

  if (!isOpen) return null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFilePick = (picked: File | null) => {
    if (!picked) return;
    const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = '.' + (picked.name.split('.').pop()?.toLowerCase() || '');
    if (!allowed.includes(ext)) {
      setError('Format file tidak didukung. Harap unggah berkas PDF atau Word.');
      return;
    }
    setError('');
    setFile(picked);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Silakan pilih berkas SK Piutang terlebih dahulu.');
      return;
    }
    if (!keterangan.trim()) {
      setError('Keterangan / uraian SK Piutang wajib diisi.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const session = getSession();
      if (!session?.token) {
        throw new Error('Sesi login telah berakhir, silakan login ulang.');
      }

      // Pastikan kategoriId tersedia (fallback id jika kategori belum termuat)
      let finalKategoriId = kategoriId;
      if (!finalKategoriId) {
        const resKat = await fetch(`${API}/dokumen/kategori`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        const katJson = await resKat.json();
        const found = katJson.data?.find((k: any) => k.slug === 'sk-piutang-satker');
        if (found) finalKategoriId = found.id;
      }

      if (!finalKategoriId) {
        throw new Error('Kategori SK Piutang Satker tidak ditemukan di server.');
      }

      const cleanKet = keterangan.trim();
      const shortDesc = cleanKet.length > 60 ? `${cleanKet.slice(0, 60)}...` : cleanKet;
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '');
      const judulDoc = `SK Piutang - ${shortDesc || cleanFileName}`;
      const tahunIni = new Date().getFullYear();
      const tglSurat = new Date().toISOString().split('T')[0];

      const fd = new FormData();
      fd.append('file', file);
      fd.append('judul', judulDoc);
      fd.append('tahun', String(tahunIni));
      fd.append('kategori_id', String(finalKategoriId));
      fd.append('deskripsi', cleanKet);
      fd.append('tanggal_surat', tglSurat);

      const res = await fetch(`${API}/dokumen/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
        body: fd,
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.detail || resJson.message || 'Gagal mengunggah SK Piutang.');
      }

      setSuccess(true);
      toast.success('SK Piutang berhasil diunggah & langsung dikirim ke Admin Eselon 1!');

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengunggah berkas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100 animate-slide-up">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-800">Unggah SK Piutang</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Admin Satker
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Berkas diteruskan langsung ke Admin Eselon 1 untuk diverifikasi
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">SK Piutang Terkirim!</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Berkas telah tercatat dan notifikasi telah dikirimkan ke Admin Eselon 1.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-3.5 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Upload Berkas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Upload Berkas SK Piutang <span className="text-rose-500">*</span>
                </label>

                {file ? (
                  <div className="flex items-center gap-3 bg-blue-50/80 border border-blue-200 rounded-xl p-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                      <p className="text-[11px] text-slate-500">{formatSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Ganti Berkas"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      handleFilePick(e.dataTransfer.files[0] ?? null);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={clsx(
                      "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                      dragging
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/60"
                    )}
                  >
                    <CloudUpload className={clsx("w-8 h-8 mx-auto mb-2", dragging ? "text-blue-600" : "text-slate-400")} />
                    <p className="text-xs font-bold text-slate-700">Tarik & lepas file ke sini</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">atau klik untuk memilih file</p>
                    <div className="mt-2.5">
                      <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-1 rounded-md">
                        PDF, DOC, DOCX (Maks 50MB)
                      </span>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFilePick(e.target.files?.[0] ?? null)}
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Keterangan / Uraian SK Piutang <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Tuliskan keterangan lengkap SK Piutang, nomor surat, pihak penanggung/debitur, atau catatan penting terkait..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none text-slate-800 placeholder:text-slate-400 leading-relaxed"
                />
              </div>

              {/* Info Tambahan */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-start gap-2 text-[11px] text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Dokumen SK Piutang akan langsung berstatus <strong>Menunggu Eselon 1</strong> tanpa melalui tahapan verifikasi staf/operator.
                </span>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !file || !keterangan.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl flex items-center gap-1.5 shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah SK Piutang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

