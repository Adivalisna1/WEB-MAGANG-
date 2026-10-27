import re
import os
import io
from typing import Dict, Any, Optional, Tuple, List
import pdfplumber
import openpyxl

# Daftar Bank Persepsi / Bank Umum di Indonesia
BANK_PATTERNS = [
    (r"\b(?:BANK\s+)?BNI\b|\bPT\s+BANK\s+NEGARA\s+INDONESIA\b", "Bank BNI"),
    (r"\b(?:BANK\s+)?BRI\b|\bPT\s+BANK\s+RAKYAT\s+INDONESIA\b", "Bank BRI"),
    (r"\b(?:BANK\s+)?MANDIRI\b|\bPT\s+BANK\s+MANDIRI\b", "Bank Mandiri"),
    (r"\b(?:BANK\s+)?BCA\b|\bPT\s+BANK\s+CENTRAL\s+ASIA\b", "Bank BCA"),
    (r"\b(?:BANK\s+)?BSI\b|\bPT\s+BANK\s+SYARIAH\s+INDONESIA\b|\bBANK\s+SYARIAH\b|Branch\s*:\s*ID\d{5,8}|\b8101\d{10,14}\b", "Bank BSI"),
    (r"\b(?:BANK\s+)?BTN\b|\bPT\s+BANK\s+TABUNGAN\s+NEGARA\b", "Bank BTN"),
    (r"\b(?:BANK\s+)?DANAMON\b|\bPT\s+BANK\s+DANAMON\b", "Bank Danamon"),
    (r"\bBANK\s+DKI\b", "Bank DKI"),
    (r"\bBANK\s+BJB\b", "Bank BJB"),
    (r"\bBANK\s+JATIM\b", "Bank Jatim"),
    (r"\bBANK\s+JATENG\b", "Bank Jateng"),
]

# Kategori dokumen pemerintah
KATEGORI_PATTERNS = [
    (r"\bLKjIP\b|LAPORAN\s+KINERJA\s+INSTANSI", "LKjIP"),
    (r"\bRENSTRA\b|RENCANA\s+STRATEGIS", "Renstra"),
    (r"\bRENJA\b|RENCANA\s+KERJA\b", "Renja"),
    (r"\bLAKIP\b|AKUNTABILITAS\s+KINERJA", "LAKIP"),
    (r"\bPK\b|PERJANJIAN\s+KINERJA", "PK"),
    (r"\bRKT\b|RENCANA\s+KINERJA\s+TAHUNAN", "RKT"),
    (r"\bIKU\b|INDIKATOR\s+KINERJA\s+UTAMA", "IKU"),
    (r"REKENING\s+KORAN|MUTASI\s+REKENING|GIRO|ACCOUNT\s+STATEMENT|BANK\s+STATEMENT", "Rekening_koran"),
    (r"LPJ|PERTANGGUNGJAWABAN|BUKU\s+KAS", "LPJ"),
]

def parse_indonesian_number(val_str: str) -> Optional[float]:
    """
    Mengubah representasi string angka (misal '12.345.678,90' atau '12,345,678.90')
    menjadi float murni.
    """
    if not val_str:
        return None
    s = val_str.strip().replace("Rp", "").replace("IDR", "").replace("rp", "").strip()
    
    # Deteksi format: 12.345.678,90 (Indonesia) vs 12,345,678.90 (Internasional)
    if "." in s and "," in s:
        if s.rfind(",") > s.rfind("."):
            # Format Indonesia: titik sebagai ribuan, koma sebagai desimal
            s = s.replace(".", "").replace(",", ".")
        else:
            # Format Internasional: koma sebagai ribuan, titik sebagai desimal
            s = s.replace(",", "")
    elif "." in s:
        # Jika ada titik tapi tidak ada koma
        # Cek apakah titik merupakan pemisah ribuan (misal 100.000 atau 100.000.000)
        parts = s.split(".")
        if len(parts) > 2 or (len(parts) == 2 and len(parts[1]) == 3):
            s = s.replace(".", "")
    elif "," in s:
        # Jika hanya ada koma, bisa jadi koma desimal atau ribuan
        parts = s.split(",")
        if len(parts) == 2 and len(parts[1]) <= 2:
            s = s.replace(",", ".")
        else:
            s = s.replace(",", "")

    # Ambil hanya karakter angka dan titik
    cleaned = re.sub(r"[^\d\.]", "", s)
    try:
        return float(cleaned) if cleaned else None
    except ValueError:
        return None

