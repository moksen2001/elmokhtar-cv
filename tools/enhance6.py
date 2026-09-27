# Download-button affordance, "3 concrete cases" section, world map, verifiable-credentials strip, vCard.
# Idempotent; run after enhance5.py.
import re, json, os
HERE=os.path.dirname(__file__)
ICONS=json.load(open(os.path.join(HERE,'icons.json')))
MAP=json.load(open(os.path.join(HERE,'map.json')))

T = {
 'fr': dict(
  cases_eb="Méthode", cases_h="Trois cas concrets",
  cases_p="Le même fil à chaque fois : comprendre le problème avec ceux qui le vivent, livrer quelque chose d'utilisable, mesurer ce qui a changé.",
  lbl=("Le problème","Ce que j'ai fait","Le résultat"),
  cases=[
   ("Société Générale CIB","sgcib.png","Trade Finance · 2025 – 26","Des documents récurrents remplis à la main au Middle Office",
    "Les équipes Middle Office remplissaient à la main des documents récurrents comme les <b>Notices of Assignment</b> : un travail long, répétitif et sensible aux erreurs de saisie.",
    "J'ai conçu des prompts <b>Copilot</b> qui pré-remplissent ces documents à partir des informations du dossier, je les ai testés avec les utilisateurs puis diffusés aux équipes.",
    "Des documents comme les Notices of Assignment remplis <b>beaucoup plus rapidement</b>, avec des prompts adoptés par le Middle Office de Paris, Genève et Bangalore.", False),
   ("Banque de France","bdf.png","DGSI · Case Management · 2025","Un portail interne à repenser avec ceux qui l'utilisent",
    "Le portail Case Management devait mieux répondre aux besoins des équipes qui s'en servent au quotidien.",
    "Analyse des besoins, ateliers participatifs pour co-construire le contenu, <b>10 écrans prototypés sur Figma</b>, puis suivi du développement dans une équipe Scrum de 14 personnes sur PEGA.",
    "Un portail repensé avec ses utilisateurs, et un formulaire Jira automatisé qui centralise les demandes et réduit les délais de création de tickets.", False),
   ("Servier","servier.png","Digital Solutions R&amp;D · 2026 – 27","Un cockpit commun pour les équipes R&amp;D, de Paris à Boston",
    "Les projets thérapeutiques du Groupe sont consolidés dans FederateS, utilisé en grande majorité par des équipes R&amp;D à Paris, et par quelques utilisateurs au Danemark et aux États-Unis.",
    "Ateliers de cadrage, User Stories et critères d'acceptation, priorisation du backlog Build &amp; Run avec la Global Digital Product Manager R&amp;D, recette fonctionnelle.",
    "En cours depuis septembre 2026 : je suis l'adoption avec les équipes change management.", True)],
  now="En cours",
  map_eb="International", map_h="Là où j'ai travaillé",
  map_p="Né au Maroc, formé au Sénégal, basé à Paris, et des projets menés avec des équipes sur trois continents.",
  leg=[("life","Vie et études"),("sg","Société Générale CIB"),("sv","Servier · FederateS")],
  places={'paris':("Paris","Base depuis 2024 · SG CIB, Banque de France, Servier (la majorité des utilisateurs FederateS)"),'casa':("Casablanca","Naissance"),'tanger':("Tanger","Enfance"),
          'dakar':("Dakar","Collège, lycée, Groupe ISM, Socium"),'geneve':("Genève","Middle Office · SG CIB"),'ny':("New York","Back et Middle Office · SG CIB"),
          'hk':("Hong Kong","Reporting multi-régions · SG CIB"),'sg':("Singapour","Reporting multi-régions · SG CIB"),'inde':("Bangalore","Prompts Copilot adoptés par le Middle Office · SG CIB"),
          'dk':("Copenhague","Utilisateurs FederateS · Servier Danemark"),'us':("Boston","Utilisateurs FederateS · Servier États-Unis")},
  verify_h="Vérifiables en un clic", verify="Vérifier",
  vcf="Ajouter à mes contacts", vcf_s="Fiche contact", vcf_b="Enregistrer"),
 'en': dict(
  cases_eb="Method", cases_h="Three concrete cases",
  cases_p="The same thread every time: understand the problem with the people who live it, ship something usable, measure what changed.",
  lbl=("The problem","What I did","The result"),
  cases=[
   ("Société Générale CIB","sgcib.png","Trade Finance · 2025 – 26","Recurring documents filled in by hand in the Middle Office",
    "Middle Office teams filled in recurring documents such as <b>Notices of Assignment</b> by hand: slow, repetitive work prone to data-entry errors.",
    "I designed <b>Copilot</b> prompts that pre-fill these documents from the deal information, tested them with users, then rolled them out to the teams.",
    "Documents such as Notices of Assignment completed <b>much faster</b>, with prompts adopted by Middle Office teams in Paris, Geneva and Bangalore.", False),
   ("Banque de France","bdf.png","IT Dept · Case Management · 2025","An internal portal to rethink with the people who use it",
    "The Case Management portal needed to better match the needs of the teams who use it every day.",
    "Needs analysis, participatory workshops to co-build the content, <b>10 screens prototyped in Figma</b>, then development follow-up in a 14-person Scrum team on PEGA.",
    "A portal redesigned with its users, plus an automated Jira form that centralizes requests and shortens ticket creation.", False),
   ("Servier","servier.png","Digital Solutions R&amp;D · 2026 – 27","One cockpit for R&amp;D teams, from Paris to Boston",
    "The Group's therapeutic projects are consolidated in FederateS, used mostly by R&amp;D teams in Paris, plus some users in Denmark and the United States.",
    "Scoping workshops, User Stories and acceptance criteria, Build &amp; Run backlog prioritization with the Global Digital Product Manager R&amp;D, functional testing.",
    "In progress since September 2026: I track adoption with the change management teams.", True)],
  now="In progress",
  map_eb="International", map_h="Where I have worked",
  map_p="Born in Morocco, educated in Senegal, based in Paris, with projects run alongside teams on three continents.",
  leg=[("life","Life and studies"),("sg","Société Générale CIB"),("sv","Servier · FederateS")],
  places={'paris':("Paris","Home base since 2024 · SG CIB, Banque de France, Servier (most FederateS users)"),'casa':("Casablanca","Born"),'tanger':("Tangier","Childhood"),
          'dakar':("Dakar","School, Groupe ISM, Socium"),'geneve':("Geneva","Middle Office · SG CIB"),'ny':("New York","Back and Middle Office · SG CIB"),
          'hk':("Hong Kong","Multi-region reporting · SG CIB"),'sg':("Singapore","Multi-region reporting · SG CIB"),'inde':("Bangalore","Copilot prompts adopted by the Middle Office · SG CIB"),
          'dk':("Copenhagen","FederateS users · Servier Denmark"),'us':("Boston","FederateS users · Servier US")},
  verify_h="Verifiable in one click", verify="Verify",
  vcf="Add to my contacts", vcf_s="Contact card", vcf_b="Save"),
}
GROUP={'paris':'life','casa':'life','tanger':'life','dakar':'life','geneve':'sg','ny':'sg','hk':'sg','sg':'sg','inde':'sg','dk':'sv','us':'sv'}
# label offsets (dx, dy, anchor) so neighbours don't collide
LAB={'paris':(-10,-10,'end'),'casa':(-10,4,'end'),'tanger':(-10,-6,'end'),'dakar':(-10,4,'end'),'geneve':(10,12,'start'),'ny':(10,16,'start'),
     'hk':(10,-6,'start'),'sg':(10,6,'start'),'inde':(-10,4,'end'),'dk':(10,-6,'start'),'us':(-10,-8,'end')}

