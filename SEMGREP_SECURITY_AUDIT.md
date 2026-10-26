# 🛡️ LAPORAN AUDIT KEAMANAN KODE (SEMGREP SECURITY AUDIT)

> **Tanggal Audit:** 26 Oktober 2026  
> **Command:** `semgrep scan --config auto`  
> **Total Temuan:** 78 temuan  
> **Format Dokumen:** Terstruktur & Terindeks per Item (`SEC-001` s/d `SEC-078`) agar mudah dibaca dan dieksekusi oleh AI.

---

## 📊 1. Ringkasan Tingkat Keparahan (Severity Summary)

| Severity | Jumlah | Keterangan & Prioritas |
|---|:---:|---|
| 🔴 **ERROR (Blocking)** | 56 | Prioritas 1: Wajib diperbaiki (SQL Injection, Path Traversal, Wildcard CORS) |
| 🟡 **WARNING** | 20 | Prioritas 2: Hardening (Docker security, Bcrypt seed hardcode, write permissions) |
| 🔵 **INFO** | 2 | Prioritas 3: Kebijakan Arsitektur (CSRF Protection audit) |

---

## 🗂️ 2. Pengelompokan Kategori Kerentanan

1. **SQL Injection / SQLAlchemy Raw Query (42 temuan)**: Penggunaan raw query `db.execute(text(...))` di router FastAPI (`backend_py/routers/stats.py`, `eselon_1.py`, `dokumen.py`, dll).
2. **Hardcoded Secrets / Bcrypt Hash (12 temuan)**: Password hash di file seeder lokal (`database/init/02_seed.sql`).
3. **Path Traversal (10 temuan)**: Penggunaan `path.join` pada script frontend build/migration (`check_imports.js`, `fix_ts.js`).
4. **Docker & Compose Hardening (6 temuan)**: Layanan berjalan sebagai root dan filesystem writable di `backend_py/Dockerfile` dan `docker-compose.yml`.
5. **XSS / Raw HTML String (4 temuan)**: Interpolasi string HTML di middleware Express (`backend/src/middleware/activityLogger.js`).
6. **Wildcard CORS (1 temuan)**: `allow_origins=["*"]` di `backend_py/main.py`.
7. **Dynamic URL / SSRF (1 temuan)**: Penggunaan parameter URL dinamis pada `backend_py/routers/dokumen.py`.
8. **CSRF Middleware (1 temuan)**: Belum adanya middleware CSRF eksplisit di Express backend.
9. **Unsafe Format String (1 temuan)**: Format string utilitas di Express errorHandler.

---

## 🔍 3. Katalog Temuan Rinci (Item-by-Item Actionable Guide)

### Item #1: `SEC-001` - missing-user
- **Kode Temuan:** `SEC-001`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/Dockerfile`](file:///backend_py/Dockerfile#L24-L24) (Baris 24 - 24)
- **Rule Semgrep:** `dockerfile.security.missing-user.missing-user`
- **Deskripsi Masalah:** By not specifying a USER, a program in the container may run as 'root'. This is a security hazard. If an attacker can control a process running as root, they may have control over the container. Ensure that the last USER in a Dockerfile is a USER other than 'root'.

**Cuplikan Kode:**
```dockerfile
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Tambahkan non-root user di Dockerfile: `RUN addgroup --system app && adduser --system --group app` dan `USER app`.

---

