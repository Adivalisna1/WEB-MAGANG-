const { pool } = require('../config/db');
const { sendTelegramNotification } = require('../services/telegramService');

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

          // ======== TELEGRAM NOTIFICATION ========
          const username = req.user?.username || 'System';
          const role = req.user?.role || 'User';
          
          let actionText = '';
          switch (aksi) {
            case 'login': actionText = 'baru saja <b>Login</b> ke dalam sistem'; break;
            case 'logout': actionText = 'baru saja <b>Logout</b>'; break;
            case 'upload': actionText = `mengunggah data <b>${entitas || 'file'}</b> baru`; break;
            case 'create': actionText = `membuat data <b>${entitas || ''}</b> baru`; break;
            case 'update': actionText = `memperbarui data <b>${entitas || ''}</b>`; break;
            case 'delete': actionText = `menghapus data <b>${entitas || ''}</b>`; break;
            case 'download': actionText = `mengunduh laporan <b>${entitas || ''}</b>`; break;
            default: actionText = `melakukan aksi <b>${aksi}</b> pada <b>${entitas || ''}</b>`;
          }

          const tgMessage = `🚨 <b>Notifikasi Sistem</b>\n\n👤 <b>User:</b> ${username} (${role})\n📝 <b>Aktivitas:</b> ${username} ${actionText}.\n⏰ <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}`;
          
          sendTelegramNotification(tgMessage);
          // =======================================

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
