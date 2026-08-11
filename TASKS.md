# Task & Fitur Web Dashboard Laporan

---

## Fitur yang Sudah Ada ✅

### Autentikasi & Keamanan
- ✅ Login dengan username/email + password
- ✅ JWT Token dengan expiry 8 jam
- ✅ bcrypt untuk hash password
- ✅ Role-based access (admin & staff)
- ✅ Session tracking (login/logout)
- ✅ Rate limiter — cegah brute force login
- ✅ Logout otomatis tutup session lama
- ✅ Session dianggap offline setelah 15 menit tidak aktif

### Dashboard Publik
- ✅ Daftar dokumen terverifikasi
- ✅ Filter by kategori
- ✅ Filter by tahun
- ✅ Pencarian by judul
- ✅ Download dokumen tanpa login
- ✅ Halaman detail dokumen
- ✅ Statistik total dokumen, kategori, unduhan
- ✅ Pagination

### Dashboard Staff
- ✅ Upload dokumen (drag & drop, maks 500MB)
- ✅ Format yang didukung: PDF, DOC, DOCX, XLS, XLSX
- ✅ Edit metadata (judul, kategori, tahun, deskripsi)
- ✅ Ganti file dokumen saat status draft/revisi
- ✅ Validasi duplikat dokumen (judul + kategori + tahun yang sama)
- ✅ Submit dokumen untuk verifikasi
- ✅ Lihat status dokumen (draft, menunggu, terverifikasi, revisi)
- ✅ Notifikasi banner saat ada dokumen perlu direvisi
- ✅ Catatan revisi dari admin tampil di tabel dan banner
- ✅ Tombol "Revisi" langsung ke halaman edit
- ✅ Submit ulang setelah revisi
- ✅ Ganti password
- ✅ Lihat profil
- ✅ Tombol kembali ke beranda publik

### Dashboard Admin
- ✅ Statistik realtime (total dokumen, menunggu, terverifikasi, user online)
- ✅ Preview PDF dokumen langsung di modal
- ✅ Setujui dokumen → otomatis publik
- ✅ Revisi dokumen + catatan untuk staff
- ✅ Monitoring user online realtime (auto refresh 30 detik)
- ✅ Tambah user baru (admin/staff)
- ✅ Aktifkan/nonaktifkan user
- ✅ Hapus user
- ✅ Log aktivitas sistem dengan pagination
- ✅ Hapus riwayat log (30 hari / 90 hari / semua)
- ✅ Hapus dokumen beserta file fisiknya
- ✅ Tombol kembali ke beranda publik
- ✅ Kelola kategori dokumen (tambah, edit, hapus, aktif/nonaktif)

### Infrastruktur
- ✅ Docker Compose (4 container: frontend, backend, MySQL, phpMyAdmin)
- ✅ Volume persistent untuk file upload dan database
- ✅ Timezone WIB (Asia/Jakarta)
- ✅ Navbar dinamis (tampilkan nama user jika login)
- ✅ Navbar & Footer tersembunyi di halaman dashboard
- ✅ Git repository dengan .gitignore (env aman)
- ✅ README lengkap dengan diagram Mermaid

---

## Fitur Wajib Ditambahkan 🔴

> Fitur ini penting untuk production instansi — sebaiknya dikerjakan sebelum deploy

- [ ] **Sistem Divisi/Departemen** — tambah konsep divisi di dokumen agar dokumen bisa difilter by divisi di dashboard publik. Setiap dokumen memiliki label divisi (Perencanaan, Keuangan, SDM, dll). Filter divisi tersedia di halaman publik.
- [ ] **Sistem Multi Role (Ketua Tim + Admin Dept)** — struktur role baru:
  - `ketua_tim` → pantau SEMUA user semua divisi, aktifkan/nonaktifkan user, lihat semua dokumen
  - `admin_dept` → hanya lihat dan verifikasi dokumen dari divisinya sendiri
  - `staff` → upload dokumen ke divisinya
- [ ] **Reset password oleh admin** — admin/ketua tim bisa reset password user dari dashboard
- [ ] **Konfirmasi email saat tambah user** — kirim email berisi password awal ke user baru
- [ ] **Limit storage per user** — batasi total ukuran file yang bisa diupload per staff
- [ ] **Backup database otomatis** — jadwal backup MySQL harian ke folder tertentu
- [ ] **HTTPS / SSL** — wajib untuk production (via Nginx + Let's Encrypt)

---

## Fitur Optional 🟡

> Fitur tambahan yang meningkatkan pengalaman pengguna

- [ ] **Notifikasi email** — staff dapat email otomatis saat dokumen disetujui/direvisi
- [ ] **Export Excel/CSV** — admin bisa download daftar dokumen ke file .xlsx
- [ ] **Riwayat versi dokumen** — track kalau dokumen pernah direvisi dan file diganti
- [ ] **Grafik statistik** — chart upload & download per bulan di dashboard admin
- [ ] **Dark mode** — toggle tema gelap/terang
- [ ] **Pencarian global di admin** — filter dokumen by nama staff, judul, kategori, divisi sekaligus
- [ ] **Filter by divisi di dashboard admin** — admin bisa filter dokumen berdasarkan divisi
- [ ] **Print daftar dokumen** — tombol print dari dashboard publik
- [ ] **Arsip dokumen** — admin bisa arsipkan dokumen lama tanpa hapus
- [ ] **Watermark PDF** — tambah watermark otomatis saat dokumen diupload
- [ ] **QR Code dokumen** — generate QR code untuk link download dokumen tertentu
- [ ] **Multi bahasa** — support Bahasa Indonesia dan Bahasa Inggris
- [ ] **Audit trail lengkap** — log detail perubahan field (sebelum vs sesudah edit)

---

## Fitur Deploy 🟠

> Perlu dikerjakan saat siap deploy ke server production

- [ ] **Setup VPS** — pilih provider (Hostinger/DigitalOcean), install Docker
- [ ] **Nginx reverse proxy** — routing domain ke frontend dan backend
- [ ] **SSL/HTTPS** — Let's Encrypt atau via Cloudflare
- [ ] **Domain/subdomain** — minta dari instansi, misal `laporan.namadinas.go.id`
- [ ] **Environment production** — pisah .env development dan .env production
- [ ] **Monitoring server** — setup uptime monitoring (UptimeRobot gratis)
- [ ] **Auto restart container** — pastikan `restart: unless-stopped` sudah aktif di docker-compose (sudah ✅)

---

## Pertanyaan yang Perlu Dijawab Sebelum Lanjut ❓

> Jawab dulu sebelum mengerjakan fitur di bawah ini

- ❓ **Nama divisi apa saja** yang ada di instansi? (contoh: Perencanaan, Keuangan, SDM, Hukum, Sekretariat)
- ❓ **Apakah staff hanya bisa upload ke divisinya sendiri** atau bebas pilih divisi saat upload?
- ❓ **Apakah admin_dept bisa tambah/kelola user** di divisinya atau hanya ketua_tim yang bisa?
- ❓ **Apakah dokumen publik tetap tampil semua** atau dikelompokkan per divisi secara default?
- ❓ **Nama instansi** untuk ditampilkan di header/footer web?

---

## Catatan

- Semua perubahan kode perlu diikuti `docker-compose up -d --build backend frontend`
- File `.env` tidak boleh di-push ke GitHub (sudah ada di `.gitignore` ✅)
- Password default `admin` dan `staff01` harus diganti sebelum production
- Fitur sistem divisi dan multi role adalah perubahan besar — menyentuh database, backend, dan frontend
