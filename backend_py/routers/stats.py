from fastapi import APIRouter, Depends, Query, Request
from typing import Optional
from db import get_db
from auth import get_current_user

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(
    satker: Optional[int] = None,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        role_id = current_user.get("role_id")
        user_id = current_user.get("id")
        
        # Admin IT tidak boleh melihat data keuangan
        if role_id == 4:
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="Akses ditolak. Admin IT tidak berhak melihat data laporan keuangan.")
            
        # Get user's satker_id
        cursor.execute("SELECT satker_id FROM users WHERE id = %s", (user_id,))
        user_data = cursor.fetchone()
        user_satker_id = user_data["satker_id"] if user_data else None

        user_filter = "WHERE role_id IN (2, 3) AND is_active = 1"
        kk_filter = "WHERE 1=1"
        params = []
        kk_params = []

        if role_id in (1, 2):
            if user_satker_id:
                user_filter += " AND satker_id = %s"
                params.append(user_satker_id)
                kk_filter += " AND satker_id = %s"
                kk_params.append(user_satker_id)
            else:
                user_filter += " AND satker_id = 0"
                kk_filter += " AND satker_id = 0"
        else:
            if satker:
                user_filter += " AND satker_id = %s"
                params.append(satker)
                kk_filter += " AND satker_id = %s"
                kk_params.append(satker)

        # 1. Total User
        cursor.execute(f"SELECT COUNT(id) AS total FROM users {user_filter}", tuple(params))
        total_user = cursor.fetchone()["total"]

        # 1.2 Total Satker (Khusus Eselon 1 & Admin)
        total_satker = 0
        if role_id in (3, 4):
            if satker:
                total_satker = 1
            else:
                cursor.execute("SELECT COUNT(id) AS total FROM satkers")
                total_satker = cursor.fetchone()["total"]

        # 1.5 Total Dokumen
        doc_filter = ""
        doc_params = []
        if role_id in (1, 2):
            if user_satker_id:
                doc_filter = "JOIN users u ON d.uploaded_by = u.id WHERE u.satker_id = %s"
                doc_params.append(user_satker_id)
            else:
                doc_filter = "JOIN users u ON d.uploaded_by = u.id WHERE u.satker_id = 0"
        elif satker:
            doc_filter = "JOIN users u ON d.uploaded_by = u.id WHERE u.satker_id = %s"
            doc_params.append(satker)
            
        cursor.execute(f"SELECT COUNT(d.id) AS total FROM dokumen d {doc_filter}", tuple(doc_params))
        total_dokumen = cursor.fetchone()["total"]

        # 2. Total Saldo
        cursor.execute(f"SELECT SUM(IFNULL(saldo_akhir_bulan, 0) + IFNULL(saldo_rk, 0) + IFNULL(saldo_rekening, 0) + IFNULL(saldo_rpl_lpj, 0)) AS total_saldo FROM rekening_koran {kk_filter}", tuple(kk_params))
        saldo_res = cursor.fetchone()
        total_saldo = float(saldo_res["total_saldo"] or 0) if saldo_res else 0.0

        # 3. Saldo Per Satker / Per Kategori Saldo
        is_single_satker = False
        if role_id in (1, 2) and user_satker_id:
            is_single_satker = True
        elif role_id in (3, 4) and satker:
            is_single_satker = True

        formatted_satker = []
        if is_single_satker:
            target_satker_id = None
            if role_id in (1, 2) and user_satker_id:
                target_satker_id = user_satker_id
            elif satker:
                target_satker_id = satker

            if target_satker_id:
                cursor.execute("""
                    SELECT k.nama AS nama, SUM(a.nominal) AS value
                    FROM pencatatan a
                    JOIN kategori_dokumen k ON a.id_kategori = k.id
                    JOIN users u ON a.created_by = u.id
                    WHERE u.satker_id = %s
                    GROUP BY k.id
                    ORDER BY value DESC
                """, (target_satker_id,))
                
                tipe_saldo_res = cursor.fetchall()
                formatted_satker = [
                    {"nama": item["nama"] or "Tidak Diketahui", "value": float(item["value"] or 0)} 
                    for item in tipe_saldo_res
                ]
        else:
            kk_filter_satker = kk_filter.replace("satker_id", "k.satker_id").replace("WHERE 1=1", "WHERE 1=1 AND k.satker_id IS NOT NULL")
            cursor.execute(f"""
                SELECT s.nama, SUM(IFNULL(k.saldo_akhir_bulan, 0) + IFNULL(k.saldo_rk, 0) + IFNULL(k.saldo_rekening, 0) + IFNULL(k.saldo_rpl_lpj, 0)) AS value 
                FROM rekening_koran k 
                JOIN satkers s ON k.satker_id = s.id 
                {kk_filter_satker}
                GROUP BY s.id 
                ORDER BY value DESC
            """, tuple(kk_params))
            
            satker_res = cursor.fetchall()
            formatted_satker = [
                {"nama": item["nama"] or "Tidak Diketahui", "value": float(item["value"] or 0)} 
                for item in satker_res
            ]

        # 4. Tren Saldo Per Tahun & Periode
        cursor.execute(f"""
            SELECT tahun, periode, SUM(IFNULL(saldo_akhir_bulan, 0) + IFNULL(saldo_rk, 0) + IFNULL(saldo_rekening, 0) + IFNULL(saldo_rpl_lpj, 0)) AS total 
            FROM rekening_koran 
            {kk_filter}
            GROUP BY tahun, periode 
            ORDER BY tahun ASC, periode ASC
        """, tuple(kk_params))
        
        periode_res = cursor.fetchall()
        tren_map = {}
        for item in periode_res:
            yr = str(item["tahun"] or "2026")
            if yr not in tren_map:
                tren_map[yr] = {"tahun": yr, "periode_1": 0, "periode_2": 0}
            if str(item["periode"]) == '1':
                tren_map[yr]["periode_1"] = float(item["total"] or 0)
            else:
                tren_map[yr]["periode_2"] = float(item["total"] or 0)
                
        formatted_tren = sorted(list(tren_map.values()), key=lambda x: int(x["tahun"]))

        return {
            "success": True,
            "data": {
                "total_user": total_user,
                "total_satker": total_satker,
                "total_dokumen": total_dokumen,
                "total_saldo": total_saldo,
                "saldo_per_satker": formatted_satker,
                "saldo_per_periode": formatted_tren
            }
        }
