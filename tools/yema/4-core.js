
/* ================= core: helpers, i18n, data, state ================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p||8)}catch(e){}};
const IS_PHONE=()=>window.matchMedia('(max-width:500px)').matches;
const STANDALONE=!!((window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone);
const f1=n=>Math.round(n*10)/10;
const IP={
back:'<path d="M15 5l-7 7 7 7"/>',chev:'<path d="M9 5l7 7-7 7"/>',close:'<path d="M6 6l12 12M18 6 6 18"/>',
heart:'<path d="M12 20s-7.5-4.6-9.2-9.1C1.7 7.9 3.6 4.5 7 4.5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.4 0 5.3 3.4 4.2 6.4C19.5 15.4 12 20 12 20z"/>',
heartf:'<path fill="currentColor" d="M12 20s-7.5-4.6-9.2-9.1C1.7 7.9 3.6 4.5 7 4.5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.4 0 5.3 3.4 4.2 6.4C19.5 15.4 12 20 12 20z"/>',
share:'<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
sliders:'<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
bell:'<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
home:'<path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z"/>',
grid:'<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
clock:'<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
watch:'<circle cx="12" cy="12" r="5.5"/><path d="M9 6.8 9.8 3h4.4l.8 3.8M9 17.2l.8 3.8h4.4l.8-3.8M12 9.6V12l1.6 1"/>',
diamond:'<path d="M6.5 4h11L21 9l-9 11.5L3 9z"/><path d="M3 9h18M9.5 4 8 9l4 11.5L16 9l-1.5-5"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6"/>',
check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
eyeoff:'<path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 3.8M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
lock:'<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
apple:'<path fill="currentColor" stroke="none" d="M16.4 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.9-3-.9C6.9 7.3 5.4 8.2 4.6 9.7c-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.7 2.4 3 2.4 1.2 0 1.6-.8 3.1-.8s1.8.8 3.1.8 2.1-1.2 2.8-2.3c.9-1.3 1.3-2.6 1.3-2.7 0 0-2.6-1-2.7-4.1zM14.1 5.6c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3z"/>',
google:'<path fill="currentColor" stroke="none" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 12s4.3 9.7 9.6 9.7c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6z"/>',
ar:'<path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h15A1.5 1.5 0 0 1 21 8.5v7a1.5 1.5 0 0 1-1.5 1.5H16l-2-2.5h-4L8 17H4.5A1.5 1.5 0 0 1 3 15.5z"/><circle cx="8" cy="11.5" r="1.6"/><circle cx="16" cy="11.5" r="1.6"/>',
camera:'<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/>',
camoff:'<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/><path d="M3 3l18 18"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.5 7.5 0 0 0 7 6.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.5 7.5 0 0 0 2.6-1.5l2.4 1 2-3.4z"/>',
info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
rotate:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4.5V11h-6.5"/>',
reset:'<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 3.5v5h5"/>',
ruler:'<path d="M4 20V4h5v11h11v5z"/><path d="M4 8h2M4 12h2M8 17v3M12 17v3M16 17v3"/>',
cog:'<circle cx="12" cy="12" r="3.2"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6"/><circle cx="12" cy="12" r="6.3"/>',
water:'<path d="M3 9c1.5 0 1.5-1.5 3-1.5S7.5 9 9 9s1.5-1.5 3-1.5S13.5 9 15 9s1.5-1.5 3-1.5S19.5 9 21 9M3 13.5c1.5 0 1.5-1.5 3-1.5s1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5M3 18c1.5 0 1.5-1.5 3-1.5S7.5 18 9 18s1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5S19.5 18 21 18"/>',
cal:'<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
shield:'<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z"/><path d="M8.8 12l2.2 2.2 4.2-4.4"/>',
pin:'<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>',
globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
card:'<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',arrowl:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
crown:'<path d="M4 18.5h16M4.5 15.5 3.5 7l5 4L12 5l3.5 6 5-4-1 8.5z"/>',
wrench:'<path d="M15 3.5a5 5 0 0 0-4.6 6.9L3.5 17.3l3.2 3.2 6.9-6.9A5 5 0 0 0 20.5 9l-3 3-3.2-.8-.8-3.2 3-3a5 5 0 0 0-1.5-1.5z"/>',
mega:'<path d="M4 10v4h3l7 4V6l-7 4z"/><path d="M17.5 9a4 4 0 0 1 0 6M7 14l1.5 5h2.5L10 15"/>',
trend:'<path d="M3 7l6 6 4-4 8 8"/><path d="M21 11v6h-6"/>',
box:'<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
star:'<path fill="currentColor" d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z"/>',
chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
send:'<path d="M4 12 20 4l-5 16-3.5-6.5z"/><path d="M11.5 13.5 20 4"/>',
phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1.5 1.5 0 0 1-1.5 1.5A16.5 16.5 0 0 1 3.5 5.5 1.5 1.5 0 0 1 5 4z"/>',
nav:'<path d="M3 11l18-8-8 18-2-8z"/>',
download:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
trash:'<path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 13h10l1-13"/>',
faceid:'<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M9 9.5v1M15 9.5v1M12 9.5v3.5h-1M9.5 15.5a3.5 3.5 0 0 0 5 0"/>',
qr:'<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2M16 16h2v2"/>',
scan:'<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M4 12h16"/>',
layers:'<path d="M12 4 3 9l9 5 9-5z"/><path d="M3 14l9 5 9-5"/>',
zin:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2M8 11h6M11 8v6"/>',zout:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2M8 11h6"/>',
device:'<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',tablet:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M11 18h2"/>',
logout:'<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/>',
gift:'<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9c-1.5-3-5.5-4-5.5-1.5S12 9 12 9zM12 9c1.5-3 5.5-4 5.5-1.5S12 9 12 9z"/>',
truck:'<path d="M3 6h11v10H3zM14 9.5h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l1.5 1.5"/>',
dots:'<circle cx="12" cy="5.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="18.5" r="1.3" fill="currentColor"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5 12 13l8.5-6.5"/>',
video:'<rect x="3" y="6.5" width="12.5" height="11" rx="2"/><path d="M15.5 10.5 21 7.5v9l-5.5-3"/>',
image:'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5L6 19.5"/>',
bag:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
wifioff:'<path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.8M19 12.9a10 10 0 0 0-2-1.4M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 10.7 5M12 20h.01"/>',
sparkle:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
hand:'<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v8c0 4-2.5 7-6 7-2.6 0-4-1.5-5.5-4L3.8 13.6a1.5 1.5 0 0 1 2.4-1.8L8 14"/>',
moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
compare:'<path d="M8 4v16M16 4v16M3 8h5M16 16h5M3 8l2-2M3 8l2 2M21 16l-2-2M21 16l-2 2"/>',
play:'<path d="M8 5v14l11-7z"/>',
bagp:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8M12 11.5v5M9.5 14h5"/>',
move:'<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>'
};

/*ILL*/
function wristScene(){ // stylised forearm, 390x700 canvas, wrist centred at (195,308)
 return `<svg viewBox="0 0 390 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
 <linearGradient id="sbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3C4A5A"/><stop offset=".45" stop-color="#27313D"/><stop offset="1" stop-color="#0D1117"/></linearGradient>
 <filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
 <filter id="bl2"><feGaussianBlur stdDeviation="3"/></filter>
 <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A07A"/><stop offset=".45" stop-color="#C08058"/><stop offset="1" stop-color="#7E4D32"/></linearGradient>
 <linearGradient id="skin2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DDA784"/><stop offset=".6" stop-color="#B8784F"/><stop offset="1" stop-color="#7A4830"/></linearGradient>
 <linearGradient id="slv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34425C"/><stop offset="1" stop-color="#121A28"/></linearGradient>
 </defs>
 <rect width="390" height="700" fill="url(#sbg)"/>
 <g filter="url(#bl)" opacity=".85"><circle cx="70" cy="120" r="48" fill="#C9A96A" opacity=".35"/><circle cx="320" cy="90" r="60" fill="#8FA8C0" opacity=".3"/><circle cx="250" cy="170" r="30" fill="#E8C98E" opacity=".35"/><circle cx="40" cy="520" r="70" fill="#51607A" opacity=".5"/><circle cx="350" cy="560" r="80" fill="#2F3B4D" opacity=".7"/><circle cx="170" cy="60" r="26" fill="#F1DDB0" opacity=".3"/></g>
 <ellipse cx="200" cy="420" rx="240" ry="40" fill="#000" opacity=".35" filter="url(#bl)"/>
 <path d="M-40 262 C 40 250, 120 256, 175 262 C 215 266, 250 262, 290 250 L 300 380 C 262 370, 225 362, 180 360 C 120 358, 40 372, -40 388 Z" fill="url(#skin)"/>
 <path d="M-40 262 C 40 250, 120 256, 175 262 C 215 266, 250 262, 290 250 L 292 272 C 250 282, 212 284, 176 282 C 120 278, 40 272, -40 284 Z" fill="#fff" opacity=".08"/>
 <path d="M-40 350 C 40 340, 120 344, 180 346 C 225 348, 262 356, 300 366 L 300 380 C 262 370, 225 362, 180 360 C 120 358, 40 372, -40 388 Z" fill="#000" opacity=".18"/>
 <path d="M270 238 C 300 214, 352 206, 392 214 C 420 220, 440 240, 446 270 L 450 360 C 438 392, 404 408, 360 404 C 330 400, 300 392, 280 380 C 262 340, 258 284, 270 238 Z" fill="url(#skin2)"/>
 <path d="M300 230 C 322 214, 356 208, 388 214" stroke="#8A5436" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>
 <path d="M352 212 C 356 236, 358 262, 356 290 M388 216 C 392 240, 394 266, 392 294" stroke="#8A5436" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>
 <path d="M282 300 C 300 316, 330 322, 350 318 C 366 314, 372 330, 356 342 C 330 360, 296 352, 280 338" fill="#C98A62" stroke="#8A5436" stroke-opacity=".4" stroke-width="2"/>
 <path d="M-40 250 L 60 244 C 72 300, 74 340, 64 392 L -40 404 Z" fill="url(#slv)"/>
 <path d="M60 244 C 72 300, 74 340, 64 392" stroke="#0B111B" stroke-width="3" fill="none" opacity=".6"/>
 <path d="M8 252 C 18 300, 20 344, 12 396 M30 249 C 40 300, 42 344, 34 394" stroke="#fff" stroke-opacity=".05" stroke-width="2" fill="none"/>
 <ellipse cx="200" cy="308" rx="46" ry="54" fill="#000" opacity=".22" filter="url(#bl2)"/>
 </svg>`;
}
function roomArt(kind){ // invitation / cercle backgrounds
 if(kind==='expo')return `<svg viewBox="0 0 360 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="ex1" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#E7B25E"/><stop offset=".4" stop-color="#9A5A1E"/><stop offset="1" stop-color="#1B1008"/></radialGradient><filter id="exb"><feGaussianBlur stdDeviation="6"/></filter><linearGradient id="exf" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="#0F1B2D" stop-opacity="0"/><stop offset="1" stop-color="#0F1B2D" stop-opacity=".92"/></linearGradient></defs><rect width="360" height="400" fill="url(#ex1)"/><g filter="url(#exb)">${[[40,60,14],[90,30,9],[150,80,18],[230,40,12],[300,90,16],[330,30,8],[60,150,10],[270,160,12],[190,20,7]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#FFE2A8" opacity=".75"/>`).join('')}</g><path d="M290 250 q-18 -40 -8 -80 h36 q10 40 -8 80 z M300 250 v70 M284 322 h32" stroke="#FCE6B8" stroke-opacity=".55" stroke-width="2.2" fill="#FCE6B8" fill-opacity=".08"/><path d="M40 270 q-14 -34 -6 -64 h28 q8 30 -6 64 z M48 270 v56 M36 328 h24" stroke="#FCE6B8" stroke-opacity=".45" stroke-width="2" fill="#FCE6B8" fill-opacity=".06"/><rect width="360" height="400" fill="url(#exf)"/></svg>`;
 return `<svg viewBox="0 0 360 340" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="cc1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B1E1A"/><stop offset=".5" stop-color="#1D1622"/><stop offset="1" stop-color="#0F1B2D"/></linearGradient><radialGradient id="cc2" cx=".5" cy="0" r=".7"><stop offset="0" stop-color="#F3C77E" stop-opacity=".75"/><stop offset="1" stop-color="#F3C77E" stop-opacity="0"/></radialGradient><filter id="ccb"><feGaussianBlur stdDeviation="4"/></filter></defs><rect width="360" height="340" fill="url(#cc1)"/><rect width="360" height="200" fill="url(#cc2)"/>${[30,110,190,270].map(x=>`<path d="M${x} 330 V150 a40 40 0 0 1 80 0 V330" fill="#0B0F17" fill-opacity=".45" stroke="#C9A96A" stroke-opacity=".25"/>`).join('')}<g filter="url(#ccb)">${[-60,-30,0,30,60].map(d=>`<circle cx="${180+d}" cy="${40+Math.abs(d)/3}" r="5" fill="#FFE0A0"/>`).join('')}</g><path d="M120 50 Q180 90 240 50 M140 58 Q180 80 220 58" stroke="#E8C98E" stroke-opacity=".6" fill="none" stroke-width="1.5"/><path d="M180 0 V50" stroke="#E8C98E" stroke-opacity=".5"/><rect y="170" width="360" height="170" fill="#0F1B2D" opacity=".55"/></svg>`;
}
function articleArt(kind){
 if(kind==='calibre'){const gear=(x,y,r,n,c,rot)=>{let d='';for(let i=0;i<n;i++){const a1=(i/n)*Math.PI*2,a2=((i+.5)/n)*Math.PI*2;d+=`${i?'L':'M'}${f1(x+Math.cos(a1)*r)} ${f1(y+Math.sin(a1)*r)}L${f1(x+Math.cos(a1)*(r+5))} ${f1(y+Math.sin(a1)*(r+5))}L${f1(x+Math.cos(a2)*(r+5))} ${f1(y+Math.sin(a2)*(r+5))}L${f1(x+Math.cos(a2)*r)} ${f1(y+Math.sin(a2)*r)}`;}return`<g transform="rotate(${rot} ${x} ${y})"><path d="${d}z" fill="${c}" stroke="#3A2A12" stroke-width=".6"/><circle cx="${x}" cy="${y}" r="${r*.62}" fill="none" stroke="#3A2A12" stroke-opacity=".5" stroke-width="${r*.2}"/><circle cx="${x}" cy="${y}" r="3" fill="#A51E36"/></g>`;};
  return `<svg viewBox="0 0 360 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="ca1" cx=".6" cy=".4" r=".8"><stop offset="0" stop-color="#8E959D"/><stop offset="1" stop-color="#23282E"/></radialGradient></defs><rect width="360" height="180" fill="url(#ca1)"/>${Array.from({length:14},(_,i)=>`<path d="M${i*30-60} 0 l120 180" stroke="#fff" stroke-opacity=".08" stroke-width="9"/>`).join('')}${gear(120,90,46,28,'#D8B878',8)}${gear(200,60,26,18,'#C9A96A',-4)}${gear(250,120,34,22,'#B8914E',12)}${gear(60,40,20,14,'#D8B878',0)}<circle cx="310" cy="50" r="28" fill="none" stroke="#E6CF9C" stroke-width="3"/><path d="M310 22v56M282 50h56" stroke="#E6CF9C" stroke-width="1.6"/></svg>`;}
 if(kind==='archives')return `<svg viewBox="0 0 360 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="360" height="180" fill="#C8B38A"/><rect x="18" y="14" width="200" height="160" fill="#E8DCC0" transform="rotate(-4 118 94)"/>${Array.from({length:9},(_,i)=>`<path d="M36 ${40+i*14} q40 -4 80 0 t80 0" stroke="#6B5A3A" stroke-opacity=".45" fill="none" transform="rotate(-4 118 94)"/>`).join('')}<text x="40" y="32" font-family="Playfair Display,Georgia,serif" font-size="14" fill="#5A4726" transform="rotate(-4 118 94)">Superman · 1963</text><circle cx="300" cy="150" r="46" fill="none" stroke="#8C7550" stroke-opacity=".35" stroke-width="6"/></svg>`;
 return `<svg viewBox="0 0 360 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="at1" cx=".3" cy=".4" r=".9"><stop offset="0" stop-color="#2C4468"/><stop offset="1" stop-color="#0B1321"/></radialGradient></defs><rect width="360" height="180" fill="url(#at1)"/><rect x="0" y="130" width="360" height="50" fill="#5A3A22"/><rect x="0" y="126" width="360" height="6" fill="#7A5232"/><circle cx="110" cy="80" r="44" fill="#0B1321" stroke="#C9A96A" stroke-width="5"/><circle cx="110" cy="80" r="36" fill="#1A2A44" opacity=".8"/><path d="M150 110 l60 40" stroke="#C9A96A" stroke-width="8" stroke-linecap="round"/><path d="M230 120 l70 -60 M244 124 l70 -60" stroke="#C0C6CE" stroke-width="3" stroke-linecap="round"/><circle cx="320" cy="40" r="8" fill="#E8D3A2" opacity=".5"/></svg>`;
}
function emptyArt(kind){
 const g='#C9A96A';
 if(kind==='wish')return `<svg class="ill" viewBox="0 0 150 150" aria-hidden="true"><circle cx="75" cy="75" r="62" fill="${g}" fill-opacity=".06" stroke="${g}" stroke-opacity=".25"/><path d="M75 112s-30-18-37-36c-4-12 3-26 17-26 8 0 13 4 20 12 7-8 12-12 20-12 14 0 21 14 17 26-7 18-37 36-37 36z" fill="none" stroke="${g}" stroke-width="2"/><path d="M60 72h30M75 57v30" stroke="${g}" stroke-width="1.4" stroke-dasharray="3 3" opacity=".6"/></svg>`;
 if(kind==='search')return `<svg class="ill" viewBox="0 0 150 150" aria-hidden="true"><circle cx="75" cy="75" r="62" fill="${g}" fill-opacity=".06" stroke="${g}" stroke-opacity=".25"/><circle cx="68" cy="68" r="26" fill="none" stroke="${g}" stroke-width="2"/><path d="M87 87l20 20" stroke="${g}" stroke-width="3" stroke-linecap="round"/><circle cx="68" cy="68" r="14" fill="none" stroke="${g}" stroke-opacity=".5"/><path d="M68 58v10l6 4" stroke="${g}" stroke-width="1.6" stroke-linecap="round"/></svg>`;
 if(kind==='notif')return `<svg class="ill" viewBox="0 0 150 150" aria-hidden="true"><circle cx="75" cy="75" r="62" fill="${g}" fill-opacity=".06" stroke="${g}" stroke-opacity=".25"/><path d="M52 92V72a23 23 0 0 1 46 0v20l6 8H46z" fill="none" stroke="${g}" stroke-width="2"/><path d="M68 106a7 7 0 0 0 14 0" fill="none" stroke="${g}" stroke-width="2"/><text x="100" y="54" font-family="Playfair Display,Georgia,serif" font-size="16" fill="${g}" opacity=".7">z</text><text x="110" y="42" font-family="Playfair Display,Georgia,serif" font-size="11" fill="${g}" opacity=".5">z</text></svg>`;
 if(kind==='bag')return `<svg class="ill" viewBox="0 0 150 150" aria-hidden="true"><circle cx="75" cy="75" r="62" fill="${g}" fill-opacity=".06" stroke="${g}" stroke-opacity=".25"/><path d="M48 62h54l-5 46H53z" fill="none" stroke="${g}" stroke-width="2"/><path d="M62 62v-6a13 13 0 0 1 26 0v6" fill="none" stroke="${g}" stroke-width="2"/></svg>`;
 return `<svg class="ill" viewBox="0 0 150 150" aria-hidden="true"><circle cx="75" cy="75" r="62" fill="${g}" fill-opacity=".06" stroke="${g}" stroke-opacity=".25"/><circle cx="75" cy="75" r="24" fill="none" stroke="${g}" stroke-width="2"/><path d="M63 50l3-14h18l3 14M63 100l3 14h18l3-14" fill="none" stroke="${g}" stroke-width="2"/></svg>`;
}

