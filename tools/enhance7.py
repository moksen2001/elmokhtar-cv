# White/monochrome logos everywhere, timeline alignment, performance attributes. Idempotent; run last.
import re

CSS = r"""
/* ==== ENH7: monochrome logos ==== */
:root{--lf:brightness(0) invert(1);--lo:.84}
:root[data-theme="light"]{--lf:brightness(0);--lo:.74}
.co.lg{display:inline-block;background:none;border:0;box-shadow:none;padding:0;height:auto;min-width:0;max-width:140px;margin-top:14px;border-radius:0}
.co.lg img{display:block;height:22px;width:auto;max-width:140px;filter:var(--lf);opacity:var(--lo);margin-left:auto}
.co.lg[data-logo="Banque de France"] img{height:40px}
.co.lg[data-logo="Groupe ISM"] img{height:32px}
.co.lg[data-logo="Société Générale CIB"] img{height:24px}
.co.lg[data-logo="Servier"] img{height:24px}
.slg{background:none;box-shadow:none;padding:0;height:auto;border-radius:0}
.slg img{height:26px;width:auto;max-width:130px;filter:var(--lf);opacity:var(--lo)}
.slg[data-logo="Groupe ISM"] img{height:34px}
.slg[data-logo="NEOMA Business School"] img{height:32px}
.elg{border-radius:0}.elg img{height:30px;filter:var(--lf);opacity:var(--lo)}
.case-h .lg{background:none;padding:0;height:auto;border-radius:0}
.case-h .lg img{height:24px;filter:var(--lf);opacity:var(--lo)}
.case-h .lg[data-logo="Banque de France"] img{height:40px}
.qv-path li .qlg{background:none;padding:0;height:auto;margin-right:8px;border-radius:0}
.qv-path li .qlg img{height:13px;max-width:70px;filter:var(--lf);opacity:var(--lo)}
.qv-path li .qlg[data-logo="Banque de France"] img{height:20px}
@media (max-width:560px){.slg img,.slg[data-logo] img{height:20px}.slg[data-logo="Groupe ISM"] img{height:26px}.school .yr{margin-top:34px}}
@media (max-width:760px){.co.lg{margin-top:0}.co.lg img,.co.lg[data-logo] img{height:18px;max-width:110px}.co.lg[data-logo="Banque de France"] img{height:28px}.co.lg[data-logo="Groupe ISM"] img{height:24px}}
/* ==== ENH7: timeline alignment (line, dots, head and ring share one centre) ==== */
.rel .body::before{box-sizing:border-box;width:16px;height:16px;border-width:2px;left:-22px;top:30px}
.xp::before,.xp-fill{left:163px;width:2px}
.xp-head{left:164px}
.rel .ring{box-sizing:border-box;width:26px;height:26px;left:-27px;top:25px}
@media (max-width:760px){
  .rel .body::before{left:-25px;top:-22px}
  .xp::before,.xp-fill{left:4px}
  .xp-head{left:5px}
  .rel .ring{left:-30px;top:-27px}
}
"""

def run(path):
    s=open(path,encoding='utf-8').read()
    s=re.sub(r'/\* ==== ENH7-START ==== \*/.*?/\* ==== ENH7-END ==== \*/\n?','',s,flags=re.S)
    s=s.replace('</style>','/* ==== ENH7-START ==== */'+CSS+'/* ==== ENH7-END ==== */\n</style>',1)
    # performance: LCP portrait first, async decode for lazy images, light thumbnails for certificate cards
    s=re.sub(r'(<div class="photo"><img [^>]*?)(?: fetchpriority="high")?>',r'\1 fetchpriority="high">',s,count=1)
    s=re.sub(r'<img ([^>]*?)loading="lazy"(?! decoding)',r'<img \1loading="lazy" decoding="async"',s)
    s=re.sub(r'(<button class="th" type="button" data-img="((?:\.\./)?img/c-[a-z]+))\.jpg("[^>]*>)<img src="\2\.jpg"',r'\1.jpg\3<img src="\2-t.jpg"',s)
    open(path,'w',encoding='utf-8').write(s); print('ok',path)

run('index.html'); run('en/index.html')
