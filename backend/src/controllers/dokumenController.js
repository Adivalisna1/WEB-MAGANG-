const path   = require('path');
const fs     = require('fs');
const { body, param, query } = require('express-validator');
const { pool } = require('../config/db');
const { catatLog } = require('./authController');
const { buatNotifikasi } = require('./notifikasiController');

// ── Validation rules ──────────────────────────────────────────
const uploadRules = [
  body('judul').trim().notEmpty().withMessage('Judul wajib diisi'),
  body('tahun').isInt({ min: 2000, max: 2100 }).withMessage('Tahun tidak valid'),
  body('bulan').optional({ nullable: true }).isInt({ min: 1, max: 12 }).withMessage('Bulan tidak valid (1-12)'),
  body('kategori_id').isInt({ min: 1 }).withMessage('Kategori wajib dipilih'),
  body('divisi_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Divisi tidak valid'),
  body('deskripsi').optional().trim(),
];

const editRules = [
  param('id').isInt({ min: 1 }),
  body('judul').optional().trim().notEmpty().withMessage('Judul tidak boleh kosong'),
  body('tahun').optional().isInt({ min: 2000, max: 2100 }),
  body('bulan').optional({ nullable: true }).isInt({ min: 1, max: 12 }).withMessage('Bulan tidak valid (1-12)'),
  body('kategori_id').optional().isInt({ min: 1 }),
  body('divisi_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Divisi tidak valid'),
  body('deskripsi').optional().trim(),
];

// ── GET /api/dokumen (publik) ─────────────────────────────────
async function getDokumenPublik(req, res, next) {
  try {
    const { kategori, tahun, divisi, q, page = 1, limit = 12 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = 'd.status = "terverifikasi" AND d.is_public = 1';
    const params = [];

    if (kategori) { where += ' AND k.slug = ?';  params.push(kategori); }
    if (tahun)    { where += ' AND d.tahun = ?';  params.push(tahun); }
    if (divisi)   { where += ' AND dv.slug = ?';  params.push(divisi); }
    if (q)        {
      // Escape wildcard SQL LIKE agar %, _, dan \ dari user jadi literal
      const escaped = q.replace(/[%_\\]/g, '\\$&');
      where += ' AND d.judul LIKE ?';
      params.push(`%${escaped}%`);
    }

    const [rows] = await pool.query(
      `SELECT d.id, d.judul, d.deskripsi, d.tahun, d.bulan, d.file_nama,
              d.file_size, d.file_mime, d.download_count,
              d.created_at, k.nama AS kategori, k.slug AS kategori_slug,
              dv.nama AS divisi, dv.slug AS divisi_slug
       FROM dokumen d
       JOIN kategori_dokumen k ON k.id = d.kategori_id
       LEFT JOIN divisi dv ON dv.id = d.divisi_id
       WHERE ${where}
       ORDER BY d.tahun DESC, d.bulan DESC, d.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM dokumen d
       JOIN kategori_dokumen k ON k.id = d.kategori_id
       LEFT JOIN divisi dv ON dv.id = d.divisi_id
       WHERE ${where}`,
      params
    );

    return res.json({
      success: true,
      data: rows,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
}

// ── GET /api/dokumen/:id (publik — detail) ────────────────────
async function getDokumenDetail(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT d.id, d.judul, d.deskripsi, d.tahun, d.bulan, d.file_nama,
              d.file_size, d.file_mime, d.download_count, d.created_at,
              k.nama AS kategori, k.slug AS kategori_slug,
              dv.nama AS divisi, dv.slug AS divisi_slug
       FROM dokumen d
       JOIN kategori_dokumen k ON k.id = d.kategori_id
       LEFT JOIN divisi dv ON dv.id = d.divisi_id
       WHERE d.id = ? AND d.status = 'terverifikasi' AND d.is_public = 1`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
}

// ── GET /api/dokumen/:id/download (publik) ────────────────────
async function downloadDokumen(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, judul, file_nama, file_path, file_mime, status, is_public
       FROM dokumen WHERE id = ?`,
      [req.params.id]
    );

    if (!rows.length || rows[0].status !== 'terverifikasi' || !rows[0].is_public) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }

    const dok = rows[0];
    const filePath = dok.file_path; // path di container: /app/uploads/...

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File tidak ditemukan di server' });
    }

    // Increment download count
    await pool.query('UPDATE dokumen SET download_count = download_count + 1 WHERE id = ?', [dok.id]);

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(dok.file_nama)}"`);
    res.setHeader('Content-Type', dok.file_mime || 'application/octet-stream');
    return res.sendFile(filePath);
  } catch (err) { next(err); }
}

