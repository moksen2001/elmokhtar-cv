/* ================= games: man of the match vote + share card, pronos, quiz ================= */
const MOTM_C=[{id:'pgueye',v:5906,s:{fr:'2 buts · 1 passe',en:'2 goals · 1 assist'}},{id:'isarr',v:3082,s:{fr:'1 but · 1 passe',en:'1 goal · 1 assist'}},{id:'iliman',v:1926,s:{fr:'1 but · 1 passe',en:'1 goal · 1 assist'}},{id:'camara',v:1156,s:{fr:'1 passe décisive',en:'1 assist'}},{id:'igueye',v:770,s:{fr:'Capitaine · 90 min',en:'Captain · 90 min'}}];
const votesOf=id=>{const c=MOTM_C.find(x=>x.id===id);return c.v+(S.votes['sen-irq']===id?1:0);};
const pctOf=id=>{const t=MOTM_C.reduce((a,c)=>a+votesOf(c.id),0);return Math.round(votesOf(id)/t*100);};
SCR.vote={title:()=>L('Homme du match','Man of the Match'),short:()=>L('Vote','Vote'),bar:1,
 render:(p)=>{const voted=S.votes['sen-irq'];const sel=voted||p.sel;return `<div class="wrap">
 <div class="vt-h"><span class="kick">${L('Mondial 2026 · 26 juin · Toronto','World Cup 2026 · 26 June · Toronto')}</span><h1 class="h1" style="margin:6px 0 4px">${L('Votre Homme du match','Your Man of the Match')}</h1><p class="p">${nat('SEN')} 5-0 ${nat('IRQ')} · ${voted?L('Merci pour votre vote !','Thanks for voting!'):L('Touchez un joueur puis validez.','Tap a player, then confirm.')}</p></div>
 <div class="vt-list ${voted?'done':''}">${MOTM_C.map(c=>{const pl=P(c.id);const pc=pctOf(c.id);return `<button class="vt ${sel===c.id?'sel':''}" type="button" data-act="vtPick" data-id="${c.id}" ${voted?'disabled':''} aria-pressed="${sel===c.id}">
  <span class="vt-ph">${face(pl,{size:24})}</span><span class="vt-t"><b>${esc(pl.n)}</b><small>${esc(tx(c.s))}</small></span>
  <span class="vt-p disp tn" data-pc="${pc}">${voted?'0%':''}</span><span class="vt-bar" style="--p:${voted?pc:0}%"></span>${sel===c.id?`<span class="vt-ck">${ic('check')}</span>`:''}</button>`;}).join('')}</div>
 ${voted?`<div class="note" style="margin:14px 0 0">${ic('trophy')}<span>${L('Homme du match officiel FIFA : <b>Pape Gueye</b>. Pourcentages de la communauté : démonstration.','Official FIFA Player of the Match: <b>Pape Gueye</b>. Community percentages: demo.')}</span></div>`:`<p class="small" style="margin-top:12px">${L('Statistiques individuelles : rapport officiel FIFA. Votes de la communauté simulés pour la démo.','Individual stats: official FIFA report. Community votes are simulated for the demo.')}</p>`}</div>`;},
 after:(p)=>{const voted=S.votes['sen-irq'];return `<div class="cta-bar">${voted?`<button class="btn y block" type="button" data-act="shareCard">${ic('share')}${L('Partager ma carte','Share my card')}</button>`:`<button class="btn y block" type="button" data-act="vtGo" ${p.sel?'':'disabled'}>${ic('vote')}${L('Voter','Vote')}</button>`}</div>`;},
 mount:(el)=>{if(S.votes['sen-irq'])animPct(el);}};
