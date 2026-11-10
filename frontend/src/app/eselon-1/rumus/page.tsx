"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSession } from "@/lib/auth";
import {
  Calculator,
  Plus,
  Trash2,
  Edit3,
  Lock,
  Globe,
  Building2,
  Layers,
  Search,
  RefreshCw,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import RumusBuilder from "@/components/kertas-kerja/RumusBuilder";

const API = typeof window !== "undefined" && window.location.hostname
  ? `${window.location.protocol}//${window.location.hostname}:5000/api`
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

export default function Eselon1RumusPage() {
  const { user } = useAuth();
  const [rumusList, setRumusList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  const [mode, setMode] = useState<"list" | "builder">("list");
  const [editingRumusId, setEditingRumusId] = useState<number | null>(null);

  const fetchRumus = useCallback(async () => {
    setLoading(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/kertas-kerja/rumus`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRumusList(json.data);
      }
    } catch (err: any) {
      toast.error("Gagal memuat rumus: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRumus();
  }, [fetchRumus]);

  const handleDelete = async (id: number, nama: string, isLocked: boolean) => {
    if (isLocked) {
      toast.error("Rumus ini sudah pernah digunakan oleh satker binaan dan TERKUNCI.");
      return;
    }
    if (!confirm(`Yakin ingin menghapus rumus "${nama}"?`)) return;

    try {
      const session = getSession();
      const res = await fetch(`${API}/kertas-kerja/rumus/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.detail || "Gagal menghapus rumus");
      toast.success("Rumus berhasil dihapus");
      fetchRumus();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredRumus = rumusList.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNama = r.nama_rumus?.toLowerCase().includes(q);
      const matchDesc = r.deskripsi?.toLowerCase().includes(q);
      if (!matchNama && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {mode === "builder" ? (
        <RumusBuilder
          initialRumusId={editingRumusId}
          isITRole={false}
          userEselonId={user?.eselon_1_id}
          userEselonNama={user?.eselon_1_singkatan || user?.eselon_1_nama || "Ditjen Pembina"}
          onSuccess={() => {
            setMode("list");
            setEditingRumusId(null);
            fetchRumus();
          }}
          onCancel={() => {
            setMode("list");
            setEditingRumusId(null);
          }}
        />
      ) : (
        <>
          {/* HEADER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Unit {user?.eselon_1_singkatan || user?.eselon_1_nama || "Eselon 1 Pembina"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5" />
                  Formula Builder Binaan
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Format Rumus Kertas Kerja Satker Binaan
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Rancang format rumus perhitungan yang berlaku untuk seluruh operator satker di bawah naungan {user?.eselon_1_singkatan || "Eselon 1"}.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingRumusId(null);
                setMode("builder");
              }}
              className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Buat Rumus Binaan Baru
            </button>
          </div>

          {/* SEARCH */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama rumus perhitungan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <button
              onClick={fetchRumus}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shrink-0"
              title="Muat Ulang"
            >
              <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>

          {/* LIST KARTU RUMUS */}
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">
              Memuat rumus kertas kerja...
            </div>
          ) : filteredRumus.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Calculator className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Belum Ada Rumus Binaan</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Buat format rumus pertama untuk satker binaan Anda agar operator dapat mengisi kertas kerja secara seragam.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRumus.map((r) => {
                const isUniv = r.scope === "universal";
                const isLocked = Boolean(r.is_locked);
                const isMyRumus = !isUniv; // Rumus buatan unit ini

                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1",
                              isUniv
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            )}
                          >
                            {isUniv ? (
                              <>
                                <Globe className="w-3 h-3" /> Standar Nasional (Universal)
                              </>
                            ) : (
                              <>
                                <Building2 className="w-3 h-3" /> Khusus Binaan {user?.eselon_1_singkatan || "Eselon 1"}
                              </>
                            )}
                          </span>

                          {isLocked ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Terkunci (Ada Laporan)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Siap Diedit
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono">
                          ID #{r.id}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                        {r.nama_rumus}
                      </h3>

                      {r.deskripsi && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {r.deskripsi}
                        </p>
                      )}

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-blue-500" />
                          <strong>{r.total_akun || 0}</strong> Akun Terpasang
                        </span>
                        <span className="text-slate-400">&bull;</span>
                        <span>Oleh: {r.pembuat_nama || "Administrator"}</span>
                      </div>
                    </div>

                    {/* Aksi */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {new Date(r.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isMyRumus ? (
                          <>
                            <button
                              onClick={() => {
                                setEditingRumusId(r.id);
                                setMode("builder");
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              {isLocked ? "Lihat Detail" : "Edit Rumus"}
                            </button>
                            {!isLocked && (
                              <button
                                onClick={() => handleDelete(r.id, r.nama_rumus, isLocked)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus Rumus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Rumus Universal (Dikelola IT)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
