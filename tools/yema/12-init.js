
/* ================= side panel, language, init ================= */
const T={back:['Retour au CV','Back to CV'],banner:['<b>Démo</b> · Yema Watch Club, prototype d’application · photos produits © YEMA, projet étudiant non affilié, paiement simulé','<b>Demo</b> · Yema Watch Club, app prototype · product photos © YEMA, student project not affiliated, simulated payment'],
 pKicker:['Travail final · Mobile Apps · MBA ESG Paris · 2026','Final project · Mobile Apps · MBA ESG Paris · 2026'],pTitle:['Yema Watch Club — prototype interactif','Yema Watch Club — interactive prototype'],
 pIntro:['Vrais modèles YEMA, achat simulé de bout en bout, essai en réalité augmentée, collection certifiée et club VIP. El Mokhtar Berrada : Product Owner, UX/UI, chef de projet.','Real YEMA models, end-to-end simulated purchase, AR try-on, certified collection and VIP club. El Mokhtar Berrada: Product Owner, UX/UI, project manager.'],
 pGuided:['Parcours guidé · scénario d’Alexandre','Guided tour · Alexandre’s scenario'],pIndex:['Index des écrans','Screen index'],
 pNote:['Photos produits © YEMA, utilisées à titre illustratif. Projet étudiant non affilié à YEMA, paiement simulé.','Product photos © YEMA, used for illustration. Student project not affiliated with YEMA, simulated payment.'],pRestart:['Recommencer','Restart']};
