from db import connection_pool
conn = connection_pool.get_connection()
cursor = conn.cursor(dictionary=True)
cursor.execute('SELECT id, judul, status, uploaded_by FROM dokumen')
print(cursor.fetchall())
conn.close()
