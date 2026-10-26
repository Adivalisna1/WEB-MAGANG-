const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname);

function toSafePath(baseDir, targetRel) {
  const safeBase = path.resolve(baseDir);
  const target = path.resolve(safeBase, String(targetRel).replace(/\0/g, ''));
  return target;
}

function checkImports(dir) {
  const safeDir = path.resolve(dir);
  const files = fs.readdirSync(safeDir);
  for (const file of files) {
    const fullPath = toSafePath(safeDir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      checkImports(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Match import ... from '...' or import '...'
        const match = line.match(/from\s+['"]([^'"]+)['"]/);
        if (match) {
          const importPath = match[1];
          if (importPath.startsWith('@/')) {
            // resolve @/ to src/
            const resolvedPath = toSafePath(path.join(ROOT_DIR, 'src'), importPath.slice(2));
            // check if exists with exact case
            checkExactCase(resolvedPath, fullPath, i + 1, importPath);
          } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
            const resolvedPath = toSafePath(path.dirname(fullPath), importPath);
            checkExactCase(resolvedPath, fullPath, i + 1, importPath);
          }
        }
      }
    }
  }
}

function checkExactCase(targetPath, sourceFile, lineNum, originalImport) {
  try {
    // We check if it exists first (case-insensitive on Windows)
    // If we add .ts, .tsx, .js, .css
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.css'];
    let foundExt = null;
    let exists = false;
    for (const ext of extensions) {
      if (fs.existsSync(targetPath + ext)) {
        exists = true;
        foundExt = ext;
        break;
      }
    }
    
    if (exists) {
      const realPath = targetPath + foundExt;
      const basename = path.basename(realPath);
      const dirname = path.dirname(realPath);
      const files = fs.readdirSync(dirname);
      if (!files.includes(basename)) {
        console.log(`CASE MISMATCH in ${sourceFile}:${lineNum}`);
        console.log(`Import: '${originalImport}'`);
        console.log(`Expected basename: ${basename} but actual might be different casing`);
      }
    }
  } catch (err) {
    // ignore
  }
}

checkImports(path.join(__dirname, 'src'));
console.log('Done checking imports.');
