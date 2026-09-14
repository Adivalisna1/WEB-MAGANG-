const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('../database_backup.sqlite', (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
});

db.serialize(() => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(rows);
  });
});

db.close();
