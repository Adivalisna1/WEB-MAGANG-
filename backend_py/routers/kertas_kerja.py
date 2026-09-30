from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List
from auth import get_current_user
from db import get_db
import datetime

router = APIRouter(prefix="/api/rekening-koran", tags=["rekening_koran"])

@router.get("")
async def get_kertas_kerja(user: dict = Depends(get_current_user), db=Depends(get_db)):
    role = user.get("role_id")
    satker_id = user.get("satker_id")
    
    where = "1=1"
    params = []
    
    if role == 2:  # Staff
        if satker_id is None:
            where += " AND k.satker_id IS NULL"
        else:
            where += " AND k.satker_id = %s"
            params.append(satker_id)
            
    with db.cursor() as cursor:
        query = f"""
            SELECT k.*, u.nama AS uploader_nama, s.nama AS nama_satker, s.NO_Satker AS kode_satker 
            FROM kertas_kerja k
            LEFT JOIN users u ON u.id = k.uploaded_by
            LEFT JOIN satkers s ON s.id = k.satker_id
            WHERE {where}
            ORDER BY k.created_at DESC
        """
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
    return {"success": True, "data": rows}

@router.post("/bulk")
async def bulk_insert_kertas_kerja(request: dict, user: dict = Depends(get_current_user), db=Depends(get_db)):
    data = request.get("data")
    payload_satker_id = request.get("satker_id")
    tahun_req = request.get("tahun")
    periode_req = request.get("periode")
    
    if not data or not isinstance(data, list) or len(data) == 0:
        raise HTTPException(400, "Data excel kosong atau tidak valid")
        
    satker_id = payload_satker_id or user.get("satker_id")
    uploaded_by = user.get("id")
    values = []
    
    with db.cursor() as cursor:
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
                INSERT INTO kertas_kerja (
                    satker_id, uploaded_by, nama_bank, nomor_rekening_bank, nama_rekening,
                    nomor_pembukaan_rekening, tanggal_pembukaan_rekening,
                    saldo_akhir_bulan, saldo_rk, saldo_rekening, saldo_rpl_lpj, keterangan, tahun, periode
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.executemany(query, values)
            db.commit()
            
    return {"success": True, "message": f"Berhasil menyimpan {len(values)} baris data."}

@router.post("")
async def create_kertas_kerja(request: dict, user: dict = Depends(get_current_user), db=Depends(get_db)):
    satker_id = user.get("satker_id")
    uploaded_by = user.get("id")
    
    with db.cursor() as cursor:
        query = """
            INSERT INTO kertas_kerja (
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

@router.put("/{id}")
async def update_kertas_kerja(id: int, request: dict, user: dict = Depends(get_current_user), db=Depends(get_db)):
    with db.cursor() as cursor:
        query = """
            UPDATE kertas_kerja SET 
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
        if cursor.rowcount == 0:
            raise HTTPException(404, "Data tidak ditemukan")
        db.commit()
        return {"success": True, "message": "Data berhasil diupdate"}

@router.delete("/{id}")
async def delete_kertas_kerja(id: int, user: dict = Depends(get_current_user), db=Depends(get_db)):
    with db.cursor() as cursor:
        cursor.execute("DELETE FROM kertas_kerja WHERE id = %s", (id,))
        if cursor.rowcount == 0:
            raise HTTPException(404, "Data tidak ditemukan")
        db.commit()
        return {"success": True, "message": "Data berhasil dihapus"}