const STEPS=[[{fr:'Découverte',en:'Discovery'},{fr:'Push : Navygraf Meteorite, 150 exemplaires',en:'Push: Navygraf Meteorite, 150 pieces'}],[{fr:'Exploration',en:'Exploration'},{fr:'Face ID, puis la fiche produit',en:'Face ID, then the product page'}],[{fr:'Essai RA',en:'AR try-on'},{fr:'Caméra (ou mode démo), la montre au poignet',en:'Camera (or demo mode), the watch on the wrist'}],[{fr:'Personnalisation',en:'Customisation'},{fr:'Choisir le bracelet, la photo change',en:'Pick the strap, the photo changes'}],[{fr:'Décision',en:'Decision'},{fr:'Rendez-vous privé avec la conciergerie',en:'Private appointment with the concierge'}],[{fr:'Achat & collection',en:'Purchase & collection'},{fr:'Panier, paiement simulé, livraison, authenticité vérifiée',en:'Bag, simulated payment, delivery, authenticity verified'}]];
const IDX=[['1','Splash'],['2','Welcome'],['3','Login'],['4','RGPD'],['5',{fr:'Préférences',en:'Prefs'}],['6',{fr:'Accueil',en:'Home'}],['7','Catalogue'],['8',{fr:'Fiche',en:'Product'}],['9',{fr:'Essai RA',en:'AR'}],['10',{fr:'Caméra',en:'Camera'}],['11','Collection'],['12',{fr:'Détails',en:'Details'}],['13','Club VIP'],['14','Notifs'],['15',{fr:'Profil',en:'Profile'}],['16',{fr:'Sécurité',en:'Security'}],['17','RGPD+'],['18',{fr:'Hors-ligne',en:'Offline'}],['19',{fr:'État vide',en:'Empty'}],['20',{fr:'Bracelet RA',en:'AR strap'}],['cart',{fr:'Panier',en:'Bag'}],['pay',{fr:'Paiement',en:'Payment'}],['track',{fr:'Suivi',en:'Tracking'}],['chat',{fr:'Conciergerie',en:'Concierge'}]];
const SCRNUM={splash:'1',welcome:'2',login:'3',rgpd:'4',prefs:'5',home:'6',catalog:'7',pdp:'8',ar:'9',camera:'10',collection:'11',watch:'12',club:'13',notifs:'14',profile:'15',security:'16',gdpr:'17',checkout:'pay',order:'track',concierge:'chat'};
function renderSteps(){$('#steps').innerHTML=STEPS.map(([t,d],i)=>`<li class="${S.steps[i]?'done':''}"><button type="button" data-step="${i}"><span class="n"><em>${i+1}</em>${ic('check')}</span><span><b>${tx(t)}</b><small>${tx(d)}</small></span></button></li>`).join('');}
function renderPanel(){$$('[data-t]').forEach(n=>{const v=T[n.dataset.t];if(v)n.innerHTML=v[LANG==='en'?1:0];});$('#idx').innerHTML=IDX.map(([n,l])=>`<button type="button" data-jump="${n}">${/^\d/.test(n)?'#'+n:ic({cart:'bag',pay:'card',track:'box',chat:'chat'}[n],'').replace('class="ic "','class="ic" style="width:14px;height:14px;margin:0 auto"')}<small>${esc(tx(l))}</small></button>`).join('');renderSteps();panelCur();}
function panelCur(){const e=top();const n=e?SCRNUM[e.name]:'';$$('#idx button').forEach(b=>b.classList.toggle('cur',b.dataset.jump===n));}
function setLang(l){LANG=l==='en'?'en':'fr';S.lang=LANG;if(!NOSAVE)lsSet(KEY,JSON.stringify(S));document.documentElement.lang=LANG;$('#lngbtn').textContent=LANG==='fr'?'EN':'FR';$('#lngbtn').setAttribute('aria-label',LANG==='fr'?'Switch to English':'Passer en français');$('#backcv').href=LANG==='en'?'../en/#projets':'../#projets';renderTabbar();renderPanel();if(OFF)setOffline(true);const e=top();if(e&&e.name!=='ar')build(e);const pl=$('.pill1');if(pl)pillHTML(pl);}
function closePanel(){$('#panel').classList.remove('open');}
function demoOrder(status){if(!S.orders.length){const w=W('nme');S.orders.unshift({no:'YW-26-4821',items:[{wid:'nme',o:defO(w),qty:1,price:w.p}],total:w.p,ship:'home',addr:`${addr().l}, ${addr().c}`,pay:'apple',status:status||2,ts:[Date.now()-2*D,Date.now()-D,Date.now()-3*H].slice(0,(status||2)+1),reg:[],done:false});save();}return S.orders[0];}
function jump(n){closePanel();
 if(['1','2','3','4','5'].includes(n)){startFlow(['splash','welcome','login','rgpd','prefs'][+n-1],{});return;}
 if(OFF&&n!=='18')setOffline(false);
 const oid=(S.owned[0]||{}).oid;
 const M={'6':['home',[['home']]],'7':['catalog',[['catalog']]],'8':['catalog',[['catalog'],['pdp',{id:'nme'}]]],'9':['home',[['home'],['pdp',{id:'nme'}],['ar',{id:'nme',live:false}]]],'10':['home',[['home'],['pdp',{id:'nme'}],['camera',{id:'nme',state:'denied',err:'NotAllowedError'}]]],'11':['collection',[['collection']]],'12':['collection',[['collection'],['watch',{oid}]]],'13':['club',[['club']]],'14':['home',[['home'],['notifs']]],'15':['profile',[['profile']]],'16':['profile',[['profile'],['security']]],'17':['profile',[['profile'],['gdpr']]],'19':['collection',[['collection',{tab:'wish',empty:1}]]],'20':['home',[['home'],['pdp',{id:'nhe'}],['ar',{id:'nhe',live:false,var:1}]]],'chat':['club',[['club'],['concierge']]]};
 if(n==='12'&&!oid){S.owned=defState().owned;save();M['12'][1][1][1].oid='o1';}
 if(n==='18'){setStack('collection',[['collection']]);setOffline(true);return;}
 if(n==='cart'){if(!S.cart.length)addToCart('nme',null,true);setStack('catalog',[['catalog'],['pdp',{id:'nme'}]]);setTimeout(openCart,120);return;}
 if(n==='pay'){if(!S.cart.length)addToCart('nme',null,true);setStack('catalog',[['catalog'],['pdp',{id:'nme'}],['checkout',{step:2,ship:'home',pay:null}]]);return;}
 if(n==='track'){const o=demoOrder(2);setStack('profile',[['profile'],['orders'],['order',{no:o.no}]]);return;}
 const m=M[n];if(m)setStack(m[0],m[1]);}
function jumpStep(i){closePanel();if(OFF)setOffline(false);
 if(i===0){setStack('home',[['home']]);S.pushed=false;save();setTimeout(meteoritePush,700);return;}
 if(i===1){setStack('home',[['home']]);bioLock(L('Ouverture sécurisée','Secure opening')).then(()=>{step(0);go('pdp',{id:'nme',from:'push'});});return;}
 if(i===2){setStack('home',[['home'],['pdp',{id:'nme'}]]);setTimeout(()=>startAR('nme'),150);return;}
 if(i===3){setStack('home',[['home'],['pdp',{id:'nhe'}],['ar',{id:'nhe',live:false,var:1}]]);return;}
 if(i===4){setStack('home',[['home'],['pdp',{id:'nme'}],['concierge']]);setTimeout(()=>{if(top().name==='concierge'&&!S.appt){say(L('Rendez-vous privé','Private appointment'));route('rdv');}},S.chat.length?400:2000);return;}
 if(i===5){const o=S.orders.find(x=>!x.done);if(o){setStack('profile',[['profile'],['orders'],['order',{no:o.no}]]);return;}if(!S.cart.length)addToCart('nme',null,true);setStack('home',[['home'],['pdp',{id:'nme'}]]);setTimeout(openCart,120);}}
