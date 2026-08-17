'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Hook untuk protect halaman — redirect ke /login kalau belum login
// role: 'admin' | 'staff' | 'ketua_tim' | undefined (semua role boleh)
export function useRequireAuth(role?: 'admin' | 'staff' | 'ketua_tim') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (role && user.role !== role) {
      // Redirect ke dashboard masing-masing kalau role tidak sesuai
      if (user.role === 'admin')          router.replace('/admin');
      else if (user.role === 'ketua_tim') router.replace('/ketua');
      else                                router.replace('/staff/dokumen');
    }
  }, [user, loading, role, router]);

  return { user, loading };
}
