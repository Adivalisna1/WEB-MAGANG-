const { pool } = require('../config/db');

// ── Helper: buat notifikasi (dipanggil dari controller lain) ──
async function buatNotifikasi({ user_id, aksi, dokumen_id = null, judul = null, pesan }) {
  try {
    await pool.query(
      `INSERT INTO notifikasi (user_id, aksi, dokumen_id, judul, pesan)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, aksi, dokumen_id, judul, pesan]
    );
  } catch (err) {
    // Log error tapi jangan block proses utama
    console.error('[NOTIFIKASI] Gagal membuat notifikasi:', err.message);
  }
}

// ── GET /api/notifikasi ──────────────────────────────────────
async function getNotifikasi(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 20;
    const [rows] = await pool.query(
      `SELECT id, aksi, dokumen_id, judul, pesan, is_read, created_at
       FROM notifikasi
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [req.user.id, limit]
    );

    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── GET /api/notifikasi/unread-count ──────────────────────────
async function getUnreadCount(req, res, next) {
  try {
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifikasi WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    return res.json({ success: true, data: { count } });
  } catch (err) { next(err); }
}

// ── PATCH /api/notifikasi/:id/read ───────────────────────────
async function markAsRead(req, res, next) {
  try {
    await pool.query(
      'UPDATE notifikasi SET is_read = 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    return res.json({ success: true, message: 'Notifikasi ditandai sudah dibaca' });
  } catch (err) { next(err); }
}

// ── PATCH /api/notifikasi/read-all ───────────────────────────
async function markAllAsRead(req, res, next) {
  try {
    await pool.query(
      'UPDATE notifikasi SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    return res.json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca' });
  } catch (err) { next(err); }
}

module.exports = {
  getNotifikasi, getUnreadCount, markAsRead, markAllAsRead,
  buatNotifikasi,
};
