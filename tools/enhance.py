# Injects: skills constellation (5), drawn timeline + company badges (6), finishing touches (8).
# Idempotent: strips any previous injection between markers before re-inserting.
import re, sys, json

EXPS = [  # id, FR label, EN label, FR sub, EN sub
  ("sv",  "Servier",           "Servier",           "R&D pharma · 2026–27",      "Pharma R&D · 2026–27"),
  ("sg",  "Société Générale CIB","Société Générale CIB","Trade Finance · 2025–26","Trade Finance · 2025–26"),
  ("bdf", "Banque de France",  "Banque de France",  "DGSI · 2025",               "IT Dept · 2025"),
  ("so",  "Socium",            "Socium",            "Startup RH · 2022–23",      "HR tech startup · 2022–23"),
  ("ism", "Groupe ISM",        "Groupe ISM",        "Soft Skills Academy · 2021–23","Soft Skills Academy · 2021–23"),
  ("pr",  "Projets d'études",  "Academic projects", "Focal-Shift · Yema",        "Focal-Shift · Yema"),
]
SKILLS = [  # FR, EN, linked experiences
  ("Backlog & User Stories", "Backlog & User Stories", ["sv","sg","bdf"]),
  ("Scrum / Agile",          "Scrum / Agile",          ["sv","sg","bdf"]),
  ("Recette / UAT",          "Acceptance testing / UAT",["sv","sg","bdf"]),
  ("Ateliers de cadrage",    "Scoping workshops",      ["sv","bdf","pr"]),
  ("Adoption & conduite du changement","Adoption & change management",["sv","sg"]),
  ("Copilot & IA générative","Copilot & generative AI",["sg","pr"]),
  ("Agent IA",               "AI agent",               ["sg"]),
  ("Power Automate",         "Power Automate",         ["sg"]),
  ("Power Query / Excel",    "Power Query / Excel",    ["sg"]),
  ("PEGA",                   "PEGA",                   ["bdf"]),
  ("Jira / Confluence",      "Jira / Confluence",      ["sv","bdf","pr"]),
  ("Figma & UX/UI",          "Figma & UX/UI",          ["bdf","pr"]),
  ("PHP / MySQL / API",      "PHP / MySQL / API",      ["pr"]),
  ("Gestion de projet multimédia","Multimedia project management",["so","ism"]),
  ("Communication digitale", "Digital communication",  ["so","ism"]),
]
TXT = {
 'fr': dict(eyebrow="Compétences × expériences", h="Où je les ai utilisées",
            p="Survolez ou touchez une compétence pour voir dans quelles expériences je l'ai mise en pratique, ou l'inverse.",
            hint="Démo automatique · touchez pour explorer", aria="Carte interactive des compétences et des expériences"),
 'en': dict(eyebrow="Skills × experience", h="Where I have used them",
            p="Hover or tap a skill to see which roles I applied it in, or tap a role to see its skills.",
            hint="Auto demo · tap to explore", aria="Interactive map of skills and experience"),
}

