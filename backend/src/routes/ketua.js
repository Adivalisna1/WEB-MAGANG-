const router = require('express').Router();
const ctrl        = require('../controllers/ketuaController');
const dokCtrl     = require('../controllers/dokumenController');
const adminCtrl   = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const validate    = require('../middleware/validate');

// Semua route ketua tim butuh login + role ketua_tim
router.use(authenticate, authorize('ketua_tim'));

// GET /api/ketua/stats — statistik + data grafik dashboard
router.get('/stats', ctrl.getStats);

// GET /api/ketua/users — daftar semua user (admin & staff)
router.get('/users', ctrl.getUsers);

// GET /api/ketua/users/online — monitoring realtime (reuse admin)
router.get('/users/online', adminCtrl.getOnlineUsers);

// PATCH /api/ketua/users/:id/toggle — aktif/nonaktif user
router.patch('/users/:id/toggle', ctrl.toggleUserActive);

// POST /api/ketua/users/:id/reset-password — reset password user
router.post('/users/:id/reset-password', ctrl.resetPassword);

// GET /api/ketua/dokumen — monitor semua dokumen (read-only, semua status)
router.get('/dokumen', ctrl.getDokumen);

// GET /api/ketua/dokumen/menunggu — dokumen yang sudah lolos admin, menunggu persetujuan ketua
router.get('/dokumen/menunggu', ctrl.getDokumenMenungguKetua);

// GET /api/ketua/logs — log aktivitas (reuse admin)
router.get('/logs', adminCtrl.getLogs);

// POST /api/ketua/notifikasi/kirim — kirim notifikasi manual
router.post('/notifikasi/kirim',
  ctrl.kirimNotifikasiRules, validate,
  ctrl.kirimNotifikasi
);

module.exports = router;
