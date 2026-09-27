# Company logos (timeline badges, marquee, quick read) + direct e-mail buttons. Idempotent; run last.
import re, json, urllib.parse

LOGOS = {  # organisation name as written in the .org line -> (file, monochrome file)
  "Servier": ("servier.png","servier.png"),
  "Société Générale CIB": ("sgcib.png","sgcib.png"),
  "Banque de France": ("bdf.png","bdf.png"),
  "Groupe ISM": ("ism.png","ism-line.png"),
  "Socium": ("socium.png","socium.png"),
  "NEOMA Business School": ("neoma.png","neoma.png"),
  "MBA ESG": ("esg.png","esg.png"),
  "PNUD": ("undp.png","undp-line.png"),
  "UNDP": ("undp.png","undp-line.png"),
  "Scrum.org": ("scrumorg.png","scrumorg.png"),
}
T = {
 'fr': dict(write="Écrire", subject="Prise de contact depuis votre CV interactif",
            body="Bonjour El Mokhtar,\n\n", mail_aria="Envoyer un e-mail à El Mokhtar"),
 'en': dict(write="Write", subject="Reaching out from your interactive CV",
            body="Hello El Mokhtar,\n\n", mail_aria="Send an email to El Mokhtar"),
}
MAIL = "elmokhtarberrada@gmail.com"

CSS = r"""
/* ==== ENH5: logos ==== */
.co.lg{background:#fff;border-color:transparent;padding:7px 10px;min-width:0;max-width:140px;height:44px}
.co.lg img{height:100%;width:auto;max-width:118px;object-fit:contain;display:block}
.co.lg.sq{padding:0;width:44px;overflow:hidden}
.co.lg.sq img{width:44px;height:44px;max-width:none;object-fit:cover}
.track span.ml img{height:clamp(22px,2.6vw,30px);width:auto;display:block;filter:brightness(0) invert(1);opacity:.72;transition:opacity .2s}
.track span.ml.tall img{height:clamp(30px,3.4vw,40px)}
:root:not([data-theme="dark"]) .track span.ml img{filter:brightness(0);opacity:.62}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .track span.ml img{filter:brightness(0) invert(1);opacity:.72}}
.marquee:hover .track span.ml img{opacity:.95}
.qv-path li .qlg{display:inline-grid;place-items:center;vertical-align:middle;height:20px;padding:2px 5px;margin-right:6px;border-radius:5px;background:#fff}
.qv-path li .qlg img{height:100%;width:auto;max-width:74px}
@media (max-width:760px){.co.lg{height:30px;padding:4px 7px;max-width:110px}.co.lg.sq{width:30px;padding:0}.co.lg.sq img{width:30px;height:30px}.co.lg img{max-width:96px}}
.school{position:relative}
.slg{position:absolute;top:18px;right:18px;height:38px;padding:6px 9px;border-radius:9px;background:#fff;display:grid;place-items:center;box-shadow:var(--shadow)}
.slg img{height:26px;width:auto;max-width:110px;display:block}
.slg.sq{padding:0;width:38px;overflow:hidden}.slg.sq img{width:38px;height:38px;max-width:none;object-fit:cover}
.school .yr{padding-right:130px;display:block}
.elg{float:right;margin:0 0 6px 12px;height:34px;border-radius:8px;overflow:hidden}
.elg img{height:34px;width:auto;display:block}
@media (max-width:560px){.slg{height:32px;top:14px;right:14px}.slg img{height:20px}.school .yr{padding-right:0;margin-top:44px}}
/* ==== ENH5: mail ==== */
.row .acts{display:flex;gap:6px;flex:none}
.row a.go.mail{background:var(--sun);color:#1b1405}
.row .dl>summary.go{display:inline-flex;align-items:center;gap:6px;font:600 .82rem var(--body);padding:8px 12px;border-radius:9px;background:var(--bg);color:var(--ink);cursor:pointer}
.row .dl>summary.go svg{width:15px;height:15px}
.row .dl-menu small{font-family:var(--body);text-transform:none;letter-spacing:0;opacity:1;font-size:.78rem}
.row .dl-menu a{color:var(--ink)}
.row b a{color:inherit;text-decoration:none;border-bottom:1px dashed color-mix(in srgb,currentColor 40%,transparent)}
"""

