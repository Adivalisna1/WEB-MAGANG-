const router = require('express').Router();
const ctrl       = require('../controllers/pimpinanController');
const { authenticate, authorize } = require('../middleware/auth');
const validate       = require('../middleware/validate');
const activityLogger = require('../middleware/activityLogger');

// Semua route admin butuh login + role pimpinan
router.use(authenticate, authorize('pimpinan'));

// GET /api/pimpinan/stats — ringkasan dashboard admin
router.get('/stats', ctrl.getStats);

// GET /api/pimpinan/users — daftar semua user
router.get('/users', ctrl.getUsers);

// GET /api/pimpinan/users/online — monitoring realtime
router.get('/users/online', ctrl.getOnlineUsers);

// (Pembuatan user dipindahkan ke Admin IT / Administrasi)

// PATCH /api/pimpinan/users/:id/toggle — aktif/nonaktif user
router.patch('/users/:id/toggle',
  ctrl.toggleUserActive
);

// (Hapus user dipindahkan ke Admin IT)

// PATCH /api/pimpinan/users/:id/password — reset password user
router.patch('/users/:id/password',
  ctrl.resetUserPassword
);

// GET /api/pimpinan/logs — log aktivitas
router.get('/logs', ctrl.getLogs);

// DELETE /api/pimpinan/logs — hapus riwayat log
router.delete('/logs', ctrl.clearLogs);

// ── Kategori Dokumen (master data) DIPINDAH KE ADMINISTRASI ───

module.exports = router;
