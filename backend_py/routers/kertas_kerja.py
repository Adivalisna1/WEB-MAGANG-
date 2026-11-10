import io
import csv
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Response
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
            SELECT id, rumus_id, nama_seksi, tipe_akun_filter, urutan
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
            cursor.execute("""
                INSERT INTO kertas_kerja_rumus_seksi (rumus_id, nama_seksi, tipe_akun_filter, urutan)
                VALUES (%s, %s, %s, %s)
            """, (rumus_id, seksi_data.nama_seksi, seksi_data.tipe_akun_filter, seksi_data.urutan or s_idx))
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

        # Cek proteksi lock
        if existing["is_locked"] == 1:
            raise HTTPException(
                status_code=400,
                detail="Rumus ini sudah pernah digunakan dalam pelaporan satker dan TERKUNCI demi integritas audit riwayat data."
            )

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
            cursor.execute("""
                INSERT INTO kertas_kerja_rumus_seksi (rumus_id, nama_seksi, tipe_akun_filter, urutan)
                VALUES (%s, %s, %s, %s)
            """, (rumus_id, seksi_data.nama_seksi, seksi_data.tipe_akun_filter, seksi_data.urutan or s_idx))
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
        where_clauses = ["tahun = %s", "bulan = %s"]
        params = [tahun, bulan]

        if target_satker_id:
            where_clauses.append("satker_id = %s")
            params.append(target_satker_id)
        if rumus_id:
            where_clauses.append("rumus_id = %s")
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

        # Ambil rincian nilai per item untuk submission pertama jika spesifik
        if submissions and target_satker_id and rumus_id:
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

    with db.cursor(dictionary=True) as cursor:
        # Cek apakah sudah ada untuk periode & rumus ini
        cursor.execute("""
            SELECT id FROM kertas_kerja_satker
            WHERE satker_id = %s AND tahun = %s AND bulan = %s AND rumus_id = %s
        """, (satker_id, req.tahun, req.bulan, req.rumus_id))
        existing = cursor.fetchone()

        if existing:
            kk_id = existing["id"]
            cursor.execute("""
                UPDATE kertas_kerja_satker
                SET saldo_awal = %s, total_penambah = %s, total_pengurang = %s, saldo_akhir = %s,
                    catatan = %s, status = %s, created_by_user_id = %s, updated_at = NOW()
                WHERE id = %s
            """, (req.saldo_awal, req.total_penambah, req.total_pengurang, req.saldo_akhir,
                  req.catatan, req.status, current_user["id"], kk_id))
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

        # Ambil rincian seksi & nilai akun
        cursor.execute("""
            SELECT s.id as seksi_id, s.nama_seksi, s.urutan as seksi_urutan,
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

    # EXPORT CSV
    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["LAPORAN KERTAS KERJA KEUANGAN SATKER"])
        writer.writerow(["Nama Satker", kk["satker_nama"]])
        writer.writerow(["Kode Satker", kk["satker_kode"]])
        writer.writerow(["Periode", f"{bulan_nama} {kk['tahun']}"])
        writer.writerow(["Nama Rumus", kk["nama_rumus"]])
        writer.writerow([])
        writer.writerow(["No", "Seksi / Kategori", "Kode Akun", "Nama Akun", "Sifat (+/-)", "Nominal (Rp)"])

        writer.writerow(["-", "SALDO AWAL", "-", "Saldo Awal Kas", "+", f"{kk['saldo_awal']:,.2f}"])
        for idx, r in enumerate(rows, 1):
            sifat = "(+) Penambah" if r["operator"] == "tambah" else "(-) Pengurang"
            writer.writerow([idx, r["nama_seksi"], r["kode_akun"], r["nama_akun"], sifat, f"{r['nominal']:,.2f}"])

        writer.writerow([])
        writer.writerow(["", "", "", "TOTAL PENAMBAH", "+", f"{kk['total_penambah']:,.2f}"])
        writer.writerow(["", "", "", "TOTAL PENGURANG", "-", f"{kk['total_pengurang']:,.2f}"])
        writer.writerow(["", "", "", "SALDO AKHIR", "=", f"{kk['saldo_akhir']:,.2f}"])

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
    fill_saldo_akhir = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
    font_saldo_akhir = Font(name="Calibri", size=12, bold=True, color="166534")

    # Header Dokumen
    ws.merge_cells("A1:F1")
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

    # Table Header (Row 8)
    headers = ["No", "Seksi / Kategori", "Kode Akun", "Nama Akun", "Sifat", "Nominal (Rp)"]
    for col_idx, h in enumerate(headers, 1):
        cell = ws.cell(row=8, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal="center", vertical="center")

    curr_row = 9

    # Baris Saldo Awal
    ws.cell(row=curr_row, column=1, value=1)
    ws.cell(row=curr_row, column=2, value="SALDO AWAL")
    ws.cell(row=curr_row, column=3, value="-")
    ws.cell(row=curr_row, column=4, value="Saldo Awal Kas")
    ws.cell(row=curr_row, column=5, value="(+) Awal")
    val_cell = ws.cell(row=curr_row, column=6, value=float(kk["saldo_awal"]))
    val_cell.number_format = '#,##0'
    ws.row_dimensions[curr_row].font = font_bold
    curr_row += 1

    # Rincian Akun
    for idx, r in enumerate(rows, 2):
        ws.cell(row=curr_row, column=1, value=idx)
        ws.cell(row=curr_row, column=2, value=r["nama_seksi"])
        ws.cell(row=curr_row, column=3, value=r["kode_akun"])
        ws.cell(row=curr_row, column=4, value=r["nama_akun"])
        ws.cell(row=curr_row, column=5, value="(+) Penambah" if r["operator"] == "tambah" else "(-) Pengurang")
        n_cell = ws.cell(row=curr_row, column=6, value=float(r["nominal"]))
        n_cell.number_format = '#,##0'
        curr_row += 1

    # Rekap Total
    curr_row += 1
    ws.cell(row=curr_row, column=4, value="TOTAL PENAMBAH (+)").font = font_bold
    cell_tot_penambah = ws.cell(row=curr_row, column=6, value=float(kk["total_penambah"]))
    cell_tot_penambah.font = font_bold
    cell_tot_penambah.number_format = '#,##0'
    curr_row += 1

    ws.cell(row=curr_row, column=4, value="TOTAL PENGURANG (-)").font = font_bold
    cell_tot_pengurang = ws.cell(row=curr_row, column=6, value=float(kk["total_pengurang"]))
    cell_tot_pengurang.font = font_bold
    cell_tot_pengurang.number_format = '#,##0'
    curr_row += 1

    ws.cell(row=curr_row, column=4, value="SALDO AKHIR KAS").font = font_saldo_akhir
    cell_saldo_akhir = ws.cell(row=curr_row, column=6, value=float(kk["saldo_akhir"]))
    cell_saldo_akhir.font = font_saldo_akhir
    cell_saldo_akhir.fill = fill_saldo_akhir
    cell_saldo_akhir.number_format = '#,##0'

    # Auto-adjust column widths
    ws.column_dimensions["A"].width = 6
    ws.column_dimensions["B"].width = 28
    ws.column_dimensions["C"].width = 14
    ws.column_dimensions["D"].width = 45
    ws.column_dimensions["E"].width = 16
    ws.column_dimensions["F"].width = 22

    excel_stream = io.BytesIO()
    wb.save(excel_stream)
    excel_stream.seek(0)

    return Response(
        content=excel_stream.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename_base}.xlsx"}
    )
