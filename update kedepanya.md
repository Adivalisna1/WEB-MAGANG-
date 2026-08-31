# Rencana Pengembangan & Tasklist (Update Kedepannya)

Dokumen ini menggabungkan seluruh rencana fitur, arsitektur teknis, dan checklist pengerjaan untuk pembaruan sistem.

---

## 📋 Ringkasan Fitur yang Akan Dikembangkan

### 1. 💰 Perbandingan Nominal Rekening Koran vs Excel (Sistem Berbasis Kategori)
* **Konsep:** Tidak semua jenis dokumen butuh input nominal (misal: Renstra/Renja tidak butuh). Oleh karena itu, pengaturannya dibuat dinamis per kategori.
* **Alur Admin:** Saat Admin membuat atau mengedit kategori, ada toggle opsi: **"Butuh Perbandingan Nominal?"**.
* **Alur Staff (Upload & Edit Dokumen):**
  * Jika kategori yang dipilih memiliki fitur nominal aktif (`perlu_nominal = 1`), maka di bawah input **Tahun** akan otomatis muncul:
    1. **Input Nilai Rekening Koran (Rp)** — format angka ribuan.
    2. **Input Nilai dari Excel (Rp)** — format angka ribuan.
    3. **Indikator Selisih Otomatis:**
       * 🟢 Hijau + badge **"Cocok (Match)"** jika selisih = 0.
       * 🔴 Merah + badge **"Selisih: Rp [Jumlah]"** jika ada perbedaan nilai.
  * Jika kategori tidak mengaktifkan fitur nominal, form tetap bersih seperti biasa tanpa input nominal.

---

### 2. 👤 Halaman Profil & Ganti Password untuk Semua Role (Admin, Ketua Tim, Staff)
* **Konsep:** Fitur profil dan ganti password yang sebelumnya hanya ada di Staff sekarang tersedia untuk semua pengguna.
* **Implementasi:**
  * Komponen antarmuka profil dibuat reusable (`ProfilContent.tsx`).
  * Tersedia di rute: `/staff/profil`, `/admin/profil`, dan `/ketua/profil`.
  * Menampilkan informasi akun (nama, username, email, role, last login) serta form ganti password mandiri (Password Lama, Password Baru, Konfirmasi Password).

---

### 3. 🖱️ Navigasi Cepat: Klik Username di Sidebar Pojok Kiri Menuju Profil
* **Konsep:** Pengguna dapat langsung mengklik box nama/avatar mereka di sidebar dashboard untuk langsung membuka halaman profil.
* **Implementasi:**
  * Di `Sidebar.tsx` (Staff), `AdminSidebar.tsx` (Admin), dan `KetuaSidebar.tsx` (Ketua Tim), area info akun dibungkus dengan link ke halaman profil masing-masing role.
  * Dilengkapi efek hover visual (highlight background & pointer) agar jelas dapat diklik.

---

### 4. 👑 Hak Akses Penuh Admin (Superadmin Management)
* **Konsep:** Sesuai arahan mentor dan ketua tim, Admin memiliki otoritas tertinggi dalam manajemen user.
* **Implementasi:**
  * **Buat Akun Ketua Tim:** Admin dapat memilih role "Ketua Tim" (`role_id: 3`) saat menambah user baru.
  * **Hapus & Nonaktifkan:** Menghapus pembatasan backend sehingga Admin dapat menonaktifkan atau menghapus akun Ketua Tim jika diperlukan.
  * **Reset Password User:** Admin dapat mereset password akun user/ketua tim lain secara langsung tanpa perlu mengetahui password lama.

---

### 5. 🔒 Penegakan Single-Device Login (1 Akun = 1 Perangkat Aktif)
* **Konsep:** Satu akun hanya dapat aktif di satu perangkat pada satu waktu.
* **Implementasi:**
  * Saat login baru berhasil di perangkat B, sesi lama di perangkat A ditandai `is_online = 0`.
  * Middleware backend memeriksa status sesi; jika sesi lama mencoba mengakses API, sistem menolak dengan status 401 ("Sesi telah berakhir karena akun login di perangkat lain").
  * Frontend menangani respon tersebut dan mengarahkan kembali ke halaman login.

---

## 🗄️ Rencana Perubahan Database (SQL Migration)

```sql
-- 1. Tambah toggle perbandingan nominal pada kategori
ALTER TABLE kategori_dokumen
  ADD COLUMN perlu_nominal TINYINT(1) NOT NULL DEFAULT 0 
  COMMENT '1 = butuh input perbandingan rekening koran vs excel, 0 = tidak';

-- 2. Tambah kolom nominal pada tabel dokumen
ALTER TABLE dokumen
  ADD COLUMN nilai_rekening_koran DECIMAL(18,2) NULL COMMENT 'Nominal rekening koran',
  ADD COLUMN nilai_excel          DECIMAL(18,2) NULL COMMENT 'Nominal data excel';
```

