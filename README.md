# Web Dashboard Laporan

Sistem dashboard untuk menampilkan, mengelola, dan mengunduh dokumen laporan instansi. Publik dapat mengunduh dokumen tanpa login, staff dapat upload dan mengajukan verifikasi, admin dapat menyetujui dan memantau aktivitas.

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

## Fitur

### Dashboard Publik
- Daftar dokumen terverifikasi dengan filter kategori, tahun, dan pencarian
- Download dokumen langsung tanpa login
- Halaman detail dokumen
- Statistik total dokumen, kategori, dan unduhan

### Dashboard Staff
- Upload dokumen dengan drag & drop (maks 100MB)
- Edit metadata dokumen (judul, kategori, tahun, deskripsi)
- **Ganti file dokumen saat status draft atau revisi** (tanpa hapus dan upload ulang)
- Submit dokumen untuk verifikasi
- Lihat status dokumen dan catatan revisi dari admin
- Ganti password dan kelola profil
- Tombol kembali ke beranda publik

### Dashboard Admin
- Statistik realtime (total dokumen, menunggu verifikasi, user online)
- Verifikasi dokumen dengan preview PDF langsung di modal
- Setujui atau kembalikan dokumen untuk revisi dengan catatan
- Monitoring user online realtime (auto refresh 30 detik)
- Manajemen user — tambah, aktifkan/nonaktifkan, hapus
- **Kelola kategori dokumen** — tambah, edit, hapus, aktif/nonaktif dari dashboard
- Log aktivitas sistem dengan pagination dan hapus riwayat
- Hapus dokumen beserta file fisiknya
- Tombol kembali ke beranda publik

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

### URL Akses

| Halaman | URL |
|---|---|
| Dashboard Publik | http://localhost:3000 |
| Login | http://localhost:3000/login |
| Dashboard Staff | http://localhost:3000/staff/dokumen |
| Dashboard Admin | http://localhost:3000/admin |
| API Health Check | http://localhost:5000/api/health |

### Akun Default

> Lihat file `DOCS.md` untuk informasi akun — tidak dipublikasikan di sini.

---

## Struktur Database

### Tabel

| Tabel | Fungsi |
|---|---|
| `roles` | Daftar role: admin, staff, ketua_tim |
| `users` | Data semua user (admin & staff) |
| `user_sessions` | Tracking session login — untuk monitoring online |
| `kategori_dokumen` | Kategori laporan: LKjIP, Renstra, Renja, RKT, PK, LAKIP, IKU, Lainnya |
| `dokumen` | Data utama laporan + status alur verifikasi |
| `aktivitas_log` | Log semua aksi user di sistem |

### Status Dokumen

| Status | Keterangan |
|---|---|
| `draft` | Baru diupload, belum diajukan |
| `menunggu_verifikasi` | Sudah disubmit staff, menunggu admin |
| `terverifikasi` | Disetujui admin, tampil di publik |
| `revisi` | Dikembalikan admin, staff perlu perbaiki |
| `diarsipkan` | Diarsipkan, tidak tampil di publik |

### Kategori Dokumen Default

| Nama | Slug | Urutan |
|---|---|---|
| LKjIP | `lkjip` | 1 |
| Renstra | `renstra` | 2 |
| Renja | `renja` | 3 |
| RKT | `rkt` | 4 |
| PK | `pk` | 5 |
| LAKIP | `lakip` | 6 |
| IKU | `iku` | 7 |
| Lainnya | `lainnya` | 99 |

> Kategori bisa ditambah/diedit/dihapus langsung dari dashboard admin di menu **Kelola Kategori**

---

## Struktur Folder

```
web-dashboard-laporan/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── database/
│   └── init/
│       ├── 01_schema.sql     ← struktur tabel
│       └── 02_seed.sql       ← data awal
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config/           ← db.js, multer.js
│       ├── controllers/      ← auth, dokumen, user, admin
│       ├── middleware/       ← auth JWT, validate, logger, error
│       └── routes/           ← auth, dokumen, user, admin
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.ts
    └── src/
        ├── app/
        │   ├── page.tsx              ← dashboard publik
        │   ├── login/
        │   ├── dokumen/[id]/
        │   ├── staff/                ← dokumen, upload, edit, profil
        │   └── admin/                ← dashboard, dokumen, kategori, users, logs
        ├── components/
        │   ├── layout/               ← Navbar, Footer
        │   ├── ui/                   ← DokumenCard, FilterBar, Pagination
        │   ├── staff/                ← Sidebar
        │   └── admin/                ← AdminSidebar
        ├── context/                  ← AuthContext
        ├── hooks/                    ← useRequireAuth
        └── lib/                      ← api.ts, auth.ts, dateUtils.ts
```

---

## Konfigurasi .env

Salin `.env.example` menjadi `.env` lalu sesuaikan nilainya.

