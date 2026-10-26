-- ============================================================
-- MIGRATION v10: Tambah Kolom Satker dan Info Rekening pada Pencatatan
-- ============================================================

USE web_laporan;

ALTER TABLE `pencatatan` 
ADD COLUMN `satker_id` INT UNSIGNED NULL AFTER `id_kategori`,
ADD COLUMN `nomor_rekening` VARCHAR(100) NULL AFTER `satker_id`,
ADD COLUMN `nama_bank` VARCHAR(100) NULL AFTER `nomor_rekening`,
ADD COLUMN `nama_rekening` VARCHAR(255) NULL AFTER `nama_bank`,
ADD INDEX `idx_pencatatan_satker` (`satker_id`);
