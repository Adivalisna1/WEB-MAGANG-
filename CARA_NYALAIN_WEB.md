# Panduan Menyalakan Web Magang (Menggunakan Docker)

Karena web ini sekarang sudah di-bundle menggunakan **Docker**, cara menyalakannya jadi jauh lebih gampang. Kamu tidak perlu lagi repot-repot buka banyak terminal untuk jalanin Frontend dan Backend satu-satu. Cukup pakai 1 perintah!

---

## 🚀 1. Cara Menyalakan Web (Standard)

Gunakan perintah ini jika kamu cuma mau menyalakan web seperti biasa (tidak ada kodingan yang baru diubah):

1. Buka **PowerShell** / **Terminal** / **VSCode**.
2. Masuk ke folder web lokal kamu:
   ```bash
   cd "C:\Users\adiva\OneDrive\Dokumen\web magang munculin data lokal"
   ```
3. Jalankan perintah ini:
   ```bash
   docker-compose up -d
   ```
4. Tunggu sampai muncul tulisan `Started` warna hijau.
5. Selesai! Web kamu sudah nyala di background.
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`
   - n8n (Bot): `http://localhost:5678`

---

## 🛠️ 2. Cara Menyalakan Web (Jika Ada Kodingan Baru)

Gunakan perintah ini kalau kamu habis ngedit/ngoprek kodingan (Frontend/Backend) biar Docker merakit ulang (Rebuild) kodingan barunya:

1. Buka PowerShell dan pastikan ada di folder lokal:
   ```bash
   cd "C:\Users\adiva\OneDrive\Dokumen\web magang munculin data lokal"
   ```
2. Jalankan perintah ini:
   ```bash
   docker-compose up -d --build
   ```
*(Proses ini agak lama karena Docker sedang membungkus ulang kodingan barumu).*

---

## 🛑 3. Cara Mematikan Web

Sangat penting untuk mematikan web jika kamu mau pindah kerja dari folder `lokal` ke folder `utama`, supaya port (3000, 5000, 5678) tidak bentrok!

1. Buka PowerShell di folder yang Dockernya sedang menyala.
2. Jalankan perintah ini:
   ```bash
   docker-compose down
   ```
3. Selesai! Semua sistem web dan n8n sudah mati total.

---

## ⚠️ Aturan Penting (Penting Banget!)

Jangan pernah menyalakan Docker di **dua folder yang berbeda** secara bersamaan (misal nyalain di folder `lokal` dan di folder `utama` bebarengan).

Kenapa? Karena mereka menggunakan port/jalur yang **SAMA PERSIS** (3000, 5000, 5678). Kalau dipaksa, Docker akan error dengan tulisan: 
❌ `Error response from daemon... Bind for 0.0.0.0:xxxx failed: port is already allocated`

**Solusi kalau port bentrok:**
Jalankan `docker-compose down` di folder lama, lalu jalankan `docker-compose up -d` di folder yang baru.

---

## 🔑 4. Akun Dummy untuk Testing (Update Terbaru)
Sistem ini menggunakan Role-Based Access Control (RBAC) yang sudah disesuaikan dengan nomenklatur Pemerintahan. 
Gunakan akun berikut untuk mencoba fitur-fiturnya:

* **Pimpinan (Setara Admin):**
  * Username: `pimpinan1`
  * Password: `password`
* **Pejabat Eselon 1 (Setara Ketua Tim):**
  * Username: `eselon1`
  * Password: `password`
* **Satuan Kerja Perencanaan (Setara Staff):**
  * Username: `satker01`
  * Password: `password`

> [!WARNING]
> Password `password` di atas **HANYA BERLAKU UNTUK LOKAL** (testing di komputer sendiri).
> Saat nanti lu deploy ke internet (misal di Railway/VPS), sistem akan otomatis memakai file `railway_02_seed.sql` yang password bawaannya jauh lebih kuat, yaitu: `Pimpinan@123`, `Eselon@123`, dan `Satker@123`. Jangan lupa dicatat untuk persiapan deploy nanti!
