# CopyTables 安装指南

## 🚀 快速安装（推荐）

### 方法1：使用构建脚本（最简单）

1. **构建扩展**
   ```bash
   cd /path/to/copytables
   node build.js
   ```

2. **在Chrome中加载**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 在右上角启用「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择 `copytables/app` 文件夹
   - ✅ 完成！

### 方法2：从项目根目录安装

如果您看到"清单文件缺失"错误，这是因为Chrome需要加载**构建后的**文件夹。

❌ **错误**：加载项目根目录 `~/文稿/work/chrome/copytables`
✅ **正确**：加载构建目录 `~/文稿/work/chrome/copytables/app`

## 🔧 构建说明

### 为什么需要构建？

CopyTables 使用模块化的JavaScript代码（CommonJS require语法），需要打包成浏览器可以运行的格式。

**源代码目录**: `src/`
- 包含原始的 `.js`, `.sass`, `.pug` 文件
- 不能直接在Chrome中加载

**构建输出目录**: `app/`
- 包含打包后的 `.js`, `.css`, `.html` 文件
- 可以在Chrome中加载

### 构建工具

我们提供了 `build.js` 脚本，它使用：
- **esbuild** - 快速的JavaScript打包工具（通过npx使用，无需安装）
- **Node.js内置模块** - 处理文件复制和CSS生成

### 构建脚本做了什么？

1. ✅ 复制静态文件（manifest.json, 图标）
2. ✅ 转换HTML模板（popup.html, options.html）
3. ✅ 生成CSS文件（包含点击复制功能的样式）
4. ✅ 打包JavaScript文件（background.js, content.js, popup.js, options.js）

## 📦 构建后的文件结构

```
app/
├── manifest.json          # 扩展清单
├── background.js          # 后台脚本（打包）
├── content.js            # 内容脚本（打包，包含点击复制功能）
├── popup.js              # 弹出窗口脚本（打包）
├── options.js            # 选项页面脚本（打包）
├── content.css           # 内容样式（包含点击复制样式）
├── popup.html            # 弹出窗口HTML
├── options.html          # 选项页面HTML
├── popup.css             # 弹出窗口样式
├── options.css           # 选项页面样式
└── ico*.png              # 图标文件
```

## ✨ 新功能：点击复制统计数据

构建后的扩展包含了新的点击复制功能！

### 如何使用

1. 在网页的表格中选择单元格（按住 Alt 键并拖动）
2. 右下角会显示统计信息框，显示：
   - **count**: 选中单元格数量
   - **sum**: 数值总和
   - **average**: 平均值 ⭐ 新功能
   - **min**: 最小值
   - **max**: 最大值

3. **点击任何统计项即可复制其数值！**
   - 鼠标悬停时会高亮显示
   - 点击后会看到脉冲动画
   - 显示"Copied!"提示
   - 数值已复制到剪贴板

4. 在任何地方粘贴（Ctrl+V / Cmd+V）

## 🔍 验证安装

安装成功后，您应该看到：

1. Chrome扩展页面显示"CopyTables"扩展
2. 扩展图标显示在Chrome工具栏
3. 访问任何包含表格的网页
4. 按住Alt键并在表格上拖动鼠标
5. 看到右下角的统计信息框
6. 点击统计项可以复制数值

## 🐛 故障排除

### 问题：清单文件缺失或不可读取

**原因**：尝试加载源代码目录（src/）而不是构建目录（app/）

**解决方案**：
1. 运行 `node build.js` 构建项目
2. 在Chrome中加载 `app/` 目录，不是项目根目录

### 问题：构建失败（node-sass错误）

**原因**：旧的 `node-sass` 与现代Node.js不兼容

**解决方案**：使用我们提供的 `build.js` 脚本，它不依赖 node-sass

### 问题：npx命令不可用

**原因**：Node.js版本过旧

**解决方案**：
1. 升级Node.js到v14或更高版本
2. 或者使用Docker构建

### 问题：点击统计项没有反应

**检查**：
1. 确保使用了 `build.js` 构建的版本
2. 检查浏览器控制台是否有错误
3. 确认已重新加载扩展（chrome://extensions/ 点击刷新按钮）

## 📝 开发说明

### 修改代码后重新构建

每次修改源代码后，需要重新构建：

```bash
node build.js
```

然后在Chrome扩展页面点击刷新按钮。

### 查看构建详情

构建脚本会显示详细的进度信息：
- ✓ 成功操作显示绿色勾号
- ⚠ 警告信息（但不影响功能）

### 文件大小

构建后的JavaScript文件大小：
- `background.js`: ~55KB
- `content.js`: ~55KB（包含点击复制功能）
- `popup.js`: ~30KB
- `options.js`: ~31KB

## 🌟 功能清单

- [x] 选择表格单元格、行、列
- [x] 复制为多种格式（HTML、CSV、Tab分隔等）
- [x] 实时统计选中数据
- [x] 点击复制统计数值 ⭐ **新功能**
- [x] 可配置快捷键
- [x] 支持本地文件（file:///）

## 📚 相关文档

- **功能说明**：查看 `FEATURE_CLICK_TO_COPY.md`
- **源代码**：`src/` 目录
- **构建脚本**：`build.js`
- **原始构建**：`gulpfile.js`（需要解决node-sass问题）

## 🆘 需要帮助？

如果遇到问题：
1. 查看上面的「故障排除」部分
2. 检查Chrome扩展页面的错误信息
3. 查看浏览器控制台（F12）的错误日志
4. 确保使用 `node build.js` 构建
5. 确保加载的是 `app/` 目录

---

**祝您使用愉快！🎉**