CREDS=[  # (icon key or None, issuer, credential, url)
 (None,"Scrum.org","PSPO I","https://scrum.org/certificates/1315226"),
 ('credly',"Credly","Scrum","https://www.credly.com/badges/ede62ec0-d1aa-4aaa-98c6-04b83ef79f39/public_url"),
 ('googleanalytics',"Google","Analytics","https://skillshop.credential.net/a56c94ac-31a1-4987-8ab4-f5d9a0a9a92f#acc.ia8F5eMr"),
 ('googleads',"Google","Ads Search","https://skillshop.credential.net/b02a2168-d444-4a71-8c26-9c2f2db38956#acc.kMcCqrNf"),
 (None,"ETS","TOEIC 905/990","https://www.etsglobal.org/fr/en/digital-score-report/E430595A59037F8EA04AFA1673F43F11EB4D30E62DAF3528D4C0657716FF9C7AQjlQRnF3WndpU1dsM0Vqc2hSQk1zSEZIK0pCaHhyOU5NTXBrSThmOGJEMVBHQmEr"),
 ('credly',"Pendo","Product Management","https://www.credly.com/badges/d1a62d89-7d0a-42f5-9951-c7e7215e118a/public_url"),
 (None,"LinkedIn Learning","IA & leadership","https://www.linkedin.com/learning/certificates/dffedca4a00d6897c17f49f10fbc3d81ccae065b851adaeef1704003a8ce9f99"),
]
WORD={"Scrum.org":"Scrum.org","ETS":"ETS","LinkedIn Learning":"in"}

