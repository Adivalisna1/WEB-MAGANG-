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
  Scale
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

            <button
              type="button"
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan Kertas Kerja"}
            </button>
          </div>
        </div>

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
          Memuat susunan seksi & akun rumus...
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
                  value={saldoAwal ? saldoAwal.toLocaleString("id-ID") : ""}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "");
                    setSaldoAwal(clean ? parseInt(clean, 10) : 0);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 text-right font-bold text-slate-900 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
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
                      {isSubtotalMode ? "Subtotal Seksi" : "Perhitungan"}
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
                      Tidak ada akun pada seksi ini.
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
                                value={currentVal ? currentVal.toLocaleString("id-ID") : ""}
                                onChange={(e) => handleNominalChange(it.item_id, e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-right font-bold text-slate-800 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
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
                            Subtotal {seksi.nama_seksi}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Total akumulasi akun pada seksi ini
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
                placeholder="Tuliskan catatan rekonsiliasi atau penjelasan perbedaan saldo jika ada..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Tombol Aksi Bawah */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-400">
                *Rumus ini terkunci otomatis begitu data berhasil disimpan ke database satker.
              </p>
              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
