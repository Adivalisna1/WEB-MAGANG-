from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List
from auth import get_current_user
from db import get_db
import datetime

router = APIRouter(prefix="/api/rekening-koran", tags=["rekening_koran"])

BANK_KODE_MAP = {
    "BANK MANDIRI": "008",
    "MANDIRI": "008",
    "BANK RAKYAT INDONESIA": "002",
    "BRI": "002",
    "BANK BRI": "002",
    "BANK NEGARA INDONESIA": "009",
    "BNI": "009",
    "BANK BNI": "009",
    "BANK TABUNGAN NEGARA": "200",
    "BTN": "200",
    "BANK BTN": "200",
    "BANK SYARIAH INDONESIA": "451",
    "BSI": "451",
    "BANK BSI": "451",
    "BCA": "014",
    "BANK CENTRAL ASIA": "014",
    "BANK BCA": "014",
}

def _resolve_kode_bank(nama_bank: str | None, kode_bank: str | None = None) -> str:
    if kode_bank and str(kode_bank).strip():
        return str(kode_bank).strip()
    if not nama_bank:
        return "000"
    upper = str(nama_bank).upper().strip()
    for key, code in BANK_KODE_MAP.items():
        if key in upper:
            return code
    return "999"

def _ensure_rk_columns(cursor, db):
    try:
        cursor.execute("SHOW COLUMNS FROM rekening_koran LIKE 'is_active'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE rekening_koran ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1")
            db.commit()
    except Exception:
        pass
    try:
        cursor.execute("SHOW COLUMNS FROM rekening_koran LIKE 'kode_bank'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE rekening_koran ADD COLUMN kode_bank VARCHAR(20) NULL")
            db.commit()
    except Exception:
        pass
    try:
        cursor.execute("SHOW COLUMNS FROM pencatatan LIKE 'is_active'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE pencatatan ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1")
            db.commit()
    except Exception:
        pass

@router.get("")
async def get_rekening_koran(request: Request, user: dict = Depends(get_current_user), db=Depends(get_db)):
    tingkat = user.get("tingkat")
    satker_id = user.get("satker_id")
    eselon_1_id = user.get("eselon_1_id")
    role = user.get("role")
    
    where = "1=1"
    params = []
    
    if tingkat == "satker":
        if satker_id:
            where += " AND k.satker_id = %s"
            params.append(satker_id)
        else:
            where += " AND k.satker_id IS NULL"
    elif tingkat == "eselon_1":
        filter_satker = request.query_params.get("satker_id")
        include_satkers = request.query_params.get("include_satkers")
        if filter_satker and str(filter_satker).strip() not in ["", "all", "0"]:
            where += " AND k.satker_id = %s"
            params.append(filter_satker)
        elif include_satkers == "true":
            if eselon_1_id:
                where += " AND (s.eselon_1_id = %s OR u.eselon_1_id = %s)"
                params.extend([eselon_1_id, eselon_1_id])
        else:
            # Sesuai aturan: Rekening Koran Eselon 1 HANYA menampilkan file milik Eselon 1 sendiri (bukan satker binaan)
            if eselon_1_id:
                where += " AND k.satker_id IS NULL AND (u.eselon_1_id = %s OR k.uploaded_by = %s)"
                params.extend([eselon_1_id, user.get("id")])
            else:
                where += " AND k.satker_id IS NULL"
            
    with db.cursor(dictionary=True) as cursor:
        _ensure_rk_columns(cursor, db)
        query = (
            "SELECT k.*, "
            "       COALESCE(NULLIF(k.periode, '1'), p.periode, k.periode) AS periode, "
            "       COALESCE(p.bukti_file, d.file_path) AS bukti_file, "
            "       d.file_nama AS nama_file_bukti, "
            "       COALESCE(k.nama_rekening, d.nama_rekening) AS nama_rekening, "
            "       COALESCE(p.tanggal, k.tanggal_pembukaan_rekening) AS tanggal_transaksi, "
            "       u.nama AS uploader_nama, s.nama AS nama_satker, s.NO_Satker AS kode_satker "
            "FROM rekening_koran k "
            "LEFT JOIN users u ON u.id = k.uploaded_by "
            "LEFT JOIN satkers s ON s.id = k.satker_id "
            "LEFT JOIN dokumen d ON d.id = k.dokumen_id "
            "LEFT JOIN pencatatan p ON p.bukti_file COLLATE utf8mb4_general_ci LIKE CONCAT('%', SUBSTRING_INDEX(d.file_path, '/', -1)) "
            "WHERE " + where + " "
            "ORDER BY k.created_at DESC"
        )
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        for r in rows:
            if not r.get("kode_bank"):
                r["kode_bank"] = _resolve_kode_bank(r.get("nama_bank"))
            if r.get("is_active") is None:
                r["is_active"] = 1
    return {"success": True, "data": rows}