CSS = r"""
/* ==== ENH6: download affordance ==== */
.dl>summary{cursor:pointer;user-select:none}
.dl>summary::after{content:"";width:7px;height:7px;margin-left:2px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:translateY(-2px) rotate(45deg);transition:transform .25s}
.dl[open]>summary::after{transform:translateY(2px) rotate(-135deg)}
.hero .dl>summary.btn{border-color:color-mix(in srgb,var(--teal) 55%,var(--line))}
.hero .dl>summary.btn:hover,.hero .dl>summary.btn:focus-visible{background:var(--teal-soft);border-color:var(--teal);color:var(--teal);box-shadow:var(--shadow)}
.row .dl>summary.go:hover,.row .dl>summary.go:focus-visible{background:var(--sun);color:#1b1405}
.dl-menu a{cursor:pointer;position:relative;transition:background .2s,transform .2s}
.dl-menu a:not(.other)::after{content:"↓";position:absolute;right:12px;top:50%;transform:translateY(-50%);opacity:0;color:var(--teal);font-weight:700;transition:opacity .2s,transform .2s}
.dl-menu a:not(.other):hover::after{opacity:1;transform:translateY(-35%)}
.dl-menu a:hover{transform:translateX(2px)}
/* ==== ENH6: cases ==== */
.cases{display:grid;gap:18px}
.case{display:grid;grid-template-columns:260px 1fr;gap:0;overflow:hidden}
.case-h{padding:24px;border-right:1px solid var(--line);display:flex;flex-direction:column;gap:10px;background:color-mix(in srgb,var(--surface-2) 55%,transparent)}
.case-h .lg{align-self:flex-start;background:#fff;border-radius:10px;padding:7px 10px;height:40px;display:grid;place-items:center}
.case-h .lg img{height:26px;width:auto;max-width:150px}
.case-h .c{font-family:var(--mono);font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.case-h h3{font-size:1.15rem;line-height:1.25}
.case-h .now{align-self:flex-start;font-family:var(--mono);font-size:.7rem;padding:4px 9px;border-radius:999px;background:var(--sun-soft);color:var(--sun)}
.steps{display:grid;grid-template-columns:repeat(3,1fr);position:relative}
.stp{padding:24px 22px;position:relative}
.stp+.stp{border-left:1px dashed var(--line)}
.stp .n{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;border:1.5px solid var(--teal);color:var(--teal);font-family:var(--mono);font-size:.78rem;margin-bottom:10px;background:var(--surface);position:relative;z-index:1;transition:background .4s,color .4s}
.stp:last-child .n{border-color:var(--sun);color:var(--sun)}
.stp .l{display:block;font-family:var(--mono);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:6px}
.stp p b{display:inline}
.stp p{margin:0;color:var(--ink-2);font-size:.95rem;line-height:1.55}
.stp:last-child p{color:var(--ink)}
.steps::before{content:"";position:absolute;left:36px;right:36px;top:38px;height:2px;background:linear-gradient(90deg,var(--teal),var(--sun));transform-origin:left;transform:scaleX(0);transition:transform 1.4s cubic-bezier(.3,.7,.2,1) .2s;opacity:.55}
.case.go .steps::before{transform:scaleX(1)}
.case .stp{opacity:0;transform:translateY(12px);transition:opacity .6s,transform .6s cubic-bezier(.2,.8,.2,1)}
.case.go .stp{opacity:1;transform:none}
.case.go .stp:nth-child(2){transition-delay:.35s}.case.go .stp:nth-child(3){transition-delay:.7s}
.case.go .stp:last-child .n{background:var(--sun);color:#1b1405}
@media (max-width:900px){.case{grid-template-columns:1fr}.case-h{border-right:0;border-bottom:1px solid var(--line)}}
@media (max-width:700px){.steps{grid-template-columns:1fr}.stp+.stp{border-left:0;border-top:1px dashed var(--line)}.steps::before{display:none}.stp{display:grid;grid-template-columns:28px 1fr;column-gap:14px}.stp .n{grid-row:span 2;margin:0}.stp .l{margin-top:4px}}
/* ==== ENH6: map ==== */
:root{--sv:#5B6BD6}
:root[data-theme="dark"]{--sv:#8E9BF2}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--sv:#8E9BF2}}
.wmap{padding:18px 18px 14px;position:relative;overflow:hidden}
.wmap svg{width:100%;height:auto;display:block}
.wmap .land{fill:var(--surface-2);stroke:var(--surface);stroke-width:.5}
.wmap .arc{fill:none;stroke-width:1.8;stroke-linecap:round;opacity:.9;stroke-dasharray:var(--len);stroke-dashoffset:var(--len);transition:stroke-dashoffset 1.6s cubic-bezier(.3,.7,.2,1),opacity .3s}
.wmap.go .arc{stroke-dashoffset:0}
.wmap .g-life{--c:var(--sun)}.wmap .g-sg{--c:var(--teal)}.wmap .g-sv{--c:var(--sv)}
.wmap .arc{stroke:var(--c)}
.wmap .pt circle.d{fill:var(--c);stroke:var(--surface);stroke-width:2}
.wmap .pt circle.p{fill:none;stroke:var(--c);stroke-width:1.5;opacity:0;transform-box:fill-box;transform-origin:center}
.wmap.go .pt circle.p{animation:mpulse 2.6s ease-out infinite;animation-delay:calc(var(--k)*.22s + 1.2s)}
@keyframes mpulse{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(3.2)}}
.wmap .pt{opacity:0;transition:opacity .5s;transition-delay:calc(var(--k)*.12s + .6s);cursor:pointer}
.wmap.go .pt{opacity:1}
.wmap .pt text{font-family:var(--body);font-size:12.5px;font-weight:600;fill:var(--ink);paint-order:stroke;stroke:var(--surface);stroke-width:4px;stroke-linejoin:round}
.wmap.dim .g-life:not(.hl),.wmap.dim .g-sg:not(.hl),.wmap.dim .g-sv:not(.hl){opacity:.15}
.wmap-leg{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.wmap-leg button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;border:1px solid var(--line);font-size:.86rem;color:var(--ink-2)}
.wmap-leg button:hover,.wmap-leg button:focus-visible,.wmap-leg button[aria-pressed="true"]{border-color:var(--c);color:var(--ink)}
.wmap-leg i{width:10px;height:10px;border-radius:50%;background:var(--c)}
.wmap-tip{position:absolute;pointer-events:none;z-index:3;max-width:240px;padding:8px 11px;border-radius:10px;background:var(--ink);color:var(--bg);font-size:.82rem;line-height:1.35;opacity:0;transform:translate(-50%,calc(-100% - 12px));transition:opacity .2s}
.wmap-tip.on{opacity:1}
.wmap-tip b{display:block}
.wmap-list{display:none}
@media (max-width:700px){.wmap .pt text{font-size:20px}.wmap .pt text.minor{display:none}.wmap-list{display:grid;gap:6px;margin:12px 0 0;padding:0;list-style:none;font-size:.86rem;color:var(--ink-2)}.wmap-list li{display:flex;gap:8px;align-items:baseline}.wmap-list i{flex:none;width:8px;height:8px;border-radius:50%;background:var(--c);transform:translateY(-1px)}}
/* ==== ENH6: verifiable strip ==== */
.vstrip{margin:0 0 22px}
.vstrip h3{font-family:var(--mono);font-size:.74rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--teal);margin-bottom:12px}
.vgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.vtile{display:flex;flex-direction:column;gap:8px;padding:14px;border-radius:14px;border:1px solid var(--line);background:var(--surface);text-decoration:none;color:var(--ink);transition:border-color .25s,transform .3s cubic-bezier(.3,1.6,.5,1),box-shadow .25s}
.vtile:hover,.vtile:focus-visible{border-color:var(--teal);transform:translateY(-3px);box-shadow:var(--shadow);outline:none}
.vtile .ic{height:30px;display:flex;align-items:center}
.vtile .ic svg{height:26px;width:26px;fill:var(--ink-2);transition:fill .25s}
.vtile:hover .ic svg{fill:var(--teal)}
.vtile .ic .wm{font-family:var(--display);font-weight:800;font-size:1.05rem;letter-spacing:-.02em;color:var(--ink-2)}
.vtile .ic .wm.in{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:6px;background:var(--ink-2);color:var(--surface);font-size:.95rem}
.vtile b{font-size:.92rem;line-height:1.2}
.vtile small{color:var(--muted);font-size:.78rem}
.vtile .go{margin-top:auto;font-family:var(--mono);font-size:.7rem;color:var(--teal)}
@media (prefers-reduced-motion:reduce){.case .stp,.wmap .pt,.wmap .arc{transition:none!important;opacity:1!important;transform:none!important;stroke-dashoffset:0!important}.wmap .pt circle.p{animation:none!important}}
"""