/* real QR code (byte mode, versions 2-5, EC level L, mask 0) */
function qrMatrix(text){
 const by=[...new TextEncoder().encode(text)];const V=[[2,44,10,18],[3,70,15,22],[4,100,20,26],[5,134,26,30]];let ver,tot,ec,al;
 for(const v of V){if(by.length<=v[1]-v[2]-2){[ver,tot,ec,al]=v;break;}}if(!ver)return null;
 const dc=tot-ec,n=17+4*ver,bits=[],put=(v,k)=>{for(let i=k-1;i>=0;i--)bits.push((v>>>i)&1);};
 put(4,4);put(by.length,8);by.forEach(b=>put(b,8));put(0,Math.min(4,dc*8-bits.length));while(bits.length%8)bits.push(0);
 const data=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=b<<1|bits[i+j];data.push(b);}
 for(let p=0xEC;data.length<dc;p^=0xEC^0x11)data.push(p);
 const mul=(x,y)=>{let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x;}return z;};
 const dv=new Array(ec).fill(0);dv[ec-1]=1;let root=1;for(let i=0;i<ec;i++){for(let j=0;j<ec;j++){dv[j]=mul(dv[j],root);if(j+1<ec)dv[j]^=dv[j+1];}root=mul(root,2);}
 const rem=new Array(ec).fill(0);data.forEach(b=>{const f=b^rem.shift();rem.push(0);dv.forEach((c,i)=>rem[i]^=mul(c,f));});const cw=data.concat(rem);
 const M=[...Array(n)].map(()=>new Array(n).fill(false)),F=[...Array(n)].map(()=>new Array(n).fill(false));const set=(x,y,d)=>{M[y][x]=d;F[y][x]=true;};
 for(let i=0;i<n;i++){set(6,i,i%2===0);set(i,6,i%2===0);}
 const fin=(x,y)=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=n||Y>=n)continue;const d=Math.max(Math.abs(dx),Math.abs(dy));set(X,Y,d!==2&&d!==4);}};
 fin(3,3);fin(n-4,3);fin(3,n-4);
 for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(al+dx,al+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);
 const fd=8;let r=fd;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const fb=((fd<<10)|r)^0x5412,gb=i=>((fb>>>i)&1)===1;
 for(let i=0;i<=5;i++)set(8,i,gb(i));set(8,7,gb(6));set(8,8,gb(7));set(7,8,gb(8));for(let i=9;i<15;i++)set(14-i,8,gb(i));
 for(let i=0;i<8;i++)set(n-1-i,8,gb(i));for(let i=8;i<15;i++)set(8,n-15+i,gb(i));set(8,n-8,true);
 let k=0;for(let right=n-1;right>=1;right-=2){if(right===6)right=5;for(let vt=0;vt<n;vt++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)===0,y=up?n-1-vt:vt;if(!F[y][x]&&k<cw.length*8){M[y][x]=((cw[k>>>3]>>>(7-(k&7)))&1)===1;k++;}}}
 for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(!F[y][x]&&(x+y)%2===0)M[y][x]=!M[y][x];
 return M;}
