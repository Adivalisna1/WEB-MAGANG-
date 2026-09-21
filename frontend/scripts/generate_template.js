const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const folderPath = path.join(__dirname, '../public');
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

const filePath = path.join(folderPath, 'template_import_satker.xlsx');

const data = [
  { Satker: 'BPS Provinsi Jawa Tengah' },
  { Satker: 'BPS Kabupaten Kudus' },
  { Satker: 'BPS Kota Semarang' }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Template");

XLSX.writeFile(wb, filePath);
console.log(`Template created at ${filePath}`);