```bash
cp .env.example .env
```

> Detail konfigurasi ada di file `.env.example` — jangan commit file `.env` ke GitHub.

---

## Ketentuan Upload File

| Item | Nilai |
|---|---|
| Format yang didukung | PDF, DOC, DOCX, XLS, XLSX |
| Ukuran maksimal | 100 MB per file |
| Penyimpanan | Docker Volume (uploads_data) |

---

## Alur Status Dokumen

```mermaid
stateDiagram-v2
    [*] --> Draft: Staff Upload
    Draft --> Menunggu_Verifikasi: Staff Submit
    Menunggu_Verifikasi --> Terverifikasi: Admin Setujui
    Menunggu_Verifikasi --> Revisi: Admin Revisi + Catatan
    Revisi --> Menunggu_Verifikasi: Staff Edit & Submit Ulang
    Terverifikasi --> [*]: Tampil di Dashboard Publik
```

---

## DFD Level 0 — Context Diagram

```mermaid
flowchart LR
    PU([Pengguna Publik])
    ST([Staff])
    AD([Admin])
    SYS[["Sistem Web\nDashboard Laporan"]]
    DB[(MySQL Database)]
    FS([File Storage\nDocker Volume])

    PU -->|Cari & Download Dokumen| SYS
    SYS -->|Daftar Dokumen Publik| PU
    ST -->|Login, Upload, Edit, Submit| SYS
    SYS -->|Status Dokumen, Notif Revisi| ST
    AD -->|Login, Verifikasi, Kelola User| SYS
    SYS -->|Data Statistik, Log, User Online| AD
    SYS -->|CRUD Data| DB
    DB -->|Data| SYS
    SYS -->|Simpan File| FS
    FS -->|Stream File| SYS
```

---

## DFD Level 1 — Detail Proses

```mermaid
flowchart TD
    subgraph P1["1. Autentikasi"]
        P1A[Input Username\n& Password] --> P1B{Validasi\nCredential}
        P1B -->|Valid| P1C[Generate JWT Token]
        P1B -->|Tidak Valid| P1D[Return Error 401]
        P1C --> P1E[Simpan Session ke DB]
    end

    subgraph P2["2. Manajemen Dokumen"]
        P2A[Upload File] --> P2B[Simpan ke Docker Volume]
        P2B --> P2C[Simpan Metadata ke DB\nstatus: draft]
        P2C --> P2D[Edit Metadata]
        P2D --> P2E[Submit Verifikasi\nstatus: menunggu]
    end

    subgraph P3["3. Verifikasi Dokumen"]
        P3A[Admin Tinjau Dokumen] --> P3B[Preview PDF di Modal]
        P3B --> P3C{Keputusan Admin}
        P3C -->|Setujui| P3D[status: terverifikasi\nis_public: true]
        P3C -->|Revisi| P3E[status: revisi\n+ catatan admin]
        P3E --> P3F[Staff Edit & Submit Ulang]
    end

    subgraph P4["4. Dashboard Publik"]
        P4A[Tampilkan Daftar Dokumen] --> P4B[Filter Kategori\nTahun & Search]
        P4B --> P4C[Download File Langsung]
    end

    subgraph P5["5. Monitoring Admin"]
        P5A[Tracking Session User] --> P5B[Cleanup Session\n> 15 Menit]
        P5B --> P5C[Tampilkan User Online\nRealtime]
        P5C --> P5D[Log Semua Aktivitas]
    end

    DB[(Database)]
    FS([File Storage])

    P1C --> P2
    P1C --> P3
    P1C --> P5
    P2B --> FS
    P2C --> DB
    P3D --> DB
    P3D --> P4
    DB --> P4
    DB --> P5
```

---

## Flowchart — Alur Sistem Lengkap

```mermaid
flowchart TD
    START([Mulai]) --> A{Tipe Pengguna?}

    A -->|Publik| B[Buka Dashboard\nlocalhost:3000]
    B --> C[Lihat Daftar Dokumen]
    C --> D[Filter / Search Dokumen]
    D --> E[Klik Download]
    E --> F[File Terunduh Langsung]
    F --> END1([Selesai])

    A -->|Staff| G[Login]
    G --> H{Autentikasi?}
    H -->|Tidak| I[Tampilkan Error] --> G
    H -->|Ya| J[Dashboard Staff]
    J --> K{Pilih Aksi}
    K -->|Upload| L[Isi Form + Pilih File]
    L --> M[Upload - Status: Draft]
    M --> N{Perlu Edit?}
    N -->|Ya| O[Edit Metadata] --> N
    N -->|Tidak| P[Submit Verifikasi\nStatus: Menunggu]
    P --> Q{Hasil Verifikasi?}
    Q -->|Disetujui| R[Status: Terverifikasi\nMuncul di Publik]
    Q -->|Revisi| S[Lihat Catatan Admin]
    S --> O

    A -->|Admin| T[Login]
    T --> U{Autentikasi?}
    U -->|Tidak| V[Tampilkan Error] --> T
    U -->|Ya| W[Dashboard Admin]
    W --> X{Pilih Menu}
    X -->|Verifikasi| Y[Lihat Dokumen Menunggu]
    Y --> Z[Preview PDF di Modal]
    Z --> AA{Keputusan?}
    AA -->|Setujui| AB[Dokumen Publik]
    AA -->|Revisi| AC[Isi Catatan ke Staff]
    X -->|Kelola User| AD2[Tambah / Nonaktifkan / Hapus]
    X -->|Monitor| AE[Lihat User Online Realtime]
    X -->|Log| AF[Lihat / Hapus Log Aktivitas]
```

