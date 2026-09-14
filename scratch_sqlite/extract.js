const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('../database_backup.sqlite', (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
});

db.serialize(() => {
  db.all('SELECT name, nodes, connections FROM workflow_entity', [], (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Found ' + rows.length + ' workflows.');
    
    rows.forEach((row, index) => {
      let workflow = {
        name: row.name,
        nodes: JSON.parse(row.nodes || '[]'),
        connections: JSON.parse(row.connections || '{}')
      };
      
      const fileName = '../workflow_backup_' + index + '.json';
      fs.writeFileSync(fileName, JSON.stringify(workflow, null, 2));
      console.log('Saved: ' + fileName);
    });
  });
});

db.close();
