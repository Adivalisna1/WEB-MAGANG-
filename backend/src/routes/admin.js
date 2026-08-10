const router = require('express').Router();
const ctrl   = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const validate       = require('../middleware/validate');
const activityLogger = require('../middleware/activityLogger');

// Semua route admin butuh login + role admin
router.use(authenticate, authorize('admin'));

// GET /api/admin/stats — ringkasan dashboard admin
router.get('/stats', ctrl.getStats);

// GET /api/admin/users — daftar semua user
router.get('/users', ctrl.getUsers);

// GET /api/admin/users/online — monitoring realtime
router.get('/users/online', ctrl.getOnlineUsers);

// POST /api/admin/users — buat user baru
router.post('/users',
  ctrl.createUserRules, validate,
  activityLogger('buat_user', 'user'),
  ctrl.createUser
);

// PATCH /api/admin/users/:id/toggle — aktif/nonaktif user
router.patch('/users/:id/toggle',
  activityLogger('toggle_user', 'user'),
  ctrl.toggleUserActive
);

// DELETE /api/admin/users/:id — hapus user
router.delete('/users/:id',
  activityLogger('hapus_user', 'user'),
  ctrl.deleteUser
);

// GET /api/admin/logs — log aktivitas
router.get('/logs', ctrl.getLogs);

// DELETE /api/admin/logs — hapus riwayat log
router.delete('/logs', ctrl.clearLogs);

module.exports = router;
