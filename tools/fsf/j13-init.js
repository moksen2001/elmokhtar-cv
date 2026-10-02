/* ================= side panel (guided tour), language, PWA hint, boot ================= */
const T={back:['Retour au CV','Back to CV'],banner:['<b>Concept</b> · Gaïndé, l’app des supporters du Sénégal · imaginée par El Mokhtar Berrada · non officielle, non affiliée à la FSF · paiements simulés','<b>Concept</b> · Gaïndé, the Senegal fans’ app · imagined by El Mokhtar Berrada · unofficial, not affiliated with the FSF · simulated payments'],
 pKicker:['Concept produit · prototype interactif · 2026','Product concept · interactive prototype · 2026'],pTitle:['Le compagnon de match de chaque supporter','Every fan’s matchday companion'],
 pPitch:['<li><b>Suivre</b><span>Prochain match, direct minute par minute, calendrier de toutes les sélections.</span></li><li><b>Vivre</b><span>Coulisses en stories, vidéos FSF TV, Homme du match, pronos, quiz.</span></li><li><b>Soutenir</b><span>Billet en 4 écrans, maillot floqué, carte supporter à points.</span></li>','<li><b>Follow</b><span>Next match, minute-by-minute live, fixtures for every national team.</span></li><li><b>Live</b><span>Behind-the-scenes stories, FSF TV videos, Man of the Match, predictions, quiz.</span></li><li><b>Support</b><span>A ticket in 4 screens, personalised jersey, points-based supporter card.</span></li>'],
 pGuided:['Visite guidée','Guided tour'],pNote:['Concept d’application imaginé par El Mokhtar Berrada · non officiel · non affilié à la FSF. Données réelles sourcées au 2 octobre 2026, photos Wikimedia Commons sous licences libres, paiements simulés.','App concept imagined by El Mokhtar Berrada · unofficial · not affiliated with the FSF. Real data sourced as of 2 October 2026, Wikimedia Commons photos under free licences, simulated payments.'],pRestart:['Recommencer','Restart']};
const STEPS=[[{fr:'Match en direct & but',en:'Live match & goal'},{fr:'Sénégal 5-0 Irak rejoué avec les données FIFA',en:'Senegal 5-0 Iraq replayed with FIFA data'}],[{fr:'Homme du match',en:'Man of the Match'},{fr:'Vote, pourcentages animés, carte à partager',en:'Vote, animated percentages, shareable card'}],[{fr:'Billet',en:'Ticket'},{fr:'Tribune → places → paiement simulé → e-billet',en:'Stand → seats → simulated payment → e-ticket'}],[{fr:'Coulisses',en:'Inside'},{fr:'Stories plein écran et vidéos FSF TV',en:'Full-screen stories and FSF TV videos'}],[{fr:'Pronos & quiz',en:'Predictions & quiz'},{fr:'Score de Sénégal – Comores, 10 questions sourcées',en:'Senegal – Comoros score, 10 sourced questions'}],[{fr:'Carte supporter Gaïndé',en:'Gaïndé supporter card'},{fr:'Niveaux, points, QR code',en:'Levels, points, QR code'}]];
function renderSteps(){$('#steps').innerHTML=STEPS.map(([t,d],i)=>`<li class="${S.steps[i]?'done':''}"><button type="button" data-step="${i}"><span class="n"><em>${i+1}</em>${ic('check')}</span><span><b>${tx(t)}</b><small>${tx(d)}</small></span></button></li>`).join('');}
function renderPanel(){$$('[data-t]').forEach(n=>{const v=T[n.dataset.t];if(v)n.innerHTML=v[LANG==='en'?1:0];});$('#pmark').innerHTML=lionSVG()+wordmark();renderSteps();}
function panelCur(){}
function setLang(l){LANG=l==='en'?'en':'fr';S.lang=LANG;if(!NOSAVE)lsSet(KEY,JSON.stringify(S));document.documentElement.lang=LANG;$('#lngbtn').textContent=LANG==='fr'?'EN':'FR';$('#lngbtn').setAttribute('aria-label',LANG==='fr'?'Switch to English':'Passer en français');$('#backcv').href=LANG==='en'?'../en/#projets':'../#projets';document.title=LANG==='fr'?'Gaïndé · l’app des supporters du Sénégal (concept)':'Gaïndé · the Senegal fans’ app (concept)';renderTabbar();renderPanel();const e=top();if(e)build(e);const pl=$('.pill1');if(pl)pillHTML(pl);}
function closePanel(){$('#panel').classList.remove('open');}
function jumpStep(i){closePanel();closeStory(true);
 if(i===0){setStack('home',[['home'],['live']]);setTimeout(()=>{if(!LIVE.fired.length)A.lvNext();},500);return;}
 if(i===1){setStack('home',[['home'],['vote']]);return;}
 if(i===2){setStack('home',[['home'],['tickets'],['seatmap',{z:'est'}]]);step(2);return;}
 if(i===3){setStack('coulisses',[['coulisses']]);setTimeout(()=>openStory(0),350);return;}
 if(i===4){setStack('home',[['home'],['pronos']]);step(4);return;}
 if(i===5){setStack('moi',[['moi'],['card']]);return;}}
