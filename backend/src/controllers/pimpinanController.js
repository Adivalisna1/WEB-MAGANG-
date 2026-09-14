const bcrypt    = require('bcrypt');
const { body }  = require('express-validator');
const { pool }  = require('../config/db');
const { catatLog } = require('./authController');

// Kategori Master Data dipindahkan ke administrasiController.js

// ── GET /api/pimpinan/users ──────────────────────────────────────
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
       WHERE u.role_id NOT IN (3, 4) -- Sembunyikan Eselon 1 dan Admin IT dari Pimpinan
       ORDER BY u.created_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── GET /api/pimpinan/users/online — realtime monitoring ─────────
async function getOnlineUsers(req, res, next) {
  try {
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
       WHERE s.is_online = 1 AND u.role_id NOT IN (3, 4)
       ORDER BY s.last_active_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// (Create User dipindah ke Admin IT)

// ── PATCH /api/pimpinan/users/:id/toggle — aktif/nonaktif ────────
async function toggleUserActive(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, role_id, is_active FROM users WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak bisa menonaktifkan akun sendiri' });
    }

    // Pimpinan hanya boleh nonaktifkan Staff (role_id = 2)
    if (rows[0].role_id !== 2) {
      return res.status(403).json({ success: false, message: 'Pimpinan hanya dapat mengelola akun Staff (Satker)' });
    }

    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);

    await catatLog({
      user_id: req.user.id,
      aksi: newStatus ? 'aktifkan_user' : 'nonaktifkan_user',
      entitas: 'user',
      entitas_id: Number(req.params.id),
      detail: { is_active: newStatus },
      ip: req.ip,
    });

    return res.json({
      success: true,
      message: newStatus ? 'User diaktifkan' : 'User dinonaktifkan',
      data: { id: Number(req.params.id), is_active: newStatus },
    });
  } catch (err) { next(err); }
}

// ── GET /api/pimpinan/logs ───────────────────────────────────────
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

// (Delete User dipindah ke Admin IT)

// ── DELETE /api/pimpinan/logs ────────────────────────────────────
async function clearLogs(req, res, next) {
  try {
    // Hanya role admin (role_id=1) yang bisa hapus log
    if (req.user.role_id !== 1) {
      return res.status(403).json({ success: false, message: 'Akses ditolak, hanya admin yang bisa hapus log' });
    }

    const { before_days } = req.query;
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

// ── PATCH /api/pimpinan/users/:id/password — reset password user ──
async function resetUserPassword(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { password_baru } = req.body;

    if (!password_baru || password_baru.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter' });
    }

    // Cek user ada
    const [rows] = await pool.query('SELECT id, nama, username, role_id FROM users WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Pimpinan hanya boleh reset password Staff (role_id = 2)
    if (rows[0].role_id !== 2) {
      return res.status(403).json({ success: false, message: 'Pimpinan hanya dapat mereset password akun Staff (Satker)' });
    }

    // Admin tidak bisa reset password diri sendiri via fitur ini
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Gunakan fitur ganti password untuk akun sendiri' });
    }

    const hash = await bcrypt.hash(password_baru, 12);
    await pool.query('UPDATE users SET password_hash = ?, password_reset_at = NOW() WHERE id = ?', [hash, id]);

    // Logout semua session user yang di-reset
    await pool.query(
      'UPDATE user_sessions SET is_online = 0, logout_at = NOW() WHERE user_id = ?',
      [id]
    );

    await catatLog({
      user_id: req.user.id,
      aksi: 'reset_password_user',
      entitas: 'user',
      entitas_id: id,
      detail: { target_nama: rows[0].nama, target_username: rows[0].username },
      ip: req.ip,
    });

    return res.json({ success: true, message: `Password ${rows[0].nama} berhasil direset` });
  } catch (err) { next(err); }
}

async function getStats(req, res, next) {
  try {
    await pool.query(
      `UPDATE user_sessions
       SET is_online = 0, logout_at = NOW()
       WHERE is_online = 1
         AND last_active_at < NOW() - INTERVAL 15 MINUTE`
    );

    const [[{ totalDokumen }]]  = await pool.query(`SELECT COUNT(*) AS totalDokumen FROM dokumen`);
    const [[{ terverifikasi }]] = await pool.query(`SELECT COUNT(*) AS terverifikasi FROM dokumen WHERE status = "terverifikasi"`);
    const [[{ menunggu }]]      = await pool.query(`SELECT COUNT(*) AS menunggu FROM dokumen WHERE status = "menunggu_verifikasi"`);
    const [[{ lolosAdmin }]]    = await pool.query(`SELECT COUNT(*) AS lolosAdmin FROM dokumen WHERE status = "lolos_admin"`);
    const [[{ totalUser }]]     = await pool.query('SELECT COUNT(*) AS totalUser FROM users WHERE role_id = 2');
    const [[{ totalDownload }]] = await pool.query(`SELECT COALESCE(SUM(download_count), 0) AS totalDownload FROM dokumen`);
    const [[{ onlineNow }]]     = await pool.query('SELECT COUNT(*) AS onlineNow FROM user_sessions WHERE is_online = 1');

    return res.json({
      success: true,
      data: { totalDokumen, terverifikasi, menunggu, lolosAdmin, totalUser, totalDownload, onlineNow },
    });
  } catch (err) { next(err); }
}

module.exports = {
  getUsers, getOnlineUsers, toggleUserActive, clearLogs, getLogs, getStats,
  resetUserPassword
};
