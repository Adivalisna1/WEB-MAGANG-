from db import connection_pool
conn = connection_pool.get_connection()
cursor = conn.cursor(dictionary=True)
cursor.execute('SELECT id, uraian FROM audit_akuntansi ORDER BY id DESC LIMIT 5')
print(cursor.fetchall())
conn.close()
