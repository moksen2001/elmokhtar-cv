# (6) "What the numbers say" animated results section + Focal-Shift gallery in the project panel.
# Idempotent; run after enhance.py and enhance2.py.
import re, json

T = {
 'fr': dict(eb="En chiffres", h="Ce que disent les chiffres",
   p="Des résultats mesurés sur le terrain, de Dakar à La Défense. Chaque chiffre vient d'un projet décrit plus haut.",
   before="Avant", after="Après",
   tiles=[
    ("t-time", "−", 30, " %", "de temps de traitement", "Outil de reporting Komgo vs AllTRA que j'ai conçu", "Société Générale CIB"),
    ("t-eng",  "+", 30, " %", "d'engagement", "Projets multimédia pour Orange, Auchan, Mazars, Heetch et Free, sur 5 plateformes", "Socium"),
    ("t-hack", "",  80, "+",  "équipes au hackathon mondial GBIS", "Finaliste avec un agent IA pour les Lettres de Crédit", "Société Générale CIB"),
    ("t-fig",  "",  10, "",   "écrans prototypés sur Figma", "Refonte UX/UI du portail interne Case Management", "Banque de France"),
    ("t-rit",  "",  50, "+",  "rituels agiles animés ou suivis", "Daily, Sprint Review et rétrospectives dans une équipe Scrum de 14 personnes", "Banque de France"),
    ("t-stu",  "",  5000, "+","étudiants touchés par nos événements", "Soft Skills Academy, avec des équipes de 10+ bénévoles", "Groupe ISM"),
   ],
   back="← Retour au projet", bub=["Copilot · Power Automate","4 langues · FR EN AR WO","2 titres RNCP niveau 7"],
   gal_h="Le prototype en images", gal=[("fs-catalogue","Catalogue d'achat avec filtres et prix du neuf"),("fs-produit","Fiche produit en location avec devis"),
       ("fs-conseil","Conseil par questionnaire en 5 étapes"),("fs-admin","Back-office : modération, litiges, journal d'audit"),("fs-api","API REST documentée (OpenAPI, Swagger)")]),
 'en': dict(eb="By the numbers", h="What the numbers say",
   p="Results measured on the ground, from Dakar to La Défense. Every figure comes from a project described above.",
   before="Before", after="After",
   tiles=[
    ("t-time", "−", 30, "%", "processing time", "Komgo vs AllTRA reporting tool I designed", "Société Générale CIB"),
    ("t-eng",  "+", 30, "%", "engagement", "Multimedia projects for Orange, Auchan, Mazars, Heetch and Free across 5 platforms", "Socium"),
    ("t-hack", "",  80, "+", "teams in the GBIS global hackathon", "Finalist with an AI agent for Letters of Credit", "Société Générale CIB"),
    ("t-fig",  "",  10, "",  "screens prototyped in Figma", "UX/UI redesign of the internal Case Management portal", "Banque de France"),
    ("t-rit",  "",  50, "+", "agile ceremonies run or attended", "Dailies, sprint reviews and retrospectives in a 14-person Scrum team", "Banque de France"),
    ("t-stu",  "",  5000, "+","students reached by our events", "Soft Skills Academy, leading teams of 10+ volunteers", "Groupe ISM"),
   ],
   back="← Back to project", bub=["Copilot · Power Automate","4 languages · FR EN AR WO","2× RNCP Level 7 titles"],
   gal_h="The prototype in pictures", gal=[("fs-catalogue","Purchase catalog with filters and new-price comparison"),("fs-produit","Rental product page with instant quote"),
       ("fs-conseil","5-step advice questionnaire"),("fs-admin","Back office: moderation, disputes, audit log"),("fs-api","Documented REST API (OpenAPI, Swagger)")]),
}

