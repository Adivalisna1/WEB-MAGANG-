# 📖 Panduan Sederhana: Cara Kerja Sistem Laporan

*(Versi Bahasa Sehari-hari / Non-Teknis — Diterjemahkan dari Dokumen Bisnis Proses)*

Bayangkan sistem web ini seperti sebuah **Kantor Arsip Laporan** di dunia nyata. Di kantor ini, laporan tidak bisa sembarangan langsung dipajang ke publik. Ada aturan, tahapan ketat, satpam penjaga, dan bos besar yang mengatur semuanya.

Berikut adalah penjelasan lengkap seluruh sistem kerja di dalam kantor ini:

---

## 1. Siapa Saja yang Ada di "Kantor" Ini? (Aktor & Peran)

Di dalam sistem ini, ada 4 peran utama:
- **Staff (Pembuat Laporan):** Ibarat pegawai atau kurir. Tugasnya membuat, menyusun, dan membawa berkas laporan ke loket pendaftaran.
- **Admin (Penyaring Pertama / "Resepsionis"):** Ibarat penjaga loket atau satpam. Tugasnya mengecek kelengkapan laporan sebelum sampai ke meja bos.
- **Ketua Tim (Penentu Akhir / "Bos Besar"):** Pemegang keputusan tertinggi. Hanya Bos yang berhak memberi stempel persetujuan agar laporan bisa dipajang.
- **Masyarakat Umum (Tamu):** Orang luar yang datang untuk melihat mading dan mengambil salinan (download) laporan tanpa perlu izin masuk.

---

## 2. Istilah Status Laporan (Status Dokumen)

Setiap laporan yang masuk ke kantor ini akan diberi "stempel status" biar jelas posisinya ada di mana:
- **Draft:** Laporan baru ditaruh di atas meja Staff (belum diserahkan ke siapa-siapa).
- **Menunggu Verifikasi:** Laporan sudah diserahkan ke loket, sedang mengantri untuk dicek Admin.
- **Lolos Admin:** Laporan lolos cek Admin, sekarang ada di atas meja Bos (Ketua Tim) menunggu disetujui.
- **Terverifikasi:** Laporan resmi disetujui Bos dan sudah dipajang di Mading Publik.
- **Revisi:** Laporan dikembalikan ke meja Staff karena ada yang salah (harus diperbaiki).
- **Diarsipkan:** Laporan kadaluarsa yang dimasukkan ke dalam gudang penyimpanan tertutup.

---

## 3. Gambaran Singkat Perjalanan Laporan (Alur Utama)

Biar kebayang, begini ringkasan cepat alurnya:
1. Staff bikin laporan 👉 2. Diserahkan ke loket 👉 3. Admin ngecek (Kalo bagus diloloskan, kalo jelek disuruh perbaiki) 👉 4. Ketua Tim ngecek (Kalo oke disetujui, kalo jelek disuruh perbaiki) 👉 5. Laporan resmi dipajang ke Publik.

---

## 4. Rincian 7 Tahapan Perjalanan Laporan (Detail Per Tahap)

Ini adalah langkah demi langkah kejadian aslinya:

**Tahap 0: Datang ke Gedung (Landing Page)**
Masyarakat atau pegawai datang ke halaman depan web. Di sini cuma ada informasi tentang instansi (visi, misi, foto gedung). Belum ada satupun dokumen yang bisa dibaca.

**Tahap 1: Masuk ke Dalam Kantor (Login)**
Untuk bisa berurusan dengan dokumen, pegawai harus memiliki kunci masuk (login). Masyarakat umum tidak punya kunci ini, jadi mereka tidak bisa masuk ke dalam.

**Tahap 2: Membawa Dokumen ke Meja (Staff Upload Dokumen)**
Staff menyiapkan berkas PDF/Word. Dia menaruhnya di atas meja kerjanya sendiri (Upload) sambil menempelkan kertas label berisi "Judul", "Tahun", dan "Kategori". Statusnya masih *Draft*.

**Tahap 3: Menyerahkan ke Loket (Staff Submit ke Verifikasi)**
Setelah yakin dokumennya benar, Staff membawa dokumen itu dan menaruhnya ke loket pendaftaran (menekan tombol "Ajukan"). Dokumen berpindah ke tumpukan meja Admin.

