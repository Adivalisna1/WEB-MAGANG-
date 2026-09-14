'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Activity, Clock, ShieldAlert, Monitor, LogIn, LogOut, Database } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LogsPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/admin-it/logs`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(j => { if (j.success) setLogs(j.data); })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [token]);

  const getAksiIcon = (aksi: string) => {
    switch(aksi) {
      case 'login': return <LogIn className="w-4 h-4 text-emerald-500" />;
      case 'logout': return <LogOut className="w-4 h-4 text-gray-500" />;
      case 'buat_dokumen':
      case 'edit_dokumen':
      case 'hapus_dokumen': return <Database className="w-4 h-4 text-blue-500" />;
      case 'approve_dokumen':
      case 'reject_dokumen': return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Real-Time System Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor web traffic and user activities.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">
          <Monitor className="w-4 h-4" />
          Live Feed Active
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Entity</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">IP Address</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm font-mono text-[13px]">
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500 font-sans">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500 font-sans">No activity logs found.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(log.created_at).toLocaleString('en-GB')}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {getAksiIcon(log.aksi)}
                        {log.aksi}
                      </div>
                    </td>
                    <td className="px-4 py-3">{log.username || 'System'}</td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{log.entitas || '-'} {log.entitas_id ? `#${log.entitas_id}` : ''}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{log.ip || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={log.detail ? JSON.stringify(log.detail) : '-'}>
                      {log.detail ? JSON.stringify(log.detail) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
