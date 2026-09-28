# Rencana Pengembangan: Alur Rekening Koran & Sinkronisasi Bot

Berdasarkan diskusi, proses pencatatan Rekening Koran (Rekonsiliasi Bank vs Excel) akan disederhanakan dengan alur berikut:

## 1. Input Rekening Koran (Khusus Akhir Periode)
Form/inputan Rekening Koran (baik lewat Bot maupun Web) akan memiliki struktur khusus dengan urutan sebagai berikut:
1. **No Satker** (Sebagai kata kunci/identitas utama)
2. **Jenis**
3. **Kategori**
4. **Periode**
5. **Keterangan**
6. **File** (Bukti Histori Bank / Rekening Koran)
7. **Bank** (Nama Bank)
8. **Norek** (Nomor Rekening)
9. **Tahun**
10. **Saldo Akhir Periode** (Ini yang akan jadi acuan nominal untuk dibandingin sama Excel)

## 2. Proses di Backend (Routing Cerdas)
- Sistem akan mendeteksi jika transaksi menggunakan kategori "Rekening Koran".
- Transaksi ini **TIDAK** akan dicampur ke dalam perhitungan total Pemasukan/Pengeluaran umum (agar grafik statistik keuangan tidak bengkak/kacau).
- File buktinya secara otomatis juga akan di-push/diduplikat ke dalam database `dokumen`, sehingga akan langsung muncul di halaman **Monitor Dokumen**.
- Data transaksinya akan dipisahkan secara logik untuk ditampilkan khusus di halaman Rekening Koran.

## 3. Tampilan Halaman Rekening Koran di Web
Halaman ini didesain sesimpel mungkin untuk tujuan *Reconciliation*, dengan daftar data berisi:
- Info Identitas Bank & Satker (No Satker, Bank, Norek, Tahun, Periode).
- **Saldo Akhir Periode** (Dari inputan Rekening Koran di atas).
- **Saldo Kertas Kerja Excel** (Ditarik otomatis berdasarkan Satker, Tahun, dan Periode yang bersesuaian).
- **Indikator Selisih** (Saldo Akhir Periode dikurangi Saldo Kertas Kerja).
- **File Bukti Histori Bank** untuk gampang di-*review* Admin/Pimpinan.

## 4. Alur Tarik Data (Export) Khusus Eselon 1
Untuk memfasilitasi pelaporan di tingkat Eselon 1, fiturnya akan dipisah secara rapi:
1. **Di Halaman Rekening Koran:** Eselon 1 hanya dapat men-download rekap datanya (Tabel Rekonsiliasi berisi Saldo Bank, Saldo Excel, dan Selisih) ke format Excel/CSV.
2. **Di Halaman Monitor Dokumen:** Karena file struk/bukti bank sudah otomatis terkirim ke Monitor Dokumen, Eselon 1 dapat melakukan **Export Dokumen Per Satker** langsung dari sana.

## 5. Penghapusan Sistem Verifikasi (Penyederhanaan Alur)
Untuk menghindari kompleksitas kode, sistem verifikasi (seperti status "Menunggu Verifikasi", "Terverifikasi", "Revisi") akan **dihapus**. 
Dengan begitu:
- Setiap kali Satker mengunggah data (baik Pencatatan maupun Dokumen), datanya akan **langsung masuk dan final**, tanpa perlu *approval* berbelit-belit dari Admin/Eselon 1.
- Eselon 1 / Pimpinan bertugas murni sebagai pengawas (memantau selisih saldo di Rekening Koran dan menarik laporan Dokumen), bukan sebagai *approver*.
