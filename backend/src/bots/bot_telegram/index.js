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
      SELECT a.tanggal, a.uraian, a.jenis, k.nama_kategori, a.nominal, a.catatan_audit, u.nama as dibuat_oleh, s.nama as satker
      FROM audit_akuntansi a
      LEFT JOIN kategori_akuntansi k ON a.id_kategori = k.id
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
      keyboardMenu.push([{ text: '➕ Tambah Transaksi' }, { text: '📂 Upload Excel' }]);
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
      bot.sendMessage(chatId, 'Masukkan Username akun Web Anda:', { reply_markup: { remove_keyboard: true } });
      return;
    }

    if (text === '📂 Upload Excel') {
      if (!state.userId) {
        bot.sendMessage(chatId, 'Anda harus Login terlebih dahulu! Ketik /start lalu klik 🔑 Login.');
        return;
      }
      if (state.userRole !== 1 && state.userRole !== 2) {
        bot.sendMessage(chatId, '⛔ Maaf, fitur ini hanya untuk Staff dan Pimpinan.');
        return;
      }
      state.step = 'ASK_UPLOAD_EXCEL';
      bot.sendMessage(chatId, 'Silakan unggah file Excel (.xlsx) yang berisi data transaksi Anda.\n\nJika butuh contoh formatnya, ketik *📄 Template*', { parse_mode: 'Markdown' });
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

    if (text === '➕ Tambah Transaksi') {
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
            keyboardMenu.push([{ text: '➕ Tambah Transaksi' }, { text: '📂 Upload Excel' }]);
            keyboardMenu.push([{ text: '📊 Laporan' }]); // Give Staff/Pimpinan access to Laporan
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

          await pool.query(`
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
            keyboardMenu.push([{ text: '➕ Tambah Transaksi' }, { text: '📂 Upload Excel' }]);
            keyboardMenu.push([{ text: '📊 Laporan' }]);
          } else if (state.userRole === 3) {
            keyboardMenu.push([{ text: '📊 Laporan' }]);
          }
          keyboardMenu.push([{ text: '🚪 Logout' }]);
          bot.sendMessage(chatId, 'Oke, kembali ke menu utama.', {
            reply_markup: { keyboard: keyboardMenu, resize_keyboard: true, one_time_keyboard: true }
          });
        }
        break;

      case 'ASK_UPLOAD_EXCEL':
        if (text && (text.toLowerCase() === 'template' || text === '📄 Template' || text.toLowerCase() === '!template')) {
          try {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Template');
            sheet.columns = [
              { header: 'Tanggal (YYYY-MM-DD)', key: 'tanggal', width: 22 },
              { header: 'Uraian', key: 'uraian', width: 30 },
              { header: 'Jenis (debit/kredit)', key: 'jenis', width: 20 },
              { header: 'ID Kategori', key: 'id_kategori', width: 15 },
              { header: 'Nominal', key: 'nominal', width: 20 },
              { header: 'Catatan', key: 'catatan', width: 30 }
            ];
            
            // Example row
            sheet.addRow({
              tanggal: '2023-10-01',
              uraian: 'Contoh Transaksi',
              jenis: 'debit',
              id_kategori: 1,
              nominal: 150000,
              catatan: 'Opsional'
            });

            const tmpPath = path.join('/tmp', `Template_Upload_${Date.now()}.xlsx`);
            await workbook.xlsx.writeFile(tmpPath);
            await bot.sendDocument(chatId, tmpPath);
            fs.unlinkSync(tmpPath);
          } catch (e) {
            console.error(e);
            bot.sendMessage(chatId, 'Gagal membuat template.');
          }
          return;
        }

        if (!msg.document) {
           return bot.sendMessage(chatId, 'Harap unggah file dokumen Excel (.xlsx), atau ketik ❌ Batal.');
        }

        try {
           bot.sendMessage(chatId, '⏳ Sedang memproses file Excel...');
           const downloadDir = '/tmp';
           const filePath = await bot.downloadFile(msg.document.file_id, downloadDir);
           
           const workbook = new ExcelJS.Workbook();
           await workbook.xlsx.readFile(filePath);
           const sheet = workbook.getWorksheet(1);
           
           let insertedCount = 0;
           // Start reading from row 2 (skipping header)
           for (let i = 2; i <= sheet.rowCount; i++) {
               const row = sheet.getRow(i);
               
               let tglVal = row.getCell(1).value;
               let tglStr = null;
               if (tglVal instanceof Date) {
                 tglStr = tglVal.toISOString().split('T')[0];
               } else if (typeof tglVal === 'string') {
                 tglStr = tglVal;
               } else {
                 tglStr = new Date().toISOString().split('T')[0];
               }

               const uraian = row.getCell(2).text;
               const jenisStr = row.getCell(3).text;
               const idKategori = parseInt(row.getCell(4).value) || 1;
               const nominal = parseFloat(row.getCell(5).value) || 0;
               const catatan = row.getCell(6).text;
               
               if (!uraian || !jenisStr || nominal === 0) continue;
               
               let dbJenis = jenisStr.toLowerCase() === 'debit' ? 'debit' : 'kredit';
               
               await pool.query(`
                INSERT INTO audit_akuntansi 
                (tanggal, uraian, jenis, id_kategori, nominal, catatan_audit, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `, [
                 tglStr,
                 uraian,
                 dbJenis,
                 idKategori,
                 nominal,
                 catatan || null,
                 state.userId
              ]);
              insertedCount++;
           }
           fs.unlinkSync(filePath);
           
           state.step = 'IDLE';
           let keyboardMenu = [];
           if (state.userRole === 1 || state.userRole === 2) {
             keyboardMenu.push([{ text: '➕ Tambah Transaksi' }, { text: '📂 Upload Excel' }]);
           } else if (state.userRole === 3) {
             keyboardMenu.push([{ text: '📊 Laporan' }]);
           }
           keyboardMenu.push([{ text: '🚪 Logout' }]);
           
           bot.sendMessage(chatId, `✅ Berhasil memasukkan ${insertedCount} data transaksi dari Excel!`, {
              reply_markup: { keyboard: keyboardMenu, resize_keyboard: true, one_time_keyboard: true }
           });
        } catch (err) {
           console.error(err);
           bot.sendMessage(chatId, 'Terjadi kesalahan saat membaca file Excel. Pastikan formatnya .xlsx');
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
