import os
import time
import math
import asyncio
import datetime
import zipfile
import io
import uuid
import shutil
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, Request, File, UploadFile, Form, Header
from fastapi.responses import FileResponse, Response
from auth import get_current_user, require_admin_it
from db import get_db
from utils import catat_log, buat_notifikasi, save_file, delete_file, UPLOAD_DIR
import jwt
from services.reconciliation import scan_uploaded_file, reconcile_documents

ALLOWED_EXTENSIONS = {'.pdf', '.xlsx', '.xls', '.doc', '.docx', '.jpg', '.jpeg', '.png'}

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
        sql_dok = "SELECT COUNT(*) AS totalDokumen FROM dokumen WHERE " + where
        cursor.execute(sql_dok, tuple(params))
        total_dokumen = cursor.fetchone()["totalDokumen"]
        
        cursor.execute("SELECT COUNT(*) AS totalKategori FROM kategori_dokumen WHERE is_active = 1")
        total_kategori = cursor.fetchone()["totalKategori"]
        
        sql_dl = "SELECT COALESCE(SUM(download_count), 0) AS totalDownload FROM dokumen WHERE " + where
        cursor.execute(sql_dl, tuple(params))
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
        query = (
            "SELECT d.id, d.judul, d.deskripsi, d.tahun, d.bulan, d.semester, "
            "       d.nomor_laporan, d.file_nama, d.file_size, d.file_mime, "
            "       d.download_count, d.created_at, "
            "       k.nama AS kategori, k.slug AS kategori_slug "
            "FROM dokumen d "
            "JOIN kategori_dokumen k ON k.id = d.kategori_id "
            "LEFT JOIN users u ON d.uploaded_by = u.id "
            "WHERE " + where + " "
            "ORDER BY d.tahun DESC, d.bulan DESC, d.created_at DESC "
            "LIMIT %s OFFSET %s"
        )
        cursor.execute(query, tuple(params + [limit, offset]))
        rows = cursor.fetchall()
        
        sql_count = (
            "SELECT COUNT(*) AS total FROM dokumen d "
            "JOIN kategori_dokumen k ON k.id = d.kategori_id "
            "LEFT JOIN users u ON d.uploaded_by = u.id "
            "WHERE " + where
        )
        cursor.execute(sql_count, tuple(params))
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
        # Eselon 1 Pembina strictly sees ONLY satkers under their Eselon 1 unit
        if eselon_1_id:
            where += ' AND (s.eselon_1_id = %s OR u.eselon_1_id = %s OR d.uploaded_by = %s)'
            params.extend([eselon_1_id, eselon_1_id, user["id"]])
        if satker:
            where += ' AND u.satker_id = %s'
            params.append(satker)
        
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
        query = (
            "SELECT d.id, d.judul, d.nama_bank, d.nomor_rekening, d.tanggal_surat, d.nama_rekening, d.nama_debitur, d.dasar_temuan, d.tahun, d.bulan, d.semester, d.nomor_laporan, "
            "       d.status, d.catatan, d.catatan_oleh, d.file_nama, d.file_size, "
            "       d.download_count, d.is_public, d.created_at, d.updated_at, "
            "       d.nilai_rekening_koran, d.nilai_excel, "
            "       k.nama AS kategori, k.slug AS kategori_slug, k.perlu_nominal, "
            "       u.nama AS uploaded_by, u.username AS uploaded_username, "
            "       s.NO_Satker AS no_satker, s.nama AS satker_nama "
            "FROM dokumen d "
            "JOIN kategori_dokumen k ON k.id = d.kategori_id "
            "JOIN users u ON u.id = d.uploaded_by "
            "LEFT JOIN satkers s ON s.id = u.satker_id "
            "WHERE " + where + " "
            "ORDER BY d.created_at DESC "
            "LIMIT %s OFFSET %s"
        )
        cursor.execute(query, tuple(params + [limit, offset]))
        rows = cursor.fetchall()
        
        sql_count = (
            "SELECT COUNT(*) AS total FROM dokumen d "
            "JOIN kategori_dokumen k ON k.id = d.kategori_id "
            "JOIN users u ON u.id = d.uploaded_by "
            "LEFT JOIN satkers s ON s.id = u.satker_id "
            "WHERE " + where
        )
        cursor.execute(sql_count, tuple(params))
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
    nama_bank: Optional[str] = Form(None),
    nomor_rekening: Optional[str] = Form(None),
    tanggal_surat: Optional[str] = Form(None),
    nama_rekening: Optional[str] = Form(None),
    nama_debitur: Optional[str] = Form(None),
    dasar_temuan: Optional[str] = Form(None),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    is_admin_role = (
        user.get("role") in ["administrasi", "manajemen", "pimpinan_satker", "it", "admin_it"] or
        user.get("role_id") in [2, 3] or
        user.get("is_manajemen") or
        user.get("is_it")
    )
    is_operator_role = (
        user.get("role") in ["operator", "staff_satker"] or
        user.get("role_id") == 1 or
        user.get("is_operator")
    )
    if not (is_operator_role or is_admin_role):
        raise HTTPException(403, "Anda tidak memiliki wewenang mengunggah dokumen")
        
    if not judul: raise HTTPException(400, "Judul wajib diisi")
    
    with db.cursor(dictionary=True) as cursor:
        cursor.execute('SELECT slug, nama FROM kategori_dokumen WHERE id = %s', (kategori_id,))
        kat_row = cursor.fetchone()
        
    kat_slug = kat_row.get("slug") if kat_row else ""
    is_sk_piutang = (kat_slug == "sk-piutang-satker")
    if is_sk_piutang and not is_admin_role:
        raise HTTPException(403, "Akses ditolak. Dokumen SK Piutang hanya dapat diunggah oleh Akun Administrasi.")

    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT id, status FROM dokumen
            WHERE LOWER(judul) = LOWER(%s) AND kategori_id = %s AND tahun = %s AND status NOT IN ('diarsipkan')
        """, (judul.strip(), kategori_id, tahun))
        if cursor.fetchone():
            if is_sk_piutang:
                judul = f"{judul.strip()} ({int(time.time())})"
            else:
                raise HTTPException(409, "Dokumen duplikat (judul, kategori, tahun sama)")
        
    bulan_final = None if semester else (int(bulan) if bulan else None)
    semester_final = int(semester) if semester else None
    
    is_surat_rek = kat_slug in ["surat-pembukaan-rekening-koran", "surat-penutupan-rekening-koran"]
    if is_sk_piutang:
        status_awal = 'lolos_admin'
    elif is_surat_rek:
        status_awal = 'menunggu_verifikasi'
    else:
        status_awal = 'draft'
    
    # Validasi format tanggal_surat jika dikirim
    tgl_surat_final = None
    if tanggal_surat and str(tanggal_surat).strip():
        try:
            tgl_surat_final = str(tanggal_surat).strip()[:10]
        except Exception:
            tgl_surat_final = None

    if is_surat_rek:
        nilai_rekening_koran = None
        nilai_excel = None
    
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Format file '{ext}' tidak diizinkan. Hanya file dokumen (.pdf, .xlsx, .xls, .docx, .doc, .jpg, .png) yang didukung.")
    base_name = os.path.splitext(filename)[0].replace(' ', '-').lower()
    unique_name = f"{base_name}-{int(time.time()*1000)}{ext}"
    
    r2_key = await save_file(file.file, unique_name, tahun)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            INSERT INTO dokumen
             (kategori_id, uploaded_by, judul, nama_bank, nomor_rekening, tanggal_surat, nama_rekening, nama_debitur, dasar_temuan, deskripsi, tahun, bulan, semester,
              file_nama, file_path, file_size, file_mime, status, is_public,
              nilai_rekening_koran, nilai_excel)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0, %s, %s)
        """, (kategori_id, user["id"], judul, nama_bank, nomor_rekening, tgl_surat_final, nama_rekening, nama_debitur, dasar_temuan, deskripsi, tahun, bulan_final, semester_final,
              filename, r2_key, file_size, file.content_type, status_awal,
              nilai_rekening_koran, nilai_excel))
        insert_id = cursor.lastrowid
        
        nomor_laporan = buat_nomor_laporan(kat_row["slug"] if kat_row else "", tahun, insert_id)
        cursor.execute('UPDATE dokumen SET nomor_laporan = %s WHERE id = %s', (nomor_laporan, insert_id))
        
        # Jika Surat Pembukaan / Penutupan atau SK Piutang, langsung kirim notifikasi ke Admin Eselon 1
        if is_surat_rek or is_sk_piutang:
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
            if is_sk_piutang:
                nom_str = f"Rp {int(nilai_rekening_koran):,}".replace(",", ".") if nilai_rekening_koran else "-"
                notif_msg = f"Pengajuan SK Piutang baru \"{judul}\" (Debitur: {nama_debitur or '-'}, Dasar: {dasar_temuan or '-'}, Nominal: {nom_str}) siap ditinjau dan disahkan Eselon 1"
            else:
                surat_label = "Pembukaan" if kat_row.get("slug") == "surat-pembukaan-rekening-koran" else "Penutupan"
                notif_msg = f"Pengajuan Surat {surat_label} Rekening Koran ({nama_bank or 'Bank'} - {nomor_rekening or '-'}) siap ditinjau dan disetujui"
            for ketua in cursor.fetchall():
                await buat_notifikasi(
                    db, ketua["id"], "submit", judul,
                    notif_msg,
                    insert_id
                )

        db.commit()
        
    await catat_log(db, user["id"], "upload", "dokumen", insert_id, {
        "judul": judul, "tahun": tahun, "kategori_id": kategori_id, "file_nama": filename, "nomor_laporan": nomor_laporan,
        "nama_bank": nama_bank, "nomor_rekening": nomor_rekening, "nama_debitur": nama_debitur, "dasar_temuan": dasar_temuan, "status": status_awal
    }, request.client.host)
    
    return {
        "success": True, 
        "message": f"Dokumen berhasil diupload{' dan langsung dikirim ke Admin Eselon 1' if (is_surat_rek or is_sk_piutang) else ''}", 
        "data": {"id": insert_id, "nomor_laporan": nomor_laporan, "status": status_awal}
    }

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
        
        new_status = 'terverifikasi' if aksi == 'lolos' else 'revisi'
        is_pub = 1 if aksi == 'lolos' else 0
        n_rk = body.get("nilai_rekening_koran", dok["nilai_rekening_koran"])
        n_ex = body.get("nilai_excel", dok["nilai_excel"])
        
        cursor.execute("""
            UPDATE dokumen SET status = %s, is_public = %s, catatan = %s, catatan_oleh = 'admin',
            nilai_rekening_koran = %s, nilai_excel = %s, verified_by = %s, verified_at = NOW() WHERE id = %s
        """, (new_status, is_pub, catatan, n_rk, n_ex, user["id"], id))
        
        if aksi == 'lolos':
            await buat_notifikasi(db, dok["uploaded_by"], "terverifikasi", dok["judul"], f"Dokumen \"{dok['judul']}\" telah disahkan oleh manajemen Satker dan berstatus Terverifikasi", id)
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
                await buat_notifikasi(db, ketua["id"], "submit", dok["judul"], f"Dokumen \"{dok['judul']}\" telah disahkan manajemen Satker dan siap ditinjau Eselon 1", id)
        else:
            await buat_notifikasi(db, dok["uploaded_by"], "reject", dok["judul"], f"Dokumen perlu direvisi: {catatan}", id)
            
        db.commit()
    await catat_log(db, user["id"], f"admin_{'sahkan' if aksi=='lolos' else 'revisi'}", "dokumen", id, {"aksi": aksi}, request.client.host)
    return {"success": True, "message": "Dokumen berhasil disahkan dan terverifikasi" if aksi=='lolos' else "Dokumen dikembalikan untuk revisi", "data": {"id": id}}

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
        cursor.execute("""
            SELECT d.*, k.slug AS kat_slug, u.satker_id, s.nama AS satker_nama
            FROM dokumen d
            JOIN kategori_dokumen k ON k.id = d.kategori_id
            JOIN users u ON u.id = d.uploaded_by
            LEFT JOIN satkers s ON s.id = u.satker_id
            WHERE d.id = %s
        """, (id,))
        dok = cursor.fetchone()
        if not dok: raise HTTPException(404, "Dokumen tidak ditemukan")
        
        is_surat_rek = dok.get("kat_slug") in ['surat-pembukaan-rekening-koran', 'surat-penutupan-rekening-koran', 'sk-piutang-satker']
        valid_statuses = ['lolos_admin', 'terverifikasi', 'menunggu_verifikasi'] if is_surat_rek else ['lolos_admin', 'terverifikasi']
        if dok["status"] not in valid_statuses:
            raise HTTPException(400, "Dokumen belum disahkan satker atau status tidak valid untuk ditinjau")
        
        # Validasi bahwa satker uploader berada di bawah eselon 1 user (jika user tingkat eselon_1)
        if user.get("tingkat") == "eselon_1" and user.get("eselon_1_id"):
            cursor.execute("""
                SELECT COALESCE(s.eselon_1_id, u.eselon_1_id) AS doc_eselon_1_id 
                FROM users u
                LEFT JOIN satkers s ON s.id = u.satker_id
                WHERE u.id = %s
            """, (dok["uploaded_by"],))
            sat_row = cursor.fetchone()
            if not sat_row or sat_row.get("doc_eselon_1_id") != user["eselon_1_id"]:
                raise HTTPException(403, "Akses ditolak. Anda hanya berwenang menyetujui dokumen dari Satker binaan Eselon 1 Anda.")
        
        new_status = 'terverifikasi' if aksi == 'approve' else 'revisi'
        is_pub = 1 if aksi == 'approve' else 0
        
        cursor.execute("""
            UPDATE dokumen SET status = %s, is_public = %s, catatan = %s, catatan_oleh = 'ketua_tim',
            verified_by = %s, verified_at = NOW() WHERE id = %s
        """, (new_status, is_pub, catatan, user["id"], id))
        
        # DAMPAK PERSETUJUAN ESELON 1 TERHADAP REKENING KORAN:
        if aksi == 'approve':
            target_satker = dok.get("satker_id")
            nomor_rek = (dok.get("nomor_rekening") or "").strip()
            nama_b = dok.get("nama_bank") or "Bank Lainnya"
            nama_r = dok.get("nama_rekening") or "-"
            tgl_surat = dok.get("tanggal_surat") or datetime.date.today()
            
            if dok.get("kat_slug") == "surat-pembukaan-rekening-koran":
                # 1. Surat Pembukaan: Daftarkan nomor rekening baru ke tabel rekening_koran
                if nomor_rek:
                    cursor.execute("""
                        SELECT id FROM rekening_koran 
                        WHERE satker_id = %s AND REPLACE(nomor_rekening_bank, ' ', '') = REPLACE(%s, ' ', '')
                    """, (target_satker, nomor_rek))
                    existing_rk = cursor.fetchone()
                    
                    if not existing_rk:
                        cursor.execute("""
                            INSERT INTO rekening_koran (
                                satker_id, uploaded_by, dokumen_id, nama_bank, nomor_rekening_bank,
                                nama_rekening, tanggal_pembukaan_rekening, saldo_akhir_bulan,
                                keterangan, tahun, periode, is_active
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, 0.00, %s, %s, %s, 1)
                        """, (
                            target_satker,
                            dok.get("uploaded_by"),
                            id,
                            nama_b,
                            nomor_rek,
                            nama_r,
                            tgl_surat,
                            f"Rekening Baru - Disetujui Eselon 1 via Surat Pembukaan ({dok.get('nomor_laporan') or ''})",
                            dok.get("tahun") or datetime.datetime.now().year,
                            f"Bulan {dok.get('bulan')}" if dok.get("bulan") else "Tahunan",
                        ))
                    else:
                        cursor.execute("""
                            UPDATE rekening_koran 
                            SET is_active = 1, 
                                tanggal_pembukaan_rekening = COALESCE(%s, tanggal_pembukaan_rekening),
                                keterangan = CONCAT(COALESCE(keterangan, ''), ' [Diaktifkan via Surat Pembukaan Eselon 1]')
                            WHERE id = %s
                        """, (tgl_surat, existing_rk["id"]))
                        
            elif dok.get("kat_slug") == "surat-penutupan-rekening-koran":
                # 2. Surat Penutupan: Nonaktifkan rekening tersebut di tabel rekening_koran & pencatatan
                if nomor_rek:
                    cursor.execute("""
                        UPDATE rekening_koran 
                        SET is_active = 0,
                            tanggal_penutupan_rekening = %s,
                            keterangan = CONCAT(COALESCE(keterangan, ''), ' [Rekening Resmi Ditutup & Dinonaktifkan via Surat Penutupan disetujui Eselon 1]')
                        WHERE satker_id = %s AND REPLACE(nomor_rekening_bank, ' ', '') = REPLACE(%s, ' ', '')
                    """, (tgl_surat, target_satker, nomor_rek))
                    
                    cursor.execute("""
                        UPDATE pencatatan
                        SET is_active = 0
                        WHERE satker_id = %s AND REPLACE(nomor_rekening, ' ', '') = REPLACE(%s, ' ', '')
                    """, (target_satker, nomor_rek))

        if dok.get("kat_slug") == "sk-piutang-satker":
            nom_str = f"Rp {int(dok['nilai_rekening_koran']):,}".replace(",", ".") if dok.get("nilai_rekening_koran") else "-"
            if aksi == 'approve':
                pesan = f"SK Piutang \"{dok['judul']}\" (Debitur: {dok.get('nama_debitur') or '-'}, Nominal: {nom_str}) telah DISETUJUI & DISAHKAN oleh Admin Eselon 1"
            else:
                pesan = f"SK Piutang \"{dok['judul']}\" perlu direvisi: {catatan}"
        else:
            pesan = "Disetujui dan dipublikasikan" if aksi == 'approve' else f"Perlu direvisi: {catatan}"

        notified_users = set()
        if dok.get("uploaded_by"):
            notified_users.add(dok["uploaded_by"])
            await buat_notifikasi(db, dok["uploaded_by"], aksi, dok["judul"], pesan, id)

        # Pastikan seluruh Admin Satker di satker terkait juga menerima notifikasi langsung
        if dok.get("satker_id"):
            cursor.execute("""
                SELECT u.id FROM users u
                JOIN roles r ON r.id = u.role_id
                WHERE u.satker_id = %s AND (u.role_id = 2 OR r.nama IN ('administrasi', 'manajemen', 'pimpinan_satker')) AND u.is_active = 1
            """, (dok["satker_id"],))
            for adm in cursor.fetchall():
                if adm["id"] not in notified_users:
                    notified_users.add(adm["id"])
                    await buat_notifikasi(db, adm["id"], aksi, dok["judul"], pesan, id)

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
        cursor.execute("SELECT d.file_path, d.judul, u.satker_id FROM dokumen d JOIN users u ON u.id = d.uploaded_by WHERE d.id = %s", (id,))
        dok = cursor.fetchone()
        if not dok: raise HTTPException(404, "Dokumen tidak ditemukan")
        
        # Proteksi isolasi Satker: Pimpinan tingkat Satker hanya boleh menghapus dokumen satkernya sendiri
        if user.get("tingkat") == "satker" and not user.get("is_it"):
            if user.get("satker_id") and dok.get("satker_id") != user.get("satker_id"):
                raise HTTPException(403, "Akses ditolak: Dokumen bukan milik Satker Anda")
        
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
    expected_bot_key = os.getenv("BOT_API_KEY")
    if not expected_bot_key or x_bot_api_key != expected_bot_key:
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

    filename = dok["file_nama"] or "dokumen.pdf"
    try:
        with open(file_path, "rb") as f:
            content = f.read()
        scan_res = scan_uploaded_file(content, filename)
    except Exception as e:
        scan_res = {"nominal": None, "warning": f"Gagal membaca teks otomatis berkas: {str(e)}"}

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

