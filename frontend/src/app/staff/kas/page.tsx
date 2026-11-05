'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Scale,
  Building2,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Loader2,
  ChevronRight,
  Layers,
  Info,
} from 'lucide-react';
import clsx from 'clsx';
import * as XLSX from 'xlsx';
import UploadModal from '@/components/Staff/UploadModal';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

interface TransaksiKas {
  id: number;
  tanggal: string;
  nomor_bukti?: string;
  uraian: string;
  jenis: 'debit' | 'kredit' | string;
  kategori?: string;
  nama_kategori?: string;
  nominal: number;
  saldo_akhir?: number;
  nama_bank?: string;
  kode_bank?: string;
  nomor_rekening_bank?: string;
  nama_rekening?: string;
  bukti_file?: string;
  file_nama?: string;
  created_at?: string;
}

interface RekeningKoranItem {
  id: number;
  nama_bank: string;
  nomor_rekening: string;
  saldo_akhir: number;
  periode?: string;
  bulan?: number;
  tahun?: number;
}

const formatRupiah = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export default function KasOverviewPage() {
  const { user } = useAuth();
  const [transaksiList, setTransaksiList] = useState<TransaksiKas[]>([]);
  const [rekeningList, setRekeningList] = useState<RekeningKoranItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [filterBank, setFilterBank] = useState('all');
  const [filterTahun, setFilterTahun] = useState<string>(new Date().getFullYear().toString());
  const [filterBulan, setFilterBulan] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Saldo Awal manual/input atau base (default: 0)
  const [saldoAwalInput, setSaldoAwalInput] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const session = getSession();
      const headers = { Authorization: `Bearer ${session?.token}` };

      // 1. Fetch Transaksi Pencatatan Kas
      const resPencatatan = await fetch(`${API}/pencatatan`, { headers });
      const dataPencatatan = await resPencatatan.json();
      const rawTrans: any[] = dataPencatatan.data || [];

      // 2. Fetch Rekening Koran
      const resRk = await fetch(`${API}/rekening-koran`, { headers });
      const dataRk = await resRk.json();
      const rawRk: any[] = dataRk.data || [];

      setTransaksiList(rawTrans);
      setRekeningList(rawRk);
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal memuat data kas: ' + (err.message || 'Error server'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Daftar Bank Unik untuk dropdown
  const bankOptions = useMemo(() => {
    const setBank = new Set<string>();
    transaksiList.forEach((t) => {
      if (t.nama_bank) setBank.add(t.nama_bank);
    });
    rekeningList.forEach((r) => {
      if (r.nama_bank) setBank.add(r.nama_bank);
    });
    return Array.from(setBank);
  }, [transaksiList, rekeningList]);

  // Filter Data Transaksi
  const filteredTransaksi = useMemo(() => {
    return transaksiList
      .filter((t) => {
        // Filter Bank
        if (filterBank !== 'all' && t.nama_bank !== filterBank) return false;

        // Filter Tahun
        if (t.tanggal && filterTahun !== 'all') {
          const tTahun = t.tanggal.split('-')[0];
          if (tTahun !== filterTahun) return false;
        }

        // Filter Bulan
        if (t.tanggal && filterBulan !== 'all') {
          const tBulan = parseInt(t.tanggal.split('-')[1], 10).toString();
          if (tBulan !== filterBulan) return false;
        }

        // Search Term
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          const matchUraian = (t.uraian || '').toLowerCase().includes(s);
          const matchKat = (t.nama_kategori || t.kategori || '').toLowerCase().includes(s);
          const matchRek = (t.nomor_rekening_bank || '').toLowerCase().includes(s);
          if (!matchUraian && !matchKat && !matchRek) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  }, [transaksiList, filterBank, filterTahun, filterBulan, searchTerm]);

  // Hitung Agregat Kas Berdasarkan Transaksi Terfilter
  const { totalPenerimaan, totalPengeluaran, transaksiWithRunningBalance, saldoAkhirBuku } = useMemo(() => {
    let masuk = 0;
    let keluar = 0;
    let currentBalance = saldoAwalInput;

    const listWithBal = filteredTransaksi.map((item) => {
      const nom = Number(item.nominal) || 0;
      const isDebit = item.jenis === 'debit';
      if (isDebit) {
        masuk += nom;
        currentBalance += nom;
      } else {
        keluar += nom;
        currentBalance -= nom;
      }
      return {
        ...item,
        penerimaan: isDebit ? nom : 0,
        pengeluaran: !isDebit ? nom : 0,
        saldoBerjalan: currentBalance,
      };
    });

    return {
      totalPenerimaan: masuk,
      totalPengeluaran: keluar,
      transaksiWithRunningBalance: listWithBal,
      saldoAkhirBuku: currentBalance,
    };
  }, [filteredTransaksi, saldoAwalInput]);

  // Hitung Saldo Bank dari Rekening Koran
  const totalSaldoBank = useMemo(() => {
    const matchedRk = rekeningList.filter((r) => {
      if (filterBank !== 'all' && r.nama_bank !== filterBank) return false;
      if (filterTahun !== 'all' && r.tahun && r.tahun.toString() !== filterTahun) return false;
      if (filterBulan !== 'all' && r.bulan && r.bulan.toString() !== filterBulan) return false;
      return true;
    });

    if (matchedRk.length > 0) {
      return matchedRk.reduce((acc, curr) => acc + (Number(curr.saldo_akhir) || 0), 0);
    }
    // Jika tidak ada filter spesifik, ambil total semua rekening koran
    return rekeningList.reduce((acc, curr) => acc + (Number(curr.saldo_akhir) || 0), 0);
  }, [rekeningList, filterBank, filterTahun, filterBulan]);

  // Selisih Rekonsiliasi (Buku vs Bank)
  const selisihKas = saldoAkhirBuku - totalSaldoBank;
  const isMatch = Math.abs(selisihKas) < 1;

  // Export ke Excel
  const handleExportExcel = () => {
    if (transaksiWithRunningBalance.length === 0) {
      toast.error('Tidak ada data transaksi kas untuk diekspor');
      return;
    }

    const rows = transaksiWithRunningBalance.map((t, idx) => ({
      No: idx + 1,
      Tanggal: t.tanggal,
      'No Rekening': t.nomor_rekening_bank || '-',
      Bank: t.nama_bank || '-',
      Kategori: t.nama_kategori || t.kategori || '-',
      Uraian: t.uraian,
      'Penerimaan (Rp)': t.penerimaan,
      'Pengeluaran (Rp)': t.pengeluaran,
      'Saldo Berjalan (Rp)': t.saldoBerjalan,
    }));

    // Tambah baris total
    rows.push({
      No: '' as any,
      Tanggal: '',
      'No Rekening': '',
      Bank: '',
      Kategori: 'TOTAL',
      Uraian: 'Akumulasi Mutasi Kas',
      'Penerimaan (Rp)': totalPenerimaan,
      'Pengeluaran (Rp)': totalPengeluaran,
      'Saldo Berjalan (Rp)': saldoAkhirBuku,
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Buku Kas Satker');
    XLSX.writeFile(wb, `Laporan_Buku_Kas_${filterTahun}_${filterBank}.xlsx`);
    toast.success('Laporan Buku Kas berhasil diunduh');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-['Inter',sans-serif]">
      {/* Header Utama */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E90FF] uppercase tracking-wider mb-1">
            <span>Kas Satker</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Akuntansi & Rekonsiliasi</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-[#1E90FF]" />
            Buku Kas & Rekonsiliasi Kas Satker
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau arus kas riil, mutasi penerimaan/pengeluaran dari bukti yang diunggah, dan rekonsiliasi saldo buku terhadap rekening koran bank.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Refresh Data"
          >
            <RefreshCw className={clsx("w-4 h-4", isRefreshing && "animate-spin text-[#1E90FF]")} />
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            Ekspor Excel
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1E90FF] hover:bg-blue-600 text-white font-semibold text-sm rounded-xl transition-all shadow-xs hover:shadow"
          >
            <Plus className="w-4 h-4" />
            Tambah Bukti Kas
          </button>
        </div>
      </div>

      {/* Kartu Ringkasan Akuntansi (Buku Kas & Rekonsiliasi) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Awal */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Saldo Awal Kas</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1">
            <p className="text-xl font-bold text-slate-900 tracking-tight">{formatRupiah(saldoAwalInput)}</p>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                placeholder="Set saldo awal..."
                value={saldoAwalInput || ''}
                onChange={(e) => setSaldoAwalInput(Number(e.target.value) || 0)}
                className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E90FF]"
              />
            </div>
          </div>
        </div>

        {/* Total Penerimaan (+) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Penerimaan Kas (+)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-600 tracking-tight">{formatRupiah(totalPenerimaan)}</p>
            <p className="text-[11px] text-slate-400 mt-1">Total mutasi debit dari bukti laporan</p>
          </div>
        </div>

        {/* Total Pengeluaran (-) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pengeluaran Kas (-)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-rose-600 tracking-tight">{formatRupiah(totalPengeluaran)}</p>
            <p className="text-[11px] text-slate-400 mt-1">Total kuitansi & mutasi belanja</p>
          </div>
        </div>

        {/* Saldo Akhir Kas Buku */}
        <div className="bg-gradient-to-tr from-blue-900 to-slate-900 text-white p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-200 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">Saldo Akhir Buku (BKU)</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-white tracking-tight">{formatRupiah(saldoAkhirBuku)}</p>
            <p className="text-[11px] text-blue-200 mt-1">Saldo Awal + Masuk - Keluar</p>
          </div>
        </div>
      </div>

      {/* Baris Rekonsiliasi Bank vs Buku */}
      <div className={clsx(
        "p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all",
        isMatch
          ? "bg-emerald-50/70 border-emerald-200"
          : "bg-amber-50/70 border-amber-200"
      )}>
        <div className="flex items-start gap-3.5">
          <div className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
            isMatch ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
          )}>
            {isMatch ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              Status Rekonsiliasi Kas:
              <span className={clsx(
                "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                isMatch ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-900"
              )}>
                {isMatch ? "Cocok (Balance)" : "Terdapat Selisih"}
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Perbandingan Saldo Buku Satker terhadap Saldo Akhir Rekening Koran Bank per tanggal cut-off pelaporan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 divide-x divide-slate-300">
          <div className="text-left md:text-right pr-6">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Saldo Rekening Koran Bank</p>
            <p className="text-base font-bold text-slate-900">{formatRupiah(totalSaldoBank)}</p>
          </div>
          <div className="text-left md:text-right pl-6">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Selisih Rekonsiliasi</p>
            <p className={clsx("text-base font-bold", isMatch ? "text-emerald-700" : "text-amber-700")}>
              {formatRupiah(selisihKas)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Kontrol Pencarian */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Bank */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={filterBank}
              onChange={(e) => setFilterBank(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E90FF]"
            >
              <option value="all">Semua Bank Mitra</option>
              {bankOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Filter Tahun */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E90FF]"
            >
              <option value="all">Semua Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Filter Bulan */}
          <div className="flex items-center gap-2">
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E90FF]"
            >
              <option value="all">Semua Bulan</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                const namaBulan = new Date(2026, m - 1).toLocaleString('id-ID', { month: 'long' });
                return (
                  <option key={m} value={m.toString()}>{namaBulan}</option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Pencarian */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari uraian, kategori, rekening..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E90FF]"
          />
        </div>
      </div>

      {/* Tabel Rincian Buku Kas Umum */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Rincian Buku Kas Umum (BKU)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Daftar transaksi kas yang memengaruhi saldo berdasarkan bukti setor/kuitansi.</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            {transaksiWithRunningBalance.length} Transaksi
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E90FF]" />
            <p className="text-sm font-medium">Memuat rincian transaksi kas akuntansi...</p>
          </div>
        ) : transaksiWithRunningBalance.length === 0 ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1E90FF] flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">Belum Ada Transaksi Kas</h4>
            <p className="text-xs text-slate-500 max-w-sm mb-6">
              Belum ada mutasi penerimaan atau pengeluaran kas yang tercatat untuk filter ini. Silakan unggah bukti transaksi kas.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E90FF] hover:bg-blue-600 text-white font-semibold text-xs rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Unggah Bukti Transaksi
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3.5 text-center w-12">No</th>
                  <th className="px-4 py-3.5">Tanggal</th>
                  <th className="px-4 py-3.5">Bank & No Rekening</th>
                  <th className="px-4 py-3.5">Kategori Dokumen</th>
                  <th className="px-4 py-3.5">Uraian Transaksi</th>
                  <th className="px-4 py-3.5 text-right text-emerald-700">Penerimaan (+)</th>
                  <th className="px-4 py-3.5 text-right text-rose-700">Pengeluaran (-)</th>
                  <th className="px-4 py-3.5 text-right font-bold text-slate-900">Saldo Berjalan</th>
                  <th className="px-4 py-3.5 text-center">Berkas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaksiWithRunningBalance.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{item.nama_bank || '-'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{item.nomor_rekening_bank || '-'}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                        {item.nama_kategori || item.kategori || 'Kas Satker'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium max-w-xs truncate" title={item.uraian}>
                      {item.uraian}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                      {item.penerimaan > 0 ? formatRupiah(item.penerimaan) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-rose-600 whitespace-nowrap">
                      {item.pengeluaran > 0 ? formatRupiah(item.pengeluaran) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 whitespace-nowrap bg-slate-50/50">
                      {formatRupiah(item.saldoBerjalan)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {item.bukti_file ? (
                        <a
                          href={item.bukti_file.startsWith('http') ? item.bukti_file : `${API}${item.bukti_file}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E90FF] hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Bukti
                        </a>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100/80 border-t-2 border-slate-300 font-bold text-slate-900">
                <tr>
                  <td colSpan={5} className="px-4 py-3.5 text-right uppercase tracking-wider text-xs">
                    Total Mutasi Kas:
                  </td>
                  <td className="px-4 py-3.5 text-right text-emerald-700 text-sm whitespace-nowrap">
                    {formatRupiah(totalPenerimaan)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-rose-700 text-sm whitespace-nowrap">
                    {formatRupiah(totalPengeluaran)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-[#1E90FF] text-sm whitespace-nowrap bg-blue-50/50">
                    {formatRupiah(saldoAkhirBuku)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <UploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

