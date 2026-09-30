
/* ================= offline, language, side panel, init ================= */
function setOffline(v){OFF=!!v;app.classList.toggle('offline',OFF);$('#offtgl').setAttribute('aria-checked',OFF);$('#offtxt').textContent=L('Hors connexion — Ma Collection reste disponible','Offline — My Collection is still available');if(curEntry&&curEntry.name!=='ar'&&curEntry.name!=='camera')rerender();toast(OFF?L('Mode hors-ligne simulé','Simulated offline mode'):L('De retour en ligne','Back online'),{icon:OFF?'wifioff':'check'});}
const T={
 back:['Retour au CV','Back to CV'],
 bannerLong:['<b>Démo</b> · Yema Watch Club, prototype mobile interactif · projet étudiant non affilié à Yema, données et prix fictifs','<b>Demo</b> · Yema Watch Club, interactive mobile prototype · student project not affiliated with Yema, fictional data and prices'],
 bannerShort:['<b>Démo</b> · données fictives','<b>Demo</b> · fictional data'],
 pKicker:['Travail final · cours Mobile Apps · MBA ESG Paris · 2026','Final project · Mobile Apps course · MBA ESG Paris · 2026'],
 pTitle:['Yema Watch Club — prototype interactif','Yema Watch Club — interactive prototype'],
 pIntro:['Le showroom digital d’une maison horlogère : essai en réalité augmentée, configurateur, collection certifiée, club VIP. Les 20 écrans des maquettes, vivants et cliquables.','A watch house’s digital showroom: AR try-on, configurator, certified collection, VIP club. All 20 mock-up screens, live and clickable.'],
 pTeam:['El Mokhtar Berrada : Product Owner, UX/UI designer et chef de projet.','El Mokhtar Berrada: Product Owner, UX/UI designer and project manager.'],
 pGuided:['Parcours guidé · scénario d’Alexandre','Guided tour · Alexandre’s scenario'],
 pIndex:['Index des écrans','Screen index'],
 pOff:['Simuler le hors-ligne (#18)','Simulate offline (#18)'],
 pOffS:['Aussi : appui long sur l’heure de la barre d’état','Also: long-press the status-bar clock'],
 pNote:['Projet étudiant non affilié à Yema. Données et prix fictifs. Aucune donnée n’est envoyée : tout reste dans votre navigateur.','Student project not affiliated with Yema. Fictional data and prices. Nothing is sent anywhere: everything stays in your browser.'],
 pRestart:['Recommencer','Restart']
};
const STEPS=[[{fr:'Découverte',en:'Discovery'},{fr:'Push « Édition limitée Superman Heritage 1/500 — accès anticipé VIP »',en:'Push “Limited edition Superman Heritage 1/500 — VIP early access”'}],[{fr:'Exploration',en:'Exploration'},{fr:'Face ID, puis la notification ouvre la fiche produit',en:'Face ID, then the notification opens the product page'}],[{fr:'Essayage AR',en:'AR try-on'},{fr:'Permission caméra (ou mode démo), la montre au poignet',en:'Camera permission (or demo mode), the watch on the wrist'}],[{fr:'Personnalisation',en:'Customisation'},{fr:'Cadran Bleu marine + bracelet Cuir vintage',en:'Navy blue dial + vintage leather strap'}],[{fr:'Décision',en:'Decision'},{fr:'Configuration en souhaits, rendez-vous privé avec la conciergerie',en:'Configuration wishlisted, private appointment with the concierge'}],[{fr:'Engagement',en:'Engagement'},{fr:'Achat, puis enregistrement dans Ma Collection : authenticité vérifiée',en:'Purchase, then registration in My Collection: authenticity verified'}]];
const IDX=[['1','Splash'],['2','Welcome'],['3','Login'],['4','RGPD'],['5',{fr:'Préférences',en:'Prefs'}],['6',{fr:'Accueil',en:'Home'}],['7','Catalogue'],['8',{fr:'Fiche',en:'Product'}],['9','AR Try-On'],['10',{fr:'Caméra',en:'Camera'}],['11','Collection'],['12',{fr:'Détails',en:'Details'}],['13','Club VIP'],['14','Notifs'],['15',{fr:'Profil',en:'Profile'}],['16',{fr:'Sécurité',en:'Security'}],['17','RGPD+'],['18',{fr:'Hors-ligne',en:'Offline'}],['19',{fr:'États vides',en:'Empty'}],['20','AR Custom']];
const SCRNUM={splash:1,welcome:2,login:3,rgpd:4,prefs:5,home:6,catalog:7,pdp:8,ar:9,camera:10,collection:11,watch:12,club:13,notifs:14,profile:15,security:16,gdpr:17};
function renderSteps(){$('#steps').innerHTML=STEPS.map(([t,d],i)=>`<li class="${S.steps[i]?'done':''}"><button type="button" data-step="${i}"><span class="n"><em>${i+1}</em>${ic('check')}</span><span><b>${tx(t)}</b><small>${tx(d)}</small></span></button></li>`).join('');}
function renderPanel(){$$('[data-t]').forEach(n=>{const v=T[n.dataset.t];if(v)n.innerHTML=v[LANG==='en'?1:0];});$('#idx').innerHTML=IDX.map(([n,l])=>`<button type="button" data-jump="${n}">#${n}<small>${esc(tx(l))}</small></button>`).join('');$('#emp').innerHTML=[['wish',L('Souhaits vides','Empty wishlist')],['search',L('Sans résultat','No results')],['notif',L('Sans notif.','No notifs')]].map(([k,l])=>`<button type="button" data-empty="${k}">#19 · ${l}</button>`).join('');renderSteps();panelCur();}
function panelCur(){const n=curEntry?SCRNUM[curEntry.name]:0;$$('#idx button').forEach(b=>b.classList.toggle('cur',+b.dataset.jump===n));}
function setLang(l){LANG=l==='en'?'en':'fr';S.lang=LANG;save();document.documentElement.lang=LANG;$('#lngbtn').textContent=LANG==='fr'?'EN':'FR';$('#lngbtn').setAttribute('aria-label',LANG==='fr'?'Switch to English':'Passer en français');$('#backcv').href=LANG==='en'?'../en/#projets':'../#projets';$('#fab').setAttribute('aria-label',L('Informations sur le prototype','About this prototype'));$('#offtxt').textContent=L('Hors connexion — Ma Collection reste disponible','Offline — My Collection is still available');renderTabbar();renderPanel();if(curEntry&&curEntry.name!=='ar')rerender();}
function closePanelMobile(){const p=$('#panel');if(p.classList.contains('open')){p.classList.remove('open');$('#fab').setAttribute('aria-expanded','false');}}
function ensureHomeRoot(){return[['home']];}
function jump(n){closePanelMobile();n=+n;
 if(n<=5){const nm=['splash','welcome','login','rgpd','prefs'][n-1];startFlow(nm,n===5?{}:{});return;}
 const map={6:['home',[['home']]],7:['catalog',[['catalog']]],8:['catalog',[['catalog'],['pdp',{id:'rrp'}]]],9:['home',[['home'],['pdp',{id:'sh'}],['ar',{id:'sh',live:false}]]],10:['home',[['home'],['pdp',{id:'sh'}],['camera',{id:'sh',state:'denied',err:'NotAllowedError'}]]],11:['collection',[['collection']]],12:['collection',[['collection'],['watch',{oid:S.owned[0]?S.owned[0].oid:'o1'}]]],13:['club',[['club']]],14:['home',[['home'],['notifs']]],15:['profile',[['profile']]],16:['profile',[['profile'],['security']]],17:['profile',[['profile'],['gdpr']]],20:['home',[['home'],['pdp',{id:'sh'}],['ar',{id:'sh',live:false,custom:true}]]]};
 if(n===18){if(!OFF)setOffline(true);setStack('collection',[['collection']]);return;}
 if(n===19){setStack('collection',[['collection',{tab:'wish',emptyPreview:true}]]);return;}
 if(n===12&&!S.owned.length){S.owned=defState().owned;save();}
 const m=map[n];if(m)setStack(m[0],m[1]);}
