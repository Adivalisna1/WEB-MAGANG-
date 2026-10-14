from db import connection_pool

MONTHS = {
    1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April',
    5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus',
    9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember'
}

def run_migration():
    conn = connection_pool.get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        
        # 1. Update pencatatan
        cursor.execute("SELECT id, tanggal, periode FROM pencatatan WHERE periode IS NULL OR periode = ''")
        rows = cursor.fetchall()
        print(f"Found {len(rows)} records in pencatatan with empty periode")
        
        for r in rows:
            if r['tanggal']:
                d = r['tanggal']
                p = f"{MONTHS.get(d.month, 'Januari')} {d.year}"
                cursor.execute("UPDATE pencatatan SET periode = %s WHERE id = %s", (p, r['id']))
                print(f"Pencatatan ID {r['id']}: tanggal {d} -> periode {p}")
        
        # 2. Update rekening_koran if exists
        try:
            cursor.execute("SELECT id, tanggal_pembukaan_rekening, tahun, periode FROM rekening_koran WHERE periode IS NULL OR periode = ''")
            rk_rows = cursor.fetchall()
            print(f"Found {len(rk_rows)} records in rekening_koran with empty periode")
            for r in rk_rows:
                if r.get('tanggal_pembukaan_rekening'):
                    d = r['tanggal_pembukaan_rekening']
                    p = f"{MONTHS.get(d.month, 'Januari')} {d.year}"
                elif r.get('tahun'):
                    p = f"Desember {r['tahun']}"
                else:
                    p = "Januari 2026"
                cursor.execute("UPDATE rekening_koran SET periode = %s WHERE id = %s", (p, r['id']))
        except Exception as e:
            print(f"Note on rekening_koran: {e}")

        conn.commit()
        print("Migration fill_empty_periode completed successfully!")
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()
