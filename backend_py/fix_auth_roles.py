import os

dir_path = r'c:\Users\adiva\OneDrive\Dokumen\web magang munculin data lokal\backend_py\routers'
rk_path = os.path.join(dir_path, 'rekening_koran.py')
pc_path = os.path.join(dir_path, 'pencatatan.py')

# Fix rekening_koran.py
with open(rk_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("if role == 2:  # Staff", "if str(role) in ['1', '2']:  # Pimpinan & Staff")
with open(rk_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Fix pencatatan.py
with open(pc_path, 'r', encoding='utf-8') as f:
    pc_content = f.read()

# Fix the get_akuntansi query
old_get = """@router.get("")
async def get_akuntansi(user: dict = Depends(get_current_user), db=Depends(get_db)):
    with db.cursor(dictionary=True) as cursor:
        query = \"\"\"
            SELECT a.*, k.nama_kategori, u.nama as pembuat, u2.nama as pengedit,
                   u.satker_id, s.nama as satker_nama
            FROM pencatatan a
            LEFT JOIN kategori_akuntansi k ON a.id_kategori = k.id
            LEFT JOIN users u ON a.created_by = u.id
            LEFT JOIN users u2 ON a.updated_by = u2.id
            LEFT JOIN satkers s ON u.satker_id = s.id
            ORDER BY a.tanggal DESC, a.created_at DESC
        \"\"\"
        cursor.execute(query)
        rows = cursor.fetchall()
    return {"success": True, "data": rows}"""

new_get = """@router.get("")
async def get_akuntansi(user: dict = Depends(get_current_user), db=Depends(get_db)):
    role = user.get("role_id")
    satker_id = user.get("satker_id")
    
    where = "1=1"
    params = []
    
    if str(role) in ["1", "2"]:
        if satker_id is None:
            where += " AND u.satker_id IS NULL"
        else:
            where += " AND u.satker_id = %s"
            params.append(satker_id)
            
    with db.cursor(dictionary=True) as cursor:
        query = f\"\"\"
            SELECT a.*, k.nama_kategori, u.nama as pembuat, u2.nama as pengedit,
                   u.satker_id, s.nama as satker_nama
            FROM pencatatan a
            LEFT JOIN kategori_akuntansi k ON a.id_kategori = k.id
            LEFT JOIN users u ON a.created_by = u.id
            LEFT JOIN users u2 ON a.updated_by = u2.id
            LEFT JOIN satkers s ON u.satker_id = s.id
            WHERE {where}
            ORDER BY a.tanggal DESC, a.created_at DESC
        \"\"\"
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
    return {"success": True, "data": rows}"""

pc_content = pc_content.replace(old_get, new_get)

# Re-apply the kertas_kerja -> rekening_koran fix that the user hit undo on
pc_content = pc_content.replace("INSERT INTO kertas_kerja", "INSERT INTO rekening_koran")

with open(pc_path, 'w', encoding='utf-8') as f:
    f.write(pc_content)

print("Berhasil update API!")
