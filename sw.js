const C='pg-v18';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(clients.claim())});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.hostname!==location.hostname)return;
  e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(C).then(x=>x.put(r,c)).catch(()=>{});return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
});
