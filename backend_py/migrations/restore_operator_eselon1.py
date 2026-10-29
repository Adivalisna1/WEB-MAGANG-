import os
import mysql.connector

def run_migration():
    conn = mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        port=int(os.getenv("MYSQL_PORT", 3307)),
        database=os.getenv("MYSQL_DATABASE", "web_laporan"),
        user=os.getenv("MYSQL_USER", "laporan_user"),
        password=os.getenv("MYSQL_PASSWORD", "#user223")
    )
    cur = conn.cursor(dictionary=True)
    try:
        print("=== Migrasi: Kembalikan operator_eselon1 ke Tingkat Eselon 1 ===")
        
        cur.execute("""
            UPDATE users 
            SET tingkat_id = 2,
                role_id = 1,
                satker_id = NULL,
                eselon_1_id = 2,
                nama = 'Operator Ditjen Dikti'
            WHERE username = 'operator_eselon1'
        """)
        print(f"-> Updated {cur.rowcount} user(s).")
        conn.commit()
        
        # Tampilkan akun-akun di tingkat Eselon 1
        cur.execute("""
            SELECT u.id, u.nama, u.username, u.email, u.role_id, r.nama as role_nama, u.tingkat_id, t.kode as tingkat_kode, u.satker_id, u.eselon_1_id
            FROM users u
            LEFT JOIN roles r ON r.id = u.role_id
            LEFT JOIN tingkats t ON t.id = u.tingkat_id
            WHERE u.tingkat_id = 2
        """)
        print("\n=== User Eselon 1 Sekarang (Operator & Administrasi) ===")
        for u in cur.fetchall():
            print(u)

    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_migration()

