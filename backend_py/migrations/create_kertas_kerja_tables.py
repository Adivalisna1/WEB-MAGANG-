import os
import sys

# Add parent directory to path so we can import db
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db

def run_migration():
    print("=== MEMULAI MIGRASI TABEL KERTAS KERJA & RUMUS ===")
    conn = db.connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    # 1. Tabel Header Rumus: kertas_kerja_rumus
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS kertas_kerja_rumus (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama_rumus VARCHAR(255) NOT NULL,
            deskripsi TEXT NULL,
            scope ENUM('universal', 'eselon_1') NOT NULL DEFAULT 'universal',
            eselon_1_id INT NULL,
            created_by_user_id INT NOT NULL,
            is_locked TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 jika sudah pernah dipakai oleh laporan satker',
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_scope (scope),
            INDEX idx_eselon_1 (eselon_1_id),
            INDEX idx_is_locked (is_locked),
            INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """)
    print("1. Tabel `kertas_kerja_rumus` berhasil dibuat.")

    # 2. Tabel Seksi / Bagian Rumus: kertas_kerja_rumus_seksi
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS kertas_kerja_rumus_seksi (
            id INT AUTO_INCREMENT PRIMARY KEY,
            rumus_id INT NOT NULL,
            nama_seksi VARCHAR(150) NOT NULL COMMENT 'Contoh: Penerimaan Kas & Aset',
            tipe_akun_filter ENUM('A', 'L', 'O', 'R', 'E', 'ALL') NOT NULL DEFAULT 'ALL' COMMENT 'Smart filter BAS',
            urutan INT NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_rumus_id (rumus_id),
            FOREIGN KEY (rumus_id) REFERENCES kertas_kerja_rumus(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """)
    print("2. Tabel `kertas_kerja_rumus_seksi` berhasil dibuat.")

    # 3. Tabel Detail Akun di Seksi: kertas_kerja_rumus_item
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS kertas_kerja_rumus_item (
            id INT AUTO_INCREMENT PRIMARY KEY,
            seksi_id INT NOT NULL,
            akun_id INT NOT NULL,
            operator ENUM('tambah', 'kurang') NOT NULL DEFAULT 'tambah' COMMENT 'tambah (+) atau kurang (-)',
            urutan INT NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_seksi_id (seksi_id),
            INDEX idx_akun_id (akun_id),
            FOREIGN KEY (seksi_id) REFERENCES kertas_kerja_rumus_seksi(id) ON DELETE CASCADE,
            FOREIGN KEY (akun_id) REFERENCES master_akun(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """)
    print("3. Tabel `kertas_kerja_rumus_item` berhasil dibuat.")

    # 4. Tabel Transaksi / Lembar Kertas Kerja Satker: kertas_kerja_satker
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS kertas_kerja_satker (
            id INT AUTO_INCREMENT PRIMARY KEY,
            satker_id INT NOT NULL,
            rumus_id INT NOT NULL,
            tahun INT NOT NULL,
            bulan INT NOT NULL,
            saldo_awal DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
            total_penambah DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
            total_pengurang DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
            saldo_akhir DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
            catatan TEXT NULL,
            status ENUM('draft', 'diajukan', 'terverifikasi', 'revisi') NOT NULL DEFAULT 'draft',
            created_by_user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_satker_id (satker_id),
            INDEX idx_rumus_id (rumus_id),
            INDEX idx_periode (tahun, bulan),
            INDEX idx_status (status),
            FOREIGN KEY (rumus_id) REFERENCES kertas_kerja_rumus(id),
            UNIQUE KEY uk_satker_periode_rumus (satker_id, tahun, bulan, rumus_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """)
    print("4. Tabel `kertas_kerja_satker` berhasil dibuat.")

    # 5. Tabel Rincian Nilai per Akun: kertas_kerja_satker_nilai
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS kertas_kerja_satker_nilai (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kertas_kerja_id INT NOT NULL,
            rumus_item_id INT NOT NULL,
            akun_id INT NOT NULL,
            nominal DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_kertas_kerja (kertas_kerja_id),
            INDEX idx_rumus_item (rumus_item_id),
            INDEX idx_akun_id (akun_id),
            FOREIGN KEY (kertas_kerja_id) REFERENCES kertas_kerja_satker(id) ON DELETE CASCADE,
            FOREIGN KEY (rumus_item_id) REFERENCES kertas_kerja_rumus_item(id),
            FOREIGN KEY (akun_id) REFERENCES master_akun(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """)
    print("5. Tabel `kertas_kerja_satker_nilai` berhasil dibuat.")

    # 6. Buat 1 Contoh Rumus Standar Universal (IT Template)
    cursor.execute("SELECT id FROM users WHERE role_id = 3 LIMIT 1")
    it_user = cursor.fetchone()
    it_user_id = it_user["id"] if it_user else 1

    cursor.execute("SELECT id FROM kertas_kerja_rumus WHERE nama_rumus = %s", ("Kertas Kerja Rekonsiliasi Kas Satker (Standar Nasional)",))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO kertas_kerja_rumus (nama_rumus, deskripsi, scope, eselon_1_id, created_by_user_id, is_locked, is_active)
            VALUES (%s, %s, 'universal', NULL, %s, 0, 1)
        """, (
            "Kertas Kerja Rekonsiliasi Kas Satker (Standar Nasional)",
            "Rumus standar perhitungan saldo kas satker: Saldo Awal ditambah Penerimaan Kas / PNBP dikurangi Belanja Operasional & Pengeluaran Kas.",
            it_user_id
        ))
        rumus_id = cursor.lastrowid

        # Seksi 1: Penerimaan Kas (Aset & Pendapatan)
        cursor.execute("""
            INSERT INTO kertas_kerja_rumus_seksi (rumus_id, nama_seksi, tipe_akun_filter, urutan)
            VALUES (%s, %s, 'R', 1)
        """, (rumus_id, "I. Penerimaan Pendapatan & Kas Masuk (+)") )
        seksi_1_id = cursor.lastrowid

        # Seksi 2: Pengeluaran Kas (Belanja & Beban)
        cursor.execute("""
            INSERT INTO kertas_kerja_rumus_seksi (rumus_id, nama_seksi, tipe_akun_filter, urutan)
            VALUES (%s, %s, 'E', 2)
        """, (rumus_id, "II. Pengeluaran Belanja & Beban Kas (-)") )
        seksi_2_id = cursor.lastrowid

        # Masukkan akun-akun populer ke Seksi 1 (Penerimaan)
        cursor.execute("SELECT id FROM master_akun WHERE kode_akun IN ('411111', '411112', '424111', '425111')")
        akuns_seksi_1 = cursor.fetchall()
        for i, a in enumerate(akuns_seksi_1, 1):
            cursor.execute("""
                INSERT INTO kertas_kerja_rumus_item (seksi_id, akun_id, operator, urutan)
                VALUES (%s, %s, 'tambah', %s)
            """, (seksi_1_id, a["id"], i))

        # Masukkan akun-akun populer ke Seksi 2 (Pengeluaran)
        cursor.execute("SELECT id FROM master_akun WHERE kode_akun IN ('511111', '521111', '522111', '531111')")
        akuns_seksi_2 = cursor.fetchall()
        for i, a in enumerate(akuns_seksi_2, 1):
            cursor.execute("""
                INSERT INTO kertas_kerja_rumus_item (seksi_id, akun_id, operator, urutan)
                VALUES (%s, %s, 'kurang', %s)
            """, (seksi_2_id, a["id"], i))

        conn.commit()
        print("6. Contoh Rumus Universal Standar Nasional berhasil dibuat sebagai sampel awal.")
    else:
        print("6. Rumus sampel sudah ada.")

    conn.commit()
    conn.close()
    print("=== SELURUH TABEL KERTAS KERJA BERHASIL DIBUAT DENGAN SEMPURNA! ===\n")

if __name__ == "__main__":
    run_migration()
