-- ============================================================
-- MIGRATION v3: Fitur Perbandingan Nominal + Single Device
-- ============================================================

-- 1. Toggle perbandingan nominal pada kategori
ALTER TABLE kategori_dokumen
  ADD COLUMN perlu_nominal TINYINT(1) NOT NULL DEFAULT 0
  COMMENT '1 = butuh input perbandingan rekening koran vs excel, 0 = tidak';

-- 2. Kolom nominal pada tabel dokumen
ALTER TABLE dokumen
  ADD COLUMN nilai_rekening_koran DECIMAL(18,2) NULL COMMENT 'Nominal rekening koran',
  ADD COLUMN nilai_excel          DECIMAL(18,2) NULL COMMENT 'Nominal data excel';
