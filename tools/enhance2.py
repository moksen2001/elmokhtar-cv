# Dark-by-default theme + toggle, CV download menu, "I'm hiring for…" filter, Focal-Shift screenshot.
# Idempotent: markers are stripped then re-inserted. Run AFTER tools/enhance.py.
import re

T = {
 'fr': dict(
   theme_aria="Changer de thème (clair / sombre)",
   dl="Télécharger mon CV", dl_items=[("CV_El_Mokhtar_Berrada_FR_clair.pdf","Version claire","idéale à imprimer"),
                                      ("CV_El_Mokhtar_Berrada_FR_sombre.pdf","Version sombre","pour l'écran"),
                                      ("CV_El_Mokhtar_Berrada_FR_mixte.pdf","Version mixte","en-tête et colonne sombres")],
   dl_other=("CV_El_Mokhtar_Berrada_EN_light.pdf","English version"),
   hire_k="Vous recrutez pour…", hire_p="Choisissez un poste : je mets en avant les expériences, projets et compétences qui comptent pour vous.",
   roles=[("po","Product Owner"),("ia","IA & automatisation"),("dx","Transformation digitale & UX")],
   status="{x} expériences · {p} projets · {s} blocs de compétences mis en avant", see="Voir le parcours", reset="Tout afficher",
   badge="Pertinent", float="Filtre", clear="Retirer le filtre",
   focal_alt="Page d'accueil du prototype Focal-Shift : location et revente de matériel photo et vidéo",
   contact_dl="CV PDF"),
 'en': dict(
   theme_aria="Toggle theme (light / dark)",
   dl="Download my CV", dl_items=[("CV_El_Mokhtar_Berrada_EN_light.pdf","Light version","best for printing"),
                                  ("CV_El_Mokhtar_Berrada_EN_dark.pdf","Dark version","for screens"),
                                  ("CV_El_Mokhtar_Berrada_EN_mixed.pdf","Mixed version","dark header and sidebar")],
   dl_other=("CV_El_Mokhtar_Berrada_FR_clair.pdf","Version française"),
   hire_k="Hiring for…", hire_p="Pick a role: I will highlight the experience, projects and skills that matter to you.",
   roles=[("po","Product Owner"),("ia","AI & automation"),("dx","Digital transformation & UX")],
   status="{x} roles · {p} projects · {s} skill groups highlighted", see="See experience", reset="Show everything",
   badge="Relevant", float="Filter", clear="Clear filter",
   focal_alt="Focal-Shift prototype home page: photo and video gear rental and resale",
   contact_dl="CV PDF"),
}

