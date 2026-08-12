const mysql = require('mysql2/promise');

// Railway MySQL kasih DATABASE_URL, lokal pakai env terpisah
function getPoolConfig() {
  if (process.env.DATABASE_URL) {
    return {
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit:    10,
      queueLimit:         0,
      timezone:           '+07:00',
    };
  }

  return {
    host:     process.env.MYSQL_HOST || 'db',
    port:     Number(process.env.MYSQL_PORT) || 3306,
    user:     process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    timezone:           '+07:00',
  };
}

const pool = mysql.createPool(getPoolConfig());

// Test koneksi saat startup
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL terhubung');
    conn.release();
  } catch (err) {
    console.error('❌ Gagal konek MySQL:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
