const { pool } = require('../config/db');

// Middleware factory untuk log aktivitas ke tabel aktivitas_log
// Contoh: activityLogger('upload', 'dokumen')
function activityLogger(aksi, entitas = null) {
  return async (req, res, next) => {
    // Simpan original json() agar bisa intercept response
    const originalJson = res.json.bind(res);

    res.json = async function (body) {
      // Hanya log kalau response sukses
      if (body && body.success !== false) {
        try {
          const entitasId = body.data?.id || req.params?.id || null;
          await pool.query(
            `INSERT INTO aktivitas_log (user_id, aksi, entitas, entitas_id, detail, ip_address)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              req.user?.id || null,
              aksi,
              entitas,
              entitasId ? Number(entitasId) : null,
              JSON.stringify({ method: req.method, path: req.path }),
              req.ip,
            ]
          );
        } catch (e) {
          // Log error tidak boleh menghentikan response
          console.error('[ActivityLogger] gagal simpan log:', e.message);
        }
      }
      return originalJson(body);
    };

    next();
  };
}

module.exports = activityLogger;
