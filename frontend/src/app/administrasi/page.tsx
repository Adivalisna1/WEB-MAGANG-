'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Layers, FileText, Users, Loader2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdministrasiDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({ totalKategori: 0, totalDokumen: 0, satkerAktif: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/administrasi/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(res => {
        if (res.success) setStats(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const cards = [
    { label: 'Master Kategori', value: stats.totalKategori, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Total Dokumen', value: stats.totalDokumen, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Staff Aktif', value: stats.satkerAktif, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Overview Sistem</h2>
        <p className="text-sm text-gray-500 mt-1">Ringkasan data utama aplikasi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <div key={i} className={`p-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-start gap-4 transition-all hover:shadow-md hover:border-gray-300`}>
            <div className={`p-4 rounded-xl ${c.bg} ${c.color} shrink-0`}>
              <c.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">{c.label}</p>
              <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{c.value}</h3>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Kelola Master Data</h3>
        <p className="text-gray-500 max-w-md mx-auto text-sm">
          Akses menu Master Kategori di sidebar untuk menambah, mengedit, atau menghapus kategori dokumen laporan yang tersedia untuk Staff.
        </p>
      </div>
    </div>
  );
}
