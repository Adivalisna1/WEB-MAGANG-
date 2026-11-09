import os
import mysql.connector
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from db import connection_pool

def format_sheet(ws, title, headers, data_rows, header_color="1E3A8A"):
    # Header styling
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color=header_color, end_color=header_color, fill_type="solid")
    align_center = Alignment(horizontal="center", vertical="center", wrap_text=True)
    align_left = Alignment(horizontal="left", vertical="center")
    align_right = Alignment(horizontal="right", vertical="center")
    
    thin_border = Border(
        left=Side(style="thin", color="CBD5E1"),
        right=Side(style="thin", color="CBD5E1"),
        top=Side(style="thin", color="CBD5E1"),
        bottom=Side(style="thin", color="CBD5E1")
    )
    
    # Title Row
    ws.merge_cells("A1:J1")
    title_cell = ws["A1"]
    title_cell.value = title
    title_cell.font = Font(name="Calibri", size=14, bold=True, color="0F172A")
    title_cell.alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[1].height = 28

    # Blank Row 2
    ws.row_dimensions[2].height = 8

    # Table Header Row 3
    for col_idx, h in enumerate(headers, 1):
        cell = ws.cell(row=3, column=col_idx, value=h)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = align_center
        cell.border = thin_border
    ws.row_dimensions[3].height = 26

    # Data Rows starting from row 4
    zebra_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    white_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
    data_font = Font(name="Calibri", size=10, color="1E293B")
    bold_font = Font(name="Calibri", size=10, bold=True, color="0F172A")

    for r_idx, row_values in enumerate(data_rows, 4):
        is_even = (r_idx % 2 == 0)
        row_fill = zebra_fill if is_even else white_fill
        ws.row_dimensions[r_idx].height = 20

        for c_idx, val in enumerate(row_values, 1):
            cell = ws.cell(row=r_idx, column=c_idx, value=val)
            cell.fill = row_fill
            cell.border = thin_border
            cell.font = data_font

            # Alignments & formatting
            header_name = headers[c_idx - 1]
            if header_name in ["No", "Kode Satker", "Kode Eselon 1", "Tingkat", "Role", "Status Akun"]:
                cell.alignment = align_center
            elif header_name in ["Username", "Password"]:
                cell.alignment = align_center
                cell.font = bold_font
            else:
                cell.alignment = align_left

    # Auto fit column widths
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            # Ignore title row merged cell length
            if cell.row == 1:
                continue
            val_str = str(cell.value or "")
            if len(val_str) > max_len:
                max_len = len(val_str)
        ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

    # Enable gridlines
    ws.views.sheetView[0].showGridLines = True

