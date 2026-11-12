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
  Lock,
  Printer,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import WorksheetOperator from "@/components/kertas-kerja/WorksheetOperator";
import OfficialPdfPrintModal from "@/components/kertas-kerja/OfficialPdfPrintModal";

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

export default function PimpinanKertasKerjaPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"monitoring" | "preview">("monitoring");

  // Filter Periode
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [bulan, setBulan] = useState<number>(new Date().getMonth() + 1);
  const [search, setSearch] = useState<string>("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State Download / Cetak PDF Resmi
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);
  const [printModalData, setPrintModalData] = useState<{
    submission: any;
    rumus: any;
    nominalMap: Record<number, number>;
  } | null>(null);

  // Ambil data kertas kerja satker ini
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
      } else {
        setSubmissions([]);
      }
    } catch (err: any) {
      console.error("Fetch satker submissions error:", err);
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

  // Handler Download / Cetak PDF Berita Acara
  const handleDownloadPdf = async (s: any) => {
    setPdfLoadingId(s.id);
    try {
      const session = getSession();
      // 1. Ambil detail rumus
      const resRumus = await fetch(`${API}/kertas-kerja/rumus/${s.rumus_id}`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const jsonRumus = await resRumus.json();

      // 2. Ambil detail transaksi (nilai detail)
      const resTx = await fetch(
        `${API}/kertas-kerja/transaksi?tahun=${s.tahun}&bulan=${s.bulan}&satker_id=${s.satker_id}&rumus_id=${s.rumus_id}`,
        { headers: { Authorization: `Bearer ${session?.token}` } }
      );
      const jsonTx = await resTx.json();

      if (!jsonRumus.success || !jsonRumus.data) {
        throw new Error("Gagal memuat struktur rumus");
      }

      const nMap: Record<number, number> = {};
      if (jsonTx.success && jsonTx.data?.nilai_detail) {
        jsonTx.data.nilai_detail.forEach((nd: any) => {
          nMap[nd.rumus_item_id] = Number(nd.nominal) || 0;
        });
      }

      setPrintModalData({
        submission: s,
        rumus: jsonRumus.data,
        nominalMap: nMap,
      });
    } catch (err: any) {
      toast.error("Gagal menyiapkan dokumen PDF: " + err.message);
    } finally {
      setPdfLoadingId(null);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const mRumus = s.nama_rumus?.toLowerCase().includes(q);
      const mPengisi = s.pengisi_nama?.toLowerCase().includes(q);
      if (!mRumus && !mPengisi) return false;
    }
    return true;
  });

  // Kalkulasi total agregat satker di periode ini
  const totalSaldoAwal = submissions.reduce((acc, curr) => acc + (Number(curr.saldo_awal) || 0), 0);
  const totalPenambah = submissions.reduce((acc, curr) => acc + (Number(curr.total_penambah) || 0), 0);
  const totalPengurang = submissions.reduce((acc, curr) => acc + (Number(curr.total_pengurang) || 0), 0);
  const totalSaldoAkhir = submissions.reduce((acc, curr) => acc + (Number(curr.saldo_akhir) || 0), 0);

  return (
    <>
      {/* KONTEN UTAMA MONITORING (SEMBUNYIKAN TOTAL SAAT MENCETAK DOKUMEN PDF RESMI) */}
      <div className="space-y-6 max-w-7xl mx-auto py-2 print:hidden">
        {/* HEADER WITH BADGE ROLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {user?.satker_nama || "Satuan Kerja"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Satker &bull; Hak Akses: Pemantau / Read-Only
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Monitoring Kertas Kerja Satker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit angka rekonsiliasi kas, periksa hasil input Operator Satker, dan cetak dokumen Berita Acara resmi.
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
            Daftar Laporan Kertas Kerja
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={clsx(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
              activeTab === "preview"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Lembar Kerja (Read-Only)</span>
          </button>
        </div>
      </div>

      {activeTab === "preview" ? (
        <div className="space-y-4">
          <WorksheetOperator
            readOnly={true}
            satkerNamaProp={user?.satker_nama || undefined}
            satkerKodeProp={user?.satker_kode || undefined}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* BANNER PENJELASAN HAK AKSES */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center gap-3 text-xs text-blue-950">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block text-blue-900">Peran Admin Satker (Monitoring & Pengawasan Internal):</span>
              Sesuai SOP pemisahan tugas (*segregation of duties*), Admin/Pimpinan Satker bertugas mengawasi kelayakan angka dan mencetak dokumen pengesahan. Pengisian transaksi dilakukan oleh <strong>Operator Satker</strong>, sedangkan pembuatan rumus merupakan kewenangan <strong>Pembina Eselon 1 / IT</strong>.
            </div>
          </div>

          {/* 4 KARTU RINGKASAN AGREGAT PERIODE */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                SALDO AWAL KAS
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1 truncate">
                {formatRupiah(totalSaldoAwal)}
              </p>
              <span className="text-[10px] text-slate-400 block mt-0.5">Awal Bulan {BULAN_NAMES[bulan - 1]}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">
                (+) KAS MASUK (PENAMBAH)
              </span>
              <p className="text-sm font-bold text-emerald-700 mt-1 truncate">
                +{formatRupiah(totalPenambah)}
              </p>
              <span className="text-[10px] text-slate-400 block mt-0.5">Pendapatan & Mutasi Masuk</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-rose-600 block tracking-wider">
                (-) KAS KELUAR (BELANJA)
              </span>
              <p className="text-sm font-bold text-rose-700 mt-1 truncate">
                -{formatRupiah(totalPengurang)}
              </p>
              <span className="text-[10px] text-slate-400 block mt-0.5">Belanja & Beban Kas</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-blue-700 block tracking-wider">
                (=) SALDO AKHIR KAS BUKU
              </span>
              <p className="text-base font-extrabold text-blue-900 mt-0.5 truncate">
                {formatRupiah(totalSaldoAkhir)}
              </p>
              <span className="text-[10px] text-blue-600 font-medium block mt-0.5">Saldo Terkonsiliasi</span>
            </div>
          </div>

          {/* TOOLBAR FILTER & SEARCH */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama rumus atau operator..."
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

          {/* TABEL LAPORAN KERTAS KERJA SATKER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Daftar Dokumen Kertas Kerja Periode {BULAN_NAMES[bulan - 1]} {tahun} ({filteredSubmissions.length} Data)
              </span>
              <span className="text-slate-400 text-[11px]">
                Satker: <strong>{user?.satker_nama || "Satker"}</strong>
              </span>
            </div>

            {loading ? (
              <div className="py-24 text-center text-xs text-slate-400">
                Memuat data kertas kerja...
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="py-20 text-center space-y-2">
                <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">Belum Ada Kertas Kerja Tersimpan</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Operator Satker belum menginput atau mengajukan kertas kerja untuk periode {BULAN_NAMES[bulan - 1]} {tahun}.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <th className="py-3 px-4">Dasar Rumus / Format</th>
                      <th className="py-3 px-4">Operator Pengisi</th>
                      <th className="py-3 px-4 text-right">Saldo Awal</th>
                      <th className="py-3 px-4 text-right">Penambah (+)</th>
                      <th className="py-3 px-4 text-right">Pengurang (-)</th>
                      <th className="py-3 px-4 text-right">Saldo Akhir</th>
                      <th className="py-3 px-4 text-center">Status Dokumen</th>
                      <th className="py-3 px-4 text-center">Aksi Dokumen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block truncate max-w-xs" title={s.nama_rumus}>
                            {s.nama_rumus}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Ref #{s.id} &bull; Periode {BULAN_NAMES[bulan - 1]} {tahun}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800">
                            {s.pengisi_nama || "Operator Satker"}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Diperbarui: {s.updated_at ? new Date(s.updated_at).toLocaleDateString("id-ID") : "-"}
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
                        <td className="py-3 px-4 text-right font-extrabold text-blue-700 text-xs">
                          {formatRupiah(Number(s.saldo_akhir))}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={clsx(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block border",
                              s.status === "terverifikasi"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : s.status === "diajukan"
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : s.status === "koreksi_terbuka"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            )}
                          >
                            {s.status?.toUpperCase() || "DRAFT"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setActiveTab("preview")}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors flex items-center gap-1"
                              title="Periksa Lembar Kerja Lengkap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Periksa
                            </button>
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
                            <button
                              onClick={() => handleDownloadPdf(s)}
                              disabled={pdfLoadingId === s.id}
                              className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200 transition-colors flex items-center gap-1"
                              title="Cetak / Simpan Berita Acara Rekonsiliasi (PDF)"
                            >
                              {pdfLoadingId === s.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                ".pdf"
                              )}
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

      {/* MODAL CETAK PDF RESMI BERITA ACARA SATKER */}
      {printModalData && (
        <OfficialPdfPrintModal
          isOpen={Boolean(printModalData)}
          onClose={() => setPrintModalData(null)}
          rumus={printModalData.rumus}
          submission={printModalData.submission}
          nominalMap={printModalData.nominalMap}
          satkerNama={printModalData.submission.satker_nama}
          satkerKode={printModalData.submission.satker_kode}
          tahun={printModalData.submission.tahun}
          bulan={printModalData.submission.bulan}
        />
      )}
    </>
  );
}
