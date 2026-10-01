from fastapi import APIRouter, Depends, HTTPException, Request
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
    
    ip = req.client.host
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT u.id, u.role_id, u.satker_id, u.nama, u.username, u.email,
               u.password_hash, u.is_active, u.permissions, r.nama AS role
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE u.username = %s OR u.email = %s
        LIMIT 1
    """, (data.username, data.username))
    
    user = cursor.fetchone()
    
    async def log_failed_attempt():
        loc = await get_location(ip)
        cursor.execute(
            "INSERT INTO login_attempts (ip_address, username_tried, status, location) VALUES (%s, %s, %s, %s)",
            (ip, data.username, 'failed', loc)
        )
        db.commit()

    if not user:
        await log_failed_attempt()
        raise HTTPException(status_code=401, detail="Username atau password salah")

    if not user['is_active']:
        raise HTTPException(status_code=403, detail="Akun tidak aktif, hubungi admin")
    
    # Check password
    if not bcrypt_lib.checkpw(data.password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        await log_failed_attempt()
        raise HTTPException(status_code=401, detail="Username atau password salah")
    
    # Success
    loc = await get_location(ip)
    cursor.execute(
        "INSERT INTO login_attempts (ip_address, username_tried, status, location) VALUES (%s, %s, %s, %s)",
        (ip, data.username, 'success', loc)
    )
    
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
    
    # Generate JWT
    token = jwt.encode(
        {
            "id": user['id'], 
            "role_id": user['role_id'],
            "role": user['role'], 
            "satker_id": user.get('satker_id'),
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
        detail={"username": user['username'], "role": user['role']}, 
        ip=ip
    )
    
    return {
        "success": True,
        "message": "Login berhasil",
        "data": {
            "token": token,
            "user": {
                "id": user['id'],
                "nama": user['nama'],
                "username": user['username'],
                "email": user['email'],
                "role": user['role'],
                "permissions": user['permissions']
            }
        }
    }

@router.post("/logout")
async def logout(req: Request, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("UPDATE user_sessions SET is_online = 0, logout_at = NOW() WHERE id = %s", (current_user['sessionId'],))
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
        SELECT u.id, u.role_id, u.nama, u.username, u.email, u.is_active, u.permissions, r.nama AS role
        FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = %s
    """, (current_user['id'],))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "data": user}

@router.post("/forgot-password")
async def forgot_password(req: Request, data: ForgotPasswordRequest, db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, nama, email FROM users WHERE email = %s LIMIT 1", (data.email,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="Email tidak ditemukan/terdaftar di sistem kami.")
    
    reset_token = secrets.token_hex(32)
    cursor.execute(
        "UPDATE users SET reset_password_token = %s, reset_password_expires_at = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = %s",
        (reset_token, user['id'])
    )
    db.commit()
    
    origin = req.headers.get("origin") or os.getenv("CORS_ORIGIN") or "http://localhost:3000"
    reset_url = f"{origin}/reset-password?token={reset_token}"
    sender_email = os.getenv("EMAIL_FROM", "no-reply@laporan.go.id")
    brevo_api_key = os.getenv("BREVO_API_KEY")
    
    if not brevo_api_key:
        raise HTTPException(status_code=500, detail="BREVO_API_KEY belum dikonfigurasi di server.")
    
    payload = {
      "sender": {"name": "Admin Dashboard Laporan", "email": sender_email},
      "to": [{"email": user['email'], "name": user['nama']}],
      "subject": "Permintaan Reset Password",
      "htmlContent": f"<p>Halo <b>{user['nama']}</b>,</p><p>Anda meminta reset password. Klik link berikut untuk membuat password baru:</p><p><a href='{reset_url}'>{reset_url}</a></p><p>Abaikan email ini jika Anda tidak memintanya. Link kedaluwarsa dalam 1 jam.</p>"
    }
    
    async with httpx.AsyncClient() as client:
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
            print("Brevo API Error:", response.json())
            raise HTTPException(status_code=500, detail=f"Gagal mengirim email via Brevo")
            
    return {"success": True, "message": "Link reset password berhasil dikirimkan ke email Anda."}

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
