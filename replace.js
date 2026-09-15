const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('frontend/src', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace '/satker' with '/staff' (case insensitive for Satker/satker if we want, but let's do exact match first)
    // Actually let's use regex for exact matches we care about
    content = content.replace(/\/satker/g, '/staff');
    content = content.replace(/\/Satker/g, '/staff');
    content = content.replace(/SatkerLayout/g, 'StaffLayout');
    content = content.replace(/SatkerAkuntansiPage/g, 'StaffAkuntansiPage');
    content = content.replace(/SatkerDokumenPage/g, 'StaffDokumenPage');
    content = content.replace(/SatkerProfilPage/g, 'StaffProfilPage');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});
