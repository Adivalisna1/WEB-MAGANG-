const { pool } = require('../config/db');

async function getDashboardStats(req, res, next) {
  try {
    const [[currentUser]] = await pool.query('SELECT role_id, satker_id FROM users WHERE id = ?', [req.user.id]);
    
    let userFilter = `WHERE role_id IN (2, 3) AND is_active = 1`;
    let kkFilter = `WHERE 1=1`;
    const params = [];
    const kkParams = [];

    // Jika user adalah pimpinan (1) atau staff (2), filter berdasarkan satker mereka
    if (currentUser.role_id === 1 || currentUser.role_id === 2) {
      if (currentUser.satker_id) {
        userFilter += ` AND satker_id = ?`;
        params.push(currentUser.satker_id);
        kkFilter += ` AND satker_id = ?`;
        kkParams.push(currentUser.satker_id);
      } else {
        // Jika tidak punya satker tapi role-nya satker, mungkin jangan tampilkan apa-apa atau nolkan
        userFilter += ` AND satker_id = 0`; 
        kkFilter += ` AND satker_id = 0`;
      }
    } else {
      // Untuk Eselon 1 atau Admin, jika ada query param satker, pakai itu
      if (req.query.satker) {
        userFilter += ` AND satker_id = ?`;
        params.push(req.query.satker);
        kkFilter += ` AND satker_id = ?`;
        kkParams.push(req.query.satker);
      }
    }

    // 1. Total User
    const [userRes] = await pool.query(`SELECT COUNT(id) AS total FROM users ${userFilter}`, params);
    const total_user = userRes[0].total;

    // 1.5 Total Dokumen
    let docFilter = '';
    const docParams = [];
    if (currentUser.role_id === 1 || currentUser.role_id === 2) {
      if (currentUser.satker_id) {
        docFilter = `JOIN users u ON d.uploaded_by = u.id WHERE u.satker_id = ?`;
        docParams.push(currentUser.satker_id);
      } else {
        docFilter = `JOIN users u ON d.uploaded_by = u.id WHERE u.satker_id = 0`;
      }
    } else if (req.query.satker) {
      docFilter = `JOIN users u ON d.uploaded_by = u.id WHERE u.satker_id = ?`;
      docParams.push(req.query.satker);
    }
    
    const [docRes] = await pool.query(`SELECT COUNT(d.id) AS total FROM dokumen d ${docFilter}`, docParams);
    const total_dokumen = docRes[0].total;

    // 2. Total Saldo
    const [saldoRes] = await pool.query(`SELECT SUM(IFNULL(saldo_akhir_bulan, 0) + IFNULL(saldo_rk, 0) + IFNULL(saldo_rekening, 0) + IFNULL(saldo_rpl_lpj, 0)) AS total_saldo FROM kertas_kerja ${kkFilter}`, kkParams);
    const total_saldo = parseFloat(saldoRes[0].total_saldo || 0);

    // 3. Saldo Per Satker / Per Kategori Saldo (Untuk Pie Chart)
    let isSingleSatker = false;
    if ((currentUser.role_id === 1 || currentUser.role_id === 2) && currentUser.satker_id) {
      isSingleSatker = true;
    } else if ((currentUser.role_id === 3 || currentUser.role_id === 4) && req.query.satker) {
      isSingleSatker = true;
    }

    let formattedSatker = [];
    if (isSingleSatker) {
      let targetSatkerId = null;
      if ((currentUser.role_id === 1 || currentUser.role_id === 2) && currentUser.satker_id) {
        targetSatkerId = currentUser.satker_id;
      } else if (req.query.satker) {
        targetSatkerId = req.query.satker;
      }

      if (targetSatkerId) {
        const [tipeSaldoRes] = await pool.query(`
          SELECT k.nama_kategori AS nama, SUM(a.nominal) AS value
          FROM audit_akuntansi a
          JOIN kategori_akuntansi k ON a.id_kategori = k.id
          JOIN users u ON a.created_by = u.id
          WHERE u.satker_id = ?
          GROUP BY k.id
          ORDER BY value DESC
        `, [targetSatkerId]);
        
        formattedSatker = tipeSaldoRes.map(item => ({
          nama: item.nama || 'Tidak Diketahui',
          value: parseFloat(item.value || 0)
        }));
      }
    } else {
      const [satkerRes] = await pool.query(`
        SELECT s.nama, SUM(IFNULL(k.saldo_akhir_bulan, 0) + IFNULL(k.saldo_rk, 0) + IFNULL(k.saldo_rekening, 0) + IFNULL(k.saldo_rpl_lpj, 0)) AS value 
        FROM kertas_kerja k 
        JOIN satkers s ON k.satker_id = s.id 
        ${kkFilter.replace(/satker_id/g, 'k.satker_id').replace('WHERE 1=1', 'WHERE 1=1 AND k.satker_id IS NOT NULL')}
        GROUP BY s.id 
        ORDER BY value DESC
      `, kkParams);
      formattedSatker = satkerRes.map(item => ({
        nama: item.nama || 'Tidak Diketahui',
        value: parseFloat(item.value || 0)
      }));
    }

    // 4. Tren Saldo Per Tahun & Periode (Untuk Bar Chart)
    const [periodeRes] = await pool.query(`
      SELECT tahun, periode, SUM(IFNULL(saldo_akhir_bulan, 0) + IFNULL(saldo_rk, 0) + IFNULL(saldo_rekening, 0) + IFNULL(saldo_rpl_lpj, 0)) AS total 
      FROM kertas_kerja 
      ${kkFilter}
      GROUP BY tahun, periode 
      ORDER BY tahun ASC, periode ASC
    `, kkParams);

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
        total_dokumen,
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
