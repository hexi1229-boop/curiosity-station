'use strict';
const installDialog = document.querySelector('#install-dialog');
if (installDialog) {
  document.querySelector('#install-help').onclick = () => installDialog.showModal();
  for (const id of ['close-install', 'install-done']) document.getElementById(id).onclick = () => installDialog.close();
}
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('sw.js').then(async registration => {
    await navigator.serviceWorker.ready;
    const status = document.querySelector('#offline-status');
    if (status) status.textContent = '本站内容已可离线打开';
    registration.update().catch(() => {});
  }).catch(() => {});
}
