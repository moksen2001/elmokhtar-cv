<script>
(function(){
'use strict';
/* ================================================================
   Yema Watch Club — prototype interactif (El Mokhtar Berrada, 2026)
   Un seul fichier : état, routeur, rendu SVG des montres, écrans.
   ================================================================ */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const buzz=(p)=>{try{navigator.vibrate&&navigator.vibrate(p||8)}catch(e){}};

/* ---------- icons ---------- */
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
move:'<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>'
};
const ic=(n,cls='')=>`<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IP[n]||''}</svg>`;

/* ---------- i18n ---------- */
let LANG='fr';
const L=(fr,en)=>LANG==='en'&&en!=null?en:fr;
const tx=o=>o==null?'':(typeof o==='string'?o:(o[LANG]||o.fr));
const nf=()=>new Intl.NumberFormat(LANG==='fr'?'fr-FR':'en-GB',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const eur=n=>nf().format(n).replace(/\u202f/g,'\u00a0');
const fdate=(d,opt)=>new Intl.DateTimeFormat(LANG==='fr'?'fr-FR':'en-GB',opt||{day:'numeric',month:'long',year:'numeric'}).format(typeof d==='string'?new Date(d):d);
const fmon=d=>fdate(d,{month:'short',year:'numeric'});
const ago=ts=>{const m=Math.round((Date.now()-ts)/60000);if(m<1)return L('À l’instant','Just now');if(m<60)return L(`Il y a ${m} min`,`${m} min ago`);const h=Math.round(m/60);if(h<24)return L(`Il y a ${h} h`,`${h}h ago`);const d=Math.round(h/24);if(d===1)return L('Hier','Yesterday');if(d<7)return L(`Il y a ${d} jours`,`${d} days ago`);const w=Math.round(d/7);return L(`Il y a ${w} sem.`,`${w} wk ago`);};

/* ---------- catalogue data (fictif) ---------- */
const DIALS={
 navy:{c:'#1B3563',hi:'#2F4F86',c2:'#0B1A36',ink:'#EDE8DC',fr:'Bleu marine',en:'Navy blue',p:0,sw:'#1B3563'},
 anthracite:{c:'#474C54',hi:'#61666F',c2:'#23262B',ink:'#EEEAE0',fr:'Anthracite',en:'Anthracite',p:0,sw:'#4A4E55'},
 sage:{c:'#7F9786',hi:'#9DB3A3',c2:'#4F6456',ink:'#F4F1E8',fr:'Vert sauge',en:'Sage green',p:40,sw:'#869C8C'},
 black:{c:'#1A1C21',hi:'#2C3038',c2:'#060708',ink:'#EEEAE0',fr:'Noir',en:'Black',p:0,sw:'#16181C'},
 glacier:{c:'#AFC6D2',hi:'#D4E3EA',c2:'#7292A3',ink:'#13202C',fr:'Bleu glacier',en:'Glacier blue',p:60,sw:'#A9C2CF'},
 cream:{c:'#EDE4CF',hi:'#FAF5E8',c2:'#C9B994',ink:'#1B1B1B',fr:'Crème vintage',en:'Vintage cream',p:40,sw:'#E6DCC3'},
 white:{c:'#F1EFE9',hi:'#FFFFFF',c2:'#CFCBC0',ink:'#16181C',fr:'Blanc opalin',en:'Opaline white',p:0,sw:'#F1EFE9'},
 blue:{c:'#2459AB',hi:'#3C74C8',c2:'#0D2A5E',ink:'#F0ECE2',fr:'Bleu roi',en:'Royal blue',p:0,sw:'#2459AB'},
 green:{c:'#2F4E3D',hi:'#426B55',c2:'#14261C',ink:'#EFE8D8',fr:'Vert forêt',en:'Forest green',p:0,sw:'#2F4E3D'},
 orange:{c:'#E48A2E',hi:'#F4A650',c2:'#A9561A',ink:'#16120C',fr:'Orange',en:'Orange',p:0,sw:'#E48A2E'}
};
const CASES={
 brushed:{st:['#F1F3F5','#B7BDC4','#7C838C','#D5D9DE'],edge:'#59616B',fr:'Acier brossé',en:'Brushed steel',p:0,sw:'linear-gradient(135deg,#E8EBEE,#9098A1)'},
 polished:{st:['#FFFFFF','#8F98A3','#E9ECF0','#5E6772'],edge:'#3E4650',fr:'Acier poli',en:'Polished steel',p:90,sw:'linear-gradient(135deg,#FFFFFF,#6E7782 55%,#E3E7EB)'},
 bronze:{st:['#F0C98E','#B07D43','#7C5226','#D8A866'],edge:'#5A3918',fr:'Bronze',en:'Bronze',p:290,sw:'linear-gradient(135deg,#E9C088,#8A5A2B)'}
};
const STRAPS={
 steel:{fr:'Acier',en:'Steel',p:0},
 leather:{fr:'Cuir vintage',en:'Vintage leather',p:-40},
 rubber:{fr:'Caoutchouc',en:'Rubber',p:-60},
 nato:{fr:'NATO',en:'NATO',p:-90}
};
const MOVES={
 yema3000:{fr:'Calibre Manufacture YEMA3000',en:'YEMA3000 Manufacture calibre',short:'YEMA3000',cat:'manu',res:'42 h',freq:'28 800 A/h'},
 eta7753:{fr:'ETA 7753 automatique',en:'ETA 7753 automatic',short:'ETA 7753',cat:'auto',res:'48 h',freq:'28 800 A/h'},
 sw200:{fr:'Sellita SW200-1 automatique',en:'Sellita SW200-1 automatic',short:'SW200-1',cat:'auto',res:'41 h',freq:'28 800 A/h'}
};
const COLS={
 superman:{n:'Superman',since:1963,d:{fr:'La plongeuse iconique, née en 1963.',en:'The iconic diver, born in 1963.'}},
 rallygraf:{n:'Rallygraf',since:1966,d:{fr:'Le chronographe des pilotes de rallye.',en:'The rally drivers’ chronograph.'}},
 flygraf:{n:'Flygraf',since:1969,d:{fr:'L’instrument des aviateurs.',en:'The aviators’ instrument.'}},
 navygraf:{n:'Navygraf',since:1968,d:{fr:'L’héritage de la Marine nationale.',en:'The French Navy heritage.'}}
};
const WATCHES=[
 {id:'sh',col:'superman',name:{fr:'Superman Heritage',en:'Superman Heritage'},type:'diver',dial:'navy',bezel:'navy',case:'brushed',strap:'steel',size:39,move:'yema3000',wr:300,price:1190,isNew:1,ltd:'1/500',ref:'YSH39-NB',tags:['plongeuse','vintage','automatique'],lume:'#EADCB8',sec:'#D4B36F',label:'SUPERMAN',label2:'300M · 1000FT',
  d:{fr:'L’édition anniversaire de la plongeuse de 1963 : lunette bleu marine verrouillable, calibre maison YEMA3000 et index vieillis. Série limitée à 500 pièces, en accès anticipé pour les membres VIP.',en:'The anniversary edition of the 1963 diver: lockable navy bezel, in-house YEMA3000 calibre and aged indices. Limited to 500 pieces, with early access for VIP members.'}},
 {id:'shsage',col:'superman',name:{fr:'Superman Heritage Sauge',en:'Superman Heritage Sage'},type:'diver',dial:'sage',bezel:'black',case:'brushed',strap:'rubber',size:39,move:'yema3000',wr:300,price:1240,tags:['plongeuse','moderne','automatique'],lume:'#F1EEE6',sec:'#E9E2CF',label:'SUPERMAN',label2:'300M · 1000FT',
  d:{fr:'Un cadran vert sauge velouté, un bracelet caoutchouc souple : la Superman version week-end.',en:'A velvety sage dial and a supple rubber strap: the weekend Superman.'}},
 {id:'s500',col:'superman',name:{fr:'Superman 500',en:'Superman 500'},type:'diver',dial:'black',bezel:'black',case:'brushed',strap:'steel',size:41,move:'yema3000',wr:500,price:1690,tags:['plongeuse','moderne','automatique'],lume:'#F1EEE6',sec:'#D4B36F',label:'SUPERMAN 500',label2:'500M · 1650FT',
  d:{fr:'La plus professionnelle des Superman : 500 m d’étanchéité, soupape à hélium et lunette céramique noire.',en:'The most professional Superman: 500 m water resistance, helium valve and black ceramic bezel.'}},
 {id:'sbronze',col:'superman',name:{fr:'Superman Bronze',en:'Superman Bronze'},type:'diver',dial:'green',bezel:'green',case:'bronze',strap:'leather',size:41,move:'sw200',wr:300,price:1590,isNew:1,tags:['plongeuse','vintage','automatique'],lume:'#E6D3A6',sec:'#D8A866',label:'SUPERMAN',label2:'BRONZE · 300M',
  d:{fr:'Un boîtier en bronze qui se patine avec le temps : chaque montre devient unique au poignet de son propriétaire.',en:'A bronze case that develops a patina over time: every watch becomes unique on its owner’s wrist.'}},
 {id:'sgmt',col:'superman',name:{fr:'Superman GMT',en:'Superman GMT'},type:'gmt',dial:'black',bezel:'pepsi',case:'brushed',strap:'steel',size:39,move:'sw200',wr:300,price:1390,tags:['plongeuse','moderne','automatique'],lume:'#F1EEE6',sec:'#C9372C',label:'SUPERMAN GMT',label2:'300M · 1000FT',
  d:{fr:'Deux fuseaux horaires et une lunette bicolore rouge et bleue, pour les collectionneurs qui voyagent.',en:'Two time zones and a red-and-blue bezel, for collectors who travel.'}},
 {id:'rrp',col:'rallygraf',name:{fr:'Reverse Panda Chronograph',en:'Reverse Panda Chronograph'},type:'chrono',dial:'black',sub:'cream',bezel:'black',case:'brushed',strap:'leather',size:39,move:'eta7753',wr:100,price:1890,isNew:1,tags:['chronographe','vintage','automatique'],lume:'#EADCB8',sec:'#D4553A',label:'RALLYGRAF',label2:'AUTOMATIC CHRONOGRAPH',
  d:{fr:'Le Rallygraf de 1966 réinterprété : cadran noir, compteurs crème et lunette tachymétrique, sur cuir vintage.',en:'The 1966 Rallygraf reinterpreted: black dial, cream sub-dials and tachymeter bezel, on vintage leather.'}},
 {id:'rpanda',col:'rallygraf',name:{fr:'Rallygraf Panda',en:'Rallygraf Panda'},type:'chrono',dial:'white',sub:'black',bezel:'steel',case:'brushed',strap:'steel',size:39,move:'eta7753',wr:100,price:1890,tags:['chronographe','vintage','automatique'],lume:'#F1EEE6',sec:'#D4553A',label:'RALLYGRAF',label2:'AUTOMATIC CHRONOGRAPH',
  d:{fr:'Le panda classique : cadran opalin, compteurs noirs, bracelet acier à maillons.',en:'The classic panda: opaline dial, black sub-dials, steel link bracelet.'}},
 {id:'rblue',col:'rallygraf',name:{fr:'Rallygraf Bleu Nuit',en:'Rallygraf Midnight Blue'},type:'chrono',dial:'blue',sub:'silver',bezel:'steel',case:'polished',strap:'rubber',size:42,move:'eta7753',wr:100,price:2090,tags:['chronographe','moderne','automatique'],lume:'#F1EEE6',sec:'#E9E2CF',label:'RALLYGRAF',label2:'AUTOMATIC CHRONOGRAPH',
  d:{fr:'Un chronographe 42 mm au cadran soleillé bleu nuit, pensé pour le quotidien.',en:'A 42 mm chronograph with a sunburst midnight-blue dial, made for every day.'}},
 {id:'fpilot',col:'flygraf',drop:.1,name:{fr:'Flygraf Pilote',en:'Flygraf Pilot'},type:'pilot',dial:'black',bezel:'none',case:'brushed',strap:'leather',size:42,move:'yema3000',wr:100,price:1490,tags:['moderne','automatique'],lume:'#EADCB8',sec:'#E9E2CF',label:'FLYGRAF',label2:'AUTOMATIC',
  d:{fr:'Lisibilité absolue : grands chiffres luminescents, couronne oignon, cadran noir mat.',en:'Absolute legibility: large luminous numerals, onion crown, matte black dial.'}},
 {id:'fchrono',col:'flygraf',name:{fr:'Flygraf Chronographe',en:'Flygraf Chronograph'},type:'chrono',dial:'anthracite',sub:'black',bezel:'black',case:'brushed',strap:'nato',size:42,move:'eta7753',wr:100,price:2190,isNew:1,tags:['chronographe','moderne','automatique'],lume:'#EADCB8',sec:'#D4B36F',label:'FLYGRAF',label2:'CHRONOGRAPH',
  d:{fr:'Le chronographe des aviateurs, sur bracelet NATO : robuste, lisible, taillé pour l’action.',en:'The aviators’ chronograph on a NATO strap: rugged, legible, built for action.'}},
 {id:'nmn',col:'navygraf',name:{fr:'Navygraf Marine Nationale',en:'Navygraf Marine Nationale'},type:'diver',dial:'black',bezel:'black',case:'brushed',strap:'nato',size:39,move:'yema3000',wr:300,price:1290,ltd:'1/500',tags:['plongeuse','vintage','automatique'],lume:'#E3CC9A',sec:'#D4B36F',label:'MARINE NATIONALE',label2:'300M',
  d:{fr:'Hommage aux plongeurs de la Marine nationale : cadran noir, lume vieilli, bracelet NATO tricolore.',en:'A tribute to the French Navy divers: black dial, aged lume, tricolour NATO strap.'}},
 {id:'nher',col:'navygraf',name:{fr:'Navygraf Héritage',en:'Navygraf Heritage'},type:'diver',dial:'blue',bezel:'blue',case:'brushed',strap:'steel',size:41,move:'sw200',wr:300,price:1150,tags:['plongeuse','moderne','automatique'],lume:'#F1EEE6',sec:'#E9E2CF',label:'NAVYGRAF',label2:'300M · 1000FT',
  d:{fr:'La porte d’entrée de la collection Navygraf : lunette bleu roi et bracelet acier.',en:'The entry point to the Navygraf collection: royal-blue bezel and steel bracelet.'}}
];
const W=id=>WATCHES.find(w=>w.id===id)||WATCHES[0];
const STYLES=[['vintage',{fr:'Vintage',en:'Vintage'}],['moderne',{fr:'Moderne',en:'Modern'}],['automatique',{fr:'Automatique',en:'Automatic'}],['chronographe',{fr:'Chronographe',en:'Chronograph'}],['plongeuse',{fr:'Plongeuse',en:'Diver'}]];
const priceOf=(w,cfg)=>{if(!cfg)return w.price;return w.price+(DIALS[cfg.dial]?DIALS[cfg.dial].p:0)+(CASES[cfg.case]?CASES[cfg.case].p:0)+((STRAPS[cfg.strap]?STRAPS[cfg.strap].p:0)-(STRAPS[w.strap].p));};
const cfgLine=c=>[tx(DIALS[c.dial]),tx(CASES[c.case]),tx(STRAPS[c.strap])].join(' · ');

/* ---------- state ---------- */
const KEY='yema-demo-v1';
const now=Date.now(), H=3600e3, D=24*H;
function defState(){return{
 v:1,lang:null,onboarded:false,guest:false,
 user:{first:'Alexandre',last:'Dubois',email:'alexandre.d@example.com',phone:'+33 6 12 34 56 42',wrist:'16-18'},
 consent:null,
 prefs:{wrist:'16-18',cm:17,cols:['superman'],budget:[1000,3000],styles:['vintage','automatique','plongeuse'],launches:true},
 cat:{cols:[],sort:'reco',sizes:[],moves:[],q:''},
 wish:[{wid:'fpilot',cfg:null,at:now-18*D}],
 owned:[
  {oid:'o1',wid:'sh',cfg:{dial:'black',case:'brushed',strap:'steel'},bezel:'black',ref:'YSUP2020A39',serial:'YM-8492-XTQ',date:'2024-10-14',dealer:{fr:'Boutique Yema Paris',en:'Yema Boutique Paris'},wEnd:'2027-10-14',price:1190,
   hist:[{t:{fr:'Entretien de routine',en:'Routine service'},d:'2025-11-18',x:{fr:'Réglage complet du mouvement, test d’étanchéité (300 m) et nettoyage par ultrasons du boîtier.',en:'Full movement regulation, water-resistance test (300 m) and ultrasonic case cleaning.'},by:{fr:'Service officiel Yema',en:'Official Yema service'}},{t:{fr:'Achat initial',en:'Initial purchase'},d:'2024-10-14',x:{fr:'Montre enregistrée dans la collection avec garantie internationale de 3 ans.',en:'Watch registered in the collection with a 3-year international warranty.'}}],
   notes:{fr:'« Portée principalement sur le bracelet en cuir vintage. Bracelet en acier conservé en parfait état dans la boîte d’origine. »',en:'“Mostly worn on the vintage leather strap. Steel bracelet kept in perfect condition in the original box.”'}},
  {oid:'o2',wid:'rpanda',cfg:{dial:'white',case:'brushed',strap:'leather'},ref:'YRAL23-AU32',serial:'YM-3317-RPA',date:'2025-01-20',dealer:{fr:'Revendeur agréé — Le Marais',en:'Authorised dealer — Le Marais'},wEnd:'2028-01-20',price:1890,
   hist:[{t:{fr:'Achat initial',en:'Initial purchase'},d:'2025-01-20',x:{fr:'Enregistrée via la carte de garantie. Bracelet cuir ajouté à l’achat.',en:'Registered via the warranty card. Leather strap added at purchase.'}}],notes:''}
 ],
 notifs:[
  {id:'n1',k:'price',ts:now-2*60e3,read:false,to:{s:'pdp',p:{id:'fpilot'}},t:{fr:'Baisse de prix : Favoris',en:'Price drop: Favourites'},b:{fr:'La Flygraf Pilote de votre liste de souhaits baisse de 10 % pour les membres VIP. Quantités limitées.',en:'The Flygraf Pilot on your wishlist is 10% off for VIP members. Limited quantities.'},cta:{fr:'Découvrir l’offre',en:'See the offer'}},
  {id:'n2',k:'stock',ts:now-2*H,read:false,to:{s:'pdp',p:{id:'nmn'}},t:{fr:'De retour en stock',en:'Back in stock'},b:{fr:'La Navygraf Marine Nationale est à nouveau disponible. Réservez la vôtre avant la prochaine rupture.',en:'The Navygraf Marine Nationale is available again. Reserve yours before it sells out.'}},
  {id:'n3',k:'event',ts:now-26*H,read:true,to:{s:'club',p:{seg:'events',open:'expo'}},t:{fr:'Invitation événement privé',en:'Private event invitation'},b:{fr:'Vous êtes convié(e) à l’Exposition Héritage Yema à Paris. Réponse souhaitée avant le 1er décembre.',en:'You are invited to the Yema Heritage Exhibition in Paris. Please reply before 1 December.'}},
  {id:'n4',k:'service',ts:now-3*D,read:true,to:{s:'watch',p:{oid:'o2'}},t:{fr:'Rappel de révision',en:'Service reminder'},b:{fr:'Votre Rallygraf Panda approche de sa première révision. Programmez un entretien pour garantir sa précision.',en:'Your Rallygraf Panda is due for its first service. Book a service to keep it accurate.'}},
  {id:'n5',k:'club',ts:now-8*D,read:true,to:{s:'club',p:{seg:'news'}},t:{fr:'Actualité du Club VIP',en:'VIP Club news'},b:{fr:'Nouveaux privilèges : remplacement de bracelet offert et livraison prioritaire pour les membres Platine.',en:'New perks: complimentary strap replacement and priority delivery for Platinum members.'}}
 ],
 notifPrefs:{price:true,stock:true,event:true,service:true,club:true,launch:true},
 sec:{twofa:true,faceid:true,bioOpen:false},
 devices:[{id:'d1',n:'iPhone 15 Pro',w:{fr:'Cet appareil · Paris',en:'This device · Paris'},cur:true,i:'device'},{id:'d2',n:'iPad Air',w:{fr:'Paris · il y a 3 jours',en:'Paris · 3 days ago'},i:'tablet'},{id:'d3',n:'MacBook Pro · Safari',w:{fr:'Saint-Maur · il y a 2 sem.',en:'Saint-Maur · 2 weeks ago'},i:'tablet'}],
 addresses:[{id:'a1',n:{fr:'Domicile',en:'Home'},l:'24 rue des Horlogers (illustratif)',c:'75009 Paris',def:true},{id:'a2',n:{fr:'Bureau',en:'Office'},l:'8 avenue de l’Exemple (illustratif)',c:'92400 Courbevoie'}],
 bookings:{},preorders:{},votes:{},alerts:{},appt:null,purchase:null,chat:[],
 steps:[0,0,0,0,0,0],tour:false,pushed:false,geo:null,camAsked:false,left:127,seenSt:[]
};}
let S;
function load(){let s=null;try{const raw=localStorage.getItem(KEY);if(raw)s=JSON.parse(raw);}catch(e){}const d=defState();if(!s||s.v!==1)return d;return Object.assign(d,s);}
let NOSAVE=false;
function save(){if(NOSAVE)return;try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
S=load();

/* ---------- SVG watch renderer ---------- */
let UID=0;
const P=(a,r,cx=100,cy=160)=>{const t=(a-90)*Math.PI/180;return[cx+r*Math.cos(t),cy+r*Math.sin(t)];};
const f1=n=>Math.round(n*10)/10;
function ring(cx,cy,ro,ri){return`M${f1(cx-ro)} ${cy}a${ro} ${ro} 0 1 0 ${f1(2*ro)} 0a${ro} ${ro} 0 1 0 ${f1(-2*ro)} 0zM${f1(cx-ri)} ${cy}a${ri} ${ri} 0 1 1 ${f1(2*ri)} 0a${ri} ${ri} 0 1 1 ${f1(-2*ri)} 0z`;}
const RWC=new Map();
function renderWatch(o){o=o||{};if(o.memo===false||o.hero)return rw(o,'yw'+(++UID));const k=JSON.stringify(o)+'|'+new Date().getDate();let t=RWC.get(k);if(!t){t=rw(o,'YWID');if(RWC.size>160)RWC.clear();RWC.set(k,t);}return t.replace(/YWID/g,'yw'+(++UID));}
const RADIUS={39:56,41:58.5,42:60.5};
function watchVB(o){const R=RADIUS[o.size||39]||57,cx=100,cy=160;if(o.view==='detail')return `${f1(cx-R*1.02)} ${f1(cy-R*1.02)} ${f1(R*2.04)} ${f1(R*2.04)}`;if(o.view==='crop')return `${f1(cx-R*1.45)} ${f1(cy-R*1.8)} ${f1(R*2.9)} ${f1(R*3.6)}`;if(o.wrap)return `${f1(cx-R*1.32)} ${f1(cy-R*1.6)} ${f1(R*2.8)} ${f1(R*3.2)}`;return '0 0 200 320';}
function rw(o,id){
 const w=Object.assign({type:'diver',dial:'navy',case:'brushed',strap:'steel',bezel:'navy',size:39,view:'front',date:true,sub:'cream',sec:'#D4B36F',lume:'#F1EEE6',wrap:false,label:'YEMA',label2:'',cls:'w',title:''},o);
 const cx=100, cy=160, NOW=new Date(), T=w.time||[NOW.getHours(),NOW.getMinutes(),NOW.getSeconds()];
 const live=w.live!==false&&w.view!=='back';
 const R=RADIUS[w.size]||57;
 const C=CASES[w.case]||CASES.brushed, Dl=DIALS[w.dial]||DIALS.navy;
 const Wd=R*1.04, Wf=Wd*.9;
 const yT=w.wrap?cy-R*1.6:0, yB=w.wrap?cy+R*1.6:320;
 const vb=watchVB(w);
 let defs=`<linearGradient id="${id}c" x1="0" y1="0" x2="1" y2="1">${C.st.map((c,i)=>`<stop offset="${i/(C.st.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
 defs+=`<linearGradient id="${id}ch" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.st[2]}"/><stop offset=".45" stop-color="${C.st[0]}"/><stop offset="1" stop-color="${C.st[2]}"/></linearGradient>`;
 defs+=`<radialGradient id="${id}d" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="${Dl.hi}"/><stop offset=".55" stop-color="${Dl.c}"/><stop offset="1" stop-color="${Dl.c2}"/></radialGradient>`;
 defs+=`<linearGradient id="${id}g" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
 // strap
 const strapPath=(y0,y1)=>`M${f1(cx-Wd/2)} ${f1(y0)}L${f1(cx-Wf/2)} ${f1(y1)}L${f1(cx+Wf/2)} ${f1(y1)}L${f1(cx+Wd/2)} ${f1(y0)}z`;
 const y0T=cy-R*.7, y0B=cy+R*.7;
 let strap='';
 if(w.strap==='steel'){
  defs+=`<linearGradient id="${id}sl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.st[2]}"/><stop offset=".5" stop-color="${C.st[0]}"/><stop offset="1" stop-color="${C.st[1]}"/></linearGradient><linearGradient id="${id}sc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.st[1]}"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="${C.st[2]}"/></linearGradient>`;
  strap+=`<path d="${strapPath(y0T,yT)}" fill="#2E343B"/><path d="${strapPath(y0B,yB)}" fill="#2E343B"/>`;
  const rows=(a,b,dir)=>{let r='';for(let y=a;dir<0?y>b:y<b;y+=dir*13){const yy=dir<0?y-12:y;const t=Math.abs(y-(dir<0?y0T:y0B))/Math.abs(b-(dir<0?y0T:y0B));const wd=Wd-(Wd-Wf)*t;const cw=wd*.36;r+=`<rect x="${f1(cx-wd/2+.6)}" y="${f1(yy)}" width="${f1(wd/2-cw/2-1.4)}" height="12" rx="2.2" fill="url(#${id}sl)"/><rect x="${f1(cx+cw/2+.8)}" y="${f1(yy)}" width="${f1(wd/2-cw/2-1.4)}" height="12" rx="2.2" fill="url(#${id}sl)"/><rect x="${f1(cx-cw/2)}" y="${f1(yy+(dir<0?-6:6))}" width="${f1(cw)}" height="12" rx="2.2" fill="url(#${id}sc)"/>`;}return r;};
  strap+=`<g>${rows(y0T+6,yT-12,-1)}${rows(y0B-6,yB+12,1)}</g>`;
 }else if(w.strap==='leather'){
  defs+=`<linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4A2A17"/><stop offset=".25" stop-color="#8A5733"/><stop offset=".55" stop-color="#9C6841"/><stop offset="1" stop-color="#4A2A17"/></linearGradient>`;
  const st=(y0,y1)=>`<path d="M${f1(cx-Wd/2+4.5)} ${f1(y0)}L${f1(cx-Wf/2+4.5)} ${f1(y1)}M${f1(cx+Wd/2-4.5)} ${f1(y0)}L${f1(cx+Wf/2-4.5)} ${f1(y1)}" stroke="#E8CFA2" stroke-opacity=".75" stroke-width="1" stroke-dasharray="3 2.4" fill="none"/>`;
  strap+=`<path d="${strapPath(y0T,yT)}" fill="url(#${id}s)"/><path d="${strapPath(y0B,yB)}" fill="url(#${id}s)"/>${st(y0T,yT)}${st(y0B,yB)}`;
  if(!w.wrap){strap+=`<rect x="${f1(cx-Wd/2-2)}" y="${f1(cy+R+26)}" width="${f1(Wd+4)}" height="9" rx="3" fill="#3B2112"/>`;for(let i=0;i<4;i++)strap+=`<ellipse cx="${cx}" cy="${f1(cy+R+58+i*15)}" rx="2.4" ry="2" fill="#2A170B"/>`;}
  strap+=`<path d="${strapPath(y0T,yT)}" fill="#fff" opacity=".04"/>`;
 }else if(w.strap==='rubber'){
  defs+=`<linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0B0C0E"/><stop offset=".4" stop-color="#2A2D33"/><stop offset=".6" stop-color="#23262B"/><stop offset="1" stop-color="#0B0C0E"/></linearGradient>`;
  strap+=`<path d="${strapPath(y0T,yT)}" fill="url(#${id}s)"/><path d="${strapPath(y0B,yB)}" fill="url(#${id}s)"/>`;
  let g='';for(let y=y0T-10;y>yT;y-=9)g+=`M${f1(cx-Wd*.36)} ${f1(y)}h${f1(Wd*.72)}`;for(let y=y0B+10;y<yB;y+=9)g+=`M${f1(cx-Wd*.36)} ${f1(y)}h${f1(Wd*.72)}`;
  strap+=`<path d="${g}" stroke="#000" stroke-opacity=".55" stroke-width="2.4"/><path d="${g}" stroke="#fff" stroke-opacity=".06" stroke-width="1" transform="translate(0 1.6)"/>`;
 }else{ // nato
  defs+=`<linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1E2B45"/><stop offset=".28" stop-color="#26355A"/><stop offset=".28" stop-color="#B8A77D"/><stop offset=".40" stop-color="#B8A77D"/><stop offset=".40" stop-color="#8C2F2F"/><stop offset=".60" stop-color="#8C2F2F"/><stop offset=".60" stop-color="#B8A77D"/><stop offset=".72" stop-color="#B8A77D"/><stop offset=".72" stop-color="#26355A"/><stop offset="1" stop-color="#1E2B45"/></linearGradient>`;
  strap+=`<path d="${strapPath(y0T,yT)}" fill="url(#${id}s)"/><path d="${strapPath(y0B,yB)}" fill="url(#${id}s)"/>`;
  let wv='';for(let y=y0T-4;y>yT;y-=3.2)wv+=`M${f1(cx-Wd/2)} ${f1(y)}h${f1(Wd)}`;for(let y=y0B+4;y<yB;y+=3.2)wv+=`M${f1(cx-Wd/2)} ${f1(y)}h${f1(Wd)}`;
  strap+=`<path d="${wv}" stroke="#000" stroke-opacity=".12" stroke-width=".8"/>`;
  if(!w.wrap)strap+=`<rect x="${f1(cx-Wd/2-2)}" y="${f1(cy+R+30)}" width="${f1(Wd+4)}" height="7" rx="2" fill="url(#${id}c)" stroke="${C.edge}" stroke-width=".5"/><rect x="${f1(cx-Wd/2-2)}" y="${f1(cy+R+44)}" width="${f1(Wd+4)}" height="7" rx="2" fill="url(#${id}c)" stroke="${C.edge}" stroke-width=".5"/>`;
 }
 if(w.wrap){
  defs+=`<linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".62"/><stop offset=".1" stop-color="#000" stop-opacity=".22"/><stop offset=".2" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset=".9" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".68"/></linearGradient><linearGradient id="${id}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".08" stop-color="#fff" stop-opacity="1"/><stop offset=".92" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${id}k" maskUnits="userSpaceOnUse" x="0" y="${f1(yT)}" width="200" height="${f1(yB-yT)}"><rect x="0" y="${f1(yT)}" width="200" height="${f1(yB-yT)}" fill="url(#${id}m)"/></mask>`;
  strap=`<g mask="url(#${id}k)">${strap}<rect x="${f1(cx-Wd/2-2)}" y="${f1(yT)}" width="${f1(Wd+4)}" height="${f1(yB-yT)}" fill="url(#${id}f)"/></g>`;
 }
 // lugs
 let lugs='';
 [-1,1].forEach(sy=>[-1,1].forEach(sx=>{const x=sx<0?cx-Wd/2-6.5:cx+Wd/2-1.5;const y=sy<0?cy-R-12:cy+R*.55;lugs+=`<rect x="${f1(x)}" y="${f1(y)}" width="8" height="${f1(R*.45+12)}" rx="3.6" fill="url(#${id}ch)" stroke="${C.edge}" stroke-width=".6"/>`;}));
 if(w.strap==='steel')lugs+=`<rect x="${f1(cx-Wd/2+.5)}" y="${f1(cy-R-9)}" width="${f1(Wd-1)}" height="12" rx="2" fill="url(#${id}sl)"/><rect x="${f1(cx-Wd/2+.5)}" y="${f1(cy+R-3)}" width="${f1(Wd-1)}" height="12" rx="2" fill="url(#${id}sl)"/>`;
 // crown / pushers
 let crown='';
 const cr=(x,y,wi,hi,rx)=>{let k='';for(let i=1;i<wi/1.7;i++)k+=`M${f1(x+i*1.7)} ${f1(y+1.2)}v${f1(hi-2.4)}`;return`<rect x="${f1(x)}" y="${f1(y)}" width="${wi}" height="${hi}" rx="${rx}" fill="url(#${id}c)" stroke="${C.edge}" stroke-width=".6"/><path d="${k}" stroke="${C.edge}" stroke-opacity=".5" stroke-width=".5"/>`;};
 const side=w.view==='back'?-1:1;
 const crownAt=(x,wi,hi,rx)=>side>0?cr(x,cy-hi/2,wi,hi,rx):cr(2*cx-x-wi,cy-hi/2,wi,hi,rx);
 if(w.type==='pilot')crown=crownAt(cx+R-3,15,22,6);
 else crown=crownAt(cx+R-3,11,17,3);
 if(w.type==='chrono'){[-40,40].forEach(a=>{crown+=`<g transform="rotate(${a*side} ${cx} ${cy})">${crownAt(cx+R-3,9,9,2)}</g>`;});}
 if(w.type==='diver'&&w.bezel!=='none'&&w.view!=='back'){crown+=`<path d="M${f1(cx+R-4)} ${f1(cy+R*.42)}l9 3.5 1.6 9-9 1.5z" fill="url(#${id}c)" stroke="${C.edge}" stroke-width=".6"/>`;}
 // case
 let body='';
 if(w.view==='34')body+=`<circle cx="${cx+7}" cy="${cy+1}" r="${R}" fill="${C.edge}"/><circle cx="${cx+4}" cy="${cy+.5}" r="${R}" fill="url(#${id}ch)"/>`;
 body+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${id}c)" stroke="${C.edge}" stroke-width=".8"/>`;
 if(w.view==='back'){
  const mv=`<radialGradient id="${id}mv" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#C9CED4"/><stop offset="1" stop-color="#6D757E"/></radialGradient><linearGradient id="${id}ro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EBD29B"/><stop offset=".5" stop-color="#B8914E"/><stop offset="1" stop-color="#8A6A2E"/></linearGradient><path id="${id}tp" d="M${f1(cx-R*.78)} ${cy}a${f1(R*.78)} ${f1(R*.78)} 0 1 1 ${f1(R*1.56)} 0a${f1(R*.78)} ${f1(R*.78)} 0 1 1 ${f1(-R*1.56)} 0"/><clipPath id="${id}cl"><circle cx="${cx}" cy="${cy}" r="${f1(R*.55)}"/></clipPath>`;
  defs+=mv;
  let brushed='';for(let r=R*.62;r<R*.92;r+=1.6)brushed+=`<circle cx="${cx}" cy="${cy}" r="${f1(r)}" fill="none" stroke="#fff" stroke-opacity="${(r*7)%2>1?.07:.02}"/>`;
  let cotes='';for(let i=-8;i<9;i++)cotes+=`<path d="M${cx+i*7-40} ${cy-40}l80 80" stroke="#fff" stroke-opacity=".12" stroke-width="2.6"/>`;
  let jew='';[[-.28,-.2],[.3,-.28],[.12,.32],[-.33,.12],[.36,.08]].forEach(p=>{jew+=`<circle cx="${f1(cx+p[0]*R)}" cy="${f1(cy+p[1]*R)}" r="2.3" fill="#A51E36"/><circle cx="${f1(cx+p[0]*R-.6)}" cy="${f1(cy+p[1]*R-.7)}" r=".7" fill="#fff" opacity=".7"/>`;});
  body+=`<circle cx="${cx}" cy="${cy}" r="${f1(R*.93)}" fill="url(#${id}c)" stroke="${C.edge}" stroke-width=".6"/>${brushed}<text font-family="Manrope,Arial,sans-serif" font-size="${f1(R*.085)}" font-weight="700" letter-spacing="1.6" fill="${C.edge}" opacity=".85"><textPath href="#${id}tp">YEMA · MANUFACTURE · BESANÇON · FRANCE · ${w.wr||300}M · SAPPHIRE</textPath></text><circle cx="${cx}" cy="${cy}" r="${f1(R*.58)}" fill="#11151B" stroke="${C.edge}" stroke-width="1"/><g clip-path="url(#${id}cl)"><circle cx="${cx}" cy="${cy}" r="${f1(R*.55)}" fill="url(#${id}mv)"/>${cotes}<circle cx="${f1(cx-R*.2)}" cy="${f1(cy+R*.22)}" r="${f1(R*.15)}" fill="none" stroke="#D2B574" stroke-width="2"/><path d="M${f1(cx-R*.2)} ${f1(cy+R*.07)}v${f1(R*.3)}M${f1(cx-R*.35)} ${f1(cy+R*.22)}h${f1(R*.3)}" stroke="#D2B574" stroke-width="1.2"/>${jew}<path d="M${cx} ${cy}L${f1(P(-120,R*.56)[0])} ${f1(P(-120,R*.56)[1])}A${f1(R*.56)} ${f1(R*.56)} 0 0 1 ${f1(P(60,R*.56)[0])} ${f1(P(60,R*.56)[1])}z" fill="url(#${id}ro)" opacity=".95"/><text x="${f1(cx+R*.12)}" y="${f1(cy-R*.2)}" font-family="Playfair Display,Georgia,serif" font-size="${f1(R*.12)}" fill="#6B4E1C" transform="rotate(-30 ${cx} ${cy})">YEMA</text><circle cx="${cx}" cy="${cy}" r="3.4" fill="#C9CED4" stroke="#555" stroke-width=".6"/></g><circle cx="${cx}" cy="${cy}" r="${f1(R*.58)}" fill="url(#${id}g)"/>`;
  const inner=`${lugs}${crown}${body}`;
  return `<svg class="${w.cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(w.title||'Yema')}"><defs>${defs}</defs>${strap}${inner}</svg>`;
 }
 // bezel
 let bez='', Rd=R*.8;
 const bzc={navy:['#27457A','#0E1C38'],black:['#2A2D33','#08090B'],blue:['#2E62B8','#10306B'],green:['#2F5642','#13271C'],bronze:['#B08650','#6B4A22']};
 if(w.type==='diver'||w.type==='gmt'){
  const ro=R*.955, ri=R*.79; Rd=R*.765;
  if(w.bezel==='pepsi'){
   defs+=`<linearGradient id="${id}b1"><stop offset="0" stop-color="#C23A34"/><stop offset="1" stop-color="#8E1F20"/></linearGradient><linearGradient id="${id}b2"><stop offset="0" stop-color="#2A4F97"/><stop offset="1" stop-color="#132C60"/></linearGradient>`;
   const a=P(-90,ro),b=P(90,ro),c=P(90,ri),d=P(-90,ri);
   bez+=`<path d="M${f1(a[0])} ${f1(a[1])}A${ro} ${ro} 0 0 1 ${f1(b[0])} ${f1(b[1])}L${f1(c[0])} ${f1(c[1])}A${ri} ${ri} 0 0 0 ${f1(d[0])} ${f1(d[1])}z" fill="url(#${id}b1)" transform="rotate(0 ${cx} ${cy})"/><path d="M${f1(b[0])} ${f1(b[1])}A${ro} ${ro} 0 0 1 ${f1(a[0])} ${f1(a[1])}L${f1(d[0])} ${f1(d[1])}A${ri} ${ri} 0 0 0 ${f1(c[0])} ${f1(c[1])}z" fill="url(#${id}b2)"/>`;
   // rotate so red is on top half: our split is vertical; rotate group by 90
   bez=`<g transform="rotate(90 ${cx} ${cy})">${bez}</g>`;
  }else{
   const bc=bzc[w.bezel]||bzc.black;
   defs+=`<radialGradient id="${id}b" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="${bc[0]}"/><stop offset="1" stop-color="${bc[1]}"/></radialGradient>`;
   bez+=`<path d="${ring(cx,cy,ro,ri)}" fill="url(#${id}b)" fill-rule="evenodd"/>`;
  }
  bez+=`<circle cx="${cx}" cy="${cy}" r="${f1(ro)}" fill="none" stroke="${C.edge}" stroke-width=".6"/>`;
  const lum=w.lume, mid=(ro+ri)/2;
  let tk='',tt='';
  for(let i=0;i<60;i++){const a=i*6;
   if(i===0){const p1=P(0,ro-1.5),p2=P(0,ri+2);tk+=`<path d="M${f1(cx-5)} ${f1(p1[1])}L${f1(cx+5)} ${f1(p1[1])}L${cx} ${f1(p2[1])}z" fill="${lum}"/>`;continue;}
   if(w.type==='gmt'){if(i%5===0){if(i%10===0){const p=P(a,mid);tt+=`<text x="${f1(p[0])}" y="${f1(p[1]+2.6)}" transform="rotate(${a} ${f1(p[0])} ${f1(p[1])})" text-anchor="middle" font-size="7" font-weight="700" font-family="Manrope,Arial,sans-serif" fill="#F1EEE6">${i/5*2}</text>`;}else{const p=P(a,ro-3);tk+=`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="1.2" fill="#F1EEE6"/>`;}}continue;}
   if(i%10===0){const p=P(a,mid);tt+=`<text x="${f1(p[0])}" y="${f1(p[1]+2.7)}" transform="rotate(${a} ${f1(p[0])} ${f1(p[1])})" text-anchor="middle" font-size="7.4" font-weight="700" font-family="Manrope,Arial,sans-serif" fill="#EDE8DC">${i}</text>`;}
   else if(i%5===0){tk+=`<rect x="${f1(cx-1.3)}" y="${f1(cy-ro+2)}" width="2.6" height="${f1((ro-ri)*.5)}" fill="${lum}" transform="rotate(${a} ${cx} ${cy})"/>`;}
   else if(i<15){tk+=`<rect x="${f1(cx-.45)}" y="${f1(cy-ro+2)}" width=".9" height="${f1((ro-ri)*.3)}" fill="#EDE8DC" transform="rotate(${a} ${cx} ${cy})"/>`;}
  }
  bez+=tk+tt+`<circle cx="${cx}" cy="${f1(cy-ro+(ro-ri)*.62)}" r="1.9" fill="${lum}" stroke="#000" stroke-opacity=".3" stroke-width=".4"/>`;
  bez+=`<circle cx="${cx}" cy="${cy}" r="${f1(ri)}" fill="none" stroke="${C.edge}" stroke-width="1.2"/>`;
 }else if(w.type==='chrono'){
  const ro=R*.95, ri=R*.855; Rd=R*.845;
  const steelB=w.bezel==='steel';
  defs+=`<radialGradient id="${id}b" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="${steelB?'#E7EAED':'#2A2D33'}"/><stop offset="1" stop-color="${steelB?'#8F969E':'#07080A'}"/></radialGradient>`;
  bez+=`<path d="${ring(cx,cy,ro,ri)}" fill="url(#${id}b)" fill-rule="evenodd"/>`;
  const ink=steelB?'#1D2129':'#EDE8DC';
  let tk='';for(let i=0;i<60;i++){tk+=`<rect x="${f1(cx-.35)}" y="${f1(cy-ro+1.4)}" width=".7" height="${i%5?1.6:2.8}" fill="${ink}" transform="rotate(${i*6} ${cx} ${cy})"/>`;}
  [[400,54],[300,72],[200,108],[150,144],[120,180],[100,216],[90,240],[80,270],[70,308.6]].forEach(([v,a])=>{const p=P(a,(ro+ri)/2+.8);tk+=`<text x="${f1(p[0])}" y="${f1(p[1]+2)}" transform="rotate(${a} ${f1(p[0])} ${f1(p[1])})" text-anchor="middle" font-size="5" font-weight="700" font-family="Manrope,Arial,sans-serif" fill="${ink}">${v}</text>`;});
  const pt=P(0,(ro+ri)/2);tk+=`<text x="${cx}" y="${f1(pt[1]+2)}" text-anchor="middle" font-size="4.2" font-weight="800" letter-spacing=".6" font-family="Manrope,Arial,sans-serif" fill="${ink}">TACHY</text>`;
  bez+=tk+`<circle cx="${cx}" cy="${cy}" r="${f1(ri)}" fill="none" stroke="${C.edge}" stroke-width="1"/>`;
 }else{ // pilot
  Rd=R*.885;
  bez+=`<path d="${ring(cx,cy,R*.955,R*.9)}" fill="url(#${id}ch)" fill-rule="evenodd"/><circle cx="${cx}" cy="${cy}" r="${f1(R*.9)}" fill="none" stroke="${C.edge}" stroke-width=".8"/>`;
 }
 // dial
 let dial=`<circle cx="${cx}" cy="${cy}" r="${f1(Rd)}" fill="url(#${id}d)"/>`;
 let sb='';for(let i=0;i<72;i++){const p=P(i*5,Rd);sb+=`M${cx} ${cy}L${f1(p[0])} ${f1(p[1])}`;}
 dial+=`<path d="${sb}" stroke="#fff" stroke-opacity="${Dl.ink==='#16181C'||Dl.ink==='#1B1B1B'||Dl.ink==='#13202C'?'.08':'.035'}" stroke-width="1.1"/><circle cx="${cx}" cy="${cy}" r="${f1(Rd-1.2)}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="2.4"/>`;
 const ink=Dl.ink, lum=w.lume;
 let mt='';for(let i=0;i<60;i++){if(w.type!=='pilot'&&i%5===0)continue;mt+=`<rect x="${f1(cx-.3)}" y="${f1(cy-Rd*.975)}" width=".6" height="${f1(i%5===0?Rd*.07:Rd*.04)}" fill="${ink}" opacity=".7" transform="rotate(${i*6} ${cx} ${cy})"/>`;}
 dial+=mt;
 const dt=new Date().getDate();
 const dateWin=x=>`<rect x="${f1(x-7)}" y="${f1(cy-6)}" width="14" height="12" rx="1" fill="#F4F1EA" stroke="${C.edge}" stroke-width=".9"/><text x="${f1(x)}" y="${f1(cy+3.1)}" text-anchor="middle" font-size="8.2" font-weight="700" font-family="Manrope,Arial,sans-serif" fill="#15171B">${dt}</text>`;
 let idx='';
 if(w.type==='diver'||w.type==='gmt'){
  for(let k=0;k<12;k++){const a=k*30;
   if(k===0){idx+=`<path d="M${f1(cx-6.5)} ${f1(cy-Rd*.9)}L${f1(cx+6.5)} ${f1(cy-Rd*.9)}L${cx} ${f1(cy-Rd*.64)}z" fill="${lum}" stroke="${C.edge}" stroke-width=".8"/>`;continue;}
   if(k===3&&w.date){idx+=dateWin(cx+Rd*.72);continue;}
   if(k%3===0){idx+=`<rect x="${f1(cx-3)}" y="${f1(cy-Rd*.9)}" width="6" height="${f1(Rd*.24)}" rx=".8" fill="${lum}" stroke="${C.edge}" stroke-width=".8" transform="rotate(${a} ${cx} ${cy})"/>`;continue;}
   const p=P(a,Rd*.8);idx+=`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${f1(Rd*.075)}" fill="${lum}" stroke="${C.edge}" stroke-width=".8"/>`;
  }
 }else if(w.type==='chrono'){
  const subc={cream:['#EFE6CF','#1B1B1B'],black:['#15171B','#EDE8DC'],silver:['#D6DCE2','#1B2330'],white:['#F1EFE9','#15171B']}[w.sub]||['#EFE6CF','#1B1B1B'];
  for(let k=0;k<12;k++){if(k===3||k===9)continue;const a=k*30;
   if(k===0){idx+=`<rect x="${f1(cx-4)}" y="${f1(cy-Rd*.93)}" width="3" height="${f1(Rd*.2)}" fill="url(#${id}ch)" stroke="${C.edge}" stroke-width=".4"/><rect x="${f1(cx+1)}" y="${f1(cy-Rd*.93)}" width="3" height="${f1(Rd*.2)}" fill="url(#${id}ch)" stroke="${C.edge}" stroke-width=".4"/>`;continue;}
   idx+=`<rect x="${f1(cx-1.6)}" y="${f1(cy-Rd*.93)}" width="3.2" height="${f1(Rd*.17)}" fill="url(#${id}ch)" stroke="${C.edge}" stroke-width=".4" transform="rotate(${a} ${cx} ${cy})"/><rect x="${f1(cx-.6)}" y="${f1(cy-Rd*.91)}" width="1.2" height="${f1(Rd*.1)}" fill="${lum}" transform="rotate(${a} ${cx} ${cy})"/>`;}
  [-1,1].forEach((sx,j)=>{const sx0=cx+sx*Rd*.44, sr=Rd*.26;let t='';for(let i=0;i<30;i++){t+=`<rect x="${f1(sx0-.3)}" y="${f1(cy-sr+1)}" width=".6" height="${i%5?1.4:2.6}" fill="${subc[1]}" transform="rotate(${i*12} ${f1(sx0)} ${cy})"/>`;}
   const ha=j?140:250;idx+=`<circle cx="${f1(sx0)}" cy="${cy}" r="${f1(sr)}" fill="${subc[0]}" stroke="${C.st[1]}" stroke-width="1.2"/><circle cx="${f1(sx0)}" cy="${cy}" r="${f1(sr*.72)}" fill="none" stroke="${subc[1]}" stroke-opacity=".12" stroke-width="${f1(sr*.3)}"/>${t}<g ${j===0?`class="hsub" data-x="${f1(sx0)}" data-y="${cy}"`:''} transform="rotate(${j===0?T[2]*6:ha} ${f1(sx0)} ${cy})"><path d="M${f1(sx0)} ${f1(cy+2)}L${f1(sx0)} ${f1(cy-sr*.8)}" stroke="${subc[1]}" stroke-width="1.1" stroke-linecap="round"/></g><circle cx="${f1(sx0)}" cy="${cy}" r="1.5" fill="${subc[1]}"/>`;});
 }else{ // pilot numerals
  for(let k=0;k<12;k++){const a=k*30;
   if(k===0){idx+=`<path d="M${f1(cx-7)} ${f1(cy-Rd*.93)}L${f1(cx+7)} ${f1(cy-Rd*.93)}L${cx} ${f1(cy-Rd*.7)}z" fill="${lum}"/><circle cx="${f1(cx-10)}" cy="${f1(cy-Rd*.88)}" r="1.7" fill="${lum}"/><circle cx="${f1(cx+10)}" cy="${f1(cy-Rd*.88)}" r="1.7" fill="${lum}"/>`;continue;}
   if(k===3&&w.date){idx+=dateWin(cx+Rd*.7);continue;}
   const p=P(a,Rd*.72);idx+=`<text x="${f1(p[0])}" y="${f1(p[1]+Rd*.075)}" text-anchor="middle" font-size="${f1(Rd*.2)}" font-weight="700" font-family="Manrope,Arial,sans-serif" fill="${lum}">${k}</text>`;}
 }
 // texts
 const tY=w.type==='chrono'?cy-Rd*.5:cy-Rd*.4;
 let txt=`<text x="${cx}" y="${f1(tY)}" text-anchor="middle" font-size="${f1(Rd*.13)}" font-weight="800" letter-spacing="1.8" font-family="Manrope,Arial,sans-serif" fill="${ink}">YEMA</text><path d="M${f1(cx-3)} ${f1(tY-Rd*.2)}l3 -3.4 3 3.4 -3 1.6z" fill="${w.sec}" opacity=".95"/>`;
 if(w.label)txt+=`<text x="${cx}" y="${f1(w.type==='chrono'?cy+Rd*.5:cy+Rd*.34)}" text-anchor="middle" font-size="${f1(Rd*.068)}" font-weight="700" letter-spacing="1.3" font-family="Manrope,Arial,sans-serif" fill="${ink}" opacity=".88">${esc(w.label)}</text>`;
 if(w.label2&&w.type!=='chrono')txt+=`<text x="${cx}" y="${f1(cy+Rd*.45)}" text-anchor="middle" font-size="${f1(Rd*.05)}" font-weight="600" letter-spacing="1" font-family="Manrope,Arial,sans-serif" fill="${w.sec}" opacity=".95">${esc(w.label2)}</text>`;
 if(w.type==='chrono'&&w.label2)txt+=`<text x="${cx}" y="${f1(cy+Rd*.62)}" text-anchor="middle" font-size="${f1(Rd*.045)}" font-weight="600" letter-spacing="1" font-family="Manrope,Arial,sans-serif" fill="${ink}" opacity=".7">${esc(w.label2)}</text>`;
 // hands (classes hh/hm/hs/hg/hsub are driven by the live ticker)
 const [hh,mm,ss]=T, ha=(hh%12+mm/60)*30, ma=mm*6+ss/10, sa=ss*6, chrono=w.type==='chrono';
 const hand=(len,wd,a,c)=>{const lp=`<path d="M${f1(cx-wd*.24)} ${f1(cy-Rd*.12)}L${f1(cx-wd*.28)} ${f1(cy-len*.7)}L${cx} ${f1(cy-len*.92)}L${f1(cx+wd*.28)} ${f1(cy-len*.7)}L${f1(cx+wd*.24)} ${f1(cy-Rd*.12)}z" fill="${lum}"/>`;const g=`<g class="${c}" transform="rotate(${f1(a)} ${cx} ${cy})">`;return[`${g}<path d="M${f1(cx-wd*.45)} ${f1(cy+Rd*.12)}L${f1(cx-wd/2)} ${f1(cy-len*.72)}L${cx} ${f1(cy-len)}L${f1(cx+wd/2)} ${f1(cy-len*.72)}L${f1(cx+wd*.45)} ${f1(cy+Rd*.12)}z" fill="url(#${id}ch)" stroke="${C.edge}" stroke-width=".5"/>${lp}</g>`,`${g}${lp}</g>`];};
 let hands='',hl='';
 if(w.type==='gmt'){hands+=`<g class="hg" transform="rotate(${f1((hh+mm/60)*15+45)} ${cx} ${cy})"><path d="M${cx} ${f1(cy+4)}V${f1(cy-Rd*.72)}" stroke="#C9372C" stroke-width="1.3"/><path d="M${f1(cx-4.5)} ${f1(cy-Rd*.72)}L${cx} ${f1(cy-Rd*.9)}L${f1(cx+4.5)} ${f1(cy-Rd*.72)}z" fill="#C9372C" stroke="${C.edge}" stroke-width=".4"/></g>`;}
 const H1=hand(Rd*.52,w.type==='pilot'?7:6.4,ha,'hh'),H2=hand(Rd*.8,w.type==='pilot'?5.4:4.8,ma,'hm');hands+=H1[0]+H2[0];hl+=H1[1]+H2[1];
 const lp=w.type==='diver'?`<circle cx="${cx}" cy="${f1(cy-Rd*.62)}" r="2.8" fill="${lum}" stroke="${w.sec}" stroke-width="1"/>`:'';
 const sg=`<g ${chrono?'':'class="hs" '}transform="rotate(${chrono?0:sa} ${cx} ${cy})">`;
 hands+=`${sg}<path d="M${cx} ${f1(cy+Rd*.22)}V${f1(cy-Rd*.9)}" stroke="${w.sec}" stroke-width="1.15" stroke-linecap="round"/>${lp}<rect x="${f1(cx-1.6)}" y="${f1(cy+Rd*.1)}" width="3.2" height="${f1(Rd*.13)}" rx="1.2" fill="${w.sec}"/></g><circle cx="${cx}" cy="${cy}" r="3.4" fill="${w.sec}" stroke="${C.edge}" stroke-width=".4"/><circle cx="${cx}" cy="${cy}" r="1.2" fill="#222"/>`;
 if(lp)hl+=`${sg}${lp}</g>`;
 let glass=`<path d="M${f1(cx-Rd*.95)} ${f1(cy-Rd*.05)}A${f1(Rd*.96)} ${f1(Rd*.96)} 0 0 1 ${f1(cx+Rd*.55)} ${f1(cy-Rd*.8)}Q${f1(cx-Rd*.1)} ${f1(cy-Rd*.45)} ${f1(cx-Rd*.95)} ${f1(cy-Rd*.05)}z" fill="url(#${id}g)"/><circle cx="${cx}" cy="${cy}" r="${f1(Rd)}" fill="none" stroke="#fff" stroke-opacity=".08"/>`;
 if(w.hero){ // moving reflection + luminous (lume) layer for the product hero
  defs+=`<radialGradient id="${id}gl" class="glg" cx=".3" cy=".25" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".35" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
  glass+=`<circle cx="${cx}" cy="${cy}" r="${f1(Rd)}" fill="url(#${id}gl)"/>`;
  const re=new RegExp(`<(?:circle|rect|path|text)\\b[^>]*fill="${lum}"[^>]*?(?:/>|>[^<]*</text>)`,'g');
  const st=((bez+idx).match(re)||[]).join('').split(lum).join('#A9F6D0');
  glass+=`<rect class="darkL" x="0" y="0" width="200" height="320" fill="#01040A"/><g class="lumeL" filter="url(#lumeGlow)">${st}${hl.split(lum).join('#A9F6D0')}</g>`;
 }
 let front=`${lugs}${crown}${body}${bez}${dial}${idx}${txt}${hands}${glass}`;
 if(w.view==='34')front=`<g transform="translate(${cx} ${cy}) rotate(-6) scale(.84 1) skewY(-6) translate(${-cx} ${-cy})">${strap}${front}</g>`;
 else front=strap+front;
 return `<svg class="${w.cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(w.title||'Yema')}"${live?' data-live="1"':''}><defs>${defs}</defs>${front}</svg>`;
}
/* watch object -> render opts */
function wopts(w,cfg,extra){const c=cfg||{};return Object.assign({type:w.type,dial:c.dial||w.dial,case:c.case||w.case,strap:c.strap||w.strap,bezel:c.bezel||w.bezel,size:w.size,sub:w.sub,sec:w.sec,lume:w.lume,label:w.label,label2:w.label2,wr:w.wr,title:tx(w.name)},extra||{});}
const wsvg=(w,cfg,extra)=>renderWatch(wopts(w,cfg,extra));
/* lazy: an empty <svg class="w"> with the right viewBox keeps the layout; the watch is drawn when it nears the viewport */
const LZ=new Map();let LZN=0;
function lw(w,cfg,extra){const o=wopts(w,cfg,extra);const k='z'+(++LZN);LZ.set(k,o);return `<svg class="${o.cls||'w'} lz" viewBox="${watchVB(o)}" data-lz="${k}" role="img" aria-label="${esc(o.title||'Yema')}"></svg>`;}

/* ---------- illustrations ---------- */
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
 if(kind==='expo')return `<svg viewBox="0 0 360 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="ex1" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#E7B25E"/><stop offset=".4" stop-color="#9A5A1E"/><stop offset="1" stop-color="#1B1008"/></radialGradient><filter id="exb"><feGaussianBlur stdDeviation="6"/></filter><linearGradient id="exf" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="#0F1B2D" stop-opacity="0"/><stop offset="1" stop-color="#0F1B2D" stop-opacity=".92"/></linearGradient></defs><rect width="360" height="400" fill="url(#ex1)"/><g filter="url(#exb)">${[[40,60,14],[90,30,9],[150,80,18],[230,40,12],[300,90,16],[330,30,8],[60,150,10],[270,160,12],[190,20,7]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#FFE2A8" opacity=".75"/>`).join('')}</g><path d="M290 250 q-18 -40 -8 -80 h36 q10 40 -8 80 z M300 250 v70 M284 322 h32" stroke="#FCE6B8" stroke-opacity=".55" stroke-width="2.2" fill="#FCE6B8" fill-opacity=".08"/><path d="M40 270 q-14 -34 -6 -64 h28 q8 30 -6 64 z M48 270 v56 M36 328 h24" stroke="#FCE6B8" stroke-opacity=".45" stroke-width="2" fill="#FCE6B8" fill-opacity=".06"/><g transform="translate(128 8) scale(.52)">${renderWatch({type:'diver',dial:'black',bezel:'black',case:'bronze',strap:'leather',size:41,cls:'',sec:'#D8A866',lume:'#E6D3A6',label:'SUPERMAN',label2:'1963 · 2026'}).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g><rect width="360" height="400" fill="url(#exf)"/></svg>`;
 return `<svg viewBox="0 0 360 340" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="cc1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B1E1A"/><stop offset=".5" stop-color="#1D1622"/><stop offset="1" stop-color="#0F1B2D"/></linearGradient><radialGradient id="cc2" cx=".5" cy="0" r=".7"><stop offset="0" stop-color="#F3C77E" stop-opacity=".75"/><stop offset="1" stop-color="#F3C77E" stop-opacity="0"/></radialGradient><filter id="ccb"><feGaussianBlur stdDeviation="4"/></filter></defs><rect width="360" height="340" fill="url(#cc1)"/><rect width="360" height="200" fill="url(#cc2)"/>${[30,110,190,270].map(x=>`<path d="M${x} 330 V150 a40 40 0 0 1 80 0 V330" fill="#0B0F17" fill-opacity=".45" stroke="#C9A96A" stroke-opacity=".25"/>`).join('')}<g filter="url(#ccb)">${[-60,-30,0,30,60].map(d=>`<circle cx="${180+d}" cy="${40+Math.abs(d)/3}" r="5" fill="#FFE0A0"/>`).join('')}</g><path d="M120 50 Q180 90 240 50 M140 58 Q180 80 220 58" stroke="#E8C98E" stroke-opacity=".6" fill="none" stroke-width="1.5"/><path d="M180 0 V50" stroke="#E8C98E" stroke-opacity=".5"/><rect y="170" width="360" height="170" fill="#0F1B2D" opacity=".55"/></svg>`;
}
function articleArt(kind){
 if(kind==='calibre'){const gear=(x,y,r,n,c,rot)=>{let d='';for(let i=0;i<n;i++){const a1=(i/n)*Math.PI*2,a2=((i+.5)/n)*Math.PI*2;d+=`${i?'L':'M'}${f1(x+Math.cos(a1)*r)} ${f1(y+Math.sin(a1)*r)}L${f1(x+Math.cos(a1)*(r+5))} ${f1(y+Math.sin(a1)*(r+5))}L${f1(x+Math.cos(a2)*(r+5))} ${f1(y+Math.sin(a2)*(r+5))}L${f1(x+Math.cos(a2)*r)} ${f1(y+Math.sin(a2)*r)}`;}return`<g transform="rotate(${rot} ${x} ${y})"><path d="${d}z" fill="${c}" stroke="#3A2A12" stroke-width=".6"/><circle cx="${x}" cy="${y}" r="${r*.62}" fill="none" stroke="#3A2A12" stroke-opacity=".5" stroke-width="${r*.2}"/><circle cx="${x}" cy="${y}" r="3" fill="#A51E36"/></g>`;};
  return `<svg viewBox="0 0 360 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="ca1" cx=".6" cy=".4" r=".8"><stop offset="0" stop-color="#8E959D"/><stop offset="1" stop-color="#23282E"/></radialGradient></defs><rect width="360" height="180" fill="url(#ca1)"/>${Array.from({length:14},(_,i)=>`<path d="M${i*30-60} 0 l120 180" stroke="#fff" stroke-opacity=".08" stroke-width="9"/>`).join('')}${gear(120,90,46,28,'#D8B878',8)}${gear(200,60,26,18,'#C9A96A',-4)}${gear(250,120,34,22,'#B8914E',12)}${gear(60,40,20,14,'#D8B878',0)}<circle cx="310" cy="50" r="28" fill="none" stroke="#E6CF9C" stroke-width="3"/><path d="M310 22v56M282 50h56" stroke="#E6CF9C" stroke-width="1.6"/></svg>`;}
 if(kind==='archives')return `<svg viewBox="0 0 360 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="360" height="180" fill="#C8B38A"/><rect x="18" y="14" width="200" height="160" fill="#E8DCC0" transform="rotate(-4 118 94)"/>${Array.from({length:9},(_,i)=>`<path d="M36 ${40+i*14} q40 -4 80 0 t80 0" stroke="#6B5A3A" stroke-opacity=".45" fill="none" transform="rotate(-4 118 94)"/>`).join('')}<text x="40" y="32" font-family="Playfair Display,Georgia,serif" font-size="14" fill="#5A4726" transform="rotate(-4 118 94)">Superman · 1963</text><circle cx="300" cy="150" r="46" fill="none" stroke="#8C7550" stroke-opacity=".35" stroke-width="6"/><g transform="translate(196 -52) scale(.72)">${renderWatch({type:'diver',dial:'orange',bezel:'black',case:'brushed',strap:'leather',size:39,cls:'',lume:'#F4F1EA',sec:'#16120C',label:'SUPERMAN',label2:'1963'}).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g></svg>`;
 return `<svg viewBox="0 0 360 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="at1" cx=".3" cy=".4" r=".9"><stop offset="0" stop-color="#2C4468"/><stop offset="1" stop-color="#0B1321"/></radialGradient></defs><rect width="360" height="180" fill="url(#at1)"/><rect x="0" y="130" width="360" height="50" fill="#5A3A22"/><rect x="0" y="126" width="360" height="6" fill="#7A5232"/><circle cx="110" cy="80" r="44" fill="#0B1321" stroke="#C9A96A" stroke-width="5"/><circle cx="110" cy="80" r="36" fill="#1A2A44" opacity=".8"/><path d="M150 110 l60 40" stroke="#C9A96A" stroke-width="8" stroke-linecap="round"/><path d="M230 120 l70 -60 M244 124 l70 -60" stroke="#C0C6CE" stroke-width="3" stroke-linecap="round"/><circle cx="320" cy="40" r="8" fill="#E8D3A2" opacity=".5"/></svg>`;
}
function emptyArt(kind){
 const g='#C9A96A';
 if(kind==='wish')return `<svg class="ill" viewBox="0 0 150 150" aria-hidden="true"><circle cx="75" cy="75" r="62" fill="${g}" fill-opacity=".06" stroke="${g}" stroke-opacity=".25"/><path d="M75 112s-30-18-37-36c-4-12 3-26 17-26 8 0 13 4 20 12 7-8 12-12 20-12 14 0 21 14 17 26-7 18-37 36-37 36z" fill="none" stroke="${g}" stroke-width="2"/><path d="M60 72h30M75 57v30" stroke="${g}" stroke-width="1.4" stroke-dasharray="3 3" opacity=".6"/></svg>`;
 if(kind==='search')return `<svg class="ill" viewBox="0 0 150 150" aria-hidden="true"><circle cx="75" cy="75" r="62" fill="${g}" fill-opacity=".06" stroke="${g}" stroke-opacity=".25"/><circle cx="68" cy="68" r="26" fill="none" stroke="${g}" stroke-width="2"/><path d="M87 87l20 20" stroke="${g}" stroke-width="3" stroke-linecap="round"/><circle cx="68" cy="68" r="14" fill="none" stroke="${g}" stroke-opacity=".5"/><path d="M68 58v10l6 4" stroke="${g}" stroke-width="1.6" stroke-linecap="round"/></svg>`;
 if(kind==='notif')return `<svg class="ill" viewBox="0 0 150 150" aria-hidden="true"><circle cx="75" cy="75" r="62" fill="${g}" fill-opacity=".06" stroke="${g}" stroke-opacity=".25"/><path d="M52 92V72a23 23 0 0 1 46 0v20l6 8H46z" fill="none" stroke="${g}" stroke-width="2"/><path d="M68 106a7 7 0 0 0 14 0" fill="none" stroke="${g}" stroke-width="2"/><text x="100" y="54" font-family="Playfair Display,Georgia,serif" font-size="16" fill="${g}" opacity=".7">z</text><text x="110" y="42" font-family="Playfair Display,Georgia,serif" font-size="11" fill="${g}" opacity=".5">z</text></svg>`;
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
