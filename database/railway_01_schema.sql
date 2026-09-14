-- ============================================================
-- SCHEMA untuk Railway MySQL
-- Paste file ini di Railway → MySQL → tab Data
-- JANGAN ubah apapun, langsung paste dan Run
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
    id          TINYINT UNSIGNED    NOT NULL AUTO_INCREMENT,
    nama        VARCHAR(50)         NOT NULL UNIQUE,
    deskripsi   VARCHAR(255)        NULL,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    role_id         TINYINT UNSIGNED    NOT NULL,
    nama            VARCHAR(100)        NOT NULL,
    username        VARCHAR(50)         NOT NULL UNIQUE,
    email           VARCHAR(150)        NOT NULL UNIQUE,
    password_hash   VARCHAR(255)        NOT NULL,
    foto_profil     VARCHAR(255)        NULL,
    is_active       TINYINT(1)          NOT NULL DEFAULT 1,
    permissions     JSON                NULL DEFAULT NULL,
    last_login TIMESTAMP NULL DEFAULT NULL,
    password_reset_at TIMESTAMP NULL DEFAULT NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id)
        REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_users_role (role_id),
    INDEX idx_users_username (username)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_sessions (
    id              VARCHAR(128)        NOT NULL,
    user_id         INT UNSIGNED        NOT NULL,
    ip_address      VARCHAR(45)         NULL,
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

CREATE TABLE IF NOT EXISTS kategori_dokumen (
    id          SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    nama        VARCHAR(100)        NOT NULL UNIQUE,
    slug        VARCHAR(100)        NOT NULL UNIQUE,
    deskripsi   TEXT                NULL,
    urutan      TINYINT UNSIGNED    NOT NULL DEFAULT 0,
    is_active   TINYINT(1)          NOT NULL DEFAULT 1,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_kategori_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS dokumen (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    kategori_id     SMALLINT UNSIGNED   NOT NULL,
    uploaded_by     INT UNSIGNED        NOT NULL,
    judul           VARCHAR(255)        NOT NULL,
    deskripsi       TEXT                NULL,
    tahun           YEAR                NOT NULL,
    bulan           TINYINT UNSIGNED    NULL COMMENT '1=Jan, 12=Des — opsional',
    semester        TINYINT UNSIGNED    NULL COMMENT '1=Semester 1 (Jan-Jun), 2=Semester 2 (Jul-Des)',
    nomor_laporan   VARCHAR(50)         NULL UNIQUE COMMENT 'Kode tracking, contoh: LKJIP/2024/001',
    file_nama       VARCHAR(255)        NOT NULL,
    file_path       VARCHAR(500)        NOT NULL,
    file_size       INT UNSIGNED        NULL,
    file_mime       VARCHAR(100)        NULL,
    status          ENUM(
                        'draft',
                        'menunggu_verifikasi',
                        'lolos_admin',
                        'terverifikasi',
                        'revisi',
                        'diarsipkan'
                    )                   NOT NULL DEFAULT 'draft',
    catatan         TEXT                NULL,
    catatan_oleh    VARCHAR(20)         NULL COMMENT 'admin atau ketua_tim',
    verified_by     INT UNSIGNED        NULL,
    verified_at TIMESTAMP NULL DEFAULT NULL,
    download_count  INT UNSIGNED        NOT NULL DEFAULT 0,
    is_public       TINYINT(1)          NOT NULL DEFAULT 0,
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

CREATE TABLE IF NOT EXISTS aktivitas_log (
    id          BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED        NULL,
    aksi        VARCHAR(100)        NOT NULL,
    entitas     VARCHAR(50)         NULL,
    entitas_id  INT UNSIGNED        NULL,
    detail      JSON                NULL,
    ip_address  VARCHAR(45)         NULL,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_log_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_log_user (user_id),
    INDEX idx_log_aksi (aksi),
    INDEX idx_log_created (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: notifikasi
-- Notifikasi in-app (submit, approve, reject dokumen)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifikasi (
    id          BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED        NOT NULL,
    aksi        VARCHAR(50)         NOT NULL,
    dokumen_id  INT UNSIGNED        NULL,
    judul       VARCHAR(255)        NULL,
    pesan       TEXT                NOT NULL,
    is_read     TINYINT(1)          NOT NULL DEFAULT 0,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_dokumen FOREIGN KEY (dokumen_id)
        REFERENCES dokumen(id) ON DELETE SET NULL,
    INDEX idx_notif_user_read (user_id, is_read),
    INDEX idx_notif_created (created_at)
) ENGINE=InnoDB;
