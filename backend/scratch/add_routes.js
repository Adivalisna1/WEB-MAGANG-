const fs = require('fs');
let code = fs.readFileSync('c:/Users/adiva/OneDrive/Dokumen/web magang munculin data lokal/backend/src/routes/pencatatan.js', 'utf8');

const routes = `
// CRUD Kategori: Hanya Admin IT yang bisa create, update, delete
router.post('/kategori', 
  authenticate, authorize('admin_it'),
  ctrl.createKategoriAkuntansi
);

router.put('/kategori/:id', 
  authenticate, authorize('admin_it'),
  ctrl.updateKategoriAkuntansi
);

router.delete('/kategori/:id', 
  authenticate, authorize('admin_it'),
  ctrl.deleteKategoriAkuntansi
);

`;
code = code.replace("ctrl.getKategoriAkuntansi\r\n);\r\n\r\n", "ctrl.getKategoriAkuntansi\r\n);\r\n" + routes);
code = code.replace("ctrl.getKategoriAkuntansi\n);\n\n", "ctrl.getKategoriAkuntansi\n);\n" + routes);

fs.writeFileSync('c:/Users/adiva/OneDrive/Dokumen/web magang munculin data lokal/backend/src/routes/pencatatan.js', code);
console.log('Routes added');
