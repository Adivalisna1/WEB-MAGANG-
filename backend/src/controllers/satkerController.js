const { pool } = require('../config/db');

async function getSatkers(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, NO_Satker, nama, created_at FROM satkers ORDER BY nama ASC');
    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

async function createSatker(req, res, next) {
  try {
    if (req.user.role !== 'admin_it') return res.status(403).json({ success: false, message: 'Forbidden' });
    const { NO_Satker, nama } = req.body;
    if (!nama || !NO_Satker) return res.status(400).json({ success: false, message: 'Kode Satker dan Nama Satker wajib diisi' });

    const [result] = await pool.query('INSERT INTO satkers (NO_Satker, nama) VALUES (?, ?)', [NO_Satker, nama]);
    return res.json({ success: true, message: 'Satker berhasil ditambahkan', data: { id: result.insertId, NO_Satker, nama } });
  } catch (err) {
    next(err);
  }
}

async function createBulkSatker(req, res, next) {
  try {
    if (req.user.role !== 'admin_it') return res.status(403).json({ success: false, message: 'Forbidden' });
    const { satkers } = req.body; 
    
    if (!satkers || !Array.isArray(satkers) || satkers.length === 0) {
      return res.status(400).json({ success: false, message: 'Data satker kosong atau format tidak valid' });
    }

    const values = satkers.map(s => [s.NO_Satker, s.nama]);
    await pool.query('INSERT INTO satkers (NO_Satker, nama) VALUES ?', [values]);
    
    return res.json({ success: true, message: `${satkers.length} Satker berhasil diimport` });
  } catch (err) {
    next(err);
  }
}

async function updateSatker(req, res, next) {
  try {
    if (req.user.role !== 'admin_it') return res.status(403).json({ success: false, message: 'Forbidden' });
    const { NO_Satker, nama } = req.body;
    if (!nama || !NO_Satker) return res.status(400).json({ success: false, message: 'Kode Satker dan Nama Satker wajib diisi' });

    await pool.query('UPDATE satkers SET NO_Satker = ?, nama = ? WHERE id = ?', [NO_Satker, nama, req.params.id]);
    return res.json({ success: true, message: 'Satker berhasil diupdate' });
  } catch (err) {
    next(err);
  }
}

async function deleteSatker(req, res, next) {
  try {
    if (req.user.role !== 'admin_it') return res.status(403).json({ success: false, message: 'Forbidden' });
    
    // Check if any user is associated with this staff
    const [users] = await pool.query('SELECT id FROM users WHERE satker_id = ?', [req.params.id]);
    if (users.length > 0) {
      return res.status(400).json({ success: false, message: 'Gagal dihapus: Satker ini masih memiliki user aktif.' });
    }

    await pool.query('DELETE FROM satkers WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Satker berhasil dihapus' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSatkers,
  createSatker,
  createBulkSatker,
  updateSatker,
  deleteSatker
};
