const fs = require('fs');
const path = require('path');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fp = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fp) : fp;
  }).filter(fp => /\.(js|jsx)$/.test(fp));
}

const root = path.join(process.cwd(), 'frontend', 'src');
const prefix = "${process.env.REACT_APP_API_URL || 'http://localhost:5000'}";
const files = walk(root);
let changed = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, `\`${prefix}$1\``);
  content = content.replace(/"http:\/\/localhost:5000([^\"]*)"/g, `\`${prefix}$1\``);
  content = content.replace(/`([^`]*?)http:\/\/localhost:5000([^`]*?)`/gs, (_, before, after) => `\`${before}${prefix}${after}\``);
  content = content.replace(/http:\/\/localhost:5000\/api\/auth\/forgotpassword/g, `${prefix}/api/auth/forgot-password`);
  content = content.replace(/http:\/\/localhost:5000\/api\/auth\/resetpassword\//g, `${prefix}/api/auth/reset-password/`);
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
    console.log('updated:', file);
  }
}
console.log('modified files:', changed);
