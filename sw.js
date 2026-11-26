/* 栽培ノート：オフライン用。アプリ本体は端末に保存したものを先に使い、裏で新しい版を取得する。
   農薬の登録情報は通信を優先し、圏外のときだけ保存したものを使う。記録データはここを通らない（端末内のIndexedDB）。 */
const V='saibai-v1';
const SHELL=['./','index.html','crop-match.js','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('saibai-')&&k!==V&&k!==V+'-data').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  if(u.pathname.includes('/data/')){
    e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(V+'-data').then(x=>x.put(e.request,c))}return r})
      .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||Response.error())));
    return;
  }
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(c=>{
    const f=fetch(e.request).then(r=>{if(r.ok){const cl=r.clone();caches.open(V).then(x=>x.put(e.request,cl))}return r}).catch(()=>c);
    return c||f;
  }));
});
