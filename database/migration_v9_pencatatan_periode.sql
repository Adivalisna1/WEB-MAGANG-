-- ============================================================
-- MIGRATION v9: Tambah Kolom Periode pada Tabel Pencatatan
-- ============================================================

ALTER TABLE `pencatatan` 
ADD COLUMN `periode` VARCHAR(50) NULL AFTER `tanggal`;
