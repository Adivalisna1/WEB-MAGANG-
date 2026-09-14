'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getSession } from '@/lib/auth';
import {
  FileSpreadsheet, Upload, Download, ArrowLeft, Search,
  Loader2, AlertCircle, ChevronDown, Filter, RefreshCw,
  Table2, TrendingUp, CheckCircle2, XCircle, Minus
} from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface DokumenLaporan {
  id: number;
  judul: string;
  tahun: number;
  semester: number | null;
  bulan: number | null;
  kategori: string;
  nomor_laporan: string;
  nilai_rekening_koran: number | null;
  status: string;
  created_at: string;
}

interface ExcelRow {
  [key: string]: any;
}

interface ComparisonResult {
  excelRow: ExcelRow;
  matched: DokumenLaporan | null;
  status: 'matched' | 'missing' | 'extra';
}

export default function KertasKerjaPage() {
  // Data dari database (Dashboard Laporan)
  const [dokumenList, setDokumenList] = useState<DokumenLaporan[]>([]);
  const [dokLoading, setDokLoading] = useState(true);
  const [dokError, setDokError] = useState('');

  // Data dari Excel
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'excel' | 'database' | 'compare'>('excel');
  const [dragging, setDragging] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [filterTahun, setFilterTahun] = useState('');

  // Excel tab: search + dynamic filters
  const [excelSearchQ, setExcelSearchQ] = useState('');
  const [excelFilters, setExcelFilters] = useState<Record<string, string>>({});

  // Perbandingan tab: status filter
  const [compareStatusFilter, setCompareStatusFilter] = useState<'all' | 'matched' | 'missing'>('all');

  // Comparison
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [mappingKey, setMappingKey] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  // ── Fetch data laporan dari backend ──
  const fetchDokumen = useCallback(async () => {
    setDokLoading(true);
    setDokError('');
    try {
      const session = getSession();
      const res = await fetch(`${API}/dokumen/all?limit=9999`, {
        headers: session ? { Authorization: `Bearer ${session.token}` } : {},
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const d = await res.json();
      setDokumenList(d.data ?? []);
    } catch (err: any) {
      setDokError(err.message || 'Gagal memuat data dokumen');
    } finally {
      setDokLoading(false);
    }
  }, []);

  useEffect(() => { fetchDokumen(); }, [fetchDokumen]);

  // ── Import Excel ──
  const handleExcelFile = (file: File) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Format tidak didukung. Gunakan file Excel (.xlsx, .xls) atau CSV.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      setExcelFileName(file.name);

      // Load sheet pertama
      loadSheet(wb, wb.SheetNames[0]);
      setSelectedSheet(wb.SheetNames[0]);
    };
    reader.readAsArrayBuffer(file);
  };

  const loadSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (jsonData.length > 0) {
      setExcelHeaders(Object.keys(jsonData[0]));
    }
    setExcelData(jsonData);
  };

  const handleSheetChange = (name: string) => {
    setSelectedSheet(name);
    if (workbook) loadSheet(workbook, name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleExcelFile(file);
  };

  // ── Comparison logic ──
  const runComparison = () => {
    if (!mappingKey || excelData.length === 0) return;

    const results: ComparisonResult[] = excelData.map(row => {
      const excelVal = String(row[mappingKey] || '').toLowerCase().trim();
      const match = dokumenList.find(d =>
        d.judul.toLowerCase().trim().includes(excelVal) ||
        excelVal.includes(d.judul.toLowerCase().trim()) ||
        d.nomor_laporan?.toLowerCase().trim() === excelVal
      );
      return {
        excelRow: row,
        matched: match || null,
        status: match ? 'matched' as const : 'missing' as const,
      };
    });
    setComparisonResults(results);
    setActiveTab('compare');
  };

  // ── Filter database data ──
  const filteredDokumen = dokumenList.filter(d => {
    const matchSearch = !searchQ ||
      d.judul.toLowerCase().includes(searchQ.toLowerCase()) ||
      d.nomor_laporan?.toLowerCase().includes(searchQ.toLowerCase());
    const matchTahun = !filterTahun || String(d.tahun) === filterTahun;
    return matchSearch && matchTahun;
  });

  const uniqueTahun = Array.from(new Set(dokumenList.map(d => d.tahun))).sort((a, b) => b - a);

  // ── Filter Excel data (dynamic filter + search) ──
  // Kolom yang ditampilkan sebagai filter: maks 4 kolom pertama yang nilainya tidak terlalu banyak unik
  const excelFilterCols = excelHeaders.filter(h => {
    const uniqueVals = new Set(excelData.map(row => String(row[h] ?? ''))).size;
    return uniqueVals >= 2 && uniqueVals <= 50;
  }).slice(0, 4);

  const filteredExcelData = excelData.filter(row => {
    // Search: cek semua kolom
    const matchSearch = !excelSearchQ || excelHeaders.some(h =>
      String(row[h] ?? '').toLowerCase().includes(excelSearchQ.toLowerCase())
    );
    // Dynamic filters: setiap kolom yang dipilih
    const matchFilters = Object.entries(excelFilters).every(([col, val]) =>
      !val || String(row[col] ?? '') === val
    );
    return matchSearch && matchFilters;
  });

  // ── Filter hasil perbandingan ──
  const filteredCompareResults = comparisonResults.filter(r =>
    compareStatusFilter === 'all' || r.status === compareStatusFilter
  );

  // ── Stats ──
  const matchedCount = comparisonResults.filter(r => r.status === 'matched').length;
  const missingCount = comparisonResults.filter(r => r.status === 'missing').length;

  const formatRp = (val: number | null) => {
    if (!val) return '-';
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/pimpinan" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
            Kertas Kerja
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Import file Excel, lihat data dari database, dan bandingkan keduanya.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {[
          { key: 'excel' as const, label: 'Import Excel', icon: FileSpreadsheet, count: excelData.length },
          { key: 'database' as const, label: 'Data Database', icon: Table2, count: dokumenList.length },
          { key: 'compare' as const, label: 'Perbandingan', icon: TrendingUp, count: comparisonResults.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ────── TAB: Import Excel ────── */}
      {activeTab === 'excel' && (
        <div className="space-y-4">
          {/* Dropzone */}
          {excelData.length === 0 ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragging
                  ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                  : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                }`}
            >
              <FileSpreadsheet className={`w-14 h-14 mx-auto mb-3 ${dragging ? 'text-emerald-500' : 'text-gray-300'}`} />
              <p className="text-lg font-semibold text-gray-700">Drag & drop file Excel di sini</p>
              <p className="text-sm text-gray-400 mt-1">atau klik untuk pilih file</p>
              <p className="text-xs text-gray-400 mt-3">Mendukung format .xlsx, .xls, dan .csv</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File info + Sheet selector */}
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{excelFileName}</p>
                    <p className="text-xs text-gray-500">{excelData.length} baris • {excelHeaders.length} kolom</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sheetNames.length > 1 && (
                    <select
                      value={selectedSheet}
                      onChange={e => handleSheetChange(e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
                    >
                      {sheetNames.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => { setExcelData([]); setExcelHeaders([]); setExcelFileName(''); setWorkbook(null); }}
                    className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              {/* Comparison setup */}
              {dokumenList.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">🔍 Bandingkan dengan Data Database</h3>
                  <p className="text-xs text-blue-600 mb-3">
                    Pilih kolom Excel mana yang mau dicocokkan dengan Judul/No. Laporan di database.
                  </p>
                  <div className="flex items-center gap-3">
                    <select
                      value={mappingKey}
                      onChange={e => setMappingKey(e.target.value)}
                      className="flex-1 text-sm border border-blue-300 rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="">Pilih kolom Excel...</option>
                      {excelHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <button
                      onClick={runComparison}
                      disabled={!mappingKey}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Bandingkan
                    </button>
                  </div>
                </div>
              )}

              {/* Search + Dynamic Filter Bar */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-3">
                {/* Search */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={excelSearchQ}
                    onChange={e => setExcelSearchQ(e.target.value)}
                    placeholder="Cari di semua kolom Excel..."
                    className="flex-1 text-sm outline-none bg-transparent"
                  />
                  {excelSearchQ && (
                    <button onClick={() => setExcelSearchQ('')} className="text-gray-400 hover:text-gray-600 text-xs">
                      ✕
                    </button>
                  )}
                </div>

                {/* Dynamic Filters */}
                {excelFilterCols.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400">Filter:</span>
                    {excelFilterCols.map(col => {
                      const uniqueVals = Array.from(new Set(excelData.map(row => String(row[col] ?? '')))).filter(v => v).sort();
                      return (
                        <select
                          key={col}
                          value={excelFilters[col] || ''}
                          onChange={e => setExcelFilters(prev => ({ ...prev, [col]: e.target.value }))}
                          className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white max-w-[160px] truncate"
                        >
                          <option value="">Semua {col}</option>
                          {uniqueVals.map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      );
                    })}
                    {Object.values(excelFilters).some(v => v) && (
                      <button
                        onClick={() => setExcelFilters({})}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  Menampilkan {filteredExcelData.length} dari {excelData.length} baris
                </p>
              </div>

              {/* Excel Table Preview */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-auto max-h-[500px] border-b border-gray-200 relative">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                        {excelHeaders.map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredExcelData.length === 0 ? (
                        <tr>
                          <td colSpan={excelHeaders.length + 1} className="px-4 py-10 text-center text-sm text-gray-400">
                            Tidak ada data yang sesuai filter.
                          </td>
                        </tr>
                      ) : (
                        filteredExcelData.slice(0, 200).map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2.5 text-gray-400 text-xs">{i + 1}</td>
                            {excelHeaders.map(h => (
                              <td key={h} className="px-4 py-2.5 text-gray-700 whitespace-nowrap max-w-[200px] truncate">
                                {String(row[h] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredExcelData.length > 200 && (
                  <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 text-center border-t">
                    Menampilkan 200 dari {filteredExcelData.length} baris (gunakan filter untuk mempersempit)
                  </div>
                )}
              </div>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleExcelFile(f);
            }}
          />
        </div>
      )}

      {/* ────── TAB: Data Database ────── */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Cari judul atau no. laporan..."
              className="flex-1 text-sm outline-none"
            />
            <select
              value={filterTahun}
              onChange={e => setFilterTahun(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="">Semua Tahun</option>
              {uniqueTahun.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button onClick={fetchDokumen} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <RefreshCw className={`w-4 h-4 ${dokLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {dokError ? (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4" /> {dokError}
            </div>
          ) : dokLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-auto max-h-[500px] border-b border-gray-200 relative">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No. Laporan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Judul</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tahun</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Periode</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nilai</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDokumen.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 text-gray-500 text-xs font-mono">{d.nomor_laporan || '-'}</td>
                        <td className="px-4 py-2.5 text-gray-900 font-medium max-w-[250px] truncate">{d.judul}</td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{d.kategori}</span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-700">{d.tahun}</td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs">
                          {d.semester ? `Sem ${d.semester}` : d.bulan ? `Bln ${d.bulan}` : '-'}
                        </td>
                        <td className="px-4 py-2.5 text-gray-700 text-xs font-mono">{formatRp(d.nilai_rekening_koran)}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === 'disetujui' ? 'bg-green-100 text-green-700' :
                              d.status === 'menunggu_verifikasi' ? 'bg-yellow-100 text-yellow-700' :
                                d.status === 'revisi' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-600'
                            }`}>
                            {d.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 text-center border-t">
                Menampilkan {filteredDokumen.length} dari {dokumenList.length} dokumen
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────── TAB: Perbandingan ────── */}
      {activeTab === 'compare' && (
        <div className="space-y-4">
          {comparisonResults.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
              <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">Belum ada perbandingan</p>
              <p className="text-sm text-gray-400 mt-1">Import file Excel dulu, lalu klik tombol "Bandingkan".</p>
            </div>
          ) : (
            <>
              {/* Filter Status Perbandingan */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Tampilkan:</span>
                {([
                  { key: 'all', label: `Semua (${comparisonResults.length})`, color: 'bg-gray-100 text-gray-700 border-gray-300' },
                  { key: 'matched', label: `✅ Cocok (${matchedCount})`, color: 'bg-green-50 text-green-700 border-green-300' },
                  { key: 'missing', label: `❌ Tidak Ada (${missingCount})`, color: 'bg-red-50 text-red-700 border-red-300' },
                ] as const).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setCompareStatusFilter(opt.key)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      compareStatusFilter === opt.key
                        ? opt.color + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-lg">
                    <Table2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{comparisonResults.length}</p>
                    <p className="text-xs text-gray-500">Total Baris Excel</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2.5 bg-green-100 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{matchedCount}</p>
                    <p className="text-xs text-gray-500">Cocok di Database</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2.5 bg-red-100 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{missingCount}</p>
                    <p className="text-xs text-gray-500">Tidak Ditemukan</p>
                  </div>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-auto max-h-[500px] border-b border-gray-200 relative">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data Excel ({mappingKey})</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Judul di Database</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No. Laporan</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status Dokumen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCompareResults.map((r, i) => (
                        <tr key={i} className={`transition-colors ${r.status === 'matched' ? 'hover:bg-green-50' : 'hover:bg-red-50 bg-red-50/30'
                          }`}>
                          <td className="px-4 py-2.5">
                            {r.status === 'matched' ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Cocok
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                                <XCircle className="w-3 h-3" /> Tidak ada
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-gray-900 font-medium max-w-[200px] truncate">
                            {String(r.excelRow[mappingKey] ?? '')}
                          </td>
                          <td className="px-4 py-2.5 text-gray-700">
                            {r.matched?.judul || <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-gray-500 text-xs font-mono">
                            {r.matched?.nomor_laporan || <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-2.5">
                            {r.matched ? (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.matched.status === 'disetujui' ? 'bg-green-100 text-green-700' :
                                  r.matched.status === 'menunggu_verifikasi' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                {r.matched.status.replace(/_/g, ' ')}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
