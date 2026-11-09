'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { getSession } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  FileText, Clock, CheckCircle, RefreshCw,
  Loader2, AlertCircle, Users, Building2
} from 'lucide-react';
import MonitoringSatkerSection from '@/components/eselon-1/MonitoringSatkerSection';

const SatkerIndonesiaMap = dynamic(
  () => import('@/components/maps/SatkerIndonesiaMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-white rounded-2xl border border-slate-200 flex items-center justify-center p-8 animate-pulse text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
        <span className="text-sm font-medium">Memuat Peta Sebaran Satker Nusantara...</span>
      </div>
    ),
  }
);

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");
const POLL_INTERVAL = 30_000; // 30 detik

interface SatkerStat { nama: string; total: number; terverifikasi: number; revisi: number; }
interface HariStat  { tanggal: string; total: number; }
interface StatusStat { status: string; total: number; }
interface OnlineUser { id: number; nama: string; username: string; role: string; last_active_at: string; }

interface StatsData {
  totalDokumen: number; terverifikasi: number; menunggu: number; lolosPimpinan: number; revisi: number; onlineNow: number;
  perSatker: SatkerStat[]; perHari: HariStat[]; statusDist: StatusStat[]; onlineUsers: OnlineUser[];
}

// Warna per status dokumen untuk pie chart
const STATUS_COLORS: Record<string, string> = {
  terverifikasi:        '#22c55e',
  menunggu_verifikasi:  '#f59e0b',
  lolos_Pimpinan:          '#3b82f6',
  revisi:               '#f97316',
  draft:                '#94a3b8',
};
const STATUS_LABELS: Record<string, string> = {
  terverifikasi:       'Terverifikasi',
  menunggu_verifikasi: 'Menunggu',
  lolos_Pimpinan:         'Menunggu Ketua',
  revisi:              'Revisi',
  draft:               'Draft',
};

// Lengkapi 14 hari terakhir — hari tanpa upload diisi total 0
function lengkapiHari(perHari: HariStat[]): HariStat[] {
  const map = new Map(perHari.map((h) => [h.tanggal, h.total]));
  const hasil: HariStat[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    hasil.push({ tanggal: key, total: map.get(key) ?? 0 });
  }
  return hasil;
}

export default function KetuaDashboardPage() {
  const { user } = useAuth();
  const [data,    setData]    = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const session = getSession();
      const res = await fetch(`${API}/eselon-1/stats`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setData(json.data);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const t = setInterval(fetchStats, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
        <AlertCircle className="w-5 h-5" /> {error || 'Gagal memuat data'}
      </div>
    );
  }

  const kartu = [
    { label: 'Total Dokumen',          value: data.totalDokumen,    icon: FileText,     color: 'text-blue-600 bg-blue-50' },
    { label: 'Menunggu Verifikasi',    value: data.menunggu,        icon: Clock,        color: 'text-amber-600 bg-amber-50' },
    { label: 'Menunggu Persetujuan',   value: data.lolosPimpinan ?? 0, icon: Clock,        color: 'text-blue-600 bg-blue-50' },
    { label: 'Terverifikasi',          value: data.terverifikasi,   icon: CheckCircle,  color: 'text-green-600 bg-green-50' },
    { label: 'Perlu Revisi',           value: data.revisi,          icon: RefreshCw,    color: 'text-orange-600 bg-orange-50' },
    { label: 'User Online',            value: data.onlineNow,       icon: Users,        color: 'text-blue-600 bg-blue-50' },
  ];

  const pieData = data.statusDist.map((s: StatusStat) => ({
    name: STATUS_LABELS[s.status] ?? s.status,
    value: s.total,
    color: STATUS_COLORS[s.status] ?? '#6366f1',
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              {user?.eselon_1_singkatan ? `${user.eselon_1_singkatan} · ${user.eselon_1_nama}` : 'Unit Eselon 1 Pusat'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat Datang, {user?.nama || 'Pejabat Eselon 1'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monitoring sistem secara realtime (refresh otomatis 30 detik)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLoading(true); fetchStats(); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Peta Sebaran & Rekonsiliasi Kas Satker Binaan (Lapisan Utama Paling Atas) */}
      <SatkerIndonesiaMap
        filterEselon1Initial={user?.eselon_1_singkatan || "Ditjen Dikti"}
        lockEselon1={true}
        title={`Peta Sebaran & Rekonsiliasi Kas Satker (${user?.eselon_1_singkatan || "Ditjen Dikti"})`}
        subtitle={`Posisi geografis, saldo kas riil, dan kelengkapan bukti dokumen satker di bawah binaan ${user?.eselon_1_singkatan || "Ditjen Dikti"}`}
      />

      {/* Kartu statistik */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kartu.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Monitoring Dokumen Satker Binaan (Fitur Baru Eselon 1) */}
      <MonitoringSatkerSection />

      {/* Grafik baris 1: upload per Satker + distribusi status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Jumlah Dokumen per Satker</h2>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={data.perSatker}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="nama" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="terverifikasi" name="Terverifikasi" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revisi" name="Revisi" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Distribusi Status</h2>
          <div style={{ width: '100%', height: 280 }}>
            {pieData.length ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                       innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                Belum ada dokumen
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grafik baris 2: trend harian + user online */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Upload 14 Hari Terakhir</h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={lengkapiHari(data.perHari)}>
                <defs>
                  <linearGradient id="gradUpload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="tanggal"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(t: string) => t.slice(5).replace('-', '/')}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip labelFormatter={(t: any) => `Tanggal: ${t}`} />
                <Area type="monotone" dataKey="total" name="Upload" stroke="#6366f1"
                      strokeWidth={2} fill="url(#gradUpload)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">
            User Online ({data.onlineUsers.length})
          </h2>
          {data.onlineUsers.length ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {data.onlineUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                      {u.nama.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.nama}</p>
                    <p className="text-xs text-gray-400 capitalize">{u.role.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-6 text-center">Tidak ada user online</p>
          )}
        </div>
      </div>
    </div>
  );
}

