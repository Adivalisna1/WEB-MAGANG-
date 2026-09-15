USE web_laporan;

-- 1. Create satkers table
CREATE TABLE IF NOT EXISTS satkers (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nama VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- 2. Insert Default Satker
INSERT IGNORE INTO satkers (id, nama) VALUES (1, 'Satker Default');

-- 3. Add satker_id to users
-- We use a stored procedure to safely add the column if it doesn't exist
DELIMITER $$
CREATE PROCEDURE AddSatkerIdColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'web_laporan' 
          AND TABLE_NAME = 'users' 
          AND COLUMN_NAME = 'satker_id'
    ) THEN
        ALTER TABLE users ADD COLUMN satker_id INT UNSIGNED NULL;
        ALTER TABLE users ADD CONSTRAINT fk_users_satker FOREIGN KEY (satker_id) REFERENCES satkers(id) ON DELETE SET NULL ON UPDATE CASCADE;
        ALTER TABLE users ADD INDEX idx_users_satker (satker_id);
    END IF;
END$$
DELIMITER ;

CALL AddSatkerIdColumn();
DROP PROCEDURE AddSatkerIdColumn;
