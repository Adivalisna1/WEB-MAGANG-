# 📚 DOKUMENTASI SISTEM: ALUR DOKUMEN SATKER KAMPUS & SATKER ESELON 1

> **Tentang Dokumen Ini:**  
> Panduan ini mendokumentasikan secara rinci dan terpisah mengenai alur kerja (*lifecycle*), hak akses, fitur antarmuka, serta aturan validasi dokumen pada dua tingkatan utama:  
> 1. **Satker Kampus (Tingkat Satker / Unit Pelaksana Teknis)**  
> 2. **Satker Eselon 1 (Tingkat Direktorat Jenderal / Unit Pembina)**  
>
> Kedua tingkatan ini memiliki fungsi, tanggung jawab, dan batasan data yang **berbeda secara fundamental**.

---

# 🏛️ BAGIAN 1: ALUR DOKUMEN SATKER KAMPUS (TINGKAT SATKER)

Bagian ini khusus mengatur operasional pada tingkat unit pelaksana riil di lapangan, seperti Universitas, Institut, Politeknik Negeri, dan Balai/Satker daerah.

---

### 1.1 Karakteristik & Peran Satker Kampus
- **Posisi Sistem:** Pembuat data primer (*data producer*).
- **Ruang Lingkup (Scope Data):** **Lokal & Terisolasi**. Pengguna hanya dapat melihat, mengunggah, dan memproses data dari **1 satker kampusnya sendiri** (contoh: Akun UGM hanya bisa mengelola data satker UGM).
- **Aktor Pengguna:**
  1. **Staff Satker (`operator`)**: Pelaksana operasional teknis input data dan upload berkas laporan.
  2. **Pimpinan Satker (`manajemen`)**: Rektor, PPK, Dekan, atau Pejabat Pembuat Komitmen yang bertindak sebagai verifikator tahap pertama.

---

### 1.2 Diagram Aliran Berkas Satker Kampus

```text
       [ Staff Satker (Operator Kampus) ]
                      │
                      │ 1. Mengunggah file laporan (PDF / Excel / Word)
                      ▼
             Status: "draft"
                      │
                      │ 2. Klik tombol "Ajukan Verifikasi"
                      ▼
       Status: "menunggu_verifikasi"
                      │
                      ▼
     [ Pimpinan Satker (Rektor / PPK Kampus) ]
                      │
                      │ 3. Meninjau berkas via Live PDF Preview & Audit OCR
                      ├────────────────────────────────────────┐
                      │                                        │
           [ Tombol: Minta Revisi ]               [ Tombol: Loloskan Satker ]
                      │                                        │
                      ▼                                        ▼
             Status: "revisi"                       Status: "lolos_admin"
     (Kembali ke Staff Kampus                (Selesai di internal kampus,
      untuk diperbaiki/upload ulang)          berkas naik ke Ditjen Eselon 1)
```

---

### 1.3 Langkah Demi Langkah Alur Satker Kampus

#### Tahap 1: Upload & Penyusunan Dokumen (`draft`)
- Dilakukan oleh: **Staff Satker** (`/staff/dokumen`)
- Form yang diisi:
  - Judul Dokumen (misal: *"Laporan Pertanggungjawaban Keuangan Periode Triwulan I"*)
  - Kategori Dokumen (LPJ, SPM, SP2D, BKU, Rekening Koran, dll.)
  - Periode Laporan: Tahun anggaran serta opsi Bulan / Semester.
  - File Lampiran: Dokumen format PDF, Excel (`.xlsx`), atau Word (`.docx`).
- Hasil: Dokumen tersimpan di server dengan status awal **`draft`**. Dokumen status draft masih bisa diedit atau dihapus secara bebas oleh staf kampus.

#### Tahap 2: Pengajuan Verifikasi Kampus (`menunggu_verifikasi`)
- Dilakukan oleh: **Staff Satker**
- Aksi: Staf menekan tombol **"Ajukan Verifikasi"** pada berkas yang sudah lengkap.
- Hasil: Status dokumen berubah menjadi **`menunggu_verifikasi`**. Dokumen terkunci dari pengeditan langsung dan secara otomatis masuk ke meja antrian review Pimpinan Satker.

