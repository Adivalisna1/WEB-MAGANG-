import io
import csv
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Response, File, UploadFile
from pydantic import BaseModel
from db import get_db
from auth import get_current_user
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

router = APIRouter(prefix="/api/kertas-kerja", tags=["kertas_kerja"])

# ==============================================================
# PYDANTIC SCHEMAS
# ==============================================================
class RumusItemCreate(BaseModel):
    akun_id: int
    operator: str = "tambah"  # "tambah" atau "kurang"
    urutan: int = 1

class RumusSeksiCreate(BaseModel):
    nama_seksi: str
    tipe_akun_filter: str = "ALL"  # A, L, O, R, E, ALL
    tipe_subtotal: str = "subtotal"  # "subtotal" atau "total"
    urutan: int = 1
    items: List[RumusItemCreate] = []

class RumusCreateRequest(BaseModel):
    nama_rumus: str
    deskripsi: Optional[str] = None
    scope: str = "universal"  # "universal" atau "eselon_1"
    eselon_1_id: Optional[int] = None
    seksi_list: List[RumusSeksiCreate] = []

class TransaksiNilaiItem(BaseModel):
    rumus_item_id: int
    akun_id: int
    nominal: float

class KertasKerjaSaveRequest(BaseModel):
    rumus_id: int
    tahun: int
    bulan: int
    saldo_awal: float = 0.0
    total_penambah: float = 0.0
    total_pengurang: float = 0.0
    saldo_akhir: float = 0.0
    catatan: Optional[str] = None
    status: str = "draft"  # "draft", "diajukan", "terverifikasi"
    nilai_list: List[TransaksiNilaiItem] = []

class KoreksiRequestCreate(BaseModel):
    submission_id: int
    nomor_surat: str
    tanggal_surat: str
    alasan: str
    file_surat_path: Optional[str] = None

class KoreksiReviewAction(BaseModel):
    catatan: Optional[str] = None


