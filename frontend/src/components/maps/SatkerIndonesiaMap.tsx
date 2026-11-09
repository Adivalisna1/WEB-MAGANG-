"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";
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
  ChevronDown,
  ChevronUp,
  Eye,
  ShieldCheck,
  Radio,
  Landmark,
  Coins,
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

export interface WilayahPengawasanKL {
  id: string;
  kodeWilayah: string;
  nama: string;
  satkerUtama: string;
  eselon1: string;
  pusatKota: string;
  lat: number;
  lng: number;
  radiusMeter: number;
  satkerIds: (number | string)[];
}

export const WILAYAH_PENGAWASAN_KL_LIST: WilayahPengawasanKL[] = [
  {
    id: "wil-01",
    kodeWilayah: "WIL-01",
    nama: "Wilayah I - DKI Jakarta, Jawa Barat & Banten",
    satkerUtama: "Universitas Indonesia (UI)",
    eselon1: "Ditjen Pendidikan Tinggi & Ditjen Pendidikan Vokasi",
    pusatKota: "Depok, Bandung & Bogor",
    lat: -6.65,
    lng: 107.15,
    radiusMeter: 120000,
    satkerIds: [1, 2, 3, 4, 5], // UI, ITB, Unpad, IPB, Polban
  },
  {
    id: "wil-02",
    kodeWilayah: "WIL-02",
    nama: "Wilayah II - Jawa Tengah & DI Yogyakarta",
    satkerUtama: "Universitas Gadjah Mada (UGM)",
    eselon1: "Ditjen Pendidikan Tinggi",
    pusatKota: "Yogyakarta, Semarang & Surakarta",
    lat: -7.45,
    lng: 110.15,
    radiusMeter: 110000,
    satkerIds: [6, 7, 8, 9], // UGM, Undip, UNS, Unsoed
  },
  {
    id: "wil-03",
    kodeWilayah: "WIL-03",
    nama: "Wilayah III - Jawa Timur & Madura",
    satkerUtama: "Universitas Airlangga (Unair)",
    eselon1: "Ditjen Pendidikan Tinggi & Ditjen Pendidikan Vokasi",
    pusatKota: "Surabaya & Malang",
    lat: -7.50,
    lng: 112.70,
    radiusMeter: 100000,
    satkerIds: [10, 11, 12, 13], // Unair, ITS, UB, PENS
  },
  {
    id: "wil-04",
    kodeWilayah: "WIL-04",
    nama: "Wilayah IV - Sumatera Bagian Utara, Barat & Aceh",
    satkerUtama: "Universitas Sumatera Utara (USU)",
    eselon1: "Ditjen Pendidikan Tinggi",
    pusatKota: "Medan, Banda Aceh & Padang",
    lat: 2.20,
    lng: 98.50,
    radiusMeter: 380000,
    satkerIds: [14, 15, 16], // USK, USU, Unand
  },
  {
    id: "wil-05",
    kodeWilayah: "WIL-05",
    nama: "Wilayah V - Sumatera Bagian Selatan & Lampung",
    satkerUtama: "Universitas Sriwijaya (Unsri)",
    eselon1: "Ditjen Pendidikan Tinggi",
    pusatKota: "Palembang",
    lat: -3.2185,
    lng: 104.6495,
    radiusMeter: 160000,
    satkerIds: [17], // Unsri
  },
  {
    id: "wil-06",
    kodeWilayah: "WIL-06",
    nama: "Wilayah VI - Kalimantan Se-Wilayah",
    satkerUtama: "Universitas Mulawarman (Unmul)",
    eselon1: "Ditjen Pendidikan Tinggi & Ditjen Pendidikan Vokasi",
    pusatKota: "Samarinda & Banjarmasin",
    lat: -1.80,
    lng: 116.00,
    radiusMeter: 240000,
    satkerIds: [20, 21, 22], // Polnes, Unmul, Poliban
  },
  {
    id: "wil-07",
    kodeWilayah: "WIL-07",
    nama: "Wilayah VII - Sulawesi Se-Wilayah",
    satkerUtama: "Universitas Hasanuddin (Unhas)",
    eselon1: "Ditjen Pendidikan Tinggi",
    pusatKota: "Makassar & Manado",
    lat: -2.50,
    lng: 121.50,
    radiusMeter: 380000,
    satkerIds: [18, 19], // Unhas, Unsrat
  },
  {
    id: "wil-08",
    kodeWilayah: "WIL-08",
    nama: "Wilayah VIII - Bali, Maluku & Papua",
    satkerUtama: "Universitas Udayana (Unud)",
    eselon1: "Ditjen Pendidikan Tinggi",
    pusatKota: "Denpasar, Ambon & Jayapura",
    lat: -5.00,
    lng: 128.00,
    radiusMeter: 750000,
    satkerIds: [23, 24, 25], // Unud, Unpatti, Uncen
  },
];

