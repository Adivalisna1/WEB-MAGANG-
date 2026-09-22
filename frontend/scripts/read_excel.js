const XLSX = require('xlsx');

try {
  const workbook = XLSX.readFile('c:/Users/adiva/OneDrive/Dokumen/web magang munculin data lokal/template_bulk_user (1).xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  if (data.length > 0) {
    console.log("Headers:", data[0]);
    console.log("Row 1:", data[1]);
  } else {
    console.log("File kosong");
  }
} catch (err) {
  console.error("Error reading file:", err.message);
}
