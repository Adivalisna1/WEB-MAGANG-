'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Hook untuk protect halaman — redirect ke /login kalau belum login
export type Role = 'pimpinan_satker' | 'staff_satker' | 'eselon_1' | 'admin_it' | 'operator' | 'manajemen' | 'administrasi' | 'it';

export type AuthSection = 'staff' | 'pimpinan' | 'eselon_1' | 'kl' | 'admin_it' | Role;

export function useRequireAuth(role?: AuthSection | AuthSection[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    const r = user.role;
    const t = user.tingkat;
    const isIt = Boolean(
      user.is_it ||
      r === 'admin_it' ||
      r === 'it' ||
      (t === 'kl' && (user.permissions?.can_manage_users || ['it_admin', 'naufal'].includes(user.username)))
    );

    if (role) {
      const allowed = Array.isArray(role) ? role : [role];
      let isAuthorized = false;

      for (const item of allowed) {
        if (item === 'staff' || item === 'staff_satker' || item === 'operator') {
          if (r === 'operator' || r === 'staff_satker' || isIt) isAuthorized = true;
        } else if (item === 'pimpinan' || item === 'pimpinan_satker' || item === 'manajemen' || item === 'administrasi') {
          if ((t === 'satker' && (r === 'manajemen' || r === 'administrasi')) || r === 'pimpinan_satker' || isIt) isAuthorized = true;
        } else if (item === 'kl') {
          if (t === 'kl' || isIt) isAuthorized = true;
        } else if (item === 'eselon_1') {
          if (t === 'eselon_1' || t === 'kl' || r === 'eselon_1' || isIt) isAuthorized = true;
        } else if (item === 'admin_it' || item === 'it') {
          if (isIt) isAuthorized = true;
        } else if (r === item) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        // Redirect ke dashboard masing-masing jika tidak berhak
        if (isIt) {
          router.replace('/admin-it');
        } else if (t === 'kl') {
          router.replace('/kl');
        } else if (r === 'eselon_1' || t === 'eselon_1') {
          router.replace('/eselon-1');
        } else if (r === 'pimpinan_satker' || (t === 'satker' && (r === 'manajemen' || r === 'administrasi'))) {
          router.replace('/pimpinan');
        } else {
          router.replace('/staff/dokumen');
        }
      }
    }
  }, [user, loading, role, router]);

  return { user, loading };
}
