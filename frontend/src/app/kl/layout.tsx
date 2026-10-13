'use client';

import React from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Loader2 } from 'lucide-react';
import './kl.css';

export default function KLLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useRequireAuth('kl');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173b75]" />
          <span className="text-xs text-slate-500 font-medium tracking-wide">
            Memuat Portal Eksekutif K/L...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="kl-app-container">
      {children}
    </div>
  );
}
