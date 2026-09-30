
/* ================= alive: ticking hands, lazy watches, micro-interactions ================= */
const LIVE=new Set();
function setHands(s,now){
 if(!s._h){s._h=s.querySelectorAll('.hh');s._m=s.querySelectorAll('.hm');s._s=s.querySelectorAll('.hs');s._g=s.querySelectorAll('.hg');s._u=s.querySelector('.hsub');}
 const d=new Date(now+(+s.dataset.off||0));const h=d.getHours(),m=d.getMinutes();
 const sec=s.dataset.hack!=null?+s.dataset.hack:d.getSeconds()+(RM?0:d.getMilliseconds()/1000);
 const r=(l,a)=>{const t=`rotate(${a.toFixed(2)} 100 160)`;for(const g of l)g.setAttribute('transform',t);};
 r(s._h,(h%12+m/60+sec/3600)*30);r(s._m,(m+sec/60)*6);r(s._s,sec*6);r(s._g,(h+m/60)*15+45);
 if(s._u)s._u.setAttribute('transform',`rotate(${(sec*6).toFixed(2)} ${s._u.dataset.x} ${s._u.dataset.y})`);
}
const HAS_IO='IntersectionObserver' in window;
function fillLazy(el){const o=LZ.get(el.dataset.lz);if(!o||!el.isConnected)return;LZ.delete(el.dataset.lz);const t=document.createElement('div');t.innerHTML=renderWatch(o);const n=t.firstElementChild;if(!RM)n.style.animation='wIn .5s var(--ease)';el.replaceWith(n);}
const lzIO=HAS_IO?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){lzIO.unobserve(e.target);fillLazy(e.target);}}),{rootMargin:'300px'}):null;
const liveIO=HAS_IO?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){LIVE.add(e.target);setHands(e.target,Date.now());}else LIVE.delete(e.target);})):null;
function scanNode(n){if(n.nodeType!==1)return;const q=(sel)=>n.matches(sel)?[n]:n.querySelectorAll(sel);q('svg.lz').forEach(e=>lzIO?lzIO.observe(e):fillLazy(e));if(liveIO)q('svg[data-live]').forEach(e=>liveIO.observe(e));}
new MutationObserver(ms=>{for(const m of ms)m.addedNodes.forEach(scanNode);}).observe(app,{childList:true,subtree:true});
let lastT=0;
function tickLoop(t){if(!document.hidden&&t-lastT>45){lastT=t;const now=Date.now();LIVE.forEach(s=>{if(!s.isConnected){LIVE.delete(s);if(liveIO)liveIO.unobserve(s);return;}setHands(s,now);});}if(RM)setTimeout(()=>tickLoop(performance.now()+1000),1000);else requestAnimationFrame(tickLoop);}
requestAnimationFrame(tickLoop);

/* gold particles (success moments only) */
function confetti(fx,fy){if(RM||NOSAVE)return;const r=app.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);const c=document.createElement('canvas');c.className='fx';c.width=r.width*dpr;c.height=r.height*dpr;layer.appendChild(c);const x=c.getContext('2d');x.scale(dpr,dpr);
 const cols=['#E8D3A2','#C9A96A','#D4B36F','#F7F2E8','#B8914E'];const P=Array.from({length:64},()=>({x:r.width*fx,y:r.height*fy,vx:(Math.random()-.5)*7.5,vy:-Math.random()*6.5-2,g:.15+Math.random()*.08,s:2+Math.random()*4.5,a:Math.random()*6,va:(Math.random()-.5)*.3,c:cols[Math.random()*cols.length|0],o:Math.random()<.4}));
 let f=0;const st=()=>{x.clearRect(0,0,r.width,r.height);f++;const al=Math.max(0,1-f/88);for(const p of P){p.vy+=p.g;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;x.globalAlpha=al;x.fillStyle=p.c;x.save();x.translate(p.x,p.y);x.rotate(p.a);if(p.o){x.beginPath();x.arc(0,0,p.s/2,0,7);x.fill();}else x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore();}if(f<90)requestAnimationFrame(st);else c.remove();};st();}

