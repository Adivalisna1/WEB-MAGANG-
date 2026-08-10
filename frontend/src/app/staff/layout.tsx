'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import Sidebar from '@/components/staff/Sidebar';
import { Loader2 } from 'lucide-react';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useRequireAuth('staff');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
