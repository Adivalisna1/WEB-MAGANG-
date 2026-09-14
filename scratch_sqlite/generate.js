const XLSX = require('xlsx');
const fs = require('fs');

const dummyUsers = [];
for (let i = 1; i <= 20; i++) {
  dummyUsers.push({
    role_id: 2,
    nama: 'Satker Dummy ' + i,
    username: 'satker_dummy_' + i,
    email: 'satker' + i + '@example.com',
    password: 'password123'
  });
}

const ws = XLSX.utils.json_to_sheet(dummyUsers);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Users");

XLSX.writeFile(wb, '../apk pembantu/contoh_20_user.xlsx');
console.log('Excel file created successfully.');
