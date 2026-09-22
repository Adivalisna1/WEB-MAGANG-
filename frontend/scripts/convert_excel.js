const XLSX = require('xlsx');
const fs = require('fs');

try {
  // 1. Baca file lama
  const fileLama = 'c:/Users/adiva/OneDrive/Dokumen/web magang munculin data lokal/template_bulk_user (1).xlsx';
  const workbook = XLSX.readFile(fileLama);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // 2. Ambil data sebagai JSON
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  // 3. Ubah nama kunci 'satker_nama' menjadi 'staff_nama' di setiap baris
  const dataBaru = data.map(row => {
    return {
      role_id: row.role_id,
      nama: row.nama,
      username: row.username,
      email: row.email,
      password: row.password,
      staff_nama: row.satker_nama || row.staff_nama // Ganti header
    };
  });

  // 4. Buat Excel baru
  const newWorksheet = XLSX.utils.json_to_sheet(dataBaru);
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Users');

  // 5. Simpan hasilnya
  const fileBaru = 'c:/Users/adiva/OneDrive/Dokumen/web magang munculin data lokal/Data_User_Siap_Upload.xlsx';
  XLSX.writeFile(newWorkbook, fileBaru);

  console.log(`Berhasil! File baru disimpan di: ${fileBaru}`);

} catch (err) {
  console.error("Error:", err.message);
}
