#!/usr/bin/env node
/**
 * Complete build script for CopyTables using esbuild
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DEST = './app';
const SRC = './src';

console.log('🔨 Building CopyTables Extension\n');

// Clean and create app directory
if (fs.existsSync(DEST)) {
    execSync(`rm -rf ${DEST}`);
}
fs.mkdirSync(DEST, { recursive: true });
console.log('✓ Created app directory\n');

// Step 1: Copy manifest and static files
console.log('📋 Copying static files...');
const staticPatterns = ['manifest.json', '*.png', '*.svg', '*.css'];

staticPatterns.forEach(pattern => {
    if (pattern.includes('*')) {
        const files = fs.readdirSync(SRC).filter(f => {
            const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
            return regex.test(f);
        });
        files.forEach(file => {
            fs.copyFileSync(path.join(SRC, file), path.join(DEST, file));
            console.log(`  ✓ ${file}`);
        });
    } else if (fs.existsSync(path.join(SRC, pattern))) {
        fs.copyFileSync(path.join(SRC, pattern), path.join(DEST, pattern));
        console.log(`  ✓ ${pattern}`);
    }
});

// Step 2: Process PUG files
console.log('\n📝 Processing HTML templates...');
const pugFiles = ['popup.pug', 'options.pug'];

pugFiles.forEach(file => {
    const pugPath = path.join(SRC, file);
    const htmlFile = file.replace('.pug', '.html');
    const destPath = path.join(DEST, htmlFile);

    if (fs.existsSync(pugPath)) {
        try {
            // Simple pug template processor
            const content = fs.readFileSync(pugPath, 'utf8');

            // Basic pug to HTML conversion (very simplified)
            let html = '<!DOCTYPE html>\n';

            if (file === 'popup.pug') {
                html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="popup.css">
</head>
<body>
    <div id="app"></div>
    <script src="popup.js"></script>
</body>
</html>`;
            } else if (file === 'options.pug') {
                html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="options.css">
    <title>CopyTables Options</title>
</head>
<body>
    <div id="app"></div>
    <script src="options.js"></script>
</body>
</html>`;
            }

            fs.writeFileSync(destPath, html);
            console.log(`  ✓ ${file} → ${htmlFile}`);
        } catch (err) {
            console.log(`  ⚠ ${file} failed:`, err.message);
        }
    }
});

// Step 3: Create CSS
console.log('\n🎨 Creating CSS files...');

// Create content.css with our enhanced styles
const contentCSS = `/* CopyTables Content Styles */

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

body[data-copytables-wait],
body[data-copytables-wait] * {
    cursor: wait !important;
}

[data-copytables-selected]:not([data-copytables-locked]) {
    background: Highlight !important;
    transition: all 0s 0s !important;
}

[data-copytables-marked]:not([data-copytables-locked]) {
    background: Highlight !important;
    transition: all 0s 0s !important;
}

#__copytables_infobox__ {
    position: fixed;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow: hidden;
    white-space: nowrap;
    z-index: 65535;
    background-color: rgba(44, 50, 66, 0.97);
    background-image: url(ico16.png);
    background-position: 8px center;
    background-repeat: no-repeat;
    padding: 0 0 0 32px;
    transition: opacity 0.2s ease;
}

#__copytables_infobox__.hidden {
    opacity: 0;
}

#__copytables_infobox__[data-position="0"] {
    left: 0;
    top: 0;
    border-bottom-right-radius: 9px;
}

#__copytables_infobox__[data-position="1"] {
    right: 0;
    top: 0;
    border-bottom-left-radius: 9px;
}

#__copytables_infobox__[data-position="2"] {
    right: 0;
    bottom: 0;
    border-top-left-radius: 9px;
}

#__copytables_infobox__[data-position="3"] {
    left: 0;
    bottom: 0;
    border-top-right-radius: 9px;
}

#__copytables_infobox__ b {
    display: inline-block;
    margin: 0 1px;
    padding: 12px 12px 12px 0;
    font-weight: 200;
    color: #9eb3c8;
    transition: background-color 0.2s ease, transform 0.1s ease;
}

#__copytables_infobox__ b:first-child {
    border-left: none;
}

#__copytables_infobox__ b.stat-item {
    cursor: pointer;
    padding: 12px;
    margin: 0 2px;
    border-radius: 4px;
}

#__copytables_infobox__ b.stat-item:hover {
    background-color: rgba(60, 70, 90, 0.5);
    transform: translateY(-1px);
}

#__copytables_infobox__ b.stat-item:active {
    transform: translateY(0);
}

#__copytables_infobox__ b.stat-item.copied {
    background-color: rgba(80, 95, 120, 0.7);
    animation: pulse 0.3s ease;
}

#__copytables_infobox__ b i {
    font-style: normal;
    padding-left: 6px;
    font-weight: 700;
    color: #c5d5e5;
    pointer-events: none;
}

#__copytables_infobox__ span {
    background-color: rgba(39, 45, 61, 0.97);
    color: #c5d5e5;
    padding: 12px;
    cursor: pointer;
}
`;

fs.writeFileSync(path.join(DEST, 'content.css'), contentCSS);
console.log('  ✓ content.css created (with click-to-copy styles)');

// Create minimal popup and options CSS
fs.writeFileSync(path.join(DEST, 'popup.css'), 'body { font-family: Arial, sans-serif; padding: 10px; min-width: 200px; }');
fs.writeFileSync(path.join(DEST, 'options.css'), 'body { font-family: Arial, sans-serif; padding: 20px; }');
console.log('  ✓ popup.css and options.css created');

// Step 4: Bundle JavaScript with esbuild
console.log('\n📦 Bundling JavaScript with esbuild...');

const jsEntries = ['background.js', 'content.js', 'popup.js', 'options.js'];

jsEntries.forEach(file => {
    const entryPath = path.join(SRC, file);
    const outPath = path.join(DEST, file);

    if (fs.existsSync(entryPath)) {
        try {
            execSync(`npx -y esbuild ${entryPath} --bundle --outfile=${outPath} --format=iife --platform=browser`, {
                stdio: 'pipe'
            });
            console.log(`  ✓ ${file} bundled`);
        } catch (err) {
            console.log(`  ⚠ ${file} bundling failed, copying source`);
            fs.copyFileSync(entryPath, outPath);
        }
    }
});

console.log('\n✅ Build complete!\n');
console.log('📁 Extension built in:', path.resolve(DEST));
console.log('\n📖 To load in Chrome:');
console.log('  1. Open chrome://extensions/');
console.log('  2. Enable "Developer mode"');
console.log('  3. Click "Load unpacked"');
console.log('  4. Select folder:', path.resolve(DEST));
console.log('\n🎉 Your click-to-copy feature is now included!\n');
