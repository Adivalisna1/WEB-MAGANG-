-- ============================================================
-- MIGRATION v8: Fitur Kertas Kerja (Riwayat Transaksi)
-- ============================================================

CREATE TABLE IF NOT EXISTS kertas_kerja (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    satker_id INT UNSIGNED NULL,
    uploaded_by INT UNSIGNED NOT NULL,
    tanggal DATE NOT NULL,
    uraian VARCHAR(255) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    nominal DECIMAL(18,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_kk_satker FOREIGN KEY (satker_id)
        REFERENCES satkers(id) ON DELETE CASCADE,
    CONSTRAINT fk_kk_uploader FOREIGN KEY (uploaded_by)
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
