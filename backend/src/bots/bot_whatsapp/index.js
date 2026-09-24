const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const ExcelJS = require('exceljs');
const fs = require('fs');
const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');
const path = require('path');

// In-memory state storage: { remoteJid: { step, data: {}, userId: null } }
const userStates = {};

async function initWhatsAppBot() {
  // Simpan auth WA di folder uploads biar persisten di Docker
  const authDir = path.join(__dirname, '../../../uploads/wa_auth');
  
  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: ['Ubuntu', 'Chrome', '110.0.5481.77'],
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('[WhatsApp Bot] Scan QR Code ini di menu Linked Devices WhatsApp Anda:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('[WhatsApp Bot] Koneksi terputus. Reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        initWhatsAppBot();
      } else {
        console.log('[WhatsApp Bot] Logged out. Hapus folder wa_auth untuk scan ulang.');
      }
    } else if (connection === 'open') {
      console.log('[WhatsApp Bot] Berhasil terhubung ke WhatsApp!');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;
    if (msg.key.remoteJid.includes('@g.us')) return; // Abaikan pesan grup

    const jid = msg.key.remoteJid;
    // Ambil text
    const textMsg = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.ephemeralMessage?.message?.extendedTextMessage?.text || msg.message.ephemeralMessage?.message?.conversation;
    const text = textMsg ? textMsg.trim() : '';

    console.log('[WhatsApp Incoming]', jid, ':', text, JSON.stringify(msg.message));

    if (!userStates[jid]) {
      userStates[jid] = { step: 'IDLE', data: {}, userId: null };
    }

    let state = userStates[jid];

    const sendMessage = async (textMsg) => {
      await sock.sendMessage(jid, { text: textMsg });
    };

    if (text.toLowerCase() === '!batal') {
      userStates[jid].step = 'IDLE';
      return sendMessage('❌ Aksi dibatalkan. Ketik *!menu* untuk melihat opsi.');
    }

    if (text.toLowerCase() === '!logout') {
      userStates[jid] = { step: 'IDLE', data: {}, userId: null };
      return sendMessage('🚪 Berhasil Logout dari sistem. Ketik *!login* untuk login ulang.');
    }

    if (text.toLowerCase() === '!menu' || text.toLowerCase() === '!start') {
      userStates[jid].step = 'IDLE'; // Reset step
      if (!state.userId) {
        return sendMessage('Halo! Anda belum login. Silakan ketik *!login* untuk menghubungkan akun Web Anda.');
      }
      
      let menuMsg = `Halo! Selamat datang di Bot WhatsApp Pencatatan, *${state.nama}*.\n\nKetik perintah berikut:\n`;
      if (state.userRole === 1 || state.userRole === 2) {
        menuMsg += `*!tambah* - Untuk Tambah Transaksi\n`;
      }
      if (state.userRole === 3) {
        menuMsg += `*!laporan* - Untuk Melihat Ringkasan Data (Khusus Eselon 1)\n`;
      }
      menuMsg += `*!logout* - Untuk Logout Akun`;
      return sendMessage(menuMsg);
    }

    if (text.toLowerCase() === '!login') {
      state.step = 'ASK_USERNAME';
      return sendMessage('🔑 Silakan balas pesan ini dengan *Username* akun Web Anda:');
    }

    if (text.toLowerCase() === '!laporan') {
      if (!state.userId) return sendMessage('⚠️ Anda harus Login terlebih dahulu! Ketik *!login*.');
      if (state.userRole !== 3) {
        return sendMessage('⛔ Maaf, perintah ini hanya untuk Eselon 1.');
      }
      
      try {
        const [satkers] = await pool.query('SELECT id, nama FROM satkers ORDER BY nama ASC');
        if (satkers.length === 0) return sendMessage('Data Satker kosong di database.');
        
        let satkerMsg = 'Pilih Satuan Kerja (Balas dengan angkanya):\n*0. Semua Satker (Global)*\n';
        state.data = {};
        state.data.satker_map = {};
        satkers.forEach((s, idx) => {
          const num = idx + 1;
          satkerMsg += `${num}. ${s.nama}\n`;
          state.data.satker_map[num.toString()] = { id: s.id, nama: s.nama };
        });
        
        state.step = 'ASK_SATKER_LAPORAN';
        sendMessage(satkerMsg);
      } catch (err) {
        console.error(err);
        sendMessage('Gagal mengambil list Satker.');
      }
      return;
    }

    if (text.toLowerCase() === '!tambah') {
      if (!state.userId) {
        return sendMessage('⚠️ Anda harus Login terlebih dahulu! Ketik *!login*.');
      }
      if (state.userRole !== 1 && state.userRole !== 2) {
        return sendMessage('⛔ Maaf, fitur ini hanya untuk Staff dan Pimpinan.');
      }
      
      state.step = 'ASK_JENIS';
      state.data = {};
      return sendMessage('Silakan pilih Jenis Transaksi (Balas dengan angka):\n1. Pemasukan\n2. Pengeluaran');
    }

    // STATE MACHINE
    switch (state.step) {
      case 'ASK_SATKER_LAPORAN': {
        let satkerId = null;
        let satkerNama = 'Semua Satker (Global)';
        
        if (text === '0') {
          // All satkers
        } else {
          const chosen = state.data.satker_map[text];
          if (!chosen) {
            return sendMessage('Nomor satker tidak valid! Balas dengan angka yang ada di list, atau *0* untuk Semua Satker.');
          }
          satkerId = chosen.id;
          satkerNama = chosen.nama;
        }
        
        try {
          sendMessage('⏳ Sedang memproses laporan Excel... Mohon tunggu.');
          
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
            state.step = 'IDLE';
            return sendMessage(`📭 Tidak ada data transaksi untuk satker *${satkerNama}*.`);
          }
          
          // Generate Excel
          const workbook = new ExcelJS.Workbook();
          const sheet = workbook.addWorksheet('Laporan Keuangan');
          
          // Header style
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
          
          // Style header row
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
          
          // Summary rows
          const lastRow = rows.length + 2;
          sheet.addRow({});
          sheet.addRow({ uraian: 'Total Pemasukan', nominal: totalDebit });
          sheet.addRow({ uraian: 'Total Pengeluaran', nominal: totalKredit });
          sheet.addRow({ uraian: 'Saldo', nominal: totalDebit - totalKredit });
          
          // Format nominal column as number
          sheet.getColumn('nominal').numFmt = '#,##0';
          
          // Write to temp file
          const tmpDir = '/tmp';
          const fileName = `Laporan_${satkerNama.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}_${Date.now()}.xlsx`;
          const filePath = path.join(tmpDir, fileName);
          await workbook.xlsx.writeFile(filePath);
          
          // Send file via WA
          const fileBuffer = fs.readFileSync(filePath);
          await sock.sendMessage(jid, {
            document: fileBuffer,
            mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            fileName: fileName,
          });
          
          // Cleanup
          fs.unlinkSync(filePath);
          
          const rp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n);
          sendMessage(`📊 *Laporan ${satkerNama}*\n\n📈 Total Pemasukan: ${rp(totalDebit)}\n📉 Total Pengeluaran: ${rp(totalKredit)}\n💰 Saldo: ${rp(totalDebit - totalKredit)}\n\n📎 File Excel sudah dikirim di atas.`);
          state.step = 'IDLE';
        } catch (err) {
          console.error(err);
          sendMessage('Terjadi kesalahan saat membuat laporan Excel.');
          state.step = 'IDLE';
        }
        break;
      }
      case 'ASK_USERNAME':
        if (!text) return sendMessage('Username tidak boleh kosong. Masukkan Username:');
        state.data.username = text;
        state.step = 'ASK_PASSWORD';
        sendMessage('Ketik *Password* Anda:');
        break;

      case 'ASK_PASSWORD':
        if (!text) return;
        const password = text;
        try {
          const [users] = await pool.query('SELECT id, password_hash, nama, role_id FROM users WHERE username = ?', [state.data.username]);
          if (users.length === 0) {
            state.step = 'IDLE';
            return sendMessage('❌ Username tidak ditemukan! Ketik *!login* untuk mengulang.');
          }
          
          const validPass = await bcrypt.compare(password, users[0].password_hash);
          if (!validPass) {
            state.step = 'IDLE';
            return sendMessage('❌ Password salah! Ketik *!login* untuk mengulang.');
          }

          state.userId = users[0].id;
          state.userRole = users[0].role_id;
          state.nama = users[0].nama;
          state.step = 'IDLE';
          
          let successMsg = `✅ Login Berhasil! Selamat datang, *${users[0].nama}*.\n\n`;
          if (state.userRole === 1 || state.userRole === 2) {
            successMsg += 'Ketik *!tambah* untuk mencatat transaksi.';
          } else if (state.userRole === 3) {
            successMsg += 'Ketik *!laporan* untuk melihat ringkasan keuangan.';
          } else {
            successMsg += 'Ketik *!menu* untuk melihat opsi Anda.';
          }
          sendMessage(successMsg);
        } catch (err) {
          console.error(err);
          sendMessage('Terjadi kesalahan sistem saat login.');
        }
        break;

      case 'ASK_JENIS':
        if (text === '1') {
          state.data.jenis = 'debit';
        } else if (text === '2') {
          state.data.jenis = 'kredit';
        } else {
          return sendMessage('Pilih angka *1* (Pemasukan) atau *2* (Pengeluaran)!');
        }
        
        state.step = 'ASK_KATEGORI';
        try {
          const [kategoris] = await pool.query("SELECT id, nama_kategori FROM kategori_akuntansi");
          if (kategoris.length === 0) {
             return sendMessage('Kategori kosong di database.');
          }
          
          let catMsg = 'Pilih Kategori Akun (Balas dengan angkanya):\n';
          state.data.kategori_map = {};
          kategoris.forEach((k, idx) => {
            const num = idx + 1;
            catMsg += `${num}. ${k.nama_kategori}\n`;
            state.data.kategori_map[num.toString()] = { id: k.id, nama: k.nama_kategori };
          });
          sendMessage(catMsg);
        } catch (err) {
          console.error(err);
          sendMessage('Gagal mengambil list kategori.');
        }
        break;

      case 'ASK_KATEGORI':
        const kat = state.data.kategori_map[text];
        if (!kat) {
          return sendMessage('Nomor kategori tidak valid! Silakan balas dengan angka yang ada di list atas.');
        }
        state.data.id_kategori = kat.id;
        state.data.kategori_nama = kat.nama;
        
        state.step = 'ASK_URAIAN';
        sendMessage('Ketik Uraian/Deskripsi transaksi (Contoh: Pembayaran ATK):');
        break;

      case 'ASK_URAIAN':
        if (!text) return sendMessage('Uraian tidak boleh kosong!');
        state.data.uraian = text;
        state.step = 'ASK_NOMINAL';
        sendMessage('Masukkan Nominal (Angka saja, tanpa titik/koma. Contoh: 1500000):');
        break;

      case 'ASK_NOMINAL':
        if (!text) return;
        const nominal = parseInt(text.replace(/\D/g, ''));
        if (isNaN(nominal)) {
          return sendMessage('Nominal harus berupa angka! Coba masukkan lagi:');
        }
        state.data.nominal = nominal;
        
        // Lewati fitur upload file dulu untuk WA karena butuh download media (Buffer) -> fs.writeFile
        state.step = 'ASK_CATATAN';
        sendMessage('Masukkan Catatan Tambahan (Opsional), atau ketik "Lewati" :');
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
          
          await pool.query(`
            INSERT INTO audit_akuntansi 
            (tanggal, uraian, jenis, id_kategori, nominal, catatan_audit, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            tanggal, 
            state.data.uraian, 
            state.data.jenis, 
            state.data.id_kategori, 
            state.data.nominal, 
            state.data.catatan,
            state.userId
          ]);

          const rp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(state.data.nominal);
          const jns = state.data.jenis === 'debit' ? 'Pemasukan' : 'Pengeluaran';
          
          sendMessage(`✅ *Berhasil Disimpan ke Web!*\n\nJenis: ${jns}\nKategori: ${state.data.kategori_nama}\nUraian: ${state.data.uraian}\nNominal: ${rp}`);
          
          state.step = 'IDLE';

        } catch (err) {
          console.error(err);
          sendMessage('Terjadi kesalahan saat menyimpan ke database.');
        }
        break;
        
      default:
        // Do nothing if step is IDLE and not a specific command
        break;
    }
  });
}

module.exports = { initWhatsAppBot };

module.exports = { initWhatsAppBot };
