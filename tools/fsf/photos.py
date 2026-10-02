"""Download Wikimedia Commons photos (free licences), convert to webp, write credits.json.
Polite: 1 request / 1.5 s, custom User-Agent, no API hammering (uses action=raw + Special:FilePath).
usage: python3 tools/fsf/photos.py
"""
import json, os, re, subprocess, time, urllib.parse
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__)) + '/'
OUT = D + '../../fsf-demo/img/'
CACHE = '/tmp/fsfr/cand/'
UA = 'ElMokhtarCV/1.0 (portfolio; github moksen2001)'
W = 'France v Senegal 16 June 2026'
# id: (Commons file, alt FR, alt EN, object-position)
PH = {
 'team': (f'Senegal team {W}-304.jpg', 'Les Lions alignés pour l’hymne avant France–Sénégal, Mondial 2026', 'The Lions lined up for the anthem before France–Senegal, 2026 World Cup', '50% 40%'),
 'p-koulibaly': (f'Kalidou Koulibaly {W}-370 (cropped).jpg', 'Kalidou Koulibaly', 'Kalidou Koulibaly', '50% 22%'),
 'p-isarr': (f'Ismaila Sarr {W}-425 (cropped).jpg', 'Ismaïla Sarr', 'Ismaïla Sarr', '50% 20%'),
 'a-sarr': (f'Ismaila Sarr {W}-411.jpg', 'Ismaïla Sarr en action, Mondial 2026', 'Ismaïla Sarr in action, 2026 World Cup', '50% 30%'),
 'p-jackson': (f'Nicolas Jackson {W}-369 (cropped).jpg', 'Nicolas Jackson', 'Nicolas Jackson', '50% 20%'),
 'a-jackson': (f'Nicolas Jackson {W}-422.jpg', 'Nicolas Jackson de dos, maillot n°11', 'Nicolas Jackson from behind, number 11 shirt', '50% 35%'),
 'p-iliman': (f'Iliman Ndiaye {W}-475.jpg', 'Iliman Ndiaye', 'Iliman Ndiaye', '50% 18%'),
 'p-pgueye': (f'Pape Gueye {W}-359 (cropped).jpg', 'Pape Gueye', 'Pape Gueye', '45% 18%'),
 'p-pmsarr': (f'Pape Matar Sarr {W}-227.jpg', 'Pape Matar Sarr', 'Pape Matar Sarr', '50% 18%'),
 'p-ehmdiouf': (f'El Hadji Malick Diouf {W}-384 (cropped).jpg', 'El Hadji Malick Diouf', 'El Hadji Malick Diouf', '50% 18%'),
 'p-niakhate': (f'Moussa Niakhate {W}-343.jpg', 'Moussa Niakhaté', 'Moussa Niakhaté', '50% 15%'),
 'p-mbaye': (f'Ibrahim Mbaye {W}-498.jpg', 'Ibrahim Mbaye', 'Ibrahim Mbaye', '50% 15%'),
 'p-camara': (f'Lamine Camara {W}-445.jpg', 'Lamine Camara', 'Lamine Camara', '50% 22%'),
 'p-bara': (f'Bara Ndiaye {W}-305.jpg', 'Bara Sapoko Ndiaye', 'Bara Sapoko Ndiaye', '50% 18%'),
 'p-diao': (f'Assane Diao {W}-241.jpg', 'Assane Diao', 'Assane Diao', '50% 18%'),
 'a-mane': (f'Sadio Mane {W}-329.jpg', 'Sadio Mané, n°10, Mondial 2026', 'Sadio Mané, number 10, 2026 World Cup', '50% 35%'),
 'p-igueye': ('Idrissa Gueye (cropped).jpg', 'Idrissa Gana Gueye', 'Idrissa Gana Gueye', '50% 25%'),
 'p-ydiouf': ('Diouf asse sr 2425.png', 'Yehvann Diouf', 'Yehvann Diouf', '50% 20%'),
 'p-msarr': ('Sarr asse rcsa 2425.jpg', 'Mamadou Sarr', 'Mamadou Sarr', '50% 12%'),
 'p-diakhon': ('Diakhon asse sr 2425.png', 'Mamadou Diakhon', 'Mamadou Diakhon', '50% 15%'),
 'p-sima': ('Abdallah Sima 2023.jpg', 'Abdallah Sima', 'Abdallah Sima', '45% 15%'),
 'p-dia': ('Boulaye Dia Reims.jpg', 'Boulaye Dia', 'Boulaye Dia', '50% 8%'),
 'p-vieira': ('Patrick Vieira NYCFC.JPG', 'Patrick Vieira', 'Patrick Vieira', '50% 12%'),
 'p-malang': ('Malang Sarr - 2021 FIFA Club World Cup Final (cropped).jpg', 'Malang Sarr', 'Malang Sarr', '50% 20%'),
 'fans-1': ('Senegal fans Russia 2018.jpg', 'Supporters sénégalais en tribune, Mondial 2018', 'Senegal supporters in the stands, 2018 World Cup', '50% 40%'),
 'fans-2': ('Japan-Senegal in Yekaterinburg (FIFA World Cup 2018) 09.jpg', 'Supportrice sénégalaise avec le drapeau, Iekaterinbourg 2018', 'Senegal supporter with the flag, Yekaterinburg 2018', '55% 50%'),
 'fans-3': ('La victoire sénégalaise.jpg', 'Supportrices fêtant le titre de champion d’Afrique, 6 février 2022', 'Fans celebrating the AFCON title, 6 February 2022', '50% 35%'),
 'fans-4': ('La lionne.jpg', 'Supportrice des Lions, 6 février 2022', 'A Lions supporter, 6 February 2022', '50% 30%'),
 'dakar-1': ('Pointe des Almadies - Senegal.jpg', 'La pointe des Almadies à Dakar', 'Pointe des Almadies, Dakar', '50% 50%'),
}
LIC = {'cc-by-sa-4.0': 'CC BY-SA 4.0', 'cc-by-4.0': 'CC BY 4.0', 'cc-by-sa-3.0': 'CC BY-SA 3.0', 'cc-by-3.0': 'CC BY 3.0', 'cc-zero': 'CC0', 'cc-by-sa-2.0': 'CC BY-SA 2.0', 'cc-by-2.0': 'CC BY 2.0', 'soccer.ru': 'CC BY-SA 3.0', 'fars': 'CC BY 4.0', 'tasnim': 'CC BY 4.0', 'pd': 'Domaine public'}
LURL = {'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/', 'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/', 'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/', 'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/', 'CC0': 'https://creativecommons.org/publicdomain/zero/1.0/', 'CC BY-SA 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/', 'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/'}
_last = [0.0]
def curl(url, out=None):
    for i in range(6):
        dt = time.time() - _last[0]
        if dt < 1.5: time.sleep(1.5 - dt)
        _last[0] = time.time()
        args = ['curl', '-sSL', '--compressed', '-m', '60', '-A', UA, '-w', '%{http_code}']
        args += (['-o', out] if out else ['-o', '/tmp/fsfr/_raw.txt'])
        r = subprocess.run(args + [url], capture_output=True, text=True)
        if r.stdout.strip() == '200':
            return True if out else open('/tmp/fsfr/_raw.txt', encoding='utf-8', errors='replace').read()
        print('   ', r.stdout.strip(), 'retry', url[:90]); time.sleep(20 * (i + 1))
    return None
