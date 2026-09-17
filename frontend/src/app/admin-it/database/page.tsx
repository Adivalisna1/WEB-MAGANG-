'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Database, Play, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DatabaseConsolePage() {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [affectedRows, setAffectedRows] = useState<number | null>(null);

  const executeQuery = async () => {
    if (!query.trim()) {
      toast.error('Query tidak boleh kosong');
      return;
    }

    if (!confirm('Peringatan: Eksekusi SQL secara langsung dapat merusak database. Lanjutkan?')) {
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResults(null);
    setColumns([]);
    setAffectedRows(null);

    try {
      const res = await fetch(`${API}/admin-it/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Query dieksekusi');
        if (Array.isArray(data.data)) {
          // SELECT query returning rows
          setResults(data.data);
          if (data.data.length > 0) {
            setColumns(Object.keys(data.data[0]));
          }
        } else if (data.data && data.data.affectedRows !== undefined) {
          // UPDATE, DELETE, INSERT query
          setAffectedRows(data.data.affectedRows);
        } else {
          setResults([]);
        }
      } else {
        setErrorMsg(data.message || 'Gagal mengeksekusi query');
        toast.error('Query Error');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Koneksi ke server gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 flex items-center justify-center rounded-xl">
          <Database className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Database SQL Console</h1>
        </div>
      </div>



      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <label className="font-semibold text-gray-700 text-sm">SQL Query Editor</label>
        </div>
        <div className="p-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SELECT * FROM kertas_kerja LIMIT 10;"
            className="w-full h-40 p-4 font-mono text-sm bg-white text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            spellCheck="false"
          />
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => setQuery('')}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={executeQuery}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Execute
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-mono overflow-auto">
          {errorMsg}
        </div>
      )}

      {affectedRows !== null && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium">
          Query berhasil dieksekusi. Affected rows: {affectedRows}
        </div>
      )}

      {results !== null && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-gray-700 text-sm">Results ({results.length} rows)</h3>
          </div>
          <div className="overflow-x-auto max-h-[500px]">
            {results.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">Query return 0 rows.</div>
            ) : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-100 sticky top-0 border-b border-gray-200">
                  <tr>
                    {columns.map(col => (
                      <th key={col} className="px-4 py-3 font-semibold text-gray-600">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {columns.map(col => (
                        <td key={col} className="px-4 py-2 font-mono text-xs text-gray-700">
                          {row[col] === null ? <span className="text-gray-400 italic">NULL</span> : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
