import { Suspense } from 'react';
import { getDokumen, getKategori, getStatsPublik, getSatkers } from '@/lib/api';
import DokumenCard from '@/components/ui/DokumenCard';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import HeroSearchInput from '@/components/ui/HeroSearchInput';
import ChartDashboard from '@/components/ui/ChartDashboard';
import AutoFilterSatker from '@/components/ui/AutoFilterSatker';
import Link from 'next/link';
import { ListFilter, BarChart3, Calendar, FileText } from 'lucide-react';

interface SearchParams {
  q?: string;
  kategori?: string;
  tahun?: string;
  satker?: string;
  page?: string;
  view?: string;
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = Number(searchParams.page) || 1;
  const viewMode = searchParams.view === 'chart' ? 'chart' : 'list';

  const [dokumenRes, kategoriRes, statsRes, satkerRes] = await Promise.all([
    getDokumen({
      q: searchParams.q,
      kategori: searchParams.kategori,
      tahun: searchParams.tahun,
      satker: searchParams.satker,
      page,
      limit: 20,
    }),
    getKategori(),
    getStatsPublik(),
    getSatkers().catch(() => ({ success: true, data: [] }))
  ]);

  const dokumenList = dokumenRes.data ?? [];
  const kategoriList = kategoriRes.data ?? [];
  const satkerList = satkerRes.data ?? [];
  const meta = dokumenRes.meta;
  const stats = statsRes.data ?? {
    totalDokumen: meta?.total ?? 0,
    totalKategori: kategoriList.length,
    totalDownload: 0,
  };

  const hasFilter = searchParams.q || searchParams.kategori || searchParams.tahun || searchParams.satker;
  const selectedSatkerName = searchParams.satker ? satkerList.find(s => s.id.toString() === searchParams.satker)?.nama : null;
  const currentYear = searchParams.tahun || new Date().getFullYear().toString();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Suspense fallback={null}>
        <AutoFilterSatker />
      </Suspense>

      {/* ============================================================ */}
      {/* ── HERO BANNER (DEEP ROYAL BLUE + CONCENTRIC GRID DECOR) ──  */}
      {/* ============================================================ */}
      <section className="relative bg-gradient-to-r from-[#1E3A8A] via-[#1D4ED8] to-[#1D64EC] pt-12 pb-16 px-4 sm:px-8 lg:px-12 xl:px-16 overflow-hidden text-white w-full">
        
        {/* Subtle decorative concentric circles overlay matching Figma */}
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full border border-white/10 pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none translate-x-1/4 -translate-y-1/4" />
        <div className="absolute left-1/4 bottom-0 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="w-full relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Title & Tagline */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                  PORTAL INTERNAL
                </p>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-white tracking-tight leading-tight mb-2">
                Dokumen Laporan
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-xl leading-relaxed">
                Akses, kelola, dan pantau rekonsiliasi rekening koran serta laporan kinerja.
              </p>
            </div>

            {/* Right Badge: Periode Aktif */}
            <div className="hidden md:flex flex-col items-end">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 text-right shadow-sm">
                <p className="text-[11px] text-blue-200 font-medium">Periode aktif</p>
                <p className="text-sm font-bold text-white tracking-tight mt-0.5">
                  Tahun Anggaran {currentYear}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SEGMENTED TAB SWITCHER (Dinaikkan sedikit & ada breathing room)*/}
          {/* ============================================================ */}
          <div className="mt-8 mb-4 inline-flex items-center bg-white/15 backdrop-blur-md rounded-2xl p-1.5 border border-white/20 shadow-sm">
            <Link
              href="?view=list"
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-white text-[#1D64EC] shadow-md'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Daftar Dokumen</span>
            </Link>

            <Link
              href="?view=chart"
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                viewMode === 'chart'
                  ? 'bg-white text-[#1D64EC] shadow-md'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistik & Grafik</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* ── UNIVERSAL FLOATING FILTER CARD (Overlap Hero Edge) ──     */}
      {/* ============================================================ */}
      <div className="relative -mt-7 sm:-mt-8 w-full px-4 sm:px-8 lg:px-12 xl:px-16 z-20">
        <Suspense fallback={<div className="h-16 bg-white rounded-2xl shadow-md animate-pulse" />}>
          <HeroSearchInput
            basePath="/laporan"
            kategoriList={kategoriList}
            satkerList={satkerList}
          />
        </Suspense>
      </div>

      {/* ============================================================ */}
      {/* ── KONTEN UTAMA: STATISTIK & GRAFIK vs DAFTAR DOKUMEN ──     */}
      {/* ============================================================ */}
      {viewMode === 'chart' ? (
        <Suspense fallback={<div className="w-full py-24 flex items-center justify-center text-gray-400">Memuat data statistik & grafik...</div>}>
          <ChartDashboard />
        </Suspense>
      ) : (
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8">
          
          {/* Active Filter Chips */}
          {hasFilter && (
            <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-500 bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
              <span className="font-semibold text-gray-700">Hasil filter:</span>
              {searchParams.q && (
                <span className="px-2.5 py-1 bg-blue-50 text-[#1D64EC] rounded-lg font-medium border border-blue-100">
                  "{searchParams.q}"
                </span>
              )}
              {searchParams.kategori && (
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-medium border border-indigo-100">
                  {searchParams.kategori}
                </span>
              )}
              {searchParams.tahun && (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                  Tahun {searchParams.tahun}
                </span>
              )}
              {selectedSatkerName && (
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium border border-emerald-100">
                  {selectedSatkerName}
                </span>
              )}
              {meta && (
                <span className="text-gray-400 ml-auto">
                  {meta.total} dokumen ditemukan
                </span>
              )}
            </div>
          )}

          {/* Quick Stats Grid Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Total Dokumen
              </p>
              <h3 className="text-2xl font-extrabold text-gray-900">
                {stats.totalDokumen}
              </h3>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Kategori Tersedia
              </p>
              <h3 className="text-2xl font-extrabold text-gray-900">
                {stats.totalKategori}
              </h3>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Total Satker
              </p>
              <h3 className="text-2xl font-extrabold text-gray-900">
                {satkerList.length}
              </h3>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Total Unduhan
              </p>
              <h3 className="text-2xl font-extrabold text-gray-900">
                {stats.totalDownload.toLocaleString('id-ID')}
              </h3>
            </div>
          </div>

          {/* Document Cards List */}
          {dokumenList.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {dokumenList.map(dok => (
                <DokumenCard key={dok.id} dokumen={dok} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-8">
              <Suspense>
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  basePath="/laporan"
                />
              </Suspense>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