def clean(s):
    s = re.sub(r'\[\[(?:User|Utilisateur):[^|\]]+\|([^\]]+)\]\]', r'\1', s)
    s = re.sub(r'\[\[[^|\]]+\|([^\]]+)\]\]', r'\1', s); s = re.sub(r'\[\[([^\]]+)\]\]', r'\1', s)
    s = re.sub(r'\[https?://\S+ ([^\]]+)\]', r'\1', s); s = re.sub(r'\{\{[^{}]*\|1=([^{}]*)\}\}', r'\1', s)
    s = re.sub(r'\{\{[^{}]*\}\}', '', s); s = re.sub(r'<[^>]+>', '', s)
    return re.sub(r'\s+', ' ', s).strip(' /')
def meta(title):
    raw = curl('https://commons.wikimedia.org/w/index.php?title=File:' + urllib.parse.quote(title.replace(' ', '_')) + '&action=raw')
    if not raw: return None
    a = re.search(r'\|\s*author\s*=\s*(.+)', raw); a = clean(a.group(1)) if a else ''
    cl = re.search(r'\|\s*(?:credit line|attribution)\s*=\s*(.+)', raw, re.I)
    lic = None
    for k, v in LIC.items():
        if re.search(r'\{\{\s*(?:self\|)?[^}]*' + re.escape(k), raw, re.I): lic = v; break
    if not a and 'WikiPortraits' in raw: a = 'WikiPortraits'
    if re.search(r'\{\{\s*Fars', raw): a = (a + ' / Fars News Agency').strip(' /')
    return {'author': (clean(cl.group(1)) if cl and len(clean(cl.group(1))) < 80 else a)[:80], 'lic': lic, 'raw_has_info': '{{Information' in raw}
def main():
    os.makedirs(OUT + 's', exist_ok=True); os.makedirs(CACHE, exist_ok=True)
    cache_meta = D + 'photos-meta.json'
    M = json.load(open(cache_meta)) if os.path.exists(cache_meta) else {}
    credits = {}
    for pid, (title, afr, aen, pos) in PH.items():
        src = CACHE + re.sub(r'[^A-Za-z0-9]+', '_', title)[:80] + '.jpg'
        if not os.path.exists(src):
            ok = curl('https://commons.wikimedia.org/wiki/Special:FilePath/' + urllib.parse.quote(title.replace(' ', '_')) + '?width=960', src)
            if not ok:
                if os.path.exists(src): os.remove(src)
                print('SKIP (no download)', pid); continue
        if title not in M or not M[title] or not M[title].get('lic'):
            M[title] = meta(title); json.dump(M, open(cache_meta, 'w'), ensure_ascii=False, indent=1)
        m = M.get(title)
        if m and W in title: m['author'] = 'Bryan Berlin / WikiPortraits'
        if m and 'fars' in (m.get('lic') or '').lower(): pass
        if not m or not m.get('lic'):
            print('SKIP (licence unknown)', pid, m); continue
        try: im = Image.open(src).convert('RGB')
        except Exception:
            os.remove(src); print('SKIP (bad image)', pid); continue
        big = im.copy(); big.thumbnail((900, 900), Image.LANCZOS); big.save(OUT + pid + '.webp', 'WEBP', quality=78, method=6)
        sm = im.copy(); sm.thumbnail((400, 400), Image.LANCZOS); sm.save(OUT + 's/' + pid + '.webp', 'WEBP', quality=74, method=6)
        credits[pid] = {'t': title, 'a': m['author'] or '—', 'l': m['lic'], 'lu': LURL.get(m['lic'], ''), 'u': 'https://commons.wikimedia.org/wiki/File:' + urllib.parse.quote(title.replace(' ', '_')),
                        'alt': {'fr': afr, 'en': aen}, 'pos': pos, 'w': big.width, 'h': big.height}
        print('ok', pid, m['author'], m['lic'], big.size)
    json.dump(credits, open(D + 'credits.json', 'w'), ensure_ascii=False, indent=1)
    print(len(credits), 'photos')
main()
