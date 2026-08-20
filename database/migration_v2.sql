-- ============================================================
-- MIGRATION: Refactoring Major v2.0
-- Jalankan di Docker lokal:
--   docker exec web_laporan_db mysql -u laporan_user "-p#user223" web_laporan < database/migration_v2.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Hapus kolom divisi_id dari dokumen
ALTER TABLE dokumen DROP FOREIGN KEY fk_dokumen_divisi;
ALTER TABLE dokumen DROP INDEX  idx_dokumen_divisi;
ALTER TABLE dokumen DROP COLUMN divisi_id;

-- 2. Hapus kolom divisi_id dari users
ALTER TABLE users DROP FOREIGN KEY fk_users_divisi;
ALTER TABLE users DROP COLUMN  divisi_id;

-- 3. Hapus tabel divisi
DROP TABLE IF EXISTS divisi;

-- 4. Downgrade user admin_dept ke staff, lalu hapus role-nya
UPDATE users SET role_id = 2 WHERE role_id = 4;
DELETE FROM roles WHERE id = 4;

SET FOREIGN_KEY_CHECKS = 1;

-- 5. Tambah status 'lolos_admin' ke ENUM status dokumen
ALTER TABLE dokumen MODIFY COLUMN status ENUM(
  'draft',
  'menunggu_verifikasi',
  'lolos_admin',
  'terverifikasi',
  'revisi',
  'diarsipkan'
) NOT NULL DEFAULT 'draft';

-- 6. Tambah kolom semester (1 atau 2, opsional)
ALTER TABLE dokumen ADD COLUMN semester TINYINT UNSIGNED NULL
  COMMENT '1=Semester 1 (Jan-Jun), 2=Semester 2 (Jul-Des)' AFTER bulan;

-- 7. Tambah kolom nomor_laporan (kode tracking unik)
ALTER TABLE dokumen ADD COLUMN nomor_laporan VARCHAR(50) NULL UNIQUE
  COMMENT 'Contoh: LKJIP/2024/001' AFTER semester;

-- 8. Tambah kolom catatan_oleh (role reviewer yang terakhir memberi catatan)
ALTER TABLE dokumen ADD COLUMN catatan_oleh VARCHAR(20) NULL
  COMMENT 'admin atau ketua_tim' AFTER catatan;

-- Verifikasi
SELECT 'Migration v2.0 SELESAI' AS hasil;
SELECT id, nama FROM roles ORDER BY id;
