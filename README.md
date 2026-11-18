# SIP — Sistem Informasi Pelaporan

**SIP (Sistem Informasi Pelaporan)** adalah platform web terintegrasi untuk pengelolaan dokumen pelaporan keuangan, pencocokan saldo kas dan rekening koran, penyusunan kertas kerja akuntansi, serta pemantauan satuan kerja secara berjenjang dari tingkat **Satker**, **Eselon 1**, hingga **Kementerian/Lembaga (K/L)**.

---

## 1. Teknologi yang Digunakan

| Komponen | Teknologi |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Leaflet (OpenStreetMap) |
| **Backend API** | Python FastAPI, Uvicorn, Pandas, OpenPyXL, PyPDF / PDFPlumber / Tesseract OCR |
| **Database** | MySQL 8.0, phpMyAdmin |
| **Container & DevOps** | Docker & Docker Compose, Script Utilitas Windows (`.bat`) |

---

## 2. Struktur Role & Tingkat Hierarki

Sistem menggunakan matriks **Tingkat Hierarki** (`satker`, `eselon_1`, `kl`) dan **Peran/Role**:

### A. Tingkat Satker
- **Operator Satker (`/staff/...`)**: Mengunggah dan mengelola dokumen (Rekening Koran, BAP Kas, LPJ Bendahara, Konfirmasi Saldo Bank, Upload Bukti, SK Piutang, Surat Pembukaan/Penutupan Rekening, Aset Perolehan Lainnya) serta mengisi Kertas Kerja.
- **Pimpinan / Manajemen Satker (`/pimpinan/...`)**: Memantau progres dokumen satker, melihat Kertas Kerja (mode *read-only*), dan mencetak Berita Acara Rekonsiliasi (BAR).

### B. Tingkat Unit Eselon 1
- **Staff Satker Eselon 1 (`staff_eselon_1`)**: Mengelola dan mengunggah laporan milik unit Eselon 1 itu sendiri (terisolasi di `/staff/dokumen`, tidak dapat memantau satker bawahan).
- **Operator Eselon 1 (`/eselon-1/...`)**: Memantau seluruh satker binaan di bawah unit Eselon 1 terkait, melihat peta sebaran, serta mengirim pemberitahuan kelengkapan dokumen ke satker.
- **Admin / Pimpinan Eselon 1 (`/eselon-1/...`)**: Monitoring eksekutif tingkat unit Eselon 1, audit Kertas Kerja, dan pemberian memo koreksi.

### C. Tingkat Kementerian/Lembaga & IT
- **Pimpinan K/L (`/kl`)**: Dashboard eksekutif nasional untuk memantau seluruh unit Eselon 1 dan sebaran Satker se-Indonesia.
- **Admin IT (`/admin-it/...`)**: Mengelola pengguna, data master Satker, kategori dokumen, rumus Kertas Kerja, pemantauan log aktivitas real-time, dan kesehatan server.

---

## 3. Fitur Utama

1. **Unggah Dokumen & Auto-Scan Cerdas (Satuan & Batch ZIP/Folder)**
   - Mendukung unggah satuan maupun massal (folder/ZIP).
   - Pembacaan otomatis kategori dokumen, nomor rekening, nama bank, saldo akhir, serta OCR untuk PDF hasil scan.
   - Perhitungan otomatis tenggat waktu SK Piutang (+2 tahun dari tanggal penetapan) dan penandaan otomatis Surat Pembukaan/Penutupan Rekening.
2. **Kertas Kerja Akuntansi & Rule Engine**
   - Terintegrasi dengan 3.795 akun standar BAS (`master_akun`).
   - Mendukung rumus berjenjang (*Total* & *Subtotal*), import/export Excel & CSV, serta cetak Berita Acara Rekonsiliasi Kas resmi format PDF/A4.
3. **Peta Sebaran Geospasial Nasional (OpenStreetMap)**
   - Peta terkunci di wilayah Indonesia, menampilkan mode **Wilayah Pengawasan** dan **Pin Satker**.
   - Dilengkapi fitur **Analisis Satker** dan **Analisis Wilayah** yang menghasilkan rangkuman teks naratif siap salin (*copyable pop-up*) terkait kondisi saldo, keseimbangan, selisih, dan kelengkapan dokumen.
4. **Pemberitahuan Kelengkapan Dokumen (Eselon 1 & K/L ke Satker)**
   - Pop-up form untuk menagih 1 per 1 maupun banyak kategori dokumen sekaligus lengkap dengan Tahun, Tenggat Waktu, Judul Dokumen, dan Catatan.
   - Status checklist (**`Belum Diunggah`** / **`Sudah Diunggah`**) otomatis terbarui saat satker mengunggah dokumen terkait.

---

## 4. Cara Menjalankan Aplikasi (Docker)

### Prasyarat
- **Docker Desktop** sudah terinstall dan dalam status **Running**.

### Langkah Menjalankan
1. Jalankan lewat file batch di folder utama:
   - Klik ganda `jalankan-web.bat` (untuk menyalakan container), atau
   - Jalankan di terminal untuk rebuild setelah ada perubahan kode:
     ```powershell
     docker compose up -d --build
     ```
2. Akses aplikasi di browser:
   - **Web Dashboard (SIP):** `http://localhost:3000`
   - **Dokumentasi API (Swagger):** `http://localhost:5000/docs`
   - **phpMyAdmin:** `http://localhost:8080`

### Akses Melalui Jaringan Wi-Fi Lokal (LAN)
- Jalankan `buka-akses-wifi.bat` (sebagai Administrator) untuk membuka port `3000` & `5000` di Windows Firewall.
- Jalankan `cek-ip.bat` untuk melihat alamat IP Wi-Fi yang dapat dibagikan ke perangkat lain dalam satu jaringan (panduan lengkap ada di [PANDUAN_AKSES_WIFI.md](PANDUAN_AKSES_WIFI.md)).

---

## 5. Struktur Direktori Utama

```text
├── backend_py/              # Backend Python FastAPI
│   ├── main.py              # Entry point API & startup migrations
│   ├── db.py                # Koneksi pool MySQL
│   ├── routers/             # Endpoint (auth, dokumen, kertas_kerja, stats, notifikasi, admin_it, eselon_1, dll.)
│   ├── services/            # Layanan ekstraksi, OCR, & rekonsiliasi dokumen
│   └── migrations/          # Skrip migrasi skema & master data
├── frontend/                # Frontend Next.js 14 (App Router + TypeScript)
│   └── src/
│       ├── app/             # Halaman berdasarkan role (staff, pimpinan, eselon-1, kl, admin-it, login)
│       ├── components/      # Komponen UI (Sidebar, UploadModal, Peta, Kertas Kerja, TagihanDokumenModal)
│       ├── context/         # AuthContext & manajemen sesi
│       └── hooks/           # Custom hooks (useRequireAuth, useSidebarState)
├── database/                # Skema & seed SQL awal
├── docker-compose.yml       # Orkestrasi db, backend_py, frontend, phpmyadmin
├── jalankan-web.bat         # Script menjalankan container Docker
├── cek-ip.bat               # Script cek URL akses Wi-Fi lokal
└── buka-akses-wifi.bat      # Script pembuka port Firewall Windows
```
