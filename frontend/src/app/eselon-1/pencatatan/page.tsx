"use client";
import toast from "react-hot-toast";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Download,
  Paperclip,
  Search,
  DollarSign,
  Building2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  FileText,
  Calendar,
  CreditCard,
  Layers,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import * as XLSX from "xlsx";

const API =
  typeof window !== "undefined" && window.location.hostname
    ? `${window.location.protocol}//${window.location.hostname}:5000/api`
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

export default function Eselon1PencatatanPage() {
  const { token, user } = useAuth();
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [kategori, setKategori] = useState<any[]>([]);
  const [satkerList, setSatkerList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isOperator = user?.role === "operator" || user?.is_operator;

  // Filter State
  const [filterSatker, setFilterSatker] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterPeriode, setFilterPeriode] = useState("");
  const [searchUraian, setSearchUraian] = useState("");

  // Slide-over Bar / Drawer State per Bank
  const [selectedBankDrawer, setSelectedBankDrawer] = useState<string | null>(
    null,
  );
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Form State
  const currentMonthName = new Date().toLocaleDateString("id-ID", {
    month: "long",
  });
  const currentYear = new Date().getFullYear();
  const defaultPeriode = `${currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)} ${currentYear}`;
  const todayDate = new Date().toISOString().split("T")[0];

  const [showForm, setShowForm] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    tanggal: todayDate,
    periode: defaultPeriode,
    satker_id: "",
    uraian: "",
    jenis: "debit",
    id_kategori: "",
    kode_bank: "",
    nominal: "",
    saldo_akhir: "",
    catatan_audit: "",
    nomor_rekening_bank: "",
    nama_rekening: "",
    nama_bank: "",
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
      const [resTx, resCat, resSat] = await Promise.all([
        fetch(`${API}/pencatatan`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/pencatatan/kategori`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/satker`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const jTx = await resTx.json();
      const jCat = await resCat.json();
      const jSat = await resSat.json();
      if (jTx.success) setTransaksi(jTx.data);
      if (jCat.success) setKategori(jCat.data);
      if (jSat.success && Array.isArray(jSat.data)) {
        const binaan = user?.eselon_1_id
          ? jSat.data.filter(
              (s: any) => Number(s.eselon_1_id) === Number(user.eselon_1_id),
            )
          : jSat.data;
        setSatkerList(binaan);
      }
    } catch {
      toast.error("Gagal mengambil data bukti rekening koran");
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
            ? `Bukti diaktifkan — Saldo ditambahkan ke total ${item.nama_bank || "Bank"}`
            : `Bukti dinonaktifkan — Saldo dikecualikan dari total ${item.nama_bank || "Bank"}`,
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
    const matchSatker =
      !filterSatker ||
      t.satker_nama === filterSatker ||
      String(t.satker_id) === filterSatker;
    const matchKategori =
      !filterKategori || String(t.id_kategori) === filterKategori;
    const tPeriode = getDisplayPeriode(t.periode, t.tanggal);
    const matchPeriode =
      !filterPeriode || tPeriode.toLowerCase() === filterPeriode.toLowerCase();
    const matchSearch =
      !searchUraian ||
      (t.uraian &&
        t.uraian.toLowerCase().includes(searchUraian.toLowerCase())) ||
      (t.nama_bank &&
        t.nama_bank.toLowerCase().includes(searchUraian.toLowerCase())) ||
      (t.satker_nama &&
        t.satker_nama.toLowerCase().includes(searchUraian.toLowerCase()));
    return matchSatker && matchKategori && matchPeriode && matchSearch;
  });

  const uniquePeriode = Array.from(
    new Set(
      transaksi
        .map((t) => getDisplayPeriode(t.periode, t.tanggal))
        .filter((p) => p !== "-"),
    ),
  ).sort();

  const uniqueSatker = Array.from(
    new Set(transaksi.map((t) => t.satker_nama).filter(Boolean)),
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
      `Bukti Rekening Koran ${katName} - ${finalBank || "Bank"} (${formData.periode})`;
    const finalTanggal = formData.tanggal || todayDate;
    const finalNominal = formData.saldo_akhir || formData.nominal || "0";

    try {
      const data = new FormData();
      data.append("tanggal", finalTanggal);
      data.append("periode", formData.periode);
      data.append("satker_id", formData.satker_id);
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
        toast.success("Bukti rekening koran satker berhasil disimpan!");
        setShowForm(false);
        fetchData();
      } else {
        toast.error(j.message || "Gagal menyimpan bukti");
      }
    } catch {
      toast.error("Terjadi kesalahan server saat menyimpan");
    } finally {
      setSubmitLoading(false);
    }
  };

  const exportExcel = () => {
    const wsData = filteredData.map((t, idx) => ({
      No: idx + 1,
      "Satker Binaan": t.satker_nama || "—",
      Tanggal: formatTanggalIndo(t.tanggal),
      Bulan: getDisplayPeriode(t.periode, t.tanggal),
      "Kode Bank": getKodeBank(t.nama_bank, t.kode_bank),
      "Nama Bank": t.nama_bank || "—",
      "Nomor Rekening": t.nomor_rekening_bank || "—",
      "Kategori Dokumen": t.nama_kategori || "—",
      "Saldo Akhir": Number(t.saldo_akhir || t.nominal || 0),
      Status: t.is_active === 0 ? "Nonaktif" : "Aktif",
      Keterangan: t.uraian || "—",
      "Diinput Oleh": t.pembuat || "—",
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bukti Rekening Koran Satker");
    XLSX.writeFile(wb, "Bukti_Rekening_Koran_Satker_Eselon1.xlsx");
  };

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

  const activeTransaksi = filteredData.filter((t) => t.is_active !== 0);
  const totalNominal = activeTransaksi.reduce(
    (acc, t) => acc + (Number(t.saldo_akhir || t.nominal) || 0),
    0,
  );

  const selectedBankGroup = selectedBankDrawer
    ? bankGroupsMap[normalizeBankKey(selectedBankDrawer)] || null
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {isOperator
              ? "Bukti Rekening Koran Satker Binaan"
              : "Monitoring Bukti Rekening Koran Satker"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Seluruh berkas bukti rekening koran, saldo akhir, dan mutasi dari
            seluruh Satker binaan {user?.eselon_1_singkatan || "Ditjen Pembina"}
            .
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-xs"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          {isOperator && (
            <button
              onClick={() => {
                setShowForm(true);
                setFormData({
                  tanggal: todayDate,
                  periode: defaultPeriode,
                  satker_id: "",
                  uraian: "",
                  jenis: "debit",
                  id_kategori: "",
                  kode_bank: "",
                  nominal: "",
                  saldo_akhir: "",
                  catatan_audit: "",
                  nomor_rekening_bank: "",
                  nama_rekening: "",
                  nama_bank: "",
                });
                setCustomBank("");
                setFile(null);
                setAiResult(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Unggah Bukti Baru
            </button>
          )}
        </div>
      </div>

      {/* Summary Banner */}
      <div className="w-full space-y-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Total Saldo Bukti Rekening Koran Aktif</span>
              <DollarSign className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-1">
              Rp {totalNominal.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Akumulasi dari {activeTransaksi.length} bukti aktif di{" "}
              {uniqueSatker.length} Satker Binaan
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {activeTransaksi.length} Bukti Aktif
            </span>
          </div>
        </div>

        {/* Ringkasan Saldo Per Bank */}
        {Object.values(bankGroupsMap).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(bankGroupsMap).map((bg: any) => {
              const noRekArr = Array.from(bg.nomor_rekening_set);
              return (
                <div
                  key={bg.nama_bank}
                  onClick={() => setSelectedBankDrawer(bg.nama_bank)}
                  className="bg-white border border-slate-200 hover:border-indigo-400 rounded-xl p-3.5 shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 rounded">
                        #{bg.kode_bank}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {bg.nama_bank}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
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
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white text-xs font-semibold transition-colors"
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari satker, bank, atau keterangan..."
            value={searchUraian}
            onChange={(e) => setSearchUraian(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
          />
        </div>

        <select
          value={filterSatker}
          onChange={(e) => setFilterSatker(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
        >
          <option value="">
            Semua Satker Binaan (
            {satkerList.length > 0 ? satkerList.length : uniqueSatker.length})
          </option>
          {satkerList.length > 0
            ? satkerList.map((s) => (
                <option key={s.id} value={s.nama}>
                  {s.NO_Satker ? `[${s.NO_Satker}] ` : ""}
                  {s.nama}
                </option>
              ))
            : uniqueSatker.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
        </select>

        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Semua Kategori Dokumen</option>
          {sortedKategori.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama_kategori}
            </option>
          ))}
        </select>

        <select
          value={filterPeriode}
          onChange={(e) => setFilterPeriode(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Semua Bulan</option>
          {uniquePeriode.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {(filterSatker ||
          filterKategori ||
          filterPeriode ||
          searchUraian) && (
          <button
            onClick={() => {
              setFilterSatker("");
              setFilterKategori("");
              setFilterPeriode("");
              setSearchUraian("");
            }}
            className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Main Table: Menampilkan Seluruh Bukti Rekening Koran Satker Binaan */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Tidak ada berkas bukti rekening koran yang sesuai filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-4 py-3.5 w-[140px]">Bulan & Tanggal</th>
                  <th className="px-4 py-3.5">Satker Binaan</th>
                  <th className="px-4 py-3.5">Kategori Dokumen</th>
                  <th className="px-4 py-3.5 w-[280px]">
                    Relasi Bank (No • Nama • No. Rek) & Bukti
                  </th>
                  <th className="px-4 py-3.5 text-right w-[150px]">Saldo Akhir</th>
                  <th className="px-4 py-3.5 text-center w-[100px]">Status</th>
                  <th className="px-4 py-3.5 text-center w-[90px]">Bukti</th>
                  <th className="px-4 py-3.5 text-center w-[90px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((row) => {
                  const isActive = row.is_active !== 0;
                  const bankKey = normalizeBankKey(row.nama_bank);
                  const bankGroup = bankGroupsMap[bankKey];
                  const kodeBank = getKodeBank(row.nama_bank, row.kode_bank);

                  return (
                    <tr
                      key={row.id}
                      className={clsx(
                        "transition-colors",
                        isActive
                          ? "hover:bg-slate-50/80"
                          : "bg-gray-50/60 opacity-70",
                      )}
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded text-[11px]">
                            {getDisplayPeriode(row.periode, row.tanggal)}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatTanggalIndo(row.tanggal)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div
                          className="font-bold text-slate-800 max-w-[200px] truncate"
                          title={row.satker_nama || "Satker"}
                        >
                          {row.satker_nama || "—"}
                        </div>
                        {row.pembuat && (
                          <div
                            className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]"
                            title={`Diinput oleh: ${row.pembuat}`}
                          >
                            Oleh: {row.pembuat}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
                          {row.nama_kategori || "—"}
                        </span>
                      </td>

                      {/* Relasi Bank & Tombol di Ujung Nama Bank */}
                      <td className="px-4 py-3.5">
                        {row.nama_bank ? (
                          <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 rounded">
                                  #{kodeBank}
                                </span>
                                <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span className="font-bold text-slate-800 truncate">
                                  {row.nama_bank}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                                No. Rek: {row.nomor_rekening || row.nomor_rekening_bank || "—"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedBankDrawer(row.nama_bank)}
                              className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                              title={`Lihat seluruh bukti rekening koran ${row.nama_bank}`}
                            >
                              <Layers className="w-3 h-3" />
                              <span>Bukti ({bankGroup ? bankGroup.items.length : 1})</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div
                          className={clsx(
                            "font-bold",
                            isActive
                              ? "text-slate-900"
                              : "line-through text-slate-400",
                          )}
                        >
                          Rp{" "}
                          {Number(
                            row.saldo_akhir || row.nominal || 0,
                          ).toLocaleString("id-ID")}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {isOperator ? (
                          <span
                            className={clsx(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border select-none",
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-500 border-slate-300",
                            )}
                          >
                            <span
                              className={clsx(
                                "w-1.5 h-1.5 rounded-full",
                                isActive ? "bg-emerald-500" : "bg-slate-400",
                              )}
                            />
                            {isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={togglingId === row.id}
                            onClick={() => handleToggleStatus(row)}
                            className={clsx(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer",
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200",
                            )}
                            title="Klik untuk mematikan / mengaktifkan status bukti ini"
                          >
                            <span
                              className={clsx(
                                "w-1.5 h-1.5 rounded-full",
                                isActive ? "bg-emerald-500" : "bg-slate-400",
                              )}
                            />
                            {isActive ? "Aktif" : "Nonaktif"}
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {row.bukti_file ? (
                          <button
                            onClick={() => openFile(row.bukti_file, token || "")}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <Paperclip className="w-3.5 h-3.5" /> Lihat
                          </button>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedDetail(row)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                          title="Lihat Detail Transaksi"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Unggah Bukti Rekening Koran Satker Baru (Operator Eselon 1) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Unggah Bukti Rekening Koran Satker Baru
                </h2>
                <p className="text-xs text-slate-500">
                  Unggah berkas bukti rekening koran dan lengkapi rincian Satker
                  binaan
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 overflow-y-auto space-y-4 text-xs"
            >
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Upload Bukti Berkas Rekening Koran *
                  </label>
                  {aiScanning && (
                    <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memindai
                      berkas...
                    </span>
                  )}
                </div>
                <input
                  required
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.xlsx,.xls,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Satker Binaan *
                </label>
                <select
                  required
                  value={formData.satker_id}
                  onChange={(e) =>
                    setFormData({ ...formData, satker_id: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold text-slate-800"
                >
                  <option value="">
                    -- Pilih Satker Binaan ({satkerList.length} Satker) --
                  </option>
                  {satkerList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.NO_Satker ? `[${s.NO_Satker}] ` : ""}
                      {s.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Bukti *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bulan Transaksi *
                  </label>
                  <select
                    required
                    value={formData.periode}
                    onChange={(e) =>
                      setFormData({ ...formData, periode: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bank *
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
                      });
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-semibold"
                  >
                    <option value="">Pilih Bank</option>
                    {BANK_BUMN_LIST.map((b) => (
                      <option key={b} value={b}>
                        {b === "Bank Lainnya"
                          ? b
                          : `[${getKodeBank(b)}] ${b}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Rekening *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nomor rekening..."
                    value={formData.nomor_rekening_bank}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nomor_rekening_bank: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Saldo Akhir (Rp) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 50.000.000"
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
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono font-bold text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || aiScanning}
                  className="flex items-center gap-2 px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
                >
                  {submitLoading ? "Menyimpan..." : "Unggah & Simpan Bukti"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SLIDE-OVER BAR / DRAWER BUKTI PER BANK */}
      {selectedBankDrawer && selectedBankGroup && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedBankDrawer(null)}
          />
          <div className="relative z-10 w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 to-blue-900 text-white flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/30 border border-indigo-300/30 text-xs font-mono font-bold text-indigo-100">
                    KODE BANK: #{selectedBankGroup.kode_bank}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-300/30 text-xs font-semibold text-emerald-200">
                    {selectedBankGroup.activeCount} Aktif /{" "}
                    {selectedBankGroup.items.length} Total Bukti
                  </span>
                </div>
                <h3 className="text-xl font-extrabold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-300" />
                  <span>{selectedBankGroup.nama_bank}</span>
                </h3>
                <p className="text-xs text-indigo-200 font-mono">
                  Daftar Seluruh Bukti Rekening Koran Satker Binaan
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

            <div className="px-6 py-4 bg-indigo-50/80 border-b border-indigo-100">
              <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                Total Saldo Aktif ({selectedBankGroup.nama_bank})
              </p>
              <p className="text-2xl font-black text-indigo-700 mt-0.5">
                Rp {selectedBankGroup.activeTotal.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
              {selectedBankGroup.items.map((item: any, idx: number) => {
                const isActive = item.is_active !== 0;
                const saldoVal = Number(item.saldo_akhir || item.nominal || 0);

                return (
                  <div
                    key={item.id}
                    className={clsx(
                      "rounded-2xl border p-4 bg-white shadow-xs transition-all",
                      isActive
                        ? "border-slate-200"
                        : "border-slate-200/70 bg-slate-50 opacity-75",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-400">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded">
                            {item.satker_nama || "Satker"}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                            <Calendar className="w-3 h-3" />
                            {formatTanggalIndo(item.tanggal)}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-600 pt-0.5">
                          No. Rek:{" "}
                          <strong>
                            {item.nomor_rekening || item.nomor_rekening_bank || "—"}
                          </strong>
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {item.uraian || "Bukti Rekening Koran"}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {isOperator ? (
                          <span
                            className={clsx(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border select-none",
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-500 border-slate-300",
                            )}
                          >
                            <span
                              className={clsx(
                                "w-1.5 h-1.5 rounded-full",
                                isActive ? "bg-emerald-500" : "bg-slate-400",
                              )}
                            />
                            {isActive ? "Status: Aktif" : "Status: Nonaktif"}
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={togglingId === item.id}
                              onClick={() => handleToggleStatus(item)}
                              className={clsx(
                                "relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                                isActive ? "bg-emerald-600" : "bg-slate-300",
                              )}
                              title={
                                isActive
                                  ? "Status Aktif (Klik untuk Nonaktifkan)"
                                  : "Status Nonaktif (Klik untuk Aktifkan)"
                              }
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
                                isActive ? "text-emerald-700" : "text-slate-500",
                              )}
                            >
                              {isActive ? "Status: Aktif" : "Status: Nonaktif"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] text-slate-400 block">
                          Saldo Akhir:
                        </span>
                        <span
                          className={clsx(
                            "text-base font-extrabold",
                            isActive
                              ? "text-slate-900"
                              : "line-through text-slate-400",
                          )}
                        >
                          Rp {saldoVal.toLocaleString("id-ID")}
                        </span>
                      </div>
                      {item.bukti_file && (
                        <button
                          type="button"
                          onClick={() => openFile(item.bukti_file, token || "")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Lihat Berkas</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Total Saldo Aktif:{" "}
                <strong className="text-slate-900">
                  Rp {selectedBankGroup.activeTotal.toLocaleString("id-ID")}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBankDrawer(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Tutup Bar Bukti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-base font-bold text-slate-800">
                Detail Bukti Rekening Koran Satker
              </h2>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <p>
                  Satker: <strong>{selectedDetail.satker_nama || "—"}</strong>
                </p>
                <p>
                  Bank: <strong>{selectedDetail.nama_bank || "—"}</strong> (No.
                  Rek:{" "}
                  {selectedDetail.nomor_rekening ||
                    selectedDetail.nomor_rekening_bank ||
                    "—"}
                  )
                </p>
                <p>
                  Saldo Akhir:{" "}
                  <strong>
                    Rp{" "}
                    {Number(
                      selectedDetail.saldo_akhir || selectedDetail.nominal || 0,
                    ).toLocaleString("id-ID")}
                  </strong>
                </p>
                <p>
                  Bulan:{" "}
                  {getDisplayPeriode(
                    selectedDetail.periode,
                    selectedDetail.tanggal,
                  )}
                </p>
              </div>
              {selectedDetail.bukti_file && (
                <button
                  onClick={() => openFile(selectedDetail.bukti_file, token || "")}
                  className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl"
                >
                  Buka Berkas Bukti
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
