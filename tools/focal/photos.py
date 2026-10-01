# Sélection des photos Wikimedia Commons (licences libres) et génération des webp.
# Usage : python3 tools/focal/photos.py  -> focal-shift-demo/img/p/*.webp + tools/focal/photos.json
import json, os, re, subprocess, time, urllib.parse, io
from PIL import Image
UA = "ElMokhtarCV/1.0 (portfolio; contact via github moksen2001)"
D = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(D, '../../focal-shift-demo/img/p')
# clé -> [(fichier Commons, note éventuelle)] ; note = modèle montré quand ce n'est pas le modèle exact
SEL = {
 'fx3':   ["Sony FX3 with Sony FE 24mm F1.4 GM - by Henry Söderlund (51061907312, cropped).jpg",
           "Sony ILME-FX3 SELP28135G recording at AGA Main Stage 20241013.jpg",
           "Sony ILME-FX3 SELP28135G XLR-K3M sample right side at Taipei 101 Store, Sony Taiwan 20230108.jpg"],
 'r6m2':  ["Canon EOS R6 Mark II - by Henry Söderlund (52546794891).jpg",
           "Canon EOS R6 Mark II 9 jan 2023d.jpg", "Canon EOS R6 Mark II 9 jan 2023f.jpg"],
 'a7s3':  ["Sony α7S III with Sony FE 55mm F1.8 ZA - by Henry Söderlund (50427553021).jpg",
           "Sony α7S III 21 Oct 2020c.jpg", "Sony α7S III 21 Oct 2020d.jpg"],
 'a7iv':  ["Sony A7 IV (ILCE-7M4) - by Henry Söderlund (51739988735).jpg",
           "Sony.alpha.7IV.G-Master.24-105mm.DSC00141.jpg", "Sony.alpha.7IV.G.24-105mm.DSC00147.png"],
 'xt5':   ["Fujifilm X-T5 with Fujinon XF 35mm F2 R WR - by Henry Söderlund (52536299126).jpg",
           "Fujifilm-X-T5.jpg", "Fujifilm X-T5 4 nov 2022a.jpg", "Fujifilm X-T5 4 nov 2022d.jpg"],
 'zve10': ["Sony ZV-E10 with Sony E 16-50mm F3.5-5.6 OSS PZ - by Henry Söderlund (51375243603).jpg",
           "Sony ZV-E10 SEL1650 sample at Taipei 101 Store, Sony Taiwan 20250810.jpg"],
 'r50':   ["Canon EOS R50, Vorderansicht 30.12.2025.jpg", "Canon EOS R50, Gesamtansicht der Kamera 30.12.2025.jpg",
           "Canon EOS R50, Rückansicht bei geschlossenem Display 30.12.2025.jpg"],
 'gm2470':["Sony FE 24-70mm F2.8 GM II - by Henry Söderlund (52131834285).jpg",
           "Sony FE 24-70mm F2.8 GM II 20240211 HOF07403 RAW-Export 000116.png",
           "Sony FE 24-70mm F2.8 GM II 20240211 HOF07394 RAW-Export 000115.png"],
 'sig35': ["Sigma 35mm F1.4 DG DN Art, Sony E - by Henry Söderlund (51193475283).jpg"],
 'rf85':  ["Canon R6 und RF 85 1,2-8068.jpg", "Canon R5 mit RF 85 1.2-8049.jpg"],
 'fe90':  ["Sony FE 90mm F2.8 Macro G OSS 01.jpg"],
 'xf23':  [("Fujifilm X-Pro3 with Fujinon XF 23mm F2 R WR (49919914837).jpg", "XF 23 mm f/2 monté sur un X-Pro3"),
           ("2019 02 Fujifilm X-T3 with XF 23mm 2.0.jpg", "XF 23 mm f/2 monté sur un X-T3")],
 'rf50':  ["Canon RF 50mm F1.8 STM.jpg", "Canon R50 with RF-50 mm lens.jpg"],
 'amaran':[("Amaran 300C Monolight.jpg", "Modèle proche : Amaran 300c (même gamme)")],
 'godox': [("Godox Softbox PXL 20260109 191721528.jpg", "Modèle proche : boîte à lumière Godox")],
 'mcpro': [("Aputure HR672C LED light on a stand.jpg", "Modèle proche : panneau LED Aputure HR672C")],
 'stands':[("Speedlite and Silver umbrella.jpg", "Modèle proche : pied Manfrotto avec parapluie")],
 'tripods':[("Manfrotto Fluidkopf.jpg", "Rotule fluide Manfrotto")],
 'sachtler':[("Sachtler tripod.jpg", "Modèle proche : trépied vidéo Sachtler")],
 'table': [("001 2021 03 05 Lichtzeltfotografie.jpg", "Illustration : tente de prise de vue produit (sans marque)")],
 'wgo2':  ["Rode Wireless Go II Set.jpg", "Rode Wireless Go II Set 2.jpg", "Rode Wireless Go II microphone.jpg"],
 'ntg':   [("Rode VMGOII USB Video Mic GO II Lightweight Directional Microphone 02.jpg", "Modèle proche : Rode VideoMic GO II"),
           ("Rode VMGOII USB Video Mic GO II Lightweight Directional Microphone 03.jpg", "Modèle proche : Rode VideoMic GO II")],
 'mke600':["Sennheiser MKE 600 NoFilter.jpg", "Sennheiser MKE 600 Filter.jpg"],
 'zoomf6':["Zoom F6 Field Recorder mit 192kHz 32Bit Float Technologie.jpg"],
 'ewdp':  [("Sennheiser SK 5212C & MKE 1 02.jpg", "Modèle proche : émetteur Sennheiser SK 5212 + micro-cravate MKE 1")],
 'rs4':   [("DJI Ronin RSC2 Pro 1.jpg", "Modèle proche : DJI RSC 2"),
           ("DJI Ronin RSC2 Pro 2.jpg", "Modèle proche : DJI RSC 2")],
 # Ambiance (accueil, inspiration)
 'h-r6':     ["Man using Canon EOS R6 Mark II 20250406152411.jpg"],
 'h-son':    ["Marcel Gnauk from Free To Use Sounds recording sounds in Iceland.jpg"],
 'h-doc':    ["Tournage du documentaire \"Les Astres Errants\" à l'observatoire de la Silla au Chili.JPG"],
 'h-photo':  ["Photographer with Fujifilm X-T30.jpg"],
 'h-nuit':   ["Street photographer on Nanjing Road at night.jpg"],
 'h-studio': ["Studioarrangement for product photography and video 2296.jpg"],
 'h-reportage': ["Opérateur de Prise de Son.jpg"],
}
def api(params):
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    for i in range(5):
        r = subprocess.run(["curl", "-sS", "--compressed", "-A", UA, url], capture_output=True, text=True)
        try: return json.loads(r.stdout)
        except Exception: print(r.stdout[:300], r.stderr[:300]); time.sleep(4)
    raise SystemExit('API KO')