CSS = r"""
/* ==== ENH2: theme toggle ==== */
.tools{display:flex;align-items:center;gap:8px;flex:none}
.theme-btn{all:unset;box-sizing:border-box;width:34px;height:34px;border-radius:50%;border:1px solid var(--line);display:grid;place-items:center;cursor:pointer;color:var(--ink-2);transition:color .2s,border-color .2s,transform .5s cubic-bezier(.3,1.6,.5,1)}
.theme-btn:hover{color:var(--ink);border-color:var(--ink-2)}
.theme-btn:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.theme-btn svg{width:17px;height:17px;grid-area:1/1;transition:transform .5s cubic-bezier(.3,1.4,.5,1),opacity .3s}
.theme-btn .moon{opacity:0;transform:rotate(-90deg) scale(.5)}
:root[data-theme="dark"] .theme-btn .sun{opacity:0;transform:rotate(90deg) scale(.5)}
:root[data-theme="dark"] .theme-btn .moon{opacity:1;transform:none}
.theme-btn.spin{transform:rotate(180deg)}
html.theming *,html.theming *::before,html.theming *::after{transition:background-color .45s,border-color .45s,color .45s,fill .45s,stroke .45s!important}
@media (max-width:860px){.tools{margin-left:auto}.tools .lang-sw{margin-left:0}}
/* ==== ENH2: CV download menu ==== */
.dl{position:relative}
.hero .cta{position:relative;z-index:20}
.dl[open]{z-index:40}
.dl>summary{list-style:none}
.dl>summary::-webkit-details-marker{display:none}
.dl>summary svg{width:17px;height:17px}
.dl[open]>summary{border-color:var(--teal);color:var(--teal)}
.dl-menu{position:absolute;left:0;top:calc(100% + 8px);z-index:30;min-width:250px;padding:6px;background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow);display:grid;gap:2px;animation:dlin .25s cubic-bezier(.2,.8,.2,1)}
@keyframes dlin{from{opacity:0;transform:translateY(-6px) scale(.98)}}
.dl-menu a{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;align-items:center;text-decoration:none;color:var(--ink);padding:9px 10px;border-radius:10px;font-size:.92rem;font-weight:600}
.dl-menu a:hover,.dl-menu a:focus-visible{background:var(--surface-2);outline:none}
.dl-menu a i{grid-row:span 2;width:28px;height:28px;border-radius:8px;border:1px solid var(--line)}
.dl-menu a i.l{background:linear-gradient(135deg,#fff 60%,#EEF3F0 60%)}
.dl-menu a i.d{background:linear-gradient(135deg,#0D1615 60%,#15211F 60%)}
.dl-menu a i.m{background:linear-gradient(90deg,#fff 62%,#15211F 62%);box-shadow:inset 0 7px 0 #0D1615}
.dl-menu a small{font-weight:400;color:var(--muted);font-size:.78rem}
.dl-menu .other{grid-template-columns:1fr;font-weight:500;color:var(--teal);border-top:1px solid var(--line);border-radius:0 0 10px 10px;margin-top:4px;padding-top:10px;font-size:.86rem}
.contact .dl .dl-menu{left:auto;right:0;top:auto;bottom:calc(100% + 8px)}
/* ==== ENH2: hiring filter ==== */
.hire{margin-top:30px;padding:18px 20px;display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px}
.hire .hk{font-family:var(--display);font-weight:700;font-size:1.08rem;white-space:nowrap}
.hire .hp{color:var(--muted);font-size:.88rem;flex:1 1 260px}
.hire-roles{display:flex;flex-wrap:wrap;gap:8px;width:100%}
.hire-roles button{all:unset;box-sizing:border-box;cursor:pointer;padding:9px 15px;border-radius:999px;border:1px solid var(--line);font-weight:600;font-size:.92rem;color:var(--ink-2);background:var(--bg);transition:background .25s,color .25s,border-color .25s,transform .3s cubic-bezier(.3,1.6,.5,1)}
.hire-roles button:hover{border-color:var(--teal);color:var(--ink)}
.hire-roles button:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.hire-roles button[aria-pressed="true"]{background:var(--teal);border-color:var(--teal);color:var(--on-teal);transform:scale(1.04)}
.hire-st{width:100%;display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;font-size:.88rem;color:var(--ink-2);min-height:1.6em}
.hire-st a{color:var(--teal);font-weight:600;text-decoration:none}
.hire-st button{all:unset;cursor:pointer;color:var(--muted);text-decoration:underline;text-underline-offset:3px}
.hire-st[hidden]{display:flex;visibility:hidden}
.fx-dim{opacity:.34;filter:saturate(.3);transition:opacity .5s,filter .5s}
.fx-dim:hover{opacity:.8;filter:none}
.fx-fit{position:relative;transition:opacity .5s,filter .5s,box-shadow .5s}
.card.fx-fit,.rel.fx-fit .body{box-shadow:0 0 0 1.5px var(--sun),var(--shadow)}
.fx-badge{position:absolute;top:10px;right:10px;z-index:3;display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size:.68rem;letter-spacing:.04em;text-transform:uppercase;padding:4px 9px;border-radius:999px;background:var(--sun);color:#1b1405;animation:pop .45s cubic-bezier(.3,1.7,.5,1)}
@keyframes pop{from{transform:scale(.3);opacity:0}}
.hire-float{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translate(-50%,140%);z-index:60;display:flex;align-items:center;gap:10px;padding:8px 8px 8px 16px;border-radius:999px;background:var(--ink);color:var(--bg);font-size:.88rem;box-shadow:0 10px 30px -10px rgba(0,0,0,.5);transition:transform .45s cubic-bezier(.3,1.4,.5,1);max-width:calc(100vw - 32px)}
.hire-float.on{transform:translate(-50%,0)}
.hire-float b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hire-float button{all:unset;cursor:pointer;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--bg) 18%,transparent)}
.hire-float button:focus-visible{outline:2px solid var(--sun)}
.proj .vis img.shot{object-position:left top}
@media (prefers-reduced-motion:reduce){.fx-badge,.dl-menu{animation:none}.hire-float{transition:none}}
"""

