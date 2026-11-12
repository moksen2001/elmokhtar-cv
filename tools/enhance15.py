#!/usr/bin/env python3
"""ENH15 - performance. Runs after enhance14.py; idempotent.

- fonts self-hosted (2 variable woff2, preloaded) instead of Google Fonts: no third-party request
- WebP for every site image that has a .webp sibling (see tools/webp.py); link previews keep their JPEG
- light portrait (336px) for the 112px avatar, explicit decode/lazy hints
- service worker (sw.js): offline copy, images and fonts served from cache on repeat visits
- demo pages prefetched when the pointer approaches their link; cross-page fade (View Transitions)
"""
import re, os, sys
ROOT=os.path.join(os.path.dirname(__file__),'..')

def head(pre):
    return ('<!--ENH15-->'
     f'<link rel="preload" href="{pre}fonts/inter-tight-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>'
     f'<link rel="preload" href="{pre}fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>'
     '<style id="enh15">'
     f'@font-face{{font-family:"Inter Tight";font-style:normal;font-weight:100 900;font-display:swap;src:url({pre}fonts/inter-tight-latin-wght-normal.woff2) format("woff2")}}'
     f'@font-face{{font-family:"Inter";font-style:normal;font-weight:100 900;font-display:swap;src:url({pre}fonts/inter-latin-wght-normal.woff2) format("woff2")}}'
     '@view-transition{navigation:auto}'
     '@media (prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}'
     '</style>'
     '<script type="speculationrules">{"prefetch":[{"where":{"href_matches":"/elmokhtar-cv/*"},"eagerness":"moderate"}]}</script>'
     f'<script id="enh15-sw">if("serviceWorker" in navigator&&location.protocol==="https:")addEventListener("load",function(){{navigator.serviceWorker.register("{pre}sw.js").catch(function(){{}})}})</script>'
     '<!--/ENH15-->')

def webp(s,pre):
    def sub(m):
        path=m.group(1)
        return (os.path.splitext(path)[0]+'.webp') if os.path.exists(os.path.join(ROOT,os.path.splitext(path)[0]+'.webp')) else path
    out=[]
    # skip <meta>, <link> and JSON-LD: crawlers want JPEG/PNG
    for part in re.split(r'(<meta[^>]*>|<link[^>]*>|<script type="application/ld\+json">.*?</script>)',s,flags=re.S):
        if part.startswith(('<meta','<link','<script type="application/ld+json"')): out.append(part); continue
        out.append(re.sub(r'(?<![\w-])(img/[\w./-]+?\.(?:jpg|png))',sub,part))
    s=''.join(out)
    s=s.replace("'img/preview/'+k+'.jpg'","'img/preview/'+k+'.webp'")
    return s

def strip(s):
    """Back to the pre-ENH15 state so that earlier scripts always see the markup they expect."""
    s=re.sub(r'<!--ENH15-->.*?<!--/ENH15-->\n?','',s,flags=re.S)
    s=re.sub(r'(<img src="[^"]*img/portrait-s\.webp" alt="[^"]*") width="336" height="448"',r'\1 width="574" height="766"',s)
    s=s.replace('img/portrait-s.webp','img/portrait.jpg')
    def back(m):
        base=m.group(1)
        return base+('.jpg' if os.path.exists(os.path.join(ROOT,base+'.jpg')) else '.png')
    s=re.sub(r'(?<![\w-])(img/[\w./-]+?)\.webp',back,s)
    return s.replace("'img/preview/'+k+'.webp'","'img/preview/'+k+'.jpg'")

for rel,pre in (('index.html',''),('en/index.html','../')):
    f=os.path.join(ROOT,rel); s=strip(open(f,encoding='utf-8').read())
    if '--strip' in sys.argv:
        open(f,'w',encoding='utf-8').write(s); continue
    s=re.sub(r'<link rel="preconnect" href="https://fonts\.(?:googleapis|gstatic)\.com"[^>]*>\n?','',s)
    s=re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/[^>]*>\n?','',s)
    s=webp(s,pre)
    s=s.replace('img/portrait.webp','img/portrait-s.webp')
    s=re.sub(r'(<img src="[^"]*img/portrait-s\.webp" alt="[^"]*") width="574" height="766"',r'\1 width="336" height="448"',s)
    s=s.replace('</head>',head(pre)+'\n</head>',1)
    open(f,'w',encoding='utf-8').write(s)
    print('enh15',rel,len(s.encode()))
