
/* ================= engine: router, sheets, toasts ================= */
const app=$('#app'), view=$('#view'), layer=$('#layer'), tabbar=$('#tabbar');
const SCR={};
const A={}; // actions
const NAV={mode:'flow',tab:'home',flow:[],stacks:{home:[],catalog:[],collection:[],club:[],profile:[]}};
const ROOT={home:'home',catalog:'catalog',collection:'collection',club:'club',profile:'profile'};
let curEl=null,curEntry=null,OFF=false;
const CAM={stream:null,granted:false};
const PHOTOS={};
const mk=(name,params)=>({name,params:params||{},scroll:0});
const stk=()=>NAV.mode==='flow'?NAV.flow:NAV.stacks[NAV.tab];
const cls=(def,p)=>typeof def.cls==='function'?def.cls(p):(def.cls||'');

function render(entry,anim){
 const def=SCR[entry.name];if(!def)return;
 const old=curEl, oldEntry=curEntry;
 if(old&&oldEntry&&anim!=='none'){const od=SCR[oldEntry.name];if(od&&od.unmount)try{od.unmount(old,oldEntry.params)}catch(e){}}
 const el=document.createElement('section');
 el.className='scr '+cls(def,entry.params)+(anim!=='none'?' enter':'');
 el.setAttribute('aria-label',def.title?def.title(entry.params):entry.name);
 el.tabIndex=-1;
 el.innerHTML=def.render(entry.params,entry);
 view.appendChild(el);
 curEl=el;curEntry=entry;
 app.classList.toggle('has-tabs',NAV.mode==='tabs'&&def.tabs!==false);
 app.dataset.bar=def.bar||'';
 if(def.clear)app.dataset.clear='1';else delete app.dataset.clear;
 if(def.mount)def.mount(el,entry.params,entry);
 el.scrollTop=entry.scroll||0;
 if(old){
  if(anim==='none'||RM){old.remove();}
  else{
   const pair={push:['a-push','a-pushout'],pop:['a-pop','a-popout'],up:['a-up',''],down:['','a-down'],fade:['a-fade','a-fadeout']}[anim]||['a-fade','a-fadeout'];
   if(pair[0])el.classList.add(pair[0]);
   if(pair[1])old.classList.add(pair[1]);else old.style.zIndex=1;
   old.inert=true;old.setAttribute('aria-hidden','true');
   setTimeout(()=>{old.remove();el.classList.remove('a-push','a-pop','a-up','a-fade')},anim==='fade'?320:460);
  }
 }
 if(anim!=='none')setTimeout(()=>{try{el.focus({preventScroll:true})}catch(e){}},30);
 syncChrome();
}
function saveScroll(){if(curEl&&curEntry)curEntry.scroll=curEl.scrollTop;}
function go(name,params){saveScroll();closeAllSheets();const e=mk(name,params);stk().push(e);render(e,SCR[name].modal?'up':'push');}
function replace(name,params,anim){closeAllSheets();const s=stk();const e=mk(name,params);s[s.length-1]=e;render(e,anim||'fade');}
function back(){
 if(sheets.length){closeSheet();return;}
 const s=stk();
 if(s.length>1){const leaving=s.pop();render(s[s.length-1],SCR[leaving.name].modal?'down':'pop');return;}
 if(NAV.mode==='tabs'&&NAV.tab!=='home')switchTab('home');
}
function rerender(){if(!curEntry)return;saveScroll();const ae=document.activeElement;const fk=ae&&ae.dataset&&ae.dataset.fk;render(curEntry,'none');if(fk){const n=curEl.querySelector(`[data-fk="${fk}"]`);if(n)n.focus({preventScroll:true});}}
function switchTab(t,rootParams){
 closeAllSheets();
 if(NAV.mode!=='tabs'){enterTabs(t,rootParams);return;}
 if(t===NAV.tab&&!rootParams){const s=NAV.stacks[t];if(s.length>1){NAV.stacks[t]=[s[0]];render(s[0],'pop');}else if(curEl)curEl.scrollTo({top:0,behavior:RM?'auto':'smooth'});return;}
 saveScroll();NAV.tab=t;
 if(rootParams||!NAV.stacks[t].length)NAV.stacks[t]=[mk(ROOT[t],rootParams)];
 const s=NAV.stacks[t];render(s[s.length-1],'fade');
}
function enterTabs(t,rootParams){
 NAV.mode='tabs';NAV.tab=t||'home';
 Object.keys(ROOT).forEach(k=>{NAV.stacks[k]=[mk(ROOT[k],k===NAV.tab?rootParams:null)];});
 render(NAV.stacks[NAV.tab][0],'fade');
}
function startFlow(name,params){closeAllSheets();NAV.mode='flow';NAV.flow=[mk(name,params)];render(NAV.flow[0],'fade');}
function setStack(tab,entries){
 closeAllSheets();
 if(!S.onboarded){S.onboarded=true;if(!S.prefs.wrist)S.prefs.wrist='16-18';if(!S.consent)S.consent={analytics:true,perso:true,marketing:false};save();}
 if(NAV.mode!=='tabs'){NAV.mode='tabs';Object.keys(ROOT).forEach(k=>NAV.stacks[k]=[mk(ROOT[k])]);}
 saveScroll();NAV.tab=tab;NAV.stacks[tab]=entries.map(e=>mk(e[0],e[1]));
 render(NAV.stacks[tab][NAV.stacks[tab].length-1],'fade');
}