JS = r"""
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function onView(els,cb,th){ if(!('IntersectionObserver' in window)||reduce){ els.forEach(cb); return; }
    var o=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ cb(e.target); o.unobserve(e.target);} }); },{threshold:th||.3}); els.forEach(function(e){o.observe(e)}); }
  onView([].slice.call(document.querySelectorAll('.case')),function(c){c.classList.add('go')},.25);
  var m=document.querySelector('.wmap'); if(!m) return;
  m.querySelectorAll('.arc').forEach(function(p){ p.style.setProperty('--len',Math.ceil(p.getTotalLength())+1); });
  onView([m],function(x){x.classList.add('go')},.25);
  var tip=m.querySelector('.wmap-tip');
  function show(pt,ev){ var r=m.getBoundingClientRect(), b=pt.querySelector('circle.d').getBoundingClientRect();
    tip.innerHTML='<b>'+pt.dataset.n+'</b>'+pt.dataset.d; tip.style.left=(b.left+b.width/2-r.left)+'px'; tip.style.top=(b.top-r.top)+'px'; tip.classList.add('on'); }
  m.querySelectorAll('.pt').forEach(function(pt){
    pt.addEventListener('pointerenter',function(e){show(pt,e)}); pt.addEventListener('pointerleave',function(){tip.classList.remove('on')});
    pt.addEventListener('click',function(e){show(pt,e)}); pt.addEventListener('focus',function(e){show(pt,e)}); pt.addEventListener('blur',function(){tip.classList.remove('on')});
  });
  var btns=[].slice.call(m.querySelectorAll('.wmap-leg button'));
  function hl(g){ m.classList.toggle('dim',!!g); m.querySelectorAll('.g-life,.g-sg,.g-sv').forEach(function(e){ e.classList.toggle('hl',!!g&&e.classList.contains('g-'+g)); }); btns.forEach(function(b){ b.setAttribute('aria-pressed',String(b.dataset.g===g)); }); }
  var cur=null;
  btns.forEach(function(b){ b.addEventListener('click',function(){ cur=cur===b.dataset.g?null:b.dataset.g; hl(cur); });
    if(matchMedia('(hover:hover)').matches){ b.addEventListener('pointerenter',function(){hl(b.dataset.g)}); b.addEventListener('pointerleave',function(){hl(cur)}); } });
})();
"""

