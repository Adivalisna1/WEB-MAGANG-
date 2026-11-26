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
        db.commit()
        return {"success": True, "message": "Notifikasi ditandai sudah dibaca"}

@router.patch("/read-all")
async def mark_all_as_read(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        cursor.execute("UPDATE notifikasi SET is_read = 1 WHERE user_id = %s AND is_read = 0", (current_user["id"],))
        db.commit()
        return {"success": True, "message": "Semua notifikasi ditandai sudah dibaca"}


def _ensure_tagihan_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tagihan_dokumen (
            id INT AUTO_INCREMENT PRIMARY KEY,
            satker_id INT NULL,
            eselon_1_id INT NULL,
            target_user_id INT NULL,
            pengirim_id INT NOT NULL,
            kategori_id INT NULL,
            judul_dokumen VARCHAR(255) NOT NULL,
            tahun INT NOT NULL,
            periode VARCHAR(100) NULL,
            tenggat_waktu DATE NULL,
            catatan TEXT NULL,
            status ENUM('belum_diunggah', 'sudah_diunggah') NOT NULL DEFAULT 'belum_diunggah',
            dokumen_id INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_satker_status (satker_id, status),
            INDEX idx_target_user (target_user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    try:
        cursor.execute("""
            SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tagihan_dokumen' AND COLUMN_NAME = 'tenggat_waktu'
        """)
        if cursor.fetchone()["cnt"] == 0:
            cursor.execute("ALTER TABLE tagihan_dokumen ADD COLUMN tenggat_waktu DATE NULL AFTER periode")
    except Exception:
        pass


@router.get("/tagihan-dokumen")
async def get_tagihan_dokumen(
    satker_id: Optional[int] = Query(None),
    target_user_id: Optional[int] = Query(None),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    role = current_user.get("role")
    tingkat = current_user.get("tingkat")
    is_it = bool(current_user.get("is_it") or role in ["it", "admin_it"])

    where = "1=1"
    params = []

    if role == "staff_eselon_1":
        # Staff Satker Eselon 1 hanya melihat tagihan untuk dirinya atau unit Eselon 1-nya sendiri
        e1_id = current_user.get("eselon_1_id")
        where += " AND (td.target_user_id = %s OR (td.satker_id IS NULL AND td.eselon_1_id = %s))"
        params.extend([current_user["id"], e1_id])
    elif tingkat == "satker" and not is_it:
        u_satker = current_user.get("satker_id")
        if u_satker:
            where += " AND (td.satker_id = %s OR td.target_user_id = %s)"
            params.extend([u_satker, current_user["id"]])
        else:
            where += " AND td.target_user_id = %s"
            params.append(current_user["id"])
    else:
        # Eselon 1 Pembina, K/L, atau Admin IT
        if tingkat == "eselon_1" and not is_it and current_user.get("eselon_1_id"):
            where += " AND (td.eselon_1_id = %s OR s.eselon_1_id = %s)"
            params.extend([current_user["eselon_1_id"], current_user["eselon_1_id"]])
        if satker_id is not None:
            where += " AND td.satker_id = %s"
            params.append(satker_id)
        if target_user_id is not None:
            where += " AND td.target_user_id = %s"
            params.append(target_user_id)

    with db.cursor(dictionary=True) as cursor:
        _ensure_tagihan_table(cursor)
        cursor.execute(
            f"""
            SELECT td.id, td.satker_id, td.eselon_1_id, td.target_user_id, td.pengirim_id,
                   td.kategori_id, td.judul_dokumen, td.tahun, td.periode, td.tenggat_waktu, td.catatan,
                   td.status, td.dokumen_id, td.created_at, td.updated_at,
                   k.nama AS kategori_nama, k.slug AS kategori_slug,
                   u_pengirim.nama AS pengirim_nama,
                   s.nama AS satker_nama, s.NO_Satker AS satker_kode
            FROM tagihan_dokumen td
            LEFT JOIN kategori_dokumen k ON k.id = td.kategori_id
            LEFT JOIN users u_pengirim ON u_pengirim.id = td.pengirim_id
            LEFT JOIN satkers s ON s.id = td.satker_id
            WHERE {where}
            ORDER BY FIELD(td.status, 'belum_diunggah', 'sudah_diunggah'), td.created_at DESC
            """,
            tuple(params),
        )
        rows = cursor.fetchall()
        return {"success": True, "data": rows}


@router.post("/tagihan-dokumen")
async def create_tagihan_dokumen(
    body: dict,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    role = current_user.get("role")
    tingkat = current_user.get("tingkat")
    is_it = bool(current_user.get("is_it") or role in ["it", "admin_it"])
    is_allowed = is_it or (tingkat in ["eselon_1", "kl"] and role != "staff_eselon_1")
    if not is_allowed:
        raise HTTPException(status_code=403, detail="Hanya Eselon 1, K/L, atau Admin IT yang dapat mengirim pemberitahuan dokumen.")

    items = body.get("items") or []
    if not isinstance(items, list) or len(items) == 0:
        raise HTTPException(status_code=400, detail="Minimal 1 dokumen harus dipilih/diisi.")

    satker_id = body.get("satker_id") or None
    target_user_id = body.get("target_user_id") or None
    eselon_1_id = body.get("eselon_1_id") or current_user.get("eselon_1_id") or None
    kode_satker = body.get("kode_satker")

    with db.cursor(dictionary=True) as cursor:
        _ensure_tagihan_table(cursor)

        if not satker_id and target_user_id:
            cursor.execute("SELECT satker_id, eselon_1_id FROM users WHERE id = %s LIMIT 1", (target_user_id,))
            tu = cursor.fetchone()
            if tu:
                satker_id = tu.get("satker_id")
                if not eselon_1_id:
                    eselon_1_id = tu.get("eselon_1_id")

        if not satker_id and kode_satker:
            cursor.execute("SELECT id, eselon_1_id FROM satkers WHERE NO_Satker = %s LIMIT 1", (str(kode_satker).strip(),))
            sr = cursor.fetchone()
            if sr:
                satker_id = sr["id"]
                if not eselon_1_id:
                    eselon_1_id = sr.get("eselon_1_id")

        if satker_id and not eselon_1_id:
            cursor.execute("SELECT eselon_1_id FROM satkers WHERE id = %s LIMIT 1", (satker_id,))
            sr = cursor.fetchone()
            if sr:
                eselon_1_id = sr.get("eselon_1_id")

        if not satker_id and not target_user_id:
            raise HTTPException(status_code=400, detail="Target satker atau pengguna wajib ditentukan.")

        inserted_ids = []
        judul_list = []

        for item in items:
            kat_id = item.get("kategori_id") or None
            judul_dok = str(item.get("judul_dokumen") or "").strip()
            tahun = int(item.get("tahun") or 2026)
            periode = str(item.get("periode") or "").strip() or None
            tenggat_waktu = str(item.get("tenggat_waktu") or "").strip() or None
            catatan = str(item.get("catatan") or "").strip() or None

            if not judul_dok and kat_id:
                cursor.execute("SELECT nama FROM kategori_dokumen WHERE id = %s LIMIT 1", (kat_id,))
                kr = cursor.fetchone()
                if kr:
                    judul_dok = kr["nama"]

            if not judul_dok:
                continue

            # Cek apakah satker/user sudah mengunggah dokumen pada kategori & tahun ini
            existing_doc_id = None
            if kat_id:
                if satker_id:
                    cursor.execute(
                        """
                        SELECT d.id FROM dokumen d
                        JOIN users u ON u.id = d.uploaded_by
                        WHERE u.satker_id = %s AND d.kategori_id = %s AND d.tahun = %s
                        ORDER BY d.created_at DESC LIMIT 1
                        """,
                        (satker_id, kat_id, tahun),
                    )
                else:
                    cursor.execute(
                        """
                        SELECT d.id FROM dokumen d
                        WHERE d.uploaded_by = %s AND d.kategori_id = %s AND d.tahun = %s
                        ORDER BY d.created_at DESC LIMIT 1
                        """,
                        (target_user_id, kat_id, tahun),
                    )
                ex = cursor.fetchone()
                if ex:
                    existing_doc_id = ex["id"]

            status_awal = "sudah_diunggah" if existing_doc_id else "belum_diunggah"

            cursor.execute(
                """
                INSERT INTO tagihan_dokumen
                (satker_id, eselon_1_id, target_user_id, pengirim_id, kategori_id, judul_dokumen, tahun, periode, tenggat_waktu, catatan, status, dokumen_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (satker_id, eselon_1_id, target_user_id, current_user["id"], kat_id, judul_dok, tahun, periode, tenggat_waktu, catatan, status_awal, existing_doc_id),
            )
            inserted_ids.append(cursor.lastrowid)
            judul_list.append(judul_dok)

        # Kirim notifikasi ke user target / semua user di satker tersebut
        target_users = []
        if target_user_id:
            target_users.append(int(target_user_id))
        elif satker_id:
            cursor.execute("SELECT id FROM users WHERE satker_id = %s AND is_active = 1", (satker_id,))
            target_users = [r["id"] for r in cursor.fetchall()]

        if target_users and judul_list:
            ringkasan = ", ".join(judul_list[:4]) + (f" (+{len(judul_list) - 4} lainnya)" if len(judul_list) > 4 else "")
            pesan_notif = f"{current_user.get('nama', 'Pembina')} meminta kelengkapan {len(judul_list)} dokumen: {ringkasan}."
            for uid in set(target_users):
                try:
                    cursor.execute(
                        """
                        INSERT INTO notifikasi (user_id, aksi, dokumen_id, judul, pesan, is_read)
                        VALUES (%s, %s, NULL, %s, %s, 0)
                        """,
                        (uid, "tagihan_dokumen", "Pemberitahuan Kelengkapan Dokumen", pesan_notif),
                    )
                except Exception:
                    pass

        db.commit()
        return {
            "success": True,
            "message": f"Berhasil mengirim pemberitahuan {len(inserted_ids)} dokumen ke satker.",
            "data": {"inserted_ids": inserted_ids},
        }


@router.delete("/tagihan-dokumen/{tagihan_id}")
async def delete_tagihan_dokumen(
    tagihan_id: int,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    role = current_user.get("role")
    tingkat = current_user.get("tingkat")
    is_it = bool(current_user.get("is_it") or role in ["it", "admin_it"])
    if not (is_it or (tingkat in ["eselon_1", "kl"] and role != "staff_eselon_1")):
        raise HTTPException(status_code=403, detail="Akses ditolak")

    with db.cursor(dictionary=True) as cursor:
        _ensure_tagihan_table(cursor)
        if not is_it and tingkat == "eselon_1" and current_user.get("eselon_1_id"):
            cursor.execute(
                "DELETE FROM tagihan_dokumen WHERE id = %s AND (eselon_1_id = %s OR pengirim_id = %s)",
                (tagihan_id, current_user["eselon_1_id"], current_user["id"])
            )
        else:
            cursor.execute("DELETE FROM tagihan_dokumen WHERE id = %s", (tagihan_id,))
        db.commit()
        return {"success": True, "message": "Pemberitahuan dokumen dihapus"}
