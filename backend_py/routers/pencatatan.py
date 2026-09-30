from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import Optional
from auth import get_current_user, require_admin_it
from db import get_db
import os
import shutil
import datetime

router = APIRouter(prefix="/api/pencatatan", tags=["pencatatan"])

UPLOAD_DIR = "/app/uploads/akuntansi"

@router.get("/kategori")
async def get_kategori(user: dict = Depends(get_current_user), db=Depends(get_db)):
    with db.cursor() as cursor:
        cursor.execute("SELECT * FROM kategori_akuntansi ORDER BY nama_kategori ASC")
        rows = cursor.fetchall()
    return {"success": True, "data": rows}

@router.post("/kategori")
async def create_kategori(request: dict, user: dict = Depends(require_admin_it), db=Depends(get_db)):
    nama_kategori = request.get("nama_kategori")
    if not nama_kategori:
        raise HTTPException(400, "nama_kategori wajib diisi")
    with db.cursor() as cursor:
        cursor.execute("INSERT INTO kategori_akuntansi (nama_kategori) VALUES (%s)", (nama_kategori,))
        db.commit()
        return {"success": True, "message": "Kategori berhasil dibuat", "insertId": cursor.lastrowid}

@router.put("/kategori/{id}")
async def update_kategori(id: int, request: dict, user: dict = Depends(require_admin_it), db=Depends(get_db)):
    nama_kategori = request.get("nama_kategori")
    if not nama_kategori:
        raise HTTPException(400, "nama_kategori wajib diisi")
    with db.cursor() as cursor:
        cursor.execute("UPDATE kategori_akuntansi SET nama_kategori = %s WHERE id = %s", (nama_kategori, id))
        db.commit()
        return {"success": True, "message": "Kategori berhasil diupdate"}

@router.delete("/kategori/{id}")
async def delete_kategori(id: int, user: dict = Depends(require_admin_it), db=Depends(get_db)):
    with db.cursor() as cursor:
        cursor.execute("DELETE FROM kategori_akuntansi WHERE id = %s", (id,))
        db.commit()
        return {"success": True, "message": "Kategori berhasil dihapus"}

@router.get("/file/{filename}")
async def serve_file(filename: str, user: dict = Depends(get_current_user)):
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(400, "Invalid filename")
    
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(404, "File tidak ditemukan")
    return FileResponse(file_path)

@router.get("")
async def get_akuntansi(user: dict = Depends(get_current_user), db=Depends(get_db)):
    with db.cursor() as cursor:
        query = """
            SELECT a.*, k.nama_kategori, u.nama as pembuat, u2.nama as pengedit,
                   u.satker_id, s.nama as satker_nama
            FROM audit_akuntansi a
            LEFT JOIN kategori_akuntansi k ON a.id_kategori = k.id
            LEFT JOIN users u ON a.created_by = u.id
            LEFT JOIN users u2 ON a.updated_by = u2.id
            LEFT JOIN satkers s ON u.satker_id = s.id
            ORDER BY a.tanggal DESC, a.created_at DESC
        """
        cursor.execute(query)
        rows = cursor.fetchall()
    return {"success": True, "data": rows}

@router.post("")
async def create_akuntansi(
    tanggal: str = Form(...),
    uraian: str = Form(...),
    jenis: str = Form(...),
    id_kategori: int = Form(...),
    nominal: float = Form(...),
    catatan_audit: Optional[str] = Form(None),
    nomor_rekening_bank: Optional[str] = Form(None),
    nama_bank: Optional[str] = Form(None),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    if user.get("role") not in ["pimpinan", "staff"]:
        raise HTTPException(403, "Forbidden")
        
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filename = f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}-{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    bukti_file = f"/api/pencatatan/file/{filename}"
    
    try:
        with db.cursor() as cursor:
            created_by = user["id"]
            satker_id = user.get("satker_id")
            
            cursor.execute("SELECT nama_kategori FROM kategori_akuntansi WHERE id = %s", (id_kategori,))
            cat_res = cursor.fetchone()
            nama_kategori = cat_res["nama_kategori"].lower() if cat_res else ""
            
            dokumen_id = None
            if "rekening koran" in nama_kategori:
                cursor.execute("SELECT id FROM kategori_dokumen WHERE LOWER(nama) = %s LIMIT 1", ("rekening koran",))
                kat_dok_res = cursor.fetchone()
                kat_dok_id = kat_dok_res["id"] if kat_dok_res else 1
                
                tahun = int(tanggal.split("-")[0]) if "-" in tanggal else datetime.datetime.now().year
                
                cursor.execute("""
                    INSERT INTO dokumen (judul, kategori_id, tahun, file_path, file_nama, uploaded_by, status, is_public) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    f"Bukti Rekening Koran - {uraian}",
                    kat_dok_id,
                    tahun,
                    bukti_file,
                    file.filename,
                    created_by,
                    'terverifikasi',
                    1
                ))
                dokumen_id = cursor.lastrowid
                
                cursor.execute("""
                    INSERT INTO kertas_kerja (
                        satker_id, uploaded_by, nomor_rekening_bank, saldo_akhir_bulan, 
                        keterangan, nama_bank, tahun, tanggal_pembukaan_rekening, dokumen_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    satker_id, created_by, nomor_rekening_bank, nominal, uraian,
                    nama_bank, tahun, tanggal, dokumen_id
                ))
            
            cursor.execute("""
                INSERT INTO audit_akuntansi 
                (tanggal, uraian, jenis, id_kategori, nominal, bukti_file, catatan_audit, created_by) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (tanggal, uraian, jenis, id_kategori, nominal, bukti_file, catatan_audit, created_by))
            insert_id = cursor.lastrowid
            
        db.commit()
        return {"success": True, "message": "Data pencatatan berhasil disimpan", "insertId": insert_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Server error: {str(e)}")

@router.patch("/{id}/kategori")
async def update_metadata(id: int, request: dict, user: dict = Depends(require_admin_it), db=Depends(get_db)):
    id_kategori = request.get("id_kategori")
    if not id_kategori:
        raise HTTPException(400, "id_kategori wajib dikirim")
    
    with db.cursor() as cursor:
        cursor.execute("UPDATE audit_akuntansi SET id_kategori = %s, updated_by = %s WHERE id = %s", (id_kategori, user["id"], id))
        db.commit()
        return {"success": True, "message": "Kategori akuntansi berhasil diubah oleh Admin IT"}
