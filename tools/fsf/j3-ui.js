/* ================= shared UI: photos, players, fixtures, countdown, confetti, alive ================= */
const hasPh=id=>!!(id&&CREDITS[id]);
/* photo in a fixed box, skeleton shimmer + blur-up until loaded; falls back to an initials tile */
function pic(id,o){o=o||{};if(!hasPh(id))return o.fb!=null?o.fb:`<span class="ph ok ${o.cls||''}" aria-hidden="true"></span>`;
 const c=CREDITS[id];const src=`img/${o.big?'':'s/'}${id}.webp`;
 return `<span class="ph ${o.cls||''}"${o.style?` style="${o.style}"`:''}><img src="${src}" alt="${esc(o.alt!=null?o.alt:tx(c.alt)||'')}" loading="${o.eager?'eager':'lazy'}" decoding="async" draggable="false"${c.pos?` style="object-position:${c.pos}"`:''}${o.fp?' fetchpriority="high"':''}></span>`;}
function initialsTile(p,cls,size){return `<span class="initials ${cls||''}" role="img" aria-label="${esc(p.n)}"><b style="font-size:${size||34}px">${esc(initials(p.n))}</b>${p.no?`<i style="font-size:${Math.round((size||34)*.62)}px">${p.no}</i>`:''}</span>`;}
function face(p,o){o=o||{};return hasPh(p.ph)?pic(p.ph,Object.assign({alt:p.n},o)):initialsTile(p,o.cls,o.size);}
const isPast=f=>koOf(f,true)<Date.now();
function koOf(f,end){if(f.ko)return Date.parse(f.ko)+(end?2*3600e3:0);if(f.day)return Date.parse((end&&f.end?f.end:f.day)+'T'+(end?'23:59:00Z':'12:00:00Z'));if(f.month){const [y,m]=f.month.split('-').map(Number);return end?Date.UTC(y,m,0,23,59):Date.UTC(y,m-1,1);}return 0;}
const upcoming=(t)=>FIX.filter(f=>!isPast(f)&&(!t||t==='all'||f.t===t)).sort((a,b)=>koOf(a)-koOf(b));
const nextLions=()=>upcoming('A').find(f=>f.ko)||null;
function whenTxt(f,short){if(f.ko)return `${fday(f.ko)} · ${ftime(f.ko)} GMT`;if(f.day&&f.end)return `${fdate(f.day,{day:'numeric',month:'short'})} – ${fdate(f.end,{day:'numeric',month:'short',year:'numeric'})}`;if(f.day)return fday(f.day);if(f.month)return fdate(f.month+'-15',{month:'long',year:'numeric'})+(short?'':' · '+L('dates à confirmer','dates TBC'));return '';}
const vTxt=f=>tx(f.v)+(f.c?' · '+f.c:'');

/* fixture card (calendar) */
function fixCard(f){const al=!!S.alerts[f.id];const t=TEAM(f.t);
 return `<article class="fx-card st" data-fid="${f.id}"><div class="fx-top"><span class="tchip t-${f.t}">${tx(t.n)}</span><span class="lbl">${esc(tx(f.comp))}</span></div>
 <div class="fx-mid"><div class="tm">${flag(f.h,34)}<b>${esc(nat(f.h))}</b></div><div class="vs"><span class="disp">${f.ko?ftime(f.ko):'VS'}</span><small>${f.ko?'GMT':''}</small></div><div class="tm r">${f.a?flag(f.a,34):`<span class="flag tbc" style="width:34px;height:34px">${ic('trophy')}</span>`}<b>${f.a?esc(nat(f.a)):L('Tournoi','Tournament')}</b></div></div>
 <div class="fx-bot"><span>${ic('cal')}${esc(whenTxt(f,true))}</span><span>${ic('pin')}${esc(vTxt(f))}</span><button class="ib bellb" type="button" data-act="alert" data-id="${f.id}" aria-pressed="${al}" aria-label="${L('Alerte match','Match alert')}">${ic(al?'bellon':'bell')}</button></div>
 ${f.tbc?`<div class="fx-tbc">${ic('info')}${L('Date et stade pas encore annoncés par la FSF','Date and venue not yet announced by the FSF')}</div>`:''}</article>`;}
