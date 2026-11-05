"""
Service untuk mengunduh dan menganalisis berkas Google Drive secara real-time.
Mampu mendeteksi secara akurat status kegagalan akses:
- Private / Akses Dibatasi (You need permission)
- Quota Exceeded / Batasan Pengunjung Terlampaui
- File Not Found / Berkas Dihapus (404)
- Link Format Salah
Serta mengekstrak data identitas bank, nomor rekening, dan saldo akhir secara otomatis.
"""

import os
import re
import io
import time
import logging
from typing import Dict, Any, Optional, Tuple
import httpx

from services.reconciliation import (
    scan_uploaded_file,
    parse_indonesian_number
)

logger = logging.getLogger(__name__)

# Regex untuk mengekstrak File ID dari berbagai format URL Google Drive
GDRIVE_ID_PATTERNS = [
    r"/file/d/([a-zA-Z0-9_-]{15,})",
    r"id=([a-zA-Z0-9_-]{15,})",
    r"/d/([a-zA-Z0-9_-]{15,})",
    r"/document/d/([a-zA-Z0-9_-]{15,})",
    r"/spreadsheets/d/([a-zA-Z0-9_-]{15,})",
    r"/presentation/d/([a-zA-Z0-9_-]{15,})",
    r"^([a-zA-Z0-9_-]{25,})$",
]

def extract_gdrive_file_id(url: str) -> Optional[str]:
    """Mengambil File ID dari URL Google Drive atau string ID langsung."""
    if not url:
        return None
    url = url.strip()
    for pattern in GDRIVE_ID_PATTERNS:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def extract_gdrive_folder_id(url: str) -> Optional[str]:
    """Mengambil Folder ID dari URL Google Drive atau string ID langsung."""
    if not url:
        return None
    url = url.strip()
    m = re.search(r"/folders/([a-zA-Z0-9_-]{15,})", url)
    if m:
        return m.group(1)
    m = re.search(r"id=([a-zA-Z0-9_-]{15,})", url)
    if m:
        return m.group(1)
    if re.match(r"^[a-zA-Z0-9_-]{20,}$", url):
        return url
    return None

