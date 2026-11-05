-- ============================================================
-- SEED DATA: Roles, Admin, User, Kategori Dokumen
-- File ini auto-run saat container MySQL pertama kali dibuat
-- ============================================================

USE web_laporan;

-- ============================================================
-- ROLES
-- ============================================================
INSERT INTO roles (id, nama, deskripsi) VALUES
(1, 'pimpinan',     'Administrator — penyaring pertama verifikasi, monitoring user realtime'),
(2, 'staff',     'Staff/User — upload, edit, dan submit dokumen untuk diverifikasi'),
(3, 'eselon_1', 'Ketua Tim — persetujuan final dokumen, manajemen user, dan reset password'),
(4, 'admin_it', 'IT Administrator (Ahli Komputer)'),
(5, 'administrasi', 'Staf Administrasi / Pengelola Master Data');

-- ============================================================
-- USERS DEFAULT
-- Password lokal bervariasi — ganti setelah pertama login!
-- ============================================================
INSERT INTO users (role_id, nama, username, email, password_hash, is_active) VALUES
(
    1,
    'Pimpinan',
    'pimpinan',
    'admin@weblaporan.local',
    -- hash dari: Pimpinan@123
    '$2b$12$zn1vFsic/4tKcr.SJNYl3uX/N33kUlK3118WZDJV/1h9x0RiRQzjy',
    1
),
(
    2,
    'Staff User',
    'staff',
    'staff@weblaporan.local',
    -- hash dari: Satker@123
    '$2b$12$NjNJ/jdaS6bJWi1QgjbVW.3714Znm8nG2XlgfGEge1Pg92cFM2TVG',
    1
),
(
    3,
    'Pejabat Eselon 1',
    'eselon1',
    'eselon1@weblaporan.local',
    -- hash dari: eselon@123
    '$2b$12$ro5p.kDFNQsv4Z1RfXR2aO5qjn4sBoE3lTUwY00U7O.18uu0exJYK',
    1
),
(
    4,
    'IT Administrator',
    'it_admin',
    'itadmin@weblaporan.local',
    -- hash dari: adminIT123
    '$2b$12$sKToS/npmdTRVYXRGAcGBuW4PqPGYDEwvBZtB2jxM.uKey.xCebX6',
    1
),
(
    5,
    'Staf Administrasi',
    'administrasi',
    'admin.data@weblaporan.local',
    -- hash dari: Admin@123
    '$2b$10$SuG04fQkJAiV74yQwg7vLeEHeocQvq.0ZHDwFAE2nUGqHTcM8rM9O', 
    1
);

-- ============================================================
-- KATEGORI DOKUMEN
-- Sesuai jenis laporan umum instansi pemerintah
-- ============================================================
INSERT INTO kategori_dokumen (nama, slug, deskripsi, urutan, perlu_nominal) VALUES
('Rekening_koran',   'Rekening_koran',   'Rekening koran satker',               1, 1),
('Lainnya',  'lainnya', 'Dokumen perencanaan lainnya',                       99, 0);

-- ============================================================
-- LOG AWAL
-- ============================================================
INSERT INTO aktivitas_log (user_id, aksi, entitas, detail) VALUES
(1, 'system_init', 'system', JSON_OBJECT('pesan', 'Database berhasil diinisialisasi'));



-- ============================================================
-- Seed Master Bank
-- ============================================================
INSERT INTO master_bank (kode_bank, nama_bank, singkatan) VALUES
('002', 'Bank BRI', 'BRI'),
('008', 'Bank Mandiri', 'Mandiri'),
('009', 'Bank BNI', 'BNI'),
('110', 'Bank BJB (Jawa Barat & Banten)', 'BJB'),
('113', 'Bank Jateng (Jawa Tengah)', 'Bank Jateng'),
('114', 'Bank Jatim (Jawa Timur)', 'Bank Jatim'),
('118', 'Bank Nagari (Sumatra Barat)', 'Bank Nagari'),
('120', 'Bank Sumsel Babel (Sumatra Selatan & Babel)', 'Sumsel Babel'),
('129', 'Bank BPD Bali', 'BPD Bali'),
('200', 'Bank BTN', 'BTN'),
('425', 'Bank BJB Syariah', 'BJB Syariah'),
('451', 'Bank BSI', 'BSI')
ON DUPLICATE KEY UPDATE nama_bank=VALUES(nama_bank), singkatan=VALUES(singkatan);