function restart(){closePanel();stopCam();const lg=LANG;S=defState();S.lang=lg;save();if(OFF)setOffline(false);$$('.pushb,.bio,.story',layer).forEach(n=>n.remove());renderPanel();startFlow('splash');}
/* first launch pill on phones: back to the CV + language, then it fades */
function pillHTML(p){p.innerHTML=`<a href="${LANG==='en'?'../en/#projets':'../#projets'}">← ${L('CV','CV')}</a><button type="button" data-pill="lang">${LANG==='fr'?'EN':'FR'}</button>`;}
function firstPill(){if(!IS_PHONE()||STANDALONE||NOSAVE)return;const p=document.createElement('div');p.className='pill1';pillHTML(p);app.appendChild(p);p.addEventListener('click',e=>{if(e.target.closest('[data-pill]')){setLang(LANG==='fr'?'en':'fr');clearTimeout(t);t=setTimeout(hide,4000);}});const hide=()=>{p.classList.add('gone');setTimeout(()=>p.remove(),600);};let t=setTimeout(hide,5000);}

/* events */
app.addEventListener('click',e=>{const t=e.target.closest('[data-act],[data-tab]');if(!t||!app.contains(t))return;if(t.dataset.tab){buzz(4);switchTab(t.dataset.tab);return;}const f=A[t.dataset.act];if(f){if(t.tagName==='BUTTON'&&t.type==='submit')return;if(t.tagName==='A'&&t.getAttribute('href'))return;e.preventDefault();f(t,e);}});
$('#panel').addEventListener('click',e=>{const s=e.target.closest('[data-step]'),j=e.target.closest('[data-jump]');if(s)jumpStep(+s.dataset.step);else if(j)jump(j.dataset.jump);});
$('#restart').addEventListener('click',restart);
$('#lngbtn').addEventListener('click',()=>setLang(LANG==='fr'?'en':'fr'));
$('#pclose').addEventListener('click',closePanel);
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('#panel').classList.contains('open')){closePanel();return;}if($('.dlgw,.bio,.story',layer))return;if(sheets.length){closeSheet();return;}const ae=document.activeElement;if(ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName))return;if(stk().length>1)back();});
document.addEventListener('touchstart',()=>{},{passive:true});
function tick(){const d=new Date();$('#clock').textContent=`${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;}
tick();setInterval(tick,15000);
window.addEventListener('pagehide',stopCam);

/* boot */
if(STANDALONE)document.documentElement.classList.add('standalone');
const qp=new URLSearchParams(location.search),SHOT=qp.get('shot');
if(SHOT){document.documentElement.classList.add('shot');NOSAVE=true;S=defState();S.onboarded=true;S.pushed=true;S.consent={analytics:true,perso:true,marketing:false};S.seenSt=[];}
if(!Array.isArray(S.steps)||S.steps.length!==6)S.steps=[0,0,0,0,0,0];
LANG=(qp.get('lang')==='en'||qp.get('lang')==='fr')?qp.get('lang'):(S.lang||'fr');
setLang(LANG);
if(SHOT){const m={home:['home',[['home']]],pdp:['catalog',[['catalog'],['pdp',{id:qp.get('id')||'nme'}]]],ar:['home',[['home'],['pdp',{id:qp.get('id')||'nme'}],['ar',{id:qp.get('id')||'nme',live:false}]]],club:['club',[['club']]],collection:['collection',[['collection']]],watch:['collection',[['collection'],['watch',{oid:'o1'}]]]}[SHOT]||['home',[['home']]];setStack(m[0],m[1]);}
else{startFlow('splash');firstPill();maybeInstall();}
const cq=qp.get('c');if(cq&&!SHOT)setTimeout(()=>toast(L(`Certificat ${esc(cq)} : authenticité vérifiée (démo)`,`Certificate ${esc(cq)}: authenticity verified (demo)`),{icon:'shield',ms:5200}),1600);
})();
</script>
</body>
</html>
