-- Tabel Master Kategori Akuntansi
CREATE TABLE IF NOT EXISTS `kategori_akuntansi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert some default categories
INSERT IGNORE INTO `kategori_akuntansi` (`nama_kategori`) VALUES 
('Gaji & Tunjangan'), 
('Belanja Barang Operasional'), 
('Belanja Modal'),
('Perjalanan Dinas'),
('Pajak & Retribusi');

-- Tabel Transaksi / Audit Akuntansi
CREATE TABLE IF NOT EXISTS `audit_akuntansi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tanggal` date NOT NULL,
  `uraian` text NOT NULL,
  `jenis` enum('debit','kredit') NOT NULL,
  `id_kategori` int(11) NOT NULL,
  `nominal` decimal(15,2) NOT NULL,
  `bukti_file` varchar(255) DEFAULT NULL,
  `catatan_audit` text DEFAULT NULL,
  `created_by` int(10) unsigned NOT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_akuntansi_kategori` (`id_kategori`),
  KEY `fk_akuntansi_created_by` (`created_by`),
  KEY `fk_akuntansi_updated_by` (`updated_by`),
  CONSTRAINT `fk_akuntansi_kategori` FOREIGN KEY (`id_kategori`) REFERENCES `kategori_akuntansi` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_akuntansi_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_akuntansi_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
