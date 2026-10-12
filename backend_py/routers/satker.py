from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Union
from db import get_db
from auth import get_current_user, require_admin_it, get_current_user_optional
import mysql.connector

router = APIRouter(
    prefix="/api/satker",
    tags=["satker"]
)

class SatkerCreate(BaseModel):
    NO_Satker: Union[int, str]
    nama: str
    eselon_1_id: Optional[int] = None

class SatkerBulkItem(BaseModel):
    NO_Satker: Optional[Union[int, str]] = None
    nama: str
    eselon_1_id: Optional[int] = None

class BulkSatkerCreate(BaseModel):
    satkers: List[Union[SatkerBulkItem, str]]

@router.get("")
def get_satkers(
    eselon_1_id: Optional[int] = None,
    user: Optional[dict] = Depends(get_current_user_optional),
    db = Depends(get_db)
):
    cursor = db.cursor(dictionary=True)
    where = "1=1"
    params = []

    # Jika pemanggil adalah user Eselon 1, batasi HANYA ke satker binaannya
    if user and user.get("tingkat") == "eselon_1" and user.get("eselon_1_id"):
        where += " AND eselon_1_id = %s"
        params.append(user["eselon_1_id"])
    elif eselon_1_id:
        where += " AND eselon_1_id = %s"
        params.append(eselon_1_id)

    cursor.execute(f"SELECT id, NO_Satker, nama, eselon_1_id, created_at FROM satkers WHERE {where} ORDER BY nama ASC", tuple(params))
    rows = cursor.fetchall()
    cursor.close()
    return {"success": True, "data": rows}

@router.post("")
def create_satker(satker: SatkerCreate, db = Depends(get_db), user: dict = Depends(require_admin_it)):
    cursor = db.cursor(dictionary=True)
    try:
        try:
            no_satker_val = int(str(satker.NO_Satker).strip())
        except ValueError:
            raise HTTPException(status_code=400, detail="NO_Satker harus berupa angka")
            
        cursor.execute("INSERT INTO satkers (NO_Satker, nama, eselon_1_id) VALUES (%s, %s, %s)", 
                      (no_satker_val, satker.nama, satker.eselon_1_id))
        db.commit()
        return {"success": True, "message": "Satker berhasil ditambahkan", "data": {"id": cursor.lastrowid, "NO_Satker": no_satker_val, "nama": satker.nama}}
    except mysql.connector.Error as err:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()

@router.post("/bulk")
def create_bulk_satker(bulk: BulkSatkerCreate, db = Depends(get_db), user: dict = Depends(require_admin_it)):
    if not bulk.satkers:
        raise HTTPException(status_code=400, detail="Data satker kosong atau format tidak valid")
    
    cursor = db.cursor(dictionary=True)
    try:
        values = []
        for idx, item in enumerate(bulk.satkers):
            if isinstance(item, str):
                values.append((idx + 100000, item, None))
            else:
                try:
                    no_s = int(str(item.NO_Satker).strip()) if item.NO_Satker else (idx + 100000)
                except ValueError:
                    no_s = idx + 100000
                values.append((no_s, item.nama, item.eselon_1_id))
                
        cursor.executemany("INSERT INTO satkers (NO_Satker, nama, eselon_1_id) VALUES (%s, %s, %s)", values)
        db.commit()
        return {"success": True, "message": f"{len(values)} Satker berhasil diimport"}
    except mysql.connector.Error as err:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()

@router.put("/{satker_id}")
def update_satker(satker_id: int, satker: SatkerCreate, db = Depends(get_db), user: dict = Depends(require_admin_it)):
    cursor = db.cursor(dictionary=True)
    try:
        try:
            no_satker_val = int(str(satker.NO_Satker).strip())
        except ValueError:
            raise HTTPException(status_code=400, detail="NO_Satker harus berupa angka")
            
        cursor.execute("UPDATE satkers SET NO_Satker = %s, nama = %s, eselon_1_id = COALESCE(%s, eselon_1_id) WHERE id = %s", 
                      (no_satker_val, satker.nama, satker.eselon_1_id, satker_id))
        db.commit()
        return {"success": True, "message": "Satker berhasil diupdate"}
    except mysql.connector.Error as err:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()

@router.delete("/{satker_id}")
def delete_satker(satker_id: int, db = Depends(get_db), user: dict = Depends(require_admin_it)):
    cursor = db.cursor(dictionary=True)
    try:
        # Check if users exist
        cursor.execute("SELECT id FROM users WHERE satker_id = %s", (satker_id,))
        if cursor.fetchall():
            raise HTTPException(status_code=400, detail="Gagal dihapus: Satker ini masih memiliki user aktif.")
        
        cursor.execute("DELETE FROM satkers WHERE id = %s", (satker_id,))
        db.commit()
        return {"success": True, "message": "Satker berhasil dihapus"}
    except mysql.connector.Error as err:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
