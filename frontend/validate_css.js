const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

async function validateCSS(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await validateCSS(fullPath);
        } else if (fullPath.endsWith('.css')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            try {
                postcss.parse(content, { from: fullPath });
            } catch (error) {
                console.error(`Error parsing ${fullPath}:`);
                console.error(error.message);
            }
        }
    }
}

validateCSS('a:\\site-web-de-dembéni\\frontend\\src').then(() => {
    return validateCSS('a:\\site-web-de-dembéni\\frontend\\public');
}).catch(console.error);