// ── GET /api/dokumen/all (staff + admin) ──────────────────────
async function getAllDokumen(req, res, next) {
  try {
    const { status, kategori, tahun, divisi, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = '1=1';
    const params = [];

    // Staff hanya lihat dokumennya sendiri
    if (req.user.role_id === 2) {
      where += ' AND d.uploaded_by = ?';
      params.push(req.user.id);
    }

    // Admin dept hanya lihat dokumen divisinya sendiri
    if (req.user.role_id === 4) {
      where += ' AND d.divisi_id = ?';
      params.push(req.user.divisi_id);
    }

    if (status)   { where += ' AND d.status = ?';    params.push(status); }
    if (kategori) { where += ' AND k.slug = ?';      params.push(kategori); }
    if (tahun)    { where += ' AND d.tahun = ?';     params.push(tahun); }
    if (divisi)   { where += ' AND dv.slug = ?';     params.push(divisi); }

    const [rows] = await pool.query(
      `SELECT d.id, d.judul, d.tahun, d.bulan, d.status, d.file_nama, d.file_size,
              d.download_count, d.is_public, d.created_at, d.updated_at,
              k.nama AS kategori, u.nama AS uploaded_by,
              dv.nama AS divisi, dv.slug AS divisi_slug
       FROM dokumen d
       JOIN kategori_dokumen k ON k.id = d.kategori_id
       JOIN users u ON u.id = d.uploaded_by
       LEFT JOIN divisi dv ON dv.id = d.divisi_id
       WHERE ${where}
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM dokumen d
       JOIN kategori_dokumen k ON k.id = d.kategori_id
       LEFT JOIN divisi dv ON dv.id = d.divisi_id
       WHERE ${where}`,
      params
    );

    return res.json({
      success: true,
      data: rows,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
}

// ── POST /api/dokumen/upload (staff) ─────────────────────────
async function uploadDokumen(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File wajib diupload' });
    }

    const { judul, tahun, kategori_id, deskripsi } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Divisi otomatis dari divisi uploader; admin global wajib pilih manual
    const divisiId = req.user.divisi_id
      ? Number(req.user.divisi_id)
      : (req.body.divisi_id ? Number(req.body.divisi_id) : null);

    if (!divisiId) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'Divisi wajib dipilih' });
    }

    // ── Validasi duplikat: cek judul + kategori + tahun ──────
    const [duplikat] = await pool.query(
      `SELECT id, status FROM dokumen
       WHERE LOWER(judul) = LOWER(?)
         AND kategori_id = ?
         AND tahun = ?
         AND status NOT IN ('diarsipkan')`,
      [judul.trim(), kategori_id, tahun]
    );

    if (duplikat.length > 0) {
      // Hapus file yang sudah terlanjur diupload
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      const statusAda = duplikat[0].status.replace(/_/g, ' ');
      return res.status(409).json({
        success: false,
        message: `Dokumen dengan judul, kategori, dan tahun yang sama sudah ada (status: ${statusAda}). Gunakan judul berbeda atau hapus dokumen lama terlebih dahulu.`,
      });
    }

    const { bulan } = req.body;

    const [result] = await pool.query(
      `INSERT INTO dokumen
         (kategori_id, divisi_id, uploaded_by, judul, deskripsi, tahun, bulan,
          file_nama, file_path, file_size, file_mime, status, is_public)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 0)`,
      [kategori_id, divisiId, req.user.id, judul, deskripsi || null,
       tahun, bulan ? Number(bulan) : null,
       fileName, filePath, req.file.size, req.file.mimetype]
    );

    // Catat log upload
    await catatLog({
      user_id: req.user.id,
      aksi: 'upload',
      entitas: 'dokumen',
      entitas_id: result.insertId,
      detail: { judul, tahun, kategori_id, file_nama: fileName },
      ip: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Dokumen berhasil diupload, status: draft',
      data: { id: result.insertId },
    });
  } catch (err) { next(err); }
}

