/* ================= Mode direct: real-data replay of Sénégal 5-0 Irak (FIFA report) ================= */
const R=REPLAY;
const MIN_MS=750; // one match minute at ×1
let LIVE={run:false,ph:1,c:0,sp:1,fired:[],sc:[0,0],last:0,raf:0,hold:0,done:false};
function liveReset(){cancelAnimationFrame(LIVE.raf);LIVE={run:false,ph:1,c:0,sp:LIVE.sp||1,fired:[],sc:[0,0],last:0,raf:0,hold:0,done:false};}
const evPhase=e=>e.k==='ft'||e.ht||e.m>45?2:1;
const evAt=e=>e.k==='ft'?96:e.ht?45:e.k==='ht'?54:e.m;
function clockTxt(){const c=Math.floor(LIVE.c);if(LIVE.done)return L('Terminé','Full time');if(LIVE.ph===1){if(LIVE.c>=54)return L('Mi-temps','Half time');return c<=45?`${Math.max(1,c)}'`:`45+${c-45}'`;}return c<=90?`${Math.max(46,c)}'`:`90+${c-90}'`;}
function liveLoop(ts){if(!LIVE.run)return;const dt=LIVE.last?Math.min(120,ts-LIVE.last):16;LIVE.last=ts;
 if(LIVE.hold>0){LIVE.hold-=dt;}else{
  LIVE.c+=dt/MIN_MS*LIVE.sp;
  if(LIVE.ph===1&&LIVE.c>=54){LIVE.c=54;fireDue();LIVE.ph=2;LIVE.c=45;LIVE.hold=1600;liveUI();}
  else if(LIVE.ph===2&&LIVE.c>=96){LIVE.c=96;fireDue();LIVE.done=true;LIVE.run=false;liveUI();liveEnd();return;}
  fireDue();}
 liveUI(true);LIVE.raf=requestAnimationFrame(liveLoop);}
function fireDue(){R.ev.forEach((e,i)=>{if(LIVE.fired.includes(i))return;const ph=evPhase(e);if(ph<LIVE.ph||(ph===LIVE.ph&&LIVE.c>=evAt(e))){LIVE.fired.push(i);onEvent(e,i);}});}
function onEvent(e,i){
 if(e.k==='goal'){LIVE.sc[e.s==='h'?0:1]++;if(e.s==='h'){LIVE.hold=2300;celebrate(e);}}
 if(e.k==='red'){LIVE.hold=900;cardFlash('r');}
 if(e.k==='ht'){buzz(20);}
 liveUI();feedAdd(e,i);}
function livePlay(){if(LIVE.done){liveReset();const el=liveEl();if(el){$('.lv-feed',el)&&($('.lv-feed',el).innerHTML='');}}LIVE.run=true;LIVE.last=0;LIVE.raf=requestAnimationFrame(liveLoop);liveUI();badges();step(0);}
function livePause(){LIVE.run=false;cancelAnimationFrame(LIVE.raf);liveUI();badges();}
const liveEl=()=>{const e=NAV.mode==='tabs'?Object.values(NAV.st).flat().find(x=>x.name==='live'):null;return e&&e.el;};
const isLiveTop=()=>{const t=top();return t&&t.name==='live'&&!$('.story',layer);};
function liveUI(fast){const el=liveEl();if(!el)return;
 const m=$('#lvMin',el);if(m)m.textContent=clockTxt();
 const s0=$('#lvS0',el),s1=$('#lvS1',el);
 [[s0,0],[s1,1]].forEach(([n,k])=>{if(n&&+n.dataset.v!==LIVE.sc[k]){n.dataset.v=LIVE.sc[k];n.textContent=LIVE.sc[k];if(!RM)n.animate([{transform:'translateY(-60%) scale(1.4)',opacity:0},{transform:'none',opacity:1}],{duration:520,easing:'cubic-bezier(.34,1.56,.64,1)'});}});
 const prog=$('#lvProg',el);if(prog){const total=LIVE.ph===1?LIVE.c:54+(LIVE.c-45);prog.style.transform=`scaleX(${Math.min(1,total/105)})`;}
 if(fast)return;
 const pb=$('#lvPlay',el);if(pb){pb.innerHTML=ic(LIVE.run?'pause':'play');pb.setAttribute('aria-label',LIVE.run?L('Pause','Pause'):L('Lecture','Play'));}
 el.classList.toggle('is-run',LIVE.run);el.classList.toggle('is-done',LIVE.done);
 const sc=$('#lvScorers',el);if(sc)sc.innerHTML=scorersTxt();
 const pre=$('.lv-pre',el);if(pre)pre.hidden=LIVE.fired.length>0||LIVE.run;
 const end=$('.lv-end',el);if(end)end.hidden=!LIVE.done;
 if(el.dataset.tab==='xi')paintXI(el,false);
 $$('.mk',el).forEach(k=>k.classList.toggle('on',LIVE.fired.includes(+k.dataset.i)));}