function animPct(el){$$('.vt-p',el).forEach((n,i)=>{const to=+n.dataset.pc;if(RM){n.textContent=to+'%';return;}const t0=performance.now()+i*90;const f=t=>{const p=clamp((t-t0)/900,0,1),q=1-Math.pow(1-p,3);n.textContent=Math.round(to*q)+'%';if(p<1&&n.isConnected)requestAnimationFrame(f);};requestAnimationFrame(f);});}
A.vote=t=>{const pre=t&&t.dataset&&t.dataset.pre;const e=top();if(e&&e.name==='vote')return;go('vote',pre&&!S.votes['sen-irq']?{sel:pre}:{});};
A.vtPick=t=>{const e=top();e.params.sel=t.dataset.id;build(e);buzz(5);const b=$(`.vt[data-id="${t.dataset.id}"]`,e.el);if(b&&!RM)b.animate([{transform:'scale(.97)'},{transform:'scale(1.02)'},{transform:'none'}],{duration:380,easing:'ease-out'});};
A.vtGo=()=>{const e=top();const id=e.params.sel;if(!id)return;S.votes['sen-irq']=id;save();buzz([10,40,20]);build(e);
 const el=e.el;$$('.vt-bar',el).forEach(b=>{const w=b.style.getPropertyValue('--p');b.style.setProperty('--p','0%');requestAnimationFrame(()=>requestAnimationFrame(()=>b.style.setProperty('--p',w)));});
 const s=$(`.vt[data-id="${id}"]`,el).getBoundingClientRect(),a=app.getBoundingClientRect();confetti((s.left+s.width/2-a.left)/a.width,(s.top-a.top)/a.height,70);
 earn('vote',10,{fr:'Vote Homme du match',en:'Man of the Match vote'},true);step(1);};
/* ---------- canvas share card (1080×1350) ---------- */
function loadImg(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});}
async function makeShareCard(pid){const W=1080,H=1350;const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
 try{await document.fonts.load('900 120px "Big Shoulders Display"');await document.fonts.load('700 40px "Barlow Condensed"');}catch(e){}
 const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#174A2D');g.addColorStop(.55,'#0A2215');g.addColorStop(1,'#06140C');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.save();x.globalAlpha=.07;x.strokeStyle='#FDEF42';x.lineWidth=3;for(let yy=0;yy<H;yy+=60)for(let xx=(yy/60%2)*60;xx<W;xx+=120){x.beginPath();x.moveTo(xx,yy+30);x.lineTo(xx+30,yy);x.lineTo(xx+60,yy+30);x.lineTo(xx+30,yy+60);x.closePath();x.stroke();}x.restore();
 const pl=P(pid);const R0={x:90,y:250,w:900,h:760,r:44};
 x.save();x.beginPath();x.roundRect(R0.x,R0.y,R0.w,R0.h,R0.r);x.clip();x.fillStyle='#0F2A1B';x.fillRect(R0.x,R0.y,R0.w,R0.h);
 try{const im=await loadImg(`img/${pl.ph}.webp`);const s=Math.max(R0.w/im.width,R0.h/im.height);const dw=im.width*s,dh=im.height*s;x.drawImage(im,R0.x+(R0.w-dw)/2,R0.y+(R0.h-dh)*.12,dw,dh);}catch(e){x.fillStyle='#FDEF42';x.font='900 300px "Big Shoulders Display",Impact';x.textAlign='center';x.fillText(initials(pl.n),W/2,760);}
 const gg=x.createLinearGradient(0,R0.y+R0.h*.45,0,R0.y+R0.h);gg.addColorStop(0,'rgba(6,20,12,0)');gg.addColorStop(1,'rgba(6,20,12,.95)');x.fillStyle=gg;x.fillRect(R0.x,R0.y,R0.w,R0.h);x.restore();
 x.fillStyle='#00853F';x.fillRect(90,1050,300,10);x.fillStyle='#FDEF42';x.fillRect(390,1050,300,10);x.fillStyle='#E31B23';x.fillRect(690,1050,300,10);
 x.fillStyle='#FDEF42';x.font='700 44px "Barlow Condensed",Arial Narrow,sans-serif';x.textAlign='left';x.fillText(L('MON HOMME DU MATCH','MY MAN OF THE MATCH'),90,140);
 x.fillStyle='#F3F1E4';x.font='900 64px "Big Shoulders Display",Impact,sans-serif';x.fillText(`${nat('SEN').toUpperCase()} 5-0 ${nat('IRQ').toUpperCase()}`,90,212);
 x.fillStyle='rgba(243,241,228,.7)';x.font='700 34px "Barlow Condensed",Arial Narrow,sans-serif';x.textAlign='right';x.fillText(L('MONDIAL 2026','WORLD CUP 2026'),990,140);
 x.textAlign='left';x.fillStyle='#fff';x.font='900 118px "Big Shoulders Display",Impact,sans-serif';const nm=pl.n.toUpperCase();let fs=118;while(x.measureText(nm).width>860&&fs>60){fs-=6;x.font=`900 ${fs}px "Big Shoulders Display",Impact,sans-serif`;}x.fillText(nm,120,980);
 const c1=MOTM_C.find(q=>q.id===pid);x.fillStyle='#FDEF42';x.font='700 40px "Barlow Condensed",Arial Narrow,sans-serif';x.fillText(tx(c1?c1.s:'').toUpperCase(),124,1022);
 try{const svg=new Blob([lionSVG().replace('<svg ','<svg width="160" height="160" ')],{type:'image/svg+xml'});const u=URL.createObjectURL(svg);const li=await loadImg(u);x.drawImage(li,90,1110,150,150);URL.revokeObjectURL(u);}catch(e){}
 x.fillStyle='#F3F1E4';x.font='900 84px "Big Shoulders Display",Impact,sans-serif';x.fillText('GAÏNDÉ',262,1200);
 x.fillStyle='rgba(243,241,228,.6)';x.font='600 30px "Barlow Condensed",Arial Narrow,sans-serif';x.fillText(L('Concept non officiel · non affilié à la FSF','Unofficial concept · not affiliated with the FSF'),266,1246);
 x.fillStyle='rgba(243,241,228,.45)';x.font='500 22px Barlow,Arial,sans-serif';x.textAlign='right';const cr=CREDITS[pl.ph];if(cr)x.fillText(`Photo : ${cr.a} · ${cr.l}`,990,1300);
 return c;}
