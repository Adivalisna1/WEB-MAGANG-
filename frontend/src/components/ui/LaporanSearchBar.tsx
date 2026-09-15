'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function LaporanSearchBar({ isMobile = false }: { isMobile?: boolean }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    if (mounted && pathname === '/laporan') {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearchTerm) {
        params.set('q', debouncedSearchTerm);
      } else {
        params.delete('q');
      }
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearchTerm, mounted, pathname, router, searchParams]);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (searchTerm) {
      setSearchTerm('');
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q');
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  if (pathname !== '/laporan') return null;

  // Mobile version — always expanded in mobile menu
  if (isMobile) {
    return (
      <div className="relative mb-2">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-primary-200" />
        </div>
        <input
          type="text"
          placeholder="Cari laporan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-primary-600 rounded-lg leading-5 bg-primary-900/40 text-white placeholder-primary-200 focus:outline-none focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
    );
  }

  // Desktop version — Opsi B: Icon-only, expand on click
  return (
    <div className="hidden sm:flex items-center justify-center mx-4">
      <div
        className="flex items-center overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          width: isOpen ? '320px' : '36px',
          background: isOpen ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)',
          borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        {/* Search Icon Button */}
        <button
          onClick={handleOpen}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="Buka pencarian"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Input — hanya muncul saat isOpen */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Cari judul atau kode laporan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && handleClose()}
          className={`flex-1 bg-transparent text-white placeholder-white/40 text-sm focus:outline-none transition-all duration-300 ${
            isOpen ? 'opacity-100 w-full' : 'opacity-0 w-0 pointer-events-none'
          }`}
          style={{ border: 'none', padding: isOpen ? '0 4px' : '0' }}
        />

        {/* Close Button — hanya muncul saat isOpen */}
        {isOpen && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors mr-0.5"
            aria-label="Tutup pencarian"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
