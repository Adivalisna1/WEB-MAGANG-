'use client';

import { useState } from 'react';
import { Download, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  href: string;
  fileName: string;
}

export default function DownloadButton({ href, fileName }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDownload = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(href);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErrorMsg(json.message || 'File tidak tersedia.');
        setStatus('error');
        return;
      }
      // Buat blob dan trigger download
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('idle');
    } catch {
      setErrorMsg('Gagal mengunduh file. Periksa koneksi internet kamu.');
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDownload}
        disabled={status === 'loading'}
        className="btn-primary flex items-center justify-center gap-2 py-3 text-base disabled:opacity-60"
        aria-label={`Unduh ${fileName}`}
      >
        {status === 'loading'
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengunduh...</>
          : <><Download className="w-5 h-5" /> Unduh Dokumen</>
        }
      </button>

      {status === 'error' && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
