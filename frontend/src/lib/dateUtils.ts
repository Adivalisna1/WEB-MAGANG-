// Format tanggal + waktu sesuai timezone browser
// Output: "05/08/2026, 14:32"
export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Format hanya waktu saja
// Output: "14:32"
export function formatTime(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Format hanya tanggal saja
// Output: "05/08/2026"
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  });
}

// Format relatif "X menit lalu", "X jam lalu"
export function formatRelative(dateStr: string | null): string {
  if (!dateStr) return '-';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}
