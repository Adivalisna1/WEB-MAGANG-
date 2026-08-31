const path   = require('path');
const fs     = require('fs');
const os     = require('os');
const { execFile } = require('child_process');
const { body, param } = require('express-validator');
const { pool } = require('../config/db');
const { catatLog } = require('./authController');
const { buatNotifikasi } = require('./notifikasiController');

// ── Helper: generate nomor laporan ────────────────────────────
// Format: SLUG-KATEGORI/TAHUN/ID (contoh: LKJIP/2024/042)
function buatNomorLaporan(slug, tahun, id) {
  const kode = (slug || 'DOK').toUpperCase().replace(/-/g, '');
  return `${kode}/${tahun}/${String(id).padStart(3, '0')}`;
}

// ── Validation rules ──────────────────────────────────────────
const uploadRules = [
  body('judul').trim().notEmpty().withMessage('Judul wajib diisi'),
  body('tahun').isInt({ min: 2000, max: 2100 }).withMessage('Tahun tidak valid'),
  body('bulan').optional({ nullable: true }).isInt({ min: 1, max: 12 }).withMessage('Bulan tidak valid (1-12)'),
  body('semester').optional({ nullable: true }).isInt({ min: 1, max: 2 }).withMessage('Semester harus 1 atau 2'),
  body('kategori_id').isInt({ min: 1 }).withMessage('Kategori wajib dipilih'),
  body('deskripsi').optional().trim(),
];

const editRules = [
  param('id').isInt({ min: 1 }),
  body('judul').optional().trim().notEmpty().withMessage('Judul tidak boleh kosong'),
  body('tahun').optional().isInt({ min: 2000, max: 2100 }),
  body('bulan').optional({ nullable: true }).isInt({ min: 1, max: 12 }).withMessage('Bulan tidak valid (1-12)'),
  body('semester').optional({ nullable: true }).isInt({ min: 1, max: 2 }).withMessage('Semester harus 1 atau 2'),
  body('kategori_id').optional().isInt({ min: 1 }),
  body('deskripsi').optional().trim(),
];

// ── GET /api/dokumen (publik) ─────────────────────────────────
async function getDokumenPublik(req, res, next) {
  try {
    const { kategori, tahun, q, nomor, page = 1, limit = 12 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = 'd.status = "terverifikasi" AND d.is_public = 1';
    const params = [];

    if (kategori) { where += ' AND k.slug = ?';  params.push(kategori); }
    if (tahun)    { where += ' AND d.tahun = ?';  params.push(tahun); }
    if (nomor)    { where += ' AND d.nomor_laporan LIKE ?'; params.push(`%${nomor}%`); }
    if (q) {
      const escaped = q.replace(/[%_\\]/g, '\\$&');
      where += ' AND (d.judul LIKE ? OR d.nomor_laporan LIKE ?)';
      params.push(`%${escaped}%`, `%${escaped}%`);
    }

    const [rows] = await pool.query(
      `SELECT d.id, d.judul, d.deskripsi, d.tahun, d.bulan, d.semester,
              d.nomor_laporan, d.file_nama, d.file_size, d.file_mime,
              d.download_count, d.created_at,
              k.nama AS kategori, k.slug AS kategori_slug
       FROM dokumen d
       JOIN kategori_dokumen k ON k.id = d.kategori_id
       WHERE ${where}
       ORDER BY d.tahun DESC, d.bulan DESC, d.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM dokumen d
       JOIN kategori_dokumen k ON k.id = d.kategori_id
       WHERE ${where}`,
      params
    );

    return res.json({
      success: true,
      data: rows,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
}

// ── GET /api/dokumen/:id (publik — detail) ────────────────────
async function getDokumenDetail(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT d.id, d.judul, d.deskripsi, d.tahun, d.bulan, d.semester,
              d.nomor_laporan, d.file_nama, d.file_size, d.file_mime,
              d.download_count, d.created_at,
              k.nama AS kategori, k.slug AS kategori_slug
       FROM dokumen d
       JOIN kategori_dokumen k ON k.id = d.kategori_id
       WHERE d.id = ? AND d.status = 'terverifikasi' AND d.is_public = 1`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
}

// ── GET /api/dokumen/:id/download (publik) ────────────────────
async function downloadDokumen(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, judul, file_nama, file_path, file_mime, status, is_public
       FROM dokumen WHERE id = ?`,
      [req.params.id]
    );

    if (!rows.length || rows[0].status !== 'terverifikasi' || !rows[0].is_public) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }

    const dok = rows[0];
    const filePath = dok.file_path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File tidak ditemukan di server' });
    }

    await pool.query('UPDATE dokumen SET download_count = download_count + 1 WHERE id = ?', [dok.id]);

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(dok.file_nama)}"`);
    res.setHeader('Content-Type', dok.file_mime || 'application/octet-stream');
    return res.sendFile(filePath);
  } catch (err) { next(err); }
}

