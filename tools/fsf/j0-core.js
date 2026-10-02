/* ================= core: helpers, icons, brand, i18n, state ================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p||8)}catch(e){}};
const IS_PHONE=()=>window.matchMedia('(max-width:500px)').matches;
const STANDALONE=!!((window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone);
const f1=n=>Math.round(n*10)/10;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};

/* ---------- icon set (own glyphs, 24px grid, stroke) ---------- */
const IP={
back:'<path d="M15 5l-7 7 7 7"/>',chev:'<path d="M9 5l7 7-7 7"/>',down:'<path d="M5 9l7 7 7-7"/>',close:'<path d="M6 6l12 12M18 6 6 18"/>',
arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
home:'<path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z"/>',
match:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.6l3.4 2.5-1.3 4h-4.2l-1.3-4zM12 3.5v4.1M15.4 10.1l4.2-1.4M14.1 14.1l2.6 3.6M9.9 14.1l-2.6 3.6M8.6 10.1 4.4 8.7"/>',
stories:'<circle cx="12" cy="12" r="8.5" stroke-dasharray="3.2 2.2"/><path d="M10 8.6v6.8l5.4-3.4z" fill="currentColor"/>',
team:'<path d="M8.5 4 4 6.5l1.6 4.2L7.5 10v10h9V10l1.9.7L20 6.5 15.5 4c-.6 1.7-1.9 2.6-3.5 2.6S9.1 5.7 8.5 4z"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6"/>',
bell:'<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
belloff:'<path d="M6 16v-5a6 6 0 0 1 9.4-4.9M18 11v5l1.5 2H8"/><path d="M10 20.5a2 2 0 0 0 4 0M3.5 3.5l17 17"/>',
bellon:'<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z" fill="currentColor"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
share:'<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
ticket:'<path d="M3.5 8.5V6h17v2.5a2.5 2.5 0 0 0 0 5V18h-17v-4.5a2.5 2.5 0 0 0 0-5z"/><path d="M14.5 6.5v11" stroke-dasharray="1.6 2"/>',
bag:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
star:'<path fill="currentColor" stroke="none" d="M12 3.2l2.6 5.5 6 .7-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.4l6-.7z"/>',
card:'<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/>',
qr:'<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2M16 16h2v2"/>',
pin:'<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>',
globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
cal:'<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
play:'<path d="M8 5v14l11-7z" fill="currentColor"/>',pause:'<path d="M8 5v14M16 5v14" stroke-width="3"/>',
next:'<path d="M5 5v14l9-7zM18 5v14" fill="currentColor"/>',
whistle:'<path d="M3.5 10.5h9l6-3v8a4.5 4.5 0 0 1-4.5 4.5H9a5.5 5.5 0 0 1-5.5-5.5z"/><circle cx="9" cy="15" r="1.6"/><path d="M12.5 10.5V7"/>',
sub:'<path d="M7 4v12M3.5 12.5 7 16l3.5-3.5"/><path d="M17 20V8M13.5 11.5 17 8l3.5 3.5"/>',
ycard:'<rect x="7" y="4" width="10" height="16" rx="1.6" fill="#FDEF42" stroke="none"/>',
rcard:'<rect x="7" y="4" width="10" height="16" rx="1.6" fill="#E31B23" stroke="none"/>',
ball:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.6l3.4 2.5-1.3 4h-4.2l-1.3-4zM12 3.5v4.1M15.4 10.1l4.2-1.4M14.1 14.1l2.6 3.6M9.9 14.1l-2.6 3.6M8.6 10.1 4.4 8.7"/>',
trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5v1.5A3 3 0 0 0 8 10.4M16 6h3.5v1.5a3 3 0 0 1-3.5 2.9M12 13v4M8.5 20h7M9.5 17h5v3h-5z"/>',
info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
lock:'<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
download:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
vote:'<path d="M4 20h16M6 20V11h3v9M10.5 20V6h3v14M15 20v-6h3v6"/>',
quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.3 9.4a2.8 2.8 0 1 1 3.9 2.6c-.8.4-1.2 1-1.2 1.9v.6M12 17.2v.1"/>',
target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
stadium:'<ellipse cx="12" cy="9" rx="9" ry="4"/><path d="M3 9v6c0 2.2 4 4 9 4s9-1.8 9-4V9"/><ellipse cx="12" cy="9" rx="4.5" ry="1.8"/>',
video:'<rect x="3" y="6.5" width="12.5" height="11" rx="2"/><path d="M15.5 10.5 21 7.5v9l-5.5-3"/>',
image:'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5L6 19.5"/>',
heart:'<path d="M12 20s-7.5-4.6-9.2-9.1C1.7 7.9 3.6 4.5 7 4.5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.4 0 5.3 3.4 4.2 6.4C19.5 15.4 12 20 12 20z"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.5 7.5 0 0 0 7 6.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.5 7.5 0 0 0 2.6-1.5l2.4 1 2-3.4z"/>',
lang:'<path d="M4 5h8M8 3v2M6 5c0 4 2.5 7 6 8M10 5c-.5 3.5-3 6.5-6 8"/><path d="M13 21l4-10 4 10M14.5 17.5h5"/>',
reset:'<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 3.5v5h5"/>',
phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>',
wallet:'<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="4" y="8" width="16" height="11" rx="2"/><path d="M16 13.5h2"/>',
truck:'<path d="M3 6h11v10H3zM14 9.5h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
sparkle:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
flame:'<path d="M12 21c-4 0-6.5-2.7-6.5-6.2 0-3.6 2.7-5.3 3.6-8.8 2.4 1.4 3.2 3.4 3.2 5 1-.6 1.6-1.6 1.8-3 2.4 1.9 4.4 4.3 4.4 7 0 3.4-2.5 6-6.5 6z"/>',
crowd:'<circle cx="7" cy="8.5" r="2.5"/><circle cx="17" cy="8.5" r="2.5"/><circle cx="12" cy="7" r="2.8"/><path d="M2.5 19c.6-3 2.3-4.8 4.5-4.8M21.5 19c-.6-3-2.3-4.8-4.5-4.8M6.5 20c.7-3.7 2.9-5.8 5.5-5.8s4.8 2.1 5.5 5.8"/>',
jersey:'<path d="M8.5 4 4 6.5l1.6 4.2L7.5 10v10h9V10l1.9.7L20 6.5 15.5 4c-.6 1.7-1.9 2.6-3.5 2.6S9.1 5.7 8.5 4z"/>',
scarf:'<path d="M6 3h5v9l-3 9H4l2-9zM13 3h5l2 9-2 9h-4l-3-9z"/><path d="M6 7h5M13 7h5"/>',
cap:'<path d="M4 15.5a8 8 0 0 1 16 0z"/><path d="M12 7.5V6M2.5 15.5h19"/>',
bolt:'<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
rotate:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4.5V11h-6.5"/>',
eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
mobile:'<rect x="6.5" y="2.5" width="11" height="19" rx="2.2"/><path d="M10 6h4M9.5 14.5l2 2 3.5-4"/>',
wave:'<path d="M3 13c2.2 0 2.2-3 4.5-3s2.2 3 4.5 3 2.2-3 4.5-3 2.2 3 4.5 3"/><path d="M3 17c2.2 0 2.2-3 4.5-3s2.2 3 4.5 3 2.2-3 4.5-3 2.2 3 4.5 3" opacity=".5"/>',
cardpay:'<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 9.5h18"/><rect x="6" y="13" width="4" height="2.5" rx=".6"/>',
/* platform glyphs (own simplified drawings) */
p_web:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
p_ig:'<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>',
p_x:'<path d="M4.5 4h4.2l10.8 16h-4.2zM19 4l-6 6.8M5 20l6-6.8"/>',
p_yt:'<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9v6l5.2-3z" fill="currentColor"/>',
p_tt:'<path d="M14 3.5v11.2a3.8 3.8 0 1 1-3.8-3.8"/><path d="M14 3.5c.4 2.6 2.3 4.3 5 4.5"/>',
p_fb:'<path d="M14.5 21v-7.5h2.7l.4-3.1h-3.1V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.3c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.2H8.6v3.1h2.7V21"/>'
};
const ic=(n,cls='')=>`<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IP[n]||''}</svg>`;

