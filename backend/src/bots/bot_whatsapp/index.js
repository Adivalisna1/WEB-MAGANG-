const { makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const ExcelJS = require('exceljs');
const fs = require('fs');
const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');
const path = require('path');

// In-memory state storage: { remoteJid: { step, data: {}, userId: null, userRole: null, nama: null, satkerId: null } }
const userStates = {};

async function generateLaporanExcelWA(satkerId, satkerNama, jid, sock, pool) {
  try {
    await sock.sendMessage(jid, { text: '⏳ Sedang memproses laporan Excel... Mohon tunggu.' });

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
      return sock.sendMessage(jid, { text: `📭 Tidak ada data transaksi untuk satker *${satkerNama}*.` });
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

    const fileBuffer = fs.readFileSync(filePath);
    await sock.sendMessage(jid, {
      document: fileBuffer,
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileName: fileName,
    });

    fs.unlinkSync(filePath);

    const rp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n);
    await sock.sendMessage(jid, { text: `📊 *Laporan ${satkerNama}*\n\n📈 Total Pemasukan: ${rp(totalDebit)}\n📉 Total Pengeluaran: ${rp(totalKredit)}\n💰 Saldo: ${rp(totalDebit - totalKredit)}\n\n📎 File Excel sudah dikirim di atas.` });
  } catch (err) {
    console.error(err);
    await sock.sendMessage(jid, { text: 'Terjadi kesalahan saat membuat laporan Excel.' });
  }
}

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
      if (state.userId) {
        let menuMsg = `❌ Aksi dibatalkan.\n\nMenu Utama:\n`;
        if (state.userRole === 1 || state.userRole === 2) {
          menuMsg += `*!pencatatan* - Untuk Pencatatan Akuntansi\n`;
          menuMsg += `*!rekeningkoran* - Untuk Tambah Rekening Koran\n`;
          menuMsg += `*!uploadbukti* - Untuk Upload Dokumen\n`;
          menuMsg += `*!laporan* - Untuk Unduh Laporan Satker Anda\n`;
        }
        if (state.userRole === 3) {
          menuMsg += `*!laporan* - Untuk Melihat Ringkasan Data Semua Satker\n`;
        }
        menuMsg += `*!logout* - Untuk Logout Akun`;
        return sendMessage(menuMsg);
      } else {
        return sendMessage('❌ Aksi dibatalkan. Ketik *!login* untuk login.');
      }
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
        menuMsg += `*!pencatatan* - Untuk Pencatatan Akuntansi\n`;
        menuMsg += `*!rekeningkoran* - Untuk Tambah Rekening Koran\n`;
        menuMsg += `*!uploadbukti* - Untuk Upload Dokumen\n`; //\n`;
        menuMsg += `*!laporan* - Untuk Unduh Laporan Satker Anda\n`;
      }
      if (state.userRole === 3) {
        menuMsg += `*!laporan* - Untuk Melihat Ringkasan Data Semua Satker\n`;
      }
      menuMsg += `*!logout* - Untuk Logout Akun`;
      return sendMessage(menuMsg);
    }

    if (text.toLowerCase() === '!login') {
      state.step = 'ASK_USERNAME';
      return sendMessage('🔑 Silakan balas pesan ini dengan *Username/Kode Satker* akun Web Anda:');
    }

    if (text.toLowerCase() === '!uploadbukti') {
      if (!state.userId) return sendMessage('⚠️ Anda harus Login terlebih dahulu! Ketik *!login*.');
      if (state.userRole !== 1 && state.userRole !== 2) return sendMessage('⛔ Maaf, fitur ini hanya untuk Staff dan Pimpinan.');

      state.step = 'ASK_UPLOAD_EXCEL';
      return sendMessage('Silakan kirimkan file Excel (.xlsx) yang berisi data transaksi.\n\nJika butuh contoh formatnya, ketik *!template*');
    }

    if (text.toLowerCase() === '!laporan') {
      if (!state.userId) return sendMessage('⚠️ Anda harus Login terlebih dahulu! Ketik *!login*.');

      if (state.userRole === 3) {
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
      } else {
        // Role 1 and 2
        try {
          const [satkerData] = await pool.query('SELECT nama FROM satkers WHERE id = ?', [state.satkerId]);
          const sNama = satkerData.length > 0 ? satkerData[0].nama : 'Satker Anda';
          await generateLaporanExcelWA(state.satkerId, sNama, jid, sock, pool);
        } catch (err) {
          console.error(err);
          sendMessage('Gagal membuat laporan untuk satker Anda.');
        }
      }
      return;
    }

    if (text.toLowerCase() === '!rekeningkoran') {
      if (!state.userId) return sendMessage('⚠️ Anda harus Login terlebih dahulu! Ketik *!login*.');
      state.step = 'ASK_RK_JENIS';
      state.data = {};
      return sendMessage('Masukkan *Jenis* Rekening Koran (contoh: Pemasukan/Pengeluaran):');
    }

    if (text.toLowerCase() === '!pencatatan' || text.toLowerCase() === '!tambah') {
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
          await generateLaporanExcelWA(satkerId, satkerNama, jid, sock, pool);
          state.step = 'IDLE';
        } catch (err) {
          console.error(err);
          sendMessage('Terjadi kesalahan saat membuat laporan Excel.');
          state.step = 'IDLE';
        }
        break;
      }
      case 'ASK_USERNAME':
        if (!text) return sendMessage('Username/Kode Satker tidak boleh kosong. Masukkan Username/Kode Satker:');
        state.data.username = text;
        state.step = 'ASK_PASSWORD';
        sendMessage('Ketik *Password* Anda:');
        break;

      case 'ASK_PASSWORD':
        if (!text) return;
        const password = text;
        try {
          const [users] = await pool.query('SELECT id, password_hash, nama, role_id, satker_id FROM users WHERE username = ?', [state.data.username]);
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
          state.satkerId = users[0].satker_id;
          state.step = 'IDLE';

          let successMsg = `✅ Login Berhasil! Selamat datang, *${users[0].nama}*.\n\nKetik perintah berikut untuk menggunakan bot:\n`;
          if (state.userRole === 1 || state.userRole === 2) {
            successMsg += '*!pencatatan* - Untuk Pencatatan Akuntansi\n';
            successMsg += '*!rekeningkoran* - Untuk Tambah Rekening Koran\n';
            successMsg += '*!uploadbukti* - Untuk Upload Dokumen\n';
            successMsg += '*!laporan* - Untuk Unduh Laporan Satker Anda\n';
          } else if (state.userRole === 3) {
            successMsg += '*!laporan* - Untuk Unduh Laporan Keuangan\n';
          } else {
            successMsg += 'Ketik *!menu* untuk melihat opsi Anda.\n';
          }
          successMsg += '\nKetik *!logout* untuk keluar.';
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
          const [kategoris] = await pool.query("SELECT id, nama_kategori FROM kategori_akuntansi WHERE LOWER(nama_kategori) NOT LIKE '%rekening koran%'");
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

        if (state.data.kategori_nama && state.data.kategori_nama.toLowerCase().includes('rekening koran')) {
          state.step = 'ASK_BANK';
          sendMessage('Masukkan *Nama Bank* (contoh: BRI, Mandiri):');
        } else {
          state.step = 'ASK_FILE';
          sendMessage('Unggah *Bukti File* (Kirim Foto/Dokumen) atau ketik "Lewati" jika tidak ada:');
        }
        break;

      case 'ASK_BANK':
        state.data.nama_bank = text;
        state.step = 'ASK_NOREK';
        sendMessage('Masukkan *Nomor Rekening Bank*:');
        break;

      case 'ASK_NOREK':
        state.data.nomor_rekening_bank = text;
        state.step = 'ASK_FILE';
        sendMessage('Unggah *Bukti File* (Kirim Foto/Dokumen) atau ketik "Lewati" jika tidak ada:');
        break;

      case 'ASK_FILE':
        const messageType = Object.keys(msg.message || {})[0];
        if (messageType === 'imageMessage' || messageType === 'documentMessage') {
          try {
            sendMessage('⏳ Sedang mengunduh file...');
            const { downloadMediaMessage } = require('@whiskeysockets/baileys');
            const buffer = await downloadMediaMessage(msg, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
            const path = require('path');
            const fs = require('fs');
            const uploadDir = path.join(__dirname, '../../uploads/akuntansi');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            
            let ext = '.bin';
            if (messageType === 'imageMessage') ext = '.jpeg';
            else if (msg.message.documentMessage.fileName) ext = path.extname(msg.message.documentMessage.fileName);
            
            const fileName = `wa-bukti-${Date.now()}${ext}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);
            state.data.local_file_path = filePath;
          } catch (err) {
            console.error('Error download WA file:', err);
            sendMessage('❌ Gagal mengunduh file, file dilewati.');
          }
        } else if (text && text.toLowerCase() !== 'lewati') {
          return sendMessage('⚠️ Harap kirimkan foto atau dokumen, atau ketik "Lewati"');
        }

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

          const fs = require('fs');
          const FormData = require('form-data');
          const axios = require('axios');
          const form = new FormData();
          
          form.append('jenis', state.data.jenis);
          form.append('id_kategori', state.data.id_kategori);
          form.append('uraian', state.data.uraian);
          form.append('nominal', state.data.nominal);
          if (state.data.catatan) form.append('catatan_audit', state.data.catatan);
          
          if (state.data.kategori_nama && state.data.kategori_nama.toLowerCase().includes('rekening koran')) {
            if (state.data.nama_bank) form.append('nama_bank', state.data.nama_bank);
            if (state.data.nomor_rekening_bank) form.append('nomor_rekening_bank', state.data.nomor_rekening_bank);
          }
          
          if (state.data.local_file_path) {
            form.append('file', fs.createReadStream(state.data.local_file_path));
          }

          const jwt = require('jsonwebtoken');
          const token = jwt.sign({ id: state.userId, role: state.userRole === 1 ? 'pimpinan_satker' : 'staff_satker', satker_id: state.satkerId }, process.env.JWT_SECRET);
          
          await axios.post('http://localhost:' + (process.env.APP_PORT || 5000) + '/api/pencatatan', form, {
            headers: { ...form.getHeaders(), Authorization: 'Bearer ' + token }
          });

          const rp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(state.data.nominal);
          const jns = state.data.jenis === 'debit' ? 'Pemasukan' : 'Pengeluaran';

          state.step = 'IDLE';
          let menuMsg = `✅ *Berhasil Disimpan ke Web!*\n\nJenis: ${jns}\nKategori: ${state.data.kategori_nama}\nUraian: ${state.data.uraian}\nNominal: ${rp}\n\nMenu Utama:\n`;
          if (state.userRole === 1 || state.userRole === 2) {
            menuMsg += 'Ketik *!pencatatan* untuk mencatat transaksi baru.\n';
            menuMsg += 'Ketik *!rekeningkoran* untuk Rekening Koran.\n';
            menuMsg += 'Ketik *!uploadbukti* untuk Upload Dokumen.\n';
            menuMsg += 'Ketik *!laporan* untuk Unduh Laporan Satker Anda.\n';
          } else if (state.userRole === 3) {
            menuMsg += 'Ketik *!laporan* untuk Melihat Ringkasan Data Semua Satker.\n';
          }
          menuMsg += 'Ketik *!logout* untuk keluar.';
          sendMessage(menuMsg);

        } catch (err) {
          console.error(err);
          sendMessage('Terjadi kesalahan saat menyimpan ke database.');
          state.step = 'IDLE';
        }
        break;

      case 'ASK_DOK_KATEGORI': {
        const kat = state.data.doc_kategori_map[text];
        if (!kat) return sendMessage('Angka kategori tidak valid!');
        state.data.doc_kategori_id = kat.id;
        state.step = 'ASK_DOK_JUDUL';
        sendMessage('Masukkan Judul Dokumen:');
        break;
      }
      case 'ASK_DOK_JUDUL': {
        state.data.doc_judul = text;
        state.step = 'ASK_DOK_TAHUN';
        sendMessage('Masukkan Tahun Dokumen (contoh: 2026):');
        break;
      }
      case 'ASK_DOK_TAHUN': {
        state.data.doc_tahun = parseInt(text);
        if (isNaN(state.data.doc_tahun)) return sendMessage('Tahun harus angka!');
        state.step = 'ASK_DOK_FILE';
        sendMessage('Silakan unggah File Dokumen (PDF/Word/Excel dll):');
        break;
      }
      case 'ASK_DOK_FILE': {
        const docMsg = msg.message.documentMessage || msg.message.documentWithCaptionMessage?.message?.documentMessage || msg.message.imageMessage;
        if (!docMsg) {
          return sendMessage('Harap kirimkan file dokumen!');
        }
        try {
          sendMessage('⏳ Sedang mengunggah dokumen...');
          const { downloadMediaMessage } = require('@whiskeysockets/baileys');
          const pino = require('pino');
          const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage });
          
          const path = require('path');
          const tmpPath = path.join('/tmp', `wa-dok-${Date.now()}.tmp`);
          const fs = require('fs');
          fs.writeFileSync(tmpPath, buffer);
          
          let fileNameOrig = 'document.pdf';
          if (msg.message.documentMessage?.fileName) {
            fileNameOrig = msg.message.documentMessage.fileName;
          } else if (msg.message.imageMessage) {
            fileNameOrig = 'image.jpg';
          }
          
          const FormData = require('form-data');
          const axios = require('axios');
          const form = new FormData();
          form.append('kategori_id', state.data.doc_kategori_id);
          form.append('judul', state.data.doc_judul);
          form.append('tahun', state.data.doc_tahun);
          form.append('file', fs.createReadStream(tmpPath), { filename: fileNameOrig });
          
          const jwt = require('jsonwebtoken');
          const token = jwt.sign({ id: state.userId, role: 'staff', satker_id: state.satkerId }, process.env.JWT_SECRET);
          
          await axios.post('http://localhost:' + (process.env.APP_PORT || 5000) + '/api/dokumen/upload', form, {
            headers: { ...form.getHeaders(), Authorization: 'Bearer ' + token }
          });
          fs.unlinkSync(tmpPath);
          
          state.step = 'IDLE';
          let menuMsg = '✅ Berhasil mengunggah dokumen ke Dashboard!\n\nMenu Utama:\n';
          if (state.userRole === 1 || state.userRole === 2) {
            menuMsg += 'Ketik *!pencatatan* untuk mencatat transaksi baru.\n';
            menuMsg += 'Ketik *!rekeningkoran* untuk Rekening Koran.\n';
            menuMsg += 'Ketik *!uploadbukti* untuk Upload Dokumen.\n';
            menuMsg += 'Ketik *!laporan* untuk Unduh Laporan Satker Anda.\n';
          } else if (state.userRole === 3) {
            menuMsg += 'Ketik *!laporan* untuk Melihat Ringkasan Data Semua Satker.\n';
          }
          menuMsg += 'Ketik *!logout* untuk keluar.';
          sendMessage(menuMsg);
        } catch (e) {
          console.error(e);
          sendMessage('❌ Gagal mengunggah dokumen.');
        }
        break;
      }
      


      case 'ASK_RK_JENIS':
        state.data.rk_jenis = text.toLowerCase().includes('pemasukan') ? 'debit' : 'kredit';
        state.data.rk_kategori = 'Rekening Koran';
        state.data.id_kategori = 7;
        state.step = 'ASK_RK_PERIODE';
        sendMessage('Masukkan *Periode* (1 atau 2):');
        break;

      case 'ASK_RK_PERIODE':
        if (text !== '1' && text !== '2') return sendMessage('Periode harus angka 1 atau 2!');
        state.data.rk_periode = text;
        state.step = 'ASK_RK_KETERANGAN';
        sendMessage('Masukkan *Keterangan/Uraian*:');
        break;

      case 'ASK_RK_KETERANGAN':
        state.data.rk_keterangan = text;
        state.step = 'ASK_RK_FILE';
        sendMessage('Silakan unggah *File/Foto Bukti Rekening Koran*:');
        break;

      case 'ASK_RK_FILE': {
        const rkMessageType = Object.keys(msg.message || {})[0];
        if (rkMessageType === 'imageMessage' || rkMessageType === 'documentMessage') {
          try {
            sendMessage('⏳ Sedang mengunduh file...');
            const { downloadMediaMessage } = require('@whiskeysockets/baileys');
            const buffer = await downloadMediaMessage(msg, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
            const path = require('path');
            const fs = require('fs');
            const uploadDir = path.join(__dirname, '../../uploads/rekening_koran');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            
            let ext = '.bin';
            if (rkMessageType === 'imageMessage') ext = '.jpeg';
            else if (msg.message.documentMessage?.fileName) ext = path.extname(msg.message.documentMessage.fileName);
            
            const fileName = `wa-rk-${Date.now()}${ext}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);
            state.data.rk_file = filePath;
            
            state.step = 'ASK_RK_BANK';
            sendMessage('Masukkan *Nama Bank* (contoh: BRI, Mandiri):');
          } catch (err) {
            console.error('Error download RK WA file:', err);
            sendMessage('❌ Gagal mengunduh file.');
          }
        } else {
          return sendMessage('⚠️ Harap kirimkan foto atau dokumen!');
        }
        break;
      }

      case 'ASK_RK_BANK':
        state.data.rk_bank = text;
        state.step = 'ASK_RK_NOREK';
        sendMessage('Masukkan *Nomor Rekening Bank*:');
        break;

      case 'ASK_RK_NOREK':
        state.data.rk_norek = text;
        state.step = 'ASK_RK_TAHUN';
        sendMessage('Masukkan *Tahun* (contoh: 2026):');
        break;

      case 'ASK_RK_TAHUN':
        if (isNaN(parseInt(text))) return sendMessage('Tahun harus angka!');
        state.data.rk_tahun = parseInt(text);
        state.step = 'ASK_RK_SALDO_AKHIR';
        sendMessage('Terakhir, masukkan *Saldo Akhir Periode* (angka saja, contoh: 1500000):');
        break;

      case 'ASK_RK_SALDO_AKHIR':
        const saldoAkhir = parseInt(text.replace(/\D/g, ''));
        if (isNaN(saldoAkhir)) return sendMessage('Saldo harus angka!');
        state.data.rk_saldo = saldoAkhir;
        
        sendMessage('⏳ Sedang menyimpan data Rekening Koran...');
        try {
          const fs = require('fs');
          const FormData = require('form-data');
          const axios = require('axios');
          const form = new FormData();
          
          let sId = state.satkerId;

          form.append('jenis', state.data.rk_jenis);
          form.append('id_kategori', state.data.id_kategori);
          form.append('uraian', state.data.rk_keterangan);
          form.append('nominal', state.data.rk_saldo);
          form.append('nama_bank', state.data.rk_bank);
          form.append('nomor_rekening_bank', state.data.rk_norek);
          
          if (state.data.rk_file) {
            form.append('file', fs.createReadStream(state.data.rk_file));
          }

          const jwt = require('jsonwebtoken');
          const token = jwt.sign({ id: state.userId, role: state.userRole === 1 ? 'pimpinan_satker' : 'staff_satker', satker_id: state.satkerId }, process.env.JWT_SECRET);
          
          await axios.post('http://localhost:' + (process.env.APP_PORT || 5000) + '/api/pencatatan', form, {
            headers: { ...form.getHeaders(), Authorization: 'Bearer ' + token }
          });
          
          let menuMsg = '✅ *Rekening Koran berhasil disimpan!*\n\nMenu Utama:\n';
          if (state.userRole === 1 || state.userRole === 2) {
            menuMsg += 'Ketik *!pencatatan* untuk mencatat transaksi baru.\n';
            menuMsg += 'Ketik *!rekeningkoran* untuk Rekening Koran.\n';
            menuMsg += 'Ketik *!uploadbukti* untuk Upload Dokumen.\n';
            menuMsg += 'Ketik *!laporan* untuk Unduh Laporan Satker Anda.\n';
          } else if (state.userRole === 3) {
            menuMsg += 'Ketik *!laporan* untuk Melihat Ringkasan Data Semua Satker.\n';
          }
          menuMsg += 'Ketik *!logout* untuk keluar.';
          sendMessage(menuMsg);
        } catch (err) {
          console.error('Error save RK WA:', err);
          sendMessage('❌ Gagal menyimpan Rekening Koran.');
        }
        state.step = 'IDLE';
        break;
      default:
        // Do nothing if step is IDLE and not a specific command
        break;
    }
  });
}


function broadcastWhatsAppNotification(satkerId, message) {
  if (!sock) return;
  for (const jid in userStates) {
    if (userStates[jid].satkerId === satkerId && userStates[jid].userId) {
      sock.sendMessage(jid, { text: message }).catch(e => console.error('WhatsApp broadcast error:', e));
    }
  }
}

module.exports = { initWhatsAppBot, broadcastWhatsAppNotification };


function broadcastWhatsAppNotification(satkerId, message) {
  if (!sock) return;
  for (const jid in userStates) {
    if (userStates[jid].satkerId === satkerId && userStates[jid].userId) {
      sock.sendMessage(jid, { text: message }).catch(e => console.error('WhatsApp broadcast error:', e));
    }
  }
}

module.exports = { initWhatsAppBot, broadcastWhatsAppNotification };