A.shareCard=async t=>{const pid=S.votes['sen-irq'];if(!pid)return;t&&t.classList.add('busy');let c;try{c=await makeShareCard(pid);}catch(e){t&&t.classList.remove('busy');toast(L('Carte indisponible','Card unavailable'),{icon:'info'});return;}t&&t.classList.remove('busy');
 const url=c.toDataURL('image/png');window.__shareCard={w:c.width,h:c.height,len:url.length};
 const sh=openSheet({label:L('Ma carte','My card'),html:sheetHTML(L('Votre carte','Your card'),`<div class="shc"><img src="${url}" alt="${L('Carte Homme du match','Man of the Match card')}"></div>`,`<a class="btn ghost" href="${url}" download="gainde-homme-du-match.png">${ic('download')}${L('Enregistrer','Save')}</a><button class="btn y" style="flex:1" type="button" data-act="shareNative">${ic('share')}${L('Partager','Share')}</button>`)});
 sh.data.canvas=c;earn('share',15,{fr:'Carte partagée',en:'Card shared'},true);};
A.shareNative=async()=>{const sh=topSheet();if(!sh||!sh.data.canvas)return;try{const blob=await new Promise(r=>sh.data.canvas.toBlob(r,'image/png'));const f=new File([blob],'gainde.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Gaïndé'});return;}}catch(e){}toast(L('Partage direct indisponible : utilisez « Enregistrer »','Direct share unavailable: use “Save”'),{icon:'info'});};

