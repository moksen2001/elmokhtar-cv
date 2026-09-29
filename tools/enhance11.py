#!/usr/bin/env python3
"""ENH11 - section layouts chosen by El Mokhtar (29/09/2026):
  2C  "L'essentiel en 30 s": 3 numbered key points + facts band
  4C  Projects: animated showcase (list + live preview, auto-advance) on desktop;
      phones keep the swipe carousel from ENH10
  7B  Skills: category tabs + "where I used them" panel (replaces cards + map)
  8   Contact: mix of the dark rows (A) and the big centred call (B)
Idempotent (own markers stripped then re-injected). Runs after enhance10.
"""
import re, json

USED = {
 "fr": {"title": "Où je les ai utilisées", "items": [
   [["Backlog Build & Run, ateliers de cadrage", "Servier"], ["User Stories, recette, priorisation", "Société Générale CIB"],
    ["Équipe Scrum de 14 personnes, 50+ rituels", "Banque de France"], ["Certifié PSPO I", "Scrum.org"]],
   [["Agent IA Lettres de Crédit, finaliste GBIS", "Société Générale CIB"], ["Prompts Copilot adoptés sur 3 sites", "Société Générale CIB"],
    ["Agent IA de la plateforme FederateS", "Servier"], ["Reporting automatisé : −30 % de temps", "Société Générale CIB"]],
   [["Portail Case Management : 10 écrans Figma", "Banque de France"], ["Yema Watch Club : 39 écrans", "MBA ESG"],
    ["Prototype Baykat repensé", "Groupe ISM"], ["Webdesign UI/UX : 19,5/20", "MBA ESG"]],
   [["Jira et Confluence", "Servier · Banque de France"], ["PEGA, portail Case Management", "Banque de France"]],
   [["Focal-Shift : PHP/MySQL et API REST en 3 jours", "MBA ESG"], ["Ce site : HTML/CSS, Git", "Projet personnel"],
    ["Algorithmique avec Python : 18,7/20", "MBA ESG"]],
   [["Projets multimédia pour Orange, Auchan, Mazars, Heetch et Free : +30 % d'engagement", "Socium"],
    ["Communication digitale, 5 000+ étudiants touchés", "Groupe ISM"]]]},
 "en": {"title": "Where I used them", "items": [
   [["Build & Run backlog, scoping workshops", "Servier"], ["User Stories, acceptance testing, prioritisation", "Société Générale CIB"],
    ["14-person Scrum team, 50+ ceremonies", "Banque de France"], ["PSPO I certified", "Scrum.org"]],
   [["AI agent for Letters of Credit, GBIS finalist", "Société Générale CIB"], ["Copilot prompts adopted across 3 sites", "Société Générale CIB"],
    ["AI agent of the FederateS platform", "Servier"], ["Automated reporting: −30% processing time", "Société Générale CIB"]],
   [["Case Management portal: 10 Figma screens", "Banque de France"], ["Yema Watch Club: 39 screens", "MBA ESG"],
    ["Baykat prototype redesign", "Groupe ISM"], ["UI/UX web design: 19.5/20", "MBA ESG"]],
   [["Jira and Confluence", "Servier · Banque de France"], ["PEGA, Case Management portal", "Banque de France"]],
   [["Focal-Shift: PHP/MySQL and REST API in 3 days", "MBA ESG"], ["This site: HTML/CSS, Git", "Personal project"],
    ["Algorithms with Python: 18.7/20", "MBA ESG"]],
   [["Multimedia projects for Orange, Auchan, Mazars, Heetch and Free: +30% engagement", "Socium"],
    ["Digital communication, 5,000+ students reached", "Groupe ISM"]]]},
}
UI = {"fr": {"see": "Voir le projet", "demo": "Tester la démo", "pause": "Pause", "play": "Lecture"},
      "en": {"see": "View project", "demo": "Try the demo", "pause": "Pause", "play": "Play"}}