const formatRupiah = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export function matchEselon1(satkerEselon?: string | null, targetEselon?: string | null): boolean {
  if (!targetEselon || targetEselon === "all") return true;
  if (!satkerEselon) return false;

  const s = satkerEselon.toLowerCase().trim();
  const t = targetEselon.toLowerCase().trim();

  if (s === t || s.includes(t) || t.includes(s)) return true;

  // Ditjen Dikti / Pendidikan Tinggi
  const isDiktiS = s.includes("dikti") || s.includes("pendidikan tinggi") || s.includes("tinggi");
  const isDiktiT = t.includes("dikti") || t.includes("pendidikan tinggi") || t.includes("tinggi");
  if (isDiktiS && isDiktiT) return true;

  // Ditjen Vokasi / Pendidikan Vokasi
  const isVokasiS = s.includes("vokasi");
  const isVokasiT = t.includes("vokasi");
  if (isVokasiS && isVokasiT) return true;

  // Setjen / Sekretariat Jenderal
  const isSetjenS = s.includes("setjen") || s.includes("sekretariat");
  const isSetjenT = t.includes("setjen") || t.includes("sekretariat");
  if (isSetjenS && isSetjenT) return true;

  // Itjen / Inspektorat Jenderal
  const isItjenS = s.includes("itjen") || s.includes("inspektorat");
  const isItjenT = t.includes("itjen") || t.includes("inspektorat");
  if (isItjenS && isItjenT) return true;

  // Ditjen Risbang / Riset dan Pengembangan
  const isRisbangS = s.includes("risbang") || s.includes("riset");
  const isRisbangT = t.includes("risbang") || t.includes("riset");
  if (isRisbangS && isRisbangT) return true;

  // Ditjen Saintek / Sains dan Teknologi
  const isSaintekS = s.includes("saintek") || s.includes("sains");
  const isSaintekT = t.includes("saintek") || t.includes("sains");
  if (isSaintekS && isSaintekT) return true;

  return false;
}

interface SatkerMapProps {
  filterEselon1Initial?: string;
  isKLLevel?: boolean;
  title?: string;
  subtitle?: string;
}

