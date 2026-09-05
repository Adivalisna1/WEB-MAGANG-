# Web Dashboard Laporan

Sistem dashboard untuk menampilkan, mengelola, dan mengunduh dokumen laporan instansi pemerintah. Publik dapat mengunduh dokumen tanpa login, staff dapat upload dan mengajukan verifikasi, admin menyaring dokumen di tahap pertama, dan ketua tim memberikan persetujuan final untuk publikasi.

---

## Stack Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MySQL 8.0 |
| Auth | JWT + bcrypt |
| Infrastructure | Docker + Docker Compose |

---

## Cara Menjalankan

### Syarat
- Docker Desktop terinstall dan running

### Langkah

```bash
# 1. Clone repository
git clone https://github.com/username/web-dashboard-laporan.git
cd web-dashboard-laporan

# 2. Salin file env
cp .env.example .env
# Edit .env — isi password sesuai kebutuhan

# 3. Jalankan semua container
docker-compose up -d

# 4. Cek status container
docker-compose ps
```

### Rebuild setelah ada perubahan kode

```bash
docker-compose up -d --build
```

### Matikan web

```bash
docker-compose down
```

## Changelog

### v1.1.0 — 17 Agustus 2026

| Perubahan | File yang Diubah |
|---|---|
| Batas upload diperkecil dari 500MB → **100MB** per file | `backend/src/config/multer.js`, `backend/src/index.js`, `backend/src/middleware/errorHandler.js` |
| Label dan validasi upload disesuaikan ke 100MB | `frontend/src/app/staff/dokumen/upload/page.tsx`, `frontend/src/app/staff/dokumen/[id]/edit/page.tsx` |
| Dokumentasi diperbarui (README, DOCS, TASKS) | `README.md`, `DOCS.md`, `TASKS.md` |

### v1.2.0 — 17 Agustus 2026

| Perubahan | File yang Diubah |
|---|---|
| **Fitur baru: Sistem Notifikasi In-App** — bell icon + badge + dropdown | `frontend/src/components/ui/NotificationBell.tsx` |
| Tabel `notifikasi` baru di database | `database/init/01_schema.sql`, `database/init/03_notifikasi.sql` |
| API endpoint notifikasi (list, unread-count, mark read, mark all) | `backend/src/controllers/notifikasiController.js`, `backend/src/routes/notifikasi.js` |
| Notifikasi otomatis saat submit → admin, approve/reject → staff | `backend/src/controllers/dokumenController.js`, `backend/src/index.js` |
| Bell icon ditambahkan ke layout staff & admin | `frontend/src/app/staff/layout.tsx`, `frontend/src/app/admin/layout.tsx` |

### v1.3.0 — 17 Agustus 2026

| Perubahan | File yang Diubah |
|---|---|
| **Fitur baru: Idle Auto Logout** — logout otomatis setelah 30 menit idle | `frontend/src/hooks/useIdleTimeout.ts` |
| Warning modal dengan countdown 2 menit sebelum logout paksa | `frontend/src/components/ui/SessionTimeoutModal.tsx` |
| Hook idle timeout diintegrasikan ke layout staff & admin | `frontend/src/app/staff/layout.tsx`, `frontend/src/app/admin/layout.tsx` |

### v1.4.0 — 17 Agustus 2026

