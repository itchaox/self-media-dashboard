# 自媒体工具台（self-media-dashboard）

一个个人独用的工具导航台 —— 一个 HTML 首页，里面有几个按钮，点击跳转到不同的工具页面。

## 怎么打开

### 方式 1：直接双击（最简，无需任何服务）

直接双击 [index.html](index.html)，浏览器打开就能用。**无需安装任何依赖、无需启动服务**。

> 首次打开时会从 CDN 加载 Tailwind（用于样式），浏览器会自动缓存。后续离线也能用。

### 方式 2：开发模式（带热更新，编辑保存即自动刷新）

```bash
npm install   # 仅首次需要
npm start     # 默认端口 8765
```

然后浏览器访问 http://localhost:8765/index.html。之后在 VS Code / 任何编辑器里修改 HTML/CSS/JS 并保存，**已打开的页面会在 1-2 秒内自动刷新**，无需手动切换浏览器。

热更新细节：

- 修改 `*.html` → 只刷新打开了该 URL 的页面
- 修改 `*.css` / `*.js` → 刷新所有打开的页面（因为浏览器对 `<link>` `<script>` 有缓存语义）
- 端口被占用时：`PORT=8766 npm start`
- 热更新**只在 http://localhost / 127.0.0.1 下启用**；双击 `file://` 打开时自动跳过，控制台保持干净

## 怎么添加新工具

1. 在 `tools/` 下创建 `my-tool.html`，可以从零开始，也可以参考 [`tools/blank-line-remover.html`](tools/blank-line-remover.html) 的结构
2. 打开 [index.html](index.html)，在卡片网格里复制一份现有卡片，修改：
   - `href`（指向新工具页）
   - 名称
   - 描述
   - 图标 SVG（可选）
3. （可选）在新卡片上加 `data-tool-id="my-tool"`，"最近使用"角标会自动生效

**就这样，没有别的步骤。**

## 目录结构

```
self-media-dashboard/
├── index.html                  # 工作台首页（唯一入口）
├── README.md                   # 本文件
├── package.json                # npm 配置
├── server/
│   └── dev.js                  # 开发服务器（含热更新）
├── assets/
│   ├── css/common.css          # 共享样式
│   └── js/common.js            # 共享脚本（最近使用、暗色模式、热更新客户端）
└── tools/
    └── blank-line-remover.html # 空行去除器
```

> 文件名以 `_` 开头的会被视为模板/示例，**不会**当作真实工具展示在工作台首页。

## 视觉规范

| 项 | 取值 |
|---|---|
| 字体 | 系统字体栈（macOS 原生 SF） |
| 主色 | `indigo-500` (#6366f1) |
| 强调色 | `amber-400` (#fbbf24)，用于"最近使用"角标 |
| 圆角 | `rounded-2xl` (1rem) |
| 图标 | 内联 SVG（Heroicons 风格），不依赖外部 CDN |
| 暗色模式 | 默认跟随系统，右上角按钮可手动切换 |

## 调试

- macOS Safari / Chrome：菜单 → "显示开发工具" 或 `⌘ + ⌥ + I`
- **推荐使用 `npm start` 启动开发服务器**：保存文件后浏览器自动刷新，无需手动 `Cmd+R`
- 想清空"最近使用"记录：在浏览器控制台执行 `localStorage.removeItem('smd.recent')`