def extract_bank_info(text: str) -> Tuple[Optional[str], Optional[str]]:
    """Mendeteksi nama bank dan nomor rekening dari teks."""
    detected_bank = None
    for pattern, name in BANK_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            detected_bank = name
            break

    detected_rek = None
    # Cari nomor rekening: "No. Rek: 1234567890" atau "Account Number: 0329-01-002841-30-8"
    rek_match = re.search(r"(?:No\.?\s*(?:Rekening|Rek|Account)|Rekening|Acc(?:\s*No)?\.?)[:\s]+([0-9\s\-]{8,25})", text, re.IGNORECASE)
    if rek_match:
        raw_rek = rek_match.group(1).strip()
        # Bersihkan spasi berlebih
        cleaned_rek = re.sub(r"\s+", "", raw_rek)
        if len(re.sub(r"[^\d]", "", cleaned_rek)) >= 8:
            detected_rek = raw_rek
    else:
        # Fallback: cari deretan angka 10-16 digit yang berdiri sendiri
        standalone_rek = re.search(r"\b(\d{4}[-\s]?\d{4}[-\s]?\d{2,6}[-\s]?\d{0,4})\b", text)
        if standalone_rek:
            cand = standalone_rek.group(1).strip()
            if len(re.sub(r"[^\d]", "", cand)) >= 10:
                detected_rek = cand

    return detected_bank, detected_rek

def extract_metadata_from_text(text: str) -> Dict[str, Any]:
    """Ekstraksi metadata judul, tahun, kategori, semester/periode dari teks dokumen."""
    # 1. Tahun (2020-2035)
    tahun_match = re.search(r"\b(202[0-9]|203[0-5])\b", text)
    tahun = int(tahun_match.group(1)) if tahun_match else 2026

    # 2. Semester / Periode / Bulan
    semester = None
    if re.search(r"\bSemester\s*(?:1|I|Satu)\b", text, re.IGNORECASE):
        semester = 1
    elif re.search(r"\bSemester\s*(?:2|II|Dua)\b", text, re.IGNORECASE):
        semester = 2

    bulan = None
    # Cek format rentang tanggal laporan, misal: "Date :01 Jun 2026 - 30 Jun 2026" atau "Periode: 01/06/2026 s/d 30/06/2026"
    date_range_match = re.search(
        r"(?:Date|Periode)\s*[:\s]+[0-9]{1,2}[-\s/]+(?:[A-Za-z]+|\d{1,2})[-\s/]+\d{4}\s*(?:-|s/?d|sampai)\s*([0-9]{1,2})[-\s/]+([A-Za-z]+|\d{1,2})[-\s/]+(\d{4})",
        text,
        re.IGNORECASE,
    )
    if date_range_match:
        m_bulan_str = date_range_match.group(2)
        m_tahun_str = date_range_match.group(3)
        tahun = int(m_tahun_str)
        month_map = {
            "jan": 1, "feb": 2, "mar": 3, "apr": 4, "mei": 5, "may": 5, "jun": 6,
            "jul": 7, "agu": 8, "aug": 8, "sep": 9, "okt": 10, "oct": 10, "nov": 11, "des": 12, "dec": 12
        }
        for key, val in month_map.items():
            if key in m_bulan_str.lower():
                bulan = val
                break
        if bulan is None and m_bulan_str.isdigit():
            bulan = int(m_bulan_str)

    if bulan is None:
        nama_bulan_list = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
        for idx, bname in enumerate(nama_bulan_list, 1):
            if re.search(rf"\b{bname}\b", text, re.IGNORECASE):
                bulan = idx
                break

    # 3. Kategori
    kategori = "Lainnya"
    for pattern, kat in KATEGORI_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            kategori = kat
            break

    # 4. Saldo Akhir / Nominal
    nominal = None

    # Cek khusus pattern multi-kolom ringkasan (Saldo Awal ... Saldo Akhir \n num1 num2 num3 num4)
    grid_m = re.search(r"SALDO\s*AWAL.*SALDO\s*AKHIR\s*\n\s*([\d\.,]+)\s+([\d\.,]+)\s+([\d\.,]+)\s+([\d\.,]+)", text, re.IGNORECASE)
    if grid_m:
        val = parse_indonesian_number(grid_m.group(4))
        if val is not None and val > 0:
            nominal = val

    if nominal is None:
        saldo_patterns = [
            # 1. Saldo per tanggal / Saldo Akhir per 30 Juni 2026 / Saldo per 30/06/2026
            r"Saldo\s*(?:Akhir|Buku|Bank|Kas)?\s*(?:per|s/?d)?\s*(?:[0-9]{1,2}[-\s/]+(?:[A-Za-z]+|\d{1,2})[-\s/]+\d{2,4}|[A-Za-z]+\s*\d{4})?[:\s\.\=\|\-]+(?:(?:IDR|Rp\.?)\s*)?([\d\.,]{4,})(?:\s*(?:CR|DB|C|D)\b)?",
            # 2. Saldo Akhir / Ending Balance / Saldo Buku / Saldo Bank / Saldo Kas / Total Saldo
            r"(?:Saldo\s*(?:Akhir|Penutupan|Buku|Bank|Kas|Giro|Efektif|Mutasi|Berjalan)?|Ending\s*Balance|Closing\s*Balance|Total\s*Saldo|Jumlah\s*Saldo)(?:[^\n:]{0,40})?[:\s\.\=\|\-]+(?:(?:IDR|Rp\.?)\s*)?([\d\.,]{4,})(?:\s*(?:CR|DB|C|D)\b)?",
            # 3. Baris mutasi dengan flag CR / DB di belakang angka (format Bank Mandiri, BCA, BRI)
            r"(?:^|\s)([\d\.,]{4,})\s*(?:CR|DB)\b",
            # 4. Total Realisasi / Belanja / Pengeluaran / Penerimaan
            r"(?:Total\s*(?:Realisasi|Belanja|Pengeluaran|Penerimaan|Kas)|Jumlah\s*(?:Realisasi|Belanja|Pengeluaran))[:\s\.\=\|\-]+(?:(?:IDR|Rp\.?)\s*)?([\d\.,]{4,})",
            # 5. Saldo Akhir Bulan eksplisit
            r"(?:Saldo\s*Akhir\s*Bulan)[:\s\.\=\|\-]+(?:(?:IDR|Rp\.?)\s*)?([\d\.,]{4,})",
            # 6. Fallback Rp angka
            r"(?:Rp\.?\s*)([\d\.,]{5,})",
        ]

        for sp in saldo_patterns:
            matches = re.findall(sp, text, re.IGNORECASE | re.MULTILINE)
            if matches:
                for cand in reversed(matches):
                    if isinstance(cand, tuple):
                        cand = cand[-1]
                    val = parse_indonesian_number(cand)
                    if val is not None and val > 0:
                        nominal = val
                        break
                if nominal is not None:
                    break

    return {
        "tahun": tahun,
        "semester": semester,
        "bulan": bulan,
        "kategori": kategori,
        "nominal": nominal,
    }