JS = r"""
(function(){
  var L=document.documentElement.lang==='en'?'en':'fr', T=__T__[L];
  var root=document.documentElement, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* theme toggle */
  var tb=document.querySelector('.theme-btn');
  if(tb) tb.addEventListener('click',function(){
    var next=root.dataset.theme==='dark'?'light':'dark';
    if(!reduce){ root.classList.add('theming'); setTimeout(function(){root.classList.remove('theming')},500); }
    root.dataset.theme=next; tb.classList.toggle('spin');
    try{ localStorage.setItem('emb-theme',next); }catch(e){}
    var m=document.querySelector('meta[name=theme-color]'); if(m) m.content=next==='dark'?'#0C1413':'#F3F5F3';
  });
  /* close download menus on outside click / Esc */
  var dls=[].slice.call(document.querySelectorAll('details.dl'));
  document.addEventListener('click',function(e){ dls.forEach(function(d){ if(d.open&&!d.contains(e.target)) d.open=false; }); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') dls.forEach(function(d){ d.open=false; }); });
  /* hiring filter */
  var MAP={
    po:{rel:['sv','sg','bdf'],proj:['p-agent','p-gainde','p-yema','p-focal'],sk:[0,3],cst:['sv','sg','bdf']},
    ia:{rel:['sg','sv'],proj:['p-agent','p-focal','p-veille'],sk:[1,4],cst:['sg','pr']},
    dx:{rel:['bdf','so','ism','sv'],proj:['p-gainde','p-yema','p-focal','p-baykat','p-jubox'],sk:[2,5],cst:['bdf','so','ism','pr']}
  };
  var RELID=['sv','sg','bdf','so','ism'];
  var rels=[].slice.call(document.querySelectorAll('.rel')), projs=[].slice.call(document.querySelectorAll('.proj')), sks=[].slice.call(document.querySelectorAll('.skills .sk'));
  var box=document.querySelector('.hire'); if(!box) return;
  var btns=[].slice.call(box.querySelectorAll('.hire-roles button')), st=box.querySelector('.hire-st'), stx=st.querySelector('span');
  var fl=document.querySelector('.hire-float'), flb=fl.querySelector('b');
  function badge(el){ if(el.querySelector(':scope > .fx-badge')) return; var b=document.createElement('span'); b.className='fx-badge'; b.textContent='✓ '+T.badge; el.appendChild(b); }
  function clear(){
    document.querySelectorAll('.fx-dim,.fx-fit').forEach(function(e){e.classList.remove('fx-dim','fx-fit')});
    document.querySelectorAll('.fx-badge').forEach(function(b){b.remove()});
  }
  function apply(k){
    clear(); btns.forEach(function(b){ b.setAttribute('aria-pressed',String(b.dataset.r===k)); });
    if(!k){ st.hidden=true; fl.classList.remove('on'); return; }
    var m=MAP[k];
    rels.forEach(function(r,i){ var ok=m.rel.indexOf(RELID[i])>-1; r.classList.add(ok?'fx-fit':'fx-dim'); if(ok) badge(r.querySelector('.body')); });
    projs.forEach(function(p){ var ok=m.proj.indexOf(p.dataset.p)>-1; p.classList.add(ok?'fx-fit':'fx-dim'); if(ok) badge(p); });
    sks.forEach(function(s,i){ var ok=m.sk.indexOf(i)>-1; s.classList.add(ok?'fx-fit':'fx-dim'); if(ok) badge(s); });
    document.querySelectorAll('.cst-col.ex .cst-n').forEach(function(n){ n.classList.add(m.cst.indexOf(n.dataset.id)>-1?'fx-fit':'fx-dim'); });
    stx.textContent=T.status.replace('{x}',m.rel.length).replace('{p}',m.proj.length).replace('{s}',m.sk.length);
    st.hidden=false;
    var lbl=btns.filter(function(b){return b.dataset.r===k})[0]; flb.textContent=T.float+' : '+(lbl?lbl.textContent:'');
    fl.classList.add('on'); fl.dataset.k=k;
  }
  var cur=null;
  btns.forEach(function(b){ b.addEventListener('click',function(){ cur=(cur===b.dataset.r)?null:b.dataset.r; apply(cur); }); });
  st.querySelector('button').addEventListener('click',function(){ cur=null; apply(null); });
  fl.querySelector('button').addEventListener('click',function(){ cur=null; apply(null); });
  /* hide the floating chip while the filter card itself is on screen */
  if('IntersectionObserver' in window) new IntersectionObserver(function(es){ es.forEach(function(e){ fl.style.visibility=e.isIntersecting?'hidden':''; }); },{threshold:.2}).observe(box);
})();
"""

SUN='<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/></svg>'
MOON='<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z"/></svg>'
DLI='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>'

def dl_menu(t,pre,label,cls='btn'):
    icons=['l','d','m']
    items=''.join('<a href="%scv/%s" download><i class="%s"></i>%s<small>%s</small></a>'%(pre,f,icons[i],n,s) for i,(f,n,s) in enumerate(t['dl_items']))
    o=t['dl_other']
    items+='<a class="other" href="%scv/%s" download>%s →</a>'%(pre,o[0],o[1])
    return '<!--ENH2:dl--><details class="dl"><summary class="%s">%s%s</summary><div class="dl-menu" role="menu">%s</div></details><!--/ENH2:dl-->'%(cls,DLI,label,items)