/* live limited-edition counter */
let seenN=43;
function dropCard(){return `<button class="drop" type="button" data-act="pdp" data-id="sh"><span class="dw">${lw(W('sh'),null,{view:'crop'})}</span><span class="dx"><span class="lbl g">${L('Édition limitée · accès VIP','Limited edition · VIP access')}</span><b class="h3">Superman Heritage 1/500</b><span class="dl"><b data-left>${S.left}</b> ${L('exemplaires restants','pieces left')}</span><span class="dbar"><i data-leftbar style="width:${((500-S.left)/5).toFixed(1)}%"></i></span><span class="dseen"><span class="pulse"></span><span><b data-seen>${seenN}</b> ${L('membres la regardent','members viewing')}</span></span></span></button>`;}
function updLive(bump){$$('[data-left]',app).forEach(e=>{e.textContent=S.left;if(bump&&!RM){e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump');}});$$('[data-sold]',app).forEach(e=>e.textContent=500-S.left);$$('[data-leftbar]',app).forEach(e=>e.style.width=((500-S.left)/5).toFixed(1)+'%');$$('[data-seen]',app).forEach(e=>e.textContent=seenN);}
setInterval(()=>{if(document.hidden||NOSAVE)return;seenN=Math.max(24,Math.min(76,seenN+Math.round((Math.random()-.45)*4)));let b=false;if(Math.random()<.16&&S.left>19){S.left--;save();b=true;}updLive(b);},3200);

/* stories ("Nouveautés" viewer) */
const STORIES=[
 {id:'ltd',lbl:'1/500',w:'sh',bg:'radial-gradient(120% 70% at 50% 35%,#2B4E8C,#0B1428 70%)',k:{fr:'Accès anticipé VIP',en:'VIP early access'},t:{fr:'Superman Heritage 1/500',en:'Superman Heritage 1/500'},x:()=>L(`Lunette bleu marine verrouillable, calibre YEMA3000. Plus que ${S.left} exemplaires.`,`Lockable navy bezel, YEMA3000 calibre. Only ${S.left} pieces left.`),cta:{fr:'Voir la pièce',en:'View the piece'},go:()=>go('pdp',{id:'sh'})},
 {id:'atelier',lbl:{fr:'Atelier',en:'Workshop'},art:'calibre',bg:'linear-gradient(180deg,#30353D,#0B1321)',k:{fr:'Coulisses',en:'Behind the scenes'},t:{fr:'7 jours de contrôle par calibre',en:'7 days of testing per calibre'},x:()=>L('Six positions, trois températures, −4/+6 secondes par jour.','Six positions, three temperatures, −4/+6 seconds a day.'),cta:{fr:'Lire l’article',en:'Read the article'},go:()=>go('article',{k:'calibre'})},
 {id:'expo',lbl:'Expo',w:'sbronze',bg:'radial-gradient(120% 70% at 50% 30%,#8A5A22,#1B1008 75%)',k:{fr:'Invitation',en:'Invitation'},t:{fr:'Exposition Héritage · Paris',en:'Heritage Exhibition · Paris'},x:()=>L('Samedi 12 décembre 2026 · réservé aux membres du Club.','Saturday 12 December 2026 · Club members only.'),cta:{fr:'Réserver',en:'Reserve'},go:()=>switchTab('club',{seg:'news',open:'expo'})},
 {id:'r60',lbl:'Rallygraf',w:'rrp',bg:'radial-gradient(120% 70% at 50% 30%,#3A3F48,#0B0D12 75%)',k:{fr:'Bientôt',en:'Coming soon'},t:{fr:'Rallygraf · 60 ans',en:'Rallygraf · 60 years'},x:()=>L('Lancement le 15 novembre. Activez l’alerte pour y accéder en premier.','Launching 15 November. Turn on the alert to get in first.'),cta:{fr:'Voir les lancements',en:'See launches'},go:()=>switchTab('club',{seg:'launch'})}
];
const calThumb=`<svg class="w" viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="#C9A96A" stroke-width="2.4"><circle cx="32" cy="32" r="21"/><circle cx="32" cy="32" r="12" opacity=".6"/><path d="M32 8v48M8 32h48"/></g><circle cx="32" cy="32" r="4" fill="#A51E36"/></svg>`;
function storiesRow(){return `<div class="stories hscroll" aria-label="${L('Nouveautés en stories','Stories')}">${STORIES.map((st,i)=>`<button class="sto ${S.seenSt.includes(st.id)?'seen':''}" type="button" data-act="story" data-i="${i}" aria-label="Story : ${esc(tx(st.t))}"><span class="ring"><span class="in">${st.w?lw(W(st.w),null,{view:'crop'}):calThumb}</span></span><small>${esc(tx(st.lbl))}</small></button>`).join('')}</div>`;}
A.story=b=>openStory(+b.dataset.i);
function openStory(i){
 const d=document.createElement('div');d.className='story';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');layer.appendChild(d);
 let cur=i,t0=0,paused=false,raf=0,down=0,y0=null,closed=false;const DUR=5500;
 const draw=()=>{const st=STORIES[cur];if(!S.seenSt.includes(st.id)){S.seenSt.push(st.id);save();}d.style.background=st.bg;d.setAttribute('aria-label',tx(st.t));
  d.innerHTML=`<div class="sbars">${STORIES.map((_,j)=>`<i><b style="width:${j<cur?100:0}%"></b></i>`).join('')}</div><div class="shd"><span class="ai">Y</span><span><b>Yema Watch Club</b><small>${tx(st.k)}</small></span><button class="xbtn" type="button" data-s="x" aria-label="${L('Fermer','Close')}">${ic('close')}</button></div><button class="snav l" type="button" data-s="prev" aria-label="${L('Précédente','Previous')}"></button><button class="snav r" type="button" data-s="next" aria-label="${L('Suivante','Next')}"></button><div class="sbody">${st.w?wsvg(W(st.w),null,{cls:'w sw-w'}):`<div class="sart">${articleArt(st.art)}</div>`}<span class="lbl g">${tx(st.k)}</span><h2 class="h1">${tx(st.t)}</h2><p>${st.x()}</p><button class="btn gold pill" type="button" data-s="go">${tx(st.cta)}${ic('arrow')}</button></div>`;
  t0=performance.now();};
 const close=()=>{if(closed)return;closed=true;cancelAnimationFrame(raf);document.removeEventListener('keydown',kd,true);d.classList.add('out');setTimeout(()=>d.remove(),RM?0:260);if(curEntry&&curEntry.name==='home'){const r=$('.stories',curEl);if(r){const sl=r.scrollLeft;r.outerHTML=storiesRow();const n=$('.stories',curEl);if(n)n.scrollLeft=sl;}}};
 const nav=k=>{if(k<0||k>=STORIES.length){close();return;}cur=k;draw();buzz(5);};
 const loop=t=>{if(closed)return;if(paused)t0+=16;const p=Math.min(1,(t-t0)/DUR);const b=d.querySelectorAll('.sbars b')[cur];if(b)b.style.width=(p*100)+'%';if(p>=1){nav(cur+1);}raf=requestAnimationFrame(loop);};
 const kd=e=>{if(e.key==='Escape'){e.stopPropagation();close();}else if(e.key==='ArrowRight')nav(cur+1);else if(e.key==='ArrowLeft')nav(cur-1);};
 document.addEventListener('keydown',kd,true);
 d.addEventListener('pointerdown',e=>{down=performance.now();y0=e.clientY;paused=true;});
 d.addEventListener('pointerup',e=>{paused=false;if(y0!=null&&e.clientY-y0>90){y0=null;close();}y0=null;});
 d.addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b)return;const held=performance.now()-down>350;const k=b.dataset.s;if(k==='x')close();else if(k==='go'){const st=STORIES[cur];close();setTimeout(st.go,60);}else if(!held)nav(k==='prev'?cur-1:cur+1);});
 draw();raf=requestAnimationFrame(loop);setTimeout(()=>{const x=d.querySelector('[data-s="go"]');if(x)x.focus({preventScroll:true});},60);
}

/* product hero: tilt + moving reflection, lume mode, settable crown */
function pdpAlive(el,p){
 const car=$('#car',el);if(!car)return()=>{};const svgs=$$('.slide svg.w',car),s0=svgs[0],glg=s0&&s0.querySelector('.glg');
 let inp=null,cx=0,cy=0,raf=0,alive=true;
 const onMove=e=>{if(e.pointerType==='touch')return;const r=car.getBoundingClientRect();inp={x:((e.clientX-r.left)/r.width-.5)*2,y:((e.clientY-r.top)/r.height-.5)*2};};
 const onLeave=()=>{inp=null;};
 const onOri=e=>{if(e.gamma==null)return;inp={x:Math.max(-1,Math.min(1,e.gamma/25)),y:Math.max(-1,Math.min(1,(e.beta-45)/25))};};
 car.addEventListener('pointermove',onMove);car.addEventListener('pointerleave',onLeave);window.addEventListener('deviceorientation',onOri);
 const fr=t=>{if(!alive)return;if(!el.isConnected){cleanup();return;}const i=p.slide||0;let x=0,y=0;if(inp){x=inp.x;y=inp.y;}else if(!RM){x=Math.sin(t/1800)*.35;y=Math.cos(t/2400)*.25;}
  cx+=(x-cx)*.07;cy+=(y-cy)*.07;const s=svgs[i];if(s&&i!==3)s.style.transform=`translate(${(cx*7).toFixed(1)}px,${(cy*5).toFixed(1)}px) rotate(${(cx*2.4).toFixed(2)}deg)`;
  if(glg&&i===0){glg.setAttribute('cx',(.5-cx*.4).toFixed(3));glg.setAttribute('cy',(.38-cy*.32).toFixed(3));}raf=requestAnimationFrame(fr);};
 raf=requestAnimationFrame(fr);
 const hit=$('.crownhit',el),st=$('.settime',el);
 const place=()=>{if(!hit||!s0||!s0.isConnected)return;const sr=s0.getBoundingClientRect(),pr=hit.parentElement.getBoundingClientRect();if(!sr.width)return;const R=RADIUS[W(p.id).size]||57;hit.style.left=(sr.left-pr.left+(108+R)/200*sr.width-22)+'px';hit.style.top=(sr.top-pr.top+sr.height/2-22)+'px';};
 setTimeout(place,80);window.addEventListener('resize',place);if(!S.crownTip&&!NOSAVE)setTimeout(()=>{if(!el.isConnected)return;S.crownTip=1;save();toast(L('Astuce : faites tourner la couronne pour régler l’heure','Tip: turn the crown to set the time'),{icon:'clock',ms:3800});},1400);
 const showT=()=>{const d=new Date(Date.now()+(+s0.dataset.off||0));st.textContent=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;st.classList.add('on');clearTimeout(st._t);st._t=setTimeout(()=>st.classList.remove('on'),1400);};
 const nudge=m=>{s0.dataset.off=(+s0.dataset.off||0)+m*60000;setHands(s0,Date.now());showT();buzz(4);};
 if(hit&&s0){let y0=null,off0=0,lastM=0;
  hit.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{hit.setPointerCapture(e.pointerId)}catch(_){}y0=e.clientY;off0=+s0.dataset.off||0;s0.dataset.hack=new Date().getSeconds();hit.classList.add('on');buzz(6);});
  hit.addEventListener('pointermove',e=>{if(y0==null)return;const dm=Math.round((y0-e.clientY)*1.5);s0.dataset.off=off0+dm*60000;setHands(s0,Date.now());showT();if(Math.abs(dm-lastM)>=5){lastM=dm;buzz(3);}});
  const up=()=>{if(y0==null)return;y0=null;delete s0.dataset.hack;hit.classList.add('used');hit.classList.remove('on');};
  hit.addEventListener('pointerup',up);hit.addEventListener('pointercancel',up);
  hit.addEventListener('wheel',e=>{e.preventDefault();nudge(e.deltaY<0?1:-1);},{passive:false});
  hit.addEventListener('keydown',e=>{if(e.key==='ArrowUp'||e.key==='ArrowRight'){e.preventDefault();nudge(5);}else if(e.key==='ArrowDown'||e.key==='ArrowLeft'){e.preventDefault();nudge(-5);}});
  hit.addEventListener('dblclick',()=>{s0.dataset.off=0;setHands(s0,Date.now());showT();});}
 function cleanup(){alive=false;cancelAnimationFrame(raf);window.removeEventListener('deviceorientation',onOri);window.removeEventListener('resize',place);}
 return cleanup;
}
A.lume=b=>{const car=$('#car',curEl);const on=!car.classList.contains('lume');car.classList.toggle('lume',on);b.setAttribute('aria-pressed',on);buzz(on?[8,30,8]:6);if(on){const tr=$('#track',curEl);tr.scrollTo({left:0,behavior:RM?'auto':'smooth'});}};

