-- ============================================================
-- SEED DATA: Roles, Admin, User, Kategori Dokumen
-- File ini auto-run saat container MySQL pertama kali dibuat
-- ============================================================

USE web_laporan;

-- ============================================================
-- ROLES
-- ============================================================
INSERT INTO roles (id, nama, deskripsi) VALUES
(1, 'admin', 'Administrator — penyaring pertama verifikasi, monitoring user realtime'),
(2, 'staff', 'Staff/User — upload, edit, dan verifikasi dokumen'),
(3, 'ketua_tim', 'Ketua Tim — persetujuan final dokumen, manajemen user, dan reset password');

-- ============================================================
-- USERS
-- Password default: Admin@123  (bcrypt hash, cost=12)
-- GANTI PASSWORD INI setelah pertama login!
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
('LKjIP',    'lkjip',    'Laporan Kinerja Instansi Pemerintah',              1),
('Renstra',  'renstra',  'Rencana Strategis',                                2),
('Renja',    'renja',    'Rencana Kerja',                                    3),
('RKT',      'rkt',      'Rencana Kinerja Tahunan',                          4),
('PK',       'pk',       'Perjanjian Kinerja',                               5),
('LAKIP',    'lakip',    'Laporan Akuntabilitas Kinerja Instansi Pemerintah', 6),
('IKU',      'iku',      'Indikator Kinerja Utama',                          7),
('Lainnya',  'lainnya',  'Dokumen perencanaan lainnya',                      99);

-- ============================================================
-- CONTOH DOKUMEN (opsional, bisa dihapus di production)
-- ============================================================
INSERT INTO dokumen
    (kategori_id, uploaded_by, judul, tahun, file_nama, file_path, file_size, file_mime, status, is_public)
VALUES
(
    1, 2,
    'LKjIP Tahun 2024',
    2024,
    'lkjip-2024.pdf',
    '/uploads/2024/lkjip-2024.pdf',
    204800,
    'application/pdf',
    'terverifikasi',
    1
),
(
    2, 2,
    'Renstra 2020-2024',
    2024,
    'renstra-2020-2024.pdf',
    '/uploads/2024/renstra-2020-2024.pdf',
    512000,
    'application/pdf',
    'terverifikasi',
    1
);

-- ============================================================
-- LOG AWAL
-- ============================================================
INSERT INTO aktivitas_log (user_id, aksi, entitas, detail) VALUES
(1, 'system_init', 'system', JSON_OBJECT('pesan', 'Database berhasil diinisialisasi'));
