"use client";
import toast from "react-hot-toast";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Download,
  Paperclip,
  DollarSign,
  Building2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Calendar,
  CreditCard,
  FileText,
  Layers,
} from "lucide-react";
import clsx from "clsx";
import * as XLSX from "xlsx";

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

// Daftar Bank BUMN & Persepsi beserta Kode Bank Indonesia (Relasi No Bank - Nama Bank)
const BANK_BUMN_LIST = [
  "Bank Mandiri",
  "Bank BRI",
  "Bank BNI",
  "Bank BTN",
  "Bank BSI (Bank Syariah Indonesia)",
  "Bank BCA",
  "Bank Lainnya",
];

const BANK_CODE_MAP: Record<string, string> = {
  "bank mandiri": "008",
  mandiri: "008",
  "bank bri": "002",
  bri: "002",
  "bank rakyat indonesia": "002",
  "bank bni": "009",
  bni: "009",
  "bank negara indonesia": "009",
  "bank btn": "200",
  btn: "200",
  "bank tabungan negara": "200",
  "bank bsi (bank syariah indonesia)": "451",
  "bank bsi": "451",
  bsi: "451",
  "bank syariah indonesia": "451",
  "bank bca": "014",
  bca: "014",
  "bank central asia": "014",
};

const getKodeBank = (namaBank?: string, kodeBankDb?: string) => {
  if (
    kodeBankDb &&
    kodeBankDb.trim() &&
    kodeBankDb !== "000" &&
    kodeBankDb !== "999"
  ) {
    return kodeBankDb.trim();
  }
  if (!namaBank) return "-";
  const lower = namaBank.toLowerCase().trim();
  for (const [k, v] of Object.entries(BANK_CODE_MAP)) {
    if (lower.includes(k)) return v;
  }
  return "999";
};

const normalizeBankKey = (namaBank?: string) => {
  if (!namaBank) return "";
  const lower = namaBank.toLowerCase().trim();
  if (lower.includes("mandiri")) return "Bank Mandiri";
  if (lower.includes("bri") || lower.includes("rakyat indonesia"))
    return "Bank BRI";
  if (lower.includes("bni") || lower.includes("negara indonesia"))
    return "Bank BNI";
  if (lower.includes("btn") || lower.includes("tabungan negara"))
    return "Bank BTN";
  if (lower.includes("bsi") || lower.includes("syariah indonesia"))
    return "Bank BSI (Bank Syariah Indonesia)";
  if (lower.includes("bca") || lower.includes("central asia"))
    return "Bank BCA";
  return namaBank.trim();
};

const sortKategoriDokumen = (cats: any[]) => {
  return [...cats].sort((a, b) => {
    const aIsLainnya =
      a.nama_kategori?.toLowerCase().includes("lainnya") ||
      Number(a.id) === 999;
    const bIsLainnya =
      b.nama_kategori?.toLowerCase().includes("lainnya") ||
      Number(b.id) === 999;
    if (aIsLainnya && !bIsLainnya) return 1;
    if (!aIsLainnya && bIsLainnya) return -1;
    return Number(a.id) - Number(b.id);
  });
};

const getDisplayPeriode = (periode?: string, tanggal?: string) => {
  if (periode && periode.trim() && periode !== "-" && periode !== "None")
    return periode;
  if (tanggal) {
    try {
      const d = new Date(tanggal);
      if (!isNaN(d.getTime())) {
        const m = d.toLocaleDateString("id-ID", { month: "long" });
        const y = d.getFullYear();
        return `${m.charAt(0).toUpperCase() + m.slice(1)} ${y}`;
      }
    } catch {}
  }
  return "-";
};

const formatTanggalIndo = (tanggal?: string) => {
  if (!tanggal) return "-";
  try {
    const d = new Date(tanggal);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  } catch {}
  return String(tanggal).split("T")[0];
};

