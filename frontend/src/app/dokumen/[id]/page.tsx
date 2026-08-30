import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  FileText, Download, Calendar, Tag,
  ArrowLeft, User, CheckCircle, Eye
} from 'lucide-react';
import { getDokumenById, formatFileSize, getDownloadUrl } from '@/lib/api';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  try {
    const res = await getDokumenById(Number(params.id));
    return {
      title: `${res.data.judul} — Dashboard Laporan`,
      description: res.data.deskripsi ?? `Unduh dokumen ${res.data.judul} tahun ${res.data.tahun}`,
    };
  } catch {
    return { title: 'Dokumen tidak ditemukan' };
  }
}

export default async function DokumenDetailPage({ params }: Props) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  let dokumen;
  try {
    const res = await getDokumenById(id);
    dokumen   = res.data;
  } catch {
    notFound();
  }

  const tanggal = new Date(dokumen.created_at).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Link
        href="/laporan"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke daftar dokumen
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header card */}
        <div className="bg-gradient-to-r from-primary-800 to-primary-600 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-xl shrink-0">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
                {dokumen.kategori}
              </span>
              <h1 className="text-xl font-bold mt-2 leading-snug">{dokumen.judul}</h1>
              <p className="text-blue-200 text-sm mt-1">Tahun {dokumen.tahun}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Deskripsi */}
          {dokumen.deskripsi && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Deskripsi</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{dokumen.deskripsi}</p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InfoItem icon={Calendar} label="Tahun"      value={String(dokumen.tahun)} />
            <InfoItem icon={Tag}      label="Kategori"   value={dokumen.kategori} />
            <InfoItem icon={FileText} label="Ukuran"     value={formatFileSize(dokumen.file_size)} />
            <InfoItem icon={Eye}      label="Diunduh"    value={`${dokumen.download_count}×`} />
          </div>

          {/* Tanggal & status */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Diterbitkan {tanggal}
            </span>
            <span className="flex items-center gap-1.5 text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              Terverifikasi
            </span>
          </div>

          {/* Tombol download */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <a
              href={getDownloadUrl(dokumen.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center justify-center gap-2 py-3 text-base"
              aria-label={`Unduh ${dokumen.judul}`}
            >
              <Download className="w-5 h-5" />
              Unduh Dokumen
            </a>
            <Link href="/laporan" className="btn-secondary flex items-center justify-center gap-2 py-3 text-base">
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </Link>
          </div>

          {/* Info publik */}
          <p className="text-xs text-gray-400 text-center">
            Dokumen ini tersedia secara publik dan dapat diunduh tanpa perlu login.
          </p>
        </div>
      </div>
    </div>
  );
}

// Komponen kecil info item
function InfoItem({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className="font-semibold text-gray-800 text-sm">{value}</p>
    </div>
  );
}