/* tab bar + badges */
const TABDEF=[['home','home',{fr:'Accueil',en:'Home'}],['catalog','grid',{fr:'Catalogue',en:'Catalogue'}],['collection','clock',{fr:'Collection',en:'Collection'}],['club','diamond',{fr:'Club VIP',en:'VIP Club'}],['profile','user',{fr:'Profil',en:'Profile'}]];
function renderTabbar(){tabbar.setAttribute('aria-label',L('Navigation principale','Main navigation'));tabbar.innerHTML=TABDEF.map(([k,i,l])=>k==='collection'?`<button class="tb c" type="button" data-tab="${k}"><span class="ring">${ic(i)}</span><span>${tx(l)}</span></button>`:`<button class="tb" type="button" data-tab="${k}">${ic(i)}<span>${tx(l)}</span></button>`).join('');syncChrome();}
const unread=()=>S.notifs.filter(n=>!n.read).length;
function syncChrome(){
 $$('.tb',tabbar).forEach(b=>{if(NAV.mode==='tabs'&&b.dataset.tab===NAV.tab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 const n=unread();$$('[data-badge="notif"]',app).forEach(b=>{b.textContent=n||'';b.dataset.n=n;});
 panelCur();
}

/* sheets */
const sheets=[];
function sheetHTML(title,body,foot,sub){return `<div class="sh-h"><div style="flex:1;min-width:0"><h2 class="h2">${title}</h2>${sub?`<div class="lbl" style="margin-top:4px">${sub}</div>`:''}</div><button class="xbtn" type="button" data-act="closeSheet" aria-label="${L('Fermer','Close')}">${ic('close')}</button></div><div class="sh-b">${body}</div>${foot?`<div class="sh-f">${foot}</div>`:''}`;}
function openSheet(o){
 const wrap=document.createElement('div');
 wrap.innerHTML=`<div class="scrim" ${o.clear?'style="background:transparent"':''}></div><div class="sheet ${o.light?'light':''} ${o.cls||''}" role="dialog" aria-modal="true" aria-label="${esc(o.label||'')}" ${o.max?`style="max-height:${o.max}"`:''}><div class="grab"><i></i></div><div class="sh-in" style="display:flex;flex-direction:column;min-height:0;flex:1">${o.html}</div></div>`;
 layer.appendChild(wrap);
 const sh=wrap.querySelector('.sheet'),sc=wrap.querySelector('.scrim');
 const obj={wrap,sh,onClose:o.onClose,data:o.data||{},prevFocus:document.activeElement};
 sheets.push(obj);
 requestAnimationFrame(()=>requestAnimationFrame(()=>{sc.classList.add('in');sh.classList.add('in');}));
 sc.addEventListener('click',()=>closeSheet(obj));
 // drag to dismiss
 let y0=null,dy=0;
 const down=e=>{if(e.target.closest('button,input,textarea,select'))return;y0=e.clientY;dy=0;sh.classList.add('drag');try{e.target.setPointerCapture(e.pointerId)}catch(_){}};
 const move=e=>{if(y0==null)return;dy=Math.max(0,e.clientY-y0);sh.style.transform=`translateY(${dy}px)`;};
 const up=()=>{if(y0==null)return;y0=null;sh.classList.remove('drag');sh.style.transform='';if(dy>90)closeSheet(obj);};
 $$('.grab,.sh-h',sh).forEach(g=>{g.addEventListener('pointerdown',down);g.addEventListener('pointermove',move);g.addEventListener('pointerup',up);g.addEventListener('pointercancel',up);});
 if(o.onMount)o.onMount(sh,obj);
 setTimeout(()=>{const f=sh.querySelector(o.focus||'.sh-b button, .sh-b input, .xbtn');if(f)try{f.focus({preventScroll:true})}catch(e){}},80);
 return obj;
}
function setSheet(obj,html){const inn=obj.sh.querySelector('.sh-in');const b=inn.querySelector('.sh-b');const st=b?b.scrollTop:0;inn.innerHTML=html;const nb=inn.querySelector('.sh-b');if(nb)nb.scrollTop=st;
 $$('.sh-h',obj.sh).forEach(g=>{let y0=null,dy=0;g.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;y0=e.clientY;obj.sh.classList.add('drag');try{g.setPointerCapture(e.pointerId)}catch(_){}});g.addEventListener('pointermove',e=>{if(y0==null)return;dy=Math.max(0,e.clientY-y0);obj.sh.style.transform=`translateY(${dy}px)`;});const up=()=>{if(y0==null)return;y0=null;obj.sh.classList.remove('drag');obj.sh.style.transform='';if(dy>90)closeSheet(obj);dy=0;};g.addEventListener('pointerup',up);g.addEventListener('pointercancel',up);});}
function closeSheet(obj){obj=obj||sheets[sheets.length-1];if(!obj)return;const i=sheets.indexOf(obj);if(i<0)return;sheets.splice(i,1);obj.sh.classList.remove('in');obj.wrap.querySelector('.scrim').classList.remove('in');setTimeout(()=>obj.wrap.remove(),RM?0:420);if(obj.onClose)obj.onClose();if(obj.prevFocus&&document.contains(obj.prevFocus))try{obj.prevFocus.focus({preventScroll:true})}catch(e){}}
function closeAllSheets(){while(sheets.length)closeSheet(sheets[sheets.length-1]);$$('.dlgw',layer).forEach(d=>d.remove());}
const topSheet=()=>sheets[sheets.length-1];

/* dialog */
function confirmDlg(o){return new Promise(res=>{const w=document.createElement('div');w.className='dlgw';w.innerHTML=`<div class="scrim in"></div><div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlgt"><h2 class="h2" id="dlgt">${o.title}</h2><p>${o.text}</p><div class="acts"><button class="btn ${o.danger?'danger':'gold'}" type="button" data-r="1">${o.ok}</button><button class="btn line" type="button" data-r="0">${o.cancel||L('Annuler','Cancel')}</button></div></div>`;layer.appendChild(w);const d=w.querySelector('.dlg');requestAnimationFrame(()=>d.classList.add('in'));const done=v=>{d.classList.remove('in');setTimeout(()=>w.remove(),250);document.removeEventListener('keydown',kd,true);res(v);};const kd=e=>{if(e.key==='Escape'){e.stopPropagation();done(false);}};document.addEventListener('keydown',kd,true);w.addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(b)done(b.dataset.r==='1');else if(e.target.classList.contains('scrim'))done(false);});setTimeout(()=>d.querySelector('[data-r="1"]').focus(),60);});}

/* toast */
function toast(msg,o){if(NOSAVE)return;o=o||{};const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.innerHTML=`${ic(o.icon||'check')}<span>${msg}</span>${o.act?`<button type="button" style="margin-left:6px;color:#9A7A3A;font-weight:800;font-size:11px;letter-spacing:.12em;text-transform:uppercase;pointer-events:auto">${o.act.label}</button>`:''}`;$('#toasts').appendChild(t);if(o.act)t.querySelector('button').onclick=()=>{o.act.fn();t.remove();};const life=o.ms||(o.act?4200:2600);setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),320)},life);while($('#toasts').children.length>3)$('#toasts').firstChild.remove();}
function needNet(){if(OFF){toast(L('Action indisponible hors connexion. Réessayez une fois reconnecté.','Unavailable offline. Try again once you are back online.'),{icon:'wifioff'});return false;}return true;}

/* push banner */
function push(o){$$('.pushb',layer).forEach(p=>p.remove());const b=document.createElement('button');b.type='button';b.className='pushb';b.innerHTML=`<span class="ai">Y</span><span class="x"><span class="ap">Yema Watch Club</span><b>${o.title}</b><span>${o.body}</span></span><small>${L('maintenant','now')}</small>`;layer.appendChild(b);b.style.pointerEvents='auto';requestAnimationFrame(()=>requestAnimationFrame(()=>b.classList.add('in')));buzz();const hide=()=>{b.classList.remove('in');setTimeout(()=>b.remove(),500);};const tm=setTimeout(hide,7000);b.onclick=()=>{clearTimeout(tm);hide();o.onTap&&o.onTap();};}

/* biometric overlay */
function bioLock(sub){return new Promise(res=>{const d=document.createElement('div');d.className='bio';d.setAttribute('role','dialog');d.setAttribute('aria-label','Face ID');d.innerHTML=`<div class="logo">YEMA</div><div class="fid"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 28V16a8 8 0 0 1 8-8h12M72 8h12a8 8 0 0 1 8 8v12M92 72v12a8 8 0 0 1-8 8H72M28 92H16a8 8 0 0 1-8-8V72"/><g class="face"><path d="M36 38v6M64 38v6M50 38v16h-4M38 66a17 17 0 0 0 24 0"/></g><g class="chk"><path d="M32 51l12 12 24-26"/></g></svg><span class="scan"></span></div><b>Face ID</b><small>${sub||L('Déverrouillage de Yema Watch Club','Unlocking Yema Watch Club')}</small>`;layer.appendChild(d);requestAnimationFrame(()=>requestAnimationFrame(()=>d.classList.add('in')));setTimeout(()=>{d.classList.add('ok');d.querySelector('b').textContent=L('Déverrouillé','Unlocked');buzz();setTimeout(()=>{d.classList.remove('in');setTimeout(()=>{d.remove();res();},360);},700);},RM?300:1500);});}

/* guided scenario */
function step(i){if(S.steps[i])return;S.steps[i]=1;save();renderSteps();if(S.tour)toast(L(`Parcours guidé · étape ${i+1}/6 validée`,`Guided tour · step ${i+1}/6 done`),{icon:'sparkle'});}

