
/* ================= alive: shared-element transitions, sliding pills, tickers, parallax ================= */
let SHARED=null;const PILL={},TICK={},ORDST={};
/* remember the photo the user tapped, to morph it into the next screen */
app.addEventListener('click',e=>{const t=e.target.closest('[data-act="pdp"],[data-act="watch"],[data-act="wishOpen"]');if(!t||!app.contains(t)||e.target.closest('.heart'))return;const img=t.querySelector('.ph img');SHARED=img&&img.complete&&img.naturalWidth?{img,to:t.dataset.act==='watch'?'watch':'pdp',at:performance.now()}:null;},true);
function takeShared(name){const s=SHARED;SHARED=null;return s&&s.to===name&&performance.now()-s.at<700&&!RM?s:null;}
const heroOf=e=>e.el&&e.el.querySelector(e.name==='pdp'?'.gal .slide img':'.dhero .ph img');
function flyImg(srcImg,r0,r1,ms){const ar=app.getBoundingClientRect();const c=document.createElement('img');c.src=srcImg.currentSrc||srcImg.src;c.className='flip';c.style.cssText=`left:${r1.left-ar.left}px;top:${r1.top-ar.top}px;width:${r1.width}px;height:${r1.height}px`;layer.appendChild(c);
 return c.animate([{transform:`translate(${r0.left-r1.left}px,${r0.top-r1.top}px) scale(${r0.width/r1.width},${r0.height/r1.height})`},{transform:'none'}],{duration:ms||420,easing:EASE}).finished.then(()=>c,()=>c);}
function sharedPush(prev,e,sh,done){const t=heroOf(e);if(!t||!document.contains(sh.img))return false;e.shared={id:e.params.id||e.params.oid};
 const r0=sh.img.getBoundingClientRect(),r1=t.getBoundingClientRect();if(!r0.width||!r1.width)return false;
 const sp=sh.img.parentNode;sp.style.visibility='hidden';t.style.visibility='hidden';buzz(6);
 Promise.all([flyImg(sh.img,r0,r1,440),anim(e.el,[{opacity:0},{opacity:1}],300),anim(dimOf(prev),[{opacity:0},{opacity:.35}],300)]).then(([c])=>{t.style.visibility='';sp.style.visibility='';requestAnimationFrame(()=>c.remove());done();});return true;}
function sharedPop(prev,e,done){const t=heroOf(e);const sel=e.name==='pdp'?`[data-act="pdp"][data-id="${e.shared.id}"] .ph img,[data-act="wishOpen"] .ph img`:`[data-act="watch"][data-oid="${e.shared.id}"] .ph img`;
 const ar=app.getBoundingClientRect();const s=[...prev.el.querySelectorAll(sel)].find(i=>{const r=i.getBoundingClientRect();return r.width&&r.bottom>ar.top+40&&r.top<ar.bottom-60&&r.left>=ar.left-2&&r.right<=ar.right+2;});
 if(!t||!s)return false;const r0=t.getBoundingClientRect(),r1=s.getBoundingClientRect();s.parentNode.style.visibility='hidden';t.style.visibility='hidden';
 Promise.all([flyImg(t,r0,r1,400),anim(e.el,[{opacity:1},{opacity:0}],260),anim(dimOf(prev),[{opacity:.35},{opacity:0}],300)]).then(([c])=>{s.parentNode.style.visibility='';requestAnimationFrame(()=>c.remove());done();});return true;}

/* sliding active pill behind segmented controls */
function pills(el,e){$$('.pills,.seg[role="tablist"]',el).forEach((c,i)=>{let ind=c.querySelector(':scope>.pind');if(!ind){ind=document.createElement('i');ind.className='pind';c.prepend(ind);}const a=c.querySelector('[aria-selected="true"]');if(!a){ind.style.opacity=0;return;}
 const k=e.name+i,n={x:a.offsetLeft,w:a.offsetWidth},o=PILL[k];PILL[k]=n;ind.style.opacity=1;
 if(o&&(o.x!==n.x||o.w!==n.w)&&!RM){ind.style.transition='none';ind.style.transform=`translateX(${o.x}px)`;ind.style.width=o.w+'px';ind.offsetWidth;ind.style.transition='';}
 ind.style.transform=`translateX(${n.x}px)`;ind.style.width=n.w+'px';});}
