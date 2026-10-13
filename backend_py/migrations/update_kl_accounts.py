from db import connection_pool

def update_kl():
    conn = connection_pool.get_connection()
    cur = conn.cursor(dictionary=True)
    
    # 1. Update existing records
    cur.execute("""
        UPDATE users 
        SET username='staff_kl', nama='Staff Rekonsiliasi K/L', email='staff.kl@weblaporan.local' 
        WHERE username='operator_kl'
    """)
    cur.execute("""
        UPDATE users 
        SET username='pimpinan_kl', nama='Pimpinan K/L (Menteri/Sekjen)', email='pimpinan.kl@weblaporan.local' 
        WHERE username='admin_kl'
    """)
    conn.commit()
    print("Updated operator_kl -> staff_kl and admin_kl -> pimpinan_kl")

    # 2. Check if aliases exist
    cur.execute("SELECT username FROM users WHERE username IN ('operator_kl', 'admin_kl')")
    existing_aliases = [r['username'] for r in cur.fetchall()]
    
    pwd_hash = '$2b$12$i.38.X3TeV9jFxdKW4c7FOuMYcNiDAr1r3h2Ig4qswhRZdvnGU/zy'
    if 'operator_kl' not in existing_aliases:
        cur.execute("""
            INSERT INTO users (username, nama, email, password_hash, role_id, tingkat_id)
            VALUES ('operator_kl', 'Staff Rekonsiliasi K/L (Alias)', 'operator.kl@weblaporan.local', %s, 1, 3)
        """, (pwd_hash,))
    if 'admin_kl' not in existing_aliases:
        cur.execute("""
            INSERT INTO users (username, nama, email, password_hash, role_id, tingkat_id)
            VALUES ('admin_kl', 'Pimpinan K/L (Alias)', 'admin.kl@weblaporan.local', %s, 2, 3)
        """, (pwd_hash,))
    conn.commit()
    print("Aliases verified/created")

    cur.execute("SELECT id, username, nama, email, role_id, tingkat_id FROM users WHERE tingkat_id=3")
    rows = cur.fetchall()
    print("Active K/L accounts in DB:")
    for row in rows:
        print(row)

    conn.close()

if __name__ == "__main__":
    update_kl()