// ── PATCH /api/dokumen/:id (staff — edit metadata) ────────────
async function editDokumen(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM dokumen WHERE id = ?', [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }

    const dok = rows[0];

    // Guard admin_dept: hanya dokumen divisinya sendiri
    if (req.user.role_id === 4 && dok.divisi_id !== req.user.divisi_id) {
      return res.status(403).json({ success: false, message: 'Dokumen ini milik divisi lain' });
    }

    // Staff hanya bisa edit miliknya sendiri dan hanya saat draft
    if (req.user.role_id === 2 && dok.uploaded_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bukan dokumen Anda' });
    }
    if (dok.status !== 'draft' && dok.status !== 'ditolak' && dok.status !== 'revisi') {
      return res.status(400).json({ success: false, message: 'Hanya dokumen draft atau revisi yang bisa diedit' });
    }

    const { judul, tahun, bulan, kategori_id, deskripsi } = req.body;

    // ── Validasi duplikat saat edit (kalau judul/tahun/kategori berubah) ──
    const judulFinal    = judul       || dok.judul;
    const tahunFinal    = tahun       || dok.tahun;
    const kategoriFinal = kategori_id || dok.kategori_id;

    const [duplikat] = await pool.query(
      `SELECT id FROM dokumen
       WHERE LOWER(judul) = LOWER(?)
         AND kategori_id  = ?
         AND tahun        = ?
         AND id           != ?
         AND status NOT IN ('diarsipkan')`,
      [judulFinal.toString().trim(), kategoriFinal, tahunFinal, id]
    );

    if (duplikat.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Dokumen dengan judul, kategori, dan tahun yang sama sudah ada. Gunakan judul atau tahun yang berbeda.',
      });
    }

    await pool.query(
      `UPDATE dokumen SET
         judul       = COALESCE(?, judul),
         tahun       = COALESCE(?, tahun),
         bulan       = CASE WHEN ? IS NOT NULL THEN ? ELSE bulan END,
         kategori_id = COALESCE(?, kategori_id),
         deskripsi   = COALESCE(?, deskripsi)
       WHERE id = ?`,
      [judul || null, tahun || null,
       bulan !== undefined ? Number(bulan) : null, bulan !== undefined ? Number(bulan) : null,
       kategori_id || null, deskripsi || null, id]
    );

    // Hanya admin global yang boleh memindahkan dokumen ke divisi lain
    if (req.user.role_id === 1 && req.body.divisi_id !== undefined) {
      await pool.query(
        'UPDATE dokumen SET divisi_id = ? WHERE id = ?',
        [req.body.divisi_id ? Number(req.body.divisi_id) : null, id]
      );
    }

    return res.json({ success: true, message: 'Dokumen berhasil diupdate', data: { id: Number(id) } });
  } catch (err) { next(err); }
}

// ── PATCH /api/dokumen/:id/submit (staff — ajukan verifikasi) ─
async function submitVerifikasi(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM dokumen WHERE id = ? AND uploaded_by = ?',
      [req.params.id, req.user.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }
    if (rows[0].status !== 'draft' && rows[0].status !== 'revisi') {
      return res.status(400).json({ success: false, message: 'Hanya dokumen draft atau revisi yang bisa diajukan' });
    }

    await pool.query(
      "UPDATE dokumen SET status = 'menunggu_verifikasi' WHERE id = ?",
      [req.params.id]
    );

    // Notifikasi ke semua admin: ada dokumen baru yang diajukan
    try {
      const [admins] = await pool.query(
        'SELECT id FROM users WHERE role_id = 1 AND is_active = 1'
      );
      const [staffInfo] = await pool.query(
        'SELECT nama FROM users WHERE id = ?', [req.user.id]
      );
      const staffNama = staffInfo[0]?.nama || 'Staff';
      const judulDok = rows[0].judul;

      for (const admin of admins) {
        await buatNotifikasi({
          user_id: admin.id,
          aksi: 'submit',
          dokumen_id: Number(req.params.id),
          judul: judulDok,
          pesan: `${staffNama} mengajukan dokumen "${judulDok}" untuk diverifikasi`,
        });
      }
    } catch (notifErr) {
      console.error('[NOTIFIKASI] Gagal kirim notifikasi submit:', notifErr.message);
    }

    return res.json({ success: true, message: 'Dokumen diajukan untuk verifikasi', data: { id: Number(req.params.id) } });
  } catch (err) { next(err); }
}

