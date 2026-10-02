"""Render the Gaïndé lion (own design) to PWA icons + write manifest. usage: python3 tools/fsf/icons.py"""
import asyncio, json, os, subprocess
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__)) + '/'
OUT = D + '../../fsf-demo/'
js = "const window={},document={},navigator={};" + open(D + 'j0-core.js', encoding='utf-8').read() + ";process.stdout.write(lionSVG())"
svg = subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True).stdout
os.makedirs(OUT + 'icons', exist_ok=True)
open(D + 'lion.svg', 'w').write(svg.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ', 1))
def page(size, pad, radius, bg=True):
    return f"""<html><body style="margin:0;background:transparent"><div style="width:{size}px;height:{size}px;box-sizing:border-box;padding:{pad}px;border-radius:{radius}px;
    background:{'radial-gradient(circle at 50% 40%,#13442A,#06140C 72%)' if bg else 'transparent'};display:flex">{svg.replace('<svg ', '<svg style="width:100%;height:100%" ', 1)}</div></body></html>"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, size, pad, rad in [('icon-192', 192, 22, 0), ('icon-512', 512, 58, 0), ('icon-maskable-512', 512, 104, 0), ('apple-touch-icon', 180, 20, 0), ('favicon-64', 64, 4, 14)]:
            pg = await b.new_page(viewport={'width': size, 'height': size}, device_scale_factor=1)
            await pg.set_content(page(size, pad, rad))
            await pg.screenshot(path=OUT + f'icons/{name}.png', omit_background=True)
            await pg.close()
        await b.close()
asyncio.run(main())
man = {"name": "Gaïndé · supporters du Sénégal (concept)", "short_name": "Gaïndé", "lang": "fr",
       "description": "Concept d’application pour les supporters des Lions du Sénégal, imaginé par El Mokhtar Berrada. Non officiel, non affilié à la FSF.",
       "start_url": "./", "scope": "./", "display": "standalone", "orientation": "portrait", "background_color": "#06140C", "theme_color": "#06140C",
       "icons": [{"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
                 {"src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}
json.dump(man, open(OUT + 'manifest.webmanifest', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('icons + manifest ok')
