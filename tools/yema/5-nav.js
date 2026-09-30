
/* ================= navigation: per-tab stacks, iOS push/pop, edge swipe, sheets ================= */
const app=$('#app'),view=$('#view'),layer=$('#layer'),tabbar=$('#tabbar'),edge=$('#edge');
const SCR={},A={};
const NAV={mode:'flow',tab:'home',flow:[],st:{home:[],catalog:[],collection:[],club:[],profile:[]}};
const ROOT={home:'home',catalog:'catalog',collection:'collection',club:'club',profile:'profile'};
const DUR=RM?1:320, EASE='cubic-bezier(.32,.72,0,1)';
let EID=0,BUSY=false,OFF=false;
const stk=()=>NAV.mode==='flow'?NAV.flow:NAV.st[NAV.tab];
const top=()=>{const s=stk();return s[s.length-1];};
const mk=(name,params)=>({id:++EID,name,params:params||{},scroll:0,el:null,ver:0,lang:''});
const defOf=e=>SCR[e.name];
const titleOf=e=>{const d=defOf(e);return d.title?d.title(e.params):'';};
const shortOf=e=>{const d=defOf(e);return d.short?d.short(e.params):titleOf(e);};
const dimOf=e=>e.el.querySelector(':scope>.dim');
function anim(el,kf,ms){if(!el)return Promise.resolve();el.classList.add('anim');const a=el.animate(kf,{duration:ms||DUR,easing:EASE,fill:'both'});return a.finished.catch(()=>{}).then(()=>{el.classList.remove('anim');return a;});}
const clearA=(...els)=>els.forEach(el=>{if(el&&el.getAnimations)el.getAnimations().forEach(a=>a.cancel());});

function navBar(e){
 const d=defOf(e);if(d.nonav)return '';
 const s=stk(),i=s.indexOf(e),prev=i>0?s[i-1]:null;
 let left='';
 if(d.modal)left=`<button class="bk" type="button" data-act="back">${ic(d.closeIc||'close')}<span>${esc(d.closeLbl?d.closeLbl():L('Fermer','Close'))}</span></button>`;
 else if(prev)left=`<button class="bk" type="button" data-act="back" aria-label="${esc(L('Retour','Back')+' : '+shortOf(prev))}">${ic('back')}<span>${esc(shortOf(prev))}</span></button>`;
 return `<header class="nb">${left}<span class="nt"><span>${esc(titleOf(e))}</span></span><span class="sp"></span>${d.right?d.right(e.params,e):''}</header>`;
}
function build(e){
 const d=defOf(e);let el=e.el;
 if(el){const sc=el.querySelector('.sc');if(sc)e.scroll=sc.scrollTop;if(d.unmount)try{d.unmount(el,e.params,e)}catch(x){}}
 else{el=document.createElement('section');e.el=el;el.tabIndex=-1;view.appendChild(el);}
 const off=el.classList.contains('off');
 el.className='scr '+(d.cls?(typeof d.cls==='function'?d.cls(e.params):d.cls):'')+(d.large||d.lt?' lt':'')+(d.hero?' hero':'')+(d.solid?' solid':'')+(d.bar?' bar':'')+(off?' off':'');
 el.setAttribute('aria-label',titleOf(e)||e.name);
 const ss=[NAV.flow].concat(Object.values(NAV.st)).find(x=>x.includes(e));el.style.zIndex=ss?ss.indexOf(e)+1:1;
 el.innerHTML=(d.raw?d.render(e.params,e):navBar(e)+`<div class="sc">${d.large?`<h1 class="lt-h">${esc(titleOf(e))}</h1>`:''}${d.render(e.params,e)}</div>${d.after?d.after(e.params,e):''}`)+'<div class="dim"></div>';
 const sc=el.querySelector('.sc');
 if(sc){sc.scrollTop=e.scroll||0;bindScroll(el,sc,d);if(d.ptr)bindPTR(el,sc,d.ptr);}
 e.ver=VER;e.lang=LANG;
 if(d.mount)d.mount(el,e.params,e);
 markImgs(el);
 e.ver=VER;
 requestAnimationFrame(()=>fitNav(el));
}
function fitNav(el){const b=el.querySelector('.bk'),t=el.querySelector('.nt>span');if(!b||!t||!b.querySelector('span'))return;b.classList.remove('io');const br=b.getBoundingClientRect(),tr=t.getBoundingClientRect();if(br.width&&tr.width&&br.right+8>tr.left)b.classList.add('io');}
function ensure(e){if(!e.el||e.ver!==VER||e.lang!==LANG)build(e);}
function on(e){if(e&&e.el)e.el.classList.remove('off');}
function hide(e){if(e&&e.el){const sc=e.el.querySelector('.sc');if(sc)e.scroll=sc.scrollTop;e.el.classList.add('off');}}
function destroy(e){if(!e||!e.el)return;const d=defOf(e);if(d.unmount)try{d.unmount(e.el,e.params,e)}catch(x){}e.el.remove();e.el=null;}
function bindScroll(el,sc,d){let last=null;const th=()=>d.hero?(el._th||240):(d.large||d.lt)?38:2;const f=()=>{const v=sc.scrollTop>th();if(v!==last){last=v;el.classList.toggle('scd',v);}};sc.addEventListener('scroll',f,{passive:true});requestAnimationFrame(f);}
function markImgs(el){$$('.ph img',el).forEach(i=>{if(i.complete&&i.naturalWidth)i.parentNode.classList.add('ok');});}
document.addEventListener('load',ev=>{const t=ev.target;if(t&&t.tagName==='IMG'&&t.parentNode&&t.parentNode.classList&&t.parentNode.classList.contains('ph'))t.parentNode.classList.add('ok');},true);
document.addEventListener('error',ev=>{const t=ev.target;if(t&&t.tagName==='IMG'&&t.parentNode&&t.parentNode.classList)t.parentNode.classList.add('ok');},true);

