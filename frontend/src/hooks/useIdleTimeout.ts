'use client';

import { useEffect, useRef } from 'react';

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 menit
const WARNING_TIME = 28 * 60 * 1000; // tampil warning di menit ke-28
const THROTTLE_MS  = 1000;           // throttle aktivitas 1 detik

/**
 * Hook untuk auto-logout setelah user idle selama 30 menit.
 * Di menit ke-28, tampilkan warning modal.
 * Kalau user beraktivitas → timer reset.
 * Kalau 30 menit tercapai → onLogout dipanggil.
 */
export function useIdleTimeout(
  onWarning: () => void,
  onLogout: () => void
) {
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const onWarningRef    = useRef(onWarning);
  const onLogoutRef     = useRef(onLogout);

  // Selalu simpan callback terbaru
  onWarningRef.current = onWarning;
  onLogoutRef.current  = onLogout;

  const resetTimers = () => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current)  clearTimeout(logoutTimerRef.current);

    lastActivityRef.current = Date.now();

    warningTimerRef.current = setTimeout(() => {
      onWarningRef.current();
    }, WARNING_TIME);

    logoutTimerRef.current = setTimeout(() => {
      onLogoutRef.current();
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    const handleActivity = () => {
      const now = Date.now();
      // Throttle: jangan reset kalau belum lewat 1 detik sejak aktivitas terakhir
      if (now - lastActivityRef.current < THROTTLE_MS) return;
      resetTimers();
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Mulai timer pertama kali
    resetTimers();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current)  clearTimeout(logoutTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
