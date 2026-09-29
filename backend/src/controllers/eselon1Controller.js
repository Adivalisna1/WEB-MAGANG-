const bcrypt    = require('bcrypt');
const crypto    = require('crypto');
const { body }  = require('express-validator');
const { pool }  = require('../config/db');
const { catatLog } = require('./authController');
const { buatNotifikasi } = require('./notifikasiController');
const archiver = require('archiver');
const { downloadFromR2 } = require('../config/r2');

// ── GET /api/eselon-1/stats — statistik + data grafik dashboard ──
async function getStats(req, res, next) {
  try {
    // Cleanup session tidak aktif > 15 menit sebelum hitung onlineNow
    await pool.query(
      `UPDATE user_sessions
       SET is_online = 0, logout_at = NOW()
       WHERE is_online = 1
         AND last_active_at < NOW() - INTERVAL 15 MINUTE`
    );

    const [[{ totalDokumen }]]  = await pool.query(`SELECT COUNT(*) AS totalDokumen FROM dokumen`);
    const [[{ terverifikasi }]] = await pool.query(`SELECT COUNT(*) AS terverifikasi FROM dokumen WHERE status = "terverifikasi"`);
    const [[{ menunggu }]]      = await pool.query(`SELECT COUNT(*) AS menunggu FROM dokumen WHERE status = "menunggu_verifikasi"`);
    const [[{ lolosPimpinan }]]    = await pool.query(`SELECT COUNT(*) AS lolosPimpinan FROM dokumen WHERE status = "lolos_admin"`);
    const [[{ revisi }]]        = await pool.query(`SELECT COUNT(*) AS revisi FROM dokumen WHERE status = "revisi"`);
    const [[{ onlineNow }]]     = await pool.query('SELECT COUNT(*) AS onlineNow FROM user_sessions WHERE is_online = 1');

    // Grafik 1: jumlah upload per staff
    const [perStaff] = await pool.query(
      `SELECT u.nama,
              COUNT(d.id) AS total,
              SUM(d.status = 'terverifikasi') AS terverifikasi,
              SUM(d.status = 'revisi') AS revisi
       FROM users u
       LEFT JOIN dokumen d ON d.uploaded_by = u.id
       WHERE u.role_id = 2 AND u.is_active = 1
       GROUP BY u.id, u.nama
       ORDER BY total DESC`
    );

    // Grafik 2: upload harian 14 hari terakhir
    const [perHari] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS tanggal, COUNT(*) AS total
       FROM dokumen
       WHERE created_at >= CURDATE() - INTERVAL 13 DAY
       GROUP BY tanggal
       ORDER BY tanggal ASC`
    );

    // Grafik 3: distribusi status dokumen
    const [statusDist] = await pool.query(
      `SELECT status, COUNT(*) AS total FROM dokumen GROUP BY status`
    );

    // User online untuk panel samping
    const [onlineUsers] = await pool.query(
      `SELECT u.id, u.nama, u.username, r.nama AS role, s.last_active_at
       FROM user_sessions s
       JOIN users u ON u.id = s.user_id
       JOIN roles r ON r.id = u.role_id
       WHERE s.is_online = 1
       ORDER BY s.last_active_at DESC`
    );

    return res.json({
      success: true,
      data: {
        totalDokumen, terverifikasi, menunggu, lolosPimpinan: lolosPimpinan ?? 0, revisi, onlineNow,
        perSatker: perStaff, perHari, statusDist, onlineUsers,
      },
    });
  } catch (err) { next(err); }
}

// ── GET /api/eselon-1/users — daftar semua user ─────────────────
async function getUsers(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nama, u.username, u.email, u.is_active,
              u.last_login, u.password_reset_at, u.created_at, r.nama AS role,
              (SELECT is_online FROM user_sessions s
               WHERE s.user_id = u.id AND s.is_online = 1
               ORDER BY s.last_active_at DESC LIMIT 1) AS is_online
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.role_id = 1
       ORDER BY u.created_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── GET /api/eselon-1/dokumen — monitor semua dokumen (read-only) ──
async function getDokumen(req, res, next) {
  try {
    const { status } = req.query;
    const limit  = Math.min(Number(req.query.limit) || 100, 200);

    let where = '1=1';
    const params = [];
    if (status) { where += ' AND d.status = ?'; params.push(status); }

    const [rows] = await pool.query(
      `SELECT d.id, d.judul, d.tahun, d.nomor_laporan, d.status, d.catatan,
              d.nilai_rekening_koran,
              d.created_at, d.updated_at,
              k.nama AS kategori, u.nama AS uploaded_by
       FROM dokumen d
       JOIN kategori_dokumen k ON k.id = d.kategori_id
       JOIN users u ON u.id = d.uploaded_by
       WHERE ${where}
       ORDER BY d.created_at DESC
       LIMIT ?`,
      [...params, limit]
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── GET /api/eselon-1/dokumen/menunggu — dokumen lolos admin ─────
async function getDokumenMenungguKetua(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT d.id, d.judul, d.tahun, d.bulan, d.semester, d.nomor_laporan,
              d.status, d.catatan, d.catatan_oleh, d.file_nama, d.file_size, d.file_mime,
              d.nilai_rekening_koran,
              d.created_at, d.updated_at,
              k.nama AS kategori, k.slug AS kategori_slug,
              u.nama AS uploaded_by
       FROM dokumen d
       JOIN kategori_dokumen k ON k.id = d.kategori_id
       JOIN users u ON u.id = d.uploaded_by
       WHERE d.status = 'lolos_admin'
       ORDER BY d.updated_at ASC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── PATCH /api/eselon-1/users/:id/toggle — aktif/nonaktif ───────
async function toggleUserActive(req, res, next) {
  try {
    const targetId = Number(req.params.id);

    const [rows] = await pool.query(
      'SELECT id, role_id, nama, is_active FROM users WHERE id = ?', [targetId]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Guard: tidak bisa nonaktifkan diri sendiri
    if (targetId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak bisa menonaktifkan akun sendiri' });
    }

    // Guard: tidak bisa nonaktifkan sesama ketua tim
    if (rows[0].role_id === 3) {
      return res.status(403).json({ success: false, message: 'Tidak bisa mengubah status sesama Eselon 1' });
    }

    // Guard: Eselon 1 tidak bisa mengelola status Staff (role_id = 2)
    if (rows[0].role_id === 2) {
      return res.status(403).json({ success: false, message: 'Hanya Pimpinan Satker yang berhak menonaktifkan Staff.' });
    }

    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, targetId]);

    await catatLog({
      user_id: req.user.id,
      aksi: newStatus ? 'aktifkan_user' : 'nonaktifkan_user',
      entitas: 'user',
      entitas_id: targetId,
      detail: { nama: rows[0].nama, is_active: newStatus, oleh: 'eselon_1' },
      ip: req.ip,
    });

    return res.json({
      success: true,
      message: newStatus ? 'User diaktifkan' : 'User dinonaktifkan',
      data: { id: targetId, is_active: newStatus },
    });
  } catch (err) { next(err); }
}

// Generate password random yang mudah dibaca (tanpa karakter ambigu)
function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(8);
  let pass = '';
  for (const b of bytes) pass += chars[b % chars.length];
  return `Esl1-${pass.slice(0, 4)}-${pass.slice(4)}`;
}

// ── POST /api/eselon-1/users/:id/reset-password ─────────────────
async function resetPassword(req, res, next) {
  try {
    const targetId = Number(req.params.id);

    const [rows] = await pool.query(
      'SELECT id, nama, username FROM users WHERE id = ?', [targetId]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const newPassword = generatePassword();
    const hash = await bcrypt.hash(newPassword, 12);

    await pool.query(
      'UPDATE users SET password_hash = ?, password_reset_at = NOW() WHERE id = ?',
      [hash, targetId]
    );

    await catatLog({
      user_id: req.user.id,
      aksi: 'reset_password',
      entitas: 'user',
      entitas_id: targetId,
      detail: { nama: rows[0].nama, username: rows[0].username },
      ip: req.ip,
    });

    // Kabari user yang direset passwordnya
    await buatNotifikasi({
      user_id: targetId,
      aksi: 'reset_password',
      judul: 'Password Direset',
      pesan: 'Password akun Anda baru saja direset oleh Eselon 1. Silakan login dengan password baru Anda.',
    });

    // Password plaintext dikembalikan SEKALI di response — tidak disimpan dimanapun
    return res.json({
      success: true,
      message: 'Password berhasil direset',
      data: { id: targetId, nama: rows[0].nama, username: rows[0].username, password_baru: newPassword },
    });
  } catch (err) { next(err); }
}

// ── GET /api/eselon-1/dokumen/export-zip ───────────────────────
async function exportZipRekeningKoran(req, res, next) {
  try {
    const { satker_id } = req.query;
    if (!satker_id) {
      return res.status(400).json({ success: false, message: 'satker_id diperlukan' });
    }

    const [rows] = await pool.query(
      `SELECT d.id, d.judul, d.file_nama, d.file_path, d.file_mime, u.nama AS satker_nama
       FROM dokumen d
       JOIN kategori_dokumen k ON k.id = d.kategori_id
       JOIN users u ON u.id = d.uploaded_by
       WHERE LOWER(k.nama) LIKE '%rekening koran%'
         AND u.satker_id = ?
         AND d.status = 'terverifikasi'`,
      [satker_id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Tidak ada dokumen Rekening Koran ditemukan untuk satker tersebut' });
    }

    const satkerName = rows[0].satker_nama.replace(/[^a-zA-Z0-9]/g, '_');
    const zipName = `Rekening_Koran_${satkerName}_${new Date().toISOString().split('T')[0]}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('error', function(err) {
      console.error('Error saat membuat ZIP:', err);
      res.status(500).end();
    });

    archive.pipe(res);

    for (const doc of rows) {
      if (doc.file_path) {
        try {
          const buffer = await downloadFromR2(doc.file_path);
          archive.append(buffer, { name: doc.file_nama || `dokumen_${doc.id}.pdf` });
        } catch (e) {
          console.warn('Gagal mendapatkan file untuk dokumen:', doc.id, e.message);
        }
      }
    }

    await archive.finalize();

  } catch (err) { next(err); }
}

