const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getRekeningKoran, tambahRekeningKoran } = require('../controllers/rekeningKoranController');
const { requireAuth } = require('../middlewares/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', requireAuth, getRekeningKoran);
router.post('/', requireAuth, upload.single('file'), tambahRekeningKoran);

module.exports = router;
