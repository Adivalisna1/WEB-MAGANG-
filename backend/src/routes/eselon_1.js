const router = require('express').Router();
const ctrl        = require('../controllers/eselon1Controller');
const dokCtrl     = require('../controllers/dokumenController');
const adminCtrl   = require('../controllers/pimpinanController');
const { authenticate, authorize } = require('../middleware/auth');
const validate    = require('../middleware/validate');

// Semua route ketua tim butuh login + role eselon_1
router.use(authenticate, authorize('eselon_1'));

// GET /api/eselon-1/stats — statistik + data grafik dashboard
router.get('/stats', ctrl.getStats);

// GET /api/eselon-1/users — daftar semua user (admin & staff)
router.get('/users', ctrl.getUsers);

// GET /api/eselon-1/users/online — monitoring realtime (reuse admin)
router.get('/users/online', adminCtrl.getOnlineUsers);

// PATCH /api/eselon-1/users/:id/toggle — aktif/nonaktif user
router.patch('/users/:id/toggle', ctrl.toggleUserActive);

// POST /api/eselon-1/users/:id/reset-password — reset password user
router.post('/users/:id/reset-password', ctrl.resetPassword);

// GET /api/eselon-1/dokumen — monitor semua dokumen (read-only, semua status)
router.get('/dokumen', ctrl.getDokumen);

// GET /api/eselon-1/dokumen/menunggu — dokumen yang sudah lolos admin, menunggu persetujuan ketua
router.get('/dokumen/menunggu', ctrl.getDokumenMenungguKetua);

// GET /api/eselon-1/logs — log aktivitas (reuse admin)
router.get('/logs', adminCtrl.getLogs);

// POST /api/eselon-1/notifikasi/kirim — kirim notifikasi manual
router.post('/notifikasi/kirim',
  ctrl.kirimNotifikasiRules, validate,
  ctrl.kirimNotifikasi
);

module.exports = router;
