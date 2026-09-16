require('dotenv').config();

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');
const compression  = require('compression');
const rateLimit    = require('express-rate-limit');
const path         = require('path');

const { testConnection } = require('./config/db');
const errorHandler       = require('./middleware/errorHandler');

// Routes
const authRoutes    = require('./routes/auth');
const dokumenRoutes = require('./routes/dokumen');
const userRoutes    = require('./routes/user');
const pimpinanRoutes = require('./routes/pimpinan');
const eselon1Routes  = require('./routes/eselon_1');
const adminItRoutes  = require('./routes/adminIT');
const administrasiRoutes = require('./routes/administrasi');
const notifRoutes    = require('./routes/notifikasi');
const satkerRoutes = require('./routes/satker');
const akuntansiRoutes = require('./routes/akuntansi');
const kertasKerjaRoutes = require('./routes/kertasKerjaRoutes');

const app  = express();
const PORT = process.env.PORT || process.env.APP_PORT || 5000;

// ── Security & Utility Middleware ─────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// CORS — izinkan frontend (CORS_ORIGIN boleh comma-separated untuk beberapa origin)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (mobile apps, curl, dll)
    if (!origin) return callback(null, true);
    // Izinkan semua subdomain vercel.app
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Rate Limiter — cegah brute force ─────────────────────────
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak request, coba lagi dalam 1 menit' },
});
app.use('/api', limiter);

// Rate limit ketat khusus login
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 10,
  message: { success: false, message: 'Terlalu banyak percobaan login, tunggu 1 menit' },
});
app.use('/api/auth/login', loginLimiter);

// ── Static files — serve file upload ─────────────────────────
// Hanya file yang sudah terverifikasi yang bisa diakses via /api/dokumen/:id/download
// Folder uploads tidak diekspos langsung ke publik
app.use('/uploads', (req, res) => {
  res.status(403).json({ success: false, message: 'Akses langsung tidak diizinkan' });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/dokumen', dokumenRoutes);
app.use('/api/user',    userRoutes);
app.use('/api/pimpinan', pimpinanRoutes);
app.use('/api/eselon-1', eselon1Routes);
app.use('/api/admin-it', adminItRoutes);
app.use('/api/administrasi', administrasiRoutes);
app.use('/api/notifikasi', notifRoutes);
app.use('/api/satker', satkerRoutes);
app.use('/api/akuntansi', akuntansiRoutes);
app.use('/api/kertas-kerja', kertasKerjaRoutes);
// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server berjalan',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/debug-env', (req, res) => {
  res.json({
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasDbUrl: !!process.env.DATABASE_URL,
    secretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    dbUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0
  });
});

app.get('/api/fix-db', async (req, res) => {
  try {
    const { pool } = require('./config/db');
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN reset_password_token VARCHAR(255) NULL, 
      ADD COLUMN reset_password_expires_at TIMESTAMP NULL;
    `);
    res.json({ success: true, message: 'Database fixed! Columns added.' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/api/debug-users', async (req, res) => {
  try {
    const { pool } = require('./config/db');
    const [rows] = await pool.query('SELECT id, username, email, password_hash, reset_password_token, is_active FROM users ORDER BY id DESC LIMIT 5');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} tidak ditemukan` });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
if (!process.env.VERCEL) {
  testConnection().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server berjalan di http://0.0.0.0:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });
  }).catch(console.error);
} else {
  // On Vercel, just test connection lazily
  testConnection().catch(console.error);
}

module.exports = app;
