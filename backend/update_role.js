const mysql = require('mysql2/promise');
const config = {
  host: 'mysql-2545825a-naufaladiva5-d405.k.aivencloud.com',
  port: 16636,
  user: 'avnadmin',
  password: 'AVNS_kg4fwe6GMlt3sdoOpPK',
  database: 'web_laporan',
  ssl: { rejectUnauthorized: false }
};

async function run() {
  const conn = await mysql.createConnection(config);
  
  // Update role 'satker' to 'staff' in roles table
  await conn.query(`UPDATE roles SET nama = 'staff', deskripsi = 'Staff - upload, edit, dan submit dokumen' WHERE id = 2 OR nama = 'satker'`);
  console.log("Role 'satker' changed to 'staff'.");
  
  // Update user with role 2 to use username 'staff'
  await conn.query(`UPDATE users SET username = 'staff', nama = 'Staff User' WHERE role_id = 2`);
  console.log("Dummy user updated to 'staff'.");

  await conn.end();
}
run();