/* ---------- pronos ---------- */
const LB=[['Moussa D.','Dakar',145],['Aïssatou N.','Thiès',132],['Ibrahima S.','Milan',118],['Fatou K.','Paris',104],['Cheikh B.','Montréal',96],['Mariama T.','Ziguinchor',81]];
SCR.pronos={title:()=>'Pronos',bar:1,render:(p)=>{const f=nextLions();if(!f)return `<div class="empty">${ic('target')}<p>${L('Pas de match des Lions à pronostiquer pour le moment.','No Lions match to predict right now.')}</p></div>`;
 const saved=S.pronos[f.id];const v=p.v||saved||{h:1,a:0,sc:null};const closed=Date.now()>Date.parse(f.ko);
 const fw=SQ.filter(x=>x.p==='FW'||x.id==='pgueye'||x.id==='camara').slice(0,12);
 const myPts=ptsTotal();const board=LB.map(r=>({n:r[0],c:r[1],p:r[2]})).concat([{n:`${S.user.first} ${S.user.last[0]}.`,c:S.user.city,p:Math.min(150,40+(Object.keys(S.pronos).length*20)),me:1}]).sort((a,b)=>b.p-a.p);
 return `<div class="wrap"><div class="pr-m"><span class="kick">${esc(tx(f.comp))} · ${esc(whenTxt(f))}</span><div class="pr-t">${flag(f.h,56)}<div class="pr-sc">
  <div class="stp"><button type="button" class="ib" data-act="prStep" data-k="h" data-d="1" ${closed||saved?'disabled':''} aria-label="+">${ic('plus')}</button><b class="disp tn" id="prH">${v.h}</b><button type="button" class="ib" data-act="prStep" data-k="h" data-d="-1" ${closed||saved?'disabled':''} aria-label="-">${ic('minus')}</button></div>
  <i class="disp">–</i>
  <div class="stp"><button type="button" class="ib" data-act="prStep" data-k="a" data-d="1" ${closed||saved?'disabled':''} aria-label="+">${ic('plus')}</button><b class="disp tn" id="prA">${v.a}</b><button type="button" class="ib" data-act="prStep" data-k="a" data-d="-1" ${closed||saved?'disabled':''} aria-label="-">${ic('minus')}</button></div>
 </div>${flag(f.a,56)}</div><div class="pr-n"><b>${esc(nat(f.h))}</b><b>${esc(nat(f.a))}</b></div></div>
 <div class="lbl" style="margin:18px 0 8px">${L('Premier buteur sénégalais','First Senegal scorer')} <span class="mut">(+3 pts)</span></div>
 <div class="chips pr-chips" style="padding:0;flex-wrap:wrap">${fw.map(x=>`<button class="chip" type="button" data-act="prScorer" data-id="${x.id}" aria-pressed="${v.sc===x.id}" ${closed||saved?'disabled':''}>${esc(shortN(x.n))}</button>`).join('')}</div>
 ${saved?`<div class="pr-ok">${ic('check')}<span><b>${L('Prono enregistré','Prediction saved')}</b><small>${nat(f.h)} ${saved.h}-${saved.a} ${nat(f.a)}${saved.sc?' · '+esc(P(saved.sc).n):''}</small></span><button class="lnk" type="button" data-act="prEdit">${L('Modifier','Edit')}</button></div>`:''}
 ${closed?`<div class="note" style="margin:14px 0 0">${ic('lock')}<span>${L('Pronos clos : le match a commencé. Les points seront attribués avec le résultat officiel.','Predictions closed: the match has started. Points will be awarded with the official result.')}</span></div>`:''}
 <div class="pr-rules"><span><b class="disp">5</b>${L('score exact','exact score')}</span><span><b class="disp">2</b>${L('bon vainqueur','right winner')}</span><span><b class="disp">3</b>${L('bon buteur','right scorer')}</span></div>
 <div class="sec-h" style="padding:0;margin:22px 0 10px"><h2 class="h3">${L('Classement des amis','Friends leaderboard')}</h2>${demoTag()}</div>
 <div class="lb">${board.map((r,i)=>`<div class="lb-r ${r.me?'me':''}"><span class="pos disp">${i+1}</span><span class="av" style="width:34px;height:34px;font-size:14px">${esc(r.n.split(' ').map(w=>w[0]).join(''))}</span><span class="lb-n"><b>${esc(r.n)}${r.me?` · ${L('vous','you')}`:''}</b><small>${esc(r.c)}</small></span><b class="disp tn">${r.p}</b></div>`).join('')}</div></div>`;},
 after:()=>{const f=nextLions();if(!f||S.pronos[f.id]||Date.now()>Date.parse(f.ko))return '';return `<div class="cta-bar"><button class="btn y block" type="button" data-act="prSave">${ic('target')}${L('Valider mon prono','Lock in my prediction')}</button></div>`;}};
A.pronos=()=>{if(top()&&top().name==='pronos')return;go('pronos');};
A.prStep=t=>{const e=top();const f=nextLions();const v=e.params.v||Object.assign({},S.pronos[f.id]||{h:1,a:0,sc:null});const k=t.dataset.k;v[k]=clamp(v[k]+ +t.dataset.d,0,9);e.params.v=v;const n=$(k==='h'?'#prH':'#prA',e.el);n.textContent=v[k];if(!RM)n.animate([{transform:`translateY(${+t.dataset.d>0?'40%':'-40%'})`,opacity:0},{transform:'none',opacity:1}],{duration:260,easing:'cubic-bezier(.34,1.56,.64,1)'});buzz(4);};
A.prScorer=t=>{const e=top();const f=nextLions();const v=e.params.v||Object.assign({},S.pronos[f.id]||{h:1,a:0,sc:null});v.sc=v.sc===t.dataset.id?null:t.dataset.id;e.params.v=v;$$('[data-act="prScorer"]',e.el).forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===v.sc));buzz(4);};
A.prSave=t=>{const e=top();const f=nextLions();const v=e.params.v||{h:1,a:0,sc:null};S.pronos[f.id]=Object.assign({ts:Date.now()},v);save();buzz([8,30,12]);confetti(.5,.3,60);build(e);earn('prono-'+f.id,20,{fr:'Prono Sénégal – Comores',en:'Senegal – Comoros prediction'},true);step(4);};
A.prEdit=()=>{const f=nextLions();const e=top();e.params.v=Object.assign({},S.pronos[f.id]);delete S.pronos[f.id];save();build(e);};