| Perubahan | File yang Diubah |
|---|---|
| **Fitur baru: Role Ketua Tim** (`ketua_tim`) dengan dashboard terpisah `/ketua` | `database/init/02_seed.sql`, `backend/src/middleware/auth.js` |
| Dashboard ketim dengan grafik realtime (recharts): upload per staff, trend 14 hari, distribusi status, user online | `frontend/src/app/ketua/page.tsx`, `frontend/package.json` |
| Manajemen user: aktif/nonaktif admin & staff + reset password (password tampil sekali, riwayat reset tersimpan) | `frontend/src/app/ketua/users/page.tsx`, `backend/src/controllers/ketuaController.js` |
| Monitor dokumen read-only + log aktivitas | `frontend/src/app/ketua/dokumen/page.tsx`, `frontend/src/app/ketua/logs/page.tsx` |
| Kirim notifikasi manual (broadcast semua user / per divisi / satu user) | `frontend/src/app/ketua/kirim-notifikasi/page.tsx` |
| Guard: admin tidak bisa nonaktifkan/hapus ketua tim; ketim tidak bisa ubah sesama ketim | `backend/src/controllers/adminController.js`, `backend/src/controllers/ketuaController.js` |
| API endpoint baru `/api/ketua/*` + kolom `password_reset_at` | `backend/src/routes/ketua.js`, `backend/src/index.js`, `database/init/04_ketua_tim.sql` |
| Sidebar ketua tim + update role-aware di navbar, auth context, dan hook | `frontend/src/components/ketua/KetuaSidebar.tsx`, `frontend/src/components/layout/Navbar.tsx`, `frontend/src/context/AuthContext.tsx`, `frontend/src/hooks/useRequireAuth.ts` |

### v1.5.1 — Notifikasi Ketim per Divisi ❌ (dihapus di v2.0.0)

| Perubahan | File yang Diubah |
|---|---|
| Mode target baru `'divisi'` + `divisi_id` di kirim notifikasi: kirim ke semua user aktif satu divisi (staff + admin divisi), error jelas bila divisi tanpa user aktif, log & response mencantumkan nama divisi | `backend/src/controllers/ketuaController.js` |
| Tombol tujuan jadi 3 (Semua User / Divisi Tertentu / Satu User) + dropdown divisi dari endpoint publik + label konfirmasi menyebut nama divisi | `frontend/src/app/ketua/kirim-notifikasi/page.tsx` |

### v1.5.0 — Sistem Divisi & Admin Divisi ❌ (dihapus total di v2.0.0)

| Perubahan | File yang Diubah |
|---|---|
| **Fitur baru: Sistem Divisi** — master data divisi + kolom `divisi_id` di users & dokumen, dokumen otomatis mewarisi divisi uploader | `database/init/05_divisi.sql`, `database/init/01_schema.sql`, `database/init/02_seed.sql` |
| **Fitur baru: Role `admin_dept`** (id 4) — pakai dashboard `/admin` & API `/api/admin/*` yang sama, semua data ter-scope ke divisinya + guard 403 lintas divisi | `backend/src/middleware/auth.js`, `backend/src/controllers/adminController.js`, `backend/src/controllers/dokumenController.js`, `backend/src/routes/admin.js` |
| CRUD divisi (admin global) + endpoint publik daftar divisi aktif | `backend/src/controllers/divisiController.js`, `backend/src/routes/dokumen.js` |
| Ketua tim tetap global + dropdown filter divisi untuk drill-down grafik & dokumen | `backend/src/controllers/ketuaController.js`, `frontend/src/app/ketua/page.tsx`, `frontend/src/app/ketua/dokumen/page.tsx` |
| Halaman baru Kelola Divisi + kolom/filter divisi di admin dokumen & users | `frontend/src/app/admin/divisi/page.tsx`, `frontend/src/app/admin/dokumen/page.tsx`, `frontend/src/app/admin/users/page.tsx` |
| Filter divisi di halaman publik + badge divisi di card dokumen | `frontend/src/components/ui/FilterBar.tsx`, `frontend/src/components/ui/DokumenCard.tsx`, `frontend/src/app/page.tsx` |
| Akun contoh: `dept_keuangan` / `Dept@123` (Admin Divisi Keuangan) | `database/init/05_divisi.sql`, `DOCS.md` |

### v2.0.0 — 20 Agustus 2026 (Refactoring Besar: Revisi Mentor & Ketua Tim)

