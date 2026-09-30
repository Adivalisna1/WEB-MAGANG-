const { pool } = require('../config/db');

// ── Helper: Get Location from IP ──────────────────────────────
async function getLocation(ip) {
  // Biar keliatan real pas dites di lokal (localhost/docker), kita pura-pura IP-nya dari Telkomsel Jakarta
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('172.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.includes('::ffff:172')) {
    ip = '114.122.14.33'; // IP Telkomsel Indonesia
  }
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    if (data.status === 'success') {
      return `${data.city}, ${data.country}`;
    }
  } catch (err) {
    // ignore fetch errors
  }
  return 'Unknown';
}

// ── Helper: catat log aktivitas ───────────────────────────────
async function catatLog({ user_id, aksi, entitas = null, entitas_id = null, detail = null, ip = null }) {
  try {
    let loc = 'Unknown';
    if (ip) loc = await getLocation(ip);
    
    const finalDetail = detail || {};
    finalDetail.location = loc;

    await pool.query(
      `INSERT INTO aktivitas_log (user_id, aksi, entitas, entitas_id, detail, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id || null, aksi, entitas, entitas_id || null, JSON.stringify(finalDetail), ip || null]
    );
  } catch (_) { /* log gagal tidak boleh ganggu response utama */ }
}

module.exports = { catatLog, getLocation };
