const TelegramBot = require('node-telegram-bot-api');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

// In-memory state storage: { chatId: { step, data: {}, userId: <number>, userRole: <number>, satkerId: <number> } }
const userStates = {};

async function generateLaporanExcelTelegram(satkerId, satkerNama, chatId, bot, pool) {
  try {
    bot.sendMessage(chatId, '⏳ Sedang memproses laporan Excel... Mohon tunggu.');

    let query = `
      SELECT a.tanggal, a.uraian, a.jenis, k.nama as nama_kategori, a.nominal, a.catatan_audit, u.nama as dibuat_oleh, s.nama as satker
      FROM audit_akuntansi a
      LEFT JOIN kategori_dokumen k ON a.id_kategori = k.id
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN satkers s ON u.satker_id = s.id
    `;
    const params = [];
    if (satkerId) {
      query += ' WHERE u.satker_id = ?';
      params.push(satkerId);
    }
    query += ' ORDER BY a.tanggal DESC';

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return bot.sendMessage(chatId, `📭 Tidak ada data transaksi untuk satker *${satkerNama}*.`, { parse_mode: 'Markdown' });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Laporan Keuangan');

    sheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Tanggal', key: 'tanggal', width: 14 },
      { header: 'Uraian', key: 'uraian', width: 30 },
      { header: 'Jenis', key: 'jenis', width: 14 },
      { header: 'Kategori', key: 'kategori', width: 25 },
      { header: 'Nominal', key: 'nominal', width: 18 },
      { header: 'Catatan', key: 'catatan', width: 25 },
      { header: 'Dibuat Oleh', key: 'dibuat_oleh', width: 20 },
      { header: 'Satker', key: 'satker', width: 30 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E86C1' } };
    sheet.getRow(1).alignment = { horizontal: 'center' };

    let totalDebit = 0;
    let totalKredit = 0;
    rows.forEach((r, idx) => {
      const tgl = r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID') : '-';
      const jns = r.jenis === 'debit' ? 'Pemasukan' : 'Pengeluaran';
      if (r.jenis === 'debit') totalDebit += Number(r.nominal);
      else totalKredit += Number(r.nominal);

      sheet.addRow({
        no: idx + 1,
        tanggal: tgl,
        uraian: r.uraian,
        jenis: jns,
        kategori: r.nama_kategori || '-',
        nominal: Number(r.nominal),
        catatan: r.catatan_audit || '-',
        dibuat_oleh: r.dibuat_oleh || '-',
        satker: r.satker || '-',
      });
    });

    sheet.addRow({});
    sheet.addRow({ uraian: 'Total Pemasukan', nominal: totalDebit });
    sheet.addRow({ uraian: 'Total Pengeluaran', nominal: totalKredit });
    sheet.addRow({ uraian: 'Saldo', nominal: totalDebit - totalKredit });

    sheet.getColumn('nominal').numFmt = '#,##0';

    const tmpDir = '/tmp';
    const fileName = `Laporan_${satkerNama.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}_${Date.now()}.xlsx`;
    const filePath = path.join(tmpDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    await bot.sendDocument(chatId, filePath);
    fs.unlinkSync(filePath);

    const rp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n);
    bot.sendMessage(chatId, `📊 *Laporan ${satkerNama}*\n\n📈 Total Pemasukan: ${rp(totalDebit)}\n📉 Total Pengeluaran: ${rp(totalKredit)}\n💰 Saldo: ${rp(totalDebit - totalKredit)}\n\n📎 File Excel sudah dikirim di atas.`, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'Terjadi kesalahan saat membuat laporan Excel.');
  }
}

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

    let keyboardMenu = [];
    if (userStates[chatId].userRole === 1 || userStates[chatId].userRole === 2) {
      keyboardMenu.push([{ text: '➕ Pencatatan' }, { text: '➕ Rekening Koran' }]);
            keyboardMenu.push([{ text: '📂 Upload Bukti' }]);
    } else if (userStates[chatId].userRole === 3) {
      keyboardMenu.push([{ text: '📊 Laporan' }]);
    }
    keyboardMenu.push([{ text: '🚪 Logout' }]);

    const opts = {
      reply_markup: {
        keyboard: keyboardMenu,
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

    if (text === '❌ Batal' || text === '/batal' || text === '!batal') {
      userStates[chatId].step = 'IDLE';
      bot.sendMessage(chatId, 'Aksi dibatalkan. Ketik /start kalau mau mulai lagi.', { reply_markup: { remove_keyboard: true } });
      return;
    }

    if (text === '🚪 Logout' || text === '/logout' || text === '!logout') {
      userStates[chatId] = { step: 'IDLE', data: {}, userId: null };
      bot.sendMessage(chatId, 'Berhasil Logout dari Telegram. Ketik /start untuk login kembali.', { reply_markup: { remove_keyboard: true } });
      return;
    }

    let state = userStates[chatId];

    if (text === '🔑 Login') {
      state.step = 'ASK_USERNAME';
      bot.sendMessage(chatId, '🔑 Silakan balas pesan ini dengan Username/Kode Satker akun Web Anda:', { reply_markup: { remove_keyboard: true } });
      return;
    }

    if (text === '📂 Upload Bukti') {
      if (!state.userId) {
        bot.sendMessage(chatId, 'Anda harus Login terlebih dahulu!');
        return;
      }
      try {
        const [kats] = await pool.query("SELECT id, nama as nama_kategori FROM kategori_dokumen WHERE is_active = 1");
        let msgStr = 'Pilih Kategori Dokumen (Balas dengan angka):\n';
        state.data = { doc_kategori_map: {} };
        kats.forEach((k, idx) => {
          const num = idx + 1;
          msgStr += `${num}. ${k.nama_kategori}\n`;
          state.data.doc_kategori_map[num.toString()] = { id: k.id, nama: k.nama_kategori };
        });
        state.step = 'ASK_DOK_KATEGORI';
        bot.sendMessage(chatId, msgStr);
      } catch (e) {
        bot.sendMessage(chatId, 'Gagal load kategori dokumen.');
      }
      return;
    }

    if (text === '📊 Laporan') {
      if (!state.userId) {
        bot.sendMessage(chatId, 'Anda harus Login terlebih dahulu! Ketik /start lalu klik 🔑 Login.');
        return;
      }

      if (state.userRole === 3) {
        try {
          const [satkers] = await pool.query('SELECT id, nama FROM satkers ORDER BY nama ASC');
          if (satkers.length === 0) return bot.sendMessage(chatId, 'Data Satker kosong di database.');

          let satkerMsg = 'Pilih Satuan Kerja:\n*0. Semua Satker (Global)*\n';
          state.data = {};
          state.data.satker_map = {};
          const chunks = [];

          satkers.forEach((s, idx) => {
            const num = idx + 1;
            const line = `${num}. ${s.nama}\n`;
            if (satkerMsg.length + line.length > 4000) {
              chunks.push(satkerMsg);
              satkerMsg = '';
            }
            satkerMsg += line;
            state.data.satker_map[num.toString()] = { id: s.id, nama: s.nama };
          });
          if (satkerMsg.length > 0) {
            chunks.push(satkerMsg);
          }

          state.step = 'ASK_SATKER_LAPORAN';
          for (const chunk of chunks) {
            await bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
          }
        } catch (err) {
          console.error(err);
          bot.sendMessage(chatId, 'Gagal mengambil list Satker.');
        }
      } else {
        // Role 1 and 2 (Staff / Pimpinan)
        try {
          const [satkerData] = await pool.query('SELECT nama FROM satkers WHERE id = ?', [state.satkerId]);
          const sNama = satkerData.length > 0 ? satkerData[0].nama : 'Satker Anda';
          await generateLaporanExcelTelegram(state.satkerId, sNama, chatId, bot, pool);
        } catch (err) {
          console.error(err);
          bot.sendMessage(chatId, 'Gagal membuat laporan untuk satker Anda.');
        }
      }
      return;
    }

    if (text === '➕ Pencatatan') {
      if (!state.userId) {
        bot.sendMessage(chatId, 'Anda harus Login terlebih dahulu! Ketik /start lalu klik 🔑 Login.');
        return;
      }
      if (state.userRole !== 1 && state.userRole !== 2) {
        bot.sendMessage(chatId, '⛔ Maaf, fitur ini hanya untuk Staff dan Pimpinan.');
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

    if (text === '➕ Rekening Koran') {
      if (!state.userId) {
        bot.sendMessage(chatId, 'Anda harus Login terlebih dahulu!');
        return;
      }
      state.step = 'ASK_RK_SATKER';
      state.data = {};
      bot.sendMessage(chatId, 'Masukkan **Nomor Satker** (sebagai kata kunci):', { parse_mode: 'Markdown', reply_markup: { remove_keyboard: true } });
      return;
    }

    switch (state.step) {
      case 'ASK_SATKER_LAPORAN': {
        let satkerId = null;
        let satkerNama = 'Semua Satker (Global)';

        if (text === '0') {
          // All satkers
        } else {
          const chosen = state.data.satker_map[text];
          if (!chosen) {
            return bot.sendMessage(chatId, 'Nomor satker tidak valid! Balas dengan angka yang ada di list, atau *0* untuk Semua Satker.', { parse_mode: 'Markdown' });
          }
          satkerId = chosen.id;
          satkerNama = chosen.nama;
        }

        try {
          await generateLaporanExcelTelegram(satkerId, satkerNama, chatId, bot, pool);
          state.step = 'IDLE';
        } catch (err) {
          console.error(err);
          bot.sendMessage(chatId, 'Terjadi kesalahan saat membuat laporan Excel.');
          state.step = 'IDLE';
        }
        break;
      }

      case 'ASK_USERNAME':
        state.data.username = text;
        state.step = 'ASK_PASSWORD';
        bot.sendMessage(chatId, 'Masukkan Password Anda:');
        break;

      case 'ASK_PASSWORD':
        const password = text;
        try {
          const [users] = await pool.query('SELECT id, password_hash, nama, role_id, satker_id FROM users WHERE username = ?', [state.data.username]);
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
          state.userRole = users[0].role_id;
          state.satkerId = users[0].satker_id;
          state.step = 'IDLE';

          let keyboardMenu = [];
          if (state.userRole === 1 || state.userRole === 2) {
            keyboardMenu.push([{ text: '➕ Pencatatan' }, { text: '➕ Rekening Koran' }]);
            keyboardMenu.push([{ text: '📂 Upload Bukti' }, { text: '📊 Laporan' }]); 
          } else if (state.userRole === 3) {
            keyboardMenu.push([{ text: '📊 Laporan' }]);
          }
          keyboardMenu.push([{ text: '🚪 Logout' }]);

          const opts = {
            reply_markup: {
              keyboard: keyboardMenu,
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

      case 'ASK_RK_SATKER':
        state.data.rk_satker = text;
        state.step = 'ASK_RK_JENIS';
        bot.sendMessage(chatId, 'Masukkan **Jenis** Rekening Koran (contoh: Pemasukan/Pengeluaran):', { parse_mode: 'Markdown' });
        break;

      case 'ASK_RK_JENIS':
        state.data.rk_jenis = text;
        state.step = 'ASK_RK_KATEGORI';
        bot.sendMessage(chatId, 'Masukkan **Kategori** (contoh: Rekening Koran):', { parse_mode: 'Markdown' });
        break;

      case 'ASK_RK_KATEGORI':
        state.data.rk_kategori = text;
        state.step = 'ASK_RK_PERIODE';
        bot.sendMessage(chatId, 'Masukkan **Periode** (1 atau 2):', { parse_mode: 'Markdown' });
        break;

      case 'ASK_RK_PERIODE':
        if (text !== '1' && text !== '2') return bot.sendMessage(chatId, 'Periode harus angka 1 atau 2!');
        state.data.rk_periode = text;
        state.step = 'ASK_RK_KETERANGAN';
        bot.sendMessage(chatId, 'Masukkan **Keterangan/Uraian**:', { parse_mode: 'Markdown' });
        break;

      case 'ASK_RK_KETERANGAN':
        state.data.rk_keterangan = text;
        state.step = 'ASK_RK_FILE';
        bot.sendMessage(chatId, 'Silakan unggah **File/Foto Bukti Rekening Koran**:');
        break;

      case 'ASK_RK_FILE':
        let rkFileId = null;
        if (msg.photo && msg.photo.length > 0) {
          rkFileId = msg.photo[msg.photo.length - 1].file_id;
        } else if (msg.document) {
          rkFileId = msg.document.file_id;
        }
        if (!rkFileId) return bot.sendMessage(chatId, 'Harap kirim Foto atau Dokumen!');
        try {
          bot.sendMessage(chatId, 'Sedang mengunduh bukti bank...');
          const path = require('path');
          const fs = require('fs');
          const uploadDir = path.join(__dirname, '../../uploads/rekening_koran');
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
          const downloadedPath = await bot.downloadFile(rkFileId, uploadDir);
          state.data.rk_file = downloadedPath; // Local path to send to API
        } catch (err) {
          return bot.sendMessage(chatId, 'Gagal mengunduh file.');
        }
        state.step = 'ASK_RK_BANK';
        bot.sendMessage(chatId, 'Masukkan **Nama Bank** (contoh: BRI, Mandiri):', { parse_mode: 'Markdown' });
        break;

      case 'ASK_RK_BANK':
        state.data.rk_bank = text;
        state.step = 'ASK_RK_NOREK';
        bot.sendMessage(chatId, 'Masukkan **Nomor Rekening Bank**:', { parse_mode: 'Markdown' });
        break;

      case 'ASK_RK_NOREK':
        state.data.rk_norek = text;
        state.step = 'ASK_RK_TAHUN';
        bot.sendMessage(chatId, 'Masukkan **Tahun** (contoh: 2026):', { parse_mode: 'Markdown' });
        break;

      case 'ASK_RK_TAHUN':
        if (isNaN(parseInt(text))) return bot.sendMessage(chatId, 'Tahun harus angka!');
        state.data.rk_tahun = parseInt(text);
        state.step = 'ASK_RK_SALDO_AKHIR';
        bot.sendMessage(chatId, 'Terakhir, masukkan **Saldo Akhir Periode** (angka saja, contoh: 1500000):', { parse_mode: 'Markdown' });
        break;

      case 'ASK_RK_SALDO_AKHIR':
        const saldoAkhir = parseInt(text.replace(/\D/g, ''));
        if (isNaN(saldoAkhir)) return bot.sendMessage(chatId, 'Saldo harus angka!');
        state.data.rk_saldo = saldoAkhir;
        
        // Simpan ke database via fungsi
        bot.sendMessage(chatId, '⏳ Sedang menyimpan data Rekening Koran...');
        try {
          const fs = require('fs');
          const FormData = require('form-data');
          const axios = require('axios');
          const form = new FormData();
          // We need satker_id. Let's find it by NO_Satker (kata kunci)
          const [sRes] = await pool.query('SELECT id FROM satkers WHERE NO_Satker = ?', [state.data.rk_satker]);
          let sId = state.satkerId; // Default to user's satker
          if (sRes.length > 0) sId = sRes[0].id;

          form.append('satker_id', sId);
          form.append('jenis', state.data.rk_jenis);
          form.append('kategori', state.data.rk_kategori);
          form.append('periode', state.data.rk_periode);
          form.append('keterangan', state.data.rk_keterangan);
          form.append('nama_bank', state.data.rk_bank);
          form.append('nomor_rekening_bank', state.data.rk_norek);
          form.append('tahun', state.data.rk_tahun);
          form.append('saldo_akhir_periode', state.data.rk_saldo);
          
          if (state.data.rk_file) {
            form.append('file', fs.createReadStream(state.data.rk_file));
          }

          // Use dummy token for bot internally or we can directly insert via DB pool
          // Direct DB pool is much cleaner since we are already inside backend
          // Wait, Rekening Koran has logic to save to R2 and Dokumen. We should use internal logic, OR call API via internal token?
          // I'll call the API with a special header or just require the controller logic! But calling API via axios is easiest.
          const token = require('jsonwebtoken').sign({ id: state.userId, role: 'staff', satker_id: state.satkerId }, process.env.JWT_SECRET);
          await axios.post(`http://localhost:${process.env.APP_PORT || 5000}/api/rekening-koran`, form, {
            headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
          });
          
          bot.sendMessage(chatId, '✅ **Rekening Koran berhasil disimpan!**', { parse_mode: 'Markdown', reply_markup: {
            keyboard: [
              [{ text: '➕ Pencatatan Akuntansi' }],
              [{ text: '📂 Upload Excel' }, { text: '📊 Laporan' }],
              [{ text: '🚪 Logout' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          }});
        } catch (err) {
          console.error('Error save RK:', err);
          bot.sendMessage(chatId, '❌ Gagal menyimpan Rekening Koran.');
        }
        state.step = 'IDLE';
        break;

      case 'ASK_JENIS':
        if (text !== 'PEMASUKAN' && text !== 'PENGELUARAN') {
          return bot.sendMessage(chatId, 'Pilih PEMASUKAN atau PENGELUARAN ya!');
        }
        state.data.jenis = text;
        state.step = 'ASK_KATEGORI';

        // Ambil kategori dari DB
        try {
          const [kategoris] = await pool.query("SELECT id, nama_kategori FROM kategori_akuntansi WHERE LOWER(nama_kategori) NOT LIKE '%rekening koran%'");
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

        if (state.data.kategori_nama && state.data.kategori_nama.toLowerCase().includes('rekening koran')) {
          state.step = 'ASK_BANK';
          bot.sendMessage(chatId, 'Masukkan Nama Bank (contoh: BRI, Mandiri):');
        } else {
          state.step = 'ASK_FILE';
          bot.sendMessage(chatId, 'Unggah Bukti File (Kirim Foto/Dokumen) atau ketik "Lewati" jika tidak ada:');
        }
        break;

      case 'ASK_BANK':
        state.data.nama_bank = text;
        state.step = 'ASK_NOREK';
        bot.sendMessage(chatId, 'Masukkan Nomor Rekening Bank:');
        break;

      case 'ASK_NOREK':
        state.data.nomor_rekening_bank = text;
        state.step = 'ASK_FILE';
        bot.sendMessage(chatId, 'Unggah Bukti File (Kirim Foto/Dokumen) atau ketik "Lewati" jika tidak ada:');
        break;

      case 'ASK_FILE':
        let fileId = null;
        if (msg.photo && msg.photo.length > 0) {
          // Ambil resolusi tertinggi
          fileId = msg.photo[msg.photo.length - 1].file_id;
        } else if (msg.document) {
          fileId = msg.document.file_id;
        }

        if (fileId) {
          try {
            bot.sendMessage(chatId, 'Sedang mengunduh file...');
            const path = require('path');
            const fs = require('fs');
            const uploadDir = path.join(__dirname, '../../uploads/akuntansi');
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }

            const downloadedPath = await bot.downloadFile(fileId, uploadDir);
            const filename = path.basename(downloadedPath);
            state.data.bukti_file = `/api/akuntansi/file/${filename}`;
          } catch (err) {
            console.error('Error download file:', err);
            bot.sendMessage(chatId, 'Gagal mengunduh file, file akan dilewati.');
          }
        } else if (text && text.toLowerCase() !== 'lewati') {
          return bot.sendMessage(chatId, 'Harap kirim Foto/Dokumen, atau ketik "Lewati"');
        }

        state.step = 'ASK_CATATAN';
        bot.sendMessage(chatId, 'Masukkan Catatan Tambahan (Opsional), atau ketik "Lewati":');
        break;

      case 'ASK_CATATAN':
        if (text && text.toLowerCase() !== 'lewati') {
          state.data.catatan = text;
        } else {
          state.data.catatan = null;
        }

        // Finalize and save
        try {
          const tanggal = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

          const dbJenis = state.data.jenis === 'PEMASUKAN' ? 'debit' : 'kredit';

          const [resAkuntansi] = await pool.query(`
            INSERT INTO audit_akuntansi 
            (tanggal, uraian, jenis, id_kategori, nominal, bukti_file, catatan_audit, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            tanggal,
            state.data.uraian,
            dbJenis,
            state.data.id_kategori,
            state.data.nominal,
            state.data.bukti_file || null,
            state.data.catatan || null,
            state.userId
          ]);

          if (state.data.kategori_nama && state.data.kategori_nama.toLowerCase().includes('rekening koran')) {
            await pool.query(`
               INSERT INTO kertas_kerja (satker_id, uploaded_by, nomor_rekening_bank, saldo_akhir_bulan, keterangan, nama_bank, tahun, tanggal_pembukaan_rekening)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             `, [
               state.satkerId || null,
               state.userId,
               state.data.nomor_rekening_bank || null,
               state.data.nominal,
               state.data.uraian,
               state.data.nama_bank || null,
               new Date().getFullYear(),
               tanggal
             ]);
          }

          const rp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(state.data.nominal);

          state.step = 'ASK_TAMBAH_LAGI';
          const opts = {
            reply_markup: {
              keyboard: [
                [{ text: 'Ya' }, { text: 'Tidak' }]
              ],
              resize_keyboard: true,
              one_time_keyboard: true
            }
          };
          bot.sendMessage(chatId, `✅ <b>Berhasil Disimpan ke Web!</b>\n\nJenis: ${state.data.jenis}\nKategori: ${state.data.kategori_nama}\nUraian: ${state.data.uraian}\nNominal: ${rp}\n\nMau tambah data lagi?`, { parse_mode: 'HTML', ...opts });

        } catch (err) {
          console.error(err);
          bot.sendMessage(chatId, 'Terjadi kesalahan saat menyimpan ke database.');
          state.step = 'IDLE';
        }
        break;

      case 'ASK_TAMBAH_LAGI':
        if (text.toLowerCase() === 'ya') {
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
        } else {
          state.step = 'IDLE';
          let keyboardMenu = [];
          if (state.userRole === 1 || state.userRole === 2) {
            keyboardMenu.push([{ text: '➕ Pencatatan' }, { text: '➕ Rekening Koran' }]);
            keyboardMenu.push([{ text: '📂 Upload Bukti' }, { text: '📊 Laporan' }]);
          } else if (state.userRole === 3) {
            keyboardMenu.push([{ text: '📊 Laporan' }]);
          }
          keyboardMenu.push([{ text: '🚪 Logout' }]);
          bot.sendMessage(chatId, 'Oke, kembali ke menu utama.', {
            reply_markup: { keyboard: keyboardMenu, resize_keyboard: true, one_time_keyboard: true }
          });
        }
        break;

      case 'ASK_DOK_KATEGORI': {
        const kat = state.data.doc_kategori_map[text];
        if (!kat) return bot.sendMessage(chatId, 'Angka kategori tidak valid!');
        state.data.doc_kategori_id = kat.id;
        state.step = 'ASK_DOK_JUDUL';
        bot.sendMessage(chatId, 'Masukkan Judul Dokumen:');
        break;
      }
      case 'ASK_DOK_JUDUL': {
        state.data.doc_judul = text;
        state.step = 'ASK_DOK_TAHUN';
        bot.sendMessage(chatId, 'Masukkan Tahun Dokumen (contoh: 2026):');
        break;
      }
      case 'ASK_DOK_TAHUN': {
        state.data.doc_tahun = parseInt(text);
        if (isNaN(state.data.doc_tahun)) return bot.sendMessage(chatId, 'Tahun harus angka!');
        state.step = 'ASK_DOK_FILE';
        bot.sendMessage(chatId, 'Silakan unggah File Dokumen (PDF/Word/Excel dll):');
        break;
      }
      case 'ASK_DOK_FILE': {
        if (!msg.document && !msg.photo) {
          return bot.sendMessage(chatId, 'Harap unggah file dokumen!');
        }
        try {
          bot.sendMessage(chatId, '⏳ Sedang mengunggah dokumen...');
          const fileId = msg.document ? msg.document.file_id : msg.photo[msg.photo.length - 1].file_id;
          const fileNameOrig = msg.document ? msg.document.file_name : 'photo.jpg';
          const downloadDir = '/tmp';
          const filePath = await bot.downloadFile(fileId, downloadDir);
          
          const FormData = require('form-data');
          const axios = require('axios');
          const form = new FormData();
          form.append('kategori_id', state.data.doc_kategori_id);
          form.append('judul', state.data.doc_judul);
          form.append('tahun', state.data.doc_tahun);
          form.append('file', fs.createReadStream(filePath), fileNameOrig);
          
          const jwt = require('jsonwebtoken');
          const token = jwt.sign({ id: state.userId, role: 'staff', satker_id: state.satkerId }, process.env.JWT_SECRET);
          
          await axios.post('http://localhost:' + (process.env.APP_PORT || 5000) + '/api/dokumen/upload', form, {
            headers: { ...form.getHeaders(), Authorization: 'Bearer ' + token }
          });
          fs.unlinkSync(filePath);
          
          state.step = 'IDLE';
          let keyboardMenu = [];
          if (state.userRole === 1 || state.userRole === 2) {
            keyboardMenu.push([{ text: '➕ Pencatatan' }, { text: '➕ Rekening Koran' }]);
            keyboardMenu.push([{ text: '📂 Upload Bukti' }, { text: '📊 Laporan' }]); 
          } else if (state.userRole === 3) {
            keyboardMenu.push([{ text: '📊 Laporan' }]);
          }
          keyboardMenu.push([{ text: '🚪 Logout' }]);
          
          bot.sendMessage(chatId, '✅ Berhasil mengunggah dokumen ke Dashboard!', {
            reply_markup: { keyboard: keyboardMenu, resize_keyboard: true, one_time_keyboard: true }
          });
        } catch (e) {
          console.error(e);
          bot.sendMessage(chatId, '❌ Gagal mengunggah dokumen.');
        }
        break;
      }
      default:
        // Do nothing if step is IDLE and not a specific command
        break;
    }
  });

  console.log('[Telegram Bot] Started Polling for Interactive Input...');
}


function broadcastTelegramNotification(satkerId, message) {
  if (!bot) return;
  for (const chatId in userStates) {
    if (userStates[chatId].satkerId === satkerId && userStates[chatId].userId) {
      bot.sendMessage(chatId, message, { parse_mode: 'HTML' }).catch(e => console.error('Telegram broadcast error:', e));
    }
  }
}

module.exports = { initTelegramBot, broadcastTelegramNotification };
