/* ================= Matchs tab: fixtures, results, standings, result detail ================= */
SCR.matchs={large:1,title:()=>L('Matchs','Matches'),right:()=>`<button class="nbb" type="button" data-act="replay" aria-label="${L('Mode direct','Live mode')}">${ic('play')}</button>`,
 render:(p)=>{const seg=p.seg||'cal',tf=p.tf||'all';
 const segs=[['cal',L('Calendrier','Fixtures')],['res',L('Résultats','Results')],['tab',L('Classement','Table')]];
 let body='';
 if(seg==='cal'){const list=upcoming(tf);body=list.length?`<div class="wrap col8 stg">${list.map(fixCard).join('')}</div>`:`<div class="empty">${ic('cal')}<p>${L('Aucun match annoncé pour cette sélection.','No match announced for this team.')}</p></div>`;
  body+=`<div class="note">${ic('info')}<span>${L('Calendrier officiel annoncé par la FSF au 30 septembre 2026. Activez la cloche pour recevoir compos, coup d’envoi et buts.','Official schedule announced by the FSF as of 30 September 2026. Tap the bell for line-ups, kick-off and goals.')} ${ext('https://fsfoot.sn/actualites/listes-selections/','fsfoot.sn')}</span></div>`;}
 else if(seg==='res'){const list=RES.filter(r=>tf==='all'||r.t===tf);
  body=list.length?`<div class="wrap col8 stg">${list.map(resCard).join('')}</div>`:'';
  if(tf==='all'||tf==='U17')body+=`<div class="sec-h" style="margin-top:22px"><h3 class="h3">${L('U-17 · Tournoi UFOA-A 2026','U-17 · WAFU-A 2026 tournament')}</h3></div><div class="wrap col8">${RES_U17.map(r=>`<div class="u17r">${flag(r.h,20)}<b>${esc(nat(r.h)||r.h)}</b><span class="disp tn">${r.hs}–${r.as}</span><b class="r">${esc(nat(r.a)||r.a)}</b>${flag(r.a,20)}</div>`).join('')}<p class="small">${L('Résultats annoncés par FSF TV (septembre 2026).','Results announced by FSF TV (September 2026).')}</p></div>`;
  if(!body)body=`<div class="empty">${ic('trophy')}<p>${L('Pas de résultat récent publié pour cette sélection.','No recent result published for this team.')}</p></div>`;}
 else body=`<div class="wrap"><div class="card pad"><div class="lbl" style="margin-bottom:8px">${L('Qualifications CAN 2027 (Pamoja) · Groupe J · après 2 journées','2027 AFCON (Pamoja) qualifiers · Group J · after 2 matchdays')}</div>
  <div class="tbl"><div class="tr th"><span>#</span><span></span><span>${L('Équipe','Team')}</span><span>J</span><span>G</span><span>N</span><span>P</span><span>+/-</span><span>Pts</span></div>${STAND.map((s,i)=>`<div class="tr ${s.c==='SEN'?'me':''}"><span>${i+1}</span>${flag(s.c,20)}<b>${esc(nat(s.c))}</b><span>${s.p}</span><span>${s.w}</span><span>${s.d}</span><span>${s.l}</span><span>${s.gf-s.ga>0?'+':''}${s.gf-s.ga}</span><b class="disp">${s.pts}</b></div>`).join('')}</div>
  <p class="small" style="margin-top:10px">${L('J1 : Mozambique 1-1 Sénégal, Soudan 1-0 Éthiopie · J2 : Éthiopie 0-1 Sénégal, Mozambique 4-1 Soudan. Prochaine fenêtre : Soudan (aller-retour) en novembre.','MD1: Mozambique 1-1 Senegal, Sudan 1-0 Ethiopia · MD2: Ethiopia 0-1 Senegal, Mozambique 4-1 Sudan. Next window: Sudan (two legs) in November.')} ${ext('https://fsfoot.sn/actualites/les-lions-ont-rejoint-marseille-apres-leur-double-deplacement-au-mozambique-et-en-ethiopie/','FSF')}</p></div></div>`;
 return `<p class="lt-s">${L('Lions, Lionnes et sélections de jeunes','Lions, Lionesses and youth teams')}</p>
 <div class="seg" role="tablist" style="margin-top:14px">${segs.map(([k,l])=>`<button type="button" role="tab" data-act="mSeg" data-v="${k}" aria-selected="${seg===k}">${l}</button>`).join('')}</div>
 ${seg!=='tab'?`<div class="chips" style="margin-top:12px">${[['all',L('Toutes','All')]].concat(TEAMS.map(t=>[t.k,tx(t.n)])).map(([k,l])=>`<button class="chip" type="button" data-act="mTeam" data-v="${k}" aria-pressed="${tf===k}">${l}</button>`).join('')}</div>`:''}
 <div style="margin-top:14px">${body}</div>`;}};
A.mSeg=t=>{const e=top();e.params.seg=t.dataset.v;e.scroll=0;build(e);buzz(4);};
A.mTeam=t=>{const e=top();e.params.tf=t.dataset.v;build(e);buzz(4);};
A.result=t=>{const r=RES.find(x=>x.id===t.dataset.id);if(!r)return;if(r.replay){go('live');return;}
 openSheet({label:tx(r.comp),html:sheetHTML(esc(tx(r.comp)),`<div class="rsd"><div class="rsd-s"><span>${flag(r.h,44)}<b>${esc(nat(r.h))}</b></span><span class="disp tn">${r.hs} – ${r.as}</span><span>${flag(r.a,44)}<b>${esc(nat(r.a))}</b></span></div>${r.aet?`<p class="small" style="text-align:center">${L('Après prolongation','After extra time')}</p>`:''}
 <div class="rsd-g">${r.g.map(([s,n,m])=>`<div class="${s}">${ic('ball')}<b>${esc(n)}</b><span>${esc(m)}</span></div>`).join('')}</div>
 <div class="kv"><span>${L('Date','Date')}</span><b>${fdate(r.d)}</b></div><div class="kv"><span>${L('Lieu','Venue')}</span><b>${esc(r.v)}</b></div>
 ${r.note?`<div class="note" style="margin:12px 0 0">${ic('info')}<span>${esc(tx(r.note))}</span></div>`:''}
 <p class="small" style="margin-top:12px">${L('Source','Source')} : ${ext(r.src,new URL(r.src).hostname.replace('www.',''))}</p></div>`)});};
