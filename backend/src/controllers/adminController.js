const bcrypt    = require('bcrypt');
const { body }  = require('express-validator');
const { pool }  = require('../config/db');

// ── GET /api/admin/kategori ───────────────────────────────────
async function getKategoriAdmin(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT k.id, k.nama, k.slug, k.deskripsi, k.urutan, k.is_active,
              COUNT(d.id) AS jumlah_dokumen
       FROM kategori_dokumen k
       LEFT JOIN dokumen d ON d.kategori_id = k.id
       GROUP BY k.id
       ORDER BY k.urutan ASC, k.nama ASC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── POST /api/admin/kategori ──────────────────────────────────
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

    const [result] = await pool.query(
      'INSERT INTO kategori_dokumen (nama, slug, deskripsi, urutan) VALUES (?, ?, ?, ?)',
      [nama, slug, deskripsi || null, Number(urutan)]
    );

    return res.status(201).json({
      success: true,
      message: 'Kategori berhasil dibuat',
      data: { id: result.insertId, nama, slug },
    });
  } catch (err) { next(err); }
}

// ── PATCH /api/admin/kategori/:id ────────────────────────────
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

    await pool.query(
      `UPDATE kategori_dokumen SET
        nama      = COALESCE(?, nama),
        slug      = ?,
        deskripsi = COALESCE(?, deskripsi),
        urutan    = COALESCE(?, urutan),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        nama || null,
        slug,
        deskripsi !== undefined ? deskripsi : null,
        urutan !== undefined ? Number(urutan) : null,
        is_active !== undefined ? Number(is_active) : null,
        id,
      ]
    );

    return res.json({ success: true, message: 'Kategori berhasil diupdate' });
  } catch (err) { next(err); }
}

// ── DELETE /api/admin/kategori/:id ───────────────────────────
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

// ── GET /api/admin/users ──────────────────────────────────────
async function getUsers(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nama, u.username, u.email, u.is_active,
              u.last_login, u.created_at, r.nama AS role,
              (SELECT is_online FROM user_sessions s
               WHERE s.user_id = u.id AND s.is_online = 1
               ORDER BY s.last_active_at DESC LIMIT 1) AS is_online
       FROM users u
       JOIN roles r ON r.id = u.role_id
       ORDER BY u.created_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── GET /api/admin/users/online — realtime monitoring ─────────
async function getOnlineUsers(req, res, next) {
  try {
    // Tandai session yang sudah tidak aktif lebih dari 15 menit sebagai offline
    await pool.query(
      `UPDATE user_sessions 
       SET is_online = 0, logout_at = NOW()
       WHERE is_online = 1 
         AND last_active_at < NOW() - INTERVAL 15 MINUTE`
    );

    const [rows] = await pool.query(
      `SELECT u.id, u.nama, u.username, r.nama AS role,
              s.ip_address, s.last_active_at, s.login_at
       FROM user_sessions s
       JOIN users u ON u.id = s.user_id
       JOIN roles r ON r.id = u.role_id
       WHERE s.is_online = 1
       ORDER BY s.last_active_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── POST /api/admin/users ─────────────────────────────────────
const createUserRules = [
  body('nama').trim().notEmpty().withMessage('Nama wajib diisi'),
  body('username').trim().notEmpty().isLength({ min: 3 }).withMessage('Username minimal 3 karakter'),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('role_id').isIn(['1', '2', 1, 2]).withMessage('Role tidak valid'),
];

async function createUser(req, res, next) {
  try {
    const { nama, username, email, password, role_id } = req.body;

    // Cek duplikat
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?', [username, email]
    );
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Username atau email sudah digunakan' });
    }

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (role_id, nama, username, email, password_hash) VALUES (?, ?, ?, ?, ?)',
      [role_id, nama, username, email, hash]
    );

    return res.status(201).json({
      success: true,
      message: 'User berhasil dibuat',
      data: { id: result.insertId },
    });
  } catch (err) { next(err); }
}

