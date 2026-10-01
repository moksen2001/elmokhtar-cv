# "30-second read" overlay + links to the static Focal-Shift demo. Idempotent; run after enhance3.py.
import re, json

T = {
 'fr': dict(
  btn="Lecture rapide · 30 s", btn_aria="Lecture rapide : mon profil en 30 secondes", close="Fermer", full="Voir le site complet",
  kicker="Lecture rapide · 30 secondes", title="El Mokhtar Berrada",
  who="Proxy Product Owner chez <b>Servier</b> (R&amp;D, 2<sup>e</sup> groupe pharmaceutique français), en alternance jusqu'en septembre 2027. En MSc Management de Projet à NEOMA.",
  strengths_h="Ce que j'apporte",
  strengths=[("Produit &amp; Agile","User Stories, backlog Build &amp; Run, recette, suivi de l'adoption. Certifié PSPO I."),
             ("IA &amp; automatisation","−30 % de temps de traitement à SG CIB, prompts Copilot adoptés à Paris, Genève et Bangalore, finaliste du hackathon GBIS (80+ équipes)."),
             ("UX &amp; transformation","Refonte UX/UI à la Banque de France (10 écrans Figma), prototypes Focal-Shift et Yema.")],
  path_h="Parcours",
  path=[("2026 – 27","Servier","Proxy Product Owner · Digital Solutions R&amp;D"),
        ("2025 – 26","Société Générale CIB","Assistant Product Owner IA · Trade Finance"),
        ("2025","Banque de France","Chargé de projet digital · DGSI, Case Management"),
        ("2022 – 23","Socium","Stagiaire puis chargé de projet multimédia · Dakar"),
        ("2021 – 23","Groupe ISM","Communication digitale, promu coach · Dakar")],
  edu_h="Formation", edu="MSc Management de Projet, NEOMA (2026 – 27) · MBA Stratégie Digitale, MBA ESG (2024 – 26) · Licence informatique, Groupe ISM",
  lang_h="Langues", lang="Français · Anglais (TOEIC 905/990) · Arabe marocain · Wolof",
  cv="Télécharger mon CV", cvfile="cv/CV_El_Mokhtar_Berrada_FR_clair.pdf", mail="M'écrire",
  demo="Tester la démo", demo_note="Le prototype repensé en application : site web sur ordinateur, vraie app sur téléphone. Louer ou acheter du matériel photo et vidéo, publier un besoin et comparer les offres des propriétaires, questionnaire de conseil, simulateur de revenus pour les propriétaires. Photos réelles sous licence libre, paiement simulé."),
 'en': dict(
  btn="Quick read · 30 s", btn_aria="Quick read: my profile in 30 seconds", close="Close", full="See the full site",
  kicker="Quick read · 30 seconds", title="El Mokhtar Berrada",
  who="Proxy Product Owner at <b>Servier</b> (R&amp;D, France's 2<sup>nd</sup>-largest pharmaceutical group), on a work-study contract until September 2027. MSc in Project Management at NEOMA.",
  strengths_h="What I bring",
  strengths=[("Product &amp; Agile","User Stories, Build &amp; Run backlog, acceptance testing, adoption tracking. PSPO I certified."),
             ("AI &amp; automation","−30% processing time at SG CIB, Copilot prompts adopted in Paris, Geneva and Bangalore, finalist of the GBIS hackathon (80+ teams)."),
             ("UX &amp; transformation","UX/UI redesign at Banque de France (10 Figma screens), Focal-Shift and Yema prototypes.")],
  path_h="Experience",
  path=[("2026 – 27","Servier","Proxy Product Owner · Digital Solutions R&amp;D"),
        ("2025 – 26","Société Générale CIB","Assistant Product Owner, AI · Trade Finance"),
        ("2025","Banque de France","Digital Project Officer · IT Dept, Case Management"),
        ("2022 – 23","Socium","Intern, then Multimedia Project Officer · Dakar"),
        ("2021 – 23","Groupe ISM","Digital communication, promoted to coach · Dakar")],
  edu_h="Education", edu="MSc in Project Management, NEOMA (2026 – 27) · MBA in Digital Strategy, MBA ESG (2024 – 26) · BSc Business Information Systems, Groupe ISM",
  lang_h="Languages", lang="French · English (TOEIC 905/990) · Moroccan Arabic · Wolof",
  cv="Download my CV", cvfile="cv/CV_El_Mokhtar_Berrada_EN_light.pdf", mail="Email me",
  demo="Try the demo", demo_note="The prototype redesigned as an app (in French): a website on desktop, a real app on phones. Rent or buy photo and video gear, post a need and compare owners' offers, an advice questionnaire, a revenue simulator for owners. Real freely licensed photos, simulated payment."),
}