#### Tahap 3: Verifikasi Tahap 1 oleh Pimpinan Kampus
- Dilakukan oleh: **Pimpinan Satker** (`/pimpinan/dokumen`)
- Antarmuka: Menggunakan tampilan *split-screen* (daftar berkas di kiri, *in-browser PDF preview* di kanan).
- Fitur Validasi:
  - **Live Preview:** Pimpinan membaca langsung isi dokumen tanpa harus mengunduh file ke komputer.
  - **Audit OCR Selisih:** Sistem mendeteksi otomatis nilai nominal rekening koran vs nilai nominal kas di tabel laporan.
- Keputusan Pimpinan Kampus:
  1. **Jika Ditemukan Kesalahan / Selisih $\rightarrow$ Klik "Minta Revisi"**:
     - Pimpinan wajib mengisi catatan perbaikan.
     - Status berubah menjadi **`revisi`**.
     - Dokumen kembali ke tabel Staff Satker beserta catatan koreksi agar staf mengunggah berkas perbaikan.
  2. **Jika Berkas Valid & Klop $\rightarrow$ Klik "Loloskan Satker"**:
     - Status dokumen berubah menjadi **`lolos_admin`**.
     - Berkas dinyatakan **lulus verifikasi internal kampus** dan otomatis diteruskan ke meja pengawasan **Ditjen Eselon 1 Pembina**.

---

### 1.4 Modul & Fitur Pendukung di Satker Kampus
1. **Rekening Koran Kampus (`/staff/rekening-koran` & `/pimpinan/rekening-koran`):**
   - Import file Excel rekening koran dari bank persepsi/operasional kampus.
   - Deteksi selisih saldo bank vs saldo pembukuan kampus secara instan.
2. **Pencatatan Kas / BKU Kampus (`/staff/pencatatan` & `/pimpinan/pencatatan`):**
   - Pencatatan transaksi kas masuk (*kredit*) dan kas keluar (*debet*).
   - Lampiran bukti nota kuitansi per transaksi.
3. **Manajemen User Internal (`/pimpinan/users`):**
   - Pimpinan kampus dapat melihat daftar staf internal di kampusnya sendiri serta riwayat login.

---

### 1.5 Batasan Hak Akses Satker Kampus
- ❌ **Tidak Bisa Approve Final:** Pimpinan kampus tidak memiliki hak mengeluarkan status `terverifikasi` (stempel final adalah wewenang Eselon 1).
- ❌ **Isolasi Kampus:** Tidak dapat melihat atau mengakses dokumen, transaksi kas, maupun rekening koran dari kampus lain.
- ❌ **Dilarang Akses Rute Pembina:** Akses ke rute `/eselon-1` dan `/admin-it` diblokir otomatis oleh sistem middleware.

---
---

# 🏢 BAGIAN 2: ALUR DOKUMEN SATKER ESELON 1 (TINGKAT DITJEN / PEMBINA)

Bagian ini khusus mengatur operasional pada tingkat Unit Utama Pembina (Eselon 1), seperti **Direktorat Jenderal Pendidikan Tinggi (Ditjen Dikti)**, **Sekretariat Jenderal (Setjen)**, **Ditjen Saintek**, dan **Inspektorat Jenderal (Itjen)**.

---

### 2.1 Karakteristik & Peran Satker Eselon 1
- **Posisi Sistem:** Pengawas, koordinator, dan validator final (*validator & aggregator*).
- **Ruang Lingkup (Scope Data):** **Menaungi Seluruh Satker Binaannya**.
  - **Ditjen Dikti:** Membina **149 Satker** (seluruh PTN BH, PTN BLU/Satker, Institut, Politeknik, dan LLDIKTI I-XVII).
  - **Setjen:** Membina **4 Satker** (Pusdatin, Pusat Pembiayaan & Asesmen Dikti, Badan Industri Mineral, Setjen).
  - **Ditjen Saintek:** Membina **7 Satker** (SMA Unggul Garuda & Balai Risbang).
  - **Itjen:** Membina **1 Satker** (Inspektorat Jenderal).
- **Aktor Pengguna:**
  1. **Staff Eselon 1 (`operator`)**: Pelaksana Ditjen untuk rekapitulasi data, monitoring 149 satker, kompilasi RK, dan upload dokumen pendukung Ditjen *(tanpa hak approval)*.
  2. **Pimpinan Eselon 1 (`manajemen`)**: Direktur Jenderal / Sekretaris Ditjen yang memegang wewenang pengesahan final atau penolakan kembali ke kampus.

---

### 2.2 Diagram Aliran Berkas di Meja Eselon 1

