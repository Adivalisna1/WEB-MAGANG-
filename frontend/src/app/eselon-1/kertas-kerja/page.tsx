'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { FileSpreadsheet, Download, ArrowLeft, Search, Table2 } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface KertasKerja {
  id: number;
  satker_id: number | null;
  tanggal: string;
  uraian: string;
  kategori: string;
  no_rek: string | null;
  judul_laporan: string | null;
  akun: string | null;
  nominal: number;
  created_at: string;
  nama_satker?: string;
}

interface Satker {
  id: number;
  nama: string;
}

export default function KertasKerjaPage() {
  const [dataList, setDataList] = useState<KertasKerja[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [searchQ, setSearchQ] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterSatker, setFilterSatker] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterAkun, setFilterAkun] = useState('');
  const [filterNoRek, setFilterNoRek] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [satkerList, setSatkerList] = useState<Satker[]>([]);
  
  const [userRole, setUserRole] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const session = getSession();
      setUserRole(session?.user?.role || '');
      
      const res = await fetch(`${API}/kertas-kerja`, {
        headers: session ? { Authorization: `Bearer ${session.token}` } : {},
      });
      if (res.ok) {

        const d = await res.json();
        setDataList(d.data ?? []);
      }

      // Fetch satker list if role needs it
      if (['eselon_1', 'pimpinan', 'admin_it'].includes(session?.user?.role || '')) {
        const resSatker = await fetch(`${API}/satker`, {
          headers: session ? { Authorization: `Bearer ${session.token}` } : {},
        });
        if (resSatker.ok) {
          const s = await resSatker.json();
          setSatkerList(s.data ?? []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQ, filterTahun, filterSemester, filterSatker, filterKategori, filterAkun, filterNoRek]);

  const exportToExcel = () => {
    // Modify data to match the column names and exclude internal IDs
    const exportData = filteredData.map(d => ({
      'Tanggal': d.tanggal ? new Date(d.tanggal).toLocaleDateString('id-ID') : '',
      'Nama Satker': d.nama_satker || 'Tidak Ada',
      'No Rekening': d.no_rek || '',
      'Judul Laporan': d.judul_laporan || '',
      'Akun': d.akun || '',
      'Uraian': d.uraian,
      'Kategori': d.kategori,
      'Nominal': Number(d.nominal || 0)
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Rekening Koran');
    
    const selectedSatker = satkerList.find(s => s.id === Number(filterSatker));
    const satkerStr = selectedSatker ? `_${selectedSatker.nama.replace(/\s+/g, '')}` : '_SemuaSatker';
    const semStr = filterSemester ? `_Sem${filterSemester}` : '';
    const thnStr = filterTahun ? `_${filterTahun}` : '_SemuaTahun';
    const rekStr = filterNoRek ? `_${filterNoRek.replace(/\s+/g, '')}` : '';
    
    const fileName = `Laporan_Kertas_Kerja${thnStr}${semStr}${satkerStr}${rekStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // ── Filter Data ──
  const filteredData = dataList.filter(d => {
    const matchSearch = !searchQ || d.uraian?.toLowerCase().includes(searchQ.toLowerCase());
    const year = d.tanggal ? new Date(d.tanggal).getFullYear().toString() : '';
    const month = d.tanggal ? new Date(d.tanggal).getMonth() + 1 : 0;
    
    const matchTahun = !filterTahun || year === filterTahun;
    let matchSemester = true;
    if (filterSemester === '1') matchSemester = month >= 1 && month <= 6;
    if (filterSemester === '2') matchSemester = month >= 7 && month <= 12;
    
    const matchSatker = !filterSatker || d.satker_id === Number(filterSatker);
    const matchKategori = !filterKategori || d.kategori?.toLowerCase() === filterKategori.toLowerCase();
    const matchAkun = !filterAkun || d.akun?.toLowerCase() === filterAkun.toLowerCase();
    const matchNoRek = !filterNoRek || d.no_rek?.toLowerCase() === filterNoRek.toLowerCase();
    
    return matchSearch && matchTahun && matchSemester && matchSatker && matchKategori && matchAkun && matchNoRek;
  });

  const uniqueTahun = Array.from(new Set(dataList.map(d => d.tanggal ? new Date(d.tanggal).getFullYear().toString() : ''))).filter(Boolean).sort((a, b) => b.localeCompare(a));
  const uniqueKategori = Array.from(new Set(dataList.map(d => d.kategori))).filter(Boolean).sort();
  const uniqueAkun = Array.from(new Set(dataList.map(d => d.akun))).filter(Boolean).sort();
  const uniqueNoRek = Array.from(new Set(dataList.map(d => d.no_rek))).filter(Boolean).sort();

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/eselon-1" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
            Rekening Koran
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Laporan Riwayat Transaksi Rekening Koran Satker
          </p>
        </div>
      </div>

      {/* TAB: Riwayat (Data Database) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 text-gray-400" />
                <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Cari uraian..." className="flex-1 text-sm outline-none" />
              </div>
              
              {/* Dropdown Tahun & Semester */}
              <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                <option value="">Semua Tahun</option>
                {uniqueTahun.map(t => <option key={t} value={t}>Tahun {t}</option>)}
              </select>
              <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                <option value="">Semua Semester</option>
                <option value="1">Semester 1 (Jan-Jun)</option>
                <option value="2">Semester 2 (Jul-Des)</option>
              </select>

              {/* Dropdown Kategori */}
              <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                <option value="">Semua Kategori</option>
                {uniqueKategori.map(k => <option key={k} value={k}>{k}</option>)}
              </select>

              {/* Dropdown Akun */}
              <select value={filterAkun} onChange={e => setFilterAkun(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white max-w-[150px] truncate">
                <option value="">Semua Akun</option>
                {uniqueAkun.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              
              {/* Dropdown No Rekening */}
              <select value={filterNoRek} onChange={e => setFilterNoRek(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white max-w-[150px] truncate">
                <option value="">Semua No Rekening</option>
                {uniqueNoRek.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              {/* Dropdown Satker */}
              <select value={filterSatker} onChange={e => setFilterSatker(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 bg-white min-w-[150px]">
                <option value="">Semua Satker</option>
                {satkerList.map(s => (
                  <option key={s.id} value={s.id}>{s.nama}</option>
                ))}
              </select>
            </div>
            
            <button onClick={exportToExcel} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">Tanggal</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">Satker</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">Uraian</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">Kategori</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">No Rekening</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">Judul Laporan</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs">Akun</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase text-xs text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? <tr><td colSpan={8} className="text-center py-8 text-gray-500">Memuat data riwayat...</td></tr> :
                  paginatedData.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">Belum ada data riwayat transaksi.</td></tr> :
                  paginatedData.map(d => {
                    return (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600">{new Date(d.tanggal).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-[150px] truncate" title={d.nama_satker || ''}>{d.nama_satker || '-'}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate" title={d.uraian}>{d.uraian}</td>
                        <td className="px-4 py-3 text-gray-600">
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">{d.kategori}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{d.no_rek || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate" title={d.judul_laporan || ''}>{d.judul_laporan || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{d.akun || '-'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                          Rp {Number(d.nominal || 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-500">
                Menampilkan <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="font-medium text-gray-900">{filteredData.length}</span> data
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <div className="flex items-center px-2 text-sm text-gray-600 font-medium">
                  Halaman {currentPage} / {totalPages}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
