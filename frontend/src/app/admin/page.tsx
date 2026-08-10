'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import {
  FileText, FileCheck, Clock, Users,
  Download, Wifi, ArrowRight, Loader2, RefreshCw
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Stats {
  totalDokumen: number;
  terverifikasi: number;
  menunggu: number;
  totalUser: number;
  totalDownload: number;
  onlineNow: number;
}

interface OnlineUser {
  id: number;
  nama: string;
  username: string;
  role: string;
  last_active_at: string;
  login_at: string;
}

function StatCard({ icon: Icon, label, value, color, href }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  href?: string;
}) {
  const content = (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow`}>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      {href && <ArrowRight className="w-4 h-4 text-gray-300" />}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : <div>{content}</div>;
}

export default function AdminDashboardPage() {
  const [stats,       setStats]       = useState<Stats | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading,     setLoading]     = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const session = getSession();
      const headers = { Authorization: `Bearer ${session?.token}` };
      const [statsRes, onlineRes] = await Promise.all([
        fetch(`${API}/admin/stats`,        { headers }).then(r => r.json()),
        fetch(`${API}/admin/users/online`, { headers }).then(r => r.json()),
      ]);
      setStats(statsRes.data);
      setOnlineUsers(onlineRes.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh online users setiap 30 detik
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ringkasan sistem dan aktivitas terkini</p>
        </div>
        <button onClick={fetchData} className="btn-secondary p-2" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={FileText}  label="Total Dokumen"    value={stats?.totalDokumen ?? 0}   color="bg-blue-500"   href="/admin/dokumen" />
        <StatCard icon={Clock}     label="Menunggu Verifikasi" value={stats?.menunggu ?? 0}    color="bg-yellow-500" href="/admin/dokumen" />
        <StatCard icon={FileCheck} label="Terverifikasi"    value={stats?.terverifikasi ?? 0}  color="bg-green-500"  href="/admin/dokumen" />
        <StatCard icon={Users}     label="Total Staff"      value={stats?.totalUser ?? 0}      color="bg-purple-500" href="/admin/users" />
        <StatCard icon={Download}  label="Total Unduhan"    value={stats?.totalDownload ?? 0}  color="bg-pink-500" />
        <StatCard icon={Wifi}      label="User Online"      value={stats?.onlineNow ?? 0}      color="bg-teal-500"   href="/admin/users" />
      </div>

      {/* User online realtime */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h2 className="font-semibold text-gray-900 text-sm">User Aktif Sekarang</h2>
          </div>
          <span className="text-xs text-gray-400">Refresh otomatis 30 detik</span>
        </div>
        {onlineUsers.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">Tidak ada user yang sedang aktif</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {onlineUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center font-semibold text-teal-700 text-sm shrink-0">
                  {u.nama.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{u.nama}</p>
                  <p className="text-xs text-gray-400">@{u.username} · {u.role}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Aktif: {new Date(u.last_active_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                  <p className="text-xs text-gray-400">
                    Login: {new Date(u.login_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/dokumen" className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 hover:bg-yellow-100 transition-colors">
          <div className="flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="font-semibold text-gray-900">Verifikasi Dokumen</p>
              <p className="text-sm text-gray-500">
                {stats?.menunggu ? `${stats.menunggu} dokumen menunggu persetujuan` : 'Tidak ada dokumen pending'}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
          </div>
        </Link>
        <Link href="/admin/users" className="bg-purple-50 border border-purple-200 rounded-xl p-5 hover:bg-purple-100 transition-colors">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="font-semibold text-gray-900">Kelola User</p>
              <p className="text-sm text-gray-500">Tambah atau nonaktifkan akun staff</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
          </div>
        </Link>
      </div>
    </div>
  );
}
