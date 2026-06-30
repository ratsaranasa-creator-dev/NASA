const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cssnano = require('cssnano');

async function testMinify() {
    const cssDir = path.join(__dirname, 'build', 'static', 'css');
    const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
    
    for (const file of files) {
        const fullPath = path.join(cssDir, file);
        const cssContent = fs.readFileSync(fullPath, 'utf8');
        console.log(`Testing ${file}...`);
        
        try {
            const result = await postcss([cssnano({ preset: 'default' })]).process(cssContent, { from: fullPath, to: fullPath + '.min.css' });
            console.log(`Success minifying ${file}`);
        } catch (error) {
            console.error(`Error minifying ${file}:`);
            console.error(error);
            
            // Let's print the lines around the error
            if (error.line) {
                const lines = cssContent.split('\n');
                const start = Math.max(0, error.line - 5);
                const end = Math.min(lines.length - 1, error.line + 5);
                console.log('\n--- Context ---');
                for (let i = start; i <= end; i++) {
                    console.log(`${i + 1}: ${lines[i]}`);
                }
            }
        }
    }
}

testMinify();
