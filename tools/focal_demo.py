# Builds a static, clickable demo of the Focal-Shift prototype from the locally running PHP site.
# Usage: python3 tools/focal_demo.py  (PHP server on 127.0.0.1:8081 serving /focal-shift/)
import re, html, os, shutil, urllib.request, urllib.parse
from collections import deque

BASE = 'http://127.0.0.1:8081/focal-shift/'
SRC  = '/tmp/claude-0/fs/Focal Shift/site/focal-shift/'
OUT  = os.path.join(os.path.dirname(__file__), '..', 'focal-shift-demo')
CRAWL = {'index','catalogue','produit','comment-ca-marche','conseil','inspiration','demande','confidentialite'}
DROP_PARAMS = {'debut','fin','page','tri'}
MAX = 90

def key(u):
    """normalise a site-relative url into (page, sorted params) or None"""
    u = html.unescape(u)
    if u.startswith(('http','data:','mailto:','tel:','#','javascript')): return None
    p = urllib.parse.urlsplit(u)
    path = p.path.split('/')[-1] or 'index.php'
    if not path.endswith('.php'): return None
    page = path[:-4]
    qs = [(k,v) for k,v in urllib.parse.parse_qsl(p.query, keep_blank_values=True) if k not in DROP_PARAMS]
    return page, tuple(sorted(qs))

def fname(k):
    page, qs = k
    if not qs: return page + '.html'
    slug = '-'.join(re.sub(r'[^a-z0-9]+','', (a.replace('[]','')+v).lower()) for a,v in qs)
    return f'{page}-{slug}.html'[:120]

def url(k):
    page, qs = k
    return BASE + page + '.php' + ('?' + urllib.parse.urlencode(qs) if qs else '')

def fetch(u):
    with urllib.request.urlopen(u, timeout=20) as r: return r.read().decode('utf-8')

seen, pages = set(), {}
q = deque([('index',()), ('catalogue',(('mode','achat'),)), ('catalogue',(('mode','location'),)),
           ('conseil',()), ('comment-ca-marche',()), ('inspiration',())])
while q and len(pages) < MAX:
    k = q.popleft()
    if k in seen: continue
    seen.add(k)
    try: body = fetch(url(k))
    except Exception as e: print('skip', k, e); continue
    pages[k] = body
    for m in re.finditer(r'href="([^"]+)"', body):
        kk = key(m.group(1))
        if kk and kk[0] in CRAWL and kk not in seen:
            # don't explode on catalogue filter combos: keep single-filter links only
            if kk[0]=='catalogue' and len(kk[1])>2: continue
            q.append(kk)

# the advice questionnaire: pre-render an answer for every usage x mode (budget 1500 EUR, beginner, light kit)
USAGES = ['voyage','rue','portrait','sport','nature','video']
extra = {}
for u in USAGES:
    for mo in ('achat','location'):
        q_ = urllib.parse.urlencode({'usage':u,'mode':mo,'budget':1500 if mo=='achat' else 150,'jours':3,'niveau':'debutant','mobilite':'leger'})
        try: extra[f'conseil-r-{u}-{mo}.html'] = fetch(BASE+'conseil.php?'+q_)
        except Exception as e: print('conseil', u, mo, e)
CONSEIL_RESULT = ('conseil-r', ())

BANNER = '''<div id="fs-demo-bar" style="position:sticky;top:0;z-index:9999;display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap;padding:9px 16px;background:#c9a15f;color:#1d1a15;font:600 14px/1.3 Figtree,system-ui,sans-serif;text-align:center">
<span>Démo statique du prototype Focal-Shift · challenge de fin d'études MBA ESG</span>
<a href="../" style="color:#1d1a15;text-decoration:underline">← Retour au CV d'El Mokhtar Berrada</a></div>
<div id="fs-toast" role="status" style="position:fixed;left:50%;bottom:24px;transform:translate(-50%,160%);z-index:10000;max-width:min(92vw,520px);padding:12px 18px;border-radius:12px;background:#ece6dc;color:#1d1a15;font:500 14px/1.4 Figtree,system-ui,sans-serif;box-shadow:0 12px 30px rgba(0,0,0,.4);transition:transform .4s cubic-bezier(.3,1.4,.5,1)"></div>
<script>
(function(){
  var t=document.getElementById('fs-toast'),h;
  function say(m){ t.textContent=m; t.style.transform='translate(-50%,0)'; clearTimeout(h); h=setTimeout(function(){t.style.transform='translate(-50%,160%)'},3200); }
  var MSG="Démo statique : cette action nécessite la version complète (PHP + MySQL). Parcourez l'accueil, le catalogue, les fiches produit et le conseil.";
  document.addEventListener('click',function(e){ var a=e.target.closest('a[data-off]'); if(a){ e.preventDefault(); say(MSG); } },true);
  document.addEventListener('submit',function(e){
    var f=e.target;
    if(f.hasAttribute('data-conseil')){ e.preventDefault(); var d=new FormData(f), u=d.get('usage')||'voyage', m=d.get('mode')==='location'?'location':'achat';
      if(['voyage','rue','portrait','sport','nature','video'].indexOf(u)<0) u='voyage'; location.href='conseil-r-'+u+'-'+m+'.html'; return; }
    e.preventDefault(); say(MSG);
  },true);
})();
</script>'''

def rewrite(body):
    def rep(m):
        attr, val = m.group(1), m.group(2)
        k = key(val)
        if k is None:
            if val.startswith('assets/') or val.startswith('uploads/'): return m.group(0)
            return m.group(0)
        if k in pages: return f'{attr}="{fname(k)}"'
        # same page with extra params we did not render: fall back to the bare page if we have it
        if (k[0],()) in pages and k[0] not in ('produit','demande'): return f'{attr}="{fname((k[0],()))}"'
        if attr=='href': return f'href="#" data-off'
        return f'{attr}="#"'
    body = re.sub(r'(href|action)="([^"]+)"', rep, body)
    body = body.replace('<head>', '<head>\n<meta name="robots" content="noindex">', 1)
    body = re.sub(r'(<body[^>]*>)', lambda m: m.group(1)+BANNER.replace('CONSEIL_RESULT_FILE', fname(CONSEIL_RESULT)), body, count=1)
    # tag the advice form so its submit goes to the pre-rendered result
    body = body.replace('class="formulaire carte-blanche" data-etapes', 'class="formulaire carte-blanche" data-etapes data-conseil', 1)
    return body

if os.path.isdir(OUT): shutil.rmtree(OUT)
os.makedirs(OUT)
shutil.copytree(os.path.join(SRC,'assets'), os.path.join(OUT,'assets'))
for k, body in pages.items():
    open(os.path.join(OUT, fname(k)), 'w', encoding='utf-8').write(rewrite(body))
for fn, body in extra.items():
    open(os.path.join(OUT, fn), 'w', encoding='utf-8').write(rewrite(body))
print(len(extra),'advice results')
os.replace(os.path.join(OUT,'index.html'), os.path.join(OUT,'index.html'))
print(len(pages), 'pages →', OUT)
for k in sorted(pages, key=lambda x: fname(x)): print(' ', fname(k))
