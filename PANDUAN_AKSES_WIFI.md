# Panduan Akses Web di Jaringan Wi-Fi Lokal (Tanpa Hosting)

Panduan ini berisi langkah-langkah agar web laporan dapat diakses oleh rekan kerja / pimpinan melalui HP atau laptop lain yang terhubung ke jaringan Wi-Fi yang sama.

---

## Langkah 1: Buka Akses Firewall Windows *(Cukup 1x Seumur Hidup)*

Agar perangkat lain diizinkan mengakses web di laptop Anda:
1. Buka folder project ini dan cari file **`buka-akses-wifi.bat`**.
2. **Double-click** file `buka-akses-wifi.bat`.
3. Jika muncul jendela konfirmasi Administrator (*User Account Control*), klik **Yes**.
4. Tunggu hingga muncul keterangan:
   - `[OK] Port 3000 (Frontend) berhasil dibuka.`
   - `[OK] Port 5000 (Backend) berhasil dibuka.`
5. Catat alamat link yang ditampilkan di layar (contoh: `http://172.16.163.185:3000`).

---

## Langkah 2: Nyalakan Server Web (Docker)

1. Pastikan aplikasi **Docker Desktop** sudah menyala (status *Engine Running*).
2. **Double-click** file **`jalankan-web.bat`** *(atau jalankan `docker compose up -d` di terminal)*.
3. Tunggu hingga proses selesai, lalu layar terminal akan otomatis menampilkan **alamat IP Wi-Fi** Anda yang siap dibagikan.

*(Tips: Jika baru saja mengubah kodingan atau menarik update baru dari Git, jalankan perintah `docker compose up -d --build` atau `jalankan-web.bat build`).*

---

## Langkah 3: Bagikan Link ke HP / Laptop Lain

Pastikan HP atau laptop rekan Anda **terhubung ke Wi-Fi yang sama persis** dengan laptop Anda, lalu suruh mereka membuka browser (Chrome / Safari / Edge) dan mengetikkan alamat berikut:

```text
http://[IP_WIFI_ANDA]:3000
```

**Contoh:**
```text
http://172.16.163.185:3000
```

> **Perhatian Penulisan Link:**
> - Gunakan **`http://`** *(BUKAN `https://`)*
> - Gunakan titik dua **`:3000`** *(BUKAN titik `.3000`)*
> - Untuk membuka di **laptop Anda sendiri**, tetap gunakan `http://localhost:3000`

---

## Solusi Jika Masih Tidak Bisa Dibuka (Loading Terus / Timed Out)

Beberapa jaringan Wi-Fi kantor atau Wi-Fi publik mengaktifkan fitur keamanan **AP Isolation** (memblokir koneksi antar perangkat dalam satu Wi-Fi).

**Cara mengatasinya dengan cepat:**
1. Nyalakan fitur **Mobile Hotspot** di Windows laptop Anda (*Settings > Network & internet > Mobile hotspot > On*).
2. Minta rekan Anda menghubungkan HP / laptop mereka ke Wi-Fi **Mobile Hotspot** dari laptop Anda tersebut.
3. Suruh mereka membuka alamat default Hotspot Windows:
   ```text
   http://192.168.137.1:3000
   ```
   *(Atau jalankan ulang `buka-akses-wifi.bat` / `jalankan-web.bat` untuk melihat IP terbaru).*
