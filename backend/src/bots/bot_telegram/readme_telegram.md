# Bot Telegram Pencatatan Akuntansi

Bot Telegram ini menggunakan library `node-telegram-bot-api` dengan sistem *Long Polling*. Bot akan otomatis berjalan berbarengan dengan sistem backend utama dan menyediakan antarmuka interaktif menggunakan *Keyboard Markup* Telegram.

## 💬 Cara Menggunakan Bot (Untuk User)

Pengguna tidak perlu mengetik panjang-panjang karena bot ini menggunakan **Tombol (Keyboard)** yang interaktif.

### 1. Perintah Dasar
- Buka chat dengan bot Telegram yang sudah dibuat.
- Ketik **/start**.
- Bot akan menampilkan tombol **🔑 Login**.
- Klik tombol tersebut, lalu masukkan **Username** dan **Password** dari akun Web Anda.

### 2. Aturan Akses berdasarkan Role (Jabatan)
Setelah berhasil login, tombol menu yang muncul akan menyesuaikan dengan Role (jabatan) pengguna di database.
- **Pimpinan (Role 1) & Staff (Role 2)**:
  - Hanya akan melihat tombol **➕ Tambah Transaksi**.
  - Digunakan untuk menginput Pemasukan atau Pengeluaran dengan mengikuti alur pertanyaan bot.
- **Eselon 1 (Role 3)**:
  - Hanya akan melihat tombol **📊 Laporan**.
  - Digunakan untuk melihat summary (Pemasukan, Pengeluaran, Saldo) serta men-download rekapitulasi transaksi dalam format **File Excel (.xlsx)** berdasarkan Satuan Kerja (Satker) yang dipilih.
- **Semua Role**:
  - Akan memiliki tombol **🚪 Logout** untuk keluar dari sesi akun.

## 🛠️ Troubleshooting

- **Tombol Tidak Muncul / Bot Diam Saja**:
  Pastikan `TELEGRAM_BOT_TOKEN` di `.env` sudah benar dan terisi. Cek *log terminal* backend (`docker logs web_laporan_backend`), jika muncul peringatan `Token tidak valid atau belum diisi`, berarti tokennya salah.
- **Error "Polling error"**:
  Biasanya karena ada lebih dari satu server/komputer yang menjalankan bot dengan token yang sama secara bersamaan. Pastikan script bot hanya di-run di satu *environment* Docker ini saja.