function jumpEmpty(k){closePanelMobile();if(k==='wish')setStack('collection',[['collection',{tab:'wish',emptyPreview:true}]]);else if(k==='search'){S.cat.q='Tourbillon';save();setStack('catalog',[['catalog',{search:true,focused:true}]]);}else setStack('home',[['home'],['notifs',{emptyPreview:true}]]);}
function jumpStep(i){closePanelMobile();S.tour=true;save();
 if(i===0){setStack('home',[['home']]);S.pushed=false;setTimeout(()=>editionPush(),700);return;}
 if(i===1){setStack('home',[['home']]);bioLock().then(()=>{const n=S.notifs.find(x=>x.id==='n0');if(n)n.read=true;step(0);save();go('pdp',{id:'sh',from:'push'});});return;}
 if(i===2){setStack('home',[['home'],['pdp',{id:'sh'}]]);setTimeout(()=>startAR('sh'),500);return;}
 if(i===3){setStack('home',[['home'],['pdp',{id:'sh'}],['ar',{id:'sh',live:CAM.granted,custom:true}]]);return;}
 if(i===4){setStack('home',[['home'],['concierge',{auto:S.appt?null:'rdv'}]]);return;}
 if(i===5){if(S.purchase&&!S.purchase.registered){setStack('collection',[['collection']]);setTimeout(()=>openAddWatch({wid:S.purchase.wid,cfg:S.purchase.cfg,serial:S.purchase.serial,purchase:true}),450);}else setStack('home',[['home'],['concierge',{auto:'buy'}]]);return;}}

