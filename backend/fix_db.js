const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'web_laporan'
  });

  try {
    await connection.query('ALTER TABLE kertas_kerja MODIFY satker_id INT UNSIGNED NULL;');
    console.log("Successfully made satker_id NULLABLE in kertas_kerja table!");
  } catch (err) {
    console.error("Error altering table:", err);
  } finally {
    await connection.end();
  }
}

fixDb();