function qrSvg(text,px){const M=qrMatrix(text)||qrMatrix('YEMA');const n=M.length;let d='';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(M[y][x])d+=`M${x} ${y}h1v1h-1z`;
 return `<svg viewBox="-4 -4 ${n+8} ${n+8}" width="${px}" height="${px}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-label="QR code"><rect x="-4" y="-4" width="${n+8}" height="${n+8}" fill="#fff"/><path d="${d}" fill="#13223A"/></svg>`;}
const certURL=serial=>`https://moksen2001.github.io/elmokhtar-cv/yema-demo/?c=${encodeURIComponent(serial)}`;

const ic=(n,cls='')=>`<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IP[n]||''}</svg>`;

/* i18n */
let LANG='fr';
const L=(fr,en)=>LANG==='en'&&en!=null?en:fr;
const tx=o=>o==null?'':(typeof o==='string'?o:(o[LANG]||o.fr));
const eur=n=>new Intl.NumberFormat(LANG==='fr'?'fr-FR':'en-GB',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n).replace(/ /g,' ');
const fdate=(d,opt)=>new Intl.DateTimeFormat(LANG==='fr'?'fr-FR':'en-GB',opt||{day:'numeric',month:'long',year:'numeric'}).format(typeof d==='string'?new Date(d):d);
const fmon=d=>fdate(d,{month:'short',year:'numeric'});
const iso=d=>new Date(d).toISOString().slice(0,10);
const ago=ts=>{const m=Math.round((Date.now()-ts)/60000);if(m<1)return L('À l’instant','Just now');if(m<60)return L(`Il y a ${m} min`,`${m} min ago`);const h=Math.round(m/60);if(h<24)return L(`Il y a ${h} h`,`${h}h ago`);const d=Math.round(h/24);if(d===1)return L('Hier','Yesterday');if(d<7)return L(`Il y a ${d} jours`,`${d} days ago`);return L(`Il y a ${Math.round(d/7)} sem.`,`${Math.round(d/7)} wk ago`);};