function chrome(){
 const e=top();const d=e?defOf(e):{};
 app.classList.toggle('tabs-on',NAV.mode==='tabs'&&d.tabs!==false);
 $$('.tb',tabbar).forEach(b=>{if(NAV.mode==='tabs'&&b.dataset.tab===NAV.tab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 edge.classList.toggle('on',!!e&&stk().length>1&&!d.modal&&!d.noswipe);
 badges();if(typeof panelCur==='function')panelCur();
}
function go(name,params){
 if(BUSY)return;closeAllSheets();
 const s=stk(),prev=top(),e=mk(name,params);s.push(e);build(e);chrome();
 const d=defOf(e);
 setTimeout(()=>{try{e.el&&e.el.focus({preventScroll:true})}catch(x){}},DUR);
 if(!prev)return;if(RM){hide(prev);return;}
 BUSY=true;const pe=prev.el;
 const done=()=>{hide(prev);clearA(pe,e.el,pe&&dimOf(prev));BUSY=false;};
 if(d.modal){anim(e.el,[{transform:'translateY(100%)'},{transform:'none'}],360).then(done);}
 else Promise.all([anim(e.el,[{transform:'translateX(100%)',boxShadow:'-10px 0 30px rgba(0,0,0,0)'},{transform:'none',boxShadow:'-10px 0 30px rgba(0,0,0,.35)'}]),anim(pe,[{transform:'none'},{transform:'translateX(-30%)'}]),anim(dimOf(prev),[{opacity:0},{opacity:.35}])]).then(done);
}
function back(){
 if(BUSY)return;if(sheets.length){closeSheet();return;}
 const s=stk();
 if(s.length<2){if(NAV.mode==='tabs'&&NAV.tab!=='home')switchTab('home');return;}
 const e=s.pop(),prev=top();ensure(prev);on(prev);chrome();
 const d=defOf(e);if(RM){destroy(e);return;}
 BUSY=true;const done=()=>{destroy(e);clearA(prev.el,dimOf(prev));BUSY=false;};
 if(d.modal)anim(e.el,[{transform:'none'},{transform:'translateY(100%)'}],300).then(done);
 else Promise.all([anim(e.el,[{transform:'none'},{transform:'translateX(100%)'}]),anim(prev.el,[{transform:'translateX(-30%)'},{transform:'none'}]),anim(dimOf(prev),[{opacity:.35},{opacity:0}])]).then(done);
}
function replace(name,params){closeAllSheets();const s=stk();const old=s.pop();const e=mk(name,params);s.push(e);build(e);destroy(old);chrome();if(!RM)anim(e.el,[{opacity:0},{opacity:1}],220).then(()=>clearA(e.el));}
function popToRoot(){const s=stk();if(s.length<2||BUSY)return;const t=s.pop(),root=s[0];s.slice(1).forEach(destroy);s.length=1;ensure(root);on(root);chrome();if(RM){destroy(t);return;}BUSY=true;Promise.all([anim(t.el,[{transform:'none'},{transform:'translateX(100%)'}]),anim(root.el,[{transform:'translateX(-30%)'},{transform:'none'}])]).then(()=>{destroy(t);clearA(root.el);BUSY=false;});}
function switchTab(t,rp){
 if(BUSY)return;closeAllSheets();
 if(NAV.mode!=='tabs'){enterTabs(t,rp);return;}
 if(t===NAV.tab&&!rp){const s=NAV.st[t];if(s.length>1)popToRoot();else{const sc=top().el&&top().el.querySelector('.sc');if(sc)sc.scrollTo({top:0,behavior:RM?'auto':'smooth'});}return;}
 hide(top());NAV.tab=t;
 if(rp){NAV.st[t].forEach(destroy);NAV.st[t]=[mk(ROOT[t],rp)];}else if(!NAV.st[t].length)NAV.st[t]=[mk(ROOT[t])];
 const e=top();ensure(e);on(e);chrome();
 if(!RM)anim(e.el,[{opacity:.3},{opacity:1}],180).then(()=>clearA(e.el));
}
function destroyAll(){NAV.flow.forEach(destroy);NAV.flow=[];Object.keys(NAV.st).forEach(k=>{NAV.st[k].forEach(destroy);NAV.st[k]=[];});}
function enterTabs(t,rp){closeAllSheets();destroyAll();NAV.mode='tabs';NAV.tab=t||'home';NAV.st[NAV.tab]=[mk(ROOT[NAV.tab],rp)];const e=top();build(e);chrome();if(!RM)anim(e.el,[{opacity:0},{opacity:1}],260).then(()=>clearA(e.el));}
function startFlow(name,p){closeAllSheets();destroyAll();NAV.mode='flow';NAV.flow=[mk(name,p)];build(NAV.flow[0]);chrome();}
function setStack(tab,list){closeAllSheets();BUSY=false;
 if(!S.onboarded){S.onboarded=true;if(!S.consent)S.consent={analytics:true,perso:true,marketing:false};save();}
 if(NAV.mode!=='tabs'){destroyAll();NAV.mode='tabs';}else hide(top());
 NAV.tab=tab;NAV.st[tab].forEach(destroy);NAV.st[tab]=list.map(x=>mk(x[0],x[1]));
 const e=top();build(e);chrome();
}
function rerender(){const e=top();if(e&&e.el)build(e);}

/* interactive edge swipe back (finger follows, cancels if not far enough) */
(()=>{let st=null;
 edge.addEventListener('pointerdown',ev=>{if(BUSY||sheets.length)return;const s=stk();if(s.length<2)return;const e=top();const d=defOf(e);if(d.modal||d.noswipe)return;
  const prev=s[s.length-2];ensure(prev);on(prev);clearA(e.el,prev.el);
  st={e,prev,x0:ev.clientX,dx:0,t:performance.now(),v:0,W:app.clientWidth};try{edge.setPointerCapture(ev.pointerId)}catch(x){}
  e.el.classList.add('anim');prev.el.classList.add('anim');prev.el.style.transform='translateX(-30%)';dimOf(prev).style.opacity=.35;e.el.style.boxShadow='-10px 0 30px rgba(0,0,0,.35)';});
 edge.addEventListener('pointermove',ev=>{if(!st)return;const dx=Math.max(0,ev.clientX-st.x0),t=performance.now();st.v=(dx-st.dx)/Math.max(1,t-st.t);st.dx=dx;st.t=t;const p=dx/st.W;
  st.e.el.style.transform=`translateX(${dx}px)`;st.prev.el.style.transform=`translateX(${-30*(1-p)}%)`;dimOf(st.prev).style.opacity=.35*(1-p);});
 const end=()=>{if(!st)return;const {e,prev,dx,W,v}=st;st=null;const p=dx/W,ok=p>.33||(v>.45&&dx>30);
  const cur=[`translateX(${dx}px)`,`translateX(${-30*(1-p)}%)`];const ms=Math.max(120,DUR*(ok?1-p:p));
  const fin=()=>{[e.el,prev.el].forEach(x=>{if(x){x.style.transform='';x.style.boxShadow='';x.classList.remove('anim');}});const dm=dimOf(prev);if(dm)dm.style.opacity='';};
  BUSY=true;
  if(ok){const s=stk();s.pop();chrome();Promise.all([anim(e.el,[{transform:cur[0]},{transform:'translateX(100%)'}],ms),anim(prev.el,[{transform:cur[1]},{transform:'none'}],ms),anim(dimOf(prev),[{opacity:.35*(1-p)},{opacity:0}],ms)]).then(()=>{fin();destroy(e);clearA(prev.el,dimOf(prev));BUSY=false;buzz(6);});}
  else Promise.all([anim(e.el,[{transform:cur[0]},{transform:'none'}],ms),anim(prev.el,[{transform:cur[1]},{transform:'translateX(-30%)'}],ms)]).then(()=>{fin();hide(prev);clearA(e.el,prev.el);BUSY=false;});};
 edge.addEventListener('pointerup',end);edge.addEventListener('pointercancel',end);
})();

/* pull to refresh (touch) */
function bindPTR(el,sc,fn){const ptr=document.createElement('div');ptr.className='ptr';ptr.innerHTML='<i></i>';el.appendChild(ptr);
 let y0=null,dy=0,act=false;const reset=()=>{sc.style.transition='transform .35s var(--ios)';sc.style.transform='';ptr.style.transition='opacity .3s,transform .35s var(--ios)';ptr.style.opacity=0;ptr.style.transform='';setTimeout(()=>{sc.style.transition='';ptr.style.transition='';ptr.classList.remove('spin');},360);};
 sc.addEventListener('touchstart',ev=>{y0=(sc.scrollTop<=0&&ev.touches.length===1)?ev.touches[0].clientY:null;dy=0;act=false;},{passive:true});
 sc.addEventListener('touchmove',ev=>{if(y0==null)return;dy=ev.touches[0].clientY-y0;if(dy>0&&sc.scrollTop<=0){act=true;if(ev.cancelable)ev.preventDefault();const t=Math.min(90,dy*.45),p=Math.min(1,dy/140);sc.style.transform=`translateY(${t}px)`;ptr.style.opacity=p;ptr.style.transform=`translateY(${t*.55}px) scale(${.6+.4*p}) rotate(${dy*2}deg)`;}},{passive:false});
 sc.addEventListener('touchend',()=>{if(!act){y0=null;return;}y0=null;act=false;if(dy>130){ptr.classList.add('spin');sc.style.transition='transform .3s var(--ios)';sc.style.transform='translateY(44px)';buzz(10);setTimeout(()=>{reset();fn();},900);}else reset();});}

/* tab bar & badges */
const TABDEF=[['home','home',{fr:'Accueil',en:'Home'}],['catalog','grid',{fr:'Catalogue',en:'Catalogue'}],['collection','clock',{fr:'Collection',en:'Collection'}],['club','diamond',{fr:'Club VIP',en:'VIP Club'}],['profile','user',{fr:'Profil',en:'Profile'}]];
function renderTabbar(){tabbar.setAttribute('aria-label',L('Navigation principale','Main navigation'));tabbar.innerHTML=TABDEF.map(([k,i,l])=>k==='collection'?`<button class="tb c" type="button" data-tab="${k}"><span class="ring">${ic(i)}</span><span>${tx(l)}</span></button>`:`<button class="tb" type="button" data-tab="${k}">${ic(i)}<span>${tx(l)}</span></button>`).join('');chrome();}
const unread=()=>S.notifs.filter(n=>!n.read).length;
const cartN=()=>S.cart.reduce((a,c)=>a+c.qty,0);
function badges(){const n=unread(),c=cartN();$$('[data-badge="notif"]',app).forEach(b=>{b.textContent=n||'';b.dataset.n=n;});$$('[data-badge="bag"]',app).forEach(b=>{if(b.dataset.n!=null&&+b.dataset.n<c){b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump');}b.textContent=c||'';b.dataset.n=c;});}
const bagBtn=()=>`<button class="nbb" type="button" data-act="cart" aria-label="${L('Panier','Bag')}">${ic('bag')}<span class="badge" data-badge="bag" data-n="${cartN()}">${cartN()||''}</span></button>`;
const bellBtn=()=>`<button class="nbb" type="button" data-act="notifs" aria-label="Notifications">${ic('bell')}<span class="badge" data-badge="notif" data-n="${unread()}">${unread()||''}</span></button>`;

/* sheets (drag to dismiss with velocity, spring back) */
const sheets=[];
function sheetHTML(title,body,foot,sub){return `<div class="sh-h"><div style="flex:1;min-width:0"><h2 class="h2">${title}</h2>${sub?`<div class="lbl" style="margin-top:3px">${sub}</div>`:''}</div><button class="xbtn" type="button" data-act="closeSheet" aria-label="${L('Fermer','Close')}">${ic('close')}</button></div><div class="sh-b">${body}</div>${foot?`<div class="sh-f">${foot}</div>`:''}`;}
function openSheet(o){
 const w=document.createElement('div');
 w.innerHTML=`<div class="scrim" ${o.clear?'style="background:transparent"':''}></div><div class="sheet ${o.light?'light':''}" role="dialog" aria-modal="true" aria-label="${esc(o.label||'')}" ${o.max?`style="max-height:${o.max}"`:''}><div class="grab"><i></i></div><div class="sh-in" style="display:flex;flex-direction:column;min-height:0;flex:1">${o.html}</div></div>`;
 layer.appendChild(w);const sh=w.querySelector('.sheet'),sc=w.querySelector('.scrim');
 const obj={w,sh,onClose:o.onClose,data:o.data||{},prev:document.activeElement};sheets.push(obj);
 requestAnimationFrame(()=>requestAnimationFrame(()=>{sc.classList.add('in');sh.classList.add('in');}));
 sc.addEventListener('click',()=>closeSheet(obj));
 bindDrag(obj);if(o.onMount)o.onMount(sh,obj);markImgs(sh);
 setTimeout(()=>{const f=sh.querySelector(o.focus||'.sh-b button,.sh-b input,.xbtn');if(f)try{f.focus({preventScroll:true})}catch(e){}},90);
 return obj;}
function bindDrag(obj){const sh=obj.sh;let y0=null,dy=0,t0=0,v=0;
 const dn=e=>{if(e.target.closest('button,input,textarea,select'))return;y0=e.clientY;dy=0;t0=performance.now();sh.classList.add('drag');try{e.currentTarget.setPointerCapture(e.pointerId)}catch(x){}};
 const mv=e=>{if(y0==null)return;const d=e.clientY-y0,t=performance.now();v=(d-dy)/Math.max(1,t-t0);t0=t;dy=d;sh.style.transform=`translateY(${d>0?d:d/4}px)`;};
 const up=()=>{if(y0==null)return;y0=null;sh.classList.remove('drag');sh.style.transform='';if(dy>110||(v>.6&&dy>20))closeSheet(obj);};
 $$('.grab,.sh-h',sh).forEach(g=>{g.addEventListener('pointerdown',dn);g.addEventListener('pointermove',mv);g.addEventListener('pointerup',up);g.addEventListener('pointercancel',up);});}
function setSheet(obj,html){const inn=obj.sh.querySelector('.sh-in');const b=inn.querySelector('.sh-b');const st=b?b.scrollTop:0;inn.innerHTML=html;const nb=inn.querySelector('.sh-b');if(nb)nb.scrollTop=st;bindDrag(obj);markImgs(obj.sh);}
function closeSheet(obj){obj=obj||sheets[sheets.length-1];if(!obj)return;const i=sheets.indexOf(obj);if(i<0)return;sheets.splice(i,1);obj.sh.classList.remove('in');obj.w.querySelector('.scrim').classList.remove('in');setTimeout(()=>obj.w.remove(),RM?0:420);if(obj.onClose)obj.onClose();if(obj.prev&&document.contains(obj.prev))try{obj.prev.focus({preventScroll:true})}catch(e){}}
function closeAllSheets(){while(sheets.length)closeSheet(sheets[sheets.length-1]);$$('.dlgw,.story',layer).forEach(d=>d.remove());}
const topSheet=()=>sheets[sheets.length-1];
function confirmDlg(o){return new Promise(res=>{const w=document.createElement('div');w.className='dlgw';w.innerHTML=`<div class="scrim in"></div><div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlgt"><h2 class="h3" id="dlgt">${o.title}</h2><p>${o.text}</p><div class="acts"><button class="btn ${o.danger?'danger':'gold'}" type="button" data-r="1">${o.ok}</button><button class="btn ghost" type="button" data-r="0">${o.cancel||L('Annuler','Cancel')}</button></div></div>`;layer.appendChild(w);const d=w.querySelector('.dlg');requestAnimationFrame(()=>d.classList.add('in'));const done=v=>{d.classList.remove('in');setTimeout(()=>w.remove(),220);document.removeEventListener('keydown',kd,true);res(v);};const kd=e=>{if(e.key==='Escape'){e.stopPropagation();done(false);}};document.addEventListener('keydown',kd,true);w.addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(b)done(b.dataset.r==='1');else if(e.target.classList.contains('scrim'))done(false);});setTimeout(()=>d.querySelector('[data-r="1"]').focus(),60);});}
function toast(msg,o){if(NOSAVE)return;o=o||{};const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.innerHTML=`${ic(o.icon||'check')}<span>${msg}</span>${o.act?`<button type="button">${o.act.label}</button>`:''}`;const box=$('#toasts');box.appendChild(t);if(o.act)t.querySelector('button').onclick=()=>{o.act.fn();t.remove();};setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),320);},o.ms||(o.act?4000:2400));while(box.children.length>2)box.firstChild.remove();}
function needNet(){if(OFF){toast(L('Indisponible hors connexion','Unavailable offline'),{icon:'wifioff'});buzz([20,40,20]);return false;}return true;}
function push(o){if(NOSAVE)return;$$('.pushb',layer).forEach(p=>p.remove());const b=document.createElement('button');b.type='button';b.className='pushb';b.innerHTML=`<span class="ai">Y</span><span class="x"><span class="ap">YEMA WATCH CLUB</span><b>${o.title}</b><span>${o.body}</span></span><small>${L('maintenant','now')}</small>`;layer.appendChild(b);requestAnimationFrame(()=>requestAnimationFrame(()=>b.classList.add('in')));buzz([10,40,10]);const hide=()=>{b.classList.remove('in');setTimeout(()=>b.remove(),500);};const tm=setTimeout(hide,7000);let y0=null;b.addEventListener('pointerdown',e=>{y0=e.clientY;});b.addEventListener('pointerup',e=>{if(y0!=null&&e.clientY<y0-20){clearTimeout(tm);hide();}y0=null;});b.onclick=()=>{clearTimeout(tm);hide();o.onTap&&o.onTap();};}
function bioLock(sub){return new Promise(res=>{const d=document.createElement('div');d.className='bio';d.innerHTML=`<div class="fid"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 28V16a8 8 0 0 1 8-8h12M72 8h12a8 8 0 0 1 8 8v12M92 72v12a8 8 0 0 1-8 8H72M28 92H16a8 8 0 0 1-8-8V72"/><g class="face"><path d="M36 38v6M64 38v6M50 38v16h-4M38 66a17 17 0 0 0 24 0"/></g><g class="chk"><path d="M32 51l12 12 24-26"/></g></svg><span class="scan"></span></div><b>Face ID</b><small>${sub||L('Déverrouillage','Unlocking')}</small>`;layer.appendChild(d);requestAnimationFrame(()=>requestAnimationFrame(()=>d.classList.add('in')));setTimeout(()=>{d.classList.add('ok');buzz([8,30,8]);setTimeout(()=>{d.classList.remove('in');setTimeout(()=>{d.remove();res();},300);},520);},RM?200:1000);});}
function confetti(fx,fy){if(RM||NOSAVE)return;const r=app.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);const c=document.createElement('canvas');c.className='fx';c.width=r.width*dpr;c.height=r.height*dpr;layer.appendChild(c);const x=c.getContext('2d');x.scale(dpr,dpr);
 const cols=['#E8D3A2','#C9A96A','#D4B36F','#F7F2E8','#B8914E'];const P=Array.from({length:64},()=>({x:r.width*fx,y:r.height*fy,vx:(Math.random()-.5)*7.5,vy:-Math.random()*6.5-2,g:.15+Math.random()*.08,s:2+Math.random()*4.5,a:Math.random()*6,va:(Math.random()-.5)*.3,c:cols[Math.random()*cols.length|0],o:Math.random()<.4}));
 let f=0;const st=()=>{x.clearRect(0,0,r.width,r.height);f++;const al=Math.max(0,1-f/88);for(const p of P){p.vy+=p.g;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;x.globalAlpha=al;x.fillStyle=p.c;x.save();x.translate(p.x,p.y);x.rotate(p.a);if(p.o){x.beginPath();x.arc(0,0,p.s/2,0,7);x.fill();}else x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore();}if(f<90)requestAnimationFrame(st);else c.remove();};st();}
function dl(name,content,type){const b=content instanceof Blob?content:new Blob([content],{type});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);}
function step(i){if(S.steps[i])return;S.steps[i]=1;save();if(typeof renderSteps==='function')renderSteps();}
A.back=()=>back();
A.closeSheet=()=>closeSheet();
