const router = require('express').Router();
const ctrl   = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const validate         = require('../middleware/validate');
const activityLogger   = require('../middleware/activityLogger');

// Semua route user butuh login
router.use(authenticate);

// GET /api/user/profile
router.get('/profile', ctrl.getProfile);

// PATCH /api/user/profile
router.patch('/profile',
  ctrl.updateProfileRules, validate,
  activityLogger('edit_profil', 'user'),
  ctrl.updateProfile
);

// PATCH /api/user/password
router.patch('/password',
  ctrl.changePasswordRules, validate,
  activityLogger('ganti_password', 'user'),
  ctrl.changePassword
);

module.exports = router;