def clean(s): return re.sub(r'\s+', ' ', re.sub('<[^>]+>', '', s or '')).strip()
def main():
    os.makedirs(OUT, exist_ok=True)
    items = []
    for k, lst in SEL.items():
        for n, e in enumerate(lst, 1):
            t, note = (e if isinstance(e, tuple) else (e, None))
            items.append(dict(key=k, n=n, file='File:' + t, note=note))
    CACHE = '/tmp/focal/commons-meta.json'
    meta = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    titles = [i['file'] for i in items if i['file'] not in meta]
    for i in range(0, len(titles), 25):
        d = api(dict(action='query', titles='|'.join(titles[i:i+25]), prop='imageinfo', iiprop='url|extmetadata|size', iiurlwidth=900, format='json'))
        norm = {x['from']: x['to'] for x in d['query'].get('normalized', [])}
        for p in d['query']['pages'].values():
            meta[p['title']] = p
        for a, b in norm.items():
            if b in meta: meta[a] = meta[b]
        json.dump(meta, open(CACHE, 'w'))
        time.sleep(2)
    out = []
    for it in items:
        p = meta.get(it['file'])
        if not p or 'imageinfo' not in p: print('MANQUANT', it['file']); continue
        ii = p['imageinfo'][0]; m = ii.get('extmetadata', {})
        lic = clean(m.get('LicenseShortName', {}).get('value'))
        assert re.match(r'(CC0|Public domain|CC BY(-SA)? [0-9.]+)', lic), (it['file'], lic)
        slug = f"{it['key']}-{it['n']}"
        big, small = f'{OUT}/{slug}.webp', f'{OUT}/{slug}-s.webp'
        if not os.path.exists(big):
            raw = subprocess.run(['curl', '-sS', '-A', UA, ii['thumburl']], capture_output=True).stdout
            im = Image.open(io.BytesIO(raw)).convert('RGB')
            im.thumbnail((900, 900), Image.LANCZOS); im.save(big, 'WEBP', quality=78, method=6)
            im2 = im.copy(); im2.thumbnail((400, 400), Image.LANCZOS); im2.save(small, 'WEBP', quality=72, method=6)
            time.sleep(1)
        w, h = Image.open(big).size
        out.append(dict(key=it['key'], src=f'img/p/{slug}.webp', thumb=f'img/p/{slug}-s.webp', w=w, h=h,
                        title=p['title'][5:], author=clean(m.get('Artist', {}).get('value')) or 'Auteur inconnu',
                        license=lic, url=ii['descriptionurl'], note=it['note']))
        print(slug, w, h, lic)
    json.dump(out, open(os.path.join(D, 'photos.json'), 'w'), ensure_ascii=False, indent=1)
main()
