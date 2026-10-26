const { pool } = require('../config/db');
const { sendTelegramNotification } = require('../services/telegramService');
const { broadcastTelegramNotification } = require('../bots/bot_telegram');
const { broadcastWhatsAppNotification } = require('../bots/bot_whatsapp');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
          const username = escapeHtml(req.user?.username || 'System');
          const role = escapeHtml(req.user?.role || 'User');
          const safeEntitas = escapeHtml(entitas || '');
          const safeAksi = escapeHtml(aksi);
          
          let actionText = '';
          const nominalStr = req.body?.nominal ? ` senilai <b>Rp ${Number(req.body.nominal).toLocaleString('id-ID')}</b>` : '';
          const safeUraian = req.body?.uraian ? ` (<i>${escapeHtml(req.body.uraian)}</i>)` : '';
          
          switch (aksi) {
            case 'login': actionText = 'baru saja <b>Login</b> ke dalam sistem'; break;
            case 'logout': actionText = 'baru saja <b>Logout</b>'; break;
            case 'upload': actionText = `mengunggah data <b>${safeEntitas || 'file'}</b> baru`; break;
            case 'create': 
              if (entitas === 'akuntansi') {
                const safeJenis = escapeHtml(req.body?.jenis || 'Transaksi');
                actionText = `menambahkan Pencatatan <b>${safeJenis}</b>${nominalStr}${safeUraian}`;
              } else {
                actionText = `membuat data <b>${safeEntitas}</b> baru`; 
              }
              break;
            case 'update': actionText = `memperbarui data <b>${safeEntitas}</b>`; break;
            case 'delete': actionText = `menghapus data <b>${safeEntitas}</b>`; break;
            case 'download': actionText = `mengunduh laporan <b>${safeEntitas}</b>`; break;
            default: actionText = `melakukan aksi <b>${safeAksi}</b> pada <b>${safeEntitas}</b>`;
          }

          const tgMessage = `🚨 <b>Notifikasi Sistem</b>\n\n👤 <b>User:</b> ${username} (${role})\n📝 <b>Aktivitas:</b> ${username} ${actionText}.\n⏰ <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}`;
          
          
          const targetSatkerId = req.user?.satker_id;
          if (targetSatkerId) {
            // Only broadcast to users of that satker
            broadcastTelegramNotification(targetSatkerId, tgMessage);
            broadcastWhatsAppNotification(targetSatkerId, tgMessage.replace(/<[^>]+>/g, '*')); // simple markdown for WA
          } else {
            // If admin (no satker_id), maybe fallback to default admin group?
            sendTelegramNotification(tgMessage);
          }

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
