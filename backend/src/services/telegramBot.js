const TelegramBot = require('node-telegram-bot-api');
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

// In-memory state storage: { chatId: { step, data: {}, userId: <number> } }
const userStates = {};

let bot = null;

function initTelegramBot() {
  if (!token || token === 'isi_bot_token_disini') {
    console.warn('[Telegram Bot] Token tidak valid atau belum diisi. Fitur Bot Interaktif dimatikan.');
    return;
  }

  // Buat bot dengan mode polling
  bot = new TelegramBot(token, { polling: true });

  // Handle command /start
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (!userStates[chatId]) {
      userStates[chatId] = { step: 'IDLE', data: {}, userId: null };
    }
    
    // Reset step
    userStates[chatId].step = 'IDLE';

    if (!userStates[chatId].userId) {
      const opts = {
        reply_markup: {
          keyboard: [
            [{ text: '🔑 Login' }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      };
      bot.sendMessage(chatId, 'Halo! Anda belum login. Silakan klik tombol 🔑 Login untuk menghubungkan akun Web Anda.', opts);
      return;
    }

    const opts = {
      reply_markup: {
        keyboard: [
          [{ text: '➕ Tambah Transaksi' }],
          [{ text: '🚪 Logout' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    };
    bot.sendMessage(chatId, 'Halo! Selamat datang di Bot Pencatatan Keuangan. Mau ngapain hari ini?', opts);
  });

  // Handle all other messages
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Abaikan kalau isinya /start
    if (text === '/start') return;

    if (!userStates[chatId]) {
      userStates[chatId] = { step: 'IDLE', data: {}, userId: null };
    }

    if (text === '❌ Batal') {
      userStates[chatId].step = 'IDLE';
      bot.sendMessage(chatId, 'Aksi dibatalkan. Ketik /start kalau mau mulai lagi.', { reply_markup: { remove_keyboard: true } });
      return;
    }

    if (text === '🚪 Logout') {
      userStates[chatId] = { step: 'IDLE', data: {}, userId: null };
      bot.sendMessage(chatId, 'Berhasil Logout dari Telegram. Ketik /start untuk login kembali.', { reply_markup: { remove_keyboard: true } });
      return;
    }

    let state = userStates[chatId];

    if (text === '🔑 Login') {
      state.step = 'ASK_USERNAME';
      bot.sendMessage(chatId, 'Masukkan Username akun Web Anda:', { reply_markup: { remove_keyboard: true } });
      return;
    }

    if (text === '➕ Tambah Transaksi') {
      if (!state.userId) {
        bot.sendMessage(chatId, 'Anda harus Login terlebih dahulu! Ketik /start lalu klik 🔑 Login.');
        return;
      }
      state.step = 'ASK_JENIS';
      state.data = {};
      const opts = {
        reply_markup: {
          keyboard: [
            [{ text: 'PEMASUKAN' }, { text: 'PENGELUARAN' }],
            [{ text: '❌ Batal' }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      };
      bot.sendMessage(chatId, 'Silakan pilih Jenis Transaksi:', opts);
      return;
    }

    switch (state.step) {
      case 'ASK_USERNAME':
        state.data.username = text;
        state.step = 'ASK_PASSWORD';
        bot.sendMessage(chatId, 'Masukkan Password Anda:');
        break;

      case 'ASK_PASSWORD':
        const password = text;
        try {
          const [users] = await pool.query('SELECT id, password_hash, nama FROM users WHERE username = ?', [state.data.username]);
          if (users.length === 0) {
            state.step = 'IDLE';
            return bot.sendMessage(chatId, 'Username tidak ditemukan! Ketik /start untuk mengulang.');
          }
          
          const validPass = await bcrypt.compare(password, users[0].password_hash);
          if (!validPass) {
            state.step = 'IDLE';
            return bot.sendMessage(chatId, 'Password salah! Ketik /start untuk mengulang.');
          }

          state.userId = users[0].id;
          state.step = 'IDLE';
          
          const opts = {
            reply_markup: {
              keyboard: [
                [{ text: '➕ Tambah Transaksi' }],
                [{ text: '🚪 Logout' }]
              ],
              resize_keyboard: true,
              one_time_keyboard: true
            }
          };
          bot.sendMessage(chatId, `✅ Login Berhasil! Selamat datang, ${users[0].nama}. Mau ngapain sekarang?`, opts);
        } catch (err) {
          console.error(err);
          bot.sendMessage(chatId, 'Terjadi kesalahan sistem saat login.');
        }
        break;

      case 'ASK_JENIS':
        if (text !== 'PEMASUKAN' && text !== 'PENGELUARAN') {
          return bot.sendMessage(chatId, 'Pilih PEMASUKAN atau PENGELUARAN ya!');
        }
        state.data.jenis = text;
        state.step = 'ASK_KATEGORI';

        // Ambil kategori dari DB
        try {
          const [kategoris] = await pool.query("SELECT id, nama_kategori FROM kategori_akuntansi");
          if (kategoris.length === 0) {
             bot.sendMessage(chatId, 'Kategori kosong di database.');
             return;
          }
          const keyboard = kategoris.map(k => [{ text: `${k.id} - ${k.nama_kategori}` }]);
          keyboard.push([{ text: '❌ Batal' }]);

          const opts = {
            reply_markup: {
              keyboard,
              resize_keyboard: true,
              one_time_keyboard: true
            }
          };
          bot.sendMessage(chatId, 'Pilih Kategori Akun:', opts);
        } catch (err) {
          console.error(err);
          bot.sendMessage(chatId, 'Gagal mengambil kategori.');
        }
        break;

      case 'ASK_KATEGORI':
        // Validasi: text harus berawalan angka (ID)
        const catIdMatch = text.match(/^(\d+)\s-/);
        if (!catIdMatch) {
          return bot.sendMessage(chatId, 'Pilih kategori yang valid dari tombol menu di bawah!');
        }
        state.data.id_kategori = parseInt(catIdMatch[1]);
        state.data.kategori_nama = text;
        
        state.step = 'ASK_URAIAN';
        bot.sendMessage(chatId, 'Ketik Uraian/Deskripsi transaksi (Contoh: Pembayaran ATK):', {
          reply_markup: { remove_keyboard: true }
        });
        break;

      case 'ASK_URAIAN':
        state.data.uraian = text;
        state.step = 'ASK_NOMINAL';
        bot.sendMessage(chatId, 'Masukkan Nominal (Angka saja, tanpa titik/koma. Contoh: 1500000):');
        break;

      case 'ASK_NOMINAL':
        const nominal = parseInt(text.replace(/\D/g, ''));
        if (isNaN(nominal)) {
          return bot.sendMessage(chatId, 'Nominal harus berupa angka! Coba masukkan lagi:');
        }
        state.data.nominal = nominal;
        
        // Finalize and save
        try {
          const tanggal = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          
          await pool.query(`
            INSERT INTO audit_akuntansi 
            (tanggal, uraian, jenis, id_kategori, nominal, created_by) 
            VALUES (?, ?, ?, ?, ?, ?)
          `, [tanggal, state.data.uraian, state.data.jenis.toLowerCase(), state.data.id_kategori, state.data.nominal, state.userId]);

          const rp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(state.data.nominal);

          bot.sendMessage(chatId, `✅ <b>Berhasil Disimpan ke Web!</b>\n\nJenis: ${state.data.jenis}\nKategori: ${state.data.kategori_nama}\nUraian: ${state.data.uraian}\nNominal: ${rp}`, { parse_mode: 'HTML' });
          
          // Reset
          state.step = 'IDLE';

        } catch (err) {
          console.error(err);
          bot.sendMessage(chatId, 'Terjadi kesalahan saat menyimpan ke database.');
        }
        break;
        
      default:
        // Do nothing if step is IDLE and not a specific command
        break;
    }
  });

  console.log('[Telegram Bot] Started Polling for Interactive Input...');
}

module.exports = { initTelegramBot };
