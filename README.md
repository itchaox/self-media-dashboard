# 阿超自媒体工具台

React + Ant Design + Vite，包含空行去除器、商单自荐邮件模板和提示词管理。

## 开发

使用 Node.js 22.12 或更高版本。执行 `npm install`，然后 `npm run dev`。
访问 http://localhost:8765；修改文件自动更新。

## 构建

执行 `npm run build`，产物位于 `dist/`。`npm run preview` 可预览构建结果。请通过服务器访问，不再支持双击源 HTML。

## 结构

- `src/main.jsx`：应用入口、首页、主题及提示词管理。
- `src/ToolPage.jsx`：React 状态与 Ant Design 控件驱动的邮件模板和空行去除器。
- `src/BlankLineMarkup.jsx` 和 `src/EmailTemplateMarkup.jsx`：两个工具页的文案和页面结构，由 React 直接渲染。
- `src/optimize.js`：保留原有 Markdown 算法。
- `src/style.css`：共享样式，Tailwind 在本地构建。

原 `tools/*.html` 地址和存储键保持不变：`smd.prompts.v1`、`smd.emailTemplates.v2`、`smd.theme`。使用相同浏览器和地址即可读取已有数据。
