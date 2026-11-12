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
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'kertas_kerja_rumus_seksi' AND COLUMN_NAME = 'tipe_subtotal'
        """, (database,))
        if not cursor.fetchone():
            cursor.execute("""
                ALTER TABLE kertas_kerja_rumus_seksi 
                ADD COLUMN tipe_subtotal ENUM('subtotal', 'total') NOT NULL DEFAULT 'subtotal'
            """)
            conn.commit()
            print("Berhasil menambahkan kolom `tipe_subtotal` ke tabel `kertas_kerja_rumus_seksi`.")
        else:
            print("Kolom `tipe_subtotal` sudah ada di tabel `kertas_kerja_rumus_seksi`.")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
