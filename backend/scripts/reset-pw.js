require("dotenv").config(); // pastikan dijalankan dari dalam folder backend/
const bcrypt = require("bcrypt");
const { pool } = require("../src/config/db");

async function resetPassword() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(" Penggunaan: node reset-pw.js <username> <password_baru>");
    console.log("Contoh: node reset-pw.js admin123 rahasia123");
    process.exit(1);
  }

  const username = args[0];
  const newPassword = args[1];

  try {
    // Cari user
    const [users] = await pool.query(
      "SELECT id, username FROM users WHERE username = ?",
      [username],
    );

    if (users.length === 0) {
      console.log(` User dengan username '${username}' tidak ditemukan.`);
      process.exit(1);
    }

    const userId = users[0].id;

    // Hash password baru
    console.log(`Meng-hash password untuk '${username}'...`);
    // Menggunakan cost factor 12 agar sesuai dengan sebagian besar controller
    const hash = await bcrypt.hash(newPassword, 12);

    // Update di database
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      hash,
      userId,
    ]);

    console.log(
      ` Berhasil! Password untuk user '${username}' telah direset ke '${newPassword}'.`,
    );
  } catch (error) {
    console.error(" Terjadi kesalahan:", error);
  } finally {
    // Tutup koneksi agar script bisa berhenti
    await pool.end();
  }
}

resetPassword();
