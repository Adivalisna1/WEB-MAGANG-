'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Kategori, Satker } from '@/lib/api';

interface Props {
  basePath?: string;
  kategoriList?: Kategori[];
  satkerList?: Satker[];
}

export default function HeroSearchInput({
  basePath = '/laporan',
  kategoriList = [],
  satkerList = [],
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const debouncedQ = useDebounce(searchInput, 300);
  const [mounted, setMounted] = useState(false);

  const [kategori, setKategori] = useState(searchParams.get('kategori') ?? '');
  const [tahun,    setTahun]    = useState(searchParams.get('tahun')    ?? '');
  const [satker,   setSatker]   = useState(searchParams.get('satker')   ?? '');

  const tahunList = Array.from(
    { length: new Date().getFullYear() - 2014 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setSearchInput(searchParams.get('q') ?? '');
    setKategori(searchParams.get('kategori') ?? '');
    setTahun(searchParams.get('tahun') ?? '');
    setSatker(searchParams.get('satker') ?? '');
  }, [searchParams]);

  // Live search — debounced
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQ) { params.set('q', debouncedQ); } else { params.delete('q'); }
    router.push(`${basePath}?${params.toString()}`);
  }, [debouncedQ, mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilter = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (kategori)   params.set('kategori', kategori);
    if (tahun)      params.set('tahun', tahun);
    if (satker)     params.set('satker', satker);
    router.push(`${basePath}?${params.toString()}`);
  }, [debouncedQ, kategori, tahun, satker, router, basePath]);

  const selectStyle: React.CSSProperties = {
    fontSize: '0.82rem',
    border: 'none',
    borderRadius: '8px',
    padding: '0 10px',
    outline: 'none',
    background: 'transparent',
    color: '#1e293b',
    cursor: 'pointer',
    height: '100%',
    borderLeft: '1px solid #e2e8f0',
    flexShrink: 0,
  };

  return (
    <div style={{ marginTop: '28px', maxWidth: '820px' }}>
      {/* Single-row: search + filter dropdowns */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: '2px solid transparent',
          overflow: 'hidden',
          height: '50px',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocusCapture={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#3b82f6';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(59,130,246,0.25)';
        }}
        onBlurCapture={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
        }}
      >
        {/* Search Icon */}
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '16px', flexShrink: 0 }}>
          <Search style={{ width: '17px', height: '17px', color: '#94a3b8' }} />
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Cari judul atau kode laporan..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            paddingLeft: '12px',
            paddingRight: '8px',
            fontSize: '0.9rem',
            color: '#1e293b',
            background: 'transparent',
            minWidth: 0,
          }}
        />

        {/* Clear button */}
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '22px', height: '22px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b', marginRight: '6px',
            }}
          >
            <X style={{ width: '12px', height: '12px' }} />
          </button>
        )}

        {/* Divider */}
        <div style={{ width: '1px', height: '60%', background: '#e2e8f0', flexShrink: 0 }} />

        {/* Satker dropdown */}
        <select value={satker} onChange={e => setSatker(e.target.value)} style={selectStyle}>
          <option value="">Semua Satker</option>
          {satkerList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
        </select>

        {/* Kategori dropdown */}
        <select value={kategori} onChange={e => setKategori(e.target.value)} style={selectStyle}>
          <option value="">Semua Kategori</option>
          {kategoriList.map(k => <option key={k.id} value={k.slug}>{k.nama}</option>)}
        </select>

        {/* Tahun dropdown */}
        <select value={tahun} onChange={e => setTahun(e.target.value)} style={selectStyle}>
          <option value="">Semua Tahun</option>
          {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Filter Button */}
        <button
          onClick={applyFilter}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#2563eb', color: '#fff', border: 'none',
            padding: '0 18px', height: '100%', flexShrink: 0,
            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            borderLeft: '1px solid rgba(255,255,255,0.2)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'; }}
        >
          <SlidersHorizontal style={{ width: '14px', height: '14px' }} />
          Filter
        </button>
      </div>
    </div>
  );
}
