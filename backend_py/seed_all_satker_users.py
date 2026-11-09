import mysql.connector
import bcrypt
import os

from db import connection_pool

def seed_users():
    conn = connection_pool.get_connection()
    cur = conn.cursor(dictionary=True)

    print("Fetching satkers and eselon_1...")
    cur.execute("SELECT id, NO_Satker, nama, eselon_1_id FROM satkers ORDER BY id ASC")
    satkers = cur.fetchall()
    print(f"Total Satkers found: {len(satkers)}")

    cur.execute("SELECT id, kode, nama, singkatan FROM unit_eselon_1 ORDER BY id ASC")
    eselons = cur.fetchall()
    print(f"Total Unit Eselon 1 found: {len(eselons)}")

    # Standard password hash for Satker@123
    password_plain = "Satker@123"
    password_hash = bcrypt.hashpw(password_plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # 1. Seed Eselon 1 Accounts
    eselon_map = {
        1: ("setjen", "Sekretariat Jenderal"),
        2: ("dikti", "Ditjen Pendidikan Tinggi"),
        3: ("vokasi", "Ditjen Pendidikan Vokasi"),
        4: ("risbang", "Ditjen Risbang"),
        5: ("itjen", "Inspektorat Jenderal"),
        6: ("saintek", "Ditjen Sains dan Teknologi")
    }

    eselon_created = 0
    for e_id, (short_name, full_name) in eselon_map.items():
        # Operator Eselon 1
        opr_user = f"opr_{short_name}"
        opr_email = f"operator.{short_name}@kemenkeu.go.id"
        cur.execute("SELECT id FROM users WHERE username = %s", (opr_user,))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO users (role_id, tingkat_id, satker_id, eselon_1_id, nama, username, email, password_hash, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
            """, (1, 2, None, e_id, f"Operator {full_name}", opr_user, opr_email, password_hash))
            eselon_created += 1

        # Pimpinan Eselon 1
        adm_user = f"adm_{short_name}"
        adm_email = f"admin.{short_name}@kemenkeu.go.id"
        cur.execute("SELECT id FROM users WHERE username = %s", (adm_user,))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO users (role_id, tingkat_id, satker_id, eselon_1_id, nama, username, email, password_hash, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
            """, (2, 2, None, e_id, f"Pimpinan {full_name}", adm_user, adm_email, password_hash))
            eselon_created += 1

    print(f"Eselon 1 accounts created: {eselon_created}")

    # 2. Seed 2 Users per Satker (Operator + Pimpinan Satker)
    satker_created = 0
    for s in satkers:
        s_id = s["id"]
        no_satker = s["NO_Satker"]
        raw_name = s["nama"]
        clean_name = raw_name[:80] # truncate safely for name column
        e_id = s["eselon_1_id"]

        # Operator Satker (role_id: 1, tingkat_id: 1)
        opr_username = f"opr_{no_satker}"
        opr_email = f"opr.{no_satker}@satker.kemdikbud.go.id"
        cur.execute("SELECT id FROM users WHERE username = %s", (opr_username,))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO users (role_id, tingkat_id, satker_id, eselon_1_id, nama, username, email, password_hash, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
            """, (1, 1, s_id, e_id, f"Operator - {clean_name}", opr_username, opr_email, password_hash))
            satker_created += 1

        # Pimpinan Satker (role_id: 2, tingkat_id: 1)
        adm_username = f"adm_{no_satker}"
        adm_email = f"adm.{no_satker}@satker.kemdikbud.go.id"
        cur.execute("SELECT id FROM users WHERE username = %s", (adm_username,))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO users (role_id, tingkat_id, satker_id, eselon_1_id, nama, username, email, password_hash, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
            """, (2, 1, s_id, e_id, f"Pimpinan - {clean_name}", adm_username, adm_email, password_hash))
            satker_created += 1

    conn.commit()
    print(f"Satker users created: {satker_created}")

    # Verification query
    cur.execute("SELECT COUNT(*) as total_users FROM users")
    total = cur.fetchone()["total_users"]
    print(f"Total Users now in database: {total}")

    cur.close()
    conn.close()

if __name__ == "__main__":
    seed_users()