/* global events */
app.addEventListener('click',e=>{const t=e.target.closest('[data-act],[data-tab]');if(!t||!app.contains(t))return;if(t.dataset.tab){buzz();switchTab(t.dataset.tab);return;}const f=A[t.dataset.act];if(f){if(t.tagName==='BUTTON'&&t.type==='submit')return;e.preventDefault();f(t,e);}});
$('#panel').addEventListener('click',e=>{const s=e.target.closest('[data-step]'),j=e.target.closest('[data-jump]'),m=e.target.closest('[data-empty]');if(s)jumpStep(+s.dataset.step);else if(j)jump(j.dataset.jump);else if(m)jumpEmpty(m.dataset.empty);});
$('#offtgl').addEventListener('click',()=>setOffline(!OFF));
$('#restart').addEventListener('click',async()=>{closePanelMobile();stopCam();const lang=LANG;S=defState();S.lang=lang;save();OFF=false;app.classList.remove('offline');$('#offtgl').setAttribute('aria-checked','false');$$('.pushb,.bio',layer).forEach(n=>n.remove());renderPanel();startFlow('splash');});
$('#lngbtn').addEventListener('click',()=>setLang(LANG==='fr'?'en':'fr'));
$('#fab').addEventListener('click',()=>{const p=$('#panel');const o=!p.classList.contains('open');p.classList.toggle('open',o);$('#fab').setAttribute('aria-expanded',o);if(o)setTimeout(()=>$('#pclose').focus(),50);});
$('#pclose').addEventListener('click',()=>{closePanelMobile();$('#fab').focus();});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('#panel').classList.contains('open')){closePanelMobile();return;}if($('.dlgw',layer)||$('.bio',layer))return;if(sheets.length){closeSheet();return;}const s=stk();if(s.length>1&&document.activeElement&&(app.contains(document.activeElement)||document.activeElement===document.body))back();});
/* long-press on status clock -> offline */
(()=>{let t;const c=$('#clock');c.addEventListener('pointerdown',()=>{t=setTimeout(()=>setOffline(!OFF),700);});['pointerup','pointerleave','pointercancel'].forEach(ev=>c.addEventListener(ev,()=>clearTimeout(t)));})();
/* edge swipe back */
(()=>{let x0=null,y0=0,ok=false;view.addEventListener('pointerdown',e=>{const r=app.getBoundingClientRect();if(e.clientX-r.left<22&&stk().length>1&&!sheets.length&&curEntry&&curEntry.name!=='ar'){x0=e.clientX;y0=e.clientY;ok=true;}else ok=false;});view.addEventListener('pointerup',e=>{if(!ok||x0==null)return;if(e.clientX-x0>70&&Math.abs(e.clientY-y0)<60)back();x0=null;ok=false;});})();
/* live clock */
function tick(){const d=new Date();$('#clock').textContent=`${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;}
tick();setInterval(tick,15000);
/* re-check persisted refs */
if(!Array.isArray(S.steps)||S.steps.length!==6)S.steps=[0,0,0,0,0,0];
const qp=new URLSearchParams(location.search);const SHOT=qp.get('shot');
if(SHOT){document.documentElement.classList.add('shot');NOSAVE=true;S=defState();S.onboarded=true;S.pushed=true;S.consent={analytics:true,perso:true,marketing:false};}
LANG=(qp.get('lang')==='en'||qp.get('lang')==='fr')?qp.get('lang'):(S.lang||'fr');
setLang(LANG);
if(SHOT){const m={home:['home',[['home']]],pdp:['home',[['home'],['pdp',{id:'sh'}]]],ar:['home',[['home'],['pdp',{id:'sh'}],['ar',{id:'sh',live:false}]]],club:['club',[['club']]],collection:['collection',[['collection'],['watch',{oid:'o1'}]]]}[SHOT]||['home',[['home']]];setStack(m[0],m[1]);}
else startFlow('splash');
const cq=qp.get('c');if(cq&&!SHOT)setTimeout(()=>toast(L(`Certificat ${esc(cq)} · authenticité vérifiée (démo)`,`Certificate ${esc(cq)} · authenticity verified (demo)`),{icon:'shield',ms:5200}),2600);
window.addEventListener('pagehide',stopCam);
})();
</script>
</body>
</html>
