import os
import glob
import openpyxl
import mysql.connector

def run_import():
    conn = mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "127.0.0.1"),
        port=int(os.getenv("MYSQL_PORT", 3307)),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", "#admin123"),
        database=os.getenv("MYSQL_DATABASE", "web_laporan")
    )
    cur = conn.cursor(dictionary=True)

    print("=== Step 1: Menyesuaikan Master unit_eselon_1 ===")
    # Pastikan unit Eselon 1 lengkap sesuai kode resmi:
    # 13901 - Sekretariat Jenderal
    # 13902 - Inspektorat Jenderal
    # 13903 - Direktorat Jenderal Pendidikan Tinggi
    # 13904 - Direktorat Jenderal Riset dan Pengembangan
    # 13905 - Direktorat Jenderal Sains dan Teknologi
    
    cur.execute("UPDATE unit_eselon_1 SET kode = '13901', nama = 'Sekretariat Jenderal', singkatan = 'Setjen' WHERE id = 1")
    cur.execute("UPDATE unit_eselon_1 SET kode = '13903', nama = 'Direktorat Jenderal Pendidikan Tinggi', singkatan = 'Ditjen Dikti' WHERE id = 2")
    cur.execute("UPDATE unit_eselon_1 SET kode = '13904', nama = 'Direktorat Jenderal Riset dan Pengembangan', singkatan = 'Ditjen Risbang' WHERE id = 4")
    cur.execute("UPDATE unit_eselon_1 SET kode = '13902', nama = 'Inspektorat Jenderal', singkatan = 'Itjen' WHERE id = 5")
    
    # Cek apakah unit 13905 sudah ada
    cur.execute("SELECT id FROM unit_eselon_1 WHERE kode = '13905' OR nama LIKE '%Sains dan Teknologi%'")
    row_6 = cur.fetchone()
    if not row_6:
        cur.execute("""
            INSERT INTO unit_eselon_1 (kode, nama, singkatan, deskripsi) 
            VALUES ('13905', 'Direktorat Jenderal Sains dan Teknologi', 'Ditjen Saintek', 'Riset sains, teknologi, dan inovasi pendidikan tinggi')
        """)
        saintek_id = cur.lastrowid
    else:
        saintek_id = row_6['id']
        cur.execute("UPDATE unit_eselon_1 SET kode = '13905', nama = 'Direktorat Jenderal Sains dan Teknologi', singkatan = 'Ditjen Saintek' WHERE id = %s", (saintek_id,))

    conn.commit()

    # Ambil map id unit_eselon_1
    cur.execute("SELECT id, kode, nama, singkatan FROM unit_eselon_1")
    units = cur.fetchall()
    unit_map = {}
    for u in units:
        unit_map[str(u['kode']).strip()] = u['id']
        print(f"  Unit [{u['id']}] Kode: {u['kode']} - {u['nama']} ({u['singkatan']})")

    # Mapping kode file ke ID Eselon 1
    # 13901 -> id 1
    # 13902 -> id 5
    # 13903 -> id 2
    # 13904 -> id 4
    # 13905 -> saintek_id
    eselon_map = {
        '13901': unit_map.get('13901', 1),
        '13902': unit_map.get('13902', 5),
        '13903': unit_map.get('13903', 2),
        '13904': unit_map.get('13904', 4),
        '13905': saintek_id,
    }

    print("\n=== Step 2: Membaca & Memasukkan Satker Binaan Masing-Masing Eselon 1 ===")
    folder = "Satker binaa masing2 esleon1"
    files = sorted(glob.glob(os.path.join(folder, "*.xlsx")))

    total_inserted = 0
    total_updated = 0

    for filepath in files:
        filename = os.path.basename(filepath)
        wb = openpyxl.load_workbook(filepath, data_only=True)
        sheet = wb.active
        rows = list(sheet.iter_rows(values_only=True))
        if len(rows) <= 1:
            continue
        data_rows = rows[1:]

        # Ambil kode eselon dari nama file atau baris pertama
        e1_code = None
        for code in eselon_map.keys():
            if f"[{code}]" in filename or code in filename:
                e1_code = code
                break
        if not e1_code and len(data_rows) > 0:
            e1_code = str(data_rows[0][6]).strip()

        target_e1_id = eselon_map.get(e1_code)
        if not target_e1_id:
            print(f"Warning: Eselon code {e1_code} tidak dikenali untuk file {filename}")
            continue

        print(f"\nProcessing {filename} -> Target Eselon 1 ID: {target_e1_id} ({len(data_rows)} satker)")

        for r in data_rows:
            kd_satker = str(r[0]).strip() if r[0] else None
            nm_satker = str(r[1]).strip() if r[1] else None
            if not nm_satker:
                continue

            # Cek apakah satker sudah ada berdasarkan NO_Satker
            cur.execute("SELECT id, nama, NO_Satker, eselon_1_id FROM satkers WHERE NO_Satker = %s", (kd_satker,))
            found = cur.fetchone()

            if found:
                # Update eselon_1_id dan nama
                cur.execute("""
                    UPDATE satkers 
                    SET eselon_1_id = %s, nama = %s 
                    WHERE id = %s
                """, (target_e1_id, nm_satker, found['id']))
                total_updated += 1
            else:
                # Cek jika ada berdasarkan nama
                cur.execute("SELECT id, nama, NO_Satker, eselon_1_id FROM satkers WHERE nama = %s", (nm_satker,))
                found_name = cur.fetchone()
                if found_name:
                    cur.execute("""
                        UPDATE satkers 
                        SET eselon_1_id = %s, NO_Satker = %s 
                        WHERE id = %s
                    """, (target_e1_id, kd_satker, found_name['id']))
                    total_updated += 1
                else:
                    # Insert satker baru
                    cur.execute("""
                        INSERT INTO satkers (NO_Satker, nama, eselon_1_id)
                        VALUES (%s, %s, %s)
                    """, (kd_satker, nm_satker, target_e1_id))
                    total_inserted += 1

    conn.commit()
    print(f"\nSelesai import: {total_updated} satker di-update, {total_inserted} satker baru dimasukkan.")

    print("\n=== Step 3: Sinkronisasi Akun Operator & Admin Satker UGM ===")
    cur.execute("SELECT id FROM satkers WHERE NO_Satker = '693410' OR nama LIKE '%GADJAH MADA%' LIMIT 1")
    ugm_row = cur.fetchone()
    if ugm_row:
        ugm_id = ugm_row['id']
        cur.execute("UPDATE users SET satker_id = %s WHERE satker_id = 945 OR username IN ('operator_satker', 'admin_satker')", (ugm_id,))
        cur.execute("UPDATE pencatatan SET satker_id = %s WHERE satker_id = 945", (ugm_id,))
        cur.execute("UPDATE rekening_koran SET satker_id = %s WHERE satker_id = 945", (ugm_id,))
        conn.commit()
        print(f"  -> Satker UGM ID {ugm_id} berhasil ditautkan ke akun operator_satker & admin_satker!")

    print("\n=== Step 4: Rekapitulasi Satker Binaan Per Unit Eselon 1 ===")
    cur.execute("""
        SELECT u.id, u.kode, u.nama, u.singkatan, COUNT(s.id) as total_satker
        FROM unit_eselon_1 u
        LEFT JOIN satkers s ON s.eselon_1_id = u.id
        GROUP BY u.id, u.kode, u.nama, u.singkatan
        ORDER BY u.id ASC
    """)
    for row in cur.fetchall():
        print(f"[{row['id']}] {row['kode']} - {row['nama']} ({row['singkatan']}): {row['total_satker']} Satker Binaan")

    cur.execute("SELECT COUNT(*) as unassigned FROM satkers WHERE eselon_1_id IS NULL")
    unassigned = cur.fetchone()['unassigned']
    print(f"\nSatker tanpa eselon 1 (unassigned): {unassigned}")

    cur.execute("SELECT COUNT(*) as total_satker FROM satkers")
    total_all = cur.fetchone()['total_satker']
    print(f"Total seluruh satker di database: {total_all}")

    conn.close()

if __name__ == "__main__":
    run_import()