### Item #2: `SEC-002` - detected-bcrypt-hash
- **Kode Temuan:** `SEC-002`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/migrations/update_kl_accounts.py`](file:///backend_py/migrations/update_kl_accounts.py#L25-L25) (Baris 25 - 25)
- **Rule Semgrep:** `generic.secrets.security.detected-bcrypt-hash.detected-bcrypt-hash`
- **Deskripsi Masalah:** bcrypt hash detected

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Ini adalah seed lokal database pengujian. Jika untuk production, pindahkan seed password awal ke secure environment variables atau command CLI `createsuperuser`.

---

### Item #3: `SEC-003` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-003`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/admin_it.py`](file:///backend_py/routers/admin_it.py#L425-L425) (Baris 425 - 425)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #4: `SEC-004` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-004`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/admin_it.py`](file:///backend_py/routers/admin_it.py#L432-L432) (Baris 432 - 432)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #5: `SEC-005` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-005`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/dokumen.py`](file:///backend_py/routers/dokumen.py#L38-L38) (Baris 38 - 38)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #6: `SEC-006` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-006`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/dokumen.py`](file:///backend_py/routers/dokumen.py#L44-L44) (Baris 44 - 44)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #7: `SEC-007` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-007`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/dokumen.py`](file:///backend_py/routers/dokumen.py#L94-L94) (Baris 94 - 94)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #8: `SEC-008` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-008`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/dokumen.py`](file:///backend_py/routers/dokumen.py#L97-L102) (Baris 97 - 102)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #9: `SEC-009` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-009`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/dokumen.py`](file:///backend_py/routers/dokumen.py#L184-L184) (Baris 184 - 184)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #10: `SEC-010` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-010`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/dokumen.py`](file:///backend_py/routers/dokumen.py#L187-L193) (Baris 187 - 193)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #11: `SEC-011` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-011`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/eselon_1.py`](file:///backend_py/routers/eselon_1.py#L88-L100) (Baris 88 - 100)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #12: `SEC-012` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-012`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/eselon_1.py`](file:///backend_py/routers/eselon_1.py#L120-L125) (Baris 120 - 125)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #13: `SEC-013` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-013`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/eselon_1.py`](file:///backend_py/routers/eselon_1.py#L128-L139) (Baris 128 - 139)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #14: `SEC-014` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-014`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/eselon_1.py`](file:///backend_py/routers/eselon_1.py#L142-L153) (Baris 142 - 153)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #15: `SEC-015` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-015`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/eselon_1.py`](file:///backend_py/routers/eselon_1.py#L156-L163) (Baris 156 - 163)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #16: `SEC-016` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-016`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/eselon_1.py`](file:///backend_py/routers/eselon_1.py#L213-L226) (Baris 213 - 226)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #17: `SEC-017` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-017`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/eselon_1.py`](file:///backend_py/routers/eselon_1.py#L252-L264) (Baris 252 - 264)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #18: `SEC-018` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-018`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/eselon_1.py`](file:///backend_py/routers/eselon_1.py#L282-L295) (Baris 282 - 295)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #19: `SEC-019` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-019`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/eselon_1.py`](file:///backend_py/routers/eselon_1.py#L468-L479) (Baris 468 - 479)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #20: `SEC-020` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-020`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/eselon_1.py`](file:///backend_py/routers/eselon_1.py#L482-L482) (Baris 482 - 482)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #21: `SEC-021` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-021`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/eselon_1.py`](file:///backend_py/routers/eselon_1.py#L548-L570) (Baris 548 - 570)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #22: `SEC-022` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-022`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/eselon_1.py`](file:///backend_py/routers/eselon_1.py#L580-L614) (Baris 580 - 614)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #23: `SEC-023` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-023`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/export.py`](file:///backend_py/routers/export.py#L62-L83) (Baris 62 - 83)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #24: `SEC-024` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-024`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/export.py`](file:///backend_py/routers/export.py#L183-L203) (Baris 183 - 203)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #25: `SEC-025` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-025`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/export.py`](file:///backend_py/routers/export.py#L275-L295) (Baris 275 - 295)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #26: `SEC-026` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-026`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/pencatatan.py`](file:///backend_py/routers/pencatatan.py#L121-L121) (Baris 121 - 121)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #27: `SEC-027` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-027`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/pimpinan.py`](file:///backend_py/routers/pimpinan.py#L36-L50) (Baris 36 - 50)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #28: `SEC-028` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-028`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/pimpinan.py`](file:///backend_py/routers/pimpinan.py#L237-L245) (Baris 237 - 245)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #29: `SEC-029` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-029`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/pimpinan.py`](file:///backend_py/routers/pimpinan.py#L248-L248) (Baris 248 - 248)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #30: `SEC-030` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-030`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/rekening_koran.py`](file:///backend_py/routers/rekening_koran.py#L43-L43) (Baris 43 - 43)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #31: `SEC-031` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-031`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/satker.py`](file:///backend_py/routers/satker.py#L44-L44) (Baris 44 - 44)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #32: `SEC-032` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-032`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/stats.py`](file:///backend_py/routers/stats.py#L81-L81) (Baris 81 - 81)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #33: `SEC-033` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-033`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/stats.py`](file:///backend_py/routers/stats.py#L105-L105) (Baris 105 - 105)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #34: `SEC-034` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-034`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/stats.py`](file:///backend_py/routers/stats.py#L109-L109) (Baris 109 - 109)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #35: `SEC-035` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-035`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/stats.py`](file:///backend_py/routers/stats.py#L147-L154) (Baris 147 - 154)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #36: `SEC-036` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-036`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/stats.py`](file:///backend_py/routers/stats.py#L163-L169) (Baris 163 - 169)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #37: `SEC-037` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-037`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/stats.py`](file:///backend_py/routers/stats.py#L185-L192) (Baris 185 - 192)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #38: `SEC-038` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-038`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/stats.py`](file:///backend_py/routers/stats.py#L219-L224) (Baris 219 - 224)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #39: `SEC-039` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-039`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/stats.py`](file:///backend_py/routers/stats.py#L270-L274) (Baris 270 - 274)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #40: `SEC-040` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-040`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/stats.py`](file:///backend_py/routers/stats.py#L287-L292) (Baris 287 - 292)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #41: `SEC-041` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-041`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/stats.py`](file:///backend_py/routers/stats.py#L311-L318) (Baris 311 - 318)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #42: `SEC-042` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-042`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/stats.py`](file:///backend_py/routers/stats.py#L327-L334) (Baris 327 - 334)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #43: `SEC-043` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-043`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/stats.py`](file:///backend_py/routers/stats.py#L353-L360) (Baris 353 - 360)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #44: `SEC-044` - sqlalchemy-execute-raw-query
- **Kode Temuan:** `SEC-044`
- **Severity:** 🔴 ERROR
- **File Target:** [`backend_py/routers/stats.py`](file:///backend_py/routers/stats.py#L389-L396) (Baris 389 - 396)
- **Rule Semgrep:** `python.sqlalchemy.security.sqlalchemy-execute-raw-query.sqlalchemy-execute-raw-query`
- **Deskripsi Masalah:** Avoiding SQL string concatenation: untrusted input concatenated with raw SQL query can result in SQL Injection. In order to execute raw query safely, prepared statement should be used. SQLAlchemy provides TextualSQL to easily used prepared statement with named parameters. For complex SQL composition, use SQL Expression Language or Schema Definition Language. In most cases, SQLAlchemy ORM will be a better option.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Pastikan query menggunakan parameterized query resmi SQLAlchemy `:nama_param` dan dioper via `db.execute(text(sql), {"nama_param": nilai})`. Jangan sekali-kali menggabungkan string variabel secara langsung ke dalam query.

---

### Item #45: `SEC-045` - detected-bcrypt-hash
- **Kode Temuan:** `SEC-045`
- **Severity:** 🔴 ERROR
- **File Target:** [`database/add_it_admin.sql`](file:///database/add_it_admin.sql#L14-L14) (Baris 14 - 14)
- **Rule Semgrep:** `generic.secrets.security.detected-bcrypt-hash.detected-bcrypt-hash`
- **Deskripsi Masalah:** bcrypt hash detected

**Cuplikan Kode:**
```sql
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Ini adalah seed lokal database pengujian. Jika untuk production, pindahkan seed password awal ke secure environment variables atau command CLI `createsuperuser`.