export default function SatkerIndonesiaMap({
  filterEselon1Initial = "all",
  isKLLevel = false,
  title = "Peta Sebaran & Rekonsiliasi Kas Satker Se-Nusantara",
  subtitle = "Monitoring interaktif geografis, saldo kas riil, dan kelengkapan bukti dokumen satker",
}: SatkerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);

  // Mode View: default 'wilayah' (lingkaran pengawasan + penanda satker)
  const [viewMode, setViewMode] = useState<"wilayah" | "satker">("wilayah");
  const [selectedSatker, setSelectedSatker] = useState<SatkerGeoData | null>(null);
  const [selectedWilayah, setSelectedWilayah] = useState<WilayahPengawasanKL | null>(null);
  const [searchWilayahSatker, setSearchWilayahSatker] = useState<string>("");
  const [expandedSatkerId, setExpandedSatkerId] = useState<number | string | null>(null);

  const [filterEselon, setFilterEselon] = useState<string>(filterEselon1Initial);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchSatker, setSearchSatker] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Sinkronisasi filter saat prop inisial berubah (misal sesudah data user terambil)
  useEffect(() => {
    if (filterEselon1Initial) {
      setFilterEselon(filterEselon1Initial);
    }
  }, [filterEselon1Initial]);

  // Normalisasi value untuk elemen dropdown select
  const currentSelectEselonValue = useMemo(() => {
    if (!filterEselon || filterEselon === "all") return "all";
    const f = filterEselon.toLowerCase();
    if (f.includes("dikti") || f.includes("tinggi")) return "Ditjen Dikti";
    if (f.includes("vokasi")) return "Ditjen Vokasi";
    if (f.includes("setjen") || f.includes("sekretariat")) return "Setjen";
    if (f.includes("risbang") || f.includes("riset")) return "Ditjen Risbang";
    if (f.includes("saintek") || f.includes("sains")) return "Ditjen Saintek";
    if (f.includes("itjen") || f.includes("inspektorat")) return "Itjen";
    return filterEselon;
  }, [filterEselon]);

  // Filtered Satkers untuk mode individual
  const filteredSatkers = useMemo(() => {
    return SATKER_INDONESIA_LIST.filter((s) => {
      if (filterEselon !== "all" && !matchEselon1(s.eselon1, filterEselon)) {
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

  // Wilayah Pengawasan K/L Teragregasi (dengan data satker binaan & total saldo)
  const aggregatedWilayah = useMemo(() => {
    return WILAYAH_PENGAWASAN_KL_LIST.map((w) => {
      const satkersInWilayah = SATKER_INDONESIA_LIST.filter((s) =>
        w.satkerIds.includes(s.id) &&
        (filterEselon === "all" || matchEselon1(s.eselon1, filterEselon))
      );
      const totalBuku = satkersInWilayah.reduce((acc, s) => acc + s.saldoBuku, 0);
      const totalBank = satkersInWilayah.reduce((acc, s) => acc + s.saldoBank, 0);
      const totalSelisih = satkersInWilayah.reduce((acc, s) => acc + s.selisih, 0);
      const matchCount = satkersInWilayah.filter((s) => s.status === "match").length;
      const selisihCount = satkersInWilayah.filter((s) => s.status === "selisih").length;
      const hasSelisih = selisihCount > 0;
      return {
        ...w,
        satkers: satkersInWilayah,
        totalBuku,
        totalBank,
        totalSelisih,
        matchCount,
        selisihCount,
        hasSelisih,
      };
    });
  }, [filterEselon]);

  // Filtered Wilayah untuk mode lingkaran pengawasan K/L
  const filteredWilayah = useMemo(() => {
    return aggregatedWilayah.filter((w) => {
      if (w.satkers.length === 0) return false;
      if (filterStatus === "match" && w.hasSelisih) return false;
      if (filterStatus === "selisih" && !w.hasSelisih) return false;
      if (searchSatker.trim()) {
        const query = searchSatker.toLowerCase();
        const matchName = w.nama.toLowerCase().includes(query);
        const matchSatker = w.satkers.some(
          (s) =>
            s.nama.toLowerCase().includes(query) ||
            s.kota.toLowerCase().includes(query) ||
            s.kode.toLowerCase().includes(query)
        );
        if (!matchName && !matchSatker) return false;
      }
      return true;
    });
  }, [aggregatedWilayah, filterStatus, searchSatker]);

  // Statistik Cepat Peta (menyesuaikan viewMode)
  const stats = useMemo(() => {
    if (viewMode === "wilayah") {
      const totalWilayah = filteredWilayah.length;
      const totalSatker = filteredWilayah.reduce((acc, w) => acc + w.satkers.length, 0);
      const match = filteredWilayah.reduce((acc, w) => acc + w.matchCount, 0);
      const selisih = filteredWilayah.reduce((acc, w) => acc + w.selisihCount, 0);
      const totalSaldo = filteredWilayah.reduce((acc, w) => acc + w.totalBank, 0);
      return { totalWilayah, totalSatker, match, selisih, totalSaldo };
    } else {
      const totalSatker = filteredSatkers.length;
      const match = filteredSatkers.filter((s) => s.status === "match").length;
      const selisih = filteredSatkers.filter((s) => s.status === "selisih").length;
      const totalSaldo = filteredSatkers.reduce((acc, s) => acc + s.saldoBank, 0);
      return { totalWilayah: 0, totalSatker, match, selisih, totalSaldo };
    }
  }, [viewMode, filteredWilayah, filteredSatkers]);

  // Inisialisasi Peta Leaflet Secara Dinamis (Client-Side Safe)
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        if (!mapInstanceRef.current && mapContainerRef.current) {
          // Center titik tengah Indonesia (Kepulauan Nusantara)
          const map = L.map(mapContainerRef.current, {
            center: [-2.5, 118.0],
            zoom: 5,
            minZoom: 4,
            maxZoom: 14,
            scrollWheelZoom: true,
            zoomControl: false,
            preferCanvas: true, // Hardware acceleration GPU
          });

          // OpenStreetMap Public Tile Layer (100% Free, No Watermark, No API Key, Optimized)
          L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
              maxZoom: 18,
              updateWhenIdle: true,
              keepBuffer: 2,
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

  // Render Marker & Lingkaran pada Peta berdasarkan ViewMode & Filter
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined") return;

    const renderLayers = async () => {
      const L = (await import("leaflet")).default;

      // Bersihkan marker dan lingkaran lama
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      circlesRef.current.forEach((c) => c.remove());
      circlesRef.current = [];

      // 1. MODE WILAYAH PENGAWASAN K/L (LINGKARAN WILAYAH + SIMPUL UTAMA)
      if (viewMode === "wilayah") {
        filteredWilayah.forEach((w) => {
          const isSelected = selectedWilayah?.id === w.id;
          const circleColor = w.hasSelisih ? "#f59e0b" : "#10b981"; // Amber vs Emerald
          const circleFill = w.hasSelisih ? "rgba(245, 158, 11, 0.14)" : "rgba(16, 185, 129, 0.14)";

          // Gambar Lingkaran Jangkauan Wilayah Pengawasan K/L
          const circle = L.circle([w.lat, w.lng], {
            radius: w.radiusMeter,
            color: circleColor,
            fillColor: circleFill,
            fillOpacity: isSelected ? 0.28 : 0.14,
            weight: isSelected ? 3 : 2,
            dashArray: "6, 6",
          }).addTo(mapInstanceRef.current);

          circle.on("click", () => {
            setSelectedWilayah(w);
            setSelectedSatker(null);
            setExpandedSatkerId(null);
            mapInstanceRef.current.panTo([w.lat, w.lng], {
              animate: true,
              duration: 0.8,
            });
          });
          circlesRef.current.push(circle);

          // Simpul Utama Wilayah Pengawasan
          const pulseColor = w.hasSelisih ? "rgba(245, 158, 11, 0.45)" : "rgba(16, 185, 129, 0.45)";
          const shortCode = w.kodeWilayah.replace("WIL-", "W-");

          const customIcon = L.divIcon({
            className: "custom-wilayah-marker",
            iconSize: [44, 44],
            iconAnchor: [22, 22],
            html: `
              <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                  <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: ${pulseColor};"></div>
                  <div style="position: relative; width: 30px; height: 30px; border-radius: 50%; background-color: white; border: 3px solid ${circleColor}; box-shadow: 0 2px 6px rgba(0,0,0,0.18); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${circleColor};">
                    ${shortCode}
                  </div>
                </div>
                <div style="margin-top: 2px; background: white; padding: 2px 8px; border-radius: 9999px; border: 1px solid #cbd5e1; font-size: 10px; font-weight: 700; color: #1e293b; box-shadow: 0 1px 3px rgba(0,0,0,0.1); white-space: nowrap;">
                  ${w.satkerUtama.split(" ")[0]} (${w.satkers.length} Satker)
                </div>
              </div>
            `,
          });

          const marker = L.marker([w.lat, w.lng], { icon: customIcon }).addTo(
            mapInstanceRef.current
          );

          marker.bindTooltip(
            `<strong>${w.nama}</strong><br/>
             <span style="font-size: 11px; color: #64748b;">Pengawas: ${w.eselon1}</span><br/>
             <span style="font-size: 11px; font-weight: 600; color: #0f172a;">${w.satkers.length} Satker Diawasi &bull; Saldo: ${formatRupiah(w.totalBank)}</span><br/>
             <span style="font-size: 10px; color: ${w.hasSelisih ? '#d97706' : '#059669'}; font-weight: 600;">
               ${w.hasSelisih ? '⚠️ ' + w.selisihCount + ' Satker Ada Selisih' : '✓ Semua Satker Saldo Klop'}
             </span>`,
            { direction: "top", offset: [0, -22], opacity: 0.95 }
          );

          marker.on("click", () => {
            setSelectedWilayah(w);
            setSelectedSatker(null);
            setExpandedSatkerId(null);
            mapInstanceRef.current.panTo([w.lat, w.lng], {
              animate: true,
              duration: 0.8,
            });
          });

          markersRef.current.push(marker);

          // Tampilkan selalu pin-pin penanda satker binaan di dalam lingkaran wilayah
          w.satkers.forEach((childSatker) => {
            const childMatch = childSatker.status === "match";
            const childColor = childMatch ? "#10b981" : "#f59e0b";
            const isChildExpanded = expandedSatkerId === childSatker.id;

            const childIcon = L.divIcon({
              className: "custom-child-marker",
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              html: `
                <div style="position: relative; width: 28px; height: 28px; border-radius: 50%; background-color: white; border: 2.5px solid ${childColor}; box-shadow: 0 2px 6px rgba(0,0,0,0.22); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; color: #1e293b; cursor: pointer; transform: ${isChildExpanded ? 'scale(1.2)' : 'scale(1)'}; transition: transform 0.2s;">
                  ${childSatker.nama.slice(0, 2).toUpperCase()}
                </div>
              `,
            });

            const childMarker = L.marker([childSatker.lat, childSatker.lng], {
              icon: childIcon,
            }).addTo(mapInstanceRef.current);

            childMarker.bindTooltip(
              `<strong>${childSatker.nama}</strong><br/>
               <span style="font-size: 10px; color: ${childMatch ? '#059669' : '#d97706'};">
                 ${childMatch ? '✓ Saldo Kas Klop' : '⚠️ Selisih: ' + formatRupiah(childSatker.selisih)}
               </span>`,
              { direction: "top", offset: [0, -14], opacity: 0.95 }
            );

            childMarker.on("click", (e: any) => {
              L.DomEvent.stopPropagation(e);
              setSelectedWilayah(w);
              setSelectedSatker(childSatker);
              setExpandedSatkerId(childSatker.id);
            });

            markersRef.current.push(childMarker);
          });
        });
      }

      // 2. MODE TITIK SATKER INDIVIDUAL SE-NUSANTARA
      if (viewMode === "satker") {
        filteredSatkers.forEach((satker) => {
          const isMatch = satker.status === "match";
          const pinColor = isMatch ? "#10b981" : "#f59e0b";
          const pulseColor = isMatch ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)";

          const customIcon = L.divIcon({
            className: "custom-satker-marker",
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            html: `
              <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: ${pulseColor};"></div>
                <div style="position: relative; width: 18px; height: 18px; border-radius: 50%; background-color: white; border: 2.5px solid ${pinColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.12); display: flex; align-items: center; justify-content: center;">
                  <div style="width: 6px; height: 6px; border-radius: 50%; background-color: ${pinColor};"></div>
                </div>
              </div>
            `,
          });

          const marker = L.marker([satker.lat, satker.lng], { icon: customIcon }).addTo(
            mapInstanceRef.current
          );

          marker.bindTooltip(
            `<strong>${satker.nama}</strong><br/><span style="font-size: 11px; color: ${isMatch ? '#059669' : '#d97706'};">${isMatch ? '✓ Saldo Kas Klop' : '⚠️ Selisih: ' + formatRupiah(satker.selisih)}</span>`,
            { direction: "top", offset: [0, -14], opacity: 0.95 }
          );

          marker.on("click", () => {
            setSelectedSatker(satker);
            setSelectedWilayah(null);
            mapInstanceRef.current.panTo([satker.lat, satker.lng], {
              animate: true,
              duration: 0.8,
            });
          });

          markersRef.current.push(marker);
        });
      }
    };

    renderLayers();
  }, [viewMode, filteredSatkers, filteredWilayah, selectedWilayah]);

  // Reset Center Map ke Indonesia
  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-2.5, 118.0], 5, { animate: true });
      setSelectedSatker(null);
      setSelectedWilayah(null);
      setExpandedSatkerId(null);
    }
  };

  // Zoom ke Satker tertentu
  const handleFocusSatker = (lat: number, lng: number, satkerId: number | string) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 9, { animate: true, duration: 1 });
      setExpandedSatkerId(satkerId);
    }
  };

  // Satker dalam wilayah terpilih (dengan pencarian internal menu)
  const activeWilayahSatkers = useMemo(() => {
    if (!selectedWilayah) return [];
    const satkers = SATKER_INDONESIA_LIST.filter((s) =>
      selectedWilayah.satkerIds.includes(s.id)
    );
    if (!searchWilayahSatker.trim()) return satkers;
    const q = searchWilayahSatker.toLowerCase();
    return satkers.filter(
      (s) =>
        s.nama.toLowerCase().includes(q) ||
        s.kota.toLowerCase().includes(q) ||
        s.kode.toLowerCase().includes(q)
    );
  }, [selectedWilayah, searchWilayahSatker]);

  // Agregasi saldo untuk wilayah terpilih
  const selectedWilayahTotals = useMemo(() => {
    if (!selectedWilayah) return null;
    const satkers = SATKER_INDONESIA_LIST.filter((s) =>
      selectedWilayah.satkerIds.includes(s.id)
    );
    const totalBuku = satkers.reduce((acc, s) => acc + s.saldoBuku, 0);
    const totalBank = satkers.reduce((acc, s) => acc + s.saldoBank, 0);
    const totalSelisih = satkers.reduce((acc, s) => acc + s.selisih, 0);
    const matchCount = satkers.filter((s) => s.status === "match").length;
    const selisihCount = satkers.filter((s) => s.status === "selisih").length;
    const compliancePercent = satkers.length
      ? Math.round((matchCount / satkers.length) * 100)
      : 100;
    return {
      totalBuku,
      totalBank,
      totalSelisih,
      matchCount,
      selisihCount,
      compliancePercent,
      totalSatker: satkers.length,
    };
  }, [selectedWilayah]);

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

        {/* Filter Toolbar & Switch Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Switch Mode: Lingkaran Wilayah Pengawasan vs Semua Penanda Satker */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              onClick={() => {
                setViewMode("wilayah");
                setSelectedSatker(null);
              }}
              className={clsx(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
                viewMode === "wilayah"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
              title="Tampilkan Lingkaran Wilayah Pengawasan"
            >
              <Radio className="w-3.5 h-3.5 text-blue-500" />
              Lingkaran Wilayah
            </button>
            <button
              onClick={() => {
                setViewMode("satker");
                setSelectedWilayah(null);
              }}
              className={clsx(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
                viewMode === "satker"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
              title="Tampilkan Semua Penanda Satker Se-Nusantara"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              Semua Penanda Satker
            </button>
          </div>

          {/* Search Satker / Wilayah */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={viewMode === "wilayah" ? "Cari wilayah / satker..." : "Cari satker / kota..."}
              value={searchSatker}
              onChange={(e) => setSearchSatker(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E90FF] w-40 sm:w-48 shadow-2xs"
            />
          </div>

          {/* Filter Eselon 1 */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={currentSelectEselonValue}
              onChange={(e) => setFilterEselon(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E90FF] shadow-2xs"
            >
              <option value="all">Semua Eselon 1</option>
              <option value="Ditjen Dikti">Ditjen Pendidikan Tinggi (Dikti)</option>
              <option value="Ditjen Vokasi">Ditjen Pendidikan Vokasi (Vokasi)</option>
              <option value="Setjen">Sekretariat Jenderal (Setjen)</option>
              <option value="Ditjen Risbang">Ditjen Riset & Pengembangan</option>
              <option value="Ditjen Saintek">Ditjen Sains & Teknologi</option>
              <option value="Itjen">Inspektorat Jenderal (Itjen)</option>
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
          {viewMode === "wilayah" ? (
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Wilayah Pengawasan: <strong className="text-slate-900 font-bold">{stats.totalWilayah} Zona</strong> ({stats.totalSatker} Satker Binaan)
            </span>
          ) : (
            <span className="text-slate-500 font-medium">
              Total Terpetakan: <strong className="text-slate-800 font-bold">{stats.totalSatker} Satker</strong>
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <strong>{stats.match}</strong> Satker Klop
          </span>
          <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <strong>{stats.selisih}</strong> Satker Selisih
          </span>
        </div>
        <div className="text-slate-500">
          Akumulasi Kas Bank Terpetakan: <strong className="text-slate-900 font-bold">{formatRupiah(stats.totalSaldo)}</strong>
        </div>
      </div>

      {/* Map View Container */}
      <div className="relative w-full h-[500px] md:h-[560px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Legend Peta (Floating di Kiri Bawah) */}
        <div className="absolute left-4 bottom-4 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200/80 shadow-md text-[11px] space-y-1.5 pointer-events-auto">
          <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
            {viewMode === "wilayah" ? "Legenda Pengawasan K/L" : "Status Rekonsiliasi"}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="text-slate-600">
              {viewMode === "wilayah" ? "Zona Saldo Klop 100%" : "Saldo Klop (Match 100%)"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            <span className="text-slate-600">
              {viewMode === "wilayah" ? "Zona Ada Satker Selisih" : "Perlu Verifikasi / Selisih"}
            </span>
          </div>
          {viewMode === "wilayah" && (
            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
              *Klik lingkaran untuk bedah satker binaan & saldo
            </p>
          )}
        </div>

        {/* ============================================================== */}
        {/* MENU BARU: SLIDING DRAWER WILAYAH PENGAWASAN ESELON 1 (K/L)   */}
        {/* Menampilkan daftar satker yang diawasi & saldo masing-masing   */}
        {/* ============================================================== */}
        {selectedWilayah && selectedWilayahTotals && (
          <div className="absolute right-3 top-3 bottom-3 w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[520px] z-30 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200 pointer-events-auto">
            {/* Header Menu Wilayah */}
            <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200/80 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-600 text-white shadow-2xs">
                    {selectedWilayah.kodeWilayah}
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                    Pengawasan K/L
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {selectedWilayah.nama}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-medium text-slate-700">Satker Koordinator:</span> {selectedWilayah.satkerUtama}
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-700">Eselon 1 Pengawas:</span> {selectedWilayah.eselon1}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedWilayah(null);
                  setExpandedSatkerId(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors shrink-0"
                title="Tutup Menu Pengawasan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Konten Scrollable Menu Wilayah */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Ringkasan Akumulasi Saldo Eselon 1 di Wilayah Ini */}
              <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    Total Saldo Konsolidasi Wilayah ({selectedWilayahTotals.totalSatker} Satker)
                  </span>
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded text-[10px] font-bold",
                      selectedWilayahTotals.totalSelisih === 0
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {selectedWilayahTotals.totalSelisih === 0
                      ? "100% Klop"
                      : `${selectedWilayahTotals.selisihCount} Satker Ada Selisih`}
                  </span>
                </div>

                {/* 3 Kotak Saldo Agregat */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Kas Bank
                    </span>
                    <p className="font-bold text-[#1E90FF] text-xs mt-0.5 truncate" title={formatRupiah(selectedWilayahTotals.totalBank)}>
                      {formatRupiah(selectedWilayahTotals.totalBank)}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Kas Buku BKU
                    </span>
                    <p className="font-bold text-slate-800 text-xs mt-0.5 truncate" title={formatRupiah(selectedWilayahTotals.totalBuku)}>
                      {formatRupiah(selectedWilayahTotals.totalBuku)}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Total Selisih
                    </span>
                    <p
                      className={clsx(
                        "font-bold text-xs mt-0.5 truncate",
                        selectedWilayahTotals.totalSelisih === 0 ? "text-emerald-600" : "text-amber-600"
                      )}
                      title={formatRupiah(selectedWilayahTotals.totalSelisih)}
                    >
                      {selectedWilayahTotals.totalSelisih === 0 ? "Rp 0 (Klop)" : formatRupiah(selectedWilayahTotals.totalSelisih)}
                    </p>
                  </div>
                </div>

                {/* Kepatuhan Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Tingkat Kepatuhan Rekonsiliasi</span>
                    <span className="font-bold text-slate-800">
                      {selectedWilayahTotals.matchCount} dari {selectedWilayahTotals.totalSatker} Satker Klop ({selectedWilayahTotals.compliancePercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${selectedWilayahTotals.compliancePercent}%` }}
                    />
                    <div
                      className="bg-amber-500 h-full transition-all duration-500"
                      style={{ width: `${100 - selectedWilayahTotals.compliancePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Header List Satker & Filter Cepat */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-blue-600" />
                    Daftar Satker yang Diawasi Eselon 1 ({activeWilayahSatkers.length} Satker)
                  </h4>
                </div>

                {/* Search Satker di Wilayah ini */}
                <div className="relative mb-2.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Saring nama satker / kota di wilayah ini..."
                    value={searchWilayahSatker}
                    onChange={(e) => setSearchWilayahSatker(e.target.value)}
                    className="w-full text-xs pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* DAFTAR SATKER BINAAN DALAM WILAYAH TERSEBUT */}
                <div className="space-y-2.5">
                  {activeWilayahSatkers.map((satker) => {
                    const isMatch = satker.status === "match";
                    const isExpanded = expandedSatkerId === satker.id;

                    return (
                      <div
                        key={satker.id}
                        className={clsx(
                          "bg-white rounded-xl border transition-all duration-200 p-3 shadow-2xs hover:border-blue-300",
                          isExpanded ? "border-blue-400 ring-1 ring-blue-200" : "border-slate-200"
                        )}
                      >
                        {/* Baris Atas: Nama Satker & Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                #{satker.kode}
                              </span>
                              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                {satker.eselon1}
                              </span>
                            </div>
                            <h5 className="font-bold text-slate-900 text-xs mt-1 leading-snug">
                              {satker.nama}
                            </h5>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {satker.kota}, {satker.provinsi}
                            </p>
                          </div>

                          {/* Badge Status */}
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1",
                              isMatch
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            )}
                          >
                            {isMatch ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Saldo Klop
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                Selisih Kas
                              </>
                            )}
                          </span>
                        </div>

                        {/* Baris Tengah: Rincian Saldo Satker Tersebut */}
                        <div className="mt-2.5 grid grid-cols-3 gap-1.5 bg-slate-50/80 p-2 rounded-lg border border-slate-100 text-[11px]">
                          <div>
                            <span className="text-[9px] uppercase font-semibold text-slate-400 block">
                              Saldo Kas Buku
                            </span>
                            <span className="font-bold text-slate-800 truncate block">
                              {formatRupiah(satker.saldoBuku)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-semibold text-slate-400 block">
                              Saldo Kas Bank
                            </span>
                            <span className="font-bold text-blue-600 truncate block">
                              {formatRupiah(satker.saldoBank)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-semibold text-slate-400 block">
                              Selisih
                            </span>
                            <span
                              className={clsx(
                                "font-bold truncate block",
                                isMatch ? "text-emerald-600" : "text-amber-600"
                              )}
                            >
                              {isMatch ? "Rp 0" : formatRupiah(satker.selisih)}
                            </span>
                          </div>
                        </div>

                        {/* Baris Aksi: Accordion Bukti Dokumen & Tombol Fokus Peta */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setExpandedSatkerId(isExpanded ? null : satker.id)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span>Bukti Dokumen ({satker.dokumenList.length})</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleFocusSatker(satker.lat, satker.lng, satker.id)}
                            className="px-2 py-1 text-[10px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1"
                            title="Arahkan Peta ke Satker Ini"
                          >
                            <Eye className="w-3 h-3 text-slate-400" />
                            Fokus di Peta
                          </button>
                        </div>

                        {/* Accordion Dokumen yang Terbuka */}
                        {isExpanded && (
                          <div className="mt-2.5 pt-2 border-t border-blue-100 space-y-1.5 animate-in fade-in duration-150">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Berkas Dokumen Pendukung Satker:
                            </span>
                            {satker.dokumenList.map((dok, dIdx) => (
                              <div
                                key={dIdx}
                                className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-[11px]"
                              >
                                <div className="min-w-0 flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <div className="truncate">
                                    <p className="font-semibold text-slate-800 truncate">
                                      {dok.nama}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      {dok.kategori} &bull; {dok.tanggal}
                                    </p>
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
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Menu Wilayah */}
            <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                Zona Pengawasan K/L &bull; {selectedWilayah.kodeWilayah}
              </span>
              <button
                onClick={() => {
                  setSelectedWilayah(null);
                  setExpandedSatkerId(null);
                }}
                className="py-1 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs border border-slate-200 transition-colors shadow-2xs"
              >
                Tutup Menu
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* FLOATING MINI CARD (Saat Pin Satker Individual Diklik di mode Satker) */}
        {/* ============================================================== */}
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
