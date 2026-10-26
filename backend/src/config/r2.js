const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

/**
 * Validasi keamanan path untuk mencegah Path / Directory Traversal.
 * Memastikan target file tidak keluar dari UPLOAD_DIR.
 */
function getSafePath(relativePath) {
  const safeBaseDir = path.resolve(UPLOAD_DIR);
  // Hindari null-byte injection dan normalisasi path
  const sanitizedPath = String(relativePath).replace(/\0/g, '');
  const targetPath = path.resolve(safeBaseDir, sanitizedPath);

  if (!targetPath.startsWith(safeBaseDir + path.sep) && targetPath !== safeBaseDir) {
    throw new Error('Access denied: Path traversal detected');
  }

  return targetPath;
}

async function uploadToR2(buffer, fileName, mimeType, tahun) {
  // Sanitasi parameter nama file dan tahun
  const cleanTahun = String(tahun).replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanFileName = path.basename(fileName).replace(/\0/g, '');
  const key = `${cleanTahun}/${cleanFileName}`;
  const filePath = getSafePath(key);
  
  // Ensure directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
  
  return key;
}

async function downloadFromR2(key) {
  const filePath = getSafePath(key);
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found locally');
  }
  return fs.readFileSync(filePath);
}

async function deleteFromR2(key) {
  const filePath = getSafePath(key);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.warn('[Local] Gagal hapus file:', e.message);
  }
}

module.exports = { uploadToR2, downloadFromR2, deleteFromR2 };
