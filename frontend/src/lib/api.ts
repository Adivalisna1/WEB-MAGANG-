// NEXT_PUBLIC_API_URL  â†’ dipakai browser (client-side)
// API_URL_INTERNAL     â†’ dipakai server Next.js di dalam Docker (server-side fetch)
export const getClientApi = (): string => {
  if (typeof window !== "undefined" && window.location.hostname) {
    const { protocol, hostname } = window.location;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
    ) {
      return `${protocol}//${hostname}:5000/api`;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
};
export const API_URL = getClientApi();
const SERVER_API_URL  = process.env.API_URL_INTERNAL       || API_URL;

export interface Dokumen {
  id: number;
  judul: string;
  deskripsi: string | null;
  tahun: number;
  bulan: number | null;
  semester: number | null;
  nomor_laporan: string | null;
  file_nama: string;
  file_size: number | null;
  file_mime: string | null;
  download_count: number;
  created_at: string;
  kategori: string;
  kategori_slug: string;
  nilai_excel?: number | null;
  nilai_rekening_koran?: number | null;
}

export interface Kategori {
  id: number;
  nama: string;
  slug: string;
  deskripsi: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DokumenParams {
  kategori?: string;
  tahun?: string;
  q?: string;
  satker?: string;
  page?: number;
  limit?: number;
}

// Ambil daftar dokumen publik (server-side â€” pakai hostname internal Docker)
export async function getDokumen(params: DokumenParams = {}): Promise<ApiResponse<Dokumen[]>> {
  const query = new URLSearchParams();
  if (params.kategori) query.set('kategori', params.kategori);
  if (params.tahun)    query.set('tahun', params.tahun);
  if (params.q)        query.set('q', params.q);
  if (params.satker)   query.set('satker', params.satker);
  if (params.page)     query.set('page', String(params.page));
  if (params.limit)    query.set('limit', String(params.limit));

  const res = await fetch(`${SERVER_API_URL}/dokumen?${query.toString()}`, {
    cache: 'no-store', // selalu fetch data terbaru
  });
  if (!res.ok) throw new Error('Gagal mengambil data dokumen');
  return res.json();
}

// Ambil daftar kategori (server-side)
export async function getKategori(): Promise<ApiResponse<Kategori[]>> {
  const res = await fetch(`${SERVER_API_URL}/dokumen/kategori`, {
    cache: 'no-store', // selalu fresh â€” supaya kategori baru langsung muncul
  });
  if (!res.ok) throw new Error('Gagal mengambil kategori');
  return res.json();
}

export interface Satker {
  id: number;
  nama: string;
}

// Ambil daftar satker (server-side)
export async function getSatkers(): Promise<ApiResponse<Satker[]>> {
  const res = await fetch(`${SERVER_API_URL}/satker`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Gagal mengambil satker');
  return res.json();
}

// Ambil detail satu dokumen (server-side)
export async function getDokumenById(id: number): Promise<ApiResponse<Dokumen>> {
  const res = await fetch(`${SERVER_API_URL}/dokumen/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Dokumen tidak ditemukan');
  return res.json();
}

// Format ukuran file
export function formatFileSize(bytes: number | null): string {
  if (!bytes) return '-';
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// URL download â€” bisa diakses publik (tanpa token) atau internal (dengan token untuk draft)
export function getDownloadUrl(id: number): string {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      return `${API_URL}/dokumen/${id}/download?token=${token}`;
    }
  }
  return `${API_URL}/dokumen/${id}/download`;
}

export interface StatsPublik {
  totalDokumen: number;
  totalKategori: number;
  totalDownload: number;
}

// Ambil statistik publik yang akurat dari seluruh database (bukan dari paginasi)
export async function getStatsPublik(satker?: string): Promise<ApiResponse<StatsPublik>> {
  const url = satker ? `${SERVER_API_URL}/dokumen/stats?satker=${satker}` : `${SERVER_API_URL}/dokumen/stats`;
  const res = await fetch(url, {
    cache: 'no-store', // selalu fresh â€” supaya stats dokumen baru langsung update
  });
  if (!res.ok) throw new Error('Gagal mengambil statistik');
  return res.json();
}


