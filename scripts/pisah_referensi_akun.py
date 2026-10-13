"""
Script: pisah_referensi_akun.py
Fungsi: Memilah file 'Referensi Akun' Excel menjadi 5 file terpisah berdasarkan Tipe Akun (A, L, O, R, E)
Output: Folder 'data_excel/output_per_tipe_akun/'
"""

import os
import sys
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# ==================== KONFIGURASI PATH ====================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_INPUT = os.path.join(BASE_DIR, "data_excel", "Referensi Akun_2026-10-06 15-38.xlsx")
DEFAULT_OUTPUT_DIR = os.path.join(BASE_DIR, "data_excel", "output_per_tipe_akun")

# Mapping label & nama file per Tipe Akun
TIPE_MAP = {
    "A": {
        "nama": "Aset",
        "filename": "Referensi_Akun_Tipe_A_Aset.xlsx",
        "deskripsi": "Aset (Kas, Piutang, Persediaan, Aset Tetap, dll.)"
    },
    "L": {
        "nama": "Liabilitas",
        "filename": "Referensi_Akun_Tipe_L_Liabilitas.xlsx",
        "deskripsi": "Kewajiban / Utang Jangka Pendek & Panjang"
    },
    "O": {
        "nama": "Ekuitas",
        "filename": "Referensi_Akun_Tipe_O_Ekuitas.xlsx",
        "deskripsi": "Ekuitas / Modal Bersih Pemerintah"
    },
    "R": {
        "nama": "Pendapatan",
        "filename": "Referensi_Akun_Tipe_R_Pendapatan.xlsx",
        "deskripsi": "Pendapatan Pajak, PNBP, Hibah & Transfer"
    },
    "E": {
        "nama": "Beban_dan_Belanja",
        "filename": "Referensi_Akun_Tipe_E_Beban_dan_Belanja.xlsx",
        "deskripsi": "Belanja Pegawai, Barang, Modal, Bansos & Beban"
    }
}