**Tahap 4: Pemeriksaan Loket Pertama (Admin Menyaring)**
Admin melihat tumpukan laporan baru dan mengecek isinya:
- ❌ Kalau salah: Admin mengembalikan laporan itu ke Staff beserta memo (Misal: "Kop surat salah").
- ✅ Kalau rapi: Admin memberi cap "Lolos Loket" dan menaruh laporan tersebut ke meja Bos Besar. (Admin dilarang keras memajang laporan sendiri!).

**Tahap 5: Keputusan Final Bos Besar (Ketua Tim Menyetujui)**
Sebagai penentu akhir, Ketua Tim meneliti ulang laporan tersebut:
- ❌ Kalau masih ada yang salah: Ketua Tim mengembalikannya lagi ke Staff.
- ✅ Kalau sudah sempurna: Ketua Tim memberi cap "Sah dan Disetujui!".

**Tahap 6: Laporan Dipajang di Mading (Muncul di Dashboard Publik)**
Begitu Ketua Tim memberi cap persetujuan, salinan laporan otomatis menempel di **Mading Web (Dashboard Publik)**. Sekarang, Masyarakat (Tamu) bisa langsung melihat dan mendownload laporan tersebut.

---

## 5. Apa yang Terjadi Kalau Laporan Ditolak? (Alur Revisi)

Kalau di tengah jalan laporan dikembalikan oleh Admin atau Ketua Tim, laporan itu akan terbang kembali ke meja Staff. 

Sistem (pesuruh) akan memberi tahu Staff: *"Hei, laporanmu dikembalikan oleh Bos karena salah tanggal"*. Staff cukup mengganti isi kertas laporannya, lalu **Mengajukannya Kembali** ke loket pendaftaran. Laporan akan diperiksa lagi dari awal oleh Admin.

---

## 6. Sistem Pesuruh Pembawa Pesan (Notifikasi Sistem)

Di dalam kantor ini, ada kurir robot (sistem notifikasi) yang selalu berlari mengabarkan informasi penting:
- Saat Staff naruh laporan di loket ➔ Robot lari ke Admin: *"Ada laporan baru minta dicek nih!"*
- Saat Admin meloloskan laporan ➔ Robot lari ke Bos: *"Ada laporan menunggu persetujuan Anda!"*
- Saat Admin/Bos menolak laporan ➔ Robot lari ke Staff: *"Laporanmu dikembalikan, ada yang harus direvisi!"*
- Saat Bos menyetujui laporan ➔ Robot lari ke Staff: *"Selamat, laporanmu sudah resmi terbit!"*

---

## 7. Aturan Tegas Kantor (Batasan & Aturan Teknis)

Tidak semua hal diizinkan di kantor ini. Ada hukum ketat yang berlaku:
1. **Batas Ukuran:** Kertas laporan yang dibawa tidak boleh lebih berat dari 50 MB (megabyte).
2. **Format Dokumen:** Kantor hanya menerima format PDF, Word, atau Excel. Gambar tidak diterima.
3. **Dilarang Ada Kembaran:** Tidak boleh ada dua dokumen dengan Judul, Kategori, dan Tahun yang persis sama.
4. **Wajib Kunci (Login):** Semua tindakan (termasuk download dokumen di dalam kantor) wajib menggunakan kunci masuk (login).
5. **Penomoran Otomatis:** Pegawai tidak perlu pusing mikir nomor surat. Mesin kantor otomatis mencetak kode seri unik di setiap laporan (Misal: `LKJIP/2026/001`).

---

## 8. Loket Pintu Khusus (API Endpoint)

*(API itu ibarat Pintu Loket Pelayanan Khusus)*

Untuk berinteraksi dengan kantor ini secara elektronik, kantor menyediakan beberapa "Pintu Khusus":
- Pintu Khusus untuk Pendaftaran & Pemeriksaan Kunci (Auth).
- Pintu Khusus untuk mengambil atau menaruh laporan (Dokumen).
- Pintu Khusus khusus Admin (kelola pegawai, intip data statistik).
- Pintu Khusus khusus Ketua Tim (melihat grafik performa pegawai, setujui dokumen final).

Semua orang atau program luar (termasuk bot n8n) harus mengetuk pintu-pintu ini jika ingin menaruh file atau mengambil data dari kantor secara otomatis.
