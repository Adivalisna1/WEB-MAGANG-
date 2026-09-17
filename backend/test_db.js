const mysql = require('mysql2/promise');

async function testDB() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'root_password',
      database: 'weblaporan',
      port: 3306
    });

    const [rows] = await pool.query(`
      SELECT u.id, u.nama, u.username, u.email, u.is_active, u.permissions,
              u.last_login, u.created_at, r.nama AS role, sk.nama AS satker
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN satkers sk ON sk.id = u.satker_id
    `);
    
    console.log("USERS:", rows);
    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}

testDB();
