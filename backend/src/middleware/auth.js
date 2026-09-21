const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Verifikasi JWT token dari header Authorization atau query parameter
async function authenticate(req, res, next) {
  try {
    // Ambil token dari Authorization header atau query string
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cek user masih aktif di DB dan join dengan tabel roles untuk mendapatkan nama role
    const [rows] = await pool.query(
      `SELECT u.id, u.role_id, u.satker_id, u.nama, u.username, u.email, u.is_active, r.nama AS role 
       FROM users u 
       JOIN roles r ON r.id = u.role_id 
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ success: false, message: 'User tidak aktif atau tidak ditemukan' });
    }

    // ── Single-device & IP Binding ────────────────────────────
    if (decoded.sessionId) {
      const [sess] = await pool.query(
        'SELECT is_online, ip_address FROM user_sessions WHERE id = ?',
        [decoded.sessionId]
      );
      
      if (!sess.length) {
        return res.status(401).json({ success: false, message: 'Sesi tidak ditemukan' });
      }

      if (!sess[0].is_online) {
        return res.status(401).json({
          success: false,
          message: 'Sesi Anda telah berakhir karena akun login di perangkat lain',
          code: 'SESSION_KICKED',
        });
      }

    }

    req.user = rows[0];

    // Update last_active_at di session
    await pool.query(
      'UPDATE user_sessions SET last_active_at = NOW() WHERE id = ? AND is_online = 1',
      [decoded.sessionId]
    );

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token sudah expired, silakan login ulang' });
    }
    return res.status(401).json({ success: false, message: 'Token tidak valid' });
  }
}

// Cek role: authorize('admin') atau authorize('admin', 'staff')
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Tidak terautentikasi' });
    }

    // role_id 1 = pimpinan (admin), 2 = staff (staff), 3 = eselon_1 (ketua_tim), 4 = admin_it
    const roleMap = { 1: 'pimpinan', 2: 'staff', 3: 'eselon_1', 4: 'admin_it' };
    const userRole = roleMap[req.user.role_id];

    if (!roles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Akses ditolak, role tidak sesuai' });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