/* wishlist helpers */
const effPrice=w=>w.drop?Math.round(w.price*(1-w.drop)/10)*10:w.price;
const inWish=(id,cfg)=>S.wish.some(x=>x.wid===id&&(!cfg?!x.cfg:x.cfg&&JSON.stringify(x.cfg)===JSON.stringify(cfg)));
const baseInWish=id=>S.wish.some(x=>x.wid===id);
function toggleWish(id,el){
 const i=S.wish.findIndex(x=>x.wid===id&&!x.cfg);
 if(baseInWish(id)){const removed=S.wish.filter(x=>x.wid===id);S.wish=S.wish.filter(x=>x.wid!==id);save();toast(L('Retiré de votre liste de souhaits','Removed from your wishlist'),{icon:'heart',act:{label:L('Annuler','Undo'),fn:()=>{S.wish=S.wish.concat(removed);save();rerender();}}});}
 else{S.wish.unshift({wid:id,cfg:null,at:Date.now()});save();toast(L('Ajouté à votre liste de souhaits','Added to your wishlist'),{icon:'heartf'});}
 if(el){el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');}
 buzz();
}
function addWish(id,cfg){S.wish=S.wish.filter(x=>!(x.wid===id&&(!x.cfg||JSON.stringify(x.cfg)===JSON.stringify(cfg))));S.wish.unshift({wid:id,cfg:Object.assign({},cfg),at:Date.now()});save();}

/* recommendation */
function score(w,p){p=p||S.prefs;let s=0;const r=[];const pr=effPrice(w);
 if(p.cols&&p.cols.includes(w.col)){s+=3;r.push(COLS[w.col].n);}
 if(p.budget){if(pr>=p.budget[0]&&pr<=p.budget[1]){s+=2;r.push(L('dans votre budget','in budget'));}else s-=2;}
 (p.styles||[]).forEach(st=>{if(w.tags.includes(st)){s+=1;if(r.length<3)r.push(tx(STYLES.find(x=>x[0]===st)[1]).toLowerCase());}});
 const wr=p.wrist||S.user.wrist;if(wr==='<16'&&w.size===39)s+=1;if(wr==='16-18'&&w.size<=41)s+=.5;if(wr==='>18'&&w.size>=41)s+=1;
 if(w.isNew)s+=.3;return{s,r};}
const recos=()=>WATCHES.map(w=>({w,...score(w)})).sort((a,b)=>b.s-a.s);

/* watch card */
function wcard(w,o){o=o||{};const on=baseInWish(w.id);return `<div class="wc" style="animation-delay:${(o.i||0)*40}ms"><button class="heart ${on?'':''}" type="button" data-act="heart" data-id="${w.id}" aria-pressed="${on}" aria-label="${L('Liste de souhaits','Wishlist')} · ${esc(tx(w.name))}">${ic(on?'heartf':'heart')}</button>${w.isNew?`<span class="tag">${L('Nouveau','New')}</span>`:(w.ltd?`<span class="tag o">${w.ltd}</span>`:'')}<button type="button" data-act="pdp" data-id="${w.id}" style="display:flex;flex-direction:column;text-align:left;width:100%"><span class="wimg" style="width:100%">${lw(w)}</span><span class="meta"><span class="lbl">${COLS[w.col].n}</span><span class="h3" style="display:block">${esc(tx(w.name))}</span>${o.why?`<span class="why">${ic('sparkle')}${esc(o.why)}</span>`:''}<span class="price" style="display:block">${w.drop?`${eur(effPrice(w))} <s style="color:var(--mut);font-weight:600;font-size:11.5px">${eur(w.price)}</s>`:eur(w.price)}</span></span></button></div>`;}

/* ================= screens: onboarding ================= */
SCR.splash={tabs:false,clear:1,cls:'splash noscroll',title:()=>'Yema',
 render:()=>`${balanceSvg()}<div class="logo">YEMA</div><div class="gl"></div><div class="sub">CLUB HORLOGER</div><div class="foot">${L('FONDÉ EN 1948','FOUNDED IN 1948')} &nbsp;·&nbsp; V 1.0.0</div>`,
 mount:(el,p,e)=>{let done=false;const go2=()=>{if(done||curEntry!==e)return;done=true;afterSplash();};setTimeout(go2,RM?600:2100);el.addEventListener('click',go2);}};
function balanceSvg(){let sp='M0 0';for(let t=0;t<=6*Math.PI;t+=.25){const r=5+t*3.1;sp+=`L${f1(r*Math.cos(t))} ${f1(r*Math.sin(t))}`;}
 return `<svg class="bal" viewBox="-130 -130 260 260" aria-hidden="true"><g class="osc" fill="none" stroke="#C9A96A"><circle r="112" stroke-width="3"/><circle r="103" stroke-width="1" opacity=".5"/><path d="M-103 0H103M0-103V103" stroke-width="3"/>${[0,45,90,135,180,225,270,315].map(a=>`<circle cx="${f1(112*Math.cos(a*Math.PI/180))}" cy="${f1(112*Math.sin(a*Math.PI/180))}" r="5" fill="#C9A96A"/>`).join('')}</g><path class="hair" d="${sp}" fill="none" stroke="#E8D3A2" stroke-width="1.2" opacity=".8"/><circle r="7" fill="#C9A96A"/><circle r="2.5" fill="#A51E36"/></svg>`;}
function afterSplash(){if(S.onboarded){(S.sec.bioOpen&&S.sec.faceid?bioLock():Promise.resolve()).then(()=>enterTabs('home'));}else replace('welcome');}

SCR.welcome={tabs:false,clear:1,cls:'wel',title:()=>L('Bienvenue','Welcome'),
 render:()=>`<div class="hero"><span class="deco" style="left:22px;top:calc(var(--sb) + 60px);width:46px;height:46px;border-right:0;border-bottom:0"></span><span class="sq" style="left:34px;top:calc(var(--sb) + 76px);width:30px;height:30px"></span><span class="sq" style="left:60px;top:calc(var(--sb) + 66px);width:20px;height:20px;background:rgba(255,255,255,.1)"></span><span class="deco" style="right:24px;bottom:120px;width:46px;height:46px;border-left:0;border-top:0"></span><span class="sq" style="right:44px;top:calc(var(--sb) + 240px);width:28px;height:28px"></span>${renderWatch({type:'diver',dial:'black',bezel:'black',case:'bronze',strap:'steel',size:41,label:'SUPERMAN',label2:'1948 · BESANÇON',sec:'#D8A866',lume:'#E6D3A6',title:'Yema Superman'})}<div class="arbox">AR<sup>+</sup></div><div class="sr">SHOWROOM<br>${L('DIGITAL','DIGITAL')}<br>${L('EXCLUSIF','EXCLUSIVE')}</div></div>
 <div class="sheetw"><h1 class="h1">${L('L’Expérience Horlogère Intemporelle','The Timeless Watchmaking Experience')}</h1><p>${L('Rejoignez le club exclusif. Découvrez nos collections premium et essayez nos garde-temps de luxe grâce à la technologie AR avancée.','Join the exclusive club. Discover our premium collections and try our luxury timepieces with advanced AR technology.')}</p><button class="btn navy" type="button" data-act="toLogin"><span>${L('Continuer','Continue')}</span>${ic('arrow')}</button><div class="alt"><button class="tbtn" type="button" data-act="toLogin">${L('Se connecter','Sign in')}</button><button class="tbtn gold-t" type="button" data-act="explore">${L('Explorer directement','Explore now')} →</button></div></div>`};
A.toLogin=()=>go('login');
A.explore=()=>{S.guest=false;if(!S.consent)S.consent={analytics:false,perso:true,marketing:false};S.onboarded=true;save();buzz([10,30,10]);enterTabs('home');};

SCR.login={tabs:false,cls:'login',title:()=>L('Connexion','Sign in'),
 render:p=>`<span class="sq" style="right:44px;top:calc(var(--sb) + 58px);width:16px;height:16px" aria-hidden="true"></span><div class="pad"><div class="row" style="margin-top:4px"><button class="ibtn nb" type="button" data-act="back" aria-label="${L('Retour','Back')}">${ic('back')}</button></div><div class="brand">YEMA</div>
 <h1 class="h1">${L('Bon Retour','Welcome Back')}</h1><p class="p">${L('Saisissez vos identifiants pour accéder à votre espace digital.','Enter your credentials to access your digital space.')}</p>
 <form id="lf" novalidate autocomplete="on">
 <label class="fld"><span>${L('Email ou téléphone','Email or phone')}</span><div class="inp" id="i-em"><input id="em" name="email" type="text" inputmode="email" autocomplete="username" placeholder="${L('Entrez votre email','Enter your email')}" data-fk="em" value="alexandre.d@example.com"></div><small class="ferr" id="e-em"></small></label>
 <label class="fld"><span>${L('Mot de passe','Password')}<button type="button" class="link" style="font-size:11px;letter-spacing:.02em;text-transform:none" data-act="forgot">${L('Oublié ?','Forgot?')}</button></span><div class="inp" id="i-pw"><input id="pw" name="password" type="password" autocomplete="current-password" placeholder="••••••••" data-fk="pw" value="yema1948"><button type="button" class="ibtn nb" style="width:32px;height:32px;color:#7D8595" data-act="togglePw" aria-label="${L('Afficher le mot de passe','Show password')}" aria-pressed="false">${ic('eye')}</button></div><small class="ferr" id="e-pw"></small></label>
 <p class="demo-acc">${ic('user')}<span>${L('Compte démo prérempli : touchez « Se connecter ».','Demo account prefilled: just tap “Sign in”.')}</span></p>
 <button class="btn gold net" type="submit" style="margin-top:22px" id="lbtn">${L('Se connecter','Sign in')}</button>
 </form>
 <div class="or">${L('OU','OR')}</div>
 <button class="sso net" type="button" data-act="sso" data-p="Apple">${ic('apple')}${L('Continuer avec Apple','Continue with Apple')}</button>
 <button class="sso net" type="button" data-act="sso" data-p="Google">${ic('google')}${L('Continuer avec Google','Continue with Google')}</button>
 <div class="secure">${ic('lock')}${L('Authentification sécurisée','Secure authentication')}</div></div>`,
 mount:el=>{$('#lf',el).addEventListener('submit',e=>{e.preventDefault();doLogin(el);});['em','pw'].forEach(k=>$('#'+k,el).addEventListener('input',()=>{$('#i-'+k,el).classList.remove('err');$('#e-'+k,el).textContent='';}));}};
A.back=()=>back();
A.forgot=()=>toast(L('Lien de réinitialisation envoyé (démo)','Reset link sent (demo)'),{icon:'mail'});
A.togglePw=b=>{const i=$('#pw',curEl);const s=i.type==='password';i.type=s?'text':'password';b.setAttribute('aria-pressed',s);b.innerHTML=ic(s?'eyeoff':'eye');};
A._demoAcc=()=>{$('#em',curEl).value='alexandre.d@example.com';$('#pw',curEl).value='yema1948';['em','pw'].forEach(k=>{$('#i-'+k,curEl).classList.remove('err');$('#e-'+k,curEl).textContent='';});toast(L('Compte démo rempli','Demo account filled'),{icon:'user'});};
function doLogin(el){const em=$('#em',el).value.trim(),pw=$('#pw',el).value;let ok=true;
 if(!em){ok=false;$('#i-em',el).classList.add('err');$('#e-em',el).textContent=L('Saisissez votre email ou votre téléphone.','Enter your email or phone.');}
 if(!pw){ok=false;$('#i-pw',el).classList.add('err');$('#e-pw',el).textContent=L('Saisissez votre mot de passe.','Enter your password.');}
 if(!ok){buzz();return;}if(!needNet())return;
 const b=$('#lbtn',el);b.classList.add('loading');b.disabled=true;
 setTimeout(()=>{S.guest=false;if(em.includes('@'))S.user.email=em;save();loginNext();},RM?200:1000);}
A.sso=b=>{if(!needNet())return;b.classList.add('btn','line','loading');setTimeout(()=>{S.guest=false;save();toast(L(`Connecté avec ${b.dataset.p}`,`Signed in with ${b.dataset.p}`),{icon:'lock'});loginNext();},RM?200:900);};
function loginNext(){if(!S.consent)go('rgpd');else if(!S.prefs.wrist)go('prefs');else finishOnboarding();}
function finishOnboarding(){S.onboarded=true;save();enterTabs('home');}

/* consent rows (shared by #4 and #17) */
const CONS=[['analytics',{fr:'Analytiques',en:'Analytics'},{fr:'Nous aide à comprendre comment les visiteurs interagissent avec l’application.',en:'Helps us understand how visitors interact with the app.'}],['perso',{fr:'Personnalisation',en:'Personalisation'},{fr:'Permet à l’application de mémoriser vos préférences et paramètres.',en:'Lets the app remember your preferences and settings.'}],['marketing',{fr:'Marketing',en:'Marketing'},{fr:'Utilisé pour vous proposer des publicités plus pertinentes.',en:'Used to show you more relevant advertising.'}]];
function consentRows(c,act){return `<div class="crow"><div class="x"><b>${L('Strictement nécessaire','Strictly necessary')}</b><small>${L('Requis pour le bon fonctionnement de l’application. Ne peut pas être désactivé.','Required for the app to work. Cannot be disabled.')}</small></div><span class="always">${L('TOUJOURS ACTIF','ALWAYS ON')}</span></div>`+CONS.map(([k,t,d])=>`<div class="crow"><div class="x"><b id="cl-${k}">${tx(t)}</b><small>${tx(d)}</small></div><button class="tgl" type="button" role="switch" aria-checked="${!!c[k]}" aria-labelledby="cl-${k}" data-act="${act}" data-k="${k}"></button></div>`).join('');}
SCR.rgpd={tabs:false,clear:1,cls:'rg',bar:'',title:()=>L('Confidentialité','Privacy'),
 render:p=>{p.c=p.c||Object.assign({analytics:false,perso:false,marketing:false},S.consent||{});return `<div class="top"></div><div class="ivsheet"><div class="grab"><i></i></div><h1 class="h2">${L('Préférences de<br>Confidentialité','Privacy<br>Preferences')}</h1><p class="intro">${L('Nous utilisons des cookies pour améliorer votre expérience dans notre showroom numérique, analyser l’utilisation du site et vous assister dans nos efforts marketing.','We use cookies to improve your experience in our digital showroom, analyse usage and support our marketing efforts.')}</p>${consentRows(p.c,'cTgl')}<button class="btn gold" type="button" data-act="cAccept" style="margin-top:20px">${L('Accepter la sélection','Accept selection')}</button><button class="btn" type="button" data-act="cAll" style="margin-top:10px;color:var(--navy);border:1px solid var(--ivline)">${L('Tout accepter','Accept all')}</button><p class="center" style="margin:16px 0 0;font-size:11.5px;color:#8A8F99">${L('Modifiable à tout moment dans Profil › Paramètres RGPD.','Change anytime in Profile › GDPR settings.')}</p></div>`;}};
A.cTgl=b=>{const k=b.dataset.k;const p=curEntry.params;p.c[k]=!p.c[k];b.setAttribute('aria-checked',p.c[k]);buzz();};
A.cAccept=()=>{S.consent=Object.assign({},curEntry.params.c);save();toast(L('Préférences enregistrées','Preferences saved'),{icon:'shield'});consentNext();};
A.cAll=()=>{S.consent={analytics:true,perso:true,marketing:true};save();toast(L('Tous les cookies acceptés','All cookies accepted'),{icon:'shield'});consentNext();};
function consentNext(){if(NAV.mode==='flow'){if(!S.prefs.wrist||!S.onboarded)go('prefs');else finishOnboarding();}else back();}

SCR.prefs={tabs:false,title:()=>L('Préférences','Preferences'),
 render:p=>{const q=p.q=p.q||JSON.parse(JSON.stringify(S.prefs));const b=q.budget;const pct=v=>((v-500)/(10000-500)*100).toFixed(1);
 return `<div class="hdr">${p.from?`<button class="ibtn" type="button" data-act="back" aria-label="${L('Retour','Back')}">${ic('back')}</button>`:'<span class="spacer"></span>'}<span class="t"></span><span class="spacer"></span></div><div class="pad" style="padding-bottom:30px">
 <h1 class="h1 center">${L('Personnalisez Votre Expérience','Personalise Your Experience')}</h1><p class="p center" style="margin:10px 10px 0">${L('Adaptez votre showroom Yema Watch Club pour refléter vos goûts horlogers uniques.','Tailor your Yema Watch Club showroom to reflect your unique watch taste.')}</p>
 <div class="sech sec"><h2 class="h3">${L('Profil de poignet','Wrist profile')}</h2><span class="req ${p.err?'bad':''}">${L('REQUIS','REQUIRED')}</span></div>
 <div class="opt3" role="radiogroup" aria-label="${L('Profil de poignet','Wrist profile')}">${[['<16','< 16cm',L('Petit','Small')],['16-18','16-18cm',L('Moyen','Medium')],['>18','> 18cm',L('Large','Large')]].map(([k,a,c])=>`<button class="opt" type="button" role="radio" aria-checked="${q.wrist===k}" aria-pressed="${q.wrist===k}" data-act="pWrist" data-k="${k}"><b>${a}</b><small>${c}</small></button>`).join('')}</div>
 ${p.err?`<small class="ferr">${L('Choisissez votre profil de poignet : il calibre l’essayage en réalité augmentée.','Choose your wrist profile: it calibrates the AR try-on.')}</small>`:`<small class="muted small" style="display:block;margin-top:8px">${L('Sert à calibrer la taille des montres en essayage AR.','Used to calibrate watch size in the AR try-on.')}</small>`}
 <div class="sech sec"><h2 class="h3">${L('Collections favorites','Favourite collections')}</h2><span class="lbl">${L('Sélection multiple','Multi-select')}</span></div></div>
 <div class="hscroll">${Object.keys(COLS).map(k=>{const w=WATCHES.find(x=>x.col===k);return `<button class="colc" type="button" aria-pressed="${q.cols.includes(k)}" data-act="pCol" data-k="${k}"><span class="ck">${ic('check')}</span><span class="wimg" style="display:grid">${lw(w)}</span><b>${COLS[k].n}</b></button>`;}).join('')}</div>
 <div class="pad"><div class="sech sec" style="margin-bottom:4px"><h2 class="h3">${L('Plage d’investissement','Investment range')}</h2><b style="font-size:13px;color:var(--gold2)" id="bud">${eur(b[0])} – ${b[1]>=10000?eur(10000)+'+':eur(b[1])}</b></div>
 <div class="range2"><div class="trk"></div><div class="fill" id="bfill" style="left:${pct(b[0])}%;right:${100-pct(b[1])}%"></div><input type="range" min="500" max="10000" step="250" value="${b[0]}" id="r0" aria-label="${L('Budget minimum','Minimum budget')}"><input type="range" min="500" max="10000" step="250" value="${b[1]}" id="r1" aria-label="${L('Budget maximum','Maximum budget')}"></div><div class="scale"><span>${eur(500)}</span><span>${eur(10000)}+</span></div>
 <div class="sech sec"><h2 class="h3">${L('Préférences esthétiques','Style preferences')}</h2></div>
 <div class="chips">${STYLES.map(([k,l])=>`<button class="chip caps" type="button" aria-pressed="${q.styles.includes(k)}" data-act="pStyle" data-k="${k}">${tx(l)}</button>`).join('')}</div>
 <div class="sec" style="border-top:1px solid var(--line);padding-top:22px"><h2 class="h3">${L('Communications du Club','Club communications')}</h2><div class="row" style="margin-top:14px;align-items:flex-start"><div class="sp"><b style="font-size:13.5px" id="pl-l">${L('Lancements exclusifs','Exclusive launches')}</b><p class="p" style="margin-top:3px;font-size:12px">${L('Soyez le premier informé des éditions limitées.','Be the first to hear about limited editions.')}</p></div><button class="tgl" type="button" role="switch" aria-checked="${!!q.launches}" aria-labelledby="pl-l" data-act="pLaunch"></button></div></div>
 <button class="btn gold" type="button" data-act="pSave" style="margin-top:28px">${L('Sauvegarder & continuer','Save & continue')}</button>
 ${p.from?'':`<button class="tbtn" type="button" data-act="pSkip" style="display:block;margin:18px auto 0;border:0">${L('Passer pour le moment','Skip for now')}</button>`}</div>`;},
 mount:(el,p)=>{const r0=$('#r0',el),r1=$('#r1',el);const upd=e=>{let a=+r0.value,b=+r1.value;if(a>b-500){if(e&&e.target===r0){a=b-500;r0.value=a;}else{b=a+500;r1.value=b;}}p.q.budget=[a,b];const pct=v=>((v-500)/9500*100);$('#bfill',el).style.left=pct(a)+'%';$('#bfill',el).style.right=(100-pct(b))+'%';$('#bud',el).textContent=`${eur(a)} – ${b>=10000?eur(10000)+'+':eur(b)}`;};r0.addEventListener('input',upd);r1.addEventListener('input',upd);}};
A.pWrist=b=>{const p=curEntry.params;p.q.wrist=b.dataset.k;p.err=false;rerender();};
A.pCol=b=>{const q=curEntry.params.q,k=b.dataset.k;q.cols=q.cols.includes(k)?q.cols.filter(x=>x!==k):q.cols.concat(k);b.setAttribute('aria-pressed',q.cols.includes(k));buzz();};
A.pStyle=b=>{const q=curEntry.params.q,k=b.dataset.k;q.styles=q.styles.includes(k)?q.styles.filter(x=>x!==k):q.styles.concat(k);b.setAttribute('aria-pressed',q.styles.includes(k));};
A.pLaunch=b=>{const q=curEntry.params.q;q.launches=!q.launches;b.setAttribute('aria-checked',q.launches);};
A.pSave=()=>{const p=curEntry.params;if(!p.q.wrist)p.q.wrist='16-18';p.q.cm={'<16':15,'16-18':17,'>18':19}[p.q.wrist];S.prefs=p.q;S.user.wrist=p.q.wrist;save();if(p.from){toast(L('Préférences mises à jour','Preferences updated'));back();}else{toast(L('Votre showroom est prêt','Your showroom is ready'),{icon:'sparkle'});finishOnboarding();}};
A.pSkip=()=>{finishOnboarding();};

/* ================= home ================= */
SCR.home={title:()=>L('Accueil','Home'),
 render:()=>{const rec=recos().slice(0,4);const news=WATCHES.filter(w=>w.isNew).concat(WATCHES.filter(w=>!w.isNew&&w.ltd));const nm=S.guest?L('Invité','Guest'):S.user.first;
 return `<div class="hello"><div class="x"><span class="lbl">${S.guest?L('Bienvenue','Welcome'):L('Bon retour','Welcome back')}</span><h1 class="h1">${esc(nm)}</h1></div><button class="ibtn" type="button" data-act="notifs" aria-label="${L('Notifications','Notifications')}">${ic('bell')}<span class="badge" data-badge="notif"></span></button></div>
 ${storiesRow()}
 <div class="pad">${dropCard()}<div class="tiles"><button class="tile" type="button" data-act="toColl" data-t="owned"><span class="top">${ic('watch')}${L('Ma Collection','My Collection')}</span><div class="n"><b>${S.owned.length}</b>${L('Garde-temps','Timepieces')}</div></button><button class="tile" type="button" data-act="toColl" data-t="wish"><span class="top">${ic('heart')}${L('Liste d’envies','Wishlist')}</span><div class="n"><b>${S.wish.length}</b>${L('Sauvegardés','Saved')}</div></button></div>
 <button class="essai" type="button" data-act="essai">${renderWatch({type:'chrono',dial:'black',sub:'cream',bezel:'black',case:'brushed',strap:'leather',size:42,cls:'bgw',label:'RALLYGRAF'})}<span class="ib">${ic('ar')}</span><span class="h2">${L('Essai Virtuel','Virtual Try-On')}</span><p>${L('Découvrez notre collection à votre poignet, instantanément.','See our collection on your wrist, instantly.')}</p><span class="link go">${L('Essayer maintenant','Try it now')}${ic('arrow')}</span></button></div>
 <div class="sec"><div class="sech pad"><div><h2 class="h2">${L('Recommandé pour vous','Recommended for you')}</h2><span class="small muted">${L('Selon vos préférences','Based on your preferences')} · ${S.prefs.wrist?S.prefs.wrist.replace('<','< ').replace('>','> ')+' cm':''}</span></div><button class="link" type="button" data-act="editPrefs">${L('Modifier','Edit')}</button></div><div class="hscroll reco">${rec.map((x,i)=>wcard(x.w,{i,why:x.r.slice(0,2).join(' · ')})).join('')}</div></div>
 <div class="sec"><div class="sech pad"><h2 class="h2">${L('Nouveautés','New arrivals')}</h2><button class="link" type="button" data-act="allNew">${L('Tout voir','See all')}</button></div><div class="hscroll">${news.map((w,i)=>wcard(w,{i})).join('')}</div></div>
 <div class="sec"><div class="cercle">${`<div class="bg">${roomArt('cercle')}</div>`}<span class="pill">${L('EXCLUSIF','EXCLUSIVE')}</span><h2 class="h1">${L('Le Cercle des<br>Collectionneurs','The Collectors’<br>Circle')}</h2><p>${L('Rejoignez notre communauté privée pour un accès anticipé aux éditions limitées et des invitations à des événements exclusifs.','Join our private community for early access to limited editions and invitations to exclusive events.')}</p><button class="btn line" type="button" data-act="toClub">${L('Découvrir les avantages','Discover the benefits')}</button></div></div>
 <div class="sec"><div class="sech pad"><h2 class="h2">${L('Collections emblématiques','Iconic collections')}</h2></div><div class="hscroll">${Object.keys(COLS).map(k=>{const w=WATCHES.find(x=>x.col===k);return `<button class="emb" type="button" data-act="toCol" data-k="${k}"><span class="rd">${lw(w)}</span><b>${COLS[k].n}</b></button>`;}).join('')}</div></div>
 `;},
 mount:(el,p,e)=>{if(!S.pushed)setTimeout(()=>{if(curEntry!==e||sheets.length||S.pushed)return;editionPush();},RM?800:2600);}};
function editionPush(){S.pushed=true;if(!S.notifs.find(n=>n.id==='n0'))S.notifs.unshift({id:'n0',k:'launch',ts:Date.now(),read:false,to:{s:'pdp',p:{id:'sh',from:'push'}},t:{fr:'Édition limitée 1/500',en:'Limited edition 1/500'},b:{fr:'Superman Heritage 1/500 — accès anticipé VIP ouvert pendant 72 h.',en:'Superman Heritage 1/500 — VIP early access open for 72 hours.'},cta:{fr:'Voir la pièce',en:'View the piece'}});save();syncChrome();
 push({title:L('Édition limitée Superman Heritage 1/500','Limited edition Superman Heritage 1/500'),body:L('Accès anticipé VIP — réservez avant l’ouverture au public.','VIP early access — reserve before the public release.'),onTap:()=>{const n=S.notifs.find(x=>x.id==='n0');if(n)n.read=true;save();step(0);go('pdp',{id:'sh',from:'push'});}});}
A.notifs=()=>go('notifs');
A.toColl=b=>switchTab('collection',{tab:b.dataset.t});
A.essai=()=>{const r=recos()[0].w;startAR(r.id);};
A.editPrefs=()=>go('prefs',{from:'home'});
A.allNew=()=>{S.cat.sort='new';S.cat.cols=[];save();switchTab('catalog',{});};
A.toClub=()=>switchTab('club');
A.toCol=b=>{S.cat.cols=[b.dataset.k];S.cat.q='';save();switchTab('catalog',{});};
A.heart=b=>{toggleWish(b.dataset.id,b);const on=baseInWish(b.dataset.id);$$(`.heart[data-id="${b.dataset.id}"]`,app).forEach(h=>{h.setAttribute('aria-pressed',on);h.innerHTML=ic(on?'heartf':'heart');});$$('.tile .n b',curEl).forEach((n,i)=>{if(i===1)n.textContent=S.wish.length;});};
A.pdp=b=>go('pdp',{id:b.dataset.id});

/* ================= catalogue ================= */
const SORTS=[['reco',{fr:'Recommandé',en:'Recommended'}],['asc',{fr:'Prix : croissant',en:'Price: low to high'}],['desc',{fr:'Prix : décroissant',en:'Price: high to low'}],['new',{fr:'Nouveautés',en:'New arrivals'}]];
function filterW(c){const q=(c.q||'').trim().toLowerCase();let r=WATCHES.filter(w=>(!c.cols.length||c.cols.includes(w.col))&&(!c.sizes.length||c.sizes.includes(w.size))&&(!c.moves.length||c.moves.includes(MOVES[w.move].cat)));
 if(q){r=r.filter(w=>[tx(w.name),w.name.en,COLS[w.col].n,MOVES[w.move].short,tx(DIALS[w.dial]),DIALS[w.dial].en,w.size+'mm',w.tags.join(' '),w.ref].join(' ').toLowerCase().includes(q));}
 if(c.sort==='asc')r.sort((a,b)=>effPrice(a)-effPrice(b));else if(c.sort==='desc')r.sort((a,b)=>effPrice(b)-effPrice(a));else if(c.sort==='new')r.sort((a,b)=>(b.isNew||0)-(a.isNew||0)||(b.ltd?1:0)-(a.ltd?1:0));else r.sort((a,b)=>score(b).s-score(a).s);return r;}
const nFilters=c=>c.sizes.length+c.moves.length+(c.cols.length>1?c.cols.length:0)+(c.sort!=='reco'?1:0);
function catGrid(){const c=S.cat;const r=filterW(c);if(!r.length)return `<div class="empty">${emptyArt('search')}<h2 class="h2">${L('Aucun résultat','No results')}</h2><p>${c.q?L(`Aucune montre ne correspond à « ${esc(c.q)} » avec ces filtres.`,`No watch matches “${esc(c.q)}” with these filters.`):L('Aucune montre ne correspond à ces filtres.','No watch matches these filters.')}</p><button class="btn line sm pill" type="button" data-act="catReset">${L('Réinitialiser la recherche','Reset search')}</button></div>`;
 return `<div class="grid2">${r.map((w,i)=>wcard(w,{i})).join('')}</div>`;}
function catCount(){const r=filterW(S.cat);return `<span><b>${r.length}</b> ${r.length>1?L('garde-temps','timepieces'):L('garde-temps','timepiece')}</span><button class="link" type="button" data-act="catFilters" style="letter-spacing:.06em">${L('Trier','Sort')} : ${tx(SORTS.find(s=>s[0]===S.cat.sort)[1])}</button>`;}
SCR.catalog={title:()=>L('Catalogue','Catalogue'),
 render:p=>{const c=S.cat;const tab=c.cols.length===1?c.cols[0]:(c.cols.length?'':'all');const showS=p.search||!!c.q;
 return `<div class="cattop"><h1 class="h1">${L('Catalogue','Catalogue')}</h1><button class="ibtn nb ${showS?'on':''}" type="button" data-act="catSearch" aria-label="${L('Rechercher','Search')}" aria-expanded="${showS}">${ic('search')}</button><button class="ibtn nb" type="button" data-act="catFilters" aria-label="${L('Filtres et tri','Filters and sort')}">${ic('sliders')}${nFilters(c)?'<span class="dot"></span>':''}</button></div>
 <div class="seg" role="tablist">${[['all',L('Tout','All')]].concat(Object.keys(COLS).map(k=>[k,COLS[k].n])).map(([k,l])=>`<button type="button" role="tab" aria-selected="${tab===k}" data-act="catTab" data-k="${k}">${l}</button>`).join('')}</div>
 ${showS?`<div class="srch" style="margin-top:14px">${ic('search')}<input id="cq" type="search" value="${esc(c.q)}" placeholder="${L('Modèle, calibre, couleur…','Model, calibre, colour…')}" aria-label="${L('Rechercher dans le catalogue','Search the catalogue')}" data-fk="cq" enterkeyhint="search">${c.q?`<button class="ibtn nb" style="width:30px;height:30px" type="button" data-act="catClear" aria-label="${L('Effacer','Clear')}">${ic('close')}</button>`:''}</div>`:''}
 ${OFF?`<span class="cache">${ic('wifioff')}${L('Catalogue en cache · mis à jour il y a 2 h','Cached catalogue · updated 2 h ago')}</span>`:''}
 <div class="resbar" id="catcount">${catCount()}</div><div id="catgrid">${catGrid()}</div>`;},
 mount:(el,p)=>{const i=$('#cq',el);if(i){if(p.search&&!p.focused){p.focused=true;setTimeout(()=>i.focus(),120);}let t;i.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(()=>{S.cat.q=i.value;save();$('#catgrid',el).innerHTML=catGrid();$('#catcount',el).innerHTML=catCount();},120);});}}};
