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
  ArrowRight
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
  const [activeTab, setActiveTab] = useState<"monitoring" | "input">("monitoring");

  // State Monitoring Satker Binaan
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [bulan, setBulan] = useState<number>(new Date().getMonth() + 1);
  const [search, setSearch] = useState<string>("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  useEffect(() => {
    if (activeTab === "monitoring") {
      fetchSubmissions();
    }
  }, [activeTab, fetchSubmissions]);

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
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-center">
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
          satkerNamaProp={user?.eselon_1_nama}
          satkerKodeProp={user?.eselon_1_singkatan}
        />
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