---

## ✅ Tasklist / Checklist Pengerjaan

### A. Database & Backend
- [x] **Database Migration:** File `database/migration_v3.sql` sudah dibuat.
- [x] **Admin Controller (`adminController.js`):**
  - [x] Update `createKategori` dan `updateKategori` untuk menyertakan field `perlu_nominal`.
  - [x] Buka izin `toggleUserActive` dan `deleteUser` agar Admin dapat mengelola user Ketua Tim (`role_id: 3`).
  - [x] Tambahkan handler `resetUserPassword` khusus Admin untuk mengganti password user lain.
- [x] **Admin Routes (`admin.js`):**
  - [x] Tambahkan route `PATCH /api/admin/users/:id/password` → `resetUserPassword`.
- [x] **Dokumen Controller (`dokumenController.js`):**
  - [x] Update `getKategori` (publik) untuk mengembalikan status `perlu_nominal`.
  - [x] Update `uploadDokumen` & `editDokumen` untuk menerima dan menyimpan `nilai_rekening_koran` dan `nilai_excel`.
  - [x] Sertakan data nominal pada `getAllDokumen`.
- [x] **Middleware Auth (`auth.js`):**
  - [x] Validasi keaktifan sesi di database (`user_sessions.is_online = 1`) untuk single-device login. Return `SESSION_KICKED` jika sesi sudah ditendang.

---

### B. Frontend — Komponen & Halaman Profil
- [x] **Shared Component (`ProfilContent.tsx`):** Komponen profil & form ganti password universal.
- [x] **Halaman Profil Tiap Role:**
  - [x] Refactor `staff/profil/page.tsx` memakai shared component.
  - [x] Buat halaman baru `admin/profil/page.tsx`.
  - [x] Buat halaman baru `ketua/profil/page.tsx`.
- [x] **Interaksi Sidebar (Klik Username ke Profil):**
  - [x] Update `Sidebar.tsx` (Staff) — username clickable ke `/staff/profil`.
  - [x] Update `AdminSidebar.tsx` — username clickable ke `/admin/profil` + menu Profil.
  - [x] Update `KetuaSidebar.tsx` — username clickable ke `/ketua/profil` + menu Profil.

---

### C. Frontend — Kelola Kategori & User (Admin)
- [x] **Kelola Kategori (`admin/kategori/page.tsx`):**
  - [x] Toggle switch "Butuh Perbandingan Nominal?" di modal Tambah dan Edit Kategori.
  - [x] Badge indikator `💲 Nominal` pada tabel list kategori yang memiliki fitur nominal aktif.
- [x] **Manajemen User (`admin/users/page.tsx`):**
  - [x] Tambahkan opsi role "Ketua Tim" pada dropdown form Tambah User.
  - [x] Tambahkan tombol & modal "Reset Password" pada tabel daftar user.
  - [x] Update deskripsi: "Kelola akun admin, staff, dan ketua tim".

---

### D. Frontend — Form Dokumen (Perbandingan Rekening Koran vs Excel)
- [x] **Form Upload (`staff/dokumen/upload/page.tsx`):**
  - [x] Deteksi apakah kategori yang dipilih memiliki `perlu_nominal = 1`.
  - [x] Tampilkan input nominal Rekening Koran dan Excel di bawah input Tahun.
  - [x] Kalkulasi otomatis selisih nilai (🟢 Cocok / 🔴 Selisih).
  - [x] Kirim data nominal saat submit upload.
- [x] **Form Edit (`staff/dokumen/[id]/edit/page.tsx`):**
  - [x] Load dan tampilkan data nominal yang sudah ada sebelumnya.
  - [x] Izinkan perubahan nilai nominal jika kategori mendukung perbandingan.

---

### E. Pengujian & Verifikasi
- [ ] **PENTING:** Jalankan `migration_v3.sql` di database lokal dan Railway sebelum testing.
- [ ] Verifikasi build Next.js (`npm run build`) berjalan bersih tanpa error.
- [ ] Uji coba pembuatan kategori dengan toggle nominal aktif dan nonaktif.
- [ ] Uji coba input nominal dan verifikasi perhitungan selisih rekening koran vs excel.
- [ ] Uji coba navigasi profil via klik username di seluruh role.
- [ ] Uji coba ganti password mandiri dan reset password oleh Admin.
- [ ] Uji coba proteksi single-device login.

