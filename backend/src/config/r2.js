const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

async function uploadToR2(buffer, fileName, mimeType, tahun) {
  const key = `${tahun}/${fileName}`;
  const filePath = path.join(UPLOAD_DIR, key);
  
  // Ensure directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
  
  return key;
}

async function downloadFromR2(key) {
  const filePath = path.join(UPLOAD_DIR, key);
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found locally');
  }
  return fs.readFileSync(filePath);
}

async function deleteFromR2(key) {
  const filePath = path.join(UPLOAD_DIR, key);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.warn('[Local] Gagal hapus file:', e.message);
  }
}

module.exports = { uploadToR2, downloadFromR2, deleteFromR2 };
