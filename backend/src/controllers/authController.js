const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const { body } = require('express-validator');
const { pool } = require('../config/db');

// ── Helper: catat log aktivitas ───────────────────────────────
async function catatLog({ user_id, aksi, entitas = null, entitas_id = null, detail = null, ip = null }) {
  try {
    await pool.query(
      `INSERT INTO aktivitas_log (user_id, aksi, entitas, entitas_id, detail, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id || null, aksi, entitas, entitas_id || null, detail ? JSON.stringify(detail) : null, ip || null]
    );
  } catch (_) { /* log gagal tidak boleh ganggu response utama */ }
}

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

    // Catat log login
    await catatLog({
      user_id: user.id,
      aksi: 'login',
      entitas: 'user',
      entitas_id: user.id,
      detail: { username: user.username, role: user.role },
      ip: req.ip,
    });

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
        // Catat log logout
        await catatLog({
          user_id: decoded.id,
          aksi: 'logout',
          entitas: 'user',
          entitas_id: decoded.id,
          ip: req.ip,
        });
      } catch (_) { /* token expired — tetap lanjut logout */ }
    }
    return res.json({ success: true, message: 'Logout berhasil' });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────
async function me(req, res) {
  const { password_hash, ...user } = req.user; // strip password_hash sebelum kirim
  return res.json({ success: true, data: user });
}

// ── POST /api/auth/forgot-password ────────────────────────────
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email wajib diisi' });

    const [rows] = await pool.query('SELECT id, nama, email FROM users WHERE email = ? LIMIT 1', [email]);
    if (!rows.length) {
      // Return 200 even if not found to prevent email enumeration
      return res.json({ success: true, message: 'Jika email terdaftar, link reset telah dikirim.' });
    }
    const user = rows[0];

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 jam

    await pool.query(
      'UPDATE users SET reset_password_token = ?, reset_password_expires_at = ? WHERE id = ?',
      [resetToken, tokenExpiry, user.id]
    );

    const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const senderEmail = process.env.EMAIL_FROM || 'no-reply@laporan.go.id';

    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY belum dikonfigurasi di server.");
    }

    const payload = {
      sender: { name: "Admin Dashboard Laporan", email: senderEmail },
      to: [{ email: user.email, name: user.nama }],
      subject: "Permintaan Reset Password",
      htmlContent: `<p>Halo <b>${user.nama}</b>,</p><p>Anda meminta reset password. Klik link berikut untuk membuat password baru:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Abaikan email ini jika Anda tidak memintanya. Link kedaluwarsa dalam 1 jam.</p>`
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", errorData);
      throw new Error(`Gagal mengirim email via Brevo: ${errorData.message}`);
    }

    console.log("Email reset terkirim ke: " + user.email + " via Brevo API");

    return res.json({ 
      success: true, 
      message: 'Jika email terdaftar, link reset telah dikirim ke inbox Anda.'
    });
  } catch (err) {
    console.error("Email Error:", err);
    next(err);
  }
}

// ── POST /api/auth/reset-password ─────────────────────────────
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token dan password baru wajib diisi' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
    }

    const [rows] = await pool.query(
      'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires_at > NOW() LIMIT 1',
      [token]
    );

    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'Token reset password tidak valid atau sudah kedaluwarsa' });
    }

    const user = rows[0];
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires_at = NULL WHERE id = ?',
      [passwordHash, user.id]
    );

    // Otomatis logout semua sesi
    await pool.query('UPDATE user_sessions SET is_online = 0, logout_at = NOW() WHERE user_id = ?', [user.id]);

    await catatLog({
      user_id: user.id,
      aksi: 'reset_password_success',
      entitas: 'user',
      entitas_id: user.id,
      ip: req.ip,
    });

    return res.json({ success: true, message: 'Password berhasil diubah. Silakan login kembali.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, me, forgotPassword, resetPassword, loginRules, catatLog };