```text
      [ Dokumen Lolos dari Kampus ]
          (Status: "lolos_admin")
                     │
                     ▼
      [ Masuk Antrian Verifikasi Eselon 1 ]
                     │
       ┌─────────────┴─────────────────────────────┐
       │                                           │
  [ Staff Eselon 1 (Operator Ditjen) ]     [ Pimpinan Eselon 1 (Dirjen/Sesditjen) ]
  • Monitoring kepatuhan 149 satker        • Meninjau rekonsiliasi kas vs bank
  • Rekapitulasi & Kompilasi RK            • Memeriksa kelengkapan laporan
  • Export ZIP berkas per satker           • MEMUTUSKAN APPROVAL FINAL:
  • Upload dokumen kebijakan Ditjen                    │
  (DIBLOKIR DARI TOMBOL APPROVAL)          ┌───────────┴───────────┐
                                           │                       │
                                [ Tombol: Kembalikan ]    [ Tombol: Setujui & Sahkan ]
                                           │                       │
                                           ▼                       ▼
                                   Status: "revisi"      Status: "terverifikasi"
                             (Dokumen mental balik       (DOKUMEN SAH & FINAL,
                              ke Satker Kampus dengan     diterbitkan ke Publik &
                              catatan resmi dari Ditjen)  Menteri di K/L Pusat)
```

---

### 2.3 Langkah Demi Langkah Alur Satker Eselon 1

#### Tahap 1: Dokumen Lolos Masuk ke Antrian Ditjen (`lolos_admin`)
- Dokumen yang telah diloloskan oleh Pimpinan Satker kampus otomatis muncul pada halaman monitor Eselon 1 (`/eselon-1/dokumen`).
- Dokumen masuk ke widget khusus **"Menunggu Persetujuan Saya"** bagi akun Pimpinan Eselon 1.

#### Tahap 2: Telaah & Pengawasan oleh Staff Eselon 1
- Dilakukan oleh: **Staff Eselon 1** (`/eselon-1`)
- Aktivitas Staff:
  - Memeriksa kelengkapan laporan dari 149 satker binaan Dikti.
  - Memfilter dokumen berdasarkan kampus, kategori, dan periode.
  - Mengunduh atau memeriksa pratinjau dokumen PDF/Excel yang dikirim kampus.
  - Membantu pimpinan menyiapkan kompilasi rekening koran dan ekspor ZIP berkas bukti.
- **Batasan Penting:** Staff Eselon 1 **tidak memiliki wewenang approval**. Tombol persetujuan disembunyikan di UI dan jika memanggil API verifikasi secara langsung akan menerima error **`403 Forbidden`**.

#### Tahap 3: Keputusan Final oleh Pimpinan Eselon 1
- Dilakukan oleh: **Pimpinan Eselon 1** (`/eselon-1/dokumen`)
- Antarmuka: Modal Keputusan Persetujuan Final dengan verifikasi kecocokan saldo:
  - Nilai Rekening Koran vs Nilai Kas Excel satker ditampilkan berdampingan.
  - Indikator kecocokan otomatis: Lencana hijau *"Klop / Tidak Ada Selisih"* jika selisih = 0.
- Opsi Keputusan:
  1. **Jika Laporan Belum Sesuai $\rightarrow$ Klik "Kembalikan untuk Revisi"**:
     - Pimpinan Eselon 1 wajib menyertakan alasan penolakan/catatan arahan Ditjen.
     - Status dokumen berubah menjadi **`revisi`**.
     - Dokumen dikembalikan langsung ke akun kampus pengunggah agar diperbaiki.
  2. **Jika Laporan Valid & Sah $\rightarrow$ Klik "Setujui & Terbitkan"**:
     - Status dokumen berubah menjadi **`terverifikasi`** (*Status Tertinggi / Final*).
     - Dokumen diberi stempel digital `verified_by: Pimpinan Eselon 1` dan `verified_at: NOW()`.
     - Dokumen dipublikasikan (`is_public = 1`) dan siap dilaporkan ke tingkat Kementerian (K/L) serta Kementerian Keuangan.

---

### 2.4 Modul & Fitur Khusus Tingkat Eselon 1
1. **Executive Dashboard Ditjen (`/eselon-1`):**
   - Agregasi statistik dari seluruh 149 satker binaan Dikti.
   - Grafik tren harian, persentase kepatuhan satker, dan total anggaran terkonsolidasi.
