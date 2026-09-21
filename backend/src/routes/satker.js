const router = require('express').Router();
const ctrl = require('../controllers/satkerController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/satkers
router.get('/', ctrl.getSatkers);

// Master CRUD (admin_it only check is in controller, but let's be safe)
router.post('/', ctrl.createSatker);
router.post('/bulk', ctrl.createBulkSatker);
router.put('/:id', ctrl.updateSatker);
router.delete('/:id', ctrl.deleteSatker);

module.exports = router;
