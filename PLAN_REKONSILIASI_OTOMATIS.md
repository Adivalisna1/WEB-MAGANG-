# Rencana Implementasi: Pencocokan Otomatis Rekonsiliasi Dokumen FinSight

Dokumen ini berisi tahapan eksekusi fitur **Pencocokan & Rekonsiliasi Otomatis (Auto-Reconciliation)** antara bukti fisik Rekening Koran (PDF), Excel LPJ/Kas, dan data laporan Satker menggunakan library Python lokal di `backend_py` (tanpa ketergantungan pada webhook n8n).

---

## 📌 Checklist Progress Implementasi

- [x] **Tahap 1: Persiapan Library & Virtual Environment**
  - [x] Tambahkan `pdfplumber` dan `rapidfuzz` ke `backend_py/requirements.txt`
  - [x] Install library di venv: `pip install pdfplumber rapidfuzz`
  - [x] Uji fungsi ekstraksi tabel dan teks dasar dengan script Python singkat

- [x] **Tahap 2: Pembuatan Modul Service Pencocokan (`backend_py/services/reconciliation.py`)**
  - [x] Buat parser PDF rekening koran: ekstraksi Saldo Akhir, Nama Bank, dan Nomor Rekening
  - [x] Buat parser Excel LPJ/Kas: pembacaan total saldo menggunakan `pandas` & `openpyxl`
  - [x] Buat engine perbandingan nilai:
    - [x] Hitung `selisih = abs(saldo_bank - saldo_excel)`
    - [x] Klasifikasi status: `COCOK` (selisih == 0) vs `SELISIH` (selisih > 0)
    - [x] Fuzzy matching uraian transaksi menggunakan `rapidfuzz` (opsional untuk audit per baris)

- [x] **Tahap 3: Pembuatan Endpoint Backend & Memutus Dependensi n8n**
  - [x] Buat endpoint baru di FastAPI: `POST /api/dokumen/scan-ekstrak`
  - [x] Alihkan endpoint Next.js `frontend/src/app/api/ai-scan/route.ts` agar memanggil backend Python FastAPI (bukan lagi ke webhook n8n port 5678)
  - [x] Pastikan respons JSON mengembalikan format standar: `{ success: true, saldo_rekening: ..., bank: ..., nomor_rekening: ... }`

- [x] **Tahap 4: Integrasi Form Upload Satker (Staff)**
  - [x] Hubungkan `UploadModal.tsx` dengan endpoint ekstraksi Python baru
  - [x] Auto-fill kolom `nilai_rekening_koran` dan `nilai_excel` saat file diunggah
  - [x] Tambahkan peringatan dini (*early warning alert*) di form jika nilai input staff berbeda dengan hasil bacaan fisik berkas

- [x] **Tahap 5: Pembaruan Tampilan Pimpinan & Eselon 1**
  - [x] **Pimpinan (`/pimpinan/dokumen`):**
    - [x] Auto-populate kolom rekonsiliasi saat preview dibuka (tanpa perlu pimpinan mengetik manual dari nol)
    - [x] Tampilkan badge status kesesuaian nilai langsung di panel peninjauan
  - [x] **Eselon 1 (`/eselon-1/dokumen`):**
    - [x] Tambahkan indikator status rekonsiliasi di daftar antrean:
      - [x] Badge Hijau: `✓ Rekonsiliasi Cocok (Rp 0)`
      - [x] Badge Merah: `⚠ Selisih Rp [Nominal]`
    - [x] Tambahkan tombol audit ulang (*Re-check On-Demand*) jika berkas diganti

- [ ] **Tahap 6: Pengujian & Validasi End-to-End**
  - [x] Uji coba fungsi parser & kalkulator rekonsiliasi Python secara deterministik
  - [x] Verifikasi Next.js compilation build (`npm run build`) sukses tanpa error
  - [ ] Commit & Push seluruh perubahan ke Git repository

---

## 🏗️ Catatan Arsitektur Sistem

1. **Kenapa Tanpa n8n?**
   - Performa membaca PDF di Python langsung selesai dalam waktu < 0.3 detik.
   - Angka desimal dan ribuan diproses secara deterministik (100% akurat), bebas halusinasi LLM/AI.
   - Tidak ada lagi risiko webhook macet jika container n8n restart/down.

2. **Skema Database:**
   - Tabel `dokumen` sudah memiliki kolom `nilai_rekening_koran` dan `nilai_excel` bertipe `decimal(15,2)`, sehingga tidak membutuhkan migrasi schema baru.
