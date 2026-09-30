const fs = require('fs');
let code = fs.readFileSync('c:/Users/adiva/OneDrive/Dokumen/web magang munculin data lokal/backend/src/bots/bot_whatsapp/index.js', 'utf8');

// 1. Menu updates
code = code.replace(
  /\*!pencatatan\* - Untuk Pencatatan Akuntansi\\n\`?;\s*menuMsg \+= \`?\*!upload\* - Untuk Upload Transaksi via Excel/g,
  `*!pencatatan* - Untuk Pencatatan Akuntansi\\n\`;\n        menuMsg += \`*!rekeningkoran* - Untuk Tambah Rekening Koran\\n\`;\n        menuMsg += \`*!uploadbukti* - Untuk Upload Dokumen\\n\`; //`
);

// 2. Command replacements
code = code.replace(/text\.toLowerCase\(\) === '!upload'/g, "text.toLowerCase() === '!uploadbukti'");

// 3. Upload Dokumen logic for WhatsApp
const uploadExcelRegex = /if \(text\.toLowerCase\(\) === '!uploadbukti'\) \{[\s\S]*?return sendMessage\('Silakan kirimkan file Excel.*?template'\);\s*\}/;
const uploadBuktiCode = `if (text.toLowerCase() === '!uploadbukti') {
      if (!state.userId) return sendMessage('⚠️ Anda harus Login terlebih dahulu! Ketik *!login*.');
      if (state.userRole !== 1 && state.userRole !== 2) return sendMessage('⛔ Maaf, fitur ini hanya untuk Staff dan Pimpinan.');

      try {
        const [kats] = await pool.query("SELECT id, nama as nama_kategori FROM kategori_dokumen WHERE is_active = 1");
        let msgStr = 'Pilih Kategori Dokumen (Balas dengan angka):\\n';
        state.data = { doc_kategori_map: {} };
        kats.forEach((k, idx) => {
          const num = idx + 1;
          msgStr += \`\${num}. \${k.nama_kategori}\\n\`;
          state.data.doc_kategori_map[num.toString()] = { id: k.id, nama: k.nama_kategori };
        });
        state.step = 'ASK_DOK_KATEGORI';
        sendMessage(msgStr);
      } catch (e) {
        sendMessage('Gagal load kategori dokumen.');
      }
      return;
    }`;
code = code.replace(uploadExcelRegex, uploadBuktiCode);

// Add !rekeningkoran command
const pencatatanRegex = /if \(text\.toLowerCase\(\) === '!pencatatan' \|\| text\.toLowerCase\(\) === '!tambah'\) \{/;
const rekKoranCode = `if (text.toLowerCase() === '!rekeningkoran') {
      if (!state.userId) return sendMessage('⚠️ Anda harus Login terlebih dahulu! Ketik *!login*.');
      state.step = 'ASK_RK_SATKER';
      state.data = {};
      return sendMessage('Masukkan *Nomor Satker* (sebagai kata kunci):');
    }\n\n    if (text.toLowerCase() === '!pencatatan' || text.toLowerCase() === '!tambah') {`;
code = code.replace(pencatatanRegex, rekKoranCode);


// 4. Update ASK_UPLOAD_EXCEL case to ASK_DOK_KATEGORI
const uploadExcelCaseRegex = /case 'ASK_UPLOAD_EXCEL':[\s\S]*?break;\s*(?=default:)/;
const uploadDokumenCases = `case 'ASK_DOK_KATEGORI': {
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
          const tmpPath = path.join('/tmp', \`wa-dok-\${Date.now()}.tmp\`);
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
          let menuMsg = '✅ Berhasil mengunggah dokumen ke Dashboard!\\n\\nKetik *!menu* untuk opsi lain.';
          sendMessage(menuMsg);
        } catch (e) {
          console.error(e);
          sendMessage('❌ Gagal mengunggah dokumen.');
        }
        break;
      }
      
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
            else if (msg.message.documentMessage?.fileName) ext = path.extname(msg.message.documentMessage.fileName);
            
            const fileName = \`wa-rk-\${Date.now()}\${ext}\`;
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
        const saldoAkhir = parseInt(text.replace(/\\D/g, ''));
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
          
          await axios.post('http://localhost:' + (process.env.APP_PORT || 5000) + '/api/rekening-koran', form, {
            headers: { ...form.getHeaders(), Authorization: 'Bearer ' + token }
          });
          
          sendMessage('✅ *Rekening Koran berhasil disimpan!*\\nKetik *!menu* untuk opsi lain.');
        } catch (err) {
          console.error('Error save RK WA:', err);
          sendMessage('❌ Gagal menyimpan Rekening Koran.');
        }
        state.step = 'IDLE';
        break;
      `;
code = code.replace(uploadExcelCaseRegex, uploadDokumenCases);

// 5. Replace ASK_TAMBAH_LAGI menu
code = code.replace(
  /menuMsg \+= 'Ketik \*!pencatatan\* untuk mencatat transaksi baru\.\\n';\s*menuMsg \+= 'Ketik \*!upload\* untuk input data banyak via Excel\.\\n';/g,
  `menuMsg += 'Ketik *!pencatatan* untuk mencatat transaksi baru.\\n';\n            menuMsg += 'Ketik *!rekeningkoran* untuk Rekening Koran.\\n';\n            menuMsg += 'Ketik *!uploadbukti* untuk Upload Dokumen.\\n';`
);

// 6. Filter out Rekening Koran from Kategori list
code = code.replace(
  /const \[kategoris\] = await pool\.query\("SELECT id, nama_kategori FROM kategori_akuntansi"\);/g,
  'const [kategoris] = await pool.query("SELECT id, nama_kategori FROM kategori_akuntansi WHERE LOWER(nama_kategori) NOT LIKE \'%rekening koran%\'");'
);


fs.writeFileSync('c:/Users/adiva/OneDrive/Dokumen/web magang munculin data lokal/backend/src/bots/bot_whatsapp/index.js', code);
console.log('WhatsApp refactored successfully.');
