-- ============================================================
-- MIGRATION v4: Fitur Reset Password via Email
-- ============================================================

ALTER TABLE users
  ADD COLUMN reset_password_token VARCHAR(255) NULL COMMENT 'Token untuk reset password',
  ADD COLUMN reset_password_expires_at DATETIME NULL COMMENT 'Batas waktu berlaku token reset password';
