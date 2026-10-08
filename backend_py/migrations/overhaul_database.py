import os
import sys

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import mysql.connector
import bcrypt
from dotenv import load_dotenv

# Load .env
dotenv_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
load_dotenv(dotenv_path=dotenv_path)

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        port=int(os.getenv("MYSQL_PORT", 3307)),
        database=os.getenv("MYSQL_DATABASE", "web_laporan"),
        user="root",
        password=os.getenv("MYSQL_ROOT_PASSWORD", "#admin123")
    )

def run_overhaul():
    print("=" * 60)
    print("🚀 MEMULAI FASE 1: ROMBAK DATABASE KE MODEL 3 ROLE & 3 TINGKAT")
    print("=" * 60)

    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute("SET FOREIGN_KEY_CHECKS = 0;")

        # ---------------------------------------------------------
        # 1. BUAT / UPDATE TABEL TINGKATS (3 Level Wilayah)
        # ---------------------------------------------------------
        print("\n[1/6] Membuat & Mengisi Tabel 'tingkats'...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tingkats (
                id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
                kode VARCHAR(50) NOT NULL UNIQUE,
                nama VARCHAR(100) NOT NULL,
                deskripsi VARCHAR(255) NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        cur.execute("TRUNCATE TABLE tingkats;")
        tingkat_data = [
            (1, 'satker', 'Tingkat Satker', 'Satuan Kerja / Perguruan Tinggi / Balai Pelaksana (153 Satker)'),
            (2, 'eselon_1', 'Tingkat Eselon 1', 'Unit Eselon 1 Pembina (5 Ditjen Pembina)'),
            (3, 'kl', 'Tingkat K/L', 'Pusat Kementerian / Lembaga (Nasional)')
        ]
        cur.executemany(
            "INSERT INTO tingkats (id, kode, nama, deskripsi) VALUES (%s, %s, %s, %s)",
            tingkat_data
        )
        print("  ✅ Tabel 'tingkats' berhasil diisi: satker, eselon_1, kl")

        # ---------------------------------------------------------
        # 2. UPDATE TABEL ROLES (3 Role Utama)
        # ---------------------------------------------------------
        print("\n[2/6] Memperbarui Tabel 'roles' (3 Role Utama)...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS roles (
                id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
                nama VARCHAR(50) NOT NULL UNIQUE,
                deskripsi VARCHAR(255) NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        cur.execute("TRUNCATE TABLE roles;")
        role_data = [
            (1, 'operator', 'Operator Pelaksana — Input kas, upload rekening koran, susun berkas laporan'),
            (2, 'administrasi', 'Administrasi / Pimpinan — Review selisih, approval dokumen, monitor pengguna'),
            (3, 'it', 'IT Administrator — Pengelola sistem, database master, dan manajemen akun')
        ]
        cur.executemany(
            "INSERT INTO roles (id, nama, deskripsi) VALUES (%s, %s, %s)",
            role_data
        )
        print("  ✅ Tabel 'roles' berhasil diisi: operator (1), administrasi (2), it (3)")

        # ---------------------------------------------------------
        # 3. PASTIKAN TABEL UNIT_ESELON_1 TERISI LENGKAP
        # ---------------------------------------------------------
        print("\n[3/6] Memeriksa & Mengisi 5 Unit Eselon 1...")
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

        cur.execute("TRUNCATE TABLE unit_eselon_1;")
        eselon_units = [
            (1, 'E1-01', 'Sekretariat Jenderal', 'Setjen', 'Pengelolaan koordinasi umum, tata kelola, dan perbendaharaan kementerian'),
            (2, 'E1-02', 'Direktorat Jenderal Pendidikan Tinggi', 'Ditjen Dikti', 'Pembinaan universitas, institut, kelembagaan akademik, dan kemahasiswaan'),
            (3, 'E1-03', 'Direktorat Jenderal Pendidikan Vokasi', 'Ditjen Vokasi', 'Pembinaan politeknik, akademi komunitas, dan pendidikan terapan'),
            (4, 'E1-04', 'Direktorat Jenderal Riset dan Pengembangan Sains Teknologi', 'Ditjen Saintek', 'Riset, inovasi saintek, dan hilirisasi produk perguruan tinggi'),
            (5, 'E1-05', 'Inspektorat Jenderal', 'Itjen', 'Pengawasan internal perbendaharaan, audit keuangan, dan akuntabilitas')
        ]
        cur.executemany(
            "INSERT INTO unit_eselon_1 (id, kode, nama, singkatan, deskripsi) VALUES (%s, %s, %s, %s, %s)",
            eselon_units
        )
        print("  ✅ 5 Unit Eselon 1 berhasil dipasang (Setjen, Dikti, Vokasi, Saintek, Itjen)")

        # ---------------------------------------------------------
        # 4. HUBUNGKAN 153 SATKER KE UNIT ESELON 1 PEMBINA
        # ---------------------------------------------------------
        print("\n[4/6] Mengelompokkan 153 Satker ke Pembina Eselon 1...")
        # Tambah kolom eselon_1_id ke satkers jika belum ada
        cur.execute("SHOW COLUMNS FROM satkers LIKE 'eselon_1_id'")
        if not cur.fetchone():
            cur.execute("ALTER TABLE satkers ADD COLUMN eselon_1_id INT UNSIGNED NULL AFTER nama")

        # Petakan satkers berdasarkan tipe namanya
        # 1. Politeknik & Akademi Komunitas -> E1-03 (Ditjen Vokasi)
        cur.execute("""
            UPDATE satkers 
            SET eselon_1_id = 3 
            WHERE nama LIKE '%POLITEKNIK%' 
               OR nama LIKE '%AKADEMI KOMUNITAS%' 
               OR nama LIKE '%SEKOLAH MENENGAH%'
        """)
        vokasi_count = cur.rowcount

        # 2. Biro, Sekretariat, Pusat -> E1-01 (Setjen)
        cur.execute("""
            UPDATE satkers 
            SET eselon_1_id = 1 
            WHERE nama LIKE '%SEKRETARIAT%' 
               OR nama LIKE '%PUSAT PEMBIAYAAN%' 
               OR nama LIKE '%BIRO%'
        """)
        setjen_count = cur.rowcount

        # 3. Riset, Sains & Teknologi -> E1-04 (Ditjen Saintek)
        cur.execute("""
            UPDATE satkers 
            SET eselon_1_id = 4 
            WHERE nama LIKE '%SAINS DAN TEKNOLOGI%' 
               OR nama LIKE '%BINA TALENTA%'
        """)
        saintek_count = cur.rowcount

        # 4. Sisanya (Universitas, Institut Seni, LLDIKTI) -> E1-02 (Ditjen Dikti)
        cur.execute("UPDATE satkers SET eselon_1_id = 2 WHERE eselon_1_id IS NULL")
        dikti_count = cur.rowcount

        print(f"  ✅ Satker terhubung: Vokasi={vokasi_count}, Setjen={setjen_count}, Saintek={saintek_count}, Dikti={dikti_count}")

        # ---------------------------------------------------------
        # 5. PERBARUI STRUKTUR TABEL USERS (Tambah tingkat_id)
        # ---------------------------------------------------------
        print("\n[5/6] Memperbarui Kolom Tabel 'users'...")
        cur.execute("SHOW COLUMNS FROM users LIKE 'tingkat_id'")
        if not cur.fetchone():
            cur.execute("ALTER TABLE users ADD COLUMN tingkat_id TINYINT UNSIGNED NOT NULL DEFAULT 1 AFTER role_id")
            print("  ✅ Kolom 'tingkat_id' berhasil ditambahkan ke tabel users")
        else:
            print("  ℹ️ Kolom 'tingkat_id' sudah ada di tabel users")

        cur.execute("SHOW COLUMNS FROM users LIKE 'eselon_1_id'")
        if not cur.fetchone():
            cur.execute("ALTER TABLE users ADD COLUMN eselon_1_id INT UNSIGNED NULL AFTER satker_id")
            print("  ✅ Kolom 'eselon_1_id' berhasil ditambahkan ke tabel users")

        # ---------------------------------------------------------
        # 6. SEEDING AKUN PENGUJIAN STANDAR
        # ---------------------------------------------------------
        print("\n[6/6] Menyiapkan Akun Pengujian Baru (Password: Password@123)...")
        # Password hash standar untuk: Password@123
        hashed_password = bcrypt.hashpw("Password@123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        # Ambil satu contoh satker untuk testing (misal: UGM atau Satker pertama)
        cur.execute("SELECT id, nama FROM satkers WHERE nama LIKE '%GADJAH MADA%' LIMIT 1")
        ugm = cur.fetchone()
        test_satker_id = ugm['id'] if ugm else 945
        test_satker_nama = ugm['nama'] if ugm else "UNIVERSITAS GADJAH MADA"

        accounts = [
            # 1. Operator Satker
            {
                "nama": "Operator UGM",
                "username": "operator_satker",
                "email": "operator.satker@weblaporan.local",
                "role_id": 1,      # operator
                "tingkat_id": 1,   # satker
                "satker_id": test_satker_id,
                "eselon_1_id": 2
            },
            # 2. Administrasi Satker (Pimpinan Kampus)
            {
                "nama": "Pimpinan Satker UGM",
                "username": "admin_satker",
                "email": "admin.satker@weblaporan.local",
                "role_id": 2,      # administrasi
                "tingkat_id": 1,   # satker
                "satker_id": test_satker_id,
                "eselon_1_id": 2
            },
            # 3. Operator Eselon 1 (Operator Ditjen Dikti)
            {
                "nama": "Operator Ditjen Dikti",
                "username": "operator_eselon1",
                "email": "operator.eselon1@weblaporan.local",
                "role_id": 1,      # operator
                "tingkat_id": 2,   # eselon_1
                "satker_id": None,
                "eselon_1_id": 2   # Ditjen Dikti
            },
            # 4. Administrasi Eselon 1 (Pimpinan Ditjen Dikti)
            {
                "nama": "Pimpinan Ditjen Dikti",
                "username": "admin_eselon1",
                "email": "admin.eselon1@weblaporan.local",
                "role_id": 2,      # administrasi
                "tingkat_id": 2,   # eselon_1
                "satker_id": None,
                "eselon_1_id": 2   # Ditjen Dikti
            },
            # 5. Operator K/L (Operator Tingkat Kementerian)
            {
                "nama": "Operator Rekonsiliasi K/L",
                "username": "operator_kl",
                "email": "operator.kl@weblaporan.local",
                "role_id": 1,      # operator
                "tingkat_id": 3,   # kl
                "satker_id": None,
                "eselon_1_id": None
            },
            # 6. Administrasi K/L (Pimpinan Kementerian / Menteri / Sekjen)
            {
                "nama": "Pimpinan K/L (Menteri/Sekjen)",
                "username": "admin_kl",
                "email": "admin.kl@weblaporan.local",
                "role_id": 2,      # administrasi
                "tingkat_id": 3,   # kl
                "satker_id": None,
                "eselon_1_id": None
            },
            # 7. IT Administrator
            {
                "nama": "IT Administrator Global",
                "username": "it_admin",
                "email": "itadmin@weblaporan.local",
                "role_id": 3,      # it
                "tingkat_id": 3,   # kl
                "satker_id": None,
                "eselon_1_id": None
            },
            # 8. Akun Pribadi Developer
            {
                "nama": "Putra Naufal (Lead IT)",
                "username": "naufal",
                "email": "Adivalisna11@gmail.com",
                "role_id": 3,      # it
                "tingkat_id": 3,   # kl
                "satker_id": None,
                "eselon_1_id": None
            }
        ]

        for acc in accounts:
            cur.execute("""
                INSERT INTO users (nama, username, email, password_hash, role_id, tingkat_id, satker_id, eselon_1_id, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
                ON DUPLICATE KEY UPDATE 
                    nama = VALUES(nama),
                    password_hash = VALUES(password_hash),
                    role_id = VALUES(role_id),
                    tingkat_id = VALUES(tingkat_id),
                    satker_id = VALUES(satker_id),
                    eselon_1_id = VALUES(eselon_1_id),
                    is_active = 1
            """, (
                acc["nama"],
                acc["username"],
                acc["email"],
                hashed_password,
                acc["role_id"],
                acc["tingkat_id"],
                acc["satker_id"],
                acc["eselon_1_id"]
            ))

        # Selaraskan juga seluruh akun satker dummy lainnya agar role_id=1 (operator) dan tingkat_id=1 (satker)
        cur.execute("""
            UPDATE users 
            SET role_id = 1, tingkat_id = 1 
            WHERE satker_id IS NOT NULL AND username NOT IN ('operator_satker', 'admin_satker')
        """)

        cur.execute("SET FOREIGN_KEY_CHECKS = 1;")
        conn.commit()

        print("\n" + "=" * 60)
        print("🎉 FASE 1 SELESAI DENGAN SUKSES!")
        print("=" * 60)
        print("Daftar Akun Testing Siap Digunakan (Password: Password@123):")
        print(" 1. operator_satker -> Role: OPERATOR     | Tingkat: SATKER   (UGM)")
        print(" 2. admin_satker    -> Role: ADMINISTRASI | Tingkat: SATKER   (UGM)")
        print(" 3. operator_eselon1-> Role: OPERATOR     | Tingkat: ESELON 1 (Dikti)")
        print(" 4. admin_eselon1   -> Role: ADMINISTRASI | Tingkat: ESELON 1 (Dikti)")
        print(" 5. operator_kl     -> Role: OPERATOR     | Tingkat: K/L      (Pusat)")
        print(" 6. admin_kl        -> Role: ADMINISTRASI | Tingkat: K/L      (Pusat)")
        print(" 7. it_admin        -> Role: IT           | Tingkat: K/L      (Server)")
        print(" 8. naufal          -> Role: IT           | Tingkat: K/L      (Adiva)")
        print("=" * 60)

    except Exception as e:
        conn.rollback()
        print(f"\n❌ TERJADI KESALAHAN SAAT MIGRASI: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_overhaul()
