const fs = require('fs');
const path = require('path');

const apiConfigPath = path.join(__dirname, 'frontend', 'src', 'apiConfig.js');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fp = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fp) : fp;
  }).filter(fp => /\.(js|jsx)$/.test(fp) && fp !== apiConfigPath);
}

const files = walk(path.join(__dirname, 'frontend', 'src'));
let changedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}` with `${API_URL}`
  content = content.replace(/\$\{process\.env\.REACT_APP_API_URL\s*\|\|\s*['"]http:\/\/localhost:5000['"]\}/g, '${API_URL}');
  
  // Replace 'http://localhost:5000/api/...' with `${API_URL}/api/...`
  content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${API_URL}$1`');
  content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`${API_URL}$1`');
  
  // Replace `http://localhost:5000...` with `${API_URL}...`
  // careful about existing template literals
  content = content.replace(/http:\/\/localhost:5000/g, '${API_URL}');
  
  // Clean up if it produced `${API_URL}${API_URL}` or similar mistakes
  // Not likely with above, but let's be careful.

  if (content !== originalContent) {
    // Determine relative path to apiConfig
    let relativePath = path.relative(path.dirname(file), apiConfigPath).replace(/\\/g, '/');
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    relativePath = relativePath.replace(/\.js$/, '');
    
    // Add import statement if not present
    if (!content.includes('import { API_URL }')) {
      const importStmt = `import { API_URL } from '${relativePath}';\n`;
      // Insert after the last import statement
      const importMatches = [...content.matchAll(/^import.*from.*;?$/gm)];
      if (importMatches.length > 0) {
        const lastMatch = importMatches[importMatches.length - 1];
        const insertIndex = lastMatch.index + lastMatch[0].length + 1;
        content = content.slice(0, insertIndex) + importStmt + content.slice(insertIndex);
      } else {
        content = importStmt + content;
      }
    }

    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated: ${file}`);
  }
}

console.log(`Updated ${changedFiles} files.`);
