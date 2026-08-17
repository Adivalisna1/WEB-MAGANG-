const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getNotifikasi,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notifikasiController');

const router = express.Router();

// Semua endpoint butuh login
router.use(authenticate);

router.get('/',              getNotifikasi);
router.get('/unread-count',  getUnreadCount);
router.patch('/read-all',    markAllAsRead);
router.patch('/:id/read',    markAsRead);

module.exports = router;
