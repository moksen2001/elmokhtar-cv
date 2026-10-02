/* ================= splash, welcome, home ================= */
SCR.splash={raw:1,tabs:false,title:()=>'Gaïndé',render:()=>`<div class="splash" data-act="skipSplash"><div class="sp-rays" aria-hidden="true"></div><div class="sp-mark">${lionSVG()}</div><h1 class="sp-wm">${wordmark('big')}</h1><span class="sp-tri"><i></i><i></i><i></i></span><p class="sp-tag">${L('Le compagnon de match des supporters du Sénégal','The matchday companion of every Senegal fan')}</p><small class="sp-foot">${L('Concept d’application imaginé par El Mokhtar Berrada · non officiel · non affilié à la FSF','App concept imagined by El Mokhtar Berrada · unofficial · not affiliated with the FSF')}</small></div>`,
 mount:(el)=>{clearTimeout(SCR.splash._t);SCR.splash._t=setTimeout(()=>{if(top()&&top().name==='splash')leaveSplash();},RM?600:2900);}};
function leaveSplash(){clearTimeout(SCR.splash._t);if(S.onboarded)enterTabs('home');else replace('welcome');}
A.skipSplash=()=>leaveSplash();

SCR.welcome={raw:1,tabs:false,title:()=>L('Bienvenue','Welcome'),render:()=>`<div class="wel">
 <div class="wel-bg">${pic('fans-1',{big:1,eager:1,alt:''})}</div>
 <div class="wel-c">
  <span class="kick">Dalal ak jàmm</span>
  <h1 class="h1">${L('Bienvenue dans la Tanière','Welcome to the Den')}</h1>
  <p class="p">${L('Matchs en direct, coulisses, billets et maillots : tout ce qui fait vibrer un supporter des Lions, au pays comme dans la diaspora.','Live matches, behind the scenes, tickets and jerseys: everything a Lions fan lives for, at home or abroad.')}</p>
  <div class="lbl" style="margin:18px 0 8px">${L('Je suis','I follow')}</div>
  <div class="chips wel-teams" style="padding:0;flex-wrap:wrap">${TEAMS.map(t=>`<button class="chip" type="button" data-act="wTeam" data-k="${t.k}" aria-pressed="${S.follow.includes(t.k)}">${tx(t.n)}</button>`).join('')}</div>
  <div class="lbl" style="margin:16px 0 8px">${L('Je supporte depuis','I support from')}</div>
  <div class="seg" role="tablist" style="margin:0"><button type="button" role="tab" data-act="wHome" data-v="sn" aria-selected="${S.home==='sn'}">${L('Le Sénégal','Senegal')}</button><button type="button" role="tab" data-act="wHome" data-v="diaspora" aria-selected="${S.home==='diaspora'}">${L('La diaspora','The diaspora')}</button></div>
  <button class="btn y block" type="button" data-act="enter" style="margin-top:20px">${L('Entrer dans la Tanière','Enter the Den')}${ic('arrow')}</button>
  <p class="small" style="text-align:center;margin-top:12px">${L('Concept non officiel · non affilié à la FSF','Unofficial concept · not affiliated with the FSF')}</p>
 </div></div>`};
A.wTeam=t=>{const k=t.dataset.k;const i=S.follow.indexOf(k);if(i>=0)S.follow.splice(i,1);else S.follow.push(k);save();t.setAttribute('aria-pressed',i<0);buzz(4);};
A.wHome=t=>{S.home=t.dataset.v;save();$$('[data-act="wHome"]',t.parentNode).forEach(b=>b.setAttribute('aria-selected',b===t));pills(top().el,top());buzz(4);};
A.enter=()=>{S.onboarded=true;save();enterTabs('home');buzz([6,30,6]);};

