import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db

def run_migration():
    conn = db.connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    print("--- Menjalankan Migrasi Tenggat Waktu & Status Piutang ---")

    # 1. Tambah kolom tenggat_waktu dan status_piutang ke tabel dokumen
    cols_to_add = [
        ("tenggat_waktu", "DATE NULL AFTER tanggal_surat"),
        ("status_piutang", "ENUM('belum_lunas', 'proses_cicilan', 'lunas') NOT NULL DEFAULT 'belum_lunas' AFTER tenggat_waktu"),
    ]

    for col_name, col_def in cols_to_add:
        cursor.execute(f"SHOW COLUMNS FROM dokumen LIKE '{col_name}'")
        if not cursor.fetchone():
            cursor.execute(f"ALTER TABLE dokumen ADD COLUMN {col_name} {col_def}")
            print(f"[OK] Kolom {col_name} berhasil ditambahkan ke tabel dokumen.")
        else:
            print(f"[SKIP] Kolom {col_name} sudah ada di tabel dokumen.")

    conn.commit()

    # Tampilkan kolom dokumen yang terkait SK Piutang
    cursor.execute("""
        SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'dokumen' AND COLUMN_NAME IN ('nama_debitur', 'dasar_temuan', 'tanggal_surat', 'tenggat_waktu', 'status_piutang')
    """)
    rows = cursor.fetchall()
    for r in rows:
        print(f" -> {r['COLUMN_NAME']}: {r['COLUMN_TYPE']} (Default: {r['COLUMN_DEFAULT']})")

    cursor.close()
    conn.close()
    print("--- Migrasi Selesai 100% ---")

if __name__ == "__main__":
    run_migration()
