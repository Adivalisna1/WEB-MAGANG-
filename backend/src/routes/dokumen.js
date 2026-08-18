const router = require('express').Router();
const ctrl       = require('../controllers/dokumenController');
const divisiCtrl = require('../controllers/divisiController');
const { authenticate, authorize } = require('../middleware/auth');
const validate       = require('../middleware/validate');
const upload         = require('../config/multer');
const activityLogger = require('../middleware/activityLogger');

// ── PENTING: route spesifik harus di atas route dengan parameter /:id ──

// ── Publik (tanpa login) ──────────────────────────────────────
router.get('/kategori', ctrl.getKategori);
router.get('/divisi',   divisiCtrl.getDivisiPublik);
router.get('/stats',    ctrl.getStatsPublik);
router.get('/',         ctrl.getDokumenPublik);

// ── Staff & Admin (perlu login) — harus sebelum /:id ─────────
router.get('/all',
  authenticate, authorize('admin', 'admin_dept', 'staff'),
  ctrl.getAllDokumen
);

router.post('/upload',
  authenticate, authorize('admin', 'admin_dept', 'staff'),
  upload.single('file'),
  ctrl.uploadRules, validate,
  ctrl.uploadDokumen
);

// ── Route dengan parameter /:id — taruh paling bawah ─────────
router.get('/:id/download', ctrl.downloadDokumen);
router.get('/:id',          ctrl.getDokumenDetail);

router.patch('/:id',
  authenticate, authorize('admin', 'admin_dept', 'staff'),
  ctrl.editRules, validate,
  activityLogger('edit', 'dokumen'),
  ctrl.editDokumen
);

router.patch('/:id/submit',
  authenticate, authorize('staff'),
  activityLogger('submit_verifikasi', 'dokumen'),
  ctrl.submitVerifikasi
);

// Ganti file saat revisi/draft
router.patch('/:id/file',
  authenticate, authorize('admin', 'admin_dept', 'staff'),
  upload.single('file'),
  activityLogger('ganti_file', 'dokumen'),
  ctrl.gantiFileDokumen
);

// ── Admin (global & dept — dept dibatasi divisinya di controller) ──
router.get('/:id/preview',
  authenticate, authorize('admin', 'admin_dept'),
  ctrl.previewDokumen
);

router.patch('/:id/verify',
  authenticate, authorize('admin', 'admin_dept'),
  ctrl.verifikasiDokumen
);

router.delete('/:id',
  authenticate, authorize('admin', 'admin_dept'),
  ctrl.deleteDokumen
);

module.exports = router;
