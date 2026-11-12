"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSession } from "@/lib/auth";
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Layers,
  Calculator,
  Search,
  Lock,
  Globe,
  Building2,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  X,
  FileSpreadsheet
} from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

const API = typeof window !== "undefined" && window.location.hostname
  ? `${window.location.protocol}//${window.location.hostname}:5000/api`
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

export interface MasterAkun {
  id: number;
  kode_akun: string;
  nama_akun: string;
  tipe_akun: "A" | "L" | "O" | "R" | "E";
  kategori_nama: string;
  normal_balance: string;
}

export interface RumusItem {
  akun_id: number;
  operator: "tambah" | "kurang";
  urutan: number;
  kode_akun?: string;
  nama_akun?: string;
  tipe_akun?: string;
}

export interface RumusSeksi {
  id?: number;
  nama_seksi: string;
  tipe_akun_filter: "A" | "L" | "O" | "R" | "E" | "ALL";
  tipe_subtotal?: "subtotal" | "total";
  urutan: number;
  items: RumusItem[];
}

export interface RumusDetail {
  id?: number;
  nama_rumus: string;
  deskripsi?: string;
  scope: "universal" | "eselon_1";
  eselon_1_id?: number | null;
  is_locked?: boolean | number;
  seksi_list: RumusSeksi[];
}

