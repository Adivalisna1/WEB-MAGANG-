const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database_backup.sqlite');
db.serialize(() => {
  db.all('SELECT name, type FROM credentials_entity', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log(rows);
  });
});
db.close();
