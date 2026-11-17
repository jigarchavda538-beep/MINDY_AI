const CACHE="jigar-ai-v3";
const ASSETS=["/","/index.html","/style.css","/app.js","/manifest.webmanifest","/icon.svg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(u.origin===location.origin&&e.request.method==="GET"&&!u.pathname.startsWith("/api/"))e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)));});