/* result card */
function resCard(r){const w=(r.h==='SEN'&&r.hs>r.as)||(r.a==='SEN'&&r.as>r.hs),d=r.hs===r.as;
 const tags=[r.aet?`<span class="tg">${L('a.p.','a.e.t.')}</span>`:'',r.replay?`<span class="tg rp">${ic('play')}${L('Revivre en direct','Relive live')}</span>`:'',r.disp?`<span class="tg dp">${L('Résultat contesté','Disputed')}</span>`:''].join('');
 return `<button class="rs-card st ${w?'w':d?'d':'l'}" type="button" data-act="result" data-id="${r.id}"><div class="rs-l"><span class="lbl">${esc(tx(r.comp))}</span><span class="small">${fdate(r.d,{day:'numeric',month:'short',year:'numeric'})} · ${esc(r.v)}</span>${tags?`<span class="rs-tags">${tags}</span>`:''}</div>
 <div class="rs-s"><span class="t">${flag(r.h,22)}<b>${r.h}</b></span><span class="rsc disp tn">${r.hs}<i>–</i>${r.as}</span><span class="t">${flag(r.a,22)}<b>${r.a}</b></span></div></button>`;}
/* ---------- flip-digit countdown ---------- */
const CDT=new Set();
function cdHTML(){const u=(k,l)=>`<div class="u"><div class="ds">${'<span class="fl" data-k="'+k+'0"><span class="t"><em>0</em></span><span class="b"><em>0</em></span><span class="ft"><em>0</em></span><span class="fb"><em>0</em></span></span>'+'<span class="fl" data-k="'+k+'1"><span class="t"><em>0</em></span><span class="b"><em>0</em></span><span class="ft"><em>0</em></span><span class="fb"><em>0</em></span></span>'}</div><small>${l}</small></div>`;
 return `<div class="cd" role="timer">${u('d',L('Jours','Days'))}<span class="sep">:</span>${u('h',L('Heures','Hours'))}<span class="sep">:</span>${u('m','Min')}<span class="sep">:</span>${u('s',L('Sec','Sec'))}</div>`;}
function mountCountdown(root,target){const el=$('.cd',root);if(!el)return;const cur={};
 const setD=(k,v,animate)=>{const n=$(`[data-k="${k}"]`,el);if(!n)return;const old=cur[k];if(old===v)return;cur[k]=v;const [t,b,ft,fb]=$$(':scope>span>em',n);
  if(!animate||RM||NOSAVE||old==null){t.textContent=b.textContent=ft.textContent=fb.textContent=v;return;}
  ft.textContent=old;b.textContent=old;t.textContent=v;fb.textContent=v;n.classList.remove('go');void n.offsetWidth;n.classList.add('go');setTimeout(()=>{b.textContent=v;n.classList.remove('go');},640);};
 const tick=(a)=>{if(!el.isConnected){CDT.delete(tick);return;}let s=Math.max(0,Math.floor((target-Date.now())/1000));const d=Math.min(99,Math.floor(s/86400));s-=d*86400;const h=Math.floor(s/3600);s-=h*3600;const m=Math.floor(s/60);s-=m*60;
  [['d',d],['h',h],['m',m],['s',s]].forEach(([k,v])=>{const t=String(v).padStart(2,'0');setD(k+'0',t[0],a);setD(k+'1',t[1],a);});el.setAttribute('aria-label',`${d} ${L('jours','days')} ${h} h ${m} min`);};
 tick(false);CDT.add(tick);}
setInterval(()=>CDT.forEach(f=>f(true)),1000);