/* ---------- catalogue (real YEMA products, photos © YEMA) ---------- */
const W=id=>WATCHES.find(w=>w.id===id)||WATCHES[0];
const COLS=['Superman','Rallygraf','Flygraf','Navygraf','Wristmaster','Skin Diver'];
const VIEWN={f:{fr:'Face',en:'Front'},F:{fr:'Face · autre bracelet',en:'Front · other strap'},q:{fr:'Trois-quarts',en:'Three-quarter'},Q:{fr:'Trois-quarts',en:'Three-quarter'},b:{fr:'Fond saphir',en:'Caseback'},d:{fr:'Cadran',en:'Dial'},s:{fr:'Profil',en:'Profile'}};
const STYLES=[['plongee',{fr:'Plongée',en:'Diver'}],['chrono',{fr:'Chronographe',en:'Chronograph'}],['pilote',{fr:'Pilote',en:'Pilot'}],['vintage',{fr:'Vintage',en:'Vintage'}],['moderne',{fr:'Moderne',en:'Modern'}],['manufacture',{fr:'Manufacture',en:'In-house'}]];
const src=(w,i,full)=>`img/${full?'':'t/'}${w.slug}-${(i||0)+1}.webp`;
/* a photo in a fixed 3:4 box with a skeleton shimmer until it has loaded */
const pic=(w,i,o)=>{o=o||{};return `<span class="ph ${o.cls||''}"><img src="${src(w,i,o.full)}" alt="${o.alt===false?'':esc(w.n)}" loading="${o.eager?'eager':'lazy'}" decoding="async" draggable="false"${o.fp?' fetchpriority="high"':''}></span>`;};
const defO=w=>({size:0,strap:0,cond:0});
const opt=(w,k)=>w.opts.find(o=>o.k===k);
/* gallery images for a chosen bracelet (falls back to all views) */
function views(w,o){const st=opt(w,'strap');if(st&&st.img)return st.img[(o&&o.strap)||0];return Array.from({length:w.n_img},(_,i)=>i);}
const frontI=(w,o)=>views(w,o)[0];
const priceOf=(w,o)=>{const c=opt(w,'cond');return Math.round(w.p*((c&&o&&o.cond===1)?.85:1));};
const optLine=(w,o)=>{o=o||defO(w);return w.opts.map(op=>{const v=op.v[o[op.k]||0];return v?(LANG==='en'?v[1]:v[0]):'';}).filter(Boolean).join(' · ');};
const moveTxt=w=>w.mv==='manu'?(w.cal?L(`Manufacture ${w.cal}`,`In-house ${w.cal}`):L('Manufacture','In-house')):w.mv==='auto'?(w.cal||L('Automatique','Automatic')):(w.cal==='Seiko VK61'?L('Seiko VK61 hybride','Seiko VK61 hybrid'):w.cal==='Méca-quartz'?L('Méca-quartz','Meca-quartz'):'Quartz');
const typeTxt=w=>w.mv==='quartz'?(w.cal==='Quartz'?'Quartz':L('Méca-quartz','Meca-quartz')):L('Automatique','Automatic');
const sizeTxt=w=>{const s=opt(w,'size');return s.v.map(v=>v[0]).join(' / ');};
const maxQty=w=>(w.ltd||w.id==='sbz')?1:3;
const tagOf=w=>w.ltd?L(`Édition limitée ${w.ltd} ex.`,`Limited · ${w.ltd} pcs`):w.pre?L('Précommande','Pre-order'):w.id==='sbz'?L('Série de 50','Batch of 50'):w.mv==='manu'?L('Manufacture','In-house'):'';

