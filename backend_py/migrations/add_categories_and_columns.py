import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db

def run_migration():
    conn = db.connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    # 1. Kategori baru
    cursor.execute("""
        INSERT INTO kategori_dokumen (nama, slug, deskripsi, perlu_nominal, urutan, is_active)
        SELECT 'Surat Pembukaan Rekening Koran', 'surat-pembukaan-rekening-koran', 'Surat Izin / Penetapan Pembukaan Rekening Koran Satker', 0, 2, 1
        WHERE NOT EXISTS (SELECT 1 FROM kategori_dokumen WHERE slug = 'surat-pembukaan-rekening-koran')
    """)

    cursor.execute("""
        INSERT INTO kategori_dokumen (nama, slug, deskripsi, perlu_nominal, urutan, is_active)
        SELECT 'Surat Penutupan Rekening Koran', 'surat-penutupan-rekening-koran', 'Surat Persetujuan / Penetapan Penutupan Rekening Koran Satker', 0, 3, 1
        WHERE NOT EXISTS (SELECT 1 FROM kategori_dokumen WHERE slug = 'surat-penutupan-rekening-koran')
    """)

    # 2. Kolom nama_rekening di dokumen
    cursor.execute("SHOW COLUMNS FROM dokumen LIKE 'nama_rekening'")
    if not cursor.fetchone():
        cursor.execute("ALTER TABLE dokumen ADD COLUMN nama_rekening VARCHAR(255) NULL AFTER judul")
        print("Kolom nama_rekening ditambahkan ke tabel dokumen")

    # 3. Kolom nama_rekening di rekening_koran
    cursor.execute("SHOW COLUMNS FROM rekening_koran LIKE 'nama_rekening'")
    if not cursor.fetchone():
        cursor.execute("ALTER TABLE rekening_koran ADD COLUMN nama_rekening VARCHAR(255) NULL AFTER nomor_rekening_bank")
        print("Kolom nama_rekening ditambahkan ke tabel rekening_koran")

    conn.commit()

    cursor.execute("SELECT id, nama, slug, perlu_nominal, urutan FROM kategori_dokumen WHERE is_active = 1 ORDER BY urutan ASC")
    print("Daftar Kategori Terkini:", cursor.fetchall())
    conn.close()

if __name__ == "__main__":
    run_migration()