class BatchSaveItem(BaseModel):
    temp_filename: str
    file_nama: str
    judul: str
    tahun: int
    kategori_id: int
    bulan: Optional[int] = None
    semester: Optional[int] = None
    nama_bank: Optional[str] = None
    nomor_rekening: Optional[str] = None
    nama_rekening: Optional[str] = None
    nominal: Optional[float] = None
    tanggal_surat: Optional[str] = None
    deskripsi: Optional[str] = None

class BatchSaveRequest(BaseModel):
    batch_id: str
    items: List[BatchSaveItem]

@router.post("/batch-scan")
async def batch_scan_dokumen(
    zip_file: Optional[UploadFile] = File(None),
    files: Optional[List[UploadFile]] = File(None),
    user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Scan masal file dari file ZIP atau dari 1 folder (multiple file picker).
    Mengekstrak bank, no rek, nama rek, dan saldo akhir tiap dokumen secara otomatis.
    """
    is_uploader = (
        user.get("role") in ["operator", "it", "admin_it", "staff_satker"] or
        user.get("role_id") in [1, 3]
    )
    if not is_uploader:
        raise HTTPException(403, "Hanya Operator Pelaksana yang berhak mengunggah dokumen")

    batch_id = f"batch_{int(time.time()*1000)}_{uuid.uuid4().hex[:6]}"
    batch_dir = os.path.join(UPLOAD_DIR, "temp_batch", batch_id)
    os.makedirs(batch_dir, exist_ok=True)

    extracted_files = [] # list of (safe_temp_name, original_filename, file_bytes)

    # 1. Dari File ZIP
    if zip_file:
        zip_content = await zip_file.read()
        try:
            with zipfile.ZipFile(io.BytesIO(zip_content)) as z:
                idx = 0
                for info in z.infolist():
                    if info.is_dir():
                        continue
                    fname = os.path.basename(info.filename)
                    if not fname or fname.startswith(".") or fname.startswith("__MACOSX"):
                        continue
                    ext = os.path.splitext(fname)[1].lower()
                    if ext not in ALLOWED_EXTENSIONS:
                        continue
                    
                    idx += 1
                    file_bytes = z.read(info.filename)
                    safe_temp_name = f"doc_{idx:03d}_{int(time.time()*1000)}{ext}"
                    temp_path = os.path.join(batch_dir, safe_temp_name)
                    with open(temp_path, "wb") as f_out:
                        f_out.write(file_bytes)
                    extracted_files.append((safe_temp_name, fname, file_bytes))
        except Exception as e:
            shutil.rmtree(batch_dir, ignore_errors=True)
            raise HTTPException(400, f"Gagal membaca file ZIP: {str(e)}")

    # 2. Dari List File / Folder Picker
    elif files:
        idx = 0
        for f in files:
            fname = f.filename or ""
            if not fname or fname.startswith("."):
                continue
            ext = os.path.splitext(fname)[1].lower()
            if ext not in ALLOWED_EXTENSIONS:
                continue
            idx += 1
            file_bytes = await f.read()
            safe_temp_name = f"doc_{idx:03d}_{int(time.time()*1000)}{ext}"
            temp_path = os.path.join(batch_dir, safe_temp_name)
            with open(temp_path, "wb") as f_out:
                f_out.write(file_bytes)
            extracted_files.append((safe_temp_name, fname, file_bytes))

    if not extracted_files:
        shutil.rmtree(batch_dir, ignore_errors=True)
        raise HTTPException(400, "Tidak ada file dokumen yang valid ditemukan (.pdf, .xlsx, .xls, .jpg, .png)")

    # 3. Scan tiap file secara mandiri
    items = []
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id, nama, slug FROM kategori_dokumen WHERE is_active = 1")
        all_kats = cursor.fetchall()

    for idx, (temp_name, orig_name, f_bytes) in enumerate(extracted_files):
        try:
            scan_res = scan_uploaded_file(f_bytes, orig_name)
        except Exception as e:
            scan_res = {
                "success": False,
                "error": str(e),
                "nominal": None,
                "confidence": "low"
            }

        detected_kat_name = scan_res.get("kategori") or "Rekening_koran"
        matched_kat_id = 1
        for k in all_kats:
            if k["slug"].lower() in detected_kat_name.lower() or detected_kat_name.lower() in k["nama"].lower():
                matched_kat_id = k["id"]
                break

        bulan_num = scan_res.get("bulan")
        tahun_num = scan_res.get("tahun") or datetime.date.today().year

        items.append({
            "temp_id": idx + 1,
            "temp_filename": temp_name,
            "file_nama": orig_name,
            "judul": scan_res.get("judul") or os.path.splitext(orig_name)[0].replace("_", " "),
            "tahun": tahun_num,
            "bulan": bulan_num,
            "kategori_id": matched_kat_id,
            "nama_bank": scan_res.get("bank") or "",
            "nomor_rekening": scan_res.get("nomor_rekening") or "",
            "nama_rekening": scan_res.get("nama_rekening") or "",
            "nominal": scan_res.get("nominal"),
            "tanggal_surat": scan_res.get("tanggal_surat") or "",
            "deskripsi": scan_res.get("deskripsi") or "",
            "is_scanned_image": scan_res.get("is_scanned_image", False),
            "warning": scan_res.get("warning"),
            "file_size": len(f_bytes)
        })

    return {
        "success": True,
        "batch_id": batch_id,
        "total_files": len(items),
        "items": items
    }

@router.post("/batch-save")
async def batch_save_dokumen(
    payload: BatchSaveRequest,
    request: Request,
    user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Menyimpan sekaligus seluruh dokumen hasil konfirmasi batch upload ke database dan penyimpanan berkas.
    """
    is_uploader = (
        user.get("role") in ["operator", "it", "admin_it", "staff_satker"] or
        user.get("role_id") in [1, 3]
    )
    if not is_uploader:
        raise HTTPException(403, "Hanya Operator Pelaksana yang berhak mengunggah dokumen")

    batch_dir = os.path.join(UPLOAD_DIR, "temp_batch", payload.batch_id)
    if not os.path.exists(batch_dir):
        raise HTTPException(400, "Sesi batch upload telah kedaluwarsa atau berkas tidak ditemukan")

    saved_items = []
    created_by = user["id"]
    satker_id = user.get("satker_id")

    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id, nama, slug FROM kategori_dokumen")
        kat_map = {k["id"]: k for k in cursor.fetchall()}

        for item in payload.items:
            temp_path = os.path.join(batch_dir, item.temp_filename)
            if not os.path.exists(temp_path):
                continue

            file_size = os.path.getsize(temp_path)
            ext = os.path.splitext(item.file_nama)[1].lower()
            base_name = os.path.splitext(item.file_nama)[0].replace(' ', '-').lower()
            unique_name = f"{base_name}-{int(time.time()*1000)}{ext}"

            # Simpan file permanen ke UPLOAD_DIR/{item.tahun}/{unique_name}
            key = f"{item.tahun}/{unique_name}"
            perm_path = os.path.join(UPLOAD_DIR, key)
            os.makedirs(os.path.dirname(perm_path), exist_ok=True)
            shutil.copyfile(temp_path, perm_path)

            kat_info = kat_map.get(item.kategori_id)
            is_surat_rek = bool(kat_info and kat_info.get("slug") in ["surat-pembukaan-rekening-koran", "surat-penutupan-rekening-koran"])
            status_awal = 'menunggu_verifikasi' if is_surat_rek else 'terverifikasi'

            final_nom = float(item.nominal) if item.nominal is not None and not is_surat_rek else None

            # 1. Insert ke tabel dokumen
            cursor.execute("""
                INSERT INTO dokumen
                (kategori_id, uploaded_by, judul, nama_bank, nomor_rekening, tanggal_surat, nama_rekening, deskripsi, tahun, bulan, semester,
                 file_nama, file_path, file_size, file_mime, status, is_public,
                 nilai_rekening_koran, nilai_excel)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0, %s, %s)
            """, (
                item.kategori_id, created_by, item.judul, item.nama_bank, item.nomor_rekening,
                item.tanggal_surat or None, item.nama_rekening, item.deskripsi, item.tahun,
                item.bulan, item.semester, item.file_nama, key, file_size,
                "application/pdf" if ext == ".pdf" else "application/octet-stream",
                status_awal, final_nom, final_nom
            ))
            doc_id = cursor.lastrowid
            nomor_laporan = buat_nomor_laporan(kat_info["slug"] if kat_info else "", item.tahun, doc_id)
            cursor.execute("UPDATE dokumen SET nomor_laporan = %s WHERE id = %s", (nomor_laporan, doc_id))

            # 2. Insert ke rekening_koran jika kategori Rekening Koran
            BULAN_NAMES_ID = {
                1: "Januari", 2: "Februari", 3: "Maret", 4: "April",
                5: "Mei", 6: "Juni", 7: "Juli", 8: "Agustus",
                9: "September", 10: "Oktober", 11: "November", 12: "Desember"
            }
            final_periode = f"{BULAN_NAMES_ID.get(item.bulan, 'September')} {item.tahun}" if item.bulan else f"{item.tahun}"

            is_rek_koran = bool(
                item.nama_bank or
                (kat_info and "rekening" in kat_info["nama"].lower() and not is_surat_rek) or
                item.kategori_id == 1
            )
            if is_rek_koran:
                cursor.execute("""
                    INSERT INTO rekening_koran (
                        satker_id, uploaded_by, dokumen_id, nama_bank, nomor_rekening_bank,
                        nama_rekening, saldo_akhir_bulan, keterangan, tahun, periode, is_active
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
                """, (
                    satker_id, created_by, doc_id, item.nama_bank or "-",
                    item.nomor_rekening or "-", item.nama_rekening or "-",
                    final_nom or 0.0, item.deskripsi or "-", item.tahun, final_periode
                ))

            saved_items.append(doc_id)

        db.commit()

    # Bersihkan folder temporary
    shutil.rmtree(batch_dir, ignore_errors=True)

    await catat_log(db, created_by, "upload_batch", "dokumen", saved_items[0] if saved_items else 0, {
        "batch_id": payload.batch_id, "total_saved": len(saved_items)
    }, request.client.host if request.client else "127.0.0.1")

    return {
        "success": True,
        "message": f"Berhasil menyimpan {len(saved_items)} berkas sekaligus!",
        "saved_count": len(saved_items)
    }



