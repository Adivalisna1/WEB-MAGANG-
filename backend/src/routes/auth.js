const router = require('express').Router();
const { login, logout, me, loginRules } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate         = require('../middleware/validate');
const activityLogger   = require('../middleware/activityLogger');

// POST /api/auth/login
router.post('/login', loginRules, validate, login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me — cek token masih valid
router.get('/me', authenticate, me);

module.exports = router;
