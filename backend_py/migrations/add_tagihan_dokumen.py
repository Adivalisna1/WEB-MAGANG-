import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db

def run_migration():
    conn = db.connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tagihan_dokumen (
                id INT AUTO_INCREMENT PRIMARY KEY,
                satker_id INT NULL,
                eselon_1_id INT NULL,
                target_user_id INT NULL,
                pengirim_id INT NOT NULL,
                kategori_id INT NULL,
                judul_dokumen VARCHAR(255) NOT NULL,
                tahun INT NOT NULL,
                periode VARCHAR(100) NULL,
                tenggat_waktu DATE NULL,
                catatan TEXT NULL,
                status ENUM('belum_diunggah', 'sudah_diunggah') NOT NULL DEFAULT 'belum_diunggah',
                dokumen_id INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_satker_status (satker_id, status),
                INDEX idx_target_user (target_user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        cursor.execute("""
            SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tagihan_dokumen' AND COLUMN_NAME = 'tenggat_waktu'
        """)
        if cursor.fetchone()["cnt"] == 0:
            cursor.execute("ALTER TABLE tagihan_dokumen ADD COLUMN tenggat_waktu DATE NULL AFTER periode")
        conn.commit()
        print("[OK] Tabel 'tagihan_dokumen' siap digunakan.")
    except Exception as e:
        print(f"[Migration Error add_tagihan_dokumen]: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
