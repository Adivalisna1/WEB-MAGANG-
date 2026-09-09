'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Kategori } from '@/lib/api';

interface Props {
  kategoriList: Kategori[];
  basePath?: string;
}

export default function FilterBar({ kategoriList, basePath = '/' }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [q,        setQ]        = useState(searchParams.get('q')        ?? '');
  const [kategori, setKategori] = useState(searchParams.get('kategori') ?? '');
  const [tahun,    setTahun]    = useState(searchParams.get('tahun')    ?? '');

  // Buat tahun pilihan dari 2015 s/d sekarang
  const tahunList = Array.from(
    { length: new Date().getFullYear() - 2014 },
    (_, i) => new Date().getFullYear() - i
  );

  const applyFilter = useCallback(() => {
    const params = new URLSearchParams();
    if (q)        params.set('q', q);
    if (kategori) params.set('kategori', kategori);
    if (tahun)    params.set('tahun', tahun);
    router.push(`${basePath}?${params.toString()}`);
  }, [q, kategori, tahun, router, basePath]);

  // Submit saat tekan Enter di search box
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyFilter();
  };

  const resetFilter = () => {
    setQ(''); setKategori(''); setTahun('');
    router.push(basePath);
  };

  const hasFilter = q || kategori || tahun;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '14px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'center',
      }}
    >
      {/* Search */}
      <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
        <Search
          style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94a3b8',
          }}
        />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Cari judul atau kode laporan..."
          style={{
            width: '100%', paddingLeft: '36px', paddingRight: '12px',
            paddingTop: '8px', paddingBottom: '8px',
            fontSize: '0.85rem', border: '1px solid #e2e8f0',
            borderRadius: '8px', outline: 'none',
            background: '#f8fafc', color: '#1e293b',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#2563eb';
            e.currentTarget.style.background = '#fff';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Kategori */}
      <select
        value={kategori}
        onChange={e => setKategori(e.target.value)}
        style={{
          fontSize: '0.85rem', border: '1px solid #e2e8f0',
          borderRadius: '8px', padding: '8px 12px',
          outline: 'none', background: '#f8fafc', color: '#1e293b',
          cursor: 'pointer',
        }}
      >
        <option value="">Semua Kategori</option>
        {kategoriList.map(k => (
          <option key={k.id} value={k.slug}>{k.nama}</option>
        ))}
      </select>

      {/* Tahun */}
      <select
        value={tahun}
        onChange={e => setTahun(e.target.value)}
        style={{
          fontSize: '0.85rem', border: '1px solid #e2e8f0',
          borderRadius: '8px', padding: '8px 12px',
          outline: 'none', background: '#f8fafc', color: '#1e293b',
          cursor: 'pointer',
        }}
      >
        <option value="">Semua Tahun</option>
        {tahunList.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* Tombol */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={applyFilter}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#2563eb', color: '#fff', border: 'none',
            padding: '8px 18px', borderRadius: '8px',
            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'; }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </button>
        {hasFilter && (
          <button
            onClick={resetFilter}
            title="Reset filter"
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: '#fff', color: '#64748b',
              border: '1px solid #e2e8f0',
              padding: '8px 14px', borderRadius: '8px',
              fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
