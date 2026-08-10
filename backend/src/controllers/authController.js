const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { body } = require('express-validator');
const { pool } = require('../config/db');

// ── Validation rules ──────────────────────────────────────────
const loginRules = [
  body('username').trim().notEmpty().withMessage('Username wajib diisi'),
  body('password').notEmpty().withMessage('Password wajib diisi'),
];

// ── POST /api/auth/login ──────────────────────────────────────
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      `SELECT u.id, u.role_id, u.nama, u.username, u.email,
              u.password_hash, u.is_active, r.nama AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.username = ? OR u.email = ?
       LIMIT 1`,
      [username, username]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Akun tidak aktif, hubungi admin' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    // Tutup semua session lama user ini sebelum buat yang baru
    await pool.query(
      'UPDATE user_sessions SET is_online = 0, logout_at = NOW() WHERE user_id = ? AND is_online = 1',
      [user.id]
    );

    // Buat session ID unik
    const sessionId = require('crypto').randomBytes(32).toString('hex');

    // Simpan session baru ke DB
    await pool.query(
      `INSERT INTO user_sessions (id, user_id, ip_address, user_agent, is_online)
       VALUES (?, ?, ?, ?, 1)`,
      [sessionId, user.id, req.ip, req.headers['user-agent'] || null]
    );

    // Update last_login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, sessionId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id:       user.id,
          nama:     user.nama,
          username: user.username,
          email:    user.email,
          role:     user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/logout ─────────────────────────────────────
async function logout(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await pool.query(
          'UPDATE user_sessions SET is_online = 0, logout_at = NOW() WHERE id = ?',
          [decoded.sessionId]
        );
      } catch (_) { /* token expired — tetap lanjut logout */ }
    }
    return res.json({ success: true, message: 'Logout berhasil' });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────
async function me(req, res) {
  const { password_hash, ...user } = req.user;
  return res.json({ success: true, data: req.user });
}

module.exports = { login, logout, me, loginRules };