/* ---------- confetti in flag colours ---------- */
function confetti(fx,fy,n){if(RM||NOSAVE)return;const r=app.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);const c=document.createElement('canvas');c.className='fx';c.width=r.width*dpr;c.height=r.height*dpr;layer.appendChild(c);const x=c.getContext('2d');x.scale(dpr,dpr);
 const cols=['#00853F','#1DB86A','#FDEF42','#FFF59A','#E31B23','#F3F1E4'];const P=Array.from({length:n||90},()=>({x:r.width*fx,y:r.height*fy,vx:(Math.random()-.5)*9,vy:-Math.random()*8-3,g:.16+Math.random()*.08,s:3+Math.random()*5,a:Math.random()*6,va:(Math.random()-.5)*.3,c:cols[Math.random()*cols.length|0],t:Math.random()<.18?2:Math.random()<.5?1:0}));
 const star=(s)=>{x.beginPath();for(let i=0;i<10;i++){const rr=i%2?s*.42:s,a=i*Math.PI/5-Math.PI/2;x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}x.closePath();x.fill();};
 let f=0;const st=()=>{x.clearRect(0,0,r.width,r.height);f++;const al=Math.max(0,1-f/110);for(const p of P){p.vy+=p.g;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;x.globalAlpha=al;x.fillStyle=p.c;x.save();x.translate(p.x,p.y);x.rotate(p.a);if(p.t===2)star(p.s);else if(p.t===1){x.beginPath();x.arc(0,0,p.s/2,0,7);x.fill();}else x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore();}if(f<112)requestAnimationFrame(st);else c.remove();};st();}

/* ---------- alive: shared element, sliding pills, tab indicator, parallax ---------- */
let SHARED=null;const PILL={};
app.addEventListener('click',e=>{const t=e.target.closest('[data-act="player"]');if(!t||!app.contains(t))return;const img=t.querySelector('.ph img');SHARED=img&&img.complete&&img.naturalWidth?{img,to:'player',at:performance.now()}:null;},true);
function takeShared(name){const s=SHARED;SHARED=null;return s&&s.to===name&&performance.now()-s.at<700&&!RM?s:null;}
const heroOf=e=>e.el&&e.el.querySelector('.pl-hero .ph img');
function flyImg(srcImg,r0,r1,ms,rad){const ar=app.getBoundingClientRect();const c=document.createElement('img');c.src=srcImg.currentSrc||srcImg.src;c.className='flip';c.style.cssText=`left:${r1.left-ar.left}px;top:${r1.top-ar.top}px;width:${r1.width}px;height:${r1.height}px;object-position:${getComputedStyle(srcImg).objectPosition}`;layer.appendChild(c);
 return c.animate([{transform:`translate(${r0.left-r1.left}px,${r0.top-r1.top}px) scale(${r0.width/r1.width},${r0.height/r1.height})`,borderRadius:rad||'16px'},{transform:'none',borderRadius:'0px'}],{duration:ms||440,easing:EASE}).finished.then(()=>c,()=>c);}
function sharedPush(prev,e,sh,done){const t=heroOf(e);if(!t||!document.contains(sh.img))return false;e.shared={id:e.params.id};
 const r0=sh.img.getBoundingClientRect(),r1=t.getBoundingClientRect();if(!r0.width||!r1.width)return false;
 const sp=sh.img.parentNode;sp.style.visibility='hidden';t.style.visibility='hidden';buzz(6);
 Promise.all([flyImg(sh.img,r0,r1,460),anim(e.el,[{opacity:0},{opacity:1}],320),anim(dimOf(prev),[{opacity:0},{opacity:.4}],320)]).then(([c])=>{t.style.visibility='';sp.style.visibility='';requestAnimationFrame(()=>c.remove());done();});return true;}
function sharedPop(prev,e,done){const t=heroOf(e);const ar=app.getBoundingClientRect();const s=[...prev.el.querySelectorAll(`[data-act="player"][data-id="${e.shared.id}"] .ph img`)].find(i=>{const r=i.getBoundingClientRect();return r.width&&r.bottom>ar.top+60&&r.top<ar.bottom-80;});
 if(!t||!s)return false;const r0=t.getBoundingClientRect(),r1=s.getBoundingClientRect();s.parentNode.style.visibility='hidden';t.style.visibility='hidden';
 const c=document.createElement('img');c.src=t.currentSrc||t.src;c.className='flip';c.style.cssText=`left:${r1.left-ar.left}px;top:${r1.top-ar.top}px;width:${r1.width}px;height:${r1.height}px;object-position:${getComputedStyle(t).objectPosition}`;layer.appendChild(c);
 Promise.all([c.animate([{transform:`translate(${r0.left-r1.left}px,${r0.top-r1.top}px) scale(${r0.width/r1.width},${r0.height/r1.height})`,borderRadius:'0px'},{transform:'none',borderRadius:'16px'}],{duration:400,easing:EASE}).finished,anim(e.el,[{opacity:1},{opacity:0}],260),anim(dimOf(prev),[{opacity:.4},{opacity:0}],300)]).then(()=>{s.parentNode.style.visibility='';requestAnimationFrame(()=>c.remove());done();});return true;}