CSS = r"""
/* ==== ENH4: quick read ==== */
@media (min-width:861px) and (max-width:1180px){.brand .full{display:none}}
.quick-btn{border-color:color-mix(in srgb,var(--sun) 55%,var(--line));color:var(--sun);font-family:var(--mono);font-size:.85rem}
.quick-btn:hover{background:var(--sun);border-color:var(--sun);color:#1b1405}
.quick-btn:hover svg{transform:none}
html.qopen{overflow:hidden}
.qv{position:fixed;inset:0;z-index:300;display:grid;place-items:center;padding:16px;background:color-mix(in srgb,#000 55%,transparent);opacity:0;pointer-events:none;transition:opacity .3s}
.qv.on{opacity:1;pointer-events:auto}
.qv-p{position:relative;width:min(760px,100%);max-height:calc(100dvh - 32px);overflow:auto;overscroll-behavior:contain;background:var(--surface);border:1px solid var(--line);border-radius:22px;box-shadow:0 30px 80px -20px rgba(0,0,0,.6);padding:26px 28px 24px;transform:translateY(24px) scale(.97);transition:transform .45s cubic-bezier(.2,1.2,.3,1)}
.qv.on .qv-p{transform:none}
.qv-bar{position:sticky;top:-26px;margin:-26px -28px 18px;height:4px;background:var(--line);border-radius:22px 22px 0 0;overflow:hidden;z-index:2}
.qv-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--teal),var(--sun));transform-origin:left;transform:scaleX(0)}
.qv.on .qv-bar i{animation:qfill 30s linear forwards}
@keyframes qfill{to{transform:scaleX(1)}}
.qv-x{all:unset;position:absolute;right:16px;top:16px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;cursor:pointer;border:1px solid var(--line);color:var(--ink-2);z-index:3;background:var(--surface)}
.qv-x:focus-visible{outline:2px solid var(--teal)}
.qv-top{display:flex;gap:16px;align-items:center;padding-right:40px}
.qv-top img{width:64px;height:64px;border-radius:16px;object-fit:cover;object-position:top}
.qv-top .k{font-family:var(--mono);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--sun)}
.qv-top h2{font-size:1.6rem;margin:2px 0 0;line-height:1.1}
.qv-who{margin:14px 0 0;color:var(--ink-2);font-size:1rem;line-height:1.55}
.qv h3{font-family:var(--mono);font-size:.72rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--teal);margin:20px 0 10px}
.qv-str{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.qv-str div{padding:12px 14px;border-radius:14px;background:var(--surface-2);font-size:.88rem;line-height:1.45;color:var(--ink-2)}
.qv-str b{display:block;color:var(--ink);font-size:.95rem;margin-bottom:4px}
.qv-path{list-style:none;margin:0;padding:0;display:grid;gap:7px}
.qv-path li{display:grid;grid-template-columns:78px 1fr;gap:12px;font-size:.92rem;align-items:baseline}
.qv-path time{font-family:var(--mono);font-size:.74rem;color:var(--muted)}
.qv-path b{color:var(--ink)}
.qv-path span{color:var(--ink-2)}
.qv-2{display:grid;grid-template-columns:1fr 1fr;gap:4px 22px}
.qv-2 p{margin:0;font-size:.9rem;color:var(--ink-2);line-height:1.5}
.qv-act{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px;padding-top:18px;border-top:1px solid var(--line)}
.qv-act .btn svg{width:17px;height:17px}
.qv .st{opacity:0;transform:translateY(10px)}
.qv.on .st{animation:qin .5s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(var(--s)*70ms + 120ms)}
@keyframes qin{to{opacity:1;transform:none}}
@media (max-width:640px){
  .qv{padding:0;place-items:end center}
  .qv-p{border-radius:22px 22px 0 0;max-height:92dvh;padding:22px 18px 18px}
  .qv-bar{margin:-22px -18px 16px;top:-22px}
  .qv-str,.qv-2{grid-template-columns:1fr}
  .qv-top h2{font-size:1.35rem}
}
@media (prefers-reduced-motion:reduce){.qv .st{opacity:1;transform:none;animation:none!important}.qv-p{transition:none}.qv.on .qv-bar i{animation:none;transform:scaleX(1)}}
/* ==== ENH4: demo link ==== */
.demo-cta{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin:14px 0 4px;padding:14px 16px;border-radius:14px;border:1px dashed color-mix(in srgb,var(--sun) 60%,var(--line));background:color-mix(in srgb,var(--sun) 7%,transparent)}
.demo-cta p{margin:0;flex:1 1 240px;font-size:.88rem;color:var(--ink-2)}
.demo-cta .btn{background:var(--sun);border-color:var(--sun);color:#1b1405}
"""

