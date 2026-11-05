import React from 'react';
import { 
  FileUp, FileEdit, FileMinus, Key, Trash2, 
  Database, AlertCircle, Clock, ChevronLeft, ChevronRight, UserCircle, Settings
} from 'lucide-react';

interface ActivityLog {
  id: number;
  aksi: string;
  entitas: string;
  entitas_id: number | null;
  detail: any;
  ip: string;
  created_at: string;
  user_nama: string;
  username: string;
  satker_id?: number | null;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Props {
  logs: ActivityLog[];
  meta: PaginationMeta | null;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const getLogConfig = (aksi: string) => {
  if (aksi.includes('upload') || aksi.includes('create_kertas_kerja')) {
    return { icon: FileUp, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Upload Dokumen' };
  }
  if (aksi.includes('update')) {
    return { icon: FileEdit, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Edit Dokumen' };
  }
  if (aksi.includes('delete_kertas_kerja')) {
    return { icon: FileMinus, color: 'text-red-600', bg: 'bg-red-100', label: 'Hapus Dokumen' };
  }
  if (aksi.includes('reset_password')) {
    return { icon: Key, color: 'text-sky-600', bg: 'bg-sky-100', label: 'Reset Password' };
  }
  if (aksi.includes('hapus_user')) {
    return { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100', label: 'Hapus Akun' };
  }
  if (aksi.includes('eksekusi_sql')) {
    return { icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Eksekusi SQL' };
  }
  if (aksi === 'login_failed') {
    return { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100', label: 'Login Gagal' };
  }
  return { icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100', label: aksi };
};

export default function ActivityTimeline({ logs, meta, onPageChange, loading = false }: Props) {
  if (loading) {
    return <div className="animate-pulse flex flex-col gap-4 py-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>;
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-10">
        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Belum ada riwayat aktivitas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
        {logs.map((log) => {
          const config = getLogConfig(log.aksi);
          const Icon = config.icon;
          const time = new Date(log.created_at).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });

          return (
            <div key={log.id} className="relative pl-8">
              <div className={`absolute -left-5 top-1.5 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${config.bg} ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-gray-900">{log.user_nama}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {log.username}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {time}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700">
                  Melakukan <span className="font-semibold">{config.label}</span>
                  {log.entitas_id && <span className="text-gray-500 text-xs ml-1">(ID: {log.entitas_id})</span>}
                </p>
                
                {log.detail && (
                  <div className="mt-2 text-xs font-mono bg-gray-50 text-gray-600 p-2.5 rounded-lg border border-gray-200 break-all">
                    {typeof log.detail === 'string' ? log.detail : JSON.stringify(log.detail)}
                  </div>
                )}
                
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    IP: {log.ip}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">
            Menampilkan halaman <span className="font-medium text-gray-900">{meta.page}</span> dari <span className="font-medium text-gray-900">{meta.totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(meta.page - 1)}
              disabled={meta.page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
