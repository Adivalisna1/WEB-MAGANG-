'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const COUNTDOWN_SECONDS = 120; // 2 menit

interface SessionTimeoutModalProps {
  open: boolean;
  onStay: () => void;
}

export default function SessionTimeoutModal({ open, onStay }: SessionTimeoutModalProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  // Tick countdown setiap detik
  useEffect(() => {
    if (!open) {
      setCountdown(COUNTDOWN_SECONDS);
      return;
    }
    const interval = setInterval(() => {
      setCountdown((prev: number) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [open]);

  if (!open) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
          <Clock className="w-8 h-8 text-orange-500" />
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Sesi Hampir Berakhir
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Anda tidak beraktivitas selama 28 menit. Sesi akan otomatis berakhir dalam:
        </p>

        <div className="text-4xl font-mono font-bold text-orange-500 mb-6">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>

        <button
          onClick={onStay}
          className="w-full py-3 px-6 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
        >
          Tetap Login
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Jika tidak ada aktivitas, Anda akan otomatis logout
        </p>
      </div>
    </div>
  );
}
