'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default function AutoFilterSatker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const session = getSession();
    if (!session) return;

    const userRole = session.user.role;
    // Pimpinan dan Staff hanya boleh melihat satker mereka sendiri
    if (userRole === 'pimpinan_satker' || userRole === 'staff_satker') {
      const currentSatker = searchParams.get('satker');
      
      const fetchProfile = async () => {
        try {
          const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const authRes = await fetch(`${API}/auth/me`, {
            headers: { 'Authorization': `Bearer ${session.token}` }
          });
          const json = await authRes.json();
          if (json.success && json.data.satker_id) {
            const userSatkerId = json.data.satker_id.toString();
            
            // Jika satker di URL beda dengan satker user, atau belum ada, paksa ganti
            if (currentSatker !== userSatkerId) {
              const params = new URLSearchParams(searchParams.toString());
              params.set('satker', userSatkerId);
              router.replace(`?${params.toString()}`);
            }
          }
        } catch (error) {
          console.error('Failed to fetch profile for auto-filter', error);
        }
      };

      fetchProfile();
    }
  }, [mounted, searchParams, router]);

  return null;
}
