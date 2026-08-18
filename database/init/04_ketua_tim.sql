-- ============================================================
-- MIGRATION: Tambah role Ketua Tim (ketua_tim)
-- Untuk database yang SUDAH ADA sebelum fitur ketua tim.
-- Aman dijalankan berulang (idempotent): pakai INSERT IGNORE
-- dan cek kolom sebelum ALTER.
--
-- Cara jalankan (dari folder project):
--   docker-compose exec -T db mysql -u root -p"<password root dari .env>" web_laporan < database/init/04_ketua_tim.sql
-- ============================================================

USE web_laporan;

-- 1. Role baru ketua_tim (role_id 3)
INSERT IGNORE INTO roles (id, nama, deskripsi) VALUES
(3, 'ketua_tim', 'Ketua Tim — monitoring sistem, manajemen user, dan reset password');

-- 2. User default ketua tim — username: ketua1, password: ketua@123
--    GANTI PASSWORD setelah pertama login!
INSERT IGNORE INTO users (role_id, nama, username, email, password_hash, is_active) VALUES
(
    3,
    'Ketua Tim',
    'ketua1',
    'ketua1@weblaporan.local',
    -- hash dari: ketua@123
    '$2b$12$rtQwql4GN6RLqh1DT2xAA.IbGnD0mXxMVtz0xYFWcZQl.298qfpmm',
    1
);

-- 3. Tambah kolom password_reset_at kalau belum ada
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'password_reset_at'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE users ADD COLUMN password_reset_at TIMESTAMP NULL AFTER last_login',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