---

## Activity Diagram — Upload & Verifikasi Dokumen

```mermaid
flowchart LR
    subgraph STAFF["👤 Staff"]
        S1([Login]) --> S2[Buka Halaman Upload]
        S2 --> S3[Isi Form Dokumen]
        S3 --> S4[Pilih File]
        S4 --> S5{Validasi File?}
        S5 -->|Tidak Valid| S4
        S5 -->|Valid| S6[Klik Upload]
        S6 --> S7[Status: Draft]
        S7 --> S8{Perlu Edit?}
        S8 -->|Ya| S9[Edit Metadata] --> S8
        S8 -->|Tidak| S10[Submit Verifikasi]
        S10 --> S11[Status: Menunggu]
        S11 --> S12{Hasil?}
        S12 -->|Disetujui| S13([Selesai])
        S12 -->|Revisi| S14[Lihat Catatan]
        S14 --> S9
    end

    subgraph ADMIN["🛡️ Admin"]
        A1([Dokumen Masuk]) --> A2[Buka Verifikasi]
        A2 --> A3[Klik Tinjau]
        A3 --> A4[Preview PDF]
        A4 --> A5{Keputusan}
        A5 -->|Setujui| A6[Status: Terverifikasi\nis_public: true]
        A5 -->|Revisi| A7[Isi Catatan\nKirim ke Staff]
        A6 --> A8([Muncul di Publik])
        A7 --> A9([Kembali ke Staff])
    end

    S11 -.->|Masuk antrian| A1
    A9 -.->|Notif revisi| S12
```

---

## Activity Diagram — Monitoring Admin

```mermaid
flowchart TD
    START([Admin Login]) --> A[Buka Dashboard]
    A --> B[Fetch Stats + User Online]
    B --> C[Tampilkan Statistik]
    C --> D{Auto Refresh 30 Detik}
    D --> E[Cleanup Session > 15 Menit]
    E --> F[Query User Online]
    F --> G[Update List User Aktif]
    G --> D

    C --> H{Pilih Menu}
    H -->|Verifikasi| I[Filter Dokumen by Status]
    H -->|User| J[Lihat Semua User]
    H -->|Log| K[Lihat Log Aktivitas]

    J --> L{Aksi}
    L -->|Tambah| M[Form Buat User Baru]
    L -->|Nonaktifkan| N[Toggle is_active]
    L -->|Hapus| O{Konfirmasi?}
    O -->|Ya| P[Hapus User + Session + Log]
    O -->|Tidak| J

    K --> Q{Hapus Log?}
    Q -->|30 Hari| R[DELETE Log > 30 Hari]
    Q -->|90 Hari| S[DELETE Log > 90 Hari]
    Q -->|Semua| T[DELETE ALL Logs]
```

---

## Workflow — Docker & Arsitektur Sistem

```mermaid
flowchart TB
    subgraph DOCKER["Docker Compose Environment"]
        subgraph FE["Container: Frontend :3000"]
            F1[Next.js\nDashboard Publik\nDashboard Staff\nDashboard Admin]
        end
        subgraph BE["Container: Backend :5000"]
            B1[Node.js + Express\nREST API]
        end
        subgraph DB_C["Container: MySQL :3307"]
            D1[(MySQL 8.0\nweb_laporan)]
        end
        subgraph PMA["Container: phpMyAdmin :8080"]
            P1[GUI Database]
        end
        subgraph VOL["Docker Volume"]
            V1[uploads_data\nFile PDF/DOC/XLS]
            V2[db_data\nMySQL Data]
        end
    end

    USER_PUB([Pengguna Publik]) -->|:3000| F1
    USER_STAFF([Staff]) -->|:3000/login| F1
    USER_ADMIN([Admin]) -->|:3000/login| F1

    F1 -->|API Request :5000| B1
    B1 -->|Query| D1
    B1 -->|Read/Write File| V1
    D1 --> V2
    P1 -->|Manage| D1
```

---