A.catTab=b=>{S.cat.cols=b.dataset.k==='all'?[]:[b.dataset.k];save();rerender();};
A.catSearch=()=>{const p=curEntry.params;if(p.search||S.cat.q){p.search=false;p.focused=false;S.cat.q='';}else{p.search=true;p.focused=false;}save();rerender();};
A.catClear=()=>{S.cat.q='';save();rerender();const i=$('#cq',curEl);if(i)i.focus();};
A.catReset=()=>{S.cat={cols:[],sort:'reco',sizes:[],moves:[],q:''};curEntry.params.search=false;save();rerender();};
function filterSheetHTML(t){const n=filterW(Object.assign({},t,{q:S.cat.q})).length;const ck=(on,a,k,l)=>`<button class="ckrow" type="button" role="checkbox" aria-checked="${on}" data-act="${a}" data-k="${k}">${l}<span class="ckb">${ic('check')}</span></button>`;
 return sheetHTML(L('Filtres & Tri','Filters & Sort'),`<div class="fgrp"><span class="lbl">${L('Trier par','Sort by')}</span><div class="chips">${SORTS.map(([k,l])=>`<button class="chip" type="button" aria-pressed="${t.sort===k}" data-act="fSort" data-k="${k}">${tx(l)}</button>`).join('')}</div></div>
 <div class="fgrp"><span class="lbl">Collection</span>${Object.keys(COLS).map(k=>ck(t.cols.includes(k),'fCol',k,COLS[k].n)).join('')}</div>
 <div class="fgrp"><span class="lbl">${L('Taille du boîtier','Case size')}</span><div class="sizes">${[39,41,42].map(s=>`<button class="chip" type="button" aria-pressed="${t.sizes.includes(s)}" data-act="fSize" data-k="${s}">${s}mm</button>`).join('')}</div></div>
 <div class="fgrp"><span class="lbl">${L('Mouvement','Movement')}</span>${ck(t.moves.includes('manu'),'fMove','manu',L('Calibre Manufacture','Manufacture calibre'))}${ck(t.moves.includes('auto'),'fMove','auto',L('Automatique (ETA / Sellita)','Automatic (ETA / Sellita)'))}</div>`,
 `<button class="btn ghost" type="button" data-act="fClear" style="flex:0 0 38%">${L('Effacer','Clear')}</button><button class="btn gold" type="button" data-act="fApply" ${n?'':'aria-disabled="true"'}>${L('Appliquer','Apply')} (${n})</button>`);}