def pisah_data_per_tipe_akun(input_file=DEFAULT_INPUT, output_dir=DEFAULT_OUTPUT_DIR):
    if not os.path.exists(input_file):
        print(f"[ERROR] File input tidak ditemukan di: {input_file}")
        return False

    print("=" * 70)
    print("   PROGRAM PEMISAHAN REFERENSI AKUN PER TIPE AKUN")
    print("=" * 70)
    print(f"File Sumber : {os.path.basename(input_file)}")
    print(f"Folder Hasil: {output_dir}\n")

    os.makedirs(output_dir, exist_ok=True)

    # 1. Baca workbook sumber
    print("Membaca data file Excel sumber...")
    wb_source = openpyxl.load_workbook(input_file, data_only=True)
    sheet_source = wb_source.active

    # Baris 5 (index 4) adalah header: ['NO', 'Kode Akun', 'Nama Akun', 'Tipe Akun']
    all_rows = list(sheet_source.iter_rows(values_only=True))
    if len(all_rows) < 5:
        print("[ERROR] Format file tidak sesuai, jumlah baris terlalu sedikit.")
        return False

    header_row_idx = 4
    header_titles = ["NO", "Kode Akun", "Nama Akun", "Tipe Akun"]

    # Kelompokkan data berdasarkan Tipe Akun
    grouped_data = {k: [] for k in TIPE_MAP.keys()}
    grouped_data["LAINNYA"] = []

    total_valid_rows = 0
    for r in all_rows[header_row_idx + 1:]:
        if not r or all(cell is None for cell in r):
            continue
        kode_akun = str(r[1]).strip() if r[1] is not None else ""
        nama_akun = str(r[2]).strip() if r[2] is not None else ""
        tipe_akun = str(r[3]).strip().upper() if r[3] is not None else ""

        if not kode_akun and not nama_akun:
            continue

        item = (kode_akun, nama_akun, tipe_akun)
        if tipe_akun in grouped_data:
            grouped_data[tipe_akun].append(item)
        else:
            grouped_data["LAINNYA"].append(item)
        total_valid_rows += 1

    print(f"Total baris akun berhasil dibaca: {total_valid_rows:,} akun.\n")

    # Styling Excel yang rapi & profesional
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="173B75", end_color="173B75", fill_type="solid")
    regular_font = Font(name="Calibri", size=10)
    center_align = Alignment(horizontal="center", vertical="center")
    left_align = Alignment(horizontal="left", vertical="center")
    
    thin_border_side = Side(border_style="thin", color="D1D5DB")
    cell_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    header_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)

    summary_results = []

    # 2. Tulis ke masing-masing file
    for kode_tipe, info in TIPE_MAP.items():
        data_list = grouped_data[kode_tipe]
        target_path = os.path.join(output_dir, info["filename"])

        wb_out = openpyxl.Workbook()
        ws_out = wb_out.active
        ws_out.title = f"Tipe {kode_tipe} - {info['nama']}"

        # Header Title Info
        ws_out.append([f"Referensi Akun - Tipe {kode_tipe} ({info['nama']})"])
        ws_out.cell(row=1, column=1).font = Font(name="Calibri", size=13, bold=True, color="173B75")
        ws_out.append([f"Kategori: {info['deskripsi']} | Total: {len(data_list):,} Akun"])
        ws_out.cell(row=2, column=1).font = Font(name="Calibri", size=10, italic=True, color="555555")
        ws_out.append([]) # Baris kosong

        # Table Header
        ws_out.append(header_titles)
        header_row_num = 4
        for col_idx in range(1, 5):
            cell = ws_out.cell(row=header_row_num, column=col_idx)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = center_align
            cell.border = header_border

        # Data Rows
        for seq, (kode, nama, tipe) in enumerate(data_list, start=1):
            row_num = header_row_num + seq
            row_values = [seq, kode, nama, tipe]
            ws_out.append(row_values)

            # Styling data cells
            c_no = ws_out.cell(row=row_num, column=1)
            c_no.alignment = center_align
            c_no.font = regular_font
            c_no.border = cell_border

            c_kode = ws_out.cell(row=row_num, column=2)
            c_kode.alignment = center_align
            c_kode.font = regular_font
            c_kode.border = cell_border
            # Format text explicitly to keep leading zeros if any
            c_kode.number_format = '@'

            c_nama = ws_out.cell(row=row_num, column=3)
            c_nama.alignment = left_align
            c_nama.font = regular_font
            c_nama.border = cell_border

            c_tipe = ws_out.cell(row=row_num, column=4)
            c_tipe.alignment = center_align
            c_tipe.font = regular_font
            c_tipe.border = cell_border

        # Auto-fit Column Widths
        ws_out.column_dimensions['A'].width = 8    # NO
        ws_out.column_dimensions['B'].width = 16   # Kode Akun
        ws_out.column_dimensions['C'].width = 55   # Nama Akun
        ws_out.column_dimensions['D'].width = 14   # Tipe Akun

        # Simpan file
        wb_out.save(target_path)
        file_size_kb = os.path.getsize(target_path) / 1024
        summary_results.append({
            "tipe": kode_tipe,
            "nama": info["nama"],
            "filename": info["filename"],
            "jumlah": len(data_list),
            "size": f"{file_size_kb:.1f} KB"
        })
        print(f"[OK] Berhasil membuat: {info['filename']} ({len(data_list):,} akun, {file_size_kb:.1f} KB)")

    # Jika ada tipe yang tidak dikenal
    if grouped_data["LAINNYA"]:
        other_path = os.path.join(output_dir, "Referensi_Akun_Lainnya.xlsx")
        wb_out = openpyxl.Workbook()
        ws_out = wb_out.active
        ws_out.title = "Lainnya"
        ws_out.append(header_titles)
        for seq, (kode, nama, tipe) in enumerate(grouped_data["LAINNYA"], start=1):
            ws_out.append([seq, kode, nama, tipe])
        wb_out.save(other_path)
        print(f"[OK] Berhasil membuat: Referensi_Akun_Lainnya.xlsx ({len(grouped_data['LAINNYA']):,} akun)")

    print("\n" + "=" * 70)
    print("                      RINGKASAN PEMISAHAN FILE")
    print("=" * 70)
    print(f"{'Tipe':<6} | {'Kategori':<20} | {'Jumlah Akun':<12} | {'Nama File Output'}")
    print("-" * 70)
    for res in summary_results:
        print(f"[{res['tipe']}]    | {res['nama']:<20} | {res['jumlah']:>6,} akun  | {res['filename']}")
    print("-" * 70)
    print(f"Total Akun Terproses: {total_valid_rows:,} akun.")
    print(f"Semua file tersimpan di folder:\n-> {output_dir}")
    print("=" * 70)
    return True

if __name__ == "__main__":
    input_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_INPUT
    output_path = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUTPUT_DIR
    pisah_data_per_tipe_akun(input_path, output_path)
