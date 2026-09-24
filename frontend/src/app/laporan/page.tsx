import { Suspense } from 'react';
import { getDokumen, getKategori, getStatsPublik, getSatkers } from '@/lib/api';
import DokumenCard from '@/components/ui/DokumenCard';
import FilterBar from '@/components/ui/FilterBar';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import HeroSearchInput from '@/components/ui/HeroSearchInput';
import ChartDashboard from '@/components/ui/ChartDashboard';
import Link from 'next/link';

interface SearchParams {
  q?: string;
  kategori?: string;
  tahun?: string;
  satker?: string;
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

  // Find the selected satker name for the filter label
  const selectedSatkerName = searchParams.satker ? satkerList.find(s => s.id.toString() === searchParams.satker)?.nama : null;

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* ── HERO BANNER ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #312e81 100%)',
          padding: '52px 52px 48px',
        }}
      >
        <p
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '12px',
          }}
        >
          Portal Internal
        </p>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '8px',
            letterSpacing: '-0.5px',
          }}
        >
          Dokumen Laporan
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: '500px' }}>
          Akses dan unduh dokumen laporan kinerja, rencana strategis, dan dokumen perencanaan lainnya.
        </p>

        {/* Toggle View (List vs Chart) */}
        <div className="mt-6 flex items-center bg-white/10 backdrop-blur-md rounded-lg p-1 w-fit border border-white/20">
          <Link
            href="?view=list"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-blue-900 shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
          >
            Daftar Dokumen
          </Link>
          <Link
            href="?view=chart"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'chart' ? 'bg-white text-blue-900 shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
          >
            Statistik & Grafik
          </Link>
        </div>

        {/* Hero Search + Filter Bar (Hanya tampil di mode List) */}
        {viewMode === 'list' && (
          <Suspense fallback={<div style={{ height: '50px', marginTop: '28px', maxWidth: '820px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }} />}>
            <HeroSearchInput basePath="/laporan" kategoriList={kategoriList} satkerList={satkerList} />
          </Suspense>
        )}
      </section>

      {viewMode === 'chart' ? (
        <ChartDashboard />
      ) : (
        <>
          {/* ── STATS ROW ── */}
          <div
            style={{
              background: '#fff',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
            }}
          >
            {[
              { label: 'Total Dokumen', value: stats.totalDokumen },
              { label: 'Kategori Tersedia', value: stats.totalKategori },
              { label: 'Total Satker', value: satkerList.length },
              { label: 'Total Unduhan', value: stats.totalDownload.toLocaleString('id-ID') },
            ].map((s, i, arr) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  padding: '20px 52px',
                  borderRight: i < arr.length - 1 ? '1px solid #e2e8f0' : 'none',
                }}
              >
                <div
                  style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    color: '#94a3b8',
                    marginBottom: '4px',
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1e293b' }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── CONTENT ── */}
          <div style={{ padding: '32px 52px 52px' }}>


            {/* Filter label */}
            {hasFilter && (
              <div className="mt-3 mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>Hasil pencarian</span>
                {searchParams.q && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">"{searchParams.q}"</span>}
                {searchParams.kategori && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium border border-indigo-100">{searchParams.kategori}</span>}
                {searchParams.tahun && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">Tahun {searchParams.tahun}</span>}
                {selectedSatkerName && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium border border-emerald-100">{selectedSatkerName}</span>}
                {meta && <span className="text-slate-400">— {meta.total} dokumen ditemukan</span>}
              </div>
            )}

            {/* Doc List */}
            {dokumenList.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* List container */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginTop: '20px',
                  }}
                >
                  {dokumenList.map(dok => (
                    <DokumenCard key={dok.id} dokumen={dok} />
                  ))}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div style={{ marginTop: '32px' }}>
                    <Suspense>
                      <Pagination
                        currentPage={meta.page}
                        totalPages={meta.totalPages}
                        basePath="/laporan"
                      />
                    </Suspense>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
