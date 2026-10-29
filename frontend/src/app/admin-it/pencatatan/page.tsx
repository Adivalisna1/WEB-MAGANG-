"use client";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Edit, Tags, FileText, Trash2 } from "lucide-react";
import clsx from "clsx";

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

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

export default function AdminpencatatanPage() {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState<"transaksi" | "kategori">(
    "transaksi",
  );

  // Data State
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [satkers, setSatkers] = useState<any[]>([]);
  const [kategoris, setKategoris] = useState<any[]>([]);
  const [filterSatker, setFilterSatker] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Kategori Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nama_kategori: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTx, resSatker, resKat] = await Promise.all([
        fetch(`${API}/pencatatan`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/satker`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/pencatatan/kategori`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const jTx = await resTx.json();
      const jSatker = await resSatker.json();
      const jKat = await resKat.json();
      if (jTx.success) setTransaksi(jTx.data);
      if (jSatker.success) setSatkers(jSatker.data);
      if (jKat.success) setKategoris(jKat.data);
    } catch (err) {
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const filteredTransaksi = filterSatker
    ? transaksi.filter((t) => t.satker_id?.toString() === filterSatker)
    : transaksi;

  const handleSaveKategori = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId
        ? `${API}/pencatatan/kategori/${editId}`
        : `${API}/pencatatan/kategori`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const j = await res.json();
      if (j.success) {
        toast.success(j.message);
        setIsModalOpen(false);
        fetchData();
      } else {
        toast.error(j.message || "Gagal menyimpan");
      }
    } catch (err) {
      toast.error("Gagal menyimpan kategori");
    }
  };

  const handleDeleteKategori = async (id: number) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      const res = await fetch(`${API}/pencatatan/kategori/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (j.success) {
        toast.success(j.message);
        fetchData();
      } else {
        toast.error(j.message || "Gagal menghapus");
      }
    } catch (err) {
      toast.error("Gagal menghapus kategori");
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ nama_kategori: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (kat: any) => {
    setEditId(kat.id);
    setFormData({ nama_kategori: kat.nama_kategori });
    setIsModalOpen(true);
  };

  return (
    <div className="w-full px-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Master Bukti & Transaksi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data transaksi dan master kategori bukti transaksi satker.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-max">
          <button
            onClick={() => setActiveTab("transaksi")}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
              activeTab === "transaksi"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200",
            )}
          >
            <FileText className="w-4 h-4" /> Data Transaksi
          </button>
          <button
            onClick={() => setActiveTab("kategori")}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
              activeTab === "kategori"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200",
            )}
          >
            <Tags className="w-4 h-4" /> Kategori Bukti Transaksi
          </button>
        </div>

        {activeTab === "transaksi" && (
          <div className="w-full sm:w-auto">
            <select
              value={filterSatker}
              onChange={(e) => setFilterSatker(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Satker</option>
              {satkers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab === "kategori" && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Kategori
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {activeTab === "transaksi" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Periode
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Satker
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Saldo Akhir
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Uraian
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredTransaksi.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      Tidak ada data transaksi.
                    </td>
                  </tr>
                ) : (
                  filteredTransaksi.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded text-xs">
                          {getDisplayPeriode(t.periode, t.tanggal)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900 font-medium">
                          {t.nama_kategori}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-gray-600 truncate max-w-[150px]"
                        title={t.satker_nama || "Pusat"}
                      >
                        {t.satker_nama || "Pusat"}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                        Rp{" "}
                        {Number(t.saldo_akhir || t.nominal || 0).toLocaleString(
                          "id-ID",
                        )}
                      </td>
                      <td
                        className="px-4 py-3 max-w-[200px] truncate text-xs text-gray-600"
                        title={t.uraian}
                      >
                        {t.uraian}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "kategori" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Nama Kategori
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : kategoris.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                      Tidak ada kategori.
                    </td>
                  </tr>
                ) : (
                  kategoris.map((k) => (
                    <tr key={k.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">#{k.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {k.nama_kategori}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEditModal(k)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors mr-2"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteKategori(k.id)}
                          className="text-rose-600 hover:text-rose-800 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                {editId ? "Edit Kategori" : "Tambah Kategori"}
              </h2>
            </div>
            <form onSubmit={handleSaveKategori} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={formData.nama_kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_kategori: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