// ── PATCH /api/dokumen/:id/verify (admin) ────────────────────
async function verifikasiDokumen(req, res, next) {
  try {
    const { aksi, catatan } = req.body; // aksi: 'approve' | 'reject'
    if (!['approve', 'reject'].includes(aksi)) {
      return res.status(400).json({ success: false, message: 'Aksi harus approve atau reject' });
    }

    const [rows] = await pool.query('SELECT * FROM dokumen WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }

    // Guard admin_dept: hanya dokumen divisinya sendiri
    if (req.user.role_id === 4 && rows[0].divisi_id !== req.user.divisi_id) {
      return res.status(403).json({ success: false, message: 'Dokumen ini milik divisi lain' });
    }

    if (rows[0].status !== 'menunggu_verifikasi') {
      return res.status(400).json({ success: false, message: 'Dokumen tidak dalam antrian verifikasi' });
    }

    const newStatus = aksi === 'approve' ? 'terverifikasi' : 'revisi';
    const isPublic  = aksi === 'approve' ? 1 : 0;

    await pool.query(
      `UPDATE dokumen SET status = ?, is_public = ?, catatan = ?,
       verified_by = ?, verified_at = NOW() WHERE id = ?`,
      [newStatus, isPublic, catatan || null, req.user.id, req.params.id]
    );

    // Catat log verifikasi
    await catatLog({
      user_id: req.user.id,
      aksi: aksi === 'approve' ? 'verifikasi_setuju' : 'verifikasi_revisi',
      entitas: 'dokumen',
      entitas_id: Number(req.params.id),
      detail: { aksi, catatan: catatan || null, status_baru: newStatus },
      ip: req.ip,
    });

    // Notifikasi ke staff yang upload
    try {
      const judulDok = rows[0].judul;
      const uploaderId = rows[0].uploaded_by;
      const notifAksi = aksi === 'approve' ? 'approve' : 'reject';
      const pesan = aksi === 'approve'
        ? `Dokumen "${judulDok}" telah disetujui`
        : `Dokumen "${judulDok}" perlu revisi${catatan ? `: ${catatan}` : ''}`;

      await buatNotifikasi({
        user_id: uploaderId,
        aksi: notifAksi,
        dokumen_id: Number(req.params.id),
        judul: judulDok,
        pesan,
      });
    } catch (notifErr) {
      console.error('[NOTIFIKASI] Gagal kirim notifikasi verifikasi:', notifErr.message);
    }

    return res.json({
      success: true,
      message: aksi === 'approve' ? 'Dokumen disetujui dan dipublikasikan' : 'Dokumen dikembalikan untuk revisi',
      data: { id: Number(req.params.id) },
    });
  } catch (err) { next(err); }
}

// ── DELETE /api/dokumen/:id (admin) ───────────────────────────
async function deleteDokumen(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM dokumen WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }

    // Guard admin dept: hanya dokumen divisinya sendiri
    if (req.user.role_id === 4 && rows[0].divisi_id !== req.user.divisi_id) {
      return res.status(403).json({ success: false, message: 'Dokumen ini milik divisi lain' });
    }

    // Hapus file fisik
    const filePath = rows[0].file_path;
    const judulDok = rows[0].judul;
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM dokumen WHERE id = ?', [req.params.id]);

    // Catat log hapus
    await catatLog({
      user_id: req.user.id,
      aksi: 'hapus_dokumen',
      entitas: 'dokumen',
      entitas_id: Number(req.params.id),
      detail: { judul: judulDok },
      ip: req.ip,
    });

    return res.json({ success: true, message: 'Dokumen berhasil dihapus' });
  } catch (err) { next(err); }
}

