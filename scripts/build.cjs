const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const destination = path.join(root, 'dist');
fs.rmSync(destination, {recursive: true, force: true});
fs.mkdirSync(destination, {recursive: true});
for (const entry of fs.readdirSync(root, {withFileTypes: true})) {
  const source = path.join(root, entry.name);
  const target = path.join(destination, entry.name);
  if (entry.isDirectory() && ['assets', 'vendor'].includes(entry.name)) {
    fs.cpSync(source, target, {recursive: true, filter: file => !file.endsWith('.br')});
  } else if (entry.isFile() && (/\.(js|html|svg)$/.test(entry.name) || ['CREDITS.md', 'THREE-LICENSE.txt', '_headers'].includes(entry.name))) {
    fs.copyFileSync(source, target);
  }
}
let count = 0, bytes = 0;
function validate(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) validate(file);
    else {
      const size = fs.statSync(file).size;
      if (size > 25 * 1024 * 1024) throw new Error(`Pages file exceeds 25 MiB: ${file}`);
      count++; bytes += size;
    }
  }
}
validate(destination);
console.log(`Built ${count} static files (${(bytes / 1024 / 1024).toFixed(1)} MiB) in dist/`);