/* ---------- brand: geometric lion (own design, not the FSF crest) ---------- */
function lionSVG(o){o=o||{};const C=[50,51],N=12;const P=(r,a)=>[C[0]+r*Math.cos(a),C[1]+r*Math.sin(a)];
 const mix=t=>{const A=[255,244,120],B=[176,150,10];return `rgb(${A.map((x,i)=>Math.round(B[i]+(x-B[i])*t)).join(',')})`;};
 const fl=ang=>clamp(.5+.5*(Math.cos(ang)*-.35+Math.sin(ang)*-1)/1.06,0,1);
 let m='';for(let i=0;i<N;i++){const a=(i/N)*Math.PI*2-Math.PI/2,da=Math.PI/N;const lo=43+3.5*Math.abs(Math.cos(a))+(Math.sin(a)>.5?3.5:0);const o1=P(lo,a),iL=P(31,a-da),iR=P(31,a+da),c=P(14,a);
  m+=`<g class="ray" style="--i:${i}"><path d="M${f1(iL[0])} ${f1(iL[1])}L${f1(o1[0])} ${f1(o1[1])}L${f1(c[0])} ${f1(c[1])}z" fill="${mix(fl(a-da*.6)*.85+.15)}"/><path d="M${f1(o1[0])} ${f1(o1[1])}L${f1(iR[0])} ${f1(iR[1])}L${f1(c[0])} ${f1(c[1])}z" fill="${mix(fl(a+da*.6)*.7)}"/></g>`;}
 const y='#FDEF42';
 return `<svg class="lion" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="mane">${m}</g><g class="face"><path d="M32.5 29.5 36 18.5l8 6zM67.5 29.5 64 18.5l-8 6z" fill="#103A22"/><path d="M50 21l14.5 4.5L71 45l-7 22-14 12-14-12-7-22 6.5-19.5z" fill="#06140C"/><path d="M50 21l14.5 4.5L71 45l-21 4z" fill="#0F3420"/><path d="M50 49l21-4-7 22-14 12z" fill="#09241A"/><path d="M29 45l7 22 14 12V49z" fill="#0C2B19"/><path d="M50 21l-14.5 4.5L29 45l21 4z" fill="#12402A"/><path class="eyes" d="M35 44l11-4 .6 5.4-7.4 2.4zM65 44l-11-4-.6 5.4 7.4 2.4z" fill="${y}"/><path d="M42.5 55.5h15L50 63.5z" fill="${y}"/><path d="M50 63.5v4M50 67.5 43 72M50 67.5 57 72" stroke="${y}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g><path class="star" d="M50 26l1.75 3.7 4 .46-2.97 2.73.8 3.96L50 34.85l-3.58 2 .8-3.96-2.97-2.73 4-.46z" fill="#1DB86A"/></svg>`;}