CSS = r"""
/* ==== ENH3: numbers ==== */
.nums{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.nt{padding:22px 22px 20px;display:flex;flex-direction:column;gap:6px;position:relative;overflow:hidden;min-height:250px}
.nt .big{font-family:var(--display);font-weight:800;font-size:clamp(2.4rem,4.4vw,3.3rem);line-height:1;letter-spacing:-.03em;color:var(--ink);font-variant-numeric:tabular-nums}
.nt .big em{font-style:normal;color:var(--teal)}
.nt .lb{font-weight:600;font-size:1rem}
.nt .ds{color:var(--muted);font-size:.86rem;line-height:1.45}
.nt .org{margin-top:auto;padding-top:10px;font-family:var(--mono);font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:var(--sun)}
.viz{height:64px;margin:6px 0 4px;position:relative}
/* bars before/after */
.bars{display:grid;gap:9px;align-content:center;height:100%}
.bars div{display:grid;grid-template-columns:52px 1fr;align-items:center;gap:10px;font-family:var(--mono);font-size:.7rem;color:var(--muted)}
.bars i{display:block;height:12px;border-radius:6px;background:var(--line);transform-origin:left;transform:scaleX(0);transition:transform 1.2s cubic-bezier(.2,.8,.2,1)}
.bars .a i{background:var(--teal);transition-delay:.35s}
.nt.go .bars i{transform:scaleX(var(--w))}
/* sparkline */
.spark{width:100%;height:100%;overflow:visible}
.spark path{fill:none;stroke:var(--teal);stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:400;stroke-dashoffset:400;transition:stroke-dashoffset 1.6s cubic-bezier(.3,.7,.2,1)}
.spark .area{stroke:none;fill:color-mix(in srgb,var(--teal) 16%,transparent);opacity:0;transition:opacity 1s .9s}
.spark circle{fill:var(--sun);opacity:0;transition:opacity .3s 1.5s}
.nt.go .spark path{stroke-dashoffset:0}.nt.go .spark .area,.nt.go .spark circle{opacity:1}
/* dot grid */
.dots80{display:grid;grid-template-columns:repeat(20,1fr);gap:4px;align-content:center;height:100%}
.dots80 i{aspect-ratio:1;border-radius:50%;background:var(--line);opacity:0;transform:scale(.3);transition:opacity .3s,transform .4s cubic-bezier(.3,1.6,.5,1);transition-delay:calc(var(--k)*9ms)}
.nt.go .dots80 i{opacity:1;transform:none}
.dots80 i.win{background:var(--sun)}
.nt.go .dots80 i.win{animation:winp 1.6s 1.2s ease-in-out infinite}
@keyframes winp{50%{box-shadow:0 0 0 4px color-mix(in srgb,var(--sun) 30%,transparent)}}
/* screens */
.scr{display:flex;gap:6px;align-items:flex-end;height:100%}
.scr i{flex:1;height:78%;border-radius:5px;border:1.5px solid var(--line);background:linear-gradient(var(--surface-2) 0 22%,transparent 22%);opacity:0;transform:translateY(14px);transition:opacity .4s,transform .5s cubic-bezier(.3,1.5,.5,1),border-color .4s;transition-delay:calc(var(--k)*90ms)}
.nt.go .scr i{opacity:1;transform:none;border-color:color-mix(in srgb,var(--teal) 55%,var(--line))}
/* ticks */
.ticks{display:flex;gap:3px;align-items:flex-end;height:100%}
.ticks i{flex:1;border-radius:2px;background:var(--teal);height:var(--h);transform:scaleY(0);transform-origin:bottom;transition:transform .5s cubic-bezier(.3,1.5,.5,1);transition-delay:calc(var(--k)*22ms);opacity:.85}
.ticks i.sp{background:var(--sun)}
.nt.go .ticks i{transform:none}
/* people */
.ppl{display:flex;flex-wrap:wrap;gap:5px;align-content:center;height:100%}
.ppl svg{width:17px;height:17px;color:var(--teal);opacity:0;transform:translateY(6px);transition:opacity .3s,transform .4s;transition-delay:calc(var(--k)*35ms)}
.nt.go .ppl svg{opacity:1;transform:none}
@media (max-width:980px){.nums{grid-template-columns:repeat(2,1fr)}}
@media (max-width:620px){.nums{grid-template-columns:1fr}.nt{min-height:0}}
/* ==== ENH3: extra hero bubbles ==== */
.float-badge.b2{left:auto;right:-26px;top:44%;bottom:auto;animation-delay:-1.7s}
.float-badge.b3{left:-34px;top:60%;bottom:auto;animation-delay:-3.1s}
.float-badge.b4{left:auto;right:18px;top:-16px;animation-delay:-.9s}
.float-badge.b2 svg,.float-badge.b4 svg{color:var(--sun)}
.float-badge{opacity:0;animation:bubin .7s cubic-bezier(.3,1.6,.5,1) forwards,bob 5s ease-in-out infinite}
.float-badge.b2{animation-delay:.9s,-1.7s}.float-badge.b3{animation-delay:1.2s,-3.1s}.float-badge.b4{animation-delay:1.5s,-.9s}
@keyframes bubin{from{opacity:0;transform:scale(.6) translateY(10px)}to{opacity:1}}
@media (max-width:860px){.float-badge.b2{right:10px;left:auto;top:auto;bottom:150px}.float-badge.b3{display:none}.float-badge.b4{right:10px;top:12px;left:auto}}
@media (max-width:460px){.float-badge.b4{display:none}}
@media (prefers-reduced-motion:reduce){.float-badge{opacity:1;animation:none}}
.fsg-back{all:unset;cursor:pointer;display:inline-block;margin-bottom:12px;font-weight:600;color:var(--teal)}
.fsg-view img{width:100%;border-radius:12px;border:1px solid var(--line)}
.fsg-view p{color:var(--muted);font-size:.88rem;margin-top:8px}
/* ==== ENH3: Focal-Shift gallery ==== */
.fsg{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:10px}
.fsg figure{margin:0;border-radius:12px;overflow:hidden;border:1px solid var(--line);background:var(--surface-2);cursor:zoom-in}
.fsg figure:first-child{grid-column:1/-1}
.fsg img{width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top;transition:transform .5s}
.fsg figure:hover img{transform:scale(1.03)}
.fsg figcaption{font-size:.8rem;color:var(--muted);padding:8px 10px}
@media (max-width:620px){.fsg{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.nt .bars i,.nt .dots80 i,.nt .scr i,.nt .ticks i,.nt .ppl svg{transition:none!important;transform:none!important;opacity:1!important}.spark path{stroke-dashoffset:0!important;transition:none!important}.spark .area,.spark circle{opacity:1!important}}
"""

