from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
from auth import get_current_user
from db import get_db
import pandas as pd
import io
import datetime

router = APIRouter(prefix="/api/export", tags=["export"])


def _get_satker_filter(role_id, satker_id, satker_param=None):
    """Helper: return (where_clause, params) based on role."""
    where = "1=1"
    params = []
    if role_id in (1, 2):  # pimpinan_satker / staff_satker — hanya satker sendiri
        if satker_id:
            where += " AND r.satker_id = %s"
            params.append(satker_id)
        else:
            where += " AND r.satker_id IS NULL"
    else:  # eselon1 / admin_it — bisa filter per satker atau semua
        if satker_param:
            where += " AND r.satker_id = %s"
            params.append(satker_param)
    return where, params


# ─────────────────────────────────────────────
# 1. EXPORT REKENING KORAN → EXCEL
# ─────────────────────────────────────────────
@router.get("/rekening-koran")
async def export_rekening_koran(
    satker: Optional[int] = Query(None),
    tahun: Optional[int] = Query(None),
    periode: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    role_id = user.get("role_id")
    user_satker_id = user.get("satker_id")

    where, params = _get_satker_filter(role_id, user_satker_id, satker)

    if tahun:
        where += " AND r.tahun = %s"
        params.append(tahun)
    if periode:
        where += " AND r.periode = %s"
        params.append(periode)

    with db.cursor(dictionary=True) as cursor:
        cursor.execute(f"""
            SELECT 
                s.nama AS satker,
                s.NO_Satker AS kode_satker,
                r.nama_bank,
                r.nomor_rekening_bank,
                r.nama_rekening,
                r.tahun,
                r.periode,
                r.saldo_akhir_bulan,
                r.saldo_rk,
                r.saldo_rekening,
                r.saldo_rpl_lpj,
                r.keterangan,
                u.nama AS diinput_oleh,
                r.created_at
            FROM rekening_koran r
            LEFT JOIN satkers s ON s.id = r.satker_id
            LEFT JOIN users u ON u.id = r.uploaded_by
            WHERE {where}
            ORDER BY s.nama ASC, r.tahun DESC, r.periode ASC
        """, tuple(params))
        rows = cursor.fetchall()

    if not rows:
        raise HTTPException(404, "Tidak ada data untuk diexport")

    df = pd.DataFrame(rows)

    # Rename kolom jadi lebih human-readable
    df.rename(columns={
        "satker": "Satker",
        "kode_satker": "Kode Satker",
        "nama_bank": "Nama Bank",
        "nomor_rekening_bank": "No. Rekening",
        "nama_rekening": "Nama Rekening",
        "tahun": "Tahun",
        "periode": "Periode",
        "saldo_akhir_bulan": "Saldo Akhir Bulan",
        "saldo_rk": "Saldo RK",
        "saldo_rekening": "Saldo Rekening",
        "saldo_rpl_lpj": "Saldo RPL/LPJ",
        "keterangan": "Keterangan",
        "diinput_oleh": "Diinput Oleh",
        "created_at": "Tanggal Input",
    }, inplace=True)

    # Mapping periode 1/2 → label
    df["Periode"] = df["Periode"].map({"1": "Semester 1", "2": "Semester 2"})

    # Format angka rupiah
    for col in ["Saldo Akhir Bulan", "Saldo RK", "Saldo Rekening", "Saldo RPL/LPJ"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # Tulis ke buffer Excel
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Rekening Koran")
        ws = writer.sheets["Rekening Koran"]

        # Auto-width kolom
        for col_cells in ws.columns:
            max_len = max((len(str(c.value)) for c in col_cells if c.value), default=10)
            ws.column_dimensions[col_cells[0].column_letter].width = min(max_len + 4, 50)

    buffer.seek(0)
    now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"Rekening_Koran_{now}.xlsx"

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ─────────────────────────────────────────────
# 2. EXPORT PENCATATAN AKUNTANSI → EXCEL
# ─────────────────────────────────────────────
@router.get("/pencatatan")
async def export_pencatatan(
    satker: Optional[int] = Query(None),
    tahun: Optional[int] = Query(None),
    jenis: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    role_id = user.get("role_id")
    user_satker_id = user.get("satker_id")

    where = "1=1"
    params = []

    if role_id in (1, 2):
        if user_satker_id:
            where += " AND u.satker_id = %s"
            params.append(user_satker_id)
        else:
            where += " AND u.satker_id IS NULL"
    else:
        if satker:
            where += " AND u.satker_id = %s"
            params.append(satker)

    if tahun:
        where += " AND YEAR(a.tanggal) = %s"
        params.append(tahun)
    if jenis:
        where += " AND a.jenis = %s"
        params.append(jenis)

    with db.cursor(dictionary=True) as cursor:
        cursor.execute(f"""
            SELECT
                a.tanggal,
                s.nama AS satker,
                k.nama AS kategori,
                a.jenis,
                a.uraian,
                a.nominal,
                a.nama_bank,
                a.nomor_rekening,
                a.nama_rekening,
                a.catatan_audit,
                u.nama AS diinput_oleh,
                a.created_at
            FROM pencatatan a
            LEFT JOIN kategori_dokumen k ON k.id = a.id_kategori
            LEFT JOIN users u ON u.id = a.created_by
            LEFT JOIN satkers s ON s.id = u.satker_id
            WHERE {where}
            ORDER BY a.tanggal DESC
        """, tuple(params))
        rows = cursor.fetchall()

    if not rows:
        raise HTTPException(404, "Tidak ada data untuk diexport")

    df = pd.DataFrame(rows)

    df.rename(columns={
        "tanggal": "Tanggal",
        "satker": "Satker",
        "kategori": "Kategori",
        "jenis": "Jenis",
        "uraian": "Uraian",
        "nominal": "Nominal",
        "nama_bank": "Nama Bank",
        "nomor_rekening": "No. Rekening",
        "nama_rekening": "Nama Rekening",
        "catatan_audit": "Catatan",
        "diinput_oleh": "Diinput Oleh",
        "created_at": "Tanggal Input",
    }, inplace=True)

    df["Nominal"] = pd.to_numeric(df["Nominal"], errors="coerce").fillna(0)
    df["Jenis"] = df["Jenis"].str.capitalize()

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Pencatatan")
        ws = writer.sheets["Pencatatan"]
        for col_cells in ws.columns:
            max_len = max((len(str(c.value)) for c in col_cells if c.value), default=10)
            ws.column_dimensions[col_cells[0].column_letter].width = min(max_len + 4, 60)

    buffer.seek(0)
    now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"Pencatatan_{now}.xlsx"

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ─────────────────────────────────────────────
# 3. EXPORT SEMUA DATA REKENING KORAN MULTI-SHEET (per satker)
# Khusus Eselon 1
# ─────────────────────────────────────────────
@router.get("/rekening-koran/all-satker")
async def export_rekening_koran_all_satker(
    tahun: Optional[int] = Query(None),
    user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    role_id = user.get("role_id")
    if role_id not in (3,):  # hanya eselon_1
        raise HTTPException(403, "Hanya Eselon 1 yang bisa export semua satker")

    where = "1=1"
    params = []
    if tahun:
        where += " AND r.tahun = %s"
        params.append(tahun)

    with db.cursor(dictionary=True) as cursor:
        cursor.execute(f"""
            SELECT 
                s.nama AS satker,
                r.nama_bank,
                r.nomor_rekening_bank,
                r.nama_rekening,
                r.tahun,
                r.periode,
                r.saldo_akhir_bulan,
                r.saldo_rk,
                r.saldo_rekening,
                r.saldo_rpl_lpj,
                r.keterangan,
                u.nama AS diinput_oleh,
                r.created_at
            FROM rekening_koran r
            LEFT JOIN satkers s ON s.id = r.satker_id
            LEFT JOIN users u ON u.id = r.uploaded_by
            WHERE {where}
            ORDER BY s.nama ASC, r.tahun DESC
        """, tuple(params))
        rows = cursor.fetchall()

    if not rows:
        raise HTTPException(404, "Tidak ada data untuk diexport")

    df = pd.DataFrame(rows)
    df["periode"] = df["periode"].map({"1": "Semester 1", "2": "Semester 2"})
    for col in ["saldo_akhir_bulan", "saldo_rk", "saldo_rekening", "saldo_rpl_lpj"]:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        # Sheet pertama: semua data
        df_all = df.copy()
        df_all.columns = [c.replace("_", " ").title() for c in df_all.columns]
        df_all.to_excel(writer, index=False, sheet_name="Semua Satker")

        # Sheet per satker
        for satker_nama, group in df.groupby("satker"):
            sheet_name = str(satker_nama)[:31]  # Excel max 31 char per sheet name
            group_clean = group.drop(columns=["satker"])
            group_clean.columns = [c.replace("_", " ").title() for c in group_clean.columns]
            group_clean.to_excel(writer, index=False, sheet_name=sheet_name)
            ws = writer.sheets[sheet_name]
            for col_cells in ws.columns:
                max_len = max((len(str(c.value)) for c in col_cells if c.value), default=10)
                ws.column_dimensions[col_cells[0].column_letter].width = min(max_len + 4, 50)

    buffer.seek(0)
    now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"Rekening_Koran_AllSatker_{tahun or 'Semua'}_{now}.xlsx"

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