def run(path,lang):
    t=T[lang]; pre='../' if lang=='en' else ''
    s=open(path,encoding='utf-8').read()
    # strip previous
    s=re.sub(r'/\* ==== ENH2-START ==== \*/.*?/\* ==== ENH2-END ==== \*/\n?','',s,flags=re.S)
    s=re.sub(r'<!--ENH2:(\w+)-->.*?<!--/ENH2:\1-->\n?','',s,flags=re.S)
    s=re.sub(r'\n?<script id="enh2">.*?</script>','',s,flags=re.S)
    s=re.sub(r'\n?<script id="theme-init">.*?</script>','',s,flags=re.S)
    s=re.sub(r'<!--ENH4:qb-->.*?<!--/ENH4:qb-->','',s,flags=re.S)
    s=re.sub(r'<div class="tools">(<div class="lang-sw".*?</div>)</div>',r'\1',s,flags=re.S)
    # dark by default (before first paint) + remembered choice
    s=re.sub(r'<html lang="(\w+)"[^>]*>',r'<html lang="\1" data-theme="dark">',s,count=1)
    s=s.replace('<meta charset="utf-8">','<meta charset="utf-8">\n<script id="theme-init">try{var t=localStorage.getItem("emb-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}</script>',1)
    s=re.sub(r'<meta name="theme-color" content="[^"]*">','<meta name="theme-color" content="#0C1413">',s)
    s=s.replace('</style>','/* ==== ENH2-START ==== */'+CSS+'/* ==== ENH2-END ==== */\n</style>',1)
    # header tools: theme toggle + language switch
    m=re.search(r'<div class="lang-sw".*?</div>',s,flags=re.S); sw=m.group(0)
    s=s.replace(sw,'<div class="tools"><!--ENH2:tb--><button type="button" class="theme-btn" aria-label="%s">%s%s</button><!--/ENH2:tb-->%s</div>'%(t['theme_aria'],SUN,MOON,sw),1)
    # hero: download menu right after the primary CTA (before the quick-read button enhance4 adds, before LinkedIn/contact)
    s=re.sub(r'(<a class="btn primary" href="#parcours">.*?</a>)',lambda m:m.group(1)+dl_menu(t,pre,t['dl']),s,count=1,flags=re.S)
    # hiring filter: right after the KPI strip inside the hero
    k=s.index('<div class="tldr rv">'); kend=s.index('<div class="marquee"',k)
    kclose=s.rindex('</div>',k,kend)  # closes .wrap of hero
    roles=''.join('<button type="button" data-r="%s" aria-pressed="false">%s</button>'%(r,n.replace('&','&amp;')) for r,n in t['roles'])
    hire=('<!--ENH2:hire--><div class="card hire rv" role="group" aria-label="%s"><span class="hk">%s</span><span class="hp">%s</span>'
          '<div class="hire-roles">%s</div><div class="hire-st" hidden aria-live="polite"><span></span><a href="#parcours">%s ↓</a><button type="button">%s</button></div></div><!--/ENH2:hire-->'
          %(t['hire_k'],t['hire_k'],t['hire_p'],roles,t['see'],t['reset']))
    s=s[:kclose]+hire+s[kclose:]
    # floating chip + contact download
    s=s.replace('</body>','<!--ENH2:float--><div class="hire-float" role="status"><b></b><button type="button" aria-label="%s">✕</button></div><!--/ENH2:float-->\n</body>'%t['clear'],1)
    c=s.index('<div class="chan">',s.index('id="contact"')); cend=s.index('</section>',c); last=s.rindex('</div>',c,cend)
    crow='<!--ENH2:crow--><div class="row"><div class="t"><small>%s</small><b>%s</b></div>%s</div><!--/ENH2:crow-->'%(t['contact_dl'],t['dl'],dl_menu(t,pre,'PDF','go'))
    s=s[:last]+crow+s[last:]
    # Focal-Shift: real screenshot on the card + in the project panel
    s=re.sub(r'<img src="((?:\.\./)?img/)focal(?:-site)?\.jpg" alt="[^"]*"( loading="lazy")?( class="shot")?>',
             lambda mm:'<img src="%sfocal-site.jpg" alt="%s" loading="lazy" class="shot">'%(mm.group(1),t['focal_alt']),s)
    fi=s.index('<div id="p-focal"'); fe=s.index('<div id="p-veille"',fi); fclose=s.rindex('</div>',fi,fe)
    s=s[:fclose]+'<!--ENH2:fimg--><img src="%simg/focal-site.jpg" alt="%s" loading="lazy"><!--/ENH2:fimg-->'%(pre,t['focal_alt'])+s[fclose:]
    s=s.replace('</body>','<script id="enh2">'+JS.replace('__T__',json_T())+'</script>\n</body>',1)
    open(path,'w',encoding='utf-8').write(s); print('ok',path)

def json_T():
    import json
    return json.dumps({k:dict(badge=v['badge'],status=v['status'],float=v['float']) for k,v in T.items()},ensure_ascii=False)

run('index.html','fr'); run('en/index.html','en')
