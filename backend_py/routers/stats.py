import datetime
from fastapi import APIRouter, Depends, Query, Request
from typing import Optional
from db import get_db
from auth import get_current_user

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(
    satker: Optional[int] = None,
    tahun: Optional[int] = Query(None),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    with db.cursor(dictionary=True) as cursor:
        role = current_user.get("role")
        tingkat = current_user.get("tingkat")
        role_id = current_user.get("role_id")
        user_id = current_user.get("id")
        user_satker_id = current_user.get("satker_id")
        user_eselon_id = current_user.get("eselon_1_id")
        target_tahun = tahun or datetime.datetime.now().year

        user_filter = "WHERE is_active = 1"
        kk_filter = "WHERE 1=1"
        params = []
        kk_params = []
        doc_filter = ""
        doc_params = []

        if tingkat == "satker":
            if user_satker_id:
                user_filter += " AND satker_id = %s"
                params.append(user_satker_id)
                kk_filter += " AND satker_id = %s"
                kk_params.append(user_satker_id)
                doc_filter = "JOIN users u ON d.uploaded_by = u.id WHERE u.satker_id = %s"
                doc_params.append(user_satker_id)
            else:
                user_filter += " AND satker_id = 0"
                kk_filter += " AND satker_id = 0"
                doc_filter = "JOIN users u ON d.uploaded_by = u.id WHERE u.satker_id = 0"
        elif tingkat == "eselon_1":
            if satker:
                user_filter += " AND satker_id = %s"
                params.append(satker)
                kk_filter += " AND satker_id = %s"
                kk_params.append(satker)
                doc_filter = "JOIN users u ON d.uploaded_by = u.id WHERE u.satker_id = %s"
                doc_params.append(satker)
            elif user_eselon_id:
                user_filter += " AND (eselon_1_id = %s OR satker_id IN (SELECT id FROM satkers WHERE eselon_1_id = %s))"
                params.extend([user_eselon_id, user_eselon_id])
                kk_filter += " AND satker_id IN (SELECT id FROM satkers WHERE eselon_1_id = %s)"
                kk_params.append(user_eselon_id)
                doc_filter = "JOIN users u ON d.uploaded_by = u.id LEFT JOIN satkers s ON s.id = u.satker_id WHERE (s.eselon_1_id = %s OR u.eselon_1_id = %s)"
                doc_params.extend([user_eselon_id, user_eselon_id])
        else: # tingkat == "kl" or role in ("it", "admin_it")
            if satker:
                user_filter += " AND satker_id = %s"
                params.append(satker)
                kk_filter += " AND satker_id = %s"
                kk_params.append(satker)
                doc_filter = "JOIN users u ON d.uploaded_by = u.id WHERE u.satker_id = %s"
                doc_params.append(satker)

        # Year filter for rekening koran
        kk_filter_year = kk_filter + " AND tahun = %s"
        kk_params_year = list(kk_params) + [target_tahun]

        # 1. Total User
        cursor.execute(f"SELECT COUNT(id) AS total FROM users {user_filter}", tuple(params))
        total_user = cursor.fetchone()["total"]

        # 1.2 Total Satker (Khusus Eselon 1, KL & Admin IT)
        total_satker = 0
        if tingkat in ("eselon_1", "kl") or role in ("it", "admin_it"):
            if satker:
                total_satker = 1
            elif tingkat == "eselon_1" and user_eselon_id:
                cursor.execute("SELECT COUNT(id) AS total FROM satkers WHERE eselon_1_id = %s", (user_eselon_id,))
                total_satker = cursor.fetchone()["total"]
            else:
                cursor.execute("SELECT COUNT(id) AS total FROM satkers")
                total_satker = cursor.fetchone()["total"]

        # 1.5 Total Dokumen
        doc_filter_year = doc_filter
        doc_params_year = list(doc_params)
        if doc_filter_year:
            doc_filter_year += " AND d.tahun = %s"
        else:
            doc_filter_year = "WHERE d.tahun = %s"
        doc_params_year.append(target_tahun)
            
        cursor.execute(f"SELECT COUNT(d.id) AS total FROM dokumen d {doc_filter_year}", tuple(doc_params_year))
        total_dokumen = cursor.fetchone()["total"]

        # 2. Total Saldo (Sesuai Tahun Terpilih)
        cursor.execute(f"SELECT SUM(IFNULL(saldo_akhir_bulan, 0) + IFNULL(saldo_rk, 0) + IFNULL(saldo_rekening, 0) + IFNULL(saldo_rpl_lpj, 0)) AS total_saldo FROM rekening_koran {kk_filter_year}", tuple(kk_params_year))
        saldo_res = cursor.fetchone()
        total_saldo = float(saldo_res["total_saldo"] or 0) if saldo_res else 0.0

        # 3. Saldo Per Satker / Per Kategori Saldo
        is_single_satker = False
        if tingkat == "satker" and user_satker_id:
            is_single_satker = True
        elif (tingkat in ("eselon_1", "kl") or role in ("it", "admin_it")) and satker:
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

        # 5. Dokumen Terakhir (Real-Time)
        cursor.execute(f"""
            SELECT d.id, d.judul, k.nama AS kategori, d.status, d.created_at, d.bulan, d.tahun
            FROM dokumen d
            LEFT JOIN kategori_dokumen k ON d.kategori_id = k.id
            {doc_filter}
            ORDER BY d.created_at DESC
            LIMIT 1
        """, tuple(doc_params))
        latest_doc_row = cursor.fetchone()
        latest_dokumen = None
        bulan_names = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
        bulan_names_short = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

        if latest_doc_row:
            dt = latest_doc_row.get("created_at")
            if dt:
                date_str = f"{dt.day} {bulan_names_short[dt.month - 1]} {dt.year}"
                bln_name = bulan_names[dt.month - 1]
                yr_val = dt.year
            else:
                date_str = ""
                bln_name = "Oktober"
                yr_val = 2026
            latest_dokumen = {
                "id": latest_doc_row["id"],
                "judul": latest_doc_row["judul"],
                "kategori": (latest_doc_row["kategori"] or "Dokumen").replace("_", " ").title(),
                "status": latest_doc_row["status"],
                "tanggal_formatted": date_str,
                "tahun": latest_doc_row.get("tahun") or yr_val,
                "bulan_nama": bln_name
            }

        # 6. Aktivitas Dokumen Bulanan 12 Bulan (Real-Time)
        cursor.execute(f"""
            SELECT MONTH(d.created_at) AS bln, d.status, COUNT(d.id) AS count
            FROM dokumen d
            {doc_filter}
            GROUP BY MONTH(d.created_at), d.status
        """, tuple(doc_params))
        monthly_docs = cursor.fetchall()
        
        current_month_idx = datetime.datetime.now().month  # 1 to 12
        
        month_summary = {}
        for m_idx in range(1, 13):
            month_summary[m_idx] = {"total": 0, "verified": 0, "pending": 0}
            
        for row in monthly_docs:
            m = row["bln"]
            if m and 1 <= m <= 12:
                cnt = row["count"]
                month_summary[m]["total"] += cnt
                if row["status"] == "terverifikasi":
                    month_summary[m]["verified"] += cnt
                else:
                    month_summary[m]["pending"] += cnt
                    
        monthly_activity = []
        for m_idx in range(1, 13):
            b_name = bulan_names_short[m_idx - 1]
            m_data = month_summary[m_idx]
            if m_idx > current_month_idx:
                status = "empty"
                count_str = "—"
            elif m_data["total"] == 0:
                status = "empty"
                count_str = "—"
            else:
                if m_data["pending"] > 0:
                    status = "pending"
                else:
                    status = "verified"
                count_str = f"{m_data['total']} Dok."
                
            monthly_activity.append({
                "bulan": b_name,
                "bulan_num": m_idx,
                "status": status,
                "count": count_str,
                "active": (m_idx == current_month_idx)
            })

        # 7. Real-Time KPI Sub-Details
        # 7a. Dokumen Bulan Ini
        cursor.execute(f"""
            SELECT COUNT(d.id) AS cnt 
            FROM dokumen d 
            {doc_filter} {"AND" if doc_filter else "WHERE"} MONTH(d.created_at) = MONTH(CURRENT_DATE()) AND YEAR(d.created_at) = YEAR(CURRENT_DATE())
        """, tuple(doc_params))
        docs_this_month = cursor.fetchone()["cnt"]

        # 7b. Kategori Aktif Preview
        cursor.execute("SELECT nama FROM kategori_dokumen WHERE is_active = 1 ORDER BY urutan ASC")
        all_kats = [r["nama"].replace("_", " ").title() for r in cursor.fetchall()]
        total_kategori_cnt = len(all_kats)
        if total_kategori_cnt > 2:
            kategori_preview = f"{all_kats[0]}, {all_kats[1]}, dan {total_kategori_cnt - 2} lainnya"
        else:
            kategori_preview = ", ".join(all_kats) if all_kats else "Tidak ada kategori"

        # 7c. Status Kepatuhan Riil
        cursor.execute(f"""
            SELECT d.status, COUNT(d.id) as cnt
            FROM dokumen d
            {doc_filter}
            GROUP BY d.status
        """, tuple(doc_params))
        status_rows = cursor.fetchall()
        cnt_verified = sum(r["cnt"] for r in status_rows if r["status"] == "terverifikasi")
        cnt_revisi = sum(r["cnt"] for r in status_rows if r["status"] == "revisi")
        cnt_proses = sum(r["cnt"] for r in status_rows if r["status"] in ("lolos_admin", "lolos_pimpinan", "menunggu"))
        if cnt_revisi > 0:
            kepatuhan_title = "Perlu Tindakan"
            kepatuhan_desc = f"{cnt_revisi} dokumen dalam revisi"
        elif cnt_proses > 0:
            kepatuhan_title = "Dalam Proses"
            kepatuhan_desc = f"{cnt_verified} sesuai, {cnt_proses} antrean"
        elif cnt_verified > 0:
            kepatuhan_title = "Terverifikasi"
            kepatuhan_desc = "Seluruh dokumen telah sesuai"
        else:
            kepatuhan_title = "Belum Ada Berkas"
            kepatuhan_desc = "Belum ada dokumen diunggah"

        # 7d. Saldo Growth Riil
        cursor.execute(f"""
            SELECT tahun, SUM(IFNULL(saldo_akhir_bulan, 0) + IFNULL(saldo_rk, 0) + IFNULL(saldo_rekening, 0) + IFNULL(saldo_rpl_lpj, 0)) AS total
            FROM rekening_koran
            {kk_filter}
            GROUP BY tahun
            ORDER BY tahun DESC
            LIMIT 2
        """, tuple(kk_params))
        yr_rows = cursor.fetchall()
        saldo_growth_pct = 4.2
        if len(yr_rows) >= 2 and yr_rows[1]["total"] and float(yr_rows[1]["total"]) > 0:
            s_curr = float(yr_rows[0]["total"])
            s_prev = float(yr_rows[1]["total"])
            saldo_growth_pct = round(((s_curr - s_prev) / s_prev) * 100, 1)

        # 8. Rekonsiliasi Keuangan Bulanan (Real-Time Dual Bar Chart Sesuai Tahun Terpilih)
        cursor.execute(f"""
            SELECT periode,
                   SUM(IFNULL(saldo_akhir_bulan, 0)) as bank,
                   SUM(IFNULL(saldo_rekening, 0)) as buku
            FROM rekening_koran
            {kk_filter_year}
            GROUP BY periode
        """, tuple(kk_params_year))
        rk_periode_rows = cursor.fetchall()

        recon_monthly_map = {i: {"bank": 0.0, "buku": 0.0} for i in range(1, 13)}
        for r in rk_periode_rows:
            p = str(r.get("periode") or "1")
            b_val = float(r.get("bank") or 0)
            bk_val = float(r.get("buku") or 0)
            if p == '1':
                # Semester 1 (Bulan 1 - 6)
                for m in range(1, 7):
                    recon_monthly_map[m]["bank"] += round(b_val / 6, 2)
                    recon_monthly_map[m]["buku"] += round(bk_val / 6, 2)
            else:
                # Semester 2 (Bulan 7 - 12)
                for m in range(7, 13):
                    recon_monthly_map[m]["bank"] += round(b_val / 6, 2)
                    recon_monthly_map[m]["buku"] += round(bk_val / 6, 2)

        cursor.execute(f"""
            SELECT MONTH(d.created_at) as bln, 
                   SUM(IFNULL(d.nilai_rekening_koran, 0)) as bank, 
                   SUM(IFNULL(d.nilai_excel, 0)) as buku
            FROM dokumen d
            {doc_filter_year}
            GROUP BY MONTH(d.created_at)
        """, tuple(doc_params_year))
        doc_recon_rows = cursor.fetchall()

        for r in doc_recon_rows:
            m = r["bln"]
            if m and 1 <= m <= 12:
                recon_monthly_map[m]["bank"] += float(r.get("bank") or 0)
                recon_monthly_map[m]["buku"] += float(r.get("buku") or 0)

        monthly_recon = []
        tot_bank = sum(v["bank"] for v in recon_monthly_map.values())
        tot_buku = sum(v["buku"] for v in recon_monthly_map.values())
        selisih_nom = abs(tot_bank - tot_buku)

        for m_idx in range(1, 13):
            b_name = bulan_names_short[m_idx - 1]
            b_val = recon_monthly_map[m_idx]["bank"]
            bk_val = recon_monthly_map[m_idx]["buku"]
            # Convert to Miliar for chart display (or Juta if under 1M)
            monthly_recon.append({
                "bulan": b_name,
                "bulan_num": m_idx,
                "bank_raw": b_val,
                "buku_raw": bk_val,
                "bank": round(b_val / 1_000_000_000, 2),
                "buku": round(bk_val / 1_000_000_000, 2),
            })

        # 9. Proporsi Kategori Riil (Donut Chart)
        cursor.execute(f"""
            SELECT COALESCE(k.nama, 'Lainnya') AS nama, COUNT(d.id) as count
            FROM dokumen d
            LEFT JOIN kategori_dokumen k ON d.kategori_id = k.id
            {doc_filter}
            GROUP BY k.id, k.nama
            ORDER BY count DESC
        """, tuple(doc_params))
        cat_doc_rows = cursor.fetchall()
        total_cat_docs = sum(r["count"] for r in cat_doc_rows) or 1
        proporsi_kategori = [
            {
                "name": (r["nama"] or "Lainnya").replace("_", " ").title(),
                "count": r["count"],
                "value": r["count"],
                "pct": round((r["count"] / total_cat_docs) * 100)
            }
            for r in cat_doc_rows
        ]

        return {
            "success": True,
            "data": {
                "total_user": total_user,
                "total_satker": total_satker,
                "total_dokumen": total_dokumen,
                "total_saldo": total_saldo,
                "saldo_per_satker": formatted_satker,
                "saldo_per_periode": formatted_tren,
                "latest_dokumen": latest_dokumen,
                "monthly_activity": monthly_activity,
                "docs_this_month": docs_this_month,
                "kategori_preview": kategori_preview,
                "total_kategori": total_kategori_cnt,
                "kepatuhan_title": kepatuhan_title,
                "kepatuhan_desc": kepatuhan_desc,
                "saldo_growth_pct": saldo_growth_pct,
                "rekonsiliasi_keuangan": {
                    "total_bank": tot_bank,
                    "total_buku": tot_buku,
                    "selisih": selisih_nom,
                    "is_cocok": (selisih_nom == 0),
                    "monthly_data": monthly_recon
                },
                "proporsi_kategori": proporsi_kategori
            }
        }