/* ---------- home ---------- */
SCR.home={hero:1,brand:1,title:()=>L('Accueil','Home'),ptr:()=>{toast(L('À jour · données du 2 octobre 2026','Up to date · data as of 2 October 2026'),{icon:'rotate'});},
 right:()=>`${bagBtn()}<button class="nbb" type="button" data-act="openCard" aria-label="${L('Ma carte supporter','My supporter card')}">${ic('qr')}</button>`,
 render:()=>{const f=nextLions();return `
 ${f?heroNext(f):''}
 ${tickerHTML()}
 <section class="sec st"><button class="live-cta" type="button" data-act="replay">
  <span class="lc-bg">${pic('a-sarr',{alt:''})}</span><span class="lc-in"><span class="lc-tag"><i></i>${L('Mode direct','Live mode')}</span><b class="disp">${L('Revivez','Relive')} <span style="white-space:nowrap">${nat('SEN')} 5-0 ${nat('IRQ')}</span></b><small>${L('Mondial 2026 · minute par minute, buts, cartons, compos et stats FIFA réels','2026 World Cup · minute by minute, real FIFA goals, cards, line-ups and stats')}</small></span><span class="lc-play">${ic('play')}</span></button></section>
 <section class="sec st"><div class="qa">
  <button type="button" data-act="tickets" class="qa-b"><span class="qa-i">${ic('ticket')}</span><b>${L('Billets','Tickets')}</b></button>
  <button type="button" data-act="shop" class="qa-b"><span class="qa-i">${ic('jersey')}</span><b>${L('Boutique','Shop')}</b></button>
  <button type="button" data-act="pronos" class="qa-b"><span class="qa-i">${ic('target')}</span><b>Pronos</b></button>
  <button type="button" data-act="openCard" class="qa-b"><span class="qa-i">${ic('card')}</span><b>${L('Ma carte','My card')}</b></button></div></section>
 <section class="sec st"><div class="sec-h"><h2 class="h2">${L('Coulisses','Inside the Den')}</h2><button class="more" type="button" data-act="tab" data-tab2="coulisses">${L('Tout voir','See all')}${ic('chev')}</button></div>${storyRail()}</section>
 <section class="sec st">${motmTeaser()}</section>
 <section class="sec st"><div class="sec-h"><h2 class="h2">FSF TV</h2><button class="more" type="button" data-act="videos">${L('Vidéos','Videos')}${ic('chev')}</button></div><div class="hscroll">${VIDEOS.slice(0,5).map(v=>videoCard(v)).join('')}</div></section>
 <section class="sec st"><div class="sec-h"><h2 class="h2">${L('Derniers résultats','Latest results')}</h2><button class="more" type="button" data-act="tab" data-tab2="matchs" data-seg="res">${L('Tout','All')}${ic('chev')}</button></div><div class="wrap col8">${RES.slice(0,2).map(resCard).join('')}</div>${standMini()}</section>
 <section class="sec st"><div class="sec-h"><h2 class="h2">${L('Toutes les sélections','All national teams')}</h2><button class="more" type="button" data-act="tab" data-tab2="matchs">${L('Calendrier','Fixtures')}${ic('chev')}</button></div><div class="hscroll">${upcoming().filter(x=>x.t!=='A').slice(0,6).map(miniFix).join('')}</div></section>
 <section class="sec st"><div class="sec-h"><h2 class="h2">${L('Actus','News')}</h2></div><div class="news wrap">${NEWS.map(n=>`<a class="nw" href="${esc(n.u)}" target="_blank" rel="noopener noreferrer">${pic(n.ph,{cls:'nw-ph',alt:''})}<span class="nw-t"><span class="lbl">${esc(n.s)} · ${fdate(n.d,{day:'numeric',month:'short'})}</span><b>${esc(tx(n.t))}</b></span>${ic('ext')}</a>`).join('')}</div></section>
 <section class="sec st">${fanzoneCard()}</section>
 <section class="sec st"><div class="sec-h"><h2 class="h2">${L('Canaux officiels','Official channels')}</h2><button class="more" type="button" data-act="social">${L('Tous','All')}${ic('chev')}</button></div><div class="hscroll">${SOCIAL.slice(1,7).map(s=>socTile(s)).join('')}</div></section>
 <p class="foot-note">${lionSVG()}<span>${L('Gaïndé est un concept d’application imaginé par El Mokhtar Berrada. Non officiel, non affilié à la FSF. Données réelles sourcées au 2 octobre 2026 ; billetterie, boutique et paiements sont des démonstrations.','Gaïndé is an app concept imagined by El Mokhtar Berrada. Unofficial, not affiliated with the FSF. Real data sourced as of 2 October 2026; ticketing, shop and payments are demos.')}</span></p>`;},
 mount:(el)=>{el._th=300;const f=nextLions();if(f)mountCountdown(el,Date.parse(f.ko));}};

