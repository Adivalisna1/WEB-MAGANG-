const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  id: number;
  nama: string;
  username: string;
  email: string;
  role: 'pimpinan_satker' | 'staff_satker' | 'eselon_1' | 'admin_it';
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// Login — simpan token ke localStorage
export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login gagal');
  return data;
}

// Logout — hapus token
export async function logout(token: string): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Simpan sesi ke localStorage
export function saveSession(token: string, user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

// Ambil sesi dari localStorage
export function getSession(): { token: string; user: User } | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  const raw   = localStorage.getItem('user');
  if (!token || !raw) return null;
  try {
    return { token, user: JSON.parse(raw) };
  } catch {
    return null;
  }
}

// Hapus sesi dari localStorage
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Fetch dengan auth header (untuk client component)
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const session = getSession();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options.headers,
    },
  });

  // Interceptor Pasif: Jika server menolak token (Sesi Berakhir / Ketendang)
  if (res.status === 401 && typeof window !== 'undefined') {
    clearSession();
    window.location.href = '/login?kicked=true';
  }

  return res;
}
