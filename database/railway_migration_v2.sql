-- ============================================================
-- MIGRATION v2.0 untuk Railway MySQL
-- Jalankan di: Railway → MySQL → tab "Database" → input query
-- JALANKAN SATU BLOK PER SATU di Railway Console
-- ============================================================

-- ============================================
-- BLOK 1: Nonaktifkan cek FK sementara
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- BLOK 2: Hapus kolom divisi_id dari dokumen
-- (Jalankan hanya jika kolom masih ada)
-- ============================================
ALTER TABLE dokumen
  DROP FOREIGN KEY IF EXISTS fk_dokumen_divisi,
  DROP INDEX IF EXISTS idx_dokumen_divisi;

ALTER TABLE dokumen
  DROP COLUMN IF EXISTS divisi_id;

-- ============================================
-- BLOK 3: Hapus kolom divisi_id dari users
-- ============================================
ALTER TABLE users
  DROP FOREIGN KEY IF EXISTS fk_users_divisi,
  DROP COLUMN IF EXISTS divisi_id;

-- ============================================
-- BLOK 4: Hapus tabel divisi
-- ============================================
DROP TABLE IF EXISTS divisi;

-- ============================================
-- BLOK 5: Downgrade role admin_dept → staff,
-- lalu hapus role admin_dept
-- ============================================
UPDATE users SET role_id = 2 WHERE role_id = 4;
DELETE FROM roles WHERE id = 4;

-- ============================================
-- BLOK 6: Tambah status lolos_admin ke ENUM
-- ============================================
ALTER TABLE dokumen MODIFY COLUMN status ENUM(
  'draft',
  'menunggu_verifikasi',
  'lolos_admin',
  'terverifikasi',
  'revisi',
  'diarsipkan'
) NOT NULL DEFAULT 'draft';

-- ============================================
-- BLOK 7: Tambah kolom semester (jika belum ada)
-- ============================================
ALTER TABLE dokumen
  ADD COLUMN IF NOT EXISTS semester TINYINT UNSIGNED NULL
  COMMENT '1=Semester 1 (Jan-Jun), 2=Semester 2 (Jul-Des)'
  AFTER bulan;

-- ============================================
-- BLOK 8: Tambah kolom nomor_laporan (jika belum ada)
-- ============================================
ALTER TABLE dokumen
  ADD COLUMN IF NOT EXISTS nomor_laporan VARCHAR(50) NULL UNIQUE
  COMMENT 'Kode tracking, contoh: LKJIP/2024/001'
  AFTER semester;

-- ============================================
-- BLOK 9: Tambah kolom catatan_oleh (jika belum ada)
-- ============================================
ALTER TABLE dokumen
  ADD COLUMN IF NOT EXISTS catatan_oleh VARCHAR(20) NULL
  COMMENT 'admin atau ketua_tim'
  AFTER catatan;

-- ============================================
-- BLOK 10: Aktifkan kembali cek FK
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFIKASI — jalankan ini untuk cek hasil
-- ============================================
SELECT 'TABEL YANG ADA SEKARANG:' AS info;
SHOW TABLES;

SELECT 'KOLOM TABEL DOKUMEN:' AS info;
SHOW COLUMNS FROM dokumen;

SELECT 'ROLES YANG ADA:' AS info;
SELECT id, nama FROM roles ORDER BY id;