function scorersTxt(){const g=R.ev.filter((e,i)=>e.k==='goal'&&LIVE.fired.includes(i));const by={};g.forEach(e=>{by[e.p]=(by[e.p]?by[e.p]+', ':'')+e.m+"'";});return Object.entries(by).map(([n,m])=>`<span>${ic('ball')}${esc(shortN(n))} ${m}</span>`).join('')||`<span class="mut">${L('Pas encore de but','No goal yet')}</span>`;}
function evHTML(e){const side=e.s==='a'?'a':'h';const tm=e.k==='ht'?'HT':e.k==='ft'?'FT':e.ht?'HT':`${e.m}'`;
 if(e.k==='goal'){const p=SQ.find(x=>x.n===e.p);return `<div class="ev goal ${side}"><span class="m disp">${tm}</span><div class="ev-b">${p&&hasPh(p.ph)?pic(p.ph,{cls:'ev-ph'}):''}<div><span class="kick">${L('But','Goal')} · ${e.s==='h'?nat('SEN'):nat('IRQ')}</span><b class="disp">${esc(e.p)}</b>${e.as?`<small>${L('Passe décisive','Assist')} : ${esc(e.as)}</small>`:''}</div><span class="ev-sc disp tn">${e._sc}</span></div></div>`;}
 if(e.k==='yel'||e.k==='red')return `<div class="ev ${side}"><span class="m disp">${tm}</span><div class="ev-b sm">${ic(e.k==='yel'?'ycard':'rcard')}<div><b>${esc(e.p)}</b><small>${e.k==='yel'?L('Carton jaune','Yellow card'):L('Carton rouge direct','Straight red card')} · ${e.s==='h'?nat('SEN'):nat('IRQ')}</small></div></div></div>`;
 if(e.k==='sub')return `<div class="ev ${side}"><span class="m disp">${tm}</span><div class="ev-b sm sub">${ic('sub')}<div><b><i class="in">▲</i> ${esc(e.on)}</b><small><i class="out">▼</i> ${esc(e.off)} · ${e.s==='h'?nat('SEN'):nat('IRQ')}</small></div></div></div>`;
 if(e.k==='ht')return `<div class="ev mid"><span class="pill">${ic('whistle')}${L('Mi-temps','Half time')} · ${nat('SEN')} ${e._sc} ${nat('IRQ')} · +${R.add[0]}’ ${L('de temps additionnel','added time')}</span></div>`;
 if(e.k==='ft')return `<div class="ev mid"><span class="pill y">${ic('whistle')}${L('Fin du match','Full time')} · ${nat('SEN')} ${e._sc} ${nat('IRQ')}</span></div>`;return '';}
