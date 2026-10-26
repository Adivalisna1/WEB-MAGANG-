# 📋 RENCANA AKSI PERBAIKAN KEAMANAN (SECURITY TASK PLAN)

Dokumen ini membagi **78 temuan Semgrep** dari [`SEMGREP_SECURITY_AUDIT.md`](./SEMGREP_SECURITY_AUDIT.md) menjadi **8 Task Modular & Terisolasi**. 
Setiap task dapat dieksekusi secara independen oleh AI atau developer tanpa merusak fitur lainnya.

---

## 🎯 Ringkasan Status Task

| No | Nama Task | Prioritas | Target File | Status |
|:--:|---|:---:|---|:---:|
| **Task 1** | [CORS Hardening & Allowed Origins](#task-1-cors-hardening--allowed-origins) | 🔴 Tinggi | `backend_py/main.py` | ✅ Selesai |
| **Task 2** | [SQLAlchemy Query Parameterization (Stats & Export)](#task-2-sqlalchemy-query-parameterization-stats--export) | 🔴 Tinggi | `stats.py`, `export.py` | ✅ Selesai |
| **Task 3** | [SQLAlchemy Query Parameterization (Eselon 1, Satker, Pimpinan)](#task-3-sqlalchemy-query-parameterization-eselon-1-satker-pimpinan) | 🔴 Tinggi | `eselon_1.py`, `satker.py`, `pimpinan.py` | ✅ Selesai |
| **Task 4** | [SQLAlchemy Query Parameterization (Dokumen, Admin IT, Rekening)](#task-4-sqlalchemy-query-parameterization-dokumen-admin-it-rekening) | 🔴 Tinggi | `dokumen.py`, `admin_it.py`, `pencatatan.py`, `rekening_koran.py` | ✅ Selesai |
| **Task 5** | [Express Backend Security (XSS, Format String, CSRF)](#task-5-express-backend-security-xss-format-string-csrf) | 🟡 Menengah | `backend/src/middleware/activityLogger.js`, `errorHandler.js`, `index.js` | ✅ Selesai |
| **Task 6** | [Docker & Compose Container Hardening](#task-6-docker--compose-container-hardening) | 🟡 Menengah | `backend_py/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml` | ✅ Selesai |
| **Task 7** | [Frontend Build Utility Path Normalization](#task-7-frontend-build-utility-path-normalization) | 🟢 Rendah | `frontend/check_imports.js`, `frontend/fix_ts.js` | ✅ Selesai |
| **Task 8** | [Review Database Seeders & Migration Test Scripts](#task-8-review-database-seeders--migration-test-scripts) | 🟢 Info | `database/init/02_seed.sql`, `test_overhaul_api.py` | ✅ Selesai |

---

## 🛠️ Rincian Detail Setiap Task

### Task 1: CORS Hardening & Allowed Origins
* **Tingkat Bahaya:** 🔴 Tinggi (Mencegah pencurian data via cross-origin request dari website jahat)
* **Target File:**
  * [`backend_py/main.py`](file:///backend_py/main.py#L10)
* **Temuan Terkait:** `SEC-054` (`wildcard-cors`)
* **Langkah Kerja:**
  1. Ganti `allow_origins=["*"]` menjadi daftar origin eksplisit:
     * Frontend Lokal: `http://localhost:3000`
     * Frontend Container: `http://localhost:80`
     * Domain Produksi (jika ada di ENV).
  2. Pastikan `allow_credentials=True` tetap berfungsi untuk cookie/token otentikasi.
* **Instruksi Eksekusi AI:**
  > *"Jalankan Task 1: Perbaiki wildcard CORS di backend_py/main.py sesuai standar keamanan."*

---

### Task 2: SQLAlchemy Query Parameterization (Stats & Export)
* **Tingkat Bahaya:** 🔴 Tinggi (Mencegah SQL Injection pada endpoint agregasi & ekspor data)
* **Target File:**
  * [`backend_py/routers/stats.py`](file:///backend_py/routers/stats.py) (13 raw queries)
  * [`backend_py/routers/export.py`](file:///backend_py/routers/export.py) (3 raw queries)
* **Temuan Terkait:** `SEC-039` s/d `SEC-053` (`sqlalchemy-execute-raw-query`)
* **Langkah Kerja:**
  1. Audit setiap pemanggilan `db.execute(text(...))` di kedua file.
  2. Ubah query string concatenation/f-string menjadi SQLAlchemy parameter binding (`:tahun`, `:kode_kegiatan`, dll).
  3. Kirim parameter via dictionary: `db.execute(text(sql), {"tahun": tahun})`.
* **Instruksi Eksekusi AI:**
  > *"Jalankan Task 2: Parameterisasi semua raw SQL queries di backend_py/routers/stats.py dan export.py."*

---

### Task 3: SQLAlchemy Query Parameterization (Eselon 1, Satker, Pimpinan)
* **Tingkat Bahaya:** 🔴 Tinggi (Mencegah SQL Injection pada hak akses unit kerja)
* **Target File:**
  * [`backend_py/routers/eselon_1.py`](file:///backend_py/routers/eselon_1.py) (12 raw queries)
  * [`backend_py/routers/pimpinan.py`](file:///backend_py/routers/pimpinan.py) (3 raw queries)
  * [`backend_py/routers/satker.py`](file:///backend_py/routers/satker.py) (1 raw query)
* **Temuan Terkait:** `SEC-023` s/d `SEC-038` (`sqlalchemy-execute-raw-query`)
* **Langkah Kerja:**
  1. Pastikan filtering berdasarkan unit kerja, kode eselon, dan id satker menggunakan bind parameter resmi.
  2. Verifikasi tipe data parameter (misal integer casting untuk ID dan sanitasi string untuk kode).
* **Instruksi Eksekusi AI:**
  > *"Jalankan Task 3: Amankan raw SQL query di routers eselon_1.py, pimpinan.py, dan satker.py."*

---

### Task 4: SQLAlchemy Query Parameterization (Dokumen, Admin IT, Rekening)
* **Tingkat Bahaya:** 🔴 Tinggi (Mencegah manipulasi data transaksi dan audit log)
* **Target File:**
  * [`backend_py/routers/dokumen.py`](file:///backend_py/routers/dokumen.py) (6 raw queries)
  * [`backend_py/routers/admin_it.py`](file:///backend_py/routers/admin_it.py) (2 raw queries)
  * [`backend_py/routers/pencatatan.py`](file:///backend_py/routers/pencatatan.py) (1 raw query)
  * [`backend_py/routers/rekening_koran.py`](file:///backend_py/routers/rekening_koran.py) (1 raw query)
* **Temuan Terkait:** `SEC-013` s/d `SEC-022` (`sqlalchemy-execute-raw-query`)
* **Langkah Kerja:**
  1. Bersihkan raw query di fungsi upload dokumen, query rekening koran, dan pencatatan kas.
  2. Pastikan pagination (`LIMIT`, `OFFSET`) menggunakan integer binding.
* **Instruksi Eksekusi AI:**
  > *"Jalankan Task 4: Terapkan secure query binding pada dokumen.py, admin_it.py, pencatatan.py, dan rekening_koran.py."*

---

### Task 5: Express Backend Security (XSS, Format String, CSRF)
* **Tingkat Bahaya:** 🟡 Menengah (Mencegah XSS injection di log dan penguatan middleware)
* **Target File:**
  * [`backend/src/middleware/activityLogger.js`](file:///backend/src/middleware/activityLogger.js) (4 temuan raw-html-format)
  * [`backend/src/middleware/errorHandler.js`](file:///backend/src/middleware/errorHandler.js) (1 temuan unsafe-formatstring)
  * [`backend/src/index.js`](file:///backend/src/index.js) (CSRF middleware)
* **Temuan Terkait:** `SEC-009`, `SEC-010`, `SEC-011`, `SEC-012`, `SEC-077`, `SEC-078`
* **Langkah Kerja:**
  1. Hindari pembuatan output HTML mentah langsung dari input user di `activityLogger.js`.
  2. Perbaiki string formatting di `errorHandler.js`.
* **Instruksi Eksekusi AI:**
  > *"Jalankan Task 5: Perbaiki XSS di activityLogger.js dan audit error handler di Express backend."*

---

### Task 6: Docker & Compose Container Hardening
* **Tingkat Bahaya:** 🟡 Menengah (Mencegah privilege escalation jika container disusupi)
* **Target File:**
  * [`backend_py/Dockerfile`](file:///backend_py/Dockerfile)
  * [`frontend/Dockerfile`](file:///frontend/Dockerfile)
  * [`docker-compose.yml`](file:///docker-compose.yml)
* **Temuan Terkait:** `SEC-001`, `SEC-055`, `SEC-056`, `SEC-057`, `SEC-058`, `SEC-059`
* **Langkah Kerja:**
  1. Tambahkan instruksi pembuatan dan pemakaian non-root user (`appuser`) di `backend_py/Dockerfile` dan `frontend/Dockerfile`.
  2. Tambahkan `security_opt: ["no-new-privileges:true"]` di service container `docker-compose.yml`.
* **Instruksi Eksekusi AI:**
  > *"Jalankan Task 6: Lakukan hardening Dockerfile dan docker-compose.yml untuk non-root user."*

---

### Task 7: Frontend Build Utility Path Normalization
* **Tingkat Bahaya:** 🟢 Rendah (Mencegah path traversal di internal development scripts)
* **Target File:**
  * [`frontend/check_imports.js`](file:///frontend/check_imports.js)
  * [`frontend/fix_ts.js`](file:///frontend/fix_ts.js)
* **Temuan Terkait:** `SEC-003` s/d `SEC-008` (`path-join-resolve-traversal`)
* **Langkah Kerja:**
  1. Terapkan fungsi pembatas path absolut menggunakan `path.resolve(__dirname, ...)` pada script pemindaian modul frontend.
* **Instruksi Eksekusi AI:**
  > *"Jalankan Task 7: Bersihkan warning path traversal di frontend/check_imports.js dan fix_ts.js."*

---

### Task 8: Review Database Seeders & Migration Test Scripts
* **Tingkat Bahaya:** 🟢 Info / Baseline
* **Target File:**
  * [`database/init/02_seed.sql`](file:///database/init/02_seed.sql)
  * [`database/railway_02_seed.sql`](file:///database/railway_02_seed.sql)
  * [`database/add_it_admin.sql`](file:///database/add_it_admin.sql)
  * [`backend_py/migrations/test_overhaul_api.py`](file:///backend_py/migrations/test_overhaul_api.py)
* **Temuan Terkait:** `SEC-060` s/d `SEC-076`
* **Langkah Kerja:**
  1. Berikan dokumentasi bahwa hash password di file seed adalah data dummy khusus pengujian lokal.
  2. Pastikan file migrasi tidak digunakan langsung di server production terbuka.
* **Instruksi Eksekusi AI:**
  > *"Jalankan Task 8: Dokumentasikan status dummy password di seeder SQL dan rapikan test script."*

