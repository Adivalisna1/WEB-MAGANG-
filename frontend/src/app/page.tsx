import { Suspense } from 'react';
import { getDokumen, getKategori } from '@/lib/api';
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

// Komponen statistik ringkas
function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = Number(searchParams.page) || 1;

  // Fetch paralel
  const [dokumenRes, kategoriRes] = await Promise.all([
    getDokumen({
      q:        searchParams.q,
      kategori: searchParams.kategori,
      tahun:    searchParams.tahun,
      page,
      limit: 12,
    }),
    getKategori(),
  ]);

  const dokumenList  = dokumenRes.data   ?? [];
  const kategoriList = kategoriRes.data  ?? [];
  const meta         = dokumenRes.meta;

  // Hitung total download dari data yang ada
  const totalDownload = dokumenList.reduce((sum, d) => sum + (d.download_count ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Portal Dokumen Perencanaan</h1>
        <p className="text-blue-100 text-lg max-w-2xl">
          Akses dan unduh dokumen laporan kinerja, rencana strategis, dan dokumen perencanaan lainnya secara bebas.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={FileText}
          label="Total Dokumen"
          value={meta?.total ?? dokumenList.length}
          color="bg-blue-500"
        />
        <StatCard
          icon={FolderOpen}
          label="Kategori Tersedia"
          value={kategoriList.length}
          color="bg-purple-500"
        />
        <StatCard
          icon={Download}
          label="Total Unduhan"
          value={totalDownload.toLocaleString('id-ID')}
          color="bg-green-500"
        />
      </section>

      {/* Filter */}
      <Suspense fallback={<div className="h-16 bg-white rounded-xl animate-pulse" />}>
        <FilterBar kategoriList={kategoriList} />
      </Suspense>

      {/* Label hasil filter */}
      {(searchParams.q || searchParams.kategori || searchParams.tahun) && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Hasil pencarian</span>
          {searchParams.q && (
            <span className="badge bg-blue-100 text-blue-800">"{searchParams.q}"</span>
          )}
          {searchParams.kategori && (
            <span className="badge bg-purple-100 text-purple-800">{searchParams.kategori}</span>
          )}
          {searchParams.tahun && (
            <span className="badge bg-green-100 text-green-800">Tahun {searchParams.tahun}</span>
          )}
          {meta && (
            <span className="text-gray-400">— {meta.total} dokumen ditemukan</span>
          )}
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

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <Suspense>
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
              />
            </Suspense>
          )}
        </>
      )}
    </div>
  );
}