function feedAdd(e,i){e._sc=`${LIVE.sc[0]}-${LIVE.sc[1]}`;const el=liveEl();if(!el)return;const f=$('.lv-feed',el);if(!f)return;const d=document.createElement('div');d.innerHTML=evHTML(e);const n=d.firstElementChild;if(!n)return;n.dataset.i=i;f.prepend(n);if(!RM)n.animate([{opacity:0,transform:'translateY(-14px) scale(.97)'},{opacity:1,transform:'none'}],{duration:420,easing:EASE});markImgs(n);}
function feedAll(){return R.ev.map((e,i)=>LIVE.fired.includes(i)?{e,i}:null).filter(Boolean).reverse().map(({e})=>evHTML(e)).join('');}
/* goal celebration in flag colours */
function celebrate(e){buzz([80,40,140,40,80]);if(!isLiveTop()){toast(`${L('BUT','GOAL')} ! ${nat('SEN')} ${LIVE.sc[0]}-${LIVE.sc[1]} · ${shortN(e.p)} ${e.m}'`,{icon:'ball',act:{label:L('Voir','View'),fn:()=>{switchTab('home');}}});return;}
 if(NOSAVE&&!document.documentElement.classList.contains('cele'))return;
 const p=SQ.find(x=>x.n===e.p);const d=document.createElement('div');d.className='goalfx';d.setAttribute('role','alert');
 d.innerHTML=`<i class="b1"></i><i class="b2"></i><i class="b3"></i><div class="gf-in"><span class="gf-w disp">${(L('BUT','GOAL')+'!').split('').map((c,j)=>`<span style="--j:${j}">${c==='!'?' !':c}</span>`).join('')}</span><div class="gf-p">${p&&hasPh(p.ph)?pic(p.ph,{cls:'gf-ph',eager:1}):`<span class="gf-no disp">${e.n}</span>`}<div><b class="disp">${esc(e.p)}</b><small>${e.m}' · ${nat('SEN')} ${LIVE.sc[0]}-${LIVE.sc[1]} ${nat('IRQ')}</small></div></div></div>`;
 layer.appendChild(d);markImgs(d);confetti(.5,.38,130);setTimeout(()=>confetti(.2,.5,50),300);setTimeout(()=>confetti(.8,.5,50),450);
 setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),450);},RM?900:2100);}
function cardFlash(k){if(!isLiveTop()||RM)return;const d=document.createElement('div');d.className='cardfx '+k;d.innerHTML='<i></i>';layer.appendChild(d);buzz(30);setTimeout(()=>d.remove(),900);}
function liveEnd(){badges();earn('live',40,{fr:'Match revécu en direct',en:'Match relived live'},true);}

