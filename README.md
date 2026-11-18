# SIP — Sistem Informasi Pelaporan

Platform manajemen, pengarsipan, dan rekonsiliasi laporan keuangan serta dokumen satuan kerja (Satker) secara digital, terstruktur, dan terintegrasi antar tingkat hierarki instansi (**Satker**, **Eselon 1**, dan **Kementerian/Lembaga**).

---

## Daftar Isi
1. [Arsitektur & Teknologi](#1-arsitektur--teknologi)
2. [Struktur Direktori](#2-struktur-direktori)
3. [Hierarki Pengguna & Hak Akses (RBAC)](#3-hierarki-pengguna--hak-akses-rbac)
4. [Fitur Utama Aplikasi](#4-fitur-utama-aplikasi)
5. [Cara Menjalankan Aplikasi (Docker)](#5-cara-menjalankan-aplikasi-docker)
6. [Akses Jaringan Lokal (Wi-Fi)](#6-akses-jaringan-lokal-wi-fi)
7. [Ringkasan Endpoint API Utama](#7-ringkasan-endpoint-api-utama)

---

## 1. Arsitektur & Teknologi

| Komponen | Teknologi | Port Default |
|---|---|---|
| **Frontend** | Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Leaflet (OpenStreetMap) | `3000` |
| **Backend API** | Python 3.12, FastAPI, Uvicorn, Pandas, OpenPyXL, Tesseract OCR, PyPDF/PDFPlumber | `5000` |
| **Database** | MySQL 8.0 | `3307` (host) / `3306` (container) |
| **Database GUI** | phpMyAdmin 5.2 | `8080` |
| **Containerization** | Docker & Docker Compose (`web_laporan_net` subnet `10.202.0.0/24`) | — |

---

## 2. Struktur Direktori

```text
web upload/
├── backend_py/                 # Backend API FastAPI (utama)
│   ├── main.py                 # Entrypoint FastAPI & startup migrations
│   ├── db.py                   # Connection pool MySQL
│   ├── auth.py                 # JWT & validasi sesi pengguna
│   ├── migrations/             # Skrip migrasi skema & seed otomatis
│   ├── routers/                # Endpoint API (auth, dokumen, kertas_kerja, stats, notifikasi, dll.)
│   └── services/               # Layanan OCR, auto-scan kategori, & rekonsiliasi
├── frontend/                   # Aplikasi Web Next.js
│   └── src/
│       ├── app/                # Halaman per role (/staff, /pimpinan, /eselon-1, /kl, /admin-it)
│       ├── components/         # Komponen UI (Sidebar, UploadModal, Peta, Kertas Kerja, Tagihan)
│       ├── context/            # AuthContext & manajemen sesi
│       ├── hooks/              # useRequireAuth, useSidebarState
│       └── lib/                # Helper API & autentikasi
├── database/                   # Skrip inisialisasi SQL awal
├── docker-compose.yml          # Orkestrasi db, backend_py, frontend, phpmyadmin
├── jalankan-web.bat            # Skrip cepat menyalakan container Docker
├── cek-ip.bat                  # Skrip cek IP lokal & link akses Wi-Fi
└── buka-akses-wifi.bat         # Skrip buka port Firewall Windows (3000 & 5000)
```

---

## 3. Hierarki Pengguna & Hak Akses (RBAC)

SIP memisahkan hak akses berdasarkan kombinasi **Tingkat Hierarki** (`satker`, `eselon_1`, `kl`) dan **Peran** (`operator`, `administrasi`/`manajemen`, `it`, `staff_eselon_1`):

| Tingkat | Peran | Route Utama | Wewenang Utama |
|---|---|---|---|
| **Satker** | **Operator / Staff Satker** | `/staff/dokumen` | Unggah dokumen satuan/batch ZIP, isi Kertas Kerja, kelola Kas, Laporan, Aset, dan lihat tagihan dokumen dari pembina. |
| **Satker** | **Pimpinan / Manajemen Satker** | `/pimpinan` | Monitoring dokumen satker, pemantauan user satker, audit read-only Kertas Kerja, dan cetak Berita Acara Rekonsiliasi. |
| **Eselon 1** | **Staff Satker Eselon 1** (`staff_eselon_1`) | `/staff/dokumen` | Mengelola dan mengunggah laporan milik unit Eselon 1 induknya sendiri (*terisolasi*, tidak dapat memantau satker bawahan). |
| **Eselon 1** | **Operator Eselon 1** | `/eselon-1` | Memantau, merekap, dan menganalisis seluruh satker binaan di bawah unit Eselon 1 terkait, serta mengirim pemberitahuan dokumen. |
| **Eselon 1** | **Admin / Pimpinan Eselon 1** | `/eselon-1` | Monitoring eksekutif, audit Kertas Kerja satker binaan, catatan koreksi, peta pengawasan, dan tagihan kelengkapan dokumen. |
| **K/L** | **Pimpinan / Eksekutif K/L** | `/kl` | Dashboard eksekutif nasional lintas seluruh unit Eselon 1, peta geospasial nasional, analisis wilayah & satker. |
| **Pusat** | **IT Administrator** | `/admin-it` | Manajemen User, Satker, Kategori Dokumen, Rumus Kertas Kerja (Rule Engine), Master Pencatatan, dan Real-Time System Logs. |

---

## 4. Fitur Utama Aplikasi

### A. Manajemen & Unggah Dokumen Terpadu
- **Auto-Scan & OCR Dokumen:** Membaca otomatis jenis/kategori dokumen, nama bank, nomor rekening, tanggal surat, dan saldo akhir dari file PDF maupun hasil scan gambar (Tesseract OCR).
- **Single & Batch Upload:** Mendukung unggah satuan maupun unggah massal (folder / file `.zip`) dengan tabel tinjauan sebelum disimpan.
- **Kategori Modul Lengkap:**
  - **Kas:** Rekening Koran, BAP Kas, LPJ Bendahara, Konfirmasi Saldo Bank.
  - **Laporan:** SK Piutang Satker (auto-hitung jatuh tempo +2 tahun & aging schedule), SK Penetapan/Kurang Bayar, SK Pembebanan/SKTJM, SK Penghapusan, Surat Pembukaan/Penutupan Rekening (dengan badge keterangan otomatis), dan Bukti Setor Sisa UP (NTPN).
  - **Aset:** Perolehan Aset Lainnya.

### B. Kertas Kerja & Rule Engine Akuntansi
- **Master Akun BAS:** Terintegrasi dengan 3.795 akun standar Bagan Akun Standar (BAS).
- **RumusBuilder (Admin IT & Eselon 1):** Penyusunan struktur seksi, baris **Subtotal** dan **Total** berjenjang, serta pembatasan cakupan rumus (Universal / per Eselon 1).
- **WorksheetOperator (Satker):** Pengisian nominal transaksi, unduh template Excel resmi, import Excel ke Kertas Kerja, ekspor Excel/CSV, serta cetak **Berita Acara Rekonsiliasi Kas (PDF/A4)**.

### C. Peta Geospasial, Analisis Teks, & Pemberitahuan Dokumen
- **Peta Interaktif Indonesia (OpenStreetMap):** Terkunci khusus wilayah Indonesia dengan mode **Wilayah Pengawasan** dan **Pin Satker** (indikator hijau untuk seimbang, merah untuk selisih/belum tertib).
- **Analisis Satker & Analisis Wilayah:** Menghasilkan rangkuman analisis berbentuk teks paragraf siap salin (kondisi saldo BKU vs Rekening Koran, status keseimbangan, selisih, dan kelengkapan dokumen) langsung dalam pop-up.
- **Pemberitahuan Kelengkapan Dokumen:** Eselon 1 & K/L dapat mengirim permintaan dokumen (1 per 1 atau banyak sekaligus, lengkap dengan **Judul Dokumen**, **Tahun**, **Tenggat Waktu**, dan **Catatan**) dari halaman **Pemantauan Pengguna Eselon 1** maupun **Peta**. Status otomatis berubah dari `Belum Diunggah` menjadi `Sudah Diunggah` saat Satker mengunggah berkas terkait.

---

## 5. Cara Menjalankan Aplikasi (Docker)

### Prasyarat
- **Docker Desktop** sudah terinstall dan dalam status **Running**.
- File `.env` sudah dikonfigurasi di root proyek (berdasarkan `.env.example`).

### Menjalankan via Skrip Cepat (Windows)
- Jalankan pertama kali atau setelah ada perubahan kode (rebuild):
  ```powershell
  jalankan-web.bat build
  ```
- Menyalakan container sehari-hari tanpa rebuild:
  ```powershell
  jalankan-web.bat
  ```

### Menjalankan Manual via Terminal
```powershell
docker compose up -d --build
```
Akses aplikasi melalui browser:
- **Web SIP (Frontend):** `http://localhost:3000`
- **Dokumentasi API (Swagger):** `http://localhost:5000/docs`
- **phpMyAdmin:** `http://localhost:8080`

---

## 6. Akses Jaringan Lokal (Wi-Fi)

Agar perangkat lain (laptop/HP) dalam satu jaringan Wi-Fi dapat mengakses web SIP:
1. Jalankan **`buka-akses-wifi.bat`** (Run as Administrator) untuk membuka port TCP `3000` dan `5000` di Windows Firewall.
2. Jalankan **`cek-ip.bat`** untuk melihat alamat IP Wi-Fi aktif (misal `http://172.16.x.x:3000` atau `http://192.168.x.x:3000`).
3. Pastikan Docker Desktop menggunakan subnet non-konflik (`10.200.0.0/16`–`10.202.0.0/24`) agar tidak bentrok dengan jaringan Wi-Fi kantor/kampus `172.16.x.x`.

---

## 7. Ringkasan Endpoint API Utama

| Prefix Router | Fungsi Utama |
|---|---|
| `/api/auth` | Login, logout, manajemen sesi, lupa & reset kata sandi |
| `/api/dokumen` | Unggah satuan/batch, daftar dokumen, unduh berkas, kategori, auto-scan |
| `/api/rekening-koran` | Manajemen data Rekening Koran & ekstraksi saldo akhir |
| `/api/pencatatan` | Upload bukti transaksi & pencatatan kas |
| `/api/kertas-kerja` | Master akun, rumus kertas kerja, transaksi worksheet, ekspor Excel/CSV |
| `/api/stats` | Statistik dashboard, rekonsiliasi keuangan, dan `/satker-analysis` |
| `/api/notifikasi` | Notifikasi lonceng & manajemen `/tagihan-dokumen` (`Belum`/`Sudah Diunggah`) |
| `/api/eselon-1` | Data unit Eselon 1, monitoring satker binaan, dan daftar pengguna binaan |
| `/api/admin-it` | Manajemen user, satker, kategori, rumus, dan real-time system logs |
