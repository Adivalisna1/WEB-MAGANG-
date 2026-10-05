from fastapi import APIRouter, Depends, Query, Request, HTTPException
from fastapi.responses import Response
from typing import Optional
from db import get_db
from auth import get_current_user
import bcrypt
import math
import os
import zipfile
import io
import random
import string
from utils import catat_log, buat_notifikasi, UPLOAD_DIR

router = APIRouter()

def verify_eselon_1(current_user: dict = Depends(get_current_user)):
    if current_user.get("role_id") != 3:
        raise HTTPException(status_code=403, detail="Akses ditolak. Anda bukan Eselon 1.")
    return current_user

@router.get("/stats")
async def get_stats(
    current_user: dict = Depends(verify_eselon_1),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            UPDATE user_sessions
            SET is_online = 0, logout_at = NOW()
            WHERE is_online = 1
              AND last_active_at < NOW() - INTERVAL 15 MINUTE
        """)
        db.commit()
        
        cursor.execute("SELECT COUNT(*) AS totalDokumen FROM dokumen")
        total_dokumen = cursor.fetchone()["totalDokumen"]
        
        cursor.execute("SELECT COUNT(*) AS terverifikasi FROM dokumen WHERE status = 'terverifikasi'")
        terverifikasi = cursor.fetchone()["terverifikasi"]
        
        cursor.execute("SELECT COUNT(*) AS menunggu FROM dokumen WHERE status = 'menunggu_verifikasi'")
        menunggu = cursor.fetchone()["menunggu"]
        
        cursor.execute("SELECT COUNT(*) AS lolosPimpinan FROM dokumen WHERE status = 'lolos_admin'")
        res = cursor.fetchone()
        lolos_pimpinan = res["lolosPimpinan"] if res and res["lolosPimpinan"] is not None else 0
        
        cursor.execute("SELECT COUNT(*) AS revisi FROM dokumen WHERE status = 'revisi'")
        revisi = cursor.fetchone()["revisi"]
        
        cursor.execute("SELECT COUNT(*) AS onlineNow FROM user_sessions WHERE is_online = 1")
        online_now = cursor.fetchone()["onlineNow"]
        
        cursor.execute("SELECT SUM(nilai_rekening_koran) AS totalBudget, SUM(nilai_excel) AS totalExpenditure FROM dokumen WHERE status = 'terverifikasi'")
        fin_res = cursor.fetchone()
        total_budget = fin_res["totalBudget"] if fin_res and fin_res["totalBudget"] else 0
        total_expenditure = fin_res["totalExpenditure"] if fin_res and fin_res["totalExpenditure"] else 0
        
        cursor.execute("SELECT COUNT(DISTINCT satker_id) AS activeBranches FROM users WHERE is_active = 1 AND role_id = 2")
        active_branches = cursor.fetchone()["activeBranches"]
        
        cursor.execute("""
            SELECT u.nama,
                   COUNT(d.id) AS total,
                   SUM(d.status = 'terverifikasi') AS terverifikasi,
                   SUM(d.status = 'revisi') AS revisi
            FROM users u
            LEFT JOIN dokumen d ON d.uploaded_by = u.id
            WHERE u.role_id = 2 AND u.is_active = 1
            GROUP BY u.id, u.nama
            ORDER BY total DESC
        """)
        per_staff = cursor.fetchall()
        
        cursor.execute("""
            SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS tanggal, 
                   COALESCE(SUM(nilai_rekening_koran), 0) AS budget, 
                   COALESCE(SUM(nilai_excel), 0) AS expenditure
            FROM dokumen
            WHERE created_at >= CURDATE() - INTERVAL 13 DAY
              AND status = 'terverifikasi'
            GROUP BY tanggal
            ORDER BY tanggal ASC
        """)
        per_hari = cursor.fetchall()
        
        cursor.execute("SELECT status, COUNT(*) AS total FROM dokumen GROUP BY status")
        status_dist = cursor.fetchall()
        
        cursor.execute("""
            SELECT u.id, u.nama, u.username, r.nama AS role, s.last_active_at
            FROM user_sessions s
            JOIN users u ON u.id = s.user_id
            JOIN roles r ON r.id = u.role_id
            WHERE s.is_online = 1
            ORDER BY s.last_active_at DESC
        """)
        online_users = cursor.fetchall()
        for row in online_users:
            if "last_active_at" in row and row["last_active_at"]:
                row["last_active_at"] = row["last_active_at"].isoformat()
        
        return {
            "success": True,
            "data": {
                "totalDokumen": total_dokumen,
                "terverifikasi": terverifikasi,
                "menunggu": menunggu,
                "lolosPimpinan": int(lolos_pimpinan),
                "revisi": revisi,
                "onlineNow": online_now,
                "totalBudget": float(total_budget),
                "totalExpenditure": float(total_expenditure),
                "activeBranches": active_branches,
                "perSatker": per_staff,
                "perHari": per_hari,
                "statusDist": status_dist,
                "onlineUsers": online_users
            }
        }

@router.get("/users")
async def get_users(
    current_user: dict = Depends(verify_eselon_1),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT u.id, u.nama, u.username, u.email, u.is_active,
                   u.last_login, u.password_reset_at, u.created_at, r.nama AS role,
                   (SELECT is_online FROM user_sessions s
                    WHERE s.user_id = u.id AND s.is_online = 1
                    ORDER BY s.last_active_at DESC LIMIT 1) AS is_online,
                   st.nama AS satker_nama
            FROM users u
            JOIN roles r ON r.id = u.role_id
            LEFT JOIN satkers st ON st.id = u.satker_id
            WHERE u.role_id = 1
            ORDER BY u.created_at DESC
        """)
        rows = cursor.fetchall()
        return {"success": True, "data": rows}

