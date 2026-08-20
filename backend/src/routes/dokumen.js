const router = require('express').Router();
const ctrl       = require('../controllers/dokumenController');
const { authenticate, authorize } = require('../middleware/auth');
const validate       = require('../middleware/validate');
const upload         = require('../config/multer');
const activityLogger = require('../middleware/activityLogger');

// ── PENTING: route spesifik harus di atas route dengan parameter /:id ──

// ── Publik (tanpa login) ──────────────────────────────────────
router.get('/kategori', ctrl.getKategori);
router.get('/stats',    ctrl.getStatsPublik);
router.get('/',         ctrl.getDokumenPublik);

// ── Staff & Admin (perlu login) — harus sebelum /:id ─────────
router.get('/all',
  authenticate, authorize('admin', 'staff', 'ketua_tim'),
  ctrl.getAllDokumen
);

router.post('/upload',
  authenticate, authorize('staff'),
  upload.single('file'),
  ctrl.uploadRules, validate,
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

// Ganti file saat revisi/draft
router.patch('/:id/file',
  authenticate, authorize('admin', 'staff'),
  upload.single('file'),
  activityLogger('ganti_file', 'dokumen'),
  ctrl.gantiFileDokumen
);

// ── Admin — penyaring pertama (loloskan ke ketua / kembalikan revisi) ──
router.get('/:id/preview',
  authenticate, authorize('admin', 'ketua_tim'),
  ctrl.previewDokumen
);

router.patch('/:id/verify',
  authenticate, authorize('admin'),
  ctrl.verifikasiDokumen
);

// ── Ketua Tim — persetujuan final (approve → publik / revisi) ──
router.patch('/:id/ketua-verify',
  authenticate, authorize('ketua_tim'),
  ctrl.verifikasiKetua
);

router.delete('/:id',
  authenticate, authorize('admin'),
  ctrl.deleteDokumen
);

module.exports = router;
