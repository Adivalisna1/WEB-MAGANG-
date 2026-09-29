# Bot WhatsApp Pencatatan Akuntansi

Bot WhatsApp ini dibangun menggunakan library `@whiskeysockets/baileys`. Bot berjalan otomatis bersamaan dengan backend utama dan berfungsi untuk menginput serta melihat laporan transaksi keuangan.

## 🚀 Cara Menghubungkan Bot (Login WA)

Karena bot berjalan di dalam Docker, kamu tidak perlu menginstall aplikasi tambahan. Cukup ikuti langkah berikut:

1. Pastikan backend sudah menyala (`docker compose up -d`).
2. Buka terminal/command prompt.
3. Ketik perintah berikut untuk melihat log dari backend:
   ```bash
   docker logs web_laporan_backend --tail 100
   ```
4. Di dalam log terminal, kamu akan melihat sebuah **QR Code** berukuran besar.
5. Buka aplikasi WhatsApp di HP kamu yang akan dijadikan "Nomor Bot".
6. Pergi ke **Pengaturan > Perangkat Taut (Linked Devices)**.
7. Scan QR Code yang ada di terminal tadi.
8. Tunggu hingga di log terminal muncul pesan `[WhatsApp Bot] Berhasil terhubung ke WhatsApp!`.

*Catatan: Sesi login WhatsApp (auth) akan tersimpan secara otomatis di folder `uploads/wa_auth`. Jadi kamu tidak perlu bolak-balik scan QR code setiap kali server di-restart.*

## 💬 Cara Menggunakan Bot (Untuk User)

Pengguna (Staff, Pimpinan, Eselon 1) dapat berinteraksi dengan bot ini dengan mengirimkan pesan ke nomor bot tersebut.

### 1. Perintah Dasar
- `!login` : Masuk menggunakan Username dan Password aplikasi web.
- `!logout` : Keluar dari sesi Telegram/WA.
- `!menu` atau `!start` : Menampilkan daftar perintah yang bisa digunakan sesuai peran (Role) user.
- `!batal` : Membatalkan proses input (jika sedang di pertengahan form).

### 2. Aturan Akses berdasarkan Role (Jabatan)
Sistem ini menggunakan validasi *Role-Based Access Control* (RBAC) yang terhubung langsung dengan Database Web.
- **Pimpinan (Role 1) & Staff (Role 2)**: 
  - Dapat mengakses perintah `!tambah` untuk mencatat transaksi baru (Pemasukan/Pengeluaran).
  - Tidak dapat mengakses perintah laporan.
- **Eselon 1 (Role 3)**:
  - Dapat mengakses perintah `!laporan` untuk melihat ringkasan keuangan (Total Pemasukan, Total Pengeluaran, Saldo).
  - Dilarang keras melakukan input (`!tambah` ditolak otomatis).

## 🛠️ Troubleshooting

- **QR Code Expired / Tidak Bisa Ditautkan**:
  Jika gagal menautkan perangkat, hapus folder `uploads/wa_auth` menggunakan terminal, kemudian restart backend (`docker compose restart backend`) untuk memunculkan QR Code baru yang bersih.
- **Bot Tidak Merespon**:
  Pastikan akun sudah melakukan `!login` dengan benar. Cek log server jika bot crash atau terputus koneksinya.
