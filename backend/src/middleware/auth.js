const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Verifikasi JWT token dari header Authorization
async function authenticate(req, res, next) {
  try {
    // Ambil token hanya dari Authorization header
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cek user masih aktif di DB
    const [rows] = await pool.query(
      'SELECT id, role_id, divisi_id, nama, username, email, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ success: false, message: 'User tidak aktif atau tidak ditemukan' });
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

    // role_id 1 = admin, 2 = staff, 3 = ketua_tim, 4 = admin_dept
    const roleMap = { 1: 'admin', 2: 'staff', 3: 'ketua_tim', 4: 'admin_dept' };
    const userRole = roleMap[req.user.role_id];

    if (!roles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Akses ditolak, role tidak sesuai' });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
