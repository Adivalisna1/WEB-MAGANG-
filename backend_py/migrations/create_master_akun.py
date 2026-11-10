import os
import sys
import glob
import openpyxl

# Add parent directory to path so we can import db
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db

FILE_CONFIG = [
    {
        "file": "Referensi_Akun_Tipe_A_Aset.xlsx",
        "tipe": "A",
        "kategori": "Aset",
        "normal_balance": "debit"
    },
    {
        "file": "Referensi_Akun_Tipe_L_Liabilitas.xlsx",
        "tipe": "L",
        "kategori": "Liabilitas",
        "normal_balance": "kredit"
    },
    {
        "file": "Referensi_Akun_Tipe_O_Ekuitas.xlsx",
        "tipe": "O",
        "kategori": "Ekuitas",
        "normal_balance": "kredit"
    },
    {
        "file": "Referensi_Akun_Tipe_R_Pendapatan.xlsx",
        "tipe": "R",
        "kategori": "Pendapatan",
        "normal_balance": "kredit"
    },
    {
        "file": "Referensi_Akun_Tipe_E_Beban_dan_Belanja.xlsx",
        "tipe": "E",
        "kategori": "Beban & Belanja",
        "normal_balance": "debit"
    }
]

def run_migration():
    print("=== MEMULAI MIGRASI TABEL 1: MASTER_AKUN ===")
    conn = db.connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    # 1. Buat Tabel master_akun jika belum ada
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS master_akun (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kode_akun VARCHAR(30) NOT NULL UNIQUE,
            nama_akun VARCHAR(255) NOT NULL,
            tipe_akun ENUM('A', 'L', 'O', 'R', 'E') NOT NULL COMMENT 'A=Aset, L=Liabilitas, O=Ekuitas, R=Pendapatan, E=Beban/Belanja',
            kategori_nama VARCHAR(50) NOT NULL COMMENT 'Nama Kategori Akuntansi',
            normal_balance ENUM('debit', 'kredit') NOT NULL DEFAULT 'debit',
            keterangan TEXT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_kode_akun (kode_akun),
            INDEX idx_tipe_akun (tipe_akun),
            INDEX idx_nama_akun (nama_akun)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """)
    conn.commit()
    print("1. Tabel `master_akun` berhasil dibuat / dipastikan siap.")

    # 2. Cari folder output_per_tipe_akun
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    folder_paths = [
        os.path.join(base_dir, "output_per_tipe_akun"),
        os.path.join(base_dir, "data_excel", "output_per_tipe_akun")
    ]
    
    target_folder = None
    for fp in folder_paths:
        if os.path.exists(fp):
            target_folder = fp
            break

    if not target_folder:
        print("ERROR: Folder output_per_tipe_akun tidak ditemukan!")
        conn.close()
        return

    print(f"2. Membaca data akun dari: {target_folder}")

    total_inserted = 0
    total_updated = 0

    sql_upsert = """
        INSERT INTO master_akun (kode_akun, nama_akun, tipe_akun, kategori_nama, normal_balance, is_active)
        VALUES (%s, %s, %s, %s, %s, 1)
        ON DUPLICATE KEY UPDATE
            nama_akun = VALUES(nama_akun),
            tipe_akun = VALUES(tipe_akun),
            kategori_nama = VALUES(kategori_nama),
            normal_balance = VALUES(normal_balance),
            is_active = 1
    """

    for cfg in FILE_CONFIG:
        file_path = os.path.join(target_folder, cfg["file"])
        if not os.path.exists(file_path):
            print(f"  Peringatan: File {cfg['file']} tidak ditemukan, dilewati.")
            continue

        print(f"  Mengimpor {cfg['file']} (Tipe: {cfg['tipe']} - {cfg['kategori']})...")
        wb = openpyxl.load_workbook(file_path, data_only=True)
        ws = wb.active

        # Cari baris header (NO, Kode Akun, Nama Akun, Tipe Akun)
        header_row_idx = None
        rows = list(ws.iter_rows(values_only=True))
        for idx, row in enumerate(rows):
            if row and len(row) >= 3:
                first_cell = str(row[0]).strip().upper() if row[0] is not None else ""
                second_cell = str(row[1]).strip().upper() if row[1] is not None else ""
                if first_cell == "NO" or "KODE" in second_cell:
                    header_row_idx = idx
                    break

        if header_row_idx is None:
            # Fallback baris ke-3 (index 3)
            header_row_idx = 3

        count_file = 0
        batch_data = []

        for row in rows[header_row_idx + 1:]:
            if not row or len(row) < 3:
                continue
            kode = str(row[1]).strip() if row[1] is not None else ""
            nama = str(row[2]).strip() if row[2] is not None else ""
            if not kode or kode == "None" or not nama or nama == "None":
                continue

            # Penentuan normal balance untuk contra asset jika tipe A
            norm_bal = cfg["normal_balance"]
            if cfg["tipe"] == "A":
                # Akun akumulasi penyusutan / amortisasi / penyisihan biasanya bersaldo kredit
                if any(kw in nama.lower() for kw in ["akumulasi penyusutan", "akumulasi amortisasi", "penyisihan"]):
                    norm_bal = "kredit"

            batch_data.append((kode, nama, cfg["tipe"], cfg["kategori"], norm_bal))
            count_file += 1

            if len(batch_data) >= 200:
                cursor.executemany(sql_upsert, batch_data)
                conn.commit()
                batch_data = []

        if batch_data:
            cursor.executemany(sql_upsert, batch_data)
            conn.commit()

        print(f"    -> Berhasil memproses {count_file} akun dari {cfg['file']}.")
        total_inserted += count_file

    # 3. Verifikasi jumlah data terkini di master_akun
    cursor.execute("""
        SELECT tipe_akun, kategori_nama, COUNT(*) as jumlah
        FROM master_akun
        GROUP BY tipe_akun, kategori_nama
        ORDER BY FIELD(tipe_akun, 'A', 'L', 'O', 'R', 'E')
    """)
    summary = cursor.fetchall()

    print("\n=== REKAPITULASI TABEL MASTER_AKUN TERBARU DI DATABASE ===")
    total_db = 0
    for s in summary:
        print(f"  - Tipe {s['tipe_akun']} ({s['kategori_nama']}): {s['jumlah']} Akun")
        total_db += s['jumlah']
    print(f"TOTAL AKUN DI DATABASE: {total_db} Akun.")

    conn.close()
    print("=== MIGRASI TABEL 1 SELESAI DENGAN SUKSES! ===\n")

if __name__ == "__main__":
    run_migration()
