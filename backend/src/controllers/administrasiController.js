const { body } = require('express-validator');
const { pool } = require('../config/db');
const { buatNotifikasi } = require('./notifikasiController');
const { catatLog } = require('./authController');

// ── GET /api/administrasi/stats ──────────────────────────────────
async function getStats(req, res, next) {
  try {
    const [[{ totalKategori }]] = await pool.query('SELECT COUNT(*) AS totalKategori FROM kategori_dokumen');
    const [[{ totalDokumen }]]  = await pool.query('SELECT COUNT(*) AS totalDokumen FROM dokumen');
    
    // Satker aktif
    const [[{ satkerAktif }]] = await pool.query('SELECT COUNT(*) AS satkerAktif FROM users WHERE role_id = 2 AND is_active = 1');
    
    return res.json({
      success: true,
      data: { totalKategori, totalDokumen, satkerAktif }
    });
  } catch (err) { next(err); }
}

// ── GET /api/administrasi/kategori ───────────────────────────────
async function getKategori(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT k.id, k.nama, k.slug, k.deskripsi, k.urutan, k.is_active, k.perlu_nominal,
              COUNT(d.id) AS jumlah_dokumen
       FROM kategori_dokumen k
       LEFT JOIN dokumen d ON d.kategori_id = k.id
       GROUP BY k.id
       ORDER BY k.urutan ASC, k.nama ASC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── POST /api/administrasi/kategori ──────────────────────────────
const createKategoriRules = [
  body('nama').trim().notEmpty().withMessage('Nama kategori wajib diisi'),
  body('deskripsi').optional().trim(),
  body('urutan').optional().isInt({ min: 0 }).withMessage('Urutan harus angka'),
];

async function createKategori(req, res, next) {
  try {
    const { nama, deskripsi, urutan = 0 } = req.body;

    // Buat slug dari nama
    const slug = nama
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/-+/g, '-');

    // Cek duplikat
    const [existing] = await pool.query(
      'SELECT id FROM kategori_dokumen WHERE nama = ? OR slug = ?', [nama, slug]
    );
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Nama kategori sudah ada' });
    }

    const perlu_nominal = req.body.perlu_nominal ? 1 : 0;

    const [result] = await pool.query(
      'INSERT INTO kategori_dokumen (nama, slug, deskripsi, urutan, is_active, perlu_nominal) VALUES (?, ?, ?, ?, 1, ?)',
      [nama, slug, deskripsi || null, Number(urutan), perlu_nominal]
    );

    return res.status(201).json({
      success: true,
      message: 'Kategori berhasil dibuat',
      data: { id: result.insertId, nama, slug },
    });
  } catch (err) { next(err); }
}

// ── PATCH /api/administrasi/kategori/:id ─────────────────────────
const updateKategoriRules = [
  body('nama').optional().trim().notEmpty().withMessage('Nama tidak boleh kosong'),
  body('deskripsi').optional().trim(),
  body('urutan').optional().isInt({ min: 0 }),
];

async function updateKategori(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM kategori_dokumen WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const { nama, deskripsi, urutan, is_active } = req.body;

    // Kalau nama diubah, generate slug baru
    let slug = rows[0].slug;
    if (nama && nama !== rows[0].nama) {
      slug = nama
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '')
        .replace(/-+/g, '-');

      // Cek duplikat nama/slug (kecuali diri sendiri)
      const [dup] = await pool.query(
        'SELECT id FROM kategori_dokumen WHERE (nama = ? OR slug = ?) AND id != ?',
        [nama, slug, id]
      );
      if (dup.length) {
        return res.status(409).json({ success: false, message: 'Nama kategori sudah digunakan' });
      }
    }

    const { perlu_nominal } = req.body;

    await pool.query(
      `UPDATE kategori_dokumen SET
        nama      = COALESCE(?, nama),
        slug      = ?,
        deskripsi = COALESCE(?, deskripsi),
        urutan    = COALESCE(?, urutan),
        is_active = COALESCE(?, is_active),
        perlu_nominal = COALESCE(?, perlu_nominal)
       WHERE id = ?`,
      [
        nama || null,
        slug,
        deskripsi !== undefined ? deskripsi : null,
        urutan !== undefined ? Number(urutan) : null,
        is_active !== undefined ? Number(is_active) : null,
        perlu_nominal !== undefined ? Number(perlu_nominal) : null,
        id,
      ]
    );

    return res.json({ success: true, message: 'Kategori berhasil diupdate' });
  } catch (err) { next(err); }
}

// ── DELETE /api/administrasi/kategori/:id ────────────────────────
async function deleteKategori(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM kategori_dokumen WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    // Cek apakah ada dokumen yang pakai kategori ini
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM dokumen WHERE kategori_id = ?', [id]
    );
    if (total > 0) {
      return res.status(400).json({
        success: false,
        message: `Kategori tidak bisa dihapus karena masih digunakan oleh ${total} dokumen`,
      });
    }

    await pool.query('DELETE FROM kategori_dokumen WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (err) { next(err); }
}

// ── POST /api/administrasi/notifikasi/kirim ─────────────────────────
const kirimNotifikasiRules = [
  body('pesan').trim().notEmpty().withMessage('Pesan wajib diisi'),
  body('target').notEmpty().withMessage('Target wajib dipilih'),
];

async function kirimNotifikasi(req, res, next) {
  try {
    const { target, pesan, judul } = req.body;

    let targets = [];
    if (target === 'all') {
      const [users] = await pool.query('SELECT id FROM users WHERE is_active = 1 AND id != ?', [req.user.id]);
      targets = users.map(u => u.id);
    } else if (target === 'satker') {
      // Sesuai request: kirim ke staff(2) dan pimpinan(1)
      const [users] = await pool.query('SELECT id FROM users WHERE is_active = 1 AND role_id IN (1, 2) AND id != ?', [req.user.id]);
      targets = users.map(u => u.id);
    } else {
      const [users] = await pool.query('SELECT id FROM users WHERE id = ? AND is_active = 1', [Number(target)]);
      if (!users.length) {
        return res.status(404).json({ success: false, message: 'User tujuan tidak ditemukan atau tidak aktif' });
      }
      targets = [users[0].id];
    }

    if (!targets.length) {
      return res.status(400).json({ success: false, message: 'Tidak ada user aktif untuk dikirimi notifikasi' });
    }

    for (const userId of targets) {
      await buatNotifikasi({
        user_id: userId,
        aksi: 'pesan_admin',
        judul: judul || 'Pesan dari Administrasi',
        pesan,
      });
    }

    await catatLog({
      user_id: req.user.id,
      aksi: 'kirim_notifikasi',
      entitas: 'notifikasi',
      detail: { target, jumlah_penerima: targets.length, judul: judul || 'Pesan dari Administrasi' },
      ip: req.ip,
    });

    return res.json({
      success: true,
      message: `Notifikasi terkirim ke ${targets.length} user`,
      data: { jumlah_penerima: targets.length },
    });
  } catch (err) { next(err); }
}

module.exports = {
  getStats,
  getKategori,
  createKategori,
  createKategoriRules,
  updateKategori,
  updateKategoriRules,
  deleteKategori,
  kirimNotifikasi,
  kirimNotifikasiRules,
};
