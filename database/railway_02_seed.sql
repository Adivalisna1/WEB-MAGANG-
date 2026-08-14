-- ============================================================
-- SEED DATA untuk Railway MySQL
-- Paste file ini SETELAH railway_01_schema.sql berhasil dijalankan
-- ============================================================

INSERT INTO roles (id, nama, deskripsi) VALUES
(1, 'admin', 'Administrator — akses penuh, monitoring user realtime'),
(2, 'staff', 'Staff/User — upload, edit, dan verifikasi dokumen');

-- Password untuk admin dan staff01 adalah: password
INSERT INTO users (role_id, nama, username, email, password_hash, is_active) VALUES
(
    1,
    'Administrator',
    'admin',
    'admin@weblaporan.local',
    '$2b$12$3dvt8uRmDhx8zLtSdv8V7.r3nKmg75cbK25acb0fQs4xhUtEcuFoG',
    1
),
(
    2,
    'Staff Perencanaan',
    'staff01',
    'staff01@weblaporan.local',
    '$2b$12$3dvt8uRmDhx8zLtSdv8V7.r3nKmg75cbK25acb0fQs4xhUtEcuFoG',
    1
);

INSERT INTO kategori_dokumen (nama, slug, deskripsi, urutan) VALUES
('LKjIP',    'lkjip',    'Laporan Kinerja Instansi Pemerintah',               1),
('Renstra',  'renstra',  'Rencana Strategis',                                 2),
('Renja',    'renja',    'Rencana Kerja',                                     3),
('RKT',      'rkt',      'Rencana Kinerja Tahunan',                           4),
('PK',       'pk',       'Perjanjian Kinerja',                                5),
('LAKIP',    'lakip',    'Laporan Akuntabilitas Kinerja Instansi Pemerintah',  6),
('IKU',      'iku',      'Indikator Kinerja Utama',                           7),
('Lainnya',  'lainnya',  'Dokumen perencanaan lainnya',                       99);

INSERT INTO aktivitas_log (user_id, aksi, entitas, detail) VALUES
(1, 'system_init', 'system', JSON_OBJECT('pesan', 'Database Railway berhasil diinisialisasi'));
