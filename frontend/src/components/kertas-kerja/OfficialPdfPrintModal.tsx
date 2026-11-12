"use client";

import React, { useState } from "react";
import { Printer, X, FileSpreadsheet } from "lucide-react";
import clsx from "clsx";

const BULAN_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const formatRupiah = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export interface OfficialPdfPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  rumus: any;
  submission: any;
  nominalMap: Record<number, number>;
  satkerNama?: string;
  satkerKode?: string;
  tahun: number;
  bulan: number;
}

export default function OfficialPdfPrintModal({
  isOpen,
  onClose,
  rumus,
  submission,
  nominalMap,
  satkerNama,
  satkerKode,
  tahun,
  bulan,
}: OfficialPdfPrintModalProps) {
  // State Parameter Dokumen Berita Acara
  const [kotaDokumen, setKotaDokumen] = useState("Jakarta");
  const [tanggalDokumen, setTanggalDokumen] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  });
  const [namaBendahara, setNamaBendahara] = useState("Ahmad Fauzi, S.E., M.Ak.");
  const [nipBendahara, setNipBendahara] = useState("19850412 200812 1 002");
  const [namaKPA, setNamaKPA] = useState("Dr. Ir. Hendra Saputra, M.Si.");
  const [nipKPA, setNipKPA] = useState("19740815 199903 1 001");

  if (!isOpen || !rumus || !submission) return null;

  const saldoAwal = Number(submission.saldo_awal) || 0;
  const totalPenambah = Number(submission.total_penambah) || 0;
  const totalPengurang = Number(submission.total_pengurang) || 0;
  const saldoAkhir = Number(submission.saldo_akhir) || 0;
  const statusAudit = (submission.status || "DRAFT").toUpperCase();

  const finalSatkerNama = satkerNama || submission.satker_nama || "KANTOR SATUAN KERJA";
  const finalSatkerKode = satkerKode || submission.satker_kode || "000000";

  return (
    <>
      {/* STYLE KHUSUS PRINT A4 & MULTI-PAGE AGAR TIDAK TERPOTONG */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 12mm 12mm;
          }
          html, body, #__next, main, div[class*="overflow-"] {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          header, nav, aside, footer, [role="navigation"], .no-print {
            display: none !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* MODAL DIALOG PENGATURAN CETAK (HANYA DITAMPILKAN DI LAYAR) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 no-print print:hidden">
        <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
          {/* Header Modal */}
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Cetak Berita Acara & Lembar Kertas Kerja
                </h3>
                <p className="text-[11px] text-slate-500">
                  {finalSatkerNama} &bull; Periode {BULAN_NAMES[bulan - 1]} {tahun}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Parameter Dokumen */}
          <div className="p-6 space-y-4">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 text-xs text-blue-900 leading-relaxed">
              <span className="font-bold block mb-0.5">Format Dokumen Cetak Kedinasan:</span>
              Dokumen akan dicetak ke ukuran kertas <strong>A4 Portrait</strong> ber-Kop resmi dengan rincian akun, subtotal, kesimpulan rekonsiliasi kas, dan lembar tanda tangan ganda.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Kota Tempat Dokumen:
                </label>
                <input
                  type="text"
                  value={kotaDokumen}
                  onChange={(e) => setKotaDokumen(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Tanggal Pengesahan:
                </label>
                <input
                  type="text"
                  value={tanggalDokumen}
                  onChange={(e) => setTanggalDokumen(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Data Bendahara Pengeluaran */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                1. Bendahara Pengeluaran (Pembuat Kertas Kerja):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nama Lengkap & Gelar Bendahara"
                  value={namaBendahara}
                  onChange={(e) => setNamaBendahara(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                <input
                  type="text"
                  placeholder="NIP Bendahara"
                  value={nipBendahara}
                  onChange={(e) => setNipBendahara(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Data Kuasa Pengguna Anggaran (KPA) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                2. Kuasa Pengguna Anggaran / KPA (Mengetahui):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nama Lengkap & Gelar KPA"
                  value={namaKPA}
                  onChange={(e) => setNamaKPA(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                <input
                  type="text"
                  placeholder="NIP KPA"
                  value={nipKPA}
                  onChange={(e) => setNipKPA(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimeout(() => {
                    window.print();
                  }, 200);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Lanjutkan Cetak / Simpan PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DOKUMEN CETAK RESMI PEMERINTAHAN (A4 PORTRAIT) - HANYA MUNCUL SAAT PRINT */}
      <div id="printable-kertas-kerja" className="hidden print:block text-black bg-white">
        {/* KOP RESMI DOKUMEN PEMERINTAH */}
        <div className="text-center pb-2 mb-3 border-b-2 border-black">
          <h2 className="text-sm font-extrabold uppercase tracking-wide">
            KEMENTERIAN / LEMBAGA REPUBLIK INDONESIA
          </h2>
          <h3 className="text-xs font-bold uppercase text-slate-800">
            DIREKTORAT JENDERAL PERBENDAHARAAN &bull; PENGELOLA KEUANGAN
          </h3>
          <h4 className="text-xs font-bold uppercase mt-0.5">
            SATUAN KERJA: {finalSatkerNama} (KODE: {finalSatkerKode})
          </h4>
          <p className="text-[10px] text-slate-600 mt-0.5">
            Gedung Keuangan Negara &bull; Telepon: (021) 3456789 &bull; Laman Resmi Portal Pelaporan Keuangan
          </p>
          <div className="w-full h-0.5 bg-black mt-2"></div>
          <div className="w-full h-[1px] bg-black mt-0.5"></div>
        </div>

        {/* JUDUL DOKUMEN BERITA ACARA */}
        <div className="text-center my-3">
          <h1 className="text-sm font-extrabold uppercase underline tracking-wide">
            BERITA ACARA REKONSILIASI & LEMBAR KERTAS KERJA KAS
          </h1>
          <p className="text-xs font-semibold mt-0.5">
            Nomor: BA-KK/{finalSatkerKode}/{String(bulan).padStart(2, "0")}/{tahun}
          </p>
          <p className="text-[11px] font-medium text-slate-700 mt-0.5">
            Periode Pembukuan: <strong>Bulan {BULAN_NAMES[bulan - 1]} Tahun {tahun}</strong>
          </p>
        </div>

        {/* TABEL IDENTITAS PARAMETER RUMUS */}
        <div className="text-[11px] mb-3 bg-slate-50 p-2.5 border border-slate-300 rounded">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-32 font-semibold text-slate-700">Format / Rumus</td>
                <td className="w-3">:</td>
                <td className="font-bold">{rumus.nama_rumus} ({rumus.scope === "universal" ? "Standar Universal" : "Khusus Eselon 1"})</td>
                <td className="w-28 font-semibold text-slate-700 text-right">Status Audit</td>
                <td className="w-3 text-center">:</td>
                <td className="w-32 font-bold uppercase text-slate-900">{statusAudit}</td>
              </tr>
              <tr>
                <td className="font-semibold text-slate-700">Saldo Awal Kas</td>
                <td>:</td>
                <td className="font-bold font-mono">{formatRupiah(saldoAwal)}</td>
                <td className="font-semibold text-slate-700 text-right">Tanggal Cetak</td>
                <td className="text-center">:</td>
                <td className="font-medium text-slate-800">{tanggalDokumen}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TABEL DETAIL AKUN & SUB-TOTAL/TOTAL RESMI (MULTI-COLUMN LAJUR AKUNTANSI) */}
        <table className="w-full border-collapse border border-black text-[10px] mb-4">
          <thead>
            <tr className="bg-slate-100 border-b border-black text-center font-bold">
              <th className="border border-black py-1 px-1.5 w-7">No</th>
              <th className="border border-black py-1 px-1.5 w-20">Kode Akun</th>
              <th className="border border-black py-1 px-2 text-left">Uraian Akun Bagan Standar (BAS)</th>
              <th className="border border-black py-1 px-1.5 w-22">Sifat Mutasi</th>
              <th className="border border-black py-1 px-1 w-12">Porsi</th>
              <th className="border border-black py-1 px-2 w-32 text-right">Rincian / Subtotal (Rp)</th>
              <th className="border border-black py-1 px-2 w-32 text-right">Total Utama (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {(rumus.seksi_list || []).map((seksi: any, sIdx: number) => {
              const isSubtotalMode = (seksi.tipe_subtotal || "subtotal") === "subtotal";
              let subtotalSeksi = 0;
              if (Array.isArray(seksi.items)) {
                seksi.items.forEach((it: any) => {
                  const val = nominalMap[it.item_id] || nominalMap[it.id] || 0;
                  if (it.operator === "tambah") subtotalSeksi += val;
                  else subtotalSeksi -= val;
                });
              }

              return (
                <React.Fragment key={seksi.id || sIdx}>
                  {/* Baris Judul Kelompok Akun */}
                  <tr className="bg-slate-200/90 font-bold border-t border-b border-black">
                    <td colSpan={7} className="py-1 px-2 text-[10.5px] uppercase tracking-wide">
                      {seksi.nama_seksi || `Kelompok Akun ${sIdx + 1}`}
                    </td>
                  </tr>

                  {/* Baris Akun-Akun */}
                  {seksi.items?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-2 text-center text-slate-400 italic">
                        (Tidak ada akun terdaftar pada kelompok ini)
                      </td>
                    </tr>
                  ) : (
                    seksi.items.map((it: any, itIdx: number) => {
                      const isAdd = it.operator === "tambah";
                      const currentVal = nominalMap[it.item_id] || nominalMap[it.id] || 0;

                      let pctStr = "0.0%";
                      if (isSubtotalMode) {
                        const absSub = Math.abs(subtotalSeksi);
                        if (absSub > 0 && currentVal > 0) {
                          pctStr = `${((currentVal / absSub) * 100).toFixed(1)}%`;
                        }
                      } else {
                        const baseTot = isAdd ? totalPenambah : totalPengurang;
                        if (baseTot > 0 && currentVal > 0) {
                          pctStr = `${((currentVal / baseTot) * 100).toFixed(1)}%`;
                        }
                      }

                      return (
                        <tr key={it.item_id || it.id || itIdx} className="border-b border-slate-300">
                          <td className="border border-black py-0.5 px-1 text-center font-mono">{itIdx + 1}</td>
                          <td className="border border-black py-0.5 px-1.5 font-mono font-bold text-center">#{it.kode_akun}</td>
                          <td className="border border-black py-0.5 px-2 pl-3">
                            <span className="text-slate-400 mr-1">•</span>
                            {it.nama_akun}
                          </td>
                          <td className="border border-black py-0.5 px-1 text-center font-medium text-[9px]">
                            {isAdd ? "(+) Kas Masuk" : "(-) Belanja Keluar"}
                          </td>
                          <td className="border border-black py-0.5 px-1 text-center font-mono text-[9px]">
                            {currentVal > 0 ? pctStr : "-"}
                          </td>
                          {/* LAJUR RINCIAN / SUBTOTAL (AGAK MASUK / TENGAH) */}
                          <td className="border border-black py-0.5 px-2 text-right font-mono font-semibold">
                            {formatRupiah(currentVal)}
                          </td>
                          {/* LAJUR TOTAL UTAMA (KOSONG UNTUK RINCIAN AKUN) */}
                          <td className="border border-black py-0.5 px-2 text-center text-slate-300 font-mono">
                            -
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {/* Baris Akumulasi Kelompok (Subtotal atau Total Sesuai Pilihan Pembina) */}
                  {seksi.items?.length > 0 && (
                    isSubtotalMode ? (
                      /* JIKA TIPE SUBTOTAL: Teks menjorok masuk (↳ SUBTOTAL), nominal di kolom Rincian/Subtotal */
                      <tr className="bg-slate-100/90 font-bold border-t border-b border-black">
                        <td colSpan={5} className="py-1 px-2 text-right uppercase pl-6 text-[9.5px]">
                          ↳ SUBTOTAL {seksi.nama_seksi || `KELOMPOK ${sIdx + 1}`} :
                        </td>
                        <td className="border border-black py-1 px-2 text-right font-mono font-bold bg-slate-50 text-[10px] underline">
                          {formatRupiah(subtotalSeksi)}
                        </td>
                        <td className="border border-black py-1 px-2 text-center text-slate-300 font-mono">
                          -
                        </td>
                      </tr>
                    ) : (
                      /* JIKA TIPE TOTAL: Teks rata luar (TOTAL), nominal di kolom TOTAL UTAMA (PALING LUAR) */
                      <tr className="bg-slate-200/90 font-black border-t-2 border-b-2 border-black">
                        <td colSpan={5} className="py-1.5 px-2 text-right uppercase text-[10px] tracking-wide">
                          TOTAL {seksi.nama_seksi || `KELOMPOK ${sIdx + 1}`} :
                        </td>
                        <td className="border border-black py-1.5 px-2 text-center text-slate-300 font-mono">
                          -
                        </td>
                        <td className="border border-black py-1.5 px-2 text-right font-mono font-black text-[10.5px] bg-slate-100">
                          {formatRupiah(subtotalSeksi)}
                        </td>
                      </tr>
                    )
                  )}
                </React.Fragment>
              );
            })}

            {/* REKAPITULASI TOTAL UTAMA (BERADA DI KOLOM PALING LUAR / KANAN) */}
            <tr className="bg-slate-50 font-bold border-t-2 border-black">
              <td colSpan={5} className="py-1 px-2 text-right uppercase text-slate-700">
                SALDO AWAL KAS RIIL :
              </td>
              <td className="border border-black py-1 px-2 text-center text-slate-300 font-mono">-</td>
              <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                {formatRupiah(saldoAwal)}
              </td>
            </tr>
            <tr className="bg-emerald-50/50 font-bold border-b border-black">
              <td colSpan={5} className="py-1 px-2 text-right uppercase text-emerald-900">
                (+) TOTAL PENAMBAH KAS :
              </td>
              <td className="border border-black py-1 px-2 text-center text-slate-300 font-mono">-</td>
              <td className="border border-black py-1 px-2 text-right font-mono font-bold text-emerald-900">
                {formatRupiah(totalPenambah)}
              </td>
            </tr>
            <tr className="bg-rose-50/50 font-bold border-b border-black">
              <td colSpan={5} className="py-1 px-2 text-right uppercase text-rose-900">
                (-) TOTAL PENGURANG KAS :
              </td>
              <td className="border border-black py-1 px-2 text-center text-slate-300 font-mono">-</td>
              <td className="border border-black py-1 px-2 text-right font-mono font-bold text-rose-900">
                {formatRupiah(totalPengurang)}
              </td>
            </tr>
            <tr className="bg-slate-200 font-extrabold border-b-2 border-t-2 border-black">
              <td colSpan={5} className="py-1.5 px-2 text-right uppercase text-[10.5px]">
                (=) TOTAL SALDO AKHIR REKONSILIASI KAS :
              </td>
              <td className="border border-black py-1.5 px-2 text-center text-slate-300 font-mono">-</td>
              <td className="border-t-2 border-b-4 border-double border-black py-1.5 px-2 text-right font-mono font-black text-xs bg-slate-100">
                {formatRupiah(saldoAkhir)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* KOTAK KESIMPULAN REKONSILIASI KAS BUKU */}
        <div className="border-2 border-black p-3 mb-4 text-[11px]">
          <div className="font-bold uppercase tracking-wider border-b border-black pb-1 mb-2">
            RINGKASAN REKONSILIASI KAS BUKU PERIODE {BULAN_NAMES[bulan - 1].toUpperCase()} {tahun}
          </div>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-1/2 py-0.5">Saldo Awal Kas Riil per Awal Periode</td>
                <td className="w-4">:</td>
                <td className="text-right font-mono font-semibold">{formatRupiah(saldoAwal)}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-emerald-900">(+) Total Kas Masuk / Mutasi Penambah</td>
                <td>:</td>
                <td className="text-right font-mono font-bold text-emerald-900">{formatRupiah(totalPenambah)}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-rose-900">(-) Total Kas Keluar / Mutasi Belanja Pengurang</td>
                <td>:</td>
                <td className="text-right font-mono font-bold text-rose-900">{formatRupiah(totalPengurang)}</td>
              </tr>
              <tr className="border-t border-black font-extrabold text-xs">
                <td className="pt-1 uppercase">(=) SALDO AKHIR KAS BUKU TERKONSILIASI</td>
                <td className="pt-1">:</td>
                <td className="pt-1 text-right font-mono text-sm">{formatRupiah(saldoAkhir)}</td>
              </tr>
            </tbody>
          </table>
          {submission.catatan && (
            <div className="mt-2 pt-1.5 border-t border-slate-300 text-[10px] italic">
              <strong>Catatan / Penjelasan Rekonsiliasi:</strong> {submission.catatan}
            </div>
          )}
        </div>

        {/* LEMBAR PENGESAHAN & TANDA TANGAN RESMI */}
        <div className="mt-5 text-[11px] break-inside-avoid">
          <div className="text-right mb-2">
            {kotaDokumen}, {tanggalDokumen}
          </div>
          <div className="grid grid-cols-2 gap-8 text-center">
            <div>
              <p className="font-semibold text-slate-700">Mengetahui,</p>
              <p className="font-bold uppercase tracking-wide">
                Kuasa Pengguna Anggaran (KPA)
              </p>
              <div className="h-16"></div>
              <p className="font-bold underline uppercase">{namaKPA}</p>
              <p className="text-[10px] text-slate-600 font-mono">
                NIP. {nipKPA}
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Dibuat Oleh,</p>
              <p className="font-bold uppercase tracking-wide">
                Bendahara Pengeluaran
              </p>
              <div className="h-16"></div>
              <p className="font-bold underline uppercase">{namaBendahara}</p>
              <p className="text-[10px] text-slate-600 font-mono">
                NIP. {nipBendahara}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