// ── GET /api/dokumen/all (staff + admin) ──────────────────────
async function getAllDokumen(req, res, next) {
  try {
    const { status, kategori, tahun, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = '1=1';
    const params = [];

    // Staff hanya lihat dokumennya sendiri
    if (req.user.role_id === 2) {
      where += ' AND d.uploaded_by = ?';
      params.push(req.user.id);
    }

    if (status)   { where += ' AND d.status = ?';    params.push(status); }
    if (kategori) { where += ' AND k.slug = ?';      params.push(kategori); }
    if (tahun)    { where += ' AND d.tahun = ?';     params.push(tahun); }

    const [rows] = await pool.query(
      `SELECT d.id, d.judul, d.tahun, d.bulan, d.semester, d.nomor_laporan,
              d.status, d.catatan, d.catatan_oleh, d.file_nama, d.file_size,
              d.download_count, d.is_public, d.created_at, d.updated_at,
              d.nilai_rekening_koran, d.nilai_excel,
              k.nama AS kategori, k.perlu_nominal, u.nama AS uploaded_by
       FROM dokumen d
       JOIN kategori_dokumen k ON k.id = d.kategori_id
       JOIN users u ON u.id = d.uploaded_by
       WHERE ${where}
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM dokumen d
       JOIN kategori_dokumen k ON k.id = d.kategori_id
       WHERE ${where}`,
      params
    );

    return res.json({
      success: true,
      data: rows,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
}

// ── POST /api/dokumen/upload (staff) ─────────────────────────
async function uploadDokumen(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File wajib diupload' });
    }

    const { judul, tahun, kategori_id, deskripsi } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // ── Validasi duplikat: cek judul + kategori + tahun ──────
    const [duplikat] = await pool.query(
      `SELECT id, status FROM dokumen
       WHERE LOWER(judul) = LOWER(?)
         AND kategori_id = ?
         AND tahun = ?
         AND status NOT IN ('diarsipkan')`,
      [judul.trim(), kategori_id, tahun]
    );

    if (duplikat.length > 0) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      const statusAda = duplikat[0].status.replace(/_/g, ' ');
      return res.status(409).json({
        success: false,
        message: `Dokumen dengan judul, kategori, dan tahun yang sama sudah ada (status: ${statusAda}). Gunakan judul berbeda atau hapus dokumen lama terlebih dahulu.`,
      });
    }

    const { bulan, semester } = req.body;

    // Periode: pilih salah satu — jika semester diisi, bulan diabaikan
    const bulanFinal    = semester ? null : (bulan ? Number(bulan) : null);
    const semesterFinal = semester ? Number(semester) : null;

    // Ambil slug kategori untuk nomor laporan
    const [[katRow]] = await pool.query('SELECT slug FROM kategori_dokumen WHERE id = ?', [kategori_id]);

    // Ambil nilai nominal (opsional, tergantung kategori)
    const nilaiRekKoran = req.body.nilai_rekening_koran ? Number(req.body.nilai_rekening_koran) : null;
    const nilaiExcel    = req.body.nilai_excel ? Number(req.body.nilai_excel) : null;

    const [result] = await pool.query(
      `INSERT INTO dokumen
         (kategori_id, uploaded_by, judul, deskripsi, tahun, bulan, semester,
          file_nama, file_path, file_size, file_mime, status, is_public,
          nilai_rekening_koran, nilai_excel)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 0, ?, ?)`,
      [kategori_id, req.user.id, judul, deskripsi || null,
       tahun, bulanFinal, semesterFinal,
       fileName, filePath, req.file.size, req.file.mimetype,
       nilaiRekKoran, nilaiExcel]
    );

    // Generate dan simpan nomor laporan
    const nomorLaporan = buatNomorLaporan(katRow?.slug, tahun, result.insertId);
    await pool.query('UPDATE dokumen SET nomor_laporan = ? WHERE id = ?', [nomorLaporan, result.insertId]);

    await catatLog({
      user_id: req.user.id,
      aksi: 'upload',
      entitas: 'dokumen',
      entitas_id: result.insertId,
      detail: { judul, tahun, kategori_id, file_nama: fileName, nomor_laporan: nomorLaporan },
      ip: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Dokumen berhasil diupload, status: draft',
      data: { id: result.insertId, nomor_laporan: nomorLaporan },
    });
  } catch (err) { next(err); }
}

// ── PATCH /api/dokumen/:id (staff — edit metadata) ────────────
async function editDokumen(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM dokumen WHERE id = ?', [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }

    const dok = rows[0];

    // Staff hanya bisa edit miliknya sendiri dan hanya saat draft/revisi
    if (req.user.role_id === 2 && dok.uploaded_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bukan dokumen Anda' });
    }
    if (dok.status !== 'draft' && dok.status !== 'revisi') {
      return res.status(400).json({ success: false, message: 'Hanya dokumen draft atau revisi yang bisa diedit' });
    }

    const { judul, tahun, bulan, semester, kategori_id, deskripsi } = req.body;

    // Periode: pilih salah satu — Bulan ATAU Semester (tidak keduanya)
    const bulanVal    = bulan ? Number(bulan) : null;
    const semesterVal = semester ? Number(semester) : null;
    let bulanFinal = dok.bulan, semesterFinal = dok.semester;
    if (bulanVal)          { bulanFinal = bulanVal;    semesterFinal = null; }
    else if (semesterVal)  { semesterFinal = semesterVal; bulanFinal = null; }
    else if (bulan !== undefined || semester !== undefined) {
      // Form mengirim keduanya kosong → periode dikosongkan
      bulanFinal = null; semesterFinal = null;
    }

    // ── Validasi duplikat saat edit ──────────────────────────
    const judulFinal    = judul       || dok.judul;
    const tahunFinal    = tahun       || dok.tahun;
    const kategoriFinal = kategori_id || dok.kategori_id;

    const [duplikat] = await pool.query(
      `SELECT id FROM dokumen
       WHERE LOWER(judul) = LOWER(?)
         AND kategori_id  = ?
         AND tahun        = ?
         AND id           != ?
         AND status NOT IN ('diarsipkan')`,
      [judulFinal.toString().trim(), kategoriFinal, tahunFinal, id]
    );

    if (duplikat.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Dokumen dengan judul, kategori, dan tahun yang sama sudah ada. Gunakan judul atau tahun yang berbeda.',
      });
    }

    // Nilai nominal (opsional)
    const nilaiRekKoran = req.body.nilai_rekening_koran !== undefined ? (req.body.nilai_rekening_koran ? Number(req.body.nilai_rekening_koran) : null) : undefined;
    const nilaiExcel    = req.body.nilai_excel !== undefined ? (req.body.nilai_excel ? Number(req.body.nilai_excel) : null) : undefined;

    await pool.query(
      `UPDATE dokumen SET
         judul       = COALESCE(?, judul),
         tahun       = COALESCE(?, tahun),
         bulan       = ?,
         semester    = ?,
         kategori_id = COALESCE(?, kategori_id),
         deskripsi   = COALESCE(?, deskripsi),
         nilai_rekening_koran = COALESCE(?, nilai_rekening_koran),
         nilai_excel          = COALESCE(?, nilai_excel)
       WHERE id = ?`,
      [judul || null, tahun || null,
       bulanFinal, semesterFinal,
       kategori_id || null, deskripsi || null,
       nilaiRekKoran !== undefined ? nilaiRekKoran : null,
       nilaiExcel !== undefined ? nilaiExcel : null,
       id]
    );

    return res.json({ success: true, message: 'Dokumen berhasil diupdate', data: { id: Number(id) } });
  } catch (err) { next(err); }
}

