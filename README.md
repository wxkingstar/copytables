copytables
==========

![Hey](https://raw.githubusercontent.com/gebrkn/copytables/master/src/ico128.png)

Chrome extension to select and copy table cells.

[Install from Chrome Web Store](https://chrome.google.com/webstore/detail/copytables/ekdpkppgmlalfkphpibadldikjimijon)

## Features

* Hold <kbd>Alt</kbd> and drag to select cells.
* Hold <kbd>Alt-Ctrl</kbd> and drag to select columns.
* Copy selection (or the whole table) as seen on the screen (for Word)
* Copy as CSV or tab-delimited text (for Excel).
* Copy as HTML (for your website).
* **NEW:** Click statistics numbers to copy them instantly to clipboard!

## What's New

### New in version 0.6 🎉

**Click-to-Copy Statistics**
* **One-click number copying**: Click any statistic (Count, Sum, Average, Min, Max) to instantly copy the number to your clipboard
* **Visual feedback**: Green glow animation confirms successful copy
* **Modern UI**: High-contrast dark gray design with white text, clearly visible on any background
* **Glassmorphism effects**: Beautiful frosted glass appearance with smooth animations
* **Vertical centering**: All statistics cards are perfectly aligned
* **Smart clipboard handling**: Uses modern Clipboard API with automatic fallback

**Technical Improvements**
* Upgraded to Manifest V3 for Chrome compatibility
* Added `clipboardWrite` permission for reliable clipboard access
* Enhanced event handling with capture phase interception
* Comprehensive error handling and debugging
* SASS compilation for consistent styling across all pages

**UI Enhancements**
* Restored full styling for options page
* Modern gradient backgrounds with backdrop filters
* Smooth hover animations and transitions
* Pulse animation on successful copy
* Optimized for both light and dark backgrounds

### New in version 0.5

* Configurable hotkeys for cell, column, row and table selection.
* Capture mode: select with simple click and drag.
* Full support of framed documents.
* Popup information about selected cells.
* Swap (transpose) copy.

### New in version 0.4

* New popup menu.
* Table search function.
* Configurable hotkey (Ctrl/Alt).

### New in version 0.3

* Styled HTML export.

### New in version 0.2

* CSV export.
* Better HTML export.
* Better support for weird table backgrounds (thanks [apptaro](https://github.com/apptaro)).
* Overall speed improvement.

## Usage / 使用方法

### Basic Selection / 基本选择
1. Hold <kbd>Alt</kbd> and drag your mouse over table cells to select them
2. Statistics (Count, Sum, Average, Min, Max) will appear in a corner
3. Right-click to copy the selection in various formats

### Click-to-Copy Statistics / 点击复制统计数据
1. Select table cells as usual (Hold <kbd>Alt</kbd> + drag)
2. **Click on any number** in the statistics box (Count, Sum, Average, Min, Max)
3. The number is instantly copied to your clipboard
4. You'll see a **green glow animation** confirming the copy
5. Paste anywhere with <kbd>Ctrl+V</kbd> (Windows/Linux) or <kbd>Cmd+V</kbd> (Mac)

### Copy Formats / 复制格式
* **Rich Text**: For Microsoft Word, preserving formatting
* **HTML**: For web pages with full styling
* **CSV**: For Excel and data analysis
* **Tab-delimited**: For spreadsheets
* **Plain Text**: Simple text format

## Development / 开发

### Build Requirements / 构建要求
* Node.js (for npx)
* Internet connection (for downloading packages via npx)

### Building / 构建
```bash
# Clone the repository
git clone <repository-url>
cd copytables

# Build the extension
node build.js

# The built extension will be in ./app directory
```

### Loading in Chrome / 在 Chrome 中加载
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `app` folder

### Project Structure / 项目结构
```
copytables/
├── src/                    # Source files
│   ├── manifest.json      # Extension manifest
│   ├── content/           # Content scripts
│   ├── background/        # Background service worker
│   ├── options.sass       # Options page styles
│   └── *.pug             # HTML templates
├── build.js               # Build script
└── app/                   # Built extension (generated)
```

## Technical Details / 技术细节

### Key Technologies / 关键技术
* **Manifest V3**: Latest Chrome extension standard
* **Clipboard API**: Modern clipboard access with execCommand fallback
* **Event Capture Phase**: Prevents global handler interference
* **SASS**: CSS preprocessing for maintainable styles
* **PUG**: HTML templating
* **esbuild**: Fast JavaScript bundling

### Architecture / 架构
* Content scripts inject into web pages to detect and select table cells
* Background service worker handles message passing
* Popup provides quick access to common actions
* Options page for customization
* Statistics infobox with click-to-copy functionality

## License

Original CopyTables extension by [gebrkn](https://github.com/gebrkn)

## Changelog / 更新日志

See version history above for detailed changes in each release.

---

**Version 0.6.0** - Enhanced statistics with click-to-copy functionality
**Version 0.5.x** - Manifest V3 upgrade, configurable hotkeys
**Version 0.4.x** - Popup menu improvements, table search
**Version 0.3.x** - Styled HTML export
**Version 0.2.x** - CSV export, better HTML export

---

Made with ❤️ by the CopyTables community
