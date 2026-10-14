import { redirect } from 'next/navigation';

export default function LaporanLayout({ children }: { children: React.ReactNode }) {
  redirect('/login');
}
