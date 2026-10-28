import os
import mysql.connector
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
load_dotenv(dotenv_path=dotenv_path)

conn = mysql.connector.connect(
    host="localhost",
    port=int(os.getenv("MYSQL_PORT", 3307)),
    database=os.getenv("MYSQL_DATABASE", "web_laporan"),
    user="root",
    password=os.getenv("MYSQL_ROOT_PASSWORD", "rootpassword_ganti_ini")
)
cur = conn.cursor()

# 1. NO_Satker in satkers
cur.execute("SHOW COLUMNS FROM satkers LIKE 'NO_Satker';")
if not cur.fetchone():
    cur.execute("ALTER TABLE satkers ADD COLUMN NO_Satker VARCHAR(50) NULL AFTER id;")
    print("✅ Added NO_Satker to satkers")

# 2. login_attempts
cur.execute("""
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NULL,
    username_tried VARCHAR(100) NULL,
    status ENUM('success', 'failed') NOT NULL,
    location VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
""")
print("✅ login_attempts table ready")

# 3. kategori_akuntansi
cur.execute("""
CREATE TABLE IF NOT EXISTS kategori_akuntansi (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
""")
cur.execute("INSERT IGNORE INTO kategori_akuntansi (id, nama_kategori) VALUES (1, 'Gaji dan Tunjangan'), (2, 'Belanja Barang Operasional'), (3, 'Belanja Modal'), (4, 'Perjalanan Dinas'), (5, 'Pajak dan Retribusi');")
print("✅ kategori_akuntansi ready")

# 4. pencatatan
cur.execute("""
CREATE TABLE IF NOT EXISTS pencatatan (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tanggal DATE NOT NULL,
    periode VARCHAR(50) NULL,
    uraian TEXT NOT NULL,
    jenis ENUM('debit','kredit') NOT NULL,
    id_kategori INT NOT NULL,
    nominal DECIMAL(15,2) NOT NULL,
    bukti_file VARCHAR(255) DEFAULT NULL,
    catatan_audit TEXT DEFAULT NULL,
    created_by INT(10) UNSIGNED NOT NULL,
    updated_by INT(10) UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
""")
print("✅ pencatatan table ready")

# 5. rekening_koran
cur.execute("""
CREATE TABLE IF NOT EXISTS rekening_koran (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    satker_id INT UNSIGNED NULL,
    uploaded_by INT UNSIGNED NOT NULL,
    dokumen_id INT UNSIGNED NULL,
    kode_bank VARCHAR(20) NULL,
    nama_bank VARCHAR(100) NULL,
    nomor_rekening_bank VARCHAR(100) NULL,
    nama_rekening VARCHAR(255) NULL,
    nomor_pembukaan_rekening VARCHAR(100) NULL,
    tanggal_pembukaan_rekening DATE NULL,
    saldo_akhir_bulan DECIMAL(18,2) NOT NULL DEFAULT 0,
    saldo_rk DECIMAL(18,2) NOT NULL DEFAULT 0,
    saldo_rekening DECIMAL(18,2) NOT NULL DEFAULT 0,
    saldo_rpl_lpj DECIMAL(18,2) NOT NULL DEFAULT 0,
    keterangan TEXT NULL,
    tahun INT NULL DEFAULT 2026,
    periode VARCHAR(50) NULL DEFAULT '1',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
""")
for alter_sql in [
    "ALTER TABLE rekening_koran ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1",
    "ALTER TABLE rekening_koran ADD COLUMN kode_bank VARCHAR(20) NULL",
    "ALTER TABLE pencatatan ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1",
    "ALTER TABLE pencatatan ADD COLUMN kode_bank VARCHAR(20) NULL",
]:
    try:
        cur.execute(alter_sql)
    except Exception:
        pass
print("✅ rekening_koran table ready")

conn.commit()
cur.close()
conn.close()
print("🎉 All database updates applied successfully!")

