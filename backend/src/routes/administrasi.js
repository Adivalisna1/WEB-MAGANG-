const router = require('express').Router();
const ctrl = require('../controllers/administrasiController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const activityLogger = require('../middleware/activityLogger');

// Semua route administrasi butuh login + role administrasi
router.use(authenticate, authorize('administrasi'));

// GET /api/administrasi/stats — ringkasan dashboard administrasi
router.get('/stats', ctrl.getStats);

// ── Kategori Dokumen (master data) ───────────────────────────
router.get('/kategori',       ctrl.getKategori);
router.post('/kategori',      ctrl.createKategoriRules, validate, activityLogger('buat_kategori', 'kategori'), ctrl.createKategori);
router.patch('/kategori/:id', ctrl.updateKategoriRules, validate, activityLogger('edit_kategori', 'kategori'), ctrl.updateKategori);
router.delete('/kategori/:id', activityLogger('hapus_kategori', 'kategori'), ctrl.deleteKategori);

// ── Notifikasi (Manual) ───────────────────────────
router.post('/notifikasi/kirim', ctrl.kirimNotifikasiRules, validate, ctrl.kirimNotifikasi);

module.exports = router;