@router.post("/bulk")
async def bulk_insert_rekening_koran(request: dict, user: dict = Depends(get_current_user), db=Depends(get_db)):
    data = request.get("data")
    payload_satker_id = request.get("satker_id")
    tahun_req = request.get("tahun")
    periode_req = request.get("periode")
    
    if not data or not isinstance(data, list) or len(data) == 0:
        raise HTTPException(400, "Data excel kosong atau tidak valid")
        
    if user.get("tingkat") == "satker" and not user.get("is_it"):
        satker_id = user.get("satker_id")
    else:
        satker_id = payload_satker_id or user.get("satker_id")
    uploaded_by = user.get("id")
    values = []
    
    with db.cursor(dictionary=True) as cursor:
        if user.get("tingkat") == "eselon_1" and user.get("eselon_1_id"):
            cursor.execute("SELECT id, NO_Satker FROM satkers WHERE NO_Satker IS NOT NULL AND eselon_1_id = %s", (user["eselon_1_id"],))
        else:
            cursor.execute("SELECT id, NO_Satker FROM satkers WHERE NO_Satker IS NOT NULL")
        satkers_data = cursor.fetchall()
        satker_map = {str(s["NO_Satker"]): s["id"] for s in satkers_data}
        
        for row in data:
            keys = list(row.keys())
            
            def get_val(keywords):
                for k in keys:
                    if any(kw in k.lower() for kw in keywords):
                        return row[k]
                return None
                
            nama_bank = get_val(['nama bank'])
            nomor_rekening_bank = get_val(['nomor rekening bank', 'no rek'])
            nama_rekening = get_val(['nama rekening'])
            nomor_pembukaan_rekening = get_val(['nomor pembukaan'])
            
            tgl_str = get_val(['tanggal pembukaan'])
            tanggal_pembukaan_rekening = None
            if tgl_str:
                if isinstance(tgl_str, (int, float)):
                    parsed = datetime.datetime.fromtimestamp((tgl_str - (25567 + 2)) * 86400)
                    tanggal_pembukaan_rekening = parsed.strftime('%Y-%m-%d')
                else:
                    try:
                        parsed = datetime.datetime.fromisoformat(str(tgl_str).replace('Z', '+00:00'))
                        tanggal_pembukaan_rekening = parsed.strftime('%Y-%m-%d')
                    except ValueError:
                        pass
                        
            import re
            def parse_num(val):
                if val is None: return 0
                try:
                    return float(re.sub(r'[^0-9.-]+', '', str(val)))
                except ValueError:
                    return 0
                    
            saldo_akhir_bulan = parse_num(row.get('SALDO PER AKHIR BULAN') or get_val(['saldo per akhir bulan', 'saldo per 30', 'saldo per']))
            saldo_rk = parse_num(row.get('SALDO PER AKHIR BULAN (RK)') or get_val(['(rk)']))
            saldo_rekening = parse_num(row.get('LAPORAN SALDO PER AKHIR BULAN (SALDO REKENING)') or get_val(['(saldo rekening)']))
            saldo_rpl_lpj = parse_num(row.get('SALDO PER AKHIR BULAN (RPL/LPJ)') or get_val(['(rpl/lpj)']))
            keterangan = get_val(['keterangan'])
            
            row_satker_id = satker_id
            kode_satker = get_val(['kode satker', 'no_satker'])
            if kode_satker:
                match_id = satker_map.get(str(kode_satker))
                if match_id: row_satker_id = match_id
                
            excel_tahun = get_val(['tahun'])
            excel_periode = get_val(['periode'])
            kode_bank = _resolve_kode_bank(nama_bank, get_val(['kode bank', 'no bank']))
            
            values.append((
                row_satker_id, uploaded_by, kode_bank, nama_bank, nomor_rekening_bank, nama_rekening,
                nomor_pembukaan_rekening, tanggal_pembukaan_rekening,
                saldo_akhir_bulan, saldo_rk, saldo_rekening, saldo_rpl_lpj, keterangan,
                excel_tahun or tahun_req or 2026, str(excel_periode) if excel_periode else (periode_req or '1'), 1
            ))
            
        if values:
            _ensure_rk_columns(cursor, db)
            query = """
                INSERT INTO rekening_koran (
                    satker_id, uploaded_by, kode_bank, nama_bank, nomor_rekening_bank, nama_rekening,
                    nomor_pembukaan_rekening, tanggal_pembukaan_rekening,
                    saldo_akhir_bulan, saldo_rk, saldo_rekening, saldo_rpl_lpj, keterangan, tahun, periode, is_active
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.executemany(query, values)
            db.commit()
            
    return {"success": True, "message": f"Berhasil menyimpan {len(values)} baris data."}

@router.post("")
async def create_rekening_koran(request: dict, user: dict = Depends(get_current_user), db=Depends(get_db)):
    user_role = user.get("role") or ""
    if user_role in ["operator", "staff_satker"] and not user.get("is_it"):
        raise HTTPException(403, "Operator Satker tidak dapat menambah rekening secara manual. Silakan ajukan Surat Pembukaan Rekening Koran untuk diverifikasi Admin Eselon 1.")

    satker_id = user.get("satker_id") or request.get("satker_id")
    uploaded_by = user.get("id")
    nama_bank = request.get("nama_bank")
    kode_bank = _resolve_kode_bank(nama_bank, request.get("kode_bank"))
    
    with db.cursor(dictionary=True) as cursor:
        _ensure_rk_columns(cursor, db)
        query = """
            INSERT INTO rekening_koran (
                satker_id, uploaded_by, kode_bank, nama_bank, nomor_rekening_bank, nama_rekening,
                nomor_pembukaan_rekening, tanggal_pembukaan_rekening,
                saldo_akhir_bulan, saldo_rk, saldo_rekening, saldo_rpl_lpj, keterangan, tahun, periode, is_active
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            satker_id, uploaded_by, kode_bank, nama_bank, request.get("nomor_rekening_bank"), request.get("nama_rekening"),
            request.get("nomor_pembukaan_rekening"), request.get("tanggal_pembukaan_rekening"),
            request.get("saldo_akhir_bulan", 0), request.get("saldo_rk", 0), request.get("saldo_rekening", 0),
            request.get("saldo_rpl_lpj", 0), request.get("keterangan"), request.get("tahun", 2026), request.get("periode", "1"), 1
        ))
        db.commit()
        return {"success": True, "message": "Data berhasil ditambahkan", "data": {"id": cursor.lastrowid}}

