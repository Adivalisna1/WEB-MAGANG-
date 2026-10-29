import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db

def run_migration():
    conn = db.connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    # 1. Tambah kolom di tabel dokumen untuk Surat Pembukaan & Penutupan
    cols_to_add = [
        ("nama_bank", "VARCHAR(100) NULL AFTER judul"),
        ("nomor_rekening", "VARCHAR(100) NULL AFTER nama_bank"),
        ("tanggal_surat", "DATE NULL AFTER nomor_rekening"),
    ]

    for col_name, col_def in cols_to_add:
        cursor.execute(f"SHOW COLUMNS FROM dokumen LIKE '{col_name}'")
        if not cursor.fetchone():
            cursor.execute(f"ALTER TABLE dokumen ADD COLUMN {col_name} {col_def}")
            print(f"Kolom {col_name} berhasil ditambahkan ke tabel dokumen")
        else:
            print(f"Kolom {col_name} sudah ada di tabel dokumen")

    # 2. Tambah tanggal_penutupan_rekening di rekening_koran jika belum ada
    cursor.execute("SHOW COLUMNS FROM rekening_koran LIKE 'tanggal_penutupan_rekening'")
    if not cursor.fetchone():
        cursor.execute("ALTER TABLE rekening_koran ADD COLUMN tanggal_penutupan_rekening DATE NULL AFTER tanggal_pembukaan_rekening")
        print("Kolom tanggal_penutupan_rekening ditambahkan ke tabel rekening_koran")
    else:
        print("Kolom tanggal_penutupan_rekening sudah ada di tabel rekening_koran")

    conn.commit()
    conn.close()
    print("Migrasi add_surat_fields selesai sukses.")

if __name__ == "__main__":
    run_migration()
