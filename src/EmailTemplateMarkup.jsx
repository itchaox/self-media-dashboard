import React from 'react';

export default function EmailTemplateMarkup() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div role="tablist" className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
          <button data-mode="generate" role="tab" aria-selected="true" className="mode-tab px-4 py-1.5 rounded-lg text-sm font-medium transition bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm">
            {"\n          生成邮件\n        "}
          </button>
          <button data-mode="edit" role="tab" aria-selected="false" className="mode-tab px-4 py-1.5 rounded-lg text-sm font-medium transition text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            {"\n          编辑模板\n        "}
          </button>
        </div>
        <section id="panel-edit" className="panel rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200/60 dark:border-slate-700/60 space-y-4 hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {"编辑模板"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {"\n              用\n              "}
                <code className="font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-sky-600 dark:text-sky-300">
                  {"{{占位符}}"}
                </code>
                {"\n              标记将来要被替换的产品名。例如：\n              "}
                <code className="font-mono text-slate-600 dark:text-slate-300">
                  {"商务合作 × {{豆包}}"}
                </code>
                {"\n              。\n            "}
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {" 标题模板 "}
            </label>
            <input id="t-subject" placeholder="例：【AI 自媒体博主】爱听书的程序员阿超 × {{豆包}} 合作意向" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {"\n            检测到\n            "}
              <span id="t-count-subject" className="font-medium text-sky-600 dark:text-sky-300">
                {"0"}
              </span>
              {"\n            个占位符\n          "}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {" 内容模板 "}
            </label>
            <textarea id="t-body" rows="25" placeholder="例：您好：\n\n我是阿超，专注...\n\n期待与 {{豆包}} 合作！" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500">
            </textarea>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {"\n            检测到\n            "}
              <span id="t-count-body" className="font-medium text-sky-600 dark:text-sky-300">
                {"0"}
              </span>
              {"\n            个占位符\n          "}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span id="tpl-status" className="text-xs text-slate-500 dark:text-slate-400 min-h-[1rem]">
            </span>
            <div className="flex items-center gap-2">
              <button variant="primary" id="btn-tpl-save" className="px-4 py-2 rounded-xl text-white text-sm font-medium transition">
                {"\n              💾 保存模板\n            "}
              </button>
              <button id="btn-tpl-clear" className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium transition">
                {"\n              清空\n            "}
              </button>
            </div>
          </div>
        </section>
        <section id="panel-generate" className="panel rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200/60 dark:border-slate-700/60 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {"生成邮件"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {"\n            输入产品名字，实时替换模板里的\n            "}
              <code className="font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-sky-600 dark:text-sky-300">
                {"{{占位符}}"}
              </code>
              {"\n            。\n          "}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {" 自荐产品名字 "}
            </label>
            <input id="g-product" type="text" placeholder="例：豆包" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {"\n              邮件标题（可编辑）\n            "}
              </label>
              <input id="preview-subject" type="text" data-pristine="true" placeholder="输入产品名后这里显示最终标题" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              <div className="mt-2 flex items-center justify-between gap-2 min-h-[2rem]">
                <span data-dirty-hint-for="subject" className="hidden text-xs text-amber-600 dark:text-amber-400">
                  {"✋ 你修改过这里，再改产品名将不会覆盖。点 ↺ 重置可重新生成。"}
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <button id="btn-reset-subject" title="用当前模板 + 产品名重新生成" className="hidden px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 border border-amber-300 hover:border-amber-400 dark:bg-amber-900/60 dark:hover:bg-amber-900/80 dark:border-amber-700 dark:hover:border-amber-600 text-amber-800 dark:text-amber-200 text-xs font-medium transition">
                    {"\n                  ↺ 重置\n                "}
                  </button>
                  <button data-copy="preview-subject" data-copy-label="subject" className="copy-btn px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition shadow-sm">
                    {"\n                  📋 复制邮件标题\n                "}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {"\n              邮件内容（可编辑）\n            "}
              </label>
              <textarea id="preview-body" data-pristine="true" placeholder="输入产品名后这里显示最终正文" style={{"height": "32rem"}} className="preview-body w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none">
              </textarea>
              <div className="mt-2 flex items-center justify-between gap-2 min-h-[2rem]">
                <span data-dirty-hint-for="body" className="hidden text-xs text-amber-600 dark:text-amber-400">
                  {"✋ 你修改过这里，再改产品名将不会覆盖。点 ↺ 重置可重新生成。"}
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <button id="btn-reset-body" title="用当前模板 + 产品名重新生成" className="hidden px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 border border-amber-300 hover:border-amber-400 dark:bg-amber-900/60 dark:hover:bg-amber-900/80 dark:border-amber-700 dark:hover:border-amber-600 text-amber-800 dark:text-amber-200 text-xs font-medium transition">
                    {"\n                  ↺ 重置\n                "}
                  </button>
                  <button data-copy="preview-body" data-copy-label="body" className="copy-btn px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition shadow-sm">
                    {"\n                  📋 复制邮件内容\n                "}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div id="no-template-hint" className="hidden text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl px-4 py-3">
            {"\n          ⚠️ 你还没有设置模板。先切到「编辑模板」填好模板再回来。\n        "}
          </div>
        </section>
      </main>
      <div id="gen-toast" role="status" aria-live="polite" className="fixed top-8 left-1/2 -translate-x-1/2 -translate-y-4 px-6 py-3 rounded-full bg-slate-900/85 dark:bg-slate-100/90 text-white dark:text-slate-900 text-sm font-medium shadow-2xl backdrop-blur-md border border-emerald-400/40 opacity-0 pointer-events-none transition-all duration-300 z-50 flex items-center gap-2">
      </div>
    </>
  );
}