// ── PATCH /api/dokumen/:id/submit (staff — ajukan verifikasi) ─
async function submitVerifikasi(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM dokumen WHERE id = ? AND uploaded_by = ?',
      [req.params.id, req.user.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }
    if (rows[0].status !== 'draft' && rows[0].status !== 'revisi') {
      return res.status(400).json({ success: false, message: 'Hanya dokumen draft atau revisi yang bisa diajukan' });
    }

    await pool.query(
      "UPDATE dokumen SET status = 'menunggu_verifikasi', catatan = NULL, catatan_oleh = NULL WHERE id = ?",
      [req.params.id]
    );

    // Notifikasi ke semua admin: ada dokumen baru yang diajukan
    try {
      const [admins] = await pool.query('SELECT id FROM users WHERE role_id = 1 AND is_active = 1');
      const [staffInfo] = await pool.query('SELECT nama FROM users WHERE id = ?', [req.user.id]);
      const staffNama = staffInfo[0]?.nama || 'Staff';
      const judulDok = rows[0].judul;

      for (const admin of admins) {
        await buatNotifikasi({
          user_id: admin.id,
          aksi: 'submit',
          dokumen_id: Number(req.params.id),
          judul: judulDok,
          pesan: `${staffNama} mengajukan "${judulDok}" untuk ditinjau`,
        });
      }
    } catch (notifErr) {
      console.error('[NOTIFIKASI] Gagal kirim notifikasi submit:', notifErr.message);
    }

    return res.json({ success: true, message: 'Dokumen diajukan untuk verifikasi', data: { id: Number(req.params.id) } });
  } catch (err) { next(err); }
}

