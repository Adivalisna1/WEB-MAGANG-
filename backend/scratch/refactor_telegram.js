const fs = require('fs');

let code = fs.readFileSync('c:/Users/adiva/OneDrive/Dokumen/web magang munculin data lokal/backend/src/bots/bot_telegram/index.js', 'utf8');

// 1. Menus
code = code.replace(
  /keyboardMenu\.push\(\[\{ text: '➕ Pencatatan Akuntansi' \}\]\);\s*keyboardMenu\.push\(\[\{ text: '📂 Upload Excel' \}, \{ text: '📊 Laporan' \}\]\);/g,
  `keyboardMenu.push([{ text: '➕ Pencatatan' }, { text: '➕ Rekening Koran' }]);\n            keyboardMenu.push([{ text: '📂 Upload Bukti' }, { text: '📊 Laporan' }]);`
);

code = code.replace(
  /keyboardMenu\.push\(\[\{ text: '➕ Pencatatan Akuntansi' \}, \{ text: '📂 Upload Excel' \}\]\);\s*keyboardMenu\.push\(\[\{ text: '📊 Laporan' \}\]\);/g,
  `keyboardMenu.push([{ text: '➕ Pencatatan' }, { text: '➕ Rekening Koran' }]);\n            keyboardMenu.push([{ text: '📂 Upload Bukti' }, { text: '📊 Laporan' }]);`
);

code = code.replace(
  /keyboardMenu\.push\(\[\{ text: '➕ Pencatatan Akuntansi' \}, \{ text: '📂 Upload Excel' \}\]\);/g,
  `keyboardMenu.push([{ text: '➕ Pencatatan' }, { text: '➕ Rekening Koran' }]);\n            keyboardMenu.push([{ text: '📂 Upload Bukti' }]);`
);

// 2. Commands
code = code.replace(/text === '➕ Pencatatan Akuntansi'/g, "text === '➕ Pencatatan'");

// Remove Upload Excel if block
const uploadExcelRegex = /if \(text === '📂 Upload Excel'\) \{[\s\S]*?return;\s*\}/;
const uploadBuktiCode = `if (text === '📂 Upload Bukti') {
      if (!state.userId) {
        bot.sendMessage(chatId, 'Anda harus Login terlebih dahulu!');
        return;
      }
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
        bot.sendMessage(chatId, msgStr);
      } catch (e) {
        bot.sendMessage(chatId, 'Gagal load kategori dokumen.');
      }
      return;
    }`;
code = code.replace(uploadExcelRegex, uploadBuktiCode);


// 4. Replace ASK_UPLOAD_EXCEL switch case with Upload Dokumen logic
const uploadExcelCaseRegex = /case 'ASK_UPLOAD_EXCEL':[\s\S]*?break;\s*(?=default:)/;
const uploadDokumenCases = `case 'ASK_DOK_KATEGORI': {
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
      `;
code = code.replace(uploadExcelCaseRegex, uploadDokumenCases);

code = code.replace(
  /const \[kategoris\] = await pool\.query\("SELECT id, nama_kategori FROM kategori_akuntansi"\);/g,
  'const [kategoris] = await pool.query("SELECT id, nama_kategori FROM kategori_akuntansi WHERE LOWER(nama_kategori) NOT LIKE \'%rekening koran%\'");'
);

fs.writeFileSync('c:/Users/adiva/OneDrive/Dokumen/web magang munculin data lokal/backend/src/bots/bot_telegram/index.js', code);
console.log('Telegram refactored successfully.');
