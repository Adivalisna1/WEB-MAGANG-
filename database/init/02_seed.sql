-- ============================================================
-- SEED DATA: Roles, Admin, User, Kategori Dokumen
-- File ini auto-run saat container MySQL pertama kali dibuat
-- ============================================================

USE web_laporan;

-- ============================================================
-- ROLES
-- ============================================================
INSERT INTO roles (id, nama, deskripsi) VALUES
(1, 'admin', 'Administrator — akses penuh, monitoring user realtime'),
(2, 'staff', 'Staff/User — upload, edit, dan verifikasi dokumen'),
(3, 'ketua_tim', 'Ketua Tim — monitoring sistem, manajemen user, dan reset password'),
(4, 'admin_dept', 'Admin divisi — sama seperti admin tapi data terbatas pada divisinya sendiri');

-- ============================================================
-- DIVISI
-- Divisi awal instansi — bisa diubah lewat menu Kelola Divisi admin
-- ============================================================
INSERT INTO divisi (id, nama, slug, urutan) VALUES
(1, 'Perencanaan', 'perencanaan', 1),
(2, 'Keuangan', 'keuangan', 2),
(3, 'Kepegawaian', 'kepegawaian', 3),
(4, 'Hukum', 'hukum', 4),
(5, 'Sekretariat', 'sekretariat', 5);

-- ============================================================
-- USERS
-- Password default: Admin@123  (bcrypt hash, cost=12)
-- divisi_id: NULL = global (admin & ketua tim)
-- GANTI PASSWORD INI setelah pertama login!
-- ============================================================
INSERT INTO users (role_id, divisi_id, nama, username, email, password_hash, is_active) VALUES
(
    1,
    NULL,
    'Administrator',
    'admin',
    'admin@weblaporan.local',
    -- hash dari: Admin@123
    '$2b$12$KIX9K3n0yVQF5v2W1W5HZeXoVjUYZAqO3bKhMxCkH3z.QYj0N4j2K',
    1
),
(
    2,
    1,
    'Staff Perencanaan',
    'staff01',
    'staff01@weblaporan.local',
    -- hash dari: Staff@123
    '$2b$12$LJY0L4o1zWRG6w3X2X6IAf.YpWkVZBrP4cLiNyDlI4a.RZk1O5k3L',
    1
),
(
    3,
    NULL,
    'Ketua Tim',
    'ketua1',
    'ketua1@weblaporan.local',
    -- hash dari: ketua@123
    '$2b$12$rtQwql4GN6RLqh1DT2xAA.IbGnD0mXxMVtz0xYFWcZQl.298qfpmm',
    1
),
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
    (kategori_id, divisi_id, uploaded_by, judul, tahun, file_nama, file_path, file_size, file_mime, status, is_public)
VALUES
(
    1, 1, 2,
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
    2, 1, 2,
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
