const router = require('express').Router();
const ctrl = require('../controllers/akuntansiController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../config/multer');
const activityLogger = require('../middleware/activityLogger');
const path = require('path');

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


// ── Serve File Bukti ───────────────────────────────────
router.get('/file/:filename', authenticate, (req, res) => {
  const filename = req.params.filename;
  // Cegah path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ success: false, message: 'Invalid filename' });
  }
  const filePath = path.join(__dirname, '../../uploads/akuntansi', filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ success: false, message: 'File tidak ditemukan' });
    }
  });
});

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

