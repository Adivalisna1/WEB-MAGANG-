const router = require('express').Router();
const { login, logout, me, forgotPassword, resetPassword, loginRules } = require('../controllers/authController');
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

// ── Rate Limiter Khusus Lupa Password (Cegah Spam Email) ────────
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 3, // maksimal 3 kali request dari IP yang sama per jam
  message: {
    success: false,
    message: 'Anda telah mencapai batas maksimal permintaan reset password. Silakan coba lagi setelah 1 jam.',
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

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

module.exports = router;
