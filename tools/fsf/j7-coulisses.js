/* ================= Coulisses: stories, FSF TV videos (click-to-load), games hub ================= */
function storyRail(){return `<div class="srail">${STORIES.map((s,i)=>`<button class="sr-b ${S.seenSt.includes(s.id)?'seen':''}" type="button" data-act="story" data-i="${i}"><span class="sr-ring">${pic(s.cv,{alt:''})}</span><small>${esc(tx(s.t))}</small></button>`).join('')}</div>`;}
function videoCard(v,wide){return `<button class="vc ${wide?'wide':''}" type="button" data-act="video" data-id="${v.id}"><span class="vc-th">${pic(v.ph,{alt:''})}<span class="vc-tag">${esc(tx(v.tag))}</span><span class="vc-pl">${ic('play')}</span><span class="vc-d">${v.d}</span></span><span class="vc-t"><b>${esc(tx(v.t))}</b><small>FSF TV · ${fdate(v.at,{day:'numeric',month:'short'})}</small></span></button>`;}
function motmTeaser(){const voted=S.votes['sen-irq'];const cands=MOTM_C.slice(0,4);return `<div class="motm"><div class="motm-h"><div><span class="kick">${L('Homme du match','Man of the Match')}</span><b class="h3" style="display:block;margin-top:3px">${nat('SEN')} 5-0 ${nat('IRQ')}</b></div>${voted?realTag(L('A voté','Voted')):`<span class="demo">${ic('vote')}${L('Vote','Vote')}</span>`}</div>
 <div class="motm-c">${cands.map(c=>{const p=P(c.id);return `<button class="mc" type="button" data-act="vote" data-pre="${c.id}">${face(p,{size:20})}<b>${esc(shortN(p.n))}</b><small class="tn">${voted?pctOf(c.id)+'%':''}</small></button>`;}).join('')}</div></div>`;}

SCR.coulisses={large:1,title:()=>L('Coulisses','Inside'),
 render:()=>`<p class="lt-s">${L('Vivre la Tanière de l’intérieur','Live the Den from the inside')}</p>
 <section class="sec" style="margin-top:16px">${storyRail()}</section>
 <section class="sec"><div class="sec-h"><h2 class="h2">FSF TV</h2>${ext('https://www.youtube.com/@fsfofficielle',L('Chaîne','Channel'),'more')}</div>
  <button class="vfeat" type="button" data-act="video" data-id="${VIDEOS[0].id}"><span class="vf-th">${pic('team',{big:1,alt:''})}<span class="vc-pl big">${ic('play')}</span><span class="vc-d">${VIDEOS[0].d}</span></span><span class="vf-t"><span class="kick">${L('À la une','Featured')} · ${fdate(VIDEOS[0].at,{day:'numeric',month:'short'})}</span><b class="h3">${esc(tx(VIDEOS[0].t))}</b></span></button>
  <div class="hscroll" style="margin-top:12px">${VIDEOS.slice(1).map(v=>videoCard(v)).join('')}</div>
  <p class="small wrap" style="margin-top:8px">${L('Vidéos de la chaîne officielle FSF TV. Lecture intégrée YouTube chargée uniquement à votre demande.','Videos from the official FSF TV channel. Embedded YouTube player only loads when you ask.')}</p></section>
 <section class="sec"><div class="sec-h"><h2 class="h2">${L('Jouer','Play')}</h2></div><div class="games wrap">
  <button class="gm g1" type="button" data-act="vote"><span class="gm-i">${ic('vote')}</span><b class="h3">${L('Homme du match','Man of the Match')}</b><small>${L('Votez et partagez votre carte','Vote and share your card')}</small></button>
  <button class="gm g2" type="button" data-act="pronos"><span class="gm-i">${ic('target')}</span><b class="h3">Pronos</b><small>${nextLions()?`${nat(nextLions().h)} – ${nat(nextLions().a)}`:L('Prochain match','Next match')}</small></button>
  <button class="gm g3" type="button" data-act="quiz"><span class="gm-i">${ic('quiz')}</span><b class="h3">${L('Quiz Lions','Lions quiz')}</b><small>${L('10 questions d’histoire','10 history questions')}${S.quiz.best!=null?` · ${L('record','best')} ${S.quiz.best}/10`:''}</small></button>
  <button class="gm g4" type="button" data-act="replay"><span class="gm-i">${ic('play')}</span><b class="h3">${L('Mode direct','Live mode')}</b><small>${L('Revivre SEN 5-0 IRQ','Relive SEN 5-0 IRQ')}</small></button>
 </div></section>`};