A.catFilters=()=>{const t=JSON.parse(JSON.stringify(S.cat));openSheet({label:L('Filtres et tri','Filters and sort'),html:filterSheetHTML(t),data:{t}});};
const fUpd=()=>{const o=topSheet();setSheet(o,filterSheetHTML(o.data.t));};
A.fSort=b=>{topSheet().data.t.sort=b.dataset.k;fUpd();};
A.fCol=b=>{const t=topSheet().data.t,k=b.dataset.k;t.cols=t.cols.includes(k)?t.cols.filter(x=>x!==k):t.cols.concat(k);fUpd();};
A.fSize=b=>{const t=topSheet().data.t,k=+b.dataset.k;t.sizes=t.sizes.includes(k)?t.sizes.filter(x=>x!==k):t.sizes.concat(k);fUpd();};
A.fMove=b=>{const t=topSheet().data.t,k=b.dataset.k;t.moves=t.moves.includes(k)?t.moves.filter(x=>x!==k):t.moves.concat(k);fUpd();};
A.fClear=()=>{const o=topSheet();o.data.t={cols:[],sort:'reco',sizes:[],moves:[],q:S.cat.q};fUpd();};
A.fApply=()=>{const t=topSheet().data.t;S.cat=Object.assign(t,{q:S.cat.q});save();closeSheet();rerender();if(curEl)curEl.scrollTo({top:0});};