JS = r"""
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tiles=[].slice.call(document.querySelectorAll('.nt'));
  var fmt=function(n){ return n>=1000? n.toLocaleString(document.documentElement.lang==='en'?'en-US':'fr-FR') : String(n); };
  function run(t){
    t.classList.add('go'); var el=t.querySelector('[data-n]'); if(!el) return; var to=+el.dataset.n;
    if(reduce){ el.textContent=fmt(to); return; }
    var t0=null, dur=1500; (function step(ts){ if(!t0) t0=ts; var p=Math.min(1,(ts-t0)/dur), e=1-Math.pow(1-p,3); el.textContent=fmt(Math.round(to*e)); if(p<1) requestAnimationFrame(step); })(performance.now());
    requestAnimationFrame(function s(ts){});
  }
  if('IntersectionObserver' in window){
    var o=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ run(e.target); o.unobserve(e.target);} }); },{threshold:.35});
    tiles.forEach(function(t){ t.querySelector('[data-n]').textContent='0'; o.observe(t); });
  } else tiles.forEach(run);
  var body=document.getElementById('dlg-body'); if(!body) return; var prev=null;
  body.addEventListener('click',function(e){
    var b=e.target.closest('.fsg-back'); if(b&&prev!==null){ body.innerHTML=prev; prev=null; body.scrollTop=0; return; }
    var f=e.target.closest('.fsg figure'); if(!f) return; e.stopPropagation();
    prev=body.innerHTML; var cap=f.dataset.cap||'';
    body.innerHTML='<div class="fsg-view"><button type="button" class="fsg-back">'+__BACK__+'</button><img src="'+f.dataset.img+'" alt="'+cap.replace(/"/g,'&quot;')+'"><p>'+cap+'</p></div>';
    body.scrollTop=0;
  });
  var dlg=document.getElementById('dlg'); if(dlg) dlg.addEventListener('close',function(){ prev=null; });
})();
"""

PERSON='<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z"/></svg>'

def viz(kind,t):
    if kind=='t-time':
        return '<div class="viz bars"><div class="b">%s<i style="--w:1"></i></div><div class="a">%s<i style="--w:.7"></i></div></div>'%(t['before'],t['after'])
    if kind=='t-eng':
        return ('<div class="viz"><svg class="spark" viewBox="0 0 200 64" preserveAspectRatio="none" aria-hidden="true">'
                '<path class="area" d="M2 50 L40 46 L78 48 L116 36 L154 24 L198 10 L198 64 L2 64Z"/>'
                '<path d="M2 50 L40 46 L78 48 L116 36 L154 24 L198 10"/><circle cx="198" cy="10" r="5"/></svg></div>')
    if kind=='t-hack':
        return '<div class="viz dots80">'+''.join('<i class="%s" style="--k:%d"></i>'%('win' if k==47 else '',k) for k in range(80))+'</div>'
    if kind=='t-fig':
        return '<div class="viz scr">'+''.join('<i style="--k:%d"></i>'%k for k in range(10))+'</div>'
    if kind=='t-rit':
        import random; random.seed(7)
        return '<div class="viz ticks">'+''.join('<i class="%s" style="--k:%d;--h:%d%%"></i>'%('sp' if k%10==9 else '',k,(95 if k%10==9 else random.randint(35,70))) for k in range(50))+'</div>'
    if kind=='t-stu':
        return '<div class="viz ppl">'+''.join(PERSON.replace('<svg ','<svg style="--k:%d" '%k,1) for k in range(20))+'</div>'

