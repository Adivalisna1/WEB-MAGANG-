from fastapi import APIRouter, Depends, Query, HTTPException, Request
from typing import Optional
from db import get_db
from auth import get_current_user
import bcrypt
from utils import catat_log

router = APIRouter()

@router.get("/profile")
async def get_profile(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT u.id, u.nama, u.username, u.email, u.foto_profil,
                   u.last_login, u.created_at, r.nama AS role
            FROM users u JOIN roles r ON r.id = u.role_id
            WHERE u.id = %s
        """, (current_user["id"],))
        return {"success": True, "data": cursor.fetchone()}

@router.patch("/profile")
async def update_profile(
    body: dict,
    request: Request,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    nama = body.get("nama")
    email = body.get("email")
    
    with db.cursor(dictionary=True) as cursor:
        if email:
            cursor.execute("SELECT id FROM users WHERE email = %s AND id != %s", (email, current_user["id"]))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Email sudah digunakan akun lain")
                
        cursor.execute("""
            UPDATE users SET
             nama  = COALESCE(%s, nama),
             email = COALESCE(%s, email)
            WHERE id = %s
        """, (nama or None, email or None, current_user["id"]))
        
        ip_addr = request.client.host if request.client else "127.0.0.1"
        cursor.execute("""
            INSERT INTO aktivitas_log (user_id, aksi, entitas, ip_address)
            VALUES (%s, %s, %s, %s)
        """, (current_user["id"], "edit_profil", "user", ip_addr))
        
        db.commit()
        return {"success": True, "message": "Profil berhasil diupdate"}

@router.patch("/password")
async def change_password(
    body: dict,
    request: Request,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    password_lama = body.get("password_lama")
    password_baru = body.get("password_baru")
    
    if not password_lama:
        raise HTTPException(status_code=400, detail="Password lama wajib diisi")
    if not password_baru or len(password_baru) < 6:
        raise HTTPException(status_code=400, detail="Password baru minimal 6 karakter")
        
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT password_hash FROM users WHERE id = %s", (current_user["id"],))
        user_row = cursor.fetchone()
        
        if not user_row or not bcrypt.checkpw(password_lama.encode('utf-8'), user_row["password_hash"].encode('utf-8')):
            raise HTTPException(status_code=400, detail="Password lama tidak sesuai")
            
        hashed_pw = bcrypt.hashpw(password_baru.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s", (hashed_pw, current_user["id"]))
        
        cursor.execute("UPDATE user_sessions SET is_online = 0, logout_at = NOW() WHERE user_id = %s", (current_user["id"],))
        
        ip_addr = request.client.host if request.client else "127.0.0.1"
        cursor.execute("""
            INSERT INTO aktivitas_log (user_id, aksi, entitas, ip_address)
            VALUES (%s, %s, %s, %s)
        """, (current_user["id"], "ganti_password", "user", ip_addr))
        
        db.commit()
        return {"success": True, "message": "Password berhasil diubah, silakan login ulang"}