/* ================= product page ================= */
const VIEWS=[['front',{fr:'Face',en:'Front'}],['34',{fr:'Trois-quarts',en:'Three-quarter'}],['back',{fr:'Fond saphir',en:'Sapphire caseback'}],['detail',{fr:'Détail du cadran',en:'Dial detail'}]];
SCR.pdp={cls:'pdp',clear:1,title:p=>tx(W(p.id).name),
 render:p=>{const w=W(p.id),cfg=p.cfg||null,on=baseInWish(w.id),mv=MOVES[w.move],pr=cfg?priceOf(w,cfg):effPrice(w);p.acc=p.acc||{};
 const acc=(k,t,body)=>`<div class="acc" data-open="${p.acc[k]?1:0}"><button type="button" data-act="acc" data-k="${k}" aria-expanded="${!!p.acc[k]}">${t}${ic('plus')}</button><div class="ab"><div><div class="in">${body}</div></div></div></div>`;
 const sim=WATCHES.filter(x=>x.id!==w.id&&(x.col===w.col||x.type===w.type)).slice(0,5);
 return `<div class="hdr"><button class="ibtn" type="button" data-act="back" aria-label="${L('Retour','Back')}">${ic('back')}</button><span class="sp"></span><button class="ibtn heart-pdp" type="button" data-act="pdpHeart" aria-pressed="${on}" aria-label="${L('Liste de souhaits','Wishlist')}">${ic(on?'heartf':'heart')}</button><button class="ibtn" type="button" data-act="share" aria-label="${L('Partager','Share')}">${ic('share')}</button></div>
 <div class="car" id="car"><div class="track" id="track" tabindex="0" aria-label="${L('Vues de la montre','Watch views')}">${VIEWS.map(([k,l],i)=>`<div class="slide" aria-label="${tx(l)}">${wsvg(w,cfg,{view:k,hero:i===0})}${i===0?`<button class="crownhit" type="button" aria-label="${L('Régler l’heure : faites tourner la couronne (flèches haut/bas)','Set the time: turn the crown (up/down arrows)')}"></button><span class="settime" aria-live="polite"></span>`:''}</div>`).join('')}</div><span class="vlabel" id="vlabel">${tx(VIEWS[0][1])}</span><button class="lumebtn" type="button" data-act="lume" aria-pressed="false">${ic('moon')}${L('Lume','Lume')}</button></div>
 <div class="dots" id="dots">${VIEWS.map((v,i)=>`<button type="button" aria-label="${tx(v[1])}" aria-current="${i===0}" data-act="dot" data-i="${i}"></button>`).join('')}</div>
 <div class="pad" style="margin-top:18px"><span class="lbl">${COLS[w.col].n}${w.ltd?` · ${L('Édition limitée','Limited edition')} ${w.ltd}`:''}</span>
 <div class="ttlrow"><h1 class="h1">${esc(tx(w.name))}</h1><div class="pr">${eur(pr)}${w.drop&&!cfg?`<div style="font-size:11.5px;color:var(--mut);text-decoration:line-through;text-align:right">${eur(w.price)}</div>`:''}</div></div>
 <div class="badges">${w.isNew?`<span class="bdg">${L('Nouveau','New')}</span>`:''}${w.ltd?`<span class="bdg">${ic('crown')}${L('Accès anticipé VIP','VIP early access')}</span>`:''}${w.drop?`<span class="bdg">${ic('trend')}−${w.drop*100}${L(' %','%')} VIP</span>`:''}${cfg?`<span class="bdg">${ic('sliders')}${L('Votre configuration','Your configuration')}</span>`:''}</div>
 ${cfg?`<p class="p small" style="margin-top:10px">${esc(cfgLine(cfg))}</p>`:''}${w.id==='sh'?`<div class="livebar"><span class="pulse"></span><span><b data-left>${S.left}</b> ${L('exemplaires restants','pieces left')} · <b data-seen>${seenN}</b> ${L('membres la regardent','members viewing')}</span></div>`:''}
 <button class="btn gold" type="button" data-act="tryAR" style="margin-top:22px">${ic('ar')}${L('Essayer en RA','AR Try-On')}</button>
 <button class="btn line" type="button" data-act="custAR" style="margin-top:12px">${ic('sliders')}${L('Personnaliser en RA','Customize in AR')}</button>
 <div class="specs"><div class="spec">${ic('ruler')}<small>${L('Taille','Size')}</small><b>${w.size}mm</b></div><div class="spec">${ic('cog')}<small>${L('Calibre','Calibre')}</small><b>${mv.short}</b></div><div class="spec">${ic('water')}<small>${L('Étanchéité','Water res.')}</small><b>${w.wr}m</b></div></div>
 <p class="p" style="margin:22px 0">${esc(tx(w.d))}</p>
 ${acc('specs',L('Caractéristiques complètes','Full specifications'),`<div class="kv"><span>${L('Référence','Reference')}</span><b>${w.ref}</b></div><div class="kv"><span>${L('Boîtier','Case')}</span><b>${tx(CASES[(cfg||w).case||w.case])} · ${w.size} mm</b></div><div class="kv"><span>${L('Cadran','Dial')}</span><b>${tx(DIALS[(cfg&&cfg.dial)||w.dial])}</b></div><div class="kv"><span>${L('Mouvement','Movement')}</span><b>${tx(mv)}</b></div><div class="kv"><span>${L('Réserve de marche','Power reserve')}</span><b>${mv.res}</b></div><div class="kv"><span>${L('Fréquence','Frequency')}</span><b>${mv.freq}</b></div><div class="kv"><span>${L('Verre','Crystal')}</span><b>${L('Saphir bombé, traitement antireflet','Domed sapphire, anti-reflective')}</b></div><div class="kv"><span>${L('Étanchéité','Water resistance')}</span><b>${w.wr} m</b></div><div class="kv"><span>${L('Bracelet','Strap')}</span><b>${tx(STRAPS[(cfg&&cfg.strap)||w.strap])}</b></div><div class="kv"><span>${L('Garantie','Warranty')}</span><b>${L('3 ans internationale','3-year international')}</b></div>`)}
 ${acc('ship',L('Livraison & retours','Shipping & returns'),`${L('Livraison offerte et assurée en 48 h en France métropolitaine, remise en main propre sur rendez-vous. Retour gratuit sous 30 jours dans son écrin d’origine.','Free insured delivery in 48 h in mainland France, hand delivery by appointment. Free returns within 30 days in the original box.')}`)}
 ${acc('vip',L('Avantages Club VIP','VIP Club benefits'),`${L('Accès anticipé de 48 h aux séries limitées, gravure du fond offerte, bracelet supplémentaire au choix et conseiller horloger dédié.','48-hour early access to limited series, complimentary caseback engraving, an extra strap of your choice and a dedicated watch advisor.')}`)}
 <div class="list" style="margin-top:22px"><button class="li" type="button" data-act="compare">${ic('compare')}<span class="tx">${L('Comparer avec un autre modèle','Compare with another model')}<small>${L('Taille, calibre, réserve de marche, prix','Size, calibre, power reserve, price')}</small></span>${ic('chev','chev')}</button><button class="li" type="button" data-act="stores">${ic('pin')}<span class="tx">${L('Trouver une boutique','Find a boutique')}<small>${L('Essayez cette pièce près de chez vous','Try this piece near you')}</small></span>${ic('chev','chev')}</button><button class="li" type="button" data-act="ownIt" data-id="${w.id}">${ic('shield')}<span class="tx">${L('Vous possédez ce modèle ?','Already own this model?')}<small>${L('Enregistrez-le dans Ma Collection','Register it in My Collection')}</small></span>${ic('chev','chev')}</button></div>
 </div>
 <div class="sec"><div class="sech pad"><h2 class="h2">${L('Vous aimerez aussi','You may also like')}</h2></div><div class="hscroll">${sim.map((x,i)=>wcard(x,{i})).join('')}</div></div>
 <div class="stick"><button class="btn line net" type="button" data-act="concierge" style="flex:1">${ic('chat')}${L('Conciergerie','Concierge')}</button><button class="btn gold" type="button" data-act="pdpHeart" style="flex:1.2" id="wishcta">${on?ic('heartf')+L('Dans vos souhaits','In your wishlist'):ic('heart')+L('Ajouter aux souhaits','Add to wishlist')}</button></div>`;},
 mount:(el,p)=>{const tr=$('#track',el);const dots=$$('#dots button',el);let raf;tr.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const i=Math.round(tr.scrollLeft/tr.clientWidth);dots.forEach((d,j)=>d.setAttribute('aria-current',i===j));$('#vlabel',el).textContent=tx(VIEWS[i]?VIEWS[i][1]:VIEWS[0][1]);p.slide=i;});});if(p.slide)tr.scrollLeft=p.slide*tr.clientWidth;tr.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();tr.scrollBy({left:(e.key==='ArrowRight'?1:-1)*tr.clientWidth,behavior:RM?'auto':'smooth'});}});
  const st=$('.stick',el);const ar=$('[data-act="custAR"]',el);const chk=()=>{const r=ar.getBoundingClientRect(),c=el.getBoundingClientRect();st.classList.toggle('show',r.bottom<c.top+60||r.top>c.bottom);};el.addEventListener('scroll',chk,{passive:true});requestAnimationFrame(chk);
  el._cl=pdpAlive(el,p);
  if(p.id==='sh')step(1);},
 unmount:el=>{if(el._cl)el._cl();}};
