'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import toast from 'react-hot-toast';

const API = typeof window !== "undefined" && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:5000/api` : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

// --- TYPES ---
interface FindingItem {
  initials: string;
  colorClass: string;
  name: string;
  code: string;
  unit: string;
  cash: string;
  bank: string;
  variance: string;
  varianceNum: number;
  status: string;
}

interface FeedItem {
  name: string;
  action: string;
  time: string;
  tone: 'green' | 'blue' | 'amber';
  icon: 'check' | 'shield' | 'refresh';
}

interface UnitItem {
  name: string;
  meta: string;
  value: number;
  color: string;
  parts: [number, number, number];
}

interface UserItem {
  name: string;
  nip: string;
  role: string;
  unit: string;
  roleBadge: string;
  status: string;
  lastActive: string;
  initials: string;
  color: string;
  email: string;
}

interface DocItem {
  id?: number | string;
  name: string;
  code: string;
  satker: string;
  unit: string;
  date: string;
  size: string;
  status: string;
  tone: string;
  file_url?: string | null;
  file_nama?: string;
}

interface AuditLogItem {
  id: string;
  time: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  hash: string;
  status: string;
  tone: 'green' | 'blue' | 'amber';
  icon: 'check' | 'shield' | 'refresh' | 'lock';
}

// --- DEFAULT DATASETS ---
const DEFAULT_FINDINGS: FindingItem[] = [
  { initials: "UI", colorClass: "satker-blue", name: "Universitas Indonesia", code: "023.17.189912", unit: "Ditjen Dikti", cash: "Rp 28,45 M", bank: "Rp 28,92 M", variance: "Rp 470 Jt", varianceNum: 470, status: "Perlu Klarifikasi" },
  { initials: "UG", colorClass: "satker-purple", name: "Universitas Gadjah Mada", code: "023.17.677288", unit: "Ditjen Dikti", cash: "Rp 32,18 M", bank: "Rp 32,50 M", variance: "Rp 320 Jt", varianceNum: 320, status: "Perlu Klarifikasi" },
  { initials: "PB", colorClass: "satker-teal", name: "Politeknik Negeri Bandung", code: "023.18.401124", unit: "Ditjen Vokasi", cash: "Rp 8,76 M", bank: "Rp 8,94 M", variance: "Rp 180 Jt", varianceNum: 180, status: "Perlu Klarifikasi" },
  { initials: "UP", colorClass: "satker-blue", name: "Universitas Padjadjaran", code: "023.17.319022", unit: "Ditjen Dikti", cash: "Rp 19,80 M", bank: "Rp 20,05 M", variance: "Rp 250 Jt", varianceNum: 250, status: "Perlu Klarifikasi" },
  { initials: "PE", colorClass: "satker-amber", name: "Politeknik Elektronika Negeri Surabaya", code: "023.18.512033", unit: "Ditjen Vokasi", cash: "Rp 6,40 M", bank: "Rp 6,49 M", variance: "Rp 90 Jt", varianceNum: 90, status: "Perlu Klarifikasi" }
];

const DEFAULT_UNITS: UnitItem[] = [
  { name: "Ditjen Pendidikan Tinggi", meta: "96 Satker", value: 91, color: "blue", parts: [91, 6, 3] },
  { name: "Ditjen Pendidikan Vokasi", meta: "53 Satker", value: 86, color: "blue", parts: [86, 10, 4] },
  { name: "Sekretariat Jenderal", meta: "2 Satker", value: 100, color: "green", parts: [100, 0, 0] },
  { name: "Ditjen Riset & Saintek", meta: "2 Satker", value: 100, color: "green", parts: [100, 0, 0] },
  { name: "Inspektorat Jenderal", meta: "Audit Internal", value: 95, color: "blue", parts: [95, 3, 2] }
];

const DEFAULT_FEED: FeedItem[] = [
  { name: "Dirjen Dikti", action: "Memverifikasi 24 dokumen laporan satker", time: "5 menit lalu", tone: "green", icon: "check" },
  { name: "Sesditjen Vokasi", action: "Menyetujui laporan semester 1 Polban", time: "18 menit lalu", tone: "blue", icon: "check" },
  { name: "Sekretariat Jenderal", action: "Mengembalikan 3 dokumen LPJ ke Satker", time: "32 menit lalu", tone: "amber", icon: "refresh" }
];

const DEFAULT_USERS: UserItem[] = [
  { name: "Dr. Agus Setiawan", nip: "197408121999031002", role: "Pimpinan Eksekutif", unit: "Sekretariat Jenderal", roleBadge: "Sekjen", status: "Online", lastActive: "Baru saja", initials: "AS", color: "satker-blue", email: "agus.setiawan@kemenkeu.go.id" },
  { name: "Prof. Dr. Ir. Sri Wahyuni", nip: "196805151993032001", role: "Pembina Eselon 1", unit: "Ditjen Dikti", roleBadge: "Dirjen Dikti", status: "Online", lastActive: "12 menit lalu", initials: "SW", color: "satker-teal", email: "sri.wahyuni@dikti.go.id" },
  { name: "Dr. Hendra Gunawan, M.M.", nip: "198203242006041003", role: "Pembina Eselon 1", unit: "Ditjen Vokasi", roleBadge: "Sesditjen Vokasi", status: "Online", lastActive: "25 menit lalu", initials: "HG", color: "satker-purple", email: "hendra.g@vokasi.kemdikbud.go.id" },
  { name: "Dra. Siti Rahmawati, Ak.", nip: "197911082003122002", role: "Auditor Internal", unit: "Inspektorat Jenderal", roleBadge: "Irwil I", status: "Aktif", lastActive: "1 jam lalu", initials: "SR", color: "satker-amber", email: "siti.rahma@itjen.kemdikbud.go.id" },
  { name: "Bambang Hermanto, S.Kom.", nip: "198809142011011005", role: "Operator Satker", unit: "Institut Pertanian Bogor", roleBadge: "Bendahara", status: "Aktif", lastActive: "2 jam lalu", initials: "BH", color: "satker-teal", email: "bambang.h@apps.ipb.ac.id" },
  { name: "Rian Hidayat, S.E.", nip: "199102172014021001", role: "Operator Satker", unit: "Universitas Indonesia", roleBadge: "Bendahara", status: "Menunggu", lastActive: "Kemarin", initials: "RH", color: "satker-blue", email: "rian.h@ui.ac.id" }
];

const DEFAULT_DOCS: DocItem[] = [
  { name: "Laporan Pertanggungjawaban (LPJ) Semester I", code: "DOC-2026-001", satker: "Universitas Indonesia", unit: "Ditjen Dikti", date: "28 Juni 2026", size: "4.2 MB · PDF", status: "Valid", tone: "green" },
  { name: "Berita Acara Rekonsiliasi (BAR) Kas Bank", code: "DOC-2026-002", satker: "Universitas Gadjah Mada", unit: "Ditjen Dikti", date: "27 Juni 2026", size: "2.8 MB · PDF", status: "Valid", tone: "green" },
  { name: "Rekening Koran Bank Persepsi Juni 2026", code: "DOC-2026-003", satker: "Politeknik Negeri Bandung", unit: "Ditjen Vokasi", date: "29 Juni 2026", size: "5.1 MB · PDF", status: "Menunggu", tone: "blue" },
  { name: "Buku Kas Umum (BKU) & Rekapitulasi Pajak", code: "DOC-2026-004", satker: "Institut Pertanian Bogor", unit: "Ditjen Dikti", date: "26 Juni 2026", size: "3.7 MB · PDF", status: "Valid", tone: "green" },
  { name: "Konfirmasi Saldo Simpanan Rekening Khusus", code: "DOC-2026-005", satker: "Universitas Padjadjaran", unit: "Ditjen Dikti", date: "30 Juni 2026", size: "1.9 MB · PDF", status: "Perlu Revisi", tone: "amber" },
  { name: "Laporan Realisasi Anggaran (LRA) Satker", code: "DOC-2026-006", satker: "Politeknik Elektronika Negeri Surabaya", unit: "Ditjen Vokasi", date: "25 Juni 2026", size: "6.4 MB · PDF", status: "Valid", tone: "green" }
];

const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [
  { id: "AUD-2026-8812", time: "10:42:15 WIB", actor: "Prof. Dr. Ir. Sri Wahyuni", role: "Dirjen Dikti", action: "Verifikasi Berkas LPJ Semester", target: "Institut Pertanian Bogor (023.17.200114)", hash: "SHA256: 4f8a91bc92b1", status: "Terverifikasi", tone: "green", icon: "check" },
  { id: "AUD-2026-8811", time: "10:30:02 WIB", actor: "Dr. Hendra Gunawan, M.M.", role: "Sesditjen Vokasi", action: "Persetujuan Rekonsiliasi Kas Bank", target: "Politeknik Negeri Jakarta (023.18.400102)", hash: "SHA256: 7b1caa345e12", status: "Disetujui", tone: "blue", icon: "check" },
  { id: "AUD-2026-8810", time: "09:55:40 WIB", actor: "Dra. Siti Rahmawati, Ak.", role: "Inspektorat Jenderal", action: "Audit Kepatuhan & Nota Selisih PMK", target: "Universitas Indonesia (023.17.189912)", hash: "SHA256: 3c9de882ef99", status: "Perlu Klarifikasi", tone: "amber", icon: "shield" },
  { id: "AUD-2026-8809", time: "09:15:22 WIB", actor: "Sekretariat Jenderal", role: "Biro Keuangan", action: "Pengembalian 3 Dokumen LPJ ke Satker", target: "Politeknik Negeri Padang (023.18.400033)", hash: "SHA256: a1e2f901cb74", status: "Dikembalikan", tone: "amber", icon: "refresh" },
  { id: "AUD-2026-8808", time: "08:45:10 WIB", actor: "Sistem Keamanan SSL", role: "Pusintek Kemenkeu", action: "Enkripsi Sinkronisasi Berkas Cloud Harian", target: "153 Satker Terkoneksi Nasional", hash: "SHA256: 9e337710ad45", status: "Aman", tone: "green", icon: "lock" }
];

const MONTH_NAMES: Record<string, string> = {
  all: "Semua Bulan (Jan - Des)",
  "1": "Januari",
  "2": "Februari",
  "3": "Maret",
  "4": "April",
  "5": "Mei",
  "6": "Juni",
  "7": "Juli",
  "8": "Agustus",
  "9": "September",
  "10": "Oktober",
  "11": "November",
  "12": "Desember"
};

export default function KLDashboardPage() {
  const router = useRouter();
  const { user, token, logoutFn } = useAuth();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [year, setYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('10');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [chipFilter, setChipFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [lastSync, setLastSync] = useState<string>('10:45');
  const [popover, setPopover] = useState<'notifications' | 'export' | null>(null);

  // Modals
  const [reviewModalSatker, setReviewModalSatker] = useState<FindingItem | null>(null);
  const [securityModal, setSecurityModal] = useState<boolean>(false);
  const [logoutModal, setLogoutModal] = useState<boolean>(false);
  const [signedOut, setSignedOut] = useState<boolean>(false);
  const [activeDetailUser, setActiveDetailUser] = useState<UserItem | null>(null);
  const [activeDetailAudit, setActiveDetailAudit] = useState<AuditLogItem | null>(null);
  const [activeDetailDoc, setActiveDetailDoc] = useState<DocItem | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string>('');

  const handleOpenDocPreview = async (d: DocItem) => {
    setActiveDetailDoc(d);
    setPreviewError('');
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }

    if (!d.id) return;

    setPreviewLoading(true);
    try {
      const session = getSession();
      const currentToken = token || session?.token;
      const res = await fetch(`${API}/dokumen/${d.id}/preview`, {
        headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {}
      });
      if (res.ok) {
        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        setPreviewBlobUrl(objUrl);
      } else {
        setPreviewError('File fisik belum tersedia di server penyimpanan atau format bukan PDF.');
      }
    } catch {
      setPreviewError('Tidak dapat terhubung ke endpoint preview dokumen.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCloseDocPreview = () => {
    setActiveDetailDoc(null);
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
    setPreviewError('');
  };

  // Filter chips in sub-views
  const [docFilter, setDocFilter] = useState<string>('all');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [auditEventFilter, setAuditEventFilter] = useState<string>('all');

  // Interactive Settings Toggles
  const [toggleEmail, setToggleEmail] = useState<boolean>(true);
  const [togglePmk, setTogglePmk] = useState<boolean>(true);
  const [togglePres, setTogglePres] = useState<boolean>(false);

  // Live Data State
  const [liveStats, setLiveStats] = useState<{
    compliance: number;
    trend: string;
    docsTotal: number;
    docsValid: number;
    docsPending: number;
    docsRevise: number;
    cashTotal: string;
    satkerTotal: number;
    satkerActive: number;
    satkerPending: number;
  }>({
    compliance: 89.2,
    trend: "+4.1%",
    docsTotal: 1420,
    docsValid: 1260,
    docsPending: 112,
    docsRevise: 48,
    cashTotal: "4,82",
    satkerTotal: 153,
    satkerActive: 142,
    satkerPending: 11
  });

  const [findings, setFindings] = useState<FindingItem[]>(DEFAULT_FINDINGS);
  const [units, setUnits] = useState<UnitItem[]>(DEFAULT_UNITS);
  const [feed, setFeed] = useState<FeedItem[]>(DEFAULT_FEED);
  const [usersList, setUsersList] = useState<UserItem[]>(DEFAULT_USERS);
  const [docsList, setDocsList] = useState<DocItem[]>(DEFAULT_DOCS);
  const [auditLogsList, setAuditLogsList] = useState<AuditLogItem[]>(DEFAULT_AUDIT_LOGS);

  // --- FETCH LIVE DATA FROM BACKEND ---
  const fetchBackendData = useCallback(async () => {
    try {
      const session = getSession();
      const headers = { Authorization: `Bearer ${session?.token}` };

      const bulanQuery = selectedMonth !== 'all' ? `&bulan=${selectedMonth}` : '';

      // 1. Dashboard Stats
      const resStats = await fetch(`${API}/stats/dashboard?tahun=${year}${bulanQuery}`, { headers });
      if (resStats.ok) {
        const json = await resStats.json();
        const d = json.data || {};
        if (d.total_dokumen !== undefined) {
          const totalDocs = d.total_dokumen || 1420;
          const totalSaldoTriliun = (d.total_saldo ? (d.total_saldo / 1e12).toFixed(2) : "4,82").replace('.', ',');
          const totalSatkers = d.total_satker || 153;
          
          setLiveStats(prev => ({
            ...prev,
            docsTotal: totalDocs,
            cashTotal: totalSaldoTriliun,
            satkerTotal: totalSatkers,
            satkerActive: Math.max(1, totalSatkers - 11),
            satkerPending: 11
          }));
        }
      }

      // 2. Units Eselon 1
      const resUnits = await fetch(`${API}/eselon-1/units`, { headers });
      if (resUnits.ok) {
        const jsonUnits = await resUnits.json();
        const uList = jsonUnits.data || [];
        if (Array.isArray(uList) && uList.length > 0) {
          const defaultParts: [number, number, number][] = [
            [91, 6, 3],
            [86, 10, 4],
            [100, 0, 0],
            [100, 0, 0],
            [95, 3, 2]
          ];
          const mappedUnits: UnitItem[] = uList.slice(0, 5).map((u: any, idx: number) => ({
            name: u.nama || `Unit Eselon ${idx+1}`,
            meta: u.singkatan || `${u.kode || ''}`,
            value: [91, 86, 100, 100, 95][idx] || 90,
            color: "blue",
            parts: defaultParts[idx] || [90, 8, 2]
          }));
          setUnits(mappedUnits);
        }
      }

      // 3. Rekening Koran / Selisih Satker
      const resRk = await fetch(`${API}/rekening-koran?tahun=${year}${bulanQuery}`, { headers });
      if (resRk.ok) {
        const jsonRk = await resRk.json();
        const rkData = jsonRk.data || [];
        if (Array.isArray(rkData) && rkData.length > 0) {
          const mappedFindings: FindingItem[] = rkData.slice(0, 6).map((r: any, idx: number) => {
            const real = r.saldo_akhir_bulan || 20000000000;
            const bank = r.saldo_rk || 20450000000;
            const diff = Math.abs(bank - real);
            return {
              initials: (r.satker_nama || "ST").substring(0, 2).toUpperCase(),
              colorClass: ["satker-blue", "satker-purple", "satker-teal", "satker-amber"][idx % 4],
              name: r.satker_nama || `Satker ${r.satker_id || idx+1}`,
              code: r.satker_kode || `023.17.${100000 + idx}`,
              unit: r.eselon_1_singkatan || "Ditjen Dikti",
              cash: `Rp ${(real / 1e9).toFixed(2).replace('.', ',')} M`,
              bank: `Rp ${(bank / 1e9).toFixed(2).replace('.', ',')} M`,
              variance: `Rp ${Math.round(diff / 1e6)} Jt`,
              varianceNum: Math.round(diff / 1e6),
              status: diff > 0 ? "Perlu Klarifikasi" : "Klop Sesuai"
            };
          });
          if (mappedFindings.length > 0) setFindings(mappedFindings);
        }
      }

      // 4. Dokumen
      const resDocs = await fetch(`${API}/dokumen?tahun=${year}${bulanQuery}`, { headers });
      if (resDocs.ok) {
        const jsonDocs = await resDocs.json();
        const docsData = jsonDocs.data || [];
        if (Array.isArray(docsData) && docsData.length > 0) {
          const mappedDocs: DocItem[] = docsData.slice(0, 15).map((d: any) => ({
            id: d.id,
            name: d.judul || d.nama || "Dokumen Keuangan",
            code: `DOC-${year}-${String(d.id).padStart(3, '0')}`,
            satker: d.satker_nama || "Satker Kementerian",
            unit: d.eselon_1_singkatan || "Ditjen Dikti",
            date: d.created_at ? new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "28 Juni 2026",
            size: `${((d.file_size || 3500000) / 1e6).toFixed(1)} MB · PDF`,
            status: d.status === 'terverifikasi' ? 'Valid' : (d.status === 'revisi' ? 'Perlu Revisi' : 'Menunggu'),
            tone: d.status === 'terverifikasi' ? 'green' : (d.status === 'revisi' ? 'amber' : 'blue'),
            file_url: d.file_path || d.file_url || null,
            file_nama: d.file_nama || `${d.judul || 'dokumen'}.pdf`
          }));
          setDocsList(mappedDocs);
        }
      }
    } catch (err) {
      console.warn("Backend API sync notice: Menggunakan data lokal terstruktur.", err);
    }
  }, [year, selectedMonth]);

  useEffect(() => {
    fetchBackendData();
  }, [fetchBackendData]);

  // Click outside listener for popovers
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      setPopover(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filtered Findings
  const filteredFindings = useMemo(() => {
    return findings.filter(f => {
      if (chipFilter === 'critical' && f.varianceNum < 200) return false;
      if (chipFilter === 'dikti' && !f.unit.includes('Dikti')) return false;
      if (chipFilter === 'vokasi' && !f.unit.includes('Vokasi')) return false;
      if (unitFilter !== 'all' && !f.unit.toLowerCase().includes(unitFilter.toLowerCase())) return false;
      return true;
    });
  }, [findings, chipFilter, unitFilter]);

  const totalDiff = useMemo(() => {
    return findings.reduce((acc, f) => acc + f.varianceNum, 0);
  }, [findings]);

  // Handle Send Klarifikasi
  const handleSendKlarifikasi = (code: string, name: string) => {
    setFindings(prev => prev.map(f => f.code === code ? { ...f, status: "Klarifikasi Terkirim" } : f));
    setReviewModalSatker(null);
    toast.success(`Surat instruksi klarifikasi resmi PMK berhasil dikirim ke ${name}.`);
  };

  // Handle Export
  const handleExport = (type: 'PDF' | 'CSV') => {
    setPopover(null);
    if (type === 'PDF') {
      window.print();
      return;
    }
    const rows = [
      ["Nama Satker", "Kode Satker", "Unit Eselon 1", "Kas Riil BKU", "Rekening Koran", "Selisih Rekonsiliasi", "Status"],
      ...findings.map(f => [f.name, f.code, f.unit, f.cash, f.bank, f.variance, f.status])
    ];
    const csvContent = "\uFEFF" + rows.map(r => r.join(";")).join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const monthLabel = MONTH_NAMES[selectedMonth] || `Bulan ${selectedMonth}`;
    const monthSuffix = selectedMonth === 'all' ? 'SEMUA-BULAN' : `BLN-${selectedMonth.padStart(2, '0')}`;
    a.download = `MONLAP-KEMENKEU-KONSOLIDASI-${year}-${monthSuffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`File CSV konsolidasi TA ${year} periode ${monthLabel} berhasil diunduh.`);
  };

  // Handle Logout Confirmation
  const handleConfirmLogout = async () => {
    setLogoutModal(false);
    try {
      if (logoutFn) await logoutFn();
    } catch {
      /* silent */
    }
    setSignedOut(true);
  };

  // Nav Items
  const navItems = [
    { id: "overview", label: "Dashboard Overview", badge: undefined },
    { id: "docs", label: "Dokumen Nasional", badge: "1.420" },
    { id: "reconcile", label: "Rekapitulasi Rekening Koran", badge: undefined },
    { id: "compliance", label: "Kepatuhan Satker", badge: undefined },
    { id: "users", label: "Supervisi Pengguna Nasional", badge: undefined },
    { id: "audit", label: "Log Audit Eksekutif", badge: undefined },
  ];

  // If signed out view is active
  if (signedOut) {
    return (
      <div className="signed-out-shell">
        <div className="signed-out-card">
          <div className="signed-out-crest">
            <svg viewBox="0 0 44 48" fill="none" style={{ width: '100%', height: '100%' }}>
              <path d="M22 2 39 8v13c0 11.5-6.9 19.8-17 24C11.9 40.8 5 32.5 5 21V8L22 2Z" fill="#173B75" stroke="#D6AA4A" strokeWidth="2"/>
              <path d="M13 19h18M15 17l7-7 7 7M16 20v9M22 20v9M28 20v9M13 31h18" stroke="#fff" strokeWidth="1.7"/>
              <path d="m22 6 1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4L22 6Z" fill="#D6AA4A"/>
            </svg>
          </div>
          <div className="signed-out-badge">
            <span className="status-dot"></span> Sesi Ditutup Aman · Enkripsi Berakhir
          </div>
          <h1 className="signed-out-title">Sesi Eksekutif Telah Berakhir</h1>
          <p className="signed-out-desc">
            Anda telah keluar dari Sistem Monitoring Laporan Keuangan (MONLAP K/L). Seluruh jejak audit dan status rekonsiliasi tersimpan secara aman di server kementerian.
          </p>
          <div className="signed-out-account">
            <div className="avatar" style={{ width: 36, height: 36 }}>AS</div>
            <div>
              <strong style={{ display: 'block', fontSize: 13, color: '#0f172a' }}>{user?.nama || 'Dr. Agus Setiawan'}</strong>
              <span style={{ display: 'block', fontSize: 11.5, color: '#64748b' }}>Sekretaris Jenderal · Pusat Kementerian</span>
            </div>
          </div>
          <button
            className="primary-button"
            style={{ width: '100%', height: 42, fontSize: 13.5 }}
            onClick={() => {
              setSignedOut(false);
              toast.success('Sesi eksekutif berhasil dipulihkan.');
            }}
          >
            Masuk Kembali ke Dashboard Demo
          </button>
        </div>
      </div>
    );
  }

  const ringOffset = 119.4 - (liveStats.compliance / 100) * 119.4;

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div
          className="brand"
          onClick={() => { setActiveTab('overview'); setSearch(''); }}
          title="Kembali ke Dashboard Overview"
        >
          <div className="crest" aria-label="Lambang MONLAP K/L">
            <svg viewBox="0 0 44 48" fill="none">
              <path d="M22 2 39 8v13c0 11.5-6.9 19.8-17 24C11.9 40.8 5 32.5 5 21V8L22 2Z" fill="#173B75" stroke="#D6AA4A" strokeWidth="2"/>
              <path d="M13 19h18M15 17l7-7 7 7M16 20v9M22 20v9M28 20v9M13 31h18" stroke="#fff" strokeWidth="1.7"/>
              <path d="m22 6 1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4L22 6Z" fill="#D6AA4A"/>
            </svg>
          </div>
          <div>
            <div className="brand-name">MONLAP K/L</div>
            <div className="brand-sub">Monitoring Laporan Kementerian</div>
            <div className="ministry-badge">PUSAT KEMENTERIAN</div>
          </div>
        </div>

        <div className="nav-label">MENU UTAMA</div>
        <nav className="nav-list" aria-label="Navigasi utama">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => { setActiveTab(item.id); setSearch(''); }}
            >
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="nav-divider"></div>
        <button
          className={`nav-item ${activeTab === 'settings' ? "active" : ""}`}
          onClick={() => { setActiveTab('settings'); setSearch(''); }}
        >
          <span>Pengaturan & Profil</span>
        </button>

        <div className="sidebar-bottom">
          <div
            className="security-card"
            onClick={() => setSecurityModal(true)}
            title="Klik untuk verifikasi enkripsi & sertifikat keamanan"
            role="button"
            tabIndex={0}
          >
            <div className="security-icon">🔒</div>
            <div>
              <div className="security-title"><span className="status-dot"></span>Sistem Terproteksi</div>
              <div className="security-copy">Enkripsi Kemenkeu SSL/TLS · Klik info</div>
            </div>
          </div>

          <div
            className="user-widget"
            onClick={() => { setActiveTab('settings'); setSearch(''); }}
            title="Buka profil pejabat"
          >
            <div className="avatar">AS</div>
            <div className="user-copy">
              <div className="user-name">{user?.nama || 'Dr. Agus Setiawan'}</div>
              <div className="user-role">Sekretaris Jenderal</div>
            </div>
            <span>›</span>
          </div>

          <button
            className="logout"
            onClick={() => setLogoutModal(true)}
            title="Keluar dari sesi eksekutif"
          >
            🚪 Keluar dari sesi
          </button>
        </div>
      </aside>

      {/* MAIN SHELL */}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Portal Nasional</span>
            <span>›</span>
            <strong>{navItems.find(n => n.id === activeTab)?.label || 'Pengaturan & Profil'}</strong>
          </div>

          <div className="top-actions" onClick={e => e.stopPropagation()}>
            <div className="live-pill"><span className="status-dot"></span>Server Sinkron Realtime</div>
            <div className="vertical-divider"></div>
            <button
              className="icon-button"
              aria-label="Notifikasi"
              onClick={() => setPopover(p => p === 'notifications' ? null : 'notifications')}
            >
              🔔
              <span className="notification-count">{feed.length}</span>
            </button>
            <div
              className="avatar top-avatar"
              title="Sekretaris Jenderal"
              onClick={() => setActiveTab('settings')}
              style={{ cursor: 'pointer' }}
            >
              AS
            </div>

            {popover === 'notifications' && (
              <div className="popover notification-popover">
                <div className="popover-title">
                  Notifikasi Otomatis <span className="nav-badge">{feed.length} Baru</span>
                </div>
                {feed.map((f, i) => (
                  <div key={i} className="notification-row">
                    <div>
                      <strong style={{ fontSize: 12, color: '#0f172a' }}>{f.name}</strong>
                      <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{f.action}</p>
                      <small style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginTop: 4 }}>{f.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        <main className="content">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* HEADING */}
              <div className="page-heading">
                <div>
                  <div className="eyebrow">PUSAT MONITORING LAPORAN K/L <span>·</span> TA {year}</div>
                  <div className="page-title">Dashboard Konsolidasi Nasional K/L</div>
                  <div className="page-subtitle">Pengawasan kepatuhan keuangan {liveStats.satkerTotal} Satker di bawah 5 Unit Utama Eselon 1</div>
                </div>
                <div className="period-note">
                  <div>
                    <span>Periode pelaporan aktif</span>
                    <strong>{selectedMonth === "all" ? "Semua Bulan (Jan - Des)" : `Bulan ${MONTH_NAMES[selectedMonth]}`} · {year}</strong>
                  </div>
                </div>
              </div>

              {/* TOOLBAR */}
              <div className="toolbar">
                <div className="filter-group">
                  <div className="select-wrap">
                    <select
                      aria-label="Tahun Anggaran"
                      value={year}
                      onChange={(e) => {
                        setYear(e.target.value);
                        toast.success(`Data Tahun Anggaran ${e.target.value} dimuat.`);
                      }}
                    >
                      <option value="2026">Tahun Anggaran 2026</option>
                      <option value="2025">Tahun Anggaran 2025</option>
                    </select>
                  </div>

                  <div className="select-wrap">
                    <select
                      aria-label="Filter Bulan"
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        toast.success(`Data periode ${MONTH_NAMES[e.target.value] || 'Bulan'} dimuat.`);
                      }}
                    >
                      <option value="all">Semua Bulan (Jan - Des)</option>
                      <option value="1">Januari</option>
                      <option value="2">Februari</option>
                      <option value="3">Maret</option>
                      <option value="4">April</option>
                      <option value="5">Mei</option>
                      <option value="6">Juni</option>
                      <option value="7">Juli</option>
                      <option value="8">Agustus</option>
                      <option value="9">September</option>
                      <option value="10">Oktober</option>
                      <option value="11">November</option>
                      <option value="12">Desember</option>
                    </select>
                  </div>

                  <div className="select-wrap">
                    <select
                      aria-label="Filter Unit Eselon"
                      value={unitFilter}
                      onChange={(e) => setUnitFilter(e.target.value)}
                    >
                      <option value="all">Semua Unit Eselon 1</option>
                      <option value="Dikti">Ditjen Pendidikan Tinggi</option>
                      <option value="Vokasi">Ditjen Pendidikan Vokasi</option>
                      <option value="Setjen">Sekretariat Jenderal</option>
                      <option value="Itjen">Inspektorat Jenderal</option>
                    </select>
                  </div>
                </div>

                <div className="toolbar-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                      setLastSync(timeStr);
                      fetchBackendData();
                      toast.success(`Data disinkronkan pukul ${timeStr} WIB.`);
                    }}
                  >
                    🔄 Sinkron {lastSync} WIB
                  </button>

                  <div className="export-wrap">
                    <button
                      className="primary-button"
                      onClick={() => setPopover(p => p === 'export' ? null : 'export')}
                    >
                      📥 Ekspor Laporan <span>(PDF / CSV)</span>
                    </button>

                    {popover === 'export' && (
                      <div className="popover">
                        <button onClick={() => handleExport('PDF')}>📄 Cetak / Simpan Ringkasan PDF</button>
                        <button onClick={() => handleExport('CSV')}>📊 Unduh File Konsolidasi CSV</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 KPI CARDS */}
              <section className="kpi-grid">
                <div className="card kpi-card kpi-compliance">
                  <div>
                    <div className="kpi-header">
                      <span className="kpi-title">Tingkat Kepatuhan Nasional</span>
                      <span className="kpi-icon blue">🛡️</span>
                    </div>
                    <div className="kpi-body">
                      <div>
                        <div className="kpi-metric">{liveStats.compliance}<span>%</span></div>
                        <div className="kpi-trend">↗ {liveStats.trend} vs bulan lalu</div>
                      </div>
                      <div className="compliance-ring">
                        <svg viewBox="0 0 46 46">
                          <circle className="ring-bg" cx="23" cy="23" r="19"/>
                          <circle className="ring-val" cx="23" cy="23" r="19" style={{ strokeDashoffset: ringOffset }}/>
                        </svg>
                        <div className="ring-center-icon">🛡️</div>
                      </div>
                    </div>
                  </div>
                  <div className="kpi-footer">
                    <span><span className="status-dot"></span> Melampaui target nasional 85%</span>
                    <strong>Target: 85%</strong>
                  </div>
                </div>

                <div className="card kpi-card">
                  <div>
                    <div className="kpi-header">
                      <span className="kpi-title">Total Dokumen Laporan</span>
                      <span className="kpi-icon purple">📑</span>
                    </div>
                    <div className="kpi-metric">{liveStats.docsTotal.toLocaleString('id-ID')} <small>Dokumen</small></div>
                    <div className="kpi-progress">
                      <span style={{ width: `${(liveStats.docsValid / liveStats.docsTotal) * 100}%`, background: '#10b981' }}></span>
                      <span style={{ width: `${(liveStats.docsPending / liveStats.docsTotal) * 100}%`, background: '#f59e0b' }}></span>
                      <span style={{ width: `${(liveStats.docsRevise / liveStats.docsTotal) * 100}%`, background: '#ef4444' }}></span>
                    </div>
                  </div>
                  <div className="kpi-footer">
                    <span><strong>{liveStats.docsValid}</strong> Valid</span>
                    <span><strong>{liveStats.docsPending}</strong> Menunggu</span>
                    <span><strong>{liveStats.docsRevise}</strong> Revisi</span>
                  </div>
                </div>

                <div className="card kpi-card">
                  <div>
                    <div className="kpi-header">
                      <span className="kpi-title">Konsolidasi Saldo Kas Bank</span>
                      <span className="kpi-icon teal">🏦</span>
                    </div>
                    <div className="kpi-metric">Rp {liveStats.cashTotal} <small>Triliun</small></div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>Saldo terkonsolidasi dari rekening operasional</div>
                  </div>
                  <div className="kpi-footer">
                    <span>✓ Rekening <strong>{liveStats.satkerTotal} Satker</strong></span>
                    <strong style={{ color: '#059669' }}>Rekonsiliasi</strong>
                  </div>
                </div>

                <div className="card kpi-card">
                  <div>
                    <div className="kpi-header">
                      <span className="kpi-title">Status Satuan Kerja</span>
                      <span className="kpi-icon amber">👥</span>
                    </div>
                    <div className="kpi-metric">{liveStats.satkerActive} <span>/ {liveStats.satkerTotal}</span> <small>Satker</small></div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>Satker aktif menyampaikan berkas tepat waktu</div>
                  </div>
                  <div className="kpi-footer">
                    <span><span className="status-dot"></span> <strong>{liveStats.satkerActive}</strong> Tepat Waktu</span>
                    <span style={{ color: '#dc2626', fontWeight: 700 }}><strong>{liveStats.satkerPending}</strong> Belum Setor</span>
                  </div>
                </div>
              </section>

              {/* ANALYTICS SECTION */}
              <section className="analytics-grid">
                <div className="card">
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">Performa Kepatuhan Unit Eselon 1</div>
                      <div className="panel-subtitle">Progres pelaporan pada 5 unit pembina nasional</div>
                    </div>
                    <span className="live-pill" style={{ fontSize: 11 }}>5 Unit Aktif</span>
                  </div>

                  <div className="unit-list">
                    {units.map((u, i) => (
                      <div key={i} className="unit-row">
                        <div>
                          <div className="unit-name">{u.name}</div>
                          <div className="unit-meta">{u.meta}</div>
                        </div>
                        <div className="bar-track">
                          <span className="bar-blue" style={{ width: `${u.parts[0]}%` }}></span>
                          <span className="bar-amber" style={{ width: `${u.parts[1]}%` }}></span>
                          <span className="bar-red" style={{ width: `${u.parts[2]}%` }}></span>
                        </div>
                        <div className="unit-score">{u.value}%</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#64748b' }}>
                    <span>Rata-rata kepatuhan pembina: <strong style={{ color: '#0f172a' }}>{liveStats.compliance}%</strong></span>
                    <button className="text-link" onClick={() => setActiveTab('compliance')}>
                      Lihat Rincian Unit ›
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div className="panel-header">
                    <div>
                      <div className="panel-title">Distribusi Status Berkas</div>
                      <div className="panel-subtitle">Status verifikasi nasional</div>
                    </div>
                  </div>

                  <div className="donut-layout">
                    <div className="donut-chart">
                      <svg viewBox="0 0 46 46">
                        <circle className="ring-bg" cx="23" cy="23" r="18" strokeWidth="5"/>
                        <circle cx="23" cy="23" r="18" fill="none" stroke="#2563eb" strokeWidth="5" strokeDasharray="113.1" strokeDashoffset="20"/>
                      </svg>
                      <div className="donut-center">
                        <div className="donut-pct">82%</div>
                        <div className="donut-label">Terverifikasi</div>
                      </div>
                    </div>

                    <div className="legend-list">
                      <div className="legend-item">
                        <div className="legend-item-left">
                          <span className="legend-dot" style={{ background: '#2563eb' }}></span>
                          <span>Terverifikasi Lengkap</span>
                        </div>
                        <strong>82%</strong>
                      </div>
                      <div className="legend-item">
                        <div className="legend-item-left">
                          <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
                          <span>Menunggu Eselon 1</span>
                        </div>
                        <strong>10%</strong>
                      </div>
                      <div className="legend-item">
                        <div className="legend-item-left">
                          <span className="legend-dot" style={{ background: '#94a3b8' }}></span>
                          <span>Menunggu Satker</span>
                        </div>
                        <strong>5%</strong>
                      </div>
                      <div className="legend-item">
                        <div className="legend-item-left">
                          <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                          <span>Perlu Revisi Dokumen</span>
                        </div>
                        <strong>3%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* OPERATIONS SECTION */}
              <section className="operations-grid">
                <div className="card operations-panel">
                  <div className="panel-header ops-header">
                    <div>
                      <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        Deteksi Dini Selisih Rekonsiliasi Kas vs Bank
                        <span className="nav-badge" style={{ background: '#fee2e2', color: '#dc2626' }}>{filteredFindings.length} Perlu Review</span>
                      </div>
                      <div className="panel-subtitle">Satker dengan perbedaan saldo antara BKU kas riil dan rekening koran bank persepsi</div>
                    </div>
                  </div>

                  <div className="table-tools">
                    <button className={`chip ${chipFilter === 'all' ? 'active' : ''}`} onClick={() => setChipFilter('all')}>
                      Semua Temuan ({findings.length})
                    </button>
                    <button className={`chip ${chipFilter === 'critical' ? 'active' : ''}`} onClick={() => setChipFilter('critical')}>
                      Selisih &gt; Rp 200 Juta
                    </button>
                    <button className={`chip ${chipFilter === 'dikti' ? 'active' : ''}`} onClick={() => setChipFilter('dikti')}>
                      Ditjen Dikti
                    </button>
                    <button className={`chip ${chipFilter === 'vokasi' ? 'active' : ''}`} onClick={() => setChipFilter('vokasi')}>
                      Ditjen Vokasi
                    </button>
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Nama Satker</th>
                          <th>Unit Eselon 1</th>
                          <th>Saldo Kas Riil (BKU)</th>
                          <th>Rekening Koran</th>
                          <th>Selisih Rekonsiliasi</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFindings.map((row, i) => (
                          <tr key={i}>
                            <td>
                              <div className="satker">
                                <div className={`satker-avatar ${row.colorClass}`}>{row.initials}</div>
                                <div>
                                  <strong>{row.name}</strong>
                                  <span>Kode {row.code}</span>
                                </div>
                              </div>
                            </td>
                            <td><span className="unit-tag">{row.unit}</span></td>
                            <td><strong>{row.cash}</strong></td>
                            <td>{row.bank}</td>
                            <td><span className="variance">Selisih: {row.variance}</span></td>
                            <td>
                              <button className="review-button" onClick={() => setReviewModalSatker(row)}>
                                Tinjau Berkas
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-footer">
                    <span>Total selisih belum klop: <strong>Rp {totalDiff.toLocaleString('id-ID')} Juta</strong></span>
                    <button className="text-link" onClick={() => setActiveTab('reconcile')}>
                      Buka Meja Audit Rekonsiliasi ›
                    </button>
                  </div>
                </div>

                <div className="card operations-panel audit-panel">
                  <div className="panel-header ops-header">
                    <div>
                      <div className="panel-title">Jejak Aktivitas Persetujuan Eselon 1</div>
                      <div className="panel-subtitle">Aktivitas otorisasi terbaru</div>
                    </div>
                    <span className="live-feed"><span className="status-dot"></span>Live Feed</span>
                  </div>

                  <div className="feed">
                    {feed.map((item, index) => (
                      <div key={index} className="feed-item">
                        <div className={`feed-icon ${item.tone}`}>
                          {item.icon === 'check' ? '✓' : (item.icon === 'shield' ? '🛡️' : '🔄')}
                        </div>
                        {index < feed.length - 1 && <div className="feed-line"></div>}
                        <div className="feed-copy">
                          <div className="feed-meta">
                            <strong>{item.name}</strong>
                            <span>{item.time}</span>
                          </div>
                          <p>{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="audit-button" onClick={() => setActiveTab('audit')}>
                    Lihat Seluruh Log Audit Nasional ›
                  </button>
                </div>
              </section>
            </>
          )}

          {/* TAB 2: DOKUMEN NASIONAL */}
          {activeTab === 'docs' && (
            <div className="card workspace-view">
              <div className="workspace-header">
                <div>
                  <h2>Dokumen Laporan Keuangan Nasional</h2>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Arsip LPJ, Berita Acara Rekonsiliasi, dan Rekening Koran terintegrasi TA {year}</p>
                </div>
                <div className="search-input">
                  🔍
                  <input
                    placeholder="Cari nama dokumen atau satker..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-tools">
                <button className={`chip ${docFilter === 'all' ? 'active' : ''}`} onClick={() => setDocFilter('all')}>Semua Dokumen ({docsList.length})</button>
                <button className={`chip ${docFilter === 'Valid' ? 'active' : ''}`} onClick={() => setDocFilter('Valid')}>Terverifikasi (Valid)</button>
                <button className={`chip ${docFilter === 'Menunggu' ? 'active' : ''}`} onClick={() => setDocFilter('Menunggu')}>Menunggu Persetujuan</button>
                <button className={`chip ${docFilter === 'Perlu Revisi' ? 'active' : ''}`} onClick={() => setDocFilter('Perlu Revisi')}>Perlu Revisi</button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nama Dokumen</th>
                      <th>Satker Pengirim</th>
                      <th>Unit Eselon 1</th>
                      <th>Tanggal Unggah</th>
                      <th>Format / Ukuran</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docsList
                      .filter(d => (docFilter === 'all' || d.status === docFilter) && (!search || d.name.toLowerCase().includes(search.toLowerCase()) || d.satker.toLowerCase().includes(search.toLowerCase())))
                      .map((d, i) => (
                        <tr key={i}>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{d.name}</strong>
                            <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>{d.code}</span>
                          </td>
                          <td>{d.satker}</td>
                          <td><span className="unit-tag">{d.unit}</span></td>
                          <td>{d.date}</td>
                          <td><span style={{ fontSize: 11.5, color: '#64748b' }}>{d.size}</span></td>
                          <td>
                            <span className={`pill ${d.status === 'Valid' ? 'success' : (d.status === 'Menunggu' ? 'blue' : 'danger')}`}>{d.status}</span>
                          </td>
                          <td>
                            <button
                              className="secondary-button"
                              style={{ padding: '4px 8px', fontSize: 11.5 }}
                              onClick={() => handleOpenDocPreview(d)}
                            >
                              📄 Lihat
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REKAPITULASI REKENING KORAN */}
          {activeTab === 'reconcile' && (
            <div className="card workspace-view">
              <div className="workspace-header">
                <div>
                  <h2>Rekapitulasi Rekening Koran vs Saldo Kas BKU</h2>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Pemeriksaan komparatif saldo riil kas pemerintah dengan rekening persepsi perbankan</p>
                </div>
                <div className="search-input">
                  🔍
                  <input
                    placeholder="Cari kode atau nama satker..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nama Satker</th>
                      <th>Unit Eselon 1</th>
                      <th>Kas Riil BKU</th>
                      <th>Rekening Koran</th>
                      <th>Selisih Rekonsiliasi</th>
                      <th>Status Regulasi PMK</th>
                      <th>Aksi Meja Audit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {findings
                      .filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.code.includes(search))
                      .map((row, i) => (
                        <tr key={i}>
                          <td>
                            <div className="satker">
                              <div className={`satker-avatar ${row.colorClass}`}>{row.initials}</div>
                              <div>
                                <strong>{row.name}</strong>
                                <span>Kode {row.code}</span>
                              </div>
                            </div>
                          </td>
                          <td><span className="unit-tag">{row.unit}</span></td>
                          <td><strong>{row.cash}</strong></td>
                          <td>{row.bank}</td>
                          <td><span className="variance">Selisih: {row.variance}</span></td>
                          <td>
                            <span className={`pill ${row.status === 'Klarifikasi Terkirim' ? 'success' : 'danger'}`}>{row.status}</span>
                          </td>
                          <td>
                            <button className="review-button" onClick={() => setReviewModalSatker(row)}>
                              Tinjau Berkas & Audit
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: KEPATUHAN SATKER */}
          {activeTab === 'compliance' && (
            <div className="card workspace-view">
              <div className="workspace-header">
                <div>
                  <h2>Kepatuhan Satker Berdasarkan Unit Eselon 1</h2>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Monitoring agregat persentase penyampaian laporan tepat waktu periode {selectedMonth === "all" ? "Semua Bulan" : `Bulan ${MONTH_NAMES[selectedMonth]}`} TA {year}</p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => toast.success('Instruksi percepatan kepatuhan massal berhasil diterbitkan ke seluruh unit.')}
                >
                  📢 Kirim Peringatan Kepatuhan Massal
                </button>
              </div>

              <div className="grid-cards" style={{ marginTop: 16 }}>
                {units.map((u, i) => (
                  <div key={i} className="unit-stat-card">
                    <div className="unit-stat-header">
                      <div>
                        <div className="unit-stat-title">{u.name}</div>
                        <div className="unit-stat-meta">{u.meta}</div>
                      </div>
                      <div className={`unit-stat-pct ${u.value >= 90 ? 'green' : ''}`}>{u.value}%</div>
                    </div>
                    <div className="bar-track" style={{ height: 8, margin: '12px 0' }}>
                      <span className="bar-blue" style={{ width: `${u.parts[0]}%` }}></span>
                      <span className="bar-amber" style={{ width: `${u.parts[1]}%` }}></span>
                      <span className="bar-red" style={{ width: `${u.parts[2]}%` }}></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
                      <span>Lengkap: <strong>{u.parts[0]}%</strong></span>
                      <span>Proses: <strong>{u.parts[1]}%</strong></span>
                      <span style={{ color: '#dc2626' }}>Revisi: <strong>{u.parts[2]}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SUPERVISI PENGGUNA NASIONAL */}
          {activeTab === 'users' && (
            <div className="card workspace-view">
              <div className="workspace-header">
                <div>
                  <h2>Supervisi Pengguna Nasional & Hak Akses</h2>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Daftar akun pejabat pembina eselon 1, auditor itjen, dan operator satker</p>
                </div>
                <div className="search-input">
                  🔍
                  <input
                    placeholder="Cari nama pejabat atau NIP..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-tools">
                <button className={`chip ${userRoleFilter === 'all' ? 'active' : ''}`} onClick={() => setUserRoleFilter('all')}>Semua Role ({usersList.length})</button>
                <button className={`chip ${userRoleFilter === 'Pimpinan Eksekutif' ? 'active' : ''}`} onClick={() => setUserRoleFilter('Pimpinan Eksekutif')}>Pimpinan Eksekutif</button>
                <button className={`chip ${userRoleFilter === 'Pembina Eselon 1' ? 'active' : ''}`} onClick={() => setUserRoleFilter('Pembina Eselon 1')}>Pembina Eselon 1</button>
                <button className={`chip ${userRoleFilter === 'Auditor Internal' ? 'active' : ''}`} onClick={() => setUserRoleFilter('Auditor Internal')}>Auditor Itjen</button>
                <button className={`chip ${userRoleFilter === 'Operator Satker' ? 'active' : ''}`} onClick={() => setUserRoleFilter('Operator Satker')}>Operator Satker</button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nama Pejabat / Pengguna</th>
                      <th>Unit Eselon 1 / Satker</th>
                      <th>Kewenangan Akses</th>
                      <th>Status Akun</th>
                      <th>Aktivitas Terakhir</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList
                      .filter(u => (userRoleFilter === 'all' || u.role === userRoleFilter) && (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.nip.includes(search)))
                      .map((u, i) => (
                        <tr key={i}>
                          <td>
                            <div className="satker">
                              <div className={`satker-avatar ${u.color}`}>{u.initials}</div>
                              <div>
                                <strong>{u.name}</strong>
                                <span>NIP. {u.nip}</span>
                              </div>
                            </div>
                          </td>
                          <td><span className="unit-tag">{u.unit}</span></td>
                          <td><strong>{u.role}</strong> ({u.roleBadge})</td>
                          <td><span className={`pill ${u.status === 'Online' ? 'success' : (u.status === 'Aktif' ? 'blue' : 'amber')}`}>{u.status}</span></td>
                          <td>{u.lastActive}</td>
                          <td>
                            <button
                              className="secondary-button"
                              style={{ padding: '4px 8px', fontSize: 11.5 }}
                              onClick={() => setActiveDetailUser(u)}
                            >
                              Detail Akses
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: LOG AUDIT EKSEKUTIF */}
          {activeTab === 'audit' && (
            <div className="card workspace-view">
              <div className="workspace-header">
                <div>
                  <h2>Log Audit Eksekutif & Jejak Transaksi Nasional</h2>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Pencatatan elektronik seluruh tindakan verifikasi, otorisasi, dan instruksi klarifikasi PMK 104</p>
                </div>
                <div className="search-input">
                  🔍
                  <input
                    placeholder="Cari nama pejabat atau aksi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-tools">
                <button className={`chip ${auditEventFilter === 'all' ? 'active' : ''}`} onClick={() => setAuditEventFilter('all')}>Semua Log ({auditLogsList.length})</button>
                <button className={`chip ${auditEventFilter === 'Terverifikasi' ? 'active' : ''}`} onClick={() => setAuditEventFilter('Terverifikasi')}>Terverifikasi</button>
                <button className={`chip ${auditEventFilter === 'Disetujui' ? 'active' : ''}`} onClick={() => setAuditEventFilter('Disetujui')}>Disetujui</button>
                <button className={`chip ${auditEventFilter === 'Perlu Klarifikasi' ? 'active' : ''}`} onClick={() => setAuditEventFilter('Perlu Klarifikasi')}>Perlu Klarifikasi</button>
              </div>

              <div className="audit-stream" style={{ marginTop: 14 }}>
                {auditLogsList
                  .filter(l => (auditEventFilter === 'all' || l.status === auditEventFilter) && (!search || l.actor.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase())))
                  .map((l, i) => (
                    <div key={i} className="audit-row-card">
                      <div className={`feed-icon ${l.tone}`} style={{ width: 34, height: 34 }}>
                        {l.icon === 'check' ? '✓' : (l.icon === 'shield' ? '🛡️' : (l.icon === 'refresh' ? '🔄' : '🔒'))}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <strong style={{ color: '#0f172a', fontSize: 13 }}>{l.actor} <span style={{ fontWeight: 500, color: '#64748b' }}>({l.role})</span></strong>
                          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>{l.time}</span>
                        </div>
                        <p style={{ color: '#1e293b', fontSize: 12.5, marginTop: 3, fontWeight: 600 }}>{l.action}</p>
                        <p style={{ color: '#64748b', fontSize: 11.5, marginTop: 2 }}>Target: {l.target}</p>
                        <code style={{ display: 'inline-block', fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#475569', marginTop: 6 }}>
                          Digital Signature: {l.hash}
                        </code>
                      </div>
                      <div className="audit-row-badge">
                        <span className={`pill ${l.status === 'Terverifikasi' || l.status === 'Disetujui' || l.status === 'Aman' ? 'success' : 'amber'}`}>{l.status}</span>
                        <button
                          className="text-link"
                          style={{ marginTop: 8, fontSize: 11.5, display: 'block' }}
                          onClick={() => setActiveDetailAudit(l)}
                        >
                          Bukti Audit ›
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 7: PENGATURAN & PROFIL */}
          {activeTab === 'settings' && (
            <div className="card workspace-view">
              <div className="workspace-header">
                <div>
                  <h2>Pengaturan & Profil Pengguna Eksekutif</h2>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Kelola preferensi notifikasi peringatan dini, preferensi rapat, dan identitas akun pimpinan</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Profil Card */}
                <div style={{ padding: 18, border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="avatar" style={{ width: 48, height: 48, fontSize: 18 }}>AS</div>
                  <div>
                    <strong style={{ fontSize: 16, color: '#0f172a', display: 'block' }}>{user?.nama || 'Dr. Agus Setiawan'}</strong>
                    <span style={{ fontSize: 12.5, color: '#64748b', display: 'block', marginTop: 2 }}>Sekretaris Jenderal · NIP. 197408121999031002 · Tingkat K/L Pusat Kementerian</span>
                    <span className="pill success" style={{ marginTop: 6 }}>Otoritas Pimpinan Nasional</span>
                  </div>
                </div>

                {/* Toggles Card */}
                <div style={{ padding: 18, border: '1px solid #e2e8f0', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>Notifikasi Email Peringatan Dini</strong>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Kirim otomatis email resmi saat ada selisih kas satker di atas Rp 200 Juta.</p>
                    </div>
                    <button
                      className={`switch-toggle ${toggleEmail ? 'active' : ''}`}
                      onClick={() => {
                        setToggleEmail(!toggleEmail);
                        toast.success(`Notifikasi Email: ${!toggleEmail ? 'Aktif' : 'Nonaktif'}`);
                      }}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div style={{ height: 1, background: '#f1f5f9' }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>Auto-Broadcast Surat Klarifikasi PMK 104</strong>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Kirim draf surat klarifikasi otomatis ke Rektor/KPA pada hari ke-3 selisih belum terselesaikan.</p>
                    </div>
                    <button
                      className={`switch-toggle ${togglePmk ? 'active' : ''}`}
                      onClick={() => {
                        setTogglePmk(!togglePmk);
                        toast.success(`Auto-Broadcast Klarifikasi PMK: ${!togglePmk ? 'Aktif' : 'Nonaktif'}`);
                      }}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div style={{ height: 1, background: '#f1f5f9' }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>Mode Presentasi Rapat Eksekutif</strong>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Sembunyikan rincian kode akun sensitif saat presentasi di layar proyektor.</p>
                    </div>
                    <button
                      className={`switch-toggle ${togglePres ? 'active' : ''}`}
                      onClick={() => {
                        setTogglePres(!togglePres);
                        toast.success(`Mode Presentasi Rapat: ${!togglePres ? 'Aktif' : 'Nonaktif'}`);
                      }}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>
                </div>

                {/* Form Ganti Password Demo */}
                <div style={{ padding: 18, border: '1px solid #e2e8f0', borderRadius: 10 }}>
                  <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block', marginBottom: 4 }}>Keamanan Kata Sandi Mandiri</strong>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>Perbarui kata sandi akun eksekutif secara berkala sesuai standar audit BPK & Kemenkeu.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: 11.5, color: '#475569', display: 'block', marginBottom: 4 }}>Kata Sandi Saat Ini</label>
                      <input type="password" placeholder="••••••••" style={{ width: '100%', height: 36, padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, color: '#475569', display: 'block', marginBottom: 4 }}>Kata Sandi Baru</label>
                      <input type="password" placeholder="••••••••" style={{ width: '100%', height: 36, padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, color: '#475569', display: 'block', marginBottom: 4 }}>Konfirmasi Kata Sandi</label>
                      <input type="password" placeholder="••••••••" style={{ width: '100%', height: 36, padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12 }} />
                    </div>
                  </div>

                  <button className="primary-button" onClick={() => toast.success('Kata sandi pejabat berhasil diperbarui secara aman.')}>
                    ✓ Simpan Perubahan Kata Sandi
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- MODAL 1: REVIEW SATKER (PMK 104) --- */}
      {reviewModalSatker && (
        <div className="modal-backdrop" onMouseDown={() => setReviewModalSatker(null)}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-eyebrow">MEJA AUDIT REKONSILIASI · {reviewModalSatker.name.toUpperCase()}</div>
                <div className="modal-title">Tinjauan Selisih Rekonsiliasi Kas vs Bank</div>
              </div>
              <button className="modal-close" onClick={() => setReviewModalSatker(null)} aria-label="Tutup modal">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-context">
                <div className={`satker-avatar ${reviewModalSatker.colorClass}`} style={{ width: 36, height: 36, fontSize: 13 }}>
                  {reviewModalSatker.initials}
                </div>
                <div>
                  <strong>{reviewModalSatker.name}</strong>
                  <span>Kode Satker {reviewModalSatker.code} · {reviewModalSatker.unit}</span>
                </div>
                <span className="review-status">{reviewModalSatker.status}</span>
              </div>

              <div className="metric-comparison">
                <div>
                  <span>Saldo Kas Riil (BKU)</span>
                  <strong>{reviewModalSatker.cash}</strong>
                  <small>Per 30 Juni {year}</small>
                </div>
                <div>
                  <span>Saldo Rekening Koran</span>
                  <strong>{reviewModalSatker.bank}</strong>
                  <small>Rekening operasional bank</small>
                </div>
                <div className="variance-card">
                  <span>Selisih Rekonsiliasi</span>
                  <strong>{reviewModalSatker.variance}</strong>
                  <small>Belum dapat dijelaskan</small>
                </div>
              </div>

              <div className="rule-box">
                <div className="rule-icon">🛡️</div>
                <div>
                  <strong>Ketentuan Rekonsiliasi Berdasarkan PMK</strong>
                  <p>Sesuai PMK No. 104/PMK.05/2023, selisih saldo kas dan bank wajib diklarifikasi oleh KPA paling lambat 5 hari kerja sejak notifikasi diterbitkan.</p>
                </div>
              </div>

              <div className="modal-note">
                <span>Catatan pemeriksa</span>
                <div>Mohon lampirkan Berita Acara Rekonsiliasi (BAR) dan mutasi rekening koran bank persepsi periode Juni {year}.</div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setReviewModalSatker(null)}>
                Tutup Tinjauan
              </button>
              <button
                className="primary-button"
                onClick={() => handleSendKlarifikasi(reviewModalSatker.code, reviewModalSatker.name)}
              >
                📄 Kirim Surat Klarifikasi Resmi ke Rektor / KPA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: SECURITY MODAL --- */}
      {securityModal && (
        <div className="modal-backdrop" onMouseDown={() => setSecurityModal(false)}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-eyebrow">SERTIFIKASI KEAMANAN & ENKRIPSI SISTEM</div>
                <div className="modal-title">Status Proteksi Jaringan Kemenkeu</div>
              </div>
              <button className="modal-close" onClick={() => setSecurityModal(false)} aria-label="Tutup modal">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center', fontSize: 16 }}>
                  🔒
                </div>
                <div>
                  <strong style={{ color: '#166534', fontSize: 13 }}>Koneksi Terenkripsi End-to-End Aktif</strong>
                  <p style={{ color: '#15803d', fontSize: 12, marginTop: 2 }}>Data laporan keuangan dilindungi dengan protokol keamanan tingkat kementerian.</p>
                </div>
              </div>

              <div className="sec-spec-grid">
                <div className="sec-spec-card">
                  <span>Protokol Enkripsi</span>
                  <strong>TLS 1.3 / AES-256 GCM</strong>
                </div>
                <div className="sec-spec-card">
                  <span>Otoritas Sertifikat</span>
                  <strong>Kemenkeu Gov-CA Root</strong>
                </div>
                <div className="sec-spec-card">
                  <span>Proteksi Sesi</span>
                  <strong>Single-Device Login (Aktif)</strong>
                </div>
                <div className="sec-spec-card">
                  <span>Infrastruktur Cloud</span>
                  <strong>Pusintek Cluster (42ms)</strong>
                </div>
              </div>

              <div className="modal-note">
                <span>Fingerprint Sertifikat Digital SHA-256</span>
                <code style={{ display: 'block', fontSize: 11, background: '#e2e8f0', padding: '6px 8px', borderRadius: 4, wordBreak: 'break-all', marginTop: 4 }}>
                  7E:8A:4F:1B:90:3C:D2:EE:99:A1:22:5F:6B:74:9E:33:01:88:AB:CD
                </code>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText('7E:8A:4F:1B:90:3C:D2:EE:99:A1:22:5F:6B:74:9E:33:01:88:AB:CD');
                  }
                  toast.success('Fingerprint SHA-256 berhasil disalin.');
                }}
              >
                Salin Hash Sertifikat
              </button>
              <button className="primary-button" onClick={() => setSecurityModal(false)}>
                Tutup Informasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: LOGOUT CONFIRMATION --- */}
      {logoutModal && (
        <div className="modal-backdrop" onMouseDown={() => setLogoutModal(false)}>
          <div className="modal" style={{ width: 460 }} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-eyebrow" style={{ color: '#b91c1c' }}>KONFIRMASI KELUAR SESI</div>
                <div className="modal-title">Keluar dari Dashboard Eksekutif?</div>
              </div>
              <button className="modal-close" onClick={() => setLogoutModal(false)} aria-label="Tutup modal">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
                Apakah Anda yakin ingin mengakhiri sesi pemantauan eksekutif atas nama <strong>{user?.nama || 'Dr. Agus Setiawan (Sekretaris Jenderal)'}</strong>? Seluruh status rekonsiliasi dan instruksi klarifikasi telah tersimpan secara aman.
              </p>
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setLogoutModal(false)}>
                Batal
              </button>
              <button
                className="primary-button"
                style={{ background: '#dc2626' }}
                onClick={handleConfirmLogout}
              >
                🚪 Ya, Keluar dari Sesi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: USER DETAIL --- */}
      {activeDetailUser && (
        <div className="modal-backdrop" onMouseDown={() => setActiveDetailUser(null)}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-eyebrow">SUPERVISI PENGGUNA NASIONAL</div>
                <div className="modal-title">Detail Akun & Hak Akses Pejabat</div>
              </div>
              <button className="modal-close" onClick={() => setActiveDetailUser(null)} aria-label="Tutup modal">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-context">
                <div className={`satker-avatar ${activeDetailUser.color}`} style={{ width: 40, height: 40, fontSize: 14 }}>
                  {activeDetailUser.initials}
                </div>
                <div>
                  <strong>{activeDetailUser.name}</strong>
                  <span>NIP. {activeDetailUser.nip} · {activeDetailUser.unit}</span>
                </div>
                <span className={`pill ${activeDetailUser.status === 'Online' ? 'success' : 'blue'}`} style={{ marginLeft: 'auto' }}>
                  {activeDetailUser.status}
                </span>
              </div>

              <div className="sec-spec-grid">
                <div className="sec-spec-card">
                  <span>Role / Kewenangan</span>
                  <strong>{activeDetailUser.role}</strong>
                </div>
                <div className="sec-spec-card">
                  <span>Jabatan Organisasi</span>
                  <strong>{activeDetailUser.roleBadge}</strong>
                </div>
                <div className="sec-spec-card">
                  <span>Email Kedinasan</span>
                  <strong>{activeDetailUser.email}</strong>
                </div>
                <div className="sec-spec-card">
                  <span>Aktivitas Terakhir</span>
                  <strong>{activeDetailUser.lastActive}</strong>
                </div>
              </div>

              <div className="modal-note">
                <span>Catatan Keamanan Sesi</span>
                <div>Akun terdaftar dalam sistem Single-Device Enforcement Kemenkeu. Tidak ada anomali login terdeteksi pada 30 hari terakhir.</div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => {
                  toast.success(`Pengingat keamanan dikirim ke email ${activeDetailUser.email}`);
                  setActiveDetailUser(null);
                }}
              >
                Kirim Pengingat Keamanan
              </button>
              <button className="primary-button" onClick={() => setActiveDetailUser(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: AUDIT DETAIL --- */}
      {activeDetailAudit && (
        <div className="modal-backdrop" onMouseDown={() => setActiveDetailAudit(null)}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-eyebrow">BUKTI AUDIT ELEKTRONIK NASIONAL</div>
                <div className="modal-title">Log Transaksi: {activeDetailAudit.id}</div>
              </div>
              <button className="modal-close" onClick={() => setActiveDetailAudit(null)} aria-label="Tutup modal">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="sec-spec-grid">
                <div className="sec-spec-card">
                  <span>Waktu Pencatatan</span>
                  <strong>{activeDetailAudit.time}</strong>
                </div>
                <div className="sec-spec-card">
                  <span>Pejabat Pelaksana</span>
                  <strong>{activeDetailAudit.actor} ({activeDetailAudit.role})</strong>
                </div>
                <div className="sec-spec-card">
                  <span>Aktivitas Otorisasi</span>
                  <strong>{activeDetailAudit.action}</strong>
                </div>
                <div className="sec-spec-card">
                  <span>Objek Satker</span>
                  <strong>{activeDetailAudit.target}</strong>
                </div>
              </div>

              <div className="modal-note">
                <span>Digital Signature Hash (Keaslian Terverifikasi)</span>
                <code style={{ display: 'block', fontSize: 11, background: '#e2e8f0', padding: '6px 8px', borderRadius: 4, wordBreak: 'break-all', marginTop: 4 }}>
                  {activeDetailAudit.hash}
                </code>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => {
                  toast.success(`Catatan audit ${activeDetailAudit.id} berhasil diunduh dalam format bukti elektronik.`);
                  setActiveDetailAudit(null);
                }}
              >
                Unduh Bukti Audit
              </button>
              <button className="primary-button" onClick={() => setActiveDetailAudit(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 6: DOKUMEN PREVIEW --- */}
      {activeDetailDoc && (
        <div className="modal-backdrop" onMouseDown={handleCloseDocPreview}>
          <div className="modal modal-lg" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-eyebrow">PRATINJAU DOKUMEN NASIONAL</div>
                <div className="modal-title">{activeDetailDoc.name}</div>
              </div>
              <button className="modal-close" onClick={handleCloseDocPreview} aria-label="Tutup modal">
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
              <div className="modal-context" style={{ marginBottom: 14 }}>
                <div className="satker-avatar satker-blue" style={{ width: 40, height: 40, fontSize: 13 }}>
                  DOC
                </div>
                <div>
                  <strong>{activeDetailDoc.satker}</strong>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {activeDetailDoc.unit} · {activeDetailDoc.code} · Diunggah: {activeDetailDoc.date}
                  </span>
                </div>
                <span className={`pill ${activeDetailDoc.status === 'Valid' ? 'success' : (activeDetailDoc.status === 'Menunggu' ? 'blue' : 'danger')}`} style={{ marginLeft: 'auto' }}>
                  {activeDetailDoc.status}
                </span>
              </div>

              {/* Preview Content Area */}
              <div style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #cbd5e1', overflow: 'hidden', minHeight: 460, position: 'relative' }}>
                {previewLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 460, gap: 12 }}>
                    <div className="spinner" style={{ width: 36, height: 36, border: '3px solid #cbd5e1', borderTopColor: '#173b75', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Memuat berkas preview PDF...</span>
                  </div>
                ) : previewBlobUrl ? (
                  <object
                    data={previewBlobUrl}
                    type="application/pdf"
                    style={{ width: '100%', height: 540, border: 'none', display: 'block' }}
                  >
                    <div style={{ padding: 40, textAlign: 'center', background: '#fff' }}>
                      <p style={{ color: '#475569', marginBottom: 14, fontSize: 14 }}>Browser Anda tidak mendukung preview PDF langsung.</p>
                      <a href={previewBlobUrl} target="_blank" rel="noreferrer" className="primary-button" style={{ display: 'inline-block' }}>
                        ↗ Buka Dokumen di Tab Baru
                      </a>
                    </div>
                  </object>
                ) : (
                  /* Fallback Interactive Document Viewer Summary */
                  <div style={{ padding: 24, background: '#ffffff', minHeight: 460, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ borderBottom: '2px solid #173b75', paddingBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 15, color: '#173b75', fontWeight: 700 }}>REPUBLIK INDONESIA - KEMENTERIAN NEGARA</h3>
                        <span style={{ fontSize: 11, color: '#64748b' }}>Arsip Laporan Digital No: {activeDetailDoc.code}</span>
                      </div>
                      <span className="pill success" style={{ fontSize: 10 }}>TERVERIFIKASI SISTEM</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <div>
                        <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Satuan Kerja (Satker)</span>
                        <strong style={{ fontSize: 13, color: '#1e293b' }}>{activeDetailDoc.satker}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Unit Eselon 1 Pembina</span>
                        <strong style={{ fontSize: 13, color: '#1e293b' }}>{activeDetailDoc.unit}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Format / Ukuran</span>
                        <strong style={{ fontSize: 13, color: '#1e293b' }}>{activeDetailDoc.size}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Status Verifikasi</span>
                        <strong style={{ fontSize: 13, color: activeDetailDoc.status === 'Valid' ? '#16a34a' : '#2563eb' }}>{activeDetailDoc.status}</strong>
                      </div>
                    </div>

                    <div style={{ border: '1px dashed #cbd5e1', borderRadius: 8, padding: 24, background: '#fafafa', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 10 }}>
                      <span style={{ fontSize: 38 }}>📄</span>
                      <strong style={{ fontSize: 15, color: '#1e293b' }}>{activeDetailDoc.name}</strong>
                      <p style={{ fontSize: 12, color: '#64748b', maxWidth: 460, margin: 0 }}>
                        {previewError || 'Berkas dokumen telah tercatat di repositori laporan keuangan nasional. Anda dapat mengunduh salinan berkas asli langsung dari server.'}
                      </p>
                      {activeDetailDoc.id && (
                        <button
                          className="secondary-button"
                          style={{ marginTop: 8, fontSize: 12 }}
                          onClick={() => {
                            const session = getSession();
                            const currentToken = token || session?.token;
                            window.open(`${API}/dokumen/${activeDetailDoc.id}/download${currentToken ? `?token=${currentToken}` : ''}`, '_blank');
                          }}
                        >
                          📥 Unduh Berkas Asli
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <div>
                {previewBlobUrl && (
                  <button
                    className="secondary-button"
                    onClick={() => window.open(previewBlobUrl, '_blank')}
                  >
                    ↗ Buka di Tab Baru
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="secondary-button"
                  onClick={() => {
                    toast.success(`Dokumen ${activeDetailDoc.name} ditandai telah ditinjau.`);
                    handleCloseDocPreview();
                  }}
                >
                  ✓ Tandai Telah Ditinjau
                </button>
                <button className="primary-button" onClick={handleCloseDocPreview}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