const wordmark=(cls='')=>`<span class="wm ${cls}" aria-label="Gaïndé">GA<span class="di">I<i></i><i></i></span>ND<span class="ea">E<i></i></span></span>`;

/* ---------- flags (simplified, public-domain national flags) ---------- */
const FLAG={
SEN:'<rect width="30" height="30" fill="#FDEF42"/><rect width="10" height="30" fill="#00853F"/><rect x="20" width="10" height="30" fill="#E31B23"/><path d="M15 10.6l1.3 2.8 3 .3-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.3z" fill="#00853F"/>',
COM:'<rect width="30" height="7.5" fill="#FFC61E"/><rect y="7.5" width="30" height="7.5" fill="#fff"/><rect y="15" width="30" height="7.5" fill="#CE1126"/><rect y="22.5" width="30" height="7.5" fill="#3A75C4"/><path d="M0 0l15 15L0 30z" fill="#3D8E33"/><circle cx="6" cy="15" r="4" fill="#fff"/><circle cx="7.6" cy="15" r="3.6" fill="#3D8E33"/>',
MOZ:'<rect width="30" height="10" fill="#009A44"/><rect y="10" width="30" height="10" fill="#111"/><rect y="20" width="30" height="10" fill="#FCE100"/><rect y="9" width="30" height="1.4" fill="#fff"/><rect y="19.6" width="30" height="1.4" fill="#fff"/><path d="M0 0l15 15L0 30z" fill="#D21034"/>',
ETH:'<rect width="30" height="10" fill="#078930"/><rect y="10" width="30" height="10" fill="#FCDD09"/><rect y="20" width="30" height="10" fill="#DA121A"/><circle cx="15" cy="15" r="6" fill="#0F47AF"/><path d="M15 10.5l1.1 3.3h3.4l-2.8 2 1.1 3.3-2.8-2.1-2.8 2.1 1.1-3.3-2.8-2h3.4z" fill="none" stroke="#FCDD09" stroke-width=".8"/>',
SUD:'<rect width="30" height="10" fill="#D21034"/><rect y="10" width="30" height="10" fill="#fff"/><rect y="20" width="30" height="10" fill="#111"/><path d="M0 0l12 15L0 30z" fill="#007229"/>',
IRQ:'<rect width="30" height="10" fill="#CE1126"/><rect y="10" width="30" height="10" fill="#fff"/><rect y="20" width="30" height="10" fill="#111"/><path d="M9 17.5h12" stroke="#007A3D" stroke-width="2"/>',
FRA:'<rect width="10" height="30" fill="#0055A4"/><rect x="10" width="10" height="30" fill="#fff"/><rect x="20" width="10" height="30" fill="#EF4135"/>',
NOR:'<rect width="30" height="30" fill="#BA0C2F"/><path d="M0 15h30M11 0v30" stroke="#fff" stroke-width="7"/><path d="M0 15h30M11 0v30" stroke="#00205B" stroke-width="3.6"/>',
BEL:'<rect width="10" height="30" fill="#111"/><rect x="10" width="10" height="30" fill="#FDDA24"/><rect x="20" width="10" height="30" fill="#EF3340"/>',
PER:'<rect width="10" height="30" fill="#D91023"/><rect x="10" width="10" height="30" fill="#fff"/><rect x="20" width="10" height="30" fill="#D91023"/>',
GAM:'<rect width="30" height="10" fill="#CE1126"/><rect y="10" width="30" height="10" fill="#fff"/><rect y="11.5" width="30" height="7" fill="#0C1C8C"/><rect y="20" width="30" height="10" fill="#3A7728"/>',
MAR:'<rect width="30" height="30" fill="#C1272D"/><path d="M15 9.5l1.6 5 5.3 0-4.3 3.1 1.6 5-4.2-3.1-4.2 3.1 1.6-5-4.3-3.1 5.3 0z" fill="none" stroke="#006233" stroke-width="1.2"/>',
TUN:'<rect width="30" height="30" fill="#E70013"/><circle cx="15" cy="15" r="7" fill="#fff"/><circle cx="15.8" cy="15" r="4.6" fill="#E70013"/><circle cx="17" cy="15" r="3.8" fill="#fff"/><path d="M15.4 15l3.2-1.1-2 2.7v-3.3l2 2.7z" fill="#E70013"/>',
COD:'<rect width="30" height="30" fill="#007FFF"/><path d="M-2 26 26-2h6v4L2 32h-4z" fill="#F7D618"/><path d="M-2 28 28-2h3L1 32h-3z" fill="#CE1021"/><path d="M6.5 4.5l1 2.6 2.7.1-2.1 1.7.8 2.6-2.4-1.5-2.3 1.5.8-2.6-2.2-1.7 2.8-.1z" fill="#F7D618"/>',
NGA:'<rect width="10" height="30" fill="#008751"/><rect x="10" width="10" height="30" fill="#fff"/><rect x="20" width="10" height="30" fill="#008751"/>'
};
const flag=(c,px)=>`<span class="flag" style="width:${px||28}px;height:${px||28}px">${FLAG[c]?`<svg viewBox="0 0 30 30">${FLAG[c]}</svg>`:''}</span>`;

