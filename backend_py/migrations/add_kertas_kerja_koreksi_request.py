import os
import mysql.connector

def run_migration():
    host = os.getenv("MYSQL_HOST", "db")
    port = int(os.getenv("MYSQL_PORT", 3306))
    database = os.getenv("MYSQL_DATABASE", "web_laporan")
    user = os.getenv("MYSQL_USER", "laporan_user")
    password = os.getenv("MYSQL_PASSWORD", "#user223")

    conn = mysql.connector.connect(
        host=host,
        port=port,
        database=database,
        user=user,
        password=password
    )
    cursor = conn.cursor()

    try:
        # 1. Update status enum di kertas_kerja_satker
        cursor.execute("""
            ALTER TABLE kertas_kerja_satker 
            MODIFY COLUMN status ENUM('draft', 'diajukan', 'terverifikasi', 'revisi', 'permohonan_koreksi', 'koreksi_terbuka') 
            NOT NULL DEFAULT 'draft'
        """)

        # 2. Buat tabel kertas_kerja_koreksi_request
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS kertas_kerja_koreksi_request (
                id INT AUTO_INCREMENT PRIMARY KEY,
                satker_id INT NOT NULL,
                submission_id INT NOT NULL,
                rumus_id INT NOT NULL,
                tahun INT NOT NULL,
                bulan INT NOT NULL,
                nomor_surat VARCHAR(100) NOT NULL,
                tanggal_surat DATE NOT NULL,
                alasan TEXT NOT NULL,
                file_surat_path VARCHAR(255) NULL,
                status ENUM('menunggu_persetujuan', 'disetujui', 'ditolak') NOT NULL DEFAULT 'menunggu_persetujuan',
                catatan_pejabat TEXT NULL,
                approved_by_user_id INT NULL,
                approved_at DATETIME NULL,
                created_by_user_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_satker (satker_id),
                INDEX idx_submission (submission_id),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        conn.commit()
        print("Tabel `kertas_kerja_koreksi_request` dan update ENUM status berhasil diterapkan.")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
