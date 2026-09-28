const { pool } = require('../config/db');

async function getDashboardStats(req, res, next) {
  try {
    // 1. Total User (Pimpinan & Staff/Satker)
    const [userRes] = await pool.query(`SELECT COUNT(id) AS total FROM users WHERE role_id IN (2, 3) AND is_active = 1`);
    const total_user = userRes[0].total;

    // 2. Total Saldo
    const [saldoRes] = await pool.query(`SELECT SUM(IFNULL(saldo_akhir_bulan, 0) + IFNULL(saldo_rk, 0) + IFNULL(saldo_rekening, 0) + IFNULL(saldo_rpl_lpj, 0)) AS total_saldo FROM kertas_kerja`);
    const total_saldo = parseFloat(saldoRes[0].total_saldo || 0);

    // 3. Saldo Per Satker (Untuk Pie Chart)
    const [satkerRes] = await pool.query(`
      SELECT s.nama, SUM(IFNULL(k.saldo_akhir_bulan, 0) + IFNULL(k.saldo_rk, 0) + IFNULL(k.saldo_rekening, 0) + IFNULL(k.saldo_rpl_lpj, 0)) AS value 
      FROM kertas_kerja k 
      JOIN satkers s ON k.satker_id = s.id 
      GROUP BY s.id 
      ORDER BY value DESC
    `);
    const formattedSatker = satkerRes.map(item => ({
      nama: item.nama || 'Tidak Diketahui',
      value: parseFloat(item.value || 0)
    }));

    // 4. Tren Saldo Per Tahun & Periode (Untuk Bar Chart)
    const [periodeRes] = await pool.query(`
      SELECT tahun, periode, SUM(IFNULL(saldo_akhir_bulan, 0) + IFNULL(saldo_rk, 0) + IFNULL(saldo_rekening, 0) + IFNULL(saldo_rpl_lpj, 0)) AS total 
      FROM kertas_kerja 
      GROUP BY tahun, periode 
      ORDER BY tahun ASC, periode ASC
    `);

    // Transform into Recharts friendly format (grouping by year)
    // We want: [{ tahun: 2026, periode_1: 1500, periode_2: 0 }]
    const trenMap = {};
    periodeRes.forEach(item => {
      const yr = item.tahun || 2026;
      if (!trenMap[yr]) trenMap[yr] = { tahun: yr.toString(), periode_1: 0, periode_2: 0 };
      if (item.periode === '1') trenMap[yr].periode_1 = parseFloat(item.total || 0);
      else trenMap[yr].periode_2 = parseFloat(item.total || 0);
    });
    const formattedTren = Object.values(trenMap).sort((a, b) => parseInt(a.tahun) - parseInt(b.tahun));

    return res.json({
      success: true,
      data: {
        total_user,
        total_saldo,
        saldo_per_satker: formattedSatker,
        saldo_per_periode: formattedTren
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats
};
