const fs = require('fs');
const path = require('path');

function findUnclosedComments(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findUnclosedComments(fullPath);
        } else if (fullPath.endsWith('.css')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            let inComment = false;
            let commentStartLine = 0;
            const lines = content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                let pos = 0;
                while (pos < line.length) {
                    if (!inComment) {
                        const start = line.indexOf('/*', pos);
                        if (start !== -1) {
                            inComment = true;
                            commentStartLine = i + 1;
                            pos = start + 2;
                        } else {
                            break;
                        }
                    } else {
                        const end = line.indexOf('*/', pos);
                        if (end !== -1) {
                            inComment = false;
                            pos = end + 2;
                        } else {
                            break;
                        }
                    }
                }
            }
            if (inComment) {
                console.log(`Unclosed comment in ${fullPath} starting at line ${commentStartLine}`);
            }
        }
    }
}

findUnclosedComments('a:\\site-web-de-dembéni\\frontend\\src');
findUnclosedComments('a:\\site-web-de-dembéni\\frontend\\public');