// ── PATCH /api/dokumen/:id/verify (admin — penyaring pertama) ─
// Admin hanya bisa loloskan ke Ketua Tim atau kembalikan revisi
async function verifikasiDokumen(req, res, next) {
  try {
    const { aksi, catatan } = req.body; // aksi: 'lolos' | 'reject'
    if (!['lolos', 'reject'].includes(aksi)) {
      return res.status(400).json({ success: false, message: 'Aksi harus lolos atau reject' });
    }

    const [rows] = await pool.query('SELECT * FROM dokumen WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }

    if (rows[0].status !== 'menunggu_verifikasi') {
      return res.status(400).json({ success: false, message: 'Dokumen tidak dalam antrian verifikasi' });
    }

    const newStatus = aksi === 'lolos' ? 'lolos_admin' : 'revisi';
    const isPublic  = 0; // belum publik sampai Ketua Tim setujui

    await pool.query(
      `UPDATE dokumen SET status = ?, is_public = ?, catatan = ?, catatan_oleh = 'admin',
       verified_by = ?, verified_at = NOW() WHERE id = ?`,
      [newStatus, isPublic, catatan || null, req.user.id, req.params.id]
    );

    await catatLog({
      user_id: req.user.id,
      aksi: aksi === 'lolos' ? 'admin_loloskan' : 'admin_revisi',
      entitas: 'dokumen',
      entitas_id: Number(req.params.id),
      detail: { aksi, catatan: catatan || null, status_baru: newStatus },
      ip: req.ip,
    });

    // Notifikasi
    try {
      const judulDok  = rows[0].judul;
      const uploaderId = rows[0].uploaded_by;

      if (aksi === 'lolos') {
        // Beritahu staff bahwa dokumennya lolos ke Ketua Tim
        await buatNotifikasi({
          user_id: uploaderId,
          aksi: 'lolos_admin',
          dokumen_id: Number(req.params.id),
          judul: judulDok,
          pesan: `Dokumen "${judulDok}" lolos tinjauan admin, menunggu persetujuan Ketua Tim`,
        });
        // Beritahu semua Ketua Tim
        const [ketuaList] = await pool.query('SELECT id FROM users WHERE role_id = 3 AND is_active = 1');
        for (const ketua of ketuaList) {
          await buatNotifikasi({
            user_id: ketua.id,
            aksi: 'submit',
            dokumen_id: Number(req.params.id),
            judul: judulDok,
            pesan: `Dokumen "${judulDok}" sudah diloloskan admin dan menunggu persetujuan Anda`,
          });
        }
      } else {
        // Beritahu staff bahwa dokumennya perlu direvisi
        await buatNotifikasi({
          user_id: uploaderId,
          aksi: 'reject',
          dokumen_id: Number(req.params.id),
          judul: judulDok,
          pesan: `Dokumen "${judulDok}" perlu direvisi${catatan ? `: ${catatan}` : ''}`,
        });
      }
    } catch (notifErr) {
      console.error('[NOTIFIKASI] Gagal kirim notifikasi verifikasi admin:', notifErr.message);
    }

    return res.json({
      success: true,
      message: aksi === 'lolos' ? 'Dokumen diteruskan ke Ketua Tim' : 'Dokumen dikembalikan untuk revisi',
      data: { id: Number(req.params.id) },
    });
  } catch (err) { next(err); }
}

// ── PATCH /api/dokumen/:id/ketua-verify (ketua_tim — persetujuan final) ──
async function verifikasiKetua(req, res, next) {
  try {
    const { aksi, catatan } = req.body; // aksi: 'approve' | 'reject'
    if (!['approve', 'reject'].includes(aksi)) {
      return res.status(400).json({ success: false, message: 'Aksi harus approve atau reject' });
    }

    const [rows] = await pool.query('SELECT * FROM dokumen WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }

    if (rows[0].status !== 'lolos_admin') {
      return res.status(400).json({ success: false, message: 'Dokumen belum diloloskan admin atau sudah diproses' });
    }

    const newStatus = aksi === 'approve' ? 'terverifikasi' : 'revisi';
    const isPublic  = aksi === 'approve' ? 1 : 0;

    await pool.query(
      `UPDATE dokumen SET status = ?, is_public = ?, catatan = ?, catatan_oleh = 'ketua_tim',
       verified_by = ?, verified_at = NOW() WHERE id = ?`,
      [newStatus, isPublic, catatan || null, req.user.id, req.params.id]
    );

    await catatLog({
      user_id: req.user.id,
      aksi: aksi === 'approve' ? 'ketua_setujui' : 'ketua_revisi',
      entitas: 'dokumen',
      entitas_id: Number(req.params.id),
      detail: { aksi, catatan: catatan || null, status_baru: newStatus },
      ip: req.ip,
    });

    // Notifikasi ke staff
    try {
      const judulDok  = rows[0].judul;
      const uploaderId = rows[0].uploaded_by;
      const pesan = aksi === 'approve'
        ? `Dokumen "${judulDok}" disetujui Ketua Tim dan sudah dipublikasikan`
        : `Dokumen "${judulDok}" perlu direvisi oleh Ketua Tim${catatan ? `: ${catatan}` : ''}`;

      await buatNotifikasi({
        user_id: uploaderId,
        aksi: aksi === 'approve' ? 'approve' : 'reject',
        dokumen_id: Number(req.params.id),
        judul: judulDok,
        pesan,
      });
    } catch (notifErr) {
      console.error('[NOTIFIKASI] Gagal kirim notifikasi verifikasi ketua:', notifErr.message);
    }

    return res.json({
      success: true,
      message: aksi === 'approve' ? 'Dokumen disetujui dan dipublikasikan' : 'Dokumen dikembalikan untuk revisi',
      data: { id: Number(req.params.id) },
    });
  } catch (err) { next(err); }
}

// ── DELETE /api/dokumen/:id (admin) ───────────────────────────
async function deleteDokumen(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM dokumen WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }

    const filePath = rows[0].file_path;
    const judulDok = rows[0].judul;
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM dokumen WHERE id = ?', [req.params.id]);

    await catatLog({
      user_id: req.user.id,
      aksi: 'hapus_dokumen',
      entitas: 'dokumen',
      entitas_id: Number(req.params.id),
      detail: { judul: judulDok },
      ip: req.ip,
    });

    return res.json({ success: true, message: 'Dokumen berhasil dihapus' });
  } catch (err) { next(err); }
}

