const bcrypt   = require('bcrypt');
const { body } = require('express-validator');
const { pool } = require('../config/db');

// ── GET /api/user/profile ─────────────────────────────────────
async function getProfile(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nama, u.username, u.email, u.foto_profil,
              u.last_login, u.created_at, r.nama AS role
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [req.user.id]
    );
    return res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
}

// ── PATCH /api/user/profile ───────────────────────────────────
const updateProfileRules = [
  body('nama').optional().trim().notEmpty().withMessage('Nama tidak boleh kosong'),
  body('email').optional().isEmail().withMessage('Format email tidak valid'),
];

async function updateProfile(req, res, next) {
  try {
    const { nama, email } = req.body;

    if (email) {
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]
      );
      if (existing.length) {
        return res.status(409).json({ success: false, message: 'Email sudah digunakan akun lain' });
      }
    }

    await pool.query(
      `UPDATE users SET
         nama  = COALESCE(?, nama),
         email = COALESCE(?, email)
       WHERE id = ?`,
      [nama || null, email || null, req.user.id]
    );

    return res.json({ success: true, message: 'Profil berhasil diupdate' });
  } catch (err) { next(err); }
}

// ── PATCH /api/user/password ──────────────────────────────────
const changePasswordRules = [
  body('password_lama').notEmpty().withMessage('Password lama wajib diisi'),
  body('password_baru').isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter'),
];

async function changePassword(req, res, next) {
  try {
    const { password_lama, password_baru } = req.body;

    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const match  = await bcrypt.compare(password_lama, rows[0].password_hash);

    if (!match) {
      return res.status(400).json({ success: false, message: 'Password lama tidak sesuai' });
    }

    const hash = await bcrypt.hash(password_baru, 12);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);

    // Logout semua session lain
    await pool.query(
      'UPDATE user_sessions SET is_online = 0, logout_at = NOW() WHERE user_id = ?',
      [req.user.id]
    );

    return res.json({ success: true, message: 'Password berhasil diubah, silakan login ulang' });
  } catch (err) { next(err); }
}

module.exports = { getProfile, updateProfile, updateProfileRules, changePassword, changePasswordRules };