def cases(t,pre):
    out=''
    for org,logo,ctx,title,p,a,r,now in t['cases']:
        steps=''.join('<div class="stp"><span class="n">%d</span><span class="l">%s</span><p>%s</p></div>'%(i+1,t['lbl'][i],x) for i,x in enumerate((p,a,r)))
        out+=('<article class="card case rv"><div class="case-h"><span class="lg" data-logo="'+org+'"><img src="%simg/logos/%s" alt="%s" loading="lazy"></span><span class="c">%s</span><h3>%s</h3>%s</div>'
              '<div class="steps">%s</div></article>')%(pre,logo,org,ctx,title,('<span class="now">%s</span>'%t['now']) if now else '',steps)
    return ('<!--ENH6:cases--><section class="block" id="cas"><div class="wrap"><div class="head rv"><div><span class="eyebrow">%s</span><h2>%s</h2></div><p>%s</p></div>'
            '<div class="cases">%s</div></div></section><!--/ENH6:cases-->')%(t['cases_eb'],t['cases_h'],t['cases_p'],out)

def wmap(t):
    W,H=MAP['W'],MAP['H']; pts=MAP['pts']; arcs=MAP['arcs']
    major={'paris','dakar','ny','inde','dk','us','hk','sg','casa'}
    order=['paris','casa','tanger','dakar','geneve','dk','ny','us','inde','hk','sg']
    a=''.join('<path class="arc g-%s" d="%s"/>'%(GROUP[k],arcs[k]) for k in order if k!='paris')
    p=''
    for i,k in enumerate(order):
        x,y=pts[k]; dx,dy,anc=LAB[k]; n,d=t['places'][k]
        p+=('<g class="pt g-%s" style="--k:%d" tabindex="0" role="img" aria-label="%s, %s" data-n="%s" data-d="%s">'
            '<circle class="p" cx="%s" cy="%s" r="5"/><circle class="d" cx="%s" cy="%s" r="%s"/>'
            '<text x="%s" y="%s" text-anchor="%s" class="%s">%s</text></g>')%(GROUP[k],i,n,d,n,d,x,y,x,y,7 if k=='paris' else 5,
            round(x+dx,1),round(y+dy,1),anc,'' if k in major else 'minor',n)
    leg=''.join('<button type="button" class="g-%s" data-g="%s" aria-pressed="false"><i></i>%s</button>'%(g,g,l) for g,l in t['leg'])
    lst=''.join('<li class="g-%s"><i></i><span><b>%s</b> · %s</span></li>'%(GROUP[k],t['places'][k][0],t['places'][k][1]) for k in order)
    return ('<!--ENH6:map--><section class="block" id="monde"><div class="wrap"><div class="head rv"><div><span class="eyebrow">%s</span><h2>%s</h2></div><p>%s</p></div>'
            '<div class="card wmap rv"><svg viewBox="0 0 %d %d" role="img" aria-label="%s"><path class="land" d="%s"/>%s%s</svg><div class="wmap-tip" role="status"></div>'
            '<div class="wmap-leg">%s</div><ul class="wmap-list">%s</ul></div></div></section><!--/ENH6:map-->')%(t['map_eb'],t['map_h'],t['map_p'],W,H,t['map_h'],MAP['d'],a,p,leg,lst)

