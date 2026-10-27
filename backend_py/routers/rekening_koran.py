from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List
from auth import get_current_user
from db import get_db
import datetime

router = APIRouter(prefix="/api/rekening-koran", tags=["rekening_koran"])

@router.get("")
async def get_rekening_koran(user: dict = Depends(get_current_user), db=Depends(get_db)):
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
        if eselon_1_id:
            where += " AND (s.eselon_1_id = %s OR u.eselon_1_id = %s)"
            params.extend([eselon_1_id, eselon_1_id])
            
    with db.cursor(dictionary=True) as cursor:
        query = (
            "SELECT k.*, "
            "       COALESCE(NULLIF(k.periode, '1'), p.periode, k.periode) AS periode, "
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
            
            values.append((
                row_satker_id, uploaded_by, nama_bank, nomor_rekening_bank, nama_rekening,
                nomor_pembukaan_rekening, tanggal_pembukaan_rekening,
                saldo_akhir_bulan, saldo_rk, saldo_rekening, saldo_rpl_lpj, keterangan,
                excel_tahun or tahun_req or 2026, str(excel_periode) if excel_periode else (periode_req or '1')
            ))
            
        if values:
            query = """
                INSERT INTO rekening_koran (
                    satker_id, uploaded_by, nama_bank, nomor_rekening_bank, nama_rekening,
                    nomor_pembukaan_rekening, tanggal_pembukaan_rekening,
                    saldo_akhir_bulan, saldo_rk, saldo_rekening, saldo_rpl_lpj, keterangan, tahun, periode
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.executemany(query, values)
            db.commit()
            
    return {"success": True, "message": f"Berhasil menyimpan {len(values)} baris data."}

@router.post("")
async def create_rekening_koran(request: dict, user: dict = Depends(get_current_user), db=Depends(get_db)):
    satker_id = user.get("satker_id") or request.get("satker_id")
    uploaded_by = user.get("id")
    
    with db.cursor(dictionary=True) as cursor:
        query = """
            INSERT INTO rekening_koran (
                satker_id, uploaded_by, nama_bank, nomor_rekening_bank, nama_rekening,
                nomor_pembukaan_rekening, tanggal_pembukaan_rekening,
                saldo_akhir_bulan, saldo_rk, saldo_rekening, saldo_rpl_lpj, keterangan, tahun, periode
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            satker_id, uploaded_by, request.get("nama_bank"), request.get("nomor_rekening_bank"), request.get("nama_rekening"),
            request.get("nomor_pembukaan_rekening"), request.get("tanggal_pembukaan_rekening"),
            request.get("saldo_akhir_bulan", 0), request.get("saldo_rk", 0), request.get("saldo_rekening", 0),
            request.get("saldo_rpl_lpj", 0), request.get("keterangan"), request.get("tahun", 2026), request.get("periode", "1")
        ))
        db.commit()
        return {"success": True, "message": "Data berhasil ditambahkan", "data": {"id": cursor.lastrowid}}

def _check_rekening_koran_access(cursor, id: int, user: dict):
    cursor.execute("""
        SELECT k.id, k.satker_id, k.uploaded_by, s.eselon_1_id
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

@router.put("/{id}")
async def update_rekening_koran(id: int, request: dict, user: dict = Depends(get_current_user), db=Depends(get_db)):
    with db.cursor(dictionary=True) as cursor:
        _check_rekening_koran_access(cursor, id, user)
        query = """
            UPDATE rekening_koran SET 
                nama_bank = %s, nomor_rekening_bank = %s, nama_rekening = %s, 
                nomor_pembukaan_rekening = %s, tanggal_pembukaan_rekening = %s, 
                saldo_akhir_bulan = %s, saldo_rk = %s, saldo_rekening = %s, saldo_rpl_lpj = %s, keterangan = %s,
                tahun = %s, periode = %s
            WHERE id = %s
        """
        cursor.execute(query, (
            request.get("nama_bank"), request.get("nomor_rekening_bank"), request.get("nama_rekening"),
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
