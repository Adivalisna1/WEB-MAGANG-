const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'mysql-2545825a-naufaladiva5-d405.k.aivencloud.com',
  port: 16636,
  user: 'avnadmin',
  password: 'AVNS_kg4fwe6GMlt3sdoOpPK',
  database: 'web_laporan',
  ssl: { rejectUnauthorized: false },
  multipleStatements: true
};

async function run() {
  const conn = await mysql.createConnection(config);
  
  // Inject railway_02_seed.sql
  const seedFile = fs.readFileSync(path.join(__dirname, '..', 'database', 'railway_02_seed.sql'), 'utf8');
  await conn.query('USE web_laporan; ' + seedFile);
  console.log("Seed data injected!");

  await conn.end();
}
run();
