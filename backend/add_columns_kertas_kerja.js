const { pool } = require('./src/config/db');

async function runMigration() {
  const query = `
    ALTER TABLE kertas_kerja 
    ADD COLUMN no_rek VARCHAR(100) NULL AFTER satker_id,
    ADD COLUMN judul_laporan VARCHAR(255) NULL AFTER no_rek,
    ADD COLUMN akun VARCHAR(255) NULL AFTER judul_laporan
  `;
  try {
    console.log('Running ALTER TABLE...');
    await pool.query(query);
    console.log('Columns no_rek, judul_laporan, and akun added successfully!');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist!');
    } else {
      console.error('Error altering table:', err);
    }
  } finally {
    process.exit(0);
  }
}

runMigration();
