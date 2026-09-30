"""End-to-end checks for the Yema prototype (Playwright, Chromium).
Usage: python3 -m http.server 8765 (repo root) then  python3 tools/yema/test_yema.py [desktop|iphone] [fr|en]
"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
URL = os.environ.get('YEMA_URL', 'http://127.0.0.1:8765/yema-demo/')
OUT = os.environ.get('YEMA_SHOTS', '/tmp/yema/shots2/')
os.makedirs(OUT, exist_ok=True)
MODE = sys.argv[1] if len(sys.argv) > 1 else 'desktop'
LANG = sys.argv[2] if len(sys.argv) > 2 else 'fr'
FAIL = []
def check(c, msg):
    print(('  ok  ' if c else '  FAIL ') + msg)
    if not c: FAIL.append(msg)

IMGS = """()=>{const bad=[];const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&getComputedStyle(e).visibility!=='hidden'};
 document.querySelectorAll('#view .scr:not(.off) img, #layer img').forEach(i=>{if(!vis(i))return;if(!(i.complete&&i.naturalWidth>0))bad.push(i.getAttribute('src'));});return bad;}"""
TOP = "()=>{const s=[...document.querySelectorAll('#view .scr:not(.off)')].sort((a,b)=>(+b.style.zIndex)-(+a.style.zIndex));return s[0]?s[0].getAttribute('aria-label'):null}"
STATE = "()=>JSON.parse(localStorage.getItem('yema-demo-v3')||'{}')"

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        if MODE == 'iphone':
            ctx = await b.new_context(**p.devices['iPhone 13'], accept_downloads=True)
        else:
            ctx = await b.new_context(viewport={'width': 1440, 'height': 900}, accept_downloads=True)
        await ctx.add_init_script("try{localStorage.setItem('yema-install','1')}catch(e){}")
        pg = await ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
        pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' else None)
        pre = f'{MODE}-{LANG}-'
        async def shot(n):
            await pg.wait_for_timeout(250)
            if MODE == 'iphone': await pg.screenshot(path=OUT + pre + n + '.png')
            else: await pg.locator('.phone').screenshot(path=OUT + pre + n + '.png')
        async def act(a, extra='', wait=450, nth=0):
            await pg.locator(f'#app [data-act="{a}"]{extra}:visible').nth(nth).click()
            await pg.wait_for_timeout(wait)
        async def imgs(label):
            await pg.wait_for_timeout(700)
            bad = await pg.evaluate(IMGS)
            check(not bad, f'images loaded on {label}' + (f' {bad}' if bad else ''))
        async def top(): return await pg.evaluate(TOP)
        async def tab(t):
            await pg.locator(f'#tabbar [data-tab="{t}"]').click(); await pg.wait_for_timeout(450)

        await pg.goto(URL + ('?lang=en' if LANG == 'en' else ''))
        await pg.wait_for_timeout(1600)
        await shot('01-welcome')
        await act('explore', wait=900)
        check((await top()) in ('Yema Watch Club',), 'explore lands on Home in 1 tap (after splash)')
        await imgs('home')
        await shot('02-home')
        if MODE == 'iphone':
            m = await pg.evaluate("()=>{window.scrollTo(0,400);return [scrollY,document.scrollingElement.scrollHeight,innerHeight,document.scrollingElement.scrollWidth,innerWidth]}")
            check(m[0] == 0 and m[1] <= m[2] + 1 and m[3] <= m[4], f'no page-level scroll/overflow on phone {m}')
            check(await pg.evaluate("()=>getComputedStyle(document.querySelector('.banner')).display==='none'"), 'no page banner on phone')

        # ---- purchase 1: add to bag from the product page, pay with Apple Pay (demo), home delivery
        await tab('catalog')
        await imgs('catalogue')
        await act('pdp', '[data-id="nme"]', 900)
        check('Meteorite' in (await top() or ''), 'PDP Meteorite opened')
        await imgs('pdp meteorite')
        await shot('03-pdp')
        await act('addCart', wait=900)
        n = await pg.evaluate("()=>document.querySelector('#view .scr:not(.off) [data-badge=\"bag\"]').dataset.n")
        check(n == '1', f'bag badge shows 1 (got {n})')
        await act('cart', wait=600)
        await shot('04-bag')
        await act('checkout', wait=700)
        await act('ckNext', wait=500)                 # delivery (home, prefilled) -> payment
        await act('ckPay', '[data-v="apple"]', 350)
        await act('ckNext', wait=500)                 # -> review
        await shot('05-review')
        await act('ckNext', wait=2200)                # pay (Face ID sim)
        st = await pg.evaluate(STATE)
        check(len(st.get('orders', [])) == 1 and not st.get('cart'), 'order 1 placed and bag emptied')
        await shot('06-order')
        no1 = st['orders'][0]['no']
        for _ in range(3): await act('advance', wait=500)
        await act('register', wait=3200)
        st = await pg.evaluate(STATE)
        check(any(o.get('order') == no1 for o in st['owned']), 'order 1 watch registered in Ma Collection')
        await shot('07-verified')
        await act('closeSheet', wait=500)

        # ---- purchase 2: another watch, other strap, "Acheter" directly, store pick-up, saved card
        await tab('catalog'); await tab('catalog')      # 2nd tap on active tab pops to root
        check((await top()) in ('Catalogue',), 'tapping the active tab pops to root')
        await act('pdp', '[data-id="rrp"]', 900)
        await act('vSel', '[data-k="strap"][data-i="1"]', 700)
        srcs = await pg.evaluate("()=>document.querySelector('#view .scr:not(.off) .gal .slide img').getAttribute('src')")
        check(srcs.endswith('-4.webp'), f'strap variant swaps the photo ({srcs})')
        await imgs('pdp reverse panda mesh')
        await act('buyNow', wait=900)
        await act('ckShip', '[data-v="store"]', 400)
        await act('ckNext', wait=400)
        await act('ckPay', '[data-v="card"]', 350)
        await act('ckNext', wait=400)
        await act('ckNext', wait=1800)
        st = await pg.evaluate(STATE)
        check(len(st['orders']) == 2 and st['orders'][0]['ship'] == 'store', 'order 2 placed (store pick-up, saved card)')
        for _ in range(3): await act('advance', wait=450)
        await act('register', wait=3200)
        await act('rgView', wait=1200)
        st = await pg.evaluate(STATE)
        check(len(st['owned']) == 4, f'both purchases registered ({len(st["owned"])} watches owned)')
        check('Détails' in (await top() or '') or 'details' in (await top() or '').lower(), 'lands on the watch details')
        await imgs('watch details')
        await shot('08-details')
        check(await pg.evaluate("()=>!document.querySelector('input[autocomplete=\"cc-number\"],input[name*=card i],input[name*=cvv i]')"), 'no card-number / CVV fields anywhere')

        # ---- edge swipe back (interactive), cancel + complete
        await tab('catalog'); await tab('catalog')
        await act('pdp', '[data-id="sh"]', 900)
        box = await pg.locator('#app').bounding_box()
        x0, y0 = box['x'] + 6, box['y'] + box['height'] * .6
        async def drag(dx):
            if MODE == 'iphone':
                cdp = await ctx.new_cdp_session(pg)
                await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
                for i in range(1, 11):
                    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + dx * i / 10, 'y': y0}]})
                    await pg.wait_for_timeout(16)
                await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
            else:
                await pg.mouse.move(x0, y0); await pg.mouse.down()
                for i in range(1, 11):
                    await pg.mouse.move(x0 + dx * i / 10, y0); await pg.wait_for_timeout(16)
                await pg.mouse.up()
            await pg.wait_for_timeout(600)
        await drag(40)
        check('Superman Heritage' in (await top() or ''), 'short edge swipe cancels (stays on PDP)')
        await drag(box['width'] * .6)
        check((await top()) == 'Catalogue', 'edge swipe back returns to Catalogue')

        # ---- per-tab state kept (scroll)
        await pg.evaluate("()=>{const s=document.querySelector('#view .scr:not(.off) .sc');s.scrollTop=600}")
        await tab('home'); await tab('catalog')
        sc = await pg.evaluate("()=>document.querySelector('#view .scr:not(.off) .sc').scrollTop")
        check(sc > 500, f'catalogue scroll kept across tabs ({sc})')
        await tab('catalog')
        await pg.wait_for_timeout(700)
        sc = await pg.evaluate("()=>document.querySelector('#view .scr:not(.off) .sc').scrollTop")
        check(sc < 5, 'tapping the active tab at root scrolls to top')

        # ---- other tabs render with photos
        for t in ('collection', 'club', 'profile'):
            await tab(t); await imgs(t); await shot('09-' + t)
        await tab('home')
        await act('story', '[data-i="0"]', 900); await imgs('story'); await shot('10-story')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(400)

        # ---- AR demo via camera denied (headless has no camera)
        await act('essai', wait=900)
        await act('askCam', wait=2500)
        if await pg.locator('#app [data-act="demoAR"]:visible').count():
            await act('demoAR', wait=1800)
        check('réalité' in (await top() or '').lower() or 'ar' in (await top() or '').lower(), 'AR screen (demo mode)')
        await imgs('ar'); await shot('11-ar')
        await act('arVar', wait=700); await shot('12-ar-strap')
        await act('closeSheet', wait=400)
        await act('back', wait=600)

        print('page errors:', errs)
        check(not errs, 'zero page/console errors')
        await b.close()
    print('\nRESULT', MODE, LANG, 'FAILED:' if FAIL else 'ALL PASSED', FAIL)
    sys.exit(1 if FAIL else 0)
asyncio.run(main())