function heroNext(f){const al=!!S.alerts[f.id];return `<div class="hn">
 <div class="hn-bg" data-par>${pic('team',{big:1,eager:1,fp:1,alt:L('Les Lions alignés pour l’hymne, Mondial 2026','The Lions lined up for the anthem, 2026 World Cup')})}</div>
 <div class="hn-in" data-fade>
  <span class="kick hn-k">${L('Prochain match · Lions','Next match · Lions')}</span>
  <div class="hn-teams"><span class="hn-t">${flag(f.h,46)}<b class="disp">${esc(nat(f.h))}</b></span><span class="hn-vs disp">VS</span><span class="hn-t r">${flag(f.a,46)}<b class="disp">${esc(nat(f.a))}</b></span></div>
  <div class="hn-meta"><span>${ic('cal')}${esc(whenTxt(f))}</span><span>${ic('stadium')}${esc(vTxt(f))}</span></div>
  ${cdHTML()}
  <div class="hn-act"><button class="btn y sm" type="button" data-act="pronos">${ic('target')}${L('Pronostiquer','Predict')}</button>${f.tk?`<a class="btn dark sm" href="${esc(f.tk)}" target="_blank" rel="noopener noreferrer">${ic('ticket')}${L('Billets','Tickets')}${ic('ext')}</a>`:''}<button class="ib bellb hn-bell" type="button" data-act="alert" data-id="${f.id}" aria-pressed="${al}" aria-label="${L('Alerte match','Match alert')}">${ic(al?'bellon':'bell')}</button></div>
 </div></div>`;}
function tickerHTML(){const it=[];RES.slice(0,4).forEach(r=>it.push(`<span class="it">${esc(tx(r.comp).split(' · ')[0])} <b>${r.h}</b> <span class="sc2">${r.hs}-${r.as}</span> <b>${r.a}</b></span>`));
 it.push(`<span class="it">${L('Groupe J','Group J')} · <b>MOZ 4 pts</b> · <b>SEN 4 pts</b> · SUD 3 · ETH 0</span>`);
 upcoming().slice(0,5).forEach(f=>it.push(`<span class="it">${esc(tx(TEAM(f.t).n))} · <b>${esc(nat(f.h))}</b>${f.a?` – <b>${esc(nat(f.a))}</b>`:''} · ${esc(whenTxt(f,true))}</span>`));
 const h=it.join('');return `<div class="ticker" aria-label="${L('Fil infos','News ticker')}"><span class="tag"><i></i>${L('Fil','Feed')}</span><div class="rail">${h}${h}</div></div>`;}
