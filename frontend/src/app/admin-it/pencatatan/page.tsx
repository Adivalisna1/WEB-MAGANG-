'use client';
import toast from 'react-hot-toast';


import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit, Tags, FileText } from 'lucide-react';
import clsx from 'clsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminpencatatanPage() {
  const { token } = useAuth();
  
  // Data State
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [satkers, setSatkers] = useState<any[]>([]);
  const [filterSatker, setFilterSatker] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTx, resSatker] = await Promise.all([
        fetch(`${API}/pencatatan`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/satker`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const jTx = await resTx.json();
      const jSatker = await resSatker.json();
      if (jTx.success) setTransaksi(jTx.data);
      if (jSatker.success) setSatkers(jSatker.data);
    } catch (err) {
      toast.error('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);


  const filteredTransaksi = filterSatker
    ? transaksi.filter(t => t.satker_id?.toString() === filterSatker)
    : transaksi;

  return (
    <div className="w-full px-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Master Pencatatan</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data transaksi dan master kategori pencatatan.</p>
        </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-max">
          <button
            className="px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 bg-white text-blue-600 shadow-sm"
          >
            <FileText className="w-4 h-4" /> Data Transaksi
          </button>
        </div>

        <div className="w-full sm:w-auto">
            <select
              value={filterSatker}
              onChange={(e) => setFilterSatker(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Satker</option>
              {satkers.map(s => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Uraian</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Jenis</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Satker</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {loading ? <tr><td colSpan={7} className="p-4 text-center text-gray-500">Loading...</td></tr> : filteredTransaksi.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{new Date(t.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={t.uraian}>{t.uraian}</td>
                    <td className="px-4 py-3">
                      <span className={clsx("px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider", t.jenis === 'debit' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                        {t.jenis === 'debit' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{t.nama_kategori}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]" title={t.satker_nama || 'Pusat'}>
                      {t.satker_nama || 'Pusat'}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      Rp {Number(t.nominal).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    </div>
  );
}
