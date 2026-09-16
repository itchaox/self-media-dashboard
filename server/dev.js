/**
 * self-media-dashboard 开发服务器
 *
 * 职责：
 *   1. 静态文件服务（替换 `python3 -m http.server`）
 *   2. SSE 端点 /__events，向已连接的浏览器推送文件变更
 *   3. chokidar 监听 *.html / *.css / *.js，变更后通知相关客户端
 *
 * 启动：npm start  （或 PORT=8766 npm start 端口冲突时）
 * 退出：Ctrl+C —— 优雅关闭 watcher 与所有 SSE 连接
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const chokidar = require('chokidar');

// ---------- 配置 ----------

const ROOT = path.resolve(__dirname, '..');     // 项目根目录
const PORT = Number(process.env.PORT) || 8765;
const DEBOUNCE_MS = 200;
const HEARTBEAT_MS = 25_000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.md':   'text/markdown; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.map':  'application/json; charset=utf-8',
};

// ---------- 状态 ----------

/** @type {Map<string, Set<import('http').ServerResponse>>} */
const clients = new Map();           // pathname -> Set<res>
const pendingChanges = new Set();    // debounce 期间累积的 url 路径
let debounceTimer = null;

// ---------- 工具 ----------

function toUrlPath(absPath) {
  const rel = path.relative(ROOT, absPath).split(path.sep).join('/');
  return '/' + rel;
}

function log(...args) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}]`, ...args);
}

// ---------- 静态文件服务 ----------

function safeResolve(urlPath) {
  // 解码 %xx、处理 ..，禁止逃出 ROOT
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const resolved = path.resolve(ROOT, '.' + decoded);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) return null;
  return resolved;
}

function serveStatic(req, res) {
  let abs = safeResolve(req.url);
  if (!abs) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  // 目录 → 找 index.html
  let stat;
  try { stat = fs.statSync(abs); } catch (_) { stat = null; }
  if (stat && stat.isDirectory()) {
    abs = path.join(abs, 'index.html');
    try { stat = fs.statSync(abs); } catch (_) { stat = null; }
  }
  if (!stat || !stat.isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  const ext = path.extname(abs).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': mime,
    'Content-Length': stat.size,
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(abs).pipe(res);
}

// ---------- SSE ----------

function handleSSE(req, res) {
  // 必须禁用 Node 默认压缩 + Nginx 缓冲（虽然本地不需要，写着防一手）
  res.writeHead(200, {
    'Content-Type':  'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection':    'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('retry: 2000\n\n');     // 客户端断开后 2s 重连
  res.write(`:connected\n\n`);      // 注释行，立即推送表示已连上

  // 用 Referer 头拿到"当前打开的页面路径"作为分组 key
  // （req.url 是 /__events 本身，没有页面信息）
  const referer = req.headers.referer || '';
  let pathname = '/';
  try {
    const refUrl = new URL(referer);
    pathname = refUrl.pathname || '/';
  } catch (_) { /* referer 缺失或非法，归到 '/' */ }

  if (!clients.has(pathname)) clients.set(pathname, new Set());
  clients.get(pathname).add(res);

  const ka = setInterval(() => {
    try { res.write(`:ka\n\n`); } catch (_) { /* res 已关闭 */ }
  }, HEARTBEAT_MS);

  log(`SSE  + ${pathname}   (${clients.get(pathname).size} clients on this path)`);

  req.on('close', () => {
    clearInterval(ka);
    const set = clients.get(pathname);
    if (set) {
      set.delete(res);
      if (set.size === 0) clients.delete(pathname);
    }
    log(`SSE  - ${pathname}   (closed)`);
  });
}

// ---------- 路由分发 ----------

function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/__events') {
    return handleSSE(req, res);
  }
  if (url.pathname === '/__state') {
    // 预留：未来按需返回文件 hash 基线
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end('{}');
    return;
  }
  serveStatic(req, res);
}

// ---------- 文件监听 ----------

function startWatcher() {
  const watcher = chokidar.watch(['**/*.html', '**/*.css', '**/*.js'], {
    cwd: ROOT,
    ignored: [
      '**/node_modules/**',
      '**/.git/**',
      '**/.gstack/**',
      'server/**',           // 改服务器自身不应触发 reload
      'package.json',
      'package-lock.json',
      'README.md',
    ],
    ignoreInitial: true,     // 启动时不把已有文件推一遍
    atomic: true,            // 等待原子保存完成
  });

  watcher.on('add',    (p) => scheduleNotify(path.resolve(ROOT, p)));
  watcher.on('change', (p) => scheduleNotify(path.resolve(ROOT, p)));
  // 不监听 unlink：避免编辑器临时文件 unlink/create 噪声

  watcher.on('ready', () => {
    // chokidar v3 的 getWatched() 返回 { dirPath: [fileName, ...] }
    let fileCount = 0;
    try {
      if (typeof watcher.getWatched === 'function') {
        const watched = watcher.getWatched();
        fileCount = Object.values(watched).reduce((a, arr) => a + (Array.isArray(arr) ? arr.length : 0), 0);
      }
    } catch (_) { /* ignore */ }
    log(`file watch: ${fileCount} files`);
  });

  return watcher;
}

function scheduleNotify(absPath) {
  const urlPath = toUrlPath(absPath);
  pendingChanges.add(urlPath);
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(flush, DEBOUNCE_MS);
}

function flush() {
  const changed = [...pendingChanges];
  pendingChanges.clear();
  debounceTimer = null;
  if (changed.length === 0) return;

  const hasHtml = changed.some(p => p.endsWith('.html'));
  const payload = JSON.stringify({ paths: changed });
  const frame = `event: reload\ndata: ${payload}\n\n`;

  let notified = 0;
  for (const [clientPath, resSet] of clients) {
    // HTML 变更：仅精准通知打开了该 URL 的客户端
    // CSS/JS 变更：通知所有客户端（避免 <link>/<script> 缓存）
    const isAffected = hasHtml
      ? changed.includes(clientPath)
      : true;

    if (!isAffected) continue;

    for (const res of resSet) {
      try { res.write(frame); notified++; } catch (_) { /* 已关闭 */ }
    }
  }
  log(`reload  ${changed.join(', ')}  →  ${notified} client(s)`);
}

// ---------- 启动 / 退出 ----------

function main() {
  const server = http.createServer(router);

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`\n[snd] 端口 ${PORT} 被占用。请改用：PORT=8766 npm start\n`);
      process.exit(1);
    }
    console.error('[snd] server error:', e);
  });

  const watcher = startWatcher();

  server.listen(PORT, () => {
    console.log('');
    console.log(`[snd] watching on http://localhost:${PORT}`);
    console.log(`[snd] SSE endpoint:  GET /__events`);
    console.log(`[snd] Ctrl+C to stop`);
    console.log('');
  });

  // 优雅退出
  const shutdown = (signal) => {
    log(`收到 ${signal}，正在关闭...`);
    try { watcher.close(); } catch (_) {}
    for (const [, set] of clients) {
      for (const res of set) {
        try { res.write('event: bye\ndata: "shutdown"\n\n'); res.end(); } catch (_) {}
      }
    }
    server.close(() => process.exit(0));
    // 兜底：2 秒后强退
    setTimeout(() => process.exit(0), 2000).unref();
  };
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();