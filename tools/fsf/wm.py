"""Polite Wikimedia API helper (1 req/s, backoff on 429). Used to research Commons photos."""
import json, subprocess, time, urllib.parse, sys
UA = "ElMokhtarCV/1.0 (portfolio; github moksen2001)"
_last = [0.0]
def get(url, params=None, binary=False, tries=8):
    if params: url += ('&' if '?' in url else '?') + urllib.parse.urlencode(params)
    for i in range(tries):
        dt = time.time() - _last[0]
        if dt < 1.1: time.sleep(1.1 - dt)
        _last[0] = time.time()
        r = subprocess.run(['curl', '-sS', '--compressed', '-m', '60', '-A', UA, '-w', '\n%{http_code}', url], capture_output=True)
        body, _, code = r.stdout.rpartition(b'\n')
        code = code.decode().strip()
        if code == '200':
            return body if binary else json.loads(body)
        wait = 5 * (i + 1)
        if code == '429':
            m = __import__('re').search(rb'retry-after: *(\d+)', r.stderr or b'')
            wait = max(wait, 45)
        print(f'  [{code}] retry in {wait}s', file=sys.stderr); time.sleep(wait)
    raise RuntimeError('failed ' + url)
def api(host='en.wikipedia.org', **p):
    p.setdefault('format', 'json'); p.setdefault('formatversion', '2')
    return get(f'https://{host}/w/api.php', p)
