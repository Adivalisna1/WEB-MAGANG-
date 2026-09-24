const TelegramBot = require('node-telegram-bot-api');
const { pool } = require('../config/db');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

// In-memory state storage: { chatId: { step, data: {} } }
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
    userStates[chatId] = { step: 'IDLE', data: {} };

    const opts = {
      reply_markup: {
        keyboard: [
          [{ text: '➕ Tambah Transaksi' }],
          [{ text: '❌ Batal' }]
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

    if (text === '❌ Batal') {
      userStates[chatId] = { step: 'IDLE', data: {} };
      bot.sendMessage(chatId, 'Aksi dibatalkan. Ketik /start kalau mau mulai lagi.', { reply_markup: { remove_keyboard: true } });
      return;
    }

    if (!userStates[chatId]) {
      userStates[chatId] = { step: 'IDLE', data: {} };
    }

    let state = userStates[chatId];

    if (text === '➕ Tambah Transaksi') {
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
          
          // Asumsi id_user = 1 (Misal Admin/Sistem) karena input via Telegram
          const created_by = 1;

          await pool.query(`
            INSERT INTO audit_akuntansi 
            (tanggal, uraian, jenis, id_kategori, nominal, created_by) 
            VALUES (?, ?, ?, ?, ?, ?)
          `, [tanggal, state.data.uraian, state.data.jenis, state.data.id_kategori, state.data.nominal, created_by]);

          const rp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(state.data.nominal);

          bot.sendMessage(chatId, `✅ <b>Berhasil Disimpan ke Web!</b>\n\nJenis: ${state.data.jenis}\nKategori: ${state.data.kategori_nama}\nUraian: ${state.data.uraian}\nNominal: ${rp}`, { parse_mode: 'HTML' });
          
          // Reset
          userStates[chatId] = { step: 'IDLE', data: {} };

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