async def download_and_scan_gdrive(
    drive_url: str,
    temp_dir: str
) -> Dict[str, Any]:
    """
    Mengunduh berkas dari tautan Google Drive dan langsung mengekstrak entitas bank, rekening, dan saldo.
    Mengembalikan diagnostik lengkap termasuk alasan spesifik jika gagal diakses.
    """
    # 0. Deteksi jika tautan berupa FOLDER, bukan FILE
    if "/drive/folders/" in drive_url or "/folders/" in drive_url:
        return {
            "success": False,
            "error_type": "FOLDER_NOT_FILE",
            "error_title": "Tautan Adalah Folder, Bukan Berkas File",
            "error_message": "Tautan yang Anda tempel adalah tautan FOLDER Google Drive. Di tab 'Berkas Satuan', sistem membutuhkan link langsung ke berkas PDF atau Excel rekening koran. Silakan buka folder tersebut di Google Drive, klik kanan atau titik tiga (⋮) pada berkas file yang ingin diunggah, lalu pilih 'Bagikan' -> 'Salin link'."
        }

    # 1. Ekstrak File ID
    file_id = extract_gdrive_file_id(drive_url)
    if not file_id:
        return {
            "success": False,
            "error_type": "INVALID_URL",
            "error_title": "Format Link Tidak Valid",
            "error_message": "Pastikan tautan yang ditempel adalah tautan resmi berkas Google Drive (contoh: https://drive.google.com/file/d/...)."
        }

    os.makedirs(temp_dir, exist_ok=True)
    
    # URL direct download Google Drive
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        async with httpx.AsyncClient(timeout=45.0, follow_redirects=True) as client:
            res = await client.get(download_url, headers=headers)
            
            # 1. Pengecekan HTTP 404
            if res.status_code == 404:
                return {
                    "success": False,
                    "error_type": "NOT_FOUND",
                    "error_title": "Berkas Tidak Ditemukan (404)",
                    "error_message": "Berkas di Google Drive tidak ditemukan atau sudah dihapus oleh pemiliknya. Periksa kembali tautan berkas."
                }
                
            content = res.content
            content_str = ""
            # Cek apakah response berupa HTML teks
            if b"<html" in content[:2000].lower() or b"<!doctype html" in content[:2000].lower():
                try:
                    content_str = content.decode("utf-8", errors="ignore")
                except Exception:
                    content_str = ""
                    
                # 2. Pengecekan Akses Dibatasi (Private / Permission Required)
                if any(x in content_str.lower() for x in [
                    "you need permission",
                    "you need access",
                    "akses ditolak",
                    "access denied",
                    "perlu izin",
                    "minta akses",
                    "accounts.google.com/signin",
                    "accounts.google.com/servicelogin"
                ]):
                    return {
                        "success": False,
                        "error_type": "PRIVATE_ACCESS_DENIED",
                        "error_title": "Link Tidak Bisa Diakses (Private)",
                        "error_message": "Berkas di Google Drive masih disetel 'Dibatasi' (Private). Harap ubah setelan akses berkas di Google Drive menjadi 'Siapa saja yang memiliki link dapat melihat' (Anyone with the link can view)."
                    }
                    
                # 3. Pengecekan Batas Pengunjung / Kuota Unduhan Terlampaui
                if any(x in content_str.lower() for x in [
                    "download quota exceeded",
                    "kuota unduhan terlampaui",
                    "too many users have viewed or downloaded",
                    "terlalu banyak pengguna yang melihat atau mengunduh",
                    "batas unduhan terlampaui"
                ]):
                    return {
                        "success": False,
                        "error_type": "QUOTA_EXCEEDED",
                        "error_title": "Batas Unduhan Terlampaui (Traffic Penuh)",
                        "error_message": "Google Drive membatasi pengunduhan berkas ini karena lonjakan traffic/unduhan dalam waktu singkat. Silakan tunggu beberapa saat atau unggah berkas langsung dari komputer."
                    }

                # 4. Handle Virus Scan Warning untuk file besar (>100MB)
                confirm_match = re.search(r"confirm=([a-zA-Z0-9_-]+)", content_str)
                if confirm_match:
                    confirm_code = confirm_match.group(1)
                    confirm_url = f"https://drive.google.com/uc?export=download&confirm={confirm_code}&id={file_id}"
                    res_confirm = await client.get(confirm_url, headers=headers)
                    if res_confirm.status_code == 200 and not (b"<html" in res_confirm.content[:2000].lower()):
                        content = res_confirm.content
                    else:
                        return {
                            "success": False,
                            "error_type": "CONFIRM_FAILED",
                            "error_title": "Konfirmasi Unduhan Gagal",
                            "error_message": "Berkas Google Drive terlalu besar dan membutuhkan konfirmasi manual. Harap unduh dan unggah langsung ke web."
                        }

            # Validasi apakah berkas yang diunduh benar-benar file biner dokumen (bukan halaman web error Google)
            if b"<html" in content[:1000].lower():
                return {
                    "success": False,
                    "error_type": "UNREADABLE_RESPONSE",
                    "error_title": "Tautan Tidak Dapat Diunduh",
                    "error_message": "Google Drive tidak mengizinkan pengunduhan langsung berkas ini. Pastikan berkas berupa dokumen (PDF/Excel/Gambar) dan dibagikan secara publik."
                }

            # 5. Deteksi nama file dari Header Content-Disposition atau ekstensi biner
            filename = f"gdrive_{file_id}_{int(time.time())}.pdf"
            cd = res.headers.get("content-disposition", "")
            fname_match = re.search(r'filename\*?=(?:UTF-8\'\')?"?([^";]+)"?', cd, re.IGNORECASE)
            if fname_match:
                filename = fname_match.group(1).strip()
            else:
                # Deteksi ekstensi dari magic bytes
                if content.startswith(b"%PDF-"):
                    filename = f"gdrive_{file_id}.pdf"
                elif content.startswith(b"PK\x03\x04"):
                    filename = f"gdrive_{file_id}.xlsx"
                elif content.startswith(b"\xFF\xD8\xFF"):
                    filename = f"gdrive_{file_id}.jpg"
                elif content.startswith(b"\x89PNG"):
                    filename = f"gdrive_{file_id}.png"

            # Simpan berkas sementara ke disk
            saved_filename = f"{int(time.time())}_{filename}"
            saved_path = os.path.join(temp_dir, saved_filename)
            with open(saved_path, "wb") as f:
                f.write(content)

            file_size = len(content)

            # 6. Jalankan Engine AI / OCR Parser
            scan_result: Dict[str, Any] = scan_uploaded_file(content, filename)

            # Hitung kolom apa saja yang berhasil atau belum terdeteksi
            nama_bank = scan_result.get("bank")
            nomor_rekening = scan_result.get("rekening")
            nama_rekening = scan_result.get("nama_rekening")
            saldo_akhir = scan_result.get("nominal")
            is_scanned = scan_result.get("is_scanned_image", False)
            warning_msg = scan_result.get("warning")

            missing_fields = []
            if not nama_bank or str(nama_bank).strip() in ["-", "None", ""]:
                missing_fields.append("Nama Bank")
            if not nomor_rekening or str(nomor_rekening).strip() in ["-", "None", ""]:
                missing_fields.append("Nomor Rekening")
            if saldo_akhir is None or float(saldo_akhir) < 0:
                missing_fields.append("Saldo Akhir (Rp)")

            is_perfect = len(missing_fields) == 0

            return {
                "success": True,
                "file_id": file_id,
                "file_name": filename,
                "saved_filename": saved_filename,
                "saved_path": saved_path,
                "file_size": file_size,
                "drive_url": drive_url,
                "is_perfect": is_perfect,
                "is_scanned_image": is_scanned,
                "missing_fields": missing_fields,
                "warning": warning_msg,
                "extracted": {
                    "nama_bank": nama_bank or "",
                    "nomor_rekening": nomor_rekening or "",
                    "nama_rekening": nama_rekening or "",
                    "saldo_akhir": saldo_akhir if saldo_akhir is not None else 0.0,
                    "tanggal_surat": scan_result.get("tanggal_surat") or "",
                    "bulan": scan_result.get("bulan"),
                    "tahun": scan_result.get("tahun") or time.gmtime().tm_year,
                    "kategori_id": scan_result.get("kategori_id") or 1,
                    "judul": scan_result.get("judul") or f"Laporan Rekening Koran - {nama_bank or 'Bank'} ({filename})"
                }
            }

    except httpx.ConnectTimeout:
        return {
            "success": False,
            "error_type": "TIMEOUT",
            "error_title": "Koneksi Google Drive Terputus (Timeout)",
            "error_message": "Waktu koneksi ke Google Drive habis. Periksa koneksi internet server atau coba beberapa saat lagi."
        }
    except Exception as e:
        logger.exception("Error downloading Google Drive file: %s", e)
        return {
            "success": False,
            "error_type": "UNKNOWN_ERROR",
            "error_title": "Gagal Mengakses Tautan",
            "error_message": f"Terjadi kesalahan saat mengunduh dari Google Drive: {str(e)}"
        }

