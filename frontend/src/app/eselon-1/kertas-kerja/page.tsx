"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSession } from "@/lib/auth";
import {
  FileSpreadsheet,
  Building2,
  Calendar,
  Download,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileText,
  Eye,
  Layers,
  ArrowRight,
  FileCheck,
  Lock,
  Unlock,
  Check,
  X,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import WorksheetOperator from "@/components/kertas-kerja/WorksheetOperator";

const API = typeof window !== "undefined" && window.location.hostname
  ? `${window.location.protocol}//${window.location.hostname}:5000/api`
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

const BULAN_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const formatRupiah = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export default function Eselon1KertasKerjaPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"monitoring" | "koreksi" | "input">("monitoring");

  // State Monitoring Satker Binaan
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [bulan, setBulan] = useState<number>(new Date().getMonth() + 1);
  const [search, setSearch] = useState<string>("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State Permohonan Memo Koreksi Satker (PSAP 10)
  const [koreksiList, setKoreksiList] = useState<any[]>([]);
  const [loadingKoreksi, setLoadingKoreksi] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [koreksiStatusFilter, setKoreksiStatusFilter] = useState<string>("all");

  // Ambil rekapitulasi pengisian kertas kerja satker binaan
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/kertas-kerja/transaksi?tahun=${tahun}&bulan=${bulan}`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSubmissions(json.data);
      }
    } catch (err: any) {
      console.error("Fetch submissions error:", err);
    } finally {
      setLoading(false);
    }
  }, [tahun, bulan]);

  // Ambil permohonan memo koreksi dari satker binaan
  const fetchKoreksiRequests = useCallback(async () => {
    setLoadingKoreksi(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/kertas-kerja/koreksi-requests`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setKoreksiList(json.data);
      }
    } catch (err: any) {
      console.error("Fetch koreksi requests error:", err);
    } finally {
      setLoadingKoreksi(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "monitoring") {
      fetchSubmissions();
    } else if (activeTab === "koreksi") {
      fetchKoreksiRequests();
    }
  }, [activeTab, fetchSubmissions, fetchKoreksiRequests]);

  // Load awal untuk mendapatkan jumlah pending memo koreksi
  useEffect(() => {
    fetchKoreksiRequests();
  }, [fetchKoreksiRequests]);

  // Handler Persetujuan Memo Koreksi (Buka Gembok Satker)
  const handleApproveKoreksi = async (reqId: number) => {
    const catatan = window.prompt(
      "Catatan persetujuan pembukaan gembok (opsional):",
      "Disetujui untuk perbaikan kesalahan pencatatan transaksi kertas kerja."
    );
    if (catatan === null) return; // User cancel

    setActionLoadingId(reqId);
    try {
      const session = getSession();
      const res = await fetch(`${API}/kertas-kerja/koreksi-requests/${reqId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ catatan: catatan || "Disetujui" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.detail || json.message || "Gagal menyetujui permohonan koreksi");
      }
      toast.success("Gembok Kertas Kerja Satker berhasil dibuka untuk sesi perbaikan!");
      fetchKoreksiRequests();
      fetchSubmissions();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handler Penolakan Memo Koreksi (Kertas Kerja Tetap Terkunci)
  const handleRejectKoreksi = async (reqId: number) => {
    const catatan = window.prompt("Alasan penolakan pembukaan gembok:", "Alasan koreksi belum sesuai SOP pembetulan kesalahan.");
    if (catatan === null) return; // User cancel
    if (!catatan.trim()) {
      toast.error("Alasan penolakan wajib dicantumkan!");
      return;
    }

    setActionLoadingId(reqId);
    try {
      const session = getSession();
      const res = await fetch(`${API}/kertas-kerja/koreksi-requests/${reqId}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ catatan }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.detail || json.message || "Gagal menolak permohonan koreksi");
      }
      toast.success("Permohonan koreksi ditolak. Kertas kerja tetap terkunci.");
      fetchKoreksiRequests();
      fetchSubmissions();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingKoreksiCount = koreksiList.filter(
    (k) => k.status === "menunggu_persetujuan"
  ).length;

  // Handler Download Ekspor
  const handleExport = (kkId: number, satkerKode: string, fmt: "xlsx" | "csv") => {
    const session = getSession();
    const exportUrl = `${API}/kertas-kerja/export/${kkId}?format=${fmt}`;

    fetch(exportUrl, {
      headers: { Authorization: `Bearer ${session?.token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengunduh file ekspor");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Kertas_Kerja_${satkerKode}_${BULAN_NAMES[bulan - 1]}_${tahun}.${fmt}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success(`Laporan (${fmt.toUpperCase()}) berhasil diunduh!`);
      })
      .catch((err) => toast.error(err.message));
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const mNama = s.satker_nama?.toLowerCase().includes(q);
      const mKode = s.satker_kode?.toLowerCase().includes(q);
      const mRumus = s.nama_rumus?.toLowerCase().includes(q);
      if (!mNama && !mKode && !mRumus) return false;
    }
    return true;
  });

  const filteredKoreksiList = koreksiList.filter((k) => {
    if (koreksiStatusFilter !== "all" && k.status !== koreksiStatusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* HEADER WITH TABS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Unit {user?.eselon_1_singkatan || "Eselon 1 Pembina"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Kertas Kerja Terkonsolidasi
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Monitoring & Lembar Kertas Kerja
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit kertas kerja yang telah diinput satker binaan atau isi lembar kerja mandiri unit Eselon 1.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-center gap-1">
          <button
            onClick={() => setActiveTab("monitoring")}
            className={clsx(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "monitoring"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Audit Satker Binaan
          </button>
          <button
            onClick={() => setActiveTab("koreksi")}
            className={clsx(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
              activeTab === "koreksi"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <span>Memo Koreksi Satker</span>
            {pendingKoreksiCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-rose-500 text-white animate-pulse">
                {pendingKoreksiCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("input")}
            className={clsx(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "input"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Isi Kertas Kerja Unit
          </button>
        </div>
      </div>

      {activeTab === "input" ? (
        <WorksheetOperator
          isEselonRole={true}
          satkerNamaProp={user?.eselon_1_nama || undefined}
          satkerKodeProp={user?.eselon_1_singkatan || undefined}
        />
      ) : activeTab === "koreksi" ? (
        <div className="space-y-4">
          {/* HEADER PENJELASAN SOP PSAP 10 */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-amber-900">
                  Antrean Persetujuan Memo Koreksi & Pembukaan Gembok (PSAP 10)
                </h3>
                <p className="text-amber-800/90 mt-0.5">
                  Setiap perubahan angka pada kertas kerja yang telah diajukan/terverifikasi memerlukan surat memo resmi dari Satker. Pejabat Pembina Eselon 1 / K/L memiliki otoritas membuka gembok untuk 1 (satu) sesi perbaikan sebelum sistem menguncinya kembali.
                </p>
              </div>
            </div>
          </div>

          {/* TOOLBAR FILTER STATUS */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              {[
                { id: "all", label: "Semua Permohonan" },
                { id: "menunggu_persetujuan", label: "Menunggu Persetujuan", badge: pendingKoreksiCount },
                { id: "disetujui", label: "Disetujui (Gembok Terbuka)" },
                { id: "ditolak", label: "Ditolak" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setKoreksiStatusFilter(tab.id)}
                  className={clsx(
                    "px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                    koreksiStatusFilter === tab.id
                      ? "bg-white text-blue-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <span>{tab.label}</span>
                  {Boolean(tab.badge && tab.badge > 0) && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={fetchKoreksiRequests}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shrink-0"
              title="Segarkan data antrean"
            >
              <RefreshCw className={clsx("w-4 h-4", loadingKoreksi && "animate-spin")} />
            </button>
          </div>

          {/* DAFTAR PERMOHONAN KOREKSI */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Daftar Memo Koreksi Masuk ({filteredKoreksiList.length} Permohonan)
              </span>
              <span className="text-slate-400 text-[11px]">
                Standar Akuntansi Pemerintahan PP 71/2010
              </span>
            </div>

            {loadingKoreksi ? (
              <div className="py-24 text-center text-xs text-slate-400">
                Memuat antrean permohonan memo koreksi...
              </div>
            ) : filteredKoreksiList.length === 0 ? (
              <div className="py-20 text-center space-y-2">
                <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">Tidak Ada Permohonan Koreksi</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Belum ada permohonan memo koreksi kertas kerja yang masuk dari satker binaan.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredKoreksiList.map((k) => {
                  const isPending = k.status === "menunggu_persetujuan";
                  const isApproved = k.status === "disetujui";

                  return (
                    <div
                      key={k.id}
                      className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="space-y-2.5 flex-1 min-w-0">
                        {/* Header Satker & Status */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                            #{k.satker_kode}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {k.satker_nama}
                          </span>
                          <span
                            className={clsx(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                              isPending
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : isApproved
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            )}
                          >
                            {isPending
                              ? "⏳ MENUNGGU PERSETUJUAN"
                              : isApproved
                              ? "🔓 GEMBOK TERBUKA (DISETUJUI)"
                              : "❌ DITOLAK"}
                          </span>
                        </div>

                        {/* Rincian Surat Memo */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-semibold text-slate-400 block">
                              Nomor Surat Memo:
                            </span>
                            <span className="font-bold text-slate-800 truncate block">
                              {k.nomor_surat}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Tgl: {k.tanggal_surat}
                            </span>
                          </div>

                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-semibold text-slate-400 block">
                              Target Kertas Kerja:
                            </span>
                            <span className="font-bold text-slate-800 truncate block" title={k.nama_rumus}>
                              {k.nama_rumus}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Periode: {BULAN_NAMES[k.bulan - 1]} {k.tahun}
                            </span>
                          </div>

                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-semibold text-slate-400 block">
                              Diajukan Oleh:
                            </span>
                            <span className="font-bold text-slate-800 truncate block">
                              {k.pemohon_nama || "Operator Satker"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {k.created_at ? new Date(k.created_at).toLocaleString("id-ID") : "-"}
                            </span>
                          </div>
                        </div>

                        {/* Kronologi Alasan Koreksi */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                            Alasan Penyesuaian & Kronologi Kesalahan:
                          </span>
                          <p className="text-slate-800 leading-relaxed italic whitespace-pre-line">
                            "{k.alasan}"
                          </p>
                        </div>

                        {/* Catatan Pejabat jika sudah di-review */}
                        {k.catatan_pejabat && (
                          <div className="text-xs p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-900">
                            <span className="font-bold block text-[11px]">
                              Catatan Pejabat Pembina:
                            </span>
                            <span>{k.catatan_pejabat}</span>
                            {k.approved_by_nama && (
                              <span className="text-[10px] text-blue-600 block mt-0.5">
                                Diverifikasi oleh: <strong>{k.approved_by_nama}</strong>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Tombol Aksi Persetujuan */}
                      <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 self-end md:self-center">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveKoreksi(k.id)}
                              disabled={actionLoadingId === k.id}
                              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              {actionLoadingId === k.id ? "Memproses..." : "Setujui & Buka Gembok"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectKoreksi(k.id)}
                              disabled={actionLoadingId === k.id}
                              className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" />
                              Tolak Memo
                            </button>
                          </>
                        ) : isApproved ? (
                          <div className="text-center p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs">
                            <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                            <span className="font-bold block">Gembok Terbuka</span>
                            <span className="text-[10px] text-emerald-600">
                              Satker sedang mengoreksi
                            </span>
                          </div>
                        ) : (
                          <div className="text-center p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs">
                            <X className="w-4 h-4 mx-auto text-rose-600 mb-1" />
                            <span className="font-bold block">Permohonan Ditolak</span>
                            <span className="text-[10px] text-rose-600">
                              Kertas kerja tetap terkunci
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* TOOLBAR FILTER PERIODE & PENCARIAN SATKER */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama satker atau kode satker..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={bulan}
                  onChange={(e) => setBulan(Number(e.target.value))}
                  className="bg-transparent font-semibold text-slate-700 focus:outline-none"
                >
                  {BULAN_NAMES.map((bName, idx) => (
                    <option key={idx} value={idx + 1}>
                      {bName}
                    </option>
                  ))}
                </select>
                <select
                  value={tahun}
                  onChange={(e) => setTahun(Number(e.target.value))}
                  className="bg-transparent font-semibold text-slate-700 focus:outline-none ml-1"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={fetchSubmissions}
                className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shrink-0"
                title="Muat Ulang"
              >
                <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* TABEL DATA HASIL INPUT KERTAS KERJA SATKER BINAAN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Daftar Kertas Kerja Satker Binaan ({filteredSubmissions.length} Laporan Masuk)
              </span>
              <span className="text-slate-500">
                Periode: <strong>{BULAN_NAMES[bulan - 1]} {tahun}</strong>
              </span>
            </div>

            {loading ? (
              <div className="py-24 text-center text-xs text-slate-400">
                Memuat data kertas kerja satker...
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="py-20 text-center space-y-2">
                <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">Belum Ada Kertas Kerja Terkumpul</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Satker binaan belum menyimpan atau mengajukan kertas kerja untuk periode {BULAN_NAMES[bulan - 1]} {tahun}.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <th className="py-3 px-4">Satker Pelaksana</th>
                      <th className="py-3 px-4">Dasar Rumus</th>
                      <th className="py-3 px-4 text-right">Saldo Awal</th>
                      <th className="py-3 px-4 text-right">Penambah (+)</th>
                      <th className="py-3 px-4 text-right">Pengurang (-)</th>
                      <th className="py-3 px-4 text-right">Saldo Akhir</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Aksi Unduh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                            #{s.satker_kode}
                          </span>
                          <p className="font-bold text-slate-900 mt-0.5 leading-snug">
                            {s.satker_nama}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Pengisi: {s.pengisi_nama || "Operator"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800 block truncate max-w-xs" title={s.nama_rumus}>
                            {s.nama_rumus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-700">
                          {formatRupiah(Number(s.saldo_awal))}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-600">
                          +{formatRupiah(Number(s.total_penambah))}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-rose-600">
                          -{formatRupiah(Number(s.total_pengurang))}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-blue-700 text-xs">
                          {formatRupiah(Number(s.saldo_akhir))}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold inline-block",
                              s.status === "terverifikasi"
                                ? "bg-emerald-100 text-emerald-800"
                                : s.status === "diajukan"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            )}
                          >
                            {s.status?.toUpperCase() || "DRAFT"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleExport(s.id, s.satker_kode, "xlsx")}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                              title="Unduh Excel .xlsx"
                            >
                              .xlsx
                            </button>
                            <button
                              onClick={() => handleExport(s.id, s.satker_kode, "csv")}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
                              title="Unduh CSV"
                            >
                              .csv
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
        </div>
      )}
    </div>
  );
}
