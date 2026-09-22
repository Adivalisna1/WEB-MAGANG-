const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const data = [
  {
    role_id: 2, // 1: Pimpinan, 2: Staff, 3: Eselon 1, 4: Admin IT
    nama: 'Budi Santoso',
    username: 'budi_staff',
    email: 'budi@example.com',
    password: 'password123',
    staff_nama: 'BPS Provinsi Jawa Tengah' // Pastikan nama satker ini valid/ada di tabel satkers (opsional jika bukan staff/eselon 1)
  }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Template User');

const filePath = path.join(__dirname, '../public/template_import_user.xlsx');
XLSX.writeFile(workbook, filePath);

console.log('Template created at:', filePath);
