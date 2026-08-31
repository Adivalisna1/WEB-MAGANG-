-- ============================================================
-- SEED DATA: Roles, Admin, User, Kategori Dokumen
-- File ini auto-run saat container MySQL pertama kali dibuat
-- ============================================================

USE web_laporan;

-- ============================================================
-- ROLES
-- ============================================================
INSERT INTO roles (id, nama, deskripsi) VALUES
(1, 'admin',     'Administrator — penyaring pertama verifikasi, monitoring user realtime'),
(2, 'staff',     'Staff/User — upload, edit, dan submit dokumen untuk diverifikasi'),
(3, 'ketua_tim', 'Ketua Tim — persetujuan final dokumen, manajemen user, dan reset password');

-- ============================================================
-- USERS DEFAULT
-- Password lokal bervariasi — ganti setelah pertama login!
-- ============================================================
INSERT INTO users (role_id, nama, username, email, password_hash, is_active) VALUES
(
    1,
    'Administrator',
    'admin',
    'admin@weblaporan.local',
    -- hash dari: Admin@123
    '$2b$12$9pbLgBcKwwu7tmKZmrGTTOJuY1d61mmDi5Z06fiJDSP/hGA7Y2sha',
    1
),
(
    2,
    'Staff Perencanaan',
    'staff01',
    'staff01@weblaporan.local',
    -- hash dari: Staff@123
    '$2b$12$6lIKcpOpE9cjlkBW5WvtnOF/skWUjPz1H9tzK7GBDYa6I/uso9rG6',
    1
),
(
    3,
    'Ketua Tim',
    'ketua1',
    'ketua1@weblaporan.local',
    -- hash dari: ketua@123
    '$2b$12$rtQwql4GN6RLqh1DT2xAA.IbGnD0mXxMVtz0xYFWcZQl.298qfpmm',
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
