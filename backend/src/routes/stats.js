const router = require('express').Router();
const ctrl = require('../controllers/statsController');
const { authenticate } = require('../middleware/auth');

// GET /api/stats/dashboard
// Semua user yang login bisa lihat statistik ini (Eselon 1, Pimpinan, Admin, Staff)
router.get('/dashboard', authenticate, ctrl.getDashboardStats);

module.exports = router;