SCR.live={solid:1,title:()=>`${nat('SEN')} – ${nat('IRQ')}`,short:()=>L('Direct','Live'),
 right:()=>`<button class="nbb" type="button" data-act="lvShare" aria-label="${L('Partager','Share')}">${ic('share')}</button>`,
 render:(p,e)=>{const tab=p.tab||'feed';return `
 <div class="sb">
  <div class="sb-comp"><span class="real">${ic('check')}${L('Données FIFA réelles','Real FIFA data')}</span><span class="lbl">${L('Mondial 2026 · Groupe I · 26 juin','World Cup 2026 · Group I · 26 June')}</span></div>
  <div class="sb-main"><div class="sb-t">${flag('SEN',50)}<b class="disp">${nat('SEN')}</b></div><div class="sb-s disp tn"><span id="lvS0" data-v="${LIVE.sc[0]}">${LIVE.sc[0]}</span><i>:</i><span id="lvS1" data-v="${LIVE.sc[1]}">${LIVE.sc[1]}</span></div><div class="sb-t">${flag('IRQ',50)}<b class="disp">${nat('IRQ')}</b></div></div>
  <div class="sb-clk"><span class="ldot"></span><b id="lvMin" class="disp tn">${clockTxt()}</b><small>${L('Rediffusion accélérée','Accelerated replay')}</small></div>
  <div class="sb-sc" id="lvScorers">${scorersTxt()}</div>
  <div class="sb-tl" aria-hidden="true"><i class="ht"></i><span class="pr" id="lvProg"></span>${R.ev.map((ev,i)=>ev.k==='goal'||ev.k==='red'||ev.k==='yel'?`<span class="mk ${ev.k} ${ev.s}" data-i="${i}" style="left:${((ev.m<=45?ev.m:ev.m+9)/105*100).toFixed(2)}%"></span>`:'').join('')}</div>
  <div class="sb-ctl"><button class="ib" type="button" data-act="lvReset" aria-label="${L('Recommencer','Restart')}">${ic('reset')}</button><button class="lv-play" id="lvPlay" type="button" data-act="lvPlay" aria-label="${L('Lecture','Play')}">${ic(LIVE.run?'pause':'play')}</button><button class="ib" type="button" data-act="lvNext" aria-label="${L('Temps fort suivant','Next highlight')}">${ic('next')}</button><button class="ib sp" type="button" data-act="lvSpeed" aria-label="${L('Vitesse','Speed')}"><b class="disp">×${LIVE.sp}</b></button></div>
 </div>
 <div class="seg" role="tablist" style="margin:14px 16px 0">${[['feed',L('Direct','Live')],['xi',L('Compos','Line-ups')],['stats','Stats']].map(([k,l])=>`<button type="button" role="tab" data-act="lvTab" data-v="${k}" aria-selected="${tab===k}">${l}</button>`).join('')}</div>
 <div class="lv-body">${tab==='feed'?`
  <div class="lv-end" ${LIVE.done?'':'hidden'}><div class="card pad lv-endc"><span class="kick">${L('Coup de sifflet final','Final whistle')}</span><b class="h2">${nat('SEN')} 5-0 ${nat('IRQ')}</b><p class="small">${L('Plus large victoire d’une équipe africaine en Coupe du monde. Homme du match FIFA : Pape Gueye.','Biggest win by an African team at a World Cup. FIFA Player of the Match: Pape Gueye.')}</p><button class="btn y block" type="button" data-act="vote">${ic('vote')}${L('Votez pour votre Homme du match','Vote for your Man of the Match')}</button></div></div>
  <div class="lv-pre" ${LIVE.fired.length||LIVE.run?'hidden':''}><div class="card pad"><div class="lv-pre-h">${ic('whistle')}<b class="h3">${L('Avant le coup d’envoi','Before kick-off')}</b></div><div class="kv"><span>${L('Stade','Stadium')}</span><b>${R.v}</b></div><div class="kv"><span>${L('Spectateurs','Attendance')}</span><b>${nfmt(R.att)}</b></div><div class="kv"><span>${L('Arbitre','Referee')}</span><b>${R.ref}</b></div><div class="kv"><span>${L('Sélectionneur','Head coach')}</span><b>${R.coach}</b></div><button class="btn y block" type="button" data-act="lvPlay" style="margin-top:12px">${ic('play')}${L('Lancer le direct','Start the live')}</button><p class="small" style="margin-top:10px">${L('Rediffusion minute par minute des événements officiels du rapport FIFA. 90 minutes en ~75 secondes.','Minute-by-minute replay of the official FIFA report events. 90 minutes in ~75 seconds.')}</p></div></div>
  <div class="lv-feed">${feedAll()}</div>`
 :tab==='xi'?`<div class="pitch" id="pitch"><div class="pl-lines"><i class="hw"></i><i class="cc"></i><i class="pa t"></i><i class="pa b"></i><i class="ga t"></i><i class="ga b"></i></div><div class="xi"></div><span class="frm disp">4-3-3</span></div>
  <div class="wrap"><div class="lbl" style="margin:16px 0 8px">${L('Remplaçants entrés','Substitutes used')}</div><div class="bench">${R.bench.map(([n,name,id])=>`<button class="bn" type="button" ${id?`data-act="player" data-id="${id}"`:'disabled'}><span class="no disp">${n}</span><b>${esc(name)}</b><small data-sub="${esc(name)}"></small></button>`).join('')}</div>
  <div class="lbl" style="margin:16px 0 8px">${nat('IRQ')} · ${L('Sélectionneur','Head coach')} Graham Arnold</div><p class="small">${L('Ahmed Basil (puis Jalal Hassan) — Frans Putros, Rebin Sulaka, Akam Hashim, Merchas Doski — Ahmed Qasem, Zidane Iqbal, Amir Alammari, Ibrahim Bayesh (c) — Ali Alhamadi, Ali Jasim.','Ahmed Basil (then Jalal Hassan) — Frans Putros, Rebin Sulaka, Akam Hashim, Merchas Doski — Ahmed Qasem, Zidane Iqbal, Amir Alammari, Ibrahim Bayesh (c) — Ali Alhamadi, Ali Jasim.')}</p></div>`
 :`<div class="wrap"><div class="card pad stats"><div class="st-h"><span>${flag('SEN',24)}</span><span class="lbl">${L('Statistiques officielles FIFA · fin de match','Official FIFA statistics · full time')}</span><span>${flag('IRQ',24)}</span></div>${R.stats.map(([l,a,b,u])=>{const t=a+b;return `<div class="stt"><div class="stt-v"><b class="disp tn">${String(a).replace('.',LANG==='fr'?',':'.')}${u}</b><span>${esc(tx(l))}</span><b class="disp tn">${String(b).replace('.',LANG==='fr'?',':'.')}${u}</b></div><div class="stt-b"><i class="a" style="--w:${(a/t*100).toFixed(1)}%"></i><i class="b" style="--w:${(b/t*100).toFixed(1)}%"></i></div></div>`;}).join('')}<p class="small" style="margin-top:8px">${L('Possession : 10,7 % du temps en duel. Source : rapport FIFA post-match.','Possession: 10.7% of time contested. Source: FIFA post-match report.')} ${ext('https://www.fifatrainingcentre.com/media/native/tournaments/fifa-world-cup/2026/PMSR-M62-SEN-V-IRQ.pdf','FIFA')}</p></div></div>`}
 </div>`;},
 mount:(el,p)=>{el.dataset.tab=p.tab||'feed';if(el.dataset.tab==='xi')paintXI(el,true);if(el.dataset.tab==='stats')requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('st-in')));liveUI();}};
