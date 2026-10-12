# 📘 PANDUAN LENGKAP FITUR FRONTEND (FE) UNTUK 7 AKUN SISTEM
## Berdasarkan Model 2 Role Utama (`operator` & `manajemen`) dan 3 Tingkatan Posisi (`satker`, `eselon_1`, `kl`)

> Dokumen ini menjelaskan secara detail **apa saja yang bisa diakses dan dilakukan dari antarmuka Frontend (FE)** oleh masing-masing dari ke-7 akun pengguna representatif, mulai dari URL login, rute halaman, menu sidebar, form/tombol aksi, alur verifikasi berkas, hingga batasan hak aksesnya.

---

## 📑 DAFTAR ISI
1. [Matriks Perbandingan Cepat 7 Akun](#1-matriks-perbandingan-cepat-7-akun)
2. [Alur Aliran Berkas & Interaksi Antar Akun di FE](#2-alur-aliran-berkas--interaksi-antar-akun-di-fe)
3. [Panduan Rinci Masing-Masing Akun](#3-panduan-rinci-masing-masing-akun)
   - [Akun 1: `operator_satker` (Operator Satker)](#akun-1-operator_satker-operator-tingkat-satker)
   - [Akun 2: `admin_satker` (Manajemen Satker)](#akun-2-admin_satker-manajemen-tingkat-satker)
   - [Akun 3: `staff_eselon1` (Staff Ditjen Eselon 1)](#akun-3-staff_eselon1-staff-eselon-1--operator-ditjen-dikti)
   - [Akun 4: `pimpinan_eselon1` (Pimpinan Ditjen Eselon 1)](#akun-4-pimpinan_eselon1-pimpinan-eselon-1--manajemen-ditjen-dikti)
   - [Akun 5: `operator_kl` (Operator K/L Pusat)](#akun-5-operator_kl-operator-tingkat-kl)
   - [Akun 6: `admin_kl` (Manajemen K/L Pusat)](#akun-6-admin_kl-manajemen-tingkat-kl)
   - [Akun 7: `it_admin` (IT Administrator K/L)](#akun-7-it_admin-it-administrator-sistem)
4. [Tabel Matriks Akses Halaman & Rute URL](#4-tabel-matriks-akses-halaman--rute-url)

---

## 1. MATRIKS PERBANDINGAN CEPAT 7 AKUN

> **Password default untuk semua akun testing:** `Password@123`

| No | Username | Role Database | Tingkat | Wilayah / Instansi Kerja | Landing Page FE | Fokus Utama Pekerjaan di Frontend |
|:--:|:---|:---:|:---:|:---|:---|:---|
| **1** | **`operator_satker`** | `operator` | `satker` | DITJEN DIKTI (PTN BH UGM) | `/staff/dokumen` | Upload dokumen, input rekening koran, catat transaksi kas harian. |
| **2** | **`admin_satker`** | `manajemen` | `satker` | DITJEN DIKTI (PTN BH UGM) | `/pimpinan` | Verifikasi awal satker (`lolos_admin`), audit OCR saldo, pantau kas satker. |
| **3** | **`staff_eselon1`** | `operator` | `eselon_1` | Ditjen Pendidikan Tinggi (Dikti) | `/eselon-1` | Rekapitulasi 96 satker Dikti, kompilasi RK, input kas AI, upload dokumen. |
| **4** | **`pimpinan_eselon1`** | `manajemen` | `eselon_1` | Ditjen Pendidikan Tinggi (Dikti) | `/eselon-1` | Verifikasi final dokumen (`terverifikasi`), kembalikan revisi, kelola akun binaan. |
| **5** | **`operator_kl`** | `operator` | `kl` | Kementerian Pusat (K/L) | `/eselon-1` | Konsolidasi nasional 5 Ditjen (153 Satker), ekspor RK nasional untuk Kemenkeu. |
| **6** | **`admin_kl`** | `manajemen` | `kl` | Kementerian Pusat (K/L) | `/eselon-1` | Dashboard eksekutif nasional, pengawasan likuiditas & kepatuhan seluruh instansi. |
| **7** | **`it_admin`** | `operator`* | `kl` | Server IT K/L (Super Admin) | `/admin-it` | Kelola master user se-Indonesia, master satker, reset password, live audit log. |

*\*Catatan: `it_admin` memiliki izin khusus `permissions.can_manage_users = true` dan `is_it = true`.*

---

## 2. ALUR ALIRAN BERKAS & INTERAKSI ANTAR AKUN DI FE

```
[ 1. operator_satker ]
       │ Upload Dokumen Laporan (PDF/Excel) & Klik "Ajukan Verifikasi"
       ▼ (Status: menunggu_verifikasi)
[ 2. admin_satker ]
       │ Tinjau PDF + Audit Ulang Angka OCR
       ├─► [Minta Revisi] ─────────────► Berkas kembali ke operator_satker (Status: revisi)
       │
       ▼ [Loloskan Satker] (Status: lolos_admin)
[ 3. staff_eselon1 ]
       │ Rekapitulasi, input kas AI & upload dokumen pendukung 96 satker binaan
       ▼
[ 4. pimpinan_eselon1 ]
       │ Tinjau Akhir Berkas Eselon 1
       ├─► [Kembalikan Revisi] ────────► Berkas kembali ke satker dengan catatan Ditjen
       │
       ▼ [Setujui & Publish] (Status: terverifikasi / SELESAI)
[ 5. operator_kl ] & [ 6. admin_kl ]
       │ Monitoring Konsolidasian Nasional (153 Satker) & Pelaporan Kemenkeu
       ▼
[ 7. it_admin ]
         Memantau seluruh jejak audit secara real-time & menjaga stabilitas sistem
```

---

## 3. PANDUAN RINCI MASING-MASING AKUN

---

### AKUN 1: `operator_satker` (Operator Tingkat Satker)
* **Kredensial:** `operator_satker` / `Password@123`
* **Instansi:** PTN BH - Universitas Gadjah Mada (UGM)
* **Role & Tingkat:** `operator` di tingkat `satker`
* **Landing Page:** `/staff/dokumen`
* **Layout / Sidebar:** `StaffSidebar`

#### 📌 Menu yang Muncul di Sidebar:
1. **Dokumen** (`/staff/dokumen`)
2. **Rekening Koran** (`/staff/rekening-koran`)
3. **Pencatatan** (`/staff/pencatatan`)
4. **Profil** (`/staff/profil`)
5. *Shortcut Eksternal:* **Dashboard Laporan Publik** (`/laporan`)

#### 🛠️ Apa Saja yang Bisa Dilakukan di FE:
1. **Upload Dokumen Baru (`/staff/dokumen`):**
   - Klik tombol **"+ Upload Dokumen"** untuk membuka modal upload.
   - Mengisi form: Judul dokumen, Kategori berkas (LPJ, SPM, SP2D, dll), Periode Laporan (Bulan atau Semester, serta Tahun).
   - Melampirkan file dokumen (format PDF, Excel `.xlsx`, atau Word `.docx`).
   - File tersimpan dengan status awal **`draft`**.
2. **Mengajukan Dokumen ke Pimpinan:**
   - Pada baris dokumen yang berstatus `draft`, klik tombol **"Ajukan Verifikasi"**.
   - Status dokumen otomatis berubah menjadi **`menunggu_verifikasi`** sehingga masuk ke antrian verifikasi Pimpinan Satker (`admin_satker`).
3. **Memonitor Status Dokumen & Menangani Revisi:**
   - Melihat label status dokumen:
     - `Draft`: Masih bisa diedit bebas oleh staf.
     - `Menunggu Pimpinan`: Sedang ditinjau oleh pimpinan kampus.
     - `Menunggu Eselon 1` (`lolos_admin`): Sudah lolos dari kampus, sedang menunggu Ditjen.
     - `Selesai` (`terverifikasi`): Dokumen telah disahkan secara resmi.
     - `Perlu Perbaikan` (`revisi`): Ditolak oleh pimpinan satker atau Ditjen.
   - Pada berkas berstatus `revisi`, operator bisa membaca catatan koreksi dan mengklik tombol **"Perbaiki / Upload Ulang"**.
4. **Manajemen Rekening Koran Satker (`/staff/rekening-koran`):**
   - Mengunggah file Excel Rekening Koran bank satker.
   - Melihat tabel rincian saldo rekening, saldo kas, saldo LPJ, dan mendeteksi selisih secara otomatis.
5. **Pencatatan Kas / BKU Satker (`/staff/pencatatan`):**
   - Menambahkan catatan transaksi kas masuk (kredit) dan keluar (debet).
   - Mengunggah bukti kuitansi / nota transaksi.
   - Melihat ringkasan saldo kas berjalan satker UGM.
6. **Profil Akun (`/staff/profil`):**
   - Memperbarui nama, email, dan mengganti password pribadi.

#### 🚫 Batasan Akses:
* Hanya bisa melihat dan mengelola data satkernya sendiri (UGM).
* Tidak bisa melihat data dari kampus atau satker lain.
* Tidak memiliki tombol untuk melakukan *approve/verifikasi* dokumen.
* Dilarang mengakses rute `/pimpinan`, `/eselon-1`, dan `/admin-it` (sistem akan otomatis melempar balik ke `/staff/dokumen`).

---

### AKUN 2: `admin_satker` (Manajemen Tingkat Satker)
* **Kredensial:** `admin_satker` / `Password@123`
* **Instansi:** PTN BH - Universitas Gadjah Mada (UGM)
* **Role & Tingkat:** `manajemen` di tingkat `satker` (Pimpinan Kampus / PPK / KPA)
* **Landing Page:** `/pimpinan`
* **Layout / Sidebar:** `PimpinanSidebar`

#### 📌 Menu yang Muncul di Sidebar:
1. **Dashboard** (`/pimpinan`)
2. **Dokumen** (`/pimpinan/dokumen`)
3. **Rekening Koran** (`/pimpinan/rekening-koran`)
4. **Pencatatan** (`/pimpinan/pencatatan`)
5. **Manajemen User** (`/pimpinan/users`)
6. **Log Aktivitas** (`/pimpinan/logs`)
7. **Profil** (`/pimpinan/profil`)
8. *Shortcut:* **Dashboard Laporan Publik** (`/laporan`)

#### 🛠️ Apa Saja yang Bisa Dilakukan di FE:
1. **Eksekutif Dashboard Satker (`/pimpinan`):**
   - Memantau kartu ringkasan dokumen: Jumlah berkas menunggu verifikasi pimpinan, berkas menunggu Ditjen, berkas selesai, dan berkas revisi.
   - Grafik rekonsiliasi kas vs saldo bank satker UGM.
2. **Verifikasi Dokumen Tahap 1 (`/pimpinan/dokumen`):**
   - Tampilan *split-screen*: Daftar dokumen di sisi kiri, dan panel tinjauan berkas di sisi kanan.
   - **Live In-Browser Preview**: Membaca isi berkas PDF secara langsung tanpa perlu download.
   - **Fitur Audit Ulang OCR**: Tombol untuk memindai ulang nilai nominal rekening koran vs nilai di tabel laporan.
   - **Tombol "Loloskan Satker":** Menyetujui dokumen satker. Status berkas berubah menjadi **`lolos_admin`** dan berkas diteruskan ke meja Ditjen Eselon 1.
   - **Tombol "Minta Revisi":** Menolak dokumen dengan wajib mengisi kolom catatan koreksi perbaikan. Dokumen kembali ke operator satker dengan status `revisi`.
3. **Pengawasan Rekening Koran Satker (`/pimpinan/rekening-koran`):**
   - Memeriksa kesesuaian saldo buku bank vs saldo riil satker UGM.
4. **Audit Pencatatan Kas (`/pimpinan/pencatatan`):**
   - Memeriksa rincian kas masuk/keluar yang dicatat oleh staf operator dan meninjau bukti foto nota/struk.
5. **Manajemen Staf Internal Satker (`/pimpinan/users`):**
   - Melihat daftar akun operator di lingkungan satker UGM.
   - Melihat riwayat login dan status aktifitas stafnya.
6. **Log Aktivitas Satker (`/pimpinan/logs`):**
   - Memantau riwayat aktivitas berkas dan transaksi di lingkungan satker UGM.

#### 🚫 Batasan Akses:
* Terisolasi hanya pada satker UGM (tidak bisa memverifikasi berkas satker lain).
* Keputusan persetujuan satker bukan tahap final (masih butuh pengesahan Ditjen Eselon 1).
* Dilarang mengakses rute `/eselon-1` dan `/admin-it`.

---

### AKUN 3: `staff_eselon1` (Staff Eselon 1 / Operator Ditjen Dikti)
* **Kredensial:** `staff_eselon1` / `Password@123`
* **Instansi:** Ditjen Pendidikan Tinggi (Ditjen Dikti)
* **Role & Tingkat:** `operator` di tingkat `eselon_1` (Staff Operasional Eselon 1)
* **Landing Page:** `/eselon-1`
* **Layout / Sidebar:** `Eselon1Sidebar` (Label: `Staff Eselon 1 • DITJEN DIKTI`)

#### 📌 Menu yang Muncul di Sidebar:
1. **Dashboard** (`/eselon-1`)
2. **Dokumen Satker** (`/eselon-1/dokumen`)
3. **Pencatatan Kas Binaan** (`/eselon-1/pencatatan`)
4. **Rekening Koran Binaan** (`/eselon-1/rekening-koran`)
5. **Profil** (`/eselon-1/profil`)
6. *Shortcut:* **Dashboard Laporan Publik** (`/laporan`)

#### 🛠️ Apa Saja yang Bisa Dilakukan di FE:
1. **Dashboard Agregasi 96 Satker Binaan (`/eselon-1`):**
   - Memantau statistik progres pelaporan dari seluruh 96 kampus PTN dan LLDIKTI di bawah Ditjen Dikti.
   - Diagram pie status dokumen dan area chart tren berkas harian.
2. **Upload Dokumen Pendukung & Monitoring Dokumen Binaan (`/eselon-1/dokumen`):**
   - Tombol **`+ Unggah Dokumen`**: Mengunggah berkas laporan/dokumen pendukung tingkat Ditjen.
   - Filter dokumen berdasarkan kampus satker, kategori berkas, periode semester/bulan, dan status.
   - Meninjau file lampiran (PDF/Excel) yang dikirim oleh satker binaan.
   - *(Tombol "Sahkan" dan "Revisi" disembunyikan karena bukan wewenang staf)*.
3. **History & Input Pencatatan Kas Satker Binaan (`/eselon-1/pencatatan`):**
   - Melihat history transaksi kas seluruh 96 satker binaan Dikti dengan filter kampus satker & kategori dokumen.
   - Form input pencatatan kas baru dengan fitur **Auto-Scan AI Rekening Koran** (otomatis mendeteksi nama Bank BUMN dan membaca saldo akhir di baris paling bawah).
   - Pratinjau kuitansi/bukti transaksi dan export history kas ke Excel (`.xlsx`).
4. **Kompilasi & Import Rekening Koran Ditjen Dikti (`/eselon-1/rekening-koran`):**
   - Mengakses kertas kerja rekening koran dari 96 satker binaan Dikti.
   - Fitur upload & parse Excel kertas kerja rekonsiliasi perbankan.
   - Filter per satker, ekspor Excel kompilasi, serta fitur **Export ZIP Bukti Berkas** per satker binaan.
5. **Profil Akun (`/eselon-1/profil`):**
   - Memperbarui informasi akun dan mengganti password pribadi.

#### 🚫 Batasan Akses:
* **Tanpa Hak Verifikasi/Approval:** Tidak memiliki wewenang mengesahkan/menolak dokumen satker (endpoint backend `PATCH /api/dokumen/{id}/eselon-1-verify` mengembalikan status `403 Forbidden`).
* Menu `Manajemen User` (`/eselon-1/users`) dan `Log Aktivitas` (`/eselon-1/logs`) disembunyikan dari sidebar staf (khusus Pimpinan).
* Terbatas hanya pada 96 satker di bawah naungan Ditjen Dikti.

---

### AKUN 4: `pimpinan_eselon1` (Pimpinan Eselon 1 / Manajemen Ditjen Dikti)
* **Kredensial:** `pimpinan_eselon1` / `Password@123`
* **Instansi:** Ditjen Pendidikan Tinggi (Ditjen Dikti)
* **Role & Tingkat:** `manajemen` di tingkat `eselon_1` (Dirjen / Sesditjen / Pimpinan Pembina)
* **Landing Page:** `/eselon-1`
* **Layout / Sidebar:** `Eselon1Sidebar` (Label: `Pimpinan Eselon 1 • DITJEN DIKTI`)

#### 📌 Menu yang Muncul di Sidebar:
1. **Dashboard** (`/eselon-1`)
2. **Monitor Dokumen** (`/eselon-1/dokumen`)
3. **Pencatatan Kas Binaan** (`/eselon-1/pencatatan`)
4. **Rekening Koran Binaan** (`/eselon-1/rekening-koran`)
5. **Manajemen User** (`/eselon-1/users`)
6. **Log Aktivitas** (`/eselon-1/logs`)
7. **Profil** (`/eselon-1/profil`)
8. *Shortcut:* **Dashboard Laporan Publik** (`/laporan`)

#### 🛠️ Apa Saja yang Bisa Dilakukan di FE:
1. **Eksekutif Dashboard Ditjen Dikti (`/eselon-1`):**
   - Evaluasi kepatuhan pelaporan seluruh 96 kampus binaan.
   - Rekapitulasi status kepatuhan, keterlambatan setor, atau potensi selisih saldo rekening koran.
2. **Approval Final Dokumen Laporan (`/eselon-1/dokumen`):**
   - Antrian dokumen **"Menunggu Eselon 1"** (berkas yang sudah disetujui pimpinan kampus/`lolos_admin`).
   - Modal tinjauan berkas lengkap dengan pratinjau PDF resolusi penuh.
   - **Tombol "Setujui & Sahkan":** Memberikan pengesahan final institusi. Status dokumen berubah menjadi **`terverifikasi`** (dokumen sah untuk dilaporkan ke K/L).
   - **Tombol "Kembalikan Revisi":** Mengembalikan dokumen ke kampus bersangkutan dengan catatan resmi Ditjen.
3. **Pengawasan Rekap Kas & Rekening Koran Satker Binaan:**
   - Melihat history pencatatan kas dan saldo rekening koran 96 satker binaan.
   - Mode view-only & audit trail: Ekspor Excel dan unduh arsip ZIP bukti berkas.
4. **Kontrol Akun Satker Binaan (`/eselon-1/users`):**
   - **Toggle Status Akun:** Mengaktifkan atau menonaktifkan akun operator/pimpinan kampus binaan.
   - **Reset Password Pengguna Satker:** Mereset kata sandi staf/pimpinan satker binaan jika dibutuhkan.
5. **Audit Trail Ditjen (`/eselon-1/logs`):**
   - Melacak secara detail riwayat aktivitas di lingkungan 96 satker Dikti.

#### 🚫 Batasan Akses:
* Terbatas pada lingkup 96 satker Ditjen Dikti.
* Tidak mengelola master server database di `/admin-it`.

---

### AKUN 5: `operator_kl` (Operator Tingkat K/L Pusat)
* **Kredensial:** `operator_kl` / `Password@123`
* **Instansi:** Kementerian Pusat (K/L)
* **Role & Tingkat:** `operator` di tingkat `kl` (Biro Keuangan / Tim Konsolidasi Nasional)
* **Landing Page:** `/eselon-1`
* **Layout / Sidebar:** `Eselon1Sidebar`

#### 📌 Menu yang Muncul di Sidebar:
1. **Dashboard** (`/eselon-1`)
2. **Monitor Dokumen** (`/eselon-1/dokumen`)
3. **Rekening Koran** (`/eselon-1/rekening-koran`)
4. **Manajemen User** (`/eselon-1/users`)
5. **Log Aktivitas** (`/eselon-1/logs`)
6. **Profil** (`/eselon-1/profil`)

#### 🛠️ Apa Saja yang Bisa Dilakukan di FE:
1. **Dashboard Agregasi Nasional (153 Satker):**
   - Memantau laporan konsolidasi seluruh kementerian yang mencakup 5 Unit Eselon 1 (Setjen, Dikti, Vokasi, Saintek, Itjen).
2. **Monitoring Aliran Dokumen Nasional:**
   - Memantau berkas laporan masuk dari seluruh wilayah Indonesia tanpa sekat unit eselon.
   - Pengecekan silang dokumen sebelum dilaporkan ke Kementerian Keuangan (SPAN / SAKTI).
3. **Rekapitulasi Rekening Koran Nasional (`/eselon-1/rekening-koran`):**
   - Mengakses data rekening koran seluruh 153 satker di Indonesia.
   - Mengunduh rekapitulasi data saldo bank gabungan nasional ke dalam format Excel untuk bahan Laporan Keuangan Kementerian (LKKL).
4. **Monitoring Pengguna Nasional (`/eselon-1/users`):**
   - Memantau data pengguna dari seluruh tingkatan Satker dan Ditjen di Indonesia.

#### 🚫 Batasan Akses:
* Tidak memiliki hak akses super admin untuk merubah konfigurasi sistem di `/admin-it`.

---

### AKUN 6: `admin_kl` (Manajemen Tingkat K/L Pusat)
* **Kredensial:** `admin_kl` / `Password@123`
* **Instansi:** Kementerian Pusat (K/L)
* **Role & Tingkat:** `manajemen` di tingkat `kl` (Menteri / Sekjen / Kepala Biro Keuangan)
* **Landing Page:** `/eselon-1`
* **Layout / Sidebar:** `Eselon1Sidebar`

#### 📌 Menu yang Muncul di Sidebar:
1. **Dashboard** (`/eselon-1`)
2. **Monitor Dokumen** (`/eselon-1/dokumen`)
3. **Rekening Koran** (`/eselon-1/rekening-koran`)
4. **Manajemen User** (`/eselon-1/users`)
5. **Log Aktivitas** (`/eselon-1/logs`)
6. **Profil** (`/eselon-1/profil`)
7. *Shortcut:* **Dashboard Laporan Publik** (`/laporan`)

#### 🛠️ Apa Saja yang Bisa Dilakukan di FE:
1. **Dashboard Eksekutif Tertinggi Nasional (`/eselon-1`):**
   - Pengawasan menyeluruh terhadap performa pelaporan 153 satker dan 5 Ditjen Eselon 1.
   - Grafik kepatuhan nasional: Persentase dokumen yang telah terverifikasi, dalam proses, dan revisi.
   - Analisis kesehatan pelaporan keuangan kementerian.
2. **Pengawasan & Audit Dokumen Nasional (`/eselon-1/dokumen`):**
   - Melihat dan memeriksa seluruh berkas laporan se-Indonesia.
   - Mengontrol berkas-berkas yang lolos verifikasi maupun yang terhambat revisi.
3. **Monitoring Likuiditas Kas Perbankan Nasional (`/eselon-1/rekening-koran`):**
   - Memantau kertas kerja rekening koran seluruh bank mitra kementerian secara nasional.
   - Deteksi dini satker-satker yang memiliki deviasi selisih kas tidak wajar.
4. **Supervisi Tata Kelola Pengguna (`/eselon-1/users`):**
   - Meninjau sebaran dan keaktifan aparatur pengelola laporan keuangan se-Indonesia.

#### 🚫 Batasan Akses:
* Tidak melakukan konfigurasi teknis server database (tugas teknis ditangani oleh `it_admin`).

---

### AKUN 7: `it_admin` (IT Administrator Sistem)
* **Kredensial:** `it_admin` / `Password@123`
* **Instansi:** Server IT & Master Data K/L (Pusat)
* **Role & Tingkat:** `operator` (Tingkat `kl`) dengan izin khusus `permissions.can_manage_users = true` dan `is_it = true`
* **Landing Page:** `/admin-it`
* **Layout / Sidebar:** `AdminITSidebar`

#### 📌 Menu yang Muncul di Sidebar:
1. **System Overview** (`/admin-it`)
2. **Manajemen Satker** (`/admin-it/satker`)
3. **User Management** (`/admin-it/users`)
4. **Kategori Dokumen** (`/admin-it/kategori`)
5. **Pencatatan** (`/admin-it/pencatatan`)
6. **Rekening Koran** (`/admin-it/rekening-koran`)
7. **Real-Time Logs** (`/admin-it/logs`)
8. *Akses Lintas Portal:* Bebas mengakses portal pimpinan (`/pimpinan`), portal eselon 1 (`/eselon-1`), portal staf (`/staff/dokumen`), maupun publik (`/laporan`).

#### 🛠️ Apa Saja yang Bisa Dilakukan di FE:
1. **System Health & Overview Dashboard (`/admin-it`):**
   - Metrik kesehatan server: Status koneksi database MySQL, penggunaan CPU & Memory, total dokumen terunggah, serta jumlah percobaan gagal login.
   - Indikator real-time "Sistem Berjalan".
2. **Master User Management (`/admin-it/users`):**
   - **Tambah Pengguna Baru:** Form modal untuk mendaftarkan akun baru se-Indonesia.
     - Pilihan Role: `Operator` atau `Manajemen`.
     - Pilihan Tingkat: `Satker`, `Eselon 1`, atau `K/L`.
     - Pemilihan relasi Satker (153 pilihan) atau Ditjen Eselon 1 (5 pilihan).
     - Granular Permissions: Checklist izin khusus (`can_upload`, `can_verify`, `can_delete`, `can_manage_users`, `can_access_sql`).
   - **Bulk Import User via Excel:** Mengunggah file `.xlsx` untuk menambahkan ratusan akun sekaligus.
   - **Edit Pengguna:** Mengubah nama, email, role, tingkat, maupun instansi penugasan.
   - **Reset Password Langsung:** Mengganti password user manapun dengan kata sandi baru.
   - **Hapus / Nonaktifkan Pengguna:** Menghapus atau menonaktifkan akun yang sudah tidak berlaku.
3. **Master Data Satker (`/admin-it/satker`):**
   - Kelola data master 153 Satker se-Indonesia (Tambah Satker, edit nama/kode satker, dan penghubungan ke Ditjen Eselon 1 pembina).
   - Import & Export data satker via Excel.
4. **Master Kategori Dokumen (`/admin-it/kategori`):**
   - Menambah, mengubah nama, atau menghapus kategori dokumen laporan (LPJ, SPM, SP2D, Kertas Kerja, dll).
5. **Master Kategori Pencatatan Kas (`/admin-it/pencatatan`):**
   - Mengelola kategori pos transaksi pembukuan kas (Belanja Pegawai, Belanja Modal, Pendapatan, dll).
   - Melihat dan memfilter seluruh transaksi kas dari semua satker se-Indonesia.
6. **Master Rekening Koran Global (`/admin-it/rekening-koran`):**
   - Melihat dan memelihara seluruh arsip kertas kerja rekening koran nasional.
7. **Live Security & Audit Logs (`/admin-it/logs`):**
   - Streaming log audit aktivitas seluruh pengguna secara real-time.
   - Mencatat aksi: `login`, `login_failed`, `logout`, `buat_dokumen`, `edit_dokumen`, `hapus_dokumen`, `approve_dokumen`, `reject_dokumen`.
   - Menampilkan detail IP address, browser user-agent, timestamp detik, dan payload parameter JSON.

---

## 4. TABEL MATRIKS AKSES HALAMAN & RUTE URL

| Rute URL Frontend | Nama Fitur / Halaman | `operator_satker` | `admin_satker` | `staff_eselon1` | `pimpinan_eselon1` | `operator_kl` | `admin_kl` | `it_admin` |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/login` | Halaman Masuk Akun | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/staff/dokumen` | Kelola & Upload Dokumen Satker | ✅ *(Utama)* | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/staff/rekening-koran` | Upload Rekening Koran Satker | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/staff/pencatatan` | Input Transaksi Kas Satker | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/pimpinan` | Dashboard Satker | ❌ | ✅ *(Utama)* | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/pimpinan/dokumen` | Verifikasi Berkas Tahap 1 | ❌ | ✅ *(Lolos/Revisi)*| ❌ | ❌ | ❌ | ❌ | ✅ |
| `/pimpinan/users` | Monitoring Staf Satker | ❌ | ✅ *(Satker)* | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/eselon-1` | Dashboard Ditjen & K/L | ❌ | ❌ | ✅ *(Utama)* | ✅ *(Utama)* | ✅ *(Utama)* | ✅ *(Utama)* | ✅ |
| `/eselon-1/dokumen` | Approval Final & Monitor Dokumen | ❌ | ❌ | ✅ *(Upload)* | ✅ *(Final Approve)*| ✅ *(Monitor)* | ✅ *(Monitor)* | ✅ |
| `/eselon-1/pencatatan` | History & Input Kas Satker Binaan | ❌ | ❌ | ✅ *(Input & Scan)* | ✅ *(Rekap & Audit)*| ❌ | ❌ | ✅ |
| `/eselon-1/rekening-koran` | Rekapitulasi Rekening Koran | ❌ | ❌ | ✅ *(96 Satker)* | ✅ *(96 Satker)* | ✅ *(153 Satker)*| ✅ *(153 Satker)*| ✅ |
| `/eselon-1/users` | Manajemen Akun Binaan | ❌ | ❌ | ❌ | ✅ *(Reset/Toggle)*| ✅ *(Lihat)* | ✅ *(Lihat)* | ✅ |
| `/admin-it` | Overview Sistem IT | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ *(Utama)* |
| `/admin-it/users` | Master User Management Nasional | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ *(Full CRUD)* |
| `/admin-it/satker` | Master 153 Satker | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ *(Full CRUD)* |
| `/admin-it/kategori` | Master Kategori Dokumen | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ *(Full CRUD)* |
| `/admin-it/logs` | Live Audit Trail Seluruh Sistem | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ *(Real-time)* |
| `/laporan` | Portal Publik Laporan Keuangan | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---
*Dokumen ini dibuat secara otomatis dan disesuaikan dengan arsitektur frontend web aplikasi terkini.*
