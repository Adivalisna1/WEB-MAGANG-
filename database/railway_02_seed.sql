-- ============================================================
-- SEED DATA untuk Railway MySQL
-- Paste file ini SETELAH railway_01_schema.sql berhasil dijalankan
-- ============================================================

INSERT INTO roles (id, nama, deskripsi) VALUES
(1, 'admin', 'Administrator — akses penuh, monitoring user realtime'),
(2, 'staff', 'Staff/User — upload, edit, dan verifikasi dokumen'),
(3, 'ketua_tim', 'Ketua Tim — monitoring sistem, manajemen user, dan reset password'),
(4, 'admin_dept', 'Admin divisi — sama seperti admin tapi data terbatas pada divisinya sendiri');

-- ============================================================
-- DIVISI
-- ============================================================
INSERT INTO divisi (id, nama, slug, urutan) VALUES
(1, 'Perencanaan', 'perencanaan', 1),
(2, 'Keuangan', 'keuangan', 2),
(3, 'Kepegawaian', 'kepegawaian', 3),
(4, 'Hukum', 'hukum', 4),
(5, 'Sekretariat', 'sekretariat', 5);

-- Password untuk semua user default adalah: password
-- divisi_id: NULL = global (admin & ketua tim)
INSERT INTO users (role_id, divisi_id, nama, username, email, password_hash, is_active) VALUES
(
    1,
    NULL,
    'Administrator',
    'admin',
    'admin@weblaporan.local',
    '$2b$12$3dvt8uRmDhx8zLtSdv8V7.r3nKmg75cbK25acb0fQs4xhUtEcuFoG',
    1
),
(
    2,
    1,
    'Staff Perencanaan',
    'staff01',
    'staff01@weblaporan.local',
    '$2b$12$3dvt8uRmDhx8zLtSdv8V7.r3nKmg75cbK25acb0fQs4xhUtEcuFoG',
    1
),
(
    3,
    NULL,
    'Ketua Tim',
    'ketua1',
    'ketua1@weblaporan.local',
    '$2b$12$3dvt8uRmDhx8zLtSdv8V7.r3nKmg75cbK25acb0fQs4xhUtEcuFoG',
    1
),
(
    4,
    2,
    'Admin Keuangan',
    'dept_keuangan',
    'dept_keuangan@weblaporan.local',
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
