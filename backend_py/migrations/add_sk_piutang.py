import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db

def run_migration():
    conn = db.connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    # 1. Tambah kategori SK Piutang Satker
    cursor.execute("""
        INSERT INTO kategori_dokumen (nama, slug, deskripsi, perlu_nominal, urutan, is_active)
        SELECT 'SK Piutang Satker', 'sk-piutang-satker', 'Surat Keputusan Penetapan Piutang Negara / Satker beserta Lampiran Dasar Temuan BPK / SKTJM', 1, 4, 1
        WHERE NOT EXISTS (SELECT 1 FROM kategori_dokumen WHERE slug = 'sk-piutang-satker')
    """)
    print("Kategori 'SK Piutang Satker' berhasil dipastikan ada di kategori_dokumen.")

    # 2. Tambah kolom nama_debitur dan dasar_temuan di tabel dokumen
    cols_to_add = [
        ("nama_debitur", "VARCHAR(255) NULL AFTER nama_rekening"),
        ("dasar_temuan", "VARCHAR(255) NULL AFTER nama_debitur"),
    ]

    for col_name, col_def in cols_to_add:
        cursor.execute(f"SHOW COLUMNS FROM dokumen LIKE '{col_name}'")
        if not cursor.fetchone():
            cursor.execute(f"ALTER TABLE dokumen ADD COLUMN {col_name} {col_def}")
            print(f"Kolom {col_name} berhasil ditambahkan ke tabel dokumen")
        else:
            print(f"Kolom {col_name} sudah ada di tabel dokumen")

    conn.commit()

    cursor.execute("SELECT id, nama, slug, perlu_nominal, urutan FROM kategori_dokumen WHERE is_active = 1 ORDER BY urutan ASC")
    print("Daftar Kategori Terkini:", cursor.fetchall())
    conn.close()

if __name__ == "__main__":
    run_migration()

