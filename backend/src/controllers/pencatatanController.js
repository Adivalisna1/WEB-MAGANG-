const { pool } = require('../config/db');

async function initPencatatanAlter() {
  try {
    await pool.query('ALTER TABLE kertas_kerja ADD COLUMN dokumen_id INT UNSIGNED NULL');
    console.log('ALTER TABLE kertas_kerja SUCCESS');
  } catch (err) {
    // Ignore duplicate column
  }
}
initPencatatanAlter();

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

// PUT /api/akuntansi/kategori/:id
const updateKategoriAkuntansi = async (req, res) => {
  try {
    const { nama_kategori } = req.body;
    if (!nama_kategori) {
      return res.status(400).json({ success: false, message: 'nama_kategori wajib diisi' });
    }
    await pool.query('UPDATE kategori_akuntansi SET nama_kategori = ? WHERE id = ?', [nama_kategori, req.params.id]);
    res.json({ success: true, message: 'Kategori berhasil diupdate' });
  } catch (error) {
    console.error('Error updateKategoriAkuntansi:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE /api/akuntansi/kategori/:id
const deleteKategoriAkuntansi = async (req, res) => {
  try {
    await pool.query('DELETE FROM kategori_akuntansi WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteKategoriAkuntansi:', error);
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
      SELECT a.*, k.nama_kategori, u.nama as pembuat, u2.nama as pengedit,
             u.satker_id, s.nama as satker_nama
      FROM audit_akuntansi a
      LEFT JOIN kategori_akuntansi k ON a.id_kategori = k.id
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN users u2 ON a.updated_by = u2.id
      LEFT JOIN satkers s ON u.satker_id = s.id
      ORDER BY a.tanggal DESC, a.created_at DESC
    `;
    const [rows] = await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error getAkuntansi:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createAkuntansi = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { tanggal, uraian, jenis, id_kategori, nominal, catatan_audit, nomor_rekening_bank, nama_bank } = req.body;
    let bukti_file = null;
    if (req.file) {
      bukti_file = `/api/pencatatan/file/${req.file.filename}`;
    }

    if (!req.file) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Bukti File wajib diunggah saat menambah transaksi!' });
    }

    if (!tanggal || !uraian || !jenis || !id_kategori || !nominal) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }

    const created_by = req.user.id;
    const satker_id = req.user.satker_id || null;

    // Cek nama kategori
    const [catRes] = await conn.query('SELECT nama_kategori FROM kategori_akuntansi WHERE id = ?', [id_kategori]);
    const nama_kategori = catRes[0]?.nama_kategori?.toLowerCase() || '';

    let dokumen_id = null;

    if (nama_kategori.includes('rekening koran')) {
      if (req.file) {
        // Cari ID Kategori Dokumen untuk 'Rekening Koran'
        const [katDokRes] = await conn.query('SELECT id FROM kategori_dokumen WHERE LOWER(nama) = ? LIMIT 1', ['rekening koran']);
        let kat_dok_id = katDokRes.length > 0 ? katDokRes[0].id : 1; // Fallback ke 1 jika tidak ada

        const [docRes] = await conn.query(`
          INSERT INTO dokumen (judul, kategori_id, tahun, file_path, file_nama, uploaded_by, status, is_public) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          `Bukti Rekening Koran - ${uraian}`,
          kat_dok_id,
          new Date(tanggal).getFullYear(),
          bukti_file,
          req.file.originalname,
          created_by,
          'terverifikasi',
          1
        ]);
        dokumen_id = docRes.insertId;
      }

      await conn.query(`
        INSERT INTO kertas_kerja (
          satker_id, uploaded_by, nomor_rekening_bank, saldo_akhir_bulan, 
          keterangan, nama_bank, tahun, tanggal_pembukaan_rekening, dokumen_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        satker_id,
        created_by,
        nomor_rekening_bank || null,
        nominal,
        uraian,
        nama_bank || null,
        new Date(tanggal).getFullYear(),
        tanggal,
        dokumen_id
      ]);
    }

    const query = `
      INSERT INTO audit_akuntansi 
      (tanggal, uraian, jenis, id_kategori, nominal, bukti_file, catatan_audit, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [tanggal, uraian, jenis, id_kategori, nominal, bukti_file, catatan_audit || null, created_by];
    const [result] = await conn.query(query, values);

    await conn.commit();
    res.status(201).json({ success: true, message: 'Data pencatatan berhasil disimpan', insertId: result.insertId });
  } catch (error) {
    await conn.rollback();
    console.error('Error createAkuntansi:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  } finally {
    conn.release();
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
    Place
    res.json({ success: true, message: 'Kategori akuntansi berhasil diubah oleh Admin IT' });
  } catch (error) {
    console.error('Error updateMetadata:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getKategoriAkuntansi,
  createKategoriAkuntansi,
  updateKategoriAkuntansi,
  deleteKategoriAkuntansi,
  getAkuntansi,
  createAkuntansi,
  updateMetadata
};