async def scan_gdrive_folder(
    folder_url: str,
    batch_dir: str,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Menjelajahi folder Google Drive secara rekursif (termasuk sub-folder satker),
    mengunduh seluruh berkas rekening koran, dan mengekstrak bank, no rek, serta saldo tiap berkas.
    """
    folder_id = extract_gdrive_folder_id(folder_url)
    if not folder_id:
        return {
            "success": False,
            "error_type": "INVALID_URL",
            "error_title": "Format Link Folder Tidak Valid",
            "error_message": "Pastikan tautan yang dimasukkan berformat tautan folder Google Drive resmi (contoh: https://drive.google.com/drive/folders/...)."
        }

    api_key = api_key or os.getenv("GDRIVE_API_KEY", "").strip()
    if not api_key:
        return {
            "success": False,
            "error_type": "NO_API_KEY",
            "error_title": "Google Drive API Key Belum Terpasang",
            "error_message": "GDRIVE_API_KEY belum dikonfigurasi di file environment server."
        }

    os.makedirs(batch_dir, exist_ok=True)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            folders_to_visit = [(folder_id, "")]
            visited_folders = set()
            found_files = []

            while folders_to_visit and len(found_files) < 60:
                curr_id, curr_path = folders_to_visit.pop(0)
                if curr_id in visited_folders:
                    continue
                visited_folders.add(curr_id)

                q = f"'{curr_id}' in parents and trashed = false"
                params = {
                    "q": q,
                    "fields": "files(id, name, mimeType, size)",
                    "key": api_key,
                    "pageSize": 50
                }
                res = await client.get("https://www.googleapis.com/drive/v3/files", params=params, headers=headers)
                if res.status_code != 200:
                    err_msg = ""
                    try:
                        err_msg = res.json().get("error", {}).get("message", "")
                    except Exception:
                        pass
                    if res.status_code == 404:
                        return {
                            "success": False,
                            "error_type": "NOT_FOUND",
                            "error_title": "Folder Tidak Ditemukan (404)",
                            "error_message": "Folder Google Drive tidak ditemukan atau sudah dihapus."
                        }
                    elif res.status_code == 403:
                        return {
                            "success": False,
                            "error_type": "PRIVATE_ACCESS_DENIED",
                            "error_title": "Akses Folder Ditolak (Masih Private)",
                            "error_message": "Folder di Google Drive masih disetel 'Dibatasi' (Private). Mohon ubah akses folder menjadi 'Siapa saja yang memiliki link dapat melihat'."
                        }
                    else:
                        return {
                            "success": False,
                            "error_type": "API_ERROR",
                            "error_title": "Gagal Mengakses Folder Google Drive",
                            "error_message": f"Respon dari Google: {err_msg or ('HTTP ' + str(res.status_code))}"
                        }

                data = res.json()
                items = data.get("files", [])
                for it in items:
                    mime = it.get("mimeType", "")
                    fname = it.get("name", "")
                    if mime == "application/vnd.google-apps.folder":
                        if it["id"] not in visited_folders and len(visited_folders) < 20:
                            folders_to_visit.append((it["id"], f"{curr_path}/{fname}".strip("/")))
                    else:
                        ext = os.path.splitext(fname)[1].lower()
                        if ext in [".pdf", ".xlsx", ".xls", ".doc", ".docx", ".jpg", ".jpeg", ".png"] or not ext:
                            it["subfolder_path"] = curr_path.strip("/")
                            found_files.append(it)

            if not found_files:
                return {
                    "success": False,
                    "error_type": "EMPTY_FOLDER",
                    "error_title": "Tidak Ada Berkas yang Ditemukan",
                    "error_message": "Folder Google Drive ini kosong atau tidak berisi berkas rekening koran (.pdf, .xlsx, .xls, .jpg, .png)."
                }

            # Download dan scan tiap berkas
            extracted_items = []
            for idx, f_item in enumerate(found_files):
                f_id = f_item["id"]
                orig_name = f_item.get("name", f"dokumen_{idx+1}.pdf")
                sub_path = f_item.get("subfolder_path", "")
                
                # Jika subfolder ada nama/kode satker, sematkan di nama file agar satker terdeteksi otomatis
                display_name = f"{sub_path} - {orig_name}" if sub_path else orig_name

                # Unduh berkas
                content = b""
                # Coba via Google Drive API alt=media
                try:
                    dl_res = await client.get(f"https://www.googleapis.com/drive/v3/files/{f_id}?alt=media&key={api_key}")
                    if dl_res.status_code == 200 and b"<html" not in dl_res.content[:500]:
                        content = dl_res.content
                except Exception:
                    pass

                # Fallback ke direct download
                if not content or len(content) < 50:
                    try:
                        dl_res2 = await client.get(f"https://drive.google.com/uc?export=download&id={f_id}", headers=headers)
                        if dl_res2.status_code == 200 and b"<html" not in dl_res2.content[:500]:
                            content = dl_res2.content
                    except Exception:
                        pass

                if not content:
                    continue

                ext = os.path.splitext(orig_name)[1].lower()
                if not ext:
                    if content.startswith(b"%PDF-"):
                        ext = ".pdf"
                    elif content.startswith(b"PK\x03\x04"):
                        ext = ".xlsx"
                    else:
                        ext = ".pdf"

                safe_temp_name = f"gdrive_doc_{idx+1:03d}_{int(time.time()*1000)}{ext}"
                temp_path = os.path.join(batch_dir, safe_temp_name)
                with open(temp_path, "wb") as f_out:
                    f_out.write(content)

                # Jalankan OCR / AI extraction
                try:
                    scan_res = scan_uploaded_file(content, orig_name)
                except Exception as e:
                    scan_res = {"success": False, "error": str(e), "nominal": None, "confidence": "low"}

                nama_bank = scan_res.get("bank") or ""
                nomor_rek = scan_res.get("nomor_rekening") or ""
                nama_rek = scan_res.get("nama_rekening") or ""
                saldo_akhir = scan_res.get("nominal")

                missing_fields = []
                if not nama_bank or str(nama_bank).strip() in ["-", "None", ""]:
                    missing_fields.append("Nama Bank")
                if not nomor_rek or str(nomor_rek).strip() in ["-", "None", ""]:
                    missing_fields.append("Nomor Rekening")
                if saldo_akhir is None or float(saldo_akhir) < 0:
                    missing_fields.append("Saldo Akhir (Rp)")

                extracted_items.append({
                    "temp_id": idx + 1,
                    "temp_filename": safe_temp_name,
                    "file_nama": display_name,
                    "judul": scan_res.get("judul") or os.path.splitext(orig_name)[0].replace("_", " "),
                    "tahun": scan_res.get("tahun") or time.gmtime().tm_year,
                    "bulan": scan_res.get("bulan"),
                    "kategori_id": 1,
                    "nama_bank": nama_bank,
                    "nomor_rekening": nomor_rek,
                    "nama_rekening": nama_rek,
                    "nominal": saldo_akhir,
                    "tanggal_surat": scan_res.get("tanggal_surat") or "",
                    "deskripsi": f"Diunduh dari Google Drive Folder: {folder_url}",
                    "is_scanned_image": scan_res.get("is_scanned_image", False),
                    "warning": scan_res.get("warning"),
                    "missing_fields": missing_fields,
                    "is_perfect": len(missing_fields) == 0,
                    "file_size": len(content),
                    "link_drive": f"https://drive.google.com/file/d/{f_id}/view"
                })

            if not extracted_items:
                return {
                    "success": False,
                    "error_type": "DOWNLOAD_FAILED",
                    "error_title": "Gagal Mengunduh Berkas",
                    "error_message": "Berkas dalam folder ditemukan, tetapi gagal diunduh. Pastikan izin akses berkas diatur ke 'Siapa saja yang memiliki link dapat melihat'."
                }

            return {
                "success": True,
                "is_folder": True,
                "folder_id": folder_id,
                "total_files": len(extracted_items),
                "items": extracted_items
            }

    except httpx.ConnectTimeout:
        return {
            "success": False,
            "error_type": "TIMEOUT",
            "error_title": "Koneksi Google Drive Terputus (Timeout)",
            "error_message": "Waktu koneksi ke Google Drive habis. Periksa koneksi internet server atau coba beberapa saat lagi."
        }
    except Exception as e:
        logger.exception("Error scanning Google Drive folder: %s", e)
        return {
            "success": False,
            "error_type": "UNKNOWN_ERROR",
            "error_title": "Gagal Memproses Folder Google Drive",
            "error_message": f"Terjadi kesalahan: {str(e)}"
        }

