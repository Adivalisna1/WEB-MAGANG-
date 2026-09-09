-- ============================================================
-- SEED DATA: Roles, Admin, User, Kategori Dokumen
-- File ini auto-run saat container MySQL pertama kali dibuat
-- ============================================================

USE web_laporan;

-- ============================================================
-- ROLES
-- ============================================================
INSERT INTO roles (id, nama, deskripsi) VALUES
(1, 'pimpinan',     'Administrator — penyaring pertama verifikasi, monitoring user realtime'),
(2, 'satker',     'Staff/User — upload, edit, dan submit dokumen untuk diverifikasi'),
(3, 'eselon_1', 'Ketua Tim — persetujuan final dokumen, manajemen user, dan reset password');

-- ============================================================
-- USERS DEFAULT
-- Password lokal bervariasi — ganti setelah pertama login!
-- ============================================================
INSERT INTO users (role_id, nama, username, email, password_hash, is_active) VALUES
(
    1,
    'Pimpinan',
    'pimpinan',
    'admin@weblaporan.local',
    -- hash dari: password
    '$2b$12$JMAAuMCHRz7Hfu6DrHQyIOpdyDKor8WBveh6wI9ywEDNrUXBD9ncq',
    1
),
(
    2,
    'Satuan Kerja Perencanaan',
    'staff01',
    'staff01@weblaporan.local',
    -- hash dari: password
    '$2b$12$JMAAuMCHRz7Hfu6DrHQyIOpdyDKor8WBveh6wI9ywEDNrUXBD9ncq',
    1
),
(
    3,
    'Pejabat Eselon 1',
    'ketua1',
    'ketua1@weblaporan.local',
    -- hash dari: password
    '$2b$12$JMAAuMCHRz7Hfu6DrHQyIOpdyDKor8WBveh6wI9ywEDNrUXBD9ncq',
    1
);

-- ============================================================
-- KATEGORI DOKUMEN
-- Sesuai jenis laporan umum instansi pemerintah
-- ============================================================
INSERT INTO kategori_dokumen (nama, slug, deskripsi, urutan) VALUES
('LKjIP',   'lkjip',   'Laporan Kinerja Instansi Pemerintah',               1),
('Renstra',  'renstra', 'Rencana Strategis',                                 2),
('Renja',    'renja',   'Rencana Kerja',                                     3),
('RKT',      'rkt',     'Rencana Kinerja Tahunan',                           4),
('PK',       'pk',      'Perjanjian Kinerja',                                5),
('LAKIP',    'lakip',   'Laporan Akuntabilitas Kinerja Instansi Pemerintah', 6),
('IKU',      'iku',     'Indikator Kinerja Utama',                           7),
('Lainnya',  'lainnya', 'Dokumen perencanaan lainnya',                       99);

-- ============================================================
-- LOG AWAL
-- ============================================================
INSERT INTO aktivitas_log (user_id, aksi, entitas, detail) VALUES
(1, 'system_init', 'system', JSON_OBJECT('pesan', 'Database berhasil diinisialisasi'));

