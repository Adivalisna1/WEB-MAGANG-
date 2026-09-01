const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Pakai env UPLOAD_DIR kalau ada, fallback ke path relatif dari file ini
// Docker: /app/uploads | Lokal: backend/uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

// Pastikan folder uploads/{tahun} ada
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const tahun = req.body.tahun || new Date().getFullYear();
    const dir   = path.join(UPLOAD_DIR, String(tahun));
    ensureDir(dir);
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext      = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext)
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9\-_]/g, '')
      .toLowerCase();
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${baseName}-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Gunakan PDF, DOC, DOCX, XLS, XLSX.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // maks 50MB
});

module.exports = upload;
