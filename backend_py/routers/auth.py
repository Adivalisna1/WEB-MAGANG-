from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
from db import get_db
import bcrypt as bcrypt_lib
import jwt
import os
import secrets
import httpx
from datetime import datetime, timedelta
from utils import get_location, catat_log
from auth import get_current_user

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)

JWT_SECRET = os.getenv("JWT_SECRET")

class LoginRequest(BaseModel):
    username: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    newPassword: str

@router.post("/login")
async def login(req: Request, data: LoginRequest, db = Depends(get_db)):
    if not data.username or not data.password:
        raise HTTPException(status_code=400, detail="Username dan password wajib diisi")
    
    ip = req.client.host if req.client else "127.0.0.1"
    cursor = db.cursor(dictionary=True)

    # Hitung streak percobaan gagal beruntun dalam 30 menit terakhir (sejak login sukses terakhir)
    def _get_failed_streak() -> tuple[int, int]:
        try:
            cursor.execute("""
                SELECT status, TIMESTAMPDIFF(SECOND, created_at, NOW()) AS age_sec
                FROM login_attempts
                WHERE (username_tried = %s OR ip_address = %s)
                  AND created_at >= NOW() - INTERVAL 30 MINUTE
                ORDER BY id DESC
                LIMIT 25
            """, (data.username, ip))
            attempt_rows = cursor.fetchall() or []
            streak = 0
            latest_age = 999999
            for idx, r in enumerate(attempt_rows):
                if r.get("status") == "success":
                    break
                if r.get("status") == "failed":
                    if idx == 0:
                        latest_age = max(0, int(r.get("age_sec") or 0))
                    streak += 1
            # Jika jeda ban 15 menit (setelah >=10x gagal) sudah lewat, reset siklus streak
            if streak >= 10 and latest_age >= 900:
                return 0, 999999
            return streak, latest_age
        except Exception:
            return 0, 999999

    failed_streak, age_sec = _get_failed_streak()

    # Tahap 2: >= 10 kali gagal -> Ban 15 menit (900 detik) + Pop-up hubungi IT
    if failed_streak >= 10 and age_sec < 900:
        rem = max(1, 900 - age_sec)
        return JSONResponse(
            status_code=429,
            content={
                "success": False,
                "detail": "Akses login Anda diblokir selama 15 menit karena telah 10 kali gagal login. Silakan hubungi pihak IT Administrator.",
                "lock_level": 2,
                "failed_attempts": failed_streak,
                "retry_after_seconds": rem,
                "contact_it": True,
            },
        )

    # Tahap 1: Tepat 5 kali gagal -> Jeda tunggu 5 menit (300 detik)
    if failed_streak == 5 and age_sec < 300:
        rem = max(1, 300 - age_sec)
        return JSONResponse(
            status_code=429,
            content={
                "success": False,
                "detail": "Anda telah 5 kali salah memasukkan akun/password. Silakan tunggu 5 menit sebelum mencoba kembali.",
                "lock_level": 1,
                "failed_attempts": failed_streak,
                "retry_after_seconds": rem,
                "contact_it": False,
            },
        )
    
    cursor.execute("""
        SELECT u.id, u.role_id, u.tingkat_id, u.satker_id, u.eselon_1_id, u.nama, u.username, u.email,
               u.password_hash, u.is_active, u.permissions, u.foto_profil,
               COALESCE(r.nama, 'operator') AS role,
               COALESCE(t.kode, 'satker') AS tingkat, COALESCE(t.nama, 'Tingkat Satker') AS tingkat_nama,
               s.nama AS satker_nama, s.NO_Satker AS satker_kode,
               ue.id AS unit_eselon_id, ue.kode AS eselon_1_kode, ue.nama AS eselon_1_nama, ue.singkatan AS eselon_1_singkatan
        FROM users u
        LEFT JOIN roles r ON r.id = u.role_id
        LEFT JOIN tingkats t ON t.id = u.tingkat_id
        LEFT JOIN satkers s ON s.id = u.satker_id
        LEFT JOIN unit_eselon_1 ue ON ue.id = COALESCE(u.eselon_1_id, s.eselon_1_id)
        WHERE u.username = %s OR u.email = %s
        LIMIT 1
    """, (data.username, data.username))
    
    user = cursor.fetchone()
    
    async def handle_failed_attempt():
        try:
            loc = await get_location(ip)
            cursor.execute(
                "INSERT INTO login_attempts (ip_address, username_tried, status, location) VALUES (%s, %s, %s, %s)",
                (ip, data.username, 'failed', loc)
            )
            db.commit()
        except Exception:
            pass
        new_streak = failed_streak + 1
        if new_streak >= 10:
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "detail": "Akses login Anda diblokir selama 15 menit karena telah 10 kali gagal login. Silakan hubungi pihak IT Administrator.",
                    "lock_level": 2,
                    "failed_attempts": new_streak,
                    "retry_after_seconds": 900,
                    "contact_it": True,
                },
            )
        if new_streak == 5:
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "detail": "Anda telah 5 kali salah memasukkan akun/password. Silakan tunggu 5 menit sebelum mencoba kembali.",
                    "lock_level": 1,
                    "failed_attempts": new_streak,
                    "retry_after_seconds": 300,
                    "contact_it": False,
                },
            )
        target_limit = 5 if new_streak < 5 else 10
        return JSONResponse(
            status_code=401,
            content={
                "success": False,
                "detail": f"Username atau password salah (Percobaan gagal ke-{new_streak} dari {target_limit})",
                "lock_level": 0,
                "failed_attempts": new_streak,
                "retry_after_seconds": 0,
            },
        )

    if not user:
        return await handle_failed_attempt()

    if not user['is_active']:
        raise HTTPException(status_code=403, detail="Akun tidak aktif, hubungi admin")
    
    # Check password
    if not bcrypt_lib.checkpw(data.password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return await handle_failed_attempt()
    
    # Success
    try:
        loc = await get_location(ip)
        cursor.execute(
            "INSERT INTO login_attempts (ip_address, username_tried, status, location) VALUES (%s, %s, %s, %s)",
            (ip, data.username, 'success', loc)
        )
    except Exception:
        pass
    
    # Close old sessions
    cursor.execute("UPDATE user_sessions SET is_online = 0, logout_at = NOW() WHERE user_id = %s AND is_online = 1", (user['id'],))
    
    session_id = secrets.token_hex(32)
    user_agent = req.headers.get('user-agent')
    
    cursor.execute(
        "INSERT INTO user_sessions (id, user_id, ip_address, user_agent, is_online) VALUES (%s, %s, %s, %s, 1)",
        (session_id, user['id'], ip, user_agent)
    )
    
    cursor.execute("UPDATE users SET last_login = NOW() WHERE id = %s", (user['id'],))
    db.commit()
    
    # Resolved Eselon 1 ID
    final_eselon_1_id = user.get('unit_eselon_id') or user.get('eselon_1_id')

    # Generate JWT
    token = jwt.encode(
        {
            "id": user['id'],
            "nama": user['nama'],
            "username": user['username'],
            "email": user['email'],
            "role_id": user['role_id'],
            "role": user['role'],
            "tingkat_id": user['tingkat_id'],
            "tingkat": user['tingkat'],
            "tingkat_nama": user['tingkat_nama'],
            "satker_id": user.get('satker_id'),
            "satker_nama": user.get('satker_nama'),
            "satker_kode": user.get('satker_kode'),
            "eselon_1_id": final_eselon_1_id,
            "eselon_1_kode": user.get('eselon_1_kode'),
            "eselon_1_nama": user.get('eselon_1_nama'),
            "eselon_1_singkatan": user.get('eselon_1_singkatan'),
            "sessionId": session_id,
            "permissions": user['permissions'],
            "exp": datetime.utcnow() + timedelta(hours=8)
        },
        JWT_SECRET,
        algorithm="HS256"
    )
    
    await catat_log(
        db, 
        user_id=user['id'], 
        aksi='login', 
        entitas='user', 
        entitas_id=user['id'], 
        detail={"username": user['username'], "role": user['role'], "tingkat": user['tingkat']}, 
        ip=ip
    )
    
    user_obj = {
        "id": user['id'],
        "nama": user['nama'],
        "username": user['username'],
        "email": user['email'],
        "role": user['role'],
        "role_id": user['role_id'],
        "tingkat": user['tingkat'],
        "tingkat_id": user['tingkat_id'],
        "tingkat_nama": user['tingkat_nama'],
        "satker_id": user.get('satker_id'),
        "satker_nama": user.get('satker_nama'),
        "satker_kode": user.get('satker_kode'),
        "eselon_1_id": final_eselon_1_id,
        "eselon_1_kode": user.get('eselon_1_kode'),
        "eselon_1_nama": user.get('eselon_1_nama'),
        "eselon_1_singkatan": user.get('eselon_1_singkatan'),
        "foto_profil": user.get('foto_profil'),
        "permissions": user['permissions']
    }

    return {
        "success": True,
        "message": "Login berhasil",
        "token": token,
        "user": user_obj,
        "data": {
            "token": token,
            "user": user_obj
        }
    }

@router.post("/logout")
async def logout(req: Request, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    cursor = db.cursor(dictionary=True)
    session_id = current_user.get('sessionId')
    if session_id:
        cursor.execute("UPDATE user_sessions SET is_online = 0, logout_at = NOW() WHERE id = %s", (session_id,))
    cursor.execute("UPDATE user_sessions SET is_online = 0, logout_at = NOW() WHERE user_id = %s", (current_user['id'],))
    db.commit()
    
    await catat_log(
        db,
        user_id=current_user['id'],
        aksi='logout',
        entitas='user',
        entitas_id=current_user['id'],
        ip=req.client.host
    )
    return {"success": True, "message": "Logout berhasil"}

@router.get("/me")
def me(db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT u.id, u.role_id, u.tingkat_id, u.satker_id, u.eselon_1_id, u.nama, u.username, u.email, u.is_active, u.permissions,
               r.nama AS role,
               t.kode AS tingkat, t.nama AS tingkat_nama,
               s.nama AS satker_nama, s.NO_Satker AS satker_kode,
               ue.id AS unit_eselon_id, ue.kode AS eselon_1_kode, ue.nama AS eselon_1_nama, ue.singkatan AS eselon_1_singkatan
        FROM users u 
        JOIN roles r ON r.id = u.role_id 
        JOIN tingkats t ON t.id = u.tingkat_id
        LEFT JOIN satkers s ON s.id = u.satker_id
        LEFT JOIN unit_eselon_1 ue ON ue.id = COALESCE(u.eselon_1_id, s.eselon_1_id)
        WHERE u.id = %s
    """, (current_user['id'],))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    final_eselon_1_id = user.get('unit_eselon_id') or user.get('eselon_1_id')
    user['eselon_1_id'] = final_eselon_1_id
    
    return {"success": True, "data": user}

@router.post("/forgot-password")
async def forgot_password(req: Request, data: ForgotPasswordRequest, db = Depends(get_db)):
    generic_msg = {
        "success": True,
        "message": "Jika email terdaftar di sistem, tautan reset password telah dikirimkan ke email Anda."
    }
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, nama, email FROM users WHERE email = %s LIMIT 1", (data.email,))
    user = cursor.fetchone()
    if not user:
        return generic_msg
    
    reset_token = secrets.token_hex(32)
    cursor.execute(
        "UPDATE users SET reset_password_token = %s, reset_password_expires_at = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = %s",
        (reset_token, user['id'])
    )
    db.commit()
    
    cors_origin = os.getenv("FRONTEND_URL") or os.getenv("CORS_ORIGIN", "http://localhost:3000")
    trusted_origin = (cors_origin.split(",")[0].strip() if cors_origin else "http://localhost:3000").rstrip("/")
    reset_url = f"{trusted_origin}/reset-password?token={reset_token}"
    sender_email = os.getenv("EMAIL_FROM", "no-reply@laporan.go.id")
    brevo_api_key = os.getenv("BREVO_API_KEY")
    is_prod = os.getenv("APP_ENV") == "production"
    
    if not brevo_api_key:
        if not is_prod:
            print(f"\n[DEV MODE] Password reset token generated for {user['email']}: {reset_url}\n")
        return generic_msg
    
    import html as _html
    safe_nama = _html.escape(str(user['nama'] or ''))
    payload = {
      "sender": {"name": "Admin Dashboard Laporan", "email": sender_email},
      "to": [{"email": user['email'], "name": user['nama']}],
      "subject": "Permintaan Reset Password",
      "htmlContent": f"<p>Halo <b>{safe_nama}</b>,</p><p>Anda meminta reset password. Klik link berikut untuk membuat password baru:</p><p><a href='{reset_url}'>{reset_url}</a></p><p>Abaikan email ini jika Anda tidak memintanya. Link kedaluwarsa dalam 1 jam.</p>"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                'https://api.brevo.com/v3/smtp/email',
                headers={
                    'api-key': brevo_api_key,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                json=payload
            )
            if response.status_code >= 400:
                print("Brevo API Error:", response.text)
                return generic_msg
    except Exception as e:
        print(f"Brevo Network Error: {e}")
        return generic_msg
            
    return generic_msg

@router.post("/reset-password")
async def reset_password(req: Request, data: ResetPasswordRequest, db = Depends(get_db)):
    if len(data.newPassword) < 6:
        raise HTTPException(status_code=400, detail="Password minimal 6 karakter")
        
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT id FROM users WHERE reset_password_token = %s AND reset_password_expires_at > NOW() LIMIT 1",
        (data.token,)
    )
    user = cursor.fetchone()
    
    if not user:
        raise HTTPException(status_code=400, detail="Token reset password tidak valid atau sudah kedaluwarsa")
        
    password_hash = bcrypt_lib.hashpw(data.newPassword.encode('utf-8'), bcrypt_lib.gensalt()).decode('utf-8')
    
    cursor.execute(
        "UPDATE users SET password_hash = %s, reset_password_token = NULL, reset_password_expires_at = NULL WHERE id = %s",
        (password_hash, user['id'])
    )
    cursor.execute("UPDATE user_sessions SET is_online = 0, logout_at = NOW() WHERE user_id = %s", (user['id'],))
    db.commit()
    
    await catat_log(
        db,
        user_id=user['id'],
        aksi='reset_password_success',
        entitas='user',
        entitas_id=user['id'],
        ip=req.client.host
    )
    
    return {"success": True, "message": "Password berhasil diubah. Silakan login kembali."}