/* ---------- quiz ---------- */
SCR.quiz={title:()=>L('Quiz Lions','Lions quiz'),render:(p)=>{const i=p.i||0;
 if(p.end){const sc=p.sc||0;const pct=sc/QUIZ.length;return `<div class="qz-end"><div class="ring" style="--p:${pct}"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg"/></svg><b class="disp tn">${sc}<small>/${QUIZ.length}</small></b></div>
  <h1 class="h1" style="text-align:center">${sc>=9?L('Légende de la Tanière !','Den legend!'):sc>=6?L('Vrai Gaïndé !','True Lion!'):L('Lionceau en progrès','Cub in progress')}</h1><p class="p" style="text-align:center">${L(`+${sc*10} points sur votre carte supporter.`,`+${sc*10} points on your supporter card.`)}</p>
  <div style="display:flex;gap:8px;margin-top:18px"><button class="btn ghost" type="button" data-act="qzRetry" style="flex:1">${ic('reset')}${L('Rejouer','Play again')}</button><button class="btn y" type="button" data-act="openCard" style="flex:1">${ic('card')}${L('Ma carte','My card')}</button></div></div>`;}
 const q=QUIZ[i];const a=p.a;return `<div class="wrap qz"><div class="qz-p"><span class="lbl">${L('Question','Question')} ${i+1}/${QUIZ.length}</span><span class="qz-bar"><i style="transform:scaleX(${(i+(a!=null?1:0))/QUIZ.length})"></i></span></div>
 <h1 class="h2 qz-q">${esc(tx(q.q))}</h1><div class="qz-o stg">${q.o.map((o,j)=>`<button class="qo ${a!=null?(j===q.a?'ok':j===a?'ko':''):''}" type="button" data-act="qzPick" data-j="${j}" ${a!=null?'disabled':''}><span class="qo-l disp">${'ABCD'[j]}</span><span>${esc(tx(o))}</span>${a!=null&&j===q.a?ic('check'):a===j&&j!==q.a?ic('close'):''}</button>`).join('')}</div>
 ${a!=null?`<div class="qz-x ${a===q.a?'ok':'ko'}"><b>${a===q.a?L('Bonne réponse !','Correct!'):L('Raté…','Not quite…')}</b><p>${esc(tx(q.x))}</p><small>${L('Source','Source')} : ${ext(q.s,new URL(q.s).hostname.replace('en.','').replace('www.',''))}</small></div><button class="btn y block" type="button" data-act="qzNext" style="margin-top:14px">${i<QUIZ.length-1?L('Question suivante','Next question'):L('Voir mon score','See my score')}${ic('arrow')}</button>`:''}</div>`;},
 mount:(el,p)=>{if(p.end&&!RM){const r=$('.ring',el);r.classList.add('go');}}};
A.quiz=()=>go('quiz',{i:0,sc:0});
A.qzPick=t=>{const e=top();const q=QUIZ[e.params.i||0];const j=+t.dataset.j;e.params.a=j;if(j===q.a){e.params.sc=(e.params.sc||0)+1;buzz([8,30,8]);}else buzz([40]);build(e);
 const b=$(`.qo[data-j="${j}"]`,e.el);if(b&&!RM)b.animate(j===q.a?[{transform:'scale(1)'},{transform:'scale(1.04)'},{transform:'none'}]:[{transform:'translateX(0)'},{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateX(-4px)'},{transform:'none'}],{duration:400});
 if(j===q.a&&b){const r=b.getBoundingClientRect(),a=app.getBoundingClientRect();confetti((r.left+r.width/2-a.left)/a.width,(r.top-a.top)/a.height,26);}};
A.qzNext=()=>{const e=top();const i=(e.params.i||0)+1;if(i>=QUIZ.length){const sc=e.params.sc||0;S.quiz.last=sc;S.quiz.best=Math.max(S.quiz.best||0,sc);save();replace('quiz',{end:1,sc});if(sc)earn('quiz-'+Date.now(),sc*10,{fr:`Quiz Lions ${sc}/10`,en:`Lions quiz ${sc}/10`});step(4);if(sc>=6)setTimeout(()=>confetti(.5,.3,110),300);return;}e.params.i=i;e.params.a=null;e.scroll=0;build(e);};
A.qzRetry=()=>replace('quiz',{i:0,sc:0});