def extract_from_pdf(file_source: Any, filename: str = "") -> Dict[str, Any]:
    """
    Mengekstrak teks, tabel, saldo akhir, dan metadata dari file PDF.
    file_source bisa berupa path file (str) atau byte stream (io.BytesIO).
    """
    pages_text: List[str] = []
    tables_data = []

    try:
        with pdfplumber.open(file_source) as pdf:
            # Baca hingga 30 halaman untuk memastikan halaman terakhir (saldo akhir) terbaca
            for page in pdf.pages[:30]:
                pt = page.extract_text() or ""
                pages_text.append(pt)
                
                extracted_tables = page.extract_tables()
                if extracted_tables:
                    for t in extracted_tables:
                        tables_data.extend(t)
    except Exception as e:
        return {"success": False, "error": f"Gagal membaca PDF: {str(e)}"}

    full_text = "\n".join(pages_text)
    combined_search_text = f"{filename}\n{full_text}" if filename else full_text

    meta = extract_metadata_from_text(combined_search_text)
    bank, rek = extract_bank_info(combined_search_text)

    # Multi-page fallback handling:
    # Jika nominal belum ditemukan atau jika rekening koran memiliki running balance transaksi,
    # periksa halaman terakhir (last page) untuk mengambil baris mutasi paling akhir
    if meta["nominal"] is None and pages_text:
        last_page_text = pages_text[-1]
        tx_balances = re.findall(r"(?:(?:DB|CR)\s+([\d\.,]{4,})|([\d\.,]{4,})\s*(?:DB|CR)\b)", last_page_text, re.IGNORECASE)
        if tx_balances:
            for item in reversed(tx_balances):
                cand = item[0] or item[1]
                last_bal = parse_indonesian_number(cand)
                if last_bal is not None and last_bal > 0:
                    meta["nominal"] = last_bal
                    break

    # Jika nominal belum ditemukan dari teks biasa, cari di tabel secara mundur
    if meta["nominal"] is None and tables_data:
        for row in reversed(tables_data):
            if not row:
                continue
            row_str = " ".join([str(c or "") for c in row])
            if re.search(r"Saldo\s*Akhir|Total|Ending\s*Balance|Closing\s*Balance|Jumlah", row_str, re.IGNORECASE):
                for cell in reversed(row):
                    val = parse_indonesian_number(str(cell or ""))
                    if val is not None and val > 0:
                        meta["nominal"] = val
                        break
            if meta["nominal"] is not None:
                break

    # Buat judul dokumen yang informatif jika tidak eksplisit
    lines = [line.strip() for line in full_text.split("\n") if len(line.strip()) > 5]
    first_title = lines[0] if lines else "Dokumen Laporan Keuangan"
    # Pastikan judul tidak terlalu panjang
    if len(first_title) > 90:
        first_title = first_title[:87] + "..."

    return {
        "success": True,
        "judul": first_title,
        "tahun": meta["tahun"],
        "semester": meta["semester"],
        "bulan": meta["bulan"],
        "kategori": meta["kategori"],
        "nominal": meta["nominal"],
        "bank": bank,
        "nomor_rekening": rek,
        "deskripsi": f"Hasil ekstraksi otomatis dokumen {meta['kategori']} Tahun {meta['tahun']}" + (f" - {bank}" if bank else ""),
        "confidence": "high" if meta["nominal"] is not None else "medium",
        "raw_text_snippet": full_text[:400],
    }

