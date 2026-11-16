import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db

def run_migration():
    conn = db.connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    categories = [
        ("Perolehan Aset Lainnya", "perolehan-lainnya", "Dokumen Berita Acara / SK Perolehan Barang Milik Negara (BMN) dari sumber perolehan lainnya (hibah, transfer, sitaan, dll)", 0, 5),
        ("BAP Kas", "bap-kas", "Berita Acara Pemeriksaan Kas (cash opname) Bendahara dan KPA", 0, 6),
        ("LPJ Bendahara", "lpj-bendahara", "Laporan Pertanggungjawaban Kas Bendahara berkala", 0, 7),
        ("Konfirmasi Saldo Bank", "konfirmasi-saldo-bank", "Surat Konfirmasi Saldo Kas resmi dari bank mitra", 0, 8),
        ("Bukti Setor Sisa UP (NTPN)", "bukti-setor-up", "Bukti Penerimaan Negara (BPN / NTPN) penyetoran kembali sisa kas ke Kas Negara", 0, 9),
        ("SK Penetapan / Kurang Bayar", "sk-penetapan-piutang", "SK Penetapan timbulnya piutang satker akibat temuan atau kelebihan bayar", 1, 10),
        ("SK Pembebanan / SKTJM", "sk-pembebanan-piutang", "Surat Keterangan Tanggung Jawab Mutlak (SKTJM) dan SK Pembebanan / SKP2K", 1, 11),
        ("SK Penghapusan Piutang", "sk-penghapusan-piutang", "Surat Keputusan Penghapusan Piutang Negara", 1, 12),
    ]

    for nama, slug, deskripsi, perlu_nominal, urutan in categories:
        cursor.execute("""
            INSERT INTO kategori_dokumen (nama, slug, deskripsi, perlu_nominal, urutan, is_active)
            SELECT %s, %s, %s, %s, %s, 1
            WHERE NOT EXISTS (SELECT 1 FROM kategori_dokumen WHERE slug = %s)
        """, (nama, slug, deskripsi, perlu_nominal, urutan, slug))

    conn.commit()
    print("Seluruh kategori modul dokumen berhasil dipastikan ada di kategori_dokumen.")
    conn.close()

if __name__ == "__main__":
    run_migration()
