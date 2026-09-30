'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { Loader2, Users, Wallet, FileText, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];

interface StatsData {
  total_user: number;
  total_satker: number;
  total_dokumen: number;
  total_saldo: number;
  saldo_per_satker: { nama: string; value: number }[];
  saldo_per_periode: { tahun: string; periode_1: number; periode_2: number }[];
}

export default function ChartDashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [yearFilter, setYearFilter] = useState<number>(5); // Default 5 tahun terakhir
  const [satkers, setSatkers] = useState<{ id: number, nama: string }[]>([]);
  const [selectedSatker, setSelectedSatker] = useState<string>('');
  const session = getSession();
  const isEselon1 = session?.user?.role === 'eselon_1';

  // Fetch satker list if eselon 1
  useEffect(() => {
    if (isEselon1) {
      const fetchSatkers = async () => {
        try {
          const res = await fetch(`${API}/satker`, {
            headers: { Authorization: `Bearer ${session?.token}` }
          });
          const json = await res.json();
          if (json.success) setSatkers(json.data);
        } catch (err) {
          console.error("Gagal load satker", err);
        }
      };
      fetchSatkers();
    }
  }, [isEselon1, session?.token]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const url = selectedSatker 
          ? `${API}/stats/dashboard?satker=${selectedSatker}`
          : `${API}/stats/dashboard`;
          
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${session?.token}` }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setData(json.data);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat statistik');
      } finally {
        setLoading(false);
      }
    };
    if (session?.token) fetchStats();
  }, [selectedSatker, session?.token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 text-center mx-12 my-12">
        <p className="font-medium">Terjadi kesalahan</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const formatRp = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const formatSingkat = (val: number) => {
    if (val >= 1_000_000_000_000) return `Rp ${(val / 1_000_000_000_000).toFixed(1).replace('.0', '')} T`;
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1).replace('.0', '')} M`;
    if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
    return `Rp ${val}`;
  };

  // Prepare data for Pie Chart (Top 5 + Others)
  let pieData = [];
  if (data.saldo_per_satker.length > 5) {
    const top5 = data.saldo_per_satker.slice(0, 5);
    const others = data.saldo_per_satker.slice(5).reduce((acc, curr) => acc + Number(curr.value), 0);
    pieData = [...top5, { nama: 'satker Lainnya', value: others }];
  } else {
    pieData = data.saldo_per_satker;
  }

  // Filter bar chart data
  const filteredBarData = data.saldo_per_periode.slice(-yearFilter);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

      {isEselon1 && (
        <div className="flex justify-end">
          <select 
            value={selectedSatker}
            onChange={(e) => setSelectedSatker(e.target.value)}
            className="w-full md:w-64 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Satker (Nasional)</option>
            {satkers.map(s => (
              <option key={s.id} value={s.id}>{s.nama}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            {isEselon1 && !selectedSatker ? (
              <FileText className="w-7 h-7 text-blue-600" />
            ) : (
              <Users className="w-7 h-7 text-blue-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              {isEselon1 ? (selectedSatker ? 'Total Satker' : 'Total Satker') : 'Total Anggota'}
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              {isEselon1 ? `${data.total_satker} Satker` : data.total_user}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Wallet className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Saldo Terkumpul</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatRp(data.total_saldo)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <FileText className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Data Dokumen</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.total_dokumen} Dokumen</h3>
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-gray-900">
              {(session?.user?.role === 'staff' || session?.user?.role === 'pimpinan' || (isEselon1 && selectedSatker)) 
                ? 'Proporsi Kategori Pencatatan' 
                : 'Proporsi Saldo per Satker'}
            </h3>
          </div>
          <div className="h-[350px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="nama"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => formatRp(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">Belum ada data saldo</div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-gray-900">Perbandingan Saldo per Periode</h3>
            </div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              <option value={1}>1 Tahun Terakhir</option>
              <option value={3}>3 Tahun Terakhir</option>
              <option value={5}>5 Tahun Terakhir</option>
              <option value={10}>10 Tahun Terakhir</option>
            </select>
          </div>
          <div className="h-[350px] mt-auto">
            {filteredBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="tahun" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={formatSingkat}
                    width={80}
                  />
                  <RechartsTooltip
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(value: number, name: string) => [formatRp(value), name === 'periode_1' ? 'Periode 1' : 'Periode 2']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend layout="horizontal" verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }} />
                  <Bar dataKey="periode_1" name="Periode 1" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="periode_2" name="Periode 2" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">Belum ada data periode</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