def extract_from_excel(file_source: Any) -> Dict[str, Any]:
    """
    Mengekstrak total saldo / kas dari file Excel (.xlsx / .xls).
    """
    try:
        wb = openpyxl.load_workbook(file_source, data_only=True)
        sheet = wb.active
    except Exception as e:
        return {"success": False, "error": f"Gagal membaca Excel: {str(e)}"}

    total_nominal = None
    all_text = []

    # Iterasi baris untuk mencari saldo akhir atau total
    for row in sheet.iter_rows(values_only=True):
        row_cells = [c for c in row if c is not None]
        if not row_cells:
            continue
        row_str = " ".join([str(c) for c in row_cells])
        all_text.append(row_str)

        # Cari baris yang mengandung 'Saldo Akhir', 'Total', 'Jumlah'
        if re.search(r"Saldo\s*Akhir|Total\s*(?:Realisasi|Kas|Pengeluaran)|Jumlah", row_str, re.IGNORECASE):
            for cell in reversed(row_cells):
                if isinstance(cell, (int, float)) and cell > 0:
                    total_nominal = float(cell)
                    break
                elif isinstance(cell, str):
                    val = parse_indonesian_number(cell)
                    if val is not None and val > 0:
                        total_nominal = val
                        break

    full_text = "\n".join(all_text[:30])
    meta = extract_metadata_from_text(full_text)
    bank, rek = extract_bank_info(full_text)

    first_title = sheet.title if sheet.title and sheet.title.lower() != 'sheet1' else "Laporan Buku Kas & Pembukuan Excel"

    return {
        "success": True,
        "judul": first_title,
        "tahun": meta["tahun"],
        "semester": meta["semester"],
        "bulan": meta["bulan"],
        "kategori": meta["kategori"] if meta["kategori"] != "Lainnya" else "LPJ",
        "nominal": total_nominal or meta["nominal"],
        "bank": bank,
        "nomor_rekening": rek,
        "deskripsi": f"Hasil ekstraksi data Excel {meta['kategori']} Tahun {meta['tahun']}",
        "confidence": "high" if total_nominal is not None else "medium",
    }

def reconcile_documents(
    saldo_rekening: Optional[float],
    saldo_excel: Optional[float]
) -> Dict[str, Any]:
    """
    Membandingkan nilai bukti fisik Bank vs Laporan Excel/Satker.
    Mengembalikan selisih dan status COCOK vs SELISIH.
    """
    if saldo_rekening is None and saldo_excel is None:
        return {
            "status": "BELUM_DIANALISIS",
            "selisih": 0.0,
            "is_matched": True,
            "keterangan": "Kedua nilai belum dimasukkan."
        }

    val_rek = float(saldo_rekening or 0.0)
    val_exc = float(saldo_excel or 0.0)
    selisih = round(abs(val_rek - val_exc), 2)
    is_matched = (selisih == 0.0)

    return {
        "status": "COCOK" if is_matched else "SELISIH",
        "selisih": selisih,
        "is_matched": is_matched,
        "nilai_rekening": val_rek,
        "nilai_excel": val_exc,
        "keterangan": "Nilai rekening koran dan laporan pembukuan sesuai (Rp 0 selisih)." if is_matched else f"Terdapat selisih nominal sebesar Rp {selisih:,.2f}"
    }

def scan_uploaded_file(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Entrypoint utama untuk scanning file (PDF atau Excel).
    """
    ext = os.path.splitext(filename)[1].lower()
    stream = io.BytesIO(file_bytes)

    if ext == ".pdf":
        result = extract_from_pdf(stream, filename=filename)
    elif ext in [".xlsx", ".xls"]:
        result = extract_from_excel(stream)
    else:
        # Fallback text scan
        result = {
            "success": True,
            "judul": os.path.splitext(filename)[0].replace("_", " "),
            "tahun": 2026,
            "kategori": "Lainnya",
            "nominal": None,
            "confidence": "low"
        }

    # Formatkan hasil agar drop-in compatible dengan UploadModal frontend
    if result.get("success"):
        nominal = result.get("nominal")
        result["saldo_rekening"] = nominal
        result["saldo_excel"] = nominal
        result["selisih"] = 0.0
        result["status_rekon"] = "COCOK" if nominal is not None else "PENDING"

    return result
