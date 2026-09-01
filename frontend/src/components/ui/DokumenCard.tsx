import Link from 'next/link';
import { FileText, Download, Calendar, Tag, Hash } from 'lucide-react';
import { Dokumen, formatFileSize, getDownloadUrl } from '@/lib/api';

interface Props {
  dokumen: Dokumen;
}

// Warna badge per kategori
const kategoriColor: Record<string, string> = {
  lkjip:   'bg-blue-100 text-blue-800',
  renstra: 'bg-purple-100 text-purple-800',
  renja:   'bg-green-100 text-green-800',
  rkt:     'bg-yellow-100 text-yellow-800',
  pk:      'bg-orange-100 text-orange-800',
  lakip:   'bg-red-100 text-red-800',
  iku:     'bg-pink-100 text-pink-800',
  lainnya: 'bg-gray-100 text-gray-700',
};

const NAMA_BULAN = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function DokumenCard({ dokumen }: Props) {
  const badgeClass = kategoriColor[dokumen.kategori_slug] ?? 'bg-gray-100 text-gray-700';
  const periodeLabel = dokumen.semester
    ? `Semester ${dokumen.semester} ${dokumen.tahun}`
    : dokumen.bulan
      ? `${NAMA_BULAN[dokumen.bulan]} ${dokumen.tahun}`
      : String(dokumen.tahun);

  return (
    <div className="card p-5 flex flex-col gap-3 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
      {/* Header */}
      <div className="flex items-start gap-2">
        <FileText className="w-8 h-8 text-primary-600 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <Link
            href={`/dokumen/${dokumen.id}`}
            className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-primary-600:text-primary-400 transition-colors"
          >
            {dokumen.judul}
          </Link>
        </div>
      </div>

      {/* Deskripsi */}
      {dokumen.deskripsi && (
        <p className="text-xs text-gray-500 line-clamp-2">{dokumen.deskripsi}</p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {periodeLabel}
        </span>
        <span className="flex items-center gap-1">
          <Tag className="w-3.5 h-3.5" />
          <span className={`badge ${badgeClass}`}>{dokumen.kategori}</span>
        </span>
        {dokumen.nomor_laporan && (
          <span className="flex items-center gap-1">
            <Hash className="w-3.5 h-3.5" />
            <span className="badge bg-cyan-100 text-cyan-800">{dokumen.nomor_laporan}</span>
          </span>
        )}
        {dokumen.file_size && (
          <span className="text-gray-400">{formatFileSize(dokumen.file_size)}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Download className="w-3.5 h-3.5" />
          {dokumen.download_count} unduhan
        </span>
        <a
          href={getDownloadUrl(dokumen.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
          aria-label={`Unduh ${dokumen.judul}`}
        >
          <Download className="w-3.5 h-3.5" />
          Unduh
        </a>
      </div>
    </div>
  );
}
