from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Security
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from auth import get_current_user, require_admin_it
from db import get_db
import os
import shutil
import datetime

router = APIRouter(prefix="/api/pencatatan", tags=["pencatatan"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR_AKUNTANSI", "/app/uploads/akuntansi" if os.path.exists("/app") else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads", "akuntansi"))

@router.get("/kategori")
async def get_kategori(user: dict = Depends(get_current_user), db=Depends(get_db)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT id, nama as nama_kategori 
            FROM kategori_dokumen 
            WHERE is_active = 1 
            ORDER BY 
                CASE 
                    WHEN LOWER(nama) LIKE '%lainnya%' OR id = 999 THEN 1 
                    ELSE 0 
                END ASC, 
                id ASC
        """)
        rows = cursor.fetchall()
    return {"success": True, "data": rows}

@router.post("/kategori")
async def create_kategori(request: dict, user: dict = Depends(require_admin_it), db=Depends(get_db)):
    nama_kategori = request.get("nama_kategori")
    if not nama_kategori:
        raise HTTPException(400, "nama_kategori wajib diisi")
    slug = nama_kategori.lower().replace(" ", "-")
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("INSERT INTO kategori_dokumen (nama, slug, perlu_nominal, is_active) VALUES (%s, %s, 0, 1)", (nama_kategori, slug))
        db.commit()
        return {"success": True, "message": "Kategori berhasil dibuat", "insertId": cursor.lastrowid}

@router.put("/kategori/{id}")
async def update_kategori(id: int, request: dict, user: dict = Depends(require_admin_it), db=Depends(get_db)):
    nama_kategori = request.get("nama_kategori")
    if not nama_kategori:
        raise HTTPException(400, "nama_kategori wajib diisi")
    slug = nama_kategori.lower().replace(" ", "-")
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("UPDATE kategori_dokumen SET nama = %s, slug = %s WHERE id = %s", (nama_kategori, slug, id))
        db.commit()
        return {"success": True, "message": "Kategori berhasil diupdate"}

@router.delete("/kategori/{id}")
async def delete_kategori(id: int, user: dict = Depends(require_admin_it), db=Depends(get_db)):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("DELETE FROM kategori_dokumen WHERE id = %s", (id,))
        db.commit()
        return {"success": True, "message": "Kategori berhasil dihapus"}

@router.get("/file/{filename}")
async def serve_file(
    filename: str,
    token: Optional[str] = None,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(HTTPBearer(auto_error=False)),
    db=Depends(get_db)
):
    import jwt as pyjwt
    import os as _os

    # Ambil token dari query param atau header
    raw_token = token or (credentials.credentials if credentials else None)
    if not raw_token:
        raise HTTPException(401, "Token diperlukan")

    try:
        payload = pyjwt.decode(raw_token, _os.getenv("JWT_SECRET"), algorithms=["HS256"])
    except Exception:
        raise HTTPException(401, "Token tidak valid")

    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(400, "Invalid filename")

    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(404, "File tidak ditemukan")

    return FileResponse(file_path)


@router.get("")
async def get_akuntansi(user: dict = Depends(get_current_user), db=Depends(get_db)):
    tingkat = user.get("tingkat")
    satker_id = user.get("satker_id")
    eselon_1_id = user.get("eselon_1_id")
    
    where = "1=1"
    params = []
    
    if tingkat == "satker":
        if satker_id:
            where += " AND (a.satker_id = %s OR u.satker_id = %s)"
            params.extend([satker_id, satker_id])
    elif tingkat == "eselon_1":
        if eselon_1_id:
            where += " AND (s.eselon_1_id = %s OR u.eselon_1_id = %s)"
            params.extend([eselon_1_id, eselon_1_id])
            
    with db.cursor(dictionary=True) as cursor:
        query = (
            "SELECT a.*, k.nama as nama_kategori, u.nama as pembuat, u2.nama as pengedit, "
            "       COALESCE(a.satker_id, u.satker_id) as satker_id, s.nama as satker_nama "
            "FROM pencatatan a "
            "LEFT JOIN kategori_dokumen k ON a.id_kategori = k.id "
            "LEFT JOIN users u ON a.created_by = u.id "
            "LEFT JOIN users u2 ON a.updated_by = u2.id "
            "LEFT JOIN satkers s ON COALESCE(a.satker_id, u.satker_id) = s.id "
            "WHERE " + where + " "
            "ORDER BY a.tanggal DESC, a.created_at DESC"
        )
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()

        # Fallback nama bulan Indonesia jika kolom periode kosong
        nama_bulan = {
            1: "Januari", 2: "Februari", 3: "Maret", 4: "April",
            5: "Mei", 6: "Juni", 7: "Juli", 8: "Agustus",
            9: "September", 10: "Oktober", 11: "November", 12: "Desember"
        }
        for r in rows:
            if not r.get("periode") or str(r.get("periode")).strip() in ["-", "None", ""]:
                d = r.get("tanggal")
                if d:
                    if hasattr(d, "month") and hasattr(d, "year"):
                        r["periode"] = f"{nama_bulan.get(d.month, 'Januari')} {d.year}"
                    else:
                        try:
                            parts = str(d).split("-")
                            m_idx = int(parts[1])
                            r["periode"] = f"{nama_bulan.get(m_idx, 'Januari')} {parts[0]}"
                        except Exception:
                            r["periode"] = f"{datetime.date.today().strftime('%B %Y')}"
                else:
                    r["periode"] = "Periode Berjalan"

    return {"success": True, "data": rows}

@router.post("")
async def create_akuntansi(
    tanggal: Optional[str] = Form(None),
    uraian: Optional[str] = Form(None),
    jenis: Optional[str] = Form("debit"),
    id_kategori: int = Form(...),
    nominal: Optional[float] = Form(None),
    saldo_akhir: Optional[float] = Form(None),
    periode: Optional[str] = Form(None),
    satker_id: Optional[int] = Form(None),
    catatan_audit: Optional[str] = Form(None),
    nomor_rekening_bank: Optional[str] = Form(None),
    nama_rekening: Optional[str] = Form(None),
    nama_bank: Optional[str] = Form(None),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    is_allowed = (
        user.get("role") in ["operator", "manajemen", "administrasi", "it", "admin_it", "pimpinan_satker", "staff_satker"] or
        user.get("role_id") in [1, 2, 3] or
        user.get("is_operator") or
        user.get("is_manajemen") or
        user.get("is_it")
    )
    if not is_allowed:
        raise HTTPException(403, "Forbidden: Akses khusus Operator dan Manajemen Satker")
        
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filename = f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}-{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    bukti_file = f"/api/pencatatan/file/{filename}"
    
    try:
        with db.cursor(dictionary=True) as cursor:
            created_by = user["id"]
            final_satker_id = satker_id or user.get("satker_id")

            if user.get("tingkat") == "eselon_1" and user.get("eselon_1_id") and final_satker_id:
                cursor.execute("SELECT id FROM satkers WHERE id = %s AND eselon_1_id = %s", (final_satker_id, user["eselon_1_id"]))
                if not cursor.fetchone():
                    raise HTTPException(403, "Akses ditolak: Satker tidak berada di bawah binaan Eselon 1 Anda")
            
            cursor.execute("SELECT nama FROM kategori_dokumen WHERE id = %s", (id_kategori,))
            cat_res = cursor.fetchone()
            nama_kategori = cat_res["nama"].lower() if cat_res else ""
            
            final_tanggal = tanggal.strip() if tanggal and str(tanggal).strip() else datetime.date.today().isoformat()
            
            # Resolve nominal / saldo_akhir
            final_nominal = float(saldo_akhir if saldo_akhir is not None else (nominal if nominal is not None else 0))
            # Resolve periode (jika kosong, ambil nama bulan dan tahun dari final_tanggal)
            final_periode = periode.strip() if periode and str(periode).strip() else None
            if not final_periode and final_tanggal:
                nama_bulan = {
                    1: "Januari", 2: "Februari", 3: "Maret", 4: "April",
                    5: "Mei", 6: "Juni", 7: "Juli", 8: "Agustus",
                    9: "September", 10: "Oktober", 11: "November", 12: "Desember"
                }
                try:
                    parts = final_tanggal.split("-")
                    m_idx = int(parts[1])
                    final_periode = f"{nama_bulan.get(m_idx, 'Januari')} {parts[0]}"
                except Exception:
                    final_periode = datetime.date.today().strftime("%B %Y")
            # Resolve uraian
            final_uraian = uraian.strip() if uraian and uraian.strip() else f"Pencatatan {cat_res['nama'] if cat_res else 'Dokumen'} - {nama_bank or 'Bank'} ({final_periode or 'Periode Berjalan'})"
            final_jenis = jenis or "debit"

            dokumen_id = None
            if "rekening koran" in nama_kategori.replace("_", " "):
                cursor.execute("SELECT id FROM kategori_dokumen WHERE LOWER(REPLACE(nama, '_', ' ')) = %s LIMIT 1", ("rekening koran",))
                kat_dok_res = cursor.fetchone()
                kat_dok_id = kat_dok_res["id"] if kat_dok_res else 1
                
                tahun = int(final_tanggal.split("-")[0]) if "-" in final_tanggal else datetime.datetime.now().year
                
                cursor.execute("""
                    INSERT INTO dokumen (judul, kategori_id, tahun, file_path, file_nama, uploaded_by, status, is_public, nilai_excel, file_mime) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    f"Bukti Rekening Koran - {final_uraian}",
                    kat_dok_id,
                    tahun,
                    f"akuntansi/{filename}",
                    file.filename,
                    created_by,
                    'menunggu_verifikasi',
                    0,
                    final_nominal,
                    file.content_type
                ))
                dokumen_id = cursor.lastrowid
                
                cursor.execute("""
                    INSERT INTO rekening_koran (
                        satker_id, uploaded_by, nomor_rekening_bank, nama_rekening, saldo_akhir_bulan, 
                        keterangan, nama_bank, tahun, tanggal_pembukaan_rekening, dokumen_id, periode
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    final_satker_id, created_by, nomor_rekening_bank, nama_rekening, final_nominal, final_uraian,
                    nama_bank, tahun, final_tanggal, dokumen_id, final_periode
                ))
            
            cursor.execute("""
                INSERT INTO pencatatan 
                (tanggal, periode, uraian, jenis, id_kategori, satker_id, nominal, bukti_file, catatan_audit, created_by, nomor_rekening, nama_bank, nama_rekening) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (final_tanggal, final_periode, final_uraian, final_jenis, id_kategori, final_satker_id, final_nominal, bukti_file, catatan_audit, created_by, nomor_rekening_bank, nama_bank, nama_rekening))
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
    
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("UPDATE pencatatan SET id_kategori = %s, updated_by = %s WHERE id = %s", (id_kategori, user["id"], id))
        db.commit()
        return {"success": True, "message": "Kategori akuntansi berhasil diubah oleh Admin IT"}
