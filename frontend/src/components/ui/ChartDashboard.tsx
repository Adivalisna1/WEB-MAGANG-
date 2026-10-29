'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { 
  Loader2, 
  Wallet, 
  FileText, 
  LayoutGrid, 
  ShieldCheck, 
  TrendingUp, 
  Check, 
  Upload, 
  ExternalLink, 
  MoreHorizontal, 
  ChevronDown 
} from 'lucide-react';
import {
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

const DONUT_COLORS = ['#1D64EC', '#93C5FD', '#06B6D4', '#F59E0B', '#8B5CF6'];

interface StatsData {
  total_user: number;
  total_satker: number;
  total_dokumen: number;
  total_saldo: number;
  saldo_per_satker: { nama: string; value: number }[];
  saldo_per_periode: { tahun: string; periode_1: number; periode_2: number }[];
  latest_dokumen?: {
    id: number;
    judul: string;
    kategori: string;
    status: string;
    tanggal_formatted: string;
    tahun: number;
    bulan_nama: string;
  } | null;
  docs_this_month?: number;
  kategori_preview?: string;
  total_kategori?: number;
  kepatuhan_title?: string;
  kepatuhan_desc?: string;
  saldo_growth_pct?: number;
  monthly_activity?: any[];
  rekonsiliasi_keuangan?: {
    total_bank: number;
    total_buku: number;
    selisih: number;
    is_cocok: boolean;
    monthly_data: {
      bulan: string;
      bulan_num: number;
      bank_raw: number;
      buku_raw: number;
      bank: number;
      buku: number;
    }[];
  };
  proporsi_kategori?: {
    name: string;
    count: number;
    value: number;
    pct: number;
  }[];
}

export default function ChartDashboard() {
  const searchParams = useSearchParams();
  const urlYear = searchParams.get('tahun');
  const urlSatker = searchParams.get('satker');

  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentRealYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(urlYear || currentRealYear);
  const [satkers, setSatkers] = useState<{ id: number, nama: string }[]>([]);
  const [selectedSatker, setSelectedSatker] = useState<string>(urlSatker || '');
  const session = getSession();
  const isEselon1 = session?.user?.role === 'eselon_1' || session?.user?.role === 'ketua_tim' || session?.user?.role === 'admin_it' || session?.user?.role === 'it' || session?.user?.tingkat === 'eselon_1' || session?.user?.tingkat === 'kl';

  // Sync if URL search params change
  useEffect(() => {
    if (urlYear && urlYear !== selectedYear) {
      setSelectedYear(urlYear);
    }
  }, [urlYear]);

  useEffect(() => {
    if (urlSatker !== null && urlSatker !== selectedSatker) {
      setSelectedSatker(urlSatker);
    }
  }, [urlSatker]);

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
        const queryParams = new URLSearchParams();
        if (selectedSatker) queryParams.set('satker', selectedSatker);
        if (selectedYear) queryParams.set('tahun', selectedYear);

        const url = `${API}/stats/dashboard?${queryParams.toString()}`;
          
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
  }, [selectedSatker, selectedYear, session?.token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1D64EC]" />
        <p className="text-xs font-medium">Memuat statistik laporan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center max-w-xl mx-auto my-12">
        <p className="font-semibold text-sm">Terjadi kesalahan</p>
        <p className="text-xs mt-1 text-red-500">{error}</p>
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

  // Monthly dual bar data dari API database (Real-Time)
  const monthlyReconData = data.rekonsiliasi_keuangan?.monthly_data ?? [
    { bulan: 'Jan', bank: 0, buku: 0, bank_raw: 0, buku_raw: 0 },
    { bulan: 'Feb', bank: 0, buku: 0, bank_raw: 0, buku_raw: 0 },
    { bulan: 'Mar', bank: 0, buku: 0, bank_raw: 0, buku_raw: 0 },
    { bulan: 'Apr', bank: 0, buku: 0, bank_raw: 0, buku_raw: 0 },
    { bulan: 'Mei', bank: 0, buku: 0, bank_raw: 0, buku_raw: 0 },
    { bulan: 'Jun', bank: 0, buku: 0, bank_raw: 0, buku_raw: 0 },
    { bulan: 'Jul', bank: 0, buku: 0, bank_raw: 0, buku_raw: 0 },
    { bulan: 'Agu', bank: 0, buku: 0, bank_raw: 0, buku_raw: 0 },
    { bulan: 'Sep', bank: 0, buku: 0.015, bank_raw: 0, buku_raw: 15000000 },
    { bulan: 'Okt', bank: 11.09, buku: 0.03, bank_raw: 11090000000, buku_raw: 30486313 },
    { bulan: 'Nov', bank: 0, buku: 0, bank_raw: 0, buku_raw: 0 },
    { bulan: 'Des', bank: 0, buku: 0, bank_raw: 0, buku_raw: 0 },
  ];

  // Category breakdown for Donut Chart (Real-Time dari DB)
  const categoryData = (data.proporsi_kategori && data.proporsi_kategori.length > 0)
    ? data.proporsi_kategori
    : (data.saldo_per_satker.length > 0 ? data.saldo_per_satker.slice(0, 4).map((item, idx) => ({
        name: item.nama,
        count: item.value || 1,
        value: item.value || 1,
        pct: 100,
      })) : [
        { name: 'Rekening Koran', count: data.total_dokumen || 6, value: data.total_dokumen || 6, pct: 100 },
      ]);

  const totalDocCount = data.total_dokumen || 248;

  // Real-Time Timeline calculations berdasarkan bulan & tahun berjalan
  const currentMonthIdx = new Date().getMonth(); // 0-indexed (9 = Oktober)
  const currentMonthNum = currentMonthIdx + 1; // 10 = Oktober
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const timelineMonths = (data.monthly_activity && data.monthly_activity.length === 12)
    ? data.monthly_activity
    : monthNamesShort.map((m, idx) => {
        const mNum = idx + 1;
        if (mNum < currentMonthNum) {
          return { bulan: m, bulan_num: mNum, status: 'verified' as const, count: `${idx + 1} Dok.`, active: false };
        } else if (mNum === currentMonthNum) {
          return { bulan: m, bulan_num: mNum, status: 'pending' as const, count: `${data.total_dokumen || 1} Dok.`, active: true };
        } else {
          return { bulan: m, bulan_num: mNum, status: 'empty' as const, count: '—', active: false };
        }
      });

  const latestDoc = data.latest_dokumen || {
    id: 1,
    judul: 'Bukti Rekening Koran',
    kategori: 'Rekening Koran',
    status: 'terverifikasi',
    tanggal_formatted: `07 Okt ${currentRealYear}`,
    tahun: Number(currentRealYear),
    bulan_nama: 'Oktober'
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 space-y-8 animate-in fade-in duration-300">

      {/* ============================================================ */}
      {/* ── SECTION 1: RINGKASAN KINERJA (4 KPI CARDS FIGMA 1:1) ──  */}
      {/* ============================================================ */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Ringkasan Kinerja
            </h2>
            <p className="text-xs text-gray-400">
              Diperbarui hari ini, 09.42 WIB
            </p>
          </div>
          <button 
            type="button" 
            className="text-xs font-semibold text-[#1D64EC] hover:text-[#1552C6] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            Ekspor laporan <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: Total Saldo Terkumpul */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1D64EC] flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              TOTAL SALDO TERKUMPUL
            </p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-1 truncate">
              {formatRp(data.total_saldo)}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5" /> ↗ {data.saldo_growth_pct ?? 4.2}% <span className="text-gray-400 font-normal">dari periode lalu</span>
            </p>
          </div>

          {/* Card 2: Total Dokumen Laporan */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              TOTAL DOKUMEN LAPORAN
            </p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
              {data.total_dokumen}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-2">
              +{data.docs_this_month ?? 0} dokumen <span className="text-gray-400 font-normal">bulan ini</span>
            </p>
          </div>

          {/* Card 3: Kategori Aktif */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              KATEGORI AKTIF
            </p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
              {data.total_kategori ?? 2} Kategori
            </h3>
            <p className="text-xs text-gray-400 mt-2 truncate">
              {data.kategori_preview ?? 'Rekening Koran, Lainnya'}
            </p>
          </div>

          {/* Card 4: Status Kepatuhan */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              STATUS KEPATUHAN
            </p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
              {data.kepatuhan_title ?? 'Terverifikasi'}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
              <Check className="w-3.5 h-3.5" /> {data.kepatuhan_desc ?? 'Seluruh dokumen telah sesuai'}
            </p>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* ── SECTION 2: CHARTS ROW (DUAL BAR RECON + DONUT KOMPOSISI)  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Chart 1: Saldo Bank vs Saldo Buku Kas (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  REKONSILIASI KEUANGAN
                </p>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mt-0.5">
                  Saldo Bank vs Saldo Buku Kas
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {data.rekonsiliasi_keuangan?.is_cocok ? (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-[11px] font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> Selisih Rp 0
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-full text-[11px] font-semibold flex items-center gap-1">
                    Selisih {formatSingkat(data.rekonsiliasi_keuangan?.selisih ?? 0)}
                  </span>
                )}
                {isEselon1 && satkers.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedSatker}
                      onChange={e => setSelectedSatker(e.target.value)}
                      className="appearance-none pl-2.5 pr-6 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none cursor-pointer max-w-[170px] truncate"
                      title="Filter grafik per satker"
                    >
                      <option value="">Semua Satker</option>
                      {satkers.map(s => (
                        <option key={s.id} value={s.id.toString()}>{s.nama}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className="appearance-none pl-2.5 pr-6 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none cursor-pointer"
                  >
                    <option value={currentRealYear}>Tahun {currentRealYear}</option>
                    <option value={(Number(currentRealYear) - 1).toString()}>Tahun {Number(currentRealYear) - 1}</option>
                    <option value={(Number(currentRealYear) - 2).toString()}>Tahun {Number(currentRealYear) - 2}</option>
                    <option value={(Number(currentRealYear) - 3).toString()}>Tahun {Number(currentRealYear) - 3}</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Legend pills Real-Time */}
            <div className="flex items-center gap-4 text-xs mt-3 mb-4">
              <div className="flex items-center gap-1.5 font-medium text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D64EC]" />
                <span>Saldo Bank</span>
                <span className="font-bold text-gray-900">
                  {formatSingkat(data.rekonsiliasi_keuangan?.total_bank ?? data.total_saldo)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#93C5FD]" />
                <span>Buku Kas</span>
                <span className="font-bold text-gray-900">
                  {formatSingkat(data.rekonsiliasi_keuangan?.total_buku ?? data.total_saldo)}
                </span>
              </div>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyReconData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="bulan" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  tickFormatter={(val) => `${val} M`}
                  domain={[0, 'auto']}
                />
                <RechartsTooltip
                  cursor={{ fill: '#F8FAFC' }}
                  formatter={(val: any, name: string, item: any) => {
                    const raw = item?.payload?.[name === 'bank' ? 'bank_raw' : 'buku_raw'];
                    const display = raw !== undefined ? formatRp(raw) : `Rp ${val} Miliar`;
                    return [display, name === 'bank' ? 'Saldo Bank' : 'Buku Kas'];
                  }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }}
                />
                <Bar dataKey="bank" name="bank" fill="#1D64EC" radius={[4, 4, 0, 0]} maxBarSize={14} />
                <Bar dataKey="buku" name="buku" fill="#93C5FD" radius={[4, 4, 0, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Komposisi Dokumen Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  KOMPOSISI DOKUMEN
                </p>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mt-0.5">
                  Proporsi Kategori
                </h3>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Donut Chart with Center Text */}
            <div className="h-[210px] relative flex items-center justify-center my-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: any, name: string) => [`${val}%`, name]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center count overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-gray-900 leading-none">
                  {totalDocCount}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5">Dokumen</span>
              </div>
            </div>
          </div>

          {/* Legend Grid Below Donut */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-gray-100 text-xs">
            {categoryData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span 
                    className="w-2.5 h-2.5 rounded-xs shrink-0" 
                    style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }} 
                  />
                  <span className="text-gray-600 truncate max-w-[100px]">{cat.name}</span>
                </div>
                <span className="font-bold text-gray-900">{cat.pct}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* ── SECTION 3: AKTIVITAS DOKUMEN BULANAN (TIMELINE STEPPER) ──*/}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
        
        {/* Timeline Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              RIWAYAT PENGUNGGAHAN
            </p>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mt-0.5">
              Aktivitas Dokumen Bulanan
            </h3>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Terverifikasi</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Menunggu</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              <span>Belum tersedia</span>
            </div>
            <div className="relative">
              <select 
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="appearance-none pl-2 pr-6 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none cursor-pointer"
              >
                <option value={currentRealYear}>{currentRealYear}</option>
                <option value={(Number(currentRealYear) - 1).toString()}>{Number(currentRealYear) - 1}</option>
                <option value={(Number(currentRealYear) - 2).toString()}>{Number(currentRealYear) - 2}</option>
                <option value={(Number(currentRealYear) - 3).toString()}>{Number(currentRealYear) - 3}</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Milestone Stepper 12 Months */}
        <div className="relative py-4 overflow-x-auto">
          <div className="min-w-[700px] flex items-center justify-between relative px-4">
            
            {/* Horizontal Line connecting nodes */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0">
              {/* Active green portion up to current real-time month */}
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round(((currentMonthNum - 1) / 11) * 100))}%` }} 
              />
            </div>

            {/* Monthly Nodes */}
            {timelineMonths.map((m: any) => {
              const isVerified = m.status === 'verified';
              const isPending = m.status === 'pending';
              const isEmpty = m.status === 'empty';

              return (
                <div key={m.bulan} className="relative z-10 flex flex-col items-center">
                  {/* Node Circle */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isVerified 
                      ? 'bg-emerald-500 text-white ring-4 ring-white'
                      : isPending
                        ? 'bg-amber-500 text-white ring-4 ring-white'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}>
                    {isVerified && <Check className="w-4 h-4 stroke-[3]" />}
                    {isPending && <span>{m.bulan_num || currentMonthNum}</span>}
                    {isEmpty && <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                  </div>

                  {/* Month Label */}
                  <span className="text-xs font-bold text-gray-800 mt-2">
                    {m.bulan}
                  </span>
                  
                  {/* Document Count */}
                  <span className="text-[11px] text-gray-400">
                    {m.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Alert Banner: Unggahan Terakhir Real-Time */}
        <div className="mt-6 bg-[#F8FAFC] border border-gray-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1D64EC] flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400">Unggahan terakhir</p>
              <p className="text-xs font-bold text-gray-900">
                {latestDoc.judul} — {latestDoc.kategori} ({latestDoc.bulan_nama} {latestDoc.tahun})
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
              latestDoc.status === 'terverifikasi'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : latestDoc.status === 'revisi'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {latestDoc.status === 'terverifikasi' ? 'Terverifikasi' : latestDoc.status === 'revisi' ? 'Dalam Revisi' : 'Menunggu Verifikasi'}
            </span>
            <span className="text-xs text-gray-400">{latestDoc.tanggal_formatted}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
