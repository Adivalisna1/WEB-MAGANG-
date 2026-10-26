const mysql = require('mysql2/promise');

// Railway MySQL kasih DATABASE_URL, lokal pakai env terpisah
function getPoolConfig() {
  if (process.env.DATABASE_URL) {
    // Parse manual biar bisa nambah opsi ssl (TiDB Cloud wajib TLS,
    // mysql2 tidak bisa baca ssl dari query string URL)
    const u = new URL(process.env.DATABASE_URL);
    return {
      host:     u.hostname,
      port:     Number(u.port) || 3306,
      user:     decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, '') || undefined,
      ...(u.hostname.endsWith('.tidbcloud.com') || u.hostname.endsWith('.aivencloud.com') 
        ? { 
            ssl: { 
              minVersion: 'TLSv1.2',
              rejectUnauthorized: true,
              ...(process.env.DB_CA ? { ca: process.env.DB_CA } : {})
            } 
          } 
        : {}),
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
    console.error('⚠️  Server tetap jalan, tapi DB tidak tersedia');
    // Tidak process.exit(1) agar healthcheck Railway tetap bisa respond
  }
}

module.exports = { pool, testConnection };
