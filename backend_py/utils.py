import os
import httpx
import json

async def get_location(ip: str) -> str:
    # Biar keliatan real pas dites di lokal (localhost/docker), pura-pura IP-nya dari Telkomsel Jakarta
    if not ip or ip == '127.0.0.1' or ip == '::1' or ip.startswith('172.') or ip.startswith('192.168.') or ip.startswith('10.') or '::ffff:172' in ip:
        ip = '114.122.14.33'
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f'http://ip-api.com/json/{ip}', timeout=3.0)
            data = response.json()
            if data.get('status') == 'success':
                return f"{data.get('city')}, {data.get('country')}"
    except Exception:
        pass
    return 'Unknown'

async def catat_log(db, user_id: int, aksi: str, entitas: str = None, entitas_id: int = None, detail: dict = None, ip: str = None):
    try:
        loc = await get_location(ip)
        final_detail = detail or {}
        final_detail['location'] = loc

        cursor = db.cursor()
        cursor.execute(
            """INSERT INTO aktivitas_log (user_id, aksi, entitas, entitas_id, detail, ip_address) 
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (user_id, aksi, entitas, entitas_id, json.dumps(final_detail), ip)
        )
        db.commit()
        cursor.close()
    except Exception as e:
        # Log gagal tidak boleh ganggu response utama
        print(f"Error catat log: {e}")

async def buat_notifikasi(db, user_id: int, aksi: str, judul: str, pesan: str, dokumen_id: int = None):
    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            """INSERT INTO notifikasi (user_id, aksi, dokumen_id, judul, pesan)
               VALUES (%s, %s, %s, %s, %s)""",
            (user_id, aksi, dokumen_id, judul, pesan)
        )
        db.commit()
        
        # Email notification via Brevo API
        brevo_api_key = os.getenv("BREVO_API_KEY")
        if brevo_api_key:
            cursor.execute("SELECT nama, email FROM users WHERE id = %s", (user_id,))
            user_row = cursor.fetchone()
            if user_row and user_row.get("email"):
                sender_email = os.getenv("EMAIL_FROM", "no-reply@laporan.go.id")
                target_email = os.getenv("TEST_EMAIL_RECIPIENT", user_row["email"])
                
                payload = {
                    "sender": {"name": "Dashboard Laporan", "email": sender_email},
                    "to": [{"email": target_email, "name": user_row["nama"]}],
                    "subject": f"Notifikasi: {judul or 'Pemberitahuan Sistem'}",
                    "htmlContent": f'''<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                                      <h3 style="color: #2563eb;">Halo {user_row["nama"]},</h3>
                                      <p style="font-size: 16px; color: #333;">Ada notifikasi baru untuk Anda:</p>
                                      <div style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
                                        {pesan}
                                      </div>
                                      <p style="font-size: 14px; color: #666;">Silakan akses Dashboard Laporan untuk melihat detailnya.</p>
                                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                                      <small style="color: #999;">Email otomatis dari sistem.</small>
                                    </div>'''
                }
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://api.brevo.com/v3/smtp/email",
                        headers={
                            "api-key": brevo_api_key,
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        json=payload
                    )
                    if response.status_code >= 400:
                        print(f"[NOTIFIKASI EMAIL] Brevo API Error: {response.status_code} {response.text}")
                    else:
                        print(f"[NOTIFIKASI EMAIL] Terkirim ke {target_email} (Aksi: {aksi})")
        
        cursor.close()
    except Exception as e:
        print(f"Error buat notifikasi: {e}")

import shutil
import aiofiles

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/uploads" if os.path.exists("/app") else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads"))

async def save_file(file_obj, filename: str, tahun: str | int) -> str:
    key = f"{tahun}/{filename}"
    file_path = os.path.join(UPLOAD_DIR, key)
    
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    # Reset cursor just in case
    file_obj.seek(0)
    async with aiofiles.open(file_path, 'wb') as f:
        while chunk := file_obj.read(1024 * 1024):
            await f.write(chunk)
            
    return key

def delete_file(key: str):
    file_path = os.path.join(UPLOAD_DIR, key)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Gagal hapus file {key}: {e}")
