from fastapi import APIRouter, Depends, Query, Request, HTTPException
from typing import Optional
from db import get_db
from auth import get_current_user
import bcrypt
import math

router = APIRouter()

# Middleware-like dependency to ensure user is pimpinan
def verify_pimpinan(current_user: dict = Depends(get_current_user)):
    if current_user.get("role_id") != 1:
        raise HTTPException(status_code=403, detail="Akses ditolak. Anda bukan Pimpinan.")
    return current_user

@router.get("/users")
async def get_users(
    current_user: dict = Depends(verify_pimpinan),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT u.id, u.nama, u.username, u.email, u.is_active,
                   u.last_login, u.created_at, r.nama AS role,
                   (SELECT is_online FROM user_sessions s
                    WHERE s.user_id = u.id AND s.is_online = 1
                    ORDER BY s.last_active_at DESC LIMIT 1) AS is_online
            FROM users u
            JOIN roles r ON r.id = u.role_id
            WHERE u.role_id NOT IN (3, 4) AND u.satker_id = %s
            ORDER BY u.created_at DESC
        """, (current_user.get("satker_id"),))
        rows = cursor.fetchall()
        return {"success": True, "data": rows}

@router.get("/users/online")
async def get_online_users(
    current_user: dict = Depends(verify_pimpinan),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        # Cleanup inactive sessions
        cursor.execute("""
            UPDATE user_sessions 
            SET is_online = 0, logout_at = NOW()
            WHERE is_online = 1 
              AND last_active_at < NOW() - INTERVAL 15 MINUTE
        """)
        db.commit()
        
        cursor.execute("""
            SELECT u.id, u.nama, u.username, r.nama AS role,
                   s.ip_address, s.last_active_at, s.login_at
            FROM user_sessions s
            JOIN users u ON u.id = s.user_id
            JOIN roles r ON r.id = u.role_id
            WHERE s.is_online = 1 AND u.role_id NOT IN (3, 4) AND u.satker_id = %s
            ORDER BY s.last_active_at DESC
        """, (current_user.get("satker_id"),))
        rows = cursor.fetchall()
        return {"success": True, "data": rows}

@router.patch("/users/{user_id}/toggle")
async def toggle_user_active(
    user_id: int,
    request: Request,
    current_user: dict = Depends(verify_pimpinan),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id, role_id, is_active, satker_id FROM users WHERE id = %s", (user_id,))
        user_row = cursor.fetchone()
        
        if not user_row:
            return {"success": False, "message": "User tidak ditemukan"}
            
        if user_id == current_user.get("id"):
            return {"success": False, "message": "Tidak bisa menonaktifkan akun sendiri"}
            
        if user_row["role_id"] != 2 or user_row["satker_id"] != current_user.get("satker_id"):
            return {"success": False, "message": "Akses ditolak. Anda hanya dapat mengelola akun Staff (Satker) di divisi Anda sendiri."}
            
        new_status = 0 if user_row["is_active"] else 1
        cursor.execute("UPDATE users SET is_active = %s WHERE id = %s", (new_status, user_id))
        
        # Log activity
        ip_addr = request.client.host if request.client else "127.0.0.1"
        cursor.execute("""
            INSERT INTO aktivitas_log (user_id, aksi, entitas, entitas_id, detail, ip_address)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            current_user.get("id"),
            'aktifkan_user' if new_status else 'nonaktifkan_user',
            'user',
            user_id,
            f'{{"is_active": {new_status}}}',
            ip_addr
        ))
        
        return {
            "success": True,
            "message": "User diaktifkan" if new_status else "User dinonaktifkan",
            "data": {"id": user_id, "is_active": new_status}
        }

