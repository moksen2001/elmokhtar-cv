# Focal-Shift — assemble le prototype en un seul fichier : focal-shift-demo/index.html
# Usage : python3 tools/focal/build.py [--min]
#   (régénérer les données : python3 tools/focal/gen-data.py ; les photos : python3 tools/focal/photos.py)
import subprocess, sys, os, glob, json
D = os.path.dirname(os.path.abspath(__file__)) + '/'
OUT = os.path.normpath(D + '../../focal-shift-demo') + '/'
rd = lambda f: open(D + f, encoding='utf-8').read()
head, body, css = rd('1-head.html'), rd('2-body.html'), rd('style.css')
FILES = ['3-data.js', '4-core.js', '5-nav.js', '6-home.js', '7-explore.js', '8-product.js', '9-flows.js', '10-account.js', '11-init.js']
js = '\n'.join(rd(f) for f in FILES)
ES = ['npx', '-y', 'esbuild@0.23.0']
if '--min' in sys.argv:
    css = subprocess.run(ES + ['--loader=css', '--minify'], input=css, capture_output=True, text=True, check=True).stdout
    r = subprocess.run(ES + ['--loader=js', '--minify', '--target=es2019'], input=js, capture_output=True, text=True)
    if r.returncode: print(r.stderr); sys.exit(1)
    js = r.stdout
else:
    r = subprocess.run(ES + ['--loader=js', '--target=es2019', '--log-level=error'], input=js, capture_output=True, text=True)
    if r.returncode: print(r.stderr); sys.exit(1)
head = head.replace('<style>\n</style>', '<style>' + css + '</style>')
out = head + body + '<script>\n/* Focal-Shift — prototype interactif · El Mokhtar Berrada · sources lisibles dans tools/focal (python3 tools/focal/build.py --min) */\n' + js + '</script>\n</body>\n</html>\n'
open(OUT + 'index.html', 'w', encoding='utf-8').write(out)
manifest = {
    "name": "Focal-Shift", "short_name": "Focal-Shift",
    "description": "Prototype : louer, acheter et revendre du matériel photo et vidéo entre créateurs (challenge MBA ESG, données fictives).",
    "lang": "fr", "start_url": "./", "scope": "./", "display": "standalone", "orientation": "portrait",
    "background_color": "#f2f2ef", "theme_color": "#f2f2ef",
    "icons": [{"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
              {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
              {"src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}
json.dump(manifest, open(OUT + 'manifest.webmanifest', 'w'), ensure_ascii=False, indent=1)
img = sum(os.path.getsize(p) for p in glob.glob(OUT + 'img/**/*.webp', recursive=True))
ic = sum(os.path.getsize(p) for p in glob.glob(OUT + 'icons/*'))
print('index.html', len(out.encode()), 'octets · images', img, '· icônes', ic)
