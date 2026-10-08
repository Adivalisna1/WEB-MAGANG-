'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, login as apiLogin, logout as apiLogout, saveSession, getSession, clearSession } from '@/lib/auth';

interface AuthContextType {
  user:      User | null;
  token:     string | null;
  loading:   boolean;
  loginFn:   (username: string, password: string) => Promise<void>;
  logoutFn:  () => Promise<void>;
  isPimpinan:   boolean;
  isStaff:   boolean;
  isKetuaTim: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const [user,    setUser]    = useState<User | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore sesi dari localStorage saat pertama mount
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);
  }, []);

  const loginFn = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    saveSession(res.data.token, res.data.user);
    setUser(res.data.user);
    setToken(res.data.token);

    // Redirect sesuai role & tingkat
    const r = res.data.user.role;
    const t = res.data.user.tingkat;
    if (r === 'admin_it' || r === 'it') {
      router.push('/admin-it');
    } else if (r === 'eselon_1' || t === 'eselon_1' || t === 'kl') {
      router.push('/eselon-1');
    } else if (r === 'pimpinan_satker' || (t === 'satker' && r === 'administrasi')) {
      router.push('/pimpinan');
    } else {
      router.push('/staff/dokumen');
    }
  }, [router]);

  const logoutFn = useCallback(async () => {
    // Coba logout ke backend, tapi JANGAN blokir logout lokal kalau API gagal
    try {
      if (token) await apiLogout(token);
    } catch (_) {
      // API error (network, token expired, dll) — tetap lanjut logout lokal
    }
    clearSession();
    setUser(null);
    setToken(null);
    router.push('/login');
  }, [token, router]);

  const isPimpinan = Boolean(
    user?.role === 'pimpinan_satker' || 
    (user?.tingkat === 'satker' && user?.role === 'administrasi')
  );
  const isKetuaTim = Boolean(
    user?.role === 'eselon_1' || 
    user?.tingkat === 'eselon_1' || 
    user?.tingkat === 'kl'
  );
  const isStaff = Boolean(
    user?.role === 'staff_satker' || 
    user?.role === 'operator' || 
    (!isPimpinan && !isKetuaTim && user?.role !== 'admin_it')
  );

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      loginFn, logoutFn,
      isPimpinan,
      isStaff,
      isKetuaTim,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}

