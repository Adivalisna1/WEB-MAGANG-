'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Hook untuk protect halaman — redirect ke /login kalau belum login
// role: satu role atau daftar role yang boleh akses
export type Role = 'pimpinan' | 'satker' | 'eselon_1' | 'admin_it' | 'administrasi' | 'staff';

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
    if (allowed && !allowed.includes(user.role as Role)) {
      // Redirect ke dashboard masing-masing kalau role tidak sesuai
      if (user.role === 'pimpinan')       router.replace('/pimpinan');
      else if (user.role === 'eselon_1')  router.replace('/eselon-1');
      else if (user.role === 'admin_it')  router.replace('/admin-it');
      else if (user.role === 'administrasi') router.replace('/administrasi');
      else                                router.replace('/satker/dokumen');
    }
  }, [user, loading, role, router]);

  return { user, loading };
}
