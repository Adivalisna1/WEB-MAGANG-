const router = require('express').Router();
const ctrl = require('../controllers/akuntansiController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../config/multer');
const activityLogger = require('../middleware/activityLogger');

// ── Master Kategori Akuntansi ──────────────────────────
// GET Kategori: Bisa diakses oleh semua yang butuh
router.get('/kategori', 
  authenticate, authorize('pimpinan', 'staff', 'admin_it'),
  ctrl.getKategoriAkuntansi
);

// POST Kategori: HANYA Admin IT
router.post('/kategori',
  authenticate, authorize('admin_it'),
  activityLogger('create_kategori_akuntansi', 'akuntansi'),
  ctrl.createKategoriAkuntansi
);


// ── Transaksi Akuntansi ────────────────────────────────
// GET Akuntansi: Bisa diakses oleh Staff, Pimpinan, dan Admin IT
router.get('/', 
  authenticate, authorize('pimpinan', 'staff', 'admin_it'),
  ctrl.getAkuntansi
);

// POST Akuntansi: Staff dan Pimpinan
router.post('/',
  authenticate, authorize('pimpinan', 'staff'),
  upload.single('file'),
  activityLogger('create', 'akuntansi'),
  ctrl.createAkuntansi
);

// PATCH Akuntansi /kategori (Admin IT update metadata kategori saja)
router.patch('/:id/kategori',
  authenticate, authorize('admin_it'),
  activityLogger('edit_kategori', 'akuntansi'),
  ctrl.updateMetadata
);

// PATCH Akuntansi: Staff dan Pimpinan bisa update
router.patch('/:id',
  authenticate, authorize('pimpinan', 'staff'),
  upload.single('file'),
  activityLogger('edit', 'akuntansi'),
  ctrl.updateAkuntansi
);

module.exports = router;
