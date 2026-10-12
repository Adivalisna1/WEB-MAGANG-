import os
import time
import math
import asyncio
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, File, UploadFile, Form, Header
from fastapi.responses import FileResponse, Response
from auth import get_current_user, require_admin_it
from db import get_db
from utils import catat_log, buat_notifikasi, save_file, delete_file, UPLOAD_DIR
import jwt
from services.reconciliation import scan_uploaded_file, reconcile_documents

router = APIRouter(prefix="/api/dokumen", tags=["dokumen"])

def buat_nomor_laporan(slug: str, tahun: int, doc_id: int) -> str:
    kode = (slug or 'DOK').upper().replace('-', '')
    return f"{kode}/{tahun}/{str(doc_id).zfill(3)}"

@router.get("/kategori")
async def get_kategori(db=Depends(get_db)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id, nama, slug, deskripsi, perlu_nominal FROM kategori_dokumen WHERE is_active = 1 ORDER BY urutan ASC")
        rows = cursor.fetchall()
    return {"success": True, "data": rows}

@router.get("/stats")
async def get_stats(satker: Optional[int] = None, db=Depends(get_db)):
    where = 'status = "terverifikasi" AND is_public = 1'
    params = []
    
    if satker:
        where += ' AND uploaded_by IN (SELECT id FROM users WHERE satker_id = %s)'
        params.append(satker)
        
    with db.cursor(dictionary=True) as cursor:
        cursor.execute(f"SELECT COUNT(*) AS totalDokumen FROM dokumen WHERE {where}", tuple(params))
        total_dokumen = cursor.fetchone()["totalDokumen"]
        
        cursor.execute("SELECT COUNT(*) AS totalKategori FROM kategori_dokumen WHERE is_active = 1")
        total_kategori = cursor.fetchone()["totalKategori"]
        
        cursor.execute(f"SELECT COALESCE(SUM(download_count), 0) AS totalDownload FROM dokumen WHERE {where}", tuple(params))
        total_download = cursor.fetchone()["totalDownload"]
        
    return {"success": True, "data": {"totalDokumen": total_dokumen, "totalKategori": total_kategori, "totalDownload": int(total_download)}}

@router.get("")
async def get_dokumen_publik(
    kategori: Optional[str] = None,
    tahun: Optional[int] = None,
    q: Optional[str] = None,
    nomor: Optional[str] = None,
    satker: Optional[int] = None,
    page: int = 1,
    limit: int = 12,
    db=Depends(get_db)
):
    offset = (page - 1) * limit
    where = 'd.status = "terverifikasi" AND d.is_public = 1'
    params = []
    
    if kategori:
        where += ' AND (k.slug = %s OR k.nama = %s OR CAST(k.id AS CHAR) = %s)'
        params.extend([kategori, kategori, kategori])
    if tahun:
        where += ' AND d.tahun = %s'
        params.append(tahun)
    if nomor:
        where += ' AND d.nomor_laporan LIKE %s'
        params.append(f"%{nomor}%")
    if satker:
        where += ' AND u.satker_id = %s'
        params.append(satker)
    if q:
        escaped = q.replace('%', '\\%').replace('_', '\\_')
        where += ' AND (d.judul LIKE %s OR d.nomor_laporan LIKE %s)'
        params.extend([f"%{escaped}%", f"%{escaped}%"])
        
    with db.cursor(dictionary=True) as cursor:
        query = f"""
            SELECT d.id, d.judul, d.deskripsi, d.tahun, d.bulan, d.semester,
                   d.nomor_laporan, d.file_nama, d.file_size, d.file_mime,
                   d.download_count, d.created_at,
                   k.nama AS kategori, k.slug AS kategori_slug
            FROM dokumen d
            JOIN kategori_dokumen k ON k.id = d.kategori_id
            LEFT JOIN users u ON d.uploaded_by = u.id
            WHERE {where}
            ORDER BY d.tahun DESC, d.bulan DESC, d.created_at DESC
            LIMIT %s OFFSET %s
        """
        cursor.execute(query, tuple(params + [limit, offset]))
        rows = cursor.fetchall()
        
        cursor.execute(f"""
            SELECT COUNT(*) AS total FROM dokumen d
            JOIN kategori_dokumen k ON k.id = d.kategori_id
            LEFT JOIN users u ON d.uploaded_by = u.id
            WHERE {where}
        """, tuple(params))
        total = cursor.fetchone()["total"]
        
    return {
        "success": True, 
        "data": rows,
        "meta": {"total": total, "page": page, "limit": limit, "totalPages": math.ceil(total / limit)}
    }

@router.get("/all")
async def get_all_dokumen(
    status: Optional[str] = None,
    kategori: Optional[str] = None,
    tahun: Optional[int] = None,
    satker: Optional[int] = None,
    only_mine: Optional[bool] = False,
    page: int = 1,
    limit: int = 20,
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    offset = (page - 1) * limit
    where = '1=1'
    params = []
    
    role = user.get("role")
    tingkat = user.get("tingkat")
    satker_id = user.get("satker_id")
    eselon_1_id = user.get("eselon_1_id")

    if only_mine:
        where += ' AND d.uploaded_by = %s'
        params.append(user["id"])
    elif role in ["it", "admin_it"] or tingkat == "kl":
        # Global access across all satkers; can filter by satker query param if provided
        if satker:
            where += ' AND u.satker_id = %s'
            params.append(satker)
    elif tingkat == "satker":
        # Both Operator and Administrasi Satker see their own satker documents
        if satker_id:
            where += ' AND (u.satker_id = %s OR d.uploaded_by = %s)'
            params.extend([satker_id, user["id"]])
        else:
            where += ' AND d.uploaded_by = %s'
            params.append(user["id"])
    elif tingkat == "eselon_1":
        # Eselon 1 Pembina sees all satkers under their Eselon 1 unit
        if satker:
            where += ' AND u.satker_id = %s'
            params.append(satker)
        elif eselon_1_id:
            where += ' AND (s.eselon_1_id = %s OR u.eselon_1_id = %s OR d.uploaded_by = %s)'
            params.extend([eselon_1_id, eselon_1_id, user["id"]])
        
    if status and status != 'all':
        where += ' AND d.status = %s'
        params.append(status)
    if kategori and kategori != 'all':
        where += ' AND k.slug = %s'
        params.append(kategori)
    if tahun:
        where += ' AND d.tahun = %s'
        params.append(tahun)
        
    with db.cursor(dictionary=True) as cursor:
        query = f"""
            SELECT d.id, d.judul, d.tahun, d.bulan, d.semester, d.nomor_laporan,
                   d.status, d.catatan, d.catatan_oleh, d.file_nama, d.file_size,
                   d.download_count, d.is_public, d.created_at, d.updated_at,
                   d.nilai_rekening_koran, d.nilai_excel,
                   k.nama AS kategori, k.perlu_nominal, 
                   u.nama AS uploaded_by, u.username AS uploaded_username,
                   s.NO_Satker AS no_satker, s.nama AS satker_nama
            FROM dokumen d
            JOIN kategori_dokumen k ON k.id = d.kategori_id
            JOIN users u ON u.id = d.uploaded_by
            LEFT JOIN satkers s ON s.id = u.satker_id
            WHERE {where}
            ORDER BY d.created_at DESC
            LIMIT %s OFFSET %s
        """
        cursor.execute(query, tuple(params + [limit, offset]))
        rows = cursor.fetchall()
        
        cursor.execute(f"""
            SELECT COUNT(*) AS total FROM dokumen d
            JOIN kategori_dokumen k ON k.id = d.kategori_id
            JOIN users u ON u.id = d.uploaded_by
            LEFT JOIN satkers s ON s.id = u.satker_id
            WHERE {where}
        """, tuple(params))
        total = cursor.fetchone()["total"]
        
    return {
        "success": True,
        "data": rows,
        "meta": {"total": total, "page": page, "limit": limit, "totalPages": math.ceil(total / limit)}
    }

@router.post("/upload")
async def upload_dokumen(
    request: Request,
    judul: str = Form(...),
    tahun: int = Form(...),
    kategori_id: int = Form(...),
    deskripsi: Optional[str] = Form(None),
    bulan: Optional[int] = Form(None),
    semester: Optional[int] = Form(None),
    nilai_rekening_koran: Optional[float] = Form(None),
    nilai_excel: Optional[float] = Form(None),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    is_uploader = (
        user.get("role") in ["operator", "it", "admin_it", "staff_satker"] or
        user.get("role_id") in [1, 3] # 1=operator, 3=it
    )
    if not is_uploader:
        raise HTTPException(403, "Hanya Operator Pelaksana yang berhak mengunggah dokumen")

        
    if not judul: raise HTTPException(400, "Judul wajib diisi")
    
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT id, status FROM dokumen
            WHERE LOWER(judul) = LOWER(%s) AND kategori_id = %s AND tahun = %s AND status NOT IN ('diarsipkan')
        """, (judul.strip(), kategori_id, tahun))
        if cursor.fetchone():
            raise HTTPException(409, "Dokumen duplikat (judul, kategori, tahun sama)")
            
        cursor.execute('SELECT slug FROM kategori_dokumen WHERE id = %s', (kategori_id,))
        kat_row = cursor.fetchone()
        
    bulan_final = None if semester else (int(bulan) if bulan else None)
    semester_final = int(semester) if semester else None
    
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    base_name = os.path.splitext(filename)[0].replace(' ', '-').lower()
    unique_name = f"{base_name}-{int(time.time()*1000)}{ext}"
    
    r2_key = await save_file(file.file, unique_name, tahun)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            INSERT INTO dokumen
             (kategori_id, uploaded_by, judul, deskripsi, tahun, bulan, semester,
              file_nama, file_path, file_size, file_mime, status, is_public,
              nilai_rekening_koran, nilai_excel)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'draft', 0, %s, %s)
        """, (kategori_id, user["id"], judul, deskripsi, tahun, bulan_final, semester_final,
              filename, r2_key, file_size, file.content_type,
              nilai_rekening_koran, nilai_excel))
        insert_id = cursor.lastrowid
        
        nomor_laporan = buat_nomor_laporan(kat_row["slug"] if kat_row else "", tahun, insert_id)
        cursor.execute('UPDATE dokumen SET nomor_laporan = %s WHERE id = %s', (nomor_laporan, insert_id))
        db.commit()
        
    await catat_log(db, user["id"], "upload", "dokumen", insert_id, {
        "judul": judul, "tahun": tahun, "kategori_id": kategori_id, "file_nama": filename, "nomor_laporan": nomor_laporan
    }, request.client.host)
    
    return {"success": True, "message": "Dokumen berhasil diupload", "data": {"id": insert_id, "nomor_laporan": nomor_laporan}}

@router.get("/{id}/download")
async def download_dokumen(id: int, token: Optional[str] = None, db=Depends(get_db)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id, judul, file_nama, file_path, file_mime, status, is_public, uploaded_by FROM dokumen WHERE id = %s", (id,))
        dok = cursor.fetchone()
        
    if not dok:
        raise HTTPException(404, "Dokumen tidak ditemukan")
        
    has_access = dok["status"] == "terverifikasi" and dok["is_public"]
    if not has_access and token:
        try:
            secret = os.getenv("JWT_SECRET")
            decoded = jwt.decode(token, secret, algorithms=["HS256"])
            if decoded.get("role") in ["administrasi", "it", "admin_it", "pimpinan_satker", "eselon_1"] or decoded.get("tingkat") in ["satker", "eselon_1", "kl"] or (dok["uploaded_by"] == decoded.get("id")):
                has_access = True
        except Exception:
            pass
            
    if not has_access:
        raise HTTPException(403, "Anda tidak memiliki akses ke dokumen ini")
        
    if not dok["file_path"]:
        raise HTTPException(404, "File tidak tersedia di database")
        
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("UPDATE dokumen SET download_count = download_count + 1 WHERE id = %s", (id,))
        db.commit()
        
    file_path = os.path.join(UPLOAD_DIR, dok["file_path"])
    if not os.path.exists(file_path):
        raise HTTPException(404, "File tidak ditemukan di server")
        
    return FileResponse(file_path, filename=dok["file_nama"], media_type=dok["file_mime"] or "application/octet-stream")

@router.get("/{id}/preview")
async def preview_dokumen(id: int, user: dict = Depends(get_current_user), db=Depends(get_db)):
    is_allowed = (
        user.get("role") in ["administrasi", "operator", "it", "admin_it", "pimpinan_satker", "eselon_1", "staff_satker"] or
        user.get("tingkat") in ["satker", "eselon_1", "kl"] or
        user.get("role_id") in [1, 2, 3, 4]
    )
    if not is_allowed:
        raise HTTPException(403, "Akses ditolak")
        
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT file_nama, file_path, file_mime FROM dokumen WHERE id = %s", (id,))
        dok = cursor.fetchone()
        
    if not dok or not dok["file_path"]:
        raise HTTPException(404, "Dokumen tidak ditemukan")
        
    file_path = os.path.join(UPLOAD_DIR, dok["file_path"])
    if not os.path.exists(file_path):
        raise HTTPException(404, "File tidak ditemukan")
        
    mime = dok["file_mime"] or ""
    filename_lower = dok["file_nama"].lower() if dok["file_nama"] else ""
    if "pdf" in mime.lower() or filename_lower.endswith(".pdf"):
        return FileResponse(file_path, filename=dok["file_nama"], media_type="application/pdf", content_disposition_type="inline")
        
    # Libreoffice conversion
    tmp_dir = "/tmp/lo_preview"
    os.makedirs(tmp_dir, exist_ok=True)
    ext = os.path.splitext(dok["file_nama"])[1].lower()
    base_name = os.path.splitext(dok["file_nama"])[0].replace(' ', '_')
    tmp_input = os.path.join(tmp_dir, f"{base_name}-{int(time.time())}{ext}")
    pdf_path = os.path.join(tmp_dir, f"{os.path.basename(tmp_input).replace(ext, '')}.pdf")
    
    import shutil
    shutil.copy2(file_path, tmp_input)
    
    import subprocess
    try:
        subprocess.run([
            "libreoffice", "--headless", "--convert-to", "pdf", 
            "--outdir", tmp_dir, tmp_input
        ], timeout=30, check=True)
    except Exception as e:
        if os.path.exists(tmp_input): os.remove(tmp_input)
        raise HTTPException(500, "Gagal konversi ke PDF")
        
    if os.path.exists(tmp_input): os.remove(tmp_input)
    
    if not os.path.exists(pdf_path):
        raise HTTPException(500, "File PDF hasil konversi tidak ditemukan")
        
    def iterfile():
        with open(pdf_path, mode="rb") as f:
            yield from f
        try: os.remove(pdf_path)
        except: pass
            
    return Response(content=open(pdf_path, "rb").read(), media_type="application/pdf", headers={"Content-Disposition": f'inline; filename="{base_name}.pdf"'})

@router.get("/{id}")
async def get_dokumen_detail(id: int, db=Depends(get_db)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT d.id, d.judul, d.deskripsi, d.tahun, d.bulan, d.semester,
                   d.nomor_laporan, d.file_nama, d.file_size, d.file_mime,
                   d.download_count, d.created_at,
                   k.nama AS kategori, k.slug AS kategori_slug
            FROM dokumen d
            JOIN kategori_dokumen k ON k.id = d.kategori_id
            WHERE d.id = %s AND d.status = 'terverifikasi' AND d.is_public = 1
        """, (id,))
        row = cursor.fetchone()
    if not row: raise HTTPException(404, "Dokumen tidak ditemukan")
    return {"success": True, "data": row}

@router.patch("/{id}")
async def edit_dokumen(
    id: int, 
    request: Request,
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    body = await request.json()
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM dokumen WHERE id = %s", (id,))
        dok = cursor.fetchone()
        
    if not dok: raise HTTPException(404, "Dokumen tidak ditemukan")
    
    is_uploader = (user.get("role") in ["operator", "staff_satker"] or user.get("role_id") == 1)
    is_editor = (user.get("role") in ["administrasi", "it", "admin_it", "pimpinan_satker"] or user.get("role_id") in [2, 3])
    
    if is_uploader:
        if dok["uploaded_by"] != user["id"]: raise HTTPException(403, "Bukan dokumen Anda")
        if dok["status"] not in ['draft', 'revisi']: raise HTTPException(400, "Hanya draft/revisi")
    elif is_editor:
        if dok["status"] not in ['terverifikasi', 'diarsipkan', 'lolos_admin', 'menunggu_verifikasi']: raise HTTPException(400, "Status tidak dapat diedit")
    else:
        raise HTTPException(403, "Akses ditolak")
        
    judul = body.get("judul")
    tahun = body.get("tahun")
    bulan = body.get("bulan")
    semester = body.get("semester")
    kategori_id = body.get("kategori_id")
    deskripsi = body.get("deskripsi")
    
    bulan_val = int(bulan) if bulan else None
    semester_val = int(semester) if semester else None
    bulan_final, semester_final = dok["bulan"], dok["semester"]
    if bulan_val:
        bulan_final, semester_final = bulan_val, None
    elif semester_val:
        bulan_final, semester_final = None, semester_val
    elif bulan is not None or semester is not None:
        bulan_final, semester_final = None, None
        
    j_final = judul or dok["judul"]
    t_final = tahun or dok["tahun"]
    k_final = kategori_id or dok["kategori_id"]
    
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT id FROM dokumen WHERE LOWER(judul) = LOWER(%s) AND kategori_id = %s AND tahun = %s AND id != %s AND status NOT IN ('diarsipkan')
        """, (str(j_final).strip(), k_final, t_final, id))
        if cursor.fetchone(): raise HTTPException(409, "Duplikat dokumen")
        
        nilai_rk = body.get("nilai_rekening_koran")
        nilai_excel = body.get("nilai_excel")
        
        cursor.execute("""
            UPDATE dokumen SET
             judul = COALESCE(%s, judul),
             tahun = COALESCE(%s, tahun),
             bulan = %s, semester = %s,
             kategori_id = COALESCE(%s, kategori_id),
             deskripsi = COALESCE(%s, deskripsi),
             nilai_rekening_koran = COALESCE(%s, nilai_rekening_koran),
             nilai_excel = COALESCE(%s, nilai_excel)
            WHERE id = %s
        """, (
            judul, tahun, bulan_final, semester_final, kategori_id, deskripsi, 
            nilai_rk, nilai_excel, id
        ))
        db.commit()
        
    return {"success": True, "message": "Dokumen berhasil diupdate", "data": {"id": id}}

@router.patch("/{id}/submit")
async def submit_verifikasi(id: int, request: Request, user: dict = Depends(get_current_user), db=Depends(get_db)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM dokumen WHERE id = %s AND uploaded_by = %s", (id, user["id"]))
        dok = cursor.fetchone()
        if not dok: raise HTTPException(404, "Dokumen tidak ditemukan")
        if dok["status"] not in ['draft', 'revisi']: raise HTTPException(400, "Hanya draft/revisi")
        
        cursor.execute("UPDATE dokumen SET status = 'menunggu_verifikasi', catatan = NULL, catatan_oleh = NULL WHERE id = %s", (id,))
        
        # Cari approver (Manajemen) di satker yang bersangkutan atau global
        satker_id = user.get("satker_id")
        if satker_id:
            cursor.execute("""
                SELECT u.id FROM users u
                JOIN roles r ON r.id = u.role_id
                WHERE (r.nama IN ('manajemen', 'administrasi', 'pimpinan_satker') OR u.role_id = 2) AND u.satker_id = %s AND u.is_active = 1
            """, (satker_id,))
        else:
            cursor.execute("""
                SELECT u.id FROM users u
                JOIN roles r ON r.id = u.role_id
                WHERE (r.nama IN ('manajemen', 'administrasi', 'pimpinan_satker') OR u.role_id = 2) AND u.is_active = 1
            """)
        admins = cursor.fetchall()
        
        cursor.execute("SELECT nama FROM users WHERE id = %s", (user["id"],))
        staff_row = cursor.fetchone()
        staff_nama = staff_row["nama"] if staff_row else "Operator"
        
        for admin in admins:
            await buat_notifikasi(db, admin["id"], "submit", dok["judul"], f"{staff_nama} mengajukan \"{dok['judul']}\" untuk ditinjau", id)
            
        db.commit()
    await catat_log(db, user["id"], "submit_verifikasi", "dokumen", id, {}, request.client.host)
    return {"success": True, "message": "Dokumen diajukan", "data": {"id": id}}

@router.patch("/{id}/verify")
async def verify_dokumen(id: int, request: Request, user: dict = Depends(get_current_user), db=Depends(get_db)):
    is_pimpinan = (
        user.get("role") in ["manajemen", "administrasi", "it", "admin_it", "pimpinan_satker"] or
        user.get("role_id") in [2, 3] or
        user.get("is_manajemen") or
        user.get("is_it")
    )
    if not is_pimpinan: raise HTTPException(403, "Akses ditolak. Anda bukan Tim Manajemen / Verifikator Satker.")
    body = await request.json()
    aksi = body.get("aksi")
    catatan = body.get("catatan")
    
    if aksi not in ['lolos', 'reject']: raise HTTPException(400, "Aksi harus lolos atau reject")
    
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM dokumen WHERE id = %s", (id,))
        dok = cursor.fetchone()
        if not dok: raise HTTPException(404, "Dokumen tidak ditemukan")
        if dok["status"] != 'menunggu_verifikasi': raise HTTPException(400, "Dokumen tidak dalam antrian verifikasi")
        
        # Jika verifikator adalah manajemen tingkat satker, validasi dokumen milik satkernya
        if user.get("role") in ["manajemen", "administrasi"] and user.get("tingkat") == "satker" and user.get("satker_id"):
            cursor.execute("SELECT satker_id FROM users WHERE id = %s", (dok["uploaded_by"],))
            up_row = cursor.fetchone()
            if up_row and up_row.get("satker_id") and up_row["satker_id"] != user["satker_id"]:
                raise HTTPException(403, "Akses ditolak. Dokumen bukan dari Satker Anda.")
        
        new_status = 'lolos_admin' if aksi == 'lolos' else 'revisi'
        n_rk = body.get("nilai_rekening_koran", dok["nilai_rekening_koran"])
        n_ex = body.get("nilai_excel", dok["nilai_excel"])
        
        cursor.execute("""
            UPDATE dokumen SET status = %s, is_public = 0, catatan = %s, catatan_oleh = 'admin',
            nilai_rekening_koran = %s, nilai_excel = %s, verified_by = %s, verified_at = NOW() WHERE id = %s
        """, (new_status, catatan, n_rk, n_ex, user["id"], id))
        
        if aksi == 'lolos':
            await buat_notifikasi(db, dok["uploaded_by"], "lolos_admin", dok["judul"], f"Dokumen \"{dok['judul']}\" lolos tinjauan manajemen Satker", id)
            # Notifikasi ke Tim Eselon 1 Pembina satker tersebut
            satker_target_id = user.get("satker_id")
            cursor.execute("""
                SELECT u.id FROM users u
                JOIN roles r ON r.id = u.role_id
                JOIN tingkats t ON t.id = u.tingkat_id
                LEFT JOIN satkers s ON s.id = %s
                WHERE (
                    (t.kode = 'eselon_1' AND (u.eselon_1_id = s.eselon_1_id OR u.eselon_1_id IS NULL))
                    OR t.kode = 'kl'
                    OR r.nama IN ('it', 'admin_it')
                ) AND u.is_active = 1
            """, (satker_target_id,))
            for ketua in cursor.fetchall():
                await buat_notifikasi(db, ketua["id"], "submit", dok["judul"], f"Dokumen \"{dok['judul']}\" diloloskan manajemen Satker dan menunggu persetujuan Eselon 1", id)
        else:
            await buat_notifikasi(db, dok["uploaded_by"], "reject", dok["judul"], f"Dokumen perlu direvisi: {catatan}", id)
            
        db.commit()
    await catat_log(db, user["id"], f"admin_{'loloskan' if aksi=='lolos' else 'revisi'}", "dokumen", id, {"aksi": aksi}, request.client.host)
    return {"success": True, "message": "Dokumen diproses", "data": {"id": id}}

@router.patch("/{id}/eselon-1-verify")
async def verify_eselon(id: int, request: Request, user: dict = Depends(get_current_user), db=Depends(get_db)):
    # Hanya Pimpinan Eselon 1 (manajemen/administrasi) atau IT Admin yang berwenang verifikasi
    is_pimpinan_eselon = (
        (user.get("role") in ["manajemen", "administrasi"] and user.get("tingkat") in ["eselon_1", "kl"]) or
        (user.get("tingkat") in ["eselon_1", "kl"] and user.get("role_id") == 2) or
        user.get("role") in ["it", "admin_it"] or
        user.get("is_it") or
        user.get("role_id") == 3
    )
    if not is_pimpinan_eselon:
        raise HTTPException(403, "Akses ditolak. Staff Eselon 1 tidak memiliki hak verifikasi. Hanya Pimpinan Eselon 1 yang berwenang.")
    body = await request.json()
    aksi = body.get("aksi")
    catatan = body.get("catatan")
    
    if aksi not in ['approve', 'reject']: raise HTTPException(400, "Aksi salah")
    
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM dokumen WHERE id = %s", (id,))
        dok = cursor.fetchone()
        if not dok: raise HTTPException(404, "Dokumen tidak ditemukan")
        if dok["status"] != 'lolos_admin': raise HTTPException(400, "Belum diloloskan admin Satker")
        
        # Validasi bahwa satker uploader berada di bawah eselon 1 user (jika user tingkat eselon_1)
        if user.get("tingkat") == "eselon_1" and user.get("eselon_1_id"):
            cursor.execute("""
                SELECT s.eselon_1_id FROM users u
                LEFT JOIN satkers s ON s.id = u.satker_id
                WHERE u.id = %s
            """, (dok["uploaded_by"],))
            sat_row = cursor.fetchone()
            if sat_row and sat_row.get("eselon_1_id") and sat_row["eselon_1_id"] != user["eselon_1_id"]:
                raise HTTPException(403, "Akses ditolak. Dokumen bukan dari Satker binaan Eselon 1 Anda.")
        
        new_status = 'terverifikasi' if aksi == 'approve' else 'revisi'
        is_pub = 1 if aksi == 'approve' else 0
        
        cursor.execute("""
            UPDATE dokumen SET status = %s, is_public = %s, catatan = %s, catatan_oleh = 'ketua_tim',
            verified_by = %s, verified_at = NOW() WHERE id = %s
        """, (new_status, is_pub, catatan, user["id"], id))
        
        pesan = "Disetujui dan dipublikasikan" if aksi == 'approve' else f"Perlu direvisi: {catatan}"
        await buat_notifikasi(db, dok["uploaded_by"], aksi, dok["judul"], pesan, id)
        db.commit()
        
    await catat_log(db, user["id"], f"ketua_{'setujui' if aksi=='approve' else 'revisi'}", "dokumen", id, {"aksi": aksi}, request.client.host)
    return {"success": True, "message": "Berhasil", "data": {"id": id}}

@router.delete("/{id}")
async def delete_dokumen(id: int, request: Request, user: dict = Depends(get_current_user), db=Depends(get_db)):
    is_authorized = (
        user.get("role") in ["manajemen", "administrasi", "it", "admin_it", "pimpinan_satker"] or
        user.get("role_id") in [2, 3] or
        user.get("is_manajemen") or
        user.get("is_it")
    )
    if not is_authorized: raise HTTPException(403, "Akses ditolak")
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT file_path, judul FROM dokumen WHERE id = %s", (id,))
        dok = cursor.fetchone()
        if not dok: raise HTTPException(404, "Not found")
        
        if dok["file_path"]: delete_file(dok["file_path"])
        cursor.execute("DELETE FROM dokumen WHERE id = %s", (id,))
        db.commit()
    await catat_log(db, user["id"], "hapus_dokumen", "dokumen", id, {"judul": dok["judul"]}, request.client.host)
    return {"success": True, "message": "Berhasil dihapus"}

@router.post("/bot-upload")
async def bot_upload(
    userEmail: str = Form(...),
    judul: str = Form(...),
    tahun: int = Form(...),
    kategori_id: int = Form(...),
    deskripsi: Optional[str] = Form(None),
    bulan: Optional[int] = Form(None),
    semester: Optional[int] = Form(None),
    nilai_rekening_koran: Optional[float] = Form(None),
    nilai_excel: Optional[float] = Form(None),
    file: UploadFile = File(...),
    x_bot_api_key: str = Header(None),
    db=Depends(get_db)
):
    if x_bot_api_key != os.getenv("BOT_API_KEY", "N8N_SECRET_BOT_KEY_2026"):
        raise HTTPException(401, "Unauthorized")
        
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id, nama FROM users WHERE email = %s", (userEmail,))
        usr = cursor.fetchone()
        if not usr: raise HTTPException(404, "User not found")
        
        cursor.execute("SELECT id FROM dokumen WHERE LOWER(judul) = LOWER(%s) AND kategori_id = %s AND tahun = %s AND status NOT IN ('diarsipkan')", (judul, kategori_id, tahun))
        if cursor.fetchone(): raise HTTPException(409, "Duplikat")
        
        cursor.execute("SELECT slug FROM kategori_dokumen WHERE id = %s", (kategori_id,))
        kat = cursor.fetchone()
        
    bulan_final = None if semester else (int(bulan) if bulan else None)
    semester_final = int(semester) if semester else None
    
    ext = os.path.splitext(file.filename)[1]
    bname = os.path.splitext(file.filename)[0].replace(' ', '-')
    uname = f"{bname}-{int(time.time()*1000)}{ext}"
    
    r2_key = await save_file(file.file, uname, tahun)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            INSERT INTO dokumen
             (kategori_id, uploaded_by, judul, deskripsi, tahun, bulan, semester,
              file_nama, file_path, file_size, file_mime, status, is_public,
              nilai_rekening_koran, nilai_excel)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'draft', 0, %s, %s)
        """, (kategori_id, usr["id"], judul, deskripsi, tahun, bulan_final, semester_final,
              file.filename, r2_key, file_size, file.content_type, nilai_rekening_koran, nilai_excel))
        ins_id = cursor.lastrowid
        n_lap = buat_nomor_laporan(kat["slug"] if kat else "", tahun, ins_id)
        cursor.execute("UPDATE dokumen SET nomor_laporan = %s WHERE id = %s", (n_lap, ins_id))
        db.commit()
    return {"success": True, "message": "Uploaded"}

@router.patch("/{id}/file")
async def ganti_file(id: int, file: UploadFile = File(...), user: dict = Depends(get_current_user), db=Depends(get_db)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM dokumen WHERE id = %s", (id,))
        dok = cursor.fetchone()
        
        if not dok: raise HTTPException(404, "Not found")
        if dok["status"] not in ["revisi", "draft"]: raise HTTPException(400, "Only draft/revisi")
        is_owner = (dok["uploaded_by"] == user["id"])
        is_admin_or_it = (user.get("role") in ["it", "admin_it", "manajemen", "administrasi"] or user.get("is_manajemen") or user.get("is_it"))
        if not is_owner and not is_admin_or_it:
            raise HTTPException(403, "Akses ditolak. Bukan dokumen Anda")
        
        if dok["file_path"]: delete_file(dok["file_path"])
        
        ext = os.path.splitext(file.filename)[1]
        bname = os.path.splitext(file.filename)[0].replace(' ', '-')
        uname = f"{bname}-{int(time.time()*1000)}{ext}"
        tahun = dok["tahun"] or datetime.datetime.now().year
        
        r2_key = await save_file(file.file, uname, tahun)
        file.file.seek(0, 2)
        fsize = file.file.tell()
        
        cursor.execute("""
            UPDATE dokumen SET file_nama=%s, file_path=%s, file_size=%s, file_mime=%s, updated_at=NOW() WHERE id=%s
        """, (file.filename, r2_key, fsize, file.content_type, id))
        db.commit()
    return {"success": True, "message": "File diganti", "data": {"id": id, "file_nama": file.filename}}

@router.post("/scan-ekstrak")
async def scan_ekstrak_dokumen(
    file: Optional[UploadFile] = File(None),
    data: Optional[UploadFile] = File(None)
):
    """
    Ekstraksi otomatis konten berkas (PDF / Excel) tanpa dependensi webhook n8n.
    Menerima parameter 'file' atau 'data' (kompatibel dengan frontend FormData).
    """
    target_file = file or data
    if not target_file:
        raise HTTPException(status_code=400, detail="Berkas file wajib diunggah")
    
    content = await target_file.read()
    filename = target_file.filename or "dokumen.pdf"
    
    try:
        result = scan_uploaded_file(content, filename)
        return result
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "judul": os.path.splitext(filename)[0],
            "tahun": 2026,
            "kategori": "Lainnya",
            "nominal": None,
            "confidence": "low"
        }

@router.post("/reconcile-check")
async def reconcile_check(
    nilai_rekening: Optional[float] = Form(None),
    nilai_excel: Optional[float] = Form(None)
):
    """
    Mengecek perbandingan kesesuaian nilai rekening koran vs nilai excel.
    """
    return reconcile_documents(nilai_rekening, nilai_excel)

@router.post("/{id}/rescan")
async def rescan_dokumen(
    id: int,
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Audit ulang / on-demand scan fisik berkas yang tersimpan di server.
    Bisa dijalankan oleh Pimpinan atau Eselon 1.
    """
    is_allowed = (
        user.get("role") in ["manajemen", "administrasi", "it", "admin_it", "pimpinan_satker", "eselon_1"] or
        user.get("is_manajemen") or
        user.get("is_it") or
        user.get("tingkat") in ["eselon_1", "kl"]
    )
    if not is_allowed:
        raise HTTPException(403, "Akses ditolak")

    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id, judul, file_nama, file_path, nilai_rekening_koran, nilai_excel FROM dokumen WHERE id = %s", (id,))
        dok = cursor.fetchone()

    if not dok or not dok["file_path"]:
        raise HTTPException(404, "Dokumen atau berkas fisik tidak ditemukan")

    file_path = os.path.join(UPLOAD_DIR, dok["file_path"])
    if not os.path.exists(file_path):
        raise HTTPException(404, "File fisik berkas tidak ditemukan di server")

    with open(file_path, "rb") as f:
        content = f.read()

    filename = dok["file_nama"] or "dokumen.pdf"
    scan_res = scan_uploaded_file(content, filename)

    nom = scan_res.get("nominal")
    val_rek = dok["nilai_rekening_koran"] if dok["nilai_rekening_koran"] is not None else nom
    val_exc = dok["nilai_excel"] if dok["nilai_excel"] is not None else nom

    if (dok["nilai_rekening_koran"] is None or dok["nilai_excel"] is None) and nom is not None:
        with db.cursor(dictionary=True) as cursor:
            cursor.execute("""
                UPDATE dokumen SET
                    nilai_rekening_koran = COALESCE(nilai_rekening_koran, %s),
                    nilai_excel = COALESCE(nilai_excel, %s)
                WHERE id = %s
            """, (nom, nom, id))
            db.commit()

    reconcile_res = reconcile_documents(val_rek, val_exc)

    return {
        "success": True,
        "message": "Audit ulang berkas berhasil",
        "data": {
            "dokumen_id": id,
            "scan": scan_res,
            "reconciliation": reconcile_res,
            "nilai_rekening_koran": val_rek,
            "nilai_excel": val_exc
        }
    }