// ── GET /api/eselon-1/logs — log aktivitas (exclude login/logout) ──
async function getLogs(req, res, next) {
  try {
    const { user_id, aksi, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Eselon 1 melihat aktivitas SEMUA user TAPI KECUALI login/logout
    let where = "l.aksi NOT IN ('login', 'logout')";
    const params = [];

    if (user_id) { where += ' AND l.user_id = ?'; params.push(user_id); }
    if (aksi)    { where += ' AND l.aksi = ?';    params.push(aksi); }

    const [rows] = await pool.query(
      `SELECT l.id, l.aksi, l.entitas, l.entitas_id, l.detail,
              l.ip_address, l.created_at, 
              CONCAT(u.nama, IFNULL(CONCAT(' (', s.nama, ')'), '')) AS user_nama, 
              u.username
       FROM aktivitas_log l
       LEFT JOIN users u ON u.id = l.user_id
       LEFT JOIN satkers s ON s.id = u.satker_id
       WHERE ${where}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM aktivitas_log l LEFT JOIN users u ON u.id = l.user_id WHERE ${where}`, params
    );

    return res.json({
      success: true,
      data: rows,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
}

module.exports = {
  getStats, getUsers, getDokumen, getDokumenMenungguKetua,
  toggleUserActive, resetPassword, exportZipRekeningKoran, getLogs
};
