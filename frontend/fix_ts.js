const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname);

function getSafePath(relativePath) {
  const target = path.resolve(ROOT_DIR, String(relativePath).replace(/\0/g, ''));
  if (!target.startsWith(ROOT_DIR + path.sep) && target !== ROOT_DIR) {
    throw new Error('Path traversal detected');
  }
  return target;
}

function replaceInFile(filePath, search, replace) {
  const fullPath = getSafePath(filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(fullPath, content);
  console.log('Fixed', filePath);
}

// 1. login/page.tsx
replaceInFile(
  'src/app/login/page.tsx', 
  "else if (user.role === 'satker') router.replace('/staff/dokumen');", 
  ""
);

// 2. staff/layout.tsx (if it exists)
const staffLayoutPath = getSafePath('src/app/staff/layout.tsx');
if (fs.existsSync(staffLayoutPath)) {
  replaceInFile(
    'src/app/staff/layout.tsx',
    "requireRole('satker')",
    "requireRole('staff')"
  );
}

// 3. satker/layout.tsx (if it exists)
const satkerLayoutPath = getSafePath('src/app/satker/layout.tsx');
if (fs.existsSync(satkerLayoutPath)) {
  replaceInFile(
    'src/app/satker/layout.tsx',
    "requireRole('satker')",
    "requireRole('staff')"
  );
}

// 4. Object.keys(jsonData[0]) -> Object.keys(jsonData[0] as object)
['admin-it', 'staff', 'pimpinan', 'eselon-1'].forEach(role => {
  const file = `src/app/${role}/rekening-koran/page.tsx`;
  const safeFile = getSafePath(file);
  if (fs.existsSync(safeFile)) {
    replaceInFile(
      file,
      "setExcelHeaders(Object.keys(jsonData[0]));",
      "setExcelHeaders(Object.keys(jsonData[0] as object));"
    );
  }
});

// 5. initialRowState
const newInitialState = `const initialRowState = {
  nama_bank: '', nomor_rekening_bank: '', nama_rekening: '', nomor_pembukaan_rekening: '',
  tanggal_pembukaan_rekening: '', saldo_akhir_bulan: 0, saldo_rk: 0, saldo_rekening: 0,
  saldo_rpl_lpj: 0, keterangan: '', tahun: 2026, periode: '1'
};`;

['admin-it', 'staff'].forEach(role => {
  const file = `src/app/${role}/rekening-koran/page.tsx`;
  const safeFile = getSafePath(file);
  if (fs.existsSync(safeFile)) {
    let content = fs.readFileSync(safeFile, 'utf8');
    // We need to add tahun and periode to setEditRowData
    content = content.replace(
      /setEditRowData\(\{[\s\S]*?saldo_rpl_lpj: d\.saldo_rpl_lpj \|\| 0,\s*keterangan: d\.keterangan \|\| ''\s*\}\);/,
      `setEditRowData({
      nama_bank: d.nama_bank || '',
      nomor_rekening_bank: d.nomor_rekening_bank || '',
      nama_rekening: d.nama_rekening || '',
      nomor_pembukaan_rekening: d.nomor_pembukaan_rekening || '',
      tanggal_pembukaan_rekening: d.tanggal_pembukaan_rekening ? new Date(d.tanggal_pembukaan_rekening).toISOString().split('T')[0] : '',
      saldo_akhir_bulan: d.saldo_akhir_bulan || 0,
      saldo_rk: d.saldo_rk || 0,
      saldo_rekening: d.saldo_rekening || 0,
      saldo_rpl_lpj: d.saldo_rpl_lpj || 0,
      keterangan: d.keterangan || '',
      tahun: d.tahun || 2026,
      periode: d.periode || '1'
    });`
    );
    fs.writeFileSync(safeFile, content);
    console.log('Fixed initialRowState in', file);
  }
});

