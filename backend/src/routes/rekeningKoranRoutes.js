const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getRekeningKoran, tambahRekeningKoran } = require('../controllers/rekeningKoranController');
const { authenticate } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', authenticate, getRekeningKoran);
router.post('/', authenticate, upload.single('file'), tambahRekeningKoran);

module.exports = router;