@router.get("/dokumen")
async def get_dokumen(
    status: Optional[str] = None,
    limit: int = 100,
    current_user: dict = Depends(verify_eselon_1),
    db=Depends(get_db)
):
    limit = min(limit, 200)
    where = '1=1'
    params = []
    
    if status:
        where += ' AND d.status = %s'
        params.append(status)
        
    with db.cursor(dictionary=True) as cursor:
        cursor.execute(f"""
            SELECT d.id, d.judul, d.tahun, d.nomor_laporan, d.status, d.catatan,
                   d.nilai_rekening_koran, d.created_at, d.updated_at,
                   k.nama AS kategori, u.nama AS uploaded_by
            FROM dokumen d
            JOIN kategori_dokumen k ON k.id = d.kategori_id
            JOIN users u ON u.id = d.uploaded_by
            WHERE {where}
            ORDER BY d.created_at DESC
            LIMIT %s
        """, tuple(params + [limit]))
        rows = cursor.fetchall()
        return {"success": True, "data": rows}

@router.get("/dokumen/menunggu")
async def get_dokumen_menunggu(
    current_user: dict = Depends(verify_eselon_1),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT d.id, d.judul, d.tahun, d.bulan, d.semester, d.nomor_laporan,
                   d.status, d.catatan, d.catatan_oleh, d.file_nama, d.file_size, d.file_mime,
                   d.nilai_rekening_koran, d.created_at, d.updated_at,
                   k.nama AS kategori, k.slug AS kategori_slug,
                   u.nama AS uploaded_by
            FROM dokumen d
            JOIN kategori_dokumen k ON k.id = d.kategori_id
            JOIN users u ON u.id = d.uploaded_by
            WHERE d.status = 'lolos_admin'
            ORDER BY d.updated_at ASC
        """)
        rows = cursor.fetchall()
        return {"success": True, "data": rows}

@router.patch("/users/{user_id}/toggle")
async def toggle_user_active(
    user_id: int,
    request: Request,
    current_user: dict = Depends(verify_eselon_1),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id, role_id, nama, is_active FROM users WHERE id = %s", (user_id,))
        user_row = cursor.fetchone()
        
        if not user_row:
            return {"success": False, "message": "User tidak ditemukan"}
            
        if user_id == current_user.get("id"):
            return {"success": False, "message": "Tidak bisa menonaktifkan akun sendiri"}
            
        if user_row["role_id"] == 3:
            return {"success": False, "message": "Tidak bisa mengubah status sesama Eselon 1"}
            
        if user_row["role_id"] == 2:
            return {"success": False, "message": "Hanya Pimpinan Satker yang berhak menonaktifkan Staff."}
            
        new_status = 0 if user_row["is_active"] else 1
        cursor.execute("UPDATE users SET is_active = %s WHERE id = %s", (new_status, user_id))
        
        ip_addr = request.client.host if request.client else "127.0.0.1"
        cursor.execute("""
            INSERT INTO aktivitas_log (user_id, aksi, entitas, entitas_id, detail, ip_address)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            current_user.get("id"),
            'aktifkan_user' if new_status else 'nonaktifkan_user',
            'user',
            user_id,
            f'{{"nama": "{user_row["nama"]}", "is_active": {new_status}, "oleh": "eselon_1"}}',
            ip_addr
        ))
        
        return {
            "success": True,
            "message": "User diaktifkan" if new_status else "User dinonaktifkan",
            "data": {"id": user_id, "is_active": new_status}
        }