/* compare two watches */
function cmpHTML(d){const a=W(d.a),b=W(d.b);const rows=[[L('Collection','Collection'),w=>COLS[w.col].n],[L('Taille','Size'),w=>w.size+' mm'],[L('Calibre','Calibre'),w=>MOVES[w.move].short],[L('Réserve','Reserve'),w=>MOVES[w.move].res],[L('Étanchéité','Water res.'),w=>w.wr+' m'],[L('Cadran','Dial'),w=>tx(DIALS[w.dial])],[L('Bracelet','Strap'),w=>tx(STRAPS[w.strap])],[L('Prix','Price'),w=>eur(effPrice(w))]];
 return sheetHTML(L('Comparer','Compare'),`<div class="chips cmpk">${WATCHES.filter(w=>w.id!==d.a).map(w=>`<button class="chip" type="button" aria-pressed="${w.id===d.b}" data-act="cmpPick" data-id="${w.id}">${esc(tx(w.name))}</button>`).join('')}</div><div class="cmph">${[a,b].map(w=>`<div><span class="wimg">${wsvg(w)}</span><b class="h3">${esc(tx(w.name))}</b></div>`).join('')}</div>${rows.map(([l,f])=>{const va=f(a),vb=f(b);return `<div class="cmpr ${va!==vb?'diff':''}"><span>${esc(va)}</span><small>${l}</small><span>${esc(vb)}</span></div>`;}).join('')}`,`<button class="btn ghost" type="button" data-act="cmpAR" style="flex:1">${ic('ar')}${L('Essayer','Try on')}</button><button class="btn gold" type="button" data-act="cmpGo" style="flex:1.2">${L('Voir la fiche','View product')}</button>`,L('Deux modèles côte à côte','Two models side by side'));}
A.compare=()=>{const a=W(curEntry.params.id);const b=WATCHES.find(w=>w.id!==a.id&&w.type===a.type)||WATCHES.find(w=>w.id!==a.id);const d={a:a.id,b:b.id};openSheet({label:L('Comparer','Compare'),data:d,html:cmpHTML(d)});};
A.cmpPick=b=>{const o=topSheet();o.data.b=b.dataset.id;setSheet(o,cmpHTML(o.data));buzz();};
A.cmpGo=()=>{const d=topSheet().data;closeSheet();go('pdp',{id:d.b});};
A.cmpAR=()=>{const d=topSheet().data;closeSheet();startAR(d.b);};
