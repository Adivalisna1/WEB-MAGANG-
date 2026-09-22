const XLSX = require('xlsx');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '../.env' }); // pastikan load env jika dijalankan dari dalam folder scripts
const { pool } = require('../src/config/db');

async function checkFailedUploads() {
  const filePath = 'c:/Users/adiva/OneDrive/Dokumen/web magang munculin data lokal/Data_User_Siap_Upload.xlsx';
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  let successCount = 0;
  let failedCount = 0;
  const failedItems = [];

  console.log(`Mulai mengecek ${data.length} baris data dari Excel...`);

  const connection = await pool.getConnection();

  for (const [index, user] of data.entries()) {
    try {
      const { role_id, nama, username, email, password, staff_nama } = user;
      
      // 1. Cek validitas
      if (!role_id || !nama || !username || !email || !password) {
        throw new Error(`Data tidak lengkap. (role: ${role_id}, nama: ${nama}, username: ${username}, email: ${email}, password: ${password})`);
      }

      let satker_id = null;
      if (staff_nama) {
        const [existing] = await connection.query('SELECT id FROM satkers WHERE nama = ?', [staff_nama]);
        if (existing.length > 0) {
          satker_id = existing[0].id;
        } else {
          // Kita tidak perlu meng-insert beneran di simulasi ini, tapi bisa coba jalankan
          const [inserted] = await connection.query('INSERT IGNORE INTO satkers (nama) VALUES (?)', [staff_nama]);
          satker_id = inserted.insertId || null; 
        }
      }

      // Cek duplicate users by username / email
      const [duplicateCheck] = await connection.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
      if (duplicateCheck.length > 0) {
        throw new Error(`Username atau email sudah terdaftar.`);
      }

      successCount++;
    } catch (err) {
      failedCount++;
      failedItems.push({ baris: index + 2, username: user.username, error: err.message });
    }
  }

  connection.release();
  
  console.log(`Selesai. Bisa masuk (secara teori): ${successCount}. Gagal/Duplicate: ${failedCount}`);
  if (failedItems.length > 0) {
    console.log('\n--- Daftar Baris yang Gagal ---');
    failedItems.forEach(item => {
      console.log(`Baris ${item.baris} (Username: ${item.username}): ${item.error}`);
    });
  }
  
  process.exit(0);
}

checkFailedUploads().catch(console.error);
