const router = require('express').Router();
const ctrl   = require('../controllers/dokumenController');
const { authenticate, authorize } = require('../middleware/auth');
const validate       = require('../middleware/validate');
const upload         = require('../config/multer');
const activityLogger = require('../middleware/activityLogger');

// ── PENTING: route spesifik harus di atas route dengan parameter /:id ──

// ── Publik (tanpa login) ──────────────────────────────────────
router.get('/kategori', ctrl.getKategori);
router.get('/',         ctrl.getDokumenPublik);

// ── Staff & Admin (perlu login) — harus sebelum /:id ─────────
router.get('/all',
  authenticate, authorize('admin', 'staff'),
  ctrl.getAllDokumen
);

router.post('/upload',
  authenticate, authorize('admin', 'staff'),
  upload.single('file'),
  ctrl.uploadRules, validate,
  activityLogger('upload', 'dokumen'),
  ctrl.uploadDokumen
);

// ── Route dengan parameter /:id — taruh paling bawah ─────────
router.get('/:id/download', ctrl.downloadDokumen);
router.get('/:id',          ctrl.getDokumenDetail);

router.patch('/:id',
  authenticate, authorize('admin', 'staff'),
  ctrl.editRules, validate,
  activityLogger('edit', 'dokumen'),
  ctrl.editDokumen
);

router.patch('/:id/submit',
  authenticate, authorize('staff'),
  activityLogger('submit_verifikasi', 'dokumen'),
  ctrl.submitVerifikasi
);

// ── Admin only ────────────────────────────────────────────────
router.get('/:id/preview',
  authenticate, authorize('admin'),
  ctrl.previewDokumen
);

router.patch('/:id/verify',
  authenticate, authorize('admin'),
  activityLogger('verifikasi', 'dokumen'),
  ctrl.verifikasiDokumen
);

router.delete('/:id',
  authenticate, authorize('admin'),
  activityLogger('hapus', 'dokumen'),
  ctrl.deleteDokumen
);

module.exports = router;
