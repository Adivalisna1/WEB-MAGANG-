"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getSession } from "@/lib/auth";
import {
  Calculator,
  Save,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Coins,
  Scale,
  Lock,
  FileCheck,
  X,
  Printer
} from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

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

export default function WorksheetOperator({
  isEselonRole = false,
  satkerNamaProp,
  satkerKodeProp,
}: {
  isEselonRole?: boolean;
  satkerNamaProp?: string;
  satkerKodeProp?: string;
}) {
  const [rumusList, setRumusList] = useState<any[]>([]);
  const [selectedRumusId, setSelectedRumusId] = useState<number | null>(null);
  const [activeRumusDetail, setActiveRumusDetail] = useState<any | null>(null);

  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [bulan, setBulan] = useState<number>(new Date().getMonth() + 1);

  const [saldoAwal, setSaldoAwal] = useState<number>(0);
  const [catatan, setCatatan] = useState<string>("");
  const [nominalMap, setNominalMap] = useState<Record<number, number>>({}); // rumus_item_id -> nominal

  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSubmissionId, setSavedSubmissionId] = useState<number | null>(null);
  const [statusLaporan, setStatusLaporan] = useState<string>("draft");

  // State Permohonan Memo Koreksi (Buka Gembok K/L)
  const [showKoreksiModal, setShowKoreksiModal] = useState<boolean>(false);
  const [nomorSuratKoreksi, setNomorSuratKoreksi] = useState<string>("");
  const [tanggalSuratKoreksi, setTanggalSuratKoreksi] = useState<string>(new Date().toISOString().split("T")[0]);
  const [alasanKoreksi, setAlasanKoreksi] = useState<string>("");
  const [submittingKoreksi, setSubmittingKoreksi] = useState<boolean>(false);

  // State Cetak PDF / Berita Acara Rekonsiliasi Kas Resmi
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [namaBendahara, setNamaBendahara] = useState<string>("Ahmad Subagja, S.E.");
  const [nipBendahara, setNipBendahara] = useState<string>("19850412 201001 1 002");
  const [namaKPA, setNamaKPA] = useState<string>("Dr. H. Suryadi, M.Si.");
  const [nipKPA, setNipKPA] = useState<string>("19740815 199803 1 001");
  const [kotaDokumen, setKotaDokumen] = useState<string>("Jakarta");
  const [tanggalDokumen, setTanggalDokumen] = useState<string>(
    new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  );

  useEffect(() => {
    const session = getSession();
    if (session?.user?.nama) {
      setNamaBendahara(session.user.nama);
    }
  }, []);

  const isLockedStatus = statusLaporan === "diajukan" || statusLaporan === "terverifikasi" || statusLaporan === "permohonan_koreksi";
  const isKoreksiTerbuka = statusLaporan === "koreksi_terbuka";

  // Handler Kirim Surat Memo Koreksi ke K/L
  const handleSubmitKoreksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedSubmissionId) {
      toast.error("Tidak ada laporan tersimpan untuk diajukan koreksi!");
      return;
    }
    if (!nomorSuratKoreksi.trim() || !alasanKoreksi.trim()) {
      toast.error("Nomor surat memo dan alasan koreksi wajib diisi!");
      return;
    }

    setSubmittingKoreksi(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/kertas-kerja/koreksi-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          submission_id: savedSubmissionId,
          nomor_surat: nomorSuratKoreksi.trim(),
          tanggal_surat: tanggalSuratKoreksi,
          alasan: alasanKoreksi.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.detail || json.message || "Gagal mengajukan permohonan koreksi");
      }

      toast.success("Permohonan memo koreksi resmi berhasil diajukan ke Eselon 1 / K/L!");
      setStatusLaporan("permohonan_koreksi");
      setShowKoreksiModal(false);
      setNomorSuratKoreksi("");
      setAlasanKoreksi("");
    } catch (err: any) {
      toast.error("Gagal: " + err.message);
    } finally {
      setSubmittingKoreksi(false);
    }
  };

  // 1. Ambil daftar rumus yang tersedia
  const fetchRumusList = useCallback(async () => {
    try {
      const session = getSession();
      const res = await fetch(`${API}/kertas-kerja/rumus`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRumusList(json.data);
        if (json.data.length > 0 && !selectedRumusId) {
          setSelectedRumusId(json.data[0].id);
        }
      }
    } catch (err: any) {
      toast.error("Gagal memuat daftar rumus: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedRumusId]);

  useEffect(() => {
    fetchRumusList();
  }, [fetchRumusList]);

  // 2. Ambil detail rumus terpilih dan data transaksi jika sudah ada yang tersimpan
  const fetchRumusDetailAndSavedData = useCallback(async (rumusId: number, t: number, b: number) => {
    setDetailLoading(true);
    try {
      const session = getSession();

      // Ambil struktur rumus
      const resDetail = await fetch(`${API}/kertas-kerja/rumus/${rumusId}`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const jsonDetail = await resDetail.json();
      if (jsonDetail.success && jsonDetail.data) {
        setActiveRumusDetail(jsonDetail.data);
      }

      // Ambil transaksi tersimpan untuk satker & periode ini
      const resTx = await fetch(`${API}/kertas-kerja/transaksi?tahun=${t}&bulan=${b}&rumus_id=${rumusId}`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const jsonTx = await resTx.json();
      if (jsonTx.success && jsonTx.data) {
        const saved = jsonTx.data;
        setSavedSubmissionId(saved.id || null);
        setSaldoAwal(Number(saved.saldo_awal) || 0);
        setCatatan(saved.catatan || "");
        setStatusLaporan(saved.status || "draft");

        // Map nilai rincian akun
        const nMap: Record<number, number> = {};
        if (Array.isArray(saved.nilai_detail)) {
          saved.nilai_detail.forEach((nd: any) => {
            nMap[nd.rumus_item_id] = Number(nd.nominal) || 0;
          });
        }
        setNominalMap(nMap);
      } else {
        // Reset jika belum ada data tersimpan di periode ini
        setSavedSubmissionId(null);
        setSaldoAwal(0);
        setCatatan("");
        setStatusLaporan("draft");
        setNominalMap({});
      }
    } catch (err: any) {
      console.error("Fetch worksheet error:", err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRumusId) {
      fetchRumusDetailAndSavedData(selectedRumusId, tahun, bulan);
    }
  }, [selectedRumusId, tahun, bulan, fetchRumusDetailAndSavedData]);

  // 3. Kalkulasi Otomatis Realtime
  const calculation = useMemo(() => {
    let totalPenambah = 0;
    let totalPengurang = 0;

    if (activeRumusDetail && Array.isArray(activeRumusDetail.seksi_list)) {
      activeRumusDetail.seksi_list.forEach((seksi: any) => {
        if (Array.isArray(seksi.items)) {
          seksi.items.forEach((it: any) => {
            const val = nominalMap[it.item_id] || 0;
            if (it.operator === "tambah") {
              totalPenambah += val;
            } else {
              totalPengurang += val;
            }
          });
        }
      });
    }

    const saldoAkhir = (Number(saldoAwal) || 0) + totalPenambah - totalPengurang;
    return { totalPenambah, totalPengurang, saldoAkhir };
  }, [activeRumusDetail, nominalMap, saldoAwal]);

  // Handler input perubahan nominal akun
  const handleNominalChange = (itemId: number, rawVal: string) => {
    // Bersihkan karakter selain angka
    const clean = rawVal.replace(/\D/g, "");
    const val = clean ? parseInt(clean, 10) : 0;
    setNominalMap((prev) => ({ ...prev, [itemId]: val }));
  };

  // Handler Simpan Kertas Kerja
  const handleSave = async (submitStatus: string = "draft") => {
    if (!selectedRumusId) {
      toast.error("Silakan pilih rumus perhitungan!");
      return;
    }

    setSaving(true);
    try {
      const session = getSession();

      // Susun nilai_list dari seksi & items rumus aktif
      const nilaiList: any[] = [];
      if (activeRumusDetail && Array.isArray(activeRumusDetail.seksi_list)) {
        activeRumusDetail.seksi_list.forEach((seksi: any) => {
          if (Array.isArray(seksi.items)) {
            seksi.items.forEach((it: any) => {
              nilaiList.push({
                rumus_item_id: it.item_id,
                akun_id: it.akun_id,
                nominal: nominalMap[it.item_id] || 0,
              });
            });
          }
        });
      }

      const payload = {
        rumus_id: selectedRumusId,
        tahun,
        bulan,
        saldo_awal: saldoAwal,
        total_penambah: calculation.totalPenambah,
        total_pengurang: calculation.totalPengurang,
        saldo_akhir: calculation.saldoAkhir,
        catatan: catatan.trim() || null,
        status: submitStatus,
        nilai_list: nilaiList,
      };

      const res = await fetch(`${API}/kertas-kerja/transaksi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.detail || json.message || "Gagal menyimpan kertas kerja");
      }

      setSavedSubmissionId(json.kertas_kerja_id);
      setStatusLaporan(submitStatus);
      toast.success(
        submitStatus === "diajukan"
          ? "Kertas kerja berhasil diajukan untuk verifikasi!"
          : "Kertas kerja berhasil disimpan ke database!"
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handler Ekspor (Excel / CSV)
  const handleExport = (fmt: "xlsx" | "csv") => {
    if (!savedSubmissionId) {
      toast.error("Harap simpan kertas kerja terlebih dahulu sebelum mengunduh laporan!");
      return;
    }
    const session = getSession();
    const exportUrl = `${API}/kertas-kerja/export/${savedSubmissionId}?format=${fmt}`;

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
        a.download = `Kertas_Kerja_${BULAN_NAMES[bulan - 1]}_${tahun}.${fmt}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success(`Laporan Kertas Kerja (${fmt.toUpperCase()}) berhasil diunduh!`);
      })
      .catch((err) => toast.error(err.message));
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span>Memuat data rumus & lembar kerja...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TOOLBAR ATAS: PILIH RUMUS & PERIODE & AKSI */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Lembar Kertas Kerja Keuangan
              </span>
              <span
                className={clsx(
                  "px-2.5 py-0.5 rounded-full text-xs font-bold",
                  statusLaporan === "terverifikasi"
                    ? "bg-emerald-100 text-emerald-800"
                    : statusLaporan === "diajukan"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-amber-100 text-amber-800"
                )}
              >
                Status: {statusLaporan.toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              Kertas Kerja Rekonsiliasi & Pelaporan Kas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Input nominal mutasi per akun sesuai rumus pembina. Seluruh perhitungan kalkulasi otomatis & seimbang.
            </p>
          </div>

          {/* Tombol Ekspor & Simpan */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleExport("xlsx")}
              disabled={!savedSubmissionId}
              className={clsx(
                "px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5",
                savedSubmissionId
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              )}
              title="Unduh Lembar Kerja format Excel"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Ekspor Excel (.xlsx)
            </button>

            <button
              type="button"
              onClick={() => handleExport("csv")}
              disabled={!savedSubmissionId}
              className={clsx(
                "px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5",
                savedSubmissionId
                  ? "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              )}
              title="Unduh format CSV"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              CSV
            </button>

            {/* Tombol Cetak PDF Berita Acara Resmi */}
            <button
              type="button"
              onClick={() => {
                if (!activeRumusDetail) {
                  toast.error("Pilih rumus terlebih dahulu untuk mencetak!");
                  return;
                }
                setShowPrintModal(true);
              }}
              disabled={!activeRumusDetail}
              className={clsx(
                "px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5",
                activeRumusDetail
                  ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 shadow-2xs"
                  : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              )}
              title="Cetak Berita Acara Rekonsiliasi Kas / Dokumen PDF Resmi"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              Cetak PDF
            </button>

            {/* Tombol Simpan / Ajukan / Koreksi */}
            {isLockedStatus ? (
              <button
                type="button"
                onClick={() => setShowKoreksiModal(true)}
                disabled={statusLaporan === "permohonan_koreksi"}
                className={clsx(
                  "px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 shadow-xs",
                  statusLaporan === "permohonan_koreksi"
                    ? "bg-amber-50 text-amber-700 border-amber-200 cursor-not-allowed"
                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                )}
                title="Ajukan surat memo penyesuaian untuk membuka gembok pembetulan"
              >
                <Lock className="w-3.5 h-3.5" />
                {statusLaporan === "permohonan_koreksi"
                  ? "Permohonan Ditinjau K/L"
                  : "Ajukan Memo Koreksi (Buka Gembok)"}
              </button>
            ) : isKoreksiTerbuka ? (
              <button
                type="button"
                onClick={() => handleSave("diajukan")}
                disabled={saving}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4" />
                {saving ? "Menyimpan..." : "Simpan & Kunci Kembali Hasil Koreksi"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {saving ? "Menyimpan..." : "Simpan Kertas Kerja"}
              </button>
            )}
          </div>
        </div>

        {/* BANNER NOTIFIKASI STATUS GEMBOK / KOREKSI */}
        {statusLaporan === "permohonan_koreksi" && (
          <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900 mt-3 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Permohonan Memo Koreksi Sedang Diproses:</strong> Satker telah mengajukan surat memo koreksi resmi. Gembok formulir akan otomatis terbuka begitu disetujui oleh pejabat Eselon 1 / K/L.
            </span>
          </div>
        )}

        {isKoreksiTerbuka && (
          <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 mt-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Gembok Koreksi Telah Dibuka Resmi oleh Eselon 1 / K/L:</strong> Silakan lakukan perbaikan angka akun yang keliru. Setelah selesai, klik tombol <em>"Simpan & Kunci Kembali Hasil Koreksi"</em> untuk mengunci data secara otomatis demi integritas audit.
            </span>
          </div>
        )}

        {/* BARIS SELEKTOR: DROPDOWN RUMUS + BULAN + TAHUN */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="md:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">
              Pilih Rumus / Format Perhitungan Kertas Kerja:
            </label>
            <select
              value={selectedRumusId || ""}
              onChange={(e) => setSelectedRumusId(Number(e.target.value))}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              {rumusList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.scope === "universal" ? "🌐 [Universal] " : `🏛️ [${r.eselon_singkatan || "Eselon 1"}] `}
                  {r.nama_rumus}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">
              Periode Bulan Pelaporan:
            </label>
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              {BULAN_NAMES.map((bName, idx) => (
                <option key={idx} value={idx + 1}>
                  {bName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">
              Tahun Anggaran:
            </label>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* LEMBAR UTAMA KERTAS KERJA SATU LAYAR PENUH */}
      {detailLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Memuat susunan kelompok & akun rumus...
        </div>
      ) : !activeRumusDetail ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Silakan pilih rumus di dropdown atas untuk memulai lembar kerja.
        </div>
      ) : (
        <div className="space-y-5">
          {/* KOTAK SALDO AWAL */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  TITIK AWAL PERHITUNGAN
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  Saldo Awal Kas Satker
                </h3>
                <p className="text-xs text-slate-500">
                  Saldo kas riil / saldo buku per awal periode ({BULAN_NAMES[bulan - 1]} {tahun}).
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  placeholder="0"
                  disabled={isLockedStatus}
                  value={saldoAwal ? saldoAwal.toLocaleString("id-ID") : ""}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "");
                    setSaldoAwal(clean ? parseInt(clean, 10) : 0);
                  }}
                  className={clsx(
                    "w-full pl-9 pr-3 py-2.5 text-right font-bold text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500",
                    isLockedStatus
                      ? "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                  )}
                />
              </div>
            </div>
          </div>

          {/* DAFTAR SEKSI-SEKSI RUMUS YANG SUDAH DITETAPKAN PEMBINA */}
          {activeRumusDetail.seksi_list.map((seksi: any, sIdx: number) => {
            const isSubtotalMode = (seksi.tipe_subtotal || "subtotal") === "subtotal";

            // Hitung subtotal seksi ini
            let subtotalSeksi = 0;
            if (Array.isArray(seksi.items)) {
              seksi.items.forEach((it: any) => {
                const val = nominalMap[it.item_id] || 0;
                if (it.operator === "tambah") {
                  subtotalSeksi += val;
                } else {
                  subtotalSeksi -= val;
                }
              });
            }

            return (
              <div
                key={seksi.id || sIdx}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
              >
                {/* Header Seksi */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {seksi.nama_seksi}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {seksi.items?.length || 0} Akun Terdaftar &bull; Kategori: {seksi.tipe_akun_filter}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      {isSubtotalMode ? "Subtotal" : "Perhitungan"}
                    </span>
                    {isSubtotalMode ? (
                      <span
                        className={clsx(
                          "font-bold text-xs",
                          subtotalSeksi >= 0 ? "text-emerald-700" : "text-rose-700"
                        )}
                      >
                        {formatRupiah(subtotalSeksi)}
                      </span>
                    ) : (
                      <span className="font-semibold text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        Langsung Total
                      </span>
                    )}
                  </div>
                </div>

                {/* Tabel Input Akun di Seksi Ini */}
                <div className="p-4 space-y-2.5">
                  {seksi.items?.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Tidak ada akun pada kelompok ini.
                    </div>
                  ) : (
                    seksi.items.map((it: any) => {
                      const isAdd = it.operator === "tambah";
                      const currentVal = nominalMap[it.item_id] || 0;

                      // Analisis Vertikal: Hitung Proporsi (%)
                      let pctStr = "0.0%";
                      if (isSubtotalMode) {
                        const absSub = Math.abs(subtotalSeksi);
                        if (absSub > 0 && currentVal > 0) {
                          pctStr = `${((currentVal / absSub) * 100).toFixed(1)}%`;
                        }
                      } else {
                        const baseTot = isAdd ? calculation.totalPenambah : calculation.totalPengurang;
                        if (baseTot > 0 && currentVal > 0) {
                          pctStr = `${((currentVal / baseTot) * 100).toFixed(1)}%`;
                        }
                      }

                      return (
                        <div
                          key={it.item_id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs shrink-0">
                                #{it.kode_akun}
                              </span>
                              <span
                                className={clsx(
                                  "px-2 py-0.5 rounded text-[10px] font-bold shrink-0",
                                  isAdd
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                )}
                              >
                                {isAdd ? "(+) Penambah" : "(-) Pengurang"}
                              </span>
                            </div>
                            <p className="font-semibold text-slate-800 text-xs mt-1 leading-snug">
                              {it.nama_akun}
                            </p>
                          </div>

                          {/* Input Nominal Rupiah & Analisis Vertikal */}
                          <div className="flex flex-col items-end w-full sm:w-56 shrink-0">
                            <div className="relative w-full">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                Rp
                              </span>
                              <input
                                type="text"
                                placeholder="0"
                                disabled={isLockedStatus}
                                value={currentVal ? currentVal.toLocaleString("id-ID") : ""}
                                onChange={(e) => handleNominalChange(it.item_id, e.target.value)}
                                className={clsx(
                                  "w-full pl-9 pr-3 py-1.5 text-right font-bold text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500",
                                  isLockedStatus
                                    ? "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                                    : "bg-slate-50 text-slate-800 border-slate-200 focus:bg-white"
                                )}
                              />
                            </div>
                            {currentVal > 0 && (
                              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] font-medium text-slate-400">
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                  📊 {pctStr} dari {isSubtotalMode ? "Subtotal" : "Total"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* BARIS LOKASI SUB TOTAL SEKSI (Tepat di Bagian Bawah Seksi Sesuai Kaidah Akuntansi) */}
                  {isSubtotalMode && seksi.items?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/60 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          ∑
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Subtotal
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {seksi.nama_seksi || "Akumulasi kelompok akun"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={clsx(
                            "font-extrabold text-sm font-mono",
                            subtotalSeksi >= 0 ? "text-emerald-700" : "text-rose-700"
                          )}
                        >
                          {formatRupiah(subtotalSeksi)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* KOTAK HASIL AKHIR & RINGKASAN REKONSILIASI KERTAS KERJA (LIGHT / WHITE THEME) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-bold block">
                  KESIMPULAN PERHITUNGAN OTOMATIS
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Ringkasan Saldo Akhir Kertas Kerja
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Periode: {BULAN_NAMES[bulan - 1]} {tahun}
              </span>
            </div>

            {/* 4 Kotak Kalkulasi */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Saldo Awal
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1 truncate">
                  {formatRupiah(saldoAwal)}
                </p>
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                  (+) Total Penambah
                </span>
                <p className="text-sm font-bold text-emerald-800 mt-1 truncate">
                  {formatRupiah(calculation.totalPenambah)}
                </p>
              </div>

              <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200">
                <span className="text-[10px] uppercase font-bold text-rose-700 block">
                  (-) Total Pengurang
                </span>
                <p className="text-sm font-bold text-rose-800 mt-1 truncate">
                  {formatRupiah(calculation.totalPengurang)}
                </p>
              </div>

              <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">
                  (=) Saldo Akhir Kas
                </span>
                <p className="text-base font-extrabold text-blue-900 mt-0.5 truncate">
                  {formatRupiah(calculation.saldoAkhir)}
                </p>
              </div>
            </div>

            {/* ANALISIS AKUNTANSI (RINGKASAN PROPORSI VERTIKAL) */}
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                  📊
                </span>
                <div>
                  <span className="font-bold text-slate-800 block text-[11px]">
                    Ringkasan Analisis Akuntansi:
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Proporsi Mutasi Penambah vs Pengurang:{" "}
                    <strong className="text-emerald-700">
                      {calculation.totalPenambah + calculation.totalPengurang > 0
                        ? `${((calculation.totalPenambah / (calculation.totalPenambah + calculation.totalPengurang)) * 100).toFixed(1)}% Penambah`
                        : "0% Penambah"}
                    </strong>{" "}
                    &bull;{" "}
                    <strong className="text-rose-700">
                      {calculation.totalPenambah + calculation.totalPengurang > 0
                        ? `${((calculation.totalPengurang / (calculation.totalPenambah + calculation.totalPengurang)) * 100).toFixed(1)}% Pengurang`
                        : "0% Pengurang"}
                    </strong>
                  </span>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400 font-medium">
                Sistem Validasi Rule Engine Pemerintah
              </div>
            </div>

            {/* Catatan Kertas Kerja */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block">
                Catatan / Keterangan Tambahan Kertas Kerja (Opsional):
              </label>
              <textarea
                rows={2}
                disabled={isLockedStatus}
                placeholder="Tuliskan catatan rekonsiliasi atau penjelasan perbedaan saldo jika ada..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className={clsx(
                  "w-full text-xs px-3 py-2 border rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  isLockedStatus
                    ? "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white"
                )}
              />
            </div>

            {/* Tombol Aksi Bawah */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-400">
                {isLockedStatus
                  ? "*Lembar kerja terkunci permanen. Butuh Memo Penyesuaian ke K/L untuk koreksi."
                  : "*Kertas kerja otomatis terkunci saat diajukan untuk menjaga integritas data audit."}
              </p>
              <div className="flex items-center gap-2">
                {isLockedStatus ? (
                  <button
                    type="button"
                    onClick={() => setShowKoreksiModal(true)}
                    disabled={statusLaporan === "permohonan_koreksi"}
                    className={clsx(
                      "px-4 py-2 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 shadow-xs",
                      statusLaporan === "permohonan_koreksi"
                        ? "bg-amber-50 text-amber-700 border-amber-200 cursor-not-allowed"
                        : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                    )}
                  >
                    <Lock className="w-4 h-4" />
                    {statusLaporan === "permohonan_koreksi"
                      ? "Permohonan Koreksi Ditinjau K/L"
                      : "Ajukan Memo Koreksi Resmi (Buka Gembok)"}
                  </button>
                ) : isKoreksiTerbuka ? (
                  <button
                    type="button"
                    onClick={() => handleSave("diajukan")}
                    disabled={saving}
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 animate-pulse"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {saving ? "Memproses..." : "Simpan & Kunci Kembali Hasil Koreksi"}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSave("draft")}
                      disabled={saving}
                      className="px-4 py-2 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl transition-colors shadow-2xs"
                    >
                      Simpan Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave("diajukan")}
                      disabled={saving}
                      className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {saving ? "Memproses..." : "Simpan & Ajukan Kertas Kerja"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERMOHONAN MEMO KOREKSI KE K/L (PSAP 10 AUDIT SOP) */}
      {showKoreksiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pengajuan Memo Koreksi / Berita Acara
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    SOP Pembetulan Kesalahan Kertas Kerja (PSAP 10)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKoreksiModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Konten & Form Surat Permohonan */}
            <form onSubmit={handleSubmitKoreksi} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                <span className="font-bold block mb-0.5">Ketentuan Akuntansi Pemerintah:</span>
                Kertas kerja yang telah berstatus <strong>Diajukan</strong> atau <strong>Terverifikasi</strong> tidak dapat diubah sepihak. Pengajuan ini akan diteruskan ke Pejabat Pembina Eselon 1 / K/L untuk diverifikasi sebelum gembok dibuka untuk satu sesi pembetulan.
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Nomor Surat Memo / Nota Dinas / Berita Acara <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: ND-102/KPA/2026 atau BA-KOR/04/2026"
                  value={nomorSuratKoreksi}
                  onChange={(e) => setNomorSuratKoreksi(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Tanggal Surat Memo <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="date"
                  required
                  value={tanggalSuratKoreksi}
                  onChange={(e) => setTanggalSuratKoreksi(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Alasan Koreksi / Kronologi Kesalahan Akun <span className="text-rose-600">*</span>:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan detail kesalahan pencatatan, misalnya: koreksi nominal belanja akun 521211 karena terdapat retur/pengembalian belanja atau penyesuaian penyisihan piutang..."
                  value={alasanKoreksi}
                  onChange={(e) => setAlasanKoreksi(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowKoreksiModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingKoreksi}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  {submittingKoreksi ? "Mengirim Permohonan..." : "Kirim Permohonan ke K/L"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PENGATURAN CETAK PDF RESMI BERITA ACARA */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Cetak Dokumen / Berita Acara PDF Resmi
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Konfigurasi Kop Dokumen & Pejabat Penandatangan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Pengaturan Pejabat Penandatangan */}
            <div className="p-6 space-y-4">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 text-xs text-blue-900 leading-relaxed">
                <span className="font-bold block mb-0.5">Format Dokumen Cetak Kedinasan:</span>
                Dokumen akan dicetak ke ukuran kertas <strong>A4 Portrait</strong> ber-Kop resmi dengan rincian akun, subtotal, kesimpulan rekonsiliasi kas, dan lembar tanda tangan.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Kota Tempat Dokumen:
                  </label>
                  <input
                    type="text"
                    value={kotaDokumen}
                    onChange={(e) => setKotaDokumen(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Tanggal Pengesahan:
                  </label>
                  <input
                    type="text"
                    value={tanggalDokumen}
                    onChange={(e) => setTanggalDokumen(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Data Bendahara Pengeluaran */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  1. Bendahara Pengeluaran (Pembuat Kertas Kerja):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Lengkap & Gelar Bendahara"
                    value={namaBendahara}
                    onChange={(e) => setNamaBendahara(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <input
                    type="text"
                    placeholder="NIP Bendahara"
                    value={nipBendahara}
                    onChange={(e) => setNipBendahara(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Data Kuasa Pengguna Anggaran (KPA) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  2. Kuasa Pengguna Anggaran / KPA (Mengetahui):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Lengkap & Gelar KPA"
                    value={namaKPA}
                    onChange={(e) => setNamaKPA(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <input
                    type="text"
                    placeholder="NIP KPA"
                    value={nipKPA}
                    onChange={(e) => setNipKPA(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPrintModal(false);
                    setTimeout(() => {
                      window.print();
                    }, 300);
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Lanjutkan Cetak / Simpan PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOKUMEN CETAK RESMI PEMERINTAHAN (A4 PORTRAIT) - HANYA MUNCUL SAAT PRINT */}
      {activeRumusDetail && (
        <div id="printable-kertas-kerja" className="hidden print:block text-black bg-white">
          {/* KOP RESMI DOKUMEN PEMERINTAH */}
          <div className="text-center pb-2 mb-3 border-b-2 border-black">
            <h2 className="text-sm font-extrabold uppercase tracking-wide">
              KEMENTERIAN / LEMBAGA REPUBLIK INDONESIA
            </h2>
            <h3 className="text-xs font-bold uppercase text-slate-800">
              DIREKTORAT JENDERAL PERBENDAHARAAN &bull; PENGELOLA KEUANGAN
            </h3>
            <h4 className="text-xs font-bold uppercase mt-0.5">
              SATUAN KERJA: {satkerNamaProp || getSession()?.user?.satker_nama || "KANTOR SATKER KEUANGAN"} (KODE: {satkerKodeProp || getSession()?.user?.satker_kode || "012345"})
            </h4>
            <p className="text-[10px] text-slate-600 mt-0.5">
              Gedung Keuangan Negara &bull; Telepon: (021) 3456789 &bull; Laman Resmi Portal Pelaporan Keuangan
            </p>
            <div className="w-full h-0.5 bg-black mt-2"></div>
            <div className="w-full h-[1px] bg-black mt-0.5"></div>
          </div>

          {/* JUDUL DOKUMEN BERITA ACARA */}
          <div className="text-center my-3">
            <h1 className="text-sm font-extrabold uppercase underline tracking-wide">
              BERITA ACARA REKONSILIASI & LEMBAR KERTAS KERJA KAS
            </h1>
            <p className="text-xs font-semibold mt-0.5">
              Nomor: BA-KK/{satkerKodeProp || getSession()?.user?.satker_kode || "SATKER"}/{String(bulan).padStart(2, "0")}/{tahun}
            </p>
            <p className="text-[11px] font-medium text-slate-700 mt-0.5">
              Periode Pembukuan: <strong>Bulan {BULAN_NAMES[bulan - 1]} Tahun {tahun}</strong>
            </p>
          </div>

          {/* TABEL IDENTITAS PARAMETER RUMUS */}
          <div className="text-[11px] mb-3 bg-slate-50 p-2.5 border border-slate-300 rounded">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="w-32 font-semibold text-slate-700">Format / Rumus</td>
                  <td className="w-3">:</td>
                  <td className="font-bold">{activeRumusDetail.nama_rumus} ({activeRumusDetail.scope === "universal" ? "Standar Universal" : "Khusus Eselon 1"})</td>
                  <td className="w-28 font-semibold text-slate-700 text-right">Status Audit</td>
                  <td className="w-3 text-center">:</td>
                  <td className="w-32 font-bold uppercase text-slate-900">{statusLaporan}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-slate-700">Saldo Awal Kas</td>
                  <td>:</td>
                  <td className="font-bold text-slate-900">{formatRupiah(saldoAwal)}</td>
                  <td className="font-semibold text-slate-700 text-right">Tanggal Cetak</td>
                  <td className="text-center">:</td>
                  <td className="font-medium text-slate-800">{tanggalDokumen}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABEL DETAIL AKUN & SUB-TOTAL RESMI */}
          <table className="w-full border-collapse border border-black text-[10.5px] mb-4">
            <thead>
              <tr className="bg-slate-100 border-b border-black text-center font-bold">
                <th className="border border-black py-1.5 px-2 w-8">No</th>
                <th className="border border-black py-1.5 px-2 w-24">Kode Akun</th>
                <th className="border border-black py-1.5 px-2 text-left">Uraian Akun Bagan Standar (BAS)</th>
                <th className="border border-black py-1.5 px-2 w-24">Sifat Mutasi</th>
                <th className="border border-black py-1.5 px-2 w-16">Porsi (%)</th>
                <th className="border border-black py-1.5 px-2 w-32 text-right">Nominal (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {activeRumusDetail.seksi_list.map((seksi: any, sIdx: number) => {
                const isSubtotalMode = (seksi.tipe_subtotal || "subtotal") === "subtotal";
                let subtotalSeksi = 0;
                if (Array.isArray(seksi.items)) {
                  seksi.items.forEach((it: any) => {
                    const val = nominalMap[it.item_id] || 0;
                    if (it.operator === "tambah") subtotalSeksi += val;
                    else subtotalSeksi -= val;
                  });
                }

                return (
                  <React.Fragment key={seksi.id || sIdx}>
                    {/* Baris Judul Kelompok Akun */}
                    <tr className="bg-slate-200/90 font-bold border-t border-b border-black">
                      <td colSpan={6} className="py-1 px-2 text-xs uppercase tracking-wide">
                        {seksi.nama_seksi || `Kelompok Akun ${sIdx + 1}`}
                      </td>
                    </tr>

                    {/* Baris Akun-Akun */}
                    {seksi.items?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-2 text-center text-slate-400 italic">
                          (Tidak ada akun terdaftar pada kelompok ini)
                        </td>
                      </tr>
                    ) : (
                      seksi.items.map((it: any, itIdx: number) => {
                        const isAdd = it.operator === "tambah";
                        const currentVal = nominalMap[it.item_id] || 0;

                        let pctStr = "0.0%";
                        if (isSubtotalMode) {
                          const absSub = Math.abs(subtotalSeksi);
                          if (absSub > 0 && currentVal > 0) {
                            pctStr = `${((currentVal / absSub) * 100).toFixed(1)}%`;
                          }
                        } else {
                          const baseTot = isAdd ? calculation.totalPenambah : calculation.totalPengurang;
                          if (baseTot > 0 && currentVal > 0) {
                            pctStr = `${((currentVal / baseTot) * 100).toFixed(1)}%`;
                          }
                        }

                        return (
                          <tr key={it.item_id} className="border-b border-slate-300">
                            <td className="border border-black py-1 px-1.5 text-center font-mono">{itIdx + 1}</td>
                            <td className="border border-black py-1 px-2 font-mono font-bold text-center">#{it.kode_akun}</td>
                            <td className="border border-black py-1 px-2">{it.nama_akun}</td>
                            <td className="border border-black py-1 px-1.5 text-center font-semibold">
                              {isAdd ? "(+) Kas Masuk" : "(-) Belanja / Kas Keluar"}
                            </td>
                            <td className="border border-black py-1 px-1 text-center font-mono text-[10px]">
                              {currentVal > 0 ? pctStr : "-"}
                            </td>
                            <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                              {formatRupiah(currentVal)}
                            </td>
                          </tr>
                        );
                      })
                    )}

                    {/* Baris Subtotal Kelompok */}
                    {isSubtotalMode && seksi.items?.length > 0 && (
                      <tr className="bg-slate-100 font-extrabold border-t-2 border-b-2 border-black">
                        <td colSpan={5} className="py-1 px-2 text-right uppercase">
                          SUBTOTAL {seksi.nama_seksi || `KELOMPOK ${sIdx + 1}`} :
                        </td>
                        <td className="py-1 px-2 text-right font-mono text-xs">
                          {formatRupiah(subtotalSeksi)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* KOTAK KESIMPULAN REKONSILIASI KAS BUKU */}
          <div className="border-2 border-black p-3 mb-4 text-[11px]">
            <div className="font-bold uppercase tracking-wider border-b border-black pb-1 mb-2">
              RINGKASAN REKONSILIASI KAS BUKU PERIODE {BULAN_NAMES[bulan - 1].toUpperCase()} {tahun}
            </div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="w-1/2 py-0.5">Saldo Awal Kas Riil per Awal Periode</td>
                  <td className="w-4">:</td>
                  <td className="text-right font-mono font-semibold">{formatRupiah(saldoAwal)}</td>
                </tr>
                <tr>
                  <td className="py-0.5 font-semibold text-emerald-900">(+) Total Kas Masuk / Mutasi Penambah</td>
                  <td>:</td>
                  <td className="text-right font-mono font-bold text-emerald-900">{formatRupiah(calculation.totalPenambah)}</td>
                </tr>
                <tr>
                  <td className="py-0.5 font-semibold text-rose-900">(-) Total Kas Keluar / Mutasi Belanja Pengurang</td>
                  <td>:</td>
                  <td className="text-right font-mono font-bold text-rose-900">{formatRupiah(calculation.totalPengurang)}</td>
                </tr>
                <tr className="border-t border-black font-extrabold text-xs">
                  <td className="pt-1 uppercase">(=) SALDO AKHIR KAS BUKU TERKONSILIASI</td>
                  <td className="pt-1">:</td>
                  <td className="pt-1 text-right font-mono text-sm">{formatRupiah(calculation.saldoAkhir)}</td>
                </tr>
              </tbody>
            </table>
            {catatan && (
              <div className="mt-2 pt-1.5 border-t border-slate-300 text-[10px] italic">
                <strong>Catatan / Penjelasan Rekonsiliasi:</strong> {catatan}
              </div>
            )}
          </div>

          {/* LEMBAR PENGESAHAN & TANDA TANGAN RESMI */}
          <div className="mt-5 text-[11px] break-inside-avoid">
            <div className="text-right mb-2">
              {kotaDokumen}, {tanggalDokumen}
            </div>
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <p className="font-semibold">Dibuat Oleh,</p>
                <p className="font-bold text-[10.5px]">Bendahara Pengeluaran</p>
                <div className="h-16 flex items-center justify-center text-slate-300 text-[10px] italic">
                  ( Tanda Tangan & Cap Stempel )
                </div>
                <p className="font-extrabold underline uppercase">{namaBendahara}</p>
                <p className="text-[10px]">NIP. {nipBendahara}</p>
              </div>

              <div>
                <p className="font-semibold">Mengetahui / Menyetujui,</p>
                <p className="font-bold text-[10.5px]">Kuasa Pengguna Anggaran (KPA)</p>
                <div className="h-16 flex items-center justify-center text-slate-300 text-[10px] italic">
                  ( Tanda Tangan & Cap Stempel )
                </div>
                <p className="font-extrabold underline uppercase">{namaKPA}</p>
                <p className="text-[10px]">NIP. {nipKPA}</p>
              </div>
            </div>

            {/* Footer Dokumen */}
            <div className="mt-6 pt-2 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-500">
              <span>Dicetak secara elektronik melalui Portal Kertas Kerja Keuangan Pemerintah RI</span>
              <span>Dokumen Sah Pengawasan APBN &bull; Waktu Cetak: {new Date().toLocaleTimeString("id-ID")}</span>
            </div>
          </div>
        </div>
      )}

      {/* STYLE KHUSUS PRINT DOKUMEN RESMI A4 */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-kertas-kerja, #printable-kertas-kerja * {
            visibility: visible;
          }
          #printable-kertas-kerja {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 8mm 12mm;
            background: white !important;
            color: black !important;
            display: block !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
