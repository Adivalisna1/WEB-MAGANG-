// Global error handler — selalu pasang paling bawah di index.js
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', req.method, req.path, '→', err.message);

  // Error dari multer (upload file)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'Ukuran file melebihi batas 50MB' });
  }

  if (err.message && err.message.includes('Format file')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Error Supabase Storage
  if (err.message && err.message.includes('Supabase')) {
    return res.status(500).json({ success: false, message: `Gagal menyimpan file: ${err.message}` });
  }

  // Error umum
  const status = err.status || err.statusCode || 500;
  // Di production tetap sembunyikan detail, tapi log ke console
  const message = process.env.NODE_ENV === 'production'
    ? (status < 500 ? err.message : `Terjadi kesalahan pada server: ${err.message}`)
    : err.message;

  return res.status(status).json({ success: false, message });
}

module.exports = errorHandler;
