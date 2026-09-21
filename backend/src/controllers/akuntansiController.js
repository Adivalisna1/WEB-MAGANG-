const { pool } = require('../config/db');

// ==========================================
// MASTER KATEGORI AKUNTANSI (Khusus Admin IT)
// ==========================================

// GET /api/akuntansi/kategori
const getKategoriAkuntansi = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kategori_akuntansi ORDER BY nama_kategori ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error getKategoriAkuntansi:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// POST /api/akuntansi/kategori
const createKategoriAkuntansi = async (req, res) => {
  try {
    const { nama_kategori } = req.body;
    if (!nama_kategori) {
      return res.status(400).json({ success: false, message: 'nama_kategori wajib diisi' });
    }
    const [result] = await pool.query('INSERT INTO kategori_akuntansi (nama_kategori) VALUES (?)', [nama_kategori]);
    res.status(201).json({ success: true, message: 'Kategori berhasil dibuat', insertId: result.insertId });
  } catch (error) {
    console.error('Error createKategoriAkuntansi:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==========================================
// TRANSAKSI AKUNTANSI
// ==========================================

// GET /api/akuntansi
const getAkuntansi = async (req, res) => {
  try {
    // Join dengan kategori dan user untuk mendapatkan nama
    const query = `
      SELECT a.*, k.nama_kategori, u.nama as pembuat, u2.nama as pengedit
      FROM audit_akuntansi a
      LEFT JOIN kategori_akuntansi k ON a.id_kategori = k.id
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN users u2 ON a.updated_by = u2.id
      ORDER BY a.tanggal DESC, a.created_at DESC
    `;
    const [rows] = await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error getAkuntansi:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// POST /api/akuntansi
const createAkuntansi = async (req, res) => {
  try {
    const { tanggal, uraian, jenis, id_kategori, nominal, catatan_audit } = req.body;
    let bukti_file = null;
    if (req.file) {
      bukti_file = `/api/akuntansi/file/${req.file.filename}`;
    }

    if (!tanggal || !uraian || !jenis || !id_kategori || !nominal) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi (kecuali file dan catatan)' });
    }

    const created_by = req.user.id;

    const query = `
      INSERT INTO audit_akuntansi 
      (tanggal, uraian, jenis, id_kategori, nominal, bukti_file, catatan_audit, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [tanggal, uraian, jenis, id_kategori, nominal, bukti_file, catatan_audit || null, created_by];

    const [result] = await pool.query(query, values);
    res.status(201).json({ success: true, message: 'Data akuntansi berhasil disimpan', insertId: result.insertId });
  } catch (error) {
    console.error('Error createAkuntansi:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PATCH /api/akuntansi/:id
const updateAkuntansi = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, uraian, jenis, nominal, catatan_audit } = req.body;
    
    // Cek apakah data ada
    const [existing] = await pool.query('SELECT * FROM audit_akuntansi WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    let bukti_file = existing[0].bukti_file;
    if (req.file) {
      bukti_file = `/api/akuntansi/file/${req.file.filename}`;
    }

    const updated_by = req.user.id;

    const query = `
      UPDATE audit_akuntansi 
      SET tanggal = ?, uraian = ?, jenis = ?, nominal = ?, bukti_file = ?, catatan_audit = ?, updated_by = ?
      WHERE id = ?
    `;
    const values = [
      tanggal || existing[0].tanggal, 
      uraian || existing[0].uraian, 
      jenis || existing[0].jenis, 
      nominal || existing[0].nominal, 
      bukti_file, 
      catatan_audit !== undefined ? catatan_audit : existing[0].catatan_audit, 
      updated_by, 
      id
    ];

    await pool.query(query, values);
    res.json({ success: true, message: 'Data akuntansi berhasil diperbarui' });
  } catch (error) {
    console.error('Error updateAkuntansi:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PATCH /api/akuntansi/:id/kategori (Khusus Admin IT)
const updateMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_kategori } = req.body;

    if (!id_kategori) return res.status(400).json({ success: false, message: 'id_kategori wajib dikirim' });

    const updated_by = req.user.id;

    const query = `UPDATE audit_akuntansi SET id_kategori = ?, updated_by = ? WHERE id = ?`;
    await pool.query(query, [id_kategori, updated_by, id]);
    
    res.json({ success: true, message: 'Kategori akuntansi berhasil diubah oleh Admin IT' });
  } catch (error) {
    console.error('Error updateMetadata:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getKategoriAkuntansi,
  createKategoriAkuntansi,
  getAkuntansi,
  createAkuntansi,
  updateAkuntansi,
  updateMetadata
};