@router.post("/users/{user_id}/reset-password")
async def reset_password(
    user_id: int,
    request: Request,
    current_user: dict = Depends(verify_eselon_1),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id, nama, username FROM users WHERE id = %s", (user_id,))
        user_row = cursor.fetchone()
        
        if not user_row:
            return {"success": False, "message": "User tidak ditemukan"}
            
        chars = string.ascii_letters + string.digits
        pass_rand = ''.join(random.choice(chars) for i in range(8))
        new_password = f"Esl1-{pass_rand[:4]}-{pass_rand[4:]}"
        
        hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor.execute("UPDATE users SET password_hash = %s, password_reset_at = NOW() WHERE id = %s", (hashed_pw, user_id))
        
        ip_addr = request.client.host if request.client else "127.0.0.1"
        cursor.execute("""
            INSERT INTO aktivitas_log (user_id, aksi, entitas, entitas_id, detail, ip_address)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            current_user.get("id"),
            'reset_password',
            'user',
            user_id,
            f'{{"nama": "{user_row["nama"]}", "username": "{user_row["username"]}"}}',
            ip_addr
        ))
        
        # Buat Notifikasi
        cursor.execute("""
            INSERT INTO notifikasi (user_id, aksi, judul, pesan)
            VALUES (%s, %s, %s, %s)
        """, (
            user_id,
            'reset_password',
            'Password Direset',
            'Password akun Anda baru saja direset oleh Eselon 1. Silakan login dengan password baru Anda.'
        ))
        
        return {
            "success": True,
            "message": "Password berhasil direset",
            "data": {
                "id": user_id,
                "nama": user_row["nama"],
                "username": user_row["username"],
                "password_baru": new_password
            }
        }

@router.get("/dokumen/export-zip")
async def export_zip_rekening_koran(
    satker_id: Optional[int] = None,
    current_user: dict = Depends(verify_eselon_1),
    db=Depends(get_db)
):
    if not satker_id:
        raise HTTPException(status_code=400, detail="satker_id diperlukan")
        
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT d.id, d.judul, d.file_nama, d.file_path, d.file_mime, u.nama AS satker_nama
            FROM dokumen d
            JOIN kategori_dokumen k ON k.id = d.kategori_id
            JOIN users u ON u.id = d.uploaded_by
            WHERE LOWER(k.nama) LIKE '%%rekening koran%%'
              AND u.satker_id = %s
              AND d.status = 'terverifikasi'
        """, (satker_id,))
        rows = cursor.fetchall()
        
    if not rows:
        raise HTTPException(status_code=404, detail="Tidak ada dokumen Rekening Koran ditemukan untuk satker tersebut")
        
    satker_name = "".join(c if c.isalnum() else "_" for c in rows[0]["satker_nama"])
    from datetime import date
    zip_name = f"Rekening_Koran_{satker_name}_{date.today().isoformat()}.zip"
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        for doc in rows:
            if doc.get("file_path"):
                file_full_path = os.path.join(UPLOAD_DIR, doc["file_path"])
                if os.path.exists(file_full_path):
                    with open(file_full_path, "rb") as f:
                        file_data = f.read()
                        file_name = doc.get("file_nama") or f"dokumen_{doc['id']}.pdf"
                        zip_file.writestr(file_name, file_data)
                        
    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{zip_name}"'}
    )

@router.get("/logs")
async def get_logs(
    user_id: Optional[int] = None,
    aksi: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    current_user: dict = Depends(verify_eselon_1),
    db=Depends(get_db)
):
    offset = (page - 1) * limit
    where = "l.aksi NOT IN ('login', 'logout')"
    params = []
    
    if user_id:
        where += " AND l.user_id = %s"
        params.append(user_id)
    if aksi:
        where += " AND l.aksi = %s"
        params.append(aksi)
        
    with db.cursor(dictionary=True) as cursor:
        cursor.execute(f"""
            SELECT l.id, l.aksi, l.entitas, l.entitas_id, l.detail,
                   l.ip_address, l.created_at, 
                   CONCAT(u.nama, IFNULL(CONCAT(' (', s.nama, ')'), '')) AS user_nama, 
                   u.username
            FROM aktivitas_log l
            LEFT JOIN users u ON u.id = l.user_id
            LEFT JOIN satkers s ON s.id = u.satker_id
            WHERE {where}
            ORDER BY l.created_at DESC
            LIMIT %s OFFSET %s
        """, tuple(params + [limit, offset]))
        rows = cursor.fetchall()
        
        cursor.execute(f"SELECT COUNT(*) AS total FROM aktivitas_log l LEFT JOIN users u ON u.id = l.user_id WHERE {where}", tuple(params))
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