| Perubahan | File yang Diubah |
|---|---|
| **Verifikasi 2 tahap**: Admin loloskan (`lolos_admin`) → Ketua Tim setujui/publish (`terverifikasi`); status baru `lolos_admin` di ENUM | `database/init/01_schema.sql`, `database/migration_v2.sql`, `backend/src/controllers/dokumenController.js`, `backend/src/routes/dokumen.js` |
| Endpoint baru `PATCH /api/dokumen/:id/ketua-verify` + `GET /api/ketua/dokumen/menunggu` | `backend/src/routes/dokumen.js`, `backend/src/routes/ketua.js`, `backend/src/controllers/ketuaController.js` |
| **Hapus total sistem divisi & role `admin_dept`** — tabel `divisi`, kolom `divisi_id`, halaman `/admin/divisi`, filter divisi publik/ketua, endpoint `/api/admin/divisi` | seluruh backend + frontend + schema/seed |
| **Kode tracking `nomor_laporan`** (`{KATEGORI}/{TAHUN}/{ID}`) — auto-generate saat upload + bisa dicari di halaman publik | `backend/src/controllers/dokumenController.js`, schema/seed |
| **Field `semester`** (Sem 1 = Jan–Jun, Sem 2 = Jul–Des) — pilihan eksklusif dengan bulan di form upload & edit | `frontend/src/app/staff/dokumen/upload/page.tsx`, `frontend/src/app/staff/dokumen/[id]/edit/page.tsx` |
| **Kolom `catatan_oleh`** — catatan revisi tampil beserta siapa yang memberi (Admin/Ketua Tim) | `database/migration_v2.sql`, `backend/src/controllers/dokumenController.js`, halaman staff |
| **Batas upload 100MB → 50MB** | `backend/src/config/multer.js`, `backend/src/middleware/errorHandler.js`, `backend/src/index.js`, form upload & edit |
| **Halaman `/forgot-password`** — instruksi hubungi Admin/Ketua Tim (belum ada email) | `frontend/src/app/forgot-password/page.tsx`, `frontend/src/app/login/page.tsx` |
| UI Ketua Tim: panel "Menunggu Persetujuan Saya" + tombol Setujui & Publish / Kembalikan Revisi; UI Admin: Loloskan ke Ketua Tim / Kembalikan Revisi | `frontend/src/app/ketua/dokumen/page.tsx`, `frontend/src/app/admin/dokumen/page.tsx` |
| **Preview dokumen untuk Ketua Tim** — tombol Tinjau + modal preview PDF (streaming dengan progress bar) di antrian persetujuan; fix header CORS invalid di endpoint preview | `frontend/src/app/ketua/dokumen/page.tsx`, `frontend/src/app/admin/dokumen/page.tsx`, `backend/src/controllers/dokumenController.js` |
| Dokumentasi **Proses Bisnis** (pelaku & tanggung jawab, alur end-to-end, loop revisi, proses pendukung, aturan bisnis) | `README.md` |

### v2.2.0 — 02 September 2026

| Perubahan | File yang Diubah |
|---|---|
| **Fitur baru: Lupa Password via Email** — integrasi API Brevo via HTTPS request (solusi atas blokir SMTP port di Railway), fitur rate limiter 3 request/jam | `backend/src/controllers/authController.js`, `frontend/src/app/reset-password/page.tsx`, `backend/src/routes/auth.js` |
| **Fitur baru: Perbandingan Nominal** — fitur bagi admin dan ketua tim untuk membandingkan nominal antar dokumen | (Berbagai komponen terkait fitur perbandingan) |
| **Perbaikan UI Navigasi Auth** — penghapusan tombol Dashboard Publik yang membingungkan dan mengganti tulisan menjadi tombol Kembali | `frontend/src/app/login/layout.tsx`, `frontend/src/app/login/page.tsx` |

> Catatan: poin revisi "Kategori → Akun" belum dikerjakan — menunggu keputusan final mentor.

---

## Kontributor

- **Naufal Adiva Putra Lisna** — Developer (Magang)

