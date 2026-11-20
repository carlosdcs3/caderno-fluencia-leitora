// Next.js tracing exclusions can leave Windows paths in local builds.
// Remove only references to operational data and secret files, never the files.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const dataRoot = path.join(root, 'data');
let checked = 0, removed = 0;
function forbidden(file) {
  return file === dataRoot || file.startsWith(dataRoot + path.sep) ||
    /\.(sqlite(?:-wal|-shm)?|p12|pfx|pem|key)$/i.test(file) ||
    /^\.env(?:\.|$)/i.test(path.basename(file));
}
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(target); continue; }
    if (!entry.name.endsWith('.nft.json')) continue;
    checked++;
    const trace = JSON.parse(fs.readFileSync(target, 'utf8'));
    const files = trace.files.filter(file => !forbidden(path.resolve(path.dirname(target), file)));
    if (files.length !== trace.files.length) {
      removed += trace.files.length - files.length;
      fs.writeFileSync(target, JSON.stringify({...trace, files}));
    }
    const saved = JSON.parse(fs.readFileSync(target, 'utf8'));
    if (saved.files.some(file => forbidden(path.resolve(path.dirname(target), file)))) {
      throw new Error('Operational data remains in build trace');
    }
  }
}
walk(path.join(root, '.next'));
if (!checked) throw new Error('No build traces found');
console.log(JSON.stringify({tracesChecked: checked,operationalReferencesRemoved: removed}));
