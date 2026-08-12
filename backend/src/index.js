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
const adminRoutes   = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || process.env.APP_PORT || 5000;

// ── Security & Utility Middleware ─────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// CORS — izinkan frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// ── Rate Limiter — cegah brute force ─────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak request, coba lagi nanti' },
});
app.use('/api', limiter);

// Rate limit ketat khusus login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Terlalu banyak percobaan login, tunggu 15 menit' },
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
app.use('/api/admin',   adminRoutes);

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server berjalan',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} tidak ditemukan` });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
async function start() {
  await testConnection();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server berjalan di http://0.0.0.0:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  });
}

start();