interface RumusBuilderProps {
  initialRumusId?: number | null;
  isITRole?: boolean;
  userEselonId?: number | null;
  userEselonNama?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TIPE_OPTIONS = [
  { value: "ALL", label: "Semua Kategori (Fleksibel)", badge: "bg-slate-100 text-slate-700" },
  { value: "A", label: "Tipe A - Aset (Kas, Piutang, Penyusutan)", badge: "bg-blue-50 text-blue-700" },
  { value: "L", label: "Tipe L - Liabilitas (Utang & Titipan)", badge: "bg-amber-50 text-amber-700" },
  { value: "O", label: "Tipe O - Ekuitas (Modal Bersih / SAL)", badge: "bg-purple-50 text-purple-700" },
  { value: "R", label: "Tipe R - Pendapatan (PNBP, Pajak, Hibah)", badge: "bg-emerald-50 text-emerald-700" },
  { value: "E", label: "Tipe E - Beban & Belanja (Barang, Modal)", badge: "bg-rose-50 text-rose-700" },
];

export function getAkunBasisClassification(kodeAkun: string = "") {
  const code = String(kodeAkun || "").trim();
  const firstDigit = code.charAt(0);
  if (firstDigit === "4") return { basis: "KAS", label: "Kas Murni (LRA)", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (firstDigit === "5") return { basis: "KAS", label: "Kas Murni (Belanja)", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (firstDigit === "7" || firstDigit === "8") return { basis: "AKRUAL", label: "Akrual Murni (LO)", badge: "bg-purple-50 text-purple-700 border-purple-200" };
  if (firstDigit === "2" || firstDigit === "3") return { basis: "AKRUAL", label: "Akrual Murni (Utang/Ekuitas)", badge: "bg-purple-50 text-purple-700 border-purple-200" };
  if (firstDigit === "1") {
    if (code.startsWith("111")) return { basis: "KAS", label: "Aset Kas Fisik", badge: "bg-teal-50 text-teal-700 border-teal-200" };
    if (code.startsWith("114119") || code.startsWith("13") || code.startsWith("16")) return { basis: "KONTRA", label: "Kontra Aset Pengurang (-)", badge: "bg-rose-50 text-rose-700 border-rose-200" };
    return { basis: "TRANSISIONAL", label: "Aset/Piutang Akrual", badge: "bg-blue-50 text-blue-700 border-blue-200" };
  }
  return { basis: "UMUM", label: "Akun BAS", badge: "bg-slate-50 text-slate-700 border-slate-200" };
}

export default function RumusBuilder({
  initialRumusId,
  isITRole = false,
  userEselonId,
  userEselonNama,
  onSuccess,
  onCancel,
}: RumusBuilderProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [namaRumus, setNamaRumus] = useState<string>("");
  const [deskripsi, setDeskripsi] = useState<string>("");
  const [scope, setScope] = useState<"universal" | "eselon_1">(isITRole ? "universal" : "eselon_1");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [seksiList, setSeksiList] = useState<RumusSeksi[]>([]);

  // Autocomplete Modal / Popup State
  const [activeSeksiIndex, setActiveSeksiIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<MasterAkun[]>([]);

  // Preview Simulation State
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [dummySaldoAwal, setDummySaldoAwal] = useState<number>(10000000);
  const [dummyValues, setDummyValues] = useState<Record<string, number>>({});

  // 1. Ambil detail jika edit mode
  useEffect(() => {
    if (initialRumusId) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const session = getSession();
          const res = await fetch(`${API}/kertas-kerja/rumus/${initialRumusId}`, {
            headers: { Authorization: `Bearer ${session?.token}` },
          });
          const json = await res.json();
          if (json.success && json.data) {
            setNamaRumus(json.data.nama_rumus || "");
            setDeskripsi(json.data.deskripsi || "");
            setScope(json.data.scope || "universal");
            setIsLocked(Boolean(json.data.is_locked));
            const parsedSeksi = (json.data.seksi_list || []).map((s: any) => ({
              ...s,
              tipe_subtotal: s.tipe_subtotal || "subtotal",
            }));
            setSeksiList(parsedSeksi);
          }
        } catch (err: any) {
          toast.error("Gagal memuat detail rumus: " + err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    } else {
      // Inisialisasi kanvas awal dengan 2 seksi standar
      setSeksiList([
        {
          nama_seksi: "I. Penerimaan Pendapatan & Kas Masuk (+)",
          tipe_akun_filter: "R",
          tipe_subtotal: "subtotal",
          urutan: 1,
          items: [],
        },
        {
          nama_seksi: "II. Pengeluaran Belanja & Beban Kas (-)",
          tipe_akun_filter: "E",
          tipe_subtotal: "subtotal",
          urutan: 2,
          items: [],
        },
      ]);
    }
  }, [initialRumusId]);

  // 2. Search Autocomplete Master Akun
  const fetchAkunResults = useCallback(async (tipe: string, query: string) => {
    setSearchLoading(true);
    try {
      const session = getSession();
      let url = `${API}/kertas-kerja/akun?limit=50`;
      if (tipe && tipe !== "ALL") {
        url += `&tipe=${tipe}`;
      }
      if (query && query.trim()) {
        url += `&q=${encodeURIComponent(query.trim())}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (json.success) {
        setSearchResults(json.data || []);
      }
    } catch (err) {
      console.error("Search akun error:", err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced search trigger saat query atau aktif seksi berubah
  useEffect(() => {
    if (activeSeksiIndex !== null) {
      const activeSeksi = seksiList[activeSeksiIndex];
      const timer = setTimeout(() => {
        fetchAkunResults(activeSeksi?.tipe_akun_filter || "ALL", searchQuery);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [activeSeksiIndex, searchQuery, fetchAkunResults, seksiList]);

  // Handler: Tambah Kelompok Akun Baru
  const handleAddSeksi = () => {
    setSeksiList([
      ...seksiList,
      {
        nama_seksi: `Kelompok Akun ${seksiList.length + 1}`,
        tipe_akun_filter: "ALL",
        tipe_subtotal: "subtotal",
        urutan: seksiList.length + 1,
        items: [],
      },
    ]);
  };

  // Handler: Hapus Seksi
  const handleDeleteSeksi = (idx: number) => {
    const updated = seksiList.filter((_, i) => i !== idx);
    setSeksiList(updated);
  };

  // Handler: Update Atribut Seksi
  const handleUpdateSeksi = (idx: number, field: keyof RumusSeksi, val: any) => {
    const updated = [...seksiList];
    updated[idx] = { ...updated[idx], [field]: val };
    setSeksiList(updated);
  };

  // Handler: Buka Modal Pencarian Akun untuk Seksi tertentu
  const handleOpenAkunModal = (seksiIdx: number) => {
    setActiveSeksiIndex(seksiIdx);
    setSearchQuery("");
    const seksi = seksiList[seksiIdx];
    fetchAkunResults(seksi.tipe_akun_filter, "");
  };

  // Handler: Pilih Akun dari Modal
  const handleSelectAkun = (akun: MasterAkun) => {
    if (activeSeksiIndex === null) return;
    const currentSeksi = seksiList[activeSeksiIndex];

    // Cek apakah akun sudah ada di kelompok ini
    if (currentSeksi.items.some((it) => it.akun_id === akun.id)) {
      toast.error(`Akun ${akun.kode_akun} sudah ada di kelompok ini.`);
      return;
    }

    // Default operator: Jika tipe E (Belanja) -> kurang, akun kontra -> kurang, lainnya -> tambah
    let defaultOp: "tambah" | "kurang" = "tambah";
    if (akun.tipe_akun === "E" || akun.normal_balance === "kredit" && akun.tipe_akun === "A") {
      defaultOp = "kurang";
    }

    const newItem: RumusItem = {
      akun_id: akun.id,
      operator: defaultOp,
      urutan: currentSeksi.items.length + 1,
      kode_akun: akun.kode_akun,
      nama_akun: akun.nama_akun,
      tipe_akun: akun.tipe_akun,
    };

    const updated = [...seksiList];
    updated[activeSeksiIndex].items.push(newItem);
    setSeksiList(updated);
    toast.success(`Akun #${akun.kode_akun} berhasil ditambahkan`);
  };

  // Handler: Hapus Item Akun
  const handleDeleteItem = (seksiIdx: number, itemIdx: number) => {
    const updated = [...seksiList];
    updated[seksiIdx].items = updated[seksiIdx].items.filter((_, i) => i !== itemIdx);
    setSeksiList(updated);
  };

  // Handler: Toggle Operator Akun (+ / -)
  const handleToggleOperator = (seksiIdx: number, itemIdx: number) => {
    const updated = [...seksiList];
    const currOp = updated[seksiIdx].items[itemIdx].operator;
    updated[seksiIdx].items[itemIdx].operator = currOp === "tambah" ? "kurang" : "tambah";
    setSeksiList(updated);
  };

  // 3. Simpan Rumus ke Database
  const handleSaveRumus = async () => {
    if (!namaRumus.trim()) {
      toast.error("Nama rumus wajib diisi!");
      return;
    }
    if (seksiList.length === 0) {
      toast.error("Minimal harus memiliki 1 seksi!");
      return;
    }

    const totalItems = seksiList.reduce((acc, s) => acc + s.items.length, 0);
    if (totalItems === 0) {
      toast.error("Rumus harus memiliki minimal 1 akun!");
      return;
    }

    setSaving(true);
    try {
      const session = getSession();
      const payload = {
        nama_rumus: namaRumus.trim(),
        deskripsi: deskripsi.trim() || null,
        scope: isITRole ? scope : "eselon_1",
        eselon_1_id: isITRole ? (scope === "universal" ? null : userEselonId) : userEselonId,
        seksi_list: seksiList.map((s, sIdx) => ({
          nama_seksi: s.nama_seksi,
          tipe_akun_filter: s.tipe_akun_filter,
          tipe_subtotal: s.tipe_subtotal || "subtotal",
          urutan: sIdx + 1,
          items: s.items.map((it, iIdx) => ({
            akun_id: it.akun_id,
            operator: it.operator,
            urutan: iIdx + 1,
          })),
        })),
      };

      const url = initialRumusId
        ? `${API}/kertas-kerja/rumus/${initialRumusId}`
        : `${API}/kertas-kerja/rumus`;
      const method = initialRumusId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.detail || json.message || "Gagal menyimpan rumus");
      }

      toast.success(json.message || "Rumus kertas kerja berhasil disimpan!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // 4. Kalkulasi Simulasi Preview
  const previewCalculation = useMemo(() => {
    let totPenambah = 0;
    let totPengurang = 0;

    seksiList.forEach((seksi, sIdx) => {
      seksi.items.forEach((it, iIdx) => {
        const key = `${sIdx}-${iIdx}`;
        const val = dummyValues[key] !== undefined ? dummyValues[key] : (it.operator === "tambah" ? 1500000 : 500000);
        if (it.operator === "tambah") {
          totPenambah += val;
        } else {
          totPengurang += val;
        }
      });
    });

    const saldoAkhir = dummySaldoAwal + totPenambah - totPengurang;
    return { totPenambah, totPengurang, saldoAkhir };
  }, [seksiList, dummySaldoAwal, dummyValues]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* HEADER BUILDER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" />
              Accounting Rule Engine
            </span>
            {isLocked && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Terkunci (Sudah Dipakai Laporan)
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {initialRumusId ? "Edit Rumus Kertas Kerja" : "Buat Rumus Kertas Kerja Baru"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Susun seksi dan kelompokkan akun penambah & pengurang saldo kas secara dinamis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            {showPreview ? "Sembunyikan Simulasi" : "Uji Coba Simulasi"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveRumus}
            disabled={saving || isLocked}
            className={clsx(
              "px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5",
              isLocked
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            )}
          >
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Simpan Rumus"}
          </button>
        </div>
      </div>

      {/* INFORMASI UTAMA RUMUS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Nama Rumus / Format Laporan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Kertas Kerja Rekonsiliasi Kas Satker BLU (Kemendikbud)"
            value={namaRumus}
            onChange={(e) => setNamaRumus(e.target.value)}
            disabled={isLocked}
            className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Cakupan Hak Pakai (*Scope*) <span className="text-rose-500">*</span>
          </label>
          {isITRole ? (
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as any)}
              disabled={isLocked}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="universal">🌐 Universal (Seluruh Indonesia)</option>
              <option value="eselon_1">🏛️ Khusus Eselon 1 Tertentu</option>
            </select>
          ) : (
            <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Unit {userEselonNama || "Eselon 1 Pembina"}</span>
            </div>
          )}
        </div>

        <div className="md:col-span-3 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Deskripsi / Catatan Peruntukan Rumus
          </label>
          <input
            type="text"
            placeholder="Jelaskan tujuan atau dasar peraturan rumus ini (opsional)..."
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            disabled={isLocked}
            className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* SIMULASI LIVE PREVIEW (JIKA DIAKTIFKAN) */}
      {showPreview && (
        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Simulasi Cepat Perhitungan Rumus
            </h4>
            <span className="text-[11px] text-emerald-700 font-medium">
              Uji coba angka dummy untuk memastikan logika rumus tepat
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Saldo Awal Dummy
              </span>
              <input
                type="number"
                value={dummySaldoAwal}
                onChange={(e) => setDummySaldoAwal(Number(e.target.value) || 0)}
                className="w-full font-bold text-slate-800 text-xs mt-0.5 border-b border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                Total Penambah (+)
              </span>
              <p className="font-bold text-emerald-700 text-sm mt-0.5">
                Rp {previewCalculation.totPenambah.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-rose-600 block">
                Total Pengurang (-)
              </span>
              <p className="font-bold text-rose-700 text-sm mt-0.5">
                Rp {previewCalculation.totPengurang.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-emerald-600 text-white p-2.5 rounded-lg shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                Hasil Saldo Akhir
              </span>
              <p className="font-extrabold text-sm mt-0.5">
                Rp {previewCalculation.saldoAkhir.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KANVAS SEKSI-SEKSI RUMUS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Susunan Kelompok Akun ({seksiList.length} Kelompok Terpasang)
          </h3>
          <button
            type="button"
            onClick={handleAddSeksi}
            disabled={isLocked}
            className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Kelompok Akun
          </button>
        </div>

        {seksiList.map((seksi, sIdx) => (
          <div
            key={sIdx}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3"
          >
            {/* Header Kelompok */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Tulis Judul / Nama Kelompok (misal: Penerimaan Kas Pendapatan)"
                  value={seksi.nama_seksi}
                  onChange={(e) => handleUpdateSeksi(sIdx, "nama_seksi", e.target.value)}
                  disabled={isLocked}
                  className="text-xs font-bold text-slate-800 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />

                {/* Smart Filter Tipe Akun Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                    Smart Filter:
                  </span>
                  <select
                    value={seksi.tipe_akun_filter}
                    onChange={(e) => handleUpdateSeksi(sIdx, "tipe_akun_filter", e.target.value as any)}
                    disabled={isLocked}
                    className="w-full text-xs font-medium text-slate-700 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {TIPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleOpenAkunModal(sIdx)}
                  disabled={isLocked}
                  className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Pilih Akun ({seksi.items.length})
                </button>
                {seksiList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSeksi(sIdx)}
                    disabled={isLocked}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Kelompok"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* OPSI PILIHAN SUB TOTAL VS TOTAL (ANALISIS AKUNTANSI) */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600">
                  Opsi Perhitungan:
                </span>
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100/80 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleUpdateSeksi(sIdx, "tipe_subtotal", "subtotal")}
                    disabled={isLocked}
                    className={clsx(
                      "px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5",
                      (seksi.tipe_subtotal || "subtotal") === "subtotal"
                        ? "bg-white text-blue-700 shadow-2xs font-bold border border-blue-100"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
                    <span>Subtotal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateSeksi(sIdx, "tipe_subtotal", "total")}
                    disabled={isLocked}
                    className={clsx(
                      "px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5",
                      seksi.tipe_subtotal === "total"
                        ? "bg-white text-indigo-700 shadow-2xs font-bold border border-indigo-100"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>
                    <span>Langsung ke Total</span>
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 italic">
                {(seksi.tipe_subtotal || "subtotal") === "subtotal"
                  ? "✓ Baris Subtotal tampil di bawah seksi ini"
                  : "✓ Langsung diakumulasi ke Total Akhir"}
              </span>
            </div>

            {/* List Akun di Seksi Ini */}
            {seksi.items.length === 0 ? (
              <div className="py-4 text-center border-2 border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                Belum ada akun di seksi ini. Klik <strong>+ Pilih Akun</strong> di kanan atas untuk menyusun akun.
              </div>
            ) : (
              <div className="space-y-2">
                {seksi.items.map((it, iIdx) => {
                  const isAdd = it.operator === "tambah";
                  const basisInfo = getAkunBasisClassification(it.kode_akun || "");
                  const isBelanja = it.kode_akun?.startsWith("5");
                  const isContra = it.kode_akun?.startsWith("114119") || it.kode_akun?.startsWith("13") || it.kode_akun?.startsWith("16");

                  let opLabel = isAdd ? "(+) Penambah" : "(-) Pengurang";
                  if (isBelanja) {
                    opLabel = isAdd ? "(+) Pengembalian Belanja" : "(-) Belanja Kas";
                  } else if (isContra) {
                    opLabel = isAdd ? "(+) Penambah" : "(-) Kontra Aset";
                  }

                  return (
                    <div
                      key={iIdx}
                      className="flex items-center justify-between gap-3 p-2.5 bg-slate-50/80 hover:bg-slate-50 rounded-lg border border-slate-100 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded text-[11px] shrink-0">
                          #{it.kode_akun || it.akun_id}
                        </span>
                        <span className={clsx("text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0", basisInfo.badge)}>
                          {basisInfo.label}
                        </span>
                        <span className="font-medium text-slate-800 truncate" title={it.nama_akun}>
                          {it.nama_akun || `Akun ID ${it.akun_id}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Toggle Penambah / Pengurang */}
                        <button
                          type="button"
                          onClick={() => handleToggleOperator(sIdx, iIdx)}
                          disabled={isLocked}
                          className={clsx(
                            "px-2 py-1 rounded-md text-[11px] font-bold border transition-all flex items-center gap-1",
                            isAdd
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          )}
                          title="Klik untuk mengubah sifat penambah/pengurang"
                        >
                          {opLabel}
                        </button>

                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(sIdx, iIdx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Hapus Akun dari Kelompok"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* BARIS LOKASI SUB TOTAL SEKSI (Tepat di Bagian Bawah Seksi - Indented Sesuai Lajur Akuntansi) */}
            {(seksi.tipe_subtotal || "subtotal") === "subtotal" ? (
              <div className="mt-3 ml-4 md:ml-8 p-2.5 rounded-lg bg-blue-50/70 border-l-4 border-l-blue-600 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold text-sm">↳</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                    LOKASI SUBTOTAL
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Subtotal: {seksi.nama_seksi || `Kelompok ${sIdx + 1}`}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-blue-800">
                  [ ∑ Lajur Subtotal ]
                </span>
              </div>
            ) : (
              <div className="mt-3 p-2 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-medium">
                  Akun di kelompok ini langsung diakumulasikan ke Saldo Akhir (tanpa baris subtotal).
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Langsung Total
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL SEARCH & SMART FILTER MASTER AKUN */}
      {activeSeksiIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header Modal */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Pilih Akun Pemerintahan (BAS)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target Kelompok: <strong className="text-slate-800">{seksiList[activeSeksiIndex]?.nama_seksi}</strong> &bull;
                  Smart Filter: <span className="font-semibold text-blue-600">{seksiList[activeSeksiIndex]?.tipe_akun_filter}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSeksiIndex(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Pencarian */}
            <div className="p-3 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik kode akun (misal: 111) atau nama akun (misal: kas bendahara)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Hasil Pencarian Akun */}
            <div className="p-3 flex-1 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
              {searchLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Mencari akun standar di database...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Tidak ada akun yang cocok dengan kata kunci & smart filter ini.
                </div>
              ) : (
                searchResults.map((akun) => {
                  const alreadySelected = seksiList[activeSeksiIndex]?.items.some(
                    (it) => it.akun_id === akun.id
                  );
                  return (
                    <div
                      key={akun.id}
                      className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            #{akun.kode_akun}
                          </span>
                          <span className={clsx("text-[10px] font-bold px-1.5 py-0.5 rounded border", getAkunBasisClassification(akun.kode_akun).badge)}>
                            {getAkunBasisClassification(akun.kode_akun).label}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                            {akun.kategori_nama}
                          </span>
                        </div>
                        <p className="font-medium text-slate-800 mt-1 truncate" title={akun.nama_akun}>
                          {akun.nama_akun}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectAkun(akun)}
                        disabled={alreadySelected}
                        className={clsx(
                          "px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors",
                          alreadySelected
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                      >
                        {alreadySelected ? "Terpasang" : "Tambahkan"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <span>Menampilkan {searchResults.length} akun BAS</span>
              <button
                type="button"
                onClick={() => setActiveSeksiIndex(null)}
                className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