def run(path, lang):
    t=T[lang]; pre='../' if lang=='en' else ''
    s=open(path,encoding='utf-8').read()
    s=re.sub(r'/\* ==== ENH5-START ==== \*/.*?/\* ==== ENH5-END ==== \*/\n?','',s,flags=re.S)
    s=re.sub(r'\n?<script id="enh5">.*?</script>','',s,flags=re.S)
    s=s.replace('</style>','/* ==== ENH5-START ==== */'+CSS+'/* ==== ENH5-END ==== */\n</style>',1)

    # marquee: swap organisation names for monochrome logos (idempotent: plain spans disappear)
    for name,(_,mono) in LOGOS.items():
        cls='ml tall' if name in ('Banque de France','Groupe ISM','PNUD','UNDP','NEOMA Business School') else 'ml'
        s=s.replace('<span>%s</span>'%name,'<span class="%s"><img src="%simg/logos/%s" alt="%s" height="30"></span>'%(cls,pre,mono,name))
        s=s.replace('<span aria-hidden="true">%s</span>'%name,'<span class="%s" aria-hidden="true"><img src="%simg/logos/%s" alt="" height="30"></span>'%(cls,pre,mono))

    # mail: mailto with a pre-filled subject, everywhere the address is offered
    href='mailto:%s?subject=%s&amp;body=%s'%(MAIL,urllib.parse.quote(t['subject']),urllib.parse.quote(t['body']))
    s=re.sub(r'<b id="mail">(?:<a [^>]*>)?%s(?:</a>)?</b>'%re.escape(MAIL),'<b id="mail"><a href="%s">%s</a></b>'%(href,MAIL),s)
    s=re.sub(r'(?:<div class="acts">)?<button type="button" data-copy="mail">([^<]*)</button>(?:<a class="go mail"[^>]*>[^<]*</a></div>)?',
             lambda m:'<div class="acts"><button type="button" data-copy="mail">%s</button><a class="go mail" href="%s" aria-label="%s">%s</a></div>'%(m.group(1),href,t['mail_aria'],t['write']),s)
    s=re.sub(r'href="mailto:%s[^"]*"'%re.escape(MAIL),'href="%s"'%href,s)

    s=s.replace('</body>','<script id="enh5">'+JS.replace('__LOGOS__',json.dumps({k:pre+'img/logos/'+v[1] for k,v in LOGOS.items()},ensure_ascii=False))+'</script>\n</body>',1)
    open(path,'w',encoding='utf-8').write(s); print('ok',path)

JS = r"""
(function(){
  var L=__LOGOS__;
  /* timeline badges: real logos where we have them, monogram otherwise */
  document.querySelectorAll('.rel').forEach(function(r){
    var a=r.querySelector('.org a, .org b'), co=r.querySelector('.co'); if(!a||!co) return;
    var n=a.textContent.trim(), src=L[n]; if(!src) return;
    co.textContent=''; co.classList.add('lg'); co.dataset.logo=n; if(/ism\.png$/.test(src)) co.classList.add('sq');
    var im=new Image(); im.src=src; im.alt=''; im.decoding='async'; co.appendChild(im); co.title=n;
  });
  /* education cards: school logo in the corner */
  document.querySelectorAll('.school').forEach(function(c){
    var a=c.querySelector('.sn a'); if(!a||c.querySelector('.slg')) return; var src=L[a.textContent.trim()]; if(!src) return;
    var s=document.createElement('span'); s.className='slg'; s.dataset.logo=a.textContent.trim(); s.setAttribute('aria-hidden','true');
    var im=new Image(); im.src=src; im.alt=''; s.appendChild(im); c.appendChild(s);
  });
  /* UN volunteer card */
  document.querySelectorAll('.eng-list .card.en h3').forEach(function(h){
    if(!/PNUD|UNDP/.test(h.textContent)||h.parentNode.querySelector('.elg')) return;
    var s=document.createElement('span'); s.className='elg'; s.setAttribute('aria-hidden','true'); var im=new Image(); im.src=L['PNUD']; im.alt=''; s.appendChild(im); h.parentNode.insertBefore(s,h.parentNode.firstChild);
  });
})();
"""

run('index.html','fr'); run('en/index.html','en')
