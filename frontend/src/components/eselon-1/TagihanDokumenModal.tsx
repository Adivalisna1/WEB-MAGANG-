'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Plus, Trash2, Send, Loader2, CheckCircle2, AlertCircle, FileText, BellRing, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { getClientApi, getSession } from '@/lib/auth';

export interface TagihanTarget {
  satker_id?: number | null;
  kode_satker?: string | null;
  target_user_id?: number | null;
  eselon_1_id?: number | null;
  nama_target: string;
  sub_label?: string;
}

interface KategoriItem {
  id: number;
  nama: string;
  slug: string;
}

interface DraftDokumenItem {
  key: string;
  kategori_id: number | '';
  judul_dokumen: string;
  tahun: number;
  periode: string;
  tenggat_waktu: string;
  catatan: string;
}

interface TagihanRow {
  id: number;
  kategori_id: number | null;
  kategori_nama: string | null;
  judul_dokumen: string;
  tahun: number;
  periode: string | null;
  tenggat_waktu: string | null;
  catatan: string | null;
  status: 'belum_diunggah' | 'sudah_diunggah';
  pengirim_nama: string | null;
  created_at: string;
}

interface TagihanDokumenModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: TagihanTarget | null;
}

export default function TagihanDokumenModal({ isOpen, onClose, target }: TagihanDokumenModalProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'status'>('form');
  const [kategoriList, setKategoriList] = useState<KategoriItem[]>([]);
  const [draftItems, setDraftItems] = useState<DraftDokumenItem[]>([]);
  const [tagihanList, setTagihanList] = useState<TagihanRow[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [sending, setSending] = useState(false);
  const [defaultTahun, setDefaultTahun] = useState<number>(new Date().getFullYear());
  const [defaultTenggat, setDefaultTenggat] = useState<string>('');
  const [defaultJudul, setDefaultJudul] = useState<string>('');
  const [defaultCatatan, setDefaultCatatan] = useState<string>('');

  const fetchKategori = useCallback(async () => {
    try {
      const api = getClientApi();
      const res = await fetch(`${api}/dokumen/kategori`);
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setKategoriList(json.data);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchStatusTagihan = useCallback(async () => {
    if (!target) return;
    setLoadingStatus(true);
    try {
      const session = getSession();
      const api = getClientApi();
      const params = new URLSearchParams();
      if (target.satker_id) params.set('satker_id', String(target.satker_id));
      if (target.target_user_id) params.set('target_user_id', String(target.target_user_id));

      const res = await fetch(`${api}/notifikasi/tagihan-dokumen?${params.toString()}`, {
        headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
      });
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setTagihanList(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingStatus(false);
    }
  }, [target]);

  useEffect(() => {
    if (isOpen && target) {
      setActiveTab('form');
      setDraftItems([]);
      setDefaultTenggat('');
      setDefaultJudul('');
      setDefaultCatatan('');
      fetchKategori();
      fetchStatusTagihan();
    }
  }, [isOpen, target, fetchKategori, fetchStatusTagihan]);

  if (!isOpen || !target) return null;

  const isCategoryChecked = (katId: number) =>
    draftItems.some((item) => item.kategori_id === katId && item.key.startsWith('kat-'));

  const toggleCategoryChecklist = (kat: KategoriItem) => {
    const key = `kat-${kat.id}`;
    if (isCategoryChecked(kat.id)) {
      setDraftItems((prev) => prev.filter((item) => item.key !== key));
    } else {
      const judul = defaultJudul.trim() ? `${defaultJudul.trim()} - ${kat.nama}` : kat.nama;
      setDraftItems((prev) => [
        ...prev,
        {
          key,
          kategori_id: kat.id,
          judul_dokumen: judul,
          tahun: defaultTahun,
          periode: '',
          tenggat_waktu: defaultTenggat,
          catatan: defaultCatatan,
        },
      ]);
    }
  };

  const addCustomRow = () => {
    setDraftItems((prev) => [
      ...prev,
      {
        key: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        kategori_id: kategoriList[0]?.id || '',
        judul_dokumen: defaultJudul.trim(),
        tahun: defaultTahun,
        periode: '',
        tenggat_waktu: defaultTenggat,
        catatan: defaultCatatan,
      },
    ]);
  };

  const updateRow = (key: string, field: keyof DraftDokumenItem, value: any) => {
    setDraftItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  };

  const removeRow = (key: string) => {
    setDraftItems((prev) => prev.filter((item) => item.key !== key));
  };

  const totalToSend =
    draftItems.length > 0 ? draftItems.length : defaultJudul.trim() ? 1 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let validItems = draftItems.filter((i) => i.judul_dokumen.trim() || i.kategori_id !== '');

    if (validItems.length === 0 && defaultJudul.trim()) {
      validItems = [
        {
          key: 'single-default',
          kategori_id: '',
          judul_dokumen: defaultJudul.trim(),
          tahun: defaultTahun,
          periode: '',
          tenggat_waktu: defaultTenggat,
          catatan: defaultCatatan,
        },
      ];
    }

    if (validItems.length === 0) {
      toast.error('Isi Judul Dokumen, centang kategori, atau tambah baris dokumen.');
      return;
    }

    setSending(true);
    try {
      const session = getSession();
      const api = getClientApi();
      const res = await fetch(`${api}/notifikasi/tagihan-dokumen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({
          satker_id: target.satker_id || null,
          kode_satker: target.kode_satker || null,
          target_user_id: target.target_user_id || null,
          eselon_1_id: target.eselon_1_id || null,
          items: validItems.map((i) => ({
            kategori_id: i.kategori_id === '' ? null : Number(i.kategori_id),
            judul_dokumen: i.judul_dokumen.trim(),
            tahun: Number(i.tahun) || defaultTahun,
            periode: i.periode.trim(),
            tenggat_waktu: i.tenggat_waktu || defaultTenggat || null,
            catatan: i.catatan.trim() || defaultCatatan.trim(),
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || json.message || 'Gagal mengirim pemberitahuan');
      toast.success(json.message || 'Pemberitahuan dokumen berhasil dikirim!');
      setDraftItems([]);
      setDefaultJudul('');
      await fetchStatusTagihan();
      setActiveTab('status');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim pemberitahuan');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteTagihan = async (id: number) => {
    try {
      const session = getSession();
      const api = getClientApi();
      const res = await fetch(`${api}/notifikasi/tagihan-dokumen/${id}`, {
        method: 'DELETE',
        headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Item pemberitahuan dihapus');
      fetchStatusTagihan();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus item');
    }
  };

  const belumCount = tagihanList.filter((t) => t.status === 'belum_diunggah').length;

  return (
    <div
      className="fixed inset-0 z-[1100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 mb-1">
              <BellRing className="w-3 h-3" />
              Pemberitahuan Kelengkapan Dokumen
            </span>
            <h3 className="font-bold text-slate-900 text-base leading-tight">
              {target.nama_target}
            </h3>
            {target.sub_label && (
              <p className="text-xs text-slate-500 mt-0.5">{target.sub_label}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-4 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={clsx(
              'pb-3 text-xs font-bold border-b-2 transition-colors',
              activeTab === 'form'
                ? 'border-[#1E90FF] text-[#1E90FF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            Kirim Pemberitahuan ({totalToSend} dipilih)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('status');
              fetchStatusTagihan();
            }}
            className={clsx(
              'pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5',
              activeTab === 'status'
                ? 'border-[#1E90FF] text-[#1E90FF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            Status Dokumen Diminta ({tagihanList.length})
            {belumCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700">
                {belumCount} Belum
              </span>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'form' ? (
            <form id="tagihan-dokumen-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Pengaturan Tahun, Tenggat Waktu, Judul Dokumen & Catatan (Terpisah) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tahun Anggaran
                  </label>
                  <input
                    type="number"
                    value={defaultTahun}
                    onChange={(e) => setDefaultTahun(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tenggat Waktu (Opsional)
                  </label>
                  <input
                    type="date"
                    value={defaultTenggat}
                    onChange={(e) => setDefaultTenggat(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Judul Dokumen (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rek. Koran BRI Bulan Oktober 2026"
                    value={defaultJudul}
                    onChange={(e) => setDefaultJudul(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Catatan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Mohon pastikan berkas sudah ditandatangani KPA"
                    value={defaultCatatan}
                    onChange={(e) => setDefaultCatatan(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Pilih Cepat Multi-Kategori */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    1. Pilih Banyak Sekaligus (Berdasarkan Kategori Dokumen)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Klik untuk centang 1 atau lebih
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {kategoriList.map((kat) => {
                    const checked = isCategoryChecked(kat.id);
                    return (
                      <label
                        key={kat.id}
                        className={clsx(
                          'flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all',
                          checked
                            ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCategoryChecklist(kat)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{kat.nama}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Daftar Dokumen Terpilih / Custom 1 per 1 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    2. Rincian Dokumen yang Akan Dikirim ({draftItems.length})
                  </label>
                  <button
                    type="button"
                    onClick={addCustomRow}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Baris 1 per 1
                  </button>
                </div>

                {draftItems.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    {defaultJudul.trim()
                      ? `Judul "${defaultJudul.trim()}" siap dikirim langsung, atau centang kategori / klik Tambah Baris 1 per 1 untuk menambah lebih banyak.`
                      : 'Belum ada dokumen yang dipilih. Isi Judul Dokumen di atas, centang kategori, atau klik Tambah Baris 1 per 1.'}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {draftItems.map((item, idx) => (
                      <div
                        key={item.key}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-500">
                            Dokumen #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeRow(item.key)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-4">
                            <select
                              value={item.kategori_id}
                              onChange={(e) =>
                                updateRow(
                                  item.key,
                                  'kategori_id',
                                  e.target.value ? Number(e.target.value) : ''
                                )
                              }
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                            >
                              <option value="">-- Kategori --</option>
                              {kategoriList.map((k) => (
                                <option key={k.id} value={k.id}>
                                  {k.nama}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-5">
                            <input
                              type="text"
                              placeholder="Judul Dokumen..."
                              value={item.judul_dokumen}
                              onChange={(e) => updateRow(item.key, 'judul_dokumen', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                              required
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <input
                              type="text"
                              placeholder="Periode (mis. Okt 2026)"
                              value={item.periode}
                              onChange={(e) => updateRow(item.key, 'periode', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-2.5">
              {loadingStatus ? (
                <div className="py-12 flex items-center justify-center text-slate-400 gap-2 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  Memuat status kelengkapan dokumen...
                </div>
              ) : tagihanList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Belum ada pemberitahuan dokumen yang dikirim ke satker/user ini.
                </div>
              ) : (
                tagihanList.map((t) => {
                  const isDone = t.status === 'sudah_diunggah';
                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex items-start gap-2.5">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {t.judul_dokumen}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {t.kategori_nama || 'Umum'} &bull; Tahun {t.tahun}
                            {t.periode ? ` (${t.periode})` : ''}
                          </p>
                          {t.tenggat_waktu && (
                            <p className="text-[11px] text-rose-700 font-semibold mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Tenggat Waktu: {new Date(t.tenggat_waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          )}
                          {t.catatan && (
                            <p className="text-[11px] text-amber-700 mt-0.5">
                              Catatan: {t.catatan}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={clsx(
                            'px-2.5 py-1 rounded-md text-[11px] font-bold border flex items-center gap-1',
                            isDone
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          )}
                        >
                          {isDone ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Sudah Diunggah
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" />
                              Belum Diunggah
                            </>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTagihan(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Hapus pemberitahuan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            Tutup
          </button>
          {activeTab === 'form' && (
            <button
              type="submit"
              form="tagihan-dokumen-form"
              disabled={sending || totalToSend === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1E90FF] hover:bg-blue-600 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Kirim Pemberitahuan ({totalToSend})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
