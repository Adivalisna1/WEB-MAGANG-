-- ============================================================
-- MIGRATION: Tambah tabel notifikasi
-- Jalankan di database yang sudah ada (tidak perlu recreate DB)
-- ============================================================

USE web_laporan;

CREATE TABLE IF NOT EXISTS notifikasi (
    id          BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED        NOT NULL,               -- penerima notifikasi
    aksi        VARCHAR(50)         NOT NULL,               -- 'submit', 'approve', 'reject'
    dokumen_id  INT UNSIGNED        NULL,                   -- dokumen terkait
    judul       VARCHAR(255)        NULL,                   -- snapshot judul dokumen
    pesan       TEXT                NOT NULL,               -- isi notifikasi
    is_read     TINYINT(1)          NOT NULL DEFAULT 0,     -- 0=belum dibaca, 1=sudah
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_dokumen FOREIGN KEY (dokumen_id)
        REFERENCES dokumen(id) ON DELETE SET NULL,
    INDEX idx_notif_user_read (user_id, is_read),
    INDEX idx_notif_created (created_at)
) ENGINE=InnoDB;
