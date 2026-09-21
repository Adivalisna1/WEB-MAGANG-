import pandas as pd
import os

# ================= KONFIGURASI =================
INPUT_FILE = "data.xlsx"          # Ganti dengan nama file Excel asli Anda
KOLOM_SATKER = "Satker"           # Ganti dengan nama header kolom Satker di Excel
OUTPUT_FOLDER = "hasil_pilahan"   # Nama folder tempat file baru akan disimpan
# ===============================================

def pilah_data_berdasarkan_satker():
    # 1. Pastikan file input ada
    if not os.path.exists(INPUT_FILE):
        print(f"Error: File '{INPUT_FILE}' tidak ditemukan. Pastikan file ada di folder yang sama dengan script ini.")
        return

    # 2. Buat folder output jika belum ada
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
        print(f"Folder '{OUTPUT_FOLDER}' berhasil dibuat.")

    # 3. Baca file excel
    print(f"Membaca data dari {INPUT_FILE}...")
    try:
        # engine='openpyxl' direkomendasikan untuk format .xlsx
        df = pd.read_excel(INPUT_FILE, engine='openpyxl') 
    except Exception as e:
        print(f"Error membaca file Excel: {e}")
        return

    # 4. Cek apakah kolom satker yang dikonfigurasi ada di file Excel
    if KOLOM_SATKER not in df.columns:
        print(f"Error: Kolom '{KOLOM_SATKER}' tidak ditemukan!")
        print(f"Kolom yang tersedia di file Anda: {', '.join(df.columns.astype(str))}")
        return

    # 5. Dapatkan daftar Satker unik dari kolom tersebut
    # dropna() digunakan untuk mengabaikan baris yang satkernya kosong
    daftar_satker = df[KOLOM_SATKER].dropna().unique()
    print(f"Ditemukan {len(daftar_satker)} satker. Memulai proses pemisahan file...\n")

    # 6. Lakukan perulangan untuk memisahkan data per satker
    for satker in daftar_satker:
        # Filter data hanya untuk satker tertentu
        data_terfilter = df[df[KOLOM_SATKER] == satker]
        
        # Bersihkan nama satker untuk dijadikan nama file (menghindari karakter ilegal di Windows)
        nama_satker_bersih = str(satker).replace("/", "_").replace("\\", "_").replace(":", "_").replace("?", "_").replace("*", "_")
        nama_file_output = os.path.join(OUTPUT_FOLDER, f"Data_{nama_satker_bersih}.xlsx")
        
        # Simpan ke file baru
        try:
            data_terfilter.to_excel(nama_file_output, index=False, engine='openpyxl')
            print(f" [V] Berhasil membuat: {nama_file_output} ({len(data_terfilter)} baris data)")
        except Exception as e:
            print(f" [X] Gagal menyimpan {nama_file_output}: {e}")

    print("\nProses selesai! Semua file hasil pilahan ada di folder:", OUTPUT_FOLDER)

if __name__ == "__main__":
    pilah_data_berdasarkan_satker()