def generate_excel_files():
    conn = connection_pool.get_connection()
    cur = conn.cursor(dictionary=True)

    # 1. Fetch Satker Users
    cur.execute("""
        SELECT 
            u.id,
            u.username,
            u.email,
            u.nama,
            r.nama as role_nama,
            t.nama as tingkat_nama,
            s.NO_Satker as kode_satker,
            s.nama as nama_satker,
            e.kode as kode_eselon,
            e.nama as nama_eselon,
            e.singkatan as singkatan_eselon
        FROM users u
        JOIN roles r ON u.role_id = r.id
        JOIN tingkats t ON u.tingkat_id = t.id
        JOIN satkers s ON u.satker_id = s.id
        LEFT JOIN unit_eselon_1 e ON u.eselon_1_id = e.id
        ORDER BY s.id ASC, r.id ASC
    """)
    satker_users = cur.fetchall()

    # Split into Operator and Administrasi
    satker_operators = [u for u in satker_users if u["role_nama"] == "operator"]
    satker_admins = [u for u in satker_users if u["role_nama"] == "administrasi"]

    # 2. Fetch Eselon 1 Users
    cur.execute("""
        SELECT 
            u.id,
            u.username,
            u.email,
            u.nama,
            r.nama as role_nama,
            t.nama as tingkat_nama,
            e.kode as kode_eselon,
            e.nama as nama_eselon,
            e.singkatan as singkatan_eselon,
            (SELECT COUNT(*) FROM satkers s WHERE s.eselon_1_id = e.id) as total_satker_binaan
        FROM users u
        JOIN roles r ON u.role_id = r.id
        JOIN tingkats t ON u.tingkat_id = t.id
        JOIN unit_eselon_1 e ON u.eselon_1_id = e.id
        WHERE u.satker_id IS NULL AND u.tingkat_id = 2
        ORDER BY e.id ASC, r.id ASC
    """)
    eselon_users = cur.fetchall()

    eselon_operators = [u for u in eselon_users if u["role_nama"] == "operator"]
    eselon_admins = [u for u in eselon_users if u["role_nama"] == "administrasi"]

    # Output directory
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_excel"))
    os.makedirs(output_dir, exist_ok=True)

    # -------------------------------------------------------------
    # FILE 1: Data_Akun_Satker.xlsx
    # -------------------------------------------------------------
    wb_satker = Workbook()
    ws_satker_opr = wb_satker.active
    ws_satker_opr.title = "Operator Satker"

    headers_satker = [
        "No", "Kode Satker", "Nama Satuan Kerja (Satker)", "Unit Eselon 1 Pembina", 
        "Kode Eselon 1", "Role", "Tingkat", "Username", "Email", "Password", "Status Akun"
    ]

    rows_satker_opr = []
    for idx, u in enumerate(satker_operators, 1):
        rows_satker_opr.append([
            idx,
            u["kode_satker"],
            u["nama_satker"],
            f"{u['nama_eselon']} ({u['singkatan_eselon']})",
            u["kode_eselon"],
            "Operator Pelaksana",
            "Tingkat Satker",
            u["username"],
            u["email"],
            "Satker@123",
            "Aktif"
        ])

    format_sheet(
        ws_satker_opr,
        "DAFTAR AKUN OPERATOR SATUAN KERJA (SATKER) SE-NUSANTARA",
        headers_satker,
        rows_satker_opr,
        header_color="0284C7" # Sky Blue
    )

    # Sheet 2: Administrasi Satker
    ws_satker_adm = wb_satker.create_sheet(title="Administrasi Satker")
    rows_satker_adm = []
    for idx, u in enumerate(satker_admins, 1):
        rows_satker_adm.append([
            idx,
            u["kode_satker"],
            u["nama_satker"],
            f"{u['nama_eselon']} ({u['singkatan_eselon']})",
            u["kode_eselon"],
            "Pimpinan / Administrasi",
            "Tingkat Satker",
            u["username"],
            u["email"],
            "Satker@123",
            "Aktif"
        ])

    format_sheet(
        ws_satker_adm,
        "DAFTAR AKUN PIMPINAN / ADMINISTRASI SATUAN KERJA (SATKER) SE-NUSANTARA",
        headers_satker,
        rows_satker_adm,
        header_color="1E3A8A" # Navy Blue
    )

    path_satker = os.path.join(output_dir, "Data_Akun_Satker.xlsx")
    wb_satker.save(path_satker)
    print(f"File 1 berhasil dibuat: {path_satker}")

    # -------------------------------------------------------------
    # FILE 2: Data_Akun_Eselon_1.xlsx
    # -------------------------------------------------------------
    wb_eselon = Workbook()
    ws_eselon_opr = wb_eselon.active
    ws_eselon_opr.title = "Operator Eselon 1"

    headers_eselon = [
        "No", "Kode Eselon 1", "Nama Unit Eselon 1", "Singkatan", 
        "Jumlah Satker Binaan", "Role", "Tingkat", "Username", "Email", "Password", "Status Akun"
    ]

    rows_eselon_opr = []
    for idx, u in enumerate(eselon_operators, 1):
        rows_eselon_opr.append([
            idx,
            u["kode_eselon"],
            u["nama_eselon"],
            u["singkatan_eselon"],
            f"{u['total_satker_binaan']} Satker",
            "Operator Eselon 1",
            "Tingkat Eselon 1",
            u["username"],
            u["email"],
            "Satker@123",
            "Aktif"
        ])

    format_sheet(
        ws_eselon_opr,
        "DAFTAR AKUN OPERATOR UNIT ESELON 1 PEMBINA",
        headers_eselon,
        rows_eselon_opr,
        header_color="0D9488" # Teal
    )

    # Sheet 2: Administrasi Eselon 1
    ws_eselon_adm = wb_eselon.create_sheet(title="Administrasi Eselon 1")
    rows_eselon_adm = []
    for idx, u in enumerate(eselon_admins, 1):
        rows_eselon_adm.append([
            idx,
            u["kode_eselon"],
            u["nama_eselon"],
            u["singkatan_eselon"],
            f"{u['total_satker_binaan']} Satker",
            "Pimpinan Eselon 1",
            "Tingkat Eselon 1",
            u["username"],
            u["email"],
            "Satker@123",
            "Aktif"
        ])

    format_sheet(
        ws_eselon_adm,
        "DAFTAR AKUN PIMPINAN / ADMINISTRASI UNIT ESELON 1 PEMBINA",
        headers_eselon,
        rows_eselon_adm,
        header_color="0F172A" # Slate Dark
    )

    path_eselon = os.path.join(output_dir, "Data_Akun_Eselon_1.xlsx")
    wb_eselon.save(path_eselon)
    print(f"File 2 berhasil dibuat: {path_eselon}")

    cur.close()
    conn.close()

if __name__ == "__main__":
    generate_excel_files()