---

### Item #46: `SEC-046` - detected-bcrypt-hash
- **Kode Temuan:** `SEC-046`
- **Severity:** 🔴 ERROR
- **File Target:** [`database/init/02_seed.sql`](file:///database/init/02_seed.sql#L29-L29) (Baris 29 - 29)
- **Rule Semgrep:** `generic.secrets.security.detected-bcrypt-hash.detected-bcrypt-hash`
- **Deskripsi Masalah:** bcrypt hash detected

**Cuplikan Kode:**
```sql
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Ini adalah seed lokal database pengujian. Jika untuk production, pindahkan seed password awal ke secure environment variables atau command CLI `createsuperuser`.

---

### Item #47: `SEC-047` - detected-bcrypt-hash
- **Kode Temuan:** `SEC-047`
- **Severity:** 🔴 ERROR
- **File Target:** [`database/init/02_seed.sql`](file:///database/init/02_seed.sql#L38-L38) (Baris 38 - 38)
- **Rule Semgrep:** `generic.secrets.security.detected-bcrypt-hash.detected-bcrypt-hash`
- **Deskripsi Masalah:** bcrypt hash detected

**Cuplikan Kode:**
```sql
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Ini adalah seed lokal database pengujian. Jika untuk production, pindahkan seed password awal ke secure environment variables atau command CLI `createsuperuser`.

---

### Item #48: `SEC-048` - detected-bcrypt-hash
- **Kode Temuan:** `SEC-048`
- **Severity:** 🔴 ERROR
- **File Target:** [`database/init/02_seed.sql`](file:///database/init/02_seed.sql#L47-L47) (Baris 47 - 47)
- **Rule Semgrep:** `generic.secrets.security.detected-bcrypt-hash.detected-bcrypt-hash`
- **Deskripsi Masalah:** bcrypt hash detected

**Cuplikan Kode:**
```sql
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Ini adalah seed lokal database pengujian. Jika untuk production, pindahkan seed password awal ke secure environment variables atau command CLI `createsuperuser`.

---

### Item #49: `SEC-049` - detected-bcrypt-hash
- **Kode Temuan:** `SEC-049`
- **Severity:** 🔴 ERROR
- **File Target:** [`database/init/02_seed.sql`](file:///database/init/02_seed.sql#L56-L56) (Baris 56 - 56)
- **Rule Semgrep:** `generic.secrets.security.detected-bcrypt-hash.detected-bcrypt-hash`
- **Deskripsi Masalah:** bcrypt hash detected

**Cuplikan Kode:**
```sql
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Ini adalah seed lokal database pengujian. Jika untuk production, pindahkan seed password awal ke secure environment variables atau command CLI `createsuperuser`.

---

### Item #50: `SEC-050` - detected-bcrypt-hash
- **Kode Temuan:** `SEC-050`
- **Severity:** 🔴 ERROR
- **File Target:** [`database/init/02_seed.sql`](file:///database/init/02_seed.sql#L65-L65) (Baris 65 - 65)
- **Rule Semgrep:** `generic.secrets.security.detected-bcrypt-hash.detected-bcrypt-hash`
- **Deskripsi Masalah:** bcrypt hash detected

**Cuplikan Kode:**
```sql
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Ini adalah seed lokal database pengujian. Jika untuk production, pindahkan seed password awal ke secure environment variables atau command CLI `createsuperuser`.

---

### Item #51: `SEC-051` - detected-bcrypt-hash
- **Kode Temuan:** `SEC-051`
- **Severity:** 🔴 ERROR
- **File Target:** [`database/railway_02_seed.sql`](file:///database/railway_02_seed.sql#L29-L29) (Baris 29 - 29)
- **Rule Semgrep:** `generic.secrets.security.detected-bcrypt-hash.detected-bcrypt-hash`
- **Deskripsi Masalah:** bcrypt hash detected

**Cuplikan Kode:**
```sql
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Ini adalah seed lokal database pengujian. Jika untuk production, pindahkan seed password awal ke secure environment variables atau command CLI `createsuperuser`.

---

### Item #52: `SEC-052` - detected-bcrypt-hash
- **Kode Temuan:** `SEC-052`
- **Severity:** 🔴 ERROR
- **File Target:** [`database/railway_02_seed.sql`](file:///database/railway_02_seed.sql#L38-L38) (Baris 38 - 38)
- **Rule Semgrep:** `generic.secrets.security.detected-bcrypt-hash.detected-bcrypt-hash`
- **Deskripsi Masalah:** bcrypt hash detected

**Cuplikan Kode:**
```sql
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Ini adalah seed lokal database pengujian. Jika untuk production, pindahkan seed password awal ke secure environment variables atau command CLI `createsuperuser`.

---

### Item #53: `SEC-053` - detected-bcrypt-hash
- **Kode Temuan:** `SEC-053`
- **Severity:** 🔴 ERROR
- **File Target:** [`database/railway_02_seed.sql`](file:///database/railway_02_seed.sql#L47-L47) (Baris 47 - 47)
- **Rule Semgrep:** `generic.secrets.security.detected-bcrypt-hash.detected-bcrypt-hash`
- **Deskripsi Masalah:** bcrypt hash detected

**Cuplikan Kode:**
```sql
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Ini adalah seed lokal database pengujian. Jika untuk production, pindahkan seed password awal ke secure environment variables atau command CLI `createsuperuser`.

---

### Item #54: `SEC-054` - detected-bcrypt-hash
- **Kode Temuan:** `SEC-054`
- **Severity:** 🔴 ERROR
- **File Target:** [`database/railway_02_seed.sql`](file:///database/railway_02_seed.sql#L56-L56) (Baris 56 - 56)
- **Rule Semgrep:** `generic.secrets.security.detected-bcrypt-hash.detected-bcrypt-hash`
- **Deskripsi Masalah:** bcrypt hash detected

**Cuplikan Kode:**
```sql
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Ini adalah seed lokal database pengujian. Jika untuk production, pindahkan seed password awal ke secure environment variables atau command CLI `createsuperuser`.

---

### Item #55: `SEC-055` - detected-bcrypt-hash
- **Kode Temuan:** `SEC-055`
- **Severity:** 🔴 ERROR
- **File Target:** [`database/railway_02_seed.sql`](file:///database/railway_02_seed.sql#L65-L65) (Baris 65 - 65)
- **Rule Semgrep:** `generic.secrets.security.detected-bcrypt-hash.detected-bcrypt-hash`
- **Deskripsi Masalah:** bcrypt hash detected

**Cuplikan Kode:**
```sql
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Ini adalah seed lokal database pengujian. Jika untuk production, pindahkan seed password awal ke secure environment variables atau command CLI `createsuperuser`.

---

### Item #56: `SEC-056` - missing-user
- **Kode Temuan:** `SEC-056`
- **Severity:** 🔴 ERROR
- **File Target:** [`frontend/Dockerfile`](file:///frontend/Dockerfile#L28-L28) (Baris 28 - 28)
- **Rule Semgrep:** `dockerfile.security.missing-user.missing-user`
- **Deskripsi Masalah:** By not specifying a USER, a program in the container may run as 'root'. This is a security hazard. If an attacker can control a process running as root, they may have control over the container. Ensure that the last USER in a Dockerfile is a USER other than 'root'.

**Cuplikan Kode:**
```dockerfile
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Tambahkan non-root user di Dockerfile: `RUN addgroup --system app && adduser --system --group app` dan `USER app`.

---

### Item #57: `SEC-057` - raw-html-format
- **Kode Temuan:** `SEC-057`
- **Severity:** 🟡 WARNING
- **File Target:** [`backend/src/middleware/activityLogger.js`](file:///backend/src/middleware/activityLogger.js#L36-L36) (Baris 36 - 36)
- **Rule Semgrep:** `javascript.express.security.injection.raw-html-format.raw-html-format`
- **Deskripsi Masalah:** User data flows into the host portion of this manually-constructed HTML. This can introduce a Cross-Site-Scripting (XSS) vulnerability if this comes from user-provided input. Consider using a sanitization library such as DOMPurify to sanitize the HTML within.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Lakukan sanitasi / escaping string variabel sebelum dimasukkan ke dalam template HTML atau response Express.

---

### Item #58: `SEC-058` - raw-html-format
- **Kode Temuan:** `SEC-058`
- **Severity:** 🟡 WARNING
- **File Target:** [`backend/src/middleware/activityLogger.js`](file:///backend/src/middleware/activityLogger.js#L37-L37) (Baris 37 - 37)
- **Rule Semgrep:** `javascript.express.security.injection.raw-html-format.raw-html-format`
- **Deskripsi Masalah:** User data flows into the host portion of this manually-constructed HTML. This can introduce a Cross-Site-Scripting (XSS) vulnerability if this comes from user-provided input. Consider using a sanitization library such as DOMPurify to sanitize the HTML within.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Lakukan sanitasi / escaping string variabel sebelum dimasukkan ke dalam template HTML atau response Express.

---

### Item #59: `SEC-059` - raw-html-format
- **Kode Temuan:** `SEC-059`
- **Severity:** 🟡 WARNING
- **File Target:** [`backend/src/middleware/activityLogger.js`](file:///backend/src/middleware/activityLogger.js#L45-L45) (Baris 45 - 45)
- **Rule Semgrep:** `javascript.express.security.injection.raw-html-format.raw-html-format`
- **Deskripsi Masalah:** User data flows into the host portion of this manually-constructed HTML. This can introduce a Cross-Site-Scripting (XSS) vulnerability if this comes from user-provided input. Consider using a sanitization library such as DOMPurify to sanitize the HTML within.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Lakukan sanitasi / escaping string variabel sebelum dimasukkan ke dalam template HTML atau response Express.

---

### Item #60: `SEC-060` - raw-html-format
- **Kode Temuan:** `SEC-060`
- **Severity:** 🟡 WARNING
- **File Target:** [`backend/src/middleware/activityLogger.js`](file:///backend/src/middleware/activityLogger.js#L56-L56) (Baris 56 - 56)
- **Rule Semgrep:** `javascript.express.security.injection.raw-html-format.raw-html-format`
- **Deskripsi Masalah:** User data flows into the host portion of this manually-constructed HTML. This can introduce a Cross-Site-Scripting (XSS) vulnerability if this comes from user-provided input. Consider using a sanitization library such as DOMPurify to sanitize the HTML within.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Lakukan sanitasi / escaping string variabel sebelum dimasukkan ke dalam template HTML atau response Express.

---

### Item #61: `SEC-061` - wildcard-cors
- **Kode Temuan:** `SEC-061`
- **Severity:** 🟡 WARNING
- **File Target:** [`backend_py/main.py`](file:///backend_py/main.py#L10-L10) (Baris 10 - 10)
- **Rule Semgrep:** `python.fastapi.security.wildcard-cors.wildcard-cors`
- **Deskripsi Masalah:** CORS policy allows any origin (using wildcard '*'). This is insecure and should be avoided.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Ubah `allow_origins=["*"]` di FastAPI menjadi domain spesifik dari frontend (`allow_origins=["http://localhost:3000", "http://localhost:8085"]`).

---

### Item #62: `SEC-062` - dynamic-urllib-use-detected
- **Kode Temuan:** `SEC-062`
- **Severity:** 🟡 WARNING
- **File Target:** [`backend_py/migrations/test_overhaul_api.py`](file:///backend_py/migrations/test_overhaul_api.py#L27-L27) (Baris 27 - 27)
- **Rule Semgrep:** `python.lang.security.audit.dynamic-urllib-use-detected.dynamic-urllib-use-detected`
- **Deskripsi Masalah:** Detected a dynamic value being used with urllib. urllib supports 'file://' schemes, so a dynamic value controlled by a malicious actor may allow them to read arbitrary files. Audit uses of urllib calls to ensure user data cannot control the URLs, or consider using the 'requests' library instead.

**Cuplikan Kode:**
```python
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Validasi URL dengan whitelist skema (`http://`, `https://`) dan whitelist domain sebelum melakukan HTTP request guna mencegah Server-Side Request Forgery (SSRF).

---

### Item #63: `SEC-063` - no-new-privileges
- **Kode Temuan:** `SEC-063`
- **Severity:** 🟡 WARNING
- **File Target:** [`docker-compose.yml`](file:///docker-compose.yml#L7-L7) (Baris 7 - 7)
- **Rule Semgrep:** `yaml.docker-compose.security.no-new-privileges.no-new-privileges`
- **Deskripsi Masalah:** Service 'db' allows for privilege escalation via setuid or setgid binaries. Add 'no-new-privileges:true' in 'security_opt' to prevent this.

**Cuplikan Kode:**
```yaml
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Tambahkan `security_opt: ["no-new-privileges:true"]` pada service terkait di `docker-compose.yml`.

---

### Item #64: `SEC-064` - writable-filesystem-service
- **Kode Temuan:** `SEC-064`
- **Severity:** 🟡 WARNING
- **File Target:** [`docker-compose.yml`](file:///docker-compose.yml#L7-L7) (Baris 7 - 7)
- **Rule Semgrep:** `yaml.docker-compose.security.writable-filesystem-service.writable-filesystem-service`
- **Deskripsi Masalah:** Service 'db' is running with a writable root filesystem. This may allow malicious applications to download and run additional payloads, or modify container files. If an application inside a container has to save something temporarily consider using a tmpfs. Add 'read_only: true' to this service to prevent this.

**Cuplikan Kode:**
```yaml
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Tetapkan `read_only: true` pada container jika tidak memerlukan penulisan file ke root filesystem container.

---

### Item #65: `SEC-065` - no-new-privileges
- **Kode Temuan:** `SEC-065`
- **Severity:** 🟡 WARNING
- **File Target:** [`docker-compose.yml`](file:///docker-compose.yml#L91-L91) (Baris 91 - 91)
- **Rule Semgrep:** `yaml.docker-compose.security.no-new-privileges.no-new-privileges`
- **Deskripsi Masalah:** Service 'phpmyadmin' allows for privilege escalation via setuid or setgid binaries. Add 'no-new-privileges:true' in 'security_opt' to prevent this.

**Cuplikan Kode:**
```yaml
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Tambahkan `security_opt: ["no-new-privileges:true"]` pada service terkait di `docker-compose.yml`.

---

### Item #66: `SEC-066` - writable-filesystem-service
- **Kode Temuan:** `SEC-066`
- **Severity:** 🟡 WARNING
- **File Target:** [`docker-compose.yml`](file:///docker-compose.yml#L91-L91) (Baris 91 - 91)
- **Rule Semgrep:** `yaml.docker-compose.security.writable-filesystem-service.writable-filesystem-service`
- **Deskripsi Masalah:** Service 'phpmyadmin' is running with a writable root filesystem. This may allow malicious applications to download and run additional payloads, or modify container files. If an application inside a container has to save something temporarily consider using a tmpfs. Add 'read_only: true' to this service to prevent this.

**Cuplikan Kode:**
```yaml
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Tetapkan `read_only: true` pada container jika tidak memerlukan penulisan file ke root filesystem container.

---

### Item #67: `SEC-067` - path-join-resolve-traversal
- **Kode Temuan:** `SEC-067`
- **Severity:** 🟡 WARNING
- **File Target:** [`frontend/check_imports.js`](file:///frontend/check_imports.js#L7-L7) (Baris 7 - 7)
- **Rule Semgrep:** `javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal`
- **Deskripsi Masalah:** Detected possible user input going into a `path.join` or `path.resolve` function. This could possibly lead to a path traversal vulnerability,  where the attacker can access arbitrary files stored in the file system. Instead, be sure to sanitize or validate user input first.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Validasi input path dengan `path.resolve` dan pastikan `targetPath.startsWith(safeBaseDir + path.sep)`.

---

### Item #68: `SEC-068` - path-join-resolve-traversal
- **Kode Temuan:** `SEC-068`
- **Severity:** 🟡 WARNING
- **File Target:** [`frontend/check_imports.js`](file:///frontend/check_imports.js#L7-L7) (Baris 7 - 7)
- **Rule Semgrep:** `javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal`
- **Deskripsi Masalah:** Detected possible user input going into a `path.join` or `path.resolve` function. This could possibly lead to a path traversal vulnerability,  where the attacker can access arbitrary files stored in the file system. Instead, be sure to sanitize or validate user input first.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Validasi input path dengan `path.resolve` dan pastikan `targetPath.startsWith(safeBaseDir + path.sep)`.

---

### Item #69: `SEC-069` - path-join-resolve-traversal
- **Kode Temuan:** `SEC-069`
- **Severity:** 🟡 WARNING
- **File Target:** [`frontend/check_imports.js`](file:///frontend/check_imports.js#L22-L22) (Baris 22 - 22)
- **Rule Semgrep:** `javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal`
- **Deskripsi Masalah:** Detected possible user input going into a `path.join` or `path.resolve` function. This could possibly lead to a path traversal vulnerability,  where the attacker can access arbitrary files stored in the file system. Instead, be sure to sanitize or validate user input first.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Validasi input path dengan `path.resolve` dan pastikan `targetPath.startsWith(safeBaseDir + path.sep)`.

---

### Item #70: `SEC-070` - path-join-resolve-traversal
- **Kode Temuan:** `SEC-070`
- **Severity:** 🟡 WARNING
- **File Target:** [`frontend/check_imports.js`](file:///frontend/check_imports.js#L26-L26) (Baris 26 - 26)
- **Rule Semgrep:** `javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal`
- **Deskripsi Masalah:** Detected possible user input going into a `path.join` or `path.resolve` function. This could possibly lead to a path traversal vulnerability,  where the attacker can access arbitrary files stored in the file system. Instead, be sure to sanitize or validate user input first.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Validasi input path dengan `path.resolve` dan pastikan `targetPath.startsWith(safeBaseDir + path.sep)`.

---

### Item #71: `SEC-071` - path-join-resolve-traversal
- **Kode Temuan:** `SEC-071`
- **Severity:** 🟡 WARNING
- **File Target:** [`frontend/check_imports.js`](file:///frontend/check_imports.js#L26-L26) (Baris 26 - 26)
- **Rule Semgrep:** `javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal`
- **Deskripsi Masalah:** Detected possible user input going into a `path.join` or `path.resolve` function. This could possibly lead to a path traversal vulnerability,  where the attacker can access arbitrary files stored in the file system. Instead, be sure to sanitize or validate user input first.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Validasi input path dengan `path.resolve` dan pastikan `targetPath.startsWith(safeBaseDir + path.sep)`.

---

### Item #72: `SEC-072` - path-join-resolve-traversal
- **Kode Temuan:** `SEC-072`
- **Severity:** 🟡 WARNING
- **File Target:** [`frontend/fix_ts.js`](file:///frontend/fix_ts.js#L5-L5) (Baris 5 - 5)
- **Rule Semgrep:** `javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal`
- **Deskripsi Masalah:** Detected possible user input going into a `path.join` or `path.resolve` function. This could possibly lead to a path traversal vulnerability,  where the attacker can access arbitrary files stored in the file system. Instead, be sure to sanitize or validate user input first.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Validasi input path dengan `path.resolve` dan pastikan `targetPath.startsWith(safeBaseDir + path.sep)`.

---

### Item #73: `SEC-073` - path-join-resolve-traversal
- **Kode Temuan:** `SEC-073`
- **Severity:** 🟡 WARNING
- **File Target:** [`frontend/fix_ts.js`](file:///frontend/fix_ts.js#L40-L40) (Baris 40 - 40)
- **Rule Semgrep:** `javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal`
- **Deskripsi Masalah:** Detected possible user input going into a `path.join` or `path.resolve` function. This could possibly lead to a path traversal vulnerability,  where the attacker can access arbitrary files stored in the file system. Instead, be sure to sanitize or validate user input first.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Validasi input path dengan `path.resolve` dan pastikan `targetPath.startsWith(safeBaseDir + path.sep)`.

---

### Item #74: `SEC-074` - path-join-resolve-traversal
- **Kode Temuan:** `SEC-074`
- **Severity:** 🟡 WARNING
- **File Target:** [`frontend/fix_ts.js`](file:///frontend/fix_ts.js#L58-L58) (Baris 58 - 58)
- **Rule Semgrep:** `javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal`
- **Deskripsi Masalah:** Detected possible user input going into a `path.join` or `path.resolve` function. This could possibly lead to a path traversal vulnerability,  where the attacker can access arbitrary files stored in the file system. Instead, be sure to sanitize or validate user input first.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Validasi input path dengan `path.resolve` dan pastikan `targetPath.startsWith(safeBaseDir + path.sep)`.

---

### Item #75: `SEC-075` - path-join-resolve-traversal
- **Kode Temuan:** `SEC-075`
- **Severity:** 🟡 WARNING
- **File Target:** [`frontend/fix_ts.js`](file:///frontend/fix_ts.js#L59-L59) (Baris 59 - 59)
- **Rule Semgrep:** `javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal`
- **Deskripsi Masalah:** Detected possible user input going into a `path.join` or `path.resolve` function. This could possibly lead to a path traversal vulnerability,  where the attacker can access arbitrary files stored in the file system. Instead, be sure to sanitize or validate user input first.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Validasi input path dengan `path.resolve` dan pastikan `targetPath.startsWith(safeBaseDir + path.sep)`.

---

### Item #76: `SEC-076` - path-join-resolve-traversal
- **Kode Temuan:** `SEC-076`
- **Severity:** 🟡 WARNING
- **File Target:** [`frontend/fix_ts.js`](file:///frontend/fix_ts.js#L78-L78) (Baris 78 - 78)
- **Rule Semgrep:** `javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal`
- **Deskripsi Masalah:** Detected possible user input going into a `path.join` or `path.resolve` function. This could possibly lead to a path traversal vulnerability,  where the attacker can access arbitrary files stored in the file system. Instead, be sure to sanitize or validate user input first.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Validasi input path dengan `path.resolve` dan pastikan `targetPath.startsWith(safeBaseDir + path.sep)`.

---

### Item #77: `SEC-077` - express-check-csurf-middleware-usage
- **Kode Temuan:** `SEC-077`
- **Severity:** 🔵 INFO
- **File Target:** [`backend/src/index.js`](file:///backend/src/index.js#L16-L16) (Baris 16 - 16)
- **Rule Semgrep:** `javascript.express.security.audit.express-check-csurf-middleware-usage.express-check-csurf-middleware-usage`
- **Deskripsi Masalah:** A CSRF middleware was not detected in your express application. Ensure you are either using one such as `csurf` or `csrf` (see rule references) and/or you are properly doing CSRF validation in your routes with a token or cookies.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Audit implementasi kode sesuai rekomendasi Semgrep.

---

### Item #78: `SEC-078` - unsafe-formatstring
- **Kode Temuan:** `SEC-078`
- **Severity:** 🔵 INFO
- **File Target:** [`backend/src/middleware/errorHandler.js`](file:///backend/src/middleware/errorHandler.js#L3-L3) (Baris 3 - 3)
- **Rule Semgrep:** `javascript.lang.security.audit.unsafe-formatstring.unsafe-formatstring`
- **Deskripsi Masalah:** Detected string concatenation with a non-literal variable in a util.format / console.log function. If an attacker injects a format specifier in the string, it will forge the log message. Try to use constant values for the format string.

**Cuplikan Kode:**
```javascript
requires login
```

**Instruksi Perbaikan untuk AI:**
- **Tindakan:** Audit implementasi kode sesuai rekomendasi Semgrep.

---
