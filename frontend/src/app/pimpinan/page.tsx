'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import {
  FileText, FileCheck, Clock, Users,
  Download, Wifi, ArrowRight, Loader2, RefreshCw, CheckCircle, Clock4, Building2
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

export default function PimpinanDashboardPage() {
  const [stats,       setStats]       = useState<Stats | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading,     setLoading]     = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const session = getSession();
      const headers = { Authorization: `Bearer ${session?.token}` };
      const [statsRes, onlineRes] = await Promise.all([
        fetch(`${API}/pimpinan/stats`,        { headers }).then(r => r.json()),
        fetch(`${API}/pimpinan/users/online`, { headers }).then(r => r.json()),
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
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards (Clean & Authoritative) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-200 border-l-4 border-l-[#10b981] flex justify-between items-center group hover:-translate-y-1 transition-transform duration-300">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Menunggu Approval
            </p>
            <h3 className="text-3xl font-black text-slate-800">{stats?.menunggu ?? 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <Clock4 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-200 flex justify-between items-center group hover:-translate-y-1 transition-transform duration-300">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Disetujui Hari Ini
            </p>
            <h3 className="text-3xl font-black text-slate-800">{stats?.terverifikasi ?? 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-200 flex justify-between items-center group hover:-translate-y-1 transition-transform duration-300">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Total Satker
            </p>
            <h3 className="text-3xl font-black text-slate-800">{stats?.totalUser ?? 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-200 flex justify-between items-center group hover:-translate-y-1 transition-transform duration-300">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Total Dokumen
            </p>
            <h3 className="text-3xl font-black text-slate-800">{stats?.totalDokumen ?? 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Table Area */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">
                  Antrean Verifikasi
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Dokumen yang memerlukan persetujuan Anda segera.
                </p>
              </div>
              <Link
                href="/pimpinan/dokumen"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-200">
                    <th className="px-8 py-4 font-bold">Dokumen</th>
                    <th className="px-8 py-4 font-bold">Pengirim</th>
                    <th className="px-8 py-4 font-bold">Tanggal</th>
                    <th className="px-8 py-4 font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {/* Dummy Row 1 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-800">Laporan_Triwulan_Q3.pdf</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Size: 2.4 MB</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          S1
                        </div>
                        <span className="font-semibold text-slate-700">Satker 01 Jakarta</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-600 font-medium">Hari ini, 09:14</td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-3">
                        <Link href="/pimpinan/dokumen" className="px-4 py-2 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg font-semibold text-xs shadow-sm transition-all transform hover:scale-105">
                          Tinjau
                        </Link>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Dummy Row 2 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-800">RAB_Pembangunan_Gedung.xlsx</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Size: 1.1 MB</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                          S3
                        </div>
                        <span className="font-semibold text-slate-700">Satker 03 Bandung</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-600 font-medium">Kemarin, 16:30</td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-3">
                        <Link href="/pimpinan/dokumen" className="px-4 py-2 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg font-semibold text-xs shadow-sm transition-all transform hover:scale-105">
                          Tinjau
                        </Link>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Activity Log) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-200 p-8 h-full">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6">Log Aktivitas Terbaru</h2>

            <div className="relative pl-4 border-l-2 border-slate-100 space-y-8">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                <p className="text-sm font-bold text-slate-800">Dokumen Disetujui</p>
                <p className="text-xs text-slate-500 mt-1">Anda menyetujui "Surat_Keputusan.pdf"</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">10 menit yang lalu</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                <p className="text-sm font-bold text-slate-800">User Baru Ditambahkan</p>
                <p className="text-xs text-slate-500 mt-1">Satker 04 Medan berhasil diregistrasi.</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">2 jam yang lalu</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></div>
                <p className="text-sm font-bold text-slate-800">Dokumen Ditolak</p>
                <p className="text-xs text-slate-500 mt-1">Anda menolak "Draft_Anggaran.docx" dengan catatan.</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Kemarin, 15:45</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-slate-300 rounded-full border-2 border-white"></div>
                <p className="text-sm font-bold text-slate-800">Login Sistem</p>
                <p className="text-xs text-slate-500 mt-1">Anda masuk dari perangkat baru.</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Kemarin, 08:00</p>
              </div>
            </div>

            <Link href="/pimpinan/logs" className="block w-full mt-8 py-3 text-center text-sm font-semibold text-[#10b981] bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-100">
              Lihat Semua Log
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

