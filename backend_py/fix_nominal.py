from db import connection_pool
conn = connection_pool.get_connection()
cursor = conn.cursor(dictionary=True)
cursor.execute('UPDATE dokumen d JOIN rekening_koran r ON d.id = r.dokumen_id SET d.nilai_excel = r.saldo_akhir_bulan WHERE d.nilai_excel IS NULL OR d.nilai_excel = 0')
conn.commit()
print('Rows updated:', cursor.rowcount)
conn.close()