/* ---------- story viewer ---------- */
let STO=null;
A.story=t=>openStory(+t.dataset.i);
function openStory(si,sl){closeStory(true);const s=STORIES[si];if(!s)return;STO={si,sl:sl||0,t0:0,el:null,pause:false,raf:0,el0:performance.now(),acc:0};
 const d=document.createElement('div');d.className='story';d.setAttribute('role','dialog');d.setAttribute('aria-label',tx(s.t));layer.appendChild(d);STO.el=d;renderStory();
 if(!S.seenSt.includes(s.id)){S.seenSt.push(s.id);save();}
 if(!RM)d.animate([{transform:'scale(.9)',opacity:0,borderRadius:'40px'},{transform:'none',opacity:1,borderRadius:'0'}],{duration:340,easing:EASE});step(3);
 const DUR_S=5200;let last=performance.now();
 const loop=ts=>{if(!STO||!STO.el.isConnected)return;const dt=ts-last;last=ts;if(!STO.pause)STO.acc+=dt;const p=Math.min(1,STO.acc/DUR_S);const b=$(`.st-bar:nth-child(${STO.sl+1}) i`,STO.el);if(b)b.style.transform=`scaleX(${p})`;if(p>=1)storyNext();STO&&(STO.raf=requestAnimationFrame(loop));};
 STO.raf=requestAnimationFrame(loop);
 let x0=0,y0=0,t0=0,lp=null;
 d.addEventListener('pointerdown',e=>{if(e.target.closest('button,a'))return;x0=e.clientX;y0=e.clientY;t0=performance.now();lp=setTimeout(()=>{STO.pause=true;d.classList.add('paused');},220);});
 d.addEventListener('pointermove',e=>{if(!t0)return;const dy=e.clientY-y0;if(dy>0){STO.pause=true;d.style.transform=`translateY(${dy*.6}px) scale(${1-dy/2000})`;}});
 d.addEventListener('pointerup',e=>{clearTimeout(lp);if(!t0)return;const dy=e.clientY-y0,dt=performance.now()-t0;t0=0;d.classList.remove('paused');
  if(dy>110){closeStory();return;}d.style.transform='';STO.pause=false;
  if(dt<220&&Math.abs(e.clientX-x0)<14&&Math.abs(dy)<14&&!e.target.closest('button,a')){const r=d.getBoundingClientRect();if(e.clientX-r.left<r.width*.33)storyPrev();else storyNext();}});}
function renderStory(){const s=STORIES[STO.si],c=s.sl[STO.sl];const cr=CREDITS[c.ph];
 STO.el.innerHTML=`<div class="st-bg">${pic(c.ph,{big:1,eager:1})}</div><div class="st-top"><div class="st-bars">${s.sl.map((_,i)=>`<span class="st-bar"><i style="transform:scaleX(${i<STO.sl?1:0})"></i></span>`).join('')}</div><div class="st-h"><span class="st-av">${lionSVG()}</span><b>${esc(tx(s.t))}</b><small>Gaïndé</small><span class="sp"></span><button class="xbtn" type="button" data-act="stClose" aria-label="${L('Fermer','Close')}">${ic('close')}</button></div></div>
 <div class="st-cap"><span class="kick">${esc(tx(c.k))}</span><p>${esc(tx(c.c))}</p>${c.v?`<button class="btn y sm" type="button" data-act="stVideo" data-id="${c.v}">${ic('play')}${L('Regarder sur FSF TV','Watch on FSF TV')}</button>`:''}${cr?`<small class="st-cr">${ic('image')}${esc(cr.a)} · ${esc(cr.l)} · Wikimedia Commons</small>`:''}</div>
 <button class="st-nav l" type="button" data-act="stPrev" aria-label="${L('Précédent','Previous')}"></button><button class="st-nav r" type="button" data-act="stNext" aria-label="${L('Suivant','Next')}"></button>`;
 markImgs(STO.el);const im=$('.st-bg .ph',STO.el);if(im&&!RM)im.animate([{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:5600,easing:'ease-out',fill:'both'});
 $$('[data-act]',STO.el).forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();const f=A[b.dataset.act];f&&f(b,ev);}));}
