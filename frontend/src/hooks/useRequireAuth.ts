'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Hook untuk protect halaman — redirect ke /login kalau belum login
// role: satu role atau daftar role yang boleh akses
export type Role = 'pimpinan' | 'satker' | 'eselon_1';

export function useRequireAuth(role?: Role | Role[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    const allowed = role ? (Array.isArray(role) ? role : [role]) : null;
    if (allowed && !allowed.includes(user.role)) {
      // Redirect ke dashboard masing-masing kalau role tidak sesuai
      if (user.role === 'pimpinan') router.replace('/Pimpinan');
      else if (user.role === 'eselon_1') router.replace('/ketua');
      else                                router.replace('/satker/dokumen');
    }
  }, [user, loading, role, router]);

  return { user, loading };
}

