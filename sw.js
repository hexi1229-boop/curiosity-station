'use strict';

const CACHE_PREFIX = 'curiosity-station-';
const CACHE = `${CACHE_PREFIX}v146`;
const INSTALL_CACHE = `${CACHE}-installing`;
const CORE_FILES = [
  './',
  'index.html',
  'courses.html',
  'records.html',
  'style.css',
  'catalog.css',
  'records.css',
  'learning-feedback.css',
  'app.js',
  'catalog.js',
  'courses.js',
  'learning-feedback.js',
  'learning-backup.js',
  'records.js',
  'app.webmanifest',
  'assets/icon.svg',
  'assets/icon-180.png',
  'assets/icon-192.png',
  'assets/icon-512.png'
];
const CORE_URLS = CORE_FILES.map(file => new URL(file, self.registration.scope).href);
const CACHEABLE_DESTINATIONS = new Set([
  'audio', 'document', 'font', 'image', 'manifest', 'script', 'style', 'video', 'worker'
]);

function cacheKey(input) {
  const url = new URL(typeof input === 'string' ? input : input.url);
  url.hash = '';
  url.search = '';
  return url.href;
}

function canStore(response) {
  return response && response.status === 200 && !response.redirected && response.type !== 'opaque';
}

function isCacheable(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return false;
  if (request.mode === 'navigate' || CACHEABLE_DESTINATIONS.has(request.destination)) return true;
  return /\.(?:css|html?|ico|jpe?g|js|json|m4a|mjs|mp3|mp4|png|svg|webmanifest|webp|woff2?)$/i.test(url.pathname);
}

async function fetchAndStore(url, cacheName = CACHE) {
  const key = cacheKey(url);
  const request = new Request(key, {
    cache: 'reload',
    credentials: 'same-origin'
  });
  try {
    const response = await fetch(request);
    if (!canStore(response)) return null;
    await (await caches.open(cacheName)).put(key, response.clone());
    return response;
  } catch (_) {
    return null;
  }
}

async function cacheCore() {
  await caches.delete(INSTALL_CACHE);
  const failed = [];
  let cursor = 0;
  async function worker() {
    while (cursor < CORE_URLS.length) {
      const url = CORE_URLS[cursor++];
      const fresh = await fetchAndStore(url, INSTALL_CACHE);
      if (!fresh) failed.push(url);
    }
  }
  await Promise.all(Array.from({length: Math.min(4, CORE_URLS.length)}, worker));
  if (failed.length) {
    await caches.delete(INSTALL_CACHE);
    throw new Error(`Core cache incomplete: ${failed.length}`);
  }
}

async function promoteCore() {
  const source = await caches.open(INSTALL_CACHE);
  const target = await caches.open(CACHE);
  for (const url of CORE_URLS) {
    const response = await source.match(url);
    if (!response) throw new Error('Staged core cache incomplete');
    await target.put(url, response);
  }
  await caches.delete(INSTALL_CACHE);
}

async function cacheUrls(urls, fetchMissing = true) {
  const scoped = [...new Set(urls.map(url => {
    try {
      const parsed = new URL(url, self.registration.scope);
      return parsed.origin === self.location.origin && parsed.href.startsWith(self.registration.scope)
        ? cacheKey(parsed.href)
        : null;
    } catch (_) {
      return null;
    }
  }).filter(Boolean))];
  let pageCached = 0;
  let cursor = 0;
  async function worker() {
    while (cursor < scoped.length) {
      const url = scoped[cursor++];
      const current = await (await caches.open(CACHE)).match(url);
      if (current || (fetchMissing && await fetchAndStore(url))) pageCached += 1;
    }
  }
  await Promise.all(Array.from({length: Math.min(4, scoped.length)}, worker));
  return {pageCached, pageTotal: scoped.length, pageReady: pageCached === scoped.length};
}

async function cacheStatus() {
  const current = await caches.open(CACHE);
  let coreCached = 0;
  for (const url of CORE_URLS) if (await current.match(url)) coreCached += 1;
  return {cache: CACHE, coreCached, coreTotal: CORE_URLS.length};
}