/* ---------- i18n ---------- */
let LANG='fr';
const L=(fr,en)=>LANG==='en'&&en!=null?en:fr;
const tx=o=>o==null?'':(typeof o==='string'?o:(o[LANG]||o.fr));
const LOC=()=>LANG==='fr'?'fr-FR':'en-GB';
const fdate=(d,opt)=>new Intl.DateTimeFormat(LOC(),Object.assign({timeZone:'Africa/Dakar'},opt||{day:'numeric',month:'long',year:'numeric'})).format(typeof d==='string'?new Date(d):d);
const fday=d=>fdate(d,{weekday:'short',day:'numeric',month:'short'});
const ftime=d=>fdate(d,{hour:'2-digit',minute:'2-digit'});
const fcfa=n=>new Intl.NumberFormat(LOC()).format(n).replace(/ | /g,' ')+' FCFA';
const eurOf=n=>new Intl.NumberFormat(LOC(),{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n/655.957);
const nfmt=n=>new Intl.NumberFormat(LOC()).format(n).replace(/ /g,' ');
const ago=ts=>{const m=Math.round((Date.now()-ts)/60000);if(m<1)return L('À l’instant','Just now');if(m<60)return L(`Il y a ${m} min`,`${m} min ago`);const h=Math.round(m/60);if(h<24)return L(`Il y a ${h} h`,`${h}h ago`);const d=Math.round(h/24);if(d===1)return L('Hier','Yesterday');if(d<7)return L(`Il y a ${d} jours`,`${d} days ago`);return fdate(ts,{day:'numeric',month:'short'});};
const greet=()=>{const h=new Date().getHours();return h<5||h>=18?L('Bonsoir','Good evening'):h<12?L('Bonjour','Good morning'):L('Bon après-midi','Good afternoon');};

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
function qrSvg(text,px,fg){const M=qrMatrix(text)||qrMatrix('GAINDE');const n=M.length;let d='';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(M[y][x])d+=`M${x} ${y}h1v1h-1z`;
 return `<svg class="qr" viewBox="-3 -3 ${n+6} ${n+6}" width="${px}" height="${px}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect x="-3" y="-3" width="${n+6}" height="${n+6}" fill="#fff"/><path d="${d}" fill="${fg||'#06140C'}"/></svg>`;}
const DEMO_URL=c=>`https://moksen2001.github.io/elmokhtar-cv/fsf-demo/?v=${encodeURIComponent(c)}`;

/* ---------- state ---------- */
const KEY='gainde-v1';
let NOSAVE=false,VER=1;
function defState(){return{
 v:1,lang:null,onboarded:false,
 user:{first:'Awa',last:'Sarr',city:'Paris',since:2019,no:'GDE-221-0412'},
 follow:['A','F','U17'],home:'diaspora',
 alerts:{'sen-com':true},
 pronos:{},votes:{},quiz:{best:null,last:null},
 tickets:[],orders:[],cart:[],
 pts:[{k:'join',p:120,ts:Date.now()-86400e3*40,l:{fr:'Bienvenue dans la Tanière',en:'Welcome to the Den'}}],
 seenSt:[],steps:[0,0,0,0,0,0],replay:{done:false}
};}
function load(){let s=null;try{const raw=localStorage.getItem(KEY);if(raw)s=JSON.parse(raw);}catch(e){}const d=defState();if(!s||s.v!==1)return d;return Object.assign(d,s);}
function save(){VER++;if(NOSAVE)return;try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
let S=load();

/* points & levels of the supporter card (demo) */
const LEVELS=[{n:{fr:'Lionceau',en:'Cub'},min:0},{n:{fr:'Lion',en:'Lion'},min:300},{n:{fr:'Grand Lion',en:'Great Lion'},min:700},{n:{fr:'Légende',en:'Legend'},min:1300}];
const ptsTotal=()=>S.pts.reduce((a,p)=>a+p.p,0);
const levelOf=p=>{let i=0;LEVELS.forEach((l,j)=>{if(p>=l.min)i=j;});return i;};
function earn(k,p,l,once){if(once&&S.pts.some(x=>x.k===k))return false;const before=levelOf(ptsTotal());S.pts.push({k,p,ts:Date.now(),l});save();
 const after=levelOf(ptsTotal());if(typeof toast==='function')toast(L(`+${p} points · Carte supporter`,`+${p} points · Supporter card`),{icon:'star'});
 if(after>before&&typeof levelUp==='function')setTimeout(()=>levelUp(after),900);return true;}