// ── GET /api/dokumen/stats (publik) ───────────────────────────
async function getStatsPublik(req, res, next) {
  try {
    const [[{ totalDokumen }]]  = await pool.query(
      'SELECT COUNT(*) AS totalDokumen FROM dokumen WHERE status = "terverifikasi" AND is_public = 1'
    );
    const [[{ totalKategori }]] = await pool.query(
      'SELECT COUNT(*) AS totalKategori FROM kategori_dokumen WHERE is_active = 1'
    );
    const [[{ totalDownload }]] = await pool.query(
      'SELECT COALESCE(SUM(download_count), 0) AS totalDownload FROM dokumen WHERE status = "terverifikasi" AND is_public = 1'
    );

    return res.json({
      success: true,
      data: { totalDokumen, totalKategori, totalDownload },
    });
  } catch (err) { next(err); }
}

// ── GET /api/dokumen/kategori (publik) ────────────────────────
async function getKategori(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, nama, slug, deskripsi, perlu_nominal FROM kategori_dokumen WHERE is_active = 1 ORDER BY urutan ASC'
    );
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

// ── PATCH /api/dokumen/:id/file (staff — ganti file saat revisi) ──
async function gantiFileDokumen(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM dokumen WHERE id = ?', [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }

    const dok = rows[0];

    if (dok.status !== 'revisi' && dok.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'File hanya bisa diganti saat status draft atau revisi' });
    }

    if (req.user.role_id === 2 && dok.uploaded_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bukan dokumen Anda' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File baru wajib diupload' });
    }

    if (dok.file_path && fs.existsSync(dok.file_path)) {
      fs.unlinkSync(dok.file_path);
    }

    await pool.query(
      `UPDATE dokumen SET
        file_nama  = ?,
        file_path  = ?,
        file_size  = ?,
        file_mime  = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [req.file.originalname, req.file.path, req.file.size, req.file.mimetype, id]
    );

    return res.json({
      success: true,
      message: 'File berhasil diganti',
      data: { id: Number(id), file_nama: req.file.originalname },
    });
  } catch (err) { next(err); }
}

// ── GET /api/dokumen/:id/preview (admin + ketua only) ─────────
async function previewDokumen(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, judul, file_nama, file_path, file_mime FROM dokumen WHERE id = ?',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
    }

    const dok = rows[0];

    if (!fs.existsSync(dok.file_path)) {
      return res.status(404).json({ success: false, message: 'File tidak ditemukan di server' });
    }

    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Type-Options');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    const mime  = dok.file_mime || '';
    const isPDF = mime === 'application/pdf';

    // ── PDF: kirim langsung (behavior lama, tidak berubah) ──────
    if (isPDF) {
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(dok.file_nama)}"`);
      res.setHeader('Content-Type', 'application/pdf');
      return res.sendFile(dok.file_path);
    }

    // ── Non-PDF (Word / Excel): konversi ke PDF via LibreOffice ─
    const tmpDir   = path.join(os.tmpdir(), 'lo_preview');
    const baseName = path.basename(dok.file_path, path.extname(dok.file_path));
    const pdfPath  = path.join(tmpDir, `${baseName}.pdf`);

    // Pastikan folder tmp ada
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    // Hapus sisa file PDF lama kalau ada
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

    execFile(
      'libreoffice',
      ['--headless', '--convert-to', 'pdf', '--outdir', tmpDir, dok.file_path],
      { timeout: 30000 }, // timeout 30 detik
      (err) => {
        if (err) {
          console.error('[previewDokumen] LibreOffice error:', err.message);
          return res.status(500).json({
            success: false,
            message: 'Gagal mengkonversi file ke PDF untuk preview. Silakan download file langsung.',
          });
        }

        if (!fs.existsSync(pdfPath)) {
          return res.status(500).json({
            success: false,
            message: 'File PDF hasil konversi tidak ditemukan.',
          });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(baseName)}.pdf"`);

        const stream = fs.createReadStream(pdfPath);
        stream.pipe(res);
        stream.on('end', () => {
          // Bersihkan file temp setelah selesai dikirim
          fs.unlink(pdfPath, () => {});
        });
        stream.on('error', (streamErr) => {
          console.error('[previewDokumen] stream error:', streamErr.message);
          fs.unlink(pdfPath, () => {});
        });
      }
    );
  } catch (err) { next(err); }
}

module.exports = {
  getDokumenPublik, getDokumenDetail, downloadDokumen, getAllDokumen,
  uploadDokumen, editDokumen, submitVerifikasi, gantiFileDokumen,
  verifikasiDokumen, verifikasiKetua, deleteDokumen, getKategori,
  previewDokumen, getStatsPublik,
  uploadRules, editRules,
};
