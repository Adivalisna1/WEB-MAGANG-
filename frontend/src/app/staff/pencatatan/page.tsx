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
  Power,
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
  if (kodeBankDb && kodeBankDb.trim() && kodeBankDb !== "000" && kodeBankDb !== "999") {
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
  if (lower.includes("bri") || lower.includes("rakyat indonesia")) return "Bank BRI";
  if (lower.includes("bni") || lower.includes("negara indonesia")) return "Bank BNI";
  if (lower.includes("btn") || lower.includes("tabungan negara")) return "Bank BTN";
  if (lower.includes("bsi") || lower.includes("syariah indonesia")) return "Bank BSI (Bank Syariah Indonesia)";
  if (lower.includes("bca") || lower.includes("central asia")) return "Bank BCA";
  return namaBank.trim();
};

// Helper urutkan kategori sesuai ID di database, dengan 'Lainnya' selalu paling bawah
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

// Helper tampilkan periode (fallback otomatis dari tanggal jika kolom periode kosong)
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

// Helper buka file: PDF/DOCX â†’ preview tab baru, Excel â†’ auto download
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

export default function StaffpencatatanPage() {
  const { token } = useAuth();
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [kategori, setKategori] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filterKategori, setFilterKategori] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterPeriode, setFilterPeriode] = useState("");

  // Drawer / Slide-over Bar State untuk Bukti per Bank
  const [selectedBankDrawer, setSelectedBankDrawer] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Form State
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

  // AI Auto Analysis State
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
    } catch (err) {
      toast.error(
        "Gagal memuat daftar bukti transaksi. Silakan periksa koneksi atau klik Refresh.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // Urutkan kategori sesuai spesifikasi: urut ID, 'Lainnya' di paling bawah
  const sortedKategori = sortKategoriDokumen(kategori);

  // Toggle Status Bukti (Aktif / Nonaktif) -> Berakibat langsung pada Total Saldo Bank
  const handleToggleStatus = async (item: any) => {
    const currentActive = item.is_active !== 0;
    const nextActive = currentActive ? 0 : 1;
    setTogglingId(item.id);

    // Optimistic update agar saldo langsung berubah real-time
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
        // Rollback jika gagal
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
      toast.error("Gagal menghubungi server untuk mengubah status");
    } finally {
      setTogglingId(null);
    }
  };

  // Cari nomor rekening terakhir untuk bank tertentu agar relasi No Bank - Nama Bank - No Rek otomatis terisi
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

  // Handle otomatis scan berkas ketika user memilih file
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

            // 1. Auto pilih Kategori Dokumen = Rekening Koran
            if (isRekeningKoran) {
              const rkCat = sortedKategori.find(
                (k) =>
                  k.nama_kategori?.toLowerCase().includes("rekening koran") ||
                  k.nama_kategori?.toLowerCase().includes("rekening_koran"),
              );
              if (rkCat) {
                updated.id_kategori = String(rkCat.id);
              }
            }

            // 2. Auto deteksi nama Bank & Kode Bank dari berkas
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
              if (!matchedBank) {
                matchedBank = result.bank || "";
              }
              updated.nama_bank = matchedBank || "";
              updated.kode_bank = getKodeBank(matchedBank);

              // Jika nomor rekening belum ada dari scan, coba ambil dari relasi bank yang sudah pernah diupload
              if (!result.nomor_rekening) {
                const existingRek = findExistingNoRekForBank(matchedBank || "");
                if (existingRek) updated.nomor_rekening_bank = existingRek;
              }
            }

            // 3. Auto isi nominal saldo akhir jika terdeteksi
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

            // 4. Auto isi nomor rekening jika terdeteksi
            if (result.nomor_rekening) {
              updated.nomor_rekening_bank = String(result.nomor_rekening);
            }

            // 5. Auto deteksi Bulan & Periode Transaksi dari berkas / nama file
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
            let detectedBulanIdx = -1;
            let detectedBulanName = "";
            if (
              result.bulan &&
              typeof result.bulan === "number" &&
              result.bulan >= 1 &&
              result.bulan <= 12
            ) {
              detectedBulanIdx = result.bulan - 1;
              detectedBulanName = namaBulanList[detectedBulanIdx];
            } else if (result.bulan && typeof result.bulan === "string") {
              const idx = namaBulanList.findIndex((b) =>
                b.toLowerCase().includes(result.bulan.toLowerCase()),
              );
              if (idx !== -1) {
                detectedBulanIdx = idx;
                detectedBulanName = namaBulanList[idx];
              }
            } else {
              const lowerName = selectedFile.name.toLowerCase();
              const idx = namaBulanList.findIndex(
                (b) =>
                  lowerName.includes(b.toLowerCase()) ||
                  lowerName.includes(b.toLowerCase().slice(0, 3)),
              );
              if (idx !== -1) {
                detectedBulanIdx = idx;
                detectedBulanName = namaBulanList[idx];
              }
            }

            if (detectedBulanName) {
              const detectedTahun = result.tahun || new Date().getFullYear();
              updated.periode = `${detectedBulanName} ${detectedTahun}`;
            }

            // 6. Auto isi uraian jika masih kosong
            if (!prev.uraian) {
              if (result.bank) {
                updated.uraian = `Pencatatan Rekening Koran ${result.bank}`;
              } else if (result.judul) {
                updated.uraian = `Pencatatan ${result.judul}`;
              }
            }

            return updated;
          });

          if (result.bank) {
            toast.success(`AI: Berkas terbaca dari ${result.bank}!`);
          } else {
            toast.success("AI: Analisis berkas selesai!");
          }
        }
      } catch (err: any) {
        console.error("AI Scan error:", err);
        setAiError("Gagal menganalisis otomatis berkas.");
      } finally {
        setAiScanning(false);
      }
    }
  };

  // Filtered data
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
        toast.success(
          "Bukti laporan berhasil diunggah & langsung ditambahkan ke tabel pencatatan!",
        );
        setShowForm(false);
        resetForm();
        fetchData();
      } else {
        toast.error(j.message || "Gagal menyimpan bukti transaksi");
      }
    } catch (err) {
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

    const katStr = filterKategori
      ? `_${kategori.find((k) => String(k.id) === filterKategori)?.nama_kategori || ""}`
      : "";
    const perStr = filterPeriode ? `_${filterPeriode}` : "";
    const fileName = `Bukti_Kas_Transaksi${perStr}${katStr}.xlsx`.replace(
      /\s+/g,
      "_",
    );

    XLSX.writeFile(wb, fileName);
  };

  // Hanya menjumlahkan bukti yang berstatus AKTIF (is_active !== 0)
  const activeTransaksi = transaksi.filter((t) => t.is_active !== 0);
  const totalNominal = activeTransaksi.reduce(
    (acc, t) => acc + (Number(t.saldo_akhir || t.nominal) || 0),
    0,
  );

  // Relasi Pengelompokan Bukti per Bank (No Bank, Nama Bank, No Rekening, Total Saldo Aktif)
  interface BankGroupItem {
    nama_bank: string;
    kode_bank: string;
    nomor_rekening_set: Set<string>;
    items: any[];
    activeTotal: number;
    activeCount: number;
  }

  const bankGroupsMap: Record<string, BankGroupItem> = transaksi.reduce(
    (acc: Record<string, BankGroupItem>, t: any) => {
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
    {} as Record<string, BankGroupItem>,
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

      {/* Stats Summary Banner (Full Width) */}
      <div className="w-full space-y-3">
        <div className="staff-mini-card w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="staff-mini-label">
              <span>Total Saldo Bukti Aktif Tercatat</span>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <div className="staff-mini-val text-blue-600 text-2xl sm:text-3xl mt-1">
              Rp {totalNominal.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {activeTransaksi.length} Bukti Aktif
            </span>
            {transaksi.length - activeTransaksi.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-600">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                {transaksi.length - activeTransaksi.length} Nonaktif
              </span>
            )}
          </div>
        </div>

        {/* Ringkasan Cepat Saldo Aktif Per Bank (Klik untuk buka Bar/Drawer Bukti Bank) */}
        {Object.values(bankGroupsMap).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(bankGroupsMap).map((bg) => {
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
        {(filterPeriode || filterJenis || filterKategori) && (
          <button
            onClick={() => {
              setFilterPeriode("");
              setFilterJenis("");
              setFilterKategori("");
            }}
            className="text-sm text-red-500 hover:text-red-700 px-2 py-1 transition-colors"
          >
            Reset Filter
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {filteredData.length} dari {transaksi.length} data
        </span>
      </div>

      {/* Modal Unggah Bukti Transaksi */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-8 border border-gray-100 transition-all">
            <div className="px-6 py-4 md:px-8 md:py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span>Unggah Bukti Laporan Rekening Koran / Kas</span>
                  {aiScanning && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Analisis AI...
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Kunci Utama: Tanggal Laporan & Saldo Akhir, serta Relasi Kode
                  Bank, Nama Bank, dan Nomor Rekening
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              {/* Banner Hasil Analisis Otomatis AI */}
              {aiScanning && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-3 animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold">
                      Sedang Menganalisis Berkas Otomatis...
                    </p>
                    <p className="text-blue-600 mt-0.5">
                      Membaca isi berkas, mendeteksi kode & nama bank, nomor
                      rekening, tanggal, dan saldo akhir.
                    </p>
                  </div>
                </div>
              )}

              {aiResult &&
                !aiScanning &&
                (aiResult.bank ||
                  aiResult.nominal ||
                  aiResult.nomor_rekening) && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold text-emerald-800 flex items-center gap-2 flex-wrap">
                        <span>âœ¨ Analisis Berkas Berhasil:</span>
                        {aiResult.bank && (
                          <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            [{getKodeBank(aiResult.bank)}] {aiResult.bank}
                          </span>
                        )}
                        {aiResult.kategori && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {aiResult.kategori}
                          </span>
                        )}
                      </div>
                      <p className="text-emerald-700">
                        {aiResult.bank && (
                          <span>
                            Bank <strong>{aiResult.bank}</strong> berhasil
                            dideteksi.{" "}
                          </span>
                        )}
                        {(aiResult.nominal != null ||
                          aiResult.saldo_rekening != null) && (
                          <span>
                            Saldo Akhir:{" "}
                            <strong>
                              Rp{" "}
                              {Number(
                                aiResult.nominal ?? aiResult.saldo_rekening,
                              ).toLocaleString("id-ID")}
                            </strong>
                            .{" "}
                          </span>
                        )}
                        {aiResult.nomor_rekening && (
                          <span>
                            No Rekening:{" "}
                            <strong>{aiResult.nomor_rekening}</strong>.{" "}
                          </span>
                        )}
                        Form otomatis disesuaikan!
                      </p>
                    </div>
                  </div>
                )}

              {aiError && !aiScanning && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Row 1: Berkas Bukti / PDF Rekening Koran */}
              <div className="p-4 bg-blue-50/50 border border-blue-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>
                      Upload Berkas Bukti Laporan (PDF / Gambar / Excel) *
                    </span>
                  </label>
                  <span className="text-[11px] font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Otomatis Masuk ke Tabel Pencatatan & Rekening Koran
                  </span>
                </div>
                <div className="border border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-3.5 bg-white transition-colors">
                  <input
                    type="file"
                    required
                    ref={fileInputRef}
                    accept=".pdf,.xlsx,.xls,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-400 mt-2">
                    {aiScanning
                      ? "Sedang memindai berkas..."
                      : "Format PDF Rekening Koran atau berkas bukti akan dibaca otomatis oleh AI untuk mendeteksi Bank, No. Rekening, Bulan, dan Saldo Akhir."}
                  </p>
                </div>
              </div>

              {/* Row 2: KUNCI UTAMA WAKTU -> Tanggal Laporan & Bulan Transaksi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Tanggal Bukti / Laporan *
                    </span>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Kunci Utama #1
                    </span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => {
                      const val = e.target.value;
                      let nextPeriode = formData.periode;
                      if (val) {
                        const d = new Date(val);
                        if (!isNaN(d.getTime())) {
                          const m = d.toLocaleDateString("id-ID", {
                            month: "long",
                          });
                          const y = d.getFullYear();
                          nextPeriode = `${m.charAt(0).toUpperCase() + m.slice(1)} ${y}`;
                        }
                      }
                      setFormData({
                        ...formData,
                        tanggal: val,
                        periode: nextPeriode,
                      });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>Bulan Transaksi *</span>
                    <span className="text-[11px] font-normal text-gray-400">
                      Bulan pelaporan rekening koran
                    </span>
                  </label>
                  <select
                    required
                    value={formData.periode}
                    onChange={(e) =>
                      setFormData({ ...formData, periode: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white shadow-sm"
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
                      <option key={m} value={`${m} ${new Date().getFullYear()}`}>
                        {m} {new Date().getFullYear()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: RELASI BANK (No/Kode Bank, Nama Bank, Nomor Rekening) & Kategori */}
              <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Relasi Identitas Bank (No. Bank â€¢ Nama Bank â€¢ No. Rekening)
                  </span>
                  {formData.nama_bank && (
                    <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                      Kode Bank: {getKodeBank(formData.nama_bank, formData.kode_bank)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nama & Kode Bank *
                    </label>
                    <select
                      required
                      value={
                        BANK_BUMN_LIST.includes(formData.nama_bank)
                          ? formData.nama_bank
                          : formData.nama_bank
                            ? formData.nama_bank
                            : ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        const autoRek =
                          formData.nomor_rekening_bank ||
                          findExistingNoRekForBank(val);
                        setFormData({
                          ...formData,
                          nama_bank: val,
                          kode_bank: getKodeBank(val),
                          nomor_rekening_bank: autoRek,
                        });
                        if (val !== "Bank Lainnya") setCustomBank("");
                      }}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white shadow-sm"
                    >
                      <option value="">Pilih Bank...</option>
                      {formData.nama_bank &&
                        !BANK_BUMN_LIST.includes(formData.nama_bank) && (
                          <option value={formData.nama_bank}>
                            [{getKodeBank(formData.nama_bank)}]{" "}
                            {formData.nama_bank}
                          </option>
                        )}
                      {BANK_BUMN_LIST.map((b) => (
                        <option key={b} value={b}>
                          {b === "Bank Lainnya"
                            ? b
                            : `[${getKodeBank(b)}] ${b}`}
                        </option>
                      ))}
                    </select>
                    {formData.nama_bank === "Bank Lainnya" && (
                      <input
                        type="text"
                        required
                        value={customBank}
                        onChange={(e) => setCustomBank(e.target.value)}
                        placeholder="Ketikkan nama bank..."
                        className="mt-2 w-full px-3.5 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                      <span>Nomor Rekening Bank *</span>
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
                      placeholder="Contoh: 8100126932121000"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white shadow-sm"
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
                        setFormData({
                          ...formData,
                          id_kategori: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white shadow-sm"
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
              </div>

              {/* Row 4: KUNCI UTAMA SALDO AKHIR */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Saldo Akhir (Rp) *</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Kunci Utama #2 â€¢ Menentukan Total Saldo Bank
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    value={
                      formData.saldo_akhir
                        ? Number(formData.saldo_akhir).toLocaleString("id-ID")
                        : formData.nominal
                          ? Number(formData.nominal).toLocaleString("id-ID")
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
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                    placeholder="Contoh: 15.000.000"
                    title="Ketik angka, titik ribuan otomatis diformat"
                  />
                  {Boolean(formData.saldo_akhir || formData.nominal) && (
                    <p className="text-xs text-blue-600 font-bold mt-1.5 flex items-center gap-1">
                      <span>Terbaca:</span>
                      <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700">
                        Rp{" "}
                        {Number(
                          formData.saldo_akhir || formData.nominal,
                        ).toLocaleString("id-ID")}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || aiScanning}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {submitLoading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {submitLoading ? "Menyimpan..." : "Unggah & Simpan Bukti"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabel Utama Pencatatan Bukti Laporan */}
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
                        "transition-colors",
                        isActive
                          ? "hover:bg-gray-50/70"
                          : "bg-gray-50/60 opacity-70",
                      )}
                    >
                      <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            {formatTanggalIndo(t.tanggal)}
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-indigo-100">
                            {getDisplayPeriode(t.periode, t.tanggal)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {t.nama_kategori}
                      </td>

                      {/* Kolom Nama Bank + Relasi Kode Bank & No Rek + Tombol di Ujung Nama Bank */}
                      <td className="px-4 py-3 text-gray-600">
                        {t.nama_bank ? (
                          <div className="flex items-center justify-between gap-3 bg-gray-50/90 border border-gray-200/80 px-3 py-2 rounded-xl">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 rounded"
                                  title="Nomor / Kode Bank"
                                >
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

                            {/* TOMBOL DI UJUNG NAMA BANK UNTUK MEMBUKA BAR DAFTAR BUKTI REKENING KORAN */}
                            <button
                              type="button"
                              onClick={() => setSelectedBankDrawer(t.nama_bank)}
                              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer"
                              title={`Lihat seluruh daftar bukti rekening koran ${t.nama_bank}`}
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
                        {!isActive && (
                          <span className="text-[10px] text-amber-600 font-medium">
                            Dikecualikan dari Total
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border select-none",
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-300",
                          )}
                          title={isActive ? "Status Bukti: Aktif" : "Status Bukti: Nonaktif"}
                        >
                          <span
                            className={clsx(
                              "w-2 h-2 rounded-full",
                              isActive ? "bg-emerald-500" : "bg-gray-400",
                            )}
                          />
                          {isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {t.bukti_file ? (
                          <button
                            onClick={() => openFile(t.bukti_file, token || "")}
                            className="inline-flex items-center justify-center p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Lihat Bukti"
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

      {/* SLIDE-OVER BAR / DRAWER: DAFTAR SELURUH BUKTI REKENING KORAN ATAS NAMA BANK TERSEBUT */}
      {selectedBankDrawer && selectedBankGroup && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedBankDrawer(null)}
          />
          <div className="relative z-10 w-full max-w-xl bg-white h-full shadow-2xl border-l border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
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
                <h3 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-300" />
                  <span>{selectedBankGroup.nama_bank}</span>
                </h3>
                <p className="text-xs text-blue-200 font-mono">
                  No. Rekening Terdaftar:{" "}
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
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Tutup Bar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Saldo Aktif Card di dalam Bar */}
            <div className="px-6 py-4 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                  Total Saldo Aktif ({selectedBankGroup.nama_bank})
                </p>
                <p className="text-2xl font-black text-blue-700 mt-0.5">
                  Rp {selectedBankGroup.activeTotal.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-blue-600 mt-0.5">
                  Aktifkan atau nonaktifkan tombol status di bawah untuk
                  mengatur perhitungan total saldo bank ini.
                </p>
              </div>
            </div>

            {/* Daftar Seluruh Bukti Rekening Koran atas Nama Bank Tersebut */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Daftar Seluruh Bukti Rekening Koran (
                  {selectedBankGroup.items.length})
                </h4>
              </div>

              {selectedBankGroup.items.map((item, idx) => {
                const isActive = item.is_active !== 0;
                const nominalVal = Number(
                  item.saldo_akhir || item.nominal || 0,
                );
                return (
                  <div
                    key={item.id}
                    className={clsx(
                      "rounded-2xl border p-4 transition-all bg-white shadow-xs",
                      isActive
                        ? "border-gray-200 hover:border-blue-300"
                        : "border-gray-200/70 bg-gray-50 opacity-75",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-gray-400">
                            #{idx + 1}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                            <Calendar className="w-3 h-3" />
                            {formatTanggalIndo(item.tanggal)}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold">
                            {getDisplayPeriode(item.periode, item.tanggal)}
                          </span>
                        </div>

                        <p className="text-xs font-mono text-gray-600 pt-0.5">
                          No. Rek:{" "}
                          <strong className="text-gray-800">
                            {item.nomor_rekening_bank || "-"}
                          </strong>{" "}
                          â€¢ Kode Bank:{" "}
                          <strong className="text-gray-800">
                            #{getKodeBank(item.nama_bank, item.kode_bank)}
                          </strong>
                        </p>

                        <p className="text-xs text-gray-500 truncate">
                          {item.uraian || item.nama_kategori || "Rekening Koran"}
                        </p>
                      </div>

                      {/* Status Aktif / Nonaktif (Read-only untuk Operator) */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border select-none",
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-300",
                          )}
                        >
                          <span
                            className={clsx(
                              "w-1.5 h-1.5 rounded-full",
                              isActive ? "bg-emerald-500" : "bg-gray-400",
                            )}
                          />
                          {isActive ? "Status: Aktif" : "Status: Nonaktif"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] text-gray-400 block">
                          Saldo Akhir Bukti:
                        </span>
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
                      </div>

                      {item.bukti_file ? (
                        <button
                          type="button"
                          onClick={() => openFile(item.bukti_file, token || "")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Lihat Berkas Bukti</span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Tanpa berkas
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Total Saldo Aktif:{" "}
                <strong className="text-gray-900">
                  Rp {selectedBankGroup.activeTotal.toLocaleString("id-ID")}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBankDrawer(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Tutup Bar Bukti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

