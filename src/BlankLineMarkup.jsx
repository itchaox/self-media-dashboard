import React from 'react';

export default function BlankLineMarkup() {
  return (
    <>
      <header>
        <h1>
          {"✨ 空行去除器"}
        </h1>
        <p>
          {"自动清理多余空行，规范化 Markdown 格式"}
        </p>
      </header>
      <main className="workspace">
        <div className="panel glass">
          <div className="panel-header">
            <span>
              {"原始 Markdown"}
            </span>
          </div>
          <textarea id="input" placeholder="在此粘贴你的 Markdown 内容... (支持 Cmd/Ctrl + Enter 快速转换)">
          </textarea>
        </div>
        <div className="controls">
          <button className="btn-circle primary" id="btn-convert" title="一键转换 (Ctrl/Cmd + Enter)">
            {"\n          ⚡\n        "}
          </button>
          <button className="btn-circle secondary" id="btn-clear" title="清空所有内容">
            {"\n          🗑️\n        "}
          </button>
        </div>
        <div className="panel glass">
          <div className="panel-header">
            <span>
              {"优化结果"}
            </span>
            <button className="btn-small" id="btn-copy">
              {"\n            复制代码\n          "}
            </button>
          </div>
          <textarea id="output" readOnly="" placeholder="优化后的内容将显示在这里...">
          </textarea>
        </div>
      </main>
      <div className="toast" id="toast">
        {"\n      ✅ 转换成功并已复制到剪贴板\n    "}
      </div>
    </>
  );
}
