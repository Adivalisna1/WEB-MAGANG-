-- ============================================================
-- SEED DATA untuk Railway MySQL
-- Paste file ini SETELAH railway_01_schema.sql berhasil dijalankan
-- ============================================================

INSERT INTO roles (id, nama, deskripsi) VALUES
(1, 'pimpinan', 'Pimpinan — setara Admin: monitoring seluruh sistem dan hak akses penuh'),
(2, 'satker', 'Satker — setara Staff: upload, edit, dan mengelola dokumen'),
(3, 'eselon_1', 'Eselon 1 — setara Ketua Tim: persetujuan akhir dokumen dan manajemen tingkat atas');

-- Password untuk masing-masing user dibuat berbeda dan kuat untuk production
INSERT INTO users (role_id, nama, username, email, password_hash, is_active) VALUES
(
    1,
    'Pimpinan',
    'pimpinan1',
    'pimpinan1@weblaporan.local',
    -- hash dari: Pimpinan@123
    '$2b$12$.qBWwIa/LiILZ1nPCroZVOrC3WX3M3wb6eJ1bJ.4LDCUSqiIUWsKO',
    1
),
(
    2,
    'Satuan Kerja Perencanaan',
    'satker01',
    'satker01@weblaporan.local',
    -- hash dari: Satker@123
    '$2b$12$CQoe0Wpizb9HetBH3bVuauP4jX3.I86rlzojhd2Kugv6VADwqNtRS',
    1
),
(
    3,
    'Pejabat Eselon 1',
    'eselon1',
    'eselon1@weblaporan.local',
    -- hash dari: Eselon@123
    '$2b$12$4JnfZP7OR2a29sVgtDg9C.cPWd/q33Q8lFbYDzcglN2D1yQNutoty',
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
