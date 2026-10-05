from db import get_db

db = next(get_db())
cursor = db.cursor(dictionary=True)
cursor.execute('SELECT id, judul, file_path, file_nama, status FROM dokumen WHERE status="menunggu_verifikasi" LIMIT 5')
for row in cursor.fetchall():
    print(row)