CSS = r"""
/* ==== ENH: constellation ==== */
.cst{margin-top:28px;padding:26px 26px 22px;position:relative;overflow:hidden}
.cst-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:10px 24px;margin-bottom:22px}
.cst-top h3{font-size:1.35rem;font-weight:700;margin-top:6px}
.cst-top p{color:var(--ink-2);font-size:.95rem;max-width:52ch}
.cst-hint{font-family:var(--mono);font-size:.72rem;color:var(--muted);display:flex;align-items:center;gap:8px;white-space:nowrap}
.cst-hint i{width:7px;height:7px;border-radius:50%;background:var(--sun);animation:cstblink 1.6s ease-in-out infinite}
.cst.manual .cst-hint{opacity:0;transition:opacity .4s}
@keyframes cstblink{50%{opacity:.25}}
.cst-grid{display:grid;grid-template-columns:minmax(150px,230px) minmax(60px,1fr) minmax(170px,300px);position:relative}
.cst-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.cst-svg path{fill:none;stroke:var(--line);stroke-width:1.3;transition:stroke .35s,stroke-width .35s,opacity .35s;opacity:.9}
.cst.sel .cst-svg path{opacity:.35}
.cst.sel .cst-svg path.on{opacity:1}
.cst-svg path.on{stroke:var(--teal);stroke-width:2.2;opacity:1;stroke-dasharray:var(--len);stroke-dashoffset:var(--len);animation:cstdraw .7s cubic-bezier(.3,.7,.2,1) forwards}
@keyframes cstdraw{to{stroke-dashoffset:0}}
.cst-col{display:flex;flex-direction:column;gap:8px;position:relative;z-index:1}
.cst-col.ex{justify-content:space-around}
.cst-col.sk{grid-column:3}
.cst-n{all:unset;box-sizing:border-box;cursor:pointer;border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:9px 12px;transition:border-color .3s,background .3s,transform .3s cubic-bezier(.3,1.6,.5,1),opacity .3s,box-shadow .3s;-webkit-tap-highlight-color:transparent}
.cst-n:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.cst-n b{display:block;font-weight:600;font-size:.93rem;line-height:1.2}
.cst-n small{display:block;font-family:var(--mono);font-size:.68rem;color:var(--muted);margin-top:3px}
.cst-col.sk .cst-n{border-radius:999px;padding:6px 13px;font-size:.86rem;align-self:flex-start}
.cst.sel .cst-n{opacity:.45}
.cst.sel .cst-n.on{opacity:1;border-color:var(--teal);background:var(--teal-soft);transform:scale(1.04);box-shadow:0 6px 18px -10px var(--teal)}
.cst.sel .cst-n.src{background:var(--teal);color:var(--on-teal);border-color:var(--teal)}
.cst.sel .cst-n.src small{color:inherit;opacity:.8}
@media (max-width:640px){
  .cst{padding:20px 14px 16px}
  .cst-grid{grid-template-columns:118px minmax(26px,1fr) minmax(0,190px)}
  .cst-n{padding:7px 9px}.cst-n b{font-size:.8rem}.cst-n small{display:none}
  .cst-col.sk .cst-n{font-size:.74rem;padding:5px 10px;line-height:1.25}
  .cst-top h3{font-size:1.15rem}
  .cst-col{gap:6px}
}
/* ==== ENH: timeline badges + head ==== */
.co{display:inline-grid;place-items:center;min-width:46px;height:46px;padding:0 8px;margin-top:12px;border-radius:14px;background:var(--surface);border:1px solid var(--line);font-family:var(--display);font-weight:800;font-size:.95rem;letter-spacing:-.02em;color:var(--teal);box-shadow:var(--shadow);transform:scale(.4) rotate(-12deg);opacity:0;transition:transform .6s cubic-bezier(.3,1.7,.5,1),opacity .4s,background .4s,color .4s}
.rel.current .co{color:var(--sun)}
.rel.lit .co{transform:none;opacity:1}
.xp-head{position:absolute;left:173px;top:32px;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:var(--sun);box-shadow:0 0 0 6px color-mix(in srgb,var(--sun) 22%,transparent),0 0 22px var(--sun);z-index:2;pointer-events:none;opacity:0;transition:opacity .3s}
.xp-head.on{opacity:1}
.rel .body{clip-path:inset(-50px -50px -50px -50px);transition:border-color .25s,box-shadow .25s,clip-path 1.1s cubic-bezier(.2,.8,.2,1)}
.rel.pre .body{clip-path:inset(0 100% 0 -50px)}
.rel .ring{position:absolute;left:-24px;top:25px;width:21px;height:21px;border-radius:50%;border:2px solid var(--teal);opacity:0;pointer-events:none}
.rel.lit .ring{animation:ring 1.2s ease-out 1 forwards}
.rel.current .ring{border-color:var(--sun)}
@keyframes ring{from{transform:scale(.4);opacity:1}to{transform:scale(2.2);opacity:0}}
@media (max-width:760px){
  .xp-head{left:5px;top:8px}
  .co{min-width:34px;height:30px;margin-top:0;border-radius:9px;font-size:.75rem;box-shadow:none}
  .rel .ring{left:-29px;top:-27px}
}
/* ==== ENH: finishing touches ==== */
.head h2 .w{display:inline-block;transition:transform .9s cubic-bezier(.2,.8,.2,1),opacity .9s,filter .9s;transition-delay:calc(var(--wi,0)*55ms + 80ms)}
.head.pre h2 .w{transform:translateY(55%) rotate(2deg);opacity:0;filter:blur(6px)}
.proj .vis img{transform:translate3d(0,var(--py,0px),0) scale(var(--ps,1.12));transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.proj:hover .vis img{--ps:1.17}
.cur{position:fixed;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:1.5px solid var(--teal);pointer-events:none;z-index:200;opacity:0;transition:width .3s,height .3s,margin .3s,background .3s,border-color .3s,opacity .3s;mix-blend-mode:normal}
.cur.on{opacity:.9}
.cur.big{width:64px;height:64px;margin:-32px 0 0 -32px;background:color-mix(in srgb,var(--teal) 12%,transparent);border-color:transparent}
.cur.down{width:24px;height:24px;margin:-12px 0 0 -12px}
.cur-dot{position:fixed;left:0;top:0;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:var(--sun);pointer-events:none;z-index:201;opacity:0;transition:opacity .3s}
.cur-dot.on{opacity:1}
.mag{transition:transform .35s cubic-bezier(.3,1.6,.5,1)}
@media (prefers-reduced-motion:reduce){
  .co,.rel.pre .body,.head.pre h2 .w{transform:none!important;opacity:1!important;clip-path:none!important;filter:none!important}
  .cst-svg path.on{animation:none;stroke-dashoffset:0}
  .rel .ring{display:none}
}
"""