## Struktur Database

```mermaid
erDiagram
    roles {
        tinyint id PK
        varchar nama
        varchar deskripsi
    }
    users {
        int id PK
        tinyint role_id FK
        varchar nama
        varchar username
        varchar email
        varchar password_hash
        tinyint is_active
        timestamp last_login
    }
    user_sessions {
        varchar id PK
        int user_id FK
        varchar ip_address
        tinyint is_online
        timestamp last_active_at
        timestamp logout_at
    }
    kategori_dokumen {
        smallint id PK
        varchar nama
        varchar slug
        tinyint is_active
    }
    dokumen {
        int id PK
        smallint kategori_id FK
        int uploaded_by FK
        varchar judul
        year tahun
        varchar file_path
        enum status
        tinyint is_public
        int download_count
        int verified_by FK
    }
    aktivitas_log {
        bigint id PK
        int user_id FK
        varchar aksi
        varchar entitas
        json detail
        timestamp created_at
    }

    roles ||--o{ users : "memiliki"
    users ||--o{ user_sessions : "punya"
    users ||--o{ dokumen : "upload"
    users ||--o{ aktivitas_log : "catat"
    kategori_dokumen ||--o{ dokumen : "kategori"
```

---

## API Endpoints

### Auth
| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/auth/login` | Publik |
| POST | `/api/auth/logout` | Publik |
| GET | `/api/auth/me` | Login |

### Dokumen
| Method | Endpoint | Akses |
|---|---|---|
| GET | `/api/dokumen` | Publik |
| GET | `/api/dokumen/kategori` | Publik |
| GET | `/api/dokumen/:id` | Publik |
| GET | `/api/dokumen/:id/download` | Publik |
| GET | `/api/dokumen/all` | Staff/Admin |
| POST | `/api/dokumen/upload` | Staff/Admin |
| PATCH | `/api/dokumen/:id` | Staff/Admin |
| PATCH | `/api/dokumen/:id/submit` | Staff |
| PATCH | `/api/dokumen/:id/file` | Staff/Admin |
| GET | `/api/dokumen/:id/preview` | Admin |
| PATCH | `/api/dokumen/:id/verify` | Admin |
| DELETE | `/api/dokumen/:id` | Admin |

### Admin
| Method | Endpoint | Akses |
|---|---|---|
| GET | `/api/admin/stats` | Admin |
| GET | `/api/admin/users` | Admin |
| GET | `/api/admin/users/online` | Admin |
| POST | `/api/admin/users` | Admin |
| PATCH | `/api/admin/users/:id/toggle` | Admin |
| DELETE | `/api/admin/users/:id` | Admin |
| GET | `/api/admin/logs` | Admin |
| DELETE | `/api/admin/logs?before_days=30` | Admin |
| GET | `/api/admin/kategori` | Admin |
| POST | `/api/admin/kategori` | Admin |
| PATCH | `/api/admin/kategori/:id` | Admin |
| DELETE | `/api/admin/kategori/:id` | Admin |

### User
| Method | Endpoint | Akses |
|---|---|---|
| GET | `/api/user/profile` | Login |
| PATCH | `/api/user/profile` | Login |
| PATCH | `/api/user/password` | Login |

### Ketua Tim
| Method | Endpoint | Akses |
|---|---|---|
| GET | `/api/ketua/stats` | Ketua Tim |
| GET | `/api/ketua/users` | Ketua Tim |
| GET | `/api/ketua/users/online` | Ketua Tim |
| PATCH | `/api/ketua/users/:id/toggle` | Ketua Tim |
| POST | `/api/ketua/users/:id/reset-password` | Ketua Tim |
| GET | `/api/ketua/dokumen` | Ketua Tim |
| GET | `/api/ketua/logs` | Ketua Tim |
| POST | `/api/ketua/notifikasi/kirim` | Ketua Tim |

---

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
| Kirim notifikasi manual (broadcast semua user / satu user) | `frontend/src/app/ketua/kirim-notifikasi/page.tsx` |
| Guard: admin tidak bisa nonaktifkan/hapus ketua tim; ketim tidak bisa ubah sesama ketim | `backend/src/controllers/adminController.js`, `backend/src/controllers/ketuaController.js` |
| API endpoint baru `/api/ketua/*` + kolom `password_reset_at` | `backend/src/routes/ketua.js`, `backend/src/index.js`, `database/init/04_ketua_tim.sql` |
| Sidebar ketua tim + update role-aware di navbar, auth context, dan hook | `frontend/src/components/ketua/KetuaSidebar.tsx`, `frontend/src/components/layout/Navbar.tsx`, `frontend/src/context/AuthContext.tsx`, `frontend/src/hooks/useRequireAuth.ts` |

---

## Kontributor

- **Naufal Adiva Putra Lisna** — Developer (Magang)

