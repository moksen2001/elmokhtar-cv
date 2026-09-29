#!/usr/bin/env python3
"""ENH10 - app-style mobile experience (<= 760px) + initials-only brand.

- bottom tab bar (Accueil / Parcours / Projets / Compétences / Contact) with active state
- compact header (initials, theme, language), top nav hidden on phones
- swipeable carousels for key figures, projects, skills and education
- dialogs open as bottom sheets
Idempotent: removes its own markers before re-injecting. Runs after enhance9.
"""
import re

I = {
    "home": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
    "xp": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
    "proj": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/></svg>',
    "sk": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.4 5.2L20 9l-4.2 3.9L17 18.5 12 15.8 7 18.5l1.2-5.6L4 9l5.6-.8z"/></svg>',
    "mail": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
}
LBL = {
    "fr": [("accueil", "home", "Accueil"), ("parcours", "xp", "Parcours"), ("projets", "proj", "Projets"),
           ("competences", "sk", "Compétences"), ("contact", "mail", "Contact")],
    "en": [("accueil", "home", "Home"), ("parcours", "xp", "Experience"), ("projets", "proj", "Projects"),
           ("competences", "sk", "Skills"), ("contact", "mail", "Contact")],
}

CSS = """<style id="enh10">
/* ==== ENH10: initials-only brand + app-style mobile ==== */
.brand .full{display:none!important}
.tabbar{display:none}
@media (max-width:760px){
  body{padding-bottom:calc(74px + env(safe-area-inset-bottom,0px))}
  /* compact app header */
  nav.links{display:none!important}
  .top .wrap{flex-wrap:nowrap;height:56px;padding-block:0}
  /* bottom tab bar */
  .tabbar{display:grid;grid-template-columns:repeat(5,1fr);position:fixed;left:0;right:0;bottom:0;z-index:70;
    padding:6px 4px calc(6px + env(safe-area-inset-bottom,0px));
    background:color-mix(in srgb,var(--bg) 84%,transparent);-webkit-backdrop-filter:saturate(1.6) blur(18px);backdrop-filter:saturate(1.6) blur(18px);
    border-top:1px solid var(--line)}
  .tabbar a{display:flex;flex-direction:column;align-items:center;gap:3px;padding:5px 0 3px;font:500 10.5px/1.1 var(--body);color:var(--muted);text-decoration:none;-webkit-tap-highlight-color:transparent}
  .tabbar svg{width:23px;height:23px;transition:transform .2s}
  .tabbar a.on{color:var(--teal)}
  .tabbar a.on svg{transform:translateY(-1px)}
  .tabbar a:active svg{transform:scale(.9)}
  .hire-float{bottom:calc(84px + env(safe-area-inset-bottom,0px))}
  .hire-float:not(.on){transform:translate(-50%,calc(100% + 110px));visibility:hidden}
  /* hero: compact, one screen */
  .hero{padding-block:22px 18px}
  .portrait{margin-bottom:16px}
  .portrait .photo{width:92px;height:92px}
  .hero h1{margin-top:8px}
  .lede{font-size:1.08rem;margin-top:16px}
  .hero-sub{display:none}
  .cta{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;margin-top:22px}
  .cta>*{min-width:0}
  .cta .btn,.cta .dl>summary{width:100%;justify-content:center;padding:13px 8px;font-size:.84rem;white-space:nowrap;gap:6px}
  .cta .btn.primary{grid-column:1/-1;font-size:.95rem;padding-block:15px}
  .cta .quick-btn svg,.cta .dl>summary>svg:first-child{display:none}
  .cta a.btn[href*="linkedin"],.cta a.btn[href="#contact"]{display:none}
  /* sections feel like app screens */
  section.block{padding-block:44px 4px}
  .head h2,section.block h2{font-size:2rem}
  .head p{font-size:.95rem}
  /* swipeable carousels */
  .tldr,.projects,.skills,.edu{display:flex!important;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;
    margin-inline:-20px;padding:4px 20px 16px;scroll-padding-inline:20px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .tldr::-webkit-scrollbar,.projects::-webkit-scrollbar,.skills::-webkit-scrollbar,.edu::-webkit-scrollbar{display:none}
  .tldr>div,.projects>.proj,.skills>.sk,.edu>.school{flex:0 0 84%;scroll-snap-align:start}
  .tldr{border:0;border-radius:0;background:none;margin-top:28px}
  .tldr>div{background:var(--surface);border:1px solid var(--line)!important;border-radius:18px}
  .tldr>div{flex-basis:62%}
  .tldr .rv,.projects .rv,.skills .rv,.edu .rv,.tldr.rv{opacity:1!important;transform:none!important}
  .projects>.proj{grid-column:auto}
  /* dialogs as bottom sheets */
  dialog{width:100vw;max-width:100vw;margin:auto 0 0;border-radius:22px 22px 0 0;max-height:92vh}
  dialog::before{content:"";position:sticky;display:block;top:0;margin:8px auto 0;width:38px;height:5px;border-radius:3px;background:var(--line);z-index:5}
}
</style>"""

JS = """<script id="enh10">(function(){
  var bar=document.querySelector('.tabbar'); if(!bar||!('IntersectionObserver' in window)) return;
  var tabs={}; [].forEach.call(bar.querySelectorAll('a'),function(a){ tabs[a.dataset.t]=a; });
  var group={profil:'accueil',monde:'parcours',parcours:'parcours',chiffres:'parcours',cas:'parcours',projets:'projets',temoignages:'projets',
    formation:'competences',certifications:'competences',competences:'competences',ia:'competences',engagements:'competences',contact:'contact'};
  function set(k){ for(var t in tabs) tabs[t].classList.toggle('on',t===k); }
  var hero=document.querySelector('.hero'); if(hero) hero.dataset.tab='accueil';
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) set(e.target.dataset.tab||group[e.target.id]); }); },{rootMargin:'-40% 0px -55% 0px'});
  if(hero) io.observe(hero);
  Object.keys(group).forEach(function(id){ var el=document.getElementById(id); if(el) io.observe(el); });
  set('accueil');
  tabs.accueil && tabs.accueil.addEventListener('click',function(ev){ ev.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}); });
})();</script>"""


def tabbar(lang):
    items = "".join('<a href="#%s" data-t="%s">%s<span>%s</span></a>' % (h, h, I[ic], l) for h, ic, l in LBL[lang])
    aria = "Navigation principale" if lang == "fr" else "Main navigation"
    return '<!--ENH10:tab--><nav class="tabbar" aria-label="%s">%s</nav><!--/ENH10:tab-->' % (aria, items)


def run(path, lang):
    s = open(path, encoding="utf-8").read()
    s = re.sub(r'\s*<style id="enh10">.*?</style>', "", s, flags=re.S)
    s = re.sub(r'<!--ENH10:tab-->.*?<!--/ENH10:tab-->\n?', "", s, flags=re.S)
    s = re.sub(r'<script id="enh10">.*?</script>\n?', "", s, flags=re.S)
    i = s.index("</head>"); s = s[:i] + CSS + "\n" + s[i:]
    i = s.rindex("</body>"); s = s[:i] + tabbar(lang) + "\n" + JS + "\n" + s[i:]
    open(path, "w", encoding="utf-8").write(s)


run("index.html", "fr"); run("en/index.html", "en")
print("enhance10: mobile app layer applied")