JS = r"""
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* --- (6) timeline: company badges + travelling head --- */
  var MONO={"Servier":"SV","Société Générale CIB":"SG","Banque de France":"BdF","Socium":"So","Groupe ISM":"ISM"};
  document.querySelectorAll('.rel').forEach(function(r){
    var a=r.querySelector('.org a, .org b'), w=r.querySelector('.when');
    if(!a||!w) return; var t=a.textContent.trim();
    var m=MONO[t]||t.split(/\s+/).map(function(x){return x[0]}).join('').slice(0,3);
    var rg=document.createElement('span'); rg.className='ring'; rg.setAttribute('aria-hidden','true'); var bd=r.querySelector('.body'); if(bd) bd.appendChild(rg);
    var s=document.createElement('span'); s.className='co'; s.textContent=m; s.setAttribute('aria-hidden','true'); w.appendChild(s);
  });
  var xp=document.querySelector('.xp'), fill=document.querySelector('.xp-fill'), head=null;
  if(xp&&fill&&!reduce){ head=document.createElement('div'); head.className='xp-head'; xp.appendChild(head); }

  /* --- (8) project image parallax + head position, one rAF --- */
  var imgs=[].slice.call(document.querySelectorAll('.proj .vis img'));
  var tick=false;
  function frame(){
    tick=false; var vh=innerHeight;
    if(head){
      var r=xp.getBoundingClientRect(), p=Math.max(0,Math.min(1,(vh*0.6-r.top)/Math.max(1,r.height)));
      var fr=fill.getBoundingClientRect(), xr=xp.getBoundingClientRect();
      head.style.transform='translateY('+(fr.bottom-xr.top-parseFloat(getComputedStyle(fill).top))+'px)';
      head.classList.toggle('on',p>0.01&&p<0.995);
    }
    if(!reduce) imgs.forEach(function(im){
      var b=im.parentNode.getBoundingClientRect(); if(b.bottom<0||b.top>vh) return;
      var c=(b.top+b.height/2-vh/2)/vh; im.style.setProperty('--py',(c*-22).toFixed(1)+'px');
    });
  }
  function on(){ if(!tick){tick=true;requestAnimationFrame(frame);} }
  addEventListener('scroll',on,{passive:true}); addEventListener('resize',on,{passive:true}); frame();

  /* --- (8) section titles: word-by-word reveal --- */
  if(!reduce) document.querySelectorAll('.head h2').forEach(function(h){
    if(h.dataset.split) return; h.dataset.split=1; var i=0;
    (function walk(n){ [].slice.call(n.childNodes).forEach(function(c){
      if(c.nodeType===3){ var f=document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(function(p){ if(!p) return; if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(p));return;}
          var s=document.createElement('span'); s.className='w'; s.style.setProperty('--wi',i++); s.textContent=p; f.appendChild(s); });
        c.parentNode.replaceChild(f,c);
      } else if(c.nodeType===1&&c.tagName!=='BR') walk(c); }); })(h);
  });

  /* --- (8) cursor + magnetic buttons (desktop) --- */
  if(fine&&!reduce){
    var cur=document.createElement('div'); cur.className='cur'; var dot=document.createElement('div'); dot.className='cur-dot';
    document.body.appendChild(cur); document.body.appendChild(dot);
    var mx=-100,my=-100,cx=-100,cy=-100,run=false;
    function loop(){ cx+=(mx-cx)*.2; cy+=(my-cy)*.2; cur.style.transform='translate3d('+cx+'px,'+cy+'px,0)';
      if(Math.abs(mx-cx)+Math.abs(my-cy)>.3) requestAnimationFrame(loop); else run=false; }
    document.addEventListener('pointermove',function(e){ mx=e.clientX; my=e.clientY; dot.style.transform='translate3d('+mx+'px,'+my+'px,0)';
      cur.classList.add('on'); dot.classList.add('on');
      var t=e.target.closest&&e.target.closest('a,button,.proj,[data-img],.cst-n,summary');
      cur.classList.toggle('big',!!t); if(!run){run=true;requestAnimationFrame(loop);} },{passive:true});
    document.addEventListener('pointerleave',function(){cur.classList.remove('on');dot.classList.remove('on');});
    document.addEventListener('pointerdown',function(){cur.classList.add('down')}); document.addEventListener('pointerup',function(){cur.classList.remove('down')});
    document.querySelectorAll('.hero .btn, .contact .btn').forEach(function(b){
      b.classList.add('mag');
      b.addEventListener('pointermove',function(e){ var r=b.getBoundingClientRect(); b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.28)+'px)'; });
      b.addEventListener('pointerleave',function(){ b.style.transform=''; });
    });
  }

  /* --- (5) skills constellation --- */
  var box=document.querySelector('.cst'); if(!box) return;
  var svg=box.querySelector('.cst-svg'), grid=box.querySelector('.cst-grid');
  var exps=[].slice.call(box.querySelectorAll('.cst-col.ex .cst-n')), sks=[].slice.call(box.querySelectorAll('.cst-col.sk .cst-n'));
  var paths=[];
  function draw(){
    var g=grid.getBoundingClientRect(); svg.setAttribute('viewBox','0 0 '+g.width+' '+g.height);
    svg.innerHTML=''; paths=[];
    sks.forEach(function(s){ var sr=s.getBoundingClientRect(); (s.dataset.x||'').split(' ').forEach(function(id){
      var e=box.querySelector('.cst-n[data-id="'+id+'"]'); if(!e) return; var er=e.getBoundingClientRect();
      var x1=er.right-g.left, y1=er.top+er.height/2-g.top, x2=sr.left-g.left, y2=sr.top+sr.height/2-g.top, dx=(x2-x1)*.55;
      var p=document.createElementNS('http://www.w3.org/2000/svg','path');
      p.setAttribute('d','M'+x1+','+y1+' C'+(x1+dx)+','+y1+' '+(x2-dx)+','+y2+' '+x2+','+y2);
      svg.appendChild(p); p.style.setProperty('--len',Math.ceil(p.getTotalLength())); paths.push({p:p,s:s,e:e});
    }); });
    if(cur_sel) apply(cur_sel);
  }
  var cur_sel=null;
  function apply(el){
    cur_sel=el; box.classList.toggle('sel',!!el);
    [].forEach.call(box.querySelectorAll('.cst-n'),function(n){n.classList.remove('on','src')});
    paths.forEach(function(o){ o.p.classList.remove('on'); });
    if(!el) return; el.classList.add('on','src');
    paths.forEach(function(o){ if(o.s===el||o.e===el){ o.p.classList.remove('on'); void o.p.getBBox(); o.p.classList.add('on'); (o.s===el?o.e:o.s).classList.add('on'); } });
  }
  var auto=null, ai=0, manual=false, visible=false, resumeT=null;
  function step(){ apply(sks[ai%sks.length]); ai++; }
  function startAuto(){ if(reduce||manual||auto||!visible) return; step(); auto=setInterval(step,2300); }
  function stopAuto(){ clearInterval(auto); auto=null; }
  function take(el){ manual=true; box.classList.add('manual'); stopAuto(); clearTimeout(resumeT); apply(cur_sel===el&&!fine?null:el); }
  [].concat(exps,sks).forEach(function(n){
    n.addEventListener('click',function(){ take(n); });
    n.addEventListener('focus',function(){ take(n); });
    if(fine) n.addEventListener('pointerenter',function(){ take(n); });
  });
  if(fine) grid.addEventListener('pointerleave',function(){ clearTimeout(resumeT); resumeT=setTimeout(function(){ apply(null); manual=false; startAuto(); },3500); });
  if('IntersectionObserver' in window) new IntersectionObserver(function(es){ es.forEach(function(e){ visible=e.isIntersecting; if(visible){ draw(); startAuto(); } else stopAuto(); }); },{threshold:.25}).observe(box);
  var rt; addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(draw,150); },{passive:true});
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(draw);
  setTimeout(draw,1400);
})();
"""

