"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  MapPin,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Search,
  Filter,
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
  X,
  Layers,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";

export interface SatkerGeoData {
  id: number | string;
  nama: string;
  kode: string;
  eselon1: string;
  kota: string;
  provinsi: string;
  lat: number;
  lng: number;
  saldoBuku: number;
  saldoBank: number;
  selisih: number;
  status: "match" | "selisih" | "pending";
  dokumenList: {
    nama: string;
    kategori: string;
    tanggal: string;
    status: string;
  }[];
}

// Data Satker Se-Nusantara (PTN, Politeknik & Unit Kerja Binaan Nasional)
export const SATKER_INDONESIA_LIST: SatkerGeoData[] = [
  // --- DKI JAKARTA & JAWA BARAT ---
  {
    id: 1,
    nama: "Universitas Indonesia (UI)",
    kode: "023.17.189912",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Depok / Jakarta",
    provinsi: "Jawa Barat",
    lat: -6.365,
    lng: 106.8286,
    saldoBuku: 28450000000,
    saldoBank: 28920000000,
    selisih: 470000000,
    status: "selisih",
    dokumenList: [
      { nama: "Rekening Koran BNI Okt 2026", kategori: "Rekening Koran", tanggal: "28 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas & LPJ Bendahara", kategori: "BAP Kas", tanggal: "29 Okt 2026", status: "Review" },
      { nama: "SK Penetapan Piutang UKT", kategori: "SK Piutang", tanggal: "25 Okt 2026", status: "Terverifikasi" },
    ],
  },
  {
    id: 2,
    nama: "Institut Teknologi Bandung (ITB)",
    kode: "023.17.201411",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Bandung",
    provinsi: "Jawa Barat",
    lat: -6.8915,
    lng: 107.6107,
    saldoBuku: 34120000000,
    saldoBank: 34120000000,
    selisih: 0,
    status: "match",
    dokumenList: [
      { nama: "Rekening Koran Mandiri Okt 2026", kategori: "Rekening Koran", tanggal: "30 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas Bendahara Pengeluaran", kategori: "BAP Kas", tanggal: "30 Okt 2026", status: "Terverifikasi" },
    ],
  },
  {
    id: 3,
    nama: "Universitas Padjadjaran (Unpad)",
    kode: "023.17.319022",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Jatinangor / Sumedang",
    provinsi: "Jawa Barat",
    lat: -6.9264,
    lng: 107.7747,
    saldoBuku: 19800000000,
    saldoBank: 20050000000,
    selisih: 250000000,
    status: "selisih",
    dokumenList: [
      { nama: "Rekening Koran BRI Okt 2026", kategori: "Rekening Koran", tanggal: "27 Okt 2026", status: "Terverifikasi" },
      { nama: "LPJ Bendahara Penerimaan", kategori: "LPJ Bendahara", tanggal: "28 Okt 2026", status: "Review" },
    ],
  },
  {
    id: 4,
    nama: "Politeknik Negeri Bandung (Polban)",
    kode: "023.18.401124",
    eselon1: "Ditjen Pendidikan Vokasi",
    kota: "Bandung",
    provinsi: "Jawa Barat",
    lat: -6.8715,
    lng: 107.5738,
    saldoBuku: 8760000000,
    saldoBank: 8940000000,
    selisih: 180000000,
    status: "selisih",
    dokumenList: [
      { nama: "Rekening Koran BSI Okt 2026", kategori: "Rekening Koran", tanggal: "26 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas Tunai & Bank", kategori: "BAP Kas", tanggal: "28 Okt 2026", status: "Menunggu" },
    ],
  },
  {
    id: 5,
    nama: "Institut Pertanian Bogor (IPB)",
    kode: "023.17.152344",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Bogor",
    provinsi: "Jawa Barat",
    lat: -6.5583,
    lng: 106.7267,
    saldoBuku: 24700000000,
    saldoBank: 24700000000,
    selisih: 0,
    status: "match",
    dokumenList: [
      { nama: "Rekening Koran BNI & Mandiri", kategori: "Rekening Koran", tanggal: "30 Okt 2026", status: "Terverifikasi" },
      { nama: "Konfirmasi Saldo Bank", kategori: "Konfirmasi Bank", tanggal: "30 Okt 2026", status: "Terverifikasi" },
    ],
  },

  // --- D.I. YOGYAKARTA & JAWA TENGAH ---
  {
    id: 6,
    nama: "Universitas Gadjah Mada (UGM)",
    kode: "023.17.677288",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Sleman / Yogyakarta",
    provinsi: "D.I. Yogyakarta",
    lat: -7.7713,
    lng: 110.3775,
    saldoBuku: 32180000000,
    saldoBank: 32500000000,
    selisih: 320000000,
    status: "selisih",
    dokumenList: [
      { nama: "Rekening Koran Mandiri & BNI Okt", kategori: "Rekening Koran", tanggal: "29 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas Triwulan III", kategori: "BAP Kas", tanggal: "28 Okt 2026", status: "Review" },
      { nama: "Surat Penutupan Rekening Lama", kategori: "Surat Rekening", tanggal: "20 Okt 2026", status: "Terverifikasi" },
    ],
  },
  {
    id: 7,
    nama: "Universitas Diponegoro (Undip)",
    kode: "023.17.412890",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Semarang",
    provinsi: "Jawa Tengah",
    lat: -7.0506,
    lng: 110.4395,
    saldoBuku: 21500000000,
    saldoBank: 21500000000,
    selisih: 0,
    status: "match",
    dokumenList: [
      { nama: "Rekening Koran BNI Okt 2026", kategori: "Rekening Koran", tanggal: "31 Okt 2026", status: "Terverifikasi" },
      { nama: "LPJ Bendahara Pengeluaran", kategori: "LPJ Bendahara", tanggal: "31 Okt 2026", status: "Terverifikasi" },
    ],
  },
  {
    id: 8,
    nama: "Universitas Sebelas Maret (UNS)",
    kode: "023.17.519044",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Surakarta",
    provinsi: "Jawa Tengah",
    lat: -7.5584,
    lng: 110.8564,
    saldoBuku: 17800000000,
    saldoBank: 17800000000,
    selisih: 0,
    status: "match",
    dokumenList: [
      { nama: "Rekening Koran BTN Okt 2026", kategori: "Rekening Koran", tanggal: "30 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas Rutin Bulanan", kategori: "BAP Kas", tanggal: "30 Okt 2026", status: "Terverifikasi" },
    ],
  },
  {
    id: 9,
    nama: "Universitas Jenderal Soedirman (Unsoed)",
    kode: "023.17.620119",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Purwokerto",
    provinsi: "Jawa Tengah",
    lat: -7.4124,
    lng: 109.2486,
    saldoBuku: 11200000000,
    saldoBank: 11350000000,
    selisih: 150000000,
    status: "selisih",
    dokumenList: [
      { nama: "Rekening Koran BRI Okt 2026", kategori: "Rekening Koran", tanggal: "28 Okt 2026", status: "Review" },
      { nama: "BAP Kas Bendahara", kategori: "BAP Kas", tanggal: "29 Okt 2026", status: "Review" },
    ],
  },

  // --- JAWA TIMUR ---
  {
    id: 10,
    nama: "Universitas Airlangga (Unair)",
    kode: "023.17.712390",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Surabaya",
    provinsi: "Jawa Timur",
    lat: -7.2708,
    lng: 112.7988,
    saldoBuku: 29400000000,
    saldoBank: 29400000000,
    selisih: 0,
    status: "match",
    dokumenList: [
      { nama: "Rekening Koran Mandiri Okt 2026", kategori: "Rekening Koran", tanggal: "30 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas Akhir Bulan", kategori: "BAP Kas", tanggal: "30 Okt 2026", status: "Terverifikasi" },
    ],
  },
  {
    id: 11,
    nama: "Institut Teknologi Sepuluh Nopember (ITS)",
    kode: "023.17.781290",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Surabaya",
    provinsi: "Jawa Timur",
    lat: -7.2824,
    lng: 112.7949,
    saldoBuku: 26100000000,
    saldoBank: 26100000000,
    selisih: 0,
    status: "match",
    dokumenList: [
      { nama: "Rekening Koran BNI Okt 2026", kategori: "Rekening Koran", tanggal: "31 Okt 2026", status: "Terverifikasi" },
      { nama: "LPJ Bendahara Pengeluaran", kategori: "LPJ Bendahara", tanggal: "31 Okt 2026", status: "Terverifikasi" },
    ],
  },
  {
    id: 12,
    nama: "Universitas Brawijaya (UB)",
    kode: "023.17.810244",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Malang",
    provinsi: "Jawa Timur",
    lat: -7.9526,
    lng: 112.6145,
    saldoBuku: 31050000000,
    saldoBank: 31200000000,
    selisih: 150000000,
    status: "selisih",
    dokumenList: [
      { nama: "Rekening Koran BRI Okt 2026", kategori: "Rekening Koran", tanggal: "29 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas & LPJ Bendahara", kategori: "BAP Kas", tanggal: "30 Okt 2026", status: "Review" },
    ],
  },
  {
    id: 13,
    nama: "Politeknik Elektronika Negeri Surabaya (PENS)",
    kode: "023.18.512033",
    eselon1: "Ditjen Pendidikan Vokasi",
    kota: "Surabaya",
    provinsi: "Jawa Timur",
    lat: -7.2758,
    lng: 112.7937,
    saldoBuku: 6400000000,
    saldoBank: 6490000000,
    selisih: 90000000,
    status: "selisih",
    dokumenList: [
      { nama: "Rekening Koran BTN Okt 2026", kategori: "Rekening Koran", tanggal: "28 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas Tunai", kategori: "BAP Kas", tanggal: "29 Okt 2026", status: "Review" },
    ],
  },

  // --- SUMATERA ---
  {
    id: 14,
    nama: "Universitas Syiah Kuala (USK)",
    kode: "023.17.101890",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Banda Aceh",
    provinsi: "Aceh",
    lat: 5.5684,
    lng: 95.3672,
    saldoBuku: 14800000000,
    saldoBank: 14800000000,
    selisih: 0,
    status: "match",
    dokumenList: [
      { nama: "Rekening Koran BSI Okt 2026", kategori: "Rekening Koran", tanggal: "30 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas Bendahara", kategori: "BAP Kas", tanggal: "30 Okt 2026", status: "Terverifikasi" },
    ],
  },
  {
    id: 15,
    nama: "Universitas Sumatera Utara (USU)",
    kode: "023.17.202399",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Medan",
    provinsi: "Sumatera Utara",
    lat: 3.5658,
    lng: 98.6575,
    saldoBuku: 22400000000,
    saldoBank: 22650000000,
    selisih: 250000000,
    status: "selisih",
    dokumenList: [
      { nama: "Rekening Koran Mandiri Okt 2026", kategori: "Rekening Koran", tanggal: "27 Okt 2026", status: "Terverifikasi" },
      { nama: "LPJ Bendahara Pengeluaran", kategori: "LPJ Bendahara", tanggal: "29 Okt 2026", status: "Review" },
    ],
  },
  {
    id: 16,
    nama: "Universitas Andalas (Unand)",
    kode: "023.17.303490",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Padang",
    provinsi: "Sumatera Barat",
    lat: -0.915,
    lng: 100.4578,
    saldoBuku: 16200000000,
    saldoBank: 16200000000,
    selisih: 0,
    status: "match",
    dokumenList: [
      { nama: "Rekening Koran BNI Okt 2026", kategori: "Rekening Koran", tanggal: "31 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas & LPJ", kategori: "BAP Kas", tanggal: "31 Okt 2026", status: "Terverifikasi" },
    ],
  },
  {
    id: 17,
    nama: "Universitas Sriwijaya (Unsri)",
    kode: "023.17.404599",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Palembang / Indralaya",
    provinsi: "Sumatera Selatan",
    lat: -3.2185,
    lng: 104.6495,
    saldoBuku: 18900000000,
    saldoBank: 18900000000,
    selisih: 0,
    status: "match",
    dokumenList: [
      { nama: "Rekening Koran BRI Okt 2026", kategori: "Rekening Koran", tanggal: "30 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas Rutin", kategori: "BAP Kas", tanggal: "30 Okt 2026", status: "Terverifikasi" },
    ],
  },

  // --- SULAWESI ---
  {
    id: 18,
    nama: "Universitas Hasanuddin (Unhas)",
    kode: "023.17.801299",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Makassar",
    provinsi: "Sulawesi Selatan",
    lat: -5.1354,
    lng: 119.4893,
    saldoBuku: 27500000000,
    saldoBank: 27820000000,
    selisih: 320000000,
    status: "selisih",
    dokumenList: [
      { nama: "Rekening Koran BNI Okt 2026", kategori: "Rekening Koran", tanggal: "29 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas dan LPJ Bendahara", kategori: "BAP Kas", tanggal: "30 Okt 2026", status: "Review" },
    ],
  },
  {
    id: 19,
    nama: "Universitas Tadulako (Untad)",
    kode: "023.17.805612",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Palu",
    provinsi: "Sulawesi Tengah",
    lat: -0.8361,
    lng: 119.8925,
    saldoBuku: 13400000000,
    saldoBank: 13400000000,
    selisih: 0,
    status: "match",
    dokumenList: [
      { nama: "Rekening Koran BNI & BAP Kas", kategori: "Rekening Koran", tanggal: "30 Okt 2026", status: "Terverifikasi" },
      { nama: "Bukti Setor Sisa UP (NTPN)", kategori: "Bukti Setor UP", tanggal: "30 Okt 2026", status: "Terverifikasi" },
    ],
  },
  {
    id: 20,
    nama: "Universitas Sam Ratulangi (Unsrat)",
    kode: "023.17.808922",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Manado",
    provinsi: "Sulawesi Utara",
    lat: 1.4552,
    lng: 124.829,
    saldoBuku: 12600000000,
    saldoBank: 12780000000,
    selisih: 180000000,
    status: "selisih",
    dokumenList: [
      { nama: "Rekening Koran Mandiri Okt 2026", kategori: "Rekening Koran", tanggal: "28 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas Rutin", kategori: "BAP Kas", tanggal: "29 Okt 2026", status: "Review" },
    ],
  },

  // --- KALIMANTAN ---
  {
    id: 21,
    nama: "Universitas Mulawarman (Unmul)",
    kode: "023.17.601288",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Samarinda",
    provinsi: "Kalimantan Timur",
    lat: -0.4705,
    lng: 117.1537,
    saldoBuku: 15300000000,
    saldoBank: 15300000000,
    selisih: 0,
    status: "match",
    dokumenList: [
      { nama: "Rekening Koran BNI Okt 2026", kategori: "Rekening Koran", tanggal: "31 Okt 2026", status: "Terverifikasi" },
      { nama: "LPJ Bendahara Pengeluaran", kategori: "LPJ Bendahara", tanggal: "31 Okt 2026", status: "Terverifikasi" },
    ],
  },
  {
    id: 22,
    nama: "Universitas Tanjungpura (Untan)",
    kode: "023.17.604599",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Pontianak",
    provinsi: "Kalimantan Barat",
    lat: -0.0594,
    lng: 109.3465,
    saldoBuku: 13800000000,
    saldoBank: 13950000000,
    selisih: 150000000,
    status: "selisih",
    dokumenList: [
      { nama: "Rekening Koran Mandiri Okt 2026", kategori: "Rekening Koran", tanggal: "27 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas", kategori: "BAP Kas", tanggal: "29 Okt 2026", status: "Review" },
    ],
  },

  // --- BALI, MALUKU & PAPUA ---
  {
    id: 23,
    nama: "Universitas Udayana (Unud)",
    kode: "023.17.502390",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Jimbaran / Denpasar",
    provinsi: "Bali",
    lat: -8.7983,
    lng: 115.1724,
    saldoBuku: 19100000000,
    saldoBank: 19100000000,
    selisih: 0,
    status: "match",
    dokumenList: [
      { nama: "Rekening Koran BNI Okt 2026", kategori: "Rekening Koran", tanggal: "30 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas Tunai", kategori: "BAP Kas", tanggal: "30 Okt 2026", status: "Terverifikasi" },
    ],
  },
  {
    id: 24,
    nama: "Universitas Pattimura (Unpatti)",
    kode: "023.17.901233",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Ambon",
    provinsi: "Maluku",
    lat: -3.655,
    lng: 128.19,
    saldoBuku: 9800000000,
    saldoBank: 9800000000,
    selisih: 0,
    status: "match",
    dokumenList: [
      { nama: "Rekening Koran BNI Okt 2026", kategori: "Rekening Koran", tanggal: "30 Okt 2026", status: "Terverifikasi" },
      { nama: "LPJ Pengeluaran", kategori: "LPJ Bendahara", tanggal: "30 Okt 2026", status: "Terverifikasi" },
    ],
  },
  {
    id: 25,
    nama: "Universitas Cenderawasih (Uncen)",
    kode: "023.17.908901",
    eselon1: "Ditjen Pendidikan Tinggi",
    kota: "Jayapura",
    provinsi: "Papua",
    lat: -2.585,
    lng: 140.665,
    saldoBuku: 11400000000,
    saldoBank: 11620000000,
    selisih: 220000000,
    status: "selisih",
    dokumenList: [
      { nama: "Rekening Koran BNI Okt 2026", kategori: "Rekening Koran", tanggal: "26 Okt 2026", status: "Terverifikasi" },
      { nama: "BAP Kas Triwulan", kategori: "BAP Kas", tanggal: "28 Okt 2026", status: "Review" },
    ],
  },
];

