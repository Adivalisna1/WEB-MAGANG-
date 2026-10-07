from db import connection_pool
import bcrypt

def run_migration():
    conn = connection_pool.get_connection()
    cur = conn.cursor(dictionary=True)

    print("Step 1: Creating unit_eselon_1 table...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS unit_eselon_1 (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        kode VARCHAR(50) NOT NULL UNIQUE,
        nama VARCHAR(255) NOT NULL,
        singkatan VARCHAR(50) NOT NULL,
        deskripsi TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """)

    print("Step 2: Checking users table for eselon_1_id...")
    cur.execute("SHOW COLUMNS FROM users LIKE 'eselon_1_id'")
    if not cur.fetchone():
        cur.execute("ALTER TABLE users ADD COLUMN eselon_1_id INT UNSIGNED NULL AFTER satker_id")
        print("-> Added eselon_1_id to users")
    else:
        print("-> Column eselon_1_id already exists in users")

    print("Step 3: Checking satkers table for eselon_1_id...")
    cur.execute("SHOW COLUMNS FROM satkers LIKE 'eselon_1_id'")
    if not cur.fetchone():
        cur.execute("ALTER TABLE satkers ADD COLUMN eselon_1_id INT UNSIGNED NULL")
        print("-> Added eselon_1_id to satkers")
    else:
        print("-> Column eselon_1_id already exists in satkers")

    print("Step 4: Seeding 5 Eselon 1 Units...")
    units = [
        ('E1-01', 'Sekretariat Jenderal', 'Setjen', 'Pengelolaan koordinasi umum, regulasi, tata kelola, dan perbendaharaan kementerian'),
        ('E1-02', 'Direktorat Jenderal Pendidikan Tinggi', 'Ditjen Dikti', 'Pembinaan universitas, institut, kelembagaan akademik, dan kemahasiswaan'),
        ('E1-03', 'Direktorat Jenderal Pendidikan Vokasi', 'Ditjen Vokasi', 'Pembinaan politeknik, akademi komunitas, dan pendidikan vokasi terapan'),
        ('E1-04', 'Direktorat Jenderal Riset dan Pengembangan Sains Teknologi', 'Ditjen Saintek', 'Hilirisasi riset, inovasi saintek, dan pengabdian masyarakat perguruan tinggi'),
        ('E1-05', 'Inspektorat Jenderal', 'Itjen', 'Pengawasan internal perbendaharaan, audit kinerja keuangan, dan akuntabilitas publik')
    ]

    for kode, nama, singkatan, deskripsi in units:
        cur.execute("""
            INSERT INTO unit_eselon_1 (kode, nama, singkatan, deskripsi)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE nama=%s, singkatan=%s, deskripsi=%s
        """, (kode, nama, singkatan, deskripsi, nama, singkatan, deskripsi))

    conn.commit()

    # Step 5: Assign existing user ketua1 to E1-02 (Ditjen Dikti)
    cur.execute("SELECT id FROM unit_eselon_1 WHERE kode = 'E1-02' LIMIT 1")
    dikti_row = cur.fetchone()
    if dikti_row:
        cur.execute("UPDATE users SET eselon_1_id = %s WHERE email = 'ketua1@weblaporan.local'", (dikti_row['id'],))
        conn.commit()

    # Step 6: Create/update 5 dedicated Eselon 1 user accounts for testing
    password_hash = bcrypt.hashpw(b"123456", bcrypt.gensalt()).decode("utf-8")
    test_accounts = [
        ('eselon.setjen@weblaporan.local', 'eselon_setjen', 'Pimpinan Eselon 1 (Setjen)', 'E1-01'),
        ('eselon.dikti@weblaporan.local', 'eselon_dikti', 'Pimpinan Eselon 1 (Ditjen Dikti)', 'E1-02'),
        ('eselon.vokasi@weblaporan.local', 'eselon_vokasi', 'Pimpinan Eselon 1 (Ditjen Vokasi)', 'E1-03'),
        ('eselon.saintek@weblaporan.local', 'eselon_saintek', 'Pimpinan Eselon 1 (Ditjen Saintek)', 'E1-04'),
        ('eselon.itjen@weblaporan.local', 'eselon_itjen', 'Pimpinan Eselon 1 (Itjen)', 'E1-05'),
    ]

    for email, username, nama, kode_e1 in test_accounts:
        cur.execute("SELECT id FROM unit_eselon_1 WHERE kode = %s", (kode_e1,))
        e1_id = cur.fetchone()['id']
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        existing = cur.fetchone()
        if existing:
            cur.execute("UPDATE users SET nama = %s, username = %s, role_id = 3, eselon_1_id = %s WHERE id = %s", (nama, username, e1_id, existing['id']))
        else:
            cur.execute("""
                INSERT INTO users (nama, username, email, password_hash, role_id, eselon_1_id, is_active)
                VALUES (%s, %s, %s, %s, 3, %s, 1)
            """, (nama, username, email, password_hash, e1_id))

    conn.commit()

    print("\n--- Summary 5 Unit Eselon 1 ---")
    cur.execute("SELECT * FROM unit_eselon_1")
    for r in cur.fetchall():
        print(f"[{r['id']}] {r['kode']} - {r['nama']} ({r['singkatan']})")

    print("\n--- Summary Akun Eselon 1 ---")
    cur.execute("""
        SELECT u.id, u.nama, u.email, ue.nama as unit_nama, ue.singkatan
        FROM users u
        LEFT JOIN unit_eselon_1 ue ON u.eselon_1_id = ue.id
        WHERE u.role_id = 3
    """)
    for r in cur.fetchall():
        print(f"User: {r['email']} | {r['nama']} -> {r['singkatan']} ({r['unit_nama']})")

    conn.close()

if __name__ == "__main__":
    run_migration()
