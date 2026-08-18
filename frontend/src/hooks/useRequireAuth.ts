'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Hook untuk protect halaman — redirect ke /login kalau belum login
// role: satu role atau daftar role yang boleh akses
export type Role = 'admin' | 'staff' | 'ketua_tim' | 'admin_dept';

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
      if (user.role === 'admin' || user.role === 'admin_dept') router.replace('/admin');
      else if (user.role === 'ketua_tim') router.replace('/ketua');
      else                                router.replace('/staff/dokumen');
    }
  }, [user, loading, role, router]);

  return { user, loading };
}