/* ---------- state ---------- */
const KEY='yema-demo-v3';
const now=Date.now(), H=3600e3, D=24*H;
let NOSAVE=false, VER=1, LASTPDP=null;
function defState(){return{
 v:3,lang:null,onboarded:false,
 user:{first:'Alexandre',last:'Dubois',email:'alexandre.d@example.com',phone:'+33 6 12 34 56 42'},
 consent:null,
 prefs:{cm:17,cols:['Superman','Navygraf'],budget:[900,3500],styles:['plongee','vintage']},
 cat:{col:'',sort:'reco',sizes:[],mv:[],q:''},
 wish:[{wid:'fpi',o:{size:0,strap:1,cond:0},at:now-18*D}],
 cart:[],orders:[],
 owned:[
  {oid:'o1',wid:'sh',o:{size:0,strap:0,cond:0},serial:'YM-8492-XTQ',date:'2024-10-14',dealer:{fr:'Boutique YEMA Paris (illustratif)',en:'YEMA Paris boutique (illustrative)'},wEnd:'2026-10-14',price:1004,
   hist:[{t:{fr:'Entretien de routine',en:'Routine service'},d:'2025-11-18',x:{fr:'Contrôle de la marche, test d’étanchéité et nettoyage du bracelet.',en:'Rate check, water-resistance test and bracelet cleaning.'}},{t:{fr:'Achat',en:'Purchase'},d:'2024-10-14',x:{fr:'Montre enregistrée avec sa garantie internationale de 2 ans.',en:'Watch registered with its 2-year international warranty.'}}],
   notes:{fr:'Offerte pour mes 36 ans. Portée surtout le week-end.',en:'A gift for my 36th birthday. Mostly worn at weekends.'}},
  {oid:'o2',wid:'rpa',o:{size:0,strap:0,cond:0},serial:'YM-3317-RPA',date:'2025-01-20',dealer:{fr:'Revendeur agréé (illustratif)',en:'Authorised dealer (illustrative)'},wEnd:'2027-01-20',price:450,
   hist:[{t:{fr:'Achat',en:'Purchase'},d:'2025-01-20',x:{fr:'Enregistrée via la carte de garantie.',en:'Registered via the warranty card.'}}],notes:''}
 ],
 notifs:[
  {id:'n1',k:'launch',ts:now-40*60e3,read:false,to:['pdp',{id:'nme'}],t:{fr:'Navygraf Meteorite CMM.10',en:'Navygraf Meteorite CMM.10'},b:{fr:'Édition limitée à 150 exemplaires numérotés, cadran en météorite Muonionalusta.',en:'Limited to 150 numbered pieces, Muonionalusta meteorite dial.'}},
  {id:'n2',k:'service',ts:now-5*H,read:false,to:['watch',{oid:'o1'}],t:{fr:'Garantie bientôt échue',en:'Warranty ending soon'},b:{fr:'La garantie de votre Superman Heritage se termine le 14 octobre. Pensez à un contrôle.',en:'Your Superman Heritage warranty ends on 14 October. Consider a check-up.'}},
  {id:'n3',k:'event',ts:now-26*H,read:true,to:['club',{seg:'events'}],t:{fr:'Invitation · Exposition Héritage',en:'Invitation · Heritage Exhibition'},b:{fr:'Vous êtes convié(e) à l’exposition du Club à Paris (événement fictif).',en:'You are invited to the Club exhibition in Paris (fictional event).'}},
  {id:'n4',k:'club',ts:now-8*D,read:true,to:['club',{}],t:{fr:'Actualité du Club',en:'Club news'},b:{fr:'Précommandes ouvertes pour la Rallygraf Alpine Cup Series.',en:'Pre-orders open for the Rallygraf Alpine Cup Series.'}}
 ],
 sec:{twofa:true,faceid:true,bioOpen:false},
 addresses:[{id:'a1',n:{fr:'Domicile',en:'Home'},l:'24 rue des Horlogers',c:'75009 Paris',def:true}],
 bookings:{},alerts:{},appt:null,chat:[],
 steps:[0,0,0,0,0,0],pushed:false,geo:null,seenSt:[]
};}
function load(){let s=null;try{const raw=localStorage.getItem(KEY);if(raw)s=JSON.parse(raw);}catch(e){}const d=defState();if(!s||s.v!==3)return d;return Object.assign(d,s);}
function save(){VER++;if(NOSAVE)return;try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
let S=load();
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};

/* recommendation from the onboarding preferences */
function score(w){const p=S.prefs;let s=0;const r=[];
 if(p.cols&&p.cols.includes(w.col)){s+=3;r.push(w.col);}
 if(p.budget){if(w.p>=p.budget[0]&&w.p<=p.budget[1]){s+=2;r.push(L('dans votre budget','in budget'));}else s-=2;}
 (p.styles||[]).forEach(st=>{if(w.st.includes(st)){s+=1;}});
 if(w.ltd)s+=.5;return{s,r};}
const recos=()=>WATCHES.map(w=>({w,...score(w)})).sort((a,b)=>b.s-a.s);
