// Global error handler — selalu pasang paling bawah di index.js
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);

  // Error dari multer (upload file)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'Ukuran file melebihi batas 100MB' });
  }

  if (err.message && err.message.includes('Format file')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Error validasi dari express-validator ditangani di controller
  // Error umum
  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Terjadi kesalahan pada server';

  return res.status(status).json({ success: false, message });
}

module.exports = errorHandler;
