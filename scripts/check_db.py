import mysql.connector

try:
    conn = mysql.connector.connect(host='localhost', user='root', password='', database='db_web_magang')
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT id, judul, file_path, file_nama, status FROM dokumen WHERE status="menunggu_verifikasi" LIMIT 5')
    for row in cursor.fetchall():
        print(row)
except Exception as e:
    print("Error:", e)