2. **Monitoring & Filter Satker Binaan (`/eselon-1/dokumen`):**
   - Filter *dropdown* kampus hanya menampilkan 149 satker binaan Ditjen Dikti.
   - Pimpinan dapat melakukan audit ulang OCR jika angka pada berkas perlu discan ulang.
3. **Pencatatan Kas Konsolidasi dengan Auto-Scan AI (`/eselon-1/pencatatan`):**
   - Melihat histori transaksi seluruh satker binaan.
   - Perekaman kas dengan AI scanner dokumen yang otomatis mendeteksi nama bank BUMN dan saldo akhir rekening koran.
4. **Rekapitulasi Rekening Koran & Export ZIP (`/eselon-1/rekening-koran`):**
   - Mengompilasi kertas kerja rekonsiliasi bank per satker.
   - Tombol **"Export ZIP"** untuk mengunduh seluruh file bukti lampiran per kampus dalam satu arsip terkompresi.
5. **Manajemen Akun & Log Audit Binaan (`/eselon-1/users` & `/eselon-1/logs`):**
   - Pimpinan Eselon 1 dapat memantau status aktif akun operator & pimpinan dari 149 kampus binaannya serta riwayat aktivitas log.

---

### 2.5 Aturan Isolasi Antar-Eselon 1 (Cross-Eselon Guard)
Sistem menerapkan isolasi data dan hak approval yang sangat ketat:
- **Isolasi Daftar Satker:** Pimpinan Ditjen Dikti hanya menerima 149 satker Dikti di endpoint `/api/satker`. Satker milik Setjen (4 satker), Saintek (7 satker), dan Itjen (1 satker) otomatis di-filter keluar.
- **Isolasi Approval Dokumen:** Jika Pimpinan Ditjen Dikti mencoba menyetujui dokumen milik Satker Setjen/Saintek/Itjen melalui manipulasi request API, server akan menolak dengan pesan:
  > **HTTP 403 Forbidden:** *"Akses ditolak. Anda hanya berwenang menyetujui dokumen dari Satker binaan Eselon 1 Anda."*
- **Otoritas Mandiri:** Masing-masing Eselon 1 (Setjen, Dikti, Saintek, Itjen) berdaulat penuh menyetujui dokumen satker binaan mereka sendiri tanpa campur tangan Ditjen lain.

---
---

# 🔄 BAGIAN 3: TITIK TEMU & MATRIKS STATUS DOKUMEN

Tabel ini merangkum perjalanan status dokumen dari saat dibuat di Satker Kampus hingga disahkan final di Eselon 1:

| Status di Sistem | Posisi Berkas | Siapa yang Memegang | Aksi yang Tersedia |
| :--- | :--- | :--- | :--- |
| **`draft`** | Internal Satker Kampus | Staff Satker | Edit isi, ganti file, atau klik *"Ajukan Verifikasi"*. |
| **`menunggu_verifikasi`** | Meja Pimpinan Kampus | Pimpinan Satker | Tinjau PDF, cek selisih OCR, klik *"Minta Revisi"* atau *"Loloskan Satker"*. |
| **`lolos_admin`** | Meja Ditjen Eselon 1 | Pimpinan Eselon 1 | Rekapitulasi, verifikasi kas vs bank, klik *"Kembalikan"* atau *"Setujui & Terbitkan"*. |
| **`revisi`** | Dikembalikan ke Kampus | Staff Satker | Membaca catatan koreksi (dari Kampus atau Ditjen) dan mengunggah berkas perbaikan. |
| **`terverifikasi`** | **Sah Final Nasional** | Publik / Kemenkeu / K/L | Dokumen terkunci permanen, terarsip resmi, dan dipublikasikan di dashboard nasional. |

---

### 💡 Akun Uji Coba Resmi untuk Simulasi Alur:
1. **Satker Kampus (UGM):**
   - Staff Kampus: `staff_satker` / `Password@123`
   - Pimpinan Kampus: `pimpinan_satker` / `Password@123`
2. **Ditjen Eselon 1 Pembina (Ditjen Dikti):**
   - Staff Ditjen Dikti: `staff_eselon1` / `Password@123`
   - Pimpinan Ditjen Dikti: `pimpinan_eselon1` / `Password@123`
3. **Unit Eselon 1 Lain (Pembanding Isolasi):**
   - Pimpinan Setjen: `eselon_setjen` / `Password@123` (Hanya membina 4 satker Setjen)
