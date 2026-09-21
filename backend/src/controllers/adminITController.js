const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const os = require('os');
const { catatLog } = require('./authController');

// ── GET /api/admin-it/stats ───────────────────────────────────────
async function getStats(req, res, next) {
  try {
    const [[{ totalUsers }]] = await pool.query(`SELECT COUNT(*) AS totalUsers FROM users`);
    const [[{ totalDokumen }]] = await pool.query(`SELECT COUNT(*) AS totalDokumen FROM dokumen`);
    const [[{ totalKategori }]] = await pool.query(`SELECT COUNT(*) AS totalKategori FROM kategori_dokumen`);
    const [[{ onlineNow }]] = await pool.query('SELECT COUNT(*) AS onlineNow FROM user_sessions WHERE is_online = 1');

    // System Metrics
    const loadAvg = os.loadavg()[0]; 
    const coreCount = os.cpus().length;
    let cpuUsage = (loadAvg / coreCount) * 100;
    if (cpuUsage > 100) cpuUsage = 100;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

    // DB Size (Mock Limit = 1000MB)
    const [[{ db_size_mb }]] = await pool.query(`SELECT SUM(data_length + index_length) / 1024 / 1024 AS db_size_mb FROM information_schema.tables WHERE table_schema = DATABASE()`);
    let dbStorage = (db_size_mb / 1000) * 100;
    if (dbStorage > 100) dbStorage = 100;
    if (!dbStorage) dbStorage = 1; // Fallback if 0

    // Security Metrics
    // Tries to query login_attempts if exists (catch error if table isn't created yet)
    let failedLogins = 0;
    try {
      const [[{ count }]] = await pool.query(`SELECT COUNT(*) AS count FROM login_attempts WHERE status = 'failed' AND created_at >= NOW() - INTERVAL 1 DAY`);
      failedLogins = count;
    } catch (e) {
      // ignore
    }

    return res.json({
      success: true,
      data: { 
        totalUsers, totalDokumen, totalKategori, onlineNow,
        cpuUsage: Math.round(cpuUsage),
        memoryUsage: Math.round(memoryUsage),
        dbStorage: Math.round(dbStorage),
        failedLogins
      }
    });
  } catch (err) { next(err); }
}

// ── GET /api/admin-it/users ───────────────────────────────────────
async function getUsers(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nama, u.username, u.email, u.is_active, u.permissions,
              u.last_login, u.created_at, r.nama AS role, sk.nama AS satker,
              (SELECT is_online FROM user_sessions s
               WHERE s.user_id = u.id AND s.is_online = 1
               ORDER BY s.last_active_at DESC LIMIT 1) AS is_online
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN satkers sk ON sk.id = u.satker_id
       ORDER BY u.created_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── POST /api/admin-it/users ───────────────────────────────────────
async function createUser(req, res, next) {
  try {
    const { role_id, nama, username, email, password, permissions, satker_id } = req.body;

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      `INSERT INTO users (role_id, nama, username, email, password_hash, permissions, satker_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [role_id, nama, username, email, password_hash, permissions ? JSON.stringify(permissions) : null, satker_id || null]
    );

    await catatLog({
      user_id: req.user.id,
      aksi: 'buat_user',
      entitas: 'user',
      entitas_id: result.insertId,
      detail: { username, role_id },
      ip: req.ip,
    });

    return res.status(201).json({ success: true, message: 'User berhasil dibuat' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Username atau email sudah digunakan' });
    }
    next(err);
  }
}

// ── POST /api/admin-it/users/bulk ───────────────────────────────────────
async function createBulkUsers(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { users } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid data format or empty list' });
    }

    await connection.beginTransaction();

    let successCount = 0;
    let failedCount = 0;

    for (const user of users) {
      try {
        const { role_id, nama, username, email, password, staff_nama } = user;
        
        // Cek data valid
        if (!role_id || !nama || !username || !email || !password) {
          failedCount++;
          continue;
        }

        let satker_id = null;
        if (staff_nama) {
          const [existing] = await connection.query('SELECT id FROM satkers WHERE nama = ?', [staff_nama]);
          if (existing.length > 0) {
            satker_id = existing[0].id;
          } else {
            const [inserted] = await connection.query('INSERT INTO satkers (nama) VALUES (?)', [staff_nama]);
            satker_id = inserted.insertId;
          }
        }

        const password_hash = await bcrypt.hash(password, 12);
        
        await connection.query(
          `INSERT INTO users (role_id, satker_id, nama, username, email, password_hash, permissions)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [role_id, satker_id, nama, username, email, password_hash, null]
        );
        successCount++;
      } catch (err) {
        // Skip user jika error (misal duplicate entry), lanjut ke baris selanjutnya
        failedCount++;
      }
    }

    await connection.commit();

    await catatLog({
      user_id: req.user.id,
      aksi: 'buat_user_bulk',
      entitas: 'user',
      detail: { sukses: successCount, gagal: failedCount },
      ip: req.ip,
    });

    return res.status(201).json({ 
      success: true, 
      message: `Bulk insert selesai. Berhasil: ${successCount}, Gagal/Duplikat: ${failedCount}`,
      data: { successCount, failedCount }
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
}

// ── PATCH /api/admin-it/users/:id ───────────────────────────────────────
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const targetId = Number(id);
    const { role_id, nama, username, email, permissions, satker_id } = req.body;

    const [result] = await pool.query(
      `UPDATE users
       SET role_id=?, nama=?, username=?, email=?, permissions=?, satker_id=?
       WHERE id=?`,
      [role_id, nama, username, email, permissions ? JSON.stringify(permissions) : null, satker_id || null, targetId]
    );

    await catatLog({
      user_id: req.user.id,
      aksi: 'update_user',
      entitas: 'user',
      entitas_id: targetId,
      detail: { username, role_id, permissions },
      ip_address: req.ip,
    });

    return res.json({ success: true, message: 'User berhasil diupdate' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Username atau email sudah digunakan' });
    }
    next(err);
  }
}

