from db import connection_pool
conn = connection_pool.get_connection()
cursor = conn.cursor(dictionary=True)
cursor.execute("UPDATE dokumen SET file_path = REPLACE(file_path, '/api/pencatatan/file/', 'akuntansi/') WHERE file_path LIKE '/api/pencatatan/file/%'")
conn.commit()
print('Rows updated:', cursor.rowcount)
conn.close()
