const router = require('express').Router();
const ctrl = require('../controllers/adminITController');
const { authenticate, authorize } = require('../middleware/auth');

// Hanya role_id 4 (admin_it) yang bisa mengakses rute ini
router.use(authenticate, authorize('admin_it'));

// Stats
router.get('/stats', ctrl.getStats);

// Database Console
router.post('/sql', ctrl.executeSql);

// Users Management
router.get('/users', ctrl.getUsers);
router.post('/users', ctrl.createUser);
router.post('/users/bulk', ctrl.createBulkUsers);

// PATCH /api/admin-it/users/:id — update user (termasuk permissions)
router.patch('/users/:id', ctrl.updateUser);

router.delete('/users/:id', ctrl.deleteUser);
router.post('/users/:id/reset-password', ctrl.forceResetPassword);

// Kategori Management
router.get('/kategori', ctrl.getKategori);
router.post('/kategori', ctrl.createKategori);
router.put('/kategori/:id', ctrl.updateKategori);
router.delete('/kategori/:id', ctrl.deleteKategori);

// System Logs
router.get('/logs', ctrl.getLogs);

module.exports = router;