A.replay=()=>{if(top()&&top().name==='live')return;go('live');};
A.lvPlay=()=>{LIVE.run?livePause():livePlay();buzz(6);};
A.lvReset=()=>{liveReset();const e=top();if(e.name==='live')build(e);badges();};
A.lvSpeed=t=>{LIVE.sp=LIVE.sp===1?2:LIVE.sp===2?4:1;t.innerHTML=`<b class="disp">×${LIVE.sp}</b>`;buzz(4);};
A.lvNext=()=>{const nx=R.ev.map((e,i)=>({e,i})).find(({e,i})=>!LIVE.fired.includes(i)&&(e.k==='goal'||e.k==='red'||e.k==='ft'));if(!nx)return;
 const e=nx.e,ph=evPhase(e);if(ph===2&&LIVE.ph===1){LIVE.c=54;fireDue();LIVE.ph=2;}LIVE.c=evAt(e)-.05;LIVE.hold=0;if(!LIVE.run)livePlay();else liveUI();};
A.lvTab=t=>{const e=top();e.params.tab=t.dataset.v;build(e);buzz(4);};
A.lvShare=async()=>{const txt=L('Sénégal 5-0 Irak, Mondial 2026 : revivez le match minute par minute dans Gaïndé (concept).','Senegal 5-0 Iraq, 2026 World Cup: relive it minute by minute in Gaïndé (concept).');try{if(navigator.share){await navigator.share({title:'Gaïndé',text:txt,url:location.href.split('?')[0]});return;}}catch(e){}try{await navigator.clipboard.writeText(txt+' '+location.href.split('?')[0]);toast(L('Lien copié','Link copied'));}catch(e){toast(L('Partage indisponible ici','Sharing unavailable here'),{icon:'info'});}};
/* line-up on a pitch: players drop in, live icons follow the replay clock */
const XY={GK:[50,88],RB:[84,68],CB:[62,73],CB2:[38,73],LB:[16,68],DM:[50,55],CM:[73,44],CM2:[27,44],RW:[80,20],CF:[50,14],LW:[20,20]};
function paintXI(el,fresh){const box=$('.xi',el);if(!box)return;const used={};
 const evs=R.ev.filter((e,i)=>LIVE.fired.includes(i));
 const html=R.xi.map(([n,name,pos,id],i)=>{let k=pos;if(used[pos]){k=pos+'2';}used[pos]=1;const [x,y]=XY[k];
  const g=evs.filter(e=>e.k==='goal'&&e.p===name).length,yc=evs.some(e=>e.k==='yel'&&e.p===name),off=evs.find(e=>e.k==='sub'&&e.off===name);
  return `<button class="pp" type="button" style="left:${x}%;top:${y}%;--d:${i*55}ms" ${id?`data-act="player" data-id="${id}"`:'tabindex="-1"'} aria-label="${esc(name)}"><span class="pp-d disp">${n}${g?`<i class="g">${g>1?g:''}${ic('ball')}</i>`:''}${yc?'<i class="yc"></i>':''}${off?`<i class="so">${off.m}'</i>`:''}</span><b>${esc(shortN(name))}</b></button>`;}).join('');
 if(fresh||box.dataset.h!==html){box.dataset.h=html;box.innerHTML=html;if(fresh&&!RM)box.classList.add('drop');}
 $$('.bench [data-sub]',el).forEach(s=>{const ev=evs.find(e=>e.k==='sub'&&e.on===s.dataset.sub);const gl=evs.filter(e=>e.k==='goal'&&e.p===s.dataset.sub).length;s.textContent=ev?`▲ ${ev.m}'${gl?` · ${gl} ${gl>1?L('buts','goals'):L('but','goal')}`:''}`:L('en attente','waiting');});}
