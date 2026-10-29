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
        print("=== Migrasi: Ubah Operator Eselon 1 Menjadi Operator Satker ===")
        
        # 1. Update user operator_eselon1 menjadi Operator Satker
        cur.execute("""
            UPDATE users 
            SET tingkat_id = 1,
                role_id = 1,
                satker_id = 29,
                nama = 'Operator Satker (Dikti)'
            WHERE username = 'operator_eselon1' OR (tingkat_id = 2 AND role_id = 1)
        """)
        print(f"-> Updated {cur.rowcount} user(s) dari Operator Eselon 1 menjadi Operator Satker.")
        
        # 2. Pastikan tingkat Eselon 1 (tingkat_id = 2) hanya memiliki role Administrasi (role_id = 2)
        cur.execute("""
            UPDATE users
            SET role_id = 2
            WHERE tingkat_id = 2 AND role_id != 2
        """)
        if cur.rowcount > 0:
            print(f"-> Enforced role_id = 2 untuk {cur.rowcount} user Eselon 1.")
            
        conn.commit()
        
        # 3. Tampilkan user Eselon 1 saat ini
        cur.execute("""
            SELECT u.id, u.nama, u.username, u.email, u.role_id, r.nama as role_nama, u.tingkat_id, t.kode as tingkat_kode, u.satker_id, u.eselon_1_id
            FROM users u
            LEFT JOIN roles r ON r.id = u.role_id
            LEFT JOIN tingkats t ON t.id = u.tingkat_id
            WHERE u.tingkat_id = 2
        """)
        print("\n=== User Eselon 1 Saat Ini (Hanya Administrasi) ===")
        for u in cur.fetchall():
            print(u)
            
        # 4. Tampilkan user operator_eselon1 saat ini
        cur.execute("""
            SELECT u.id, u.nama, u.username, u.email, u.role_id, r.nama as role_nama, u.tingkat_id, t.kode as tingkat_kode, u.satker_id, s.nama as satker_nama
            FROM users u
            LEFT JOIN roles r ON r.id = u.role_id
            LEFT JOIN tingkats t ON t.id = u.tingkat_id
            LEFT JOIN satkers s ON s.id = u.satker_id
            WHERE u.username = 'operator_eselon1'
        """)
        print("\n=== Data Akun operator_eselon1 Saat Ini ===")
        print(cur.fetchone())

    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_migration()

