'use strict';

const installDialog = document.querySelector('#install-dialog');
if (installDialog) {
  document.querySelector('#install-help').onclick = () => installDialog.showModal();
  for (const id of ['close-install', 'install-done']) document.getElementById(id).onclick = () => installDialog.close();
}

const offlineStatus = document.querySelector('#offline-status');
const updateSessionKey = 'curiosity-station-sw-update-v1';
const updateIntervalMs = 30 * 60 * 1000;
let serviceWorkerRegistration = null;
let currentPageCache = null;
let offlineRetryTimer = null;
const cachingAudio = new Set();

function setOfflineStatus(text) {
  if (offlineStatus) offlineStatus.textContent = text;
}

function pageResourceUrls() {
  const urls = [window.location.href];
  for (const element of document.querySelectorAll('link[href],script[src],img[src]')) {
    const value = element.href || element.src;
    if (value) urls.push(value);
  }
  return urls;
}

function sendToWorker(worker, message) {
  if (!worker) return Promise.resolve(null);
  return new Promise(resolve => {
    const channel = new MessageChannel();
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      channel.port1.close();
      resolve(value);
    };
    const timeout = window.setTimeout(() => finish(null), 4000);
    channel.port1.onmessage = event => {
      finish(event.data || null);
    };
    worker.postMessage(message, [channel.port2]);
  });
}

function waitForServiceWorker(timeoutMs = 12000) {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise(resolve => window.setTimeout(() => resolve(null), timeoutMs))
  ]);
}

function renderOfflineStatus(state) {
  if (!state || !Number.isFinite(state.coreCached) || !Number.isFinite(state.coreTotal)) {
    setOfflineStatus('离线状态暂不可确认 · 记录仍保存在本机');
    return;
  }
  if (typeof state.pageReady === 'boolean') currentPageCache = state.pageReady;
  if (!navigator.onLine) {
    if (state.coreCached === state.coreTotal && currentPageCache === true) {
      setOfflineStatus('当前离线 · 本页基础内容与入口可用');
    }
    else if (currentPageCache === false) setOfflineStatus('当前离线 · 本页可能缺少资源');
    else setOfflineStatus('当前离线 · 已保存的页面仍可打开');
    return;
  }
  if (state.coreCached === state.coreTotal) {
    if (currentPageCache === true) setOfflineStatus('本页基础内容与离线入口已保存');
    else if (currentPageCache === false) setOfflineStatus('离线入口已就绪 · 本页需联网补齐');
    else setOfflineStatus('离线入口已就绪 · 打开课程后自动保存');
  } else {
    setOfflineStatus(`正在准备离线入口 ${state.coreCached}/${state.coreTotal}`);
  }
}

async function refreshOfflineState(cacheCurrentPage, retryCount = 0) {
  if (offlineRetryTimer) {
    window.clearTimeout(offlineRetryTimer);
    offlineRetryTimer = null;
  }
  const registration = serviceWorkerRegistration || await navigator.serviceWorker.ready;
  const worker = navigator.serviceWorker.controller || registration.active;
  let state = null;
  if (cacheCurrentPage) {
    state = await sendToWorker(worker, {
      type: 'CACHE_URLS',
      urls: pageResourceUrls(),
      fetchMissing: navigator.onLine
    });
  }
  if (!state) state = await sendToWorker(worker, {type: 'CACHE_STATUS'});
  renderOfflineStatus(state);
  const coreIncomplete = !state
    || !Number.isFinite(state.coreCached)
    || !Number.isFinite(state.coreTotal)
    || state.coreCached < state.coreTotal;
  if (navigator.onLine && coreIncomplete && retryCount < 3) {
    offlineRetryTimer = window.setTimeout(() => {
      offlineRetryTimer = null;
      refreshOfflineState(true, retryCount + 1).catch(() => {});
    }, 400 * (retryCount + 1));
  }
}

async function cachePlayedAudio(event) {
  const audio = event.target;
  if (!audio || audio.tagName !== 'AUDIO') return;
  const source = audio.currentSrc || audio.src;
  if (!source || !source.startsWith(window.location.origin) || cachingAudio.has(source)) return;
  cachingAudio.add(source);
  try {
    const registration = serviceWorkerRegistration || await navigator.serviceWorker.ready;
    const worker = navigator.serviceWorker.controller || registration.active;
    const state = await sendToWorker(worker, {type: 'CACHE_URLS', urls: [source], fetchMissing: true});
    if (!state || state.pageReady !== true) cachingAudio.delete(source);
  } catch (_) {
    cachingAudio.delete(source);
  }
}

function shouldCheckForUpdate() {
  try {
    const lastCheck = Number(sessionStorage.getItem(updateSessionKey));
    const now = Date.now();
    if (Number.isFinite(lastCheck) && now - lastCheck < updateIntervalMs) return false;
    sessionStorage.setItem(updateSessionKey, String(now));
    return true;
  } catch (_) {
    return true;
  }
}

if ('serviceWorker' in navigator && window.isSecureContext) {
  setOfflineStatus('正在准备离线入口…');
  navigator.serviceWorker.register('sw.js').then(async registration => {
    serviceWorkerRegistration = registration;
    const readyRegistration = await waitForServiceWorker();
    if (!readyRegistration) {
      setOfflineStatus('离线入口尚未准备好 · 可继续联网学习');
      if (shouldCheckForUpdate()) registration.update().catch(() => {});
      return;
    }
    await refreshOfflineState(true);
    if (shouldCheckForUpdate()) registration.update().catch(() => {});
  }).catch(() => {
    setOfflineStatus('离线功能暂未就绪 · 记录仍保存在本机');
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    refreshOfflineState(true).catch(() => {});
  });
  document.addEventListener('play', cachePlayedAudio, true);
  window.addEventListener('online', () => refreshOfflineState(true).catch(() => {}));
  window.addEventListener('offline', () => refreshOfflineState(true).catch(() => {}));
}