@router.patch("/users/{user_id}/password")
async def reset_user_password(
    user_id: int,
    request: Request,
    body: dict,
    current_user: dict = Depends(verify_pimpinan),
    db=Depends(get_db)
):
    password_baru = body.get("password_baru")
    if not password_baru or len(password_baru) < 6:
        return {"success": False, "message": "Password baru minimal 6 karakter"}
        
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id, nama, username, role_id, satker_id FROM users WHERE id = %s", (user_id,))
        user_row = cursor.fetchone()
        
        if not user_row:
            return {"success": False, "message": "User tidak ditemukan"}
            
        if user_row["role_id"] != 2 or user_row["satker_id"] != current_user.get("satker_id"):
            return {"success": False, "message": "Akses ditolak. Anda hanya dapat mereset password akun Staff di divisi Anda sendiri."}
            
        if user_id == current_user.get("id"):
            return {"success": False, "message": "Gunakan fitur ganti password untuk akun sendiri"}
            
        hashed_pw = bcrypt.hashpw(password_baru.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor.execute("UPDATE users SET password_hash = %s, password_reset_at = NOW() WHERE id = %s", (hashed_pw, user_id))
        
        cursor.execute("UPDATE user_sessions SET is_online = 0, logout_at = NOW() WHERE user_id = %s", (user_id,))
        
        ip_addr = request.client.host if request.client else "127.0.0.1"
        cursor.execute("""
            INSERT INTO aktivitas_log (user_id, aksi, entitas, entitas_id, detail, ip_address)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            current_user.get("id"),
            'reset_password_user',
            'user',
            user_id,
            f'{{"target_nama": "{user_row["nama"]}", "target_username": "{user_row["username"]}"}}',
            ip_addr
        ))
        
        return {"success": True, "message": f"Password {user_row['nama']} berhasil direset"}

@router.get("/logs")
async def get_logs(
    user_id: Optional[int] = None,
    aksi: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    current_user: dict = Depends(verify_pimpinan),
    db=Depends(get_db)
):
    offset = (page - 1) * limit
    with db.cursor(dictionary=True) as cursor:
        where_clause = "u.satker_id = %s AND u.role_id = 2"
        params = [current_user.get("satker_id")]
        
        if user_id:
            where_clause += " AND l.user_id = %s"
            params.append(user_id)
        if aksi:
            where_clause += " AND l.aksi = %s"
            params.append(aksi)
            
        cursor.execute(f"""
            SELECT l.id, l.aksi, l.entitas, l.entitas_id, l.detail,
                   l.ip_address, l.created_at, u.nama AS user_nama, u.username
            FROM aktivitas_log l
            LEFT JOIN users u ON u.id = l.user_id
            WHERE {where_clause}
            ORDER BY l.created_at DESC
            LIMIT %s OFFSET %s
        """, tuple(params + [limit, offset]))
        rows = cursor.fetchall()
        
        cursor.execute(f"SELECT COUNT(*) AS total FROM aktivitas_log l LEFT JOIN users u ON u.id = l.user_id WHERE {where_clause}", tuple(params))
        total = cursor.fetchone()["total"]
        
        return {
            "success": True,
            "data": rows,
            "meta": {
                "total": total,
                "page": page,
                "limit": limit,
                "totalPages": math.ceil(total / limit) if limit > 0 else 0
            }
        }

@router.delete("/logs")
async def clear_logs(
    before_days: Optional[int] = 30,
    current_user: dict = Depends(verify_pimpinan),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        if before_days == 0:
            cursor.execute("DELETE FROM aktivitas_log")
        else:
            cursor.execute("DELETE FROM aktivitas_log WHERE created_at < NOW() - INTERVAL %s DAY", (before_days,))
            
        cursor.execute("SELECT COUNT(*) AS total FROM aktivitas_log")
        total = cursor.fetchone()["total"]
        
        return {"success": True, "message": "Riwayat berhasil dihapus", "data": {"remaining": total}}

@router.get("/stats")
async def get_stats(
    current_user: dict = Depends(verify_pimpinan),
    db=Depends(get_db)
):
    sid = current_user.get("satker_id")
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            UPDATE user_sessions
            SET is_online = 0, logout_at = NOW()
            WHERE is_online = 1
              AND last_active_at < NOW() - INTERVAL 15 MINUTE
        """)
        db.commit()
        
        cursor.execute("SELECT COUNT(*) AS total FROM dokumen d JOIN users u ON u.id = d.uploaded_by WHERE u.satker_id = %s", (sid,))
        total_dokumen = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) AS total FROM dokumen d JOIN users u ON u.id = d.uploaded_by WHERE status = 'terverifikasi' AND u.satker_id = %s", (sid,))
        terverifikasi = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) AS total FROM dokumen d JOIN users u ON u.id = d.uploaded_by WHERE status = 'menunggu_verifikasi' AND u.satker_id = %s", (sid,))
        menunggu = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) AS total FROM dokumen d JOIN users u ON u.id = d.uploaded_by WHERE status = 'lolos_admin' AND u.satker_id = %s", (sid,))
        lolos_admin = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) AS total FROM dokumen d JOIN users u ON u.id = d.uploaded_by WHERE status = 'revisi' AND u.satker_id = %s", (sid,))
        revisi = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) AS total FROM users WHERE role_id = 2 AND satker_id = %s", (sid,))
        total_user = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COALESCE(SUM(download_count), 0) AS total FROM dokumen d JOIN users u ON u.id = d.uploaded_by WHERE u.satker_id = %s", (sid,))
        total_download = float(cursor.fetchone()["total"])
        
        cursor.execute("SELECT COUNT(s.id) AS total FROM user_sessions s JOIN users u ON u.id = s.user_id WHERE s.is_online = 1 AND u.satker_id = %s", (sid,))
        online_now = cursor.fetchone()["total"]
        
        return {
            "success": True,
            "data": {
                "totalDokumen": total_dokumen,
                "terverifikasi": terverifikasi,
                "menunggu": menunggu,
                "lolosAdmin": lolos_admin,
                "revisi": revisi,
                "totalUser": total_user,
                "totalDownload": total_download,
                "onlineNow": online_now
            }
        }
