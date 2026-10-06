# Rencana Implementasi: Pencocokan Otomatis Rekonsiliasi Dokumen FinSight

Dokumen ini berisi tahapan eksekusi fitur **Pencocokan & Rekonsiliasi Otomatis (Auto-Reconciliation)** antara bukti fisik Rekening Koran (PDF), Excel LPJ/Kas, dan data laporan Satker menggunakan library Python lokal di `backend_py` (tanpa ketergantungan pada webhook n8n).

---

## 📌 Checklist Progress Implementasi

- [ ] **Tahap 1: Persiapan Library & Virtual Environment**
  - [ ] Tambahkan `pdfplumber` dan `rapidfuzz` ke `backend_py/requirements.txt`
  - [ ] Install library di venv: `pip install pdfplumber rapidfuzz`
  - [ ] Uji fungsi ekstraksi tabel dan teks dasar dengan script Python singkat

- [ ] **Tahap 2: Pembuatan Modul Service Pencocokan (`backend_py/services/reconciliation.py`)**
  - [ ] Buat parser PDF rekening koran: ekstraksi Saldo Akhir, Nama Bank, dan Nomor Rekening
  - [ ] Buat parser Excel LPJ/Kas: pembacaan total saldo menggunakan `pandas` & `openpyxl`
  - [ ] Buat engine perbandingan nilai:
    - [ ] Hitung `selisih = abs(saldo_bank - saldo_excel)`
    - [ ] Klasifikasi status: `COCOK` (selisih == 0) vs `SELISIH` (selisih > 0)
    - [ ] Fuzzy matching uraian transaksi menggunakan `rapidfuzz` (opsional untuk audit per baris)

- [ ] **Tahap 3: Pembuatan Endpoint Backend & Memutus Dependensi n8n**
  - [ ] Buat endpoint baru di FastAPI: `POST /api/dokumen/scan-ekstrak`
  - [ ] Alihkan endpoint Next.js `frontend/src/app/api/ai-scan/route.ts` agar memanggil backend Python FastAPI (bukan lagi ke webhook n8n port 5678)
  - [ ] Pastikan respons JSON mengembalikan format standar: `{ success: true, saldo_rekening: ..., bank: ..., nomor_rekening: ... }`

- [ ] **Tahap 4: Integrasi Form Upload Satker (Staff)**
  - [ ] Hubungkan `UploadModal.tsx` dengan endpoint ekstraksi Python baru
  - [ ] Auto-fill kolom `nilai_rekening_koran` dan `nilai_excel` saat file diunggah
  - [ ] Tambahkan peringatan dini (*early warning alert*) di form jika nilai input staff berbeda dengan hasil bacaan fisik berkas

- [ ] **Tahap 5: Pembaruan Tampilan Pimpinan & Eselon 1**
  - [ ] **Pimpinan (`/pimpinan/dokumen`):**
    - [ ] Auto-populate kolom rekonsiliasi saat preview dibuka (tanpa perlu pimpinan mengetik manual dari nol)
    - [ ] Tampilkan badge status kesesuaian nilai langsung di panel peninjauan
  - [ ] **Eselon 1 (`/eselon-1/dokumen`):**
    - [ ] Tambahkan indikator status rekonsiliasi di daftar antrean:
      - [ ] Badge Hijau: `✓ Rekonsiliasi Cocok (Rp 0)`
      - [ ] Badge Merah: `⚠ Selisih Rp [Nominal]`
    - [ ] Tambahkan tombol audit ulang (*Re-check On-Demand*) jika berkas diganti

- [ ] **Tahap 6: Pengujian & Validasi End-to-End**
  - [ ] Uji coba upload file Rekening Koran asli (Bank BRI/Mandiri/BNI/BCA)
  - [ ] Uji coba kasus nilai cocok (Rp 0 selisih) $\rightarrow$ Verifikasi lolos
  - [ ] Uji coba kasus nilai selisih $\rightarrow$ Pastikan peringatan merah muncul
  - [ ] Commit & Push seluruh perubahan ke Git repository

---

## 🏗️ Catatan Arsitektur Sistem

1. **Kenapa Tanpa n8n?**
   - Performa membaca PDF di Python langsung selesai dalam waktu < 0.3 detik.
   - Angka desimal dan ribuan diproses secara deterministik (100% akurat), bebas halusinasi LLM/AI.
   - Tidak ada lagi risiko webhook macet jika container n8n restart/down.

2. **Skema Database:**
   - Tabel `dokumen` sudah memiliki kolom `nilai_rekening_koran` dan `nilai_excel` bertipe `decimal(15,2)`, sehingga tidak membutuhkan migrasi schema baru.
