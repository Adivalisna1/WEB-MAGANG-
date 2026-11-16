import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db

def run_migration():
    conn = db.connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    # Tambah kategori Perolehan Aset Lainnya jika belum ada
    cursor.execute("""
        INSERT INTO kategori_dokumen (nama, slug, deskripsi, perlu_nominal, urutan, is_active)
        SELECT 'Perolehan Aset Lainnya', 'perolehan-lainnya', 'Dokumen Berita Acara / SK Perolehan Barang Milik Negara (BMN) dari sumber perolehan lainnya (hibah, transfer, sitaan, dll)', 0, 5, 1
        WHERE NOT EXISTS (SELECT 1 FROM kategori_dokumen WHERE slug = 'perolehan-lainnya')
    """)
    conn.commit()
    print("Kategori 'Perolehan Aset Lainnya' berhasil dipastikan ada di kategori_dokumen.")
    conn.close()

if __name__ == "__main__":
    run_migration()