# ==============================================================
# 1. ENDPOINT MASTER AKUN (PENCARIAN & SMART FILTER)
# ==============================================================
@router.get("/akun")
async def get_master_akun(
    tipe: Optional[str] = Query(None, description="Tipe Akun: A, L, O, R, E"),
    q: Optional[str] = Query(None, description="Kata kunci kode atau nama akun"),
    limit: int = Query(50, ge=1, le=300),
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    with db.cursor(dictionary=True) as cursor:
        where_clauses = ["is_active = 1"]
        params = []

        if tipe and tipe.upper() in ["A", "L", "O", "R", "E"]:
            where_clauses.append("tipe_akun = %s")
            params.append(tipe.upper())

        if q and q.strip():
            kw = f"%{q.strip()}%"
            where_clauses.append("(kode_akun LIKE %s OR nama_akun LIKE %s)")
            params.extend([kw, kw])

        where_sql = " AND ".join(where_clauses)
        sql = f"""
            SELECT id, kode_akun, nama_akun, tipe_akun, kategori_nama, normal_balance
            FROM master_akun
            WHERE {where_sql}
            ORDER BY kode_akun ASC
            LIMIT %s
        """
        params.append(limit)
        cursor.execute(sql, tuple(params))
        akuns = cursor.fetchall()

        return {"success": True, "total": len(akuns), "data": akuns}


# ==============================================================
# 2. ENDPOINT RUMUS (LIST, DETAIL, CREATE, UPDATE, DELETE)
# ==============================================================
@router.get("/rumus")
async def get_rumus_list(
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Mengambil daftar rumus yang berhak diakses user:
    - Admin IT: melihat semua rumus (Universal + seluruh Eselon 1)
    - Eselon 1: melihat Universal + rumus unit Eselon 1 miliknya
    - Satker: melihat Universal + rumus milik pembina Eselon 1 satker tersebut
    """
    user_role = current_user.get("role")
    user_tingkat = current_user.get("tingkat")
    user_eselon_id = current_user.get("eselon_1_id")

    with db.cursor(dictionary=True) as cursor:
        # Jika user adalah satker dan eselon_1_id di user kosong, cari dari tabel satkers
        if user_tingkat == "satker" and not user_eselon_id and current_user.get("satker_id"):
            cursor.execute("SELECT eselon_1_id FROM satkers WHERE id = %s", (current_user["satker_id"],))
            s_row = cursor.fetchone()
            if s_row:
                user_eselon_id = s_row.get("eselon_1_id")

        if user_role == "it" or current_user.get("role_id") == 3:
            # IT melihat semuanya
            cursor.execute("""
                SELECT r.*, ue.singkatan as eselon_singkatan, ue.nama as eselon_nama, u.nama as pembuat_nama,
                       (SELECT COUNT(*) FROM kertas_kerja_rumus_item kki 
                        JOIN kertas_kerja_rumus_seksi kks ON kks.id = kki.seksi_id 
                        WHERE kks.rumus_id = r.id) as total_akun
                FROM kertas_kerja_rumus r
                LEFT JOIN unit_eselon_1 ue ON ue.id = r.eselon_1_id
                LEFT JOIN users u ON u.id = r.created_by_user_id
                WHERE r.is_active = 1
                ORDER BY r.scope DESC, r.created_at DESC
            """)
        elif user_tingkat in ["eselon_1", "kl"] or user_eselon_id:
            # Eselon 1 atau Satker di bawah binaan Eselon 1
            cursor.execute("""
                SELECT r.*, ue.singkatan as eselon_singkatan, ue.nama as eselon_nama, u.nama as pembuat_nama,
                       (SELECT COUNT(*) FROM kertas_kerja_rumus_item kki 
                        JOIN kertas_kerja_rumus_seksi kks ON kks.id = kki.seksi_id 
                        WHERE kks.rumus_id = r.id) as total_akun
                FROM kertas_kerja_rumus r
                LEFT JOIN unit_eselon_1 ue ON ue.id = r.eselon_1_id
                LEFT JOIN users u ON u.id = r.created_by_user_id
                WHERE r.is_active = 1
                  AND (r.scope = 'universal' OR r.eselon_1_id = %s)
                ORDER BY r.scope DESC, r.created_at DESC
            """, (user_eselon_id,))
        else:
            # Fallback untuk user umum: hanya yang universal
            cursor.execute("""
                SELECT r.*, ue.singkatan as eselon_singkatan, ue.nama as eselon_nama, u.nama as pembuat_nama,
                       (SELECT COUNT(*) FROM kertas_kerja_rumus_item kki 
                        JOIN kertas_kerja_rumus_seksi kks ON kks.id = kki.seksi_id 
                        WHERE kks.rumus_id = r.id) as total_akun
                FROM kertas_kerja_rumus r
                LEFT JOIN unit_eselon_1 ue ON ue.id = r.eselon_1_id
                LEFT JOIN users u ON u.id = r.created_by_user_id
                WHERE r.is_active = 1 AND r.scope = 'universal'
                ORDER BY r.created_at DESC
            """)

        rumus_list = cursor.fetchall()
        return {"success": True, "data": rumus_list}


@router.get("/rumus/{rumus_id}")
async def get_rumus_detail(
    rumus_id: int,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Mengambil struktur lengkap satu rumus: Header, Seksi-Seksi, dan Akun-Akun di dalamnya.
    """
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT r.*, ue.singkatan as eselon_singkatan, ue.nama as eselon_nama, u.nama as pembuat_nama
            FROM kertas_kerja_rumus r
            LEFT JOIN unit_eselon_1 ue ON ue.id = r.eselon_1_id
            LEFT JOIN users u ON u.id = r.created_by_user_id
            WHERE r.id = %s AND r.is_active = 1
        """, (rumus_id,))
        rumus = cursor.fetchone()
        if not rumus:
            raise HTTPException(status_code=404, detail="Rumus kertas kerja tidak ditemukan")

        # Ambil seksi-seksi
        cursor.execute("""
            SELECT id, rumus_id, nama_seksi, tipe_akun_filter, tipe_subtotal, urutan
            FROM kertas_kerja_rumus_seksi
            WHERE rumus_id = %s
            ORDER BY urutan ASC, id ASC
        """, (rumus_id,))
        seksi_list = cursor.fetchall()

        # Ambil item akun di tiap seksi
        for seksi in seksi_list:
            cursor.execute("""
                SELECT ri.id as item_id, ri.seksi_id, ri.akun_id, ri.operator, ri.urutan,
                       ma.kode_akun, ma.nama_akun, ma.tipe_akun, ma.kategori_nama, ma.normal_balance
                FROM kertas_kerja_rumus_item ri
                JOIN master_akun ma ON ma.id = ri.akun_id
                WHERE ri.seksi_id = %s
                ORDER BY ri.urutan ASC, ri.id ASC
            """, (seksi["id"],))
            seksi["items"] = cursor.fetchall()

        rumus["seksi_list"] = seksi_list
        return {"success": True, "data": rumus}


@router.post("/rumus")
async def create_rumus(
    req: RumusCreateRequest,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Membuat rumus baru (Admin IT atau Administrasi Eselon 1)
    """
    user_role = current_user.get("role")
    user_tingkat = current_user.get("tingkat")
    is_it = (user_role == "it" or current_user.get("role_id") == 3)
    is_admin = (user_role == "administrasi" or current_user.get("role_id") == 2)

    if not is_it and not (is_admin and user_tingkat in ["eselon_1", "kl"]):
        raise HTTPException(status_code=403, detail="Hanya Admin IT atau Administrasi Eselon 1 yang berhak membuat rumus.")

    # Tentukan scope dan eselon_1_id
    scope = req.scope if is_it else "eselon_1"
    eselon_id = req.eselon_1_id if is_it else current_user.get("eselon_1_id")

    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            INSERT INTO kertas_kerja_rumus (nama_rumus, deskripsi, scope, eselon_1_id, created_by_user_id, is_locked, is_active)
            VALUES (%s, %s, %s, %s, %s, 0, 1)
        """, (req.nama_rumus, req.deskripsi, scope, eselon_id, current_user["id"]))
        rumus_id = cursor.lastrowid

        for s_idx, seksi_data in enumerate(req.seksi_list, 1):
            sub_type = seksi_data.tipe_subtotal if seksi_data.tipe_subtotal in ["subtotal", "total"] else "subtotal"
            cursor.execute("""
                INSERT INTO kertas_kerja_rumus_seksi (rumus_id, nama_seksi, tipe_akun_filter, tipe_subtotal, urutan)
                VALUES (%s, %s, %s, %s, %s)
            """, (rumus_id, seksi_data.nama_seksi, seksi_data.tipe_akun_filter, sub_type, seksi_data.urutan or s_idx))
            seksi_id = cursor.lastrowid

            for i_idx, item_data in enumerate(seksi_data.items, 1):
                cursor.execute("""
                    INSERT INTO kertas_kerja_rumus_item (seksi_id, akun_id, operator, urutan)
                    VALUES (%s, %s, %s, %s)
                """, (seksi_id, item_data.akun_id, item_data.operator, item_data.urutan or i_idx))

        db.commit()
        return {"success": True, "message": "Rumus kertas kerja berhasil dibuat", "rumus_id": rumus_id}


@router.put("/rumus/{rumus_id}")
async def update_rumus(
    rumus_id: int,
    req: RumusCreateRequest,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Mengubah rumus jika is_locked == 0
    """
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM kertas_kerja_rumus WHERE id = %s", (rumus_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Rumus tidak ditemukan")

        # Cek proteksi lock: jika terkunci, perbolehkan update opsi tampilan tipe_subtotal (Subtotal vs Total)
        if existing["is_locked"] == 1:
            for s_idx, seksi_data in enumerate(req.seksi_list, 1):
                sub_type = seksi_data.tipe_subtotal if seksi_data.tipe_subtotal in ["subtotal", "total"] else "subtotal"
                cursor.execute("""
                    UPDATE kertas_kerja_rumus_seksi
                    SET tipe_subtotal = %s
                    WHERE rumus_id = %s AND (nama_seksi = %s OR urutan = %s)
                """, (sub_type, rumus_id, seksi_data.nama_seksi, seksi_data.urutan or s_idx))
            db.commit()
            return {
                "success": True,
                "message": "Pengaturan lajur Subtotal / Total Utama berhasil diperbarui."
            }

        # Update header
        cursor.execute("""
            UPDATE kertas_kerja_rumus
            SET nama_rumus = %s, deskripsi = %s, scope = %s, eselon_1_id = %s
            WHERE id = %s
        """, (req.nama_rumus, req.deskripsi, req.scope, req.eselon_1_id, rumus_id))

        # Hapus seksi & item lama (cascade akan menghapus item)
        cursor.execute("DELETE FROM kertas_kerja_rumus_seksi WHERE rumus_id = %s", (rumus_id,))

        # Masukkan seksi & item baru
        for s_idx, seksi_data in enumerate(req.seksi_list, 1):
            sub_type = seksi_data.tipe_subtotal if seksi_data.tipe_subtotal in ["subtotal", "total"] else "subtotal"
            cursor.execute("""
                INSERT INTO kertas_kerja_rumus_seksi (rumus_id, nama_seksi, tipe_akun_filter, tipe_subtotal, urutan)
                VALUES (%s, %s, %s, %s, %s)
            """, (rumus_id, seksi_data.nama_seksi, seksi_data.tipe_akun_filter, sub_type, seksi_data.urutan or s_idx))
            seksi_id = cursor.lastrowid

            for i_idx, item_data in enumerate(seksi_data.items, 1):
                cursor.execute("""
                    INSERT INTO kertas_kerja_rumus_item (seksi_id, akun_id, operator, urutan)
                    VALUES (%s, %s, %s, %s)
                """, (seksi_id, item_data.akun_id, item_data.operator, item_data.urutan or i_idx))

        db.commit()
        return {"success": True, "message": "Rumus kertas kerja berhasil diperbarui"}


@router.delete("/rumus/{rumus_id}")
async def delete_rumus(
    rumus_id: int,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM kertas_kerja_rumus WHERE id = %s", (rumus_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Rumus tidak ditemukan")

        if existing["is_locked"] == 1:
            raise HTTPException(
                status_code=400,
                detail="Rumus ini tidak dapat dihapus karena sudah pernah digunakan oleh satker."
            )

        cursor.execute("UPDATE kertas_kerja_rumus SET is_active = 0 WHERE id = %s", (rumus_id,))
        db.commit()
        return {"success": True, "message": "Rumus berhasil dihapus / dinonaktifkan"}


# ==============================================================
# 3. ENDPOINT TRANSAKSI KERTAS KERJA SATKER (INPUT & SIMPAN)
# ==============================================================
@router.get("/transaksi")
async def get_kertas_kerja_transaksi(
    satker_id: Optional[int] = Query(None),
    tahun: int = Query(...),
    bulan: int = Query(...),
    rumus_id: Optional[int] = Query(None),
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Mengambil data kertas kerja yang sudah tersimpan untuk satker dan periode tertentu.
    """
    # Tentukan satker_id: jika operator satker, paksa pakai satker_id miliknya
    target_satker_id = satker_id
    if current_user.get("tingkat") == "satker" or current_user.get("satker_id"):
        target_satker_id = current_user.get("satker_id")

    with db.cursor(dictionary=True) as cursor:
        where_clauses = ["kks.tahun = %s", "kks.bulan = %s"]
        params = [tahun, bulan]

        if target_satker_id:
            where_clauses.append("kks.satker_id = %s")
            params.append(target_satker_id)
        if rumus_id:
            where_clauses.append("kks.rumus_id = %s")
            params.append(rumus_id)

        sql = f"""
            SELECT kks.*, s.nama as satker_nama, s.NO_Satker as satker_kode, r.nama_rumus, u.nama as pengisi_nama
            FROM kertas_kerja_satker kks
            JOIN satkers s ON s.id = kks.satker_id
            JOIN kertas_kerja_rumus r ON r.id = kks.rumus_id
            LEFT JOIN users u ON u.id = kks.created_by_user_id
            WHERE {' AND '.join(where_clauses)}
            ORDER BY kks.updated_at DESC
        """
        cursor.execute(sql, tuple(params))
        submissions = cursor.fetchall()

        # Ambil rincian nilai per item untuk submission pertama jika spesifik rumus_id atau ada data
        if submissions and rumus_id:
            sub = submissions[0]
            cursor.execute("""
                SELECT kn.rumus_item_id, kn.akun_id, kn.nominal, ma.kode_akun, ma.nama_akun
                FROM kertas_kerja_satker_nilai kn
                JOIN master_akun ma ON ma.id = kn.akun_id
                WHERE kn.kertas_kerja_id = %s
            """, (sub["id"],))
            sub["nilai_detail"] = cursor.fetchall()
            return {"success": True, "data": sub}

        return {"success": True, "data": submissions}


@router.get("/transaksi/{kertas_kerja_id}")
async def get_kertas_kerja_transaksi_by_id(
    kertas_kerja_id: int,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Mengambil data kertas kerja spesifik berdasarkan ID langsung beserta seluruh rincian nilai akunnya.
    """
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT kks.*, s.nama as satker_nama, s.NO_Satker as satker_kode, r.nama_rumus, u.nama as pengisi_nama
            FROM kertas_kerja_satker kks
            JOIN satkers s ON s.id = kks.satker_id
            JOIN kertas_kerja_rumus r ON r.id = kks.rumus_id
            LEFT JOIN users u ON u.id = kks.created_by_user_id
            WHERE kks.id = %s
        """, (kertas_kerja_id,))
        sub = cursor.fetchone()
        if not sub:
            raise HTTPException(status_code=404, detail="Data Kertas Kerja tidak ditemukan")

        cursor.execute("""
            SELECT kn.rumus_item_id, kn.akun_id, kn.nominal, ma.kode_akun, ma.nama_akun
            FROM kertas_kerja_satker_nilai kn
            JOIN master_akun ma ON ma.id = kn.akun_id
            WHERE kn.kertas_kerja_id = %s
        """, (kertas_kerja_id,))
        sub["nilai_detail"] = cursor.fetchall()
        return {"success": True, "data": sub}


@router.post("/transaksi")
async def save_kertas_kerja_transaksi(
    req: KertasKerjaSaveRequest,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Operator menyimpan angka kertas kerja:
    - Menyimpan Saldo Awal, Penambah, Pengurang, Saldo Akhir
    - Mengunci rumus terkait (is_locked = 1) agar tidak bisa diedit sembarangan
    """
    satker_id = current_user.get("satker_id")
    if not satker_id:
        raise HTTPException(status_code=400, detail="Akun Anda tidak terikat dengan Satker pelaksana.")

    user_role = current_user.get("role")
    user_tingkat = current_user.get("tingkat")
    if user_role == "administrasi" and user_tingkat == "satker":
        raise HTTPException(
            status_code=403,
            detail="Pimpinan / Admin Satker hanya berwenang memantau kertas kerja, tidak dapat menginput atau mengubah transaksi."
        )

    with db.cursor(dictionary=True) as cursor:
        # Cek apakah sudah ada untuk periode & rumus ini
        cursor.execute("""
            SELECT id FROM kertas_kerja_satker
            WHERE satker_id = %s AND tahun = %s AND bulan = %s AND rumus_id = %s
        """, (satker_id, req.tahun, req.bulan, req.rumus_id))
        existing = cursor.fetchone()

        if existing:
            kk_id = existing["id"]
            cursor.execute("SELECT status FROM kertas_kerja_satker WHERE id = %s", (kk_id,))
            st_row = cursor.fetchone()
            curr_status = st_row.get("status") if st_row else "draft"

            # Proteksi gembok audit: jika diajukan/terverifikasi dan bukan revisi atau koreksi_terbuka
            if curr_status in ["diajukan", "terverifikasi", "permohonan_koreksi"] and curr_status != "koreksi_terbuka":
                raise HTTPException(
                    status_code=400,
                    detail="Kertas kerja pada periode ini telah diajukan/terkunci. Untuk melakukan pembetulan data, silakan ajukan Surat Memo Permohonan Koreksi resmi ke Eselon 1 / K/L."
                )

            # Jika sebelumnya koreksi_terbuka dan disimpan ulang -> otomatis re-lock ke diajukan
            new_status = req.status
            if curr_status == "koreksi_terbuka" and req.status in ["diajukan", "terverifikasi"]:
                new_status = "diajukan"

            cursor.execute("""
                UPDATE kertas_kerja_satker
                SET saldo_awal = %s, total_penambah = %s, total_pengurang = %s, saldo_akhir = %s,
                    catatan = %s, status = %s, created_by_user_id = %s, updated_at = NOW()
                WHERE id = %s
            """, (req.saldo_awal, req.total_penambah, req.total_pengurang, req.saldo_akhir,
                  req.catatan, new_status, current_user["id"], kk_id))
            # Hapus nilai detail lama
            cursor.execute("DELETE FROM kertas_kerja_satker_nilai WHERE kertas_kerja_id = %s", (kk_id,))
        else:
            cursor.execute("""
                INSERT INTO kertas_kerja_satker (satker_id, rumus_id, tahun, bulan, saldo_awal, total_penambah, total_pengurang, saldo_akhir, catatan, status, created_by_user_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (satker_id, req.rumus_id, req.tahun, req.bulan, req.saldo_awal, req.total_penambah, req.total_pengurang, req.saldo_akhir,
                  req.catatan, req.status, current_user["id"]))
            kk_id = cursor.lastrowid

        # Simpan nilai rincian akun
        for item in req.nilai_list:
            cursor.execute("""
                INSERT INTO kertas_kerja_satker_nilai (kertas_kerja_id, rumus_item_id, akun_id, nominal)
                VALUES (%s, %s, %s, %s)
            """, (kk_id, item.rumus_item_id, item.akun_id, item.nominal))

        # KUNCI RUMUS TERKAIT: is_locked = 1
        cursor.execute("UPDATE kertas_kerja_rumus SET is_locked = 1 WHERE id = %s", (req.rumus_id,))

        db.commit()
        return {"success": True, "message": "Kertas kerja berhasil disimpan ke database", "kertas_kerja_id": kk_id}


# ==============================================================
# 4. ENDPOINT EKSPOR KERTAS KERJA (EXCEL & CSV)
# ==============================================================
@router.get("/export/{kertas_kerja_id}")
async def export_kertas_kerja(
    kertas_kerja_id: int,
    format: str = Query("xlsx", pattern="^(xlsx|csv)$"),
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT kks.*, s.nama as satker_nama, s.NO_Satker as satker_kode, r.nama_rumus, u.nama as pengisi_nama
            FROM kertas_kerja_satker kks
            JOIN satkers s ON s.id = kks.satker_id
            JOIN kertas_kerja_rumus r ON r.id = kks.rumus_id
            LEFT JOIN users u ON u.id = kks.created_by_user_id
            WHERE kks.id = %s
        """, (kertas_kerja_id,))
        kk = cursor.fetchone()
        if not kk:
            raise HTTPException(status_code=404, detail="Data Kertas Kerja tidak ditemukan")

        # Ambil rincian seksi & nilai akun beserta tipe_subtotal
        cursor.execute("""
            SELECT s.id as seksi_id, s.nama_seksi, s.tipe_subtotal, s.urutan as seksi_urutan,
                   ri.id as item_id, ri.operator, ma.kode_akun, ma.nama_akun,
                   COALESCE(kn.nominal, 0) as nominal
            FROM kertas_kerja_rumus_seksi s
            JOIN kertas_kerja_rumus_item ri ON ri.seksi_id = s.id
            JOIN master_akun ma ON ma.id = ri.akun_id
            LEFT JOIN kertas_kerja_satker_nilai kn ON kn.kertas_kerja_id = %s AND kn.rumus_item_id = ri.id
            WHERE s.rumus_id = %s
            ORDER BY s.urutan ASC, ri.urutan ASC
        """, (kertas_kerja_id, kk["rumus_id"]))
        rows = cursor.fetchall()

    bulan_nama = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][kk["bulan"] - 1]
    filename_base = f"Kertas_Kerja_{kk['satker_kode']}_{bulan_nama}_{kk['tahun']}"

    # Kelompokkan data per seksi untuk perhitungan Subtotal vs Total
    from itertools import groupby
    seksi_groups = []
    for seksi_id, group_items in groupby(rows, key=lambda x: x["seksi_id"]):
        items = list(group_items)
        seksi_groups.append({
            "seksi_id": seksi_id,
            "nama_seksi": items[0]["nama_seksi"],
            "tipe_subtotal": items[0].get("tipe_subtotal") or "subtotal",
            "items": items
        })

    # EXPORT CSV
    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["LAPORAN KERTAS KERJA KEUANGAN SATKER (MULTI-COLUMN LAJUR AKUNTANSI)"])
        writer.writerow(["Nama Satker", kk["satker_nama"]])
        writer.writerow(["Kode Satker", kk["satker_kode"]])
        writer.writerow(["Periode", f"{bulan_nama} {kk['tahun']}"])
        writer.writerow(["Nama Rumus", kk["nama_rumus"]])
        writer.writerow([])
        writer.writerow(["No", "Seksi / Kategori", "Kode Akun", "Nama Akun", "Sifat (+/-)", "Rincian / Subtotal (Rp)", "Total Utama (Rp)"])

        row_counter = 1
        for grp in seksi_groups:
            subtotal_seksi = 0.0
            for r in grp["items"]:
                val = float(r["nominal"])
                if r["operator"] == "tambah":
                    subtotal_seksi += val
                else:
                    subtotal_seksi -= val

                sifat = "(+) Penambah" if r["operator"] == "tambah" else "(-) Pengurang"
                writer.writerow([row_counter, grp["nama_seksi"], r["kode_akun"], r["nama_akun"], sifat, f"{val:,.2f}", ""])
                row_counter += 1

            # Baris Akumulasi Seksi (Subtotal vs Total)
            is_sub = (grp["tipe_subtotal"] == "subtotal")
            if is_sub:
                writer.writerow(["", f"↳ SUBTOTAL {grp['nama_seksi']}", "", "", "Subtotal", f"{subtotal_seksi:,.2f}", ""])
            else:
                writer.writerow(["", f"TOTAL {grp['nama_seksi']}", "", "", "Total Utama", "", f"{subtotal_seksi:,.2f}"])

        writer.writerow([])
        writer.writerow(["", "SALDO AWAL KAS", "-", "Saldo Awal Kas", "+", "", f"{kk['saldo_awal']:,.2f}"])
        writer.writerow(["", "TOTAL PENAMBAH KAS", "", "", "+", "", f"{kk['total_penambah']:,.2f}"])
        writer.writerow(["", "TOTAL PENGURANG KAS", "", "", "-", "", f"{kk['total_pengurang']:,.2f}"])
        writer.writerow(["", "SALDO AKHIR REKONSILIASI KAS", "", "", "=", "", f"{kk['saldo_akhir']:,.2f}"])

        csv_data = output.getvalue()
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename_base}.csv"}
        )

    # EXPORT EXCEL (XLSX)
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Kertas Kerja"

    # Styling
    font_title = Font(name="Calibri", size=14, bold=True, color="1E3A8A")
    font_bold = Font(name="Calibri", size=11, bold=True)
    font_header = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    fill_header = PatternFill(start_color="1E40AF", end_color="1E40AF", fill_type="solid")
    fill_subtotal = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
    fill_total = PatternFill(start_color="E2E8F0", end_color="E2E8F0", fill_type="solid")
    fill_saldo_akhir = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
    font_saldo_akhir = Font(name="Calibri", size=12, bold=True, color="166534")

    # Header Dokumen
    ws.merge_cells("A1:G1")
    ws["A1"] = "LEMBAR KERTAS KERJA REKONSILIASI KAS SATKER"
    ws["A1"].font = font_title

    ws["A3"] = "Nama Satker:"
    ws["B3"] = kk["satker_nama"]
    ws["A4"] = "Kode Satker:"
    ws["B4"] = kk["satker_kode"]
    ws["A5"] = "Periode:"
    ws["B5"] = f"{bulan_nama} {kk['tahun']}"
    ws["A6"] = "Dasar Rumus:"
    ws["B6"] = kk["nama_rumus"]

    for row_idx in range(3, 7):
        ws[f"A{row_idx}"].font = font_bold

    # Table Header (Row 8) - Multi Column Akuntansi
    headers = ["No", "Seksi / Kategori", "Kode Akun", "Nama Akun", "Sifat", "Rincian / Subtotal (Rp)", "Total Utama (Rp)"]
    for col_idx, h in enumerate(headers, 1):
        cell = ws.cell(row=8, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal="center", vertical="center")

    curr_row = 9
    row_no = 1

    for grp in seksi_groups:
        subtotal_seksi = 0.0
        for r in grp["items"]:
            val = float(r["nominal"])
            if r["operator"] == "tambah":
                subtotal_seksi += val
            else:
                subtotal_seksi -= val

            ws.cell(row=curr_row, column=1, value=row_no).alignment = Alignment(horizontal="center")
            ws.cell(row=curr_row, column=2, value=grp["nama_seksi"])
            ws.cell(row=curr_row, column=3, value=r["kode_akun"]).alignment = Alignment(horizontal="center")
            ws.cell(row=curr_row, column=4, value=r["nama_akun"])
            ws.cell(row=curr_row, column=5, value="(+) Penambah" if r["operator"] == "tambah" else "(-) Pengurang").alignment = Alignment(horizontal="center")
            
            # Nilai Akun masuk ke Kolom Rincian/Subtotal (Kolom 6)
            c_val = ws.cell(row=curr_row, column=6, value=val)
            c_val.number_format = '#,##0'
            ws.cell(row=curr_row, column=7, value="-").alignment = Alignment(horizontal="center")
            
            curr_row += 1
            row_no += 1

        # Baris Subtotal atau Total Kelompok
        is_sub = (grp["tipe_subtotal"] == "subtotal")
        if is_sub:
            # Subtotal: masuk ke Kolom 6
            ws.cell(row=curr_row, column=2, value=f"↳ SUBTOTAL {grp['nama_seksi']}").font = font_bold
            ws.merge_cells(start_row=curr_row, start_column=2, end_row=curr_row, end_column=5)
            c_sub = ws.cell(row=curr_row, column=6, value=subtotal_seksi)
            c_sub.font = font_bold
            c_sub.number_format = '#,##0'
            c_sub.fill = fill_subtotal
            ws.cell(row=curr_row, column=7, value="-").alignment = Alignment(horizontal="center")
        else:
            # Total: masuk ke Kolom 7 (Total Utama)
            ws.cell(row=curr_row, column=2, value=f"TOTAL {grp['nama_seksi']}").font = font_bold
            ws.merge_cells(start_row=curr_row, start_column=2, end_row=curr_row, end_column=5)
            ws.cell(row=curr_row, column=6, value="-").alignment = Alignment(horizontal="center")
            c_tot = ws.cell(row=curr_row, column=7, value=subtotal_seksi)
            c_tot.font = font_bold
            c_tot.number_format = '#,##0'
            c_tot.fill = fill_total

        curr_row += 1

    # Rekapitulasi Total Utama di Kolom 7
    curr_row += 1
    ws.cell(row=curr_row, column=4, value="SALDO AWAL KAS").font = font_bold
    ws.cell(row=curr_row, column=6, value="-").alignment = Alignment(horizontal="center")
    cell_saldo_awal = ws.cell(row=curr_row, column=7, value=float(kk["saldo_awal"]))
    cell_saldo_awal.font = font_bold
    cell_saldo_awal.number_format = '#,##0'
    curr_row += 1

    ws.cell(row=curr_row, column=4, value="TOTAL PENAMBAH (+)").font = font_bold
    ws.cell(row=curr_row, column=6, value="-").alignment = Alignment(horizontal="center")
    cell_tot_penambah = ws.cell(row=curr_row, column=7, value=float(kk["total_penambah"]))
    cell_tot_penambah.font = font_bold
    cell_tot_penambah.number_format = '#,##0'
    curr_row += 1

    ws.cell(row=curr_row, column=4, value="TOTAL PENGURANG (-)").font = font_bold
    ws.cell(row=curr_row, column=6, value="-").alignment = Alignment(horizontal="center")
    cell_tot_pengurang = ws.cell(row=curr_row, column=7, value=float(kk["total_pengurang"]))
    cell_tot_pengurang.font = font_bold
    cell_tot_pengurang.number_format = '#,##0'
    curr_row += 1

    ws.cell(row=curr_row, column=4, value="SALDO AKHIR REKONSILIASI KAS").font = font_saldo_akhir
    ws.cell(row=curr_row, column=6, value="-").alignment = Alignment(horizontal="center")
    cell_saldo_akhir = ws.cell(row=curr_row, column=7, value=float(kk["saldo_akhir"]))
    cell_saldo_akhir.font = font_saldo_akhir
    cell_saldo_akhir.fill = fill_saldo_akhir
    cell_saldo_akhir.number_format = '#,##0'

    # Auto-adjust column widths
    ws.column_dimensions["A"].width = 6
    ws.column_dimensions["B"].width = 28
    ws.column_dimensions["C"].width = 14
    ws.column_dimensions["D"].width = 45
    ws.column_dimensions["E"].width = 16
    ws.column_dimensions["F"].width = 24
    ws.column_dimensions["G"].width = 24

    excel_stream = io.BytesIO()
    wb.save(excel_stream)
    excel_stream.seek(0)

    return Response(
        content=excel_stream.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename_base}.xlsx"}
    )


