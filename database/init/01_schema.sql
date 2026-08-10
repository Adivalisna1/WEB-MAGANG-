-- ============================================================
-- DATABASE: web_laporan
-- Sistem: Dashboard Laporan Publik
-- ============================================================

CREATE DATABASE IF NOT EXISTS web_laporan
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE web_laporan;

-- ============================================================
-- TABLE: roles
-- Dua role: admin dan user/staff
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id          TINYINT UNSIGNED    NOT NULL AUTO_INCREMENT,
    nama        VARCHAR(50)         NOT NULL UNIQUE,
    deskripsi   VARCHAR(255)        NULL,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: users
-- Menyimpan data admin dan staff/user
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    role_id         TINYINT UNSIGNED    NOT NULL,
    nama            VARCHAR(100)        NOT NULL,
    username        VARCHAR(50)         NOT NULL UNIQUE,
    email           VARCHAR(150)        NOT NULL UNIQUE,
    password_hash   VARCHAR(255)        NOT NULL,           -- bcrypt hash
    foto_profil     VARCHAR(255)        NULL,               -- path foto
    is_active       TINYINT(1)          NOT NULL DEFAULT 1, -- 1=aktif, 0=nonaktif
    last_login      TIMESTAMP           NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id)
        REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_users_role (role_id),
    INDEX idx_users_username (username)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: user_sessions
-- Tracking session aktif untuk monitoring realtime admin
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id              VARCHAR(128)        NOT NULL,           -- session/token ID
    user_id         INT UNSIGNED        NOT NULL,
    ip_address      VARCHAR(45)         NULL,               -- support IPv6
    user_agent      TEXT                NULL,
    is_online       TINYINT(1)          NOT NULL DEFAULT 1,
    login_at        TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    logout_at       TIMESTAMP           NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_online (is_online)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: kategori_dokumen
-- Kategori laporan (LKjIP, Renstra, Renja, dll)
-- ============================================================
CREATE TABLE IF NOT EXISTS kategori_dokumen (
    id          SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    nama        VARCHAR(100)        NOT NULL UNIQUE,
    slug        VARCHAR(100)        NOT NULL UNIQUE,        -- url-friendly
    deskripsi   TEXT                NULL,
    urutan      TINYINT UNSIGNED    NOT NULL DEFAULT 0,     -- urutan tampil
    is_active   TINYINT(1)          NOT NULL DEFAULT 1,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_kategori_slug (slug)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: dokumen
-- Data utama laporan yang diupload
-- ============================================================
CREATE TABLE IF NOT EXISTS dokumen (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    kategori_id     SMALLINT UNSIGNED   NOT NULL,
    uploaded_by     INT UNSIGNED        NOT NULL,           -- FK ke users
    judul           VARCHAR(255)        NOT NULL,
    deskripsi       TEXT                NULL,
    tahun           YEAR                NOT NULL,
    file_nama       VARCHAR(255)        NOT NULL,           -- nama file asli
    file_path       VARCHAR(500)        NOT NULL,           -- path di storage
    file_size       INT UNSIGNED        NULL,               -- ukuran dalam bytes
    file_mime       VARCHAR(100)        NULL,               -- application/pdf, dll
    status          ENUM(
                        'draft',
                        'menunggu_verifikasi',
                        'terverifikasi',
                        'ditolak',
                        'revisi',
                        'diarsipkan'
                    )                   NOT NULL DEFAULT 'draft',
    catatan         TEXT                NULL,               -- catatan verifikasi/penolakan
    verified_by     INT UNSIGNED        NULL,               -- FK ke users (admin/verifikator)
    verified_at     TIMESTAMP           NULL,
    download_count  INT UNSIGNED        NOT NULL DEFAULT 0,
    is_public       TINYINT(1)          NOT NULL DEFAULT 0, -- 1 = tampil di dashboard publik
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_dokumen_kategori FOREIGN KEY (kategori_id)
        REFERENCES kategori_dokumen(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_dokumen_uploader FOREIGN KEY (uploaded_by)
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_dokumen_verifier FOREIGN KEY (verified_by)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_dokumen_status (status),
    INDEX idx_dokumen_tahun (tahun),
    INDEX idx_dokumen_publik (is_public, status),
    INDEX idx_dokumen_kategori (kategori_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: aktivitas_log
-- Log semua aktivitas user (upload, edit, verifikasi, login, dll)
-- ============================================================
CREATE TABLE IF NOT EXISTS aktivitas_log (
    id          BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED        NULL,                   -- NULL jika aksi sistem
    aksi        VARCHAR(100)        NOT NULL,               -- 'upload', 'edit', 'verifikasi', 'login', dll
    entitas     VARCHAR(50)         NULL,                   -- 'dokumen', 'user', dll
    entitas_id  INT UNSIGNED        NULL,                   -- ID record yang diaksi
    detail      JSON                NULL,                   -- detail tambahan
    ip_address  VARCHAR(45)         NULL,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_log_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_log_user (user_id),
    INDEX idx_log_aksi (aksi),
    INDEX idx_log_created (created_at)
) ENGINE=InnoDB;
