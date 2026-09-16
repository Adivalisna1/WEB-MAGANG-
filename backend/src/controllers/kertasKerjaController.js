const { pool } = require('../config/db');
const { catatLog } = require('./authController');

// Helper untuk inisialisasi tabel Kertas Kerja jika belum ada
async function initKertasKerjaTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS kertas_kerja (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      satker_id INT UNSIGNED NULL,
      uploaded_by INT UNSIGNED NOT NULL,
      tanggal DATE NULL,
      uraian VARCHAR(255) NULL,
      kategori VARCHAR(100) NULL,
      no_rek VARCHAR(100) NULL,
      judul_laporan VARCHAR(255) NULL,
      akun VARCHAR(255) NULL,
      nominal DECIMAL(18,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_kk_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `;
  try {
    await pool.query(query);
    console.log('Tabel kertas_kerja sudah dipastikan ada.');

    // Patch kolom-kolom baru jika belum ada (Abaikan error jika kolom sudah ada)
    const patchQueries = [
      "ALTER TABLE kertas_kerja ADD COLUMN no_rek VARCHAR(100) NULL AFTER kategori;",
      "ALTER TABLE kertas_kerja ADD COLUMN judul_laporan VARCHAR(255) NULL AFTER no_rek;",
      "ALTER TABLE kertas_kerja ADD COLUMN akun VARCHAR(255) NULL AFTER judul_laporan;"
    ];

    for (const pq of patchQueries) {
      try {
        await pool.query(pq);
      } catch (e) {
        // Abaikan jika error ER_DUP_FIELDNAME (Kolom sudah ada)
        if (e.code !== 'ER_DUP_FIELDNAME') {
          console.error(`Error saat menambah kolom (Query: ${pq}):`, e);
        }
      }
    }
  } catch (err) {
    console.error('Error init kertas_kerja table:', err);
  }
}

// Panggil init
initKertasKerjaTable();

// ── GET /api/kertas-kerja ─────────────────────────────────────────
async function getKertasKerja(req, res, next) {
  try {
    const role = req.user.role_id;
    let where = '1=1';
    const params = [];

    // Jika staff biasa (role_id = 2), hanya lihat milik satkernya
    if (role === 2) {
      if (req.user.satker_id == null) {
        where += ' AND k.satker_id IS NULL';
      } else {
        where += ' AND k.satker_id = ?';
        params.push(req.user.satker_id);
      }
    }
    // Eselon 1 (role_id = 4) atau Pimpinan (role_id = 3) atau Admin IT (1) bisa lihat semua (bisa ditambah filter satker nanti)
    
    const [rows] = await pool.query(
      `SELECT k.*, u.nama AS uploader_nama, s.nama AS nama_satker 
       FROM kertas_kerja k
       LEFT JOIN users u ON u.id = k.uploaded_by
       LEFT JOIN satkers s ON s.id = k.satker_id
       WHERE ${where}
       ORDER BY k.tanggal DESC, k.created_at DESC`,
      params
    );

    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── POST /api/kertas-kerja/bulk ──────────────────────────────────
async function bulkInsertKertasKerja(req, res, next) {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data excel kosong atau tidak valid' });
    }

    const satkerId = req.user.satker_id || null;
    const uploadedBy = req.user.id;
    const values = [];

    // Parsing data excel
    for (const row of data) {
      // Cari key yang mendekati Tanggal, Uraian, Kategori, Nominal
      const keys = Object.keys(row);
      const getVal = (keywords) => {
        const k = keys.find(key => keywords.some(kw => key.toLowerCase().includes(kw)));
        return k ? row[k] : null;
      };

      let tglStr = getVal(['tanggal', 'date', 'waktu']);
      // Jika excel kirim format tgl aneh, set jadi null sementara
      let tanggal = null;
      if (tglStr) {
        const parsed = new Date(tglStr);
        if (!isNaN(parsed)) tanggal = parsed.toISOString().split('T')[0];
      }
      if (!tanggal) tanggal = new Date().toISOString().split('T')[0];

      const uraian = getVal(['uraian', 'deskripsi', 'keterangan']) || 'Tanpa Uraian';
      const kategori = getVal(['kategori', 'jenis']) || 'Umum';
      const nominalRaw = getVal(['nominal', 'jumlah', 'nilai', 'harga', 'rp']);
      const nominal = parseFloat(String(nominalRaw).replace(/[^0-9.-]+/g,"")) || 0;
      
      const no_rek = getVal(['rek', 'no']) || null;
      const judul_laporan = getVal(['judul', 'laporan']) || null;
      const akun = getVal(['akun']) || null;

      values.push([satkerId, uploadedBy, tanggal, uraian, kategori, nominal, no_rek, judul_laporan, akun]);
    }

    if (values.length > 0) {
      await pool.query(
        `INSERT INTO kertas_kerja (satker_id, uploaded_by, tanggal, uraian, kategori, nominal, no_rek, judul_laporan, akun) VALUES ?`,
        [values]
      );
    }

    await catatLog({
      user_id: req.user.id,
      aksi: 'upload_kertas_kerja',
      entitas: 'kertas_kerja',
      entitas_id: null,
      detail: { jumlah_baris: values.length },
      ip: req.ip,
    });

    return res.status(201).json({ success: true, message: `Berhasil menyimpan ${values.length} baris data.` });
  } catch (err) { next(err); }
}

// ── POST /api/kertas-kerja ──────────────────────────────────────
async function createKertasKerja(req, res, next) {
  try {
    const { tanggal, uraian, kategori, nominal, no_rek, judul_laporan, akun } = req.body;
    const satkerId = req.user.satker_id || null;
    const uploadedBy = req.user.id;

    if (!tanggal || !uraian || !kategori || nominal === undefined) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    const [result] = await pool.query(
      `INSERT INTO kertas_kerja (satker_id, uploaded_by, tanggal, uraian, kategori, nominal, no_rek, judul_laporan, akun)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [satkerId, uploadedBy, tanggal, uraian, kategori, nominal, no_rek, judul_laporan, akun]
    );

    await catatLog({
      user_id: req.user.id,
      aksi: 'create_kertas_kerja',
      entitas: 'kertas_kerja',
      entitas_id: result.insertId,
      detail: { uraian },
      ip: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Data berhasil ditambahkan', data: { id: result.insertId } });
  } catch (err) { next(err); }
}

// ── PUT /api/kertas-kerja/:id ──────────────────────────────────────
async function updateKertasKerja(req, res, next) {
  try {
    const { id } = req.params;
    const { tanggal, uraian, kategori, nominal, no_rek, judul_laporan, akun } = req.body;
    
    // Validasi basic
    if (!tanggal || !uraian || !kategori || nominal === undefined) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    const [result] = await pool.query(
      `UPDATE kertas_kerja SET tanggal = ?, uraian = ?, kategori = ?, nominal = ?, no_rek = ?, judul_laporan = ?, akun = ? WHERE id = ?`,
      [tanggal, uraian, kategori, nominal, no_rek, judul_laporan, akun, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    await catatLog({
      user_id: req.user.id,
      aksi: 'update_kertas_kerja',
      entitas: 'kertas_kerja',
      entitas_id: id,
      ip: req.ip,
    });

    return res.json({ success: true, message: 'Data berhasil diupdate' });
  } catch (err) { next(err); }
}

// ── DELETE /api/kertas-kerja/:id ──────────────────────────────────
async function deleteKertasKerja(req, res, next) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(`DELETE FROM kertas_kerja WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    await catatLog({
      user_id: req.user.id,
      aksi: 'delete_kertas_kerja',
      entitas: 'kertas_kerja',
      entitas_id: id,
      ip: req.ip,
    });

    return res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (err) { next(err); }
}

module.exports = {
  initKertasKerjaTable,
  getKertasKerja,
  bulkInsertKertasKerja,
  createKertasKerja,
  updateKertasKerja,
  deleteKertasKerja
};
