# Bisnis Proses — Sistem Dashboard Laporan Instansi

> Dokumen ini menjelaskan alur lengkap sistem dari halaman publik pertama kali dibuka
> hingga dokumen muncul di Dashboard Laporan dan dapat diunduh oleh pengguna yang sudah login.

---

## Daftar Isi

1. [Aktor & Peran](#1-aktor--peran)
2. [Status Dokumen](#2-status-dokumen)
3. [Alur Utama — Gambaran Besar](#3-alur-utama--gambaran-besar)
4. [Detail Per Tahap](#4-detail-per-tahap)
   - [Tahap 0 — Landing Page](#tahap-0--landing-page-publik)
   - [Tahap 1 — Login](#tahap-1--login)
   - [Tahap 2 — Staff Upload Dokumen](#tahap-2--staff-upload-dokumen)
   - [Tahap 3 — Staff Submit ke Verifikasi](#tahap-3--staff-submit-ke-verifikasi)
   - [Tahap 4 — Admin Menyaring](#tahap-4--admin-menyaring-verifikasi-tahap-1)
   - [Tahap 5 — Ketua Tim Menyetujui](#tahap-5--ketua-tim-menyetujui-verifikasi-tahap-2)
   - [Tahap 6 — Dokumen Muncul di Dashboard Laporan](#tahap-6--dokumen-muncul-di-dashboard-laporan)
5. [Alur Revisi](#5-alur-revisi)
6. [Notifikasi Sistem](#6-notifikasi-sistem)
7. [Batasan & Aturan Teknis](#7-batasan--aturan-teknis)
8. [API Endpoint Ringkasan](#8-api-endpoint-ringkasan)

---

## 1. Aktor & Peran

| Role          | `role_id` | Akses                        | Tugas                                                          |
| ------------- | --------- | ---------------------------- | -------------------------------------------------------------- |
| **Staff**     | 2         | `/staff/dokumen`, `/laporan` | Upload, edit, submit dokumen milik sendiri                     |
| **Admin**     | 1         | `/admin`, `/laporan`         | Menyaring dokumen (verifikasi tahap 1), kelola user & kategori |
| **Ketua Tim** | 3         | `/ketua`, `/laporan`         | Persetujuan final dokumen (verifikasi tahap 2), publikasi      |

> **Catatan:** Tidak ada role publik — semua akses ke dokumen memerlukan login.

---

## 2. Status Dokumen

Setiap dokumen memiliki satu status aktif yang menentukan posisinya dalam alur:

```
draft  ──►  menunggu_verifikasi  ──►  lolos_admin  ──►  terverifikasi
  ▲                │                      │
  │                │ (admin reject)        │ (ketua reject)
  └────────────────┴──────────────────────┘
                revisi
```

| Status                | Siapa yang set            | Arti                              | `is_public` |
| --------------------- | ------------------------- | --------------------------------- | ----------- |
| `draft`               | Sistem (saat upload)      | Baru diupload, belum diajukan     | `0`         |
| `menunggu_verifikasi` | Staff (submit)            | Menunggu tinjauan admin           | `0`         |
| `lolos_admin`         | Admin (loloskan)          | Lolos tahap 1, menunggu ketua tim | `0`         |
| `terverifikasi`       | Ketua Tim (setujui)       | Disetujui, muncul di dashboard    | `1`         |
| `revisi`              | Admin / Ketua Tim (tolak) | Perlu diperbaiki staff            | `0`         |
| `diarsipkan`          | Admin                     | Dokumen lama yang diarsipkan      | `0`         |

---

## 3. Alur Utama — Gambaran Besar

```mermaid
flowchart TD
    A([User buka website]) --> B[Landing Page\n- Info instansi\n- Visi & Misi]
    B --> C{Klik Tombol Login}
    C --> D[Halaman Login\n/login]
    D --> E{Kredensial valid?}
    E -- Tidak --> D
    E -- Ya --> F{Role?}

    F -- Staff --> G[/staff/dokumen\nDashboard Staff]
    F -- Admin --> H[/admin\nDashboard Admin]
    F -- Ketua Tim --> I[/ketua\nDashboard Ketua]

    G --> J[Upload Dokumen\nisi form + lampir file]
    J --> K[Status: DRAFT\nnomor laporan ter-generate]
    K --> L[Submit ke Verifikasi]
    L --> M[Status: MENUNGGU VERIFIKASI\nNotifikasi → Admin]

    H --> N[Admin terima notifikasi\nTinjau dokumen]
    N --> O{Keputusan Admin}
    O -- Loloskan --> P[Status: LOLOS ADMIN\nNotifikasi → Staff + Ketua Tim]
    O -- Kembalikan --> Q[Status: REVISI\nCatatan revisi muncul\nNotifikasi → Staff]

    I --> R[Ketua Tim terima notifikasi\nTinjau + Preview dokumen]
    R --> S{Keputusan Ketua Tim}
    S -- Setujui --> T[Status: TERVERIFIKASI\nis_public = 1\nNotifikasi → Staff]
    S -- Kembalikan --> Q

    T --> U[✅ Dokumen muncul di\nDashboard Laporan /laporan\nBisa diunduh semua user login]

    Q --> G
```

---

## 4. Detail Per Tahap

---

### Tahap 0 — Landing Page (Publik)

**URL:** `/`
**Akses:** Semua orang (tanpa login)

**Konten yang ditampilkan:**

- Nama & logo instansi
- Foto gedung instansi
- Visi & Misi instansi
- Statistik umum (jumlah dokumen, kategori, tahun berdiri)
- **Tombol "Masuk ke Dashboard"** (di tengah hero — besar)
- **Link "Masuk"** (di navbar kanan atas — kecil)

**Aturan:**

- Jika user sudah login → otomatis redirect ke dashboard role-nya
- Tidak ada akses ke dokumen apapun tanpa login

---

### Tahap 1 — Login

**URL:** `/login`
**Akses:** Semua orang (tanpa login)

```
User isi username + password
         │
         ▼
  POST /api/auth/login
         │
  ┌──────┴──────────┐
  │ Validasi DB     │
  │ - username/email│
  │ - password hash │
  │ - is_active = 1 │
  └──────┬──────────┘
         │
  ┌──────┴────────────────────────────┐
  │ Sukses → JWT Token + Session      │
  │ Gagal  → Pesan error di form      │
  └──────┬────────────────────────────┘
         │
  Redirect berdasarkan role_id:
    • role_id 1 (admin)     → /admin
    • role_id 2 (staff)     → /laporan
    • role_id 3 (ketua_tim) → /ketua
```

**Token:** JWT disimpan di `localStorage` + session dicatat di tabel `user_sessions`

---

### Tahap 2 — Staff Upload Dokumen

**URL:** `/staff/dokumen/upload`
**Akses:** Staff (role_id = 2)

**Form yang harus diisi:**

| Field         | Wajib | Keterangan                                                         |
| ------------- | ----- | ------------------------------------------------------------------ |
| **Judul**     | ✅    | Nama dokumen                                                       |
| **Kategori**  | ✅    | Pilih dari daftar (LKjIP, Renstra, Renja, dll)                     |
| **Tahun**     | ✅    | Tahun laporan (2015 – sekarang)                                    |
| **Periode**   | ❌    | Pilih salah satu: **Bulan** (Jan–Des) ATAU **Semester** (1 atau 2) |
| **Deskripsi** | ❌    | Keterangan tambahan                                                |
| **File**      | ✅    | PDF, DOC, DOCX, XLS, XLSX — maks **50 MB**                         |

**Proses sistem saat upload:**

```
1. Validasi file (format + ukuran maks 50MB)
2. Cek duplikat: judul + kategori + tahun yang sama tidak boleh ada
3. Simpan file ke server (folder uploads/)
4. INSERT ke tabel dokumen dengan status = 'draft', is_public = 0
5. Generate nomor laporan otomatis: {SLUG_KATEGORI}/{TAHUN}/{ID_DOKUMEN}
   Contoh: LKJIP/2024/001, RENJ/2025/042
6. Catat aktivitas log
7. Response: id dokumen + nomor_laporan
```

**Output:**

- Dokumen tersimpan dengan status `draft`
- Staff bisa lihat, edit metadata, atau ganti file selama masih `draft`

---

### Tahap 3 — Staff Submit ke Verifikasi

**URL/Aksi:** Tombol "Ajukan Verifikasi" di halaman daftar dokumen staff
**API:** `PATCH /api/dokumen/:id/submit`

**Syarat:**

- Dokumen milik staff sendiri
- Status harus `draft` atau `revisi`

**Proses:**

```
1. Validasi kepemilikan + status
2. UPDATE status → 'menunggu_verifikasi'
3. Reset catatan (catatan = NULL, catatan_oleh = NULL)
4. Kirim notifikasi in-app ke semua Admin:
   "Staff X mengajukan 'Judul Dokumen' untuk ditinjau"
5. Response: sukses
```

---

### Tahap 4 — Admin Menyaring (Verifikasi Tahap 1)

**URL:** `/admin/dokumen`
**API:** `PATCH /api/dokumen/:id/verify`
**Akses:** Admin (role_id = 1)

**Admin melihat:** semua dokumen berstatus `menunggu_verifikasi`

**Admin bisa:**

#### A. Loloskan ke Ketua Tim (aksi: `lolos`)

```
1. Validasi status = 'menunggu_verifikasi'
2. UPDATE status → 'lolos_admin'
3. is_public tetap 0 (belum publik)
4. Catat verified_by + verified_at
5. Notifikasi ke Staff:
   "Dokumen lolos tinjauan admin, menunggu persetujuan Ketua Tim"
6. Notifikasi ke semua Ketua Tim:
   "Dokumen sudah diloloskan admin dan menunggu persetujuan Anda"
```

#### B. Kembalikan untuk Revisi (aksi: `reject`)

```
1. UPDATE status → 'revisi'
2. Simpan catatan revisi + catatan_oleh = 'admin'
3. Notifikasi ke Staff:
   "Dokumen perlu direvisi: [catatan admin]"
```

> **Penting:** Admin TIDAK bisa langsung mempublikasikan dokumen. Admin hanya menjadi penyaring pertama.

---

### Tahap 5 — Ketua Tim Menyetujui (Verifikasi Tahap 2)

**URL:** `/ketua/dokumen`
**API:** `PATCH /api/dokumen/:id/ketua-verify`
**Akses:** Ketua Tim (role_id = 3)

**Ketua Tim melihat:** semua dokumen berstatus `lolos_admin`

**Ketua Tim bisa preview file** (PDF langsung di browser, atau download non-PDF) sebelum memutuskan.

#### A. Setujui & Publikasikan (aksi: `approve`)

```
1. Validasi status = 'lolos_admin'
2. UPDATE status → 'terverifikasi'
3. UPDATE is_public → 1  ← DOKUMEN SEKARANG MUNCUL DI DASHBOARD!
4. Catat verified_by + verified_at + catatan_oleh = 'ketua_tim'
5. Notifikasi ke Staff:
   "Dokumen disetujui Ketua Tim dan sudah dipublikasikan"
```

#### B. Kembalikan untuk Revisi (aksi: `reject`)

```
1. UPDATE status → 'revisi'
2. Simpan catatan revisi + catatan_oleh = 'ketua_tim'
3. Notifikasi ke Staff:
   "Dokumen perlu direvisi oleh Ketua Tim: [catatan]"
```

---

### Tahap 6 — Dokumen Muncul di Dashboard Laporan

**URL:** `/laporan`
**Akses:** Semua user yang sudah login (Admin, Staff, Ketua Tim)

**Kondisi dokumen tampil:**

```sql
WHERE status = 'terverifikasi' AND is_public = 1
```

**Fitur di Dashboard Laporan:**

| Fitur               | Keterangan                                       |
| ------------------- | ------------------------------------------------ |
| **Pencarian**       | Cari berdasarkan judul atau nomor laporan        |
| **Filter Kategori** | Dropdown pilih kategori (LKjIP, Renstra, dll)    |
| **Filter Tahun**    | Dropdown pilih tahun laporan                     |
| **Pagination**      | 12 dokumen per halaman                           |
| **Download**        | Unduh file langsung (counter download bertambah) |
| **Detail**          | Lihat metadata lengkap dokumen                   |

**Informasi yang ditampilkan per dokumen:**

- Judul dokumen
- Nomor laporan (tracking code)
- Kategori
- Periode (Bulan / Semester / Tahun)
- Ukuran file
- Jumlah unduhan

---

## 5. Alur Revisi

Ketika dokumen dikembalikan (status `revisi`), alur kembali ke Staff:

```
Status: revisi
    │
    ▼
Staff melihat notifikasi + catatan revisi di dashboard dokumen
(catatan_oleh: 'admin' atau 'ketua_tim' — ditampilkan di kartu dokumen)
    │
    ├── Opsi 1: Edit metadata (judul, kategori, tahun, periode, deskripsi)
    │           PATCH /api/dokumen/:id
    │
    ├── Opsi 2: Ganti file (tanpa hapus + upload ulang)
    │           PATCH /api/dokumen/:id/file
    │
    └── Submit ulang ke verifikasi
        PATCH /api/dokumen/:id/submit
        → kembali ke Tahap 3
```

**Aturan revisi:**

- Edit metadata hanya bisa saat status `draft` atau `revisi`
- Ganti file hanya bisa saat status `draft` atau `revisi`
- Setelah disubmit ulang, catatan revisi lama dihapus

---

## 6. Notifikasi Sistem

Sistem mengirim notifikasi **in-app** (tersimpan di tabel `notifikasi`) pada setiap pergantian status:

| Pemicu               | Penerima         | Pesan                                              |
| -------------------- | ---------------- | -------------------------------------------------- |
| Staff submit dokumen | Semua Admin      | `"{staff}" mengajukan "{judul}" untuk ditinjau`    |
| Admin loloskan       | Staff (uploader) | `Dokumen lolos tinjauan admin, menunggu Ketua Tim` |
| Admin loloskan       | Semua Ketua Tim  | `Dokumen menunggu persetujuan Anda`                |
| Admin kembalikan     | Staff (uploader) | `Dokumen perlu direvisi: {catatan}`                |
| Ketua Tim setujui    | Staff (uploader) | `Dokumen disetujui dan sudah dipublikasikan`       |
| Ketua Tim kembalikan | Staff (uploader) | `Dokumen perlu direvisi: {catatan}`                |

**Notifikasi dapat diakses** lewat ikon 🔔 di navbar dashboard masing-masing role.

---

## 7. Batasan & Aturan Teknis

| Aturan               | Detail                                                                         |
| -------------------- | ------------------------------------------------------------------------------ |
| **Ukuran file maks** | 50 MB                                                                          |
| **Format file**      | PDF, DOC, DOCX, XLS, XLSX                                                      |
| **Duplikat dokumen** | Judul + Kategori + Tahun yang sama tidak boleh ada (kecuali yang diarsipkan)   |
| **Periode laporan**  | Pilih salah satu: Bulan (1–12) **ATAU** Semester (1 atau 2)                    |
| **Nomor laporan**    | Ter-generate otomatis: `{SLUG}/{TAHUN}/{ID_PADDED}` — tidak bisa diubah manual |
| **Akses dokumen**    | Wajib login untuk semua akses (termasuk download)                              |
| **Token JWT**        | Tersimpan di `localStorage`, expired → auto logout                             |

---

## 8. API Endpoint Ringkasan

| Method   | Endpoint                        | Role              | Fungsi                                          |
| -------- | ------------------------------- | ----------------- | ----------------------------------------------- |
| `GET`    | `/api/dokumen`                  | —                 | _(tidak digunakan lagi, diganti /laporan)_      |
| `GET`    | `/api/dokumen/all`              | Staff/Admin/Ketua | List semua dokumen (staff: hanya milik sendiri) |
| `GET`    | `/api/dokumen/kategori`         | —                 | List kategori aktif                             |
| `POST`   | `/api/dokumen/upload`           | Staff             | Upload dokumen baru                             |
| `GET`    | `/api/dokumen/:id`              | —                 | Detail dokumen terverifikasi                    |
| `GET`    | `/api/dokumen/:id/download`     | Login             | Download file                                   |
| `GET`    | `/api/dokumen/:id/preview`      | Admin/Ketua       | Preview file untuk review                       |
| `PATCH`  | `/api/dokumen/:id`              | Staff/Admin       | Edit metadata dokumen                           |
| `PATCH`  | `/api/dokumen/:id/file`         | Staff/Admin       | Ganti file dokumen                              |
| `PATCH`  | `/api/dokumen/:id/submit`       | Staff             | Submit ke verifikasi                            |
| `PATCH`  | `/api/dokumen/:id/verify`       | Admin             | Verifikasi tahap 1 (lolos/reject)               |
| `PATCH`  | `/api/dokumen/:id/ketua-verify` | Ketua Tim         | Verifikasi tahap 2 (approve/reject)             |
| `DELETE` | `/api/dokumen/:id`              | Admin             | Hapus dokumen permanen                          |

---

_Dokumen ini dibuat berdasarkan implementasi aktual sistem per Agustus 2025._
_Untuk perubahan arsitektur, update dokumen ini bersamaan dengan perubahan kode._