JS = r"""
(function(){
  var qv=document.querySelector('.qv'), b=document.querySelector('.quick-btn'); if(!qv||!b) return;
  var root=document.documentElement, last=null;
  function open(){ last=document.activeElement; qv.hidden=false; void qv.offsetWidth; qv.classList.add('on'); root.classList.add('qopen'); qv.querySelector('.qv-x').focus({preventScroll:true}); }
  function close(){ qv.classList.remove('on'); root.classList.remove('qopen'); setTimeout(function(){ qv.hidden=true; },300); if(last&&last.focus) last.focus({preventScroll:true}); }
  b.addEventListener('click',open);
  qv.addEventListener('click',function(e){ if(e.target===qv||e.target.closest('.qv-x,[data-qclose]')) close(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&qv.classList.contains('on')) close(); });
  var cp=qv.querySelector('[data-mail]'); if(cp) cp.addEventListener('click',function(){ try{ navigator.clipboard.writeText(cp.dataset.mail); }catch(e){} });
  if(/[?&]quick\b/.test(location.search)||location.hash==='#30s') setTimeout(open,400);
})();
"""

BOLT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>'
DL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>'
IN='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>'

def overlay(t,pre):
    s=0
    def st():
        nonlocal s; s+=1; return ' class="st" style="--s:%d"'%s
    strengths=''.join('<div><b>%s</b>%s</div>'%(a,b) for a,b in t['strengths'])
    path=''.join('<li><time>%s</time><div><b>%s</b> · <span>%s</span></div></li>'%x for x in t['path'])
    return ('<!--ENH4:qv--><div class="qv" hidden role="dialog" aria-modal="true" aria-labelledby="qv-t"><div class="qv-p">'
      '<div class="qv-bar" aria-hidden="true"><i></i></div><button type="button" class="qv-x" aria-label="%s">✕</button>'
      '<div class="qv-top"%s><img src="%simg/portrait.jpg" alt=""><div><div class="k">%s</div><h2 id="qv-t">%s</h2></div></div>'
      '<p class="qv-who"%s>%s</p>'
      '<div%s><h3>%s</h3><div class="qv-str">%s</div></div>'
      '<div%s><h3>%s</h3><ul class="qv-path">%s</ul></div>'
      '<div class="qv-2"><div%s><h3>%s</h3><p>%s</p></div><div%s><h3>%s</h3><p>%s</p></div></div>'
      '<div class="qv-act"%s><a class="btn primary" href="%s%s" download>%s%s</a><a class="btn" href="https://www.linkedin.com/in/elmokhtar-berrada/" target="_blank" rel="noopener">%sLinkedIn</a>'
      '<a class="btn" href="mailto:elmokhtarberrada@gmail.com">%s</a><button type="button" class="btn" data-qclose>%s</button></div>'
      '</div></div><!--/ENH4:qv-->')%(t['close'],st(),pre,t['kicker'],t['title'],st(),t['who'],st(),t['strengths_h'],strengths,st(),t['path_h'],path,
        st(),t['edu_h'],t['edu'],st(),t['lang_h'],t['lang'],st(),pre,t['cvfile'],DL,t['cv'],IN,t['mail'],t['full'])

def run(path,lang):
    t=T[lang]; pre='../' if lang=='en' else ''
    s=open(path,encoding='utf-8').read()
    s=re.sub(r'/\* ==== ENH4-START ==== \*/.*?/\* ==== ENH4-END ==== \*/\n?','',s,flags=re.S)
    s=re.sub(r'<!--ENH4:(\w+)-->.*?<!--/ENH4:\1-->\n?','',s,flags=re.S)
    s=re.sub(r'\n?<script id="enh4">.*?</script>','',s,flags=re.S)
    s=s.replace('</style>','/* ==== ENH4-START ==== */'+CSS+'/* ==== ENH4-END ==== */\n</style>',1)
    # hero CTA row, right after the primary "see my path" button, alongside LinkedIn / contact / CV
    qb='<!--ENH4:qb--><button type="button" class="btn quick-btn" aria-label="%s" title="%s">%s<span>%s</span></button><!--/ENH4:qb-->'%(t['btn_aria'],t['btn_aria'],BOLT,t['btn'])
    s=re.sub(r'(<a class="btn primary" href="#parcours">.*?</a>)',lambda m:m.group(1)+qb,s,count=1,flags=re.S)
    # overlay before </body>
    s=s.replace('</body>',overlay(t,pre)+'\n</body>',1)
    # Focal-Shift panel: demo call-to-action right after the meta line
    fi=s.index('<div id="p-focal"'); mi=s.index('<div class="meta">',fi); me=s.index('</div>',mi)+6
    cta='<!--ENH4:demo--><div class="demo-cta"><p>%s</p><a class="btn" href="%sfocal-shift-demo/" target="_blank" rel="noopener">%s ↗</a></div><!--/ENH4:demo-->'%(t['demo_note'],pre,t['demo'])
    s=s[:me]+cta+s[me:]
    s=s.replace('</body>','<script id="enh4">'+JS+'</script>\n</body>',1)
    open(path,'w',encoding='utf-8').write(s); print('ok',path)

run('index.html','fr'); run('en/index.html','en')