// ── DELETE /api/admin-it/users/:id ───────────────────────────────────────
async function deleteUser(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [targetId]);

    await catatLog({
      user_id: req.user.id,
      aksi: 'hapus_user',
      entitas: 'user',
      entitas_id: targetId,
      ip: req.ip,
    });

    return res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (err) { next(err); }
}

// ── POST /api/admin-it/users/:id/reset-password ─────────────────────────
async function forceResetPassword(req, res, next) {
  try {
    const targetId = Number(req.params.id);
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ success: false, message: 'Password baru wajib diisi' });
    }

    const password_hash = await bcrypt.hash(new_password, 12);
    await pool.query(
      'UPDATE users SET password_hash = ?, password_reset_at = NOW() WHERE id = ?',
      [password_hash, targetId]
    );

    await catatLog({
      user_id: req.user.id,
      aksi: 'reset_password_manual',
      entitas: 'user',
      entitas_id: targetId,
      ip: req.ip,
    });

    return res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (err) { next(err); }
}

// ── KATEGORI CRUD ───────────────────────────────────────
async function getKategori(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM kategori_dokumen ORDER BY nama ASC');
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

async function createKategori(req, res, next) {
  try {
    const { nama, slug, deskripsi } = req.body;
    await pool.query('INSERT INTO kategori_dokumen (nama, slug, deskripsi) VALUES (?, ?, ?)', [nama, slug, deskripsi]);
    return res.status(201).json({ success: true, message: 'Kategori dibuat' });
  } catch (err) { next(err); }
}

async function updateKategori(req, res, next) {
  try {
    const { nama, slug, deskripsi } = req.body;
    await pool.query('UPDATE kategori_dokumen SET nama=?, slug=?, deskripsi=? WHERE id=?', [nama, slug, deskripsi, req.params.id]);
    return res.json({ success: true, message: 'Kategori diupdate' });
  } catch (err) { next(err); }
}

async function deleteKategori(req, res, next) {
  try {
    await pool.query('DELETE FROM kategori_dokumen WHERE id=?', [req.params.id]);
    return res.json({ success: true, message: 'Kategori dihapus' });
  } catch (err) { next(err); }
}

// ── LOGS ───────────────────────────────────────
async function getLogs(req, res, next) {
  try {
    const { page = 1, limit = 50, satker_id } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let whereClause = '1=1';
    const params = [];
    
    if (satker_id) {
      whereClause += ' AND u.satker_id = ?';
      params.push(satker_id);
    }
    
    let query = `
      SELECT l.id, l.aksi, l.entitas, l.entitas_id, l.detail, l.ip_address AS ip, l.created_at, u.nama AS user_nama, u.username, u.satker_id
      FROM aktivitas_log l
      LEFT JOIN users u ON u.id = l.user_id
      WHERE ${whereClause}
    `;
    
    if (!satker_id) {
      query += `
        UNION ALL
        SELECT id, 'login_failed' AS aksi, 'system' AS entitas, NULL AS entitas_id, 
               JSON_OBJECT('username_tried', username_tried, 'location', COALESCE(location, 'Unknown')) AS detail, ip_address AS ip, created_at, 'System' AS user_nama, username_tried AS username, NULL AS satker_id
        FROM login_attempts
        WHERE status = 'failed'
      `;
    }
    
    let countQuery = `SELECT COUNT(*) AS total FROM aktivitas_log l LEFT JOIN users u ON u.id = l.user_id WHERE ${whereClause}`;
    if (!satker_id) {
      countQuery = `
        SELECT (
          (SELECT COUNT(*) FROM aktivitas_log l LEFT JOIN users u ON u.id = l.user_id WHERE ${whereClause}) + 
          (SELECT COUNT(*) FROM login_attempts WHERE status = 'failed')
        ) AS total
      `;
    }
    
    const [[{ total }]] = await pool.query(countQuery, params);
    
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);
    
    const [rows] = await pool.query(query, params);
    
    return res.json({ 
      success: true, 
      data: rows,
      meta: {
        total: Number(total),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(Number(total) / Number(limit))
      }
    });
  } catch (err) { next(err); }
}



module.exports = {
  getStats, getUsers, createUser, createBulkUsers, updateUser, deleteUser, forceResetPassword,
  getKategori, createKategori, updateKategori, deleteKategori,
  getLogs
};
