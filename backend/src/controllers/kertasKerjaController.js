const { pool } = require('../config/db');
const { catatLog } = require('./authController');

// Helper untuk inisialisasi tabel Kertas Kerja jika belum ada
async function initKertasKerjaTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS kertas_kerja (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      satker_id INT UNSIGNED NULL,
      uploaded_by INT UNSIGNED NOT NULL,
      nama_bank VARCHAR(255) NULL,
      nomor_rekening_bank VARCHAR(255) NULL,
      nama_rekening VARCHAR(255) NULL,
      nomor_pembukaan_rekening VARCHAR(255) NULL,
      tanggal_pembukaan_rekening DATE NULL,
      saldo_akhir_bulan DECIMAL(18,2) NOT NULL DEFAULT 0,
      saldo_rk DECIMAL(18,2) NOT NULL DEFAULT 0,
      saldo_rekening DECIMAL(18,2) NOT NULL DEFAULT 0,
      saldo_rpl_lpj DECIMAL(18,2) NOT NULL DEFAULT 0,
      keterangan TEXT NULL,
      periode ENUM('1', '2') DEFAULT '1',
      tahun INT(4) DEFAULT 2026,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_kk_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_kk_satker FOREIGN KEY (satker_id) REFERENCES satkers(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `;
  try {
    await pool.query(query);
    console.log('Tabel kertas_kerja sudah dipastikan ada.');
  } catch (err) {
    console.error('Error init kertas_kerja table:', err);
  }
}

// Panggil init
initKertasKerjaTable();

// ── GET /api/kertas-kerja ─────────────────────────────────────────
async function getKertasKerja(req, res, next) {
  try {
    const role = req.user.role_id;
    let where = '1=1';
    const params = [];

    if (role === 2) {
      if (req.user.satker_id == null) {
        where += ' AND k.satker_id IS NULL';
      } else {
        where += ' AND k.satker_id = ?';
        params.push(req.user.satker_id);
      }
    }
    
    const [rows] = await pool.query(
      `SELECT k.*, u.nama AS uploader_nama, s.nama AS nama_satker, s.NO_Satker AS kode_satker 
       FROM kertas_kerja k
       LEFT JOIN users u ON u.id = k.uploaded_by
       LEFT JOIN satkers s ON s.id = k.satker_id
       WHERE ${where}
       ORDER BY k.created_at DESC`,
      params
    );

    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── POST /api/kertas-kerja/bulk ──────────────────────────────────
async function bulkInsertKertasKerja(req, res, next) {
  try {
    const { data, satker_id: payloadSatkerId, tahun, periode } = req.body;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data excel kosong atau tidak valid' });
    }

    const satkerId = payloadSatkerId || req.user.satker_id || null;
    const uploadedBy = req.user.id;
    const values = [];

    // Buat mapping NO_Satker -> id
    const [satkersData] = await pool.query('SELECT id, NO_Satker FROM satkers WHERE NO_Satker IS NOT NULL');
    const satkerMap = {};
    satkersData.forEach(s => { satkerMap[s.NO_Satker] = s.id; });

    // Parsing data excel
    for (const row of data) {
      const keys = Object.keys(row);
      const getVal = (keywords) => {
        const k = keys.find(key => keywords.some(kw => key.toLowerCase().includes(kw)));
        return k ? row[k] : null;
      };

      const nama_bank = getVal(['nama bank']) || null;
      const nomor_rekening_bank = getVal(['nomor rekening bank', 'no rek']) || null;
      const nama_rekening = getVal(['nama rekening']) || null;
      const nomor_pembukaan_rekening = getVal(['nomor pembukaan']) || null;

      let tglStr = getVal(['tanggal pembukaan']);
      let tanggal_pembukaan_rekening = null;
      if (tglStr) {
        // Handle excel numeric date
        if (typeof tglStr === 'number') {
           const parsed = new Date((tglStr - (25567 + 2)) * 86400 * 1000);
           if (!isNaN(parsed)) tanggal_pembukaan_rekening = parsed.toISOString().split('T')[0];
        } else {
           const parsed = new Date(tglStr);
           if (!isNaN(parsed)) tanggal_pembukaan_rekening = parsed.toISOString().split('T')[0];
        }
      }

      const parseNum = (val) => parseFloat(String(val).replace(/[^0-9.-]+/g,"")) || 0;

      const saldo_akhir_bulan = parseNum(row['SALDO PER AKHIR BULAN'] || getVal(['saldo per akhir bulan', 'saldo per 30', 'saldo per']));
      const saldo_rk = parseNum(row['SALDO PER AKHIR BULAN (RK)'] || getVal(['(rk)']));
      const saldo_rekening = parseNum(row['LAPORAN SALDO PER AKHIR BULAN (SALDO REKENING)'] || getVal(['(saldo rekening)']));
      const saldo_rpl_lpj = parseNum(row['SALDO PER AKHIR BULAN (RPL/LPJ)'] || getVal(['(rpl/lpj)']));
      const keterangan = getVal(['keterangan']) || null;

      let rowSatkerId = satkerId;
      const kodeSatker = getVal(['kode satker', 'no_satker']);
      if (kodeSatker) {
          const matchId = satkerMap[kodeSatker] || satkerMap[parseInt(kodeSatker)];
          if (matchId) rowSatkerId = matchId;
      }

      const excelTahun = getVal(['tahun']);
      const excelPeriode = getVal(['periode']);

      values.push([
        rowSatkerId, uploadedBy, nama_bank, nomor_rekening_bank, nama_rekening, 
        nomor_pembukaan_rekening, tanggal_pembukaan_rekening, 
        saldo_akhir_bulan, saldo_rk, saldo_rekening, saldo_rpl_lpj, keterangan,
        excelTahun || tahun || 2026, excelPeriode ? String(excelPeriode) : (periode || '1')
      ]);
    }

    if (values.length > 0) {
      await pool.query(
        `INSERT INTO kertas_kerja (
          satker_id, uploaded_by, nama_bank, nomor_rekening_bank, nama_rekening,
          nomor_pembukaan_rekening, tanggal_pembukaan_rekening,
          saldo_akhir_bulan, saldo_rk, saldo_rekening, saldo_rpl_lpj, keterangan, tahun, periode
        ) VALUES ?`,
        [values]
      );
    }

    await catatLog({
      user_id: req.user.id,
      aksi: 'upload_rekening_koran',
      entitas: 'kertas_kerja',
      entitas_id: null,
      detail: { jumlah_baris: values.length },
      ip: req.ip,
    });

    return res.status(201).json({ success: true, message: `Berhasil menyimpan ${values.length} baris data.` });
  } catch (err) { next(err); }
}

// ── POST /api/kertas-kerja ──────────────────────────────────────
async function createKertasKerja(req, res, next) {
  try {
    const { 
      nama_bank, nomor_rekening_bank, nama_rekening, nomor_pembukaan_rekening, 
      tanggal_pembukaan_rekening, saldo_akhir_bulan, saldo_rk, saldo_rekening, saldo_rpl_lpj, keterangan,
      tahun, periode
    } = req.body;
    
    const satkerId = req.user.satker_id || null;
    const uploadedBy = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO kertas_kerja (
        satker_id, uploaded_by, nama_bank, nomor_rekening_bank, nama_rekening,
        nomor_pembukaan_rekening, tanggal_pembukaan_rekening,
        saldo_akhir_bulan, saldo_rk, saldo_rekening, saldo_rpl_lpj, keterangan, tahun, periode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        satkerId, uploadedBy, nama_bank || null, nomor_rekening_bank || null, nama_rekening || null,
        nomor_pembukaan_rekening || null, tanggal_pembukaan_rekening || null,
        saldo_akhir_bulan || 0, saldo_rk || 0, saldo_rekening || 0, saldo_rpl_lpj || 0, keterangan || null,
        tahun || 2026, periode || '1'
      ]
    );

    await catatLog({
      user_id: req.user.id,
      aksi: 'create_rekening_koran',
      entitas: 'kertas_kerja',
      entitas_id: result.insertId,
      detail: { nama_bank },
      ip: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Data berhasil ditambahkan', data: { id: result.insertId } });
  } catch (err) { next(err); }
}

// ── PUT /api/kertas-kerja/:id ──────────────────────────────────────
async function updateKertasKerja(req, res, next) {
  try {
    const { id } = req.params;
    const { 
      nama_bank, nomor_rekening_bank, nama_rekening, nomor_pembukaan_rekening, 
      tanggal_pembukaan_rekening, saldo_akhir_bulan, saldo_rk, saldo_rekening, saldo_rpl_lpj, keterangan,
      tahun, periode
    } = req.body;

    const [result] = await pool.query(
      `UPDATE kertas_kerja SET 
        nama_bank = ?, nomor_rekening_bank = ?, nama_rekening = ?, 
        nomor_pembukaan_rekening = ?, tanggal_pembukaan_rekening = ?, 
        saldo_akhir_bulan = ?, saldo_rk = ?, saldo_rekening = ?, saldo_rpl_lpj = ?, keterangan = ?,
        tahun = ?, periode = ?
       WHERE id = ?`,
      [
        nama_bank || null, nomor_rekening_bank || null, nama_rekening || null,
        nomor_pembukaan_rekening || null, tanggal_pembukaan_rekening || null,
        saldo_akhir_bulan || 0, saldo_rk || 0, saldo_rekening || 0, saldo_rpl_lpj || 0, keterangan || null, 
        tahun || 2026, periode || '1',
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    await catatLog({
      user_id: req.user.id,
      aksi: 'update_rekening_koran',
      entitas: 'kertas_kerja',
      entitas_id: id,
      ip: req.ip,
    });

    return res.json({ success: true, message: 'Data berhasil diupdate' });
  } catch (err) { next(err); }
}

// ── DELETE /api/kertas-kerja/:id ──────────────────────────────────
async function deleteKertasKerja(req, res, next) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(`DELETE FROM kertas_kerja WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    await catatLog({
      user_id: req.user.id,
      aksi: 'delete_rekening_koran',
      entitas: 'kertas_kerja',
      entitas_id: id,
      ip: req.ip,
    });

    return res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (err) { next(err); }
}

module.exports = {
  initKertasKerjaTable,
  getKertasKerja,
  bulkInsertKertasKerja,
  createKertasKerja,
  updateKertasKerja,
  deleteKertasKerja
};
