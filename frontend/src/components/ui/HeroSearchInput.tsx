'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal, Lock, ChevronDown } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Kategori, Satker } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();

  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const debouncedQ = useDebounce(searchInput, 300);
  const [mounted, setMounted] = useState(false);

  const [kategori, setKategori] = useState(searchParams.get('kategori') ?? '');
  const [tahun,    setTahun]    = useState(searchParams.get('tahun')    ?? '');
  const [satker,   setSatker]   = useState(searchParams.get('satker')   ?? '');

  const isEselon1 = user?.role === 'eselon_1' || user?.role === 'ketua_tim' || user?.role === 'admin_it' || user?.role === 'it' || user?.tingkat === 'eselon_1' || user?.tingkat === 'kl';

  const currentRealYear = new Date().getFullYear();
  const tahunList = Array.from({ length: 6 }, (_, i) => currentRealYear - i);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setSearchInput(searchParams.get('q') ?? '');
    setKategori(searchParams.get('kategori') ?? '');
    setTahun(searchParams.get('tahun') ?? '');
    setSatker(searchParams.get('satker') ?? '');
  }, [searchParams]);

  const [kategoriItems, setKategoriItems] = useState<Kategori[]>(kategoriList);
  const [satkerItems,   setSatkerItems]   = useState<Satker[]>(satkerList);

  useEffect(() => {
    if (kategoriList && kategoriList.length > 0) {
      setKategoriItems(kategoriList);
    } else {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      fetch(`${API}/dokumen/kategori`)
        .then(res => res.json())
        .then(res => {
          if (res.success && res.data) setKategoriItems(res.data);
        })
        .catch(() => {});
    }
  }, [kategoriList]);

  useEffect(() => {
    if (satkerList && satkerList.length > 0) {
      setSatkerItems(satkerList);
    } else {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      fetch(`${API}/satker`)
        .then(res => res.json())
        .then(res => {
          if (res.success && res.data) setSatkerItems(res.data);
        })
        .catch(() => {});
    }
  }, [satkerList]);

  // Live search — debounced
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQ) { params.set('q', debouncedQ); } else { params.delete('q'); }
    router.push(`${basePath}?${params.toString()}`);
  }, [debouncedQ, mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateUrlFilter = useCallback((updates: { q?: string; kategori?: string; tahun?: string; satker?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    const finalQ   = updates.q !== undefined ? updates.q : debouncedQ;
    const finalKat = updates.kategori !== undefined ? updates.kategori : kategori;
    const finalThn = updates.tahun !== undefined ? updates.tahun : tahun;
    const finalStk = updates.satker !== undefined ? updates.satker : satker;

    if (finalQ)   params.set('q', finalQ); else params.delete('q');
    if (finalKat) params.set('kategori', finalKat); else params.delete('kategori');
    if (finalThn) params.set('tahun', finalThn); else params.delete('tahun');
    if (finalStk) params.set('satker', finalStk); else params.delete('satker');
    router.push(`${basePath}?${params.toString()}`);
  }, [debouncedQ, kategori, tahun, satker, router, basePath, searchParams]);

  const applyFilter = useCallback(() => {
    updateUrlFilter({});
  }, [updateUrlFilter]);

  return (
    <div className="w-full">
      {/* Floating Filter Card Diperbesar & Gagah (Figma 1:1) */}
      <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl border border-gray-100 p-3 sm:p-3.5 lg:p-4 flex flex-col md:flex-row items-center gap-3 transition-all min-h-[68px]">
        
        {/* Search Input Box (Besar & Lega) */}
        <div className="flex-1 w-full flex items-center gap-3 px-3 py-2 bg-transparent">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Cari judul dokumen atau kode laporan..."
            className="w-full text-sm sm:text-base font-medium text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Separator on desktop */}
        <div className="hidden md:block w-px h-9 bg-gray-200 shrink-0" />

        {/* Filter Controls Row (Skala Besar & Nyaman Diklik) */}
        <div className="w-full md:w-auto flex flex-wrap md:flex-nowrap items-center gap-2.5 sm:gap-3">
          
          {/* Satker Filter */}
          {!isEselon1 ? (
            // Role Satker: Locked indicator with lock icon
            <div 
              className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 border border-gray-200/90 rounded-xl text-sm text-gray-800 font-semibold shrink-0 min-w-[200px]"
              title="Filter satker dikunci sesuai akun instansi Anda"
            >
              <span className="truncate max-w-[170px]">
                {user?.satker_nama || 'Politeknik Negeri Jakarta'}
              </span>
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
            </div>
          ) : (
            // Role Eselon 1: Interactive Satker dropdown
            <div className="relative shrink-0">
              <select
                value={satker}
                onChange={e => {
                  const val = e.target.value;
                  setSatker(val);
                  updateUrlFilter({ satker: val });
                }}
                className="appearance-none pl-4 pr-9 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none cursor-pointer focus:border-[#1D64EC] transition-colors max-w-[240px] truncate"
              >
                <option value="">Semua Satker (Nasional)</option>
                {satkerItems.map(s => (
                  <option key={s.id} value={s.id}>{s.nama}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Kategori Dropdown (100% Mengambil data dari tabel kategori_dokumen database) */}
          <div className="relative shrink-0">
            <select
              value={kategori}
              onChange={e => {
                const val = e.target.value;
                setKategori(val);
                updateUrlFilter({ kategori: val });
              }}
              className="appearance-none pl-4 pr-9 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none cursor-pointer focus:border-[#1D64EC] transition-colors min-w-[170px] truncate"
            >
              <option value="">Semua Kategori</option>
              {kategoriItems.map(k => (
                <option key={k.id} value={k.slug || k.nama}>
                  {k.nama.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Tahun Dropdown */}
          <div className="relative shrink-0">
            <select
              value={tahun}
              onChange={e => {
                const val = e.target.value;
                setTahun(val);
                updateUrlFilter({ tahun: val });
              }}
              className="appearance-none pl-4 pr-8 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none cursor-pointer focus:border-[#1D64EC] transition-colors min-w-[130px]"
            >
              <option value="">Semua Tahun</option>
              {tahunList.map(t => (
                <option key={t} value={t}>Tahun {t}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Action Filter Button (Lebar & Tegas) */}
          <button
            onClick={applyFilter}
            className="w-full md:w-auto px-7 py-3 bg-[#1D64EC] hover:bg-[#1552C6] active:bg-[#0E45B0] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

      </div>
    </div>
  );
}