CSS = r"""<style id="enh11">
/* ==== ENH11 ==== */
/* --- 2C: 3 numbered key points + facts band --- */
#profil .brief{display:flex;flex-direction:column-reverse;gap:30px}
#profil .ways{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid var(--line);counter-reset:w}
#profil .way{background:none;border:0;border-radius:0;box-shadow:none;border-right:1px solid var(--line);padding:26px 28px 6px 0;margin-right:28px;display:block;counter-increment:w}
#profil .way:nth-of-type(3){border-right:0;margin-right:0;padding-right:0}
#profil .way .ic{display:none}
#profil .way::before{content:counter(w,decimal-leading-zero);display:block;font:200 3.4rem/1 var(--display);color:var(--teal);letter-spacing:-.04em}
#profil .way h3{font-weight:500;font-size:1.28rem;margin-top:14px;line-height:1.25}
#profil .way p{margin-top:10px;color:var(--ink-2);font-size:.95rem;line-height:1.6}
#profil .conv{grid-column:1/-1;margin-top:26px;text-align:center;border:0;padding:0;background:none!important;color:var(--ink)!important;box-shadow:none}
#profil .conv::before,#profil .conv::after{display:none}
#profil .conv p{font:300 1.2rem/1.5 var(--display);max-width:62ch;margin-inline:auto}
#profil .conv cite{display:block;margin-top:8px;color:var(--muted);font-size:.88rem;font-style:normal}
#profil .facts{display:grid;grid-template-columns:repeat(3,1fr);padding:0;overflow:hidden}
#profil .fact{display:block;padding:16px 20px;border-bottom:1px solid var(--line);border-right:1px solid var(--line)}
#profil .fact:nth-child(3n){border-right:0}
#profil .fact:nth-last-child(-n+3){border-bottom:0}
#profil .fact dt{padding:0}
#profil .fact dd{font-size:.95rem;font-weight:500;margin-top:4px}
#profil .fact dd small{font-weight:400}
@media (max-width:760px){
  #profil .ways{grid-template-columns:1fr}
  #profil .way{border-right:0;margin-right:0;padding:22px 0 18px;border-bottom:1px solid var(--line)}
  #profil .way::before{font-size:2.6rem}
  #profil .facts{grid-template-columns:1fr 1fr}
  #profil .fact:nth-child(3n){border-right:1px solid var(--line)}
  #profil .fact:nth-child(2n){border-right:0}
  #profil .fact:nth-last-child(-n+3){border-bottom:1px solid var(--line)}
  #profil .fact:nth-last-child(-n+2){border-bottom:0}
}

/* --- 4C: animated showcase --- */
.sc{display:none}
@media (min-width:761px){
  .has-sc .projects{display:none}
  .sc{display:grid;grid-template-columns:minmax(300px,380px) 1fr;gap:22px;align-items:stretch}
  .sc-list{display:flex;flex-direction:column;gap:6px}
  .sc-it{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:34px 1fr;gap:4px 12px;padding:14px 16px 12px;border-radius:14px;border:1px solid transparent;position:relative;transition:background .35s,border-color .35s,transform .35s}
  .sc-it .n{font:300 .9rem/1.4 var(--display);color:var(--muted);padding-top:3px;font-variant-numeric:tabular-nums}
  .sc-it b{font:500 1.08rem/1.25 var(--display);color:var(--ink-2);display:block;transition:color .3s}
  .sc-it small{display:block;color:var(--muted);font-size:.8rem;margin-top:2px}
  .sc-it .bar{grid-column:1/-1;height:2px;border-radius:2px;background:transparent;overflow:hidden;margin-top:8px}
  .sc-it .bar i{display:block;height:100%;width:100%;background:var(--teal);transform:scaleX(0);transform-origin:0 50%}
  .sc-it:hover{transform:translateX(4px)}
  .sc-it:hover b{color:var(--ink)}
  .sc-it.on{background:var(--surface);border-color:var(--line)}
  .sc-it.on .n{color:var(--teal)}
  .sc-it.on b{color:var(--ink)}
  .sc-it.on .bar{background:var(--line)}
  .sc.run .sc-it.on .bar i{animation:scbar var(--dur,6.5s) linear forwards}
  .sc.paused .sc-it.on .bar i{animation-play-state:paused}
  @keyframes scbar{to{transform:scaleX(1)}}
  .sc-stage{position:relative;min-height:540px;overflow:hidden;border-radius:22px;background:var(--surface);border:1px solid var(--line);isolation:isolate}
  .sc-m{position:absolute;inset:0;opacity:0;transform:scale(1.08);transition:opacity .9s ease,transform 1.4s cubic-bezier(.2,.8,.2,1)}
  .sc-m.on{opacity:1;transform:scale(1)}
  .sc-m img{width:100%;height:100%;object-fit:cover;object-position:50% 30%}
  .sc-m.on img{animation:kb 12s ease-out both}
  @keyframes kb{from{transform:scale(1) translateY(0)}to{transform:scale(1.07) translateY(-2%)}}
  .sc-m .vis{height:100%;aspect-ratio:auto!important}
  .sc-m .vis .demo-b{display:none}
  .sc-stage::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,transparent 38%,rgba(6,12,24,.55) 64%,rgba(6,12,24,.92) 100%)}
  .sc-cap{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:26px 30px 28px;color:#fff}
  .sc-cap .k{display:flex;gap:10px;align-items:center;font-size:.82rem;color:rgba(255,255,255,.72)}
  .sc-cap .k .ct{font-variant-numeric:tabular-nums;color:#fff;font-weight:600}
  .sc-cap h3{font:500 clamp(1.6rem,2.6vw,2.2rem)/1.12 var(--display);letter-spacing:-.025em;margin-top:8px;color:#fff}
  .sc-cap p{margin-top:8px;color:rgba(255,255,255,.82);max-width:60ch;font-size:.97rem}
  .sc-cap .acts{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px;align-items:center}
  .sc-cap .aw{font-size:.78rem;font-weight:600;padding:5px 10px;border-radius:999px;background:rgba(255,255,255,.14);color:#fff;backdrop-filter:blur(6px)}
  .sc-cap .btn{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3);color:#fff}
  .sc-cap .btn.primary{background:#fff;border-color:#fff;color:#0A1528}
  .sc-cap .in{animation:capin .7s cubic-bezier(.2,.8,.2,1) both}
  .sc-cap .in:nth-child(2){animation-delay:.06s}.sc-cap .in:nth-child(3){animation-delay:.12s}.sc-cap .in:nth-child(4){animation-delay:.18s}
  @keyframes capin{from{opacity:0;transform:translateY(16px)}}
  .sc-nav{position:absolute;top:18px;right:18px;z-index:3;display:flex;gap:8px}
  .sc-nav button{all:unset;cursor:pointer;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:#fff;background:rgba(6,12,24,.45);border:1px solid rgba(255,255,255,.22);backdrop-filter:blur(8px);transition:background .2s}
  .sc-nav button:hover{background:rgba(6,12,24,.7)}
  .sc-nav svg{width:17px;height:17px}
}
@media (prefers-reduced-motion:reduce){.sc-m,.sc-m img,.sc-cap .in{animation:none!important;transition:none!important}}

/* --- 7B: skills tabs + where used --- */
.has-tabs .skills,.has-tabs .cst{display:none!important}
.skt{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.skt button{all:unset;cursor:pointer;padding:10px 16px;border-radius:999px;border:1px solid var(--line);font-size:.92rem;color:var(--ink-2);transition:background .25s,color .25s,border-color .25s}
.skt button:hover{border-color:var(--ink-2);color:var(--ink)}
.skt button.on{background:var(--ink);color:var(--bg);border-color:var(--ink);font-weight:600}
.skp{margin-top:18px;padding:28px 30px;display:grid;grid-template-columns:1fr 1fr;gap:34px}
.skp .chips span{font-size:.92rem;padding:8px 13px}
.skp .lbl2{display:block;color:var(--muted);font-size:.82rem;font-weight:500;margin-bottom:12px}
.sku{border-left:1px solid var(--line);padding-left:30px}
.sku div{display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid var(--line);font-size:.93rem}
.sku div:last-child{border-bottom:0}
.sku div b{font-weight:500}.sku div span{color:var(--muted);text-align:right;flex:none;max-width:45%}
.skp .anim{animation:capin .5s cubic-bezier(.2,.8,.2,1) both}
@media (max-width:760px){
  .skt{flex-wrap:nowrap;overflow-x:auto;margin-inline:-20px;padding:0 20px 4px;scrollbar-width:none}
  .skt::-webkit-scrollbar{display:none}
  .skt button{flex:none}
  .skp{grid-template-columns:1fr;padding:20px;gap:22px}
  .sku{border-left:0;padding-left:0;border-top:1px solid var(--line);padding-top:16px}
}

/* --- 8: contact, mix of A (rows) and B (big centred call) --- */
.contact{grid-template-columns:1fr!important;justify-items:center;text-align:center;
  background:linear-gradient(160deg,#15315E 0%,#0F1D35 55%,#0B1730 100%)!important;color:#EEF2F8!important;border:1px solid #1E2E4C;
  --bg:#FFFFFF;--ink:#0A1528;padding:clamp(34px,6vw,72px) clamp(20px,5vw,64px) clamp(28px,5vw,56px)!important}
.contact .eyebrow{color:#8FB3F0!important;justify-content:center}
.contact h2{font-weight:200!important;font-size:clamp(2.4rem,5.4vw,4rem)!important;letter-spacing:-.04em!important;color:#fff}
.contact>div:first-child p{margin-inline:auto;color:#C3CDDD;opacity:1}
.chan{width:100%;max-width:1000px;grid-template-columns:repeat(4,1fr);gap:12px;text-align:left}
.chan .row{color:#EEF2F8}
.chan .row:first-child{grid-column:1/-1;flex-direction:column;gap:16px;background:none;border:0;padding:8px 0 22px;text-align:center}
.chan .row:first-child small{display:none}
.chan .row:first-child b{font:200 clamp(1.5rem,3.4vw,2.5rem)/1.2 var(--display)!important;letter-spacing:-.02em;user-select:all}
.chan .row:first-child b a{text-decoration:none;color:#fff}
.chan .row:first-child .acts{justify-content:center;gap:10px}
.chan .row:first-child .acts>*{font-size:.92rem!important;padding:11px 20px!important;border-radius:999px!important}
.chan .row:not(:first-child){flex-direction:column;align-items:flex-start;gap:12px;padding:16px 16px 14px}
.chan .row:not(:first-child) .t{width:100%}
.chan .row:not(:first-child) b{font-size:.9rem}
.chan .row button,.chan .row a.go,.chan .row .dl>summary.go{border-radius:999px!important}
.chan .row a.go.mail{background:#fff!important;color:#0A1528!important}
.chan .row:first-child .acts button{background:transparent!important;color:#fff!important;border:1px solid rgba(255,255,255,.35)!important}
@media (max-width:760px){.chan{grid-template-columns:1fr 1fr}}
</style>"""