// ── GET /api/dokumen/stats (publik) ───────────────────────────
// Statistik akurat dari seluruh database, bukan dari paginasi
async function getStatsPublik(req, res, next) {
  try {
    const [[{ totalDokumen }]]   = await pool.query(
      'SELECT COUNT(*) AS totalDokumen FROM dokumen WHERE status = "terverifikasi" AND is_public = 1'
    );
    const [[{ totalKategori }]]  = await pool.query(
      'SELECT COUNT(*) AS totalKategori FROM kategori_dokumen WHERE is_active = 1'
    );
    const [[{ totalDownload }]]  = await pool.query(
      'SELECT COALESCE(SUM(download_count), 0) AS totalDownload FROM dokumen WHERE status = "terverifikasi" AND is_public = 1'
    );

    return res.json({
      success: true,
      data: { totalDokumen, totalKategori, totalDownload },
    });
  } catch (err) { next(err); }
}

// ── GET /api/dokumen/kategori (publik) ────────────────────────
async function getKategori(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, nama, slug, deskripsi FROM kategori_dokumen WHERE is_active = 1 ORDER BY urutan ASC'
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── PATCH /api/dokumen/:id/file (staff — ganti file saat revisi) ──
async function gantiFileDokumen(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM dokumen WHERE id = ?', [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }

    const dok = rows[0];

    // Guard admin_dept: hanya dokumen divisinya sendiri
    if (req.user.role_id === 4 && dok.divisi_id !== req.user.divisi_id) {
      return res.status(403).json({ success: false, message: 'Dokumen ini milik divisi lain' });
    }

    // Hanya bisa ganti file saat status revisi atau draft
    if (dok.status !== 'revisi' && dok.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'File hanya bisa diganti saat status draft atau revisi' });
    }

    // Staff hanya bisa ganti file miliknya sendiri
    if (req.user.role_id === 2 && dok.uploaded_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bukan dokumen Anda' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File baru wajib diupload' });
    }

    // Hapus file lama kalau ada
    if (dok.file_path && fs.existsSync(dok.file_path)) {
      fs.unlinkSync(dok.file_path);
    }

    // Update record dengan file baru
    await pool.query(
      `UPDATE dokumen SET
        file_nama = ?,
        file_path = ?,
        file_size = ?,
        file_mime = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [req.file.originalname, req.file.path, req.file.size, req.file.mimetype, id]
    );

    return res.json({
      success: true,
      message: 'File berhasil diganti',
      data: { id: Number(id), file_nama: req.file.originalname },
    });
  } catch (err) { next(err); }
}

// ── GET /api/dokumen/:id/preview (admin only) ─────────────────
// Serve file langsung tanpa increment download_count
// Admin bisa preview semua status dokumen
async function previewDokumen(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, judul, divisi_id, file_nama, file_path, file_mime FROM dokumen WHERE id = ?',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }

    const dok = rows[0];

    // Guard admin_dept: hanya dokumen divisinya sendiri
    if (req.user.role_id === 4 && dok.divisi_id !== req.user.divisi_id) {
      return res.status(403).json({ success: false, message: 'Dokumen ini milik divisi lain' });
    }

    if (!fs.existsSync(dok.file_path)) {
      return res.status(404).json({ success: false, message: 'File tidak ditemukan di server' });
    }

    // Hapus header keamanan yang menghalangi iframe cross-origin
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Type-Options');

    // Header untuk inline display di iframe/tab
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(dok.file_nama)}"`);
    res.setHeader('Content-Type', dok.file_mime || 'application/octet-stream');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    return res.sendFile(dok.file_path);
  } catch (err) { next(err); }
}

module.exports = {
  getDokumenPublik, getDokumenDetail, downloadDokumen, getAllDokumen,
  uploadDokumen, editDokumen, submitVerifikasi, gantiFileDokumen,
  verifikasiDokumen, deleteDokumen, getKategori,
  previewDokumen, getStatsPublik,
  uploadRules, editRules,
};