const formatRupiah = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

interface SatkerMapProps {
  filterEselon1Initial?: string;
  title?: string;
  subtitle?: string;
}

export default function SatkerIndonesiaMap({
  filterEselon1Initial = "all",
  title = "Peta Sebaran & Rekonsiliasi Kas Satker Se-Nusantara",
  subtitle = "Monitoring interaktif geografis, saldo kas riil, dan kelengkapan bukti dokumen satker",
}: SatkerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedSatker, setSelectedSatker] = useState<SatkerGeoData | null>(null);
  const [filterEselon, setFilterEselon] = useState<string>(filterEselon1Initial);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchSatker, setSearchSatker] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Filtered Satkers
  const filteredSatkers = useMemo(() => {
    return SATKER_INDONESIA_LIST.filter((s) => {
      if (filterEselon !== "all" && !s.eselon1.toLowerCase().includes(filterEselon.toLowerCase())) {
        return false;
      }
      if (filterStatus !== "all" && s.status !== filterStatus) {
        return false;
      }
      if (
        searchSatker.trim() &&
        !s.nama.toLowerCase().includes(searchSatker.toLowerCase()) &&
        !s.kota.toLowerCase().includes(searchSatker.toLowerCase()) &&
        !s.kode.toLowerCase().includes(searchSatker.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [filterEselon, filterStatus, searchSatker]);

  // Statistik Cepat Peta
  const stats = useMemo(() => {
    const total = filteredSatkers.length;
    const match = filteredSatkers.filter((s) => s.status === "match").length;
    const selisih = filteredSatkers.filter((s) => s.status === "selisih").length;
    const totalSaldo = filteredSatkers.reduce((acc, s) => acc + s.saldoBank, 0);
    return { total, match, selisih, totalSaldo };
  }, [filteredSatkers]);

  // Inisialisasi Peta Leaflet Secara Dinamis (Client-Side Safe)
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        // Import CSS jika belum ada
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        if (!mapInstanceRef.current && mapContainerRef.current) {
          // Center titik tengah Indonesia (Kepulauan Nusantara)
          const map = L.map(mapContainerRef.current, {
            center: [-2.5, 118.0],
            zoom: 5,
            minZoom: 4,
            maxZoom: 14,
            scrollWheelZoom: true,
            zoomControl: false,
          });

          // OpenStreetMap Public Tile Layer (100% Free, No Watermark, No API Key)
          L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
              maxZoom: 19,
            }
          ).addTo(map);

          // Add Zoom control at top-right
          L.control.zoom({ position: "topright" }).addTo(map);

          mapInstanceRef.current = map;
          if (isMounted) setMapLoaded(true);
        }
      } catch (err) {
        console.error("Gagal memuat Leaflet Map:", err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Marker pada Peta berdasarkan Filter
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined") return;

    const renderMarkers = async () => {
      const L = (await import("leaflet")).default;

      // Bersihkan marker lama
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      filteredSatkers.forEach((satker) => {
        const isMatch = satker.status === "match";
        const pinColor = isMatch ? "#10b981" : "#f59e0b"; // Emerald vs Amber
        const pulseColor = isMatch ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)";

        // Custom HTML DivIcon yang modern dan berdenyut (pulse)
        const customIcon = L.divIcon({
          className: "custom-satker-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: ${pulseColor}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background-color: white; border: 3px solid ${pinColor}; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${pinColor};"></div>
              </div>
            </div>
          `,
        });

        const marker = L.marker([satker.lat, satker.lng], { icon: customIcon }).addTo(
          mapInstanceRef.current
        );

        // Tooltip cepat saat hover
        marker.bindTooltip(
          `<strong>${satker.nama}</strong><br/><span style="font-size: 11px; color: ${isMatch ? '#059669' : '#d97706'};">${isMatch ? '✓ Saldo Kas Klop' : '⚠️ Selisih: ' + formatRupiah(satker.selisih)}</span>`,
          { direction: "top", offset: [0, -14], opacity: 0.95 }
        );

        // Klik marker: Buka Mini Card detail
        marker.on("click", () => {
          setSelectedSatker(satker);
          mapInstanceRef.current.panTo([satker.lat, satker.lng], {
            animate: true,
            duration: 0.8,
          });
        });

        markersRef.current.push(marker);
      });
    };

    renderMarkers();
  }, [filteredSatkers]);

  // Reset Center Map ke Indonesia
  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-2.5, 118.0], 5, { animate: true });
      setSelectedSatker(null);
    }
  };

  return (
    <div
      className={clsx(
        "bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col transition-all duration-300",
        isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : "relative w-full"
      )}
    >
      {/* Header & Filter Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/40">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E90FF]/10 text-[#1E90FF] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Satker */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari satker / kota..."
              value={searchSatker}
              onChange={(e) => setSearchSatker(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E90FF] w-40 sm:w-48 shadow-2xs"
            />
          </div>

          {/* Filter Eselon 1 */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterEselon}
              onChange={(e) => setFilterEselon(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E90FF] shadow-2xs"
            >
              <option value="all">Semua Eselon 1</option>
              <option value="Dikti">Ditjen Pendidikan Tinggi</option>
              <option value="Vokasi">Ditjen Pendidikan Vokasi</option>
            </select>
          </div>

          {/* Filter Status Kas */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E90FF] shadow-2xs"
            >
              <option value="all">Semua Status Kas</option>
              <option value="match">🟢 Saldo Klop (Match)</option>
              <option value="selisih">🟡 Ada Selisih Kas</option>
            </select>
          </div>

          {/* Tombol Reset Center */}
          <button
            onClick={handleResetCenter}
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Reset Posisi Peta Indonesia"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Toggle Fullscreen Card */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title={isFullscreen ? "Kecilkan Tampilan" : "Perbesar Peta"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bar Statistik Ringkas Peta */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-slate-500 font-medium">
            Total Terpetakan: <strong className="text-slate-800 font-bold">{stats.total} Satker</strong>
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <strong>{stats.match}</strong> Saldo Klop
          </span>
          <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <strong>{stats.selisih}</strong> Ada Selisih Kas
          </span>
        </div>
        <div className="text-slate-500">
          Akumulasi Kas Bank: <strong className="text-slate-900 font-bold">{formatRupiah(stats.totalSaldo)}</strong>
        </div>
      </div>

      {/* Map View Container */}
      <div className="relative w-full h-[460px] md:h-[500px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Legend Peta (Floating di Kiri Bawah) */}
        <div className="absolute left-4 bottom-4 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200/80 shadow-md text-[11px] space-y-1.5 pointer-events-auto">
          <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
            Status Rekonsiliasi
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="text-slate-600">Saldo Klop (Match 100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            <span className="text-slate-600">Perlu Verifikasi / Selisih</span>
          </div>
        </div>

        {/* FLOATING MINI CARD / DRAWER (Saat Pin Satker Diklik) */}
        {selectedSatker && (
          <div className="absolute right-4 top-4 bottom-4 w-full max-w-[340px] sm:max-w-[370px] z-30 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200 pointer-events-auto">
            {/* Header Mini Card */}
            <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-start justify-between gap-3">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 mb-1">
                  KODE #{selectedSatker.kode}
                </span>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {selectedSatker.nama}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {selectedSatker.kota}, {selectedSatker.provinsi}
                </p>
              </div>
              <button
                onClick={() => setSelectedSatker(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                title="Tutup Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Konten Mini Card */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3.5 text-xs">
              {/* Unit Eselon 1 Pembina */}
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Unit Pembina</span>
                <span className="font-semibold text-slate-800">{selectedSatker.eselon1}</span>
              </div>

              {/* Status Rekonsiliasi Badge */}
              <div
                className={clsx(
                  "p-3 rounded-xl border flex items-center justify-between",
                  selectedSatker.status === "match"
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                    : "bg-amber-50/70 border-amber-200 text-amber-800"
                )}
              >
                <div className="flex items-center gap-2">
                  {selectedSatker.status === "match" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <div>
                    <p className="font-bold text-xs leading-none">
                      {selectedSatker.status === "match" ? "Rekonsiliasi Klop" : "Ada Selisih Kas"}
                    </p>
                    <p className="text-[10px] opacity-80 mt-0.5">
                      {selectedSatker.status === "match"
                        ? "Buku & Bank klop 100%"
                        : `Selisih: ${formatRupiah(selectedSatker.selisih)}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ringkasan Saldo Kas & Bank */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Saldo Kas BKU
                  </span>
                  <p className="font-bold text-slate-900 text-xs mt-0.5 truncate">
                    {formatRupiah(selectedSatker.saldoBuku)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Saldo Rek. Koran
                  </span>
                  <p className="font-bold text-[#1E90FF] text-xs mt-0.5 truncate">
                    {formatRupiah(selectedSatker.saldoBank)}
                  </p>
                </div>
              </div>

              {/* Berkas & Dokumen Terakhir */}
              <div>
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-2">
                  Bukti Dokumen Terakhir ({selectedSatker.dokumenList.length})
                </span>
                <div className="space-y-1.5">
                  {selectedSatker.dokumenList.map((dok, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg border border-slate-200/80 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 text-[11px] truncate">
                            {dok.nama}
                          </p>
                          <p className="text-[10px] text-slate-400">{dok.tanggal}</p>
                        </div>
                      </div>
                      <span
                        className={clsx(
                          "px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0",
                          dok.status === "Terverifikasi"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        )}
                      >
                        {dok.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center gap-2">
              <button
                onClick={() => setSelectedSatker(null)}
                className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs border border-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