def _check_rekening_koran_access(cursor, id: int, user: dict):
    cursor.execute("""
        SELECT k.id, k.satker_id, k.uploaded_by, k.dokumen_id, k.is_active, s.eselon_1_id
        FROM rekening_koran k
        LEFT JOIN satkers s ON s.id = k.satker_id
        WHERE k.id = %s
    """, (id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(404, "Data tidak ditemukan")

    if user.get("is_it") or user.get("role") in ["it", "admin_it"] or user.get("tingkat") == "kl":
        return row

    if user.get("tingkat") == "satker":
        if user.get("satker_id") and row["satker_id"] != user.get("satker_id"):
            raise HTTPException(403, "Akses ditolak: Data rekening koran ini milik Satker lain")
    elif user.get("tingkat") == "eselon_1":
        if user.get("eselon_1_id") and row.get("eselon_1_id") and row["eselon_1_id"] != user.get("eselon_1_id"):
            raise HTTPException(403, "Akses ditolak: Data rekening koran ini di luar Satker binaan Eselon 1 Anda")

    return row

@router.patch("/{id}/toggle-status")
async def toggle_status_rekening_koran(id: int, request: dict = None, user: dict = Depends(get_current_user), db=Depends(get_db)):
    # Operator Satker tidak berwenang mengaktifkan / menonaktifkan rekening secara langsung
    if user.get("role") in ["operator", "staff_satker"] and not user.get("is_it"):
        raise HTTPException(403, "Operator Satker tidak berwenang mengubah status aktif/nonaktif rekening secara langsung. Pengaktifan atau penonaktifan rekening dilakukan melalui persetujuan Surat Pembukaan atau Penutupan Rekening Koran oleh Admin Eselon 1.")

    with db.cursor(dictionary=True) as cursor:
        _ensure_rk_columns(cursor, db)
        row = _check_rekening_koran_access(cursor, id, user)
        current_status = row.get("is_active")
        if current_status is None:
            current_status = 1
        if request and "is_active" in request:
            new_status = 1 if request["is_active"] else 0
        else:
            new_status = 0 if int(current_status) == 1 else 1
            
        cursor.execute("UPDATE rekening_koran SET is_active = %s WHERE id = %s", (new_status, id))
        
        # Sinkronkan juga ke tabel pencatatan jika terhubung lewat dokumen_id
        dokumen_id = row.get("dokumen_id")
        if dokumen_id:
            try:
                cursor.execute("SELECT file_path FROM dokumen WHERE id = %s", (dokumen_id,))
                dok = cursor.fetchone()
                if dok and dok.get("file_path"):
                    file_basename = str(dok["file_path"]).split("/")[-1]
                    if file_basename:
                        cursor.execute(
                            "UPDATE pencatatan SET is_active = %s WHERE bukti_file LIKE %s",
                            (new_status, f"%{file_basename}")
                        )
            except Exception:
                pass
        db.commit()
        return {
            "success": True,
            "message": f"Status bukti berhasil diubah menjadi {'Aktif' if new_status == 1 else 'Nonaktif'}",
            "data": {"id": id, "is_active": new_status}
        }

@router.put("/{id}")
async def update_rekening_koran(id: int, request: dict, user: dict = Depends(get_current_user), db=Depends(get_db)):
    nama_bank = request.get("nama_bank")
    kode_bank = _resolve_kode_bank(nama_bank, request.get("kode_bank"))
    with db.cursor(dictionary=True) as cursor:
        _ensure_rk_columns(cursor, db)
        _check_rekening_koran_access(cursor, id, user)
        query = """
            UPDATE rekening_koran SET 
                kode_bank = %s, nama_bank = %s, nomor_rekening_bank = %s, nama_rekening = %s, 
                nomor_pembukaan_rekening = %s, tanggal_pembukaan_rekening = %s, 
                saldo_akhir_bulan = %s, saldo_rk = %s, saldo_rekening = %s, saldo_rpl_lpj = %s, keterangan = %s,
                tahun = %s, periode = %s
            WHERE id = %s
        """
        cursor.execute(query, (
            kode_bank, nama_bank, request.get("nomor_rekening_bank"), request.get("nama_rekening"),
            request.get("nomor_pembukaan_rekening"), request.get("tanggal_pembukaan_rekening"),
            request.get("saldo_akhir_bulan", 0), request.get("saldo_rk", 0), request.get("saldo_rekening", 0),
            request.get("saldo_rpl_lpj", 0), request.get("keterangan"), request.get("tahun", 2026), request.get("periode", "1"),
            id
        ))
        db.commit()
        return {"success": True, "message": "Data berhasil diupdate"}

@router.delete("/{id}")
async def delete_rekening_koran(id: int, user: dict = Depends(get_current_user), db=Depends(get_db)):
    with db.cursor(dictionary=True) as cursor:
        _check_rekening_koran_access(cursor, id, user)
        cursor.execute("DELETE FROM rekening_koran WHERE id = %s", (id,))
        db.commit()
        return {"success": True, "message": "Data berhasil dihapus"}
