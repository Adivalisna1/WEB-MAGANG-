from fastapi import APIRouter, Depends, Query, Request, HTTPException
from typing import Optional, List, Dict
from db import get_db
from auth import get_current_user
import bcrypt
import math
import json
import psutil
import re

router = APIRouter()

def verify_admin_it(current_user: dict = Depends(get_current_user)):
    is_admin = (
        current_user.get("is_it") or
        current_user.get("role") in ["it", "admin_it"] or
        current_user.get("role_id") in [3, 4] or
        current_user.get("username") in ["it_admin", "naufal"]
    )
    if not is_admin:
        raise HTTPException(status_code=403, detail="Akses ditolak. Anda bukan Admin IT.")
    return current_user

@router.get("/roles")
async def get_roles(db=Depends(get_db), current_user: dict = Depends(verify_admin_it)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id, nama, deskripsi FROM roles ORDER BY id ASC")
        return {"success": True, "data": cursor.fetchall()}

@router.get("/tingkats")
async def get_tingkats(db=Depends(get_db), current_user: dict = Depends(verify_admin_it)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id, kode, nama, deskripsi FROM tingkats ORDER BY id ASC")
        return {"success": True, "data": cursor.fetchall()}

@router.get("/satkers")
async def get_satkers(db=Depends(get_db), current_user: dict = Depends(verify_admin_it)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id, NO_Satker, nama, eselon_1_id FROM satkers ORDER BY nama ASC")
        return {"success": True, "data": cursor.fetchall()}

@router.get("/unit-eselon-1")
async def get_unit_eselon_1(db=Depends(get_db), current_user: dict = Depends(verify_admin_it)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id, kode, nama, singkatan FROM unit_eselon_1 ORDER BY id ASC")
        return {"success": True, "data": cursor.fetchall()}

@router.get("/stats")
async def get_stats(db=Depends(get_db), current_user: dict = Depends(verify_admin_it)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT COUNT(*) AS totalUsers FROM users")
        total_users = cursor.fetchone()["totalUsers"]
        
        cursor.execute("SELECT COUNT(*) AS totalDokumen FROM dokumen")
        total_dokumen = cursor.fetchone()["totalDokumen"]
        
        cursor.execute("SELECT COUNT(*) AS totalKategori FROM kategori_dokumen")
        total_kategori = cursor.fetchone()["totalKategori"]
        
        cursor.execute("SELECT COUNT(*) AS onlineNow FROM user_sessions WHERE is_online = 1")
        online_now = cursor.fetchone()["onlineNow"]
        
        # System Metrics (psutil is cross-platform)
        cpu_usage = psutil.cpu_percent(interval=None)
        memory = psutil.virtual_memory()
        memory_usage = memory.percent
        
        try:
            cursor.execute("SELECT SUM(data_length + index_length) / 1024 / 1024 AS db_size_mb FROM information_schema.tables WHERE table_schema = DATABASE()")
            db_res = cursor.fetchone()
            db_size_mb = db_res["db_size_mb"] if db_res and db_res["db_size_mb"] else 0
            db_storage = min((float(db_size_mb) / 1000) * 100, 100) or 1
        except Exception:
            db_storage = 1
            
        failed_logins = 0
        try:
            cursor.execute("SELECT COUNT(*) AS count FROM login_attempts WHERE status = 'failed' AND created_at >= NOW() - INTERVAL 1 DAY")
            failed_logins = cursor.fetchone()["count"]
        except Exception:
            pass
            
        return {
            "success": True,
            "data": {
                "totalUsers": total_users,
                "totalDokumen": total_dokumen,
                "totalKategori": total_kategori,
                "onlineNow": online_now,
                "cpuUsage": int(cpu_usage),
                "memoryUsage": int(memory_usage),
                "dbStorage": int(db_storage),
                "failedLogins": failed_logins
            }
        }

@router.get("/users")
async def get_users(db=Depends(get_db), current_user: dict = Depends(verify_admin_it)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT u.id, u.nama, u.username, u.email, u.is_active, u.permissions,
                   u.role_id, u.tingkat_id, u.satker_id, u.eselon_1_id,
                   u.last_login, u.created_at, 
                   r.nama AS role, 
                   t.kode AS tingkat, t.nama AS tingkat_nama,
                   sk.nama AS satker, sk.NO_Satker,
                   ue.nama AS eselon_1_nama, ue.singkatan AS eselon_1_singkatan,
                   (SELECT is_online FROM user_sessions s
                    WHERE s.user_id = u.id AND s.is_online = 1
                    ORDER BY s.last_active_at DESC LIMIT 1) AS is_online
            FROM users u
            JOIN roles r ON r.id = u.role_id
            JOIN tingkats t ON t.id = u.tingkat_id
            LEFT JOIN satkers sk ON sk.id = u.satker_id
            LEFT JOIN unit_eselon_1 ue ON ue.id = COALESCE(u.eselon_1_id, sk.eselon_1_id)
            ORDER BY u.created_at DESC
        """)
        return {"success": True, "data": cursor.fetchall()}

@router.post("/users")
async def create_user(
    request: Request,
    body: dict,
    db=Depends(get_db),
    current_user: dict = Depends(verify_admin_it)
):
    role_id = body.get("role_id")
    tingkat_id = body.get("tingkat_id")
    nama = body.get("nama")
    username = body.get("username")
    email = body.get("email")
    password = body.get("password")
    permissions = body.get("permissions")
    satker_id = body.get("satker_id") or None
    eselon_1_id = body.get("eselon_1_id") or None
    
    password_hash = bcrypt.hashpw(str(password).encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    perms_json = json.dumps(permissions) if permissions else None
    
    try:
        with db.cursor(dictionary=True) as cursor:
            # Auto-resolve eselon_1_id & tingkat_id dari satker
            if satker_id and not eselon_1_id:
                cursor.execute("SELECT eselon_1_id FROM satkers WHERE id = %s", (satker_id,))
                s_row = cursor.fetchone()
                if s_row and s_row["eselon_1_id"]:
                    eselon_1_id = s_row["eselon_1_id"]
                    
            if not tingkat_id:
                tingkat_id = 1 if satker_id else (2 if eselon_1_id else 3)
                
            cursor.execute("""
                INSERT INTO users (role_id, tingkat_id, nama, username, email, password_hash, permissions, satker_id, eselon_1_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (role_id, tingkat_id, nama, username, email, password_hash, perms_json, satker_id, eselon_1_id))
            insert_id = cursor.lastrowid
            
            ip_addr = request.client.host if request.client else "127.0.0.1"
            cursor.execute("""
                INSERT INTO aktivitas_log (user_id, aksi, entitas, entitas_id, detail, ip_address)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (current_user["id"], "buat_user", "user", insert_id, json.dumps({"username": username, "role_id": role_id, "tingkat_id": tingkat_id}), ip_addr))
            db.commit()
            
        return {"success": True, "message": "User berhasil dibuat"}
    except Exception as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(status_code=400, detail="Username atau email sudah digunakan")
        raise e

@router.post("/users/bulk")
async def create_bulk_users(
    request: Request,
    body: dict,
    db=Depends(get_db),
    current_user: dict = Depends(verify_admin_it)
):
    users = body.get("users", [])
    if not isinstance(users, list) or len(users) == 0:
        raise HTTPException(status_code=400, detail="Invalid data format or empty list")
        
    success_count = 0
    failed_count = 0
    
    db.autocommit = False
    try:
        with db.cursor(dictionary=True) as cursor:
            for user in users:
                try:
                    role_id = user.get("role_id")
                    nama = user.get("nama")
                    username = user.get("username")
                    email = user.get("email")
                    password = user.get("password")
                    kode_satker = user.get("kode_satker")
                    
                    if not all([role_id, nama, username, email, password]):
                        failed_count += 1
                        continue
                        
                    satker_id = None
                    eselon_1_id = None
                    tingkat_id = user.get("tingkat_id") or 1
                    
                    if kode_satker:
                        cursor.execute("SELECT id, eselon_1_id FROM satkers WHERE NO_Satker = %s", (str(kode_satker).strip(),))
                        satker_row = cursor.fetchone()
                        if satker_row:
                            satker_id = satker_row["id"]
                            eselon_1_id = satker_row["eselon_1_id"]
                        else:
                            failed_count += 1
                            continue
                            
                    password_hash = bcrypt.hashpw(str(password).encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    cursor.execute("""
                        INSERT INTO users (role_id, tingkat_id, satker_id, eselon_1_id, nama, username, email, password_hash, permissions)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (role_id, tingkat_id, satker_id, eselon_1_id, nama, username, email, password_hash, None))
                    success_count += 1
                except Exception as e:
                    failed_count += 1
                    
            ip_addr = request.client.host if request.client else "127.0.0.1"
            cursor.execute("""
                INSERT INTO aktivitas_log (user_id, aksi, entitas, detail, ip_address)
                VALUES (%s, %s, %s, %s, %s)
            """, (current_user["id"], "buat_user_bulk", "user", json.dumps({"sukses": success_count, "gagal": failed_count}), ip_addr))
            
        db.commit()
        return {
            "success": True, 
            "message": f"Bulk insert selesai. Berhasil: {success_count}, Gagal/Duplikat: {failed_count}",
            "data": {"successCount": success_count, "failedCount": failed_count}
        }
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.autocommit = True

@router.patch("/users/{user_id}")
async def update_user(
    user_id: int,
    request: Request,
    body: dict,
    db=Depends(get_db),
    current_user: dict = Depends(verify_admin_it)
):
    role_id = body.get("role_id")
    tingkat_id = body.get("tingkat_id")
    nama = body.get("nama")
    username = body.get("username")
    email = body.get("email")
    permissions = body.get("permissions")
    satker_id = body.get("satker_id") or None
    eselon_1_id = body.get("eselon_1_id") or None
    
    perms_json = json.dumps(permissions) if permissions else None
    
    try:
        with db.cursor(dictionary=True) as cursor:
            # Check existing user
            cursor.execute("SELECT tingkat_id, eselon_1_id, satker_id FROM users WHERE id = %s", (user_id,))
            current_row = cursor.fetchone()
            
            final_satker_id = satker_id if "satker_id" in body else (current_row.get("satker_id") if current_row else None)
            
            # Auto-resolve eselon_1_id jika satker diubah/ada
            if final_satker_id and not eselon_1_id:
                cursor.execute("SELECT eselon_1_id FROM satkers WHERE id = %s", (final_satker_id,))
                s_row = cursor.fetchone()
                if s_row and s_row["eselon_1_id"]:
                    eselon_1_id = s_row["eselon_1_id"]
                    
            final_tingkat_id = tingkat_id if tingkat_id is not None else (current_row["tingkat_id"] if current_row else (1 if final_satker_id else 3))
            final_eselon_1_id = eselon_1_id if eselon_1_id is not None else (current_row.get("eselon_1_id") if current_row else None)

            cursor.execute("""
                UPDATE users
                SET role_id=%s, tingkat_id=%s, eselon_1_id=%s, nama=%s, username=%s, email=%s, permissions=%s, satker_id=%s
                WHERE id=%s
            """, (role_id, final_tingkat_id, final_eselon_1_id, nama, username, email, perms_json, final_satker_id, user_id))

            
            ip_addr = request.client.host if request.client else "127.0.0.1"
            cursor.execute("""
                INSERT INTO aktivitas_log (user_id, aksi, entitas, entitas_id, detail, ip_address)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (current_user["id"], "update_user", "user", user_id, json.dumps({"username": username, "role_id": role_id, "permissions": permissions}), ip_addr))
            db.commit()
            
        return {"success": True, "message": "User berhasil diupdate"}
    except Exception as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(status_code=400, detail="Username atau email sudah digunakan")
        raise e

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    request: Request,
    db=Depends(get_db),
    current_user: dict = Depends(verify_admin_it)
):
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Tidak bisa menghapus akun sendiri")
        
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        
        ip_addr = request.client.host if request.client else "127.0.0.1"
        cursor.execute("""
            INSERT INTO aktivitas_log (user_id, aksi, entitas, entitas_id, ip_address)
            VALUES (%s, %s, %s, %s, %s)
        """, (current_user["id"], "hapus_user", "user", user_id, ip_addr))
        db.commit()
        
    return {"success": True, "message": "User berhasil dihapus"}

@router.post("/users/{user_id}/reset-password")
async def force_reset_password(
    user_id: int,
    request: Request,
    body: dict,
    db=Depends(get_db),
    current_user: dict = Depends(verify_admin_it)
):
    new_password = body.get("new_password")
    if not new_password:
        raise HTTPException(status_code=400, detail="Password baru wajib diisi")
        
    password_hash = bcrypt.hashpw(str(new_password).encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("UPDATE users SET password_hash = %s, password_reset_at = NOW() WHERE id = %s", (password_hash, user_id))
        
        ip_addr = request.client.host if request.client else "127.0.0.1"
        cursor.execute("""
            INSERT INTO aktivitas_log (user_id, aksi, entitas, entitas_id, ip_address)
            VALUES (%s, %s, %s, %s, %s)
        """, (current_user["id"], "reset_password_manual", "user", user_id, ip_addr))
        db.commit()
        
    return {"success": True, "message": "Password berhasil diubah"}

@router.get("/kategori")
async def get_kategori(db=Depends(get_db), current_user: dict = Depends(verify_admin_it)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM kategori_dokumen ORDER BY nama ASC")
        return {"success": True, "data": cursor.fetchall()}

@router.post("/kategori")
async def create_kategori(body: dict, db=Depends(get_db), current_user: dict = Depends(verify_admin_it)):
    nama = body.get("nama")
    if not nama:
        raise HTTPException(status_code=400, detail="Nama kategori wajib diisi")
    slug = body.get("slug") or re.sub(r'[^a-zA-Z0-9]+', '-', nama.lower()).strip('-')
    perlu_nom = 1 if body.get("perlu_nominal") else 0
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("INSERT INTO kategori_dokumen (nama, slug, deskripsi, perlu_nominal) VALUES (%s, %s, %s, %s)", 
                      (nama, slug, body.get("deskripsi"), perlu_nom))
        db.commit()
    return {"success": True, "message": "Kategori dibuat"}

@router.put("/kategori/{kat_id}")
async def update_kategori(kat_id: int, body: dict, db=Depends(get_db), current_user: dict = Depends(verify_admin_it)):
    nama = body.get("nama")
    slug = body.get("slug") or (re.sub(r'[^a-zA-Z0-9]+', '-', nama.lower()).strip('-') if nama else None)
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("UPDATE kategori_dokumen SET nama=COALESCE(%s, nama), slug=COALESCE(%s, slug), deskripsi=COALESCE(%s, deskripsi) WHERE id=%s", 
                      (nama, slug, body.get("deskripsi"), kat_id))
        db.commit()
    return {"success": True, "message": "Kategori diupdate"}

@router.delete("/kategori/{kat_id}")
async def delete_kategori(kat_id: int, db=Depends(get_db), current_user: dict = Depends(verify_admin_it)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("DELETE FROM kategori_dokumen WHERE id=%s", (kat_id,))
        db.commit()
    return {"success": True, "message": "Kategori dihapus"}

@router.get("/logs")
async def get_logs(
    page: int = 1,
    limit: int = 50,
    satker_id: Optional[int] = None,
    db=Depends(get_db),
    current_user: dict = Depends(verify_admin_it)
):
    offset = (page - 1) * limit
    where_clause = "1=1"
    params = []
    
    if satker_id:
        where_clause += " AND u.satker_id = %s"
        params.append(satker_id)
        
    query = (
        "SELECT l.id, l.aksi, l.entitas, l.entitas_id, l.detail, l.ip_address AS ip, l.created_at, u.nama AS user_nama, u.username, u.satker_id "
        "FROM aktivitas_log l "
        "LEFT JOIN users u ON u.id = l.user_id "
        "WHERE " + where_clause
    )
    
    if not satker_id:
        query += """
            UNION ALL
            SELECT id, 'login_failed' AS aksi, 'system' AS entitas, NULL AS entitas_id, 
                   JSON_OBJECT('username_tried', username_tried, 'location', COALESCE(location, 'Unknown')) AS detail, ip_address AS ip, created_at, 'System' AS user_nama, username_tried AS username, NULL AS satker_id
            FROM login_attempts
            WHERE status = 'failed'
        """
        
    count_query = "SELECT COUNT(*) AS total FROM aktivitas_log l LEFT JOIN users u ON u.id = l.user_id WHERE " + where_clause
    if not satker_id:
        count_query = (
            "SELECT ( "
            "  (SELECT COUNT(*) FROM aktivitas_log l LEFT JOIN users u ON u.id = l.user_id WHERE " + where_clause + ") + "
            "  (SELECT COUNT(*) FROM login_attempts WHERE status = 'failed') "
            ") AS total"
        )
        
    with db.cursor(dictionary=True) as cursor:
        cursor.execute(count_query, tuple(params))
        total_res = cursor.fetchone()
        total = total_res["total"] if total_res else 0
        
        query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        
        return {
            "success": True, 
            "data": rows,
            "meta": {
                "total": int(total),
                "page": page,
                "limit": limit,
                "totalPages": math.ceil(int(total) / limit) if limit > 0 else 0
            }
        }
