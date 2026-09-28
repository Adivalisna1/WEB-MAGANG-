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
        menuMsg += `*!rekeningkoran* - Untuk Tambah Rekening Koran\n`;
        menuMsg += `*!upload* - Untuk Upload Transaksi via Excel\n`;
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
      return sendMessage('🔑 Silakan balas pesan ini dengan *Username* akun Web Anda:');
    }

    if (text.toLowerCase() === '!upload') {
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

    if (text.toLowerCase() === '!rekeningkoran') {
      if (!state.userId) return sendMessage('⚠️ Anda harus Login terlebih dahulu!');
      state.step = 'ASK_RK_SATKER';
      state.data = {};
      return sendMessage('Masukkan *Nomor Satker* (sebagai kata kunci):');
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
        if (!text) return sendMessage('Username tidak boleh kosong. Masukkan Username:');
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

      case 'ASK_RK_SATKER':
        state.data.rk_satker = text;
        state.step = 'ASK_RK_JENIS';
        sendMessage('Masukkan *Jenis* Rekening Koran (contoh: Pemasukan/Pengeluaran):');
        break;

      case 'ASK_RK_JENIS':
        state.data.rk_jenis = text;
        state.step = 'ASK_RK_KATEGORI';
        sendMessage('Masukkan *Kategori* (contoh: Rekening Koran):');
        break;

      case 'ASK_RK_KATEGORI':
        state.data.rk_kategori = text;
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

      case 'ASK_RK_FILE':
        const messageType = Object.keys(msg.message || {})[0];
        if (messageType === 'imageMessage' || messageType === 'documentMessage') {
          try {
            sendMessage('⏳ Sedang mengunduh file...');
            const { downloadMediaMessage } = require('@whiskeysockets/baileys');
            const buffer = await downloadMediaMessage(msg, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
            const path = require('path');
            const fs = require('fs');
            const uploadDir = path.join(__dirname, '../../uploads/rekening_koran');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            
            let ext = '.bin';
            if (messageType === 'imageMessage') ext = '.jpeg';
            else if (msg.message.documentMessage.fileName) ext = path.extname(msg.message.documentMessage.fileName);
            
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
          
          const [sRes] = await pool.query('SELECT id FROM satkers WHERE NO_Satker = ?', [state.data.rk_satker]);
          let sId = state.satkerId; 
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

          const jwt = require('jsonwebtoken');
          const token = jwt.sign({ id: state.userId, role: 'staff', satker_id: state.satkerId }, process.env.JWT_SECRET);
          
          await axios.post(`http://localhost:${process.env.APP_PORT || 5000}/api/rekening-koran`, form, {
            headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
          });
          
          sendMessage('✅ *Rekening Koran berhasil disimpan!*\nKetik *!menu* untuk opsi lain.');
        } catch (err) {
          console.error('Error save RK WA:', err);
          sendMessage('❌ Gagal menyimpan Rekening Koran.');
        }
        state.step = 'IDLE';
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

          state.step = 'ASK_TAMBAH_LAGI';
          sendMessage(`✅ *Berhasil Disimpan ke Web!*\n\nJenis: ${jns}\nKategori: ${state.data.kategori_nama}\nUraian: ${state.data.uraian}\nNominal: ${rp}\n\nMau tambah data lagi? Balas dengan *Ya* atau *Tidak*.`);

        } catch (err) {
          console.error(err);
          sendMessage('Terjadi kesalahan saat menyimpan ke database.');
          state.step = 'IDLE';
        }
        break;

      case 'ASK_TAMBAH_LAGI':
        if (text.toLowerCase() === 'ya') {
          state.step = 'ASK_JENIS';
          state.data = {};
          sendMessage('Silakan pilih Jenis Transaksi:\n1. Pemasukan\n2. Pengeluaran\n\n*(Balas dengan angka 1 atau 2)*');
        } else {
          state.step = 'IDLE';
          let menuMsg = 'Oke, kembali ke menu utama.\n\n';
          if (state.userRole === 1 || state.userRole === 2) {
            menuMsg += 'Ketik *!tambah* untuk mencatat transaksi baru.\n';
            menuMsg += 'Ketik *!upload* untuk input data banyak via Excel.\n';
          } else if (state.userRole === 3) {
            menuMsg += 'Ketik *!laporan* untuk mengunduh laporan keuangan.\n';
          }
          menuMsg += 'Ketik *!logout* untuk keluar.';
          sendMessage(menuMsg);
        }
        break;

      case 'ASK_UPLOAD_EXCEL':
        if (text.toLowerCase() === '!template') {
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

            sheet.addRow({
              tanggal: '2023-10-01',
              uraian: 'Contoh Transaksi WA',
              jenis: 'debit',
              id_kategori: 1,
              nominal: 150000,
              catatan: 'Opsional'
            });

            const tmpPath = path.join('/tmp', `Template_Upload_${Date.now()}.xlsx`);
            await workbook.xlsx.writeFile(tmpPath);

            await sock.sendMessage(remoteJid, {
              document: fs.readFileSync(tmpPath),
              mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              fileName: 'Template_Upload.xlsx'
            });
            fs.unlinkSync(tmpPath);
          } catch (e) {
            console.error(e);
            sendMessage('Gagal membuat template.');
          }
          return;
        }

        const docMsg = msg.message.documentMessage || msg.message.documentWithCaptionMessage?.message?.documentMessage;
        if (!docMsg) {
          return sendMessage('Harap kirimkan file dokumen Excel (.xlsx), atau ketik *!batal* untuk membatalkan.');
        }

        try {
          sendMessage('⏳ Sedang memproses file Excel dari WA...');

          const buffer = await downloadMediaMessage(
            msg,
            'buffer',
            {},
            {
              logger: pino({ level: 'silent' }),
              reuploadRequest: sock.updateMediaMessage
            }
          );

          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          const sheet = workbook.getWorksheet(1);

          let insertedCount = 0;
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

          state.step = 'IDLE';
          let menuMsg = `✅ Berhasil memasukkan ${insertedCount} data transaksi dari Excel WA!\n\n`;
          if (state.userRole === 1 || state.userRole === 2) {
            menuMsg += 'Ketik *!tambah* untuk mencatat transaksi manual baru.\n';
          }
          menuMsg += 'Ketik *!logout* untuk keluar.';
          sendMessage(menuMsg);

        } catch (err) {
          console.error(err);
          sendMessage('Terjadi kesalahan saat membaca file Excel. Pastikan formatnya .xlsx');
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
