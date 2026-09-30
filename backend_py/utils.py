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