function storyNext(){if(!STO)return;const s=STORIES[STO.si];if(STO.sl<s.sl.length-1){STO.sl++;STO.acc=0;renderStory();}else if(STO.si<STORIES.length-1){const n=STO.si+1;STO.el.animate([{transform:'none'},{transform:'perspective(900px) rotateY(-80deg) translateX(-30%)',opacity:.3}],{duration:RM?1:300,easing:'ease-in'}).finished.then(()=>openStory(n));}else closeStory();}
function storyPrev(){if(!STO)return;if(STO.sl>0){STO.sl--;STO.acc=0;renderStory();}else if(STO.si>0)openStory(STO.si-1);else{STO.acc=0;}}
function closeStory(instant){if(!STO)return;const d=STO.el;cancelAnimationFrame(STO.raf);STO=null;if(instant||RM){d.remove();}else d.animate([{opacity:1,transform:d.style.transform||'none'},{opacity:0,transform:'translateY(80px) scale(.92)'}],{duration:260,easing:'ease-in'}).finished.then(()=>d.remove());const e=top();if(e&&(e.name==='home'||e.name==='coulisses'))$$('.sr-b',e.el).forEach((b,i)=>b.classList.toggle('seen',S.seenSt.includes(STORIES[i].id)));}
A.stClose=()=>closeStory();A.stNext=()=>storyNext();A.stPrev=()=>storyPrev();
A.stVideo=t=>{const id=t.dataset.id;closeStory(true);go('video',{id});};

/* ---------- video: click-to-load youtube-nocookie embed ---------- */
SCR.videos={title:()=>'FSF TV',render:()=>`<div class="wrap col8 stg" style="margin-top:8px">${VIDEOS.map(v=>`<button class="vrow" type="button" data-act="video" data-id="${v.id}"><span class="vr-th">${pic(v.ph,{alt:''})}<span class="vc-d">${v.d}</span></span><span class="vr-t"><b>${esc(tx(v.t))}</b><small>${esc(tx(v.tag))} · ${fdate(v.at,{day:'numeric',month:'short'})}</small></span></button>`).join('')}</div>`};
SCR.video={solid:1,title:()=>'FSF TV',render:(p)=>{const v=VIDEOS.find(x=>x.id===p.id)||VIDEOS[0];return `
 <div class="yt" id="yt"><div class="yt-poster">${pic(v.ph,{big:1,eager:1,alt:''})}<button class="yt-go" type="button" data-act="ytLoad" data-id="${v.id}"><span class="vc-pl big">${ic('play')}</span><b>${L('Lire la vidéo','Play video')}</b><small>${L('Charge le lecteur YouTube (youtube-nocookie.com)','Loads the YouTube player (youtube-nocookie.com)')}</small></button><span class="vc-d">${v.d}</span></div></div>
 <div class="wrap" style="margin-top:14px"><span class="kick">${esc(tx(v.tag))} · FSF TV · ${fdate(v.at)}</span><h1 class="h2" style="margin:6px 0 10px;font-size:26px">${esc(tx(v.t))}</h1>
 <div style="display:flex;gap:8px;flex-wrap:wrap">${ext('https://www.youtube.com/watch?v='+v.id,`${ic('p_yt')}${L('Ouvrir sur YouTube','Open on YouTube')}`,'btn ghost sm')}${ext('https://www.youtube.com/@fsfofficielle',`${ic('p_yt')}${L('Chaîne FSF TV','FSF TV channel')}`,'btn ghost sm')}</div></div>
 <div class="sec-h" style="margin-top:22px"><h2 class="h3">${L('À suivre','Up next')}</h2></div><div class="wrap col8">${VIDEOS.filter(x=>x.id!==v.id).slice(0,4).map(x=>`<button class="vrow" type="button" data-act="videoRep" data-id="${x.id}"><span class="vr-th">${pic(x.ph,{alt:''})}<span class="vc-d">${x.d}</span></span><span class="vr-t"><b>${esc(tx(x.t))}</b><small>${fdate(x.at,{day:'numeric',month:'short'})}</small></span></button>`).join('')}</div>`;}};
A.videos=()=>go('videos');
A.video=t=>go('video',{id:t.dataset.id});
A.videoRep=t=>replace('video',{id:t.dataset.id});
A.ytLoad=t=>{const id=t.dataset.id;const box=$('#yt',top().el);if(!box)return;box.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1" title="FSF TV" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;box.classList.add('on');step(3);buzz(6);};
