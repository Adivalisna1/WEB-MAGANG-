'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Kategori, Satker } from '@/lib/api';

interface Props {
  kategoriList: Kategori[];
  satkerList?: Satker[];
  basePath?: string;
}

export default function FilterBar({ kategoriList, satkerList = [], basePath = '/' }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // Kita tetap butuh baca state 'q' dari URL agar saat klik "Filter", 'q' tidak hilang
  const q = searchParams.get('q') ?? '';

  const [kategori, setKategori] = useState(searchParams.get('kategori') ?? '');
  const [tahun,    setTahun]    = useState(searchParams.get('tahun')    ?? '');
  const [satker,   setSatker]   = useState(searchParams.get('satker')   ?? '');

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
    if (satker)   params.set('satker', satker);
    router.push(`${basePath}?${params.toString()}`);
  }, [q, kategori, tahun, satker, router, basePath]);

  const resetFilter = () => {
    setKategori(''); setTahun(''); setSatker('');
    if (q) {
      router.push(`${basePath}?q=${encodeURIComponent(q)}`);
    } else {
      router.push(basePath);
    }
  };

  const hasFilter = kategori || tahun || satker;

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
      {/* Satker */}
      <select
        value={satker}
        onChange={e => setSatker(e.target.value)}
        style={{
          fontSize: '0.85rem', border: '1px solid #e2e8f0',
          borderRadius: '8px', padding: '8px 12px',
          outline: 'none', background: '#f8fafc', color: '#1e293b',
          cursor: 'pointer',
        }}
      >
        <option value="">Semua Divisi / Satker</option>
        {satkerList.map(s => (
          <option key={s.id} value={s.id}>{s.nama}</option>
        ))}
      </select>

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
