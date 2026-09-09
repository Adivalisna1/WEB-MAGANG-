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

// POST /api/pimpinan/users — buat user baru
router.post('/users',
  ctrl.createUserRules, validate,
  ctrl.createUser
);

// PATCH /api/pimpinan/users/:id/toggle — aktif/nonaktif user
router.patch('/users/:id/toggle',
  ctrl.toggleUserActive
);

// DELETE /api/pimpinan/users/:id — hapus user
router.delete('/users/:id',
  ctrl.deleteUser
);

// PATCH /api/pimpinan/users/:id/password — reset password user
router.patch('/users/:id/password',
  ctrl.resetUserPassword
);

// GET /api/pimpinan/logs — log aktivitas
router.get('/logs', ctrl.getLogs);

// DELETE /api/pimpinan/logs — hapus riwayat log
router.delete('/logs', ctrl.clearLogs);

// ── Kategori Dokumen (master data) ───────────────────────────
router.get('/kategori',       ctrl.getKategoriAdmin);
router.post('/kategori',      ctrl.createKategoriRules, validate, activityLogger('buat_kategori', 'kategori'), ctrl.createKategori);
router.patch('/kategori/:id', ctrl.updateKategoriRules, validate, activityLogger('edit_kategori', 'kategori'), ctrl.updateKategori);
router.delete('/kategori/:id', activityLogger('hapus_kategori', 'kategori'), ctrl.deleteKategori);

module.exports = router;
