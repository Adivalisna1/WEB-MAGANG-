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
  isAdmin:   boolean;
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

    // Redirect sesuai role
    if (res.data.user.role === 'admin') {
      router.push('/admin');
    } else if (res.data.user.role === 'ketua_tim') {
      router.push('/ketua');
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

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      loginFn, logoutFn,
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'staff',
      isKetuaTim: user?.role === 'ketua_tim',
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
