import { Suspense } from 'react';
import { getDokumen, getKategori, getStatsPublik } from '@/lib/api';
import DokumenCard from '@/components/ui/DokumenCard';
import FilterBar from '@/components/ui/FilterBar';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { FileText, Download, FolderOpen } from 'lucide-react';

interface SearchParams {
  q?:       string;
  kategori?: string;
  tahun?:   string;
  page?:    string;
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm transition-colors duration-200">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = Number(searchParams.page) || 1;

  const [dokumenRes, kategoriRes, statsRes] = await Promise.all([
    getDokumen({
      q:        searchParams.q,
      kategori: searchParams.kategori,
      tahun:    searchParams.tahun,
      page,
      limit: 12,
    }),
    getKategori(),
    getStatsPublik(),
  ]);

  const dokumenList  = dokumenRes.data   ?? [];
  const kategoriList = kategoriRes.data  ?? [];
  const meta         = dokumenRes.meta;
  const stats = statsRes.data ?? { totalDokumen: meta?.total ?? 0, totalKategori: kategoriList.length, totalDownload: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 dark:from-slate-900 dark:via-slate-800 dark:to-primary-950 rounded-2xl p-8 text-white shadow-md border border-primary-700/40 dark:border-slate-800 transition-colors duration-200">
        <h1 className="text-3xl font-bold mb-2">Portal Dokumen Laporan</h1>
        <p className="text-blue-100 dark:text-slate-300 text-lg max-w-2xl">
          Akses dan unduh dokumen laporan kinerja, rencana strategis, dan dokumen perencanaan lainnya.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={FileText}   label="Total Dokumen"    value={stats.totalDokumen}                          color="bg-blue-500" />
        <StatCard icon={FolderOpen} label="Kategori Tersedia" value={stats.totalKategori}                        color="bg-purple-500" />
        <StatCard icon={Download}   label="Total Unduhan"    value={stats.totalDownload.toLocaleString('id-ID')} color="bg-green-500" />
      </section>

      {/* Filter */}
      <Suspense fallback={<div className="h-16 bg-white dark:bg-slate-900 rounded-xl animate-pulse" />}>
        <FilterBar kategoriList={kategoriList} basePath="/laporan" />
      </Suspense>

      {/* Label hasil filter */}
      {(searchParams.q || searchParams.kategori || searchParams.tahun) && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
          <span>Hasil pencarian</span>
          {searchParams.q       && <span className="badge bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">"{searchParams.q}"</span>}
          {searchParams.kategori && <span className="badge bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">{searchParams.kategori}</span>}
          {searchParams.tahun   && <span className="badge bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">Tahun {searchParams.tahun}</span>}
          {meta && <span className="text-gray-400 dark:text-slate-500">— {meta.total} dokumen ditemukan</span>}
        </div>
      )}

      {/* Daftar Dokumen */}
      {dokumenList.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <section
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            aria-label="Daftar dokumen"
          >
            {dokumenList.map(dok => (
              <DokumenCard key={dok.id} dokumen={dok} />
            ))}
          </section>

          {meta && meta.totalPages > 1 && (
            <Suspense>
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                basePath="/laporan"
              />
            </Suspense>
          )}
        </>
      )}
    </div>
  );
}