def html_block(lang):
    t=TXT[lang]; L=1 if lang=='en' else 0
    ex=''.join('<button type="button" class="cst-n" data-id="%s"><b>%s</b><small>%s</small></button>'%(e[0],e[1+L].replace('&','&amp;'),e[3+L].replace('&','&amp;')) for e in EXPS)
    sk=''.join('<button type="button" class="cst-n" data-x="%s">%s</button>'%(' '.join(s[2]),s[L].replace('&','&amp;')) for s in SKILLS)
    return ('<!--ENH:cst--><div class="card cst rv" role="group" aria-label="%s"><div class="cst-top"><div><span class="eyebrow">%s</span><h3>%s</h3></div>'
            '<div><p>%s</p><span class="cst-hint"><i></i>%s</span></div></div>'
            '<div class="cst-grid"><svg class="cst-svg" aria-hidden="true"></svg><div class="cst-col ex">%s</div><div class="cst-col sk">%s</div></div></div><!--/ENH:cst-->'
            %(t['aria'],t['eyebrow'],t['h'],t['p'],t['hint'],ex,sk))

def run(path,lang):
    s=open(path,encoding='utf-8').read()
    s=re.sub(r'\n?/\* ==== ENH-START ==== \*/.*?/\* ==== ENH-END ==== \*/\n?','',s,flags=re.S)
    s=re.sub(r'<!--ENH:cst-->.*?<!--/ENH:cst-->\s*','',s,flags=re.S)
    s=re.sub(r'\n?<script id="enh">.*?</script>\n?','\n',s,flags=re.S)
    s=s.replace('</style>','/* ==== ENH-START ==== */'+CSS+'/* ==== ENH-END ==== */\n</style>',1)
    # constellation goes right after the skills grid, before the Engagements head
    anchor='<div class="head rv" style="margin-top:72px">'
    assert s.count(anchor)==1, path
    s=s.replace(anchor, html_block(lang)+anchor,1)
    s=s.replace('</body>','<script id="enh">'+JS+'</script>\n</body>',1)
    open(path,'w',encoding='utf-8').write(s)
    print('ok',path)

run('index.html','fr'); run('en/index.html','en')
