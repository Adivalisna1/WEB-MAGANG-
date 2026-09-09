import { Suspense } from 'react';
import { getDokumen, getKategori, getStatsPublik } from '@/lib/api';
import DokumenCard from '@/components/ui/DokumenCard';
import FilterBar from '@/components/ui/FilterBar';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';

interface SearchParams {
  q?:       string;
  kategori?: string;
  tahun?:   string;
  page?:    string;
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
      limit: 20,
    }),
    getKategori(),
    getStatsPublik(),
  ]);

  const dokumenList  = dokumenRes.data   ?? [];
  const kategoriList = kategoriRes.data  ?? [];
  const meta         = dokumenRes.meta;
  const stats = statsRes.data ?? {
    totalDokumen: meta?.total ?? 0,
    totalKategori: kategoriList.length,
    totalDownload: 0,
  };

  const hasFilter = searchParams.q || searchParams.kategori || searchParams.tahun;

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
      </section>

      {/* ── STATS ROW ── */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
        }}
      >
        {[
          { label: 'Total Dokumen',    value: stats.totalDokumen },
          { label: 'Kategori Tersedia', value: stats.totalKategori },
          { label: 'Total Unduhan',    value: stats.totalDownload.toLocaleString('id-ID') },
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

        {/* Filter Bar */}
        <Suspense fallback={<div className="h-12 bg-white rounded-lg animate-pulse mb-5" />}>
          <FilterBar kategoriList={kategoriList} basePath="/laporan" />
        </Suspense>

        {/* Filter label */}
        {hasFilter && (
          <div className="mt-3 mb-4 flex items-center gap-2 text-sm text-slate-500">
            <span>Hasil pencarian</span>
            {searchParams.q       && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">"{searchParams.q}"</span>}
            {searchParams.kategori && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium border border-indigo-100">{searchParams.kategori}</span>}
            {searchParams.tahun   && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">Tahun {searchParams.tahun}</span>}
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
    </div>
  );
}
