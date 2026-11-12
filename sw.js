/* Service worker du CV interactif et de ses démos.
   Pages : réseau d'abord (toujours la dernière version), copie locale si hors ligne.
   Images et polices : copie locale d'abord, rafraîchie en arrière-plan. */
const V='emb-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||r.headers.has('range'))return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(k=>k.put(r,c))}return x})
      .catch(()=>caches.match(r,{ignoreSearch:true}).then(x=>x||caches.match(new URL('./',self.registration.scope).href))));
    return;
  }
  if(/\.(?:webp|jpe?g|png|svg|ico|woff2|webmanifest)$/i.test(u.pathname)){
    e.respondWith(caches.open(V).then(c=>c.match(r).then(hit=>{
      const net=fetch(r).then(x=>{if(x.ok)c.put(r,x.clone());return x}).catch(()=>hit);
      return hit||net})));
  }
});
