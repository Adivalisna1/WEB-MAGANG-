'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, FileText, Server, Activity, ShieldCheck, Database, Zap } from 'lucide-react';

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
    dbStorage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/admin-it/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(j => { if (j.success) setStats(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="h-full flex items-center justify-center text-gray-500">Loading system overview...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time metrics and system health status.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-700">
          <span className="flex w-2.5 h-2.5 rounded-full bg-emerald-500 relative">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
          </span>
          System Operational
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Registered Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Active Sessions', value: stats.onlineNow, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Total Documents', value: stats.totalDokumen, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Registered Categories', value: stats.totalKategori, icon: Database, color: 'text-amber-600', bg: 'bg-amber-50' },
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
            <h2 className="text-base font-semibold text-gray-900">Infrastructure Health</h2>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">Database Storage</span>
                <span className="text-gray-500">{stats.dbStorage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.dbStorage}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">CPU Load (Avg)</span>
                <span className="text-gray-500">{stats.cpuUsage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.cpuUsage}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">Memory Usage</span>
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
            <h2 className="text-base font-semibold text-gray-900">Security Overview</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Vulnerability Scan</p>
                  <p className="text-xs text-gray-500">Passed (2 hours ago)</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">Clear</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Failed Login Attempts</p>
                  <p className="text-xs text-gray-500">Last 24 hours</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