async function currentOrNetwork(request) {
  const key = cacheKey(request);
  const current = await (await caches.open(CACHE)).match(key);
  if (current) return current;

  try {
    const response = await fetch(new Request(request, {cache: 'reload'}));
    if (canStore(response)) {
      const copy = response.clone();
      await (await caches.open(CACHE)).put(key, copy);
    }
    return response;
  } catch (error) {
    if (request.mode === 'navigate') return offlinePage();
    throw error;
  }
}

function offlinePage() {
  const home = self.registration.scope;
  const body = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#20574b"><title>这页还没保存 · 好奇心小站</title><style>body{margin:0;background:#f7f5ee;color:#173e36;font:17px/1.7 system-ui,sans-serif}main{box-sizing:border-box;max-width:40rem;margin:12vh auto;padding:2rem}h1{font-size:2rem;line-height:1.2}a{display:inline-block;margin-top:1rem;padding:.7rem 1rem;border-radius:999px;background:#20574b;color:white;text-decoration:none}</style><main><p>当前没有网络</p><h1>这门课还没保存在设备上。</h1><p>联网打开一次后，它就能在这台设备上离线使用。</p><a href="${home}">返回已保存的入口</a></main></html>`;
  return new Response(body, {
    status: 503,
    headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'}
  });
}

async function fullAudio(request) {
  const key = cacheKey(request);
  return (await caches.open(CACHE)).match(key);
}

async function rangeResponse(request) {
  const full = await fullAudio(request);
  if (!full) return fetch(request);

  const bytes = await full.arrayBuffer();
  const range = request.headers.get('Range');
  const match = /^bytes=(\d*)-(\d*)$/.exec(range || '');
  const invalid = () => new Response(null, {
    status: 416,
    headers: {'Content-Range': `bytes */${bytes.byteLength}`}
  });
  if (!match || (!match[1] && !match[2])) return invalid();

  const start = match[1]
    ? Number(match[1])
    : Math.max(0, bytes.byteLength - Number(match[2]));
  const end = match[2] && match[1]
    ? Math.min(Number(match[2]), bytes.byteLength - 1)
    : bytes.byteLength - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= bytes.byteLength) {
    return invalid();
  }

  const headers = new Headers(full.headers);
  headers.delete('Content-Encoding');
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Length', String(end - start + 1));
  headers.set('Content-Range', `bytes ${start}-${end}/${bytes.byteLength}`);
  return new Response(bytes.slice(start, end + 1), {status: 206, headers});
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    await cacheCore();
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await promoteCore();
    const oldCaches = (await caches.keys()).filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE);
    await Promise.all(oldCaches.map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (!isCacheable(event.request)) return;
  const url = new URL(event.request.url);
  const hasRange = event.request.headers.has('Range');
  const isAudioRange = hasRange && /\.(?:m4a|mp3|mp4)$/i.test(url.pathname);
  if (hasRange && !isAudioRange) return;
  event.respondWith(isAudioRange ? rangeResponse(event.request) : currentOrNetwork(event.request));
});

self.addEventListener('message', event => {
  const data = event.data || {};
  const reply = payload => {
    if (event.ports && event.ports[0]) event.ports[0].postMessage(payload);
  };
  if (data.type === 'CACHE_STATUS') {
    event.waitUntil(cacheStatus().then(reply));
    return;
  }
  if (data.type === 'CACHE_URLS') {
    event.waitUntil((async () => {
      const fetchMissing = data.fetchMissing !== false;
      let core = await cacheStatus();
      if (fetchMissing && core.coreCached < core.coreTotal) await cacheUrls(CORE_URLS);
      const page = await cacheUrls(Array.isArray(data.urls) ? data.urls : [], fetchMissing);
      if (core.coreCached < core.coreTotal) core = await cacheStatus();
      reply({...core, ...page});
    })());
  }
});
