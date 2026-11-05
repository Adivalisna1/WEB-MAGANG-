'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCircle, XCircle, Send, CheckCheck, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchWithAuth, getSession } from '@/lib/auth';
import { formatRelative } from '@/lib/dateUtils';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Notifikasi {
  id: number;
  aksi: 'submit' | 'approve' | 'reject' | 'terverifikasi' | 'pesan_ketua' | 'reset_password';
  dokumen_id: number | null;
  judul: string | null;
  pesan: string;
  is_read: number;
  created_at: string;
}

const POLL_INTERVAL = 8_000; // Poll setiap 8 detik agar notifikasi persetujuan langsung muncul real-time

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [list, setList] = useState<Notifikasi[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number | null>(null);
  const router = useRouter();

  // ── Fetch unread count & trigger toast jika ada notifikasi baru ──
  const fetchCount = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_URL}/notifikasi/unread-count`);
      if (res.ok) {
        const { data } = await res.json();
        const newCount = Number(data?.count || 0);
        if (prevCountRef.current !== null && newCount > prevCountRef.current) {
          // Ambil notifikasi terbaru untuk ditampilkan di pop-up toast
          try {
            const listRes = await fetchWithAuth(`${API_URL}/notifikasi`);
            if (listRes.ok) {
              const listJson = await listRes.json();
              const latest: Notifikasi | undefined = listJson.data?.[0];
              if (latest) {
                if (latest.aksi === 'approve' || latest.aksi === 'terverifikasi') {
                  toast.success(latest.pesan, { duration: 6000 });
                } else if (latest.aksi === 'reject') {
                  toast.error(latest.pesan, { duration: 6000 });
                } else {
                  toast(latest.pesan, { icon: '🔔', duration: 5000 });
                }
                setList(listJson.data);
              }
            }
          } catch { /* silent */ }
        }
        prevCountRef.current = newCount;
        setCount(newCount);
      }
    } catch { /* silent */ }
  }, []);

  // ── Fetch notification list ─────────────────────────────────
  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API_URL}/notifikasi`);
      if (res.ok) {
        const { data } = await res.json();
        setList(data);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  // ── Poll unread count berkala ───────────────────────────────
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCount]);

  // ── Fetch list saat dropdown dibuka ────────────────────────
  useEffect(() => {
    if (open) fetchList();
  }, [open, fetchList]);

  // ── Klik di luar dropdown → tutup ─────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // ── Tandai satu notifikasi sebagai sudah dibaca ───────────
  async function markRead(id: number) {
    try {
      await fetchWithAuth(`${API_URL}/notifikasi/${id}/read`, { method: 'PATCH' });
      setList((prev: Notifikasi[]) => prev.map((n: Notifikasi) => n.id === id ? { ...n, is_read: 1 } : n));
      setCount((prev: number) => Math.max(0, prev - 1));
      if (prevCountRef.current !== null) {
        prevCountRef.current = Math.max(0, prevCountRef.current - 1);
      }
    } catch { /* silent */ }
  }

  // ── Tandai semua sudah dibaca ─────────────────────────────
  async function markAllRead() {
    try {
      await fetchWithAuth(`${API_URL}/notifikasi/read-all`, { method: 'PATCH' });
      setList((prev: Notifikasi[]) => prev.map((n: Notifikasi) => ({ ...n, is_read: 1 })));
      setCount(0);
      prevCountRef.current = 0;
    } catch { /* silent */ }
  }

  // ── Klik notifikasi → mark read + navigate sesuai role/tingkat ──
  function handleClickNotif(notif: Notifikasi) {
    if (!notif.is_read) markRead(notif.id);

    const session = getSession();
    const u = session?.user as any;
    const tingkat = u?.tingkat;
    const isAdminSatker = tingkat === 'satker' && (
      ['administrasi', 'manajemen', 'pimpinan_satker'].includes(u?.role || '') ||
      Number(u?.role_id) === 2 ||
      u?.is_manajemen
    );

    if (tingkat === 'eselon_1') {
      router.push('/eselon-1/dokumen');
    } else if (isAdminSatker) {
      router.push(notif.dokumen_id ? `/pimpinan/dokumen?id=${notif.dokumen_id}` : '/pimpinan/dokumen');
    } else if (notif.aksi === 'submit') {
      router.push('/pimpinan/dokumen');
    } else if (notif.aksi === 'reject' && notif.dokumen_id) {
      router.push(`/staff/dokumen/${notif.dokumen_id}/edit`);
    } else if (notif.aksi === 'approve' || notif.aksi === 'terverifikasi') {
      router.push('/staff/dokumen');
    }
    setOpen(false);
  }

  // ── Icon berdasarkan tipe notifikasi ──────────────────────
  function NotifIcon({ aksi }: { aksi: string }) {
    if (aksi === 'approve' || aksi === 'terverifikasi') return <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />;
    if (aksi === 'reject')        return <XCircle className="w-5 h-5 text-orange-500 shrink-0" />;
    if (aksi === 'reset_password') return <KeyRound className="w-5 h-5 text-sky-500 shrink-0" />;
    return <Send className="w-5 h-5 text-blue-500 shrink-0" />;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell button ──────────────────────────────────────── */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {/* ── Dropdown ────────────────────────────────────────── */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-800">Notifikasi</h3>
            {count > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && list.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">Memuat...</div>
            ) : list.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">Tidak ada notifikasi</div>
            ) : (
              list.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleClickNotif(notif)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                    notif.is_read ? 'opacity-60' : 'bg-blue-50/40'
                  }`}
                >
                  <NotifIcon aksi={notif.aksi} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${notif.is_read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                      {notif.pesan}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatRelative(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && (
                    <span className="w-2 h-2 mt-1.5 bg-primary-500 rounded-full shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