/* price & total tickers */
function ticks(root){$$('[data-tk]',root).forEach(el=>{const k=el.dataset.tk,v=+el.dataset.v,o=TICK[k];TICK[k]=v;if(o==null||o===v||RM)return;const t0=performance.now(),d=480;const f=t=>{const p=Math.min(1,(t-t0)/d),q=1-Math.pow(1-p,3);el.textContent=eur(Math.round(o+(v-o)*q));if(p<1&&el.isConnected)requestAnimationFrame(f);};requestAnimationFrame(f);el.classList.remove('tkf');void el.offsetWidth;el.classList.add('tkf');});}
function aliveSheet(sh){ticks(sh);}
function aliveBuild(el,e,fresh){
 if(fresh&&!RM&&e.name!=='ar'&&e.name!=='splash'){el.classList.add('enter');setTimeout(()=>el.classList.remove('enter'),1100);}
 pills(el,e);ticks(el);
 if(e.name==='pdp')pdpAlive(el,e);
 if(e.name==='article'){const sc=$('.sc',el),h=$('.hero svg',el);let r=0;sc.addEventListener('scroll',()=>{cancelAnimationFrame(r);r=requestAnimationFrame(()=>{const y=sc.scrollTop;if(y<320)h.style.transform=`translateY(${y*.4}px) scale(${1+y/1200})`;});},{passive:true});}
 if(e.name==='order')orderAlive(el,e);
 if(e.name==='collection'&&NAV.tab==='collection')lsSet('yema-coll','1');
}
/* product hero: layered parallax (pointer or tilt), idle float, crystal light sweep, neighbour scale */
function pdpAlive(el,e){const gal=$('#gal',el),tr=$('#track',el);if(!gal)return;const slides=$$('.slide',tr);
 const hero=slides[0]&&slides[0].querySelector('.ph');if(hero&&!RM){const im=hero.querySelector('img');const sw=document.createElement('span');sw.className='sweep';const u=`url("${im.getAttribute('src')}")`;sw.style.webkitMaskImage=sw.style.maskImage=u;hero.appendChild(sw);}
 let tx=0,ty=0,cx=0,cy=0,raf=0,run=false;
 const loop=()=>{cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;gal.style.setProperty('--px',cx.toFixed(3));gal.style.setProperty('--py',cy.toFixed(3));if(Math.abs(tx-cx)+Math.abs(ty-cy)>.002&&el.isConnected)raf=requestAnimationFrame(loop);else run=false;};
 const kick=()=>{if(!run&&!RM){run=true;raf=requestAnimationFrame(loop);}};
 gal.addEventListener('pointermove',ev=>{if(ev.pointerType==='touch')return;const r=gal.getBoundingClientRect();tx=((ev.clientX-r.left)/r.width-.5)*2;ty=((ev.clientY-r.top)/r.height-.5)*2;kick();});
 gal.addEventListener('pointerleave',()=>{tx=ty=0;kick();});
 const ori=ev=>{if(ev.gamma==null||!el.isConnected||el.classList.contains('off'))return;tx=Math.max(-1,Math.min(1,ev.gamma/25));ty=Math.max(-1,Math.min(1,(ev.beta-45)/25));kick();};
 window.addEventListener('deviceorientation',ori);el._ori=ori;
 let r2=0;const nb=()=>{const w=tr.clientWidth||1;slides.forEach(s=>{const o=Math.min(1,Math.abs(s.offsetLeft-tr.scrollLeft)/w);s.style.scale=(1-.12*o).toFixed(3);s.style.opacity=(1-.55*o).toFixed(3);});};
 tr.addEventListener('scroll',()=>{cancelAnimationFrame(r2);r2=requestAnimationFrame(nb);},{passive:true});nb();}
/* order tracking: gold line draws to the current step, a box travels along it */
function orderAlive(el,e){const tl=$('.tl',el);if(!tl)return;const st=$$('.st',tl),o=orderOf(e.params.no);if(!o||st.length<2)return;
 const y=i=>st[i].offsetTop+17,base=y(0),hgt=y(3)-base;const f=document.createElement('i');f.className='tlf';f.style.top=base+'px';f.style.height=hgt+'px';const b=document.createElement('span');b.className='tlb';b.innerHTML=ic(o.status>=3?'check':'box');tl.append(f,b);
 const set=(s,a)=>{f.style.transition=b.style.transition=a?'':'none';f.style.transform=`scaleY(${(y(s)-base)/hgt})`;b.style.transform=`translateY(${y(s)-14}px)`;};
 const p=ORDST[o.no];set(p!=null?p:0,false);f.offsetWidth;requestAnimationFrame(()=>set(o.status,!RM));ORDST[o.no]=o.status;}
/* tab bar: sliding gold indicator + icon bounce; first-visit pulse on Collection */
let LASTTAB=null;
function tabInd(){let ind=tabbar.querySelector('.tbi');if(!ind){ind=document.createElement('i');ind.className='tbi';tabbar.prepend(ind);}const i=TABDEF.findIndex(t=>t[0]===NAV.tab);ind.style.transform=`translateX(${i*100}%)`;ind.style.opacity=NAV.mode==='tabs'&&i!==2?1:0;
 tabbar.classList.toggle('pulse',!lsGet('yema-coll')&&!NOSAVE);
 if(NAV.mode==='tabs'&&LASTTAB&&LASTTAB!==NAV.tab&&!RM){const b=tabbar.querySelector(`[data-tab="${NAV.tab}"] .ic`);if(b)b.animate([{transform:'scale(1)'},{transform:'scale(.8) translateY(2px)',offset:.3},{transform:'scale(1.12) translateY(-3px)',offset:.65},{transform:'none'}],{duration:480,easing:'ease-out'});}LASTTAB=NAV.tab;}
/* AR: the snapshot shrinks into the thumbnail corner */
function flyShot(el,url){if(RM)return Promise.resolve();const ar=el.getBoundingClientRect(),th=$('#arthumb',el).getBoundingClientRect(),a=app.getBoundingClientRect();const c=document.createElement('img');c.src=url;c.className='flip';c.style.cssText=`left:${ar.left-a.left}px;top:${ar.top-a.top}px;width:${ar.width}px;height:${ar.height}px;object-fit:cover;border-radius:14px`;layer.appendChild(c);
 return c.animate([{transform:'none',opacity:1},{transform:`translate(${th.left-ar.left}px,${th.top-ar.top}px) scale(${th.width/ar.width},${th.height/ar.height})`,opacity:.9}],{duration:520,easing:EASE}).finished.then(()=>{c.remove();$('#arthumb',el).animate([{transform:'scale(1.18)'},{transform:'none'}],{duration:300,easing:'ease-out'});},()=>c.remove());}
const greet=()=>{const h=new Date().getHours();return h<5||h>=18?L('Bonsoir','Good evening'):h<12?L('Bonjour','Good morning'):L('Bon après-midi','Good afternoon');};
