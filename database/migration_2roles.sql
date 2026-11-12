-- Migration: Refactor Roles to 2 Roles: Operator & Manajemen
-- Role 1: Operator (Operasional, Teknis Data, Upload, Rekapitulasi & IT)
-- Role 2: Manajemen (Pimpinan, Verifikator, Pengawas)

-- 1. Update roles: rename administrasi -> manajemen
UPDATE roles 
SET nama = 'manajemen', 
    deskripsi = 'Manajemen / Pimpinan - Review, audit dokumen, pengawasan, dan pengambil kebijakan'
WHERE id = 2;

-- 2. Update role 1 operator deskripsi
UPDATE roles 
SET deskripsi = 'Operasional / Pelaksana - Input kas, upload rekening koran, susun berkas, rekapitulasi data, dan teknis IT'
WHERE id = 1;

-- 3. Update pimpinan eselon 1 users to role_id 2 (manajemen) and tingkat_id 2 (eselon_1)
UPDATE users 
SET role_id = 2, tingkat_id = 2 
WHERE username IN ('eselon1', 'eselon_setjen', 'eselon_dikti', 'eselon_vokasi', 'eselon_saintek', 'eselon_itjen');

-- 4. Update it_admin & naufal to role_id 1 (operator), tingkat_id 3 (kl), dengan permissions pengelolaan sistem IT
UPDATE users 
SET role_id = 1, 
    tingkat_id = 3, 
    permissions = '{"can_manage_users": true, "can_access_sql": true, "can_delete": true, "can_upload": true, "can_verify": true}'
WHERE username IN ('it_admin', 'naufal');

-- 5. Pindahkan user lain yang masih role_id 3 ke role_id 1
UPDATE users SET role_id = 1 WHERE role_id = 3;

-- 6. Hapus role id 3 (it) dari tabel roles
DELETE FROM roles WHERE id = 3;

-- 7. Pastikan akun testing konsisten
-- operator_satker: Operator Satker (role_id=1, tingkat_id=1)
UPDATE users SET role_id = 1, tingkat_id = 1 WHERE username = 'operator_satker';

-- admin_satker: Manajemen Satker (role_id=2, tingkat_id=1)
UPDATE users SET role_id = 2, tingkat_id = 1 WHERE username = 'admin_satker';

-- operator_eselon1: Operator Satker (role_id=1, tingkat_id=1)
UPDATE users SET role_id = 1, tingkat_id = 1, satker_id = 29, nama = 'Operator Satker (Dikti)' WHERE username = 'operator_eselon1';

-- admin_eselon1: Administrasi Eselon 1 (role_id=2, tingkat_id=2)
UPDATE users SET role_id = 2, tingkat_id = 2 WHERE username = 'admin_eselon1';

-- operator_kl: Operator K/L (role_id=1, tingkat_id=3)
UPDATE users SET role_id = 1, tingkat_id = 3 WHERE username = 'operator_kl';

-- admin_kl: Manajemen K/L (role_id=2, tingkat_id=3)
UPDATE users SET role_id = 2, tingkat_id = 3 WHERE username = 'admin_kl';
