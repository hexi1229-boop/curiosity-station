'use strict';
const CACHE = 'curiosity-station-v63';
const FILES = ['./','index.html','style.css','app.js','learning-feedback.js','learning-feedback.css','records.html','records.css','records.js','learning-backup.js','catalog.js','catalog.css','courses.html','courses.js','reading.html','reading.css','equation.html','equation.css','equation-content.js','equation.js','speed.html','speed.css','speed-content.js','speed.js','map.html','map.css','map-content.js','map.js','change.html','change.css','change-content.js','change.js','power.html','power.css','power-content.js','power.js','division.html','division.css','division-content.js','division.js','grid.html','grid.css','grid-content.js','grid.js','forces.html','forces.css','forces-content.js','forces.js','multiply.html','multiply.css','multiply-content.js','multiply.js','particle.html','particle.css','particle-content.js','particle.js','gist.html','gist.css','gist-content.js','gist.js','past.html','past.css','past-content.js','past.js','assets/audio/past-flight.m4a','subtract.html','subtract.css','subtract-content.js','subtract.js','cell.html','cell.css','cell-content.js','cell.js','contour.html','contour.css','contour-content.js','contour.js','density.html','density.css','density-content.js','density.js','negative.html','negative.css','negative-content.js','negative.js','now.html','now.css','now-content.js','now.js','tomato.html','tomato.css','tomato-content.js','tomato.js','reading-content.js','reading.js','english.html','english.css','english.js','rocket.html','rocket.css','rocket.js','scale.html','scale.css','scale.js','balance.html','balance.css','balance.js','balance-logic.mjs','charts.html','charts.css','charts.js','chart-logic.mjs','lesson.html','lessons/math.html','lessons/chinese.html','app.webmanifest','assets/icon.svg','assets/icon-180.png','assets/icon-192.png','assets/icon-512.png','assets/audio/robot-dog.m4a'];
const urls = FILES.map(file=>new URL(file,self.location).href);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const url of urls) {
      const response = await fetch(url, {cache:'reload'});
      if (!response.ok || response.redirected || response.type === 'opaque') throw new Error('Asset not available');
      await cache.put(url,response);
    }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => event.waitUntil((async()=>{
  for (const key of await caches.keys()) if (key.startsWith('curiosity-station-') && key !== CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  url.search = '';
  if (event.request.method !== 'GET' || !urls.includes(url.href)) return;
  event.respondWith((async()=>{
    const cached = await (await caches.open(CACHE)).match(url.href);
    if (!cached) return fetch(event.request);
    const range = event.request.headers.get('Range');
    if (range && url.pathname.endsWith('.m4a')) {
      const bytes = await cached.arrayBuffer();
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
      const start = match[1] ? Number(match[1]) : Math.max(0,bytes.byteLength-Number(match[2]));
      const end = match[1] && match[2] ? Math.min(Number(match[2]),bytes.byteLength-1) : bytes.byteLength-1;
      if (start > end || start >= bytes.byteLength) return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
      return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':'audio/mp4','Content-Range':`bytes ${start}-${end}/${bytes.byteLength}`,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
    }
    return cached;
  })());
});
