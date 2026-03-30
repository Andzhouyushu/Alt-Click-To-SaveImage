# Alt-Click图片保存器
这是一个EDGE浏览器插件

#🖱️ Alt+Click 图片保存器（快速存图工具）

按住 **Alt** 键并点击网页中的图片，即可快速保存到指定目录，同时显示精美的缩略图提醒。

![版本](https://img.shields.io/badge/版本-1.0.0-blue)
![许可证](https://img.shields.io/badge/许可证-MIT-green)
![浏览器](https://img.shields.io/badge/浏览器-Edge%2FChrome-orange)

---

## ✨ 功能特点

- 🚀 **快速保存** - Alt + 单击即可保存图片，无需右键菜单
- 📁 **自定义目录** - 支持设置保存子文件夹名称
- 🖼️ **缩略图提醒** - 保存成功后显示动态缩略图提示
- 🌐 **广泛兼容** - 支持普通图片、懒加载图片、CSS 背景图、Base64 图片
- 🛡️ **跨域支持** - 自动处理跨域图片下载
- ⚡ **轻量高效** - 使用 Manifest V3，性能优异

---

## 📦 安装方法

### 方式一：开发者模式加载（推荐）

1. 下载本扩展源码并解压到本地文件夹
2. 打开 Edge/Chrome 浏览器，访问 `edge://extensions/` 或 `chrome://extensions/`
3. 开启右上角**"开发人员模式"**
4. 点击**"加载已解压的扩展"**
5. 选择解压后的文件夹即可

### 方式二：打包安装（Edge 应用商店）

&gt; 正在提交 Edge 应用商店审核，敬请期待...

---

## 🎯 使用方法

| 操作 | 说明 |
|------|------|
| `Alt` + `单击图片` | 保存图片到指定目录 |
| `Alt` 按住不放 | 鼠标变为十字准星，图片显示紫色边框提示 |
| 点击扩展图标 | 设置保存目录名称 |

### 默认保存位置

---Downloade/AltImages

## ⚙️ 配置说明

点击浏览器工具栏的扩展图标，可以修改：

- **保存目录名称** - 默认为 `AltImages`，图片将保存在下载文件夹下的此子目录中

---

## 🛠️ 技术架构
**数据流向：**  
`content.js` → `background.js` → `offscreen.html` → `background.js` → 下载完成

**各模块职责：**

| 文件 | 职责 |
|------|------|
| **content.js** | 监听 Alt+点击，显示十字光标和紫色边框 |
| **background.js** | 协调下载流程，调用 downloads API |
| **offscreen.html** | 获取跨域图片，转为 Base64 |

### 核心技术点

- **Manifest V3** - 最新的浏览器扩展标准
- **Service Worker** - 后台处理下载任务
- **Offscreen API** - 处理跨域图片获取
- **Fetch API** - 获取图片数据
- **FileReader** - 图片转 Base64

---

## 📂 文件结构
save-image-extension/

├── manifest.json          # 扩展配置文件

├── background.js          # 后台 Service Worker

├── content.js             # 内容脚本（页面注入）

├── offscreen.html         # 离屏文档 HTML

├── offscreen.js           # 离屏文档脚本

├── popup.html             # 弹出窗口界面

├── popup.js               # 弹出窗口逻辑

├── thumbnail.html         # 缩略图提示窗口（已删除）

├── thumbnail.js           # 缩略图逻辑（已删除）

├── styles/

│   └── content.css        # 页面注入样式

├── icons/                 # 图标文件夹

│   ├── icon16.png

│   ├── icon32.png

│   ├── icon48.png

│   └── icon128.png

└── README.md              # 本文件


---

## 🐛 常见问题

### Q: 点击后没有反应？
**A:** 请刷新网页后重试。扩展更新后，已打开的页面需要刷新才能加载最新的内容脚本。

### Q: 找不到保存的图片？
**A:** 
1. 按 `Ctrl+J` 打开浏览器下载管理器查看
2. 检查 Edge/Chrome 的默认下载路径设置
3. 确认设置的子文件夹名称是否正确

### Q: 某些图片无法保存？
**A:** 本扩展支持绝大多数图片格式，包括：
- 普通图片：`.jpg` `.png` `.gif` `.webp` 等
- 懒加载图片（data-src）
- CSS 背景图片
- Base64 Data URL 图片

如果仍有问题，请检查浏览器控制台错误信息。

### Q: 如何修改快捷键？
**A:** 目前固定为 `Alt` 键。如需修改，请编辑 `content.js` 中的键盘事件监听代码。

### Q: 要完全去掉浏览器下载提示的话，需要用户在 Edge 设置中关闭：
设置 → 下载 → 关闭"下载开始时显示下载菜单"

---

## 🔄 更新日志

### v1.0.0 (2026-03-27)
- ✨ 初始版本发布
- 🎉 支持 Alt+Click 快速保存图片
- ⚙️ 支持自定义保存目录

---
- 🖼️ 添加缩略图动态提醒（由于安全限制，暂时无法实现）

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 许可证

免费使用，欢迎分享
powered by kimi
