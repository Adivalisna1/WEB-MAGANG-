'use client';

import { Download, FileText } from 'lucide-react';
import { Dokumen, formatFileSize, getDownloadUrl } from '@/lib/api';

interface Props {
  dokumen: Dokumen;
}

const NAMA_BULAN = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function DokumenCard({ dokumen }: Props) {
  const periodeLabel = dokumen.semester
    ? `Semester ${dokumen.semester} ${dokumen.tahun}`
    : dokumen.bulan
      ? `${NAMA_BULAN[dokumen.bulan]} ${dokumen.tahun}`
      : String(dokumen.tahun);

  return (
    <>
      <style>{`
        .doc-row {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .doc-row:hover {
          border-color: #bfdbfe;
          box-shadow: 0 4px 16px -4px rgba(37, 99, 235, 0.12);
        }
        .btn-unduh {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.15s;
        }
        .btn-unduh:hover {
          background: #1d4ed8;
        }
      `}</style>

      <div className="doc-row">
        {/* LEFT: icon + info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              background: '#eff6ff',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText style={{ width: '20px', height: '20px', color: '#2563eb' }} />
          </div>

          <div>
            <div
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: '4px',
              }}
            >
              {dokumen.judul}
            </div>
            <div style={{ fontSize: '0.77rem', color: '#94a3b8' }}>
              {dokumen.kategori}
              {' · '}
              {periodeLabel}
              {dokumen.nomor_laporan && (
                <> · <span style={{ color: '#64748b' }}>{dokumen.nomor_laporan}</span></>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: size + download count + button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
          {dokumen.file_size && (
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
              {formatFileSize(dokumen.file_size)}
            </span>
          )}
          <span
            style={{
              fontSize: '0.75rem',
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Download style={{ width: '13px', height: '13px' }} />
            {dokumen.download_count}
          </span>
          <a
            href={getDownloadUrl(dokumen.id)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Unduh ${dokumen.judul}`}
            className="btn-unduh"
          >
            <Download style={{ width: '14px', height: '14px' }} />
            Unduh
          </a>
        </div>
      </div>
    </>
  );
}