A.dot=b=>{const tr=$('#track',curEl);tr.scrollTo({left:+b.dataset.i*tr.clientWidth,behavior:RM?'auto':'smooth'});};
A.acc=b=>{const p=curEntry.params,k=b.dataset.k;p.acc[k]=!p.acc[k];const a=b.parentElement;a.dataset.open=p.acc[k]?1:0;b.setAttribute('aria-expanded',!!p.acc[k]);};
A.pdpHeart=()=>{const p=curEntry.params;if(p.cfg){if(inWish(p.id,p.cfg)){toast(L('Déjà dans vos souhaits','Already in your wishlist'),{icon:'heartf'});return;}addWish(p.id,p.cfg);toast(L('Configuration ajoutée à vos souhaits','Configuration added to your wishlist'),{icon:'heartf'});}else toggleWish(p.id);const on=baseInWish(p.id);const h=$('.heart-pdp',curEl);h.setAttribute('aria-pressed',on);h.innerHTML=ic(on?'heartf':'heart');h.classList.remove('pop');void h.offsetWidth;h.classList.add('pop');$('#wishcta',curEl).innerHTML=on?ic('heartf')+L('Dans vos souhaits','In your wishlist'):ic('heart')+L('Ajouter aux souhaits','Add to wishlist');};
A.share=async()=>{const w=W(curEntry.params.id);const d={title:`Yema ${tx(w.name)}`,text:L(`Je regarde la ${tx(w.name)} sur Yema Watch Club.`,`I’m looking at the ${tx(w.name)} on Yema Watch Club.`),url:location.href.split('#')[0]};if(!needNet())return;try{if(navigator.share){await navigator.share(d);return;}}catch(e){if(e&&e.name==='AbortError')return;}try{await navigator.clipboard.writeText(`${d.text} ${d.url}`);toast(L('Lien copié dans le presse-papiers','Link copied to clipboard'),{icon:'share'});}catch(e){toast(L('Partage prêt : lien de la fiche copié (démo)','Share ready: product link copied (demo)'),{icon:'share'});}};
A.tryAR=()=>{const p=curEntry.params;startAR(p.id,{cfg:p.cfg});};
A.custAR=()=>{const p=curEntry.params;startAR(p.id,{cfg:p.cfg,custom:true});};
A.stores=()=>go('stores');
A.concierge=()=>{go('concierge');};
A.ownIt=b=>openAddWatch({wid:b.dataset.id});
A.closeSheet=()=>closeSheet();