JS = r"""<script id="enh11">(function(){
var L=(document.documentElement.lang||'fr').slice(0,2)==='en'?'en':'fr', UIT=%(ui)s[L], USED=%(used)s[L];
var PRE=L==='en'?'../':'';
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ---------- 4C showcase ---------- */
(function(){
  var sec=document.getElementById('projets'), grid=sec&&sec.querySelector('.projects'); if(!grid) return;
  var cards=[].slice.call(grid.querySelectorAll('.proj')); if(!cards.length) return;
  var MEDIA={'p-agent':'img/preview/agent.jpg','p-focal':'img/preview/focal.jpg','p-baykat':'img/preview/baykat.jpg','p-jubox':'img/preview/jubox.jpg','p-yema':'img/preview/yema.jpg','p-veille':'img/preview/veille.jpg'};
  var sc=document.createElement('div'); sc.className='sc run';
  var list=document.createElement('div'); list.className='sc-list';
  var stage=document.createElement('div'); stage.className='sc-stage';
  var cap=document.createElement('div'); cap.className='sc-cap';
  var nav=document.createElement('div'); nav.className='sc-nav';
  nav.innerHTML='<button type="button" data-d="-1" aria-label="Précédent"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button><button type="button" data-d="1" aria-label="Suivant"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>';
  var items=[], medias=[], data=[];
  cards.forEach(function(c,i){
    var id=c.getAttribute('data-p');
    var t=(c.querySelector('h3')||{}).textContent||'', ctx=(c.querySelector('.ctx2')||{}).textContent||'';
    var p=(c.querySelector('.pb p')||{}).textContent||'', aw=(c.querySelector('.award')||{}).textContent||'';
    var demo=document.querySelector('#'+id+' .demo-cta a');
    data.push({id:id,t:t,ctx:ctx,p:p,aw:aw,demo:demo?demo.getAttribute('href'):null,card:c});
    var it=document.createElement('button'); it.type='button'; it.className='sc-it';
    it.innerHTML='<span class="n">'+String(i+1).padStart(2,'0')+'</span><span><b></b><small></small></span><span class="bar"><i></i></span>';
    it.querySelector('b').textContent=t; it.querySelector('small').textContent=ctx;
    it.addEventListener('click',function(){ if(it.classList.contains('on')) c.click(); else go(i,true); });
    list.appendChild(it); items.push(it);
    var m=document.createElement('div'); m.className='sc-m';
    if(MEDIA[id]){ var im=document.createElement('img'); im.src=PRE+MEDIA[id]; im.alt=''; im.loading='lazy'; m.appendChild(im); }
    else { var v=c.querySelector('.vis'); if(v){ var cl=v.cloneNode(true); m.appendChild(cl); var ci=cl.querySelector('img'); if(ci){ ci.removeAttribute('loading'); } } }
    stage.appendChild(m); medias.push(m);
  });
  stage.appendChild(cap); stage.appendChild(nav);
  sc.appendChild(list); sc.appendChild(stage);
  grid.parentNode.insertBefore(sc,grid.nextSibling); sec.classList.add('has-sc');
  var cur=-1, timer=null, DUR=6500, paused=false, visible=false;
  function render(i){
    var d=data[i];
    cap.innerHTML='<div class="k in"><span class="ct">'+String(i+1).padStart(2,'0')+' / '+String(data.length).padStart(2,'0')+'</span><span></span></div><h3 class="in"></h3><p class="in"></p><div class="acts in"></div>';
    cap.querySelector('.k span:last-child').textContent=d.ctx; cap.querySelector('h3').textContent=d.t; cap.querySelector('p').textContent=d.p;
    var a=cap.querySelector('.acts');
    var b1=document.createElement('button'); b1.type='button'; b1.className='btn primary'; b1.textContent=UIT.see+' →'; b1.addEventListener('click',function(){ d.card.click(); }); a.appendChild(b1);
    if(d.demo){ var b2=document.createElement('a'); b2.className='btn'; b2.href=d.demo; b2.target='_blank'; b2.rel='noopener'; b2.textContent=UIT.demo+' ↗'; a.appendChild(b2); }
    if(d.aw){ var s=document.createElement('span'); s.className='aw'; s.textContent=d.aw; a.appendChild(s); }
  }
  function go(i,user){
    i=(i+data.length)%%data.length; if(i===cur) return;
    items.forEach(function(it,k){ it.classList.toggle('on',k===i); it.setAttribute('aria-pressed',k===i); });
    medias.forEach(function(m,k){ m.classList.toggle('on',k===i); if(k===i){ var im=m.querySelector('img'); if(im){ im.style.animation='none'; void im.offsetWidth; im.style.animation=''; } } });
    var bar=items[i].querySelector('.bar i'); bar.style.animation='none'; void bar.offsetWidth; bar.style.animation='';
    cur=i; render(i); schedule();
  }
  function schedule(){ clearTimeout(timer); if(reduce||paused||!visible) return; timer=setTimeout(function(){ go(cur+1); },DUR); }
  sc.style.setProperty('--dur',DUR/1000+'s');
  sc.addEventListener('mouseenter',function(){ paused=true; sc.classList.add('paused'); clearTimeout(timer); });
  sc.addEventListener('mouseleave',function(){ paused=false; sc.classList.remove('paused'); go(cur+1); });
  nav.addEventListener('click',function(e){ var b=e.target.closest('button'); if(b) go(cur+parseInt(b.dataset.d,10),true); });
  sc.addEventListener('keydown',function(e){ if(e.key==='ArrowDown'||e.key==='ArrowRight'){ e.preventDefault(); go(cur+1,true); items[cur].focus(); } if(e.key==='ArrowUp'||e.key==='ArrowLeft'){ e.preventDefault(); go(cur-1,true); items[cur].focus(); } });
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ visible=es[0].isIntersecting; if(visible){ sc.classList.add('run'); schedule(); } else clearTimeout(timer); },{threshold:.35}).observe(sc); } else visible=true;
  go(0);
})();
/* ---------- 7B skills tabs ---------- */
(function(){
  var sec=document.getElementById('competences'), grid=sec&&sec.querySelector('.skills'); if(!grid) return;
  var cats=[].slice.call(grid.querySelectorAll('.sk')); if(!cats.length) return;
  var tabs=document.createElement('div'); tabs.className='skt'; tabs.setAttribute('role','tablist');
  var pan=document.createElement('div'); pan.className='card skp'; pan.setAttribute('role','tabpanel');
  cats.forEach(function(c,i){
    var b=document.createElement('button'); b.type='button'; b.setAttribute('role','tab'); b.textContent=(c.querySelector('h3')||{}).textContent||('#'+(i+1));
    b.addEventListener('click',function(){ show(i); }); tabs.appendChild(b);
  });
  function show(i){
    [].forEach.call(tabs.children,function(b,k){ b.classList.toggle('on',k===i); b.setAttribute('aria-selected',k===i); });
    var ch=cats[i].querySelector('.chips'); var used=USED.items[i]||[];
    pan.innerHTML='<div class="anim"><span class="lbl2"></span><div class="chips"></div></div><div class="sku anim"><span class="lbl2"></span></div>';
    pan.querySelector('.lbl2').textContent=(cats[i].querySelector('h3')||{}).textContent||'';
    pan.querySelector('.chips').innerHTML=ch?ch.innerHTML:'';
    var u=pan.querySelector('.sku'); u.querySelector('.lbl2').textContent=USED.title;
    used.forEach(function(x){ var r=document.createElement('div'); var bb=document.createElement('b'); bb.textContent=x[0]; var ss=document.createElement('span'); ss.textContent=x[1]; r.appendChild(bb); r.appendChild(ss); u.appendChild(r); });
    if(!used.length) u.style.display='none';
  }
  grid.parentNode.insertBefore(tabs,grid); grid.parentNode.insertBefore(pan,grid);
  sec.classList.add('has-tabs'); show(0);
})();
})();</script>"""


def run(path):
    s = open(path, encoding="utf-8").read()
    s = re.sub(r'\s*<style id="enh11">.*?</style>', "", s, flags=re.S)
    s = re.sub(r'<script id="enh11">.*?</script>\n?', "", s, flags=re.S)
    i = s.index("</head>"); s = s[:i] + CSS + "\n" + s[i:]
    js = JS % {"ui": json.dumps(UI, ensure_ascii=False), "used": json.dumps(USED, ensure_ascii=False)}
    i = s.rindex("</body>"); s = s[:i] + js + "\n" + s[i:]
    open(path, "w", encoding="utf-8").write(s)


for p in ("index.html", "en/index.html"):
    run(p)
print("enhance11: section layouts applied")
