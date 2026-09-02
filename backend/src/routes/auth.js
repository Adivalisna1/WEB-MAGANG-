const router = require('express').Router();
const { login, logout, me, loginRules } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate         = require('../middleware/validate');
const activityLogger   = require('../middleware/activityLogger');

const rateLimit = require('express-rate-limit');

// ── Rate Limiter Khusus Login (Cegah Bruteforce) ────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // maksimal 5 kali percobaan gagal/berhasil dari IP yang sama
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login, silakan coba lagi setelah 15 menit',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post('/login', loginLimiter, loginRules, validate, login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me — cek token masih valid
router.get('/me', authenticate, me);

module.exports = router;