def section(lang):
    t=T[lang]
    tiles=''
    for kind,pre,n,suf,lb,ds,org in t['tiles']:
        big='%s<span data-n="%d">%s</span><em>%s</em>'%(pre,n,('{:,}'.format(n).replace(',',' ') if lang=='fr' else '{:,}'.format(n)) if n>=1000 else n,suf)
        tiles+='<div class="card nt rv"><div class="big" aria-label="%s%s%s %s">%s</div>%s<div class="lb">%s</div><div class="ds">%s</div><div class="org">%s</div></div>'%(pre,n,suf,lb,big,viz(kind,t),lb,ds,org)
    return ('<!--ENH3:nums--><section class="block" id="chiffres"><div class="wrap"><div class="head rv"><div><span class="eyebrow">%s</span><h2>%s</h2></div><p>%s</p></div>'
            '<div class="nums">%s</div></div></section><!--/ENH3:nums-->\n'%(t['eb'],t['h'],t['p'],tiles))

def gallery(lang,pre):
    t=T[lang]
    figs=''.join('<figure data-img="%simg/%s.jpg" data-cap="%s"><img src="%simg/%s.jpg" alt="%s" loading="lazy"><figcaption>%s</figcaption></figure>'%(pre,f,c,pre,f,c,c) for f,c in t['gal'])
    return '<!--ENH3:gal--><h4>%s</h4><div class="fsg">%s</div><!--/ENH3:gal-->'%(t['gal_h'],figs)

def run(path,lang):
    pre='../' if lang=='en' else ''
    s=open(path,encoding='utf-8').read()
    s=re.sub(r'/\* ==== ENH3-START ==== \*/.*?/\* ==== ENH3-END ==== \*/\n?','',s,flags=re.S)
    s=re.sub(r'<!--ENH3:(\w+)-->.*?<!--/ENH3:\1-->\n?','',s,flags=re.S)
    s=re.sub(r'\n?<script id="enh3">.*?</script>','',s,flags=re.S)
    s=s.replace('</style>','/* ==== ENH3-START ==== */'+CSS+'/* ==== ENH3-END ==== */\n</style>',1)
    # numbers section between Experience and Projects
    anchor='<section class="block" id="projets">'; i=s.index(anchor)
    # keep any comment line that precedes the projects section above our block
    s=s[:i]+section(lang)+s[i:]
    # replace the single Focal screenshot in the project panel by the gallery
    s=re.sub(r'<!--ENH2:fimg-->.*?<!--/ENH2:fimg-->',gallery(lang,pre),s,flags=re.S)
    t=T[lang]
    ICO=['<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.9L19 9.7l-4.2 3 1.5 5.3L12 15l-4.3 3 1.5-5.3L5 9.7l5.2-1.8z"/></svg>',
         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 5.5 5.5 7M11 5c-.8 3.5-3 6.2-6.5 7.8M13 21l4-10 4 10M14.5 17.5h5"/></svg>',
         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9 12 4 2 9l10 5 10-5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/></svg>']
    bub=''.join('<span class="float-badge b%d">%s%s</span>'%(i+2,ICO[i],txt) for i,txt in enumerate(t['bub']))
    m=re.search(r'<span class="float-badge">.*?</span>',s,flags=re.S)
    s=s[:m.end()]+'<!--ENH3:bub-->'+bub+'<!--/ENH3:bub-->'+s[m.end():]
    s=s.replace('</body>','<script id="enh3">'+JS.replace('__BACK__',json.dumps(t['back'],ensure_ascii=False))+'</script>\n</body>',1)
    open(path,'w',encoding='utf-8').write(s); print('ok',path)

run('index.html','fr'); run('en/index.html','en')
