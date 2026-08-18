const { body }  = require('express-validator');
const { pool }  = require('../config/db');

// Helper: generate slug dari nama
function buatSlug(nama) {
  return nama
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-');
}

// ── GET /api/dokumen/divisi (publik — untuk dropdown filter) ──
async function getDivisiPublik(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, nama, slug FROM divisi WHERE is_active = 1 ORDER BY urutan ASC, nama ASC'
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── GET /api/admin/divisi (admin global) ──────────────────────
async function getDivisiAdmin(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT dv.id, dv.nama, dv.slug, dv.urutan, dv.is_active,
              COUNT(DISTINCT d.id)  AS jumlah_dokumen,
              COUNT(DISTINCT u.id)  AS jumlah_user
       FROM divisi dv
       LEFT JOIN dokumen d ON d.divisi_id = dv.id
       LEFT JOIN users u ON u.divisi_id = dv.id
       GROUP BY dv.id
       ORDER BY dv.urutan ASC, dv.nama ASC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── POST /api/admin/divisi ────────────────────────────────────
const createDivisiRules = [
  body('nama').trim().notEmpty().withMessage('Nama divisi wajib diisi'),
  body('urutan').optional().isInt({ min: 0 }).withMessage('Urutan harus angka'),
];

async function createDivisi(req, res, next) {
  try {
    const { nama, urutan = 0 } = req.body;
    const slug = buatSlug(nama);

    const [existing] = await pool.query(
      'SELECT id FROM divisi WHERE nama = ? OR slug = ?', [nama, slug]
    );
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Nama divisi sudah ada' });
    }

    const [result] = await pool.query(
      'INSERT INTO divisi (nama, slug, urutan, is_active) VALUES (?, ?, ?, 1)',
      [nama, slug, Number(urutan)]
    );

    return res.status(201).json({
      success: true,
      message: 'Divisi berhasil dibuat',
      data: { id: result.insertId, nama, slug },
    });
  } catch (err) { next(err); }
}

// ── PATCH /api/admin/divisi/:id ───────────────────────────────
const updateDivisiRules = [
  body('nama').optional().trim().notEmpty().withMessage('Nama tidak boleh kosong'),
  body('urutan').optional().isInt({ min: 0 }),
];

async function updateDivisi(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM divisi WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Divisi tidak ditemukan' });
    }

    const { nama, urutan, is_active } = req.body;

    // Kalau nama diubah, generate slug baru
    let slug = rows[0].slug;
    if (nama && nama !== rows[0].nama) {
      slug = buatSlug(nama);

      const [dup] = await pool.query(
        'SELECT id FROM divisi WHERE (nama = ? OR slug = ?) AND id != ?',
        [nama, slug, id]
      );
      if (dup.length) {
        return res.status(409).json({ success: false, message: 'Nama divisi sudah digunakan' });
      }
    }

    await pool.query(
      `UPDATE divisi SET
        nama      = COALESCE(?, nama),
        slug      = ?,
        urutan    = COALESCE(?, urutan),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        nama || null,
        slug,
        urutan !== undefined ? Number(urutan) : null,
        is_active !== undefined ? Number(is_active) : null,
        id,
      ]
    );

    return res.json({ success: true, message: 'Divisi berhasil diupdate' });
  } catch (err) { next(err); }
}

// ── DELETE /api/admin/divisi/:id ──────────────────────────────
async function deleteDivisi(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM divisi WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Divisi tidak ditemukan' });
    }

    // Tidak boleh hapus divisi yang masih dipakai dokumen atau user
    const [[{ totalDokumen }]] = await pool.query(
      'SELECT COUNT(*) AS totalDokumen FROM dokumen WHERE divisi_id = ?', [id]
    );
    const [[{ totalUser }]] = await pool.query(
      'SELECT COUNT(*) AS totalUser FROM users WHERE divisi_id = ?', [id]
    );
    if (totalDokumen > 0 || totalUser > 0) {
      return res.status(400).json({
        success: false,
        message: `Divisi tidak bisa dihapus karena masih digunakan oleh ${totalDokumen} dokumen dan ${totalUser} user`,
      });
    }

    await pool.query('DELETE FROM divisi WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Divisi berhasil dihapus' });
  } catch (err) { next(err); }
}

module.exports = {
  getDivisiPublik, getDivisiAdmin,
  createDivisi, createDivisiRules,
  updateDivisi, updateDivisiRules,
  deleteDivisi,
};