const openFile = async (bukti_file: string, token: string) => {
  const url = bukti_file.startsWith("http")
    ? bukti_file
    : `${API}${bukti_file.startsWith("/api") ? bukti_file.replace("/api", "") : bukti_file}`;
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() || "";
  const isExcel = ["xlsx", "xls", "csv"].includes(ext);
  if (isExcel) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = url.split("/").pop()?.split("?")[0] || "file.xlsx";
    a.click();
    URL.revokeObjectURL(a.href);
  } else {
    window.open(`${url}?token=${token}`, "_blank");
  }
};

export default function PimpinanpencatatanPage() {
  const { token } = useAuth();
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [kategori, setKategori] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterKategori, setFilterKategori] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterPeriode, setFilterPeriode] = useState("");

  const [selectedBankDrawer, setSelectedBankDrawer] = useState<string | null>(
    null,
  );
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const currentMonthName = new Date().toLocaleDateString("id-ID", {
    month: "long",
  });
  const currentYear = new Date().getFullYear();
  const defaultPeriode = `${currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)} ${currentYear}`;
  const todayDate = new Date().toISOString().split("T")[0];

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tanggal: todayDate,
    periode: defaultPeriode,
    id_kategori: "",
    kode_bank: "",
    nama_bank: "",
    nominal: "",
    saldo_akhir: "",
    uraian: "",
    jenis: "debit",
    nomor_rekening_bank: "",
    nama_rekening: "",
    catatan_audit: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [customBank, setCustomBank] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [aiScanning, setAiScanning] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTx, resCat] = await Promise.all([
        fetch(`${API}/pencatatan`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/pencatatan/kategori`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const jTx = await resTx.json();
      const jCat = await resCat.json();
      if (jTx.success) setTransaksi(jTx.data);
      if (jCat.success) setKategori(jCat.data);
    } catch {
      toast.error("Gagal memuat daftar bukti transaksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const sortedKategori = sortKategoriDokumen(kategori);

  const handleToggleStatus = async (item: any) => {
    const currentActive = item.is_active !== 0;
    const nextActive = currentActive ? 0 : 1;
    setTogglingId(item.id);

    setTransaksi((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, is_active: nextActive } : t)),
    );

    try {
      const res = await fetch(`${API}/pencatatan/${item.id}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: nextActive }),
      });
      const j = await res.json();
      if (j.success) {
        toast.success(
          nextActive === 1
            ? `Bukti diaktifkan â€” Saldo ditambahkan ke total ${item.nama_bank || "Bank"}`
            : `Bukti dinonaktifkan â€” Saldo dikecualikan dari total ${item.nama_bank || "Bank"}`,
        );
      } else {
        setTransaksi((prev) =>
          prev.map((t) =>
            t.id === item.id ? { ...t, is_active: currentActive ? 1 : 0 } : t,
          ),
        );
        toast.error(j.message || "Gagal mengubah status bukti");
      }
    } catch {
      setTransaksi((prev) =>
        prev.map((t) =>
          t.id === item.id ? { ...t, is_active: currentActive ? 1 : 0 } : t,
        ),
      );
      toast.error("Gagal menghubungi server");
    } finally {
      setTogglingId(null);
    }
  };

  const findExistingNoRekForBank = (bankName: string) => {
    const norm = normalizeBankKey(bankName);
    const found = transaksi.find(
      (t) =>
        normalizeBankKey(t.nama_bank) === norm &&
        t.nomor_rekening_bank &&
        String(t.nomor_rekening_bank).trim() !== "",
    );
    return found ? String(found.nomor_rekening_bank) : "";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setAiResult(null);
    setAiError("");

    if (!selectedFile) return;

    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (["pdf", "xlsx", "xls"].includes(ext || "")) {
      setAiScanning(true);
      try {
        const fd = new FormData();
        fd.append("data", selectedFile, selectedFile.name);
        const res = await fetch("/api/ai-scan", {
          method: "POST",
          body: fd,
        });
        if (res.ok) {
          const result = await res.json();
          setAiResult(result);

          const isRekeningKoran =
            (result.kategori &&
              result.kategori.toLowerCase().includes("rekening")) ||
            Boolean(result.bank) ||
            Boolean(result.nomor_rekening) ||
            selectedFile.name.toLowerCase().includes("rekening") ||
            selectedFile.name.toLowerCase().includes("rk") ||
            selectedFile.name.toLowerCase().includes("koran");

          setFormData((prev) => {
            const updated = { ...prev };
            if (isRekeningKoran) {
              const rkCat = sortedKategori.find(
                (k) =>
                  k.nama_kategori?.toLowerCase().includes("rekening koran") ||
                  k.nama_kategori?.toLowerCase().includes("rekening_koran"),
              );
              if (rkCat) updated.id_kategori = String(rkCat.id);
            }
            if (result.bank) {
              const bName = result.bank.toLowerCase().trim();
              let matchedBank = BANK_BUMN_LIST.find((b) => {
                const cleanB = b.toLowerCase().replace("bank ", "").trim();
                return (
                  bName.includes(cleanB) ||
                  cleanB.includes(bName) ||
                  (bName.includes("bsi") && b.toLowerCase().includes("bsi"))
                );
              });
              if (!matchedBank) matchedBank = result.bank || "";
              updated.nama_bank = matchedBank || "";
              updated.kode_bank = getKodeBank(matchedBank);
              if (!result.nomor_rekening) {
                const existingRek = findExistingNoRekForBank(matchedBank || "");
                if (existingRek) updated.nomor_rekening_bank = existingRek;
              }
            }
            const extractedNominal =
              result.nominal ?? result.saldo_rekening ?? result.saldo_akhir;
            if (
              extractedNominal !== undefined &&
              extractedNominal !== null &&
              Number(extractedNominal) > 0
            ) {
              updated.nominal = String(extractedNominal);
              updated.saldo_akhir = String(extractedNominal);
            }
            if (result.nomor_rekening) {
              updated.nomor_rekening_bank = String(result.nomor_rekening);
            }
            const namaBulanList = [
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Agustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ];
            let detectedBulanName = "";
            if (
              result.bulan &&
              typeof result.bulan === "number" &&
              result.bulan >= 1 &&
              result.bulan <= 12
            ) {
              detectedBulanName = namaBulanList[result.bulan - 1];
            } else if (result.bulan && typeof result.bulan === "string") {
              const matched = namaBulanList.find((b) =>
                b.toLowerCase().includes(result.bulan.toLowerCase()),
              );
              if (matched) detectedBulanName = matched;
            } else {
              const lowerName = selectedFile.name.toLowerCase();
              const matched = namaBulanList.find(
                (b) =>
                  lowerName.includes(b.toLowerCase()) ||
                  lowerName.includes(b.toLowerCase().slice(0, 3)),
              );
              if (matched) detectedBulanName = matched;
            }
            if (detectedBulanName) {
              const detectedTahun = result.tahun || new Date().getFullYear();
              updated.periode = `${detectedBulanName} ${detectedTahun}`;
            }
            if (!prev.uraian) {
              if (result.bank) {
                updated.uraian = `Pencatatan Rekening Koran ${result.bank}`;
              } else if (result.judul) {
                updated.uraian = `Pencatatan ${result.judul}`;
              }
            }
            return updated;
          });
        }
      } catch {
        setAiError("Gagal menganalisis otomatis berkas.");
      } finally {
        setAiScanning(false);
      }
    }
  };

  const filteredData = transaksi.filter((t) => {
    const matchKategori =
      !filterKategori || String(t.id_kategori) === filterKategori;
    const matchJenis = !filterJenis || t.jenis === filterJenis;
    const tPeriode = getDisplayPeriode(t.periode, t.tanggal);
    const matchPeriode =
      !filterPeriode || tPeriode.toLowerCase() === filterPeriode.toLowerCase();
    return matchKategori && matchJenis && matchPeriode;
  });

  const uniquePeriode = Array.from(
    new Set(
      transaksi
        .map((t) => getDisplayPeriode(t.periode, t.tanggal))
        .filter((p) => p !== "-"),
    ),
  ).sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    const katName =
      sortedKategori.find((k) => String(k.id) === formData.id_kategori)
        ?.nama_kategori || "Dokumen";
    const finalBank =
      formData.nama_bank === "Bank Lainnya" && customBank.trim()
        ? customBank.trim()
        : formData.nama_bank;
    const finalKodeBank = getKodeBank(finalBank, formData.kode_bank);
    const finalUraian =
      formData.uraian?.trim() ||
      `Pencatatan ${katName} - ${finalBank || "Bank"} (${formData.periode})`;
    const finalTanggal = formData.tanggal || todayDate;
    const finalNominal = formData.saldo_akhir || formData.nominal || "0";

    try {
      const data = new FormData();
      data.append("tanggal", finalTanggal);
      data.append("periode", formData.periode);
      data.append("uraian", finalUraian);
      data.append("jenis", "debit");
      data.append("id_kategori", formData.id_kategori);
      data.append("nominal", finalNominal);
      data.append("saldo_akhir", finalNominal);
      data.append("catatan_audit", formData.catatan_audit || "");
      data.append("nomor_rekening_bank", formData.nomor_rekening_bank || "");
      data.append("nama_rekening", formData.nama_rekening || "");
      data.append("nama_bank", finalBank);
      data.append("kode_bank", finalKodeBank);
      if (file) data.append("file", file);

      const res = await fetch(`${API}/pencatatan`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const j = await res.json();
      if (j.success) {
        toast.success("Berkas bukti berhasil diunggah & ditambahkan ke tabel!");
        setShowForm(false);
        resetForm();
        fetchData();
      } else {
        toast.error(j.message || "Gagal menyimpan bukti transaksi");
      }
    } catch {
      toast.error("Terjadi kesalahan server saat menyimpan");
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tanggal: todayDate,
      periode: defaultPeriode,
      id_kategori: "",
      kode_bank: "",
      nama_bank: "",
      nominal: "",
      saldo_akhir: "",
      uraian: "",
      jenis: "debit",
      nomor_rekening_bank: "",
      nama_rekening: "",
      catatan_audit: "",
    });
    setFile(null);
    setAiResult(null);
    setAiError("");
    setCustomBank("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const exportToExcel = () => {
    const wsData = filteredData.map((t, index) => ({
      No: index + 1,
      Tanggal: formatTanggalIndo(t.tanggal),
      Bulan: getDisplayPeriode(t.periode, t.tanggal),
      "Kode Bank": getKodeBank(t.nama_bank, t.kode_bank),
      "Nama Bank": t.nama_bank || "-",
      "Nomor Rekening": t.nomor_rekening_bank || "-",
      "Kategori Dokumen": t.nama_kategori,
      "Saldo Akhir": Number(t.saldo_akhir || t.nominal || 0),
      "Status Bukti": t.is_active === 0 ? "Nonaktif" : "Aktif",
      Uraian: t.uraian,
      "Dibuat Oleh": t.pembuat || "-",
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Bukti Transaksi");
    XLSX.writeFile(wb, "Bukti_Kas_Transaksi_Pimpinan.xlsx");
  };

  const activeTransaksi = transaksi.filter((t) => t.is_active !== 0);
  const totalNominal = activeTransaksi.reduce(
    (acc, t) => acc + (Number(t.saldo_akhir || t.nominal) || 0),
    0,
  );

  const bankGroupsMap = transaksi.reduce(
    (acc, t) => {
      if (!t.nama_bank) return acc;
      const key = normalizeBankKey(t.nama_bank);
      if (!acc[key]) {
        acc[key] = {
          nama_bank: key,
          kode_bank: getKodeBank(key, t.kode_bank),
          nomor_rekening_set: new Set<string>(),
          items: [] as any[],
          activeTotal: 0,
          activeCount: 0,
        };
      }
      if (t.nomor_rekening_bank && String(t.nomor_rekening_bank).trim()) {
        acc[key].nomor_rekening_set.add(String(t.nomor_rekening_bank).trim());
      }
      acc[key].items.push(t);
      if (t.is_active !== 0) {
        acc[key].activeTotal += Number(t.saldo_akhir || t.nominal || 0);
        acc[key].activeCount += 1;
      }
      return acc;
    },
    {} as Record<
      string,
      {
        nama_bank: string;
        kode_bank: string;
        nomor_rekening_set: Set<string>;
        items: any[];
        activeTotal: number;
        activeCount: number;
      }
    >,
  );

  const selectedBankGroup = selectedBankDrawer
    ? bankGroupsMap[normalizeBankKey(selectedBankDrawer)] || null
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Unggah & Kelola Bukti Transaksi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Unggah berkas bukti transaksi (PDF/Gambar/Excel) dengan kunci utama
            Tanggal & Saldo Akhir yang terhubung langsung per Bank.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Unggah Bukti Baru
          </button>
        </div>
      </div>

      {/* Stats Summary Banner */}
      <div className="w-full space-y-3">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Total Saldo Bukti Aktif Tercatat</span>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
              Rp {totalNominal.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {activeTransaksi.length} Bukti Aktif
            </span>
          </div>
        </div>

        {Object.values(bankGroupsMap).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(bankGroupsMap).map((bg: any) => {
              const noRekArr = Array.from(bg.nomor_rekening_set);
              return (
                <div
                  key={bg.nama_bank}
                  onClick={() => setSelectedBankDrawer(bg.nama_bank)}
                  className="bg-white border border-gray-200 hover:border-blue-400 rounded-xl p-3.5 shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 rounded">
                        #{bg.kode_bank}
                      </span>
                      <span className="text-xs font-bold text-gray-900 truncate">
                        {bg.nama_bank}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-gray-500 truncate">
                      No. Rek: {noRekArr.length > 0 ? noRekArr.join(", ") : "-"}
                    </p>
                    <p className="text-sm font-extrabold text-emerald-700">
                      Rp {bg.activeTotal.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBankDrawer(bg.nama_bank);
                    }}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white text-xs font-semibold transition-colors"
                  >
                    <span>{bg.items.length} Bukti</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filterPeriode}
          onChange={(e) => setFilterPeriode(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white"
        >
          <option value="">Semua Bulan</option>
          {uniquePeriode.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white"
        >
          <option value="">Semua Kategori Dokumen</option>
          {sortedKategori.map((k) => (
            <option key={k.id} value={String(k.id)}>
              {k.nama_kategori}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-400 ml-auto">
          {filteredData.length} dari {transaksi.length} data
        </span>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-8 border border-gray-100">
            <div className="px-6 py-4 md:px-8 md:py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Unggah Bukti Laporan Rekening Koran / Kas
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Kunci Utama: Tanggal Laporan & Saldo Akhir, serta Relasi Kode
                  Bank, Nama Bank, dan Nomor Rekening
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              <div className="p-4 bg-blue-50/50 border border-blue-200/80 rounded-2xl space-y-2">
                <label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>
                    Upload Berkas Bukti Laporan (PDF / Gambar / Excel) *
                  </span>
                </label>
                <input
                  type="file"
                  required
                  ref={fileInputRef}
                  accept=".pdf,.xlsx,.xls,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tanggal Bukti / Laporan *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Bulan Transaksi *
                  </label>
                  <select
                    required
                    value={formData.periode}
                    onChange={(e) =>
                      setFormData({ ...formData, periode: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white"
                  >
                    <option value="">Pilih Bulan...</option>
                    {[
                      "Januari",
                      "Februari",
                      "Maret",
                      "April",
                      "Mei",
                      "Juni",
                      "Juli",
                      "Agustus",
                      "September",
                      "Oktober",
                      "November",
                      "Desember",
                    ].map((m) => (
                      <option
                        key={m}
                        value={`${m} ${new Date().getFullYear()}`}
                      >
                        {m} {new Date().getFullYear()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama & Kode Bank *
                  </label>
                  <select
                    required
                    value={formData.nama_bank}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        nama_bank: val,
                        kode_bank: getKodeBank(val),
                        nomor_rekening_bank:
                          formData.nomor_rekening_bank ||
                          findExistingNoRekForBank(val),
                      });
                    }}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-white"
                  >
                    <option value="">Pilih Bank...</option>
                    {BANK_BUMN_LIST.map((b) => (
                      <option key={b} value={b}>
                        {b === "Bank Lainnya" ? b : `[${getKodeBank(b)}] ${b}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nomor Rekening Bank *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nomor_rekening_bank}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nomor_rekening_bank: e.target.value,
                      })
                    }
                    placeholder="Nomor rekening..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kategori Dokumen *
                  </label>
                  <select
                    required
                    value={formData.id_kategori}
                    onChange={(e) =>
                      setFormData({ ...formData, id_kategori: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-white"
                  >
                    <option value="">Pilih Kategori...</option>
                    {sortedKategori.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Saldo Akhir (Rp) *
                </label>
                <input
                  type="text"
                  required
                  value={
                    formData.saldo_akhir
                      ? Number(formData.saldo_akhir).toLocaleString("id-ID")
                      : ""
                  }
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setFormData({
                      ...formData,
                      saldo_akhir: raw,
                      nominal: raw,
                    });
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold bg-white"
                  placeholder="Contoh: 15.000.000"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || aiScanning}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  {submitLoading ? "Menyimpan..." : "Unggah & Simpan Bukti"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabel Pencatatan */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Tanggal & Bulan
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Kategori Dokumen
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Relasi Bank (No. Bank â€¢ Nama Bank â€¢ No. Rek) & Daftar Bukti
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">
                  Saldo Akhir
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">
                  Status Saldo
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">
                  Berkas Bukti
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Belum ada berkas bukti yang diunggah.
                  </td>
                </tr>
              ) : (
                filteredData.map((t) => {
                  const isActive = t.is_active !== 0;
                  const bankKey = normalizeBankKey(t.nama_bank);
                  const bankGroup = bankGroupsMap[bankKey];
                  const kodeBank = getKodeBank(t.nama_bank, t.kode_bank);
                  const noRek =
                    t.nomor_rekening_bank ||
                    (bankGroup &&
                      Array.from(bankGroup.nomor_rekening_set)[0]) ||
                    "";

                  return (
                    <tr
                      key={t.id}
                      className={clsx(
                        isActive
                          ? "hover:bg-gray-50/70"
                          : "bg-gray-50/60 opacity-70",
                      )}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            {formatTanggalIndo(t.tanggal)}
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                            {getDisplayPeriode(t.periode, t.tanggal)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {t.nama_kategori}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {t.nama_bank ? (
                          <div className="flex items-center justify-between gap-3 bg-gray-50/90 border border-gray-200/80 px-3 py-2 rounded-xl">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 rounded">
                                  #{kodeBank}
                                </span>
                                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                                  {t.nama_bank}
                                </span>
                              </div>
                              <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                                No. Rek:{" "}
                                <span className="font-semibold text-gray-700">
                                  {noRek || "-"}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedBankDrawer(t.nama_bank)}
                              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              <span>
                                Bukti ({bankGroup ? bankGroup.items.length : 1})
                              </span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div
                          className={clsx(
                            "font-bold",
                            isActive
                              ? "text-gray-900"
                              : "line-through text-gray-400",
                          )}
                        >
                          Rp{" "}
                          {Number(
                            t.saldo_akhir || t.nominal || 0,
                          ).toLocaleString("id-ID")}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          disabled={togglingId === t.id}
                          onClick={() => handleToggleStatus(t)}
                          className={clsx(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border",
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-300",
                          )}
                        >
                          <span
                            className={clsx(
                              "w-2 h-2 rounded-full",
                              isActive ? "bg-emerald-500" : "bg-gray-400",
                            )}
                          />
                          {isActive ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {t.bukti_file ? (
                          <button
                            onClick={() => openFile(t.bukti_file, token || "")}
                            className="inline-flex items-center justify-center p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLIDE-OVER BAR / DRAWER BUKTI PER BANK */}
      {selectedBankDrawer && selectedBankGroup && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedBankDrawer(null)}
          />
          <div className="relative z-10 w-full max-w-xl bg-white h-full shadow-2xl border-l border-gray-200 flex flex-col overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-500/30 border border-blue-300/30 text-xs font-mono font-bold text-blue-100">
                    KODE BANK: #{selectedBankGroup.kode_bank}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-300/30 text-xs font-semibold text-emerald-200">
                    {selectedBankGroup.activeCount} Aktif /{" "}
                    {selectedBankGroup.items.length} Total Bukti
                  </span>
                </div>
                <h3 className="text-xl font-extrabold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-300" />
                  <span>{selectedBankGroup.nama_bank}</span>
                </h3>
                <p className="text-xs text-blue-200 font-mono">
                  No. Rekening:{" "}
                  <strong className="text-white">
                    {Array.from(selectedBankGroup.nomor_rekening_set).join(
                      ", ",
                    ) || "Belum dicantumkan"}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBankDrawer(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 bg-blue-50/80 border-b border-blue-100">
              <p className="text-xs font-semibold text-blue-800 uppercase">
                Total Saldo Aktif ({selectedBankGroup.nama_bank})
              </p>
              <p className="text-2xl font-black text-blue-700 mt-0.5">
                Rp {selectedBankGroup.activeTotal.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50/50">
              {selectedBankGroup.items.map((item: any, idx: number) => {
                const isActive = item.is_active !== 0;
                const nominalVal = Number(
                  item.saldo_akhir || item.nominal || 0,
                );
                return (
                  <div
                    key={item.id}
                    className={clsx(
                      "rounded-2xl border p-4 bg-white shadow-xs",
                      isActive
                        ? "border-gray-200"
                        : "border-gray-200/70 bg-gray-50 opacity-75",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-gray-400">
                            #{idx + 1}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">
                            <Calendar className="w-3 h-3" />
                            {formatTanggalIndo(item.tanggal)}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold">
                            {getDisplayPeriode(item.periode, item.tanggal)}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-gray-600">
                          No. Rek:{" "}
                          <strong>{item.nomor_rekening_bank || "-"}</strong> â€¢
                          Kode Bank:{" "}
                          <strong>
                            #{getKodeBank(item.nama_bank, item.kode_bank)}
                          </strong>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          type="button"
                          disabled={togglingId === item.id}
                          onClick={() => handleToggleStatus(item)}
                          className={clsx(
                            "relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                            isActive ? "bg-emerald-600" : "bg-gray-300",
                          )}
                        >
                          <span
                            className={clsx(
                              "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition",
                              isActive ? "translate-x-7" : "translate-x-0",
                            )}
                          />
                        </button>
                        <span
                          className={clsx(
                            "text-[11px] font-bold",
                            isActive ? "text-emerald-700" : "text-gray-500",
                          )}
                        >
                          {isActive ? "Status: Aktif" : "Status: Nonaktif"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span
                        className={clsx(
                          "text-base font-extrabold",
                          isActive
                            ? "text-gray-900"
                            : "line-through text-gray-400",
                        )}
                      >
                        Rp {nominalVal.toLocaleString("id-ID")}
                      </span>
                      {item.bukti_file && (
                        <button
                          type="button"
                          onClick={() => openFile(item.bukti_file, token || "")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Lihat Berkas Bukti</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