function pills(el,e){$$('.seg[role="tablist"]',el).forEach((c,i)=>{let ind=c.querySelector(':scope>.pind');if(!ind){ind=document.createElement('i');ind.className='pind';c.prepend(ind);}const a=c.querySelector('[aria-selected="true"]');if(!a){ind.style.opacity=0;return;}
 const k=(e?e.name:'s')+i,n={x:a.offsetLeft,w:a.offsetWidth},o=PILL[k];PILL[k]=n;ind.style.opacity=1;
 if(o&&(o.x!==n.x||o.w!==n.w)&&!RM){ind.style.transition='none';ind.style.transform=`translateX(${o.x}px)`;ind.style.width=o.w+'px';ind.offsetWidth;ind.style.transition='';}
 ind.style.transform=`translateX(${n.x}px)`;ind.style.width=n.w+'px';});}
function parallax(el){const sc=$('.sc',el),h=$('[data-par]',el);if(!sc||!h||RM)return;let r=0;sc.addEventListener('scroll',()=>{cancelAnimationFrame(r);r=requestAnimationFrame(()=>{const y=sc.scrollTop;if(y<480){h.style.transform=`translate3d(0,${y*.42}px,0) scale(${1+Math.max(0,-y)/600})`;const o=$('[data-fade]',el);if(o)o.style.opacity=String(Math.max(0,1-y/260));}});},{passive:true});}
function aliveBuild(el,e,fresh){
 if(fresh&&!RM&&e.name!=='splash'){el.classList.add('enter');setTimeout(()=>el.classList.remove('enter'),1200);}
 pills(el,e);parallax(el);
}
let LASTTAB=null;
function tabInd(){let ind=tabbar.querySelector('.tbi');if(!ind){ind=document.createElement('i');ind.className='tbi';tabbar.prepend(ind);}const i=TABDEF.findIndex(t=>t[0]===NAV.tab);ind.style.transform=`translateX(${i*100}%)`;ind.style.opacity=NAV.mode==='tabs'?1:0;
 if(NAV.mode==='tabs'&&LASTTAB&&LASTTAB!==NAV.tab&&!RM){const b=tabbar.querySelector(`[data-tab="${NAV.tab}"] .ic`);if(b)b.animate([{transform:'scale(1)'},{transform:'scale(.8) translateY(2px)',offset:.3},{transform:'scale(1.14) translateY(-3px)',offset:.65},{transform:'none'}],{duration:480,easing:'ease-out'});}LASTTAB=NAV.tab;}
/* level-up overlay for the supporter card */
function levelUp(i){if(NOSAVE)return;const d=document.createElement('div');d.className='lvlup';d.innerHTML=`<div class="lv-in">${lionSVG()}<span class="kick">${L('Nouveau niveau','New level')}</span><b class="disp">${esc(tx(LEVELS[i].n))}</b></div>`;layer.appendChild(d);buzz([20,40,60]);confetti(.5,.42,120);d.addEventListener('click',()=>d.remove());setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),500);},2200);}
/* external links: always new tab, safe */
const ext=(u,label,cls)=>`<a class="${cls||'lnk'}" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${label}${cls?'':ic('ext')}</a>`;
const demoTag=t=>`<span class="demo">${ic('info')}${t||L('Démo','Demo')}</span>`;
const realTag=t=>`<span class="real">${ic('check')}${t||L('Données réelles','Real data')}</span>`;
