const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'mysql-2545825a-naufaladiva5-d405.k.aivencloud.com',
  port: 16636,
  user: 'avnadmin',
  password: 'AVNS_kg4fwe6GMlt3sdoOpPK',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: false
  },
  multipleStatements: true
};

async function run() {
  try {
    console.log('Testing connection to Aiven...');
    const conn = await mysql.createConnection(config);
    console.log('Connected to Aiven MySQL successfully!');
    
    // Read schema
    const schemaPath = path.join(__dirname, '..', 'database', 'init', '01_schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Running 01_schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await conn.query(schemaSql);
      console.log('Schema executed successfully.');
    } else {
      console.error('Schema file not found at:', schemaPath);
    }
    
    // Run v6 manually
    console.log('Running v6...');
    await conn.query(`
      USE web_laporan;
      CREATE TABLE IF NOT EXISTS satkers (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          nama VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
      ) ENGINE=InnoDB;
    `);
    await conn.query(`USE web_laporan; INSERT IGNORE INTO satkers (id, nama) VALUES (1, 'Satker Default');`);
    
    // Check if column exists before altering
    const [cols] = await conn.query(`
      SELECT * FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'web_laporan' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'satker_id'
    `);
    if (cols.length === 0) {
      await conn.query(`USE web_laporan; ALTER TABLE users ADD COLUMN satker_id INT UNSIGNED NULL;`);
      await conn.query(`USE web_laporan; ALTER TABLE users ADD CONSTRAINT fk_users_satker FOREIGN KEY (satker_id) REFERENCES satkers(id) ON DELETE SET NULL ON UPDATE CASCADE;`);
      await conn.query(`USE web_laporan; ALTER TABLE users ADD INDEX idx_users_satker (satker_id);`);
    }

    // Run v7
    console.log('Running v7...');
    const v7 = fs.readFileSync(path.join(__dirname, '..', 'database', 'migration_v7_akuntansi.sql'), 'utf8');
    await conn.query('USE web_laporan; ' + v7);

    // Run v8
    console.log('Running v8...');
    const v8 = fs.readFileSync(path.join(__dirname, '..', 'database', 'migration_v8_kertas_kerja.sql'), 'utf8');
    await conn.query('USE web_laporan; ' + v8);

    
    console.log('All migrations completed!');
    await conn.end();
  } catch (err) {
    console.error('Error connecting to Aiven:', err.message);
  }
}

run();