// ── PATCH /api/admin/users/:id/toggle — aktif/nonaktif ────────
async function toggleUserActive(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, is_active FROM users WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Admin tidak bisa nonaktifkan diri sendiri
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak bisa menonaktifkan akun sendiri' });
    }

    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);

    return res.json({
      success: true,
      message: newStatus ? 'User diaktifkan' : 'User dinonaktifkan',
      data: { id: Number(req.params.id), is_active: newStatus },
    });
  } catch (err) { next(err); }
}

// ── GET /api/admin/logs ───────────────────────────────────────
async function getLogs(req, res, next) {
  try {
    const { user_id, aksi, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = '1=1';
    const params = [];
    if (user_id) { where += ' AND l.user_id = ?'; params.push(user_id); }
    if (aksi)    { where += ' AND l.aksi = ?';    params.push(aksi); }

    const [rows] = await pool.query(
      `SELECT l.id, l.aksi, l.entitas, l.entitas_id, l.detail,
              l.ip_address, l.created_at, u.nama AS user_nama, u.username
       FROM aktivitas_log l
       LEFT JOIN users u ON u.id = l.user_id
       WHERE ${where}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM aktivitas_log l WHERE ${where}`, params
    );

    return res.json({
      success: true,
      data: rows,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
}

// ── DELETE /api/admin/users/:id ──────────────────────────────
async function deleteUser(req, res, next) {
  try {
    const id = Number(req.params.id);

    // Admin tidak bisa hapus diri sendiri
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri' });
    }

    const [rows] = await pool.query('SELECT id, role_id FROM users WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Hapus session, log, lalu user (urutan penting karena FK)
    await pool.query('DELETE FROM user_sessions WHERE user_id = ?', [id]);
    await pool.query('UPDATE aktivitas_log SET user_id = NULL WHERE user_id = ?', [id]);
    await pool.query('UPDATE dokumen SET uploaded_by = 1 WHERE uploaded_by = ?', [id]); // pindah ke admin
    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    return res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (err) { next(err); }
}

// ── DELETE /api/admin/logs ────────────────────────────────────
async function clearLogs(req, res, next) {
  try {
    const { before_days } = req.query;
    // Default hapus log lebih dari 30 hari, atau semua kalau before_days=0
    const days = before_days !== undefined ? Number(before_days) : 30;

    if (days === 0) {
      await pool.query('DELETE FROM aktivitas_log');
    } else {
      await pool.query(
        'DELETE FROM aktivitas_log WHERE created_at < NOW() - INTERVAL ? DAY',
        [days]
      );
    }

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM aktivitas_log');
    return res.json({ success: true, message: `Riwayat berhasil dihapus`, data: { remaining: total } });
  } catch (err) { next(err); }
}
async function getStats(req, res, next) {
  try {
    const [[{ totalDokumen }]]    = await pool.query('SELECT COUNT(*) AS totalDokumen FROM dokumen');
    const [[{ terverifikasi }]]   = await pool.query('SELECT COUNT(*) AS terverifikasi FROM dokumen WHERE status = "terverifikasi"');
    const [[{ menunggu }]]        = await pool.query('SELECT COUNT(*) AS menunggu FROM dokumen WHERE status = "menunggu_verifikasi"');
    const [[{ totalUser }]]       = await pool.query('SELECT COUNT(*) AS totalUser FROM users WHERE role_id = 2');
    const [[{ totalDownload }]]   = await pool.query('SELECT SUM(download_count) AS totalDownload FROM dokumen');
    const [[{ onlineNow }]]       = await pool.query(
      `SELECT COUNT(*) AS onlineNow FROM user_sessions
       WHERE is_online = 1`
    );

    return res.json({
      success: true,
      data: { totalDokumen, terverifikasi, menunggu, totalUser, totalDownload: totalDownload || 0, onlineNow },
    });
  } catch (err) { next(err); }
}

module.exports = {
  getUsers, getOnlineUsers, createUser, createUserRules, toggleUserActive, deleteUser, clearLogs, getLogs, getStats,
  getKategoriAdmin, createKategori, createKategoriRules, updateKategori, updateKategoriRules, deleteKategori,
};
