'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, FileText, Server, Activity, ShieldCheck, Database, Zap, Filter } from 'lucide-react';
import ActivityTimeline from '@/components/ActivityTimeline';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminITDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDokumen: 0,
    totalKategori: 0,
    onlineNow: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    dbStorage: 0,
    failedLogins: 0
  });
  const [loading, setLoading] = useState(true);

  // For Activity Logs
  const [logs, setLogs] = useState<any[]>([]);
  const [logMeta, setLogMeta] = useState<any>(null);
  const [logPage, setLogPage] = useState(1);
  const [satkers, setSatkers] = useState<any[]>([]);
  const [selectedSatker, setSelectedSatker] = useState<string>('');

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API}/admin-it/stats`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/admin-it/users/form-data`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([statsRes, formDataRes]) => {
        if (statsRes.success) setStats(statsRes.data);
        if (formDataRes.success) setSatkers(formDataRes.data.satkers || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let url = `${API}/admin-it/logs?page=${logPage}&limit=50`;
    if (selectedSatker) url += `&satker_id=${selectedSatker}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setLogs(j.data);
          setLogMeta(j.meta);
        }
      })
      .catch(console.error);
  }, [token, logPage, selectedSatker]);

  const handlePageChange = (page: number) => {
    setLogPage(page);
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center text-gray-500">Memuat ringkasan sistem...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ringkasan Sistem</h1>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-700">
          <span className="flex w-2.5 h-2.5 rounded-full bg-emerald-500 relative">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
          </span>
          Sistem Berjalan
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Pengguna Terdaftar', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Sesi Aktif', value: stats.onlineNow, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Total Dokumen', value: stats.totalDokumen, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Kategori Terdaftar', value: stats.totalKategori, icon: Database, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Server className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">Kesehatan Infrastruktur</h2>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">Penyimpanan Database</span>
                <span className="text-gray-500">{stats.dbStorage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.dbStorage}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">Beban CPU (Rata-rata)</span>
                <span className="text-gray-500">{stats.cpuUsage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.cpuUsage}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">Penggunaan Memori</span>
                <span className="text-gray-500">{stats.memoryUsage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.memoryUsage}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">Ringkasan Keamanan</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Pemindaian Kerentanan Terakhir</p>
                  <p className="text-xs text-gray-500">Lulus (2 jam yang lalu)</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">Aman</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Upaya Login Gagal</p>
                  <p className="text-xs text-gray-500">24 jam terakhir</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.failedLogins}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline Section */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Riwayat Aktivitas Sistem</h2>
            <p className="text-sm text-gray-500 mt-1">Pantau semua aktivitas user atau filter berdasarkan Satker.</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedSatker}
              onChange={(e) => {
                setSelectedSatker(e.target.value);
                setLogPage(1); // Reset page on filter change
              }}
              className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-[#10b981] focus:border-[#10b981] min-w-[200px]"
            >
              <option value="">Semua Satker (Global)</option>
              {satkers.map(s => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
          <ActivityTimeline logs={logs} meta={logMeta} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
}
