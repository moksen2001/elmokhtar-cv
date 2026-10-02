"""End-to-end checks for Gaïndé (Playwright, Chromium).
Serve the repo:  (setsid nohup python3 -m http.server 8833 --bind 127.0.0.1 </dev/null >/dev/null 2>&1 &)
Run:             python3 tools/fsf/test_fsf.py [iphone|desktop] [fr|en]
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
URL = os.environ.get('FSF_URL', 'http://127.0.0.1:8833/fsf-demo/')
OUT = os.environ.get('FSF_SHOTS', '/tmp/fsf/test/')
os.makedirs(OUT, exist_ok=True)
MODE = sys.argv[1] if len(sys.argv) > 1 else 'iphone'
LANG = sys.argv[2] if len(sys.argv) > 2 else 'fr'
FAIL = []
def check(c, msg):
    print(('  ok   ' if c else '  FAIL ') + msg)
    if not c: FAIL.append(msg)
IMGS = """()=>{const bad=[];const A=document.getElementById('app').getBoundingClientRect();const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>A.top&&r.top<A.bottom&&r.right>A.left+1&&r.left<A.right-1&&getComputedStyle(e).visibility!=='hidden'};
 document.querySelectorAll('#view .scr:not(.off) img, #layer img').forEach(i=>{if(!vis(i))return;if(!(i.complete&&i.naturalWidth>0))bad.push(i.getAttribute('src'));});return bad;}"""
TOP = "()=>{const s=[...document.querySelectorAll('#view .scr:not(.off)')].sort((a,b)=>(+b.style.zIndex)-(+a.style.zIndex));return s[0]?s[0].className.match(/scr-(\\w+)/)[1]:null}"
OVER = """()=>{const sc=[...document.querySelectorAll('#view .scr:not(.off) .sc')];const bad=sc.filter(s=>s.scrollWidth>s.clientWidth+1).map(s=>s.parentNode.className);
 const app=document.getElementById('app').getBoundingClientRect();const wide=[...document.querySelectorAll('#view .scr:not(.off) .sc *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>app.right+2&&!e.closest('.hscroll,.chips,.srail,.ticker,.rail,.hn-bg,.pl-bg,.pd-flip,.mc-holo,.goalfx')}).slice(0,3).map(e=>e.className||e.tagName);
 return {doc:document.documentElement.scrollWidth>innerWidth+1,bad,wide};}"""
STATE = "()=>JSON.parse(localStorage.getItem('gainde-v1')||'{}')"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices['iPhone 13']) if MODE == 'iphone' else await b.new_context(viewport={'width': 1440, 'height': 900})
        await ctx.add_init_script("try{localStorage.setItem('gainde-install','1')}catch(e){}")
        await ctx.route('**/*youtube-nocookie.com/**', lambda r: r.fulfill(status=200, content_type='text/html', body='<html><body style="background:#000"></body></html>'))
        pg = await ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
        pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' else None)
        pre = f'{MODE}-{LANG}-'
        async def shot(n):
            await pg.wait_for_timeout(300)
            if MODE == 'iphone': await pg.screenshot(path=OUT + pre + n + '.png')
            else: await pg.locator('.phone').screenshot(path=OUT + pre + n + '.png')
        async def act(a, extra='', wait=650, nth=0):
            await pg.locator(f'#app [data-act="{a}"]{extra}:visible').nth(nth).click(); await pg.wait_for_timeout(wait)
        async def top(): return await pg.evaluate(TOP)
        async def imgs(label):
            await pg.wait_for_timeout(900); bad = await pg.evaluate(IMGS); check(not bad, f'images loaded · {label}' + (f' {bad}' if bad else ''))
        async def over(label):
            o = await pg.evaluate(OVER); check(not o['doc'] and not o['bad'] and not o['wide'], f'no horizontal overflow · {label} {o if (o["doc"] or o["bad"] or o["wide"]) else ""}')
        async def tab(t):
            for _ in range(6):
                if await pg.evaluate("document.getElementById('app').classList.contains('tabs-on')"): break
                await pg.keyboard.press('Escape'); await pg.wait_for_timeout(450)
            await pg.locator(f'#tabbar [data-tab="{t}"]').click(); await pg.wait_for_timeout(550)
            if await top() != t and t != 'home':
                await pg.locator(f'#tabbar [data-tab="{t}"]').click(); await pg.wait_for_timeout(550)

        await pg.goto(URL + ('?lang=en' if LANG == 'en' else ''))
        await pg.wait_for_timeout(1400); await shot('00-splash')
        await pg.wait_for_timeout(2200)
        check(await top() == 'welcome', 'splash → welcome (first launch)')
        await act('enter', wait=1000)
        check(await top() == 'home', 'welcome → home in 1 tap')
        await imgs('home'); await over('home'); await shot('01-home')
        cd = await pg.evaluate("document.querySelector('.cd').getAttribute('aria-label')")
        check(bool(cd), f'countdown running ({cd})')
        if MODE == 'iphone':
            m = await pg.evaluate("()=>{window.scrollTo(0,500);return [scrollY,document.scrollingElement.scrollHeight,innerHeight,document.scrollingElement.scrollWidth,innerWidth]}")
            check(m[0] == 0 and m[1] <= m[2] + 1 and m[3] <= m[4], f'phone document never scrolls {m}')
            check(await pg.evaluate("getComputedStyle(document.querySelector('.banner')).display==='none'"), 'no page banner on phone')
        else:
            check(await pg.locator('#panel').is_visible(), 'desktop side panel visible')
            txt = await pg.locator('#panel').inner_text()
            check('El Mokhtar Berrada' in txt and ('FSF' in txt), 'panel carries the non-official mention')

        # ---- 1. live match centre + goal celebration
        await act('replay', wait=900)
        check(await top() == 'live', 'live centre opened from home')
        await act('lvPlay', wait=1200)
        await act('lvNext', wait=500)
        fx = await pg.locator('#layer .goalfx').count()
        check(fx == 1, 'goal celebration overlay shown')
        await shot('02-goal')
        await pg.wait_for_timeout(2600)
        s0 = await pg.evaluate("document.getElementById('lvS0').textContent")
        check(s0 == '1', f'score updated to 1-0 (got {s0})')
        feed = await pg.locator('.lv-feed .ev.goal').count()
        check(feed >= 1, 'goal event in live feed')
        await act('lvNext', wait=3200)  # red card + ...
        await act('lvTab', '[data-v="xi"]', 1300)
        pp = await pg.locator('.pitch .pp').count(); check(pp == 11, f'11 players dropped on the pitch ({pp})')
        await imgs('line-ups'); await over('line-ups'); await shot('03-lineup')
        await act('lvTab', '[data-v="stats"]', 1300)
        st = await pg.locator('.stt').count(); check(st == 8, f'8 official FIFA stats ({st})')
        await shot('04-stats')
        for _ in range(8):
            if await pg.evaluate("!!document.querySelector('.scr-live.is-done')"): break
            await act('lvNext', wait=2800)
        await act('lvTab', '[data-v="feed"]', 900)
        check(await pg.evaluate("document.getElementById('lvS0').textContent") == '5', 'full replay reaches 5-0')
        # ---- 2. man of the match vote + share card
        await act('vote', wait=900)
        check(await top() == 'vote', 'vote screen from the final whistle card')
        await act('vtPick', '[data-id="pgueye"]', 500); await act('vtGo', wait=1500)
        st = await pg.evaluate(STATE); check(st.get('votes', {}).get('sen-irq') == 'pgueye', 'vote saved')
        await shot('05-vote')
        await act('shareCard', wait=2500)
        card = await pg.evaluate("window.__shareCard||null")
        check(card and card['w'] == 1080 and card['h'] == 1350 and card['len'] > 50000, f'canvas share card generated {card and {k: card[k] for k in ("w", "h")}}')
        await shot('06-sharecard'); await act('closeSheet', wait=500)

        # ---- 3. ticket → seat map → seats → simulated payment → e-ticket
        await tab('home'); await tab('home')
        await act('tickets', nth=0, wait=900)
        check(await top() == 'tickets', 'ticketing ≤ 2 taps from home')
        await act('seatmap', wait=900)
        await act('zone', '[data-id="ouest"].zr', 600)
        await shot('07-seatmap')
        await act('toSeats', wait=900)
        for s in range(3): await pg.locator('#app .seat:not(.tk):not(.on):visible').first.click(); await pg.wait_for_timeout(350)
        await over('seats'); await shot('08-seats')
        await act('seatsGo', wait=900)
        check(await pg.evaluate("!document.querySelector('#app input[autocomplete*=cc],#app input[name*=card i],#app input[type=tel],#app input[inputmode=tel]')"), 'no card / phone number field at checkout')
        txt = await pg.locator('#view .scr:not(.off) .ck-safe').inner_text()
        check(('aucun débit' in txt) or ('no charge' in txt), 'checkout says simulated / no charge')
        await act('payPick', '[data-v="om"]', 400); await act('payGo', wait=3600)
        check(await top() == 'eticket', 'e-ticket issued after simulated payment')
        check(await pg.locator('.et .qr').count() == 1, 'e-ticket has a QR code')
        await imgs('e-ticket'); await shot('09-eticket')
        st = await pg.evaluate(STATE); check(len(st.get('tickets', [])) == 1 and len(st['tickets'][0]['seats']) == 3, 'ticket with 3 seats saved')
        for _ in range(2): await act('etFlip', wait=900)
        check(await pg.evaluate("!document.querySelector('.et').classList.contains('flip')"), 'e-ticket flips back and forth')

        # ---- 4. shop: personalised jersey → cart → order
        await tab('home'); await tab('home')
        await act('shop', nth=0, wait=900)
        await act('product', '[data-id="away"]', 900)
        await pg.fill('#pdName', 'diop'); await pg.fill('#pdNo', '7'); await pg.wait_for_timeout(900)
        back = await pg.evaluate("document.querySelector('.pd-b svg').getAttribute('aria-label')")
        check('DIOP' in back and '7' in back, f'live jersey preview updated ({back})')
        await shot('10-product')
        await act('addCart', wait=1100)
        n = await pg.evaluate("document.querySelector('#view .scr:not(.off) [data-badge=\"bag\"]').dataset.n")
        check(n == '1', f'bag badge shows 1 (got {n})')
        await act('cart', nth=0, wait=900); await act('toCheckout', wait=900)
        await act('payPick', '[data-v="wave"]', 400); await act('payGo', wait=3600)
        check(await top() == 'order', 'order confirmation')
        st = await pg.evaluate(STATE); check(len(st.get('orders', [])) == 1 and not st.get('cart'), 'order saved, bag emptied')
        await shot('11-order')

        # ---- 5. pronos
        await tab('home'); await tab('home')
        await act('pronos', nth=0, wait=900)
        await act('prStep', '[data-k="h"][data-d="1"]', 300)
        await act('prScorer', '[data-id="jackson"]', 300)
        await act('prSave', wait=1200)
        st = await pg.evaluate(STATE); pr = st.get('pronos', {}).get('sen-com')
        check(pr and pr['h'] == 2 and pr['a'] == 0 and pr['sc'] == 'jackson', f'prediction saved {pr}')
        await shot('12-pronos')

        # ---- 6. story viewer + video click-to-load
        await tab('coulisses')
        await imgs('coulisses'); await over('coulisses'); await shot('13-coulisses')
        await act('story', '[data-i="1"]', 1200)
        check(await pg.locator('#layer .story').count() == 1, 'story viewer open')
        await imgs('story'); await shot('14-story')
        await pg.locator('#layer .story .st-nav.r').click(); await pg.wait_for_timeout(700)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(600)
        check(await pg.locator('#layer .story').count() == 0, 'story viewer closes')
        await act('video', nth=0, wait=900)
        check(await pg.locator('#yt iframe').count() == 0, 'no YouTube iframe before click')
        await act('ytLoad', wait=900)
        src = await pg.evaluate("document.querySelector('#yt iframe')&&document.querySelector('#yt iframe').src")
        check(bool(src) and src.startswith('https://www.youtube-nocookie.com/embed/'), f'click-to-load youtube-nocookie embed ({src})')
        await act('back', wait=700)

        # ---- 7. quiz to the end
        await act('quiz', wait=900)
        for i in range(10):
            await act('qzPick', '[data-j="0"]', 450); await act('qzNext', wait=600)
        ring = await pg.locator('.qz-end .ring').count(); check(ring == 1, 'quiz reaches the score screen')
        await shot('15-quiz')
        st = await pg.evaluate(STATE); check(st.get('quiz', {}).get('best') is not None, 'quiz score saved')

        # ---- 8. squad, player profile (social links), social hub
        await tab('equipe')
        await imgs('squad'); await over('squad')
        check(await pg.locator('.plc').count() == 29, 'squad of 29 cards (26 players incl. 3 newly eligible)')
        await act('player', '[data-id="koulibaly"]', 1100)
        check(await top() == 'player', 'player profile opened')
        hrefs = await pg.evaluate("[...document.querySelectorAll('#view .scr:not(.off) .so-big a')].map(a=>a.href)")
        check(len(hrefs) == 2 and all(h.startswith('https://') for h in hrefs), f'player social links https ({hrefs})')
        await imgs('player'); await shot('16-player')
        await act('back', wait=700)
        await act('social', nth=0, wait=900)
        hs = await pg.evaluate("[...document.querySelectorAll('#view .scr:not(.off) .socg a')].map(a=>a.href)")
        check(len(hs) == 8 and all(h.startswith('https://') for h in hs), f'social hub: 8 official https channels ({len(hs)})')
        await act('back', wait=600)

        # ---- 9. supporter card, credits, settings/lang
        await tab('moi')
        await act('openCard', nth=0, wait=1300)
        pts = await pg.evaluate("+document.querySelector('#mcard [data-cnt]').dataset.cnt")
        check(pts >= 120 + 40 + 10 + 150 + 80 + 20, f'points accumulated on the card ({pts})')
        check(await pg.locator('#mcard .qr').count() == 1, 'card has a QR code')
        await shot('17-card'); await act('back', wait=600)
        await act('credits', wait=900)
        n = await pg.locator('.cr').count(); check(n >= 25, f'photo credits listed ({n})')
        links = await pg.evaluate("[...document.querySelectorAll('.cr a.lnk')].every(a=>a.href.startsWith('https://commons.wikimedia.org/wiki/File:'))")
        check(links, 'every credit links to its Commons file')
        await act('back', wait=600)
        other = 'en' if LANG == 'fr' else 'fr'
        await act('setLang', f'[data-v="{other}"]', 900)
        lab = await pg.locator('#tabbar [data-tab="home"]').inner_text()
        check(lab.strip().lower() == ('home' if other == 'en' else 'accueil'), f'language switch ({lab})')
        await act('setLang', f'[data-v="{LANG}"]', 700)
        if MODE == 'desktop':
            await pg.click('[data-step="5"]'); await pg.wait_for_timeout(1200)
            check(await top() == 'card', 'guided tour step jumps to its screen')
            done = await pg.locator('#steps li.done').count(); check(done == 6, f'all 6 tour steps ticked ({done})')
        print('errors:', errs)
        check(not errs, 'zero page / console errors')
        await b.close()
    print('\nRESULT', MODE, LANG, 'FAILED: ' + str(FAIL) if FAIL else 'ALL PASSED')
    sys.exit(1 if FAIL else 0)
asyncio.run(main())
