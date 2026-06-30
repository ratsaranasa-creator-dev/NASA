const fs = require('fs');
const path = require('path');

function findInvalidSlashes(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findInvalidSlashes(fullPath);
        } else if (fullPath.endsWith('.css')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            let inComment = false;
            lines.forEach((line, index) => {
                let stripped = line;
                // simplified check for /
                if (stripped.includes('/')) {
                    // remove http:// and https://
                    stripped = stripped.replace(/https?:\/\//g, '');
                    // remove /* ... */ on the same line
                    stripped = stripped.replace(/\/\*.*?\*\//g, '');
                    
                    // check if this line still has /
                    if (stripped.includes('/')) {
                        // check if it's just opening a comment /*
                        if (stripped.includes('/*')) {
                            inComment = true;
                            stripped = stripped.substring(0, stripped.indexOf('/*'));
                        }
                        // check if closing comment */
                        if (stripped.includes('*/')) {
                            inComment = false;
                            stripped = stripped.substring(stripped.indexOf('*/') + 2);
                        }
                        
                        if (stripped.includes('/')) {
                            // ignore grid-column: 1 / -1
                            if (!stripped.match(/grid-column:\s*\d+\s*\/\s*-\d+/)) {
                                console.log(`${fullPath}:${index + 1}: ${line.trim()}`);
                            }
                        }
                    }
                }
            });
        }
    }
}

findInvalidSlashes('a:\\site-web-de-dembéni\\frontend\\src');