function miniFix(f){return `<div class="mf st">${flag(f.h,26)}${f.a?flag(f.a,26):''}<span class="mf-t"><span class="tchip t-${f.t}">${tx(TEAM(f.t).n)}</span><b>${esc(nat(f.h))}${f.a?' – '+esc(nat(f.a)):''}</b><small>${esc(whenTxt(f,true))}</small></span></div>`;}
function standMini(){return `<div class="stand wrap"><div class="stand-h"><span class="lbl">${L('Qualif. CAN 2027 · Groupe J','2027 AFCON qualifiers · Group J')}</span><span class="lbl">${L('Pts','Pts')}</span></div>${STAND.map((s,i)=>`<div class="stand-r ${s.c==='SEN'?'me':''}"><span class="pos">${i+1}</span>${flag(s.c,20)}<b>${esc(nat(s.c))}</b><span class="gd">${s.gf-s.ga>0?'+':''}${s.gf-s.ga}</span><span class="pts disp">${s.pts}</span></div>`).join('')}</div>`;}
function socTile(s){return `<a class="soc st" href="${esc(s.u)}" target="_blank" rel="noopener noreferrer" data-soc="${s.k}"><span class="soc-i">${ic(s.g)}</span><b>${esc(s.n)}</b><small>${esc(tx(s.d))}</small>${s.f?`<em>${s.f} ${L('abonnés','followers')}</em>`:''}</a>`;}
function fanzoneCard(){const f=nextLions();return `<button class="fz" type="button" data-act="fanzones"><span class="fz-map" aria-hidden="true">${worldDots()}</span><span class="fz-t"><span class="kick">${L('Vivre le match','Watch together')}</span><b class="h3">${L('Où vibrer pour','Where to cheer for')} ${f?esc(nat(f.h))+' – '+esc(nat(f.a)):L('les Lions','the Lions')} ?</b><small>${L('Au pays et dans la diaspora · démo','At home and abroad · demo')}</small></span>${ic('chev')}</button>`;}
function worldDots(){const pts=[[47,62,'Dakar'],[51,40,'Paris'],[52,45,'Marseille'],[54,42,'Milan'],[49,46,'Madrid'],[28,43,'New York'],[29,37,'Montréal']];return `<svg viewBox="0 0 100 70"><path d="M8 30c6-10 18-14 26-12 6 2 6 8 2 12-4 4-2 10 4 12 4 2 2 8-2 10-6 2-10-2-14-6-4-4-12-2-16-8zM44 26c4-8 14-12 22-10 10 2 22 0 28 6 4 4 0 10-6 10-6 0-8 6-4 10 4 6-2 12-10 12-8 0-10 6-14 10-4 4-10 2-12-4-2-6-6-8-4-14 2-6-6-8-4-14 0-2 2-4 4-6z" fill="rgba(29,184,106,.12)"/>${pts.map(([x,y,n],i)=>`<g class="fz-p" style="--d:${i*.25}s"><circle cx="${x}" cy="${y}" r="4" fill="#FDEF42" opacity=".25"/><circle cx="${x}" cy="${y}" r="1.6" fill="${n==='Dakar'?'#1DB86A':'#FDEF42'}"/></g>`).join('')}</svg>`;}
A.tab=t=>{const tb=t.dataset.tab2;switchTab(tb);if(t.dataset.seg){setTimeout(()=>{const e=top();if(e&&e.name==='matchs'){e.params.seg=t.dataset.seg;build(e);}},10);}};
A.alert=t=>{const id=t.dataset.id;S.alerts[id]=!S.alerts[id];save();const on=S.alerts[id];$$(`[data-act="alert"][data-id="${id}"]`,app).forEach(b=>{b.setAttribute('aria-pressed',on);b.innerHTML=ic(on?'bellon':'bell');});
 if(!RM)t.animate([{transform:'rotate(0)'},{transform:'rotate(-18deg)'},{transform:'rotate(14deg)'},{transform:'rotate(-8deg)'},{transform:'none'}],{duration:520});buzz(on?[8,30,8]:6);
 const f=FIX.find(x=>x.id===id);toast(on?L(`Alertes activées · ${f?nat(f.h)+(f.a?' – '+nat(f.a):''):''} (compos, coup d’envoi, buts)`,`Alerts on · ${f?nat(f.h)+(f.a?' – '+nat(f.a):''):''} (line-ups, kick-off, goals)`):L('Alertes désactivées','Alerts off'),{icon:on?'bellon':'belloff'});};
A.fanzones=()=>{const f=nextLions();openSheet({label:L('Où vibrer','Where to watch'),html:sheetHTML(L('Où vibrer ?','Where to watch?'),`<p class="p" style="margin-bottom:12px">${f?`${esc(nat(f.h))} – ${esc(nat(f.a))} · ${esc(whenTxt(f))}`:''}</p><div class="opts stg">${ZONESFAN.map(z=>`<div class="fzr">${ic('pin')}<span><b>${esc(z.c)}</b><small>${esc(tx(z.k))}</small></span><button class="btn ghost sm" type="button" data-act="fzGo" data-c="${esc(z.c)}"><span class="n tn">${nfmt(z.n+(S['fz_'+z.c]?1:0))}</span>${L('J’y serai','I’ll be there')}</button></div>`).join('')}</div><div class="note" style="margin:14px 0 0">${ic('info')}<span>${L('Démonstration : lieux communautaires et compteurs fictifs. Seul le lieu du match (CEPAC Vélodrome) est réel.','Demo: community venues and counters are fictitious. Only the match venue (CEPAC Vélodrome) is real.')}</span></div>`)});};
A.fzGo=t=>{const c=t.dataset.c;S['fz_'+c]=1;save();const n=t.querySelector('.n');n.textContent=nfmt(+n.textContent.replace(/\D/g,'')+1);t.disabled=true;t.classList.add('on');buzz([6,20,6]);toast(L(`C’est noté : rendez-vous à ${c} !`,`Noted: see you in ${c}!`),{icon:'pin'});};
