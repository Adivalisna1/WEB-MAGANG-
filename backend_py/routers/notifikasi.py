from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from db import get_db
from auth import get_current_user

router = APIRouter()

@router.get("")
async def get_notifikasi(
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT id, aksi, dokumen_id, judul, pesan, is_read, created_at
            FROM notifikasi
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT %s
        """, (current_user["id"], limit))
        return {"success": True, "data": cursor.fetchall()}

@router.get("/unread-count")
async def get_unread_count(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT COUNT(*) AS count FROM notifikasi WHERE user_id = %s AND is_read = 0", (current_user["id"],))
        count = cursor.fetchone()["count"]
        return {"success": True, "data": {"count": count}}

@router.patch("/{notif_id}/read")
async def mark_as_read(
    notif_id: int,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("UPDATE notifikasi SET is_read = 1 WHERE id = %s AND user_id = %s", (notif_id, current_user["id"]))
        return {"success": True, "message": "Notifikasi ditandai sudah dibaca"}

@router.patch("/read-all")
async def mark_all_as_read(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("UPDATE notifikasi SET is_read = 1 WHERE user_id = %s AND is_read = 0", (current_user["id"],))
        return {"success": True, "message": "Semua notifikasi ditandai sudah dibaca"}
