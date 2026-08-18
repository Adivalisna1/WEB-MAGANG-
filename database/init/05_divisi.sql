-- ============================================================
-- Migration: Sistem Divisi & role admin_dept
-- Untuk database yang sudah ada SEBELUM fitur divisi.
-- Aman dijalankan berulang kali (idempotent).
--
-- Cara jalankan (dari folder project):
--   Get-Content database/init/05_divisi.sql | docker-compose exec -T db mysql -u root -p"<password root dari .env>"
--
-- ATAU via phpMyAdmin:
--   1. Buka http://localhost:8080
--   2. Pilih database "web_laporan"
--   3. Tab SQL → paste isi file ini → klik "Go"
-- ============================================================

USE web_laporan;

-- 1. Tabel master divisi
CREATE TABLE IF NOT EXISTS divisi (
    id          SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    nama        VARCHAR(100)        NOT NULL UNIQUE,
    slug        VARCHAR(100)        NOT NULL UNIQUE,
    urutan      TINYINT UNSIGNED    NOT NULL DEFAULT 0,
    is_active   TINYINT(1)          NOT NULL DEFAULT 1,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_divisi_slug (slug)
) ENGINE=InnoDB;

-- 2. Kolom divisi_id di users (NULL = global: admin & ketua tim)
SET @col := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'divisi_id');
SET @sql := IF(@col = 0,
    'ALTER TABLE users ADD COLUMN divisi_id SMALLINT UNSIGNED NULL AFTER role_id,
     ADD CONSTRAINT fk_users_divisi FOREIGN KEY (divisi_id) REFERENCES divisi(id) ON DELETE SET NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Kolom divisi_id di dokumen (diisi otomatis dari divisi uploader)
SET @col2 := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dokumen' AND COLUMN_NAME = 'divisi_id');
SET @sql2 := IF(@col2 = 0,
    'ALTER TABLE dokumen ADD COLUMN divisi_id SMALLINT UNSIGNED NULL AFTER kategori_id,
     ADD CONSTRAINT fk_dokumen_divisi FOREIGN KEY (divisi_id) REFERENCES divisi(id) ON DELETE SET NULL,
     ADD INDEX idx_dokumen_divisi (divisi_id)',
    'SELECT 1');
PREPARE stmt FROM @sql2; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Role admin_dept (role_id 4) — admin dengan data ter-scope divisinya
INSERT IGNORE INTO roles (id, nama, deskripsi) VALUES
(4, 'admin_dept', 'Admin divisi — sama seperti admin tapi data terbatas pada divisinya sendiri');

-- 5. Seed divisi awal (bisa diubah/tambah/hapus lewat menu Kelola Divisi admin)
INSERT IGNORE INTO divisi (id, nama, slug, urutan) VALUES
(1, 'Perencanaan', 'perencanaan', 1),
(2, 'Keuangan', 'keuangan', 2),
(3, 'Kepegawaian', 'kepegawaian', 3),
(4, 'Hukum', 'hukum', 4),
(5, 'Sekretariat', 'sekretariat', 5);

-- 6. Backfill: staff lama → divisi Perencanaan; dokumen lama ikut divisi uploader
UPDATE users SET divisi_id = 1 WHERE role_id = 2 AND divisi_id IS NULL;
UPDATE dokumen d JOIN users u ON u.id = d.uploaded_by
   SET d.divisi_id = u.divisi_id
 WHERE d.divisi_id IS NULL;

-- 7. User admin_dept default — username: dept_keuangan, password: Dept@123
--    WAJIB ganti password setelah deploy production!
INSERT IGNORE INTO users (role_id, divisi_id, nama, username, email, password_hash, is_active) VALUES
(
    4,
    2,
    'Admin Keuangan',
    'dept_keuangan',
    'dept_keuangan@weblaporan.local',
    -- hash dari: Dept@123
    '$2b$12$lSGyiLaqzS/.9c8TSns2yOGaIrBDWQQJt16fQ1CdOosbWzoY9gREK',
    1
);
