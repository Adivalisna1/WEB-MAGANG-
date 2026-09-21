const { pool } = require('../config/db');

//  Helper: buat notifikasi (dipanggil dari controller lain) 
async function buatNotifikasi({ user_id, aksi, dokumen_id = null, judul = null, pesan }) {
  try {
    await pool.query(
      `INSERT INTO notifikasi (user_id, aksi, dokumen_id, judul, pesan)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, aksi, dokumen_id, judul, pesan]
    );

    // [START] Kirim Email Notifikasi via Brevo API
    if (process.env.BREVO_API_KEY) {
      const [userRows] = await pool.query('SELECT nama, email FROM users WHERE id = ?', [user_id]);
      if (userRows.length > 0 && userRows[0].email) {
        const user = userRows[0];
        const senderEmail = process.env.EMAIL_FROM || 'no-reply@laporan.go.id';

        // Fitur Testing: Gunakan TEST_EMAIL_RECIPIENT dari .env jika ada (email kamu)
        const targetEmail = process.env.TEST_EMAIL_RECIPIENT || user.email;

        const payload = {
          sender: { name: "Dashboard Laporan", email: senderEmail },
          to: [{ email: targetEmail, name: user.nama }],
          subject: `Notifikasi: ${judul || 'Pemberitahuan Sistem'}`,
          htmlContent: `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                          <h3 style="color: #2563eb;">Halo ${user.nama},</h3>
                          <p style="font-size: 16px; color: #333;">Ada notifikasi baru untuk Anda:</p>
                          <div style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
                            ${pesan}
                          </div>
                          <p style="font-size: 14px; color: #666;">Silakan akses Dashboard Laporan untuk melihat detailnya.</p>
                          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                          <small style="color: #999;">Email otomatis dari sistem.</small>
                        </div>`
        };

        // Kirim asinkron (tidak nge-block proses)
        fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        })
          .then(async res => {
            if (!res.ok) {
              const errBody = await res.text();
              console.error('[NOTIFIKASI EMAIL] Brevo API Error:', res.status, errBody);
            } else {
              console.log(`[NOTIFIKASI EMAIL] Terkirim ke ${targetEmail} (Aksi: ${aksi})`);
            }
          })
          .catch(err => console.error('[NOTIFIKASI EMAIL] Fetch Error:', err.message));
      }
    }
    // [END] Kirim Email Notifikasi

  } catch (err) {
    // Log error tapi jangan block proses utama
    console.error('[NOTIFIKASI] Gagal membuat notifikasi:', err.message);
  }
}

// GET /api/notifikasi 
async function getNotifikasi(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 20;
    const [rows] = await pool.query(
      `SELECT id, aksi, dokumen_id, judul, pesan, is_read, created_at
       FROM notifikasi
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [req.user.id, limit]
    );

    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

//  GET /api/notifikasi/unread-count 
async function getUnreadCount(req, res, next) {
  try {
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifikasi WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    return res.json({ success: true, data: { count } });
  } catch (err) { next(err); }
}

//  PATCH /api/notifikasi/:id/read 
async function markAsRead(req, res, next) {
  try {
    await pool.query(
      'UPDATE notifikasi SET is_read = 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    return res.json({ success: true, message: 'Notifikasi ditandai sudah dibaca' });
  } catch (err) { next(err); }
}

//  PATCH /api/notifikasi/read-all 
async function markAllAsRead(req, res, next) {
  try {
    await pool.query(
      'UPDATE notifikasi SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    return res.json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca' });
  } catch (err) { next(err); }
}

module.exports = {
  getNotifikasi, getUnreadCount, markAsRead, markAllAsRead,
  buatNotifikasi,
};
