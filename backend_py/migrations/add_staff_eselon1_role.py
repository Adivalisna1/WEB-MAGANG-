import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db

def run_migration():
    conn = db.connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM roles WHERE nama = 'staff_eselon_1' LIMIT 1")
        row = cursor.fetchone()
        if not row:
            cursor.execute(
                "INSERT INTO roles (nama, deskripsi) VALUES (%s, %s)",
                (
                    "staff_eselon_1",
                    "Staff Satker Eselon 1 — pengelola & pengunggah laporan unit Eselon 1 sendiri (tanpa pantau satker bawahan)",
                ),
            )
            conn.commit()
            print("[OK] Role 'staff_eselon_1' berhasil ditambahkan ke tabel roles.")
        else:
            print("[OK] Role 'staff_eselon_1' sudah ada di tabel roles.")
    except Exception as e:
        print(f"[Migration Error add_staff_eselon1_role]: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