def vstrip(t):
    tiles=''
    for ic,iss,cred,url in CREDS:
        if ic: icon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="%s"/></svg>'%ICONS[ic]
        else: w=WORD[iss]; icon='<span class="wm%s" aria-hidden="true">%s</span>'%(' in' if w=='in' else '',w)
        tiles+='<a class="vtile" href="%s" target="_blank" rel="noopener"><span class="ic">%s</span><b>%s</b><small>%s</small><span class="go">%s ↗</span></a>'%(url,icon,cred.replace('&','&amp;'),iss,t['verify'])
    return '<!--ENH6:vs--><div class="vstrip rv"><h3>%s</h3><div class="vgrid">%s</div></div><!--/ENH6:vs-->'%(t['verify_h'],tiles)

VCF_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5M18 8v6M15 11h6"/></svg>'

def run(path,lang):
    t=T[lang]; pre='../' if lang=='en' else ''
    s=open(path,encoding='utf-8').read()
    s=re.sub(r'/\* ==== ENH6-START ==== \*/.*?/\* ==== ENH6-END ==== \*/\n?','',s,flags=re.S)
    s=re.sub(r'<!--ENH6:(\w+)-->.*?<!--/ENH6:\1-->\n?','',s,flags=re.S)
    s=re.sub(r'\n?<script id="enh6">.*?</script>','',s,flags=re.S)
    s=s.replace('</style>','/* ==== ENH6-START ==== */'+CSS+'/* ==== ENH6-END ==== */\n</style>',1)
    # cases right before Projects (after the numbers section)
    i=s.index('<section class="block" id="projets">'); s=s[:i]+cases(t,pre)+s[i:]
    # map right before Experience (after Profile)
    i=s.index('<section class="block" id="parcours">'); s=s[:i]+wmap(t)+s[i:]
    # verifiable strip at the top of Certifications
    # vCard: contact row + quick read button
    c=s.index('<div class="chan">',s.index('id="contact"')); cend=s.index('</section>',c); last=s.rindex('</div>',c,cend)
    row='<!--ENH6:vrow--><div class="row"><div class="t"><small>%s</small><b>%s</b></div><a class="go" href="%scv/El_Mokhtar_Berrada.vcf" download>%s</a></div><!--/ENH6:vrow-->'%(t['vcf_s'],t['vcf'],pre,t['vcf_b'])
    s=s[:last]+row+s[last:]
    s=s.replace('<button type="button" class="btn" data-qclose>','<!--ENH6:qvcf--><a class="btn" href="%scv/El_Mokhtar_Berrada.vcf" download>%s%s</a><!--/ENH6:qvcf--><button type="button" class="btn" data-qclose>'%(pre,VCF_ICON,t['vcf']),1)
    s=s.replace('</body>','<script id="enh6">'+JS+'</script>\n</body>',1)
    open(path,'w',encoding='utf-8').write(s); print('ok',path)

run('index.html','fr'); run('en/index.html','en')
