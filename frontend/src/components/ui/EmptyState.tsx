import { FileX } from 'lucide-react';

interface Props {
  message?: string;
}

export default function EmptyState({ message = 'Tidak ada dokumen ditemukan' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <FileX className="w-16 h-16 mb-4 text-gray-300" />
      <p className="text-lg font-medium text-gray-600">{message}</p>
      <p className="text-sm mt-1 text-gray-400">Coba ubah filter atau kata kunci pencarian</p>
    </div>
  );
}
