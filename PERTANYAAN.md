# Daftar Pertanyaan — Sistem Dashboard Laporan

> File ini berisi pertanyaan-pertanyaan yang perlu dikonfirmasi ke Ketua Tim atau stakeholder
> sebelum fitur dikembangkan lebih lanjut. Tandai ✅ jika sudah terjawab.

---

## 🔐 Autentikasi & Akses

- [ ] **Forgot Password** — Seberapa otomatis sistem reset password yang diinginkan?
  - A. Informasional saja (tampilkan pesan "Hubungi Admin") ← *sudah ada sekarang*
  - B. User input email → sistem kirim email instruksi ke admin
  - C. Full otomatis → user input email → dapat link reset → bisa ganti password sendiri

- [ ] **Jika pilih kirim email** — Email apa yang dipakai sebagai pengirim?
  - Gmail instansi / email dinas resmi / service lain?

- [ ] **Session & keamanan login** — Berapa lama token login berlaku sebelum user harus login ulang?
  - Saat ini: **8 jam** (sesuai `JWT_EXPIRES_IN` di `.env`). Apakah perlu diubah?

- [ ] **Multi-device login** — Apakah satu akun boleh login dari beberapa perangkat sekaligus?
  - Saat ini: login baru **otomatis menutup** session sebelumnya.

---

## 📄 Dokumen & Verifikasi

- [ ] **Revisi berulang** — Apakah ada batas maksimal berapa kali dokumen boleh direvisi?
  - Contoh: maksimal 3x revisi, setelah itu dokumen otomatis ditolak permanen?

- [ ] **Arsip dokumen** — Apakah dokumen yang sudah lama (misal 2+ tahun) perlu diarsipkan otomatis?
  - Atau arsip dilakukan manual oleh admin?

- [ ] **Versi dokumen** — Jika staff upload ulang dokumen yang sudah terverifikasi (konten baru/revisi tahunan), bagaimana penanganannya?
  - Ganti file yang lama, atau buat entri baru sebagai versi baru?

- [ ] **Hak unduh** — Apakah **semua user yang login** boleh mengunduh semua dokumen?
  - Atau ada pembatasan: staff hanya bisa unduh dokumen milik divisinya?

- [ ] **Notifikasi deadline** — Apakah perlu ada pengingat otomatis jika dokumen belum disubmit sampai batas waktu tertentu?

---

## 🏷️ Kategori & Data Master

- [ ] **Kategori dokumen** — Apa saja kategori dokumen yang resmi dipakai instansi?
  - Contoh saat ini: LKjIP, Renstra, Renja, LPPD, RKPD. Apakah ada tambahan atau yang perlu dihapus?

- [ ] **Info instansi di Landing Page** — Konten apa saja yang harus tampil?
  - Nama resmi instansi, foto gedung, visi misi, logo resmi, dan lain-lain?
  - Siapa yang akan mengisi konten ini? (hardcode atau bisa dikelola dari admin panel?)

- [ ] **Visi & Misi** — Apakah konten visi misi perlu bisa diedit dari dashboard admin?
  - Atau cukup hardcode di kode?

---

## 👥 Manajemen User

- [ ] **Pendaftaran user baru** — Siapa yang boleh membuat akun Staff dan Ketua Tim?
  - Saat ini: hanya **Admin** yang bisa buat akun baru. Apakah ini sudah benar?

- [ ] **Nonaktifkan user** — Jika seorang staff keluar/resign, apakah dokumennya ikut dihapus atau tetap tersimpan atas namanya?

- [ ] **Jumlah Ketua Tim** — Apakah hanya ada **1 Ketua Tim** atau bisa lebih dari satu?
  - Jika lebih dari satu, apakah semua bisa approve dokumen yang sama?

---

## 📊 Laporan & Tracking

- [ ] **Laporan rekap** — Apakah perlu fitur export data (Excel/PDF) untuk rekap dokumen per periode?
  - Contoh: rekap semua dokumen yang terverifikasi di tahun 2024.

- [ ] **Dashboard statistik** — Apakah perlu grafik/chart di dashboard admin dan ketua tim?
  - Contoh: jumlah upload per bulan, dokumen per kategori, dll.

- [ ] **Tracking nomor laporan** — Apakah nomor laporan (`LKJIP/2024/001`) perlu bisa dicari dari luar sistem (publik)?
  - Atau tracking hanya untuk user yang sudah login?

---

## 🌐 Landing Page & Tampilan Publik

- [ ] **Foto instansi** — Apakah ada foto gedung resmi yang akan dipakai di landing page?
  - Saat ini masih menggunakan foto placeholder dari Unsplash.

- [ ] **Logo instansi** — Apakah ada file logo resmi instansi (PNG/SVG) untuk ditampilkan di navbar?

- [ ] **Nama instansi** — Apa nama resmi lengkap instansi yang harus ditampilkan?

- [ ] **Kontak di landing page** — Apakah perlu ditampilkan informasi kontak instansi (alamat, telepon, email) di landing page?

---

## 🔧 Teknis & Deployment

- [ ] **Email untuk fitur forgot password** — Gmail instansi, email dinas, atau service pihak ketiga (Resend, SendGrid)?

- [ ] **Upload server** — File dokumen disimpan di server lokal saat ini. Apakah untuk production perlu dipindahkan ke cloud storage (Google Drive, S3, dll)?

- [ ] **Domain** — Apakah sistem akan di-deploy ke domain/subdomain khusus?
  - Contoh: `laporan.instansi.go.id`

- [ ] **Backup data** — Apakah perlu sistem backup otomatis untuk database dan file upload?
  - Seberapa sering? Harian, mingguan?

- [ ] **HTTPS** — Apakah server production sudah mendukung SSL/HTTPS?

---

## 📝 Catatan

- Pertanyaan yang sudah terjawab beri tanda ✅ di awal baris
- Tambahkan jawaban di bawah pertanyaan dengan format: **Jawaban:** ...
- Update file ini setiap ada keputusan baru dari ketim atau stakeholder

---

*Dibuat: Agustus 2025 — Tim Pengembang*
