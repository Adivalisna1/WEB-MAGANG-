const { pool } = require('../config/db');
const { uploadToR2 } = require('../config/r2');
const path = require('path');

// ── GET /api/rekening-koran ─────────────────────────────────────
async function getRekeningKoran(req, res, next) {
  try {
    const role = req.user.role_id;
    let where = '1=1';
    const params = [];

    if (role === 2) {
      if (req.user.satker_id == null) {
        where += ' AND rk.satker_id IS NULL';
      } else {
        where += ' AND rk.satker_id = ?';
        params.push(req.user.satker_id);
      }
    }
    
    // Tarik data Rekening Koran dan gabungkan dengan Kertas Kerja (Excel) berdasarkan satker_id, tahun, dan periode
    const [rows] = await pool.query(
      `SELECT rk.*, 
              u.nama AS uploader_nama, 
              s.nama AS nama_satker, 
              s.NO_Satker AS kode_satker,
              (SELECT SUM(IFNULL(kk.saldo_akhir_bulan, 0)) 
               FROM kertas_kerja kk 
               WHERE kk.satker_id = rk.satker_id AND kk.tahun = rk.tahun AND kk.periode = rk.periode) AS saldo_excel
       FROM rekening_koran rk
       LEFT JOIN users u ON u.id = rk.uploaded_by
       LEFT JOIN satkers s ON s.id = rk.satker_id
       WHERE ${where}
       ORDER BY rk.created_at DESC`,
      params
    );

    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── POST /api/rekening-koran ────────────────────────────────────
async function tambahRekeningKoran(req, res, next) {
  try {
    // Expected fields: satker_id (optional if staff), jenis, kategori, periode, keterangan, nama_bank, nomor_rekening_bank, tahun, saldo_akhir_periode
    let { satker_id, jenis, kategori, periode, keterangan, nama_bank, nomor_rekening_bank, tahun, saldo_akhir_periode } = req.body;

    // Jika staff, ambil satker dari user login
    if (!satker_id && req.user && req.user.satker_id) {
      satker_id = req.user.satker_id;
    }

    if (!satker_id) {
      return res.status(400).json({ success: false, message: 'No Satker wajib diisi' });
    }

    let r2Key = null;
    let fileName = null;
    let fileSize = null;
    let fileMime = null;

    if (req.file) {
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileMime = req.file.mimetype;
      const ext = path.extname(fileName).toLowerCase();
      const baseName = path.basename(fileName, ext).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '').toLowerCase();
      const uniqueName = `rk-${baseName}-${Date.now()}${ext}`;
      r2Key = await uploadToR2(req.file.buffer, uniqueName, req.file.mimetype, tahun || new Date().getFullYear());
    }

    // 1. Simpan ke rekening_koran
    const [result] = await pool.query(
      `INSERT INTO rekening_koran 
        (satker_id, uploaded_by, jenis, kategori, periode, keterangan, nama_bank, nomor_rekening_bank, tahun, saldo_akhir_periode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [satker_id, req.user ? req.user.id : 1, jenis, kategori, periode, keterangan, nama_bank, nomor_rekening_bank, tahun, saldo_akhir_periode || 0]
    );

    const newRkId = result.insertId;

    // 2. Simpan duplikat ke tabel dokumen (Bypass verification)
    if (r2Key) {
      // Cari kategori_id untuk 'Rekening koran'
      const [katRows] = await pool.query('SELECT id FROM kategori_dokumen WHERE slug = "rekening-koran" OR nama = "Rekening_koran" LIMIT 1');
      let dokumen_kategori_id = 1; // Default
      if (katRows.length > 0) dokumen_kategori_id = katRows[0].id;

      const judul_dokumen = `Rekening Koran ${nama_bank || ''} - ${tahun || ''} P${periode || ''}`;
      
      const [dokResult] = await pool.query(
        `INSERT INTO dokumen
           (kategori_id, uploaded_by, judul, deskripsi, tahun, semester,
            file_nama, file_path, file_size, file_mime, status, is_public,
            nilai_rekening_koran)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'terverifikasi', 1, ?)`,
        [dokumen_kategori_id, req.user ? req.user.id : 1, judul_dokumen, keterangan, tahun, periode,
         fileName, r2Key, fileSize, fileMime, saldo_akhir_periode || 0]
      );

      // Update dokumen_id di rekening_koran
      await pool.query('UPDATE rekening_koran SET dokumen_id = ? WHERE id = ?', [dokResult.insertId, newRkId]);
    }

    return res.json({ success: true, message: 'Data Rekening Koran berhasil ditambahkan' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRekeningKoran,
  tambahRekeningKoran
};
