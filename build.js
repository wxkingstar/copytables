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

// Step 2: Compile PUG files using npx pug-cli
console.log('\n📝 Compiling PUG templates...');

const pugFiles = ['options.pug', 'popup.pug'];

pugFiles.forEach(file => {
    const srcPath = path.join(SRC, file);
    if (fs.existsSync(srcPath)) {
        try {
            // Use npx to compile pug without installing globally
            execSync(`npx -y -p pug-cli pug ${srcPath} --out ${DEST}`, {
                stdio: 'pipe'
            });
            console.log(`  ✓ ${file} → ${file.replace('.pug', '.html')}`);
        } catch (err) {
            console.log(`  ⚠ ${file} compilation failed`);
            console.log(`  💡 Please ensure you have internet connection for npx`);
        }
    }
});

// Step 3: Create CSS
console.log('\n🎨 Creating CSS files...');

// Create content.css with enhanced modern styles
const contentCSS = `/* CopyTables Content Styles - Enhanced UI */

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    font-size: 13px;
    overflow: hidden;
    white-space: nowrap;
    z-index: 65535;
    /* 使用 flexbox 垂直居中所有子元素 */
    display: flex;
    align-items: center;
    /* 深灰色背景，白色文字 - 高对比度设计 */
    background: linear-gradient(135deg, rgba(35, 40, 45, 0.97), rgba(45, 52, 58, 0.97));
    backdrop-filter: blur(12px) saturate(140%);
    -webkit-backdrop-filter: blur(12px) saturate(140%);
    /* 强阴影确保在任何背景上都清晰 */
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6), 0 6px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.2);
    /* 清晰的边框 */
    border: 2px solid rgba(255, 255, 255, 0.15);
    background-image: url(ico16.png);
    background-position: 10px center;
    background-repeat: no-repeat;
    padding: 0 0 0 36px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: slideIn 0.3s ease-out;
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
    padding: 10px 14px;
    font-weight: 400;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.95);  /* 白色文字 */
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    letter-spacing: 0.3px;
}

#__copytables_infobox__ b:first-child {
    border-left: none;
    padding-left: 4px;
}

#__copytables_infobox__ b.stat-item {
    cursor: pointer;
    padding: 8px 12px;
    margin: 0 3px;
    border-radius: 6px;
    /* 深灰色卡片背景，白色文字 */
    background: rgba(55, 65, 75, 0.9);
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    position: relative;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.95);  /* 白色文字 */
}

#__copytables_infobox__ b.stat-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
}

#__copytables_infobox__ b.stat-item:hover {
    background: rgba(70, 80, 90, 0.95);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 4px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 1);
}

#__copytables_infobox__ b.stat-item:hover::before {
    left: 100%;
}

#__copytables_infobox__ b.stat-item:active {
    transform: translateY(0) scale(0.98);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

#__copytables_infobox__ b.stat-item.copied {
    background: linear-gradient(135deg, rgba(46, 213, 115, 0.35), rgba(0, 184, 148, 0.35));
    border-color: rgba(46, 213, 115, 0.6);
    animation: pulse 0.4s ease;
    color: rgba(255, 255, 255, 1);
    box-shadow: 0 0 24px rgba(46, 213, 115, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3);
}

#__copytables_infobox__ b i {
    font-style: normal;
    padding-left: 6px;
    font-weight: 700;
    color: rgba(255, 255, 255, 1);
    pointer-events: none;
    font-size: 13px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

#__copytables_infobox__ span {
    background: rgba(231, 76, 60, 0.15);
    color: rgba(255, 255, 255, 0.9);
    padding: 10px 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
}

#__copytables_infobox__ span:hover {
    background: rgba(231, 76, 60, 0.3);
    color: rgba(255, 255, 255, 1);
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