# ==============================================================
# 4.B ENDPOINT TEMPLATE & IMPORT EXCEL KERTAS KERJA
# ==============================================================
@router.get("/template/{rumus_id}")
async def download_excel_template(
    rumus_id: int,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Menghasilkan template berkas Excel (.xlsx) rapi dan terstandarisasi untuk rumus kertas kerja yang dipilih.
    Memudahkan satker menginput ratusan transaksi offline lalu mengunggahnya (import) dalam 1 klik.
    """
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM kertas_kerja_rumus WHERE id = %s", (rumus_id,))
        rumus = cursor.fetchone()
        if not rumus:
            raise HTTPException(status_code=404, detail="Rumus kertas kerja tidak ditemukan.")

        cursor.execute("""
            SELECT ri.id as item_id, ri.seksi_id, ri.akun_id, ri.operator, ri.urutan,
                   s.nama_seksi, s.tipe_subtotal,
                   ma.kode_akun, ma.nama_akun, ma.tipe_akun
            FROM kertas_kerja_rumus_seksi s
            JOIN kertas_kerja_rumus_item ri ON ri.seksi_id = s.id
            JOIN master_akun ma ON ma.id = ri.akun_id
            WHERE s.rumus_id = %s
            ORDER BY s.urutan ASC, ri.urutan ASC, ri.id ASC
        """, (rumus_id,))
        items = cursor.fetchall()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Template Kertas Kerja"

    # Styling
    font_title = Font(name="Calibri", size=13, bold=True, color="1E3A8A")
    font_subtitle = Font(name="Calibri", size=10, bold=False, color="475569")
    font_bold = Font(name="Calibri", size=10, bold=True, color="0F172A")
    font_instruction = Font(name="Calibri", size=9, italic=True, color="1E40AF")
    font_header = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    font_item = Font(name="Calibri", size=10)
    font_input = Font(name="Calibri", size=10, bold=True, color="0F172A")

    fill_header = PatternFill(start_color="1E40AF", end_color="1E40AF", fill_type="solid")
    fill_input = PatternFill(start_color="FEF9C3", end_color="FEF9C3", fill_type="solid")  # Kuning lembut / emas untuk sel inputan
    fill_meta = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

    thin_border = Border(
        left=Side(style="thin", color="CBD5E1"),
        right=Side(style="thin", color="CBD5E1"),
        top=Side(style="thin", color="CBD5E1"),
        bottom=Side(style="thin", color="CBD5E1"),
    )

    # Kop & Metadata Dokumen
    ws.merge_cells("A1:F1")
    ws["A1"] = "TEMPLATE IMPORT KERTAS KERJA REKONSILIASI KAS"
    ws["A1"].font = font_title

    ws.merge_cells("A2:F2")
    ws["A2"] = f"Format Rumus: {rumus['nama_rumus']} (ID Rumus: #{rumus_id})"
    ws["A2"].font = font_subtitle

    # Field Saldo Awal (B4)
    ws["A4"] = "Saldo Awal Kas (Rp):"
    ws["A4"].font = font_bold
    cell_saldo = ws["B4"]
    cell_saldo.value = 0
    cell_saldo.font = font_input
    cell_saldo.fill = fill_input
    cell_saldo.border = thin_border
    cell_saldo.number_format = '#,##0'
    cell_saldo.alignment = Alignment(horizontal="right")

    # Field Catatan (B5)
    ws["A5"] = "Catatan Rekonsiliasi:"
    ws["A5"].font = font_bold
    cell_catatan = ws["B5"]
    cell_catatan.value = ""
    cell_catatan.font = font_item
    cell_catatan.border = thin_border

    # Petunjuk Singkat Pengisian
    ws.merge_cells("A6:F6")
    ws["A6"] = "💡 PETUNJUK: Masukkan angka nominal di Kolom F (kuning) dan Saldo Awal di sel B4. Jangan ubah Kode Akun (Kolom C) agar otomatis terbaca sistem saat di-import."
    ws["A6"].font = font_instruction

    # Header Tabel (Baris 8)
    headers = [
        "No",
        "Kelompok / Seksi Rumus",
        "Kode Akun",
        "Uraian / Nama Akun (BAS)",
        "Sifat Mutasi",
        "Nominal (Rp) [INPUT DI SINI]"
    ]
    for col_idx, h in enumerate(headers, 1):
        cell = ws.cell(row=8, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin_border
    ws.row_dimensions[8].height = 28

    curr_row = 9
    for idx, it in enumerate(items, 1):
        # Col 1: No
        c1 = ws.cell(row=curr_row, column=1, value=idx)
        c1.alignment = Alignment(horizontal="center")
        c1.font = font_item
        c1.border = thin_border

        # Col 2: Seksi
        c2 = ws.cell(row=curr_row, column=2, value=it["nama_seksi"])
        c2.font = font_item
        c2.border = thin_border

        # Col 3: Kode Akun (teks string)
        c3 = ws.cell(row=curr_row, column=3, value=str(it["kode_akun"]))
        c3.alignment = Alignment(horizontal="center")
        c3.font = font_bold
        c3.border = thin_border
        c3.number_format = "@"

        # Col 4: Nama Akun
        c4 = ws.cell(row=curr_row, column=4, value=it["nama_akun"])
        c4.font = font_item
        c4.border = thin_border

        # Col 5: Sifat Mutasi
        sifat_label = "(+) Kas Masuk" if it["operator"] == "tambah" else "(-) Kas Keluar"
        c5 = ws.cell(row=curr_row, column=5, value=sifat_label)
        c5.alignment = Alignment(horizontal="center")
        c5.font = font_item
        c5.border = thin_border

        # Col 6: Nominal Input
        c6 = ws.cell(row=curr_row, column=6, value=0)
        c6.font = font_input
        c6.fill = fill_input
        c6.border = thin_border
        c6.number_format = '#,##0'
        c6.alignment = Alignment(horizontal="right")

        ws.row_dimensions[curr_row].height = 20
        curr_row += 1

    # Lebar Kolom
    ws.column_dimensions["A"].width = 6
    ws.column_dimensions["B"].width = 30
    ws.column_dimensions["C"].width = 16
    ws.column_dimensions["D"].width = 46
    ws.column_dimensions["E"].width = 18
    ws.column_dimensions["F"].width = 28

    excel_stream = io.BytesIO()
    wb.save(excel_stream)
    excel_stream.seek(0)

    clean_nama = "".join(c for c in rumus["nama_rumus"] if c.isalnum() or c in (" ", "_", "-")).strip().replace(" ", "_")
    filename = f"Template_Kertas_Kerja_{clean_nama}.xlsx"

    return Response(
        content=excel_stream.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/import-excel")
async def import_excel_kertas_kerja(
    rumus_id: int = Query(...),
    file: UploadFile = File(...),
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Menerima file Excel (.xlsx / .xls), baik hasil unduhan Template resmi maupun file ekspor,
    dan memetakan nominal akun secara otomatis berdasarkan Kode Akun (BAS).
    """
    if not file.filename.lower().endswith((".xlsx", ".xls", ".xlsm")):
        raise HTTPException(status_code=400, detail="Format file tidak didukung. Harap unggah file Excel (.xlsx / .xls).")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="File yang diunggah kosong.")

    try:
        wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal membaca format file Excel: {str(e)}")

    ws = wb.active
    if not ws:
        raise HTTPException(status_code=400, detail="Lembar kerja (sheet) tidak ditemukan dalam berkas Excel.")

    # 1. Parsing Helper Angka Rupiah
    def parse_float(val) -> float:
        if val is None:
            return 0.0
        if isinstance(val, (int, float)):
            return float(val)
        s = str(val).strip()
        if not s or s in ["-", "Rp", "Rp.", "rp"]:
            return 0.0
        s = s.replace("Rp", "").replace("rp", "").strip()
        if "," in s and "." in s:
            if s.rfind(",") > s.rfind("."):
                # 1.250.000,50 -> 1250000.50
                s = s.replace(".", "").replace(",", ".")
            else:
                # 1,250,000.50 -> 1250000.50
                s = s.replace(",", "")
        elif "," in s:
            parts = s.split(",")
            if len(parts[-1]) <= 2:
                s = s.replace(",", ".")
            else:
                s = s.replace(",", "")
        elif "." in s:
            parts = s.split(".")
            if len(parts) > 1 and all(len(p) == 3 for p in parts[1:]):
                s = s.replace(".", "")
        try:
            return float(s)
        except Exception:
            return 0.0

    # 2. Ekstrak Saldo Awal & Catatan dari Meta Dokumen
    saldo_awal = 0.0
    catatan = ""

    # Cek lokasi sel standar Template (B4 dan B5)
    cell_b4 = ws["B4"].value if ws.max_row >= 4 else None
    cell_b5 = ws["B5"].value if ws.max_row >= 5 else None

    if cell_b4 is not None:
        saldo_awal = parse_float(cell_b4)
    if cell_b5 is not None and str(cell_b5).strip():
        catatan = str(cell_b5).strip()

    # Scan alternatif jika Saldo Awal berada di baris lain
    if saldo_awal == 0.0:
        for r in range(1, min(ws.max_row + 1, 15)):
            for c in range(1, min(ws.max_column + 1, 6)):
                v = str(ws.cell(row=r, column=c).value or "").lower()
                if "saldo awal" in v:
                    next_val = ws.cell(row=r, column=c + 1).value
                    parsed_next = parse_float(next_val)
                    if parsed_next != 0:
                        saldo_awal = parsed_next
                        break

    # 3. Cari Baris Header Tabel
    header_row = None
    col_kode = None
    col_nominal = None
    col_total = None

    for r in range(1, min(ws.max_row + 1, 25)):
        for c in range(1, min(ws.max_column + 1, 15)):
            txt = str(ws.cell(row=r, column=c).value or "").strip().lower()
            if ("kode" in txt and "akun" in txt) or txt == "kode":
                header_row = r
                col_kode = c
                break
        if header_row is not None:
            break

    # Cari kolom nominal pada baris header yang ditemukan
    if header_row is not None:
        for c in range(1, min(ws.max_column + 1, 15)):
            txt = str(ws.cell(row=header_row, column=c).value or "").strip().lower()
            if any(k in txt for k in ["nominal", "rincian", "subtotal", "jumlah", "nilai"]):
                if col_nominal is None:
                    col_nominal = c
            if "total utama" in txt or txt == "total":
                col_total = c

    # Fallback jika header tidak terdeteksi otomatis
    if header_row is None:
        header_row = 8
    if col_kode is None:
        col_kode = 3
    if col_nominal is None:
        col_nominal = 6

    # 4. Ambil Akun-Akun Rumus dari Database
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT ri.id as item_id, ri.seksi_id, ri.akun_id, ri.operator,
                   s.nama_seksi, ma.kode_akun, ma.nama_akun
            FROM kertas_kerja_rumus_seksi s
            JOIN kertas_kerja_rumus_item ri ON ri.seksi_id = s.id
            JOIN master_akun ma ON ma.id = ri.akun_id
            WHERE s.rumus_id = %s
        """, (rumus_id,))
        formula_items = cursor.fetchall()

        cursor.execute("SELECT id, kode_akun, nama_akun FROM master_akun")
        all_master_akun = cursor.fetchall()

    def clean_code(c_str: Any) -> str:
        if c_str is None:
            return ""
        s = str(c_str).strip()
        return s.replace("#", "").replace("'", "").strip()

    formula_by_code: Dict[str, Any] = {clean_code(it["kode_akun"]): it for it in formula_items}
    master_by_code: Dict[str, int] = {clean_code(a["kode_akun"]): a["id"] for a in all_master_akun}

    nominal_map: Dict[str, float] = {}
    matched_count = 0
    unmatched_codes = []

    # 5. Baca Baris-Baris Data Akun
    start_row = header_row + 1
    for r in range(start_row, ws.max_row + 1):
        raw_kode = ws.cell(row=r, column=col_kode).value
        code = clean_code(raw_kode)
        if not code:
            continue

        # Lewati teks subtotal / total / ringkasan
        if any(w in code.lower() for w in ["total", "subtotal", "saldo", "ringkasan", "penerimaan", "pengeluaran"]):
            continue

        val_nom = ws.cell(row=r, column=col_nominal).value
        nominal = parse_float(val_nom)

        # Cek kolom total jika file yang diimport adalah hasil ekspor laporan
        if nominal == 0.0 and col_total is not None:
            val_tot = ws.cell(row=r, column=col_total).value
            alt_nom = parse_float(val_tot)
            if alt_nom != 0:
                nominal = alt_nom

        # Pemetaan nilai akun ke rumus
        if code in formula_by_code:
            it = formula_by_code[code]
            nominal_map[str(it["item_id"])] = nominal
            nominal_map[str(it["akun_id"])] = nominal
            matched_count += 1
        elif code in master_by_code:
            ak_id = master_by_code[code]
            nominal_map[str(ak_id)] = nominal
            matched_count += 1
        else:
            if code not in unmatched_codes and len(code) >= 3:
                unmatched_codes.append(code)

    return {
        "success": True,
        "message": f"Berhasil membaca {matched_count} data akun dari berkas Excel.",
        "saldo_awal": saldo_awal,
        "catatan": catatan,
        "matched_count": matched_count,
        "unmatched_count": len(unmatched_codes),
        "unmatched_codes": unmatched_codes[:10],
        "nominal_map": nominal_map
    }


# ==============================================================
# 5. ENDPOINT KOREKSI RESMI KERTAS KERJA (MEMO PENYESUAIAN)
# ==============================================================
@router.post("/koreksi-request")
async def create_koreksi_request(
    req: KoreksiRequestCreate,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    satker_id = current_user.get("satker_id")
    if not satker_id:
        raise HTTPException(status_code=400, detail="Akun Anda tidak terikat dengan Satker.")

    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM kertas_kerja_satker WHERE id = %s", (req.submission_id,))
        sub = cursor.fetchone()
        if not sub:
            raise HTTPException(status_code=404, detail="Data kertas kerja tidak ditemukan.")
        if sub["satker_id"] != satker_id:
            raise HTTPException(status_code=403, detail="Anda hanya dapat mengajukan koreksi untuk satker Anda sendiri.")

        cursor.execute("""
            INSERT INTO kertas_kerja_koreksi_request
            (satker_id, submission_id, rumus_id, tahun, bulan, nomor_surat, tanggal_surat, alasan, file_surat_path, status, created_by_user_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'menunggu_persetujuan', %s)
        """, (satker_id, req.submission_id, sub["rumus_id"], sub["tahun"], sub["bulan"],
              req.nomor_surat, req.tanggal_surat, req.alasan, req.file_surat_path, current_user["id"]))
        req_id = cursor.lastrowid

        cursor.execute("UPDATE kertas_kerja_satker SET status = 'permohonan_koreksi' WHERE id = %s", (req.submission_id,))
        db.commit()

        return {"success": True, "message": "Permohonan koreksi resmi berhasil diajukan ke Eselon 1 / K/L", "request_id": req_id}


@router.get("/koreksi-requests")
async def get_koreksi_requests(
    status: Optional[str] = Query(None),
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_tingkat = current_user.get("tingkat")
    user_satker = current_user.get("satker_id")

    with db.cursor(dictionary=True) as cursor:
        where_clauses = ["1=1"]
        params = []
        if user_tingkat == "satker" and user_satker:
            where_clauses.append("kr.satker_id = %s")
            params.append(user_satker)
        if status:
            where_clauses.append("kr.status = %s")
            params.append(status)

        sql = f"""
            SELECT kr.*, s.nama as satker_nama, s.NO_Satker as satker_kode, r.nama_rumus, u.nama as pemohon_nama,
                   ap.nama as approved_by_nama
            FROM kertas_kerja_koreksi_request kr
            JOIN satkers s ON s.id = kr.satker_id
            JOIN kertas_kerja_rumus r ON r.id = kr.rumus_id
            LEFT JOIN users u ON u.id = kr.created_by_user_id
            LEFT JOIN users ap ON ap.id = kr.approved_by_user_id
            WHERE {' AND '.join(where_clauses)}
            ORDER BY kr.created_at DESC
        """
        cursor.execute(sql, tuple(params))
        requests = cursor.fetchall()
        return {"success": True, "data": requests}


@router.patch("/koreksi-requests/{request_id}/approve")
async def approve_koreksi_request(
    request_id: int,
    body: KoreksiReviewAction,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_role = current_user.get("role")
    user_tingkat = current_user.get("tingkat")
    is_authorized = (user_tingkat in ["eselon_1", "kl"] or user_role in ["it", "admin_it", "administrasi"])
    if not is_authorized:
        raise HTTPException(status_code=403, detail="Hanya pejabat Eselon 1 / K/L yang berhak menyetujui pembukaan gembok koreksi.")

    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM kertas_kerja_koreksi_request WHERE id = %s", (request_id,))
        req_item = cursor.fetchone()
        if not req_item:
            raise HTTPException(status_code=404, detail="Permohonan koreksi tidak ditemukan.")

        cursor.execute("""
            UPDATE kertas_kerja_koreksi_request
            SET status = 'disetujui', catatan_pejabat = %s, approved_by_user_id = %s, approved_at = NOW()
            WHERE id = %s
        """, (body.catatan, current_user["id"], request_id))

        # BUKA KUNCI KERTAS KERJA: status = 'koreksi_terbuka'
        cursor.execute("UPDATE kertas_kerja_satker SET status = 'koreksi_terbuka' WHERE id = %s", (req_item["submission_id"],))
        db.commit()

        return {"success": True, "message": "Gembok Kertas Kerja berhasil dibuka untuk sesi koreksi satker."}


@router.patch("/koreksi-requests/{request_id}/reject")
async def reject_koreksi_request(
    request_id: int,
    body: KoreksiReviewAction,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_role = current_user.get("role")
    user_tingkat = current_user.get("tingkat")
    is_authorized = (user_tingkat in ["eselon_1", "kl"] or user_role in ["it", "admin_it", "administrasi"])
    if not is_authorized:
        raise HTTPException(status_code=403, detail="Hanya pejabat Eselon 1 / K/L yang berhak menolak permohonan koreksi.")

    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM kertas_kerja_koreksi_request WHERE id = %s", (request_id,))
        req_item = cursor.fetchone()
        if not req_item:
            raise HTTPException(status_code=404, detail="Permohonan koreksi tidak ditemukan.")

        cursor.execute("""
            UPDATE kertas_kerja_koreksi_request
            SET status = 'ditolak', catatan_pejabat = %s, approved_by_user_id = %s, approved_at = NOW()
            WHERE id = %s
        """, (body.catatan, current_user["id"], request_id))

        # KEMBALIKAN KE STATUS TERVERIFIKASI (TETAP TERKUNCI)
        cursor.execute("UPDATE kertas_kerja_satker SET status = 'terverifikasi' WHERE id = %s", (req_item["submission_id"],))
        db.commit()

        return {"success": True, "message": "Permohonan koreksi ditolak. Kertas kerja tetap berstatus terkunci."}
