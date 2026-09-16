/* ============================================================
 * 自媒体工具台 · 共享脚本
 * 暴露 window.SMD 命名空间，所有页面共享
 *   - SMD.recent.track(toolId)  记录一次使用
 *   - SMD.recent.getAll()       读取最近使用列表
 *   - SMD.theme.get()           读取当前主题（'light' | 'dark'）
 *   - SMD.theme.set(t)          设置主题并持久化
 *   - SMD.theme.toggle()        切换主题
 * ============================================================ */

(function () {
  'use strict';

  const RECENT_KEY = 'smd.recent';
  const THEME_KEY = 'smd.theme';
  const RECENT_MAX = 5;

  // ---------- 主题 ----------

  function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (_) { return null; }
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    applyTheme(theme);
  }

  function toggleTheme() {
    const current = getStoredTheme() || getSystemTheme();
    setTheme(current === 'dark' ? 'light' : 'dark');
    return current === 'dark' ? 'light' : 'dark';
  }

  // 在脚本加载时立即应用主题，避免 FOUC（页面闪烁）
  applyTheme(getStoredTheme() || getSystemTheme());

  // ---------- 最近使用 ----------

  function getRecent() {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function setRecent(list) {
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch (_) {}
  }

  function track(toolId) {
    if (!toolId) return;
    const list = getRecent().filter(id => id !== toolId);
    list.unshift(toolId);
    setRecent(list.slice(0, RECENT_MAX));
  }

  // ---------- 自动绑定 ----------

  document.addEventListener('DOMContentLoaded', () => {
    // 1. 任何带 data-tool-id 的工具卡片，点击时记录使用
    document.querySelectorAll('[data-tool-id]').forEach(el => {
      el.addEventListener('click', () => {
        track(el.getAttribute('data-tool-id'));
      });
    });

    // 2. 工具页：根据当前文件名自动 track
    const path = window.location.pathname;
    const match = path.match(/\/tools\/([^/]+)\.html/);
    if (match) {
      const fileName = match[1];
      // 跳过 _ 开头的模板/示例
      if (!fileName.startsWith('_')) {
        track(fileName);
      }
    }

    // 3. 首页（和工作台相关页面）渲染"最近使用"角标
    const recent = getRecent();
    if (recent.length) {
      recent.forEach((id, idx) => {
        const card = document.querySelector(`[data-tool-id="${CSS.escape(id)}"]`);
        if (!card || card.querySelector('.recent-badge')) return;
        const badge = document.createElement('span');
        badge.className = 'recent-badge';
        badge.textContent = `#${idx + 1}`;
        badge.title = '最近使用';
        card.appendChild(badge);
      });
    }

    // 4. 主题切换按钮：找 [data-theme-toggle] 自动绑定
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const newTheme = toggleTheme();
        btn.setAttribute('aria-pressed', newTheme === 'dark' ? 'true' : 'false');
      });
    });
  });

  // ---------- 暴露 API ----------

  window.SMD = {
    recent: { track, getAll: getRecent, setAll: setRecent },
    theme: { get: () => getStoredTheme() || getSystemTheme(), set: setTheme, toggle: toggleTheme },
  };
})();