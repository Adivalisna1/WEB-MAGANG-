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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari judul atau kode laporan..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Kategori */}
        <select
          value={kategori}
          onChange={e => setKategori(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900 transition-colors"
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
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900 transition-colors"
        >
          <option value="">Semua Tahun</option>
          {tahunList.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Tombol */}
        <div className="flex gap-2">
          <button
            onClick={applyFilter}
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
          {hasFilter && (
            <button
              onClick={resetFilter}
              className="btn-secondary flex items-center gap-1.5 text-sm"
              title="Reset filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