function restart(){closePanel();closeStory(true);const lg=LANG;S=defState();S.lang=lg;save();liveReset();$$('.goalfx,.payov,.lvlup',layer).forEach(n=>n.remove());renderPanel();startFlow('splash');}
function pillHTML(p){p.innerHTML=`<a href="${LANG==='en'?'../en/#projets':'../#projets'}">← CV</a><button type="button" data-pill="lang">${LANG==='fr'?'EN':'FR'}</button>`;}
function firstPill(){if(!IS_PHONE()||STANDALONE||NOSAVE)return;const p=document.createElement('div');p.className='pill1';pillHTML(p);app.appendChild(p);p.addEventListener('click',e=>{if(e.target.closest('[data-pill]')){setLang(LANG==='fr'?'en':'fr');clearTimeout(t);t=setTimeout(hide,4000);}});const hide=()=>{p.classList.add('gone');setTimeout(()=>p.remove(),600);};let t=setTimeout(hide,5200);}
function maybeInstall(){if(STANDALONE||NOSAVE||!IS_PHONE()||lsGet('gainde-install'))return;setTimeout(()=>{if(sheets.length||NAV.mode!=='tabs'||!top()||top().name!=='home'||lsGet('gainde-install'))return;lsSet('gainde-install','1');
 const ios=/iPhone|iPad|iPod/.test(navigator.userAgent);openSheet({label:L('Installer','Install'),html:sheetHTML(L('Gaïndé sur votre écran d’accueil','Gaïndé on your home screen'),`<div class="inst"><span class="inst-i">${lionSVG()}</span><p class="p">${ios?L('Touchez <b>Partager</b> puis <b>Sur l’écran d’accueil</b> : l’app s’ouvre en plein écran, comme une vraie application.','Tap <b>Share</b> then <b>Add to Home Screen</b>: the app opens full screen, like a native app.'):L('Ouvrez le menu du navigateur puis <b>Installer l’application</b> / <b>Ajouter à l’écran d’accueil</b>.','Open the browser menu then <b>Install app</b> / <b>Add to Home screen</b>.')}</p></div>`,`<button class="btn y block" type="button" data-act="closeSheet">${L('Compris','Got it')}</button>`)});},10000);}

/* events */
app.addEventListener('click',e=>{const t=e.target.closest('[data-act],[data-tab]');if(!t||!app.contains(t))return;if(t.closest('.story'))return;if(t.dataset.tab&&t.classList.contains('tb')){buzz(4);switchTab(t.dataset.tab);return;}const f=A[t.dataset.act];if(f){if(t.tagName==='A'&&t.getAttribute('href'))return;e.preventDefault();f(t,e);}});
app.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('g[data-act],[role="button"][data-act]')&&e.target.tagName!=='BUTTON'){e.preventDefault();const f=A[e.target.dataset.act];f&&f(e.target,e);}});
$('#panel').addEventListener('click',e=>{const s=e.target.closest('[data-step]');if(s)jumpStep(+s.dataset.step);});
$('#restart').addEventListener('click',restart);
$('#lngbtn').addEventListener('click',()=>setLang(LANG==='fr'?'en':'fr'));
$('#pclose').addEventListener('click',closePanel);
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('#panel').classList.contains('open')){closePanel();return;}if(STO){closeStory();return;}if($('.dlgw',layer))return;if(sheets.length){closeSheet();return;}const ae=document.activeElement;if(ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName))return;if(stk().length>1)back();});
document.addEventListener('touchstart',()=>{},{passive:true});
function tick(){const d=new Date();$('#clock').textContent=`${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;}
tick();setInterval(tick,15000);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&LIVE.run)livePause();});

/* boot */
if(STANDALONE)document.documentElement.classList.add('standalone');
const qp=new URLSearchParams(location.search),SHOT=qp.get('shot');
if(SHOT){document.documentElement.classList.add('shot');NOSAVE=true;S=defState();S.onboarded=true;}
LANG=(qp.get('lang')==='en'||qp.get('lang')==='fr')?qp.get('lang'):(S.lang||'fr');
setLang(LANG);
if(SHOT){
 if(SHOT==='live'||SHOT==='lineup'){const upto=SHOT==='live'?71:59;LIVE.ph=2;LIVE.c=upto+.5;R.ev.forEach((e,i)=>{const at=evPhase(e)===1?evAt(e):evAt(e);if(evPhase(e)===1||(e.ht)||(e.m<=upto&&e.k!=='ft')){LIVE.fired.push(i);if(e.k==='goal')LIVE.sc[e.s==='h'?0:1]++;e._sc=`${LIVE.sc[0]}-${LIVE.sc[1]}`;}});}
 if(SHOT==='ticket'){S.tickets=[{no:'TK-4F7Q2A',zone:'ouest',seats:['C7','C8'],ts:Date.now(),pay:'wave'}];}
 const m={home:['home',[['home']]],live:['home',[['home'],['live',{tab:'feed'}]]],lineup:['home',[['home'],['live',{tab:'xi'}]]],ticket:['home',[['home'],['tickets'],['eticket',{no:'TK-4F7Q2A'}]]],coulisses:['coulisses',[['coulisses']]],player:['equipe',[['equipe'],['player',{id:qp.get('id')||'koulibaly'}]]],card:['moi',[['moi'],['card']]],shop:['home',[['home'],['shop'],['product',{id:'home',name:'SARR',no:'18',back:1}]]],matchs:['matchs',[['matchs']]]}[SHOT]||['home',[['home']]];
 setStack(m[0],m[1]);}
else{startFlow('splash');firstPill();maybeInstall();}
const vq=qp.get('v');if(vq&&!SHOT)setTimeout(()=>toast(L(`Code ${esc(vq)} : billet / carte de démonstration`,`Code ${esc(vq)}: demo ticket / card`),{icon:'qr',ms:5000}),3400);
