from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from db import get_db
from auth import get_current_user, require_admin_it
import mysql.connector

router = APIRouter(
    prefix="/api/satker",
    tags=["satker"],
    dependencies=[Depends(get_current_user)]
)

class SatkerCreate(BaseModel):
    NO_Satker: str
    nama: str

class BulkSatkerCreate(BaseModel):
    satkers: List[str]

@router.get("")
def get_satkers(db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, NO_Satker, nama, created_at FROM satkers ORDER BY nama ASC")
    rows = cursor.fetchall()
    cursor.close()
    return {"success": True, "data": rows}

@router.post("")
def create_satker(satker: SatkerCreate, db = Depends(get_db), user: dict = Depends(require_admin_it)):
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("INSERT INTO satkers (NO_Satker, nama) VALUES (%s, %s)", (satker.NO_Satker, satker.nama))
        db.commit()
        return {"success": True, "message": "Satker berhasil ditambahkan", "data": {"id": cursor.lastrowid, "NO_Satker": satker.NO_Satker, "nama": satker.nama}}
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
        values = [(s,) for s in bulk.satkers]
        cursor.executemany("INSERT INTO satkers (nama) VALUES (%s)", values)
        db.commit()
        return {"success": True, "message": f"{len(bulk.satkers)} Satker berhasil diimport"}
    except mysql.connector.Error as err:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()

@router.put("/{satker_id}")
def update_satker(satker_id: int, satker: SatkerCreate, db = Depends(get_db), user: dict = Depends(require_admin_it)):
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("UPDATE satkers SET NO_Satker = %s, nama = %s WHERE id = %s", (satker.NO_Satker, satker.nama, satker_id))
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
