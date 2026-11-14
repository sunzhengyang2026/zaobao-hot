const CACHE='brief-v1-2026-11-14-1794655681';
const ASSETS=['./index.html','./manifest.webmanifest',
  "./issue-2026-11-14.html"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // 页面导航与 HTML 走"网络优先"，保证每次打开都是最新一期；断网才回退缓存
  const isDoc=e.request.mode==='navigate'||e.request.destination==='document';
  if(isDoc){
    e.respondWith(fetch(e.request).then(res=>{
      const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
    const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;
  }).catch(()=>caches.match('./index.html'))));
});
