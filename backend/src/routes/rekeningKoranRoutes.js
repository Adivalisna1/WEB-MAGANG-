const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { 
  getKertasKerja, 
  bulkInsertKertasKerja, 
  createKertasKerja,
  updateKertasKerja, 
  deleteKertasKerja 
} = require('../controllers/rekeningKoranController');

router.get('/', authenticate, getKertasKerja);
router.post('/', authenticate, createKertasKerja);
router.post('/bulk', authenticate, bulkInsertKertasKerja);
router.put('/:id', authenticate, updateKertasKerja);
router.delete('/:id', authenticate, deleteKertasKerja);

module.exports = router